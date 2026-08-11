import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { buildGraph, GraphError, REASON } from './build-graph.mjs';

const CASES = [];
const test = (name, fn) => CASES.push({ name, fn });

const A = '5a62bc19fd7bc22578bc965d615be7b526240142';
const B = '044b45b10998422089674ede179a86909a05653a';
const MERGE = '22bccbf413fefac19adc3de693a2b415360459a6';
const SRC_SHA = '1111111111111111111111111111111111111111';

const node = (id, type, status, sourceRefs = ['issue169'], extra = {}) => ({ id, type, label: id, status, sourceRefs, ...extra });
const edge = (id, type, from, to, sourceRefs = ['issue169']) => ({ id, type, from, to, sourceRefs });

function fixture() {
  const sources = [
    ['issue169', 'issues/169'], ['issue171', 'issues/171'], ['pr170', 'pull/170'],
    ['pr172', 'pull/172'], ['candidateA', `commit/${A}`], ['candidateB', `commit/${B}`],
    ['merge', `commit/${MERGE}`],
  ].map(([id, path]) => ({ id, url: `https://github.com/WEST-COAST-KBP-ADU/construction-os/${path}`, sha: id === 'candidateA' ? A : id === 'candidateB' ? B : id === 'merge' ? MERGE : SRC_SHA, observedAt: '2026-08-11T07:04:26.000Z', complete: true, namedGaps: [] }));

  const nodes = [
    node('objective.control-plane', 'Objective', 'complete'),
    node('work.169', 'WorkItem', 'complete', ['issue169'], { runnable: false }),
    node('attempt.a', 'Attempt', 'audit-only', ['issue169', 'candidateA'], { workItemId: 'work.169', headSha: A, session: 'github-native-control-plane-001-opus' }),
    node('dispatch.a', 'Dispatch', 'failed', ['issue169'], { workItemId: 'work.169', preconditionFingerprint: 'stale-preflight:path-mismatch', evidenceRef: 'evidence.a-blocked', reasonCode: 'LIVE_STATE_DIVERGENCE' }),
    node('worker.a', 'Worker', 'complete', ['issue169']),
    node('branch.a', 'Branch', 'audit-only', ['pr170'], { workItemId: 'work.169', headSha: A, branch: 'agent/github-native-control-plane-001' }),
    node('pr.170', 'PullRequest', 'audit-only', ['pr170'], { workItemId: 'work.169', headSha: A, prNumber: 170 }),
    node('blocker.a-preflight', 'Blocker', 'blocked', ['issue169'], { workItemId: 'work.169', reasonCode: 'LIVE_STATE_DIVERGENCE', requiredClearingEvidence: 'fresh complete preflight' }),
    node('evidence.a-blocked', 'Evidence', 'complete', ['issue169']),
    node('attempt.b', 'Attempt', 'retained', ['issue169', 'candidateB'], { workItemId: 'work.169', headSha: B, session: 'github-native-control-plane-001-opus-relaunch-1' }),
    node('dispatch.b', 'Dispatch', 'complete', ['issue169'], { workItemId: 'work.169', preconditionFingerprint: 'clean-checkout:exact-refs', evidenceRef: 'evidence.b-tests' }),
    node('worker.b', 'Worker', 'complete', ['issue169']),
    node('branch.b', 'Branch', 'retained', ['pr172'], { workItemId: 'work.169', headSha: B, branch: 'agent/github-native-control-plane-001-canonical-b' }),
    node('pr.172', 'PullRequest', 'merged', ['pr172'], { workItemId: 'work.169', headSha: B, prNumber: 172 }),
    node('evidence.b-tests', 'Evidence', 'complete', ['issue171']),
    node('review.initial', 'Review', 'invalid', ['issue171'], { workItemId: 'work.169', reviewedHeadSha: A, currentHeadSha: B, reasonCode: 'INCOMPLETE_AUTHORITATIVE_EVIDENCE' }),
    node('dispatch.review.no-checkout', 'Dispatch', 'not-runnable', ['issue171'], { workItemId: 'work.169', preconditionFingerprint: 'no-executable-checkout', evidenceRef: 'evidence.no-checkout', reasonCode: 'INCOMPLETE_AUTHORITATIVE_EVIDENCE' }),
    node('refusal.review.repeat', 'Refusal', 'complete', ['issue171'], { workItemId: 'work.169', reasonCode: 'NOT_RUNNABLE_REPEATED_PRECONDITION', details: 'Identical execution preconditions were refused until authoritative checkout evidence changed.' }),
    node('evidence.no-checkout', 'Evidence', 'complete', ['issue171']),
    node('evidence.checkout-recovery', 'Evidence', 'complete', ['issue171']),
    node('dispatch.review.rerun1', 'Dispatch', 'complete', ['issue171'], { workItemId: 'work.169', preconditionFingerprint: 'authenticated-clean-checkout', evidenceRef: 'evidence.checkout-recovery' }),
    node('review.rerun1.b', 'Review', 'retained', ['issue171'], { workItemId: 'work.169', reviewedHeadSha: B, currentHeadSha: B, details: 'RERUN 1 passed all required independent gates and retained Candidate B.' }),
    node('decision.retain-b', 'OwnerDecision', 'complete', ['issue171', 'pr172'], { workItemId: 'work.169', headSha: B, canonicalDisposition: 'retain', details: 'Candidate B selected as sole integration candidate after the non-author exact-head disposition.' }),
    node('decision.audit-a', 'OwnerDecision', 'complete', ['issue171', 'pr170'], { workItemId: 'work.169', headSha: A, canonicalDisposition: 'audit-only', details: 'Candidate A remains preserved as audit evidence and is not canonical.' }),
    node('correction.initial-review', 'Correction', 'complete', ['issue171'], { details: 'RERUN 1 replaced the environment-blocked verdict with executed exact-head evidence.' }),
    node('retraction.a-result', 'Retraction', 'complete', ['issue169'], { details: 'The first author RESULT was superseded by its terminal live-state-divergence record.' }),
    node('merge.172', 'Merge', 'merged', ['pr172', 'merge'], { headSha: MERGE, details: 'Owner merged PR #172.' }),
    node('deployment.preview-b', 'Deployment', 'deployed', ['pr172'], { headSha: B, details: 'Canonical preview status succeeded; this is engineering evidence only.' }),
    node('evidence.merge', 'Evidence', 'complete', ['merge']),
    node('work.graph', 'WorkItem', 'active', ['issue169'], { runnable: true }),
  ];

  const edges = [
    edge('e01', 'contains', 'objective.control-plane', 'work.169'),
    edge('e02', 'attempts', 'attempt.a', 'work.169'), edge('e03', 'produced', 'attempt.a', 'dispatch.a'),
    edge('e04', 'dispatched_to', 'dispatch.a', 'worker.a'), edge('e05', 'uses_branch', 'attempt.a', 'branch.a'),
    edge('e06', 'opened_as', 'branch.a', 'pr.170', ['pr170']), edge('e07', 'blocks', 'blocker.a-preflight', 'work.169'),
    edge('e08', 'evidenced_by', 'dispatch.a', 'evidence.a-blocked'),
    edge('e09', 'attempts', 'attempt.b', 'work.169'), edge('e10', 'produced', 'attempt.b', 'dispatch.b'),
    edge('e11', 'dispatched_to', 'dispatch.b', 'worker.b'), edge('e12', 'uses_branch', 'attempt.b', 'branch.b'),
    edge('e13', 'opened_as', 'branch.b', 'pr.172', ['pr172']), edge('e14', 'evidenced_by', 'dispatch.b', 'evidence.b-tests'),
    edge('e15', 'supersedes', 'attempt.b', 'attempt.a', ['issue171']),
    edge('e16', 'reviews_exact_head', 'review.initial', 'pr.170', ['issue171']),
    edge('e17', 'evidenced_by', 'dispatch.review.no-checkout', 'evidence.no-checkout', ['issue171']),
    edge('e18', 'supersedes', 'dispatch.review.rerun1', 'dispatch.review.no-checkout', ['issue171']),
    edge('e19', 'evidenced_by', 'dispatch.review.rerun1', 'evidence.checkout-recovery', ['issue171']),
    edge('e20', 'reviews_exact_head', 'review.rerun1.b', 'pr.172', ['issue171']),
    edge('e21', 'decides', 'decision.retain-b', 'attempt.b', ['issue171']),
    edge('e22', 'decides', 'decision.audit-a', 'attempt.a', ['issue171']),
    edge('e23', 'corrects', 'correction.initial-review', 'review.initial', ['issue171']),
    edge('e24', 'resolves', 'correction.initial-review', 'blocker.a-preflight', ['issue171']),
    edge('e25', 'retracts', 'retraction.a-result', 'evidence.a-blocked', ['issue169']),
    edge('e26', 'merged_as', 'pr.172', 'merge.172', ['pr172', 'merge']),
    edge('e27', 'deployed_as', 'pr.172', 'deployment.preview-b', ['pr172']),
    edge('e28', 'evidenced_by', 'merge.172', 'evidence.merge', ['merge']),
    edge('e29', 'depends_on', 'work.graph', 'work.169', ['issue169']),
  ];

  return { schemaVersion: 'graph-source-truth/v1', watermark: { observedAt: '2026-08-11T07:04:26.000Z', sequence: 173 }, sources, nodes, edges };
}

function expectCode(code, mutate) {
  const input = fixture();
  mutate(input);
  assert.throws(() => buildGraph(input), (error) => error instanceof GraphError && error.code === code);
}

test('complete #169/#171/#170/#172 lineage selects only reviewed Candidate B', () => {
  const graph = JSON.parse(buildGraph(fixture()));
  assert.equal(graph.derived.canonicalHeads['work.169'], B);
  assert.deepEqual(graph.derived.invalidReviews, ['review.initial']);
  assert.deepEqual(graph.derived.unresolvedBlockers, []);
  assert.deepEqual(graph.derived.runnableWork, ['work.graph']);
  assert.equal(graph.nodes.find((item) => item.id === 'attempt.a').status, 'audit-only');
  assert.equal(graph.nodes.find((item) => item.id === 'attempt.b').status, 'retained');
  assert.equal(graph.nodes.find((item) => item.id === 'merge.172').details, 'Owner merged PR #172.');
});

test('identical input rebuild is byte-identical regardless of array order', () => {
  const first = fixture();
  const second = fixture();
  second.nodes.reverse(); second.edges.reverse(); second.sources.reverse();
  assert.equal(buildGraph(first), buildGraph(second));
});

test('delete-and-rebuild through the CLI reproduces identical bytes', async (context) => {
  const directory = await mkdtemp(join(tmpdir(), 'graph-memory-'));
  try {
    const inputPath = join(directory, 'input.json');
    const outputPath = join(directory, 'graph.json');
    await writeFile(inputPath, JSON.stringify(fixture()));
    const builderPath = fileURLToPath(new URL('./build-graph.mjs', import.meta.url));
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
    context.diagnostic?.(`double-build sha256 ${firstChecksum} == ${secondChecksum}`);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('split-brain reports two retained branches for one WorkItem', () => {
  const input = fixture();
  input.nodes.find((item) => item.id === 'branch.a').status = 'retained';
  const graph = JSON.parse(buildGraph(input));
  assert.match(graph.derived.splitBrain.join('\n'), /work\.169:Branch/);
});

test('canonical selection fails without an explicit retained exact-head review', () => {
  expectCode(REASON.CONFLICTING_CANONICAL_HEADS, (input) => { input.nodes.find((item) => item.id === 'review.rerun1.b').status = 'invalid'; });
});

test('two explicit retained heads fail closed', () => {
  expectCode(REASON.CONFLICTING_CANONICAL_HEADS, (input) => {
    input.nodes.find((item) => item.id === 'review.initial').status = 'retained';
    input.nodes.find((item) => item.id === 'review.initial').currentHeadSha = A;
    input.nodes.find((item) => item.id === 'decision.audit-a').canonicalDisposition = 'retain';
  });
});

test('review becomes invalid after current head changes', () => {
  const graph = JSON.parse(buildGraph(fixture()));
  assert.deepEqual(graph.derived.invalidReviews, ['review.initial']);
});

test('identical failed-path redispatch is rejected with stable code', () => {
  expectCode(REASON.NOT_RUNNABLE_REPEATED_PRECONDITION, (input) => {
    input.nodes.push(node('dispatch.review.repeat', 'Dispatch', 'not-runnable', ['issue171'], { workItemId: 'work.169', preconditionFingerprint: 'no-executable-checkout', evidenceRef: 'evidence.no-checkout' }));
  });
});

test('changed authoritative evidence permits recovery from failed path', () => {
  const input = fixture();
  input.nodes.push(node('dispatch.review.recovered', 'Dispatch', 'complete', ['issue171'], { workItemId: 'work.169', preconditionFingerprint: 'authenticated-clean-checkout', evidenceRef: 'evidence.checkout-recovery' }));
  assert.doesNotThrow(() => buildGraph(input));
});

test('correction and retraction remain first-class history', () => {
  const graph = JSON.parse(buildGraph(fixture()));
  assert.equal(graph.nodes.some((item) => item.type === 'Correction'), true);
  assert.equal(graph.nodes.some((item) => item.type === 'Retraction'), true);
  assert.equal(graph.edges.some((item) => item.type === 'corrects'), true);
  assert.equal(graph.edges.some((item) => item.type === 'retracts'), true);
});

test('watermark regression fails closed', () => {
  expectCode(REASON.WATERMARK_REGRESSION, (input) => { input.previousWatermark = { observedAt: '2026-08-11T08:00:00.000Z', sequence: 174 }; });
});

test('missing provenance fails closed', () => {
  expectCode(REASON.MISSING_PROVENANCE, (input) => { input.nodes[0].sourceRefs = []; });
});

test('dangling edge fails closed', () => {
  expectCode(REASON.DANGLING_REFERENCE, (input) => { input.edges[0].to = 'missing.node'; });
});

test('unknown node field fails closed', () => {
  expectCode(REASON.UNKNOWN_FIELD, (input) => { input.nodes[0].approval = true; });
});

test('inference presented as fact fails closed', () => {
  expectCode(REASON.INFERENCE_AS_FACT, (input) => { input.nodes[0].details = 'Probably accepted'; });
});

test('named missing GitHub data remains an explicit gap', () => {
  const input = fixture();
  input.sources[0].complete = false;
  input.sources[0].namedGaps.push('deployment production binding unavailable');
  const graph = JSON.parse(buildGraph(input));
  assert.deepEqual(graph.derived.namedGaps, ['issue169:deployment production binding unavailable']);
});

test('projection exposes no authority-bearing or worker-launch output', () => {
  const output = buildGraph(fixture());
  for (const forbidden of ['"approved"', '"accepted"', '"launchWorker"', '"dispatchWorker"', '"mergeAuthorized"']) assert.equal(output.includes(forbidden), false);
});

if (process.env.VITEST) {
  const { describe, test: vitestTest } = await import('vitest');
  describe('deterministic engineering graph memory', () => {
    for (const item of CASES) vitestTest(item.name, item.fn);
  });
} else {
  const { test: nodeTest } = await import('node:test');
  for (const item of CASES) nodeTest(item.name, item.fn);
}
