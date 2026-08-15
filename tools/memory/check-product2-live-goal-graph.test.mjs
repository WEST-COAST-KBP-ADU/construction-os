import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

import {
  REFUSAL,
  VENDORED_CONTRACT,
  FROZEN_PRODUCT_1_RELATION,
  activePath,
  contractDigest,
  extractNorthStarStatement,
  renderPath,
  renderTerminalState,
  validate,
} from './check-product2-live-goal-graph.mjs';

const CASES = [];
const test = (name, fn) => CASES.push({ name, fn });

const ROOT = new URL('../../', import.meta.url);
const MANIFEST_PATH = 'governance/product/PRODUCT2-LIVE-GOAL-GRAPH-v1.json';
const CANON_PATH = 'governance/product/PRODUCT-BOUNDARIES-v1.0.md';

const read = (path) => readFile(new URL(path, ROOT), 'utf8');

const rawSchema = await read(VENDORED_CONTRACT.path);
const SCHEMA = JSON.parse(rawSchema);
const RAW_MANIFEST = await read(MANIFEST_PATH);
const NORTH_STAR_STATEMENT = extractNorthStarStatement(await read(CANON_PATH));

const WORK = 'work.product2-live-4x4-graph-and-director-0001';
const NEXT_WORK = 'work.product2-goal-graph-reconciliation-0002';
const NORTH_STAR = 'goal.product-2.north-star';
const PLATFORM = 'goal.product-2.ai-native-operating-platform';
const ALIGNMENT_EVIDENCE = 'evidence.product-2-alignment-adopted-at-merge';

const manifest = () => JSON.parse(RAW_MANIFEST);
const node = (input, id) => input.nodes.find((candidate) => candidate.id === id);
const edge = (input, id) => input.edges.find((candidate) => candidate.id === id);
const dropEdge = (input, id) => { input.edges = input.edges.filter((candidate) => candidate.id !== id); };

const report = (input, options = {}) => validate(input, { schema: SCHEMA, northStarStatement: NORTH_STAR_STATEMENT, ...options });

/** Mutate a copy of the live manifest and require the named refusal. */
function refuses(code, mutate, options) {
  const input = manifest();
  mutate(input);
  const result = report(input, options);
  assert.equal(result.ok(), false, `the mutation was accepted; expected ${code}`);
  assert.equal(
    result.codes().includes(code),
    true,
    `expected ${code}, got ${JSON.stringify(result.codes())}`,
  );
  return result;
}

// ------------------------------------------------------------------ positive

test('the committed Product 2 goal graph validates against the vendored contract with zero refusals', () => {
  const result = report(manifest());
  assert.deepEqual(result.errors, []);
  assert.equal(result.ok(), true);
  // Nineteen in-manifest check groups. The synthetic-data-class group is a
  // no-op on live data, exactly as in the adopted validator; the CLI adds two
  // preflight groups (vendored-contract digest, canon A1 extraction) on top.
  assert.equal(result.checks, 19);
});

test('the vendored contract is byte-identical to the pinned accepted source', () => {
  const digest = `sha256:${createHash('sha256').update(rawSchema, 'utf8').digest('hex')}`;
  assert.equal(digest, VENDORED_CONTRACT.sourceDigest);
  assert.equal(VENDORED_CONTRACT.sourceRepository, 'kbp-core-engineering/kbp-dev-office');
  assert.equal(VENDORED_CONTRACT.sourceRevision, '3f97384db04d7644ed65b30d005a03863adcb024');
  // Provenance lives outside the vendored bytes, so the bytes may not carry it.
  assert.equal(rawSchema.includes(VENDORED_CONTRACT.sourceRevision), false);
  assert.equal(rawSchema.includes('construction-os'), false);
});

test('the NORTH_STAR is the adopted canon’s own section A1 statement, not a paraphrase', () => {
  assert.equal(NORTH_STAR_STATEMENT.length > 0, true);
  assert.equal(node(manifest(), NORTH_STAR).statement_verbatim, NORTH_STAR_STATEMENT);
});

test('the NORTH_STAR is not reduced to a funnel, a website, a CRM or an agent', () => {
  const northStar = node(manifest(), NORTH_STAR);
  const stated = `${northStar.title} ${northStar.statement_verbatim} ${northStar.irreducibility}`;
  for (const subject of ['West Coast KBP', 'ADU', 'general-construction', 'KBP OS']) {
    assert.equal(stated.includes(subject), true, `the north star does not name ${subject}`);
  }
  for (const reduction of ['lead generation', 'inquiry transport', 'CRM', 'generic AI agent']) {
    assert.equal(northStar.irreducibility.includes(reduction), true, `the north star does not refuse the reduction to ${reduction}`);
  }
});

test('a complete printable path runs from the active packet to the NORTH_STAR', () => {
  const input = manifest();
  const path = activePath(input, input.next_executable_work_node).map((step) => step.id);
  assert.deepEqual(path, [WORK, PLATFORM, NORTH_STAR]);
  const printed = renderPath(input, input.next_executable_work_node);
  assert.equal(printed.includes(`[WORK_NODE] ${WORK}`), true);
  assert.equal(printed.includes(`[OUTCOME] ${PLATFORM}`), true);
  assert.equal(printed.includes(`[NORTH_STAR] ${NORTH_STAR}`), true);
  assert.equal(printed.includes('scope: module.product-2-graph-control-plane'), true);
});

test('the printed terminal state marks no node running and leaves the join unsatisfied', () => {
  const input = manifest();
  const printed = renderTerminalState(input);
  assert.equal(printed.includes(`${WORK} -> PENDING`), true);
  assert.equal(printed.includes(`${NEXT_WORK} -> PENDING`), true);
  assert.equal(printed.includes('UNSATISFIED'), true);
  for (const work of input.nodes.filter((candidate) => candidate.type === 'WORK_NODE')) {
    assert.equal(work.execution.running, false);
    assert.equal(work.execution.started_event, null);
  }
});

test('the digest is stable and order-independent', () => {
  const input = manifest();
  const reordered = manifest();
  reordered.nodes.reverse();
  reordered.edges.reverse();
  assert.equal(contractDigest(reordered), contractDigest(input));
  const changed = manifest();
  node(changed, WORK).title = 'a different bounded outcome';
  assert.notEqual(contractDigest(changed), contractDigest(input));
});

test('this packet mints no evidence node for artefacts that do not exist yet', () => {
  const input = manifest();
  const work = node(input, WORK);
  assert.equal(work.evidence_expectation.state, 'EXPECTED_NOT_YET_EXISTING');
  assert.equal(work.terminal_result.state, 'PENDING');
  assert.equal(work.terminal_result.evidence, null);
  for (const evidence of input.nodes.filter((candidate) => candidate.type === 'EVIDENCE')) {
    assert.match(evidence.source.revision, /^[0-9a-f]{40}$/);
    assert.match(evidence.source.digest, /^sha256:[0-9a-f]{64}$/);
    assert.equal(evidence.immutable, true);
  }
});

// ------------------------------------------------ required negative coverage

test('an unknown node type is refused', () => {
  refuses(REFUSAL.UNKNOWN_NODE_TYPE, (input) => { node(input, WORK).type = 'TASK'; });
  refuses(REFUSAL.UNKNOWN_NODE_TYPE, (input) => { node(input, PLATFORM).subtype = 'MILESTONE'; });
  refuses(REFUSAL.VOCABULARY_NOT_CLOSED, (input) => { input.node_types.push('TASK'); });
});

test('an unknown edge type is refused', () => {
  refuses(REFUSAL.UNKNOWN_EDGE_TYPE, (input) => { edge(input, 'edge.advances.module-to-platform').type = 'RELATES_TO'; });
  refuses(REFUSAL.VOCABULARY_NOT_CLOSED, (input) => { input.edge_types.push('RELATES_TO'); });
});

test('an orphan WORK_NODE is refused', () => {
  refuses(REFUSAL.MISSING_PARENT_SCOPE, (input) => { delete node(input, WORK).parent; });
  refuses(REFUSAL.UNKNOWN_PARENT, (input) => { node(input, WORK).parent = 'module.that-does-not-exist'; });
  // A Work Node held by a GOAL rather than a module is orphaned from execution.
  refuses(REFUSAL.UNKNOWN_PARENT, (input) => { node(input, WORK).parent = PLATFORM; });
});

test('an ADVANCES target that is not a live GOAL is refused', () => {
  refuses(REFUSAL.ADVANCES_ENDPOINT_TYPE, (input) => { edge(input, 'edge.advances.graph-and-director-to-platform').to = 'module.product-2-graph-control-plane'; });
  refuses(REFUSAL.ADVANCES_ENDPOINT_TYPE, (input) => { node(input, PLATFORM).lifecycle = 'retired'; });
  refuses(REFUSAL.DANGLING_EDGE_ENDPOINT, (input) => { edge(input, 'edge.advances.graph-and-director-to-platform').to = 'goal.that-does-not-exist'; });
});

test('an unmet DEPENDS_ON edge presented as executable is refused', () => {
  const result = refuses(REFUSAL.P2_UNMET_DEPENDENCY_PRESENTED_EXECUTABLE, (input) => { input.next_executable_work_node = NEXT_WORK; });
  assert.equal(result.errors.some((error) => error.includes(WORK)), true);
  // The same node becomes executable only once its gate carries an accepted terminal result.
  const cleared = manifest();
  cleared.next_executable_work_node = NEXT_WORK;
  node(cleared, WORK).terminal_result = { state: 'ACCEPTED', evidence: ALIGNMENT_EVIDENCE };
  assert.equal(report(cleared).codes().includes(REFUSAL.P2_UNMET_DEPENDENCY_PRESENTED_EXECUTABLE), false);
});

test('a dependency declared in one place only is refused', () => {
  refuses(REFUSAL.DEPENDENCY_DECLARATION_MISMATCH, (input) => { dropEdge(input, 'edge.depends-on.reconciliation-needs-graph'); });
  refuses(REFUSAL.DEPENDENCY_DECLARATION_MISMATCH, (input) => { node(input, NEXT_WORK).dependencies = []; });
});

test('duplicate terminal evidence is refused', () => {
  refuses(REFUSAL.DUPLICATE_TERMINAL_EVIDENCE, (input) => {
    for (const id of [WORK, NEXT_WORK]) node(input, id).terminal_result = { state: 'ACCEPTED', evidence: ALIGNMENT_EVIDENCE };
  });
  // The same bytes minted twice would let one artefact prove two different things.
  refuses(REFUSAL.DUPLICATE_TERMINAL_EVIDENCE, (input) => {
    const original = node(input, ALIGNMENT_EVIDENCE);
    input.nodes.push({ ...original, id: 'evidence.product-2-alignment-adopted-at-merge-copy' });
  });
});

test('a missing path to the NORTH_STAR is refused', () => {
  const result = refuses(REFUSAL.NORTH_STAR_PATH_NOT_UNIQUE, (input) => { dropEdge(input, 'edge.advances.graph-and-director-to-platform'); });
  assert.equal(result.errors.some((error) => error.includes('reaches 0 NORTH_STAR(s)')), true);
  // Two north stars are as unusable as none: the path stops being deterministic.
  refuses(REFUSAL.NORTH_STAR_PATH_NOT_UNIQUE, (input) => {
    input.nodes.push({ ...node(input, NORTH_STAR), id: 'goal.product-2.second-north-star' });
    input.edges.push({ id: 'edge.advances.platform-to-second-north-star', type: 'ADVANCES', from: PLATFORM, to: 'goal.product-2.second-north-star', claim: 'a second intended state' });
  });
  assert.deepEqual(activePath(manifest(), 'work.that-does-not-exist'), []);
});

test('Product 1 / Product 2 authority or memory conflation is refused', () => {
  // Shared Graph Memory across contours.
  refuses(REFUSAL.P2_CONTOUR_CONFLATION, (input) => { input.product_1_relation.shares_graph_memory = true; });
  // Shared authority across contours.
  refuses(REFUSAL.P2_CONTOUR_CONFLATION, (input) => { input.product_1_relation.shares_authority = true; });
  // The stale `first client` reduction of the frozen relation.
  refuses(REFUSAL.P2_CONTOUR_CONFLATION, (input) => { input.product_1_relation.relation = 'West Coast KBP — first client'; });
  // Foreign-contour bytes entering Product 2 Graph Memory.
  refuses(REFUSAL.P2_CONTOUR_CONFLATION, (input) => { node(input, ALIGNMENT_EVIDENCE).source.repository = 'kbp-core-engineering/kbp-dev-office'; });
  // A Product 1 record taking up residence in the Product 2 graph.
  refuses(REFUSAL.P2_CONTOUR_CONFLATION, (input) => {
    input.owner_decisions.push({
      id: 'decision.product-1-release-gate',
      plane: 'AUTHORITY_PLANE',
      decided_by: 'avoroncov971-maker',
      decided_at: '2026-08-15',
      record: 'docs/coordination/product/PRODUCT-BOUNDARIES-v1.0.md',
      subject: 'a Product 1 decision carried in the Product 2 graph',
    });
  });
  // Authority attributed to anyone but the Owner.
  refuses(REFUSAL.AUTHORITY_NOT_OWNER, (input) => { input.owner_decisions[0].decided_by = 'Worker-321'; });
  assert.equal(manifest().product_1_relation.relation, FROZEN_PRODUCT_1_RELATION);
});

// ------------------------------------------------- further fail-closed cover

test('a node marked running without a persisted STARTED event is refused', () => {
  refuses(REFUSAL.P2_RUNNING_WITHOUT_STARTED_EVENT, (input) => { node(input, WORK).execution.running = true; });
  const started = manifest();
  node(started, WORK).execution.running = true;
  node(started, WORK).execution.started_event = 'event.started.worker-321';
  assert.equal(report(started).codes().includes(REFUSAL.P2_RUNNING_WITHOUT_STARTED_EVENT), false);
});

test('a join that is satisfied while a required branch is unfinished is refused', () => {
  refuses(REFUSAL.JOIN_SATISFIED_WITHOUT_TERMINAL_BRANCH, (input) => { node(input, 'module.product-2-graph-control-plane').join.satisfied = true; });
  refuses(REFUSAL.JOIN_POLICY_NOT_FAIL_CLOSED, (input) => { node(input, 'module.product-2-graph-control-plane').join.policy = 'any_sufficient'; });
  refuses(REFUSAL.JOIN_NOT_DECLARED_BEFORE_FANOUT, (input) => { node(input, 'module.product-2-graph-control-plane').join.declared_before_fanout = false; });
  refuses(REFUSAL.JOIN_BRANCH_SET_INCOMPLETE, (input) => { node(input, 'module.product-2-graph-control-plane').join.expected_branches = [WORK]; });
});

test('evidence without an exact source, or that may change, is refused', () => {
  refuses(REFUSAL.EVIDENCE_WITHOUT_EXACT_SOURCE, (input) => { node(input, ALIGNMENT_EVIDENCE).source.revision = 'af6b1f3'; });
  refuses(REFUSAL.EVIDENCE_WITHOUT_EXACT_SOURCE, (input) => { node(input, ALIGNMENT_EVIDENCE).source.digest = 'sha256:unknown'; });
  refuses(REFUSAL.EVIDENCE_MUTABLE, (input) => { node(input, ALIGNMENT_EVIDENCE).immutable = false; });
  refuses(REFUSAL.PROVES_WITHOUT_CLAIM, (input) => { delete edge(input, 'edge.proves.north-star-provenance').claim; });
});

test('a NORTH_STAR that drifts from the adopted canon is refused', () => {
  refuses(REFUSAL.P2_NORTH_STAR_DRIFT, (input) => { node(input, NORTH_STAR).statement_verbatim = 'West Coast KBP runs a lead funnel on KBP OS.'; });
  refuses(REFUSAL.P2_NORTH_STAR_DRIFT, (input) => { delete node(input, NORTH_STAR).irreducibility; });
  refuses(REFUSAL.P2_NORTH_STAR_AVAILABILITY_CLAIM, (input) => { node(input, NORTH_STAR).boundary_status = 'TODAY'; });
  refuses(REFUSAL.P2_NORTH_STAR_CARDINALITY, (input) => { node(input, NORTH_STAR).subtype = 'OUTCOME'; });
});

test('a graph that goes silent about status, gaps or surface separation is refused', () => {
  refuses(REFUSAL.P2_BOUNDARY_CLASSIFICATION, (input) => { input.boundary_classification.NOT_OPENED = []; });
  refuses(REFUSAL.P2_BOUNDARY_CLASSIFICATION, (input) => { input.boundary_classification.SHIPPED = ['a fourth status']; });
  refuses(REFUSAL.P2_BOUNDARY_CLASSIFICATION, (input) => { delete node(input, WORK).boundary_status; });
  refuses(REFUSAL.P2_NOT_EXECUTABLE, (input) => { node(input, WORK).boundary_status = 'NOT_OPENED'; });
  refuses(REFUSAL.P2_GAPS_NOT_NAMED, (input) => { input.not_implemented_at_this_stage = []; });
  refuses(REFUSAL.P2_GRAPH_SURFACES_NOT_SEPARATED, (input) => { delete input.graph_surfaces.separation; });
  refuses(REFUSAL.P2_GRAPH_SURFACES_NOT_SEPARATED, (input) => { input.graph_surfaces.derived_engineering_graph.committed = true; });
});

test('a manifest that abandons the closed vocabulary or the schema is refused', () => {
  refuses(REFUSAL.VOCABULARY_NOT_CLOSED, (input) => { input.contract_version = 'goal-contract/v2.0'; });
  refuses(REFUSAL.SCHEMA_REQUIRED_KEY_MISSING, (input) => { delete input.owner_decisions; });
  refuses(REFUSAL.PLANE_VIOLATION, (input) => { node(input, WORK).plane = 'GOAL_PLANE'; });
  refuses(REFUSAL.DUPLICATE_ID, (input) => { input.nodes.push({ ...node(input, NEXT_WORK) }); });
  assert.equal(validate(manifest(), {}).codes().includes(REFUSAL.SCHEMA_REQUIRED_KEY_MISSING), true);
  assert.equal(validate('not an object', { schema: SCHEMA }).ok(), false);
});

test('the checker refuses an authoritative state write with no admission or no evidence', () => {
  refuses(REFUSAL.STATE_UPDATE_WITHOUT_ADMISSION, (input) => { input.state_updates[0].admitted_action = 'action.that-does-not-exist'; });
  refuses(REFUSAL.STATE_UPDATE_WITHOUT_EVIDENCE, (input) => { input.state_updates[0].evidence = []; });
  refuses(REFUSAL.ADMISSION_WITHOUT_EVIDENCE, (input) => { input.admitted_actions[0].evidence = 'evidence.that-does-not-exist'; });
  refuses(REFUSAL.ADMISSION_WITHOUT_OWNER_DECISION, (input) => { input.admitted_actions[0].owner_decision = 'decision.that-does-not-exist'; });
});

test('an external runtime named in an authority role is refused', () => {
  refuses(REFUSAL.EXTERNAL_RUNTIME_IN_AUTHORITY_ROLE, (input) => {
    input.external_runtimes.push({ name: 'some-model-runtime', role: 'authorizer', inside_trust_boundary: false, replaceable: true, note: 'claims authority' });
  });
  refuses(REFUSAL.EXTERNAL_RUNTIME_IN_AUTHORITY_ROLE, (input) => {
    input.external_runtimes.push({ name: 'some-model-runtime', role: 'executor', inside_trust_boundary: true, replaceable: true, note: 'claims to be inside the trust boundary' });
  });
});

if (process.env.VITEST) {
  const { describe, test: vitestTest } = await import('vitest');
  describe('persistent Product 2 goal graph', () => {
    for (const item of CASES) vitestTest(item.name, item.fn);
  });
} else {
  const { test: nodeTest } = await import('node:test');
  for (const item of CASES) nodeTest(item.name, item.fn);
}
