# GitHub-native control plane

This directory defines how packet state is expressed in GitHub itself: one
canonical Issue Form, one canonical label set, one Project view, one pull
request template, and one validation-only Action.

It is a **control plane**, not an execution plane. Nothing here launches work,
approves work, or accepts work.

This file describes the mechanism. It deliberately restates **no live queue
state** — no current packet, lane, gate, or board position. Live state lives in
Issues, pull requests, labels, checks, and the Project. `governance/office/STATE.md`
indexes that truth; this file does not.

## 1. Authority and source-of-truth hierarchy

Ranked. When two sources disagree, the higher one wins and the divergence is
reported, never silently resolved.

1. **The Owner's explicit decision.** Tony alone adopts material decisions,
   opens stages, accepts professional and legal risk, approves, merges, and
   authorizes production promotion. Silence is not approval.
2. **Merged `main`, and verified GitHub state** — repository bytes at an exact
   SHA, Issue and pull request data, check runs, submitted reviews, workflow run
   artifacts.
3. **Verified execution output** — the exact command, its observed output, and
   the artifact it produced.
4. **`governance/BOUNDARIES.md`**, then `governance/office/OPERATING-MODEL-v5.md`,
   then `governance/office/PROGRAM-PLAN-v1.md`.
5. **Labels, Project fields, and gate results** — derived indexes of everything
   above.
6. **Chat, terminal output, and model memory** — not durable state, and never
   evidence.

A green check is evidence, not approval. A passing gate run means the observable
transition is self-consistent; it is not Owner acceptance, engineering approval,
or certification.

## 2. Lifecycle, and how it maps to labels and Project fields

The lifecycle is `OPERATING-MODEL-v5.md` §9:

```
READY → DISPATCH → STARTED → RESULT → LEAD_EVIDENCE_CHECK → REVIEW_REQUEST
→ REVIEW_VERDICT → OWNER_GATE → MERGE → PRODUCTION_VERIFY → CLEANUP
```

| Lifecycle position | `state:` label | Project "Workflow State" |
| :--- | :--- | :--- |
| Definition of Ready satisfied | `state:ready` | Ready |
| Packet published for manual launch | `state:dispatched` | Dispatched |
| Worker published STARTED evidence | `state:active` | Active |
| Worker published RESULT at an exact head | `state:result` | Result |
| Non-author review requested or running | `state:review` | Review |
| Evidence assembled, awaiting the Owner | `state:owner-gate` | Owner gate |
| Fail-closed stop recorded | `state:blocked` | Blocked |
| Owner-merged or Owner-adopted, cleaned up | `state:done` | Done |
| Replaced by a later packet | `state:superseded` | Superseded |

`DISPATCH` is not `STARTED`. Closing a session window does not create a result.

Five further label categories carry the rest of the machine-readable state, each
**exactly one per active Issue**: `worker:`, `mode:`, `kind:`, `gate:`, and
`domain:`. The complete manifest — exact name, colour, description, category,
and exclusivity — is `labels-v1.json`. Zero or more than one label in any
exclusive category is a fail-closed condition (`KBP005`).

The Issue Form applies only the static `state:ready` label. Every other label is
set by the coordinator from the form data. No form and no Action sets a label.

## 3. Manual launch boundary

**No AI worker is launched automatically. Ever, by anything in this repository.**

- Creating, editing, labelling, or commenting on an Issue launches nothing.
- The Issue Form launches nothing.
- The Project launches nothing.
- `kbp-packet-gate.yml` launches nothing. It holds no secret, calls no model or
  API, dispatches no workflow, and posts nothing.
- No mention, bot integration, hosted agent, or scheduled job is authorized to
  start a worker.

Exactly one person starts exactly one fresh worker engagement, manually: the
Owner. A packet becomes real work only when a human deliberately opens a session
and points it at that packet.

This boundary is mechanically asserted, not merely stated. `packet-gate.mjs`
scans the executable workflow and script surfaces for AI-dispatch tokens and for
any write-capable workflow permission, and fails closed on either (`KBP020`).
The controller passes its own scan; the test suite asserts that property.

## 4. Coordinator responsibilities

The coordinator is a control-plane role and **authors no repository byte**. It
may not become the fallback executor when a worker blocks.

It **may**: inspect authoritative state; create and amend packet Issues; set the
`worker:`, `mode:`, `kind:`, `gate:`, and `domain:` labels from the form data;
allocate and deconflict domain leases; reconcile a worker's claims against
artifacts; request independent review; prepare an Owner gate; add items to the
Project and set fields from live evidence; and perform evidence-backed queue
hygiene after worker results.

It **may not**: merge; approve; mark a pull request Ready; delete or rewrite a
branch, commit, or thread; alter a review verdict; close anything without a
stated evidence basis; launch a worker; or set `Owner Decision` to `Accepted`
without a persisted Owner comment to point at.

## 5. What the Action does and does not do

`.github/workflows/kbp-packet-gate.yml` runs `tools/control-plane/packet-gate.mjs`
and nothing else. Its check name is exactly **`KBP Packet Gate`**.

It **does**: read the event payload it was handed, read the checked-out
control-plane files, evaluate the fail-closed conditions in §7, and print a
machine-readable JSON report plus a human summary.

It **does not**: comment, label, assign, close, merge, approve, request a
review, dispatch anything, call a model or API, trigger another workflow, deploy,
read a secret, mutate a Project field, or open a network connection. It declares
`permissions: contents: read` at both workflow and job level and holds no write
scope anywhere.

The controller makes **no API call**, by design. It therefore sees only what the
event payload carries. A GitHub Actions `pull_request` payload does not include
the changed file list, and an `issue_comment` payload does not include the full
comment history. Rather than fetching them — which would require broader
authority and a network path — the controller reports
`MANUAL_EVIDENCE_REQUIRED`, names the exact fact it cannot observe, and says
where the evidence must come from instead. It never infers the fact and never
presents a human-supplied fact as an automated one.

The same controller runs against a complete fixture locally, where the full
board, comment history, changed-path list, and commit timestamps are available.
That is where the gate is at its strongest, and it is the mode the tests cover.

## 6. Running it locally

```bash
node --test tools/control-plane/packet-gate.test.mjs
```

That is the exact command. It requires no dependency beyond Node's built-in test
runner, writes no repository artifact, and builds every fixture in-process.

To evaluate one fixture by hand:

```bash
node tools/control-plane/packet-gate.mjs --fixture <fixture.json>
```

Machine-readable JSON goes to stdout; the human summary goes to stderr, so
stdout stays parseable. Exit code `0` means consistent, `1` means a fail-closed
violation, `2` means the controller could not run.

## 7. Failure-code catalogue

Codes are stable identifiers. Tests assert the code, never the message.

| Code | Fails closed when |
| :--- | :--- |
| `KBP001_MISSING_REQUIRED_FIELD` | A required packet field is absent, empty, or a confirmation is unchecked. |
| `KBP002_BASE_SHA_NOT_EXACT` | The base is a moving reference, an abbreviated SHA, or otherwise not a full 40-character lowercase SHA. |
| `KBP003_ALLOWLIST_AMBIGUOUS` | An allowlist entry is a glob, a wildcard, directory-only, or not `<create\|modify\|delete> <one concrete path>`; or a mutation packet declares `none`. |
| `KBP004_OPEN_DELEGATION` | A delegating field contains open delegation such as `relevant docs`, `make it premium`, `best asset`, or `smallest suitable module`. |
| `KBP005_LABEL_EXCLUSIVITY` | An exclusive label category carries zero labels, more than one, or a label not declared in `labels-v1.json`. |
| `KBP006_ACTIVE_WITHOUT_STARTED` | An Issue is `state:active` with no persisted `STARTED — <packet>` record. |
| `KBP007_WIP_LIMIT_EXCEEDED` | More than two mutation packets are simultaneously active. |
| `KBP008_DOMAIN_LEASE_CONFLICT` | Two active mutation packets share a `domain:` label or an allowlisted path. |
| `KBP009_PREDECESSOR_NOT_MERGED` | A declared predecessor is neither merged nor closed. |
| `KBP010_MISSING_BRANCH_OR_DRAFT_PR` | A mutation packet at or past RESULT lacks exactly one linked branch and one pull request. |
| `KBP011_PR_BINDING_MISMATCH` | The pull request's branch, base SHA, linked Issue, or packet ID does not match the packet. |
| `KBP012_PATH_OUTSIDE_ALLOWLIST` | A changed path is outside the exact Issue allowlist. |
| `KBP013_PR_READY_BEFORE_OWNER_GATE` | A mutation pull request is not a Draft before `state:owner-gate`. |
| `KBP014_RESULT_INCOMPLETE` | A RESULT record is absent, or missing the exact head, command evidence, changed paths, Draft pull request URL, or residual risk. |
| `KBP015_REVIEW_HEAD_MISMATCH` | The latest review is bound to a commit other than the current pull request head. |
| `KBP016_REVIEW_STALE_NEW_COMMIT` | A commit landed after the latest review was submitted. |
| `KBP017_AUTHOR_SELF_REVIEW` | The reviewing engagement is the authoring engagement, and no separate non-author engagement is declared. |
| `KBP018_GATE_WITHOUT_REVIEW_EVIDENCE` | `state:owner-gate` is set without a non-author review bound to the current exact head. |
| `KBP019_UNSUPPORTED_RUNTIME_CLAIM` | A docs-only or infrastructure diff claims runtime, browser, deployment, or Production proof. |
| `KBP020_AI_DISPATCH_OR_WRITE_PERMISSION` | A control-plane executable surface carries an AI-dispatch token or a write-capable workflow permission. |
| `MANUAL_EVIDENCE_REQUIRED` | Not a failure. A required fact is not observable from the available evidence; the exact missing fact is named and must be supplied by a human record. |

### Where GitHub cannot prove the fact

Author-versus-reviewer separation is scoped to the **engagement**, not to the
GitHub account. Two distinct engagements routinely post under one account, and
the API cannot tell them apart. So:

- if the review author and the pull request author are the same account and the
  review declares no separate engagement, that is a hard `KBP017` failure;
- if they differ but the review does not declare its own model or lane and state
  explicitly that it did not author the reviewed head, the controller emits
  `MANUAL_EVIDENCE_REQUIRED` and names exactly what the review must say;
- at `state:owner-gate` that missing declaration becomes a `KBP018` failure,
  because the gate cannot open on an unproven fact.

## 8. A new commit invalidates review

A review verdict is bound to one exact head SHA. It certifies those bytes and no
others.

When a new commit lands on the branch, every earlier verdict is invalid
immediately — not stale, not mostly-valid, invalid. The gate reports this two
ways: `KBP015` when the latest review points at a commit other than the current
head, and `KBP016` when a commit's timestamp is later than the latest review's
submission. At `state:owner-gate` the same condition raises `KBP018`, so the
Owner gate cannot open on a verdict that predates the bytes.

Recovery is a fresh `REVIEW_REQUEST` pinned to the new exact head, reviewed by a
non-author engagement. It is never a re-interpretation of the old verdict.

## 9. The Project is a derived view

`project-v1.json` declares the organization, the preferred existing project
number, the fallback title, the linked repository, the retained built-in fields,
and the exact custom fields and options.

The Project is a **dispatch and control view**. Every field is derived from an
underlying artifact, and every field declares `impliesAcceptance: false`. No
Project field value constitutes Owner acceptance, engineering approval, or merge
authority — including `Owner Decision: Accepted`, which is an index pointing at
a persisted Owner comment and never a substitute for one.

When a Project field and the underlying evidence disagree, the evidence wins.
The field is corrected and the divergence is reported.

Reconciliation is non-destructive: declared fields and options only, undeclared
fields untouched, no deletion, renaming, archiving, closing, or bulk relabelling
of historical Issues or pull requests. If the preferred project number exists but
is unrelated, ambiguous, or inaccessible, the correct action is to stop
`BLOCKED — PROJECT TARGET OR AUTHORIZATION` — never to create a duplicate.

## 10. Recovery when the Project or the Action is unavailable

Neither is load-bearing. Both are conveniences over evidence that already exists.

**If the Project is unavailable, inaccessible, or the engagement lacks Projects
authority:** the labels on the Issue remain the machine-readable state, and the
Issue, its comments, the pull request, and the checks remain the evidence. Record
the exact authorization gap, stop the Project half at
`BLOCKED — PROJECT TARGET OR AUTHORIZATION`, and preserve the tested repository
work. Do not request, repurpose, or escalate credentials, and do not create a
substitute Project.

**If the Action is unavailable, disabled, or its run cannot be trusted:** run the
same controller locally against a complete fixture and attach the output. The
local run is the stronger evidence, because it sees the full board, comment
history, changed paths, and commit timestamps that an event payload omits. A
missing check is a missing convenience, not a missing gate — the gate is the
evidence, and a human reading the Issue can reach every fail-closed condition in
§7 unaided.

**If labels themselves cannot be written:** the Issue body and its persisted
`STARTED` / `RESULT` / `REVIEW_VERDICT` / `BLOCKED` comments remain authoritative.
Labels are an index of those records, never a substitute.

## 11. Pinned Action provenance

Every third-party Action is pinned to a full immutable commit SHA. A tag is
mutable and is not a pin.

| Action | Pinned commit | Tag at pin time | Provenance |
| :--- | :--- | :--- | :--- |
| `actions/checkout` | `11bd71901bbe5b1630ceea73d27597364c9af683` | `v4.2.2` | https://github.com/actions/checkout/commit/11bd71901bbe5b1630ceea73d27597364c9af683 |

`actions/checkout` runs with `persist-credentials: false`, so no token is left in
the workspace git configuration.

No other third-party Action is used. Node is taken from the runner image rather
than a setup Action, which keeps the third-party supply-chain surface at exactly
one pinned entry. Changing or adding a pin is a packet in its own right, and the
provenance row above must be updated in the same change.

## 12. Files in this control plane

| Path | Role |
| :--- | :--- |
| `.github/ISSUE_TEMPLATE/worker-packet.yml` | The one canonical packet Issue Form. Every v5 packet field is required. |
| `.github/ISSUE_TEMPLATE/config.yml` | Disables blank Issues; exposes no external contact link. |
| `.github/pull_request_template.md` | The `KBP_PACKET/v1` evidence template. |
| `.github/workflows/kbp-packet-gate.yml` | The validation-only Action. Check name `KBP Packet Gate`. |
| `governance/control-plane/README.md` | This file. |
| `governance/control-plane/labels-v1.json` | Canonical label manifest. |
| `governance/control-plane/project-v1.json` | Canonical Project manifest. |
| `tools/control-plane/packet-gate.mjs` | The controller. |
| `tools/control-plane/packet-gate.test.mjs` | Focused deterministic tests. |

`tools/control-plane/packet-gate.test.mjs` is the single documented exclusion
from the AI-dispatch scan, because it declares the forbidden tokens as fixtures
in order to test the scanner at all. The exclusion is declared in
`SCANNED_SURFACES.documentedExclusions` and asserted by the suite, so it cannot
be widened without a visible, failing test.
