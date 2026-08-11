#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export const REASON = Object.freeze({
  UNKNOWN_FIELD: 'GRAPH001_UNKNOWN_FIELD',
  INVALID_VALUE: 'GRAPH002_INVALID_VALUE',
  DUPLICATE_ID: 'GRAPH003_DUPLICATE_ID',
  DANGLING_REFERENCE: 'GRAPH004_DANGLING_REFERENCE',
  MISSING_PROVENANCE: 'GRAPH005_MISSING_PROVENANCE',
  CONFLICTING_CANONICAL_HEADS: 'GRAPH006_CONFLICTING_CANONICAL_HEADS',
  STALE_EXACT_HEAD_REVIEW: 'GRAPH007_STALE_EXACT_HEAD_REVIEW',
  WATERMARK_REGRESSION: 'GRAPH008_WATERMARK_REGRESSION',
  INFERENCE_AS_FACT: 'GRAPH009_INFERENCE_AS_FACT',
  NOT_RUNNABLE_REPEATED_PRECONDITION: 'NOT_RUNNABLE_REPEATED_PRECONDITION',
});

const NODE_TYPES = new Set(['Objective', 'WorkItem', 'Attempt', 'Dispatch', 'Worker', 'Branch', 'PullRequest', 'Review', 'OwnerDecision', 'Merge', 'Deployment', 'Evidence', 'Blocker', 'Refusal', 'Correction', 'Retraction', 'NamedGap']);
const EDGE_TYPES = new Set(['contains', 'depends_on', 'supersedes', 'attempts', 'produced', 'dispatched_to', 'uses_branch', 'opened_as', 'reviews_exact_head', 'decides', 'blocks', 'resolves', 'merged_as', 'deployed_as', 'evidenced_by', 'corrects', 'retracts']);
const STATUSES = new Set(['active', 'blocked', 'superseded', 'audit-only', 'retained', 'invalid', 'resolved', 'merged', 'deployed', 'missing', 'complete', 'failed', 'not-runnable']);
const INPUT_FIELDS = new Set(['schemaVersion', 'watermark', 'previousWatermark', 'sources', 'nodes', 'edges']);
const SOURCE_FIELDS = new Set(['id', 'url', 'sha', 'observedAt', 'complete', 'namedGaps']);
const NODE_FIELDS = new Set(['id', 'type', 'label', 'status', 'sourceRefs', 'workItemId', 'headSha', 'reviewedHeadSha', 'currentHeadSha', 'canonicalDisposition', 'preconditionFingerprint', 'evidenceRef', 'reasonCode', 'requiredClearingEvidence', 'runnable', 'session', 'branch', 'prNumber', 'details']);
const EDGE_FIELDS = new Set(['id', 'type', 'from', 'to', 'sourceRefs']);
const WATERMARK_FIELDS = new Set(['observedAt', 'sequence']);
const SHA = /^[0-9a-f]{40}$/;

export class GraphError extends Error {
  constructor(code, detail) {
    super(`${code}: ${detail}`);
    this.name = 'GraphError';
    this.code = code;
  }
}

const fail = (code, detail) => { throw new GraphError(code, detail); };

function assertFields(value, allowed, path) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(REASON.INVALID_VALUE, `${path} must be an object`);
  for (const key of Object.keys(value)) if (!allowed.has(key)) fail(REASON.UNKNOWN_FIELD, `${path}.${key}`);
}

function requiredString(value, path) {
  if (typeof value !== 'string' || value.length === 0) fail(REASON.INVALID_VALUE, path);
}

function validateWatermark(mark, path) {
  assertFields(mark, WATERMARK_FIELDS, path);
  requiredString(mark.observedAt, `${path}.observedAt`);
  if (!Number.isInteger(mark.sequence) || mark.sequence < 0 || Number.isNaN(Date.parse(mark.observedAt))) fail(REASON.INVALID_VALUE, path);
}

export function validateInput(input) {
  assertFields(input, INPUT_FIELDS, 'input');
  if (input.schemaVersion !== 'graph-source-truth/v1') fail(REASON.INVALID_VALUE, 'schemaVersion');
  validateWatermark(input.watermark, 'watermark');
  if (input.previousWatermark) {
    validateWatermark(input.previousWatermark, 'previousWatermark');
    if (input.watermark.sequence < input.previousWatermark.sequence || Date.parse(input.watermark.observedAt) < Date.parse(input.previousWatermark.observedAt)) fail(REASON.WATERMARK_REGRESSION, 'watermark precedes previousWatermark');
  }
  if (!Array.isArray(input.sources) || !Array.isArray(input.nodes) || !Array.isArray(input.edges)) fail(REASON.INVALID_VALUE, 'sources, nodes, and edges must be arrays');

  const sourceIds = new Set();
  for (const [index, source] of input.sources.entries()) {
    assertFields(source, SOURCE_FIELDS, `sources[${index}]`);
    for (const key of ['id', 'url', 'sha', 'observedAt']) requiredString(source[key], `sources[${index}].${key}`);
    if (sourceIds.has(source.id)) fail(REASON.DUPLICATE_ID, source.id);
    sourceIds.add(source.id);
    if (!SHA.test(source.sha) || Number.isNaN(Date.parse(source.observedAt)) || typeof source.complete !== 'boolean' || !Array.isArray(source.namedGaps)) fail(REASON.INVALID_VALUE, `sources[${index}]`);
  }

  const nodeIds = new Set();
  for (const [index, node] of input.nodes.entries()) {
    assertFields(node, NODE_FIELDS, `nodes[${index}]`);
    for (const key of ['id', 'type', 'label', 'status']) requiredString(node[key], `nodes[${index}].${key}`);
    if (nodeIds.has(node.id)) fail(REASON.DUPLICATE_ID, node.id);
    nodeIds.add(node.id);
    if (!NODE_TYPES.has(node.type) || !STATUSES.has(node.status)) fail(REASON.INVALID_VALUE, node.id);
    if (!Array.isArray(node.sourceRefs) || node.sourceRefs.length === 0) fail(REASON.MISSING_PROVENANCE, node.id);
    if (node.headSha && !SHA.test(node.headSha)) fail(REASON.INVALID_VALUE, `${node.id}.headSha`);
    if (node.reviewedHeadSha && !SHA.test(node.reviewedHeadSha)) fail(REASON.INVALID_VALUE, `${node.id}.reviewedHeadSha`);
    if (node.currentHeadSha && !SHA.test(node.currentHeadSha)) fail(REASON.INVALID_VALUE, `${node.id}.currentHeadSha`);
    if (/\b(inferred|assumed|probably)\b/i.test(node.details ?? '')) fail(REASON.INFERENCE_AS_FACT, node.id);
  }

  const allIds = new Set([...sourceIds, ...nodeIds]);
  const edgeIds = new Set();
  for (const [index, edge] of input.edges.entries()) {
    assertFields(edge, EDGE_FIELDS, `edges[${index}]`);
    for (const key of ['id', 'type', 'from', 'to']) requiredString(edge[key], `edges[${index}].${key}`);
    if (edgeIds.has(edge.id) || allIds.has(edge.id)) fail(REASON.DUPLICATE_ID, edge.id);
    edgeIds.add(edge.id);
    if (!EDGE_TYPES.has(edge.type)) fail(REASON.INVALID_VALUE, edge.id);
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) fail(REASON.DANGLING_REFERENCE, edge.id);
    if (!Array.isArray(edge.sourceRefs) || edge.sourceRefs.length === 0) fail(REASON.MISSING_PROVENANCE, edge.id);
  }
  for (const item of [...input.nodes, ...input.edges]) {
    for (const ref of item.sourceRefs) if (!sourceIds.has(ref)) fail(REASON.MISSING_PROVENANCE, `${item.id}:${ref}`);
  }
  for (const node of input.nodes) {
    if (node.workItemId && !nodeIds.has(node.workItemId)) fail(REASON.DANGLING_REFERENCE, `${node.id}.workItemId`);
    if (node.evidenceRef && !nodeIds.has(node.evidenceRef)) fail(REASON.DANGLING_REFERENCE, `${node.id}.evidenceRef`);
  }
}

function derive(input) {
  const nodes = new Map(input.nodes.map((node) => [node.id, node]));
  const resolved = new Set(input.edges.filter((edge) => edge.type === 'resolves').map((edge) => edge.to));
  const canonicalHeads = {};
  const candidates = new Map();
  for (const decision of input.nodes.filter((node) => node.type === 'OwnerDecision' && node.canonicalDisposition === 'retain')) {
    if (!decision.workItemId || !decision.headSha) fail(REASON.INVALID_VALUE, `${decision.id} lacks workItemId/headSha`);
    const exactReview = input.nodes.some((node) => node.type === 'Review' && node.status === 'retained' && node.reviewedHeadSha === decision.headSha);
    if (!exactReview) fail(REASON.CONFLICTING_CANONICAL_HEADS, `${decision.id} lacks retained exact-head review`);
    const list = candidates.get(decision.workItemId) ?? [];
    list.push(decision.headSha);
    candidates.set(decision.workItemId, list);
  }
  for (const [workItem, heads] of candidates) {
    const unique = [...new Set(heads)];
    if (unique.length !== 1) fail(REASON.CONFLICTING_CANONICAL_HEADS, workItem);
    canonicalHeads[workItem] = unique[0];
  }

  const invalidReviews = input.nodes.filter((node) => node.type === 'Review' && node.reviewedHeadSha && node.currentHeadSha && node.reviewedHeadSha !== node.currentHeadSha).map((node) => node.id).sort();
  const unresolvedBlockers = input.nodes.filter((node) => node.type === 'Blocker' && node.status === 'blocked' && !resolved.has(node.id)).map((node) => node.id).sort();

  const failedByFingerprint = new Map();
  for (const dispatch of input.nodes.filter((node) => node.type === 'Dispatch' && ['failed', 'not-runnable'].includes(node.status) && node.preconditionFingerprint)) {
    const key = `${dispatch.workItemId ?? ''}:${dispatch.preconditionFingerprint}`;
    const prior = failedByFingerprint.get(key);
    if (prior && prior.evidenceRef === dispatch.evidenceRef) fail(REASON.NOT_RUNNABLE_REPEATED_PRECONDITION, dispatch.id);
    failedByFingerprint.set(key, dispatch);
  }

  const incompleteDependencies = new Set(input.edges.filter((edge) => edge.type === 'depends_on' && nodes.get(edge.to)?.status !== 'complete' && nodes.get(edge.to)?.status !== 'merged').map((edge) => edge.from));
  const blockedWork = new Set(input.edges.filter((edge) => edge.type === 'blocks' && !resolved.has(edge.from)).map((edge) => edge.to));
  const runnableWork = input.nodes.filter((node) => node.type === 'WorkItem' && node.runnable === true && !incompleteDependencies.has(node.id) && !blockedWork.has(node.id)).map((node) => node.id).sort();

  const claims = new Map();
  for (const node of input.nodes.filter((item) => item.workItemId && ['Attempt', 'Dispatch', 'Branch', 'PullRequest', 'OwnerDecision'].includes(item.type) && ['active', 'retained'].includes(item.status))) {
    const key = node.workItemId;
    const values = claims.get(key) ?? new Map();
    const identity = node.headSha ?? node.session ?? node.branch ?? String(node.prNumber ?? node.id);
    const bucket = values.get(node.type) ?? new Set();
    bucket.add(identity);
    values.set(node.type, bucket);
    claims.set(key, values);
  }
  const splitBrain = [];
  for (const [workItem, values] of claims) for (const [type, identities] of values) if (identities.size > 1) splitBrain.push(`${workItem}:${type}:${[...identities].sort().join(',')}`);

  const namedGaps = [...input.sources.flatMap((source) => source.namedGaps.map((gap) => `${source.id}:${gap}`)), ...input.nodes.filter((node) => node.type === 'NamedGap').map((node) => `${node.id}:${node.label}`)].sort();
  return { canonicalHeads, invalidReviews, unresolvedBlockers, runnableWork, namedGaps, splitBrain: splitBrain.sort() };
}

function sortObject(value) {
  if (Array.isArray(value)) return value.map(sortObject);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortObject(value[key])]));
  return value;
}

export function stableStringify(value) {
  return `${JSON.stringify(sortObject(value), null, 2)}\n`;
}

export function buildGraph(input) {
  validateInput(input);
  const graph = {
    schemaVersion: input.schemaVersion,
    watermark: input.watermark,
    sources: [...input.sources].sort((a, b) => a.id.localeCompare(b.id)),
    nodes: [...input.nodes].sort((a, b) => a.id.localeCompare(b.id)),
    edges: [...input.edges].sort((a, b) => a.id.localeCompare(b.id)),
    derived: derive(input),
  };
  return stableStringify(graph);
}

async function main(argv) {
  const inputIndex = argv.indexOf('--input');
  const outputIndex = argv.indexOf('--output');
  if (inputIndex < 0 || outputIndex < 0 || !argv[inputIndex + 1] || !argv[outputIndex + 1]) fail(REASON.INVALID_VALUE, 'usage: build-graph.mjs --input fixture.json --output graph.json');
  const input = JSON.parse(await readFile(argv[inputIndex + 1], 'utf8'));
  await writeFile(argv[outputIndex + 1], buildGraph(input), { encoding: 'utf8', flag: 'w' });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).catch((error) => {
    process.stderr.write(`${error.code ?? 'GRAPH000_EXECUTION'} ${error.message}\n`);
    process.exitCode = 1;
  });
}
