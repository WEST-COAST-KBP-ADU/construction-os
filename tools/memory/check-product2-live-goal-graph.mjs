#!/usr/bin/env node

/**
 * Fail-closed checker for the persistent Product 2 goal graph.
 *
 * The contract is NOT designed here. It is the Owner-adopted minimal 4x4 goal
 * contract, vendored byte-identically at
 * `governance/product/VENDORED-MINIMAL-GOAL-CONTRACT-v1.schema.json` from:
 *
 *   repository : kbp-core-engineering/kbp-dev-office
 *   path       : docs/coordination/graph/minimal-goal-contract/manifest.schema.json
 *   revision   : 3f97384db04d7644ed65b30d005a03863adcb024
 *   blob sha1  : 27c95ad64314dfa2fe44421cc0159392ca0560a1
 *   sha256     : c27f84bdeb2677778cbaa07a373c61a34bb51664ffc2bcb2d9fdaf22dca9b6dd
 *
 * The vendored file carries no provenance in its own bytes, because bytes that
 * carried it would no longer be identical. Provenance lives here and in the
 * manifest's `vendored_contract` block — never in `governance/memory/`, whose
 * own audit forbids a hard-coded exact SHA — and this checker refuses a
 * vendored file whose digest has drifted from the pinned one.
 *
 * The refusal vocabulary of the adopted validator
 * (`tools/graph_foundation/goal_contract.py` at the same revision) is mirrored,
 * not redesigned. Codes prefixed `P2_` are the Product 2 bindings this
 * repository adds on top of the adopted contract; they constrain this manifest
 * further and never widen the contract.
 */

import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

export const REFUSAL = Object.freeze({
  SCHEMA_REQUIRED_KEY_MISSING: 'SCHEMA_REQUIRED_KEY_MISSING',
  SCHEMA_DRIFT: 'SCHEMA_DRIFT',
  VOCABULARY_NOT_CLOSED: 'VOCABULARY_NOT_CLOSED',
  UNKNOWN_NODE_TYPE: 'UNKNOWN_NODE_TYPE',
  UNKNOWN_EDGE_TYPE: 'UNKNOWN_EDGE_TYPE',
  DUPLICATE_ID: 'DUPLICATE_ID',
  PLANE_VIOLATION: 'PLANE_VIOLATION',
  MISSING_PARENT_SCOPE: 'MISSING_PARENT_SCOPE',
  UNKNOWN_PARENT: 'UNKNOWN_PARENT',
  DANGLING_EDGE_ENDPOINT: 'DANGLING_EDGE_ENDPOINT',
  ADVANCES_ENDPOINT_TYPE: 'ADVANCES_ENDPOINT_TYPE',
  ADVANCES_CYCLE: 'ADVANCES_CYCLE',
  NORTH_STAR_PATH_NOT_UNIQUE: 'NORTH_STAR_PATH_NOT_UNIQUE',
  WORK_NODE_INCOMPLETE: 'WORK_NODE_INCOMPLETE',
  WORK_NODE_UNTYPED_PORT: 'WORK_NODE_UNTYPED_PORT',
  UNKNOWN_JOIN_DESTINATION: 'UNKNOWN_JOIN_DESTINATION',
  DEPENDS_ON_ENDPOINT_TYPE: 'DEPENDS_ON_ENDPOINT_TYPE',
  DEPENDS_ON_CYCLE: 'DEPENDS_ON_CYCLE',
  DEPENDENCY_DECLARATION_MISMATCH: 'DEPENDENCY_DECLARATION_MISMATCH',
  JOIN_NOT_DECLARED_BEFORE_FANOUT: 'JOIN_NOT_DECLARED_BEFORE_FANOUT',
  JOIN_POLICY_NOT_FAIL_CLOSED: 'JOIN_POLICY_NOT_FAIL_CLOSED',
  JOIN_BRANCH_SET_INCOMPLETE: 'JOIN_BRANCH_SET_INCOMPLETE',
  JOIN_SATISFIED_WITHOUT_TERMINAL_BRANCH: 'JOIN_SATISFIED_WITHOUT_TERMINAL_BRANCH',
  SUPERSESSION_INCOMPLETE: 'SUPERSESSION_INCOMPLETE',
  SUPERSESSION_STATE_MISMATCH: 'SUPERSESSION_STATE_MISMATCH',
  EVIDENCE_WITHOUT_EXACT_SOURCE: 'EVIDENCE_WITHOUT_EXACT_SOURCE',
  EVIDENCE_MUTABLE: 'EVIDENCE_MUTABLE',
  PROVES_ENDPOINT_TYPE: 'PROVES_ENDPOINT_TYPE',
  PROVES_WITHOUT_CLAIM: 'PROVES_WITHOUT_CLAIM',
  DUPLICATE_TERMINAL_EVIDENCE: 'DUPLICATE_TERMINAL_EVIDENCE',
  AUTHORITY_NOT_OWNER: 'AUTHORITY_NOT_OWNER',
  ADMISSION_WITHOUT_OWNER_DECISION: 'ADMISSION_WITHOUT_OWNER_DECISION',
  ADMISSION_WITHOUT_EVIDENCE: 'ADMISSION_WITHOUT_EVIDENCE',
  STATE_UPDATE_WITHOUT_ADMISSION: 'STATE_UPDATE_WITHOUT_ADMISSION',
  STATE_UPDATE_WITHOUT_EVIDENCE: 'STATE_UPDATE_WITHOUT_EVIDENCE',
  EXTERNAL_RUNTIME_IN_AUTHORITY_ROLE: 'EXTERNAL_RUNTIME_IN_AUTHORITY_ROLE',
  LIVE_NORTH_STAR_ADOPTED: 'LIVE_NORTH_STAR_ADOPTED',
  P2_NORTH_STAR_CARDINALITY: 'P2_NORTH_STAR_CARDINALITY',
  P2_NORTH_STAR_DRIFT: 'P2_NORTH_STAR_DRIFT',
  P2_NORTH_STAR_AVAILABILITY_CLAIM: 'P2_NORTH_STAR_AVAILABILITY_CLAIM',
  P2_BOUNDARY_CLASSIFICATION: 'P2_BOUNDARY_CLASSIFICATION',
  P2_CONTOUR_CONFLATION: 'P2_CONTOUR_CONFLATION',
  P2_UNMET_DEPENDENCY_PRESENTED_EXECUTABLE: 'P2_UNMET_DEPENDENCY_PRESENTED_EXECUTABLE',
  P2_NOT_EXECUTABLE: 'P2_NOT_EXECUTABLE',
  P2_RUNNING_WITHOUT_STARTED_EVENT: 'P2_RUNNING_WITHOUT_STARTED_EVENT',
  P2_GAPS_NOT_NAMED: 'P2_GAPS_NOT_NAMED',
  P2_GRAPH_SURFACES_NOT_SEPARATED: 'P2_GRAPH_SURFACES_NOT_SEPARATED',
  P2_VENDORED_CONTRACT_DRIFT: 'P2_VENDORED_CONTRACT_DRIFT',
  MANIFEST_UNREADABLE: 'MANIFEST_UNREADABLE',
});

export const CONTRACT_VERSION = 'goal-contract/v1.0';
export const PLANES = ['AUTHORITY_PLANE', 'EVIDENCE_STATE_PLANE', 'EXECUTION_PLANE', 'GOAL_PLANE'];
export const NODE_TYPES = ['EVIDENCE', 'GOAL', 'MODULE_SUBGRAPH', 'WORK_NODE'];
export const EDGE_TYPES = ['ADVANCES', 'DEPENDS_ON', 'PROVES', 'SUPERSEDES'];

export const VENDORED_CONTRACT = Object.freeze({
  path: 'governance/product/VENDORED-MINIMAL-GOAL-CONTRACT-v1.schema.json',
  sourceRepository: 'kbp-core-engineering/kbp-dev-office',
  sourcePath: 'docs/coordination/graph/minimal-goal-contract/manifest.schema.json',
  sourceRevision: '3f97384db04d7644ed65b30d005a03863adcb024',
  sourceBlobSha1: '27c95ad64314dfa2fe44421cc0159392ca0560a1',
  sourceDigest: 'sha256:c27f84bdeb2677778cbaa07a373c61a34bb51664ffc2bcb2d9fdaf22dca9b6dd',
});

export const PRODUCT_2_REPOSITORY = 'WEST-COAST-KBP-ADU/construction-os';
export const FROZEN_PRODUCT_1_RELATION = 'West Coast KBP — first user';
export const SHARING_FLAGS = ['shares_runtime', 'shares_identity', 'shares_authority', 'shares_data', 'shares_graph_memory', 'shares_product_branding'];
export const BOUNDARY_STATUSES = ['TODAY', 'DIRECTION', 'NOT_OPENED'];

const GOAL_SUBTYPES = ['NORTH_STAR', 'OUTCOME'];
const NODE_PLANE = { GOAL: 'GOAL_PLANE', MODULE_SUBGRAPH: 'EXECUTION_PLANE', WORK_NODE: 'EXECUTION_PLANE', EVIDENCE: 'EVIDENCE_STATE_PLANE' };
const PARENT_HOLDERS = { GOAL: ['GOAL'], MODULE_SUBGRAPH: ['GOAL', 'MODULE_SUBGRAPH'], WORK_NODE: ['MODULE_SUBGRAPH'], EVIDENCE: ['WORK_NODE', 'MODULE_SUBGRAPH'] };
const OWNER_IDENTITY = 'avoroncov971-maker';
const TERMINAL_STATES = ['ACCEPTED', 'REFUSED', 'SUPERSEDED'];
const WORK_STATES = [...TERMINAL_STATES, 'PENDING'];
const FAIL_CLOSED_JOIN_POLICY = 'all_required';
const ALLOWED_EXTERNAL_ROLES = ['candidate_executor', 'executor'];
const AUTHORITY_ROLES = ['owner', 'authorizer', 'ledger', 'policy_authority', 'authoritative_state_writer'];
const SYNTHETIC_DATA_CLASS = 'synthetic-conformance';
const REVISION_RE = /^[0-9a-f]{40}$/;
const DIGEST_RE = /^sha256:[0-9a-f]{64}$/;
const FOREIGN_CONTOUR_RE = /(product[-_.]?1|deedseal)/i;

/** The refusal list. Any error is a refusal, never a warning. */
export class Report {
  constructor() {
    this.errors = [];
    this.checks = 0;
  }

  refuse(code, detail) {
    this.errors.push(`${code}: ${detail}`);
  }

  codes() {
    return this.errors.map((error) => error.split(':', 1)[0]);
  }

  ok() {
    return this.errors.length === 0;
  }
}

const listing = (manifest, key) => (Array.isArray(manifest?.[key]) ? manifest[key].filter((item) => item && typeof item === 'object' && !Array.isArray(item)) : []);
const nodes = (manifest, type) => (type ? listing(manifest, 'nodes').filter((node) => node.type === type) : listing(manifest, 'nodes'));
const goals = (manifest, subtype) => nodes(manifest, 'GOAL').filter((goal) => goal.subtype === subtype);
const edges = (manifest, type) => (type ? listing(manifest, 'edges').filter((edge) => edge.type === type) : listing(manifest, 'edges'));
const identifier = (record) => (typeof record?.id === 'string' ? record.id : '');
const text = (value) => (typeof value === 'string' ? value.trim() : '');
const byId = (manifest) => new Map(nodes(manifest).filter((node) => identifier(node)).map((node) => [identifier(node), node]));
const sortedUnique = (values) => [...new Set(values)].sort();

function joins(manifest) {
  const found = new Map();
  for (const subgraph of nodes(manifest, 'MODULE_SUBGRAPH')) {
    const join = subgraph.join;
    if (join && typeof join === 'object' && text(join.id)) found.set(text(join.id), { join, module: identifier(subgraph) });
  }
  return found;
}

const supersededIds = (manifest) => new Set(edges(manifest, 'SUPERSEDES').map((edge) => text(edge.to)).filter(Boolean));
const externalNames = (manifest) => new Set(listing(manifest, 'external_runtimes').map((runtime) => text(runtime.name)).filter(Boolean));

// ------------------------------------------------------------------ contract

function checkSchema(manifest, schema, report) {
  if (!schema || typeof schema !== 'object') {
    report.refuse(REFUSAL.SCHEMA_REQUIRED_KEY_MISSING, 'the vendored contract schema was not supplied; an unschema’d manifest declares its own shape');
    return;
  }
  for (const key of Array.isArray(schema.required) ? schema.required : []) {
    if (!(key in manifest)) report.refuse(REFUSAL.SCHEMA_REQUIRED_KEY_MISSING, `manifest lacks required top-level key '${key}'`);
  }
  const properties = schema.properties ?? {};
  for (const [key, adopted] of [['planes', PLANES], ['node_types', NODE_TYPES], ['edge_types', EDGE_TYPES]]) {
    const declared = properties?.[key]?.items?.enum;
    if (!Array.isArray(declared) || sortedUnique(declared).join('|') !== adopted.join('|')) {
      report.refuse(REFUSAL.SCHEMA_DRIFT, `the vendored schema's '${key}' vocabulary is ${JSON.stringify(declared)} where the adopted contract is ${JSON.stringify(adopted)}`);
    }
  }
  report.checks += 1;
}

function checkVocabulary(manifest, report) {
  if (text(manifest.contract_version) !== CONTRACT_VERSION) {
    report.refuse(REFUSAL.VOCABULARY_NOT_CLOSED, `manifest declares contract_version ${JSON.stringify(manifest.contract_version)}, not '${CONTRACT_VERSION}'`);
  }
  for (const [key, adopted] of [['planes', PLANES], ['node_types', NODE_TYPES], ['edge_types', EDGE_TYPES]]) {
    const value = manifest[key];
    if (!Array.isArray(value) || sortedUnique(value.map(String)).join('|') !== adopted.join('|')) {
      report.refuse(REFUSAL.VOCABULARY_NOT_CLOSED, `manifest declares ${key}=${JSON.stringify(value)}; the adopted contract is exactly ${JSON.stringify(adopted)}, and a fifth type is not admitted by widening this list`);
    }
  }
  for (const node of nodes(manifest)) {
    if (!NODE_TYPES.includes(node.type)) {
      report.refuse(REFUSAL.UNKNOWN_NODE_TYPE, `node '${identifier(node) || JSON.stringify(node)}' claims type ${JSON.stringify(node.type)}, which is outside the four admitted node types`);
    } else if (node.type === 'GOAL' && !GOAL_SUBTYPES.includes(node.subtype)) {
      report.refuse(REFUSAL.UNKNOWN_NODE_TYPE, `GOAL '${identifier(node)}' claims subtype ${JSON.stringify(node.subtype)}; a GOAL is ${GOAL_SUBTYPES.join(' or ')}`);
    }
  }
  for (const edge of edges(manifest)) {
    if (!EDGE_TYPES.includes(edge.type)) {
      report.refuse(REFUSAL.UNKNOWN_EDGE_TYPE, `edge '${identifier(edge) || JSON.stringify(edge)}' claims type ${JSON.stringify(edge.type)}; the edge vocabulary is closed and carries no free-text type`);
    }
  }
  report.checks += 1;
}

function checkIdentityAndPlanes(manifest, report) {
  const seen = new Set();
  const duplicates = [];
  const records = [
    ...nodes(manifest),
    ...edges(manifest),
    ...listing(manifest, 'owner_decisions'),
    ...listing(manifest, 'admitted_actions'),
    ...listing(manifest, 'state_updates'),
    ...[...joins(manifest).values()].map((entry) => entry.join),
  ];
  for (const record of records) {
    const id = identifier(record);
    if (!id) {
      report.refuse(REFUSAL.DUPLICATE_ID, `an element carries no identifier: ${JSON.stringify(record)}`);
      continue;
    }
    if (seen.has(id) && !duplicates.includes(id)) duplicates.push(id);
    seen.add(id);
  }
  for (const duplicate of duplicates) report.refuse(REFUSAL.DUPLICATE_ID, `identifier '${duplicate}' is claimed more than once`);

  for (const node of nodes(manifest)) {
    const expected = NODE_PLANE[node.type];
    if (expected && node.plane !== expected) {
      report.refuse(REFUSAL.PLANE_VIOLATION, `${node.type} '${identifier(node)}' declares plane ${JSON.stringify(node.plane)}; its layer is ${expected}`);
    }
  }
  for (const [key, plane] of [['owner_decisions', 'AUTHORITY_PLANE'], ['admitted_actions', 'AUTHORITY_PLANE'], ['state_updates', 'EVIDENCE_STATE_PLANE']]) {
    for (const record of listing(manifest, key)) {
      if (record.plane !== plane) {
        report.refuse(REFUSAL.PLANE_VIOLATION, `${key.slice(0, -1)} '${identifier(record)}' declares plane ${JSON.stringify(record.plane)}; its layer is ${plane}`);
      }
    }
  }
  report.checks += 1;
}

function checkParentScope(manifest, report) {
  const index = byId(manifest);
  for (const node of nodes(manifest)) {
    if (node.type === 'GOAL' && node.subtype === 'NORTH_STAR') {
      if (text(node.parent)) {
        report.refuse(REFUSAL.UNKNOWN_PARENT, `NORTH_STAR '${identifier(node)}' declares a parent scope ${JSON.stringify(node.parent)}; intended state is the root of its own graph`);
      }
      continue;
    }
    const parent = text(node.parent);
    if (!parent) {
      report.refuse(REFUSAL.MISSING_PARENT_SCOPE, `${node.type} '${identifier(node)}' declares no parent scope; every non-NORTH_STAR node is held by exactly one`);
      continue;
    }
    const holder = index.get(parent);
    if (!holder) {
      report.refuse(REFUSAL.UNKNOWN_PARENT, `${node.type} '${identifier(node)}' names parent scope '${parent}', which does not exist`);
    } else if (!(PARENT_HOLDERS[node.type] ?? []).includes(holder.type)) {
      report.refuse(REFUSAL.UNKNOWN_PARENT, `${node.type} '${identifier(node)}' is held by ${holder.type} '${parent}', which cannot hold it; admitted holders are ${JSON.stringify(PARENT_HOLDERS[node.type] ?? [])}`);
    }
  }
  report.checks += 1;
}

/** ADVANCES adjacency, built once and reused by the checks and the printer. */
function advancesMap(manifest, report) {
  const index = byId(manifest);
  const map = new Map();
  for (const edge of edges(manifest, 'ADVANCES')) {
    const from = text(edge.from);
    const to = text(edge.to);
    let dangling = false;
    for (const [end, endpoint] of [['from', from], ['to', to]]) {
      if (!endpoint || !index.has(endpoint)) {
        dangling = true;
        report?.refuse(REFUSAL.DANGLING_EDGE_ENDPOINT, `ADVANCES '${identifier(edge)}' ${end}-endpoint names '${endpoint || '<nothing>'}', which is not a declared node`);
      }
    }
    if (dangling) continue;
    if (!['GOAL', 'MODULE_SUBGRAPH', 'WORK_NODE'].includes(index.get(from).type)) {
      report?.refuse(REFUSAL.ADVANCES_ENDPOINT_TYPE, `ADVANCES '${identifier(edge)}' runs from ${index.get(from).type} '${from}'; only a GOAL, Module or Work Node advances a goal`);
    }
    if (index.get(from).subtype === 'NORTH_STAR') {
      report?.refuse(REFUSAL.ADVANCES_ENDPOINT_TYPE, `ADVANCES '${identifier(edge)}' runs from NORTH_STAR '${from}'; intended state advances nothing above itself`);
    }
    if (index.get(to).type !== 'GOAL') {
      report?.refuse(REFUSAL.ADVANCES_ENDPOINT_TYPE, `ADVANCES '${identifier(edge)}' runs into ${index.get(to).type} '${to}'; an ADVANCES edge ends on a live GOAL`);
      continue;
    }
    if (text(index.get(to).lifecycle ?? 'live') !== 'live') {
      report?.refuse(REFUSAL.ADVANCES_ENDPOINT_TYPE, `ADVANCES '${identifier(edge)}' ends on GOAL '${to}', which is not live (${JSON.stringify(index.get(to).lifecycle)})`);
    }
    if (!map.has(from)) map.set(from, new Set());
    map.get(from).add(to);
  }
  return map;
}

function checkAdvances(manifest, report) {
  const index = byId(manifest);
  const map = advancesMap(manifest, report);

  const reachableNorthStars = (start) => {
    const seen = new Set();
    const found = new Set();
    let looped = false;
    const frontier = [start];
    while (frontier.length > 0) {
      const current = frontier.pop();
      if (seen.has(current)) continue;
      seen.add(current);
      for (const target of [...(map.get(current) ?? [])].sort()) {
        if (target === start) looped = true;
        if (index.get(target)?.subtype === 'NORTH_STAR') found.add(target);
        else frontier.push(target);
      }
    }
    return { found, looped };
  };

  for (const node of nodes(manifest)) {
    const id = identifier(node);
    const isOutcome = node.type === 'GOAL' && node.subtype === 'OUTCOME';
    if (!(isOutcome || ['MODULE_SUBGRAPH', 'WORK_NODE'].includes(node.type))) continue;
    const { found, looped } = reachableNorthStars(id);
    if (looped) report.refuse(REFUSAL.ADVANCES_CYCLE, `the ADVANCES relation loops through '${id}'; a loop has no deterministic path to intended state`);
    if (found.size !== 1) {
      report.refuse(REFUSAL.NORTH_STAR_PATH_NOT_UNIQUE, `${node.type} '${id}' reaches ${found.size} NORTH_STAR(s) (${[...found].sort().join(', ') || 'none'}) by ADVANCES; the contract requires exactly one`);
    }
  }
  report.checks += 1;
}

function checkWorkNodes(manifest, report) {
  const declaredJoins = joins(manifest);
  for (const work of nodes(manifest, 'WORK_NODE')) {
    const id = identifier(work);
    for (const field of ['inputs', 'outputs', 'terminal_conditions']) {
      if (!Array.isArray(work[field]) || work[field].length === 0) {
        report.refuse(REFUSAL.WORK_NODE_INCOMPLETE, `WORK_NODE '${id}' declares no ${field}; a bounded outcome with no ${field} is not bounded`);
      }
    }
    if (!Array.isArray(work.dependencies)) {
      report.refuse(REFUSAL.WORK_NODE_INCOMPLETE, `WORK_NODE '${id}' declares no dependencies list; an undeclared gate is an ungated node, and an empty list says 'none' out loud`);
    }
    for (const field of ['inputs', 'outputs']) {
      for (const port of Array.isArray(work[field]) ? work[field] : []) {
        if (!port || typeof port !== 'object' || !text(port.name) || !text(port.type)) {
          report.refuse(REFUSAL.WORK_NODE_UNTYPED_PORT, `WORK_NODE '${id}' declares an untyped ${field.slice(0, -1)} ${JSON.stringify(port)}; inputs and outputs carry a name and a type`);
        }
      }
    }
    const destination = text(work.join_destination);
    if (!destination) {
      report.refuse(REFUSAL.WORK_NODE_INCOMPLETE, `WORK_NODE '${id}' declares no join destination; a branch that names no join can never be waited for`);
    } else if (!declaredJoins.has(destination)) {
      report.refuse(REFUSAL.UNKNOWN_JOIN_DESTINATION, `WORK_NODE '${id}' fans into join '${destination}', which no module declares`);
    }
    const result = work.terminal_result;
    if (!result || typeof result !== 'object' || !WORK_STATES.includes(text(result.state))) {
      report.refuse(REFUSAL.WORK_NODE_INCOMPLETE, `WORK_NODE '${id}' carries terminal_result ${JSON.stringify(result)}; the state is one of ${JSON.stringify(WORK_STATES)}`);
    }
  }
  report.checks += 1;
}

/** DEPENDS_ON adjacency, and the declaration it must agree with. */
function dependsOnMap(manifest, report) {
  const index = byId(manifest);
  const map = new Map();
  for (const edge of edges(manifest, 'DEPENDS_ON')) {
    const from = text(edge.from);
    const to = text(edge.to);
    let dangling = false;
    for (const [end, endpoint] of [['from', from], ['to', to]]) {
      if (!endpoint || !index.has(endpoint)) {
        dangling = true;
        report?.refuse(REFUSAL.DANGLING_EDGE_ENDPOINT, `DEPENDS_ON '${identifier(edge)}' ${end}-endpoint names '${endpoint || '<nothing>'}', which is not a declared node`);
      }
    }
    if (dangling) continue;
    if (!['MODULE_SUBGRAPH', 'WORK_NODE'].includes(index.get(from).type)) {
      report?.refuse(REFUSAL.DEPENDS_ON_ENDPOINT_TYPE, `DEPENDS_ON '${identifier(edge)}' gates ${index.get(from).type} '${from}'; only a Module or a Work Node is gated`);
    }
    if (from === to) report?.refuse(REFUSAL.DEPENDS_ON_CYCLE, `DEPENDS_ON '${identifier(edge)}' gates '${from}' on itself`);
    if (!map.has(from)) map.set(from, new Set());
    map.get(from).add(to);
  }
  return map;
}

function checkDependencies(manifest, report) {
  const index = byId(manifest);
  const map = dependsOnMap(manifest, report);

  for (const node of nodes(manifest)) {
    if (!['MODULE_SUBGRAPH', 'WORK_NODE'].includes(node.type)) continue;
    const id = identifier(node);
    if (!Array.isArray(node.dependencies)) continue;
    const declared = sortedUnique(node.dependencies.map(text).filter(Boolean));
    const fromEdges = sortedUnique([...(map.get(id) ?? [])]);
    if (declared.join('|') !== fromEdges.join('|')) {
      report.refuse(REFUSAL.DEPENDENCY_DECLARATION_MISMATCH, `'${id}' declares dependencies ${JSON.stringify(declared)} while its DEPENDS_ON edges say ${JSON.stringify(fromEdges)}; a gate declared in one place only is a gate half the readers cannot see`);
    }
    for (const dependency of declared) {
      if (!index.has(dependency)) {
        report.refuse(REFUSAL.DANGLING_EDGE_ENDPOINT, `'${id}' declares a dependency on '${dependency}', which is not a declared node`);
      }
    }
  }

  const colour = new Map();
  const walk = (vertex) => {
    colour.set(vertex, 1);
    for (const target of [...(map.get(vertex) ?? [])].sort()) {
      if (colour.get(target) === 1) return true;
      if (!colour.has(target) && walk(target)) return true;
    }
    colour.set(vertex, 2);
    return false;
  };
  for (const vertex of [...map.keys()].sort()) {
    if (!colour.has(vertex) && walk(vertex)) {
      report.refuse(REFUSAL.DEPENDS_ON_CYCLE, `the DEPENDS_ON relation loops through '${vertex}'; nothing inside a dependency loop can ever start`);
    }
  }
  report.checks += 1;
}

function checkJoins(manifest, report) {
  const index = byId(manifest);
  const superseded = supersededIds(manifest);
  const proves = new Set(edges(manifest, 'PROVES').filter((edge) => index.get(text(edge.from))?.type === 'EVIDENCE').map((edge) => text(edge.to)));

  for (const [joinId, entry] of [...joins(manifest).entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const { join, module } = entry;
    if (join.declared_before_fanout !== true) {
      report.refuse(REFUSAL.JOIN_NOT_DECLARED_BEFORE_FANOUT, `join '${joinId}' of module '${module}' does not declare that its branch set was complete before fan-out; a set completed afterwards is a set that grew to fit whatever arrived`);
    }
    if (text(join.policy) !== FAIL_CLOSED_JOIN_POLICY) {
      report.refuse(REFUSAL.JOIN_POLICY_NOT_FAIL_CLOSED, `join '${joinId}' declares policy ${JSON.stringify(join.policy)}; the admitted policy is '${FAIL_CLOSED_JOIN_POLICY}', which cannot decide that enough branches arrived`);
    }
    if (!Array.isArray(join.expected_branches) || join.expected_branches.length === 0) {
      report.refuse(REFUSAL.JOIN_BRANCH_SET_INCOMPLETE, `join '${joinId}' declares no expected branch set; a join with no declared branches is satisfied by nothing arriving`);
      continue;
    }
    const expected = sortedUnique(join.expected_branches.map(text).filter(Boolean));
    const live = sortedUnique(nodes(manifest, 'WORK_NODE').filter((work) => text(work.join_destination) === joinId && !superseded.has(identifier(work))).map(identifier));
    if (expected.join('|') !== live.join('|')) {
      report.refuse(REFUSAL.JOIN_BRANCH_SET_INCOMPLETE, `join '${joinId}' declares branches ${JSON.stringify(expected)} while the live Work Nodes fanning into it are ${JSON.stringify(live)}; the declared set must be exactly the branch set`);
    }
    for (const branch of expected) {
      if (index.get(branch)?.type !== 'WORK_NODE') {
        report.refuse(REFUSAL.JOIN_BRANCH_SET_INCOMPLETE, `join '${joinId}' expects branch '${branch}', which is not a declared Work Node`);
      }
    }
    if (join.satisfied !== true) continue;
    for (const branch of expected) {
      const work = index.get(branch);
      const result = work?.terminal_result;
      const state = result && typeof result === 'object' ? text(result.state) : '';
      const evidence = result && typeof result === 'object' ? text(result.evidence) : '';
      if (state !== 'ACCEPTED') {
        report.refuse(REFUSAL.JOIN_SATISFIED_WITHOUT_TERMINAL_BRANCH, `join '${joinId}' is satisfied while required branch '${branch}' is in state ${state || '<none>'}; a required branch without an accepted terminal result cannot be waited past`);
      } else if (!evidence || index.get(evidence)?.type !== 'EVIDENCE') {
        report.refuse(REFUSAL.JOIN_SATISFIED_WITHOUT_TERMINAL_BRANCH, `join '${joinId}' is satisfied while required branch '${branch}' names evidence ${evidence || '<none>'}, which is not a declared EVIDENCE node`);
      } else if (!proves.has(branch)) {
        report.refuse(REFUSAL.JOIN_SATISFIED_WITHOUT_TERMINAL_BRANCH, `join '${joinId}' is satisfied while required branch '${branch}' carries no PROVES edge; an accepted terminal result is one evidence proves`);
      }
    }
  }
  report.checks += 1;
}

function checkSupersession(manifest, report) {
  const index = byId(manifest);
  for (const edge of edges(manifest, 'SUPERSEDES')) {
    const id = identifier(edge);
    const replacement = text(edge.from);
    const replaced = text(edge.to);
    let incomplete = false;
    for (const [role, endpoint] of [['replacement', replacement], ['replaced', replaced]]) {
      if (!endpoint) {
        incomplete = true;
        report.refuse(REFUSAL.SUPERSESSION_INCOMPLETE, `SUPERSEDES '${id}' names no ${role} Work Node; a supersession that identifies only one side replaces nothing traceable`);
      } else if (index.get(endpoint)?.type !== 'WORK_NODE') {
        incomplete = true;
        report.refuse(REFUSAL.SUPERSESSION_INCOMPLETE, `SUPERSEDES '${id}' names ${role} '${endpoint}', which is not a declared Work Node`);
      }
    }
    if (incomplete) continue;
    if (replacement === replaced) {
      report.refuse(REFUSAL.SUPERSESSION_INCOMPLETE, `SUPERSEDES '${id}' replaces '${replaced}' with itself`);
      continue;
    }
    const result = index.get(replaced).terminal_result;
    const state = result && typeof result === 'object' ? text(result.state) : '';
    if (state !== 'SUPERSEDED') {
      report.refuse(REFUSAL.SUPERSESSION_STATE_MISMATCH, `Work Node '${replaced}' is replaced by '${replacement}' but records state ${state || '<none>'}; a replaced node says so in its own terminal result`);
    }
  }
  report.checks += 1;
}

function checkEvidence(manifest, report) {
  const index = byId(manifest);
  for (const evidence of nodes(manifest, 'EVIDENCE')) {
    const id = identifier(evidence);
    const source = evidence.source;
    if (!source || typeof source !== 'object') {
      report.refuse(REFUSAL.EVIDENCE_WITHOUT_EXACT_SOURCE, `EVIDENCE '${id}' declares no source; a reference to nothing exact proves nothing`);
      continue;
    }
    if (!text(source.repository) || !text(source.path)) {
      report.refuse(REFUSAL.EVIDENCE_WITHOUT_EXACT_SOURCE, `EVIDENCE '${id}' names no repository/path to resolve`);
    }
    if (!REVISION_RE.test(text(source.revision))) {
      report.refuse(REFUSAL.EVIDENCE_WITHOUT_EXACT_SOURCE, `EVIDENCE '${id}' is pinned to revision '${text(source.revision) || '<nothing>'}' instead of an exact 40-hex commit; a prefix is not an exact reference`);
    }
    if (!DIGEST_RE.test(text(source.digest))) {
      report.refuse(REFUSAL.EVIDENCE_WITHOUT_EXACT_SOURCE, `EVIDENCE '${id}' carries digest '${text(source.digest) || '<nothing>'}' instead of 'sha256:<64 hex>'`);
    }
    if (evidence.immutable !== true) {
      report.refuse(REFUSAL.EVIDENCE_MUTABLE, `EVIDENCE '${id}' does not declare itself immutable; evidence that may change proves whatever it says tomorrow`);
    }
  }
  for (const edge of edges(manifest, 'PROVES')) {
    const id = identifier(edge);
    const from = text(edge.from);
    const to = text(edge.to);
    let dangling = false;
    for (const [end, endpoint] of [['from', from], ['to', to]]) {
      if (!endpoint || !index.has(endpoint)) {
        dangling = true;
        report.refuse(REFUSAL.DANGLING_EDGE_ENDPOINT, `PROVES '${id}' ${end}-endpoint names '${endpoint || '<nothing>'}', which is not a declared node`);
      }
    }
    if (dangling) continue;
    if (index.get(from).type !== 'EVIDENCE') {
      report.refuse(REFUSAL.PROVES_ENDPOINT_TYPE, `PROVES '${id}' runs from ${index.get(from).type} '${from}'; only evidence proves`);
    }
    if (!['WORK_NODE', 'MODULE_SUBGRAPH', 'GOAL'].includes(index.get(to).type)) {
      report.refuse(REFUSAL.PROVES_ENDPOINT_TYPE, `PROVES '${id}' proves ${index.get(to).type} '${to}'; a claim or terminal result belongs to a goal, module or Work Node`);
    }
    if (!text(edge.claim)) {
      report.refuse(REFUSAL.PROVES_WITHOUT_CLAIM, `PROVES '${id}' names no claim; evidence attached to nothing in particular proves nothing in particular`);
    }
  }
  report.checks += 1;
}

/** One terminal result is proved by its own evidence, never by a shared receipt. */
function checkDuplicateTerminalEvidence(manifest, report) {
  const claimedBy = new Map();
  for (const work of nodes(manifest, 'WORK_NODE')) {
    const evidence = work.terminal_result && typeof work.terminal_result === 'object' ? text(work.terminal_result.evidence) : '';
    if (!evidence) continue;
    if (!claimedBy.has(evidence)) claimedBy.set(evidence, []);
    claimedBy.get(evidence).push(identifier(work));
  }
  for (const [evidence, claimants] of [...claimedBy.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    if (claimants.length > 1) {
      report.refuse(REFUSAL.DUPLICATE_TERMINAL_EVIDENCE, `EVIDENCE '${evidence}' is named as the terminal evidence of ${JSON.stringify(sortedUnique(claimants))}; one receipt cannot close two bounded outcomes`);
    }
  }
  const fingerprints = new Map();
  for (const evidence of nodes(manifest, 'EVIDENCE')) {
    const source = evidence.source;
    if (!source || typeof source !== 'object') continue;
    const fingerprint = [text(source.repository), text(source.path), text(source.revision), text(source.digest)].join('@');
    if (!fingerprints.has(fingerprint)) fingerprints.set(fingerprint, []);
    fingerprints.get(fingerprint).push(identifier(evidence));
  }
  for (const [fingerprint, ids] of [...fingerprints.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    if (ids.length > 1) {
      report.refuse(REFUSAL.DUPLICATE_TERMINAL_EVIDENCE, `EVIDENCE nodes ${JSON.stringify(sortedUnique(ids))} pin the identical source ${fingerprint}; the same bytes minted twice let one artefact prove two different things`);
    }
  }
  report.checks += 1;
}

function checkAuthority(manifest, report) {
  const index = byId(manifest);
  const decisions = new Map(listing(manifest, 'owner_decisions').map((record) => [identifier(record), record]));
  const actions = new Map(listing(manifest, 'admitted_actions').map((record) => [identifier(record), record]));
  const external = externalNames(manifest);

  for (const [id, decision] of [...decisions.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const decidedBy = text(decision.decided_by);
    if (decidedBy !== OWNER_IDENTITY) {
      report.refuse(REFUSAL.AUTHORITY_NOT_OWNER, `owner decision '${id}' is decided_by ${JSON.stringify(decidedBy || null)}; only '${OWNER_IDENTITY}' decides, and a record attributing a decision elsewhere is forged provenance whether or not it was meant that way`);
    }
    if (external.has(decidedBy)) {
      report.refuse(REFUSAL.EXTERNAL_RUNTIME_IN_AUTHORITY_ROLE, `owner decision '${id}' is decided_by external runtime '${decidedBy}'`);
    }
    if (!text(decision.record) || !text(decision.decided_at)) {
      report.refuse(REFUSAL.ADMISSION_WITHOUT_OWNER_DECISION, `owner decision '${id}' names no committed record or date to find it again`);
    }
  }

  for (const [id, action] of [...actions.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    if (action.admitted !== true || action.material !== true) continue;
    const decisionId = text(action.owner_decision);
    if (!decisionId || !decisions.has(decisionId)) {
      report.refuse(REFUSAL.ADMISSION_WITHOUT_OWNER_DECISION, `admitted action '${id}' names owner decision '${decisionId || '<nothing>'}', which is not a declared decision record; a material action cannot be admitted without one`);
    }
    const evidenceId = text(action.evidence);
    if (!evidenceId || index.get(evidenceId)?.type !== 'EVIDENCE') {
      report.refuse(REFUSAL.ADMISSION_WITHOUT_EVIDENCE, `admitted action '${id}' references evidence '${evidenceId || '<nothing>'}', which is not a declared EVIDENCE node`);
    }
    if (external.has(text(action.admitted_by))) {
      report.refuse(REFUSAL.EXTERNAL_RUNTIME_IN_AUTHORITY_ROLE, `admitted action '${id}' is admitted_by external runtime '${text(action.admitted_by)}'`);
    }
  }

  for (const update of listing(manifest, 'state_updates')) {
    const id = identifier(update);
    if (update.authoritative !== true) continue;
    const actionId = text(update.admitted_action);
    if (!actionId || !actions.has(actionId)) {
      report.refuse(REFUSAL.STATE_UPDATE_WITHOUT_ADMISSION, `state update '${id}' names admitted action '${actionId || '<nothing>'}', which is not a declared admitted action`);
    }
    const references = Array.isArray(update.evidence) ? update.evidence : [];
    const resolved = references.map(text).filter((reference) => index.get(reference)?.type === 'EVIDENCE');
    if (references.length === 0 || resolved.length !== references.length) {
      report.refuse(REFUSAL.STATE_UPDATE_WITHOUT_EVIDENCE, `state update '${id}' references evidence ${JSON.stringify(update.evidence)}; an authoritative state write names declared EVIDENCE nodes and nothing else`);
    }
    const writer = text(update.written_by);
    if (!writer) {
      report.refuse(REFUSAL.STATE_UPDATE_WITHOUT_ADMISSION, `state update '${id}' names no writer; an anonymous authoritative write has no authority to check`);
    } else if (external.has(writer)) {
      report.refuse(REFUSAL.EXTERNAL_RUNTIME_IN_AUTHORITY_ROLE, `state update '${id}' is written_by external runtime '${writer}'; an external runtime is never an authoritative-state writer`);
    }
  }
  report.checks += 1;
}

function checkExternalRuntimes(manifest, report) {
  for (const runtime of listing(manifest, 'external_runtimes')) {
    const name = text(runtime.name) || '<unnamed>';
    const role = text(runtime.role);
    if (AUTHORITY_ROLES.includes(role) || !ALLOWED_EXTERNAL_ROLES.includes(role)) {
      report.refuse(REFUSAL.EXTERNAL_RUNTIME_IN_AUTHORITY_ROLE, `external runtime '${name}' declares role ${JSON.stringify(role || null)}; an external runtime may be named only as a replaceable executor ${JSON.stringify(ALLOWED_EXTERNAL_ROLES)}, never as Owner, authorizer, ledger, policy authority or authoritative-state writer`);
    }
    if (runtime.inside_trust_boundary !== false) {
      report.refuse(REFUSAL.EXTERNAL_RUNTIME_IN_AUTHORITY_ROLE, `external runtime '${name}' does not declare itself outside the control-plane trust boundary`);
    }
    if (runtime.replaceable !== true) {
      report.refuse(REFUSAL.EXTERNAL_RUNTIME_IN_AUTHORITY_ROLE, `external runtime '${name}' does not declare itself replaceable; a runtime that cannot be swapped has become the architecture`);
    }
  }
  report.checks += 1;
}

function checkSyntheticDataClass(manifest, report) {
  if (text(manifest.data_class) !== SYNTHETIC_DATA_CLASS) return;
  if (manifest.adopts_live_north_star !== false) {
    report.refuse(REFUSAL.LIVE_NORTH_STAR_ADOPTED, 'synthetic conformance data must declare adopts_live_north_star: false; a fixture that quietly adopts a live North Star decides a product direction nobody decided');
  }
  for (const goal of goals(manifest, 'NORTH_STAR')) {
    if (goal.synthetic !== true) {
      report.refuse(REFUSAL.LIVE_NORTH_STAR_ADOPTED, `NORTH_STAR '${identifier(goal)}' in synthetic conformance data does not declare itself synthetic`);
    }
  }
  report.checks += 1;
}

// --------------------------------------------------------- Product 2 binding

function checkNorthStar(manifest, northStarStatement, report) {
  const northStars = goals(manifest, 'NORTH_STAR');
  if (northStars.length !== 1) {
    report.refuse(REFUSAL.P2_NORTH_STAR_CARDINALITY, `the manifest declares ${northStars.length} NORTH_STAR goals; Product 2 has exactly one`);
    report.checks += 1;
    return;
  }
  const [northStar] = northStars;
  if (!text(northStar.irreducibility)) {
    report.refuse(REFUSAL.P2_NORTH_STAR_DRIFT, `NORTH_STAR '${identifier(northStar)}' names no irreducibility clause; the adopted boundary refuses reduction to lead generation, inquiry transport, a website, a Hero, a CRM or a generic AI agent, and the graph must say so where a reader will meet it`);
  }
  if (typeof northStarStatement === 'string' && northStarStatement.length > 0) {
    if (text(northStar.statement_verbatim) !== northStarStatement.trim()) {
      report.refuse(REFUSAL.P2_NORTH_STAR_DRIFT, `NORTH_STAR '${identifier(northStar)}' carries a statement_verbatim that is not the adopted canon's own section A1 text; a paraphrase of the master statement is a product decision no session may take`);
    }
  }
  if (text(northStar.boundary_status)) {
    report.refuse(REFUSAL.P2_NORTH_STAR_AVAILABILITY_CLAIM, `NORTH_STAR '${identifier(northStar)}' declares boundary_status ${JSON.stringify(northStar.boundary_status)}; section A defines identity and direction and creates no availability claim, which section B alone classifies`);
  }
  report.checks += 1;
}

function checkBoundaryClassification(manifest, report) {
  const classification = manifest.boundary_classification;
  if (!classification || typeof classification !== 'object' || Array.isArray(classification)) {
    report.refuse(REFUSAL.P2_BOUNDARY_CLASSIFICATION, 'the manifest declares no boundary_classification; a graph that cannot say what is supported today, what is direction and what is not opened invites every one of them to be read as shipped');
    report.checks += 1;
    return;
  }
  for (const status of BOUNDARY_STATUSES) {
    const entries = classification[status];
    if (!Array.isArray(entries) || entries.length === 0 || entries.some((entry) => !text(entry))) {
      report.refuse(REFUSAL.P2_BOUNDARY_CLASSIFICATION, `boundary_classification.${status} is ${JSON.stringify(entries)}; each of the three statuses names at least one contour in words, and silence about what is not opened is the most dangerous silence`);
    }
  }
  for (const key of Object.keys(classification)) {
    if (![...BOUNDARY_STATUSES, 'source', 'rule'].includes(key)) {
      report.refuse(REFUSAL.P2_BOUNDARY_CLASSIFICATION, `boundary_classification declares '${key}'; the status grammar is closed at TODAY, DIRECTION and NOT_OPENED`);
    }
  }
  for (const node of nodes(manifest)) {
    const isOutcome = node.type === 'GOAL' && node.subtype === 'OUTCOME';
    if (!(isOutcome || ['MODULE_SUBGRAPH', 'WORK_NODE'].includes(node.type))) continue;
    if (!BOUNDARY_STATUSES.includes(text(node.boundary_status))) {
      report.refuse(REFUSAL.P2_BOUNDARY_CLASSIFICATION, `${node.type} '${identifier(node)}' declares boundary_status ${JSON.stringify(node.boundary_status)}; every outcome, module and Work Node carries exactly one of ${JSON.stringify(BOUNDARY_STATUSES)}`);
    }
  }
  report.checks += 1;
}

function checkProductSeparation(manifest, report) {
  const relation = manifest.product_1_relation;
  if (!relation || typeof relation !== 'object' || Array.isArray(relation)) {
    report.refuse(REFUSAL.P2_CONTOUR_CONFLATION, 'the manifest declares no product_1_relation; the single cross-contour relation is stated explicitly or it is not stated at all');
    report.checks += 1;
    return;
  }
  if (text(relation.relation) !== FROZEN_PRODUCT_1_RELATION) {
    report.refuse(REFUSAL.P2_CONTOUR_CONFLATION, `product_1_relation.relation is ${JSON.stringify(relation.relation)}; the only admitted cross-contour relation is the frozen '${FROZEN_PRODUCT_1_RELATION}', and 'first client' or any funnel wording is a reduction of it`);
  }
  if (relation.frozen !== true) {
    report.refuse(REFUSAL.P2_CONTOUR_CONFLATION, 'product_1_relation does not declare itself frozen; a relation that may be reworded is not the adopted one');
  }
  for (const flag of SHARING_FLAGS) {
    if (relation[flag] !== false) {
      report.refuse(REFUSAL.P2_CONTOUR_CONFLATION, `product_1_relation.${flag} is ${JSON.stringify(relation[flag])}; runtime, identity, authority, data, Graph Memory and product branding are never shared across contours`);
    }
  }
  const records = [
    ...nodes(manifest),
    ...edges(manifest),
    ...listing(manifest, 'owner_decisions'),
    ...listing(manifest, 'admitted_actions'),
    ...listing(manifest, 'state_updates'),
  ];
  for (const record of records) {
    const id = identifier(record);
    if (id && FOREIGN_CONTOUR_RE.test(id)) {
      report.refuse(REFUSAL.P2_CONTOUR_CONFLATION, `'${id}' names the Product 1 contour in a Product 2 graph identity; Product 1 holds its own goal graph, authority and Graph Memory in its own repositories`);
    }
  }
  for (const evidence of nodes(manifest, 'EVIDENCE')) {
    const repository = text(evidence.source?.repository);
    if (repository && repository !== PRODUCT_2_REPOSITORY) {
      report.refuse(REFUSAL.P2_CONTOUR_CONFLATION, `EVIDENCE '${identifier(evidence)}' pins bytes from '${repository}'; Product 2 Graph Memory accumulates state from '${PRODUCT_2_REPOSITORY}' only, and foreign-contour bytes entering it are memory conflation`);
    }
  }
  report.checks += 1;
}

/** Nothing is running until a STARTED event is persisted. */
function checkRunningWithoutStarted(manifest, report) {
  for (const node of nodes(manifest)) {
    const execution = node.execution;
    if (!execution || typeof execution !== 'object') continue;
    if (execution.running === true && !text(execution.started_event)) {
      report.refuse(REFUSAL.P2_RUNNING_WITHOUT_STARTED_EVENT, `${node.type} '${identifier(node)}' is marked running with no persisted STARTED event; a dispatch is not a start and a free lane is not progress`);
    }
  }
  report.checks += 1;
}

function checkNextExecutable(manifest, report) {
  const index = byId(manifest);
  const declared = text(manifest.next_executable_work_node);
  if (!declared) {
    report.refuse(REFUSAL.P2_NOT_EXECUTABLE, 'the manifest names no next_executable_work_node; a Director that cannot read exactly one next step reads none');
    report.checks += 1;
    return;
  }
  const work = index.get(declared);
  if (work?.type !== 'WORK_NODE') {
    report.refuse(REFUSAL.P2_NOT_EXECUTABLE, `next_executable_work_node '${declared}' is not a declared WORK_NODE`);
    report.checks += 1;
    return;
  }
  const state = work.terminal_result && typeof work.terminal_result === 'object' ? text(work.terminal_result.state) : '';
  if (state !== 'PENDING') {
    report.refuse(REFUSAL.P2_NOT_EXECUTABLE, `next_executable_work_node '${declared}' is in terminal state ${state || '<none>'}; a finished branch is not the next step`);
  }
  if (text(work.boundary_status) === 'NOT_OPENED') {
    report.refuse(REFUSAL.P2_NOT_EXECUTABLE, `next_executable_work_node '${declared}' is classified NOT_OPENED; no packet opens a closed capability`);
  }
  for (const dependency of sortedUnique((Array.isArray(work.dependencies) ? work.dependencies : []).map(text).filter(Boolean))) {
    const upstream = index.get(dependency);
    const upstreamState = upstream?.terminal_result && typeof upstream.terminal_result === 'object' ? text(upstream.terminal_result.state) : '';
    if (upstreamState !== 'ACCEPTED') {
      report.refuse(REFUSAL.P2_UNMET_DEPENDENCY_PRESENTED_EXECUTABLE, `next_executable_work_node '${declared}' declares DEPENDS_ON '${dependency}', whose terminal result is ${upstreamState || '<none>'}; an unmet gate presented as executable is how a graph starts lying about what can be worked on`);
    }
  }
  report.checks += 1;
}

function checkNamedGapsAndSurfaces(manifest, report) {
  const gaps = manifest.not_implemented_at_this_stage;
  if (!Array.isArray(gaps) || gaps.length === 0 || gaps.some((gap) => !text(gap))) {
    report.refuse(REFUSAL.P2_GAPS_NOT_NAMED, `not_implemented_at_this_stage is ${JSON.stringify(gaps)}; a manifest that goes silent about what does not exist yet reads as a claim that everything does`);
  }
  const surfaces = manifest.graph_surfaces;
  if (!surfaces || typeof surfaces !== 'object' || Array.isArray(surfaces)) {
    report.refuse(REFUSAL.P2_GRAPH_SURFACES_NOT_SEPARATED, 'the manifest declares no graph_surfaces; the persistent intent graph and the derived engineering projection are separate surfaces, and a graph that cannot say so invites them to be merged');
  } else {
    for (const key of ['intent_work_graph', 'derived_engineering_graph']) {
      const surface = surfaces[key];
      if (!surface || typeof surface !== 'object' || !text(surface.path) || !text(surface.kind) || !text(surface.role)) {
        report.refuse(REFUSAL.P2_GRAPH_SURFACES_NOT_SEPARATED, `graph_surfaces.${key} does not name its path, kind and role`);
      }
    }
    if (surfaces.intent_work_graph?.committed !== true || surfaces.derived_engineering_graph?.committed !== false) {
      report.refuse(REFUSAL.P2_GRAPH_SURFACES_NOT_SEPARATED, 'graph_surfaces must record that the intent graph is committed repository data and the derived projection is not committed; a committed projection would become a second, stale authority');
    }
    if (!text(surfaces.separation)) {
      report.refuse(REFUSAL.P2_GRAPH_SURFACES_NOT_SEPARATED, 'graph_surfaces names no separation statement; the two surfaces are reconciled and reported, never merged or averaged');
    }
  }
  report.checks += 1;
}

// ---------------------------------------------------------------- validation

/**
 * Every rule, fail-closed, in one report. Order-independent by construction.
 *
 * `schema` is the parsed vendored contract; `northStarStatement`, when given, is
 * the section A1 master statement read from the adopted canon, so a paraphrase
 * is refused rather than quietly adopted.
 */
export function validate(manifest, { schema, northStarStatement } = {}) {
  const report = new Report();
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    report.refuse(REFUSAL.SCHEMA_REQUIRED_KEY_MISSING, 'the manifest is not a JSON object');
    return report;
  }
  try {
    checkSchema(manifest, schema, report);
    checkVocabulary(manifest, report);
    checkIdentityAndPlanes(manifest, report);
    checkParentScope(manifest, report);
    checkAdvances(manifest, report);
    checkWorkNodes(manifest, report);
    checkDependencies(manifest, report);
    checkJoins(manifest, report);
    checkSupersession(manifest, report);
    checkEvidence(manifest, report);
    checkDuplicateTerminalEvidence(manifest, report);
    checkAuthority(manifest, report);
    checkExternalRuntimes(manifest, report);
    checkSyntheticDataClass(manifest, report);
    checkNorthStar(manifest, northStarStatement, report);
    checkBoundaryClassification(manifest, report);
    checkProductSeparation(manifest, report);
    checkRunningWithoutStarted(manifest, report);
    checkNextExecutable(manifest, report);
    checkNamedGapsAndSurfaces(manifest, report);
  } catch (error) {
    report.refuse(REFUSAL.SCHEMA_REQUIRED_KEY_MISSING, `the manifest is structurally incomplete and cannot be validated: ${error?.message ?? error}`);
  }
  return report;
}

/** The same content with every array in a deterministic order. */
export function canonical(value) {
  if (Array.isArray(value)) {
    return value.map(canonical).sort((a, b) => (JSON.stringify(a) < JSON.stringify(b) ? -1 : JSON.stringify(a) > JSON.stringify(b) ? 1 : 0));
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
  }
  return value;
}

/** Stable digest of the contract content, independent of JSON array order. */
export function contractDigest(manifest) {
  return createHash('sha256').update(JSON.stringify(canonical(manifest)), 'utf8').digest('hex');
}

/**
 * The deterministic ADVANCES path from a Work Node up to the NORTH_STAR, with
 * the parent scope that holds each step. Returns [] when no path exists.
 */
export function activePath(manifest, startId) {
  const index = byId(manifest);
  const map = advancesMap(manifest, null);
  const start = index.get(text(startId));
  if (!start) return [];
  const path = [start];
  const seen = new Set([identifier(start)]);
  let current = identifier(start);
  while (index.get(current)?.subtype !== 'NORTH_STAR') {
    const [next] = [...(map.get(current) ?? [])].sort();
    if (!next || seen.has(next) || !index.has(next)) return [];
    path.push(index.get(next));
    seen.add(next);
    current = next;
  }
  return path;
}

const label = (node) => (node.type === 'GOAL' ? text(node.subtype) || 'GOAL' : node.type);

export function renderPath(manifest, startId) {
  const path = activePath(manifest, startId);
  if (path.length === 0) return `  <no deterministic ADVANCES path from '${startId}' to a NORTH_STAR>`;
  return path
    .map((node, position) => {
      const scope = text(node.parent) ? `  (scope: ${text(node.parent)})` : '';
      const prefix = position === 0 ? '  ' : '   -> ';
      return `${prefix}[${label(node)}] ${identifier(node)}${scope}`;
    })
    .join('\n');
}

export function renderTerminalState(manifest) {
  const lines = [];
  for (const work of [...nodes(manifest, 'WORK_NODE')].sort((a, b) => identifier(a).localeCompare(identifier(b)))) {
    const result = work.terminal_result ?? {};
    const dependencies = sortedUnique((Array.isArray(work.dependencies) ? work.dependencies : []).map(text).filter(Boolean));
    const gate = dependencies.length === 0 ? 'no gate' : `gated on ${dependencies.join(', ')}`;
    lines.push(`  [WORK_NODE] ${identifier(work)} -> ${text(result.state) || '<none>'} (evidence: ${text(result.evidence) || 'none'}; ${gate}; boundary: ${text(work.boundary_status) || '<none>'})`);
  }
  for (const [joinId, entry] of [...joins(manifest).entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    lines.push(`  [JOIN] ${joinId} -> ${entry.join.satisfied === true ? 'SATISFIED' : 'UNSATISFIED'} (policy: ${text(entry.join.policy)}; branches: ${(entry.join.expected_branches ?? []).join(', ')})`);
  }
  return lines.join('\n');
}

// ----------------------------------------------------------------------- CLI

const DEFAULTS = Object.freeze({
  manifest: 'governance/product/PRODUCT2-LIVE-GOAL-GRAPH-v1.json',
  schema: VENDORED_CONTRACT.path,
  canon: 'governance/product/PRODUCT-BOUNDARIES-v1.0.md',
});

/** Section A1 of the adopted canon: the one blockquote under `### A1 — master`. */
export function extractNorthStarStatement(canonText) {
  const lines = String(canonText).split('\n');
  const heading = lines.findIndex((line) => /^#{2,4}\s+A1\b/.test(line));
  if (heading < 0) return '';
  for (let cursor = heading + 1; cursor < lines.length; cursor += 1) {
    const line = lines[cursor];
    if (/^#{1,6}\s/.test(line)) return '';
    if (line.startsWith('> ')) return line.slice(2).trim();
  }
  return '';
}

const flag = (argv, name, fallback) => {
  const position = argv.indexOf(`--${name}`);
  return position >= 0 && argv[position + 1] ? argv[position + 1] : fallback;
};

async function main(argv) {
  const manifestPath = flag(argv, 'manifest', DEFAULTS.manifest);
  const schemaPath = flag(argv, 'schema', DEFAULTS.schema);
  const canonPath = flag(argv, 'canon', DEFAULTS.canon);

  let manifest;
  let schema;
  let northStarStatement = '';
  const preflight = new Report();

  try {
    manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  } catch (error) {
    process.stderr.write(`GOAL_GRAPH_REFUSED: ${REFUSAL.MANIFEST_UNREADABLE}: ${manifestPath}: ${error?.message ?? error}\n`);
    return 1;
  }

  try {
    const raw = await readFile(schemaPath, 'utf8');
    const digest = `sha256:${createHash('sha256').update(raw, 'utf8').digest('hex')}`;
    if (digest !== VENDORED_CONTRACT.sourceDigest) {
      preflight.refuse(REFUSAL.P2_VENDORED_CONTRACT_DRIFT, `${schemaPath} digests ${digest}; the pinned accepted contract at ${VENDORED_CONTRACT.sourceRepository}@${VENDORED_CONTRACT.sourceRevision} digests ${VENDORED_CONTRACT.sourceDigest}. The vendored copy is no longer byte-identical to the contract it claims to reuse.`);
    }
    schema = JSON.parse(raw);
  } catch (error) {
    preflight.refuse(REFUSAL.P2_VENDORED_CONTRACT_DRIFT, `the vendored contract at ${schemaPath} is unreadable: ${error?.message ?? error}`);
  }
  preflight.checks += 1;

  try {
    northStarStatement = extractNorthStarStatement(await readFile(canonPath, 'utf8'));
    if (!northStarStatement) preflight.refuse(REFUSAL.P2_NORTH_STAR_DRIFT, `section A1 could not be extracted from ${canonPath}; the NORTH_STAR cannot be checked against a canon that no longer states it`);
  } catch (error) {
    preflight.refuse(REFUSAL.P2_NORTH_STAR_DRIFT, `the adopted canon at ${canonPath} is unreadable: ${error?.message ?? error}`);
  }
  preflight.checks += 1;

  const report = validate(manifest, { schema, northStarStatement });
  const errors = [...preflight.errors, ...report.errors];
  if (errors.length > 0) {
    for (const error of errors) process.stderr.write(`GOAL_GRAPH_REFUSED: ${error}\n`);
    return 1;
  }

  process.stdout.write(`GOAL_GRAPH_OK: ${report.checks + preflight.checks} check groups, 0 refusals\n`);
  process.stdout.write(`GOAL_GRAPH_CONTRACT: ${VENDORED_CONTRACT.sourceRepository}@${VENDORED_CONTRACT.sourceRevision} ${VENDORED_CONTRACT.sourceDigest} (vendored byte-identical)\n`);
  process.stdout.write('GOAL_GRAPH_ACTIVE_PATH:\n');
  process.stdout.write(`${renderPath(manifest, manifest.next_executable_work_node)}\n`);
  process.stdout.write('GOAL_GRAPH_TERMINAL_STATE:\n');
  process.stdout.write(`${renderTerminalState(manifest)}\n`);
  process.stdout.write(`GOAL_GRAPH_NEXT_EXECUTABLE: ${text(manifest.next_executable_work_node)}\n`);
  process.stdout.write(`GOAL_GRAPH_DIGEST: ${contractDigest(manifest)}\n`);
  return 0;
}

const invokedDirectly = typeof process.argv[1] === 'string' && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  main(process.argv.slice(2)).then((code) => { process.exitCode = code; }).catch((error) => {
    process.stderr.write(`GOAL_GRAPH_REFUSED: ${REFUSAL.MANIFEST_UNREADABLE}: ${error?.message ?? error}\n`);
    process.exitCode = 1;
  });
}
