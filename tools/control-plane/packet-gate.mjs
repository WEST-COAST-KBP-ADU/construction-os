#!/usr/bin/env node
// KBP Packet Gate — validation-only control-plane controller.
//
// What this is
// ------------
// A deterministic, read-only validator for the repository-backed control plane
// described in governance/control-plane/README.md. It answers exactly one
// question: is the observable transition self-consistent with the packet?
//
// What this is not
// ----------------
// It is not Owner acceptance, engineering approval, or certification. A passing
// run is evidence, not adoption. It launches no worker, mutates nothing, opens
// no network connection, reads no secret, and calls no model or API. Every fact
// it reports comes from the event payload it was handed, the fixture it was
// handed, or files already present in the checkout.
//
// Honesty rule
// ------------
// GitHub cannot prove an engagement-level fact from API identity alone. Two
// distinct engagements routinely share one GitHub account. Where a required
// fact cannot be observed, this controller emits MANUAL_EVIDENCE_REQUIRED and
// names the exact missing evidence. It never infers the fact, and never
// represents a human-supplied fact as an automated one.
//
// Self-scan note
// --------------
// This file is itself one of the executable surfaces scanned for AI-dispatch
// tokens (see auditControlPlaneFiles). The token table below is therefore
// assembled from fragments so that no scanned literal ever appears contiguously
// in this source. That is deliberate, and packet-gate.test.mjs asserts the
// resulting property: the controller passes its own scan.
//
// Usage
// -----
//   node tools/control-plane/packet-gate.mjs --event-name <name> --event-path <file>
//   node tools/control-plane/packet-gate.mjs --fixture <file.json>
//   node tools/control-plane/packet-gate.mjs --fixture <file.json> --repo-root <dir>
//
// Machine-readable JSON is written to stdout. The human summary is written to
// stderr, so stdout stays parseable. Exit code 0 means consistent, 1 means a
// fail-closed violation was found, 2 means the controller could not run.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const GATE_NAME = 'KBP Packet Gate';
export const SCHEMA = 'kbp.control-plane.gate/v1';

// ---------------------------------------------------------------------------
// Stable failure codes. Tests assert these identifiers, never message text.
// ---------------------------------------------------------------------------

export const CODES = Object.freeze({
  MISSING_REQUIRED_FIELD: 'KBP001_MISSING_REQUIRED_FIELD',
  BASE_SHA_NOT_EXACT: 'KBP002_BASE_SHA_NOT_EXACT',
  ALLOWLIST_AMBIGUOUS: 'KBP003_ALLOWLIST_AMBIGUOUS',
  OPEN_DELEGATION: 'KBP004_OPEN_DELEGATION',
  LABEL_EXCLUSIVITY: 'KBP005_LABEL_EXCLUSIVITY',
  ACTIVE_WITHOUT_STARTED: 'KBP006_ACTIVE_WITHOUT_STARTED',
  WIP_LIMIT_EXCEEDED: 'KBP007_WIP_LIMIT_EXCEEDED',
  DOMAIN_LEASE_CONFLICT: 'KBP008_DOMAIN_LEASE_CONFLICT',
  PREDECESSOR_NOT_MERGED: 'KBP009_PREDECESSOR_NOT_MERGED',
  MISSING_BRANCH_OR_DRAFT_PR: 'KBP010_MISSING_BRANCH_OR_DRAFT_PR',
  PR_BINDING_MISMATCH: 'KBP011_PR_BINDING_MISMATCH',
  PATH_OUTSIDE_ALLOWLIST: 'KBP012_PATH_OUTSIDE_ALLOWLIST',
  PR_READY_BEFORE_OWNER_GATE: 'KBP013_PR_READY_BEFORE_OWNER_GATE',
  RESULT_INCOMPLETE: 'KBP014_RESULT_INCOMPLETE',
  REVIEW_HEAD_MISMATCH: 'KBP015_REVIEW_HEAD_MISMATCH',
  REVIEW_STALE_NEW_COMMIT: 'KBP016_REVIEW_STALE_NEW_COMMIT',
  AUTHOR_SELF_REVIEW: 'KBP017_AUTHOR_SELF_REVIEW',
  GATE_WITHOUT_REVIEW_EVIDENCE: 'KBP018_GATE_WITHOUT_REVIEW_EVIDENCE',
  UNSUPPORTED_RUNTIME_CLAIM: 'KBP019_UNSUPPORTED_RUNTIME_CLAIM',
  AI_DISPATCH_OR_WRITE_PERMISSION: 'KBP020_AI_DISPATCH_OR_WRITE_PERMISSION',
  MANUAL_EVIDENCE_REQUIRED: 'MANUAL_EVIDENCE_REQUIRED',
});

export const SUPPORTED_EVENTS = Object.freeze([
  'issues',
  'issue_comment',
  'pull_request',
  'pull_request_review',
  'workflow_dispatch',
]);

// Lifecycle sets, stated once so every check reads the same definition.
export const ACTIVE_MUTATION_STATES = Object.freeze([
  'state:active',
  'state:result',
  'state:review',
  'state:owner-gate',
]);
export const PR_REQUIRED_STATES = Object.freeze([
  'state:result',
  'state:review',
  'state:owner-gate',
]);
export const MAX_ACTIVE_MUTATION_PACKETS = 2;

// Executable surfaces scanned for AI-dispatch tokens and write permissions.
// The exclusion is declared here rather than hidden, so it can be audited.
export const SCANNED_SURFACES = Object.freeze({
  workflowDir: '.github/workflows',
  scripts: ['tools/control-plane/packet-gate.mjs'],
  documentedExclusions: [
    // The test file declares the forbidden tokens as fixtures. Scanning it
    // would make the suite unable to test the scanner at all.
    'tools/control-plane/packet-gate.test.mjs',
  ],
});

// ---------------------------------------------------------------------------
// Small utilities
// ---------------------------------------------------------------------------

const HEX40 = /^[0-9a-f]{40}$/;
const DASH = '[\\u2014\\u2013-]'; // em dash, en dash, hyphen

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function text(value) {
  return String(value ?? '').trim();
}

function lines(value) {
  return String(value ?? '').split(/\r?\n/);
}

function unique(list) {
  return [...new Set(list)];
}

// ---------------------------------------------------------------------------
// Minimal YAML subset parser
//
// Deliberately dependency-free. It supports the subset this control plane
// actually uses: block mappings, block sequences (scalar and mapping items),
// inline flow sequences, quoted scalars, block scalars, and comments. It does
// not apply YAML 1.1 boolean coercion, so the `on:` key stays the string "on"
// rather than becoming true — which is what an audit wants to see.
// ---------------------------------------------------------------------------

function stripComment(line) {
  let out = '';
  let quote = null;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (quote) {
      out += ch;
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      out += ch;
      continue;
    }
    if (ch === '#' && (i === 0 || /\s/.test(line[i - 1]))) break;
    out += ch;
  }
  return out.replace(/\s+$/, '');
}

/**
 * A YAML plain (unquoted) scalar may not contain ": " or " #" — a real parser
 * reads those as a mapping separator and a comment. Accepting them silently
 * would let a file pass this audit and then fail on GitHub, so the ambiguity is
 * rejected here rather than tolerated.
 */
function assertUnambiguousPlainScalar(raw, key) {
  const value = String(raw).trim();
  if (!value) return;
  if (/^["'[{]/.test(value)) return;
  if (value === '|' || value === '>' || value === '|-' || value === '>-') return;
  if (/:\s/.test(value)) {
    throw new Error(`ambiguous YAML: the plain scalar for "${key}" contains ": " and must be quoted`);
  }
  if (/\s#/.test(value)) {
    throw new Error(`ambiguous YAML: the plain scalar for "${key}" contains " #" and must be quoted`);
  }
}

function parseScalar(raw) {
  const value = raw.trim();
  if (value.startsWith('[') && value.endsWith(']')) {
    const inner = value.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(',').map((part) => parseScalar(part));
  }
  if (
    (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
    (value.startsWith("'") && value.endsWith("'") && value.length >= 2)
  ) {
    return value.slice(1, -1);
  }
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null' || value === '~') return null;
  if (/^-?\d+$/.test(value)) return Number(value);
  return value;
}

export function parseSimpleYaml(source) {
  const raw = String(source).split(/\r?\n/);
  const rows = [];
  for (const original of raw) {
    const stripped = stripComment(original);
    if (stripped.trim() === '') continue;
    const indent = stripped.length - stripped.replace(/^\s*/, '').length;
    rows.push({ indent, content: stripped.trim(), original });
  }

  let cursor = 0;

  function blockScalar(parentIndent) {
    const collected = [];
    while (cursor < rows.length && rows[cursor].indent > parentIndent) {
      collected.push(rows[cursor].original);
      cursor += 1;
    }
    if (collected.length === 0) return '';
    const minIndent = Math.min(
      ...collected.map((line) => line.length - line.replace(/^\s*/, '').length),
    );
    return collected.map((line) => line.slice(minIndent)).join('\n');
  }

  function parseBlock(indent) {
    if (cursor >= rows.length) return null;
    const head = rows[cursor].content;
    if (head === '-' || head.startsWith('- ')) return parseSequence(indent);
    return parseMapping(indent);
  }

  function parseMapping(indent) {
    const map = {};
    while (cursor < rows.length && rows[cursor].indent >= indent) {
      if (rows[cursor].indent > indent) {
        cursor += 1; // defensive: unexpected deeper line with no owner
        continue;
      }
      const { content } = rows[cursor];
      if (content === '-' || content.startsWith('- ')) break;
      const match = /^([^:]+):\s*(.*)$/.exec(content);
      if (!match) {
        cursor += 1;
        continue;
      }
      const key = String(parseScalar(match[1].trim()));
      const rest = match[2].trim();
      cursor += 1;
      if (rest === '|' || rest === '>' || rest === '|-' || rest === '>-') {
        map[key] = blockScalar(indent);
      } else if (rest === '') {
        if (cursor < rows.length && rows[cursor].indent > indent) {
          map[key] = parseBlock(rows[cursor].indent);
        } else {
          map[key] = null;
        }
      } else {
        assertUnambiguousPlainScalar(rest, key);
        map[key] = parseScalar(rest);
      }
    }
    return map;
  }

  function parseSequence(indent) {
    const list = [];
    while (
      cursor < rows.length &&
      rows[cursor].indent === indent &&
      (rows[cursor].content === '-' || rows[cursor].content.startsWith('- '))
    ) {
      const first = rows[cursor].content === '-' ? '' : rows[cursor].content.slice(2).trim();
      const itemIndent = indent + 2;
      if (first === '') {
        cursor += 1;
        if (cursor < rows.length && rows[cursor].indent > indent) {
          list.push(parseBlock(rows[cursor].indent));
        } else {
          list.push(null);
        }
        continue;
      }
      const looksLikeMapping =
        /^[^:'"[\]]+:(\s|$)/.test(first) && !first.startsWith('"') && !first.startsWith("'");
      if (looksLikeMapping) {
        rows[cursor] = { indent: itemIndent, content: first, original: first };
        list.push(parseMapping(itemIndent));
      } else {
        assertUnambiguousPlainScalar(first, '(sequence item)');
        list.push(parseScalar(first));
        cursor += 1;
      }
    }
    return list;
  }

  if (rows.length === 0) return {};
  return parseBlock(rows[0].indent);
}

// ---------------------------------------------------------------------------
// Issue Form parsing
//
// A GitHub Issue Form renders each field as "### <label>" followed by its
// value. Field descriptions and markdown blocks are display-only and never
// appear in the created body — so the parser sees exactly the operator's data.
// ---------------------------------------------------------------------------

export const FIELD_HEADINGS = Object.freeze({
  packet_id: 'Packet ID',
  outcome: 'Single outcome',
  repository: 'Repository',
  base_sha: 'Exact base SHA',
  worker: 'Worker',
  model_id: 'Exact model ID',
  clone: 'Clone',
  session: 'Session label',
  mode: 'Mode',
  branch_or_target: 'Branch or read-only target',
  read_order: 'Authoritative read order',
  allowlist: 'Exact allowlist',
  domain_lease: 'Domain lease',
  prohibitions: 'Prohibitions',
  quality_target: 'Measurable quality target',
  gates: 'Deterministic gates',
  reviewer: 'Non-author reviewer',
  integration_order: 'Integration order and dependencies',
  stop_conditions: 'Fail-closed stop conditions',
  result_contract: 'RESULT and cleanup contract',
  confirmations: 'Confirmations',
});

export const REQUIRED_FIELDS = Object.freeze(Object.keys(FIELD_HEADINGS));

const EMPTY_MARKERS = new Set(['', '_no response_', '-', 'n/a', 'na', 'tbd', 'todo']);

export function parseIssueForm(body) {
  const sections = {};
  let current = null;
  let buffer = [];
  const flush = () => {
    if (current !== null) sections[current] = buffer.join('\n').trim();
  };
  for (const line of lines(body)) {
    const heading = /^###\s+(.+?)\s*$/.exec(line);
    if (heading) {
      flush();
      current = heading[1].trim();
      buffer = [];
    } else if (current !== null) {
      buffer.push(line);
    }
  }
  flush();

  const fields = {};
  for (const [key, heading] of Object.entries(FIELD_HEADINGS)) {
    fields[key] = sections[heading] ?? null;
  }
  return { sections, fields };
}

function isEmptyField(value) {
  if (value === null || value === undefined) return true;
  return EMPTY_MARKERS.has(text(value).toLowerCase());
}

// ---------------------------------------------------------------------------
// Base SHA
// ---------------------------------------------------------------------------

export function extractBaseSha(raw) {
  const value = text(raw).replace(/`/g, '');
  if (!value) return { ok: false, reason: 'empty' };
  const at = value.lastIndexOf('@');
  const candidate = (at >= 0 ? value.slice(at + 1) : value).trim();
  if (HEX40.test(candidate)) return { ok: true, sha: candidate };
  if (/^[0-9a-f]{7,39}$/i.test(candidate)) {
    return { ok: false, value: candidate, reason: 'abbreviated commit SHA; a full 40-character SHA is required' };
  }
  if (/^(head|main|master|latest|current|origin\/\w+)$/i.test(candidate)) {
    return { ok: false, value: candidate, reason: 'moving reference instead of a pinned 40-character SHA' };
  }
  return { ok: false, value: candidate, reason: 'not a full 40-character lowercase hexadecimal SHA' };
}

// ---------------------------------------------------------------------------
// Allowlist
// ---------------------------------------------------------------------------

const EXTENSIONLESS_FILES = new Set([
  'LICENSE',
  'Dockerfile',
  'Makefile',
  'CODEOWNERS',
  'NOTICE',
]);

export function allowlistPathProblem(path) {
  if (/[*?[\]]/.test(path)) return 'contains a glob or wildcard character';
  if (path.endsWith('/')) return 'is directory-only (trailing slash)';
  if (path.includes('...')) return 'contains an ellipsis';
  if (path.includes(' ')) return 'contains whitespace';
  const base = path.split('/').filter(Boolean).pop() ?? '';
  if (!base) return 'is not a concrete file path';
  if (!base.includes('.') && !EXTENSIONLESS_FILES.has(base)) {
    return 'is directory-only or otherwise not a concrete file path';
  }
  return null;
}

export function parseAllowlist(raw) {
  const entries = [];
  const problems = [];
  const value = text(raw);
  if (/^none$/i.test(value)) return { entries, problems, none: true };
  if (!value) {
    problems.push({ line: '', reason: 'allowlist is empty' });
    return { entries, problems, none: false };
  }
  for (const original of lines(value)) {
    const line = original.replace(/^[-*]\s+/, '').replace(/`/g, '').trim();
    if (!line) continue;
    const match = /^(create|modify|delete)\s+(.+)$/i.exec(line);
    if (!match) {
      problems.push({
        line,
        reason: 'is not exactly "<create|modify|delete> <one concrete file path>"',
      });
      continue;
    }
    const action = match[1].toLowerCase();
    const path = match[2].trim();
    const problem = allowlistPathProblem(path);
    if (problem) problems.push({ line, reason: problem });
    else entries.push({ action, path });
  }
  if (entries.length === 0 && problems.length === 0) {
    problems.push({ line: '', reason: 'allowlist is empty' });
  }
  return { entries, problems, none: false };
}

// ---------------------------------------------------------------------------
// Open delegation
//
// Scanned only in fields that delegate work. The prohibitions and stop-condition
// fields legitimately quote these phrases in order to forbid them, and flagging
// that would punish a correct packet.
// ---------------------------------------------------------------------------

export const OPEN_DELEGATION_PHRASES = Object.freeze([
  'relevant docs',
  'make it premium',
  'best asset',
  'smallest suitable module',
  'as appropriate',
  'where appropriate',
  'use your judgement',
  'use your judgment',
  'and similar',
  'or equivalent files',
]);

export const DELEGATING_FIELDS = Object.freeze([
  'outcome',
  'read_order',
  'allowlist',
  'quality_target',
  'gates',
  'integration_order',
  'branch_or_target',
  'domain_lease',
  'result_contract',
]);

export function findOpenDelegation(fields) {
  const hits = [];
  for (const field of DELEGATING_FIELDS) {
    const value = text(fields?.[field]).toLowerCase();
    if (!value) continue;
    for (const phrase of OPEN_DELEGATION_PHRASES) {
      if (value.includes(phrase)) hits.push({ field, phrase });
    }
  }
  return hits;
}

// ---------------------------------------------------------------------------
// Label manifest and exclusivity
// ---------------------------------------------------------------------------

export function loadLabelManifest(repoRoot) {
  const path = join(repoRoot, 'governance/control-plane/labels-v1.json');
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function checkLabelExclusivity(labels, manifest) {
  const applied = Array.isArray(labels) ? labels.map((l) => (typeof l === 'string' ? l : l?.name)) : [];
  const declared = new Set((manifest?.labels ?? []).map((l) => l.name));
  const problems = [];
  for (const category of manifest?.categories ?? []) {
    const inCategory = applied.filter((name) => typeof name === 'string' && name.startsWith(category.prefix));
    if (category.exclusivity !== 'exactly-one') continue;
    if (inCategory.length !== 1) {
      problems.push({
        category: category.id,
        applied: inCategory,
        reason: inCategory.length === 0 ? 'no label in this exclusive category' : 'more than one label in this exclusive category',
      });
      continue;
    }
    if (!declared.has(inCategory[0])) {
      problems.push({
        category: category.id,
        applied: inCategory,
        reason: 'label is not declared in labels-v1.json',
      });
    }
  }
  return problems;
}

// ---------------------------------------------------------------------------
// Executable-surface audit: write permissions and AI dispatch
// ---------------------------------------------------------------------------

// Assembled from fragments so no scanned literal appears contiguously in this
// file. See the self-scan note at the top.
const F = (...parts) => parts.join('');

export const AI_DISPATCH_TOKENS = Object.freeze([
  F('@co', 'dex'),
  F('claude-code', '-action'),
  F('anthropics/', 'claude'),
  F('api.', 'anthropic', '.com'),
  F('api.', 'openai', '.com'),
  F('repository_', 'dispatch'),
  F('actions/', 'github-script'),
  F('gh ', 'workflow ', 'run'),
  F('gh ', 'issue ', 'comment'),
  F('gh ', 'pr ', 'comment'),
  F('gh ', 'pr ', 'review'),
  F('gh ', 'pr ', 'merge'),
  F('peter-evans/', 'create-or-update-comment'),
  F('peter-evans/', 'create-pull-request'),
  F('OPENAI_', 'API_KEY'),
  F('ANTHROPIC_', 'API_KEY'),
]);

const WRITE_ALL = F('write', '-all');

/**
 * Structural read-only audit of a workflow's permission declarations.
 * Returns every permission block found and every non-read scope in them.
 */
export function auditWorkflowPermissions(yamlSource) {
  const rows = [];
  for (const original of String(yamlSource).split(/\r?\n/)) {
    const stripped = stripComment(original);
    if (stripped.trim() === '') continue;
    rows.push({
      indent: stripped.length - stripped.replace(/^\s*/, '').length,
      content: stripped.trim(),
    });
  }
  const blocks = [];
  const writeScopes = [];
  for (let i = 0; i < rows.length; i += 1) {
    const match = /^permissions:\s*(.*)$/.exec(rows[i].content);
    if (!match) continue;
    const inline = match[1].trim();
    if (inline) {
      blocks.push({ inline: true, scopes: { _inline: inline } });
      if (inline.toLowerCase() !== 'read-all' && inline !== '{}') {
        writeScopes.push({ scope: '(inline)', value: inline });
      }
      continue;
    }
    const scopes = {};
    const baseIndent = rows[i].indent;
    for (let j = i + 1; j < rows.length && rows[j].indent > baseIndent; j += 1) {
      const scope = /^([A-Za-z][\w-]*):\s*(\S+)\s*$/.exec(rows[j].content);
      if (!scope) continue;
      scopes[scope[1]] = scope[2];
      if (scope[2].toLowerCase() !== 'read' && scope[2].toLowerCase() !== 'none') {
        writeScopes.push({ scope: scope[1], value: scope[2] });
      }
    }
    blocks.push({ inline: false, scopes });
  }
  const lowered = String(yamlSource).toLowerCase();
  if (lowered.includes(WRITE_ALL)) {
    writeScopes.push({ scope: '(all)', value: WRITE_ALL });
  }
  return { blocks, writeScopes, hasPermissions: blocks.length > 0 };
}

export function findDispatchTokens(source) {
  const lowered = String(source).toLowerCase();
  return AI_DISPATCH_TOKENS.filter((token) => lowered.includes(token.toLowerCase()));
}

/**
 * Audits every scanned executable surface. `files` maps path -> content; when
 * omitted the surfaces are read from `repoRoot`.
 */
export function auditControlPlaneFiles({ repoRoot, files } = {}) {
  const surfaces = {};
  if (files) {
    Object.assign(surfaces, files);
  } else if (repoRoot) {
    const workflowDir = join(repoRoot, SCANNED_SURFACES.workflowDir);
    if (existsSync(workflowDir)) {
      for (const name of readdirSync(workflowDir)) {
        if (!/\.ya?ml$/i.test(name)) continue;
        surfaces[`${SCANNED_SURFACES.workflowDir}/${name}`] = readFileSync(join(workflowDir, name), 'utf8');
      }
    }
    for (const script of SCANNED_SURFACES.scripts) {
      const full = join(repoRoot, script);
      if (existsSync(full)) surfaces[script] = readFileSync(full, 'utf8');
    }
  }

  const violations = [];
  const audited = [];
  for (const [path, content] of Object.entries(surfaces)) {
    if (SCANNED_SURFACES.documentedExclusions.includes(path)) continue;
    audited.push(path);
    const isYaml = /\.ya?ml$/i.test(path);
    if (isYaml) {
      const permissions = auditWorkflowPermissions(content);
      if (!permissions.hasPermissions) {
        violations.push({
          path,
          kind: 'permissions',
          detail: 'workflow declares no explicit permissions block; the default token scope is not read-only by declaration',
        });
      }
      for (const scope of permissions.writeScopes) {
        violations.push({
          path,
          kind: 'permissions',
          detail: `permission scope "${scope.scope}" is "${scope.value}", which is not read-only`,
        });
      }
    }
    for (const token of findDispatchTokens(content)) {
      violations.push({ path, kind: 'dispatch', detail: `contains AI-dispatch or write-capable token "${token}"` });
    }
  }
  return { audited, violations, excluded: [...SCANNED_SURFACES.documentedExclusions] };
}

// ---------------------------------------------------------------------------
// Unsupported runtime claims on a docs-only / infrastructure diff
// ---------------------------------------------------------------------------

const DOCS_OR_INFRA = [/\.md$/i, /\.json$/i, /\.ya?ml$/i, /\.mjs$/i, /\.txt$/i];

export function isDocsOrInfraOnly(paths) {
  if (!Array.isArray(paths) || paths.length === 0) return false;
  return paths.every(
    (p) =>
      DOCS_OR_INFRA.some((rx) => rx.test(p)) ||
      p.startsWith('.github/') ||
      p.startsWith('governance/') ||
      p.startsWith('tools/'),
  );
}

const RUNTIME_CLAIM_PATTERNS = Object.freeze([
  /https?:\/\/[^\s)]*\.vercel\.app/i,
  /\bdpl_[A-Za-z0-9]+/,
  /\bHTTP\s*200\b/i,
  /\bverified in (?:the )?browser\b/i,
  /\brendered matrix\b/i,
  /\broute smoke\b/i,
  /\bproduction (?:deployment|verified|verification) (?:is )?(?:complete|green|passing|ready)\b/i,
  /\bdeployed to production\b/i,
  /\bscreenshot attached\b/i,
]);

const NEGATION_PATTERNS = Object.freeze([
  /\bnot applicable\b/i,
  /\bn\/a\b/i,
  /\bnone\b/i,
  /\bno preview\b/i,
  /\buntouched\b/i,
  /\bnot claimed\b/i,
  /\bnot required\b/i,
  /\bproduces no\b/i,
  /\bmay be claimed\b/i,
  /\bdo not\b/i,
  /\bnever\b/i,
  /\bis not\b/i,
  /\bno browser\b/i,
]);

export function findRuntimeClaims(body) {
  const hits = [];
  for (const line of lines(body)) {
    if (NEGATION_PATTERNS.some((rx) => rx.test(line))) continue;
    for (const rx of RUNTIME_CLAIM_PATTERNS) {
      const match = rx.exec(line);
      if (match) hits.push({ line: line.trim(), claim: match[0] });
    }
  }
  return hits;
}

// ---------------------------------------------------------------------------
// Comment helpers
// ---------------------------------------------------------------------------

function commentsMatching(comments, header, packetId) {
  const rx = new RegExp(`^\\s*${escapeRegExp(header)}\\s*${DASH}\\s*${escapeRegExp(packetId)}\\b`, 'i');
  return (comments ?? []).filter((c) => rx.test(text(c?.body).split(/\r?\n/)[0] ?? ''));
}

export function auditResultComment(body, allowlistPaths = [], options = {}) {
  // A read-only packet changes no path and opens no pull request, so those two
  // elements are required only of a mutation packet.
  const { requirePullRequest = true, requireChangedPaths = true } = options;
  const missing = [];
  const value = String(body ?? '');
  if (!/\b[0-9a-f]{40}\b/.test(value)) missing.push('exact 40-character head SHA');
  if (!/`[^`]+`/.test(value) && !/\bcommand\b/i.test(value)) missing.push('command and observed-output evidence');
  if (requireChangedPaths) {
    const hasPath =
      (allowlistPaths ?? []).length === 0
        ? /changed path/i.test(value)
        : allowlistPaths.some((p) => value.includes(p));
    if (!hasPath) missing.push('changed paths');
  }
  if (requirePullRequest && !/https?:\/\/github\.com\/[^\s)]+\/pull\/\d+/.test(value)) {
    missing.push('Draft pull request URL');
  }
  if (!/residual risk/i.test(value)) missing.push('residual risk');
  return missing;
}

const NON_AUTHORSHIP_PATTERNS = [
  /non-author/i,
  /did not author/i,
  /authored neither/i,
  /authored none/i,
  /not the author/i,
];

export function declaresIndependentEngagement(body) {
  const value = String(body ?? '');
  const declaresModel = /\bmodel\b/i.test(value) || /\blane\b/i.test(value);
  const declaresNonAuthorship = NON_AUTHORSHIP_PATTERNS.some((rx) => rx.test(value));
  return declaresModel && declaresNonAuthorship;
}

// ---------------------------------------------------------------------------
// Dependencies
// ---------------------------------------------------------------------------

export function parseDependsOn(raw) {
  const value = text(raw);
  if (!value) return [];
  const found = [];
  for (const line of lines(value)) {
    const match = /depends-on:\s*(.+)$/i.exec(line);
    if (!match) continue;
    const rest = match[1].trim();
    if (/^none$/i.test(rest)) continue;
    for (const ref of rest.matchAll(/#(\d+)/g)) found.push(Number(ref[1]));
  }
  return unique(found);
}

// ---------------------------------------------------------------------------
// Normalization
// ---------------------------------------------------------------------------

function labelNames(labels) {
  if (!Array.isArray(labels)) return [];
  return labels.map((l) => (typeof l === 'string' ? l : l?.name)).filter(Boolean);
}

export function buildPacket(issue) {
  const { fields } = parseIssueForm(issue?.body);
  const packetId = text(fields.packet_id) || text(issue?.title).replace(/^\[([^\]]+)\].*$/, '$1');
  const base = extractBaseSha(fields.base_sha);
  const allowlist = parseAllowlist(fields.allowlist);
  const labels = labelNames(issue?.labels);
  const mode = labels.includes('mode:mutation')
    ? 'mutation'
    : labels.includes('mode:read-only')
      ? 'read-only'
      : text(fields.mode).toLowerCase() || null;
  return {
    id: packetId,
    fields,
    labels,
    mode,
    baseSha: base.ok ? base.sha : null,
    baseProblem: base.ok ? null : base,
    branch: text(fields.branch_or_target) || null,
    allowlist,
    allowlistPaths: allowlist.entries.map((e) => e.path),
    domain: labels.find((l) => l.startsWith('domain:')) ?? null,
    dependsOn: parseDependsOn(fields.integration_order),
    state: labels.find((l) => l.startsWith('state:')) ?? null,
  };
}

/**
 * Normalizes a live GitHub Actions event payload into the controller's input
 * shape. No network call is made, so anything the payload does not carry is
 * reported as missing evidence rather than fetched.
 */
export function normalizeEvent(eventName, payload) {
  const input = { event: { name: eventName, action: payload?.action ?? null }, evidence: { source: 'github-event' } };
  if (payload?.issue) {
    input.issue = {
      number: payload.issue.number,
      title: payload.issue.title,
      body: payload.issue.body,
      state: payload.issue.state,
      labels: labelNames(payload.issue.labels),
      author: payload.issue.user?.login ?? null,
      comments: payload.comment ? [{ id: payload.comment.id, author: payload.comment.user?.login ?? null, body: payload.comment.body }] : [],
      commentsComplete: false,
    };
  }
  if (payload?.pull_request) {
    const pr = payload.pull_request;
    input.pullRequest = {
      number: pr.number,
      draft: Boolean(pr.draft),
      merged: Boolean(pr.merged),
      body: pr.body,
      author: pr.user?.login ?? null,
      base: { ref: pr.base?.ref ?? null, sha: pr.base?.sha ?? null },
      head: { ref: pr.head?.ref ?? null, sha: pr.head?.sha ?? null },
      changedFiles: null, // not present in the event payload
      commits: null,
    };
  }
  if (payload?.review) {
    input.reviews = [
      {
        author: payload.review.user?.login ?? null,
        body: payload.review.body,
        state: payload.review.state,
        commitId: payload.review.commit_id ?? null,
        submittedAt: payload.review.submitted_at ?? null,
      },
    ];
  }
  return input;
}

// ---------------------------------------------------------------------------
// Evaluation
// ---------------------------------------------------------------------------

export function evaluate(rawInput = {}) {
  const input = rawInput ?? {};
  const eventName = input.event?.name ?? 'workflow_dispatch';
  const failures = [];
  const notices = [];
  const checks = [];

  const fail = (id, code, message, detail) => {
    failures.push({ code, message, ...(detail ? { detail } : {}) });
    checks.push({ id, code, status: 'fail' });
  };
  const pass = (id, code) => checks.push({ id, code, status: 'pass' });
  const skip = (id, code, reason) => checks.push({ id, code, status: 'skip', reason });
  const manual = (id, code, subject, message) => {
    notices.push({ code: CODES.MANUAL_EVIDENCE_REQUIRED, check: code, subject, message });
    checks.push({ id, code, status: 'manual' });
  };

  const repoRoot = input.repoRoot ? resolve(input.repoRoot) : null;
  const manifest = input.labelManifest ?? (repoRoot ? loadLabelManifest(repoRoot) : null);

  const issue = input.issue ?? null;
  const pr = input.pullRequest ?? null;
  const reviews = input.reviews ?? [];
  const board = input.board ?? null;

  const packet = issue ? buildPacket(issue) : null;
  const labels = packet?.labels ?? [];
  const isMutation = packet?.mode === 'mutation';

  // --- 1. required fields -------------------------------------------------
  if (packet) {
    const missing = [];
    for (const field of REQUIRED_FIELDS) {
      if (isEmptyField(packet.fields[field])) missing.push(FIELD_HEADINGS[field]);
    }
    const confirmations = text(packet.fields.confirmations);
    if (confirmations) {
      const boxes = [...confirmations.matchAll(/^\s*[-*]\s*\[( |x|X)\]/gm)];
      const unchecked = boxes.filter((b) => b[1] === ' ').length;
      if (boxes.length === 0) missing.push(`${FIELD_HEADINGS.confirmations} (no checkbox found)`);
      else if (unchecked > 0) missing.push(`${FIELD_HEADINGS.confirmations} (${unchecked} unchecked)`);
    }
    if (missing.length) {
      fail('required-fields', CODES.MISSING_REQUIRED_FIELD, `Issue is missing ${missing.length} required packet field(s).`, missing);
    } else {
      pass('required-fields', CODES.MISSING_REQUIRED_FIELD);
    }
  } else {
    skip('required-fields', CODES.MISSING_REQUIRED_FIELD, 'no Issue in this event');
  }

  // --- 2. exact base ------------------------------------------------------
  if (packet) {
    if (packet.baseProblem) {
      fail('base-sha', CODES.BASE_SHA_NOT_EXACT, `Base SHA is ${packet.baseProblem.reason}.`, packet.baseProblem.value ?? null);
    } else {
      pass('base-sha', CODES.BASE_SHA_NOT_EXACT);
    }
  } else {
    skip('base-sha', CODES.BASE_SHA_NOT_EXACT, 'no Issue in this event');
  }

  // --- 3. allowlist precision --------------------------------------------
  if (packet) {
    if (packet.allowlist.none && isMutation) {
      fail('allowlist', CODES.ALLOWLIST_AMBIGUOUS, 'A mutation packet declared an allowlist of "none".');
    } else if (packet.allowlist.problems.length) {
      fail(
        'allowlist',
        CODES.ALLOWLIST_AMBIGUOUS,
        `Allowlist has ${packet.allowlist.problems.length} ambiguous or non-concrete entr(ies).`,
        packet.allowlist.problems,
      );
    } else {
      pass('allowlist', CODES.ALLOWLIST_AMBIGUOUS);
    }
  } else {
    skip('allowlist', CODES.ALLOWLIST_AMBIGUOUS, 'no Issue in this event');
  }

  // --- 4. open delegation -------------------------------------------------
  if (packet) {
    const hits = findOpenDelegation(packet.fields);
    if (hits.length) {
      fail('open-delegation', CODES.OPEN_DELEGATION, `Packet contains ${hits.length} open-delegation phrase(s) in a delegating field.`, hits);
    } else {
      pass('open-delegation', CODES.OPEN_DELEGATION);
    }
  } else {
    skip('open-delegation', CODES.OPEN_DELEGATION, 'no Issue in this event');
  }

  // --- 5. label exclusivity ----------------------------------------------
  if (packet && manifest) {
    const problems = checkLabelExclusivity(labels, manifest);
    if (problems.length) {
      fail('label-exclusivity', CODES.LABEL_EXCLUSIVITY, `${problems.length} exclusive label category(ies) are not satisfied.`, problems);
    } else {
      pass('label-exclusivity', CODES.LABEL_EXCLUSIVITY);
    }
  } else if (packet) {
    manual('label-exclusivity', CODES.LABEL_EXCLUSIVITY, 'labels', 'labels-v1.json was not available, so exclusive label categories could not be checked.');
  } else {
    skip('label-exclusivity', CODES.LABEL_EXCLUSIVITY, 'no Issue in this event');
  }

  // --- 6. state:active requires persisted STARTED -------------------------
  if (packet && labels.includes('state:active')) {
    if (issue.commentsComplete === false) {
      manual('started-evidence', CODES.ACTIVE_WITHOUT_STARTED, `issue #${issue.number}`, 'The event payload does not carry the full comment history, so the persisted STARTED record cannot be confirmed here.');
    } else if (commentsMatching(issue.comments, 'STARTED', packet.id).length === 0) {
      fail('started-evidence', CODES.ACTIVE_WITHOUT_STARTED, `Issue is state:active with no persisted "STARTED — ${packet.id}" record.`);
    } else {
      pass('started-evidence', CODES.ACTIVE_WITHOUT_STARTED);
    }
  } else {
    skip('started-evidence', CODES.ACTIVE_WITHOUT_STARTED, 'issue is not state:active');
  }

  // --- 7 / 8. WIP and domain lease ---------------------------------------
  if (board?.issues) {
    const activeMutations = board.issues.filter((entry) => {
      const names = labelNames(entry.labels);
      return names.includes('mode:mutation') && names.some((n) => ACTIVE_MUTATION_STATES.includes(n));
    });
    if (activeMutations.length > MAX_ACTIVE_MUTATION_PACKETS) {
      fail(
        'wip-limit',
        CODES.WIP_LIMIT_EXCEEDED,
        `${activeMutations.length} active mutation packets exceed the maximum of ${MAX_ACTIVE_MUTATION_PACKETS}.`,
        activeMutations.map((e) => e.number),
      );
    } else {
      pass('wip-limit', CODES.WIP_LIMIT_EXCEEDED);
    }

    const conflicts = [];
    for (let a = 0; a < activeMutations.length; a += 1) {
      for (let b = a + 1; b < activeMutations.length; b += 1) {
        const left = activeMutations[a];
        const right = activeMutations[b];
        const leftDomain = labelNames(left.labels).find((n) => n.startsWith('domain:'));
        const rightDomain = labelNames(right.labels).find((n) => n.startsWith('domain:'));
        if (leftDomain && rightDomain && leftDomain === rightDomain) {
          conflicts.push({ issues: [left.number, right.number], domain: leftDomain });
        }
        const shared = (left.allowlistPaths ?? []).filter((p) => (right.allowlistPaths ?? []).includes(p));
        if (shared.length) conflicts.push({ issues: [left.number, right.number], paths: shared });
      }
    }
    if (conflicts.length) {
      fail('domain-lease', CODES.DOMAIN_LEASE_CONFLICT, `${conflicts.length} overlapping active mutation lease(s).`, conflicts);
    } else {
      pass('domain-lease', CODES.DOMAIN_LEASE_CONFLICT);
    }
  } else {
    manual('wip-limit', CODES.WIP_LIMIT_EXCEEDED, 'board', 'No board evidence was supplied, so the count of active mutation packets could not be checked from this event alone.');
    manual('domain-lease', CODES.DOMAIN_LEASE_CONFLICT, 'board', 'No board evidence was supplied, so overlapping domain and file leases could not be checked from this event alone.');
  }

  // --- 9. predecessor state ----------------------------------------------
  if (packet && packet.dependsOn.length) {
    if (!board?.issues) {
      manual('predecessor', CODES.PREDECESSOR_NOT_MERGED, `issue #${issue.number}`, `Packet declares predecessor(s) ${packet.dependsOn.map((n) => `#${n}`).join(', ')}, but no board evidence was supplied to confirm they are merged or closed.`);
    } else {
      const unresolved = [];
      for (const number of packet.dependsOn) {
        const entry = board.issues.find((e) => e.number === number);
        if (!entry) {
          unresolved.push({ number, reason: 'not present in the supplied board evidence' });
          continue;
        }
        const names = labelNames(entry.labels);
        const closed = entry.state === 'closed' || entry.merged === true || names.includes('state:done');
        if (!closed) unresolved.push({ number, reason: 'predecessor is neither merged nor closed' });
      }
      if (unresolved.length) {
        fail('predecessor', CODES.PREDECESSOR_NOT_MERGED, `${unresolved.length} predecessor packet(s) are not merged or closed.`, unresolved);
      } else {
        pass('predecessor', CODES.PREDECESSOR_NOT_MERGED);
      }
    }
  } else {
    skip('predecessor', CODES.PREDECESSOR_NOT_MERGED, 'packet declares no predecessor');
  }

  // --- 10. one branch and one Draft PR ------------------------------------
  const needsPr = Boolean(packet) && isMutation && labels.some((l) => PR_REQUIRED_STATES.includes(l));
  if (needsPr) {
    const linked = input.linkedPullRequests ?? (pr ? [pr] : []);
    const problems = [];
    if (!packet.branch) problems.push('no branch declared');
    if (linked.length !== 1) problems.push(`${linked.length} linked pull request(s); exactly one is required`);
    const branches = unique(linked.map((p) => p.head?.ref).filter(Boolean));
    if (branches.length > 1) problems.push(`linked pull requests span ${branches.length} branches`);
    if (problems.length) {
      fail('branch-and-draft-pr', CODES.MISSING_BRANCH_OR_DRAFT_PR, `Mutation packet at ${packet.state} does not have exactly one linked branch and pull request.`, problems);
    } else {
      pass('branch-and-draft-pr', CODES.MISSING_BRANCH_OR_DRAFT_PR);
    }
  } else {
    skip('branch-and-draft-pr', CODES.MISSING_BRANCH_OR_DRAFT_PR, 'packet is not a mutation packet at or past RESULT');
  }

  // --- 11. PR binding -----------------------------------------------------
  if (pr && packet) {
    const problems = [];
    if (packet.branch && pr.head?.ref && pr.head.ref !== packet.branch) {
      problems.push(`pull request head branch "${pr.head.ref}" does not match the declared branch "${packet.branch}"`);
    }
    if (packet.baseSha && pr.base?.sha && pr.base.sha !== packet.baseSha) {
      problems.push(`pull request base SHA "${pr.base.sha}" does not match the pinned base "${packet.baseSha}"`);
    }
    if (issue?.number && !new RegExp(`#${issue.number}\\b`).test(String(pr.body ?? ''))) {
      problems.push(`pull request body does not link Issue #${issue.number}`);
    }
    if (packet.id && !String(pr.body ?? '').includes(packet.id)) {
      problems.push(`pull request body does not carry packet ID ${packet.id}`);
    }
    if (problems.length) {
      fail('pr-binding', CODES.PR_BINDING_MISMATCH, `${problems.length} pull request binding mismatch(es).`, problems);
    } else {
      pass('pr-binding', CODES.PR_BINDING_MISMATCH);
    }
  } else {
    skip('pr-binding', CODES.PR_BINDING_MISMATCH, 'no pull request and Issue pair in this event');
  }

  // --- 12. changed paths within the allowlist -----------------------------
  if (pr && packet) {
    if (pr.changedFiles == null) {
      manual('changed-paths', CODES.PATH_OUTSIDE_ALLOWLIST, `pull request #${pr.number}`, 'The event payload does not carry the changed file list, so it could not be compared with the Issue allowlist here.');
    } else {
      const outside = pr.changedFiles.filter((p) => !packet.allowlistPaths.includes(p));
      if (outside.length) {
        fail('changed-paths', CODES.PATH_OUTSIDE_ALLOWLIST, `${outside.length} changed path(s) are outside the exact Issue allowlist.`, outside);
      } else {
        pass('changed-paths', CODES.PATH_OUTSIDE_ALLOWLIST);
      }
    }
  } else {
    skip('changed-paths', CODES.PATH_OUTSIDE_ALLOWLIST, 'no pull request and Issue pair in this event');
  }

  // --- 13. Draft before the Owner gate ------------------------------------
  if (pr && packet) {
    const gateOpen = labels.includes('state:owner-gate') || labels.includes('state:done');
    if (!pr.draft && !pr.merged && !gateOpen) {
      fail('draft-before-owner-gate', CODES.PR_READY_BEFORE_OWNER_GATE, `Pull request #${pr.number} is not a Draft while the packet is at ${packet.state ?? 'an earlier state'}.`);
    } else {
      pass('draft-before-owner-gate', CODES.PR_READY_BEFORE_OWNER_GATE);
    }
  } else {
    skip('draft-before-owner-gate', CODES.PR_READY_BEFORE_OWNER_GATE, 'no pull request and Issue pair in this event');
  }

  // --- 14. RESULT completeness -------------------------------------------
  if (packet && labels.some((l) => ['state:result', 'state:review', 'state:owner-gate'].includes(l))) {
    if (issue.commentsComplete === false) {
      manual('result-completeness', CODES.RESULT_INCOMPLETE, `issue #${issue.number}`, 'The event payload does not carry the full comment history, so the RESULT record could not be audited here.');
    } else {
      const results = commentsMatching(issue.comments, 'RESULT', packet.id);
      if (results.length === 0) {
        fail('result-completeness', CODES.RESULT_INCOMPLETE, `Packet is at ${packet.state} with no persisted "RESULT — ${packet.id}" record.`);
      } else {
        const missing = auditResultComment(results[results.length - 1].body, packet.allowlistPaths, {
          requirePullRequest: isMutation,
          requireChangedPaths: isMutation,
        });
        if (missing.length) {
          fail('result-completeness', CODES.RESULT_INCOMPLETE, `RESULT record is missing ${missing.length} required element(s).`, missing);
        } else {
          pass('result-completeness', CODES.RESULT_INCOMPLETE);
        }
      }
    }
  } else {
    skip('result-completeness', CODES.RESULT_INCOMPLETE, 'packet is not at or past RESULT');
  }

  // --- 15 / 16 / 17. review binding, staleness, self-review ---------------
  if (reviews.length && pr) {
    const latest = reviews[reviews.length - 1];
    if (latest.commitId && pr.head?.sha && latest.commitId !== pr.head.sha) {
      fail('review-head', CODES.REVIEW_HEAD_MISMATCH, `Latest review is bound to ${latest.commitId}, but the pull request head is ${pr.head.sha}.`);
    } else if (!latest.commitId) {
      manual('review-head', CODES.REVIEW_HEAD_MISMATCH, `pull request #${pr.number}`, 'The review record carries no reviewed commit SHA, so its binding to the current head cannot be confirmed.');
    } else {
      pass('review-head', CODES.REVIEW_HEAD_MISMATCH);
    }

    if (Array.isArray(pr.commits) && latest.submittedAt) {
      const newer = pr.commits.filter((c) => c.committedAt && Date.parse(c.committedAt) > Date.parse(latest.submittedAt));
      if (newer.length) {
        fail('review-staleness', CODES.REVIEW_STALE_NEW_COMMIT, `${newer.length} commit(s) landed after the latest review was submitted; the verdict is invalidated.`, newer.map((c) => c.sha));
      } else {
        pass('review-staleness', CODES.REVIEW_STALE_NEW_COMMIT);
      }
    } else {
      manual('review-staleness', CODES.REVIEW_STALE_NEW_COMMIT, `pull request #${pr.number}`, 'Commit timestamps were not supplied, so a commit landing after the review could not be ruled out here.');
    }

    if (latest.author && pr.author && latest.author === pr.author && !declaresIndependentEngagement(latest.body)) {
      fail('self-review', CODES.AUTHOR_SELF_REVIEW, `Review author "${latest.author}" is the pull request author, and the review declares no separate non-author engagement.`);
    } else if (!declaresIndependentEngagement(latest.body)) {
      manual('self-review', CODES.AUTHOR_SELF_REVIEW, `pull request #${pr.number}`, 'GitHub account identity cannot prove engagement separation. The review must declare its own model or lane and state explicitly that it did not author the reviewed head.');
    } else {
      pass('self-review', CODES.AUTHOR_SELF_REVIEW);
    }
  } else {
    skip('review-head', CODES.REVIEW_HEAD_MISMATCH, 'no review in this event');
    skip('review-staleness', CODES.REVIEW_STALE_NEW_COMMIT, 'no review in this event');
    skip('self-review', CODES.AUTHOR_SELF_REVIEW, 'no review in this event');
  }

  // --- 18. Owner gate requires exact-head review evidence -----------------
  if (packet && labels.includes('state:owner-gate')) {
    const problems = [];
    if (!reviews.length) problems.push('no review evidence is present');
    else {
      const latest = reviews[reviews.length - 1];
      if (!latest.commitId) problems.push('the review carries no reviewed commit SHA');
      else if (pr?.head?.sha && latest.commitId !== pr.head.sha) problems.push('the review is not bound to the current pull request head');
      if (!declaresIndependentEngagement(latest.body)) problems.push('the review does not declare a non-author engagement');
    }
    if (problems.length) {
      fail('owner-gate-evidence', CODES.GATE_WITHOUT_REVIEW_EVIDENCE, `Packet is at state:owner-gate without valid exact-head review evidence.`, problems);
    } else {
      pass('owner-gate-evidence', CODES.GATE_WITHOUT_REVIEW_EVIDENCE);
    }
  } else {
    skip('owner-gate-evidence', CODES.GATE_WITHOUT_REVIEW_EVIDENCE, 'packet is not at state:owner-gate');
  }

  // --- 19. unsupported runtime claims -------------------------------------
  if (pr && Array.isArray(pr.changedFiles)) {
    if (isDocsOrInfraOnly(pr.changedFiles)) {
      const claims = findRuntimeClaims(pr.body);
      if (claims.length) {
        fail('runtime-claim', CODES.UNSUPPORTED_RUNTIME_CLAIM, `A docs-only or infrastructure diff claims ${claims.length} runtime, browser, deployment, or Production proof(s).`, claims);
      } else {
        pass('runtime-claim', CODES.UNSUPPORTED_RUNTIME_CLAIM);
      }
    } else {
      skip('runtime-claim', CODES.UNSUPPORTED_RUNTIME_CLAIM, 'diff is not docs-only or infrastructure-only');
    }
  } else {
    skip('runtime-claim', CODES.UNSUPPORTED_RUNTIME_CLAIM, 'changed file list not available');
  }

  // --- 20. AI dispatch and write permissions ------------------------------
  if (input.controlPlaneFiles || repoRoot) {
    const audit = auditControlPlaneFiles({ repoRoot, files: input.controlPlaneFiles });
    if (audit.violations.length) {
      fail('executable-surfaces', CODES.AI_DISPATCH_OR_WRITE_PERMISSION, `${audit.violations.length} AI-dispatch or write-permission violation(s) in the control-plane executable surfaces.`, audit.violations);
    } else {
      pass('executable-surfaces', CODES.AI_DISPATCH_OR_WRITE_PERMISSION);
    }
  } else {
    manual('executable-surfaces', CODES.AI_DISPATCH_OR_WRITE_PERMISSION, 'control-plane files', 'No checkout or file set was supplied, so the executable surfaces could not be scanned.');
  }

  const status = failures.length ? 'fail' : notices.length ? 'consistent_with_manual_evidence' : 'consistent';

  return {
    schema: SCHEMA,
    gate: GATE_NAME,
    event: eventName,
    subject: {
      issue: issue?.number ?? null,
      pullRequest: pr?.number ?? null,
      packet: packet?.id ?? null,
      state: packet?.state ?? null,
      mode: packet?.mode ?? null,
    },
    status,
    failures,
    notices,
    checks,
    meaning:
      'A consistent result means the observable transition matches the packet. It is not Owner acceptance, engineering approval, or certification.',
  };
}

// ---------------------------------------------------------------------------
// Human summary
// ---------------------------------------------------------------------------

export function summarize(report) {
  const out = [];
  out.push(`${report.gate} — ${report.status.toUpperCase()}`);
  out.push(`event: ${report.event}`);
  const s = report.subject;
  out.push(`subject: issue=${s.issue ?? '-'} pr=${s.pullRequest ?? '-'} packet=${s.packet ?? '-'} state=${s.state ?? '-'} mode=${s.mode ?? '-'}`);
  const counts = report.checks.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] ?? 0) + 1;
    return acc;
  }, {});
  out.push(`checks: ${Object.entries(counts).map(([k, v]) => `${k}=${v}`).join(' ') || 'none'}`);
  if (report.failures.length) {
    out.push('');
    out.push('fail-closed findings:');
    for (const f of report.failures) out.push(`  - ${f.code}: ${f.message}`);
  }
  if (report.notices.length) {
    out.push('');
    out.push('manual evidence required:');
    for (const n of report.notices) out.push(`  - ${n.check} (${n.subject}): ${n.message}`);
  }
  out.push('');
  out.push(report.meaning);
  return out.join('\n');
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

export function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (!key.startsWith('--')) continue;
    const name = key.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      args[name] = next;
      i += 1;
    } else {
      args[name] = true;
    }
  }
  return args;
}

function main(argv) {
  const args = parseArgs(argv);
  let input;
  if (args.fixture) {
    input = JSON.parse(readFileSync(String(args.fixture), 'utf8'));
  } else if (args['event-path']) {
    const eventName = String(args['event-name'] ?? process.env.GITHUB_EVENT_NAME ?? 'workflow_dispatch');
    if (!SUPPORTED_EVENTS.includes(eventName)) {
      process.stderr.write(`${GATE_NAME}: unsupported event "${eventName}"\n`);
      return 2;
    }
    const payload = existsSync(String(args['event-path']))
      ? JSON.parse(readFileSync(String(args['event-path']), 'utf8'))
      : {};
    input = normalizeEvent(eventName, payload);
  } else {
    input = { event: { name: 'workflow_dispatch' } };
  }
  if (!input.repoRoot && !input.controlPlaneFiles) {
    input.repoRoot = args['repo-root'] ? String(args['repo-root']) : process.cwd();
  }
  const report = evaluate(input);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  process.stderr.write(`${summarize(report)}\n`);
  return report.failures.length ? 1 : 0;
}

const invokedDirectly =
  process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));

if (invokedDirectly) {
  process.exitCode = main(process.argv.slice(2));
}
