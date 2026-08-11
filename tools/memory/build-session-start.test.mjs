import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { GraphError, REASON as GRAPH_REASON } from './build-graph.mjs';
import { ACTION, ColdStartError, REASON, SLOTS, SLOT_LANE, buildSessionStart } from './build-session-start.mjs';

const CASES = [];
const test = (name, fn) => CASES.push({ name, fn });

const REPO = 'https://github.com/WEST-COAST-KBP-ADU/construction-os';
const MAIN = '22bccbf413fefac19adc3de693a2b415360459a6';
const HEAD_A = 'eaaed25c808ae35c77639d8686d7caef51f1925a';
const HEAD_B = '5a62bc19fd7bc22578bc965d615be7b526240142';
const HEAD_C = '729d5252b62b5d1d0a136e4674e1bc66fead0f5f';
const STALE_MAIN = 'e32be9ea7cb265f6c6c0a65002a59bfe1419916c';
const SRC_SHA = '1111111111111111111111111111111111111111';
const OBSERVED = '2026-08-11T07:45:00.000Z';
const GRAPH_OBSERVED = '2026-08-11T07:44:00.000Z';

const ROOT = new URL('../../', import.meta.url);
const ENTRY_PATH = 'governance/memory/SESSION-START.md';

const graphSource = (id, path) => ({ id, url: `${REPO}/${path}`, sha: SRC_SHA, observedAt: GRAPH_OBSERVED, complete: true, namedGaps: [] });

function graphFixture() {
  return {
    schemaVersion: 'graph-source-truth/v1',
    watermark: { observedAt: GRAPH_OBSERVED, sequence: 176 },
    sources: [graphSource('gh.issue177', 'issues/177'), graphSource('gh.issue174', 'issues/174')],
    nodes: [
      { id: 'work.177', type: 'WorkItem', label: 'work.177', status: 'active', sourceRefs: ['gh.issue177'], runnable: true },
      { id: 'work.174', type: 'WorkItem', label: 'work.174', status: 'active', sourceRefs: ['gh.issue174'], runnable: true },
      { id: 'worker.177', type: 'Worker', label: 'Worker-177', status: 'active', sourceRefs: ['gh.issue177'], workItemId: 'work.177' },
      { id: 'attempt.177', type: 'Attempt', label: 'attempt.177', status: 'active', sourceRefs: ['gh.issue177'], workItemId: 'work.177', headSha: HEAD_A },
      { id: 'review.177', type: 'Review', label: 'review.177', status: 'retained', sourceRefs: ['gh.issue177'], workItemId: 'work.177', reviewedHeadSha: HEAD_A, currentHeadSha: HEAD_A },
      { id: 'decision.177', type: 'OwnerDecision', label: 'decision.177', status: 'complete', sourceRefs: ['gh.issue177'], workItemId: 'work.177', headSha: HEAD_A, canonicalDisposition: 'retain' },
      { id: 'evidence.blocked', type: 'Evidence', label: 'evidence.blocked', status: 'complete', sourceRefs: ['gh.issue177'] },
    ],
    edges: [
      { id: 'g1', type: 'attempts', from: 'attempt.177', to: 'work.177', sourceRefs: ['gh.issue177'] },
      { id: 'g2', type: 'decides', from: 'decision.177', to: 'attempt.177', sourceRefs: ['gh.issue177'] },
    ],
  };
}

// Removes a WorkItem from the graph's runnableWork the way live evidence does:
// an unresolved Blocker node with a blocks edge.
function blockInGraph(graph, workItemId, suffix = '1') {
  graph.nodes.push({ id: `blk.${suffix}`, type: 'Blocker', label: `blk.${suffix}`, status: 'blocked', sourceRefs: ['gh.issue174'] });
  graph.edges.push({ id: `gblk.${suffix}`, type: 'blocks', from: `blk.${suffix}`, to: workItemId, sourceRefs: ['gh.issue174'] });
}

const source = (id, path, extra = {}) => ({ id, url: `${REPO}/${path}`, sha: SRC_SHA, observedAt: OBSERVED, complete: true, namedGaps: [], ...extra });

function fixture() {
  return {
    schemaVersion: 'session-start/v1',
    watermark: { observedAt: OBSERVED, sequence: 177 },
    repository: { owner: 'WEST-COAST-KBP-ADU', name: 'construction-os', mainSha: MAIN },
    sources: [
      source('gh.main', `commit/${MAIN}`, { sha: MAIN }),
      source('gh.issue177', 'issues/177'),
      source('gh.issue174', 'issues/174'),
      source('gh.issue181', 'issues/181'),
      source('gh.state', `blob/${MAIN}/governance/office/STATE.md`, { sha: MAIN }),
    ],
    productBoundary: {
      product2Repository: 'WEST-COAST-KBP-ADU/construction-os',
      product1Boundary: {
        name: 'Deedseal',
        relationship: 'external controlled-engineering foundation, separate repository and authority',
        crossRepositoryBinding: 'deferred-pending-owner-adopted-decision',
      },
      deferredPublicClaims: ['Powered by Deedseal', 'cross-brand transition', 'public dependency claim'],
      sourceRefs: ['gh.main'],
    },
    program: { stage: 'G0', gate: 'gate:control-plane', sourceRefs: ['gh.main'] },
    stateIndex: {
      path: 'governance/office/STATE.md',
      syncedFromSha: STALE_MAIN,
      syncedAtSequence: 161,
      activeIssueNumbers: [161],
    },
    workItems: [
      {
        id: 'work.177',
        issueNumber: 177,
        issueUrl: `${REPO}/issues/177`,
        title: 'Canonical graph-memory cold start and three-lane board',
        lifecycleState: 'active',
        labelState: 'dispatched',
        lane: 'workflow',
        laneSourceRefs: ['gh.issue177'],
        mode: 'mutation',
        worker: 'Worker-177',
        session: 'session-cold-start-graph-001',
        branch: 'agent/session-cold-start-graph-001',
        headSha: HEAD_A,
        domainLease: 'domain:governance',
        allowlist: ['AGENTS.md', 'CLAUDE.md', ENTRY_PATH],
        startedEvidenceUrl: `${REPO}/issues/177#issuecomment-1`,
        blockers: [],
        sourceRefs: ['gh.issue177'],
      },
      {
        id: 'work.174',
        issueNumber: 174,
        issueUrl: `${REPO}/issues/174`,
        title: 'Define Release 1 and product graph-memory contract',
        lifecycleState: 'ready',
        labelState: 'ready',
        lane: 'product',
        laneSourceRefs: ['gh.issue174'],
        mode: 'mutation',
        worker: 'Worker-174',
        domainLease: 'domain:product-definition',
        allowlist: ['governance/decisions/DR-0018-release-1-product-experience.md'],
        blockers: [],
        sourceRefs: ['gh.issue174'],
      },
    ],
    reviews: [],
    ownerGate: { open: false, sourceRefs: ['gh.main'] },
    integration: {
      lastMergedPrNumber: 172,
      lastMergeSha: MAIN,
      productionVerified: false,
      productionVerificationGap: 'owner-visible domain not re-verified at this main sha',
      sourceRefs: ['gh.main'],
    },
    board: {
      P1: { occupancy: 'free', freeReason: 'no Product 2 packet has been launched into this lane at this watermark' },
      P2: { occupancy: 'free', freeReason: 'no second Product 2 packet holds a disjoint lease at this watermark' },
      W1: {
        occupancy: 'occupied',
        activityMode: 'mutation',
        workItemId: 'work.177',
        worker: 'Worker-177',
        sessionLabel: 'session-cold-start-graph-001',
        startedEvidenceUrl: `${REPO}/issues/177#issuecomment-1`,
      },
    },
    graph: graphFixture(),
  };
}

// A second Product 2 packet, used wherever a test needs a third engagement.
const productWorkItem = (extra = {}) => ({
  id: 'work.181',
  issueNumber: 181,
  issueUrl: `${REPO}/issues/181`,
  title: 'Make both initial Studio comparison cards renderable',
  lifecycleState: 'active',
  lane: 'product',
  laneSourceRefs: ['gh.issue181'],
  mode: 'mutation',
  worker: 'Worker-181',
  headSha: HEAD_C,
  domainLease: 'domain:studio',
  allowlist: ['src/components/studio/StudioWorkbench.tsx'],
  startedEvidenceUrl: `${REPO}/issues/181#issuecomment-4`,
  blockers: [],
  sourceRefs: ['gh.issue181'],
  ...extra,
});

const seatMutation = (item) => ({
  occupancy: 'occupied',
  activityMode: 'mutation',
  workItemId: item.id,
  worker: item.worker,
  sessionLabel: `${item.id}-engagement`,
  startedEvidenceUrl: item.startedEvidenceUrl,
});

const review = (id, extra = {}) => ({
  id,
  issueNumber: 182,
  issueUrl: `${REPO}/issues/182`,
  workItemId: 'work.177',
  reviewedHeadSha: HEAD_A,
  currentHeadSha: HEAD_A,
  state: 'complete',
  verdict: 'retained',
  worker: 'Worker-182',
  reviewerSession: 'reviewer-engagement-1',
  authorSession: 'session-cold-start-graph-001',
  startedEvidenceUrl: `${REPO}/issues/182#issuecomment-3`,
  sourceRefs: ['gh.issue177'],
  ...extra,
});

const seatReview = (record, sessionLabel = 'reviewer-engagement-1') => ({
  occupancy: 'occupied',
  activityMode: 'read-only-review',
  reviewId: record.id,
  worker: record.worker,
  sessionLabel,
  startedEvidenceUrl: record.startedEvidenceUrl,
});

function expectCode(code, mutate) {
  const input = fixture();
  mutate(input);
  assert.throws(() => buildSessionStart(input), (error) => error instanceof ColdStartError && error.code === code);
}

// ---------------------------------------------------------------------------
// Lane model: two permanent Product 2 lanes and one permanent workflow lane
// ---------------------------------------------------------------------------

test('the board carries exactly P1/P2/W1 with a two-product one-workflow allocation', () => {
  const result = JSON.parse(buildSessionStart(fixture()));
  assert.equal(result.schemaVersion, 'cold-start-result/v1');
  assert.deepEqual(Object.keys(result.board).sort(), ['P1', 'P2', 'W1']);
  assert.deepEqual([...SLOTS], ['P1', 'P2', 'W1']);
  assert.equal(result.board.P1.lane, 'product');
  assert.equal(result.board.P2.lane, 'product');
  assert.equal(result.board.W1.lane, 'workflow');
  assert.deepEqual(result.laneAllocation, { product: 2, workflow: 1 });
  const lanes = Object.values(result.board).map((slot) => slot.lane);
  assert.equal(lanes.filter((lane) => lane === 'product').length, 2);
  assert.equal(lanes.filter((lane) => lane === 'workflow').length, 1);
  // No trace of the superseded mutation/review slot identities survives.
  assert.equal(Object.keys(result.board).some((key) => ['M1', 'M2', 'R1'].includes(key)), false);
});

test('lane is permanent and activity mode is what varies inside it', () => {
  const result = JSON.parse(buildSessionStart(fixture()));
  assert.equal(result.board.W1.occupancy, 'occupied');
  assert.equal(result.board.W1.lane, 'workflow');
  assert.equal(result.board.W1.activityMode, 'mutation');
  assert.equal(result.board.P1.occupancy, 'free');
  assert.equal(result.board.P1.lane, 'product');
  assert.equal(result.board.P1.activityMode, undefined);
  assert.equal(result.nextAction.code, ACTION.PUBLISH_DISPATCH_FOR_MANUAL_OWNER_LAUNCH);
  assert.equal(result.nextAction.workItemId, 'work.174');
  assert.equal(result.nextAction.lane, 'product');
  assert.equal(result.nextAction.slot, 'P1');
  assert.equal(result.nextAction.launchesWorker, false);
  assert.equal(result.nextAction.impliesApproval, false);
  assert.equal(result.repository.mainSha, MAIN);
  assert.equal(result.program.stage, 'G0');
  assert.equal(result.graph.canonicalHeads['work.177'], HEAD_A);
  assert.equal(result.refillLoop[0], 'hydrate');
  assert.equal(result.refillLoop.at(-1), 'refill the same lane');
});

test('a review of a product head occupies a product lane, never the workflow lane', () => {
  const input = fixture();
  input.workItems[1].lifecycleState = 'result';
  input.workItems[1].headSha = HEAD_B;
  const record = review('review.174', { workItemId: 'work.174', reviewedHeadSha: HEAD_B, currentHeadSha: HEAD_B, state: 'active', verdict: undefined, authorSession: 'work.174-engagement' });
  delete record.verdict;
  input.reviews.push(record);
  input.board.P1 = seatReview(record);
  const result = JSON.parse(buildSessionStart(input));
  assert.equal(result.board.P1.lane, 'product');
  assert.equal(result.board.P1.activityMode, 'read-only-review');
  assert.equal(result.board.P1.workItemId, 'work.174');
  assert.equal(result.board.P1.reviewedHeadSha, HEAD_B);
  assert.equal(result.board.P1.reviewState, 'active');
  assert.equal(result.board.P1.worker, 'Worker-182');
  // The workflow lane is untouched by a product review.
  assert.equal(result.board.W1.workItemId, 'work.177');
  assert.equal(result.board.W1.activityMode, 'mutation');
});

test('a review of a workflow head is requested into the workflow lane', () => {
  const input = fixture();
  input.workItems[0].lifecycleState = 'result';
  input.board.W1 = { occupancy: 'free', freeReason: 'the workflow worker published its terminal RESULT' };
  input.stateIndex.activeIssueNumbers = [];
  const result = JSON.parse(buildSessionStart(input));
  assert.equal(result.nextAction.code, ACTION.REQUEST_INDEPENDENT_REVIEW);
  assert.equal(result.nextAction.workItemId, 'work.177');
  assert.equal(result.nextAction.lane, 'workflow');
  assert.equal(result.nextAction.slot, 'W1');
});

test('a released lane is refilled from work in that same permanent lane', () => {
  const input = fixture();
  // The workflow lane is free and a product packet is ready: the product packet
  // takes a product lane, and the workflow lane is not consumed by it.
  input.board.W1 = { occupancy: 'free', freeReason: 'the workflow worker published its terminal RESULT' };
  input.workItems[0].lifecycleState = 'done';
  input.stateIndex.activeIssueNumbers = [];
  const result = JSON.parse(buildSessionStart(input));
  assert.equal(result.nextAction.code, ACTION.PUBLISH_DISPATCH_FOR_MANUAL_OWNER_LAUNCH);
  assert.equal(result.nextAction.workItemId, 'work.174');
  assert.equal(result.nextAction.slot, 'P1');
  assert.equal(SLOT_LANE[result.nextAction.slot], 'product');
});

test('a board key set other than the three permanent lanes fails closed', () => {
  expectCode(REASON.SLOT_CARDINALITY, (input) => { input.board.M1 = { occupancy: 'free', freeReason: 'superseded mutation slot' }; });
  expectCode(REASON.SLOT_CARDINALITY, (input) => { delete input.board.W1; });
  expectCode(REASON.SLOT_CARDINALITY, (input) => {
    input.board.P3 = input.board.W1;
    delete input.board.W1;
  });
});

test('a wrong two-product one-workflow allocation fails closed', () => {
  // Three product lanes, or two workflow lanes, is not this board.
  expectCode(REASON.SLOT_CARDINALITY, (input) => {
    input.board = { P1: input.board.P1, P2: input.board.P2, P3: { occupancy: 'free', freeReason: 'third product lane' } };
  });
  expectCode(REASON.SLOT_CARDINALITY, (input) => {
    input.board = { P1: input.board.P1, W1: input.board.W1, W2: { occupancy: 'free', freeReason: 'second workflow lane' } };
  });
});

test('lane inversion fails closed in both directions', () => {
  // A workflow WorkItem in a product lane.
  expectCode(REASON.LANE_SLOT_MISMATCH, (input) => {
    input.board.P1 = seatMutation(input.workItems[0]);
    input.board.W1 = { occupancy: 'free', freeReason: 'moved to a product lane by mistake' };
  });
  // A product WorkItem in the workflow lane.
  expectCode(REASON.LANE_SLOT_MISMATCH, (input) => {
    input.workItems[1].lifecycleState = 'active';
    input.workItems[1].startedEvidenceUrl = `${REPO}/issues/174#issuecomment-2`;
    input.board.W1 = seatMutation(input.workItems[1]);
  });
});

test('a product review seated in the workflow lane fails closed', () => {
  expectCode(REASON.LANE_SLOT_MISMATCH, (input) => {
    input.workItems[1].lifecycleState = 'result';
    input.workItems[1].headSha = HEAD_B;
    const record = review('review.174', { workItemId: 'work.174', reviewedHeadSha: HEAD_B, currentHeadSha: HEAD_B, state: 'active', authorSession: 'work.174-engagement' });
    delete record.verdict;
    input.reviews.push(record);
    input.board.W1 = seatReview(record);
  });
});

test('a board-eligible WorkItem with no lane classification fails closed', () => {
  expectCode(REASON.LANE_CLASSIFICATION, (input) => { delete input.workItems[1].lane; });
  expectCode(REASON.LANE_CLASSIFICATION, (input) => { input.workItems[1].lane = 'ui'; });
});

test('a lane classification with no source evidence fails closed', () => {
  expectCode(REASON.LANE_CLASSIFICATION, (input) => { delete input.workItems[1].laneSourceRefs; });
  expectCode(REASON.LANE_CLASSIFICATION, (input) => { input.workItems[1].laneSourceRefs = []; });
  expectCode(REASON.LANE_CLASSIFICATION, (input) => { input.workItems[1].laneSourceRefs = ['gh.absent']; });
});

test('two records classifying one Issue into different lanes fail closed', () => {
  expectCode(REASON.LANE_CLASSIFICATION, (input) => {
    input.workItems.push({ ...input.workItems[1], id: 'work.174.mirror', lane: 'workflow' });
  });
});

// ---------------------------------------------------------------------------
// Worker-N = Issue #N
// ---------------------------------------------------------------------------

test('a worker number that differs from its Issue number fails closed', () => {
  expectCode(REASON.WORKER_IDENTITY, (input) => { input.workItems[0].worker = 'Worker-999'; });
  expectCode(REASON.WORKER_IDENTITY, (input) => {
    input.workItems[0].worker = 'Worker-999';
    input.board.W1.worker = 'Worker-999';
  });
});

test('a slot label, branch, pull request, or session is never a worker identity', () => {
  for (const impostor of ['W1', 'P1', 'agent/session-cold-start-graph-001', 'PR-179', 'session-cold-start-graph-001', 'cloud-worker', 'retry-2']) {
    expectCode(REASON.WORKER_IDENTITY, (input) => { input.workItems[0].worker = impostor; });
    expectCode(REASON.WORKER_IDENTITY, (input) => { input.board.W1.worker = impostor; });
  }
});

test('a board-eligible WorkItem with no worker identity at all fails closed', () => {
  expectCode(REASON.WORKER_IDENTITY, (input) => { delete input.workItems[1].worker; });
});

test('a seated worker that disagrees with its WorkItem fails closed', () => {
  expectCode(REASON.WORKER_IDENTITY, (input) => {
    input.workItems[0].issueNumber = 177;
    input.board.W1.worker = 'Worker-174';
  });
});

test('a review engagement carries Worker-N for its own review Issue', () => {
  expectCode(REASON.WORKER_IDENTITY, (input) => {
    input.reviews.push(review('review.current', { worker: 'Worker-999' }));
  });
  expectCode(REASON.WORKER_IDENTITY, (input) => {
    // The reviewed packet's worker is not the reviewer's worker.
    const record = review('review.current');
    input.reviews.push(record);
    input.board.W1 = { ...seatReview(record), worker: 'Worker-177' };
  });
});

test('the graph projection carries the same Worker-N invariant', () => {
  expectCode(REASON.WORKER_IDENTITY, (input) => {
    input.graph.nodes.find((node) => node.type === 'Worker').label = 'W1';
  });
  expectCode(REASON.WORKER_IDENTITY, (input) => {
    input.graph.nodes.find((node) => node.type === 'Worker').label = 'Worker-999';
  });
  expectCode(REASON.WORKER_IDENTITY, (input) => {
    input.graph.nodes.find((node) => node.type === 'Worker').label = 'agent/session-cold-start-graph-001';
  });
});

test('a well-formed worker identity is projected onto the occupied lane', () => {
  const result = JSON.parse(buildSessionStart(fixture()));
  assert.equal(result.board.W1.worker, 'Worker-177');
  assert.equal(result.board.W1.issueUrl, `${REPO}/issues/177`);
  assert.equal(result.board.W1.sessionLabel, 'session-cold-start-graph-001');
  assert.equal(result.board.W1.startedEvidenceUrl, `${REPO}/issues/177#issuecomment-1`);
  assert.equal(result.board.W1.domainLease, 'domain:governance');
});

// ---------------------------------------------------------------------------
// The single next action is bound to the graph
// ---------------------------------------------------------------------------

test('work the graph declares blocked is never proposed for dispatch', () => {
  const input = fixture();
  // The graph knows about a blocker the observation record has not caught up with.
  blockInGraph(input.graph, 'work.174');
  const result = JSON.parse(buildSessionStart(input));
  assert.equal(result.graph.unresolvedBlockers.includes('blk.1'), true);
  assert.equal(result.graph.runnableWork.includes('work.174'), false);
  assert.notEqual(result.nextAction.code, ACTION.PUBLISH_DISPATCH_FOR_MANUAL_OWNER_LAUNCH);
  assert.equal(result.nextAction.code, ACTION.AWAIT_ACTIVE_SLOT_RESULT);
  // The divergence is reported rather than silently absorbed.
  assert.equal(result.discrepancies.includes('graph-runnable-exclusion:work.174'), true);
});

test('blocked work appearing in a candidate queue is excluded, not dispatched', () => {
  const input = fixture();
  // Both hierarchies agree the item is blocked; it stays in the queue as a named gap.
  input.workItems[1].blockers = [{ reasonCode: 'MISSING_SOURCE_OR_RIGHTS', requiredClearingEvidence: 'owner media intake and publication rights packet' }];
  blockInGraph(input.graph, 'work.174');
  const result = JSON.parse(buildSessionStart(input));
  assert.equal(result.namedGaps.includes('work.174:MISSING_SOURCE_OR_RIGHTS:owner media intake and publication rights packet'), true);
  assert.equal(result.workItems.some((item) => item.id === 'work.174'), true);
  assert.equal(result.nextAction.code, ACTION.AWAIT_ACTIVE_SLOT_RESULT);
});

test('a runnable/blocked contradiction between the graph and the observation fails closed', () => {
  expectCode(REASON.GRAPH_CONTRADICTION, (input) => {
    // The graph still lists the item as runnable while the observation carries an
    // unresolved blocker for it. Two hierarchies disagreeing is not averaged out.
    input.workItems[1].blockers = [{ reasonCode: 'MISSING_SOURCE_OR_RIGHTS', requiredClearingEvidence: 'owner media intake and publication rights packet' }];
  });
});

test('a cleared blocker restores dispatchability in both hierarchies', () => {
  const input = fixture();
  input.workItems[1].blockers = [{
    reasonCode: 'MISSING_SOURCE_OR_RIGHTS',
    requiredClearingEvidence: 'owner media intake and publication rights packet',
    clearedByEvidenceUrl: `${REPO}/issues/174#issuecomment-9`,
  }];
  const result = JSON.parse(buildSessionStart(input));
  assert.equal(result.nextAction.code, ACTION.PUBLISH_DISPATCH_FOR_MANUAL_OWNER_LAUNCH);
  assert.equal(result.nextAction.workItemId, 'work.174');
});

// ---------------------------------------------------------------------------
// No live engagement is silently dropped
// ---------------------------------------------------------------------------

test('an active mutation seated in no lane is a named blocking discrepancy', () => {
  const input = fixture();
  input.workItems.push(productWorkItem());
  input.stateIndex.activeIssueNumbers = [177, 181];
  const result = JSON.parse(buildSessionStart(input));
  assert.equal(result.discrepancies.includes('unseated-active-mutation:work.181:Worker-181'), true);
  assert.equal(result.nextAction.code, ACTION.RECONCILE_UNSEATED_ENGAGEMENT);
  // The blocking discrepancy outranks every allocation step.
  assert.notEqual(result.nextAction.code, ACTION.PUBLISH_DISPATCH_FOR_MANUAL_OWNER_LAUNCH);
});

test('mutation load in excess of the three lanes is reported, never truncated', () => {
  const input = fixture();
  input.workItems.push(
    productWorkItem(),
    productWorkItem({ id: 'work.186', issueNumber: 186, issueUrl: `${REPO}/issues/186`, worker: 'Worker-186', headSha: HEAD_B, domainLease: 'domain:release', allowlist: ['governance/office/STATE.md'], startedEvidenceUrl: `${REPO}/issues/186#issuecomment-5`, sourceRefs: ['gh.issue181'], laneSourceRefs: ['gh.issue181'] }),
  );
  input.stateIndex.activeIssueNumbers = [177, 181, 186];
  const result = JSON.parse(buildSessionStart(input));
  assert.equal(result.discrepancies.includes('unseated-active-mutation:work.181:Worker-181'), true);
  assert.equal(result.discrepancies.includes('unseated-active-mutation:work.186:Worker-186'), true);
  assert.equal(result.nextAction.code, ACTION.RECONCILE_UNSEATED_ENGAGEMENT);
});

test('an active reviewer seated in no lane is a named blocking discrepancy', () => {
  const input = fixture();
  const record = review('review.177.live', { state: 'active' });
  delete record.verdict;
  input.reviews.push(record);
  const result = JSON.parse(buildSessionStart(input));
  assert.equal(result.discrepancies.includes('unseated-active-review:review.177.live:Worker-182'), true);
  assert.equal(result.nextAction.code, ACTION.RECONCILE_UNSEATED_ENGAGEMENT);
});

test('zero live engagements are omitted from both the board and the discrepancies', () => {
  const input = fixture();
  input.workItems.push(productWorkItem());
  const running = review('review.177.live', { state: 'active' });
  delete running.verdict;
  input.reviews.push(running);
  const result = JSON.parse(buildSessionStart(input));
  const seated = Object.values(result.board)
    .filter((slot) => slot.occupancy === 'occupied')
    .flatMap((slot) => [slot.workItemId, slot.reviewId])
    .filter(Boolean);
  const live = [
    ...result.workItems.filter((item) => item.lifecycleState === 'active').map((item) => item.id),
    ...result.reviews.filter((item) => item.state === 'active').map((item) => item.id),
  ];
  for (const id of live) {
    const represented = seated.includes(id) || result.discrepancies.some((entry) => entry.includes(`:${id}:`));
    assert.equal(represented, true, `${id} appears in neither a lane nor a discrepancy`);
  }
});

test('every active engagement seated in its own lane clears the blocking discrepancy', () => {
  const input = fixture();
  const item = productWorkItem();
  input.workItems.push(item);
  input.board.P1 = seatMutation(item);
  input.stateIndex.activeIssueNumbers = [177, 181];
  const result = JSON.parse(buildSessionStart(input));
  assert.equal(result.discrepancies.some((entry) => entry.startsWith('unseated-')), false);
  assert.equal(result.board.P1.occupancy, 'occupied');
  assert.equal(result.board.P1.workItemId, 'work.181');
  assert.notEqual(result.nextAction.code, ACTION.RECONCILE_UNSEATED_ENGAGEMENT);
});

// ---------------------------------------------------------------------------
// Reviewer representation and duplicate suppression
// ---------------------------------------------------------------------------

test('a dispatched reviewer leaves its lane free and names the worker awaiting launch', () => {
  const input = fixture();
  input.workItems[0].lifecycleState = 'result';
  input.stateIndex.activeIssueNumbers = [];
  const dispatched = review('review.177.dispatched', { state: 'dispatched' });
  delete dispatched.verdict;
  input.reviews.push(dispatched);
  input.board.W1 = {
    occupancy: 'free',
    freeReason: 'a reviewer is dispatched and awaits manual launch by the Owner',
    dispatchedWorker: 'Worker-182',
  };
  const result = JSON.parse(buildSessionStart(input));
  assert.equal(result.board.W1.occupancy, 'free');
  assert.equal(result.board.W1.dispatchedWorker, 'Worker-182');
  // DISPATCH is not STARTED, and a dispatched review is still a review: no duplicate.
  assert.notEqual(result.nextAction.code, ACTION.REQUEST_INDEPENDENT_REVIEW);
  assert.equal(result.nextAction.code, ACTION.PUBLISH_DISPATCH_FOR_MANUAL_OWNER_LAUNCH);
  assert.equal(result.nextAction.workItemId, 'work.174');
});

test('a dispatched reviewer cannot be seated as occupied without STARTED evidence', () => {
  expectCode(REASON.SLOT_WITHOUT_STARTED, (input) => {
    const dispatched = review('review.177.dispatched', { state: 'dispatched' });
    delete dispatched.verdict;
    input.reviews.push(dispatched);
    input.board.W1 = seatReview(dispatched);
  });
});

test('a running reviewer is representable as the lane activity and suppresses a duplicate', () => {
  const input = fixture();
  input.workItems[0].lifecycleState = 'result';
  input.stateIndex.activeIssueNumbers = [];
  const running = review('review.177.live', { state: 'active' });
  delete running.verdict;
  input.reviews.push(running);
  input.board.W1 = seatReview(running);
  const result = JSON.parse(buildSessionStart(input));
  assert.equal(result.board.W1.activityMode, 'read-only-review');
  assert.equal(result.board.W1.reviewId, 'review.177.live');
  assert.equal(result.board.W1.reviewState, 'active');
  assert.equal(result.board.W1.reviewedHeadSha, HEAD_A);
  assert.equal(result.board.W1.workItemId, 'work.177');
  assert.notEqual(result.nextAction.code, ACTION.REQUEST_INDEPENDENT_REVIEW);
});

test('a concluded verdict at the current head suppresses a further review request', () => {
  const input = fixture();
  input.workItems[0].lifecycleState = 'result';
  input.board.W1 = { occupancy: 'free', freeReason: 'the reviewer published its terminal verdict' };
  input.stateIndex.activeIssueNumbers = [];
  input.reviews.push(review('review.177.done', { verdict: 'blocked-for-revision' }));
  const result = JSON.parse(buildSessionStart(input));
  assert.notEqual(result.nextAction.code, ACTION.REQUEST_INDEPENDENT_REVIEW);
});

test('a review of a superseded head does not suppress a review of the current head', () => {
  const input = fixture();
  input.workItems[0].lifecycleState = 'result';
  input.workItems[0].headSha = HEAD_B;
  input.board.W1 = { occupancy: 'free', freeReason: 'the workflow worker published its terminal RESULT' };
  input.stateIndex.activeIssueNumbers = [];
  input.reviews.push(review('review.177.stale'));
  const result = JSON.parse(buildSessionStart(input));
  assert.equal(result.discrepancies.includes(`review-not-at-work-item-head:review.177.stale:${HEAD_A}!=${HEAD_B}`), true);
  assert.equal(result.nextAction.code, ACTION.REQUEST_INDEPENDENT_REVIEW);
  assert.equal(result.nextAction.workItemId, 'work.177');
});

test('two lanes reviewing one WorkItem fail closed', () => {
  expectCode(REASON.DUPLICATE_REVIEW, (input) => {
    input.workItems[0].lane = 'product';
    input.workItems[0].lifecycleState = 'result';
    const first = review('review.177.a', { state: 'active' });
    const second = review('review.177.b', { state: 'active', issueNumber: 183, issueUrl: `${REPO}/issues/183`, worker: 'Worker-183', reviewerSession: 'reviewer-engagement-2', startedEvidenceUrl: `${REPO}/issues/183#issuecomment-6` });
    delete first.verdict;
    delete second.verdict;
    input.reviews.push(first, second);
    input.board.P1 = seatReview(first);
    input.board.P2 = seatReview(second, 'reviewer-engagement-2');
    input.board.W1 = { occupancy: 'free', freeReason: 'no workflow packet is live at this watermark' };
  });
});

test('a seated review must be bound to the reviewed WorkItem exact current head', () => {
  expectCode(REASON.STALE_EXACT_HEAD_REVIEW, (input) => {
    const record = review('review.drifted', { reviewedHeadSha: HEAD_B, currentHeadSha: HEAD_B, state: 'active' });
    delete record.verdict;
    input.reviews.push(record);
    input.board.W1 = seatReview(record);
  });
});

test('a lane cannot hold a verdict bound to a superseded head', () => {
  expectCode(REASON.STALE_EXACT_HEAD_REVIEW, (input) => {
    input.reviews.push(review('review.drifted', { currentHeadSha: HEAD_B }));
    input.board.W1 = seatReview(input.reviews[0]);
  });
});

test('a lane cannot hold a review its own engagement authored', () => {
  expectCode(REASON.REVIEWER_AUTHORED_HEAD, (input) => {
    const record = review('review.self', { reviewerSession: 'session-cold-start-graph-001' });
    input.reviews.push(record);
    input.board.W1 = seatReview(record, 'session-cold-start-graph-001');
  });
});

test('a review session label that impersonates a different reviewer fails closed', () => {
  expectCode(REASON.REVIEWER_AUTHORED_HEAD, (input) => {
    const record = review('review.current');
    input.reviews.push(record);
    input.board.W1 = seatReview(record, 'some-other-engagement');
  });
});

test('a running review carries no verdict and a concluded one must', () => {
  expectCode(REASON.INVALID_VALUE, (input) => {
    input.reviews.push(review('review.running', { state: 'active' }));
  });
  expectCode(REASON.INVALID_VALUE, (input) => {
    const record = review('review.done');
    delete record.verdict;
    input.reviews.push(record);
  });
});

// ---------------------------------------------------------------------------
// Preserved cold-start behaviour
// ---------------------------------------------------------------------------

test('stale STATE.md is reported as a discrepancy and ignored for live dispatch', () => {
  const result = JSON.parse(buildSessionStart(fixture()));
  assert.equal(result.discrepancies.some((entry) => entry.startsWith(`state-index-stale:governance/office/STATE.md:${STALE_MAIN}`)), true);
  assert.equal(result.discrepancies.some((entry) => entry.startsWith('state-index-queue-divergence:indexed=[161]:live=[177]')), true);
  // The stale index changes nothing about dispatch: the live action still stands.
  assert.equal(result.nextAction.code, ACTION.PUBLISH_DISPATCH_FOR_MANUAL_OWNER_LAUNCH);
});

test('label state that disagrees with evidence is reported, never silently resolved', () => {
  const result = JSON.parse(buildSessionStart(fixture()));
  assert.equal(result.discrepancies.includes('label-lifecycle-divergence:work.177:label=dispatched:evidence=active'), true);
});

test('a synchronized index produces no staleness or queue divergence', () => {
  const input = fixture();
  input.stateIndex.syncedFromSha = MAIN;
  input.stateIndex.syncedAtSequence = 177;
  input.stateIndex.activeIssueNumbers = [177];
  const result = JSON.parse(buildSessionStart(input));
  assert.equal(result.discrepancies.some((entry) => entry.startsWith('state-index-stale')), false);
  assert.equal(result.discrepancies.some((entry) => entry.startsWith('state-index-queue-divergence')), false);
});

test('missing source reference fails closed', () => {
  expectCode(REASON.MISSING_SOURCE, (input) => { input.workItems[0].sourceRefs = ['gh.absent']; });
});

test('incomplete GitHub comments under an occupied lane fail closed', () => {
  expectCode(REASON.INCOMPLETE_SOURCE, (input) => {
    input.sources.find((item) => item.id === 'gh.issue177').complete = false;
  });
});

test('incomplete evidence outside the live board is a named gap, not an inference', () => {
  const input = fixture();
  input.sources.push(source('gh.archive', 'issues/151', { complete: false, namedGaps: ['comment page 2 unavailable'] }));
  input.workItems.push({
    id: 'work.151',
    issueNumber: 151,
    issueUrl: `${REPO}/issues/151`,
    title: 'archived packet',
    lifecycleState: 'done',
    domainLease: 'domain:release',
    allowlist: [],
    blockers: [],
    sourceRefs: ['gh.archive'],
  });
  const result = JSON.parse(buildSessionStart(input));
  assert.equal(result.namedGaps.includes('gh.archive:source-incomplete'), true);
  assert.equal(result.namedGaps.includes('gh.archive:comment page 2 unavailable'), true);
});

test('incomplete lane-classification evidence under an occupied lane fails closed', () => {
  expectCode(REASON.INCOMPLETE_SOURCE, (input) => {
    input.sources.push(source('gh.lane', 'issues/177#issuecomment-7', { complete: false }));
    input.workItems[0].laneSourceRefs = ['gh.lane'];
  });
});

test('split-brain in the consumed engineering graph fails closed', () => {
  expectCode(REASON.CONFLICTING_ACTIVE_HEADS, (input) => {
    input.graph.nodes.push({ id: 'attempt.177.b', type: 'Attempt', label: 'attempt.177.b', status: 'active', sourceRefs: ['gh.issue177'], workItemId: 'work.177', headSha: HEAD_B });
    input.graph.edges.push({ id: 'g3', type: 'attempts', from: 'attempt.177.b', to: 'work.177', sourceRefs: ['gh.issue177'] });
  });
});

test('two live records claiming one Issue at different heads fail closed', () => {
  expectCode(REASON.CONFLICTING_ACTIVE_HEADS, (input) => {
    input.workItems.push({ ...input.workItems[0], id: 'work.177.duplicate', headSha: HEAD_B });
  });
});

test('one WorkItem claimed by two lanes fails closed', () => {
  expectCode(REASON.CONFLICTING_ACTIVE_HEADS, (input) => {
    input.workItems[0].lane = 'product';
    input.board.P1 = seatMutation(input.workItems[0]);
    input.board.P2 = seatMutation(input.workItems[0]);
    input.board.W1 = { occupancy: 'free', freeReason: 'no workflow packet is live at this watermark' };
  });
});

test('a stale exact-head review cannot open the Owner gate', () => {
  expectCode(REASON.STALE_EXACT_HEAD_REVIEW, (input) => {
    input.reviews.push(review('review.stale', { currentHeadSha: HEAD_B }));
    input.ownerGate = { open: true, workItemId: 'work.177', reviewRef: 'review.stale', sourceRefs: ['gh.issue177'] };
  });
});

test('a self-review cannot open the Owner gate', () => {
  expectCode(REASON.REVIEWER_AUTHORED_HEAD, (input) => {
    input.reviews.push(review('review.self', { reviewerSession: 'session-cold-start-graph-001' }));
    input.ownerGate = { open: true, workItemId: 'work.177', reviewRef: 'review.self', sourceRefs: ['gh.issue177'] };
  });
});

test('a running review cannot open the Owner gate', () => {
  expectCode(REASON.INVALID_VALUE, (input) => {
    const record = review('review.running', { state: 'active' });
    delete record.verdict;
    input.reviews.push(record);
    input.ownerGate = { open: true, workItemId: 'work.177', reviewRef: 'review.running', sourceRefs: ['gh.issue177'] };
  });
});

test('an open Owner gate on a current non-author verdict yields the gate action', () => {
  const input = fixture();
  input.reviews.push(review('review.current'));
  input.ownerGate = { open: true, workItemId: 'work.177', reviewRef: 'review.current', sourceRefs: ['gh.issue177'] };
  const result = JSON.parse(buildSessionStart(input));
  assert.equal(result.nextAction.code, ACTION.ASSEMBLE_OWNER_GATE);
  assert.equal(result.nextAction.workItemId, 'work.177');
  assert.equal(result.nextAction.lane, 'workflow');
  assert.equal(result.reviews.find((item) => item.id === 'review.current').exactHeadValid, true);
});

test('two mutation activities sharing a domain lease fail closed', () => {
  expectCode(REASON.DOMAIN_LEASE_CONFLICT, (input) => {
    input.workItems[1].domainLease = 'domain:governance';
    input.workItems[1].lane = 'workflow';
    input.workItems[1].lifecycleState = 'active';
    input.workItems[1].startedEvidenceUrl = `${REPO}/issues/174#issuecomment-2`;
    input.workItems[0].lane = 'workflow';
    input.board.P1 = { occupancy: 'free', freeReason: 'no Product 2 packet is live at this watermark' };
    input.board.W1 = seatMutation(input.workItems[0]);
    input.board.P2 = { occupancy: 'free', freeReason: 'no second Product 2 packet is live at this watermark' };
    // Both workflow items cannot both sit in W1, so prove the lease check on two product lanes.
    input.workItems[0].lane = 'product';
    input.workItems[1].lane = 'product';
    input.board.P1 = seatMutation(input.workItems[0]);
    input.board.P2 = seatMutation(input.workItems[1]);
    input.board.W1 = { occupancy: 'free', freeReason: 'no workflow packet is live at this watermark' };
  });
});

test('two mutation activities sharing an allowlisted path fail closed', () => {
  expectCode(REASON.DOMAIN_LEASE_CONFLICT, (input) => {
    input.workItems[0].lane = 'product';
    input.workItems[1].lane = 'product';
    input.workItems[1].lifecycleState = 'active';
    input.workItems[1].allowlist = ['CLAUDE.md'];
    input.workItems[1].startedEvidenceUrl = `${REPO}/issues/174#issuecomment-2`;
    input.board.P1 = seatMutation(input.workItems[0]);
    input.board.P2 = seatMutation(input.workItems[1]);
    input.board.W1 = { occupancy: 'free', freeReason: 'no workflow packet is live at this watermark' };
  });
});

test('a read-only review takes no write lease and never collides with a mutation', () => {
  const input = fixture();
  input.workItems[1].lifecycleState = 'result';
  input.workItems[1].headSha = HEAD_B;
  input.workItems[1].domainLease = 'domain:governance';
  const record = review('review.174', { workItemId: 'work.174', reviewedHeadSha: HEAD_B, currentHeadSha: HEAD_B, state: 'active', authorSession: 'work.174-engagement' });
  delete record.verdict;
  input.reviews.push(record);
  input.board.P1 = seatReview(record);
  const result = JSON.parse(buildSessionStart(input));
  assert.equal(result.board.P1.activityMode, 'read-only-review');
  assert.equal(result.board.W1.activityMode, 'mutation');
  assert.equal(result.board.W1.domainLease, 'domain:governance');
});

test('an occupied lane without persisted STARTED evidence fails closed', () => {
  expectCode(REASON.SLOT_WITHOUT_STARTED, (input) => { delete input.board.W1.startedEvidenceUrl; });
  expectCode(REASON.SLOT_WITHOUT_STARTED, (input) => { delete input.board.W1.sessionLabel; });
});

test('an occupied lane whose STARTED evidence contradicts the Issue fails closed', () => {
  expectCode(REASON.SLOT_WITHOUT_STARTED, (input) => { input.board.W1.startedEvidenceUrl = `${REPO}/issues/177#issuecomment-999`; });
});

test('a free lane is explicit and is never silently filled', () => {
  const result = JSON.parse(buildSessionStart(fixture()));
  assert.equal(result.board.P1.occupancy, 'free');
  assert.equal(typeof result.board.P1.freeReason, 'string');
  assert.equal(result.board.P1.workItemId, undefined);
  assert.equal(result.board.P2.occupancy, 'free');
  expectCode(REASON.INVALID_VALUE, (input) => { delete input.board.P1.freeReason; });
  expectCode(REASON.INVALID_VALUE, (input) => { input.board.P1 = { occupancy: 'free', freeReason: 'free', workItemId: 'work.174' }; });
  expectCode(REASON.INVALID_VALUE, (input) => { input.board.P1 = { occupancy: 'free', freeReason: 'free', activityMode: 'mutation' }; });
  expectCode(REASON.WORKER_IDENTITY, (input) => { input.board.P1 = { occupancy: 'free', freeReason: 'free', dispatchedWorker: 'P1' }; });
});

test('a full board awaits a RESULT and never opens a fourth lane', () => {
  const input = fixture();
  const item = productWorkItem();
  input.workItems.push(item);
  input.workItems[1].lifecycleState = 'active';
  input.workItems[1].startedEvidenceUrl = `${REPO}/issues/174#issuecomment-2`;
  input.board.P1 = seatMutation(input.workItems[1]);
  input.board.P2 = seatMutation(item);
  input.stateIndex.activeIssueNumbers = [174, 177, 181];
  const result = JSON.parse(buildSessionStart(input));
  assert.deepEqual(Object.keys(result.board).sort(), [...SLOTS].sort());
  assert.equal(result.board.P1.occupancy, 'occupied');
  assert.equal(result.board.P2.occupancy, 'occupied');
  assert.equal(result.board.W1.occupancy, 'occupied');
  assert.equal(result.nextAction.code, ACTION.AWAIT_ACTIVE_SLOT_RESULT);
});

test('repeated failed precondition is refused by the consumed graph, unchanged', () => {
  const input = fixture();
  for (const suffix of ['a', 'b']) {
    input.graph.nodes.push({
      id: `dispatch.repeat.${suffix}`, type: 'Dispatch', label: `dispatch.repeat.${suffix}`, status: 'not-runnable',
      sourceRefs: ['gh.issue177'], workItemId: 'work.177', preconditionFingerprint: 'no-executable-checkout', evidenceRef: 'evidence.blocked',
    });
  }
  assert.throws(() => buildSessionStart(input), (error) => error instanceof GraphError && error.code === GRAPH_REASON.NOT_RUNNABLE_REPEATED_PRECONDITION);
});

test('changed authoritative evidence permits recovery from the failed path', () => {
  const input = fixture();
  input.graph.nodes.push(
    { id: 'evidence.recovery', type: 'Evidence', label: 'evidence.recovery', status: 'complete', sourceRefs: ['gh.issue177'] },
    { id: 'dispatch.first', type: 'Dispatch', label: 'dispatch.first', status: 'not-runnable', sourceRefs: ['gh.issue177'], workItemId: 'work.177', preconditionFingerprint: 'no-executable-checkout', evidenceRef: 'evidence.blocked' },
    { id: 'dispatch.rerun', type: 'Dispatch', label: 'dispatch.rerun', status: 'not-runnable', sourceRefs: ['gh.issue177'], workItemId: 'work.177', preconditionFingerprint: 'no-executable-checkout', evidenceRef: 'evidence.recovery' },
  );
  assert.doesNotThrow(() => buildSessionStart(input));
});

test('cold-start watermark regression fails closed', () => {
  expectCode(REASON.WATERMARK_REGRESSION, (input) => {
    input.previousWatermark = { observedAt: '2026-08-11T09:00:00.000Z', sequence: 200 };
  });
});

test('a source watermark newer than the cold start fails closed', () => {
  expectCode(REASON.WATERMARK_REGRESSION, (input) => { input.graph.watermark.sequence = 999; });
});

test('a state index claiming a sequence ahead of the observation fails closed', () => {
  expectCode(REASON.WATERMARK_REGRESSION, (input) => { input.stateIndex.syncedAtSequence = 500; });
});

test('an unknown top-level field fails closed', () => {
  expectCode(REASON.UNKNOWN_FIELD, (input) => { input.approvalAuthority = true; });
});

test('an unknown lane field fails closed', () => {
  expectCode(REASON.UNKNOWN_FIELD, (input) => { input.board.W1.kind = 'mutation'; });
});

test('identical frozen inputs produce byte-identical results regardless of array order', () => {
  const first = fixture();
  const second = fixture();
  second.sources.reverse();
  second.workItems.reverse();
  second.graph.nodes.reverse();
  second.graph.edges.reverse();
  assert.equal(buildSessionStart(first), buildSessionStart(second));
});

test('delete-and-rebuild through the CLI reproduces identical bytes', async (context) => {
  const directory = await mkdtemp(join(tmpdir(), 'cold-start-'));
  try {
    const inputPath = join(directory, 'input.json');
    const outputPath = join(directory, 'cold-start.json');
    await writeFile(inputPath, JSON.stringify(fixture()));
    const builderPath = fileURLToPath(new URL('./build-session-start.mjs', import.meta.url));
    const run = () => spawnSync(process.execPath, [builderPath, '--input', inputPath, '--output', outputPath], { encoding: 'utf8' });
    assert.equal(run().status, 0);
    const first = await readFile(outputPath, 'utf8');
    await rm(outputPath);
    assert.equal(run().status, 0);
    const second = await readFile(outputPath, 'utf8');
    assert.equal(second, first);
    const firstChecksum = createHash('sha256').update(first).digest('hex');
    const secondChecksum = createHash('sha256').update(second).digest('hex');
    assert.equal(secondChecksum, firstChecksum);
    context.diagnostic?.(`cold-start double-build sha256 ${firstChecksum} == ${secondChecksum}`);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('the projection exposes no authority-bearing or worker-launch output', () => {
  const output = buildSessionStart(fixture());
  for (const forbidden of ['"approved"', '"accepted"', '"launchWorker"', '"dispatchWorker"', '"mergeAuthorized"', '"autoLaunch"']) {
    assert.equal(output.includes(forbidden), false);
  }
  const result = JSON.parse(output);
  assert.equal(result.nextAction.launchesWorker, false);
  assert.equal(result.nextAction.impliesApproval, false);
});

test('source free text carrying a disposition word never becomes a disposition', () => {
  const input = fixture();
  // Recorded boundary: the forbidden-token scan matches the serialized form, so a
  // quoted word inside input free text JSON-escapes and slips past the scan. What
  // it cannot do is become a disposition — the structural guarantees are separate
  // and still hold. The scan is a backstop, not the boundary.
  input.board.P1.freeReason = 'held for the "approved" packet';
  const result = JSON.parse(buildSessionStart(input));
  assert.equal(result.nextAction.launchesWorker, false);
  assert.equal(result.nextAction.impliesApproval, false);
  assert.equal(result.ownerGate.open, false);
  assert.equal(result.board.P1.occupancy, 'free');
});

test('both root instruction files route first to the one canonical entry', async () => {
  const audited = ['AGENTS.md', 'CLAUDE.md'];
  let routed = 0;
  for (const file of audited) {
    const text = await readFile(new URL(file, ROOT), 'utf8');
    const entryIndex = text.indexOf(ENTRY_PATH);
    assert.notEqual(entryIndex, -1, `${file} does not name ${ENTRY_PATH}`);
    // The entry must be reached before any other repository-specific governance read.
    for (const later of ['governance/BOUNDARIES.md', 'governance/office/OPERATING-MODEL-v5.md', 'governance/office/STATE.md']) {
      const laterIndex = text.indexOf(later);
      if (laterIndex !== -1) assert.equal(entryIndex < laterIndex, true, `${file} reads ${later} before ${ENTRY_PATH}`);
    }
    routed += 1;
  }
  assert.equal(routed, audited.length);
  assert.equal(routed, 2);
});

test('the entry folder hard-codes no mutable current truth and no local worktree path', async () => {
  for (const file of [ENTRY_PATH, 'governance/memory/README.md']) {
    const text = await readFile(new URL(file, ROOT), 'utf8');
    assert.equal(/\/home\/avoro/.test(text), false, `${file} references a local worktree path`);
    assert.equal(/\b[0-9a-f]{40}\b/.test(text), false, `${file} hard-codes a mutable exact SHA`);
    assert.equal(/state:(active|owner-gate|result)\b/.test(text), false, `${file} hard-codes a live queue position`);
  }
  // The canonical entry additionally carries no concrete worker, Issue, or pull
  // request number at all: those are live truth and are rehydrated, never written
  // down. The sibling README describes the historical lineage its fixtures cover,
  // which is settled evidence rather than current queue state.
  const entry = await readFile(new URL(ENTRY_PATH, ROOT), 'utf8');
  assert.equal(/\bWorker-\d+\b/.test(entry), false, `${ENTRY_PATH} hard-codes a current worker identity`);
  assert.equal(/#\d{2,}\b/.test(entry), false, `${ENTRY_PATH} hard-codes a current Issue or pull request number`);
});

test('the entry folder documents the permanent lanes without naming current occupancy', async () => {
  const text = await readFile(new URL(ENTRY_PATH, ROOT), 'utf8');
  for (const marker of ['`P1`', '`P2`', '`W1`', 'Worker-N', 'activityMode', 'COLD016_GRAPH_CONTRADICTION']) {
    assert.equal(text.includes(marker), true, `${ENTRY_PATH} does not document ${marker}`);
  }
  // The superseded board identities must not survive anywhere in the entry.
  for (const superseded of ['`M1`', '`M2`', '`R1`', 'M1/M2', 'M1/M2/R1']) {
    assert.equal(text.includes(superseded), false, `${ENTRY_PATH} still names the superseded slot ${superseded}`);
  }
});

if (process.env.VITEST) {
  const { describe, test: vitestTest } = await import('vitest');
  describe('deterministic graph-memory cold start', () => {
    for (const item of CASES) vitestTest(item.name, item.fn);
  });
} else {
  const { test: nodeTest } = await import('node:test');
  for (const item of CASES) nodeTest(item.name, item.fn);
}
