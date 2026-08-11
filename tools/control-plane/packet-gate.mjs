#!/usr/bin/env node
/**
 * KBP Packet Gate — read-only control-plane validator.
 *
 * This program validates that an observable GitHub transition is internally
 * consistent with the packet contract in `governance/office/OPERATING-MODEL-v5.md`
 * and `governance/control-plane/README.md`.
 *
 * It reads. It never writes. It never comments, labels, assigns, closes, merges,
 * approves, deploys, mutates a project field, reads a secret, calls a model or any
 * other network endpoint, triggers another workflow, or launches an AI worker.
 *
 * A PASS means the transition is observably consistent. A PASS is not Owner
 * acceptance, and no output of this program adopts, approves, or certifies
 * anything.
 *
 * Modes:
 *   --fixture <file.json>                      deterministic fixture mode
 *   --event <file.json> --event-name <name>    live GitHub webhook payload mode
 *   --repo-root <dir>                          enables the control-plane self-audit
 *   --json-only                                suppress the human summary
 *
 * Exit status: 0 when status is PASS, 1 when status is FAIL, 2 on usage error.
 *
 * Runtime dependencies: none beyond the Node standard library.
 */

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import path from "node:path";
import process from "node:process";

/* ------------------------------------------------------------------------- *
 * Stable failure codes
 *
 * These identifiers are the contract. Messages may be reworded; codes may not.
 * ------------------------------------------------------------------------- */

export const CODES = {
  MISSING_REQUIRED_FIELD: "KBP001_MISSING_REQUIRED_FIELD",
  BASE_NOT_EXACT_SHA: "KBP002_BASE_NOT_EXACT_SHA",
  ALLOWLIST_NOT_EXACT: "KBP003_ALLOWLIST_NOT_EXACT",
  OPEN_DELEGATION: "KBP004_OPEN_DELEGATION",
  LABEL_EXCLUSIVITY: "KBP005_LABEL_EXCLUSIVITY",
  ACTIVE_WITHOUT_STARTED: "KBP006_ACTIVE_WITHOUT_STARTED",
  WIP_LIMIT: "KBP007_WIP_LIMIT",
  DOMAIN_LEASE_OVERLAP: "KBP008_DOMAIN_LEASE_OVERLAP",
  UNMERGED_PREDECESSOR: "KBP009_UNMERGED_PREDECESSOR",
  MISSING_BRANCH_OR_DRAFT_PR: "KBP010_MISSING_BRANCH_OR_DRAFT_PR",
  PR_BINDING_MISMATCH: "KBP011_PR_BINDING_MISMATCH",
  PATH_OUTSIDE_ALLOWLIST: "KBP012_PATH_OUTSIDE_ALLOWLIST",
  NON_DRAFT_BEFORE_OWNER_GATE: "KBP013_NON_DRAFT_BEFORE_OWNER_GATE",
  RESULT_INCOMPLETE: "KBP014_RESULT_INCOMPLETE",
  REVIEW_NOT_AT_HEAD: "KBP015_REVIEW_NOT_AT_HEAD",
  COMMIT_AFTER_REVIEW: "KBP016_COMMIT_AFTER_REVIEW",
  AUTHOR_IS_REVIEWER: "KBP017_AUTHOR_IS_REVIEWER",
  GATE_WITHOUT_REVIEW_EVIDENCE: "KBP018_GATE_WITHOUT_REVIEW_EVIDENCE",
  UNSUPPORTED_RUNTIME_CLAIM: "KBP019_UNSUPPORTED_RUNTIME_CLAIM",
  AI_DISPATCH_OR_WRITE_PERMISSION: "KBP020_AI_DISPATCH_OR_WRITE_PERMISSION",
};

/** Emitted when GitHub cannot prove an engagement-level fact from API identity alone. */
export const MANUAL_EVIDENCE_REQUIRED = "MANUAL_EVIDENCE_REQUIRED";

export const SUPPORTED_EVENTS = [
  "issues",
  "issue_comment",
  "pull_request",
  "pull_request_review",
  "workflow_dispatch",
];

/* ------------------------------------------------------------------------- *
 * Packet vocabulary
 * ------------------------------------------------------------------------- */

export const REQUIRED_FIELDS = [
  "Packet ID",
  "Single outcome",
  "Repository",
  "Exact base SHA",
  "Worker",
  "Exact model ID",
  "Mode",
  "Kind",
  "Gate",
  "Primary domain",
  "Clone path",
  "Session label",
  "Branch or read-only target",
  "Authoritative read order",
  "Exact file allowlist",
  "Domain lease",
  "Prohibitions",
  "Quality target",
  "Deterministic gates",
  "Independent reviewer",
  "Integration order and dependencies",
  "Stop conditions",
  "RESULT and cleanup contract",
];

export const LABEL_CATEGORIES = ["state", "worker", "mode", "kind", "gate", "domain"];

/** States in which a mutation packet is live and holds its lease. */
export const ACTIVE_STATES = [
  "state:dispatched",
  "state:active",
  "state:result",
  "state:review",
  "state:owner-gate",
  "state:blocked",
];

/** States in which a mutation packet must already own a branch and a Draft PR. */
const STATES_REQUIRING_BYTES = [
  "state:active",
  "state:result",
  "state:review",
  "state:owner-gate",
];

const FULL_SHA = /^[0-9a-f]{40}$/;
const ANY_FULL_SHA = /\b[0-9a-f]{40}\b/;

/**
 * Open-delegation phrases. The first four are named verbatim by the packet
 * contract; the remainder are the same defect in other words.
 */
export const OPEN_DELEGATION_PHRASES = [
  "relevant docs",
  "make it premium",
  "best asset",
  "smallest suitable module",
  "as appropriate",
  "as needed",
  "and related files",
  "where applicable",
  "or equivalent",
  "use your judgement",
  "use your judgment",
];

/** Claims a docs-only or infrastructure diff cannot support. */
const RUNTIME_CLAIM_PATTERNS = [
  /\bverified in (?:the )?browser\b/i,
  /\bbrowser[- ]verified\b/i,
  /\bscreenshots? (?:attached|captured|taken|verified)\b/i,
  /\bruntime (?:verified|proof|evidence)\b/i,
  /\bproduction (?:verified|promoted|deployed)\b/i,
  /\bdeployed to production\b/i,
  /\bpreview (?:verified|deployment verified)\b/i,
  /\bHTTP 200\b/,
  /\broute smoke\b/i,
  /\brendered (?:correctly|as expected)\b/i,
];

const DOCS_OR_INFRA = [
  (p) => /\.(?:md|json|ya?ml|txt)$/i.test(p),
  (p) => p.startsWith(".github/"),
  (p) => p.startsWith("tools/control-plane/"),
  (p) => p.startsWith("governance/"),
];

/* ------------------------------------------------------------------------- *
 * Forbidden-token table
 *
 * The scan below runs over executable surfaces, and this file is one of them.
 * Each pattern is therefore assembled from fragments so that no forbidden
 * literal appears verbatim anywhere in this source. `packet-gate.test.mjs`
 * asserts that this file passes its own scan.
 * ------------------------------------------------------------------------- */

const frag = (...parts) => parts.join("");

const FORBIDDEN_TOKENS = [
  { label: "secret access", needle: frag("secr", "ets.") },
  { label: "secret access", needle: frag("GITHUB_", "TOKEN") },
  { label: "credential interpolation", needle: frag("github", ".token") },
  { label: "model provider host", needle: frag("api.", "anthro", "pic.com") },
  { label: "model provider host", needle: frag("api.", "open", "ai.com") },
  { label: "model provider SDK", needle: frag("@anthro", "pic-ai/") },
  { label: "model provider SDK", needle: frag("open", "ai/") },
  { label: "AI action", needle: frag("claude-", "code-action") },
  { label: "AI action", needle: frag("anthro", "pics/claude") },
  { label: "AI worker mention", needle: frag("@co", "dex") },
  { label: "cross-workflow dispatch", needle: frag("repository_", "dispatch") },
  { label: "cross-workflow dispatch", needle: frag("workflow_", "call") },
  { label: "cross-workflow dispatch", needle: frag("createWorkflow", "Dispatch") },
  { label: "cross-workflow dispatch", needle: frag("gh work", "flow run") },
  { label: "API mutation", needle: frag("/dis", "patches") },
  { label: "API mutation", needle: frag("gh a", "pi ") },
  { label: "API mutation", needle: frag("gh p", "r merge") },
  { label: "API mutation", needle: frag("gh p", "r review") },
  { label: "API mutation", needle: frag("gh p", "r ready") },
  { label: "API mutation", needle: frag("gh is", "sue comment") },
  { label: "arbitrary scripting action", needle: frag("actions/", "github-script") },
  { label: "comment-writing action", needle: frag("create-or-", "update-comment") },
];

/* ------------------------------------------------------------------------- *
 * Text helpers
 * ------------------------------------------------------------------------- */

/**
 * Remove HTML comments, fenced blocks, and inline code spans.
 *
 * Prose scans run on the result. A phrase written inside backticks is a
 * reference to that phrase — for example a packet that enumerates the
 * prohibited open-delegation wording — not an instance of it.
 */
export function stripQuotedRegions(text) {
  return String(text ?? "")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/```[\s\S]*?(?:```|$)/g, " ")
    .replace(/~~~[\s\S]*?(?:~~~|$)/g, " ")
    .replace(/`[^`\n]*`/g, " ");
}

const norm = (v) => String(v ?? "").trim();

/** GitHub issue forms render an unfilled optional field as this literal. */
const isBlank = (v) => norm(v) === "" || norm(v) === "_No response_";

/* ------------------------------------------------------------------------- *
 * Issue body parsing
 * ------------------------------------------------------------------------- */

/**
 * Parse a rendered GitHub issue-form body into `{ heading: value }`.
 *
 * The form renders each field as a `### <label>` heading followed by its value.
 */
export function parseIssueBody(body) {
  const fields = Object.create(null);
  const lines = String(body ?? "").split(/\r?\n/);
  let current = null;
  let buffer = [];

  const flush = () => {
    if (current !== null) fields[current] = buffer.join("\n").trim();
    buffer = [];
  };

  for (const line of lines) {
    const heading = /^###\s+(.+?)\s*$/.exec(line);
    if (heading) {
      flush();
      current = heading[1];
    } else if (current !== null) {
      buffer.push(line);
    }
  }
  flush();
  return fields;
}

/** Accept either `<40-hex>` or `<ref>@<40-hex>`. */
export function extractBaseSha(value) {
  const raw = norm(value);
  const at = raw.lastIndexOf("@");
  const candidate = at === -1 ? raw : raw.slice(at + 1).trim();
  return FULL_SHA.test(candidate) ? candidate : null;
}

/**
 * Parse an allowlist field into exact `{ op, path }` entries.
 *
 * Every entry must name one concrete path and one operation. Wildcards,
 * directory-only entries, parent traversal, and open-ended continuations are
 * ambiguous and are reported as problems.
 */
export function parseAllowlist(value) {
  const entries = [];
  const problems = [];
  const text = norm(value);

  if (/^none\b/i.test(text)) return { entries, problems, declaredNone: true };

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.replace(/^[-*\d.)\s]+/, "").trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) problems.push("allowlist is empty");

  for (const line of lines) {
    if (/\b(?:etc\.?|and so on|and related|plus any|as needed|among others)\b/i.test(line)) {
      problems.push(`open-ended continuation: ${line}`);
      continue;
    }
    const match = /^(create|modify|delete)\s+(\S+)$/i.exec(line);
    if (!match) {
      problems.push(`not "<create|modify|delete> <path>": ${line}`);
      continue;
    }
    const op = match[1].toLowerCase();
    const target = match[2];
    if (/[*?[\]{}]/.test(target)) {
      problems.push(`wildcard path: ${target}`);
      continue;
    }
    if (target.includes("..")) {
      problems.push(`parent traversal: ${target}`);
      continue;
    }
    if (target.endsWith("/")) {
      problems.push(`directory-only path: ${target}`);
      continue;
    }
    if (!path.basename(target).includes(".")) {
      problems.push(`ambiguous path without a file extension: ${target}`);
      continue;
    }
    entries.push({ op, path: target });
  }

  const seen = new Set();
  for (const entry of entries) {
    if (seen.has(entry.path)) problems.push(`duplicate path: ${entry.path}`);
    seen.add(entry.path);
  }

  return { entries, problems, declaredNone: false };
}

/** Group labels by their `category:` prefix. */
export function labelCategories(labels) {
  const grouped = Object.create(null);
  for (const category of LABEL_CATEGORIES) grouped[category] = [];
  for (const label of labels ?? []) {
    const name = norm(label);
    const idx = name.indexOf(":");
    if (idx === -1) continue;
    const category = name.slice(0, idx);
    if (category in grouped) grouped[category].push(name);
  }
  return grouped;
}

const stateLabel = (labels) => labelCategories(labels).state[0] ?? null;

/** Split a domain-lease field into comparable path prefixes. */
export function leasePrefixes(value) {
  return norm(value)
    .split(/[\s,;]+/)
    .map((token) => token.replace(/^[`'"]|[`'"]$/g, ""))
    .filter((token) => token.includes("/") || token.startsWith("."))
    .map((token) => token.replace(/\*+$/, "").replace(/\/+$/, ""))
    .filter((token) => token.length > 0);
}

export function leasesOverlap(a, b) {
  for (const left of a) {
    for (const right of b) {
      if (left === right) return `${left}`;
      if (left.startsWith(`${right}/`)) return `${left} within ${right}`;
      if (right.startsWith(`${left}/`)) return `${right} within ${left}`;
    }
  }
  return null;
}

/* ------------------------------------------------------------------------- *
 * Minimal YAML structural reader
 *
 * Sufficient for the structural audit this gate performs — triggers,
 * permissions, jobs, steps, `uses`, and `run`. It is a structural audit, not a
 * general YAML parser, and `governance/control-plane/README.md` says so.
 * ------------------------------------------------------------------------- */

function stripComment(line) {
  let quote = null;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (quote) {
      if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === "#" && (i === 0 || /\s/.test(line[i - 1]))) {
      return line.slice(0, i);
    }
  }
  return line;
}

function scalar(raw) {
  const value = norm(raw);
  if (value === "") return "";
  if (/^".*"$/.test(value) || /^'.*'$/.test(value)) return value.slice(1, -1);
  if (/^\[.*\]$/.test(value)) {
    return value
      .slice(1, -1)
      .split(",")
      .map((v) => scalar(v))
      .filter((v) => v !== "");
  }
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
}

function nextContentIndex(lines, from) {
  let i = from;
  while (i < lines.length && lines[i].text === "") i += 1;
  return i;
}

function foldedScalar(lines, from, childIndent) {
  const folded = [];
  let cursor = from;
  while (cursor < lines.length && (lines[cursor].text === "" || lines[cursor].indent >= childIndent)) {
    folded.push(lines[cursor].text);
    cursor += 1;
  }
  return [folded.join(" ").trim(), cursor];
}

function parseBlock(lines, start, indent) {
  // Decide between a mapping and a sequence by looking at the first content line.
  const first = nextContentIndex(lines, start);
  if (first >= lines.length || lines[first].indent < indent) return [null, start];

  if (lines[first].text.startsWith("- ")) {
    const seq = [];
    let cursor = first;
    while (cursor < lines.length) {
      const line = lines[cursor];
      if (line.text === "") {
        cursor += 1;
        continue;
      }
      if (line.indent < indent || !line.text.startsWith("- ")) break;
      const inner = line.text.slice(2).trim();
      if (/^[^:\s][^:]*:(?:\s|$)/.test(inner)) {
        // A mapping whose first key shares the dash line.
        const childIndent = line.indent + 2;
        const synthetic = [{ indent: childIndent, text: inner }, ...lines.slice(cursor + 1)];
        const [value, consumed] = parseBlock(synthetic, 0, childIndent);
        seq.push(value);
        cursor += Math.max(consumed, 1);
      } else {
        seq.push(scalar(inner));
        cursor += 1;
      }
    }
    return [seq, cursor];
  }

  const map = Object.create(null);
  let cursor = first;
  while (cursor < lines.length) {
    const line = lines[cursor];
    if (line.text === "") {
      cursor += 1;
      continue;
    }
    if (line.indent < indent) break;
    if (line.indent > indent) {
      cursor += 1;
      continue;
    }
    const match = /^([^:\s][^:]*):\s*(.*)$/.exec(line.text);
    if (!match) {
      cursor += 1;
      continue;
    }
    const key = norm(match[1]);
    const rest = match[2].trim();
    const isFolded = /^[>|][-+]?$/.test(rest);
    if (rest !== "" && !isFolded) {
      map[key] = scalar(rest);
      cursor += 1;
      continue;
    }
    const childStart = nextContentIndex(lines, cursor + 1);
    const childIndent = childStart < lines.length ? lines[childStart].indent : indent;
    if (childIndent <= indent) {
      map[key] = "";
      cursor += 1;
    } else if (isFolded) {
      const [value, consumed] = foldedScalar(lines, childStart, childIndent);
      map[key] = value;
      cursor = Math.max(consumed, cursor + 1);
    } else {
      const [value, consumed] = parseBlock(lines, cursor + 1, childIndent);
      map[key] = value;
      cursor = Math.max(consumed, cursor + 1);
    }
  }
  return [map, cursor];
}

export function parseWorkflowStructure(text) {
  const lines = String(text ?? "")
    .split(/\r?\n/)
    .map((raw) => {
      const stripped = stripComment(raw);
      const trimmed = stripped.trimEnd();
      return { indent: trimmed.search(/\S|$/), text: trimmed.trim() };
    })
    .map((line) => (line.text === "" ? { indent: 0, text: "" } : line));

  const [root] = parseBlock(lines, 0, 0);
  return root ?? Object.create(null);
}

/**
 * Collect every `permissions:` scope declared in a workflow, top level and job
 * level, as flat `scope -> value` pairs annotated with where they were found.
 */
export function collectPermissions(workflow) {
  const found = [];
  const push = (where, block) => {
    if (block === undefined || block === null) return;
    if (typeof block === "string") {
      found.push({ where, scope: "*", value: block });
      return;
    }
    for (const [scope, value] of Object.entries(block)) {
      found.push({ where, scope, value: String(value) });
    }
  };
  push("workflow", workflow.permissions);
  const hasTopLevel = workflow.permissions !== undefined && workflow.permissions !== null;
  for (const [jobId, job] of Object.entries(workflow.jobs ?? {})) {
    if (job && typeof job === "object") push(`job:${jobId}`, job.permissions);
  }
  return { permissions: found, hasTopLevel };
}

function collectUses(workflow) {
  const uses = [];
  for (const [jobId, job] of Object.entries(workflow.jobs ?? {})) {
    for (const step of (job && job.steps) || []) {
      if (step && typeof step === "object" && typeof step.uses === "string") {
        uses.push({ job: jobId, uses: step.uses });
      }
    }
  }
  return uses;
}

/* ------------------------------------------------------------------------- *
 * Control-plane self-audit
 * ------------------------------------------------------------------------- */

/** Scan one executable surface for forbidden dispatch, model, and secret tokens. */
export function scanExecutableSurface(name, text) {
  const hits = [];
  const body = String(text ?? "");
  for (const token of FORBIDDEN_TOKENS) {
    let index = body.indexOf(token.needle);
    while (index !== -1) {
      hits.push({
        file: name,
        label: token.label,
        token: token.needle,
        line: body.slice(0, index).split("\n").length,
      });
      index = body.indexOf(token.needle, index + token.needle.length);
    }
  }
  return hits;
}

/** Collect the executable control-plane surfaces from a checkout. */
export function collectControlPlaneFiles(repoRoot) {
  const files = [];
  const add = (dir, filter) => {
    const abs = path.join(repoRoot, dir);
    if (!existsSync(abs) || !statSync(abs).isDirectory()) return;
    for (const name of readdirSync(abs).sort()) {
      const rel = path.posix.join(dir, name);
      const full = path.join(abs, name);
      if (!statSync(full).isFile() || !filter(name)) continue;
      files.push({ path: rel, content: readFileSync(full, "utf8") });
    }
  };
  add(".github/workflows", (n) => /\.ya?ml$/i.test(n));
  add("tools/control-plane", (n) => /\.mjs$/i.test(n));
  return files;
}

function auditControlPlane(files, report) {
  report.checked.push("control-plane-self-audit");

  for (const file of files) {
    for (const hit of scanExecutableSurface(file.path, file.content)) {
      report.fail(
        CODES.AI_DISPATCH_OR_WRITE_PERMISSION,
        `${file.path}:${hit.line} contains a forbidden ${hit.label} token`,
        { file: file.path, line: hit.line, token: hit.token },
      );
    }

    if (!/\.ya?ml$/i.test(file.path)) continue;

    let workflow;
    try {
      workflow = parseWorkflowStructure(file.content);
    } catch (error) {
      report.fail(
        CODES.AI_DISPATCH_OR_WRITE_PERMISSION,
        `${file.path} could not be structurally parsed: ${error.message}`,
        { file: file.path },
      );
      continue;
    }

    const { permissions, hasTopLevel } = collectPermissions(workflow);
    if (!hasTopLevel) {
      report.fail(
        CODES.AI_DISPATCH_OR_WRITE_PERMISSION,
        `${file.path} declares no workflow-level permissions block, so the default token scope applies`,
        { file: file.path },
      );
    }
    for (const entry of permissions) {
      if (!/^(?:read|none)$/.test(entry.value)) {
        report.fail(
          CODES.AI_DISPATCH_OR_WRITE_PERMISSION,
          `${file.path} grants ${entry.scope}: ${entry.value} at ${entry.where}; only read and none are allowed`,
          { file: file.path, ...entry },
        );
      }
    }

    for (const step of collectUses(workflow)) {
      const pin = step.uses.split("@")[1] ?? "";
      if (!FULL_SHA.test(pin)) {
        report.fail(
          CODES.AI_DISPATCH_OR_WRITE_PERMISSION,
          `${file.path} uses ${step.uses}, which is not pinned to a full immutable commit SHA`,
          { file: file.path, uses: step.uses },
        );
      }
    }
  }
}

/* ------------------------------------------------------------------------- *
 * Packet evaluation
 * ------------------------------------------------------------------------- */

function newReport(context) {
  const report = {
    gate: "KBP Packet Gate",
    schema: "kbp.control-plane.packet-gate/v1",
    eventName: context.eventName ?? null,
    action: context.action ?? null,
    subject: {
      issue: context.issue?.number ?? null,
      pullRequest: context.pullRequest?.number ?? null,
    },
    status: "PASS",
    failures: [],
    manualEvidenceRequired: [],
    checked: [],
  };
  report.fail = (code, detail, evidence = {}) => {
    report.failures.push({ code, detail, evidence });
    report.status = "FAIL";
  };
  report.manual = (fact, reason) => {
    report.manualEvidenceRequired.push({ code: MANUAL_EVIDENCE_REQUIRED, fact, reason });
  };
  return report;
}

function checkIssuePacket(context, report, packet) {
  const issue = context.issue;
  if (!issue) return;

  report.checked.push("issue-packet");
  const fields = parseIssueBody(issue.body);
  packet.fields = fields;

  for (const field of REQUIRED_FIELDS) {
    if (isBlank(fields[field])) {
      report.fail(CODES.MISSING_REQUIRED_FIELD, `Issue field "${field}" is missing or empty`, {
        field,
      });
    }
  }

  packet.packetId = norm(fields["Packet ID"]);
  packet.mode = norm(fields.Mode).toLowerCase();
  packet.branch = norm(fields["Branch or read-only target"]);

  const base = extractBaseSha(fields["Exact base SHA"]);
  if (!isBlank(fields["Exact base SHA"]) && base === null) {
    report.fail(
      CODES.BASE_NOT_EXACT_SHA,
      `Exact base SHA "${norm(fields["Exact base SHA"])}" is not a full 40-hex commit; a branch name or short SHA moves`,
      { value: norm(fields["Exact base SHA"]) },
    );
  }
  packet.baseSha = base;

  const allowlist = parseAllowlist(fields["Exact file allowlist"]);
  packet.allowlist = allowlist;
  const readOnly = packet.mode === "read-only" || issue.labels?.includes("mode:read-only");
  if (!(allowlist.declaredNone && readOnly)) {
    for (const problem of allowlist.problems) {
      report.fail(CODES.ALLOWLIST_NOT_EXACT, `Allowlist entry is not exact: ${problem}`, {
        problem,
      });
    }
    if (allowlist.declaredNone && !readOnly) {
      report.fail(
        CODES.ALLOWLIST_NOT_EXACT,
        'Allowlist declares "none" but the packet is not read-only',
        {},
      );
    }
  }

  const prose = stripQuotedRegions(issue.body);
  for (const phrase of OPEN_DELEGATION_PHRASES) {
    if (prose.toLowerCase().includes(phrase)) {
      report.fail(
        CODES.OPEN_DELEGATION,
        `Packet contains open delegation: "${phrase}"`,
        { phrase },
      );
    }
  }

  // Label exclusivity.
  const grouped = labelCategories(issue.labels);
  const manifestNames = context.labelManifest
    ? new Set(context.labelManifest.labels.map((l) => l.name))
    : null;
  for (const category of LABEL_CATEGORIES) {
    const applied = grouped[category];
    if (applied.length !== 1) {
      report.fail(
        CODES.LABEL_EXCLUSIVITY,
        `Label category "${category}" has ${applied.length} labels; exactly one is required`,
        { category, applied },
      );
      continue;
    }
    if (manifestNames && !manifestNames.has(applied[0])) {
      report.fail(
        CODES.LABEL_EXCLUSIVITY,
        `Label "${applied[0]}" is not declared in labels-v1.json`,
        { category, applied },
      );
    }
  }

  // STARTED evidence.
  const state = stateLabel(issue.labels);
  if (state === "state:active") {
    if (!Array.isArray(issue.comments)) {
      report.manual(
        "STARTED evidence for state:active",
        "the event payload carries no full comment list; the gate cannot see whether STARTED was persisted",
      );
    } else {
      const started = issue.comments.find((c) =>
        new RegExp(`^STARTED\\s+—\\s+${escapeRegExp(packet.packetId)}\\b`).test(norm(c.body)),
      );
      const evidenceOk =
        started &&
        ANY_FULL_SHA.test(started.body) &&
        /\bclone\b/i.test(started.body) &&
        /\bbranch\b/i.test(started.body);
      if (!evidenceOk) {
        report.fail(
          CODES.ACTIVE_WITHOUT_STARTED,
          `state:active requires a persisted "STARTED — ${packet.packetId}" comment naming the session, clone, branch, and exact base`,
          { packetId: packet.packetId, found: Boolean(started) },
        );
      }
    }
  }

  // Predecessors.
  const integration = norm(fields["Integration order and dependencies"]);
  if (integration && context.issueIndex) {
    for (const line of integration.split(/\r?\n/)) {
      if (/\b(?:dependent|dependents|successor|blocks|downstream|followed by)\b/i.test(line)) continue;
      for (const match of line.matchAll(/#(\d+)/g)) {
        const number = Number(match[1]);
        const predecessor = context.issueIndex[number];
        if (!predecessor) continue;
        const resolved =
          predecessor.merged === true ||
          predecessor.state === "closed" ||
          predecessor.state === "merged";
        if (!resolved) {
          report.fail(
            CODES.UNMERGED_PREDECESSOR,
            `Predecessor #${number} is not merged or closed; a packet may not depend on an unmerged predecessor`,
            { predecessor: number, state: predecessor.state ?? null },
          );
        }
      }
    }
  }
}

function checkBoard(context, report, packet) {
  const board = context.activeIssues;
  if (!Array.isArray(board)) {
    report.manual(
      "WIP and cross-packet lease state",
      "no board snapshot was supplied; the gate cannot enumerate other live packets from a single webhook payload",
    );
    return;
  }
  report.checked.push("board-wip-and-lease");

  const liveMutations = board.filter((entry) => {
    const labels = entry.labels ?? [];
    return labels.includes("mode:mutation") && ACTIVE_STATES.includes(stateLabel(labels));
  });

  if (liveMutations.length > 2) {
    report.fail(
      CODES.WIP_LIMIT,
      `${liveMutations.length} active mutation packets; the concurrency contract allows at most two`,
      { issues: liveMutations.map((e) => e.number) },
    );
  }

  for (let i = 0; i < liveMutations.length; i += 1) {
    for (let j = i + 1; j < liveMutations.length; j += 1) {
      const a = liveMutations[i];
      const b = liveMutations[j];
      const overlap = leasesOverlap(
        Array.isArray(a.domainLease) ? a.domainLease : leasePrefixes(a.domainLease),
        Array.isArray(b.domainLease) ? b.domainLease : leasePrefixes(b.domainLease),
      );
      const sharedDomainLabel = labelCategories(a.labels).domain[0] &&
        labelCategories(a.labels).domain[0] === labelCategories(b.labels).domain[0]
        ? labelCategories(a.labels).domain[0]
        : null;
      if (overlap || sharedDomainLabel) {
        report.fail(
          CODES.DOMAIN_LEASE_OVERLAP,
          `Active mutation packets #${a.number} and #${b.number} hold overlapping leases: ${overlap ?? sharedDomainLabel}`,
          { issues: [a.number, b.number], overlap: overlap ?? sharedDomainLabel },
        );
      }
    }
  }

  void packet;
}

function checkMutationBinding(context, report, packet) {
  const issue = context.issue;
  if (!issue) return;
  const labels = issue.labels ?? [];
  const isMutation = labels.includes("mode:mutation") || packet.mode === "mutation";
  const state = stateLabel(labels);
  if (!isMutation || !STATES_REQUIRING_BYTES.includes(state)) return;

  report.checked.push("mutation-binding");

  if (!Array.isArray(context.linkedBranches) || !Array.isArray(context.linkedPullRequests)) {
    report.manual(
      "one branch and one Draft PR linked to this Issue",
      "the webhook payload does not enumerate the branches and pull requests bound to an Issue",
    );
    return;
  }
  if (context.linkedBranches.length !== 1 || context.linkedPullRequests.length !== 1) {
    report.fail(
      CODES.MISSING_BRANCH_OR_DRAFT_PR,
      `A mutation packet in ${state} requires exactly one branch and one Draft PR; found ${context.linkedBranches.length} branch(es) and ${context.linkedPullRequests.length} pull request(s)`,
      {
        branches: context.linkedBranches,
        pullRequests: context.linkedPullRequests.map((p) => p.number),
      },
    );
    return;
  }
  const linked = context.linkedPullRequests[0];
  if (linked.draft === false && state !== "state:owner-gate") {
    report.fail(
      CODES.NON_DRAFT_BEFORE_OWNER_GATE,
      `Pull request #${linked.number} is not Draft while the Issue is ${state}; a mutation PR stays Draft until the Owner gate`,
      { pullRequest: linked.number, state },
    );
  }
}

function prMarker(body, label) {
  const pattern = new RegExp(`^[-*\\s]*${escapeRegExp(label)}\\s*:\\s*(.*)$`, "im");
  const match = pattern.exec(String(body ?? ""));
  return match ? norm(match[1]) : "";
}

function checkPullRequest(context, report, packet) {
  const pr = context.pullRequest;
  if (!pr) return;
  report.checked.push("pull-request");

  const body = String(pr.body ?? "");

  if (!/^KBP_PACKET\/v1\b/m.test(body)) {
    report.fail(
      CODES.PR_BINDING_MISMATCH,
      "Pull request body does not begin with the KBP_PACKET/v1 marker",
      { pullRequest: pr.number },
    );
  }

  const declared = {
    issue: prMarker(body, "Linked Issue").replace(/^#/, ""),
    packetId: prMarker(body, "Packet ID"),
    branch: prMarker(body, "Branch"),
    base: prMarker(body, "Base SHA (full 40-hex)") || prMarker(body, "Base SHA"),
    head: prMarker(body, "Head SHA (full 40-hex)") || prMarker(body, "Head SHA"),
  };

  const mismatches = [];
  if (context.issue && declared.issue !== String(context.issue.number)) {
    mismatches.push(`linked Issue "${declared.issue}" != #${context.issue.number}`);
  }
  if (packet.packetId && declared.packetId !== packet.packetId) {
    mismatches.push(`packet ID "${declared.packetId}" != "${packet.packetId}"`);
  }
  if (pr.head?.ref && declared.branch !== pr.head.ref) {
    mismatches.push(`declared branch "${declared.branch}" != PR head branch "${pr.head.ref}"`);
  }
  if (packet.branch && pr.head?.ref && packet.branch !== pr.head.ref) {
    mismatches.push(`Issue branch "${packet.branch}" != PR head branch "${pr.head.ref}"`);
  }
  if (packet.baseSha && declared.base !== packet.baseSha) {
    mismatches.push(`declared base "${declared.base}" != Issue base "${packet.baseSha}"`);
  }
  if (pr.head?.sha && declared.head !== pr.head.sha) {
    mismatches.push(`declared head "${declared.head}" != PR head "${pr.head.sha}"`);
  }
  for (const mismatch of mismatches) {
    report.fail(CODES.PR_BINDING_MISMATCH, `Pull request binding mismatch: ${mismatch}`, {
      pullRequest: pr.number,
      mismatch,
    });
  }

  // Changed paths against the exact allowlist.
  if (!Array.isArray(pr.changedPaths)) {
    report.manual(
      "changed paths of this pull request",
      "the pull_request webhook payload does not enumerate changed files",
    );
  } else if (packet.allowlist) {
    const allowed = new Set(packet.allowlist.entries.map((e) => e.path));
    const outside = pr.changedPaths.filter((p) => !allowed.has(p));
    if (outside.length > 0) {
      report.fail(
        CODES.PATH_OUTSIDE_ALLOWLIST,
        `Changed paths outside the Issue allowlist: ${outside.join(", ")}`,
        { pullRequest: pr.number, outside },
      );
    }
  }

  // Draft discipline, evaluated from the PR itself.
  const state = context.issue ? stateLabel(context.issue.labels) : null;
  if (pr.draft === false && state && state !== "state:owner-gate" && state !== "state:done") {
    report.fail(
      CODES.NON_DRAFT_BEFORE_OWNER_GATE,
      `Pull request #${pr.number} is not Draft while the Issue is ${state}`,
      { pullRequest: pr.number, state },
    );
  }

  // A docs-only or infrastructure diff cannot carry runtime proof.
  if (Array.isArray(pr.changedPaths) && pr.changedPaths.length > 0) {
    const docsOnly = pr.changedPaths.every((p) => DOCS_OR_INFRA.some((test) => test(p)));
    if (docsOnly) {
      const prose = stripQuotedRegions(body);
      for (const pattern of RUNTIME_CLAIM_PATTERNS) {
        const hit = pattern.exec(prose);
        if (hit) {
          report.fail(
            CODES.UNSUPPORTED_RUNTIME_CLAIM,
            `Documentation and infrastructure diff claims runtime evidence: "${hit[0]}"`,
            { pullRequest: pr.number, claim: hit[0] },
          );
        }
      }
    }
  }
}

function checkResultAndReview(context, report, packet) {
  const issue = context.issue;
  const pr = context.pullRequest;
  const state = issue ? stateLabel(issue.labels) : null;

  // RESULT completeness.
  if (issue && ["state:result", "state:review", "state:owner-gate"].includes(state)) {
    report.checked.push("result-completeness");
    if (!Array.isArray(issue.comments)) {
      report.manual(
        "RESULT comment content",
        "the event payload carries no full comment list",
      );
    } else {
      const result = issue.comments.find((c) =>
        new RegExp(`^RESULT\\s+—\\s+${escapeRegExp(packet.packetId)}\\b`).test(norm(c.body)),
      );
      if (!result) {
        report.fail(
          CODES.RESULT_INCOMPLETE,
          `No "RESULT — ${packet.packetId}" comment is persisted for ${state}`,
          { packetId: packet.packetId },
        );
      } else {
        const missing = [];
        if (!ANY_FULL_SHA.test(result.body)) missing.push("exact head SHA");
        if (!/\bnpm\b|\bnode\b|\bgit\b/.test(result.body)) missing.push("commands");
        const allowlistPaths = packet.allowlist?.entries.map((e) => e.path) ?? [];
        if (allowlistPaths.length > 0 && !allowlistPaths.some((p) => result.body.includes(p))) {
          missing.push("changed paths");
        }
        if (!/\/pull\/\d+/.test(result.body)) missing.push("Draft PR URL");
        if (!/residual risk/i.test(result.body)) missing.push("residual risk");
        if (missing.length > 0) {
          report.fail(
            CODES.RESULT_INCOMPLETE,
            `RESULT comment is missing: ${missing.join(", ")}`,
            { packetId: packet.packetId, missing },
          );
        }
      }
    }
  }

  if (!pr || !Array.isArray(pr.reviews)) {
    if (state === "state:owner-gate") {
      report.manual(
        "exact-head review evidence for the Owner gate",
        "no review list was supplied with this event",
      );
    }
    return;
  }

  report.checked.push("review-binding");
  const verdicts = pr.reviews.filter((r) => /REVIEW_VERDICT|\bverdict\b/i.test(String(r.body ?? "")));
  const latest = verdicts.length > 0 ? verdicts[verdicts.length - 1] : null;

  if (latest) {
    const cited = ANY_FULL_SHA.exec(String(latest.body ?? ""));
    if (!cited || cited[0] !== pr.head?.sha) {
      report.fail(
        CODES.REVIEW_NOT_AT_HEAD,
        `Review verdict pins ${cited ? cited[0] : "no SHA"}; it must pin the current pull request head ${pr.head?.sha ?? "(unknown)"}`,
        { pullRequest: pr.number, cited: cited ? cited[0] : null, head: pr.head?.sha ?? null },
      );
    }
    if (latest.commitId && pr.head?.sha && latest.commitId !== pr.head.sha) {
      report.fail(
        CODES.COMMIT_AFTER_REVIEW,
        `A commit landed after the latest review: review examined ${latest.commitId}, head is now ${pr.head.sha}`,
        { pullRequest: pr.number, reviewed: latest.commitId, head: pr.head.sha },
      );
    }
    if (latest.author && pr.author && latest.author === pr.author) {
      report.fail(
        CODES.AUTHOR_IS_REVIEWER,
        `Review author "${latest.author}" is the author of the reviewed head; an author never reviews its own work`,
        { pullRequest: pr.number, author: pr.author },
      );
    } else if (!/\bsession\b/i.test(String(latest.body ?? ""))) {
      report.manual(
        "reviewer engagement identity",
        "GitHub API identity cannot prove that the reviewing engagement differs from the authoring engagement; the review must state its session and model explicitly",
      );
    }
  }

  const declaredReviewer = norm(packet.fields?.["Independent reviewer"]);
  const declaredSession = norm(packet.fields?.["Session label"]);
  if (declaredReviewer && declaredSession && declaredReviewer === declaredSession) {
    report.fail(
      CODES.AUTHOR_IS_REVIEWER,
      `The declared independent reviewer "${declaredReviewer}" is the authoring session; they must be different engagements`,
      { reviewer: declaredReviewer, session: declaredSession },
    );
  }

  // Owner-gate or merge transition.
  const gateRequested = state === "state:owner-gate" || context.merge?.requested === true;
  if (gateRequested) {
    report.checked.push("owner-gate-evidence");
    const valid =
      latest &&
      latest.commitId === pr.head?.sha &&
      ANY_FULL_SHA.exec(String(latest.body ?? ""))?.[0] === pr.head?.sha &&
      latest.author !== pr.author;
    if (!valid) {
      report.fail(
        CODES.GATE_WITHOUT_REVIEW_EVIDENCE,
        `Owner-gate or merge transition requires a non-author review pinned to the exact head ${pr.head?.sha ?? "(unknown)"}`,
        { pullRequest: pr.number, head: pr.head?.sha ?? null },
      );
    }
  }
}

function escapeRegExp(value) {
  return String(value ?? "").replace(/[.*+?^${}()|[\]\\—]/g, "\\$&");
}

/**
 * Evaluate one normalized context and return a machine-readable report.
 * Pure: no filesystem access, no network, no mutation of the input.
 */
export function evaluate(context) {
  const report = newReport(context);
  const packet = { fields: null, packetId: "", mode: "", branch: "", baseSha: null, allowlist: null };

  if (context.eventName && !SUPPORTED_EVENTS.includes(context.eventName)) {
    report.manual(
      `event family "${context.eventName}"`,
      "this gate validates issues, issue_comment, pull_request, pull_request_review, and workflow_dispatch only",
    );
  }

  checkIssuePacket(context, report, packet);
  checkBoard(context, report, packet);
  checkMutationBinding(context, report, packet);
  checkPullRequest(context, report, packet);
  checkResultAndReview(context, report, packet);

  if (Array.isArray(context.controlPlaneFiles) && context.controlPlaneFiles.length > 0) {
    auditControlPlane(context.controlPlaneFiles, report);
  }

  delete report.fail;
  delete report.manual;
  return report;
}

/* ------------------------------------------------------------------------- *
 * Live GitHub event normalization
 * ------------------------------------------------------------------------- */

/** Map a GitHub webhook payload onto the same context shape fixtures use. */
export function normalizeGitHubEvent(eventName, payload, extra = {}) {
  const context = { eventName, action: payload?.action ?? null, ...extra };

  const issue = payload?.issue;
  if (issue) {
    context.issue = {
      number: issue.number,
      state: issue.state,
      body: issue.body ?? "",
      author: issue.user?.login ?? null,
      labels: (issue.labels ?? []).map((l) => (typeof l === "string" ? l : l.name)),
      comments: payload?.comment ? [{ author: payload.comment.user?.login ?? null, body: payload.comment.body ?? "" }] : undefined,
    };
  }

  const pr = payload?.pull_request;
  if (pr) {
    context.pullRequest = {
      number: pr.number,
      draft: pr.draft === true,
      author: pr.user?.login ?? null,
      body: pr.body ?? "",
      base: { ref: pr.base?.ref ?? null, sha: pr.base?.sha ?? null },
      head: { ref: pr.head?.ref ?? null, sha: pr.head?.sha ?? null },
      reviews: payload?.review
        ? [
            {
              author: payload.review.user?.login ?? null,
              state: payload.review.state ?? null,
              commitId: payload.review.commit_id ?? null,
              body: payload.review.body ?? "",
            },
          ]
        : undefined,
    };
  }

  return context;
}

/* ------------------------------------------------------------------------- *
 * Human summary
 * ------------------------------------------------------------------------- */

export function formatHuman(report) {
  const lines = [];
  lines.push(`KBP Packet Gate — ${report.status}`);
  lines.push(
    `event: ${report.eventName ?? "(none)"}${report.action ? `/${report.action}` : ""}` +
      `  issue: ${report.subject.issue ?? "-"}  pull request: ${report.subject.pullRequest ?? "-"}`,
  );
  lines.push(`checks run: ${report.checked.length > 0 ? report.checked.join(", ") : "(none)"}`);

  if (report.failures.length === 0) {
    lines.push("no fail-closed condition observed");
  } else {
    lines.push(`${report.failures.length} fail-closed condition(s):`);
    for (const failure of report.failures) lines.push(`  ${failure.code}: ${failure.detail}`);
  }

  if (report.manualEvidenceRequired.length > 0) {
    lines.push(`${report.manualEvidenceRequired.length} fact(s) GitHub cannot prove automatically:`);
    for (const item of report.manualEvidenceRequired) {
      lines.push(`  ${MANUAL_EVIDENCE_REQUIRED}: ${item.fact} — ${item.reason}`);
    }
  }

  lines.push(
    "A PASS means the observable transition is consistent. It is not Owner acceptance, review, or approval.",
  );
  return lines.join("\n");
}

/* ------------------------------------------------------------------------- *
 * CLI
 * ------------------------------------------------------------------------- */

export function parseArgs(argv) {
  const args = { jsonOnly: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--fixture") args.fixture = argv[++i];
    else if (arg === "--event") args.event = argv[++i];
    else if (arg === "--event-name") args.eventName = argv[++i];
    else if (arg === "--repo-root") args.repoRoot = argv[++i];
    else if (arg === "--json-only") args.jsonOnly = true;
    else if (arg === "--help" || arg === "-h") args.help = true;
    else args.unknown = arg;
  }
  return args;
}

const USAGE = `KBP Packet Gate — read-only control-plane validator

  packet-gate.mjs --fixture <file.json> [--repo-root <dir>] [--json-only]
  packet-gate.mjs --event <file.json> --event-name <name> [--repo-root <dir>]

This program only reads. It never writes to GitHub and never launches a worker.`;

export function run(argv) {
  const args = parseArgs(argv);
  if (args.help) return { text: USAGE, code: 0 };
  if (args.unknown) return { text: `unknown argument: ${args.unknown}\n\n${USAGE}`, code: 2 };

  let context;
  if (args.fixture) {
    context = JSON.parse(readFileSync(args.fixture, "utf8"));
  } else if (args.event) {
    if (!args.eventName) return { text: `--event requires --event-name\n\n${USAGE}`, code: 2 };
    const payload = existsSync(args.event) ? JSON.parse(readFileSync(args.event, "utf8")) : {};
    context = normalizeGitHubEvent(args.eventName, payload);
  } else if (args.eventName) {
    context = { eventName: args.eventName };
  } else {
    return { text: `nothing to validate\n\n${USAGE}`, code: 2 };
  }

  if (args.repoRoot && !Array.isArray(context.controlPlaneFiles)) {
    context.controlPlaneFiles = collectControlPlaneFiles(args.repoRoot);
    const manifest = path.join(args.repoRoot, "governance/control-plane/labels-v1.json");
    if (existsSync(manifest) && !context.labelManifest) {
      context.labelManifest = JSON.parse(readFileSync(manifest, "utf8"));
    }
  }

  const report = evaluate(context);
  const text = args.jsonOnly
    ? JSON.stringify(report, null, 2)
    : `${JSON.stringify(report, null, 2)}\n\n${formatHuman(report)}`;
  return { text, code: report.status === "PASS" ? 0 : 1 };
}

const invokedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);

if (invokedDirectly) {
  const { text, code } = run(process.argv.slice(2));
  process.stdout.write(`${text}\n`);
  process.exitCode = code;
}
