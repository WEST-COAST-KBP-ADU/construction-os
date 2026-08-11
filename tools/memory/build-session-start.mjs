#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { buildGraph, stableStringify } from './build-graph.mjs';

export const REASON = Object.freeze({
  UNKNOWN_FIELD: 'COLD001_UNKNOWN_FIELD',
  INVALID_VALUE: 'COLD002_INVALID_VALUE',
  MISSING_SOURCE: 'COLD003_MISSING_SOURCE',
  INCOMPLETE_SOURCE: 'COLD004_INCOMPLETE_SOURCE',
  SLOT_CARDINALITY: 'COLD005_SLOT_CARDINALITY',
  SLOT_WITHOUT_STARTED: 'COLD006_SLOT_WITHOUT_STARTED',
  DOMAIN_LEASE_CONFLICT: 'COLD007_DOMAIN_LEASE_CONFLICT',
  REVIEWER_AUTHORED_HEAD: 'COLD008_REVIEWER_AUTHORED_HEAD',
  STALE_EXACT_HEAD_REVIEW: 'COLD009_STALE_EXACT_HEAD_REVIEW',
  CONFLICTING_ACTIVE_HEADS: 'COLD010_CONFLICTING_ACTIVE_HEADS',
  WATERMARK_REGRESSION: 'COLD011_WATERMARK_REGRESSION',
  AUTHORITY_BEARING_OUTPUT: 'COLD012_AUTHORITY_BEARING_OUTPUT',
});

export const ACTION = Object.freeze({
  ASSEMBLE_OWNER_GATE: 'ASSEMBLE_OWNER_GATE',
  REQUEST_INDEPENDENT_REVIEW: 'REQUEST_INDEPENDENT_REVIEW',
  PUBLISH_DISPATCH_FOR_MANUAL_OWNER_LAUNCH: 'PUBLISH_DISPATCH_FOR_MANUAL_OWNER_LAUNCH',
  AWAIT_ACTIVE_SLOT_RESULT: 'AWAIT_ACTIVE_SLOT_RESULT',
  RECONCILE_STALE_STATE_INDEX: 'RECONCILE_STALE_STATE_INDEX',
  NAMED_GAP_BLOCKS_ACTION: 'NAMED_GAP_BLOCKS_ACTION',
});

export const MUTATION_SLOTS = Object.freeze(['M1', 'M2']);
export const REVIEW_SLOT = 'R1';
export const SLOTS = Object.freeze([...MUTATION_SLOTS, REVIEW_SLOT]);

export const REFILL_LOOP = Object.freeze([
  'hydrate', 'reconcile', 'allocate M1/M2', 'collect RESULT', 'allocate R1',
  'exact-head verdict', 'Owner gate', 'Owner merge', 'verify', 'cleanup', 'refill',
]);

const LIFECYCLE = new Set(['ready', 'dispatched', 'active', 'result', 'review', 'owner-gate', 'blocked', 'done', 'superseded']);
const LOAD_BEARING_LIFECYCLE = new Set(['active', 'result', 'review', 'owner-gate']);
const VERDICTS = new Set(['retained', 'blocked-for-revision', 'invalid']);

const INPUT_FIELDS = new Set(['schemaVersion', 'watermark', 'previousWatermark', 'repository', 'sources', 'productBoundary', 'program', 'stateIndex', 'workItems', 'reviews', 'ownerGate', 'integration', 'board', 'graph']);
const REPOSITORY_FIELDS = new Set(['owner', 'name', 'mainSha']);
const SOURCE_FIELDS = new Set(['id', 'url', 'sha', 'observedAt', 'complete', 'namedGaps']);
const BOUNDARY_FIELDS = new Set(['product2Repository', 'product1Boundary', 'deferredPublicClaims', 'sourceRefs']);
const PRODUCT1_FIELDS = new Set(['name', 'relationship', 'crossRepositoryBinding']);
const PROGRAM_FIELDS = new Set(['stage', 'gate', 'sourceRefs']);
const STATE_INDEX_FIELDS = new Set(['path', 'syncedFromSha', 'syncedAtSequence', 'activeIssueNumbers']);
const WORK_ITEM_FIELDS = new Set(['id', 'issueNumber', 'issueUrl', 'title', 'lifecycleState', 'labelState', 'mode', 'worker', 'session', 'branch', 'prNumber', 'prUrl', 'headSha', 'domainLease', 'allowlist', 'startedEvidenceUrl', 'blockers', 'sourceRefs']);
const BLOCKER_FIELDS = new Set(['reasonCode', 'requiredClearingEvidence', 'clearedByEvidenceUrl']);
const REVIEW_FIELDS = new Set(['id', 'workItemId', 'reviewedHeadSha', 'currentHeadSha', 'verdict', 'reviewerSession', 'authorSession', 'sourceRefs']);
const OWNER_GATE_FIELDS = new Set(['open', 'workItemId', 'reviewRef', 'sourceRefs']);
const INTEGRATION_FIELDS = new Set(['lastMergedPrNumber', 'lastMergeSha', 'productionVerified', 'productionEvidenceUrl', 'productionVerificationGap', 'sourceRefs']);
const MUTATION_SLOT_FIELDS = new Set(['occupancy', 'workItemId', 'sessionLabel', 'startedEvidenceUrl', 'freeReason']);
const REVIEW_SLOT_FIELDS = new Set(['occupancy', 'reviewId', 'sessionLabel', 'freeReason']);
const WATERMARK_FIELDS = new Set(['observedAt', 'sequence']);

const SHA = /^[0-9a-f]{40}$/;
const DOMAIN = /^domain:[a-z0-9-]+$/;
const GITHUB_URL = /^https:\/\/github\.com\//;

// A cold start describes state. It never carries a disposition that would let a
// reader mistake the projection for an approval, an acceptance, or a launch.
const FORBIDDEN_OUTPUT_TOKENS = Object.freeze(['"approved"', '"accepted"', '"launchWorker"', '"dispatchWorker"', '"mergeAuthorized"', '"autoLaunch"']);

export class ColdStartError extends Error {
  constructor(code, detail) {
    super(`${code}: ${detail}`);
    this.name = 'ColdStartError';
    this.code = code;
  }
}

const fail = (code, detail) => { throw new ColdStartError(code, detail); };

function assertFields(value, allowed, path) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(REASON.INVALID_VALUE, `${path} must be an object`);
  for (const key of Object.keys(value)) if (!allowed.has(key)) fail(REASON.UNKNOWN_FIELD, `${path}.${key}`);
}

function requiredString(value, path) {
  if (typeof value !== 'string' || value.length === 0) fail(REASON.INVALID_VALUE, path);
}

function requiredArray(value, path) {
  if (!Array.isArray(value)) fail(REASON.INVALID_VALUE, path);
}

function validateWatermark(mark, path) {
  assertFields(mark, WATERMARK_FIELDS, path);
  requiredString(mark.observedAt, `${path}.observedAt`);
  if (!Number.isInteger(mark.sequence) || mark.sequence < 0 || Number.isNaN(Date.parse(mark.observedAt))) fail(REASON.INVALID_VALUE, path);
}

function validateSources(input) {
  requiredArray(input.sources, 'sources');
  const ids = new Set();
  for (const [index, source] of input.sources.entries()) {
    assertFields(source, SOURCE_FIELDS, `sources[${index}]`);
    for (const key of ['id', 'url', 'sha', 'observedAt']) requiredString(source[key], `sources[${index}].${key}`);
    if (ids.has(source.id)) fail(REASON.INVALID_VALUE, `duplicate source ${source.id}`);
    ids.add(source.id);
    if (!GITHUB_URL.test(source.url) || !SHA.test(source.sha) || Number.isNaN(Date.parse(source.observedAt))) fail(REASON.INVALID_VALUE, `sources[${index}]`);
    if (typeof source.complete !== 'boolean') fail(REASON.INVALID_VALUE, `sources[${index}].complete`);
    requiredArray(source.namedGaps, `sources[${index}].namedGaps`);
  }
  return ids;
}

function requireSourceRefs(item, sourceIds, path) {
  requiredArray(item.sourceRefs, `${path}.sourceRefs`);
  if (item.sourceRefs.length === 0) fail(REASON.MISSING_SOURCE, path);
  for (const ref of item.sourceRefs) if (!sourceIds.has(ref)) fail(REASON.MISSING_SOURCE, `${path}:${ref}`);
}

function validateWorkItems(input, sourceIds) {
  requiredArray(input.workItems, 'workItems');
  const byId = new Map();
  const byIssue = new Map();
  for (const [index, item] of input.workItems.entries()) {
    const path = `workItems[${index}]`;
    assertFields(item, WORK_ITEM_FIELDS, path);
    for (const key of ['id', 'issueUrl', 'title', 'lifecycleState', 'domainLease']) requiredString(item[key], `${path}.${key}`);
    if (byId.has(item.id)) fail(REASON.INVALID_VALUE, `duplicate workItem ${item.id}`);
    if (!Number.isInteger(item.issueNumber) || item.issueNumber < 1) fail(REASON.INVALID_VALUE, `${path}.issueNumber`);
    if (!GITHUB_URL.test(item.issueUrl)) fail(REASON.INVALID_VALUE, `${path}.issueUrl`);
    if (!LIFECYCLE.has(item.lifecycleState)) fail(REASON.INVALID_VALUE, `${path}.lifecycleState`);
    if (item.labelState !== undefined && !LIFECYCLE.has(item.labelState)) fail(REASON.INVALID_VALUE, `${path}.labelState`);
    if (!DOMAIN.test(item.domainLease)) fail(REASON.INVALID_VALUE, `${path}.domainLease`);
    if (item.headSha !== undefined && !SHA.test(item.headSha)) fail(REASON.INVALID_VALUE, `${path}.headSha`);
    if (item.mode !== undefined && !['mutation', 'read-only'].includes(item.mode)) fail(REASON.INVALID_VALUE, `${path}.mode`);
    requiredArray(item.allowlist, `${path}.allowlist`);
    requiredArray(item.blockers, `${path}.blockers`);
    for (const [blockerIndex, blocker] of item.blockers.entries()) {
      assertFields(blocker, BLOCKER_FIELDS, `${path}.blockers[${blockerIndex}]`);
      requiredString(blocker.reasonCode, `${path}.blockers[${blockerIndex}].reasonCode`);
      requiredString(blocker.requiredClearingEvidence, `${path}.blockers[${blockerIndex}].requiredClearingEvidence`);
    }
    requireSourceRefs(item, sourceIds, path);

    // Two live records claiming one Issue at different heads is split brain, not a merge candidate.
    const prior = byIssue.get(item.issueNumber);
    if (prior && prior.headSha !== item.headSha) fail(REASON.CONFLICTING_ACTIVE_HEADS, `issue ${item.issueNumber}`);
    byIssue.set(item.issueNumber, item);
    byId.set(item.id, item);
  }
  return byId;
}

function validateReviews(input, sourceIds, workItems) {
  requiredArray(input.reviews, 'reviews');
  const byId = new Map();
  for (const [index, review] of input.reviews.entries()) {
    const path = `reviews[${index}]`;
    assertFields(review, REVIEW_FIELDS, path);
    for (const key of ['id', 'workItemId', 'reviewedHeadSha', 'currentHeadSha', 'verdict', 'reviewerSession', 'authorSession']) requiredString(review[key], `${path}.${key}`);
    if (byId.has(review.id)) fail(REASON.INVALID_VALUE, `duplicate review ${review.id}`);
    if (!SHA.test(review.reviewedHeadSha) || !SHA.test(review.currentHeadSha)) fail(REASON.INVALID_VALUE, `${path}.headSha`);
    if (!VERDICTS.has(review.verdict)) fail(REASON.INVALID_VALUE, `${path}.verdict`);
    if (!workItems.has(review.workItemId)) fail(REASON.INVALID_VALUE, `${path}.workItemId`);
    requireSourceRefs(review, sourceIds, path);
    byId.set(review.id, review);
  }
  return byId;
}

function validateBoard(input, workItems, reviews) {
  const board = input.board;
  if (!board || typeof board !== 'object' || Array.isArray(board)) fail(REASON.SLOT_CARDINALITY, 'board must be an object');
  const keys = Object.keys(board).sort();
  if (keys.length !== SLOTS.length || !SLOTS.every((slot) => keys.includes(slot))) fail(REASON.SLOT_CARDINALITY, `board keys must be exactly ${SLOTS.join(',')}`);

  const occupiedMutation = [];
  for (const slot of MUTATION_SLOTS) {
    const entry = board[slot];
    assertFields(entry, MUTATION_SLOT_FIELDS, `board.${slot}`);
    if (!['occupied', 'free'].includes(entry.occupancy)) fail(REASON.INVALID_VALUE, `board.${slot}.occupancy`);
    if (entry.occupancy === 'free') {
      // A free slot is explicit. It is never silently filled and never implied.
      requiredString(entry.freeReason, `board.${slot}.freeReason`);
      if (entry.workItemId || entry.startedEvidenceUrl || entry.sessionLabel) fail(REASON.INVALID_VALUE, `board.${slot} free slot carries an occupancy field`);
      continue;
    }
    requiredString(entry.workItemId, `board.${slot}.workItemId`);
    const item = workItems.get(entry.workItemId);
    if (!item) fail(REASON.INVALID_VALUE, `board.${slot}.workItemId`);
    // An active mutation slot exists only against persisted STARTED evidence.
    if (typeof entry.startedEvidenceUrl !== 'string' || !GITHUB_URL.test(entry.startedEvidenceUrl)) fail(REASON.SLOT_WITHOUT_STARTED, `board.${slot}`);
    if (typeof entry.sessionLabel !== 'string' || entry.sessionLabel.length === 0) fail(REASON.SLOT_WITHOUT_STARTED, `board.${slot} session identity`);
    if (typeof item.startedEvidenceUrl !== 'string' || item.startedEvidenceUrl !== entry.startedEvidenceUrl) fail(REASON.SLOT_WITHOUT_STARTED, `board.${slot} STARTED evidence does not match ${item.id}`);
    occupiedMutation.push({ slot, entry, item });
  }

  if (occupiedMutation.length > MUTATION_SLOTS.length) fail(REASON.SLOT_CARDINALITY, 'more than two mutation slots');
  for (let i = 0; i < occupiedMutation.length; i += 1) {
    for (let j = i + 1; j < occupiedMutation.length; j += 1) {
      const a = occupiedMutation[i];
      const b = occupiedMutation[j];
      if (a.item.id === b.item.id) fail(REASON.CONFLICTING_ACTIVE_HEADS, `${a.slot} and ${b.slot} claim ${a.item.id}`);
      if (a.item.domainLease === b.item.domainLease) fail(REASON.DOMAIN_LEASE_CONFLICT, `${a.slot}/${b.slot} share ${a.item.domainLease}`);
      const overlap = a.item.allowlist.filter((path) => b.item.allowlist.includes(path)).sort();
      if (overlap.length > 0) fail(REASON.DOMAIN_LEASE_CONFLICT, `${a.slot}/${b.slot} share path ${overlap[0]}`);
    }
  }

  const reviewEntry = board[REVIEW_SLOT];
  assertFields(reviewEntry, REVIEW_SLOT_FIELDS, `board.${REVIEW_SLOT}`);
  if (!['occupied', 'free'].includes(reviewEntry.occupancy)) fail(REASON.INVALID_VALUE, `board.${REVIEW_SLOT}.occupancy`);
  let reviewRecord = null;
  if (reviewEntry.occupancy === 'free') {
    requiredString(reviewEntry.freeReason, `board.${REVIEW_SLOT}.freeReason`);
    if (reviewEntry.reviewId || reviewEntry.sessionLabel) fail(REASON.INVALID_VALUE, `board.${REVIEW_SLOT} free slot carries an occupancy field`);
  } else {
    requiredString(reviewEntry.reviewId, `board.${REVIEW_SLOT}.reviewId`);
    requiredString(reviewEntry.sessionLabel, `board.${REVIEW_SLOT}.sessionLabel`);
    reviewRecord = reviews.get(reviewEntry.reviewId);
    if (!reviewRecord) fail(REASON.INVALID_VALUE, `board.${REVIEW_SLOT}.reviewId`);
    assertNonAuthorExactHead(reviewRecord, `board.${REVIEW_SLOT}`);
    if (reviewEntry.sessionLabel !== reviewRecord.reviewerSession) fail(REASON.REVIEWER_AUTHORED_HEAD, `board.${REVIEW_SLOT} session identity does not match ${reviewRecord.id}`);
  }
  return { occupiedMutation, reviewEntry, reviewRecord };
}

function assertNonAuthorExactHead(review, path) {
  // R1 may only review an exact head it did not author, and only while that head is current.
  if (review.reviewerSession === review.authorSession) fail(REASON.REVIEWER_AUTHORED_HEAD, `${path}:${review.id}`);
  if (review.reviewedHeadSha !== review.currentHeadSha) fail(REASON.STALE_EXACT_HEAD_REVIEW, `${path}:${review.id}`);
}

function validateInput(input) {
  assertFields(input, INPUT_FIELDS, 'input');
  if (input.schemaVersion !== 'session-start/v1') fail(REASON.INVALID_VALUE, 'schemaVersion');
  validateWatermark(input.watermark, 'watermark');
  if (input.previousWatermark) {
    validateWatermark(input.previousWatermark, 'previousWatermark');
    if (input.watermark.sequence < input.previousWatermark.sequence || Date.parse(input.watermark.observedAt) < Date.parse(input.previousWatermark.observedAt)) {
      fail(REASON.WATERMARK_REGRESSION, 'watermark precedes previousWatermark');
    }
  }

  assertFields(input.repository, REPOSITORY_FIELDS, 'repository');
  for (const key of ['owner', 'name', 'mainSha']) requiredString(input.repository[key], `repository.${key}`);
  if (!SHA.test(input.repository.mainSha)) fail(REASON.INVALID_VALUE, 'repository.mainSha');

  const sourceIds = validateSources(input);

  assertFields(input.productBoundary, BOUNDARY_FIELDS, 'productBoundary');
  requiredString(input.productBoundary.product2Repository, 'productBoundary.product2Repository');
  assertFields(input.productBoundary.product1Boundary, PRODUCT1_FIELDS, 'productBoundary.product1Boundary');
  for (const key of ['name', 'relationship']) requiredString(input.productBoundary.product1Boundary[key], `productBoundary.product1Boundary.${key}`);
  if (input.productBoundary.product1Boundary.crossRepositoryBinding !== 'deferred-pending-owner-adopted-decision') fail(REASON.INVALID_VALUE, 'productBoundary.product1Boundary.crossRepositoryBinding');
  requiredArray(input.productBoundary.deferredPublicClaims, 'productBoundary.deferredPublicClaims');
  requireSourceRefs(input.productBoundary, sourceIds, 'productBoundary');

  assertFields(input.program, PROGRAM_FIELDS, 'program');
  for (const key of ['stage', 'gate']) requiredString(input.program[key], `program.${key}`);
  requireSourceRefs(input.program, sourceIds, 'program');

  assertFields(input.stateIndex, STATE_INDEX_FIELDS, 'stateIndex');
  requiredString(input.stateIndex.path, 'stateIndex.path');
  if (!SHA.test(input.stateIndex.syncedFromSha)) fail(REASON.INVALID_VALUE, 'stateIndex.syncedFromSha');
  if (!Number.isInteger(input.stateIndex.syncedAtSequence) || input.stateIndex.syncedAtSequence < 0) fail(REASON.INVALID_VALUE, 'stateIndex.syncedAtSequence');
  requiredArray(input.stateIndex.activeIssueNumbers, 'stateIndex.activeIssueNumbers');

  const workItems = validateWorkItems(input, sourceIds);
  const reviews = validateReviews(input, sourceIds, workItems);

  assertFields(input.ownerGate, OWNER_GATE_FIELDS, 'ownerGate');
  if (typeof input.ownerGate.open !== 'boolean') fail(REASON.INVALID_VALUE, 'ownerGate.open');
  requireSourceRefs(input.ownerGate, sourceIds, 'ownerGate');
  if (input.ownerGate.open) {
    requiredString(input.ownerGate.workItemId, 'ownerGate.workItemId');
    requiredString(input.ownerGate.reviewRef, 'ownerGate.reviewRef');
    if (!workItems.has(input.ownerGate.workItemId)) fail(REASON.INVALID_VALUE, 'ownerGate.workItemId');
    const review = reviews.get(input.ownerGate.reviewRef);
    if (!review) fail(REASON.INVALID_VALUE, 'ownerGate.reviewRef');
    // A gate never opens on a verdict that predates the bytes, or on a self-review.
    assertNonAuthorExactHead(review, 'ownerGate');
  }

  assertFields(input.integration, INTEGRATION_FIELDS, 'integration');
  if (typeof input.integration.productionVerified !== 'boolean') fail(REASON.INVALID_VALUE, 'integration.productionVerified');
  if (input.integration.lastMergeSha !== undefined && !SHA.test(input.integration.lastMergeSha)) fail(REASON.INVALID_VALUE, 'integration.lastMergeSha');
  if (!input.integration.productionVerified && typeof input.integration.productionVerificationGap !== 'string') fail(REASON.INVALID_VALUE, 'integration.productionVerificationGap');
  requireSourceRefs(input.integration, sourceIds, 'integration');

  const board = validateBoard(input, workItems, reviews);
  return { sourceIds, workItems, reviews, board };
}

function loadBearingSourceIds(input, context) {
  const refs = new Set([...input.productBoundary.sourceRefs, ...input.program.sourceRefs, ...input.integration.sourceRefs]);
  if (input.ownerGate.open) for (const ref of input.ownerGate.sourceRefs) refs.add(ref);
  for (const item of input.workItems) {
    if (LOAD_BEARING_LIFECYCLE.has(item.lifecycleState)) for (const ref of item.sourceRefs) refs.add(ref);
  }
  for (const { item } of context.board.occupiedMutation) for (const ref of item.sourceRefs) refs.add(ref);
  if (context.board.reviewRecord) for (const ref of context.board.reviewRecord.sourceRefs) refs.add(ref);
  if (input.ownerGate.open) {
    const review = context.reviews.get(input.ownerGate.reviewRef);
    if (review) for (const ref of review.sourceRefs) refs.add(ref);
  }
  return refs;
}

function reconcile(input, context, graphFacts) {
  const discrepancies = [];
  const stateIndexStale = input.stateIndex.syncedFromSha !== input.repository.mainSha;
  if (stateIndexStale) {
    // Reported, then ignored for live dispatch. The committed index never outranks live evidence.
    discrepancies.push(`state-index-stale:${input.stateIndex.path}:${input.stateIndex.syncedFromSha}!=${input.repository.mainSha}`);
  }
  if (input.stateIndex.syncedAtSequence > input.watermark.sequence) fail(REASON.WATERMARK_REGRESSION, 'stateIndex.syncedAtSequence exceeds watermark');

  const liveActive = input.workItems.filter((item) => item.lifecycleState === 'active').map((item) => item.issueNumber).sort((a, b) => a - b);
  const indexed = [...input.stateIndex.activeIssueNumbers].sort((a, b) => a - b);
  if (liveActive.join(',') !== indexed.join(',')) {
    discrepancies.push(`state-index-queue-divergence:indexed=[${indexed.join(',')}]:live=[${liveActive.join(',')}]`);
  }
  for (const item of input.workItems) {
    if (item.labelState !== undefined && item.labelState !== item.lifecycleState) {
      discrepancies.push(`label-lifecycle-divergence:${item.id}:label=${item.labelState}:evidence=${item.lifecycleState}`);
    }
  }
  for (const reviewId of graphFacts.invalidReviews) discrepancies.push(`graph-invalid-review:${reviewId}`);
  for (const review of input.reviews) {
    if (review.reviewedHeadSha !== review.currentHeadSha) discrepancies.push(`review-head-drift:${review.id}:${review.reviewedHeadSha}!=${review.currentHeadSha}`);
  }
  return { discrepancies: [...new Set(discrepancies)].sort(), stateIndexStale };
}

function collectNamedGaps(input, graphFacts, loadBearing) {
  const gaps = [];
  for (const source of input.sources) {
    for (const gap of source.namedGaps) gaps.push(`${source.id}:${gap}`);
    if (!source.complete) {
      // Incomplete evidence under an occupied slot or an open gate is fail-closed, not a gap.
      if (loadBearing.has(source.id)) fail(REASON.INCOMPLETE_SOURCE, source.id);
      gaps.push(`${source.id}:source-incomplete`);
    }
  }
  for (const gap of graphFacts.namedGaps) gaps.push(`graph:${gap}`);
  if (!input.integration.productionVerified) gaps.push(`integration:${input.integration.productionVerificationGap}`);
  for (const item of input.workItems) {
    for (const blocker of item.blockers) {
      if (!blocker.clearedByEvidenceUrl) gaps.push(`${item.id}:${blocker.reasonCode}:${blocker.requiredClearingEvidence}`);
    }
  }
  return [...new Set(gaps)].sort();
}

function byIssueNumber(a, b) {
  return a.issueNumber - b.issueNumber;
}

function hasCurrentRetainedReview(item, reviews) {
  return reviews.some((review) => review.workItemId === item.id
    && review.verdict === 'retained'
    && review.reviewedHeadSha === review.currentHeadSha
    && review.reviewedHeadSha === item.headSha
    && review.reviewerSession !== review.authorSession);
}

function unresolvedBlockers(item) {
  return item.blockers.filter((blocker) => !blocker.clearedByEvidenceUrl);
}

function deriveNextAction(input, context, reconciliation, namedGaps) {
  const { occupiedMutation, reviewEntry } = context.board;
  const occupiedLeases = new Set(occupiedMutation.map(({ item }) => item.domainLease));
  const occupiedPaths = new Set(occupiedMutation.flatMap(({ item }) => item.allowlist));
  const freeMutationSlot = MUTATION_SLOTS.find((slot) => input.board[slot].occupancy === 'free');

  if (input.ownerGate.open) {
    const item = context.workItems.get(input.ownerGate.workItemId);
    return {
      code: ACTION.ASSEMBLE_OWNER_GATE,
      workItemId: item.id,
      issueUrl: item.issueUrl,
      rationale: `A non-author verdict is bound to the current exact head of ${item.id}; assemble the evidence packet and leave the decision to the Owner.`,
      launchesWorker: false,
      impliesApproval: false,
    };
  }

  const awaitingReview = input.workItems
    .filter((item) => item.lifecycleState === 'result' && !hasCurrentRetainedReview(item, input.reviews))
    .sort(byIssueNumber);
  if (awaitingReview.length > 0 && reviewEntry.occupancy === 'free') {
    const item = awaitingReview[0];
    return {
      code: ACTION.REQUEST_INDEPENDENT_REVIEW,
      workItemId: item.id,
      issueUrl: item.issueUrl,
      slot: REVIEW_SLOT,
      rationale: `${item.id} published a RESULT with no non-author verdict bound to its current exact head; request one read-only review in ${REVIEW_SLOT}.`,
      launchesWorker: false,
      impliesApproval: false,
    };
  }

  const dispatchable = input.workItems
    .filter((item) => item.lifecycleState === 'ready'
      && unresolvedBlockers(item).length === 0
      && !occupiedLeases.has(item.domainLease)
      && !item.allowlist.some((path) => occupiedPaths.has(path)))
    .sort(byIssueNumber);
  if (freeMutationSlot && dispatchable.length > 0) {
    const item = dispatchable[0];
    return {
      code: ACTION.PUBLISH_DISPATCH_FOR_MANUAL_OWNER_LAUNCH,
      workItemId: item.id,
      issueUrl: item.issueUrl,
      slot: freeMutationSlot,
      rationale: `${freeMutationSlot} is free and ${item.id} holds a disjoint ${item.domainLease} lease; publish its dispatch record for the Owner to open manually.`,
      launchesWorker: false,
      impliesApproval: false,
    };
  }

  if (occupiedMutation.length > 0) {
    const item = occupiedMutation.slice().sort((a, b) => a.slot.localeCompare(b.slot))[0].item;
    return {
      code: ACTION.AWAIT_ACTIVE_SLOT_RESULT,
      workItemId: item.id,
      issueUrl: item.issueUrl,
      rationale: `No slot can be refilled until an occupied mutation slot publishes a RESULT; ${item.id} is the lowest-lettered occupied slot.`,
      launchesWorker: false,
      impliesApproval: false,
    };
  }

  if (reconciliation.stateIndexStale) {
    return {
      code: ACTION.RECONCILE_STALE_STATE_INDEX,
      rationale: `${input.stateIndex.path} indexes a superseded commit and no dispatch, review, or gate step is executable; reconcile the index against live evidence.`,
      launchesWorker: false,
      impliesApproval: false,
    };
  }

  return {
    code: ACTION.NAMED_GAP_BLOCKS_ACTION,
    rationale: namedGaps.length > 0
      ? `No control-plane step is executable while these named gaps stand: ${namedGaps.join('; ')}.`
      : 'No control-plane step is executable and no named gap explains it; re-hydrate from GitHub before acting.',
    launchesWorker: false,
    impliesApproval: false,
  };
}

function projectBoard(input, context) {
  const board = {};
  for (const slot of MUTATION_SLOTS) {
    const entry = input.board[slot];
    if (entry.occupancy === 'free') {
      board[slot] = { slot, kind: 'mutation', occupancy: 'free', freeReason: entry.freeReason };
      continue;
    }
    const item = context.workItems.get(entry.workItemId);
    board[slot] = {
      slot,
      kind: 'mutation',
      occupancy: 'occupied',
      workItemId: item.id,
      issueUrl: item.issueUrl,
      sessionLabel: entry.sessionLabel,
      startedEvidenceUrl: entry.startedEvidenceUrl,
      domainLease: item.domainLease,
      allowlist: [...item.allowlist].sort(),
    };
  }
  const entry = input.board[REVIEW_SLOT];
  if (entry.occupancy === 'free') {
    board[REVIEW_SLOT] = { slot: REVIEW_SLOT, kind: 'read-only-review', occupancy: 'free', freeReason: entry.freeReason };
  } else {
    const review = context.reviews.get(entry.reviewId);
    board[REVIEW_SLOT] = {
      slot: REVIEW_SLOT,
      kind: 'read-only-review',
      occupancy: 'occupied',
      reviewId: review.id,
      workItemId: review.workItemId,
      reviewedHeadSha: review.reviewedHeadSha,
      sessionLabel: entry.sessionLabel,
    };
  }
  return board;
}

export function buildSessionStart(input) {
  const context = validateInput(input);

  // The graph is the single engineering-fact hierarchy. The cold start consumes it.
  const graph = JSON.parse(buildGraph(input.graph));
  if (graph.watermark.sequence > input.watermark.sequence || Date.parse(graph.watermark.observedAt) > Date.parse(input.watermark.observedAt)) {
    fail(REASON.WATERMARK_REGRESSION, 'graph watermark is newer than the cold-start watermark');
  }
  if (graph.derived.splitBrain.length > 0) fail(REASON.CONFLICTING_ACTIVE_HEADS, graph.derived.splitBrain[0]);

  const graphFacts = {
    schemaVersion: graph.schemaVersion,
    watermark: graph.watermark,
    canonicalHeads: graph.derived.canonicalHeads,
    invalidReviews: graph.derived.invalidReviews,
    unresolvedBlockers: graph.derived.unresolvedBlockers,
    runnableWork: graph.derived.runnableWork,
    namedGaps: graph.derived.namedGaps,
    splitBrain: graph.derived.splitBrain,
  };

  const loadBearing = loadBearingSourceIds(input, context);
  const namedGaps = collectNamedGaps(input, graphFacts, loadBearing);
  const reconciliation = reconcile(input, context, graphFacts);
  const nextAction = deriveNextAction(input, context, reconciliation, namedGaps);
  if (!Object.values(ACTION).includes(nextAction.code)) fail(REASON.INVALID_VALUE, 'nextAction.code');

  const result = {
    schemaVersion: 'cold-start-result/v1',
    repository: input.repository,
    watermark: input.watermark,
    sources: [...input.sources].sort((a, b) => a.id.localeCompare(b.id)),
    productBoundary: input.productBoundary,
    program: input.program,
    workItems: [...input.workItems].sort((a, b) => a.id.localeCompare(b.id)),
    reviews: [...input.reviews]
      .map((review) => ({ ...review, exactHeadValid: review.reviewedHeadSha === review.currentHeadSha }))
      .sort((a, b) => a.id.localeCompare(b.id)),
    ownerGate: input.ownerGate,
    integration: input.integration,
    board: projectBoard(input, context),
    graph: graphFacts,
    discrepancies: reconciliation.discrepancies,
    namedGaps,
    nextAction,
    refillLoop: [...REFILL_LOOP],
  };

  const serialized = stableStringify(result);
  for (const token of FORBIDDEN_OUTPUT_TOKENS) {
    if (serialized.includes(token)) fail(REASON.AUTHORITY_BEARING_OUTPUT, token);
  }
  return serialized;
}

async function main(argv) {
  const inputIndex = argv.indexOf('--input');
  const outputIndex = argv.indexOf('--output');
  if (inputIndex < 0 || outputIndex < 0 || !argv[inputIndex + 1] || !argv[outputIndex + 1]) fail(REASON.INVALID_VALUE, 'usage: build-session-start.mjs --input fixture.json --output cold-start.json');
  const input = JSON.parse(await readFile(argv[inputIndex + 1], 'utf8'));
  await writeFile(argv[outputIndex + 1], buildSessionStart(input), { encoding: 'utf8', flag: 'w' });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).catch((error) => {
    process.stderr.write(`${error.code ?? 'COLD000_EXECUTION'} ${error.message}\n`);
    process.exitCode = 1;
  });
}
