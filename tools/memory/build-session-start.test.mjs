import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { GraphError, REASON as GRAPH_REASON } from './build-graph.mjs';
import { ACTION, ColdStartError, REASON, SLOTS, buildSessionStart } from './build-session-start.mjs';

const CASES = [];
const test = (name, fn) => CASES.push({ name, fn });

const REPO = 'https://github.com/WEST-COAST-KBP-ADU/construction-os';
const MAIN = '22bccbf413fefac19adc3de693a2b415360459a6';
const HEAD_A = 'eaaed25c808ae35c77639d8686d7caef51f1925a';
const HEAD_B = '5a62bc19fd7bc22578bc965d615be7b526240142';
const STALE_MAIN = 'e32be9ea7cb265f6c6c0a65002a59bfe1419916c';
const SRC_SHA = '1111111111111111111111111111111111111111';
const OBSERVED = '2026-08-11T07:45:00.000Z';

const ROOT = new URL('../../', import.meta.url);
const ENTRY_PATH = 'governance/memory/SESSION-START.md';

function graphFixture() {
  return {
    schemaVersion: 'graph-source-truth/v1',
    watermark: { observedAt: '2026-08-11T07:44:00.000Z', sequence: 176 },
    sources: [{ id: 'gh.issue177', url: `${REPO}/issues/177`, sha: SRC_SHA, observedAt: '2026-08-11T07:44:00.000Z', complete: true, namedGaps: [] }],
    nodes: [
      { id: 'work.177', type: 'WorkItem', label: 'work.177', status: 'active', sourceRefs: ['gh.issue177'], runnable: true },
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
        title: 'Canonical graph-memory cold start and three-slot board',
        lifecycleState: 'active',
        labelState: 'dispatched',
        mode: 'mutation',
        worker: 'cloud-worker',
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
        mode: 'mutation',
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
      M1: { occupancy: 'occupied', workItemId: 'work.177', sessionLabel: 'session-cold-start-graph-001', startedEvidenceUrl: `${REPO}/issues/177#issuecomment-1` },
      M2: { occupancy: 'free', freeReason: 'no second mutation packet holds a disjoint lease at this watermark' },
      R1: { occupancy: 'free', freeReason: 'no RESULT is awaiting a non-author exact-head verdict' },
    },
    graph: graphFixture(),
  };
}

function expectCode(code, mutate) {
  const input = fixture();
  mutate(input);
  assert.throws(() => buildSessionStart(input), (error) => error instanceof ColdStartError && error.code === code);
}

const review = (id, extra = {}) => ({
  id,
  workItemId: 'work.177',
  reviewedHeadSha: HEAD_A,
  currentHeadSha: HEAD_A,
  verdict: 'retained',
  reviewerSession: 'reviewer-engagement-1',
  authorSession: 'session-cold-start-graph-001',
  sourceRefs: ['gh.issue177'],
  ...extra,
});

test('fresh cold start emits exactly three slots and exactly one executable action', () => {
  const result = JSON.parse(buildSessionStart(fixture()));
  assert.equal(result.schemaVersion, 'cold-start-result/v1');
  assert.deepEqual(Object.keys(result.board).sort(), [...SLOTS].sort());
  assert.equal(result.board.M1.occupancy, 'occupied');
  assert.equal(result.board.M1.kind, 'mutation');
  assert.equal(result.board.M2.kind, 'mutation');
  assert.equal(result.board.R1.kind, 'read-only-review');
  assert.equal(result.repository.mainSha, MAIN);
  assert.equal(result.program.stage, 'G0');
  assert.equal(result.productBoundary.product1Boundary.crossRepositoryBinding, 'deferred-pending-owner-adopted-decision');
  assert.equal(result.nextAction.code, ACTION.PUBLISH_DISPATCH_FOR_MANUAL_OWNER_LAUNCH);
  assert.equal(result.nextAction.workItemId, 'work.174');
  assert.equal(result.nextAction.slot, 'M2');
  assert.equal(result.nextAction.launchesWorker, false);
  assert.equal(result.nextAction.impliesApproval, false);
  assert.equal(result.refillLoop[0], 'hydrate');
  assert.equal(result.refillLoop.at(-1), 'refill');
  assert.equal(result.graph.canonicalHeads['work.177'], HEAD_A);
});

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

test('incomplete GitHub comments under an occupied slot fail closed', () => {
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

test('unresolved blockers surface their exact required clearing evidence', () => {
  const input = fixture();
  input.workItems[1].blockers = [{ reasonCode: 'MISSING_SOURCE_OR_RIGHTS', requiredClearingEvidence: 'owner media intake and publication rights packet' }];
  const result = JSON.parse(buildSessionStart(input));
  assert.equal(result.namedGaps.includes('work.174:MISSING_SOURCE_OR_RIGHTS:owner media intake and publication rights packet'), true);
  // A blocked ready item is not dispatchable, so no mutation slot may be refilled from it.
  assert.equal(result.nextAction.code, ACTION.AWAIT_ACTIVE_SLOT_RESULT);
});

test('split-brain in the consumed engineering graph fails closed', () => {
  expectCode(REASON.CONFLICTING_ACTIVE_HEADS, (input) => {
    input.graph.nodes.push({ id: 'attempt.177.b', type: 'Attempt', label: 'attempt.177.b', status: 'active', sourceRefs: ['gh.issue177'], workItemId: 'work.177', headSha: HEAD_B });
    input.graph.edges.push({ id: 'g3', type: 'attempts', from: 'attempt.177.b', to: 'work.177', sourceRefs: ['gh.issue177'] });
  });
});

test('two live records claiming one Issue at different heads fail closed', () => {
  expectCode(REASON.CONFLICTING_ACTIVE_HEADS, (input) => {
    const clone = { ...input.workItems[0], id: 'work.177.duplicate', headSha: HEAD_B };
    input.workItems.push(clone);
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

test('R1 cannot hold a head its own engagement authored', () => {
  expectCode(REASON.REVIEWER_AUTHORED_HEAD, (input) => {
    input.reviews.push(review('review.self', { reviewerSession: 'session-cold-start-graph-001' }));
    input.board.R1 = { occupancy: 'occupied', reviewId: 'review.self', sessionLabel: 'session-cold-start-graph-001' };
  });
});

test('R1 cannot hold a verdict bound to a superseded head', () => {
  expectCode(REASON.STALE_EXACT_HEAD_REVIEW, (input) => {
    input.reviews.push(review('review.drifted', { currentHeadSha: HEAD_B }));
    input.board.R1 = { occupancy: 'occupied', reviewId: 'review.drifted', sessionLabel: 'reviewer-engagement-1' };
  });
});

test('an open Owner gate on a current non-author verdict yields the gate action', () => {
  const input = fixture();
  input.reviews.push(review('review.current'));
  input.ownerGate = { open: true, workItemId: 'work.177', reviewRef: 'review.current', sourceRefs: ['gh.issue177'] };
  const result = JSON.parse(buildSessionStart(input));
  assert.equal(result.nextAction.code, ACTION.ASSEMBLE_OWNER_GATE);
  assert.equal(result.nextAction.workItemId, 'work.177');
  assert.equal(result.reviews.find((item) => item.id === 'review.current').exactHeadValid, true);
});

test('a RESULT without a current non-author verdict requests one read-only review', () => {
  const input = fixture();
  input.workItems[0].lifecycleState = 'result';
  input.board.M1 = { occupancy: 'free', freeReason: 'worker published its terminal RESULT' };
  input.stateIndex.activeIssueNumbers = [];
  const result = JSON.parse(buildSessionStart(input));
  assert.equal(result.nextAction.code, ACTION.REQUEST_INDEPENDENT_REVIEW);
  assert.equal(result.nextAction.slot, 'R1');
  assert.equal(result.nextAction.workItemId, 'work.177');
});

test('two mutation slots sharing a domain lease fail closed', () => {
  expectCode(REASON.DOMAIN_LEASE_CONFLICT, (input) => {
    input.workItems[1].domainLease = 'domain:governance';
    input.workItems[1].startedEvidenceUrl = `${REPO}/issues/174#issuecomment-2`;
    input.board.M2 = { occupancy: 'occupied', workItemId: 'work.174', sessionLabel: 'second-engagement', startedEvidenceUrl: `${REPO}/issues/174#issuecomment-2` };
  });
});

test('two mutation slots sharing an allowlisted path fail closed', () => {
  expectCode(REASON.DOMAIN_LEASE_CONFLICT, (input) => {
    input.workItems[1].allowlist = ['CLAUDE.md'];
    input.workItems[1].startedEvidenceUrl = `${REPO}/issues/174#issuecomment-2`;
    input.board.M2 = { occupancy: 'occupied', workItemId: 'work.174', sessionLabel: 'second-engagement', startedEvidenceUrl: `${REPO}/issues/174#issuecomment-2` };
  });
});

test('an occupied mutation slot without persisted STARTED evidence fails closed', () => {
  expectCode(REASON.SLOT_WITHOUT_STARTED, (input) => { delete input.board.M1.startedEvidenceUrl; });
});

test('an occupied mutation slot whose STARTED evidence contradicts the Issue fails closed', () => {
  expectCode(REASON.SLOT_WITHOUT_STARTED, (input) => { input.board.M1.startedEvidenceUrl = `${REPO}/issues/177#issuecomment-999`; });
});

test('a free slot is explicit and is never silently filled', () => {
  const result = JSON.parse(buildSessionStart(fixture()));
  assert.equal(result.board.M2.occupancy, 'free');
  assert.equal(typeof result.board.M2.freeReason, 'string');
  assert.equal(result.board.M2.workItemId, undefined);
  assert.equal(result.board.R1.occupancy, 'free');
  expectCode(REASON.INVALID_VALUE, (input) => { input.board.M2 = { occupancy: 'free', freeReason: 'free', workItemId: 'work.174' }; });
});

test('a full board awaits a RESULT and never opens a third mutation slot', () => {
  const input = fixture();
  input.workItems[1].lifecycleState = 'active';
  input.workItems[1].startedEvidenceUrl = `${REPO}/issues/174#issuecomment-2`;
  input.board.M2 = { occupancy: 'occupied', workItemId: 'work.174', sessionLabel: 'second-engagement', startedEvidenceUrl: `${REPO}/issues/174#issuecomment-2` };
  input.reviews.push(review('review.current'));
  input.board.R1 = { occupancy: 'occupied', reviewId: 'review.current', sessionLabel: 'reviewer-engagement-1' };
  const result = JSON.parse(buildSessionStart(input));
  assert.deepEqual(Object.keys(result.board).sort(), [...SLOTS].sort());
  assert.equal(result.nextAction.code, ACTION.AWAIT_ACTIVE_SLOT_RESULT);
  assert.equal(result.board.M1.occupancy, 'occupied');
  assert.equal(result.board.M2.occupancy, 'occupied');
  assert.equal(result.board.R1.occupancy, 'occupied');
});

test('a fourth logical slot fails closed on cardinality', () => {
  expectCode(REASON.SLOT_CARDINALITY, (input) => {
    input.board.M3 = { occupancy: 'free', freeReason: 'unauthorized third mutation slot' };
  });
});

test('a missing slot fails closed on cardinality', () => {
  expectCode(REASON.SLOT_CARDINALITY, (input) => { delete input.board.R1; });
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
