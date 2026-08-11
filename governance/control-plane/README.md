# GitHub-native control plane

This directory defines how dispatch state for `WEST-COAST-KBP-ADU/construction-os`
is expressed in GitHub itself: one canonical Issue Form, one canonical pull
request template, one declared label set, one declared Project shape, and one
read-only validation check.

It defines the **mechanism**. It does not carry live queue state. The live board
is `governance/office/STATE.md`, the open Issues, and the open Draft PRs.

## 1. Authority and source-of-truth hierarchy

1. **The Owner, `avoroncov971-maker`.** Tony alone adopts material decisions,
   approves, merges, authorizes production promotion, spends, and changes
   access. Nothing in this directory delegates any of that.
2. **Merged `main`.** Repository bytes on `main` are truth.
3. **Verified GitHub state.** Issue and pull request data, exact commit SHAs,
   check runs, submitted reviews pinned to an exact head, and workflow run
   artifacts.
4. **Verified execution output.** Command output observed at a stated SHA.
5. **`STATE.md`.** An index of 2–4, never a substitute. When a committed record
   and an Issue disagree, the committed record wins and the divergence is
   reported, not silently resolved.
6. **The GitHub Project.** A derived view of 2–4 (§8). It proves nothing on its
   own.

Chat, terminal scrollback, and model memory are not durable state at any level.

`governance/BOUNDARIES.md` and `governance/office/OPERATING-MODEL-v5.md` bind
this directory and are unchanged by it.

## 2. The manual launch boundary

**No AI worker is launched automatically by anything in this repository.**

Creating an Issue, editing it, applying a label, adding it to the Project,
commenting on it, opening a pull request, or running the `KBP Packet Gate` check
launches no model and starts no session. Tony starts every worker manually, in
one fresh visible terminal session, one packet at a time.

There is no `@`-mention trigger, no comment command, no scheduled dispatcher, no
model or API call, no provider secret, and no write-capable automation anywhere
in `.github/`, `governance/control-plane/`, or `tools/control-plane/`. The
controller enforces this against its own sources on every run
(`KBP020_AI_DISPATCH_OR_WRITE_PERMISSION`), and the focused tests assert it.

## 3. Lifecycle and mappings

```
READY → DISPATCH → STARTED → RESULT → LEAD_EVIDENCE_CHECK → REVIEW_REQUEST
→ REVIEW_VERDICT → OWNER_GATE → MERGE → PRODUCTION_VERIFY → CLEANUP
```

| Lifecycle position | `state:` label | Project **Workflow State** |
| :--- | :--- | :--- |
| Definition of Ready satisfied, not dispatched | `state:ready` | Ready |
| Packet published | `state:dispatched` | Dispatched |
| Worker posted STARTED evidence | `state:active` | Active |
| Worker posted RESULT at an exact head | `state:result` | Result |
| Non-author review requested or running | `state:review` | Review |
| Evidence pinned, awaiting the Owner | `state:owner-gate` | Owner gate |
| Fail-closed stop | `state:blocked` | Blocked |
| Merge or adoption verified and recorded | `state:done` | Done |
| Replaced by a named successor | `state:superseded` | Superseded |

`DISPATCH` is not `STARTED`. A lane with no persisted STARTED comment is not
running, whatever any chat window suggests. Closing a session window does not
create a result.

Six label categories are exclusive — exactly one label from each on every active
Issue: `state:`, `worker:`, `mode:`, `kind:`, `gate:`, `domain:`. The exact
names, colours, descriptions, and counts are declared in `labels-v1.json` and
asserted by the focused tests. The Issue Form applies only the static
`state:ready` label; every other label is applied by the coordinator from the
form data.

Project single-select fields **Gate**, **Worker**, and **Mode** mirror the
`gate:`, `worker:`, and `mode:` label categories. **Domain** carries the exact
primary `domain:` label name as text.

## 4. Coordinator responsibilities

The coordinator is a control-plane role. It authors no repository byte and never
becomes a fallback executor when a worker blocks.

It **does**: verify authoritative state before writing a packet; create and
amend Issues through the canonical form; apply and correct the exclusive labels;
allocate and deconflict domain leases; keep the Project in step with live Issue
and pull request evidence; reconcile worker claims against artifacts and report
divergence; name a non-author reviewer in advance; prepare Owner gates; and
perform evidence-backed queue hygiene after worker results.

It **does not**: merge; approve; mark a pull request Ready; author, edit, or
delete a repository byte, branch, commit, or thread; alter a review verdict;
close anything without a stated evidence basis; deploy; or launch a worker.

## 5. The validation boundary of the Action

`.github/workflows/kbp-packet-gate.yml` runs the check named **`KBP Packet
Gate`** on `issues`, `issue_comment`, `pull_request`, and `pull_request_review`
events, plus manual `workflow_dispatch`. Concurrency is used only to serialize
validation for the same Issue or pull request.

The workflow declares `permissions: contents: read` at workflow level and again
at job level. There is no `write` scope anywhere.

It invokes exactly one program, `tools/control-plane/packet-gate.mjs`, and does
nothing else. It never comments, labels, assigns, closes, merges, approves,
dispatches, calls a model or any API, triggers another workflow, deploys,
accesses a secret, or mutates a Project field.

A green `KBP Packet Gate` means the observable transition is internally
consistent. **It is not Owner acceptance, engineering review, or approval.** A
green check is evidence, not authority.

The controller is a validator, not a fixer. It never proposes a repair, and a
blocker is never resolved by widening scope.

### What the controller cannot prove

Some facts in the operating model are engagement-level, not account-level.
GitHub API identity cannot show that the engagement that reviewed a head is a
different engagement from the one that authored it — both may appear under the
same account. Where the controller cannot prove such a fact, it emits
`MANUAL_EVIDENCE_REQUIRED` naming the fact and why it is unprovable, and the
evidence must be stated explicitly in the review or the Issue. The controller
never pretends the fact is automated.

Live webhook payloads are also partial: a `pull_request` payload does not
enumerate changed files, and an `issues` payload does not carry the full comment
list. Those checks report `MANUAL_EVIDENCE_REQUIRED` in live mode and run fully
in fixture mode.

The workflow audit is a deterministic **structural** read of the YAML —
triggers, permissions, jobs, steps, `uses`, and `run` — not a general YAML
parser. It is sufficient for the control-plane files it audits, and it is
exercised against the shipped workflow by the focused tests.

## 6. Running the controller and its tests

Canonical focused-test command:

```bash
node --test tools/control-plane/packet-gate.test.mjs
```

Fixture mode, for a saved context file:

```bash
node tools/control-plane/packet-gate.mjs --fixture <file.json> --repo-root .
```

Live mode, as the workflow invokes it:

```bash
node tools/control-plane/packet-gate.mjs --event-name <name> --event <payload.json> --repo-root .
```

Exit status is `0` for PASS, `1` for FAIL, `2` for a usage error. Output is a
machine-readable JSON report followed by a human summary; `--json-only`
suppresses the summary. The controller has no runtime dependency outside the
Node standard library.

The repository's aggregate `npm test` script runs Vitest, whose default include
pattern also collects `*.test.mjs`. `packet-gate.test.mjs` therefore declares its
cases once and registers them with `node:test` normally, or with the existing
Vitest devDependency when Vitest is the loader. The assertions are identical on
both paths, no dependency is added, and no artifact is generated. `node --test`
remains the canonical invocation. The narrower alternative — excluding `tools/**`
from the Vitest include set — requires editing `vitest.config.ts`, which is
outside this packet's declared allowlist.

## 7. Failure-code catalogue

Codes are the stable contract. Messages may be reworded; codes may not.

| Code | Fails closed when |
| :--- | :--- |
| `KBP001_MISSING_REQUIRED_FIELD` | A required packet field is absent or empty. |
| `KBP002_BASE_NOT_EXACT_SHA` | The base is a branch, a short SHA, or otherwise not full 40-hex. |
| `KBP003_ALLOWLIST_NOT_EXACT` | An allowlist entry is a wildcard, a directory, ambiguous, duplicated, or open-ended. |
| `KBP004_OPEN_DELEGATION` | The packet delegates openly, for example by naming a class of documents rather than exact inputs, or by stating an adjectival target. |
| `KBP005_LABEL_EXCLUSIVITY` | An exclusive label category carries zero, two, or an undeclared label. |
| `KBP006_ACTIVE_WITHOUT_STARTED` | `state:active` without a persisted STARTED comment naming session, clone, branch, and exact base. |
| `KBP007_WIP_LIMIT` | More than two active mutation packets. |
| `KBP008_DOMAIN_LEASE_OVERLAP` | Two active mutation packets hold overlapping file or domain leases. |
| `KBP009_UNMERGED_PREDECESSOR` | A packet depends on a predecessor that is neither merged nor closed. |
| `KBP010_MISSING_BRANCH_OR_DRAFT_PR` | A mutation packet does not have exactly one branch and exactly one Draft pull request. |
| `KBP011_PR_BINDING_MISMATCH` | Pull request branch, base, head, linked Issue, packet ID, or the `KBP_PACKET/v1` marker disagrees with the Issue. |
| `KBP012_PATH_OUTSIDE_ALLOWLIST` | A changed path is outside the exact Issue allowlist. |
| `KBP013_NON_DRAFT_BEFORE_OWNER_GATE` | A mutation pull request left Draft before `state:owner-gate`. |
| `KBP014_RESULT_INCOMPLETE` | RESULT lacks an exact head, commands, changed paths, the Draft pull request, or residual risk. |
| `KBP015_REVIEW_NOT_AT_HEAD` | A review verdict pins no SHA, or a SHA that is not the current head. |
| `KBP016_COMMIT_AFTER_REVIEW` | A commit landed after the latest review. |
| `KBP017_AUTHOR_IS_REVIEWER` | The author engagement is represented as its own reviewer. |
| `KBP018_GATE_WITHOUT_REVIEW_EVIDENCE` | An Owner-gate or merge transition lacks a non-author review pinned to the exact head. |
| `KBP019_UNSUPPORTED_RUNTIME_CLAIM` | A documentation-only or infrastructure diff claims browser, runtime, deployment, or Production proof. |
| `KBP020_AI_DISPATCH_OR_WRITE_PERMISSION` | A control-plane file grants a write permission, omits its permissions block, uses an unpinned action, or contains an AI-dispatch, model, or secret token. |
| `MANUAL_EVIDENCE_REQUIRED` | Not a failure. A named fact GitHub cannot prove from API identity or the event payload alone. |

## 8. A new commit invalidates a review

A review verdict is bound to one exact head SHA. When a new commit lands, the
pull request head changes and the earlier verdict no longer describes the
reviewed bytes.

The controller detects this two ways. `KBP016_COMMIT_AFTER_REVIEW` fires when the
commit a review examined is not the current head.
`KBP015_REVIEW_NOT_AT_HEAD` fires when the verdict text pins no SHA or pins a
different one. An Owner-gate transition then fails
`KBP018_GATE_WITHOUT_REVIEW_EVIDENCE` until a fresh non-author review is
submitted at the new head. Rebasing a verdict onto a new SHA is never
permitted — the review is re-run.

## 9. The Project is a derived view

`project-v1.json` declares an organization Project — preferred number `7`, exact
fallback title `KBP ADU Product Program` — linked only to this repository, with
built-in Title and Assignees retained and nine declared custom fields.

The Project is a dispatch and control **view**. Merged repository bytes, Issue
and pull request data, exact SHAs, checks, reviews, and run artifacts remain
evidence truth. No Project field expresses or implies acceptance: `Owner
Decision` records only a decision the Owner has already stated on the Issue.

Reconciliation is create-or-update of the declared fields and options only.
Undeclared fields are left untouched. Nothing is deleted, renamed, archived, or
closed, and no historical Issue or pull request is bulk-relabelled. No workflow,
action, or integration writes to the Project.

## 10. Recovery when the Project or the check is unavailable

Neither surface is authoritative, so neither is on the critical path.

- **Project unavailable, ambiguous, or out of authorization scope.** Stop the
  Project work as `BLOCKED — PROJECT TARGET OR AUTHORIZATION`, preserve the
  tested repository work, and create no duplicate Project. Labels and Issues
  continue to carry full dispatch state on their own. Do not request or
  repurpose credentials to route around it.
- **Project drifted from the manifest.** Stop as `BLOCKED — LABEL OR PROJECT
  MANIFEST DIVERGENCE` and report the exact field or option that diverged.
  Reconcile toward the manifest; never edit the manifest to match drift without
  a packet that declares it.
- **Check unavailable, failing to start, or wrong.** The check is validation, not
  authority. Run the controller locally against a fixture or the saved event
  payload, publish the exact output as evidence, and record that the hosted check
  was unavailable. A missing check never becomes an approval, and never
  authorizes skipping the non-author review or the Owner gate.
- **Third-party action unavailable or unpinnable to a verified commit.** Stop as
  `BLOCKED — ACTION PERMISSION OR SUPPLY-CHAIN RISK`. Never substitute a floating
  tag.

## 11. Pinned action provenance

Every third-party action is pinned to a full immutable commit SHA. Floating tags
are rejected by `KBP020_AI_DISPATCH_OR_WRITE_PERMISSION`.

| Action | Pinned commit | Release | Official source |
| :--- | :--- | :--- | :--- |
| `actions/checkout` | `08c6903cd8c0fde910a37f88322edcfb5dd907a8` | `v5.0.0` | https://github.com/actions/checkout/releases/tag/v5.0.0 |
| `actions/setup-node` | `49933ea5288caeca8642d1e84afbd3f7d6820020` | `v4.4.0` | https://github.com/actions/setup-node/releases/tag/v4.4.0 |

Each SHA was resolved from the upstream repository's own tag ref and can be
re-verified against the official source:

```bash
git ls-remote https://github.com/actions/checkout   refs/tags/v5.0.0
git ls-remote https://github.com/actions/setup-node refs/tags/v4.4.0
```

`actions/checkout` runs with `persist-credentials: false`, so no credential is
left in the runner workspace. Re-pin only through a packet that declares the
change and records the new provenance here.
