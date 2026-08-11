// Focused tests for the KBP Packet Gate controller.
//
// Run with:  node --test tools/control-plane/packet-gate.test.mjs
//
// Every fixture is built inside this process. No dependency is added and no
// repository artifact is generated. Assertions are made against stable error
// codes, never against message text.
//
// NOTE: this file is a documented exclusion from the AI-dispatch scan, because
// it declares the forbidden tokens as fixtures in order to test the scanner.
// The exclusion is declared in SCANNED_SURFACES.documentedExclusions and is
// asserted below, so it cannot be widened silently.

import assert from 'node:assert/strict';
import { readFileSync, existsSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';

// This suite is authored for Node's built-in test runner and is run that way by
// its declared command:
//
//   node --test tools/control-plane/packet-gate.test.mjs
//
// The repository's own suite runs under vitest, whose default file glob
// (**/*.test.mjs) also collects this path. A file that registers only
// node:test cases reports zero suites to vitest and fails the run, so the
// runner API is resolved at load time instead. Both runners expose the same
// test(name, fn) signature, node:assert covers the assertions, and no
// dependency is added — vitest is already a devDependency and is imported only
// when vitest is the process actually running.
const UNDER_VITEST = Boolean(process.env.VITEST || process.env.VITEST_WORKER_ID);
const { test } = UNDER_VITEST ? await import('vitest') : await import('node:test');

import {
  CODES,
  FIELD_HEADINGS,
  SCANNED_SURFACES,
  SUPPORTED_EVENTS,
  ACTIVE_MUTATION_STATES,
  MAX_ACTIVE_MUTATION_PACKETS,
  evaluate,
  normalizeEvent,
  parseSimpleYaml,
  parseIssueForm,
  parseAllowlist,
  extractBaseSha,
  auditWorkflowPermissions,
  auditControlPlaneFiles,
  findDispatchTokens,
  checkLabelExclusivity,
  auditResultComment,
  parseDependsOn,
  summarize,
} from './packet-gate.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '../..');
const WORKFLOW_PATH = join(REPO_ROOT, '.github/workflows/kbp-packet-gate.yml');
const FORM_PATH = join(REPO_ROOT, '.github/ISSUE_TEMPLATE/worker-packet.yml');
const CONFIG_PATH = join(REPO_ROOT, '.github/ISSUE_TEMPLATE/config.yml');
const PR_TEMPLATE_PATH = join(REPO_ROOT, '.github/pull_request_template.md');
const LABELS_PATH = join(REPO_ROOT, 'governance/control-plane/labels-v1.json');
const PROJECT_PATH = join(REPO_ROOT, 'governance/control-plane/project-v1.json');

const BASE_SHA = 'c201836eee31ff55472cb4731e11745e3094849d';
const HEAD_SHA = '1f2e3d4c5b6a798807162534435261708192a3b4';
const OTHER_SHA = '9988776655443322110000ffeeddccbbaa998877';

// ---------------------------------------------------------------------------
// Fixture builders — all created in-process.
// ---------------------------------------------------------------------------

const VALID_MUTATION_FIELDS = {
  packet_id: 'TEST-MUTATION-001',
  outcome: 'Add exactly one control-plane validator module and its focused test.',
  repository: 'WEST-COAST-KBP-ADU/construction-os',
  base_sha: `main@${BASE_SHA}`,
  worker: 'Opus',
  model_id: 'claude-opus-5',
  clone: '/home/user/construction-os',
  session: 'test-mutation-001-opus-1',
  mode: 'Mutation',
  branch_or_target: 'agent/test-mutation-001',
  read_order: '1. governance/BOUNDARIES.md\n2. governance/office/OPERATING-MODEL-v5.md',
  allowlist: 'create tools/control-plane/example.mjs\nmodify governance/control-plane/README.md',
  domain_lease: 'domain:github-control-plane covering tools/control-plane and governance/control-plane',
  prohibitions: '- No scope widening; new work becomes a new packet.\n- No merge, approval, or deployment.',
  quality_target: 'node --test exits 0 with zero failing assertions and 100 percent of declared codes asserted.',
  gates: '- `npm test` exits 0\n- `npm run lint` exits 0',
  reviewer: 'one fresh non-author Codex Pro engagement',
  integration_order: 'depends-on: none',
  stop_conditions: '- `BLOCKED — GATE FAILURE`\n- `BLOCKED — BASE DRIFT`',
  result_contract: 'Publish one comment beginning RESULT and release the lease at CLEANUP.',
  confirmations: [
    '- [X] One Issue, one session, one branch, and one Draft PR carry this packet.',
    '- [X] The authoring engagement will not review its own result.',
    '- [X] Tony alone adopts this outcome and merges the pull request.',
    '- [X] The worker is launched manually by the Owner.',
    '- [X] This packet is closed-world authorization.',
  ].join('\n'),
};

const VALID_READONLY_FIELDS = {
  ...VALID_MUTATION_FIELDS,
  packet_id: 'TEST-REVIEW-001',
  outcome: 'Certify one exact head SHA with one terminal verdict and author no repository byte.',
  mode: 'Read-only',
  branch_or_target: 'read-only target: pull request #501 at exact head 1f2e3d4c5b6a798807162534435261708192a3b4',
  allowlist: 'none',
  domain_lease: 'no file lease; this packet authors no repository byte',
  session: 'test-review-001-codex-1',
  worker: 'Codex',
  model_id: 'codex-pro',
};

function buildBody(fields, omit = []) {
  const parts = [];
  for (const [key, heading] of Object.entries(FIELD_HEADINGS)) {
    if (omit.includes(key)) continue;
    parts.push(`### ${heading}\n\n${fields[key]}`);
  }
  return parts.join('\n\n');
}

const RESULT_COMMENT = [
  'RESULT — TEST-MUTATION-001',
  '',
  `Exact head: ${HEAD_SHA}`,
  'Changed paths: tools/control-plane/example.mjs, governance/control-plane/README.md',
  'Command: `npm test` exited 0.',
  'Draft PR: https://github.com/WEST-COAST-KBP-ADU/construction-os/pull/501',
  'Residual risk: none beyond the declared allowlist.',
].join('\n');

const INDEPENDENT_REVIEW_BODY = [
  'REVIEW_VERDICT — TEST-MUTATION-001',
  'Reviewer model and lane: Codex Pro, a separate engagement.',
  'This engagement is non-author: it did not author the reviewed head.',
  'Terminal verdict: NO BLOCKING FINDING.',
].join('\n');

function mutationIssue(overrides = {}) {
  const { fields = VALID_MUTATION_FIELDS, omit = [], labels, comments, ...rest } = overrides;
  return {
    number: 500,
    title: '[TEST-MUTATION-001] control-plane validator',
    body: buildBody(fields, omit),
    state: 'open',
    author: 'packet-author',
    labels: labels ?? [
      'state:owner-gate',
      'worker:opus',
      'mode:mutation',
      'kind:infrastructure',
      'gate:control-plane',
      'domain:github-control-plane',
    ],
    comments: comments ?? [{ id: 1, author: 'packet-author', body: RESULT_COMMENT }],
    ...rest,
  };
}

function draftPr(overrides = {}) {
  return {
    number: 501,
    draft: true,
    merged: false,
    author: 'packet-author',
    body: [
      'KBP_PACKET/v1',
      'Linked Issue: #500',
      'Packet ID: TEST-MUTATION-001',
      'Production untouched by this pull request: yes.',
      'Preview required for this diff: no. Disposition: not applicable, infrastructure-only diff.',
    ].join('\n'),
    base: { ref: 'main', sha: BASE_SHA },
    head: { ref: 'agent/test-mutation-001', sha: HEAD_SHA },
    changedFiles: ['tools/control-plane/example.mjs', 'governance/control-plane/README.md'],
    commits: [{ sha: HEAD_SHA, committedAt: '2026-08-11T04:00:00Z' }],
    ...overrides,
  };
}

function exactHeadReview(overrides = {}) {
  return {
    author: 'independent-reviewer',
    body: INDEPENDENT_REVIEW_BODY,
    state: 'COMMENTED',
    commitId: HEAD_SHA,
    submittedAt: '2026-08-11T05:00:00Z',
    ...overrides,
  };
}

function board(entries) {
  return { issues: entries };
}

function validMutationInput(overrides = {}) {
  return {
    event: { name: 'pull_request_review', action: 'submitted' },
    repoRoot: REPO_ROOT,
    issue: mutationIssue(),
    pullRequest: draftPr(),
    reviews: [exactHeadReview()],
    board: board([
      {
        number: 500,
        labels: ['state:owner-gate', 'mode:mutation', 'domain:github-control-plane'],
        allowlistPaths: ['tools/control-plane/example.mjs'],
        state: 'open',
      },
    ]),
    ...overrides,
  };
}

const codesOf = (report) => report.failures.map((f) => f.code);

// ---------------------------------------------------------------------------
// Valid packets
// ---------------------------------------------------------------------------

test('a valid read-only review packet passes with no fail-closed finding', () => {
  const report = evaluate({
    event: { name: 'issues', action: 'labeled' },
    repoRoot: REPO_ROOT,
    issue: {
      number: 600,
      title: '[TEST-REVIEW-001] exact-head certification',
      body: buildBody(VALID_READONLY_FIELDS),
      state: 'open',
      author: 'reviewer-account',
      labels: [
        'state:active',
        'worker:codex',
        'mode:read-only',
        'kind:review',
        'gate:g0',
        'domain:governance',
      ],
      comments: [{ id: 1, author: 'reviewer-account', body: 'STARTED — TEST-REVIEW-001\n\nRead-only engagement.' }],
    },
    board: board([{ number: 600, labels: ['state:active', 'mode:read-only'], state: 'open' }]),
  });
  assert.deepEqual(report.failures, []);
  assert.equal(report.subject.mode, 'read-only');
  assert.equal(report.status, 'consistent');
});

test('a valid mutation Issue to Draft PR to exact-head review to Owner gate passes', () => {
  const report = evaluate(validMutationInput());
  assert.deepEqual(codesOf(report), []);
  assert.equal(report.status, 'consistent');
  assert.equal(report.subject.state, 'state:owner-gate');
  // The gate never asserts acceptance.
  assert.match(report.meaning, /not Owner acceptance/);
});

test('each supported event family produces a report', () => {
  const seen = [];
  for (const name of SUPPORTED_EVENTS) {
    const report = evaluate({ ...validMutationInput(), event: { name } });
    assert.equal(report.event, name);
    assert.equal(report.gate, 'KBP Packet Gate');
    seen.push(name);
  }
  assert.deepEqual(seen, [...SUPPORTED_EVENTS]);
});

// ---------------------------------------------------------------------------
// The twenty fail-closed conditions
// ---------------------------------------------------------------------------

test('KBP001 — missing required Issue field', () => {
  const report = evaluate(validMutationInput({ issue: mutationIssue({ omit: ['quality_target'] }) }));
  assert.ok(codesOf(report).includes(CODES.MISSING_REQUIRED_FIELD));
});

test('KBP001 — an unchecked confirmation is a missing required field', () => {
  const fields = { ...VALID_MUTATION_FIELDS, confirmations: '- [ ] One Issue, one session, one branch.' };
  const report = evaluate(validMutationInput({ issue: mutationIssue({ fields }) }));
  assert.ok(codesOf(report).includes(CODES.MISSING_REQUIRED_FIELD));
});

test('KBP002 — moving base instead of a full 40-hex SHA', () => {
  const fields = { ...VALID_MUTATION_FIELDS, base_sha: 'main' };
  const report = evaluate(validMutationInput({ issue: mutationIssue({ fields }) }));
  assert.ok(codesOf(report).includes(CODES.BASE_SHA_NOT_EXACT));
});

test('KBP002 — abbreviated SHA is rejected', () => {
  const fields = { ...VALID_MUTATION_FIELDS, base_sha: 'c201836' };
  const report = evaluate(validMutationInput({ issue: mutationIssue({ fields }) }));
  assert.ok(codesOf(report).includes(CODES.BASE_SHA_NOT_EXACT));
  assert.equal(extractBaseSha('c201836').ok, false);
  assert.equal(extractBaseSha(BASE_SHA).sha, BASE_SHA);
  assert.equal(extractBaseSha(BASE_SHA.toUpperCase()).ok, false);
});

test('KBP003 — wildcard, directory-only, and ambiguous allowlist entries', () => {
  for (const allowlist of ['create src/**/*.tsx', 'modify src/components/', 'create src/components', 'add src/a.ts']) {
    const fields = { ...VALID_MUTATION_FIELDS, allowlist };
    const report = evaluate(validMutationInput({ issue: mutationIssue({ fields }) }));
    assert.ok(codesOf(report).includes(CODES.ALLOWLIST_AMBIGUOUS), `expected ambiguity for: ${allowlist}`);
  }
  assert.equal(parseAllowlist('create a/b.md').problems.length, 0);
  assert.equal(parseAllowlist('create a/b.md').entries[0].path, 'a/b.md');
});

test('KBP003 — a mutation packet may not declare an allowlist of none', () => {
  const fields = { ...VALID_MUTATION_FIELDS, allowlist: 'none' };
  const report = evaluate(validMutationInput({ issue: mutationIssue({ fields }) }));
  assert.ok(codesOf(report).includes(CODES.ALLOWLIST_AMBIGUOUS));
});

test('KBP004 — forbidden open delegation in a delegating field', () => {
  for (const phrase of ['relevant docs', 'make it premium', 'use the best asset', 'the smallest suitable module']) {
    const fields = { ...VALID_MUTATION_FIELDS, outcome: `Update ${phrase} for the release.` };
    const report = evaluate(validMutationInput({ issue: mutationIssue({ fields }) }));
    assert.ok(codesOf(report).includes(CODES.OPEN_DELEGATION), `expected open delegation for: ${phrase}`);
  }
});

test('KBP004 — quoting a forbidden phrase inside Prohibitions is not a violation', () => {
  const fields = {
    ...VALID_MUTATION_FIELDS,
    prohibitions: 'Open delegation such as "relevant docs" or "make it premium" is prohibited.',
  };
  const report = evaluate(validMutationInput({ issue: mutationIssue({ fields }) }));
  assert.ok(!codesOf(report).includes(CODES.OPEN_DELEGATION));
});

test('KBP005 — zero or multiple labels in an exclusive category', () => {
  const twoStates = evaluate(
    validMutationInput({
      issue: mutationIssue({
        labels: ['state:owner-gate', 'state:active', 'worker:opus', 'mode:mutation', 'kind:infrastructure', 'gate:control-plane', 'domain:github-control-plane'],
      }),
    }),
  );
  assert.ok(codesOf(twoStates).includes(CODES.LABEL_EXCLUSIVITY));

  const noGate = evaluate(
    validMutationInput({
      issue: mutationIssue({
        labels: ['state:owner-gate', 'worker:opus', 'mode:mutation', 'kind:infrastructure', 'domain:github-control-plane'],
      }),
    }),
  );
  assert.ok(codesOf(noGate).includes(CODES.LABEL_EXCLUSIVITY));

  const manifest = JSON.parse(readFileSync(LABELS_PATH, 'utf8'));
  const forCategory = (labels, id) => checkLabelExclusivity(labels, manifest).filter((p) => p.category === id);

  assert.equal(forCategory(['state:ready', 'state:done'], 'state')[0].reason, 'more than one label in this exclusive category');
  assert.equal(forCategory([], 'state')[0].reason, 'no label in this exclusive category');
  // An undeclared label inside an exclusive category is also a violation.
  assert.equal(forCategory(['state:not-a-real-state'], 'state')[0].reason, 'label is not declared in labels-v1.json');
  // Every exclusive category is checked independently, so a partial label set
  // reports one problem per unsatisfied category.
  assert.equal(checkLabelExclusivity(['state:ready', 'state:done'], manifest).length, manifest.categories.length);
  assert.equal(
    checkLabelExclusivity(
      ['state:ready', 'worker:opus', 'mode:mutation', 'kind:infrastructure', 'gate:control-plane', 'domain:governance'],
      manifest,
    ).length,
    0,
  );
});

test('KBP006 — state:active without a persisted STARTED record', () => {
  const report = evaluate(
    validMutationInput({
      issue: mutationIssue({
        labels: ['state:active', 'worker:opus', 'mode:mutation', 'kind:infrastructure', 'gate:control-plane', 'domain:github-control-plane'],
        comments: [{ id: 1, author: 'packet-author', body: 'Working on it.' }],
      }),
    }),
  );
  assert.ok(codesOf(report).includes(CODES.ACTIVE_WITHOUT_STARTED));
});

test('KBP006 — a persisted STARTED record satisfies state:active', () => {
  const report = evaluate(
    validMutationInput({
      issue: mutationIssue({
        labels: ['state:active', 'worker:opus', 'mode:mutation', 'kind:infrastructure', 'gate:control-plane', 'domain:github-control-plane'],
        comments: [{ id: 1, author: 'packet-author', body: 'STARTED — TEST-MUTATION-001\n\nSession evidence.' }],
      }),
    }),
  );
  assert.ok(!codesOf(report).includes(CODES.ACTIVE_WITHOUT_STARTED));
});

test('KBP007 — more than two active mutation packets', () => {
  const report = evaluate(
    validMutationInput({
      board: board([
        { number: 1, labels: ['mode:mutation', 'state:active', 'domain:governance'], allowlistPaths: ['a/one.md'] },
        { number: 2, labels: ['mode:mutation', 'state:result', 'domain:release'], allowlistPaths: ['b/two.md'] },
        { number: 3, labels: ['mode:mutation', 'state:review', 'domain:catalog'], allowlistPaths: ['c/three.md'] },
      ]),
    }),
  );
  assert.ok(codesOf(report).includes(CODES.WIP_LIMIT_EXCEEDED));
  assert.equal(MAX_ACTIVE_MUTATION_PACKETS, 2);
  assert.ok(ACTIVE_MUTATION_STATES.includes('state:review'));
});

test('KBP008 — overlapping active mutation domain or file lease', () => {
  const sameDomain = evaluate(
    validMutationInput({
      board: board([
        { number: 1, labels: ['mode:mutation', 'state:active', 'domain:governance'], allowlistPaths: ['a/one.md'] },
        { number: 2, labels: ['mode:mutation', 'state:active', 'domain:governance'], allowlistPaths: ['b/two.md'] },
      ]),
    }),
  );
  assert.ok(codesOf(sameDomain).includes(CODES.DOMAIN_LEASE_CONFLICT));

  const sharedPath = evaluate(
    validMutationInput({
      board: board([
        { number: 1, labels: ['mode:mutation', 'state:active', 'domain:governance'], allowlistPaths: ['shared/file.md'] },
        { number: 2, labels: ['mode:mutation', 'state:active', 'domain:release'], allowlistPaths: ['shared/file.md'] },
      ]),
    }),
  );
  assert.ok(codesOf(sharedPath).includes(CODES.DOMAIN_LEASE_CONFLICT));
});

test('KBP009 — dependent packet whose predecessor is not merged or closed', () => {
  const fields = { ...VALID_MUTATION_FIELDS, integration_order: 'depends-on: #161' };
  const report = evaluate(
    validMutationInput({
      issue: mutationIssue({ fields }),
      board: board([{ number: 161, labels: ['mode:mutation', 'state:active', 'domain:governance'], state: 'open' }]),
    }),
  );
  assert.ok(codesOf(report).includes(CODES.PREDECESSOR_NOT_MERGED));
  assert.deepEqual(parseDependsOn('depends-on: #161, #162'), [161, 162]);
  assert.deepEqual(parseDependsOn('depends-on: none'), []);
});

test('KBP009 — a merged predecessor satisfies the dependency', () => {
  const fields = { ...VALID_MUTATION_FIELDS, integration_order: 'depends-on: #161' };
  const report = evaluate(
    validMutationInput({
      issue: mutationIssue({ fields }),
      board: board([{ number: 161, labels: ['state:done'], state: 'closed' }]),
    }),
  );
  assert.ok(!codesOf(report).includes(CODES.PREDECESSOR_NOT_MERGED));
});

test('KBP010 — mutation packet without exactly one linked branch and Draft PR', () => {
  const none = evaluate(validMutationInput({ pullRequest: null, linkedPullRequests: [], reviews: [] }));
  assert.ok(codesOf(none).includes(CODES.MISSING_BRANCH_OR_DRAFT_PR));

  const two = evaluate(
    validMutationInput({
      linkedPullRequests: [draftPr(), draftPr({ number: 502, head: { ref: 'agent/other', sha: OTHER_SHA } })],
    }),
  );
  assert.ok(codesOf(two).includes(CODES.MISSING_BRANCH_OR_DRAFT_PR));
});

test('KBP011 — PR branch, base, Issue, or packet mismatch', () => {
  const wrongBranch = evaluate(validMutationInput({ pullRequest: draftPr({ head: { ref: 'agent/wrong', sha: HEAD_SHA } }) }));
  assert.ok(codesOf(wrongBranch).includes(CODES.PR_BINDING_MISMATCH));

  const wrongBase = evaluate(validMutationInput({ pullRequest: draftPr({ base: { ref: 'main', sha: OTHER_SHA } }) }));
  assert.ok(codesOf(wrongBase).includes(CODES.PR_BINDING_MISMATCH));

  const wrongIssue = evaluate(validMutationInput({ pullRequest: draftPr({ body: 'KBP_PACKET/v1 with no linkage' }) }));
  assert.ok(codesOf(wrongIssue).includes(CODES.PR_BINDING_MISMATCH));
});

test('KBP012 — changed path outside the exact Issue allowlist', () => {
  const report = evaluate(
    validMutationInput({
      pullRequest: draftPr({
        changedFiles: ['tools/control-plane/example.mjs', 'src/app/page.tsx'],
      }),
    }),
  );
  assert.ok(codesOf(report).includes(CODES.PATH_OUTSIDE_ALLOWLIST));
  const detail = report.failures.find((f) => f.code === CODES.PATH_OUTSIDE_ALLOWLIST).detail;
  assert.deepEqual(detail, ['src/app/page.tsx']);
});

test('KBP013 — non-Draft PR before state:owner-gate', () => {
  const report = evaluate(
    validMutationInput({
      issue: mutationIssue({
        labels: ['state:result', 'worker:opus', 'mode:mutation', 'kind:infrastructure', 'gate:control-plane', 'domain:github-control-plane'],
      }),
      pullRequest: draftPr({ draft: false }),
    }),
  );
  assert.ok(codesOf(report).includes(CODES.PR_READY_BEFORE_OWNER_GATE));
});

test('KBP013 — a non-Draft PR at state:owner-gate is permitted', () => {
  const report = evaluate(validMutationInput({ pullRequest: draftPr({ draft: false }) }));
  assert.ok(!codesOf(report).includes(CODES.PR_READY_BEFORE_OWNER_GATE));
});

test('KBP014 — RESULT missing exact head, commands, paths, Draft PR, or residual risk', () => {
  const report = evaluate(
    validMutationInput({
      issue: mutationIssue({
        comments: [{ id: 1, author: 'packet-author', body: 'RESULT — TEST-MUTATION-001\n\nDone.' }],
      }),
    }),
  );
  assert.ok(codesOf(report).includes(CODES.RESULT_INCOMPLETE));
  const missing = report.failures.find((f) => f.code === CODES.RESULT_INCOMPLETE).detail;
  assert.deepEqual(missing, [
    'exact 40-character head SHA',
    'command and observed-output evidence',
    'changed paths',
    'Draft pull request URL',
    'residual risk',
  ]);

  const absent = evaluate(validMutationInput({ issue: mutationIssue({ comments: [] }) }));
  assert.ok(codesOf(absent).includes(CODES.RESULT_INCOMPLETE));

  // A read-only packet is not required to produce a pull request or changed paths.
  assert.deepEqual(
    auditResultComment(`head ${HEAD_SHA} via \`node --test\`; residual risk: none`, [], {
      requirePullRequest: false,
      requireChangedPaths: false,
    }),
    [],
  );
});

test('KBP015 — review verdict not bound to the current PR head', () => {
  const report = evaluate(validMutationInput({ reviews: [exactHeadReview({ commitId: OTHER_SHA })] }));
  assert.ok(codesOf(report).includes(CODES.REVIEW_HEAD_MISMATCH));
});

test('KBP016 — a new PR commit after the latest valid review invalidates it', () => {
  const report = evaluate(
    validMutationInput({
      pullRequest: draftPr({ commits: [{ sha: HEAD_SHA, committedAt: '2026-08-11T06:00:00Z' }] }),
      reviews: [exactHeadReview({ submittedAt: '2026-08-11T05:00:00Z' })],
    }),
  );
  assert.ok(codesOf(report).includes(CODES.REVIEW_STALE_NEW_COMMIT));
  // The head binding itself is still intact, so this is a distinct finding.
  assert.ok(!codesOf(report).includes(CODES.REVIEW_HEAD_MISMATCH));
});

test('KBP017 — the author engagement represented as its own reviewer', () => {
  const report = evaluate(
    validMutationInput({
      reviews: [exactHeadReview({ author: 'packet-author', body: 'Looks good to me.' })],
    }),
  );
  assert.ok(codesOf(report).includes(CODES.AUTHOR_SELF_REVIEW));
});

test('KBP017 — a shared GitHub account requires explicit engagement evidence, never inference', () => {
  const report = evaluate(
    validMutationInput({
      reviews: [exactHeadReview({ author: 'shared-account', body: 'Verdict: NO BLOCKING FINDING.' })],
      pullRequest: draftPr({ author: 'other-account' }),
    }),
  );
  const notice = report.notices.find((n) => n.check === CODES.AUTHOR_SELF_REVIEW);
  assert.ok(notice, 'expected a MANUAL_EVIDENCE_REQUIRED notice');
  assert.equal(notice.code, CODES.MANUAL_EVIDENCE_REQUIRED);
});

test('KBP018 — Owner gate without valid exact-head review evidence', () => {
  const noReview = evaluate(validMutationInput({ reviews: [] }));
  assert.ok(codesOf(noReview).includes(CODES.GATE_WITHOUT_REVIEW_EVIDENCE));

  const staleReview = evaluate(validMutationInput({ reviews: [exactHeadReview({ commitId: OTHER_SHA })] }));
  assert.ok(codesOf(staleReview).includes(CODES.GATE_WITHOUT_REVIEW_EVIDENCE));

  const noDeclaration = evaluate(validMutationInput({ reviews: [exactHeadReview({ body: 'PASS' })] }));
  assert.ok(codesOf(noDeclaration).includes(CODES.GATE_WITHOUT_REVIEW_EVIDENCE));
});

test('KBP019 — a docs-only or infrastructure PR claiming runtime or Production proof', () => {
  const report = evaluate(
    validMutationInput({
      pullRequest: draftPr({
        body: [
          'KBP_PACKET/v1',
          'Linked Issue: #500',
          'Packet ID: TEST-MUTATION-001',
          'Preview: https://example-preview.vercel.app returned HTTP 200 for every route.',
        ].join('\n'),
      }),
    }),
  );
  assert.ok(codesOf(report).includes(CODES.UNSUPPORTED_RUNTIME_CLAIM));
});

test('KBP019 — an explicit negation is not a runtime claim', () => {
  const report = evaluate(
    validMutationInput({
      pullRequest: draftPr({
        body: [
          'KBP_PACKET/v1',
          'Linked Issue: #500',
          'Packet ID: TEST-MUTATION-001',
          'Preview required: no. A docs-only diff produces no browser or Production evidence.',
          'Production untouched by this pull request.',
        ].join('\n'),
      }),
    }),
  );
  assert.ok(!codesOf(report).includes(CODES.UNSUPPORTED_RUNTIME_CLAIM));
});

test('KBP020 — write-capable permission or AI dispatch in a control-plane file', () => {
  const writePermission = evaluate(
    validMutationInput({
      repoRoot: undefined,
      labelManifest: JSON.parse(readFileSync(LABELS_PATH, 'utf8')),
      controlPlaneFiles: {
        '.github/workflows/bad.yml': ['name: bad', 'permissions:', '  issues: write', '  contents: read'].join('\n'),
      },
    }),
  );
  assert.ok(codesOf(writePermission).includes(CODES.AI_DISPATCH_OR_WRITE_PERMISSION));

  const dispatch = evaluate(
    validMutationInput({
      repoRoot: undefined,
      labelManifest: JSON.parse(readFileSync(LABELS_PATH, 'utf8')),
      controlPlaneFiles: {
        '.github/workflows/bad.yml': [
          'name: bad',
          'permissions:',
          '  contents: read',
          'jobs:',
          '  go:',
          '    steps:',
          `      - run: gh issue${' '}comment 1 --body hi`,
        ].join('\n'),
      },
    }),
  );
  assert.ok(codesOf(dispatch).includes(CODES.AI_DISPATCH_OR_WRITE_PERMISSION));

  const missingPermissions = auditControlPlaneFiles({
    files: { '.github/workflows/none.yml': 'name: none\njobs:\n  a:\n    steps: []\n' },
  });
  assert.equal(missingPermissions.violations.length, 1);
  assert.equal(missingPermissions.violations[0].kind, 'permissions');

  assert.deepEqual(auditWorkflowPermissions('permissions:\n  contents: read\n').writeScopes, []);
  assert.equal(auditWorkflowPermissions(`permissions: write${'-all'}\n`).writeScopes.length, 2);
});

// ---------------------------------------------------------------------------
// Replay idempotence and changed-head invalidation
// ---------------------------------------------------------------------------

test('event replay is idempotent', () => {
  const input = validMutationInput();
  const first = evaluate(input);
  const second = evaluate(input);
  const third = evaluate(JSON.parse(JSON.stringify(input)));
  assert.deepEqual(second, first);
  assert.deepEqual(third, first);
  assert.equal(JSON.stringify(second), JSON.stringify(first));
});

test('a changed head invalidates a previously valid review', () => {
  const before = evaluate(validMutationInput());
  assert.deepEqual(before.failures, []);

  const after = evaluate(
    validMutationInput({
      pullRequest: draftPr({
        head: { ref: 'agent/test-mutation-001', sha: OTHER_SHA },
        commits: [
          { sha: HEAD_SHA, committedAt: '2026-08-11T04:00:00Z' },
          { sha: OTHER_SHA, committedAt: '2026-08-11T06:00:00Z' },
        ],
      }),
    }),
  );
  const codes = codesOf(after);
  assert.ok(codes.includes(CODES.REVIEW_HEAD_MISMATCH));
  assert.ok(codes.includes(CODES.REVIEW_STALE_NEW_COMMIT));
  assert.ok(codes.includes(CODES.GATE_WITHOUT_REVIEW_EVIDENCE));
  assert.equal(after.status, 'fail');
});

// ---------------------------------------------------------------------------
// Read-only permission audit of the real workflow
// ---------------------------------------------------------------------------

test('the packet gate workflow declares zero write permissions', () => {
  const source = readFileSync(WORKFLOW_PATH, 'utf8');
  const audit = auditWorkflowPermissions(source);
  assert.equal(audit.hasPermissions, true);
  assert.deepEqual(audit.writeScopes, []);
  assert.equal(audit.blocks.length, 2, 'expected a workflow-level and a job-level permissions block');
  for (const block of audit.blocks) {
    assert.deepEqual(block.scopes, { contents: 'read' });
  }
});

test('the packet gate workflow is structurally correct', () => {
  const workflow = parseSimpleYaml(readFileSync(WORKFLOW_PATH, 'utf8'));
  assert.equal(workflow.name, 'KBP Packet Gate');
  assert.deepEqual(workflow.permissions, { contents: 'read' });

  for (const family of ['issues', 'issue_comment', 'pull_request', 'pull_request_review', 'workflow_dispatch']) {
    assert.ok(family in workflow.on, `missing trigger: ${family}`);
  }
  assert.ok(workflow.concurrency.group.includes('kbp-packet-gate'));

  const job = workflow.jobs['packet-gate'];
  assert.equal(job.name, 'KBP Packet Gate', 'the check name must be exactly "KBP Packet Gate"');
  assert.deepEqual(job.permissions, { contents: 'read' });

  const uses = job.steps.map((s) => s.uses).filter(Boolean);
  assert.equal(uses.length, 1, 'exactly one third-party action is used');
  for (const ref of uses) {
    assert.match(ref, /@[0-9a-f]{40}$/, `action ${ref} must be pinned to a full commit SHA`);
  }

  const runs = job.steps.map((s) => s.run).filter(Boolean);
  assert.equal(runs.length, 1);
  assert.match(runs[0], /^node tools\/control-plane\/packet-gate\.mjs\b/);
});

test('no AI or action-dispatch token appears in the executable workflow and script surfaces', () => {
  const audit = auditControlPlaneFiles({ repoRoot: REPO_ROOT });
  assert.deepEqual(audit.violations, []);
  assert.ok(audit.audited.includes('.github/workflows/kbp-packet-gate.yml'));
  assert.ok(audit.audited.includes('tools/control-plane/packet-gate.mjs'));
  // The controller passes its own scan: no forbidden literal appears in it.
  assert.deepEqual(findDispatchTokens(readFileSync(join(REPO_ROOT, 'tools/control-plane/packet-gate.mjs'), 'utf8')), []);
  // The one exclusion is declared, not silent, and covers only the test file.
  assert.deepEqual(SCANNED_SURFACES.documentedExclusions, ['tools/control-plane/packet-gate.test.mjs']);
  assert.ok(!audit.audited.includes('tools/control-plane/packet-gate.test.mjs'));
});

// ---------------------------------------------------------------------------
// Manifest, form, and template audits
// ---------------------------------------------------------------------------

test('the label manifest is schema-valid and unique', () => {
  const manifest = JSON.parse(readFileSync(LABELS_PATH, 'utf8'));
  assert.equal(manifest.schema, 'kbp.control-plane.labels/v1');

  const names = manifest.labels.map((l) => l.name);
  assert.equal(new Set(names).size, names.length, 'label names must be unique');

  const categoryIds = new Set(manifest.categories.map((c) => c.id));
  for (const label of manifest.labels) {
    assert.ok(categoryIds.has(label.category), `${label.name} has an unknown category`);
    assert.match(label.color, /^[0-9a-f]{6}$/, `${label.name} needs a 6-digit hex colour`);
    assert.ok(label.description.length > 0, `${label.name} needs a description`);
    const category = manifest.categories.find((c) => c.id === label.category);
    assert.ok(label.name.startsWith(category.prefix), `${label.name} does not match its category prefix`);
  }

  const expected = {
    state: ['ready', 'dispatched', 'active', 'result', 'review', 'owner-gate', 'blocked', 'done', 'superseded'],
    worker: ['opus', 'codex', 'none'],
    mode: ['mutation', 'read-only'],
    kind: ['implementation', 'decision', 'review', 'remediation', 'infrastructure', 'research'],
    gate: ['control-plane', 'g0', 'g1', 'g2a', 'g2b', 'g2c', 'g3', 'g4', 'g5', 'g6', 'later'],
    domain: [
      'governance', 'github-control-plane', 'product-definition', 'visual-target', 'asset-readiness',
      'platform-quality', 'engineering-foundation', 'a600-pipeline', 'product-vertical', 'release',
      'reception', 'catalog',
    ],
  };
  for (const [category, suffixes] of Object.entries(expected)) {
    const actual = manifest.labels.filter((l) => l.category === category).map((l) => l.name);
    assert.deepEqual(actual, suffixes.map((s) => `${category}:${s}`), `category ${category} does not match the packet`);
  }
  assert.equal(names.length, 43);

  for (const category of manifest.categories) {
    assert.equal(category.exclusivity, 'exactly-one');
  }
});

test('the project manifest declares the exact fields and options', () => {
  const project = JSON.parse(readFileSync(PROJECT_PATH, 'utf8'));
  assert.equal(project.schema, 'kbp.control-plane.project/v1');
  assert.equal(project.organization, 'WEST-COAST-KBP-ADU');
  assert.equal(project.repository, 'WEST-COAST-KBP-ADU/construction-os');
  assert.equal(project.preferredExistingProjectNumber, 7);
  assert.equal(project.fallbackTitle, 'KBP ADU Product Program');
  assert.deepEqual(project.linkedRepositories, ['WEST-COAST-KBP-ADU/construction-os']);
  assert.deepEqual(project.builtInFieldsRetained, ['Title', 'Assignees']);
  assert.equal(project.authority.derivedView, true);

  const expected = [
    ['Workflow State', 'single-select', ['Ready', 'Dispatched', 'Active', 'Result', 'Review', 'Owner gate', 'Blocked', 'Done', 'Superseded']],
    ['Gate', 'single-select', ['Control plane', 'G0', 'G1', 'G2A', 'G2B', 'G2C', 'G3', 'G4', 'G5', 'G6', 'Later']],
    ['Worker', 'single-select', ['Opus', 'Codex', 'None']],
    ['Mode', 'single-select', ['Mutation', 'Read-only']],
    ['Domain', 'text', undefined],
    ['Base SHA', 'text', undefined],
    ['Head SHA', 'text', undefined],
    ['Evidence URL', 'text', undefined],
    ['Owner Decision', 'single-select', ['Not required', 'Pending', 'Accepted', 'Rejected']],
  ];
  assert.equal(project.fields.length, expected.length);
  expected.forEach(([name, type, options], index) => {
    const field = project.fields[index];
    assert.equal(field.name, name);
    assert.equal(field.type, type);
    if (options) assert.deepEqual(field.options, options);
    assert.equal(field.impliesAcceptance, false, `${name} must not imply acceptance`);
  });
});

test('the Issue Form parses, requires every packet field, and carries no v4 dual-lane model', () => {
  const source = readFileSync(FORM_PATH, 'utf8');
  const form = parseSimpleYaml(source);
  assert.equal(form.name, 'Worker packet');
  assert.deepEqual(form.labels, ['state:ready'], 'the form applies only the static state:ready label');

  const inputs = form.body.filter((element) => element.id);
  const ids = inputs.map((element) => element.id);
  assert.deepEqual(ids.sort(), Object.keys(FIELD_HEADINGS).sort(), 'form ids must match the controller field map exactly');

  for (const element of inputs) {
    if (element.type === 'checkboxes') {
      // GitHub Issue Forms mark checkboxes required per option, not through a
      // validations block. Every confirmation must be individually required.
      assert.ok(element.attributes.options.length > 0, `${element.id} must declare options`);
      for (const option of element.attributes.options) {
        assert.equal(option.required, true, `every ${element.id} option must be required`);
      }
    } else {
      assert.equal(element.validations?.required, true, `${element.id} must be required`);
    }
    assert.equal(element.attributes.label, FIELD_HEADINGS[element.id], `${element.id} label must match the controller heading`);
  }

  const lowered = source.toLowerCase();
  for (const token of ['lane a', 'lane b', 'operational lead', 'dual-lane', 'dual lane']) {
    assert.ok(!lowered.includes(token), `the form must not contain the superseded v4 token "${token}"`);
  }

  const config = parseSimpleYaml(readFileSync(CONFIG_PATH, 'utf8'));
  assert.equal(config.blank_issues_enabled, false);
  assert.deepEqual(config.contact_links, []);
});

test('the YAML audit rejects an ambiguous plain scalar rather than tolerating it', () => {
  // A real YAML parser reads ": " as a mapping separator and " #" as a comment
  // inside a plain scalar. Silently accepting either would let a file pass this
  // audit and then fail on GitHub.
  assert.throws(() => parseSimpleYaml('description: Record it as "depends-on: 1" please\n'), /ambiguous YAML/);
  assert.throws(() => parseSimpleYaml('description: Record it as "a #1" please\n'), /ambiguous YAML/);
  // Quoting resolves it.
  assert.deepEqual(parseSimpleYaml(`description: 'Record it as "depends-on: 1" please'\n`), {
    description: 'Record it as "depends-on: 1" please',
  });
  // Every shipped YAML file in the control plane parses under that strictness.
  for (const path of [WORKFLOW_PATH, FORM_PATH, CONFIG_PATH]) {
    assert.doesNotThrow(() => parseSimpleYaml(readFileSync(path, 'utf8')), `${path} is ambiguous YAML`);
  }
});

test('a body produced from the Issue Form field set round-trips through the parser', () => {
  const { fields } = parseIssueForm(buildBody(VALID_MUTATION_FIELDS));
  for (const key of Object.keys(FIELD_HEADINGS)) {
    assert.equal(fields[key], VALID_MUTATION_FIELDS[key], `field ${key} did not round-trip`);
  }
});

test('the PR template carries every required marker', () => {
  const template = readFileSync(PR_TEMPLATE_PATH, 'utf8');
  const required = [
    'KBP_PACKET/v1',
    'Linked Issue:',
    'Packet ID:',
    'Branch',
    'Base SHA',
    'Head SHA',
    '## Declared allowlist',
    '## Actual changed paths',
    'Domain lease:',
    '## Command and evidence table',
    '## Preview',
    'Named non-author reviewer:',
    'Exact reviewed SHA:',
    'Owner gate state:',
    'Production untouched by this pull request:',
    'Residual risk:',
    'Rollback:',
  ];
  for (const marker of required) {
    assert.ok(template.includes(marker), `PR template is missing the required marker: ${marker}`);
  }
  assert.ok(
    template.includes('- [ ] I did not review, approve, accept, or certify my own work in this pull request.'),
    'PR template must carry the self-review checkbox',
  );
  // The template itself must not read as a runtime claim on a docs-only diff.
  const report = evaluate({
    event: { name: 'pull_request' },
    repoRoot: REPO_ROOT,
    issue: mutationIssue(),
    pullRequest: draftPr({ body: template }),
    reviews: [exactHeadReview()],
    board: board([]),
  });
  assert.ok(!codesOf(report).includes(CODES.UNSUPPORTED_RUNTIME_CLAIM));
});

// ---------------------------------------------------------------------------
// Live event normalization and CLI
// ---------------------------------------------------------------------------

test('a live event payload normalizes without inventing unavailable facts', () => {
  const input = normalizeEvent('pull_request', {
    action: 'synchronize',
    pull_request: {
      number: 700,
      draft: true,
      user: { login: 'someone' },
      body: 'KBP_PACKET/v1',
      base: { ref: 'main', sha: BASE_SHA },
      head: { ref: 'agent/x', sha: HEAD_SHA },
    },
  });
  assert.equal(input.pullRequest.changedFiles, null, 'the payload carries no file list, so none is invented');
  assert.equal(input.pullRequest.commits, null);

  const withComment = normalizeEvent('issue_comment', {
    action: 'created',
    issue: { number: 1, title: 't', body: '', labels: [{ name: 'state:active' }], user: { login: 'a' } },
    comment: { id: 9, user: { login: 'a' }, body: 'hello' },
  });
  assert.equal(withComment.issue.commentsComplete, false);
  assert.deepEqual(withComment.issue.labels, ['state:active']);

  const report = evaluate({ ...withComment, repoRoot: REPO_ROOT });
  const notices = report.notices.map((n) => n.check);
  assert.ok(notices.includes(CODES.ACTIVE_WITHOUT_STARTED), 'incomplete comment history must be reported, not assumed');
  assert.ok(report.notices.every((n) => n.code === CODES.MANUAL_EVIDENCE_REQUIRED));
});

test('the CLI emits machine-readable JSON on stdout and exits non-zero on a violation', () => {
  const fixturePath = join(tmpdir(), `kbp-packet-gate-fixture-${process.pid}.json`);
  const script = join(REPO_ROOT, 'tools/control-plane/packet-gate.mjs');
  try {
    const failing = validMutationInput({
      issue: mutationIssue({ fields: { ...VALID_MUTATION_FIELDS, base_sha: 'main' } }),
    });
    writeFileSync(fixturePath, JSON.stringify(failing));
    let status = 0;
    let stdout = '';
    try {
      stdout = execFileSync(process.execPath, [script, '--fixture', fixturePath], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (error) {
      status = error.status;
      stdout = error.stdout;
    }
    assert.equal(status, 1, 'a fail-closed violation must exit non-zero');
    const report = JSON.parse(stdout);
    assert.equal(report.gate, 'KBP Packet Gate');
    assert.ok(report.failures.map((f) => f.code).includes(CODES.BASE_SHA_NOT_EXACT));

    writeFileSync(fixturePath, JSON.stringify(validMutationInput()));
    const passing = execFileSync(process.execPath, [script, '--fixture', fixturePath], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    const ok = JSON.parse(passing);
    assert.deepEqual(ok.failures, []);
    assert.equal(ok.status, 'consistent');
  } finally {
    if (existsSync(fixturePath)) rmSync(fixturePath);
  }
});

test('the human summary names the codes without replacing the JSON', () => {
  const report = evaluate(validMutationInput({ reviews: [] }));
  const summary = summarize(report);
  assert.match(summary, /KBP Packet Gate/);
  assert.match(summary, new RegExp(CODES.GATE_WITHOUT_REVIEW_EVIDENCE));
  assert.match(summary, /not Owner acceptance/);
});

test('every declared code is distinct and stable', () => {
  const values = Object.values(CODES);
  assert.equal(new Set(values).size, values.length);
  assert.equal(values.filter((v) => /^KBP0\d\d_/.test(v)).length, 20, 'exactly twenty numbered fail-closed codes');
  assert.ok(values.includes('MANUAL_EVIDENCE_REQUIRED'));
});
