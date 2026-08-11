/**
 * Focused tests for the KBP Packet Gate controller.
 *
 * Canonical invocation:
 *
 *   node --test tools/control-plane/packet-gate.test.mjs
 *
 * Every case is declared once in `CASES` and registered with Node's built-in
 * `node:test` runner. The repository's aggregate `npm test` script runs Vitest,
 * whose default include pattern also collects `*.test.mjs`; when this file is
 * loaded by that runner the same cases are registered through it instead, using
 * the Vitest devDependency the repository already has. No new dependency is
 * introduced, no repository artifact is generated, and the assertions are
 * identical on both paths. See governance/control-plane/README.md.
 *
 * Fixtures are built in this process. Nothing is written to disk.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import {
  CODES,
  MANUAL_EVIDENCE_REQUIRED,
  REQUIRED_FIELDS,
  collectControlPlaneFiles,
  collectPermissions,
  evaluate,
  extractBaseSha,
  formatHuman,
  leasePrefixes,
  normalizeGitHubEvent,
  parseAllowlist,
  parseIssueBody,
  parseWorkflowStructure,
  scanExecutableSurface,
} from "./packet-gate.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (rel) => readFileSync(path.join(REPO_ROOT, rel), "utf8");

const BASE = "c201836eee31ff55472cb4731e11745e3094849d";
const HEAD = "1111111111111111111111111111111111111111";
const OLD_HEAD = "2222222222222222222222222222222222222222";

const LABEL_MANIFEST = JSON.parse(read("governance/control-plane/labels-v1.json"));
const PROJECT_MANIFEST = JSON.parse(read("governance/control-plane/project-v1.json"));

/* --------------------------------------------------------------------- *
 * Fixture builders
 * --------------------------------------------------------------------- */

const MUTATION_FIELDS = {
  "Packet ID": "EXAMPLE-PACKET-001",
  "Single outcome": "Add one validated control-plane manifest and nothing else.",
  Repository: "WEST-COAST-KBP-ADU/construction-os",
  "Exact base SHA": `main@${BASE}`,
  Worker: "Opus",
  "Exact model ID": "claude-opus-5",
  Mode: "Mutation",
  Kind: "Infrastructure",
  Gate: "Control plane",
  "Primary domain": "github-control-plane",
  "Clone path": "/work/example-packet-001",
  "Session label": "example-packet-001-opus",
  "Branch or read-only target": "agent/example-packet-001",
  "Authoritative read order":
    "1. governance/BOUNDARIES.md\n2. governance/office/OPERATING-MODEL-v5.md",
  "Exact file allowlist": "create tools/control-plane/example.mjs",
  "Domain lease": "tools/control-plane/example.mjs",
  Prohibitions: "No product code, no dependency change, no deployment.",
  "Quality target": "node --test exits 0 with 0 failing assertions.",
  "Deterministic gates": "npm test -> exit 0\nnpm run lint -> exit 0",
  "Independent reviewer": "one fresh non-author Codex Pro engagement",
  "Integration order and dependencies": "No predecessor. No dependent packet.",
  "Stop conditions": "BLOCKED — BASE DRIFT\nBLOCKED — GATE FAILURE",
  "RESULT and cleanup contract":
    "Publish RESULT with the exact head, changed paths, gate output, Draft PR, and residual risk. Release the lease at CLEANUP.",
};

const READ_ONLY_FIELDS = {
  ...MUTATION_FIELDS,
  "Packet ID": "EXAMPLE-REVIEW-001",
  "Single outcome": "Certify one exact head as blocking or non-blocking.",
  Worker: "Codex",
  "Exact model ID": "codex-pro",
  Mode: "Read-only",
  Kind: "Review",
  "Primary domain": "governance",
  "Clone path": "/work/example-review-001",
  "Session label": "example-review-001-codex",
  "Branch or read-only target": `pull request #2 at ${HEAD}`,
  "Exact file allowlist": "none",
  "Domain lease": "none; this packet authors no repository byte",
  "Independent reviewer": "not applicable; this packet is itself the review",
};

function renderBody(fields, omit = []) {
  return Object.entries(fields)
    .filter(([key]) => !omit.includes(key))
    .map(([key, value]) => `### ${key}\n\n${value}\n`)
    .join("\n");
}

const MUTATION_LABELS = [
  "state:review",
  "worker:opus",
  "mode:mutation",
  "kind:infrastructure",
  "gate:control-plane",
  "domain:github-control-plane",
];

const RESULT_COMMENT = [
  "RESULT — EXAMPLE-PACKET-001",
  `exact head: ${HEAD}`,
  "commands: npm test, npm run lint",
  "changed paths: tools/control-plane/example.mjs",
  "Draft PR: https://github.com/WEST-COAST-KBP-ADU/construction-os/pull/2",
  "residual risk: none observed beyond the declared lease",
].join("\n");

const PR_BODY = [
  "KBP_PACKET/v1",
  "",
  "## Packet binding",
  "",
  "- Linked Issue: #1",
  "- Packet ID: EXAMPLE-PACKET-001",
  "- Branch: agent/example-packet-001",
  `- Base SHA (full 40-hex): ${BASE}`,
  `- Head SHA (full 40-hex): ${HEAD}`,
  "- Domain lease: tools/control-plane/example.mjs",
  "",
  "## Preview",
  "",
  "- Preview required for this diff: no",
  "- Reason: infrastructure diff only; it produces no browser or deployment proof.",
].join("\n");

const REVIEW_BODY = [
  "REVIEW_VERDICT — EXAMPLE-PACKET-001",
  "session: example-review-001-codex, model codex-pro, non-author engagement",
  `reviewed head: ${HEAD}`,
  "verdict: NO BLOCKING FINDING",
].join("\n");

function mutationContext(overrides = {}) {
  const context = {
    eventName: "pull_request",
    action: "synchronize",
    labelManifest: LABEL_MANIFEST,
    issue: {
      number: 1,
      state: "open",
      author: "owner",
      labels: [...MUTATION_LABELS],
      body: renderBody(MUTATION_FIELDS),
      comments: [{ author: "worker-engagement", body: RESULT_COMMENT }],
    },
    activeIssues: [
      {
        number: 1,
        labels: [...MUTATION_LABELS],
        domainLease: ["tools/control-plane/example.mjs"],
      },
    ],
    linkedBranches: ["agent/example-packet-001"],
    linkedPullRequests: [{ number: 2, draft: true }],
    pullRequest: {
      number: 2,
      draft: true,
      author: "worker-engagement",
      body: PR_BODY,
      base: { ref: "main", sha: BASE },
      head: { ref: "agent/example-packet-001", sha: HEAD },
      changedPaths: ["tools/control-plane/example.mjs"],
      reviews: [
        {
          author: "reviewer-engagement",
          state: "COMMENTED",
          commitId: HEAD,
          body: REVIEW_BODY,
        },
      ],
    },
  };
  return { ...structuredClone(context), ...overrides };
}

function readOnlyContext(overrides = {}) {
  const startedComment = [
    "STARTED — EXAMPLE-REVIEW-001",
    "session: example-review-001-codex",
    "clone: /work/example-review-001",
    "branch: read-only; no branch is created",
    `exact base: ${BASE}`,
  ].join("\n");

  const labels = [
    "state:active",
    "worker:codex",
    "mode:read-only",
    "kind:review",
    "gate:g0",
    "domain:governance",
  ];

  const context = {
    eventName: "issues",
    action: "labeled",
    labelManifest: LABEL_MANIFEST,
    issue: {
      number: 3,
      state: "open",
      author: "owner",
      labels,
      body: renderBody(READ_ONLY_FIELDS),
      comments: [{ author: "reviewer-engagement", body: startedComment }],
    },
    activeIssues: [{ number: 3, labels, domainLease: [] }],
  };
  return { ...structuredClone(context), ...overrides };
}

/** Mutate a deep copy so each case starts from a known-good fixture. */
function withIssueField(context, field, value) {
  const next = structuredClone(context);
  const fields = { ...MUTATION_FIELDS, [field]: value };
  next.issue.body = renderBody(fields);
  return next;
}

const codesOf = (report) => report.failures.map((f) => f.code);
const hasCode = (report, code) =>
  assert.ok(
    codesOf(report).includes(code),
    `expected ${code}; got ${JSON.stringify(codesOf(report))}`,
  );

/* --------------------------------------------------------------------- *
 * Cases
 * --------------------------------------------------------------------- */

const CASES = [];
const testCase = (name, fn) => CASES.push({ name, fn });

/* -- valid sequences ---------------------------------------------------- */

testCase("a valid read-only review packet passes", () => {
  const report = evaluate(readOnlyContext());
  assert.equal(report.status, "PASS", JSON.stringify(report.failures, null, 2));
  assert.deepEqual(report.failures, []);
});

testCase("a valid mutation Issue -> Draft PR -> exact-head review -> Owner gate passes", () => {
  const dispatched = mutationContext({ eventName: "issues", action: "labeled" });
  dispatched.issue.labels = [
    "state:dispatched",
    ...MUTATION_LABELS.filter((l) => !l.startsWith("state:")),
  ];
  dispatched.activeIssues[0].labels = dispatched.issue.labels;
  delete dispatched.pullRequest;
  delete dispatched.linkedPullRequests;
  delete dispatched.linkedBranches;
  assert.equal(evaluate(dispatched).status, "PASS");

  const result = mutationContext();
  result.issue.labels[0] = "state:result";
  result.activeIssues[0].labels = result.issue.labels;
  assert.equal(evaluate(result).status, "PASS", JSON.stringify(evaluate(result).failures));

  const review = mutationContext({ eventName: "pull_request_review", action: "submitted" });
  assert.equal(evaluate(review).status, "PASS", JSON.stringify(evaluate(review).failures));

  const gate = mutationContext();
  gate.issue.labels[0] = "state:owner-gate";
  gate.activeIssues[0].labels = gate.issue.labels;
  const gateReport = evaluate(gate);
  assert.equal(gateReport.status, "PASS", JSON.stringify(gateReport.failures, null, 2));
  assert.ok(gateReport.checked.includes("owner-gate-evidence"));
});

/* -- the twenty fail-closed conditions ---------------------------------- */

testCase("1 missing required Issue field fails closed", () => {
  const context = mutationContext();
  context.issue.body = renderBody(MUTATION_FIELDS, ["Quality target"]);
  hasCode(evaluate(context), CODES.MISSING_REQUIRED_FIELD);
});

testCase("2 a moving or malformed base instead of full 40-hex fails closed", () => {
  for (const value of ["main", "HEAD", "c201836", `${BASE}0`, "latest"]) {
    const report = evaluate(withIssueField(mutationContext(), "Exact base SHA", value));
    hasCode(report, CODES.BASE_NOT_EXACT_SHA);
  }
  assert.equal(extractBaseSha(`main@${BASE}`), BASE);
  assert.equal(extractBaseSha("main"), null);
});

testCase("3 wildcard, directory-only, or ambiguous allowlist fails closed", () => {
  for (const value of [
    "create tools/control-plane/**",
    "create tools/control-plane/",
    "modify governance/*.md",
    "create tools/control-plane",
    "tools/control-plane/example.mjs",
    "create tools/control-plane/example.mjs and related files",
    "create ../outside/example.mjs",
  ]) {
    const report = evaluate(withIssueField(mutationContext(), "Exact file allowlist", value));
    hasCode(report, CODES.ALLOWLIST_NOT_EXACT);
  }
  assert.deepEqual(parseAllowlist("create a/b.mjs\ndelete a/c.md").entries, [
    { op: "create", path: "a/b.mjs" },
    { op: "delete", path: "a/c.md" },
  ]);
});

testCase("4 forbidden open delegation fails closed", () => {
  for (const phrase of [
    "relevant docs",
    "make it premium",
    "best asset",
    "smallest suitable module",
  ]) {
    const report = evaluate(
      withIssueField(mutationContext(), "Single outcome", `Read the ${phrase} and proceed.`),
    );
    hasCode(report, CODES.OPEN_DELEGATION);
  }
});

testCase("4b a prohibited phrase quoted as code is a reference, not a delegation", () => {
  const context = withIssueField(
    mutationContext(),
    "Prohibitions",
    "Open delegation such as `relevant docs` or `make it premium` is prohibited.",
  );
  assert.ok(!codesOf(evaluate(context)).includes(CODES.OPEN_DELEGATION));
});

testCase("5 zero or multiple labels in an exclusive category fails closed", () => {
  const multiple = mutationContext();
  multiple.issue.labels.push("state:blocked");
  hasCode(evaluate(multiple), CODES.LABEL_EXCLUSIVITY);

  const missing = mutationContext();
  missing.issue.labels = missing.issue.labels.filter((l) => !l.startsWith("worker:"));
  hasCode(evaluate(missing), CODES.LABEL_EXCLUSIVITY);

  const undeclared = mutationContext();
  undeclared.issue.labels[0] = "state:almost-done";
  hasCode(evaluate(undeclared), CODES.LABEL_EXCLUSIVITY);
});

testCase("6 state:active without persisted STARTED evidence fails closed", () => {
  const context = readOnlyContext();
  context.issue.comments = [];
  hasCode(evaluate(context), CODES.ACTIVE_WITHOUT_STARTED);

  const thin = readOnlyContext();
  thin.issue.comments = [{ author: "x", body: "STARTED — EXAMPLE-REVIEW-001\nno evidence" }];
  hasCode(evaluate(thin), CODES.ACTIVE_WITHOUT_STARTED);
});

testCase("7 more than two active mutation packets fails closed", () => {
  const context = mutationContext();
  context.activeIssues = [10, 11, 12].map((number) => ({
    number,
    labels: ["state:active", "mode:mutation", `domain:d${number}`],
    domainLease: [`src/area-${number}`],
  }));
  hasCode(evaluate(context), CODES.WIP_LIMIT);
});

testCase("8 overlapping active mutation domain or file lease fails closed", () => {
  const nested = mutationContext();
  nested.activeIssues = [
    { number: 10, labels: ["state:active", "mode:mutation", "domain:a"], domainLease: ["src/lib"] },
    {
      number: 11,
      labels: ["state:active", "mode:mutation", "domain:b"],
      domainLease: ["src/lib/deep/file.ts"],
    },
  ];
  hasCode(evaluate(nested), CODES.DOMAIN_LEASE_OVERLAP);

  const sameLabel = mutationContext();
  sameLabel.activeIssues = [
    { number: 10, labels: ["state:active", "mode:mutation", "domain:a"], domainLease: ["x/one.ts"] },
    { number: 11, labels: ["state:active", "mode:mutation", "domain:a"], domainLease: ["y/two.ts"] },
  ];
  hasCode(evaluate(sameLabel), CODES.DOMAIN_LEASE_OVERLAP);

  assert.deepEqual(leasePrefixes("`.github/**`, tools/control-plane/"), [
    ".github",
    "tools/control-plane",
  ]);
});

testCase("9 a dependent packet on an unmerged predecessor fails closed", () => {
  const context = withIssueField(
    mutationContext(),
    "Integration order and dependencies",
    "Depends on predecessor #7.",
  );
  context.issueIndex = { 7: { state: "open", merged: false } };
  hasCode(evaluate(context), CODES.UNMERGED_PREDECESSOR);

  const merged = withIssueField(
    mutationContext(),
    "Integration order and dependencies",
    "Depends on predecessor #7.",
  );
  merged.issueIndex = { 7: { state: "closed", merged: true } };
  assert.ok(!codesOf(evaluate(merged)).includes(CODES.UNMERGED_PREDECESSOR));
});

testCase("10 a mutation packet without exactly one branch and one Draft PR fails closed", () => {
  const none = mutationContext();
  none.linkedPullRequests = [];
  hasCode(evaluate(none), CODES.MISSING_BRANCH_OR_DRAFT_PR);

  const two = mutationContext();
  two.linkedBranches = ["agent/example-packet-001", "agent/example-packet-001-retry"];
  hasCode(evaluate(two), CODES.MISSING_BRANCH_OR_DRAFT_PR);
});

testCase("11 PR branch, base, Issue, or packet mismatch fails closed", () => {
  const branch = mutationContext();
  branch.pullRequest.head.ref = "agent/some-other-branch";
  hasCode(evaluate(branch), CODES.PR_BINDING_MISMATCH);

  const issueLink = mutationContext();
  issueLink.pullRequest.body = PR_BODY.replace("Linked Issue: #1", "Linked Issue: #999");
  hasCode(evaluate(issueLink), CODES.PR_BINDING_MISMATCH);

  const packetId = mutationContext();
  packetId.pullRequest.body = PR_BODY.replace(
    "Packet ID: EXAMPLE-PACKET-001",
    "Packet ID: OTHER-PACKET-002",
  );
  hasCode(evaluate(packetId), CODES.PR_BINDING_MISMATCH);

  const base = mutationContext();
  base.pullRequest.body = PR_BODY.replace(BASE, OLD_HEAD);
  hasCode(evaluate(base), CODES.PR_BINDING_MISMATCH);

  const marker = mutationContext();
  marker.pullRequest.body = PR_BODY.replace("KBP_PACKET/v1", "some other header");
  hasCode(evaluate(marker), CODES.PR_BINDING_MISMATCH);
});

testCase("12 a changed path outside the exact Issue allowlist fails closed", () => {
  const context = mutationContext();
  context.pullRequest.changedPaths = [
    "tools/control-plane/example.mjs",
    "package.json",
  ];
  const report = evaluate(context);
  hasCode(report, CODES.PATH_OUTSIDE_ALLOWLIST);
  assert.ok(
    report.failures.some((f) => f.evidence.outside?.includes("package.json")),
    "the offending path is named in the evidence",
  );
});

testCase("13 a non-Draft PR before state:owner-gate fails closed", () => {
  const context = mutationContext();
  context.pullRequest.draft = false;
  context.linkedPullRequests = [{ number: 2, draft: false }];
  hasCode(evaluate(context), CODES.NON_DRAFT_BEFORE_OWNER_GATE);

  const atGate = mutationContext();
  atGate.issue.labels[0] = "state:owner-gate";
  atGate.activeIssues[0].labels = atGate.issue.labels;
  atGate.pullRequest.draft = false;
  atGate.linkedPullRequests = [{ number: 2, draft: false }];
  assert.ok(!codesOf(evaluate(atGate)).includes(CODES.NON_DRAFT_BEFORE_OWNER_GATE));
});

testCase("14 RESULT without exact head, commands, paths, Draft PR, or residual risk fails closed", () => {
  const missingRisk = mutationContext();
  missingRisk.issue.labels[0] = "state:result";
  missingRisk.issue.comments = [
    { author: "worker-engagement", body: RESULT_COMMENT.replace(/residual risk.*/i, "") },
  ];
  hasCode(evaluate(missingRisk), CODES.RESULT_INCOMPLETE);

  const missingHead = mutationContext();
  missingHead.issue.labels[0] = "state:result";
  missingHead.issue.comments = [
    { author: "worker-engagement", body: RESULT_COMMENT.replace(HEAD, "the latest commit") },
  ];
  hasCode(evaluate(missingHead), CODES.RESULT_INCOMPLETE);

  const absent = mutationContext();
  absent.issue.labels[0] = "state:result";
  absent.issue.comments = [];
  hasCode(evaluate(absent), CODES.RESULT_INCOMPLETE);
});

testCase("15 a review verdict not bound to the current PR head fails closed", () => {
  const unpinned = mutationContext();
  unpinned.pullRequest.reviews[0].body = "REVIEW_VERDICT — verdict: NO BLOCKING FINDING";
  hasCode(evaluate(unpinned), CODES.REVIEW_NOT_AT_HEAD);

  const wrongSha = mutationContext();
  wrongSha.pullRequest.reviews[0].body = REVIEW_BODY.replace(HEAD, OLD_HEAD);
  hasCode(evaluate(wrongSha), CODES.REVIEW_NOT_AT_HEAD);
});

testCase("16 a new PR commit after the latest valid review fails closed", () => {
  const context = mutationContext();
  context.pullRequest.reviews[0].commitId = OLD_HEAD;
  context.pullRequest.reviews[0].body = REVIEW_BODY.replace(HEAD, OLD_HEAD);
  const report = evaluate(context);
  hasCode(report, CODES.COMMIT_AFTER_REVIEW);
  hasCode(report, CODES.REVIEW_NOT_AT_HEAD);
});

testCase("17 an author engagement represented as its own reviewer fails closed", () => {
  const sameAccount = mutationContext();
  sameAccount.pullRequest.reviews[0].author = "worker-engagement";
  hasCode(evaluate(sameAccount), CODES.AUTHOR_IS_REVIEWER);

  const sameSession = withIssueField(
    mutationContext(),
    "Independent reviewer",
    MUTATION_FIELDS["Session label"],
  );
  hasCode(evaluate(sameSession), CODES.AUTHOR_IS_REVIEWER);
});

testCase("18 an Owner-gate transition without exact-head review evidence fails closed", () => {
  const noReview = mutationContext();
  noReview.issue.labels[0] = "state:owner-gate";
  noReview.activeIssues[0].labels = noReview.issue.labels;
  noReview.pullRequest.reviews = [];
  hasCode(evaluate(noReview), CODES.GATE_WITHOUT_REVIEW_EVIDENCE);

  const staleReview = mutationContext();
  staleReview.issue.labels[0] = "state:owner-gate";
  staleReview.activeIssues[0].labels = staleReview.issue.labels;
  staleReview.pullRequest.reviews[0].commitId = OLD_HEAD;
  hasCode(evaluate(staleReview), CODES.GATE_WITHOUT_REVIEW_EVIDENCE);

  const merge = mutationContext();
  merge.merge = { requested: true };
  merge.pullRequest.reviews = [];
  hasCode(evaluate(merge), CODES.GATE_WITHOUT_REVIEW_EVIDENCE);
});

testCase("19 a docs-only or infrastructure PR claiming runtime proof fails closed", () => {
  for (const claim of [
    "Verified in the browser at 1440 wide.",
    "Screenshots attached for each breakpoint.",
    "Production verified on the canonical domain.",
    "Every route returned HTTP 200.",
  ]) {
    const context = mutationContext();
    context.pullRequest.body = `${PR_BODY}\n\n${claim}`;
    hasCode(evaluate(context), CODES.UNSUPPORTED_RUNTIME_CLAIM);
  }

  const quoted = mutationContext();
  quoted.pullRequest.body = `${PR_BODY}\n\n<!-- A docs-only diff yields no browser evidence. -->`;
  assert.ok(!codesOf(evaluate(quoted)).includes(CODES.UNSUPPORTED_RUNTIME_CLAIM));
});

testCase("20 a write-capable permission or AI dispatch in control-plane files fails closed", () => {
  const writeScope = mutationContext();
  writeScope.controlPlaneFiles = [
    {
      path: ".github/workflows/bad.yml",
      content:
        "name: bad\non:\n  issues:\n    types: [opened]\npermissions:\n  contents: write\njobs:\n  x:\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo hi\n",
    },
  ];
  hasCode(evaluate(writeScope), CODES.AI_DISPATCH_OR_WRITE_PERMISSION);

  const noPermissions = mutationContext();
  noPermissions.controlPlaneFiles = [
    {
      path: ".github/workflows/bare.yml",
      content:
        "name: bare\non:\n  issues:\n    types: [opened]\njobs:\n  x:\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo hi\n",
    },
  ];
  hasCode(evaluate(noPermissions), CODES.AI_DISPATCH_OR_WRITE_PERMISSION);

  const unpinned = mutationContext();
  unpinned.controlPlaneFiles = [
    {
      path: ".github/workflows/unpinned.yml",
      content:
        "name: unpinned\non:\n  issues:\n    types: [opened]\npermissions:\n  contents: read\njobs:\n  x:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n",
    },
  ];
  hasCode(evaluate(unpinned), CODES.AI_DISPATCH_OR_WRITE_PERMISSION);

  // Assembled from fragments so this file still passes its own token scan.
  const dispatchToken = ["repository_", "dispatch"].join("");
  const modelHost = ["api.", "anthro", "pic.com"].join("");
  const dispatching = mutationContext();
  dispatching.controlPlaneFiles = [
    {
      path: "tools/control-plane/rogue.mjs",
      content: `const trigger = "${dispatchToken}";\nconst host = "${modelHost}";\n`,
    },
  ];
  const report = evaluate(dispatching);
  hasCode(report, CODES.AI_DISPATCH_OR_WRITE_PERMISSION);
  assert.equal(
    report.failures.filter((f) => f.code === CODES.AI_DISPATCH_OR_WRITE_PERMISSION).length,
    2,
  );
});

/* -- replay, invalidation, and identity limits -------------------------- */

testCase("event replay is idempotent", () => {
  const context = mutationContext();
  const first = evaluate(context);
  const second = evaluate(structuredClone(context));
  const third = evaluate(mutationContext());
  assert.deepEqual(first, second);
  assert.deepEqual(first, third);
  assert.deepEqual(evaluate(context), first, "evaluating twice does not mutate the context");
});

testCase("a changed head invalidates an otherwise valid review", () => {
  const valid = mutationContext();
  assert.equal(evaluate(valid).status, "PASS");

  const moved = structuredClone(valid);
  moved.pullRequest.head.sha = "3333333333333333333333333333333333333333";
  moved.pullRequest.body = PR_BODY.replace(HEAD, "3333333333333333333333333333333333333333");
  const report = evaluate(moved);
  assert.equal(report.status, "FAIL");
  hasCode(report, CODES.COMMIT_AFTER_REVIEW);
  hasCode(report, CODES.REVIEW_NOT_AT_HEAD);
});

testCase("engagement identity that GitHub cannot prove is reported, not assumed", () => {
  const context = mutationContext();
  context.pullRequest.reviews[0].body = REVIEW_BODY.replace(/^session:.*$/m, "");
  const report = evaluate(context);
  assert.ok(
    report.manualEvidenceRequired.some(
      (m) => m.code === MANUAL_EVIDENCE_REQUIRED && /engagement identity/i.test(m.fact),
    ),
    JSON.stringify(report.manualEvidenceRequired),
  );
  assert.ok(!codesOf(report).includes(CODES.AUTHOR_IS_REVIEWER));
});

testCase("a live webhook payload with no comment list reports MANUAL_EVIDENCE_REQUIRED", () => {
  const context = normalizeGitHubEvent("issues", {
    action: "labeled",
    issue: {
      number: 1,
      state: "open",
      body: renderBody({ ...MUTATION_FIELDS, Mode: "Read-only", "Exact file allowlist": "none" }),
      user: { login: "owner" },
      labels: [
        { name: "state:active" },
        { name: "worker:opus" },
        { name: "mode:read-only" },
        { name: "kind:review" },
        { name: "gate:g0" },
        { name: "domain:governance" },
      ],
    },
  });
  context.labelManifest = LABEL_MANIFEST;
  const report = evaluate(context);
  assert.ok(
    report.manualEvidenceRequired.some((m) => /STARTED evidence/.test(m.fact)),
    JSON.stringify(report.manualEvidenceRequired),
  );
  assert.ok(!codesOf(report).includes(CODES.ACTIVE_WITHOUT_STARTED));
});

testCase("every supported event family evaluates without throwing", () => {
  for (const eventName of [
    "issues",
    "issue_comment",
    "pull_request",
    "pull_request_review",
    "workflow_dispatch",
  ]) {
    const report = evaluate({ ...mutationContext(), eventName });
    assert.equal(typeof report.status, "string");
    assert.equal(typeof formatHuman(report), "string");
  }
  const unknown = evaluate({ eventName: "push" });
  assert.ok(unknown.manualEvidenceRequired.some((m) => /event family/.test(m.fact)));
});

/* -- audits of the shipped control-plane surfaces ----------------------- */

testCase("the shipped workflow declares read-only permissions and no write scope", () => {
  const workflow = parseWorkflowStructure(read(".github/workflows/kbp-packet-gate.yml"));
  assert.equal(workflow.name, "KBP Packet Gate");
  assert.equal(workflow.jobs["packet-gate"].name, "KBP Packet Gate");

  const { permissions, hasTopLevel } = collectPermissions(workflow);
  assert.equal(hasTopLevel, true);
  assert.ok(permissions.length >= 2);
  for (const entry of permissions) assert.equal(entry.value, "read");
  assert.ok(!/write/.test(JSON.stringify(permissions)));

  const triggers = Object.keys(workflow.on);
  assert.deepEqual(triggers.sort(), [
    "issue_comment",
    "issues",
    "pull_request",
    "pull_request_review",
    "workflow_dispatch",
  ]);
  assert.ok(workflow.concurrency.group.includes("issue.number"));
  assert.ok(workflow.concurrency.group.includes("pull_request.number"));

  const steps = workflow.jobs["packet-gate"].steps;
  for (const step of steps) {
    if (step.uses) assert.match(step.uses.split("@")[1], /^[0-9a-f]{40}$/);
  }
  const runSteps = steps.filter((s) => s.run);
  assert.equal(runSteps.length, 1);
  assert.match(runSteps[0].run, /^node tools\/control-plane\/packet-gate\.mjs\b/);
});

testCase("no AI or action-dispatch token appears in any executable control-plane surface", () => {
  const files = collectControlPlaneFiles(REPO_ROOT);
  assert.ok(files.length >= 3, `expected the workflow and both scripts; got ${files.length}`);
  assert.ok(files.some((f) => f.path === ".github/workflows/kbp-packet-gate.yml"));
  assert.ok(files.some((f) => f.path === "tools/control-plane/packet-gate.mjs"));
  assert.ok(files.some((f) => f.path === "tools/control-plane/packet-gate.test.mjs"));

  const hits = files.flatMap((f) => scanExecutableSurface(f.path, f.content));
  assert.deepEqual(hits, [], `forbidden tokens: ${JSON.stringify(hits, null, 2)}`);

  const shipped = evaluate({
    eventName: "workflow_dispatch",
    controlPlaneFiles: files,
    labelManifest: LABEL_MANIFEST,
  });
  assert.equal(shipped.status, "PASS", JSON.stringify(shipped.failures, null, 2));
});

testCase("the label manifest is unique, complete, and well formed", () => {
  const expected = {
    state: 9,
    worker: 3,
    mode: 2,
    kind: 6,
    gate: 11,
    domain: 12,
  };
  const names = LABEL_MANIFEST.labels.map((l) => l.name);
  assert.equal(new Set(names).size, names.length, "label names are unique");
  assert.equal(names.length, 43);

  const counts = {};
  for (const label of LABEL_MANIFEST.labels) {
    assert.match(label.color, /^[0-9a-f]{6}$/, `${label.name} colour`);
    assert.ok(label.description.length > 0, `${label.name} description`);
    assert.ok(label.name.startsWith(`${label.category}:`), `${label.name} category prefix`);
    counts[label.category] = (counts[label.category] ?? 0) + 1;
  }
  assert.deepEqual(counts, expected);

  const declared = LABEL_MANIFEST.categories.map((c) => c.id).sort();
  assert.deepEqual(declared, Object.keys(expected).sort());
  for (const category of LABEL_MANIFEST.categories) {
    assert.equal(category.exclusivity, "exactly-one");
    assert.equal(category.prefix, `${category.id}:`);
  }
  assert.equal(LABEL_MANIFEST.authority.deletion, "never");
  assert.equal(LABEL_MANIFEST.authority.unmanagedLabels, "leave-untouched");
});

testCase("the project manifest declares the exact fields and options", () => {
  assert.equal(PROJECT_MANIFEST.organization, "WEST-COAST-KBP-ADU");
  assert.equal(PROJECT_MANIFEST.repository, "WEST-COAST-KBP-ADU/construction-os");
  assert.equal(PROJECT_MANIFEST.target.preferredExistingProjectNumber, 7);
  assert.equal(PROJECT_MANIFEST.target.fallbackTitle, "KBP ADU Product Program");
  assert.deepEqual(PROJECT_MANIFEST.builtInFields.retained, ["Title", "Assignees"]);

  const byName = Object.fromEntries(PROJECT_MANIFEST.fields.map((f) => [f.name, f]));
  assert.deepEqual(Object.keys(byName), [
    "Workflow State",
    "Gate",
    "Worker",
    "Mode",
    "Domain",
    "Base SHA",
    "Head SHA",
    "Evidence URL",
    "Owner Decision",
  ]);
  assert.deepEqual(byName["Workflow State"].options, [
    "Ready",
    "Dispatched",
    "Active",
    "Result",
    "Review",
    "Owner gate",
    "Blocked",
    "Done",
    "Superseded",
  ]);
  assert.deepEqual(byName.Gate.options, [
    "Control plane",
    "G0",
    "G1",
    "G2A",
    "G2B",
    "G2C",
    "G3",
    "G4",
    "G5",
    "G6",
    "Later",
  ]);
  assert.deepEqual(byName.Worker.options, ["Opus", "Codex", "None"]);
  assert.deepEqual(byName.Mode.options, ["Mutation", "Read-only"]);
  assert.deepEqual(byName["Owner Decision"].options, [
    "Not required",
    "Pending",
    "Accepted",
    "Rejected",
  ]);
  for (const name of ["Domain", "Base SHA", "Head SHA", "Evidence URL"]) {
    assert.equal(byName[name].type, "text");
  }
  assert.equal(PROJECT_MANIFEST.authority.role, "derived dispatch and control view");
  assert.equal(PROJECT_MANIFEST.authority.automation, "none. No workflow, action, or integration writes to this project.");
});

testCase("the Issue Form requires every packet field and carries no v4 dual-lane model", () => {
  const raw = read(".github/ISSUE_TEMPLATE/worker-packet.yml");
  const form = parseWorkflowStructure(raw);
  assert.deepEqual(form.labels, ["state:ready"]);

  const fields = form.body.filter((item) => item.id);
  for (const field of fields.filter((f) => f.type !== "checkboxes")) {
    assert.equal(field.validations?.required, true, `${field.id} must be required`);
  }
  const labels = fields.filter((f) => f.type !== "checkboxes").map((f) => f.attributes.label);
  assert.deepEqual(labels, REQUIRED_FIELDS);

  const confirmations = fields.find((f) => f.type === "checkboxes");
  assert.equal(confirmations.attributes.label, "Confirmations");
  assert.ok(confirmations.attributes.options.length >= 6);
  for (const option of confirmations.attributes.options) {
    assert.equal(option.required, true, `confirmation must be required: ${option.label}`);
  }

  for (const banned of ["Lane A", "Lane B", "Dual-lane", "dual-lane", "Operational Lead"]) {
    assert.ok(!raw.includes(banned), `the form must not restate the v4 model: ${banned}`);
  }
  for (const promise of ["one Issue, one session, one branch", "launched manually", "Tony alone"]) {
    assert.ok(raw.includes(promise), `the form must confirm: ${promise}`);
  }

  const config = read(".github/ISSUE_TEMPLATE/config.yml");
  assert.match(config, /^blank_issues_enabled:\s*false$/m);
  assert.match(config, /^contact_links:\s*\[\]$/m);
});

testCase("the PR template carries every required marker", () => {
  const template = read(".github/pull_request_template.md");
  assert.ok(template.startsWith("KBP_PACKET/v1"));
  for (const marker of [
    "Linked Issue:",
    "Packet ID:",
    "Branch:",
    "Base SHA (full 40-hex):",
    "Head SHA (full 40-hex):",
    "Domain lease:",
    "## Declared allowlist",
    "## Actual changed paths",
    "## Commands and evidence",
    "## Preview",
    "Named non-author reviewer:",
    "Exact reviewed head SHA:",
    "Owner gate state:",
    "## Production",
    "Residual risk:",
    "Rollback:",
    "I have not reviewed, approved, certified, or merged my own work",
    "remains Draft until the Owner gate",
  ]) {
    assert.ok(template.includes(marker), `PR template is missing: ${marker}`);
  }

  // A body built from this template binds cleanly and claims no runtime proof.
  assert.equal(evaluate(mutationContext()).status, "PASS");
});

testCase("parseIssueBody reads the rendered issue-form shape", () => {
  const parsed = parseIssueBody(renderBody(MUTATION_FIELDS));
  assert.equal(parsed["Packet ID"], "EXAMPLE-PACKET-001");
  assert.equal(parsed["Exact base SHA"], `main@${BASE}`);
  assert.equal(Object.keys(parsed).length, REQUIRED_FIELDS.length);
});

/* --------------------------------------------------------------------- *
 * Registration
 * --------------------------------------------------------------------- */

if (process.env.VITEST) {
  const { describe, test: vitestTest } = await import("vitest");
  describe("KBP Packet Gate", () => {
    for (const item of CASES) vitestTest(item.name, item.fn);
  });
} else {
  const { test: nodeTest } = await import("node:test");
  for (const item of CASES) nodeTest(item.name, item.fn);
}
