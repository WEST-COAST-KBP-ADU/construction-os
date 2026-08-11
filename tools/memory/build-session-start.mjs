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
  LANE_CLASSIFICATION: 'COLD013_LANE_CLASSIFICATION',
  LANE_SLOT_MISMATCH: 'COLD014_LANE_SLOT_MISMATCH',
  WORKER_IDENTITY: 'COLD015_WORKER_IDENTITY',
  GRAPH_CONTRADICTION: 'COLD016_GRAPH_CONTRADICTION',
  DUPLICATE_REVIEW: 'COLD017_DUPLICATE_REVIEW',
});

export const ACTION = Object.freeze({
  RECONCILE_UNSEATED_ENGAGEMENT: 'RECONCILE_UNSEATED_ENGAGEMENT',
  ASSEMBLE_OWNER_GATE: 'ASSEMBLE_OWNER_GATE',
  REQUEST_INDEPENDENT_REVIEW: 'REQUEST_INDEPENDENT_REVIEW',
  PUBLISH_DISPATCH_FOR_MANUAL_OWNER_LAUNCH: 'PUBLISH_DISPATCH_FOR_MANUAL_OWNER_LAUNCH',
  AWAIT_ACTIVE_SLOT_RESULT: 'AWAIT_ACTIVE_SLOT_RESULT',
  RECONCILE_STALE_STATE_INDEX: 'RECONCILE_STALE_STATE_INDEX',
  NAMED_GAP_BLOCKS_ACTION: 'NAMED_GAP_BLOCKS_ACTION',
});

// The board carries three permanent lanes: two Product 2 lanes and one
// workflow/graph lane. Lane is permanent; mutation versus independent
// read-only review is an activity mode inside a lane, never a slot identity.
export const PRODUCT_SLOTS = Object.freeze(['P1', 'P2']);
export const WORKFLOW_SLOTS = Object.freeze(['W1']);
export const SLOTS = Object.freeze([...PRODUCT_SLOTS, ...WORKFLOW_SLOTS]);
export const SLOT_LANE = Object.freeze({ P1: 'product', P2: 'product', W1: 'workflow' });
export const LANES = Object.freeze(['product', 'workflow']);
export const REQUIRED_LANE_ALLOCATION = Object.freeze({ product: 2, workflow: 1 });
export const ACTIVITY_MODES = Object.freeze(['mutation', 'read-only-review']);

export const REFILL_LOOP = Object.freeze([
  'hydrate', 'reconcile', 'classify lane', 'allocate P1/P2 product and W1 workflow',
  'collect RESULT', 'allocate same-lane read-only review', 'exact-head verdict',
  'Owner gate', 'Owner merge', 'verify', 'cleanup', 'refill the same lane',
]);

const LIFECYCLE = new Set(['ready', 'dispatched', 'active', 'result', 'review', 'owner-gate', 'blocked', 'done', 'superseded']);
const LOAD_BEARING_LIFECYCLE = new Set(['active', 'result', 'review', 'owner-gate']);
// A WorkItem in one of these states can be allocated to a lane, so it must carry
// a deterministic lane classification and an Issue-bound worker identity.
const BOARD_ELIGIBLE_LIFECYCLE = new Set(['ready', 'dispatched', 'active', 'result', 'review', 'owner-gate']);
const VERDICTS = new Set(['retained', 'blocked-for-revision', 'invalid']);
const REVIEW_STATES = new Set(['dispatched', 'active', 'complete']);
// A review engagement that has published STARTED and not yet been released is
// the lane's current activity. A dispatched one has not been launched yet.
const SEATABLE_REVIEW_STATES = new Set(['active', 'complete']);

const INPUT_FIELDS = new Set(['schemaVersion', 'watermark', 'previousWatermark', 'repository', 'sources', 'productBoundary', 'program', 'stateIndex', 'workItems', 'reviews', 'ownerGate', 'integration', 'board', 'graph']);
const REPOSITORY_FIELDS = new Set(['owner', 'name', 'mainSha']);
const SOURCE_FIELDS = new Set(['id', 'url', 'sha', 'observedAt', 'complete', 'namedGaps']);
const BOUNDARY_FIELDS = new Set(['product2Repository', 'product1Boundary', 'deferredPublicClaims', 'sourceRefs']);
const PRODUCT1_FIELDS = new Set(['name', 'relationship', 'crossRepositoryBinding']);
const PROGRAM_FIELDS = new Set(['stage', 'gate', 'sourceRefs']);
const STATE_INDEX_FIELDS = new Set(['path', 'syncedFromSha', 'syncedAtSequence', 'activeIssueNumbers']);
const WORK_ITEM_FIELDS = new Set(['id', 'issueNumber', 'issueUrl', 'title', 'lifecycleState', 'labelState', 'lane', 'laneSourceRefs', 'mode', 'worker', 'session', 'branch', 'prNumber', 'prUrl', 'headSha', 'domainLease', 'allowlist', 'startedEvidenceUrl', 'blockers', 'sourceRefs']);
const BLOCKER_FIELDS = new Set(['reasonCode', 'requiredClearingEvidence', 'clearedByEvidenceUrl']);
const REVIEW_FIELDS = new Set(['id', 'issueNumber', 'issueUrl', 'workItemId', 'reviewedHeadSha', 'currentHeadSha', 'state', 'verdict', 'worker', 'reviewerSession', 'authorSession', 'startedEvidenceUrl', 'sourceRefs']);
const OWNER_GATE_FIELDS = new Set(['open', 'workItemId', 'reviewRef', 'sourceRefs']);
const INTEGRATION_FIELDS = new Set(['lastMergedPrNumber', 'lastMergeSha', 'productionVerified', 'productionEvidenceUrl', 'productionVerificationGap', 'sourceRefs']);
const SLOT_FIELDS = new Set(['occupancy', 'activityMode', 'workItemId', 'reviewId', 'worker', 'sessionLabel', 'startedEvidenceUrl', 'freeReason', 'dispatchedWorker']);
const WATERMARK_FIELDS = new Set(['observedAt', 'sequence']);

const SHA = /^[0-9a-f]{40}$/;
const DOMAIN = /^domain:[a-z0-9-]+$/;
const GITHUB_URL = /^https:\/\/github\.com\//;
// Worker-N = Issue #N is the engagement identity. A slot label, branch, pull
// request, session, or retry number is never a worker identifier.
const WORKER = /^Worker-([1-9][0-9]*)$/;

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

function assertWorkerIdentity(worker, issueNumber, path) {
  const match = WORKER.exec(typeof worker === 'string' ? worker : '');
  if (!match) fail(REASON.WORKER_IDENTITY, `${path}.worker must be Worker-N, not ${JSON.stringify(worker ?? null)}`);
  if (Number(match[1]) !== issueNumber) fail(REASON.WORKER_IDENTITY, `${path}.worker ${worker} does not equal Worker-${issueNumber}`);
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

function validateLane(item, sourceIds, path) {
  const eligible = BOARD_ELIGIBLE_LIFECYCLE.has(item.lifecycleState);
  if (item.lane === undefined) {
    // A WorkItem that can be allocated to a lane must say which lane, or fail closed.
    if (eligible) fail(REASON.LANE_CLASSIFICATION, `${path} is board-eligible and carries no lane classification`);
    if (item.laneSourceRefs !== undefined) fail(REASON.LANE_CLASSIFICATION, `${path}.laneSourceRefs without a lane`);
    return;
  }
  if (!LANES.includes(item.lane)) fail(REASON.LANE_CLASSIFICATION, `${path}.lane must be one of ${LANES.join(',')}`);
  // The classification is only as good as the evidence behind it.
  if (!Array.isArray(item.laneSourceRefs) || item.laneSourceRefs.length === 0) fail(REASON.LANE_CLASSIFICATION, `${path} lane classification carries no source evidence`);
  for (const ref of item.laneSourceRefs) if (!sourceIds.has(ref)) fail(REASON.LANE_CLASSIFICATION, `${path}.laneSourceRefs:${ref}`);
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
    validateLane(item, sourceIds, path);
    // Worker-N = Issue #N, always, wherever a worker identity appears.
    if (item.worker !== undefined || BOARD_ELIGIBLE_LIFECYCLE.has(item.lifecycleState)) {
      assertWorkerIdentity(item.worker, item.issueNumber, path);
    }
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
    // Two records classifying one Issue into different lanes is a contradiction, not a choice.
    if (prior && prior.lane !== item.lane) fail(REASON.LANE_CLASSIFICATION, `issue ${item.issueNumber} is classified ${prior.lane} and ${item.lane}`);
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
    for (const key of ['id', 'issueUrl', 'workItemId', 'reviewedHeadSha', 'currentHeadSha', 'state', 'reviewerSession', 'authorSession']) requiredString(review[key], `${path}.${key}`);
    if (byId.has(review.id)) fail(REASON.INVALID_VALUE, `duplicate review ${review.id}`);
    if (!Number.isInteger(review.issueNumber) || review.issueNumber < 1) fail(REASON.INVALID_VALUE, `${path}.issueNumber`);
    if (!GITHUB_URL.test(review.issueUrl)) fail(REASON.INVALID_VALUE, `${path}.issueUrl`);
    if (!SHA.test(review.reviewedHeadSha) || !SHA.test(review.currentHeadSha)) fail(REASON.INVALID_VALUE, `${path}.headSha`);
    if (!REVIEW_STATES.has(review.state)) fail(REASON.INVALID_VALUE, `${path}.state`);
    // A review that has not concluded carries no verdict, and a concluded one must.
    if (review.state === 'complete') {
      if (!VERDICTS.has(review.verdict)) fail(REASON.INVALID_VALUE, `${path}.verdict`);
    } else if (review.verdict !== undefined) {
      fail(REASON.INVALID_VALUE, `${path}.verdict is set while the review is ${review.state}`);
    }
    if (review.startedEvidenceUrl !== undefined && !GITHUB_URL.test(review.startedEvidenceUrl)) fail(REASON.INVALID_VALUE, `${path}.startedEvidenceUrl`);
    // A reviewer is an executable engagement, so Worker-N = Issue #N binds it too.
    assertWorkerIdentity(review.worker, review.issueNumber, path);
    if (!workItems.has(review.workItemId)) fail(REASON.INVALID_VALUE, `${path}.workItemId`);
    requireSourceRefs(review, sourceIds, path);
    byId.set(review.id, review);
  }
  return byId;
}

function assertNonAuthorExactHead(review, path) {
  // A review may only hold an exact head it did not author, and only while that head is current.
  if (review.reviewerSession === review.authorSession) fail(REASON.REVIEWER_AUTHORED_HEAD, `${path}:${review.id}`);
  if (review.reviewedHeadSha !== review.currentHeadSha) fail(REASON.STALE_EXACT_HEAD_REVIEW, `${path}:${review.id}`);
}

function validateSeatedMutation(entry, slot, lane, workItems) {
  if (entry.reviewId !== undefined) fail(REASON.INVALID_VALUE, `board.${slot} mutation activity carries a reviewId`);
  requiredString(entry.workItemId, `board.${slot}.workItemId`);
  const item = workItems.get(entry.workItemId);
  if (!item) fail(REASON.INVALID_VALUE, `board.${slot}.workItemId`);
  if (typeof item.startedEvidenceUrl !== 'string' || item.startedEvidenceUrl !== entry.startedEvidenceUrl) fail(REASON.SLOT_WITHOUT_STARTED, `board.${slot} STARTED evidence does not match ${item.id}`);
  assertWorkerIdentity(entry.worker, item.issueNumber, `board.${slot}`);
  if (entry.worker !== item.worker) fail(REASON.WORKER_IDENTITY, `board.${slot}.worker ${entry.worker} does not match ${item.id} worker ${item.worker}`);
  // Lane is permanent: workflow work never occupies a product lane, and the reverse.
  if (item.lane !== lane) fail(REASON.LANE_SLOT_MISMATCH, `board.${slot} is the ${lane} lane and ${item.id} is classified ${item.lane}`);
  return { item, review: null };
}

function validateSeatedReview(entry, slot, lane, workItems, reviews) {
  if (entry.workItemId !== undefined) fail(REASON.INVALID_VALUE, `board.${slot} review activity carries a workItemId; it binds a reviewId`);
  requiredString(entry.reviewId, `board.${slot}.reviewId`);
  const review = reviews.get(entry.reviewId);
  if (!review) fail(REASON.INVALID_VALUE, `board.${slot}.reviewId`);
  // DISPATCH is not STARTED: a dispatched reviewer leaves its lane free until Tony launches it.
  if (!SEATABLE_REVIEW_STATES.has(review.state)) fail(REASON.SLOT_WITHOUT_STARTED, `board.${slot} holds ${review.id} in state ${review.state}`);
  if (typeof review.startedEvidenceUrl !== 'string' || review.startedEvidenceUrl !== entry.startedEvidenceUrl) fail(REASON.SLOT_WITHOUT_STARTED, `board.${slot} STARTED evidence does not match ${review.id}`);
  assertWorkerIdentity(entry.worker, review.issueNumber, `board.${slot}`);
  if (entry.worker !== review.worker) fail(REASON.WORKER_IDENTITY, `board.${slot}.worker ${entry.worker} does not match ${review.id} worker ${review.worker}`);
  if (entry.sessionLabel !== review.reviewerSession) fail(REASON.REVIEWER_AUTHORED_HEAD, `board.${slot} session identity does not match ${review.id}`);
  assertNonAuthorExactHead(review, `board.${slot}`);
  const item = workItems.get(review.workItemId);
  // A seated review is bound to the reviewed WorkItem at its exact current head.
  if (review.reviewedHeadSha !== item.headSha) fail(REASON.STALE_EXACT_HEAD_REVIEW, `board.${slot}:${review.id} is not bound to the current head of ${item.id}`);
  if (item.lane !== lane) fail(REASON.LANE_SLOT_MISMATCH, `board.${slot} is the ${lane} lane and reviewed ${item.id} is classified ${item.lane}`);
  return { item, review };
}

function validateBoard(input, workItems, reviews) {
  const board = input.board;
  if (!board || typeof board !== 'object' || Array.isArray(board)) fail(REASON.SLOT_CARDINALITY, 'board must be an object');
  const keys = Object.keys(board).sort();
  if (keys.length !== SLOTS.length || !SLOTS.every((slot) => keys.includes(slot))) {
    fail(REASON.SLOT_CARDINALITY, `board keys must be exactly ${SLOTS.join(',')} — two product lanes and one workflow lane`);
  }
  const allocation = { product: 0, workflow: 0 };
  for (const slot of SLOTS) allocation[SLOT_LANE[slot]] += 1;
  if (allocation.product !== REQUIRED_LANE_ALLOCATION.product || allocation.workflow !== REQUIRED_LANE_ALLOCATION.workflow) {
    fail(REASON.SLOT_CARDINALITY, `board allocation must be ${REQUIRED_LANE_ALLOCATION.product} product and ${REQUIRED_LANE_ALLOCATION.workflow} workflow lanes`);
  }

  const occupied = [];
  for (const slot of SLOTS) {
    const entry = board[slot];
    const lane = SLOT_LANE[slot];
    assertFields(entry, SLOT_FIELDS, `board.${slot}`);
    if (!['occupied', 'free'].includes(entry.occupancy)) fail(REASON.INVALID_VALUE, `board.${slot}.occupancy`);

    if (entry.occupancy === 'free') {
      // A free slot is explicit. It is never silently filled and never implied.
      requiredString(entry.freeReason, `board.${slot}.freeReason`);
      if (entry.workItemId || entry.reviewId || entry.startedEvidenceUrl || entry.sessionLabel || entry.worker || entry.activityMode) {
        fail(REASON.INVALID_VALUE, `board.${slot} free slot carries an occupancy field`);
      }
      // A lane may legitimately stand free while a dispatched worker awaits manual launch.
      if (entry.dispatchedWorker !== undefined && !WORKER.test(entry.dispatchedWorker)) {
        fail(REASON.WORKER_IDENTITY, `board.${slot}.dispatchedWorker must be Worker-N, not ${JSON.stringify(entry.dispatchedWorker)}`);
      }
      continue;
    }

    if (entry.dispatchedWorker !== undefined) fail(REASON.INVALID_VALUE, `board.${slot} occupied slot carries dispatchedWorker`);
    if (!ACTIVITY_MODES.includes(entry.activityMode)) fail(REASON.INVALID_VALUE, `board.${slot}.activityMode`);
    // Every occupied slot binds a session identity and persisted STARTED evidence.
    if (typeof entry.sessionLabel !== 'string' || entry.sessionLabel.length === 0) fail(REASON.SLOT_WITHOUT_STARTED, `board.${slot} session identity`);
    if (typeof entry.startedEvidenceUrl !== 'string' || !GITHUB_URL.test(entry.startedEvidenceUrl)) fail(REASON.SLOT_WITHOUT_STARTED, `board.${slot}`);

    const seat = entry.activityMode === 'mutation'
      ? validateSeatedMutation(entry, slot, lane, workItems)
      : validateSeatedReview(entry, slot, lane, workItems, reviews);
    occupied.push({ slot, lane, entry, ...seat });
  }

  for (let i = 0; i < occupied.length; i += 1) {
    for (let j = i + 1; j < occupied.length; j += 1) {
      const a = occupied[i];
      const b = occupied[j];
      if (a.item.id === b.item.id) {
        if (a.review && b.review) fail(REASON.DUPLICATE_REVIEW, `${a.slot} and ${b.slot} both review ${a.item.id}`);
        fail(REASON.CONFLICTING_ACTIVE_HEADS, `${a.slot} and ${b.slot} claim ${a.item.id}`);
      }
      // Only mutation activity takes a write lease, so only mutation seats can overlap.
      if (a.review || b.review) continue;
      if (a.item.domainLease === b.item.domainLease) fail(REASON.DOMAIN_LEASE_CONFLICT, `${a.slot}/${b.slot} share ${a.item.domainLease}`);
      const overlap = a.item.allowlist.filter((path) => b.item.allowlist.includes(path)).sort();
      if (overlap.length > 0) fail(REASON.DOMAIN_LEASE_CONFLICT, `${a.slot}/${b.slot} share path ${overlap[0]}`);
    }
  }
  return { occupied };
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
    // A gate opens on a concluded verdict only, never on a running review.
    if (review.state !== 'complete') fail(REASON.INVALID_VALUE, `ownerGate.reviewRef ${review.id} is ${review.state}`);
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

function assertGraphWorkerIdentity(input, workItems) {
  // The graph projection carries the same identity rule as the board.
  for (const node of input.graph.nodes) {
    if (node.type !== 'Worker') continue;
    const match = WORKER.exec(node.label);
    if (!match) fail(REASON.WORKER_IDENTITY, `graph ${node.id} label must be Worker-N, not ${JSON.stringify(node.label)}`);
    const item = node.workItemId ? workItems.get(node.workItemId) : undefined;
    if (item && Number(match[1]) !== item.issueNumber) {
      fail(REASON.WORKER_IDENTITY, `graph ${node.id} label ${node.label} does not equal Worker-${item.issueNumber}`);
    }
  }
}

function loadBearingSourceIds(input, context) {
  const refs = new Set([...input.productBoundary.sourceRefs, ...input.program.sourceRefs, ...input.integration.sourceRefs]);
  if (input.ownerGate.open) for (const ref of input.ownerGate.sourceRefs) refs.add(ref);
  for (const item of input.workItems) {
    if (LOAD_BEARING_LIFECYCLE.has(item.lifecycleState)) for (const ref of item.sourceRefs) refs.add(ref);
  }
  for (const { item, review } of context.board.occupied) {
    for (const ref of item.sourceRefs) refs.add(ref);
    // A seated lane rests on its classification evidence as much as on its STARTED comment.
    for (const ref of item.laneSourceRefs ?? []) refs.add(ref);
    if (review) for (const ref of review.sourceRefs) refs.add(ref);
  }
  if (input.ownerGate.open) {
    const review = context.reviews.get(input.ownerGate.reviewRef);
    if (review) for (const ref of review.sourceRefs) refs.add(ref);
  }
  return refs;
}

function unresolvedBlockers(item) {
  return item.blockers.filter((blocker) => !blocker.clearedByEvidenceUrl);
}

function unseatedEngagements(input, context) {
  const seatedItems = new Set(context.board.occupied.filter(({ review }) => !review).map(({ item }) => item.id));
  const seatedReviews = new Set(context.board.occupied.filter(({ review }) => review).map(({ review }) => review.id));
  const unseated = [];
  // Live work is never silently dropped because no slot was assigned to it.
  for (const item of input.workItems) {
    if (item.lifecycleState === 'active' && !seatedItems.has(item.id)) unseated.push(`unseated-active-mutation:${item.id}:${item.worker}`);
  }
  for (const review of input.reviews) {
    if (review.state === 'active' && !seatedReviews.has(review.id)) unseated.push(`unseated-active-review:${review.id}:${review.worker}`);
  }
  return [...new Set(unseated)].sort();
}

function reconcile(input, context, graphFacts, unseated) {
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
    // The graph is the engineering-fact hierarchy; where the observation and the
    // graph disagree about runnability the divergence is reported, never averaged.
    if (item.lifecycleState === 'ready' && unresolvedBlockers(item).length === 0 && !graphFacts.runnableWork.includes(item.id)) {
      discrepancies.push(`graph-runnable-exclusion:${item.id}`);
    }
  }
  for (const reviewId of graphFacts.invalidReviews) discrepancies.push(`graph-invalid-review:${reviewId}`);
  for (const review of input.reviews) {
    if (review.reviewedHeadSha !== review.currentHeadSha) discrepancies.push(`review-head-drift:${review.id}:${review.reviewedHeadSha}!=${review.currentHeadSha}`);
    const item = context.workItems.get(review.workItemId);
    if (item.headSha !== undefined && review.reviewedHeadSha !== item.headSha) {
      discrepancies.push(`review-not-at-work-item-head:${review.id}:${review.reviewedHeadSha}!=${item.headSha}`);
    }
  }
  for (const entry of unseated) discrepancies.push(entry);
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

function reviewAtCurrentHead(item, reviews) {
  // A review already bound to this exact head — dispatched, running, or concluded —
  // means a second review must never be requested for the same head.
  return reviews.find((review) => review.workItemId === item.id && review.reviewedHeadSha === item.headSha);
}

function freeSlotInLane(input, lane) {
  return SLOTS.find((slot) => SLOT_LANE[slot] === lane && input.board[slot].occupancy === 'free');
}

function assertGraphAgreement(input, graphFacts) {
  const runnable = new Set(graphFacts.runnableWork);
  for (const item of input.workItems) {
    if (!BOARD_ELIGIBLE_LIFECYCLE.has(item.lifecycleState)) continue;
    // One engineering-fact hierarchy: the graph cannot call work runnable while
    // the observation carries an unresolved blocker for the same work.
    if (runnable.has(item.id) && unresolvedBlockers(item).length > 0) {
      fail(REASON.GRAPH_CONTRADICTION, `${item.id} is runnable in the graph and blocked in the observation`);
    }
  }
  return runnable;
}

function deriveNextAction(input, context, reconciliation, namedGaps, graphRunnable, unseated) {
  const { occupied } = context.board;
  const mutationSeats = occupied.filter(({ review }) => !review);
  const occupiedLeases = new Set(mutationSeats.map(({ item }) => item.domainLease));
  const occupiedPaths = new Set(mutationSeats.flatMap(({ item }) => item.allowlist));

  if (unseated.length > 0) {
    return {
      code: ACTION.RECONCILE_UNSEATED_ENGAGEMENT,
      rationale: `Live engagements are running outside the board and no allocation step is executable until they are seated or released: ${unseated.join('; ')}.`,
      launchesWorker: false,
      impliesApproval: false,
    };
  }

  if (input.ownerGate.open) {
    const item = context.workItems.get(input.ownerGate.workItemId);
    return {
      code: ACTION.ASSEMBLE_OWNER_GATE,
      workItemId: item.id,
      issueUrl: item.issueUrl,
      lane: item.lane,
      rationale: `A non-author verdict is bound to the current exact head of ${item.id}; assemble the evidence packet and leave the decision to the Owner.`,
      launchesWorker: false,
      impliesApproval: false,
    };
  }

  const awaitingReview = input.workItems
    .filter((item) => item.lifecycleState === 'result' && !reviewAtCurrentHead(item, input.reviews))
    .filter((item) => freeSlotInLane(input, item.lane) !== undefined)
    .sort(byIssueNumber);
  if (awaitingReview.length > 0) {
    const item = awaitingReview[0];
    const slot = freeSlotInLane(input, item.lane);
    return {
      code: ACTION.REQUEST_INDEPENDENT_REVIEW,
      workItemId: item.id,
      issueUrl: item.issueUrl,
      lane: item.lane,
      slot,
      rationale: `${item.id} published a RESULT with no review bound to its current exact head; request one read-only review in ${slot}, which is a ${item.lane} lane.`,
      launchesWorker: false,
      impliesApproval: false,
    };
  }

  const dispatchable = input.workItems
    .filter((item) => item.lifecycleState === 'ready'
      && unresolvedBlockers(item).length === 0
      // Graph-declared blocked or non-runnable work is never proposed for dispatch.
      && graphRunnable.has(item.id)
      && !occupiedLeases.has(item.domainLease)
      && !item.allowlist.some((path) => occupiedPaths.has(path))
      && freeSlotInLane(input, item.lane) !== undefined)
    .sort(byIssueNumber);
  if (dispatchable.length > 0) {
    const item = dispatchable[0];
    const slot = freeSlotInLane(input, item.lane);
    return {
      code: ACTION.PUBLISH_DISPATCH_FOR_MANUAL_OWNER_LAUNCH,
      workItemId: item.id,
      issueUrl: item.issueUrl,
      lane: item.lane,
      slot,
      rationale: `${slot} is a free ${item.lane} lane and ${item.id} is runnable in the graph under a disjoint ${item.domainLease} lease; publish its dispatch record for the Owner to open manually.`,
      launchesWorker: false,
      impliesApproval: false,
    };
  }

  if (occupied.length > 0) {
    const seat = occupied.slice().sort((a, b) => a.slot.localeCompare(b.slot))[0];
    return {
      code: ACTION.AWAIT_ACTIVE_SLOT_RESULT,
      workItemId: seat.item.id,
      issueUrl: seat.item.issueUrl,
      lane: seat.lane,
      rationale: `No lane can be refilled until an occupied one reports; ${seat.slot} holds ${seat.item.id} as the lowest-lettered occupied lane.`,
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
  for (const slot of SLOTS) {
    const lane = SLOT_LANE[slot];
    const entry = input.board[slot];
    if (entry.occupancy === 'free') {
      // The operating target is continuous occupancy, but GitHub state is
      // authoritative: a lane stands free until Tony manually launches its worker.
      board[slot] = { slot, lane, occupancy: 'free', freeReason: entry.freeReason };
      if (entry.dispatchedWorker !== undefined) board[slot].dispatchedWorker = entry.dispatchedWorker;
      continue;
    }
    const seat = context.board.occupied.find((candidate) => candidate.slot === slot);
    const projected = {
      slot,
      lane,
      occupancy: 'occupied',
      activityMode: entry.activityMode,
      workItemId: seat.item.id,
      issueUrl: seat.review ? seat.review.issueUrl : seat.item.issueUrl,
      worker: entry.worker,
      sessionLabel: entry.sessionLabel,
      startedEvidenceUrl: entry.startedEvidenceUrl,
      domainLease: seat.item.domainLease,
    };
    if (seat.review) {
      projected.reviewId = seat.review.id;
      projected.reviewedHeadSha = seat.review.reviewedHeadSha;
      projected.reviewState = seat.review.state;
    } else {
      projected.allowlist = [...seat.item.allowlist].sort();
    }
    board[slot] = projected;
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
  assertGraphWorkerIdentity(input, context.workItems);

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

  const graphRunnable = assertGraphAgreement(input, graphFacts);
  const loadBearing = loadBearingSourceIds(input, context);
  const namedGaps = collectNamedGaps(input, graphFacts, loadBearing);
  const unseated = unseatedEngagements(input, context);
  const reconciliation = reconcile(input, context, graphFacts, unseated);
  const nextAction = deriveNextAction(input, context, reconciliation, namedGaps, graphRunnable, unseated);
  if (!Object.values(ACTION).includes(nextAction.code)) fail(REASON.INVALID_VALUE, 'nextAction.code');
  if (nextAction.code === ACTION.PUBLISH_DISPATCH_FOR_MANUAL_OWNER_LAUNCH && !graphRunnable.has(nextAction.workItemId)) {
    fail(REASON.GRAPH_CONTRADICTION, `proposed dispatch ${nextAction.workItemId} is absent from graph runnableWork`);
  }

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
    laneAllocation: { ...REQUIRED_LANE_ALLOCATION },
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
