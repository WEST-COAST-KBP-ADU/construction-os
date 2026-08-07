# SOP-0001 — Dual-lane GitHub Issue coordination

- **Status:** proposed
- **Version:** 1.0
- **Authority:** TASK-0014 and GitHub Issue #49
- **Applies to:** research, architecture analysis, implementation coordination,
  non-author review, and closure in this repository

## 1. Operating model

### Lane A — Operational Lead

ChatGPT is the Operational Lead. This lane owns:

- current-state verification against the repository and deployed evidence;
- definition of one bounded outcome;
- creation of the Issue and durable brief;
- selection and coordination of the bounded executor;
- reconciliation of independent findings;
- verification, recording, and closure.

Claude Code or Codex may execute a bounded implementation inside Lane A when the
Issue names that executor. An executor is not a third coordination lane.

### Lane B — Independent Engineer

Each packet names exactly one independent engineer: **Fable 5** or **Opus 5**.
Lane B performs the assigned independent research, architecture analysis, or
non-author review. Lane B does not silently mutate implementation scope or
adopt its own recommendation.

### Owner gate

Tony is outside the two engineering lanes and remains:

- final decision authority;
- sole adopter of material product, architecture, policy, trust, or scope
  decisions;
- sole pull-request merger;
- required approver for external publication, material production promotion,
  access-control changes, spending, and destructive actions.

## 2. Canonical surfaces

| Surface | Purpose | Not authoritative for |
| :-- | :-- | :-- |
| GitHub Issue | Dispatch, handoff, status, blocker, review request, owner gate | Final artifact bytes |
| `docs/shared-briefs/<packet-id>/` | Brief, independent analysis, adopted decision, outcome | Code mutation |
| Branch and Draft PR | Proposed repository mutation, checks, code review | Owner adoption before merge |
| Exact SHA, tests, logs, screenshots, URLs | Evidence | Unverified inference |
| Chat or terminal output | Owner intent and incidental interaction | Durable handoff or completion proof |

The Issue links to durable artifacts. It does not duplicate or replace them.

## 3. One-packet rule

One Issue carries one bounded packet and one outcome. One implementation scope
uses one branch and one Draft PR.

A packet must name:

- packet ID and type: `RESEARCH`, `IMPLEMENTATION`, or `REVIEW`;
- exact repository and base SHA;
- Lane A owner and bounded executor, if any;
- Lane B independent engineer;
- single outcome;
- owned paths or read-only surface;
- durable shared-artifact path;
- acceptance evidence;
- non-goals and stop conditions.

Materially different outcomes receive separate Issues. Dependent packets may
link to each other but do not share mutable scope.

## 4. Issue state protocol

Each state transition is a top-level Issue comment beginning with one exact
header.

### `DISPATCH`

Written by Lane A. It identifies the exact base SHA, named lane, durable brief,
deliverable, acceptance evidence, and non-goals. This is the task handoff.

### `RESULT`

Written by the assigned author or executor. It identifies:

- exact result commit SHA;
- changed or produced artifacts;
- commands and observed results;
- declared deviations, unknowns, and blockers;
- Draft PR URL when mutation exists.

### `REVIEW_REQUEST`

Written by Lane A after verifying that the result matches the declared scope.
It identifies the exact head SHA, reviewer, read-only review surface, and
required terminal recommendation: `PASS` or `CHANGES REQUESTED`.

### `REVIEW_VERDICT`

Written by the non-author reviewer. It pins the exact reviewed SHA and provides
exactly one terminal recommendation:

- `PASS`; or
- `CHANGES REQUESTED` with actionable findings and evidence.

For code or repository mutation, the reviewer publishes the review on the PR
and mirrors the verdict and review URL into the Issue. For analysis-only work
without a PR, the verdict may live directly in the Issue.

Any new commit invalidates the verdict and requires a new
`REVIEW_REQUEST`.

### `BLOCKED`

Names one exact blocker, evidence proving it, preserved completed work, and the
smallest missing fact or Owner-only action. Ordinary reversible work is not a
blocker.

### `OWNER_GATE`

Pins the reviewed head SHA, review verdict, checks, remaining risk, and one
specific Owner action. Lane A does not merge.

### `CLOSED`

Records the merge or adopted decision, exact resulting SHA, final verification,
durable `OUTCOME.md` or run record, and linked deployment evidence where
applicable. The Issue is then closed.

## 5. Shared-layer contract

Use the smallest required subset under
`docs/shared-briefs/<packet-id>/`:

- `BRIEF.md` — verified context, exact question or work objective,
  constraints, evidence, and requested deliverable.
- `FABLE-ANALYSIS.md` or `OPUS-ANALYSIS.md` — independent findings,
  uncertainty, risk, and recommendation.
- `DECISION.md` — Owner decision or adopted operational conclusion. Analysis
  alone never creates an adopted decision.
- `OUTCOME.md` — implementation result, verification, exact commit, PR,
  deployment, and remaining limitations.

Repository governance task packets, work orders, research packets, and run
records remain authoritative where existing boundaries require them. The shared
layer links to those records instead of replacing them.

## 6. Authorship and review separation

- An artifact author cannot issue its acceptance verdict.
- Lane A may author a packet and request Lane B review.
- Lane B may author an analysis and Lane A may perform acceptance review if Lane
  A did not author that analysis.
- If Lane A executes implementation, Lane B reviews.
- If Lane B executes implementation, a non-author reviewer is named explicitly;
  the author cannot self-review.
- Owner approval is not a substitute for engineering review, and engineering
  review is not Owner adoption.

## 7. Communication discipline

- Do not ask the Owner to copy commands, SHAs, task packets, or review requests
  between engineering lanes when the Issue and repository are available.
- Do not treat a chat summary, model session, or terminal transcript as a
  handoff.
- Do not post free-form status noise. Post only evidence-bearing state changes,
  blockers, or owner gates.
- Do not silently rebase a review onto a new SHA.
- Do not expand scope inside review. New work becomes a new packet.
- Do not expose secrets, credentials, production PII, or raw customer data in
  Issues, briefs, PRs, or evidence.

## 8. Review and closure invariants

A packet is ready for Owner merge or adoption only when all applicable facts
are present:

1. exact base and head SHA;
2. declared changed paths or read-only review surface;
3. required tests and evidence;
4. non-author `PASS` at the same head SHA;
5. no unresolved blocking finding;
6. one explicit `OWNER_GATE`.

A packet is closed only after the resulting merge/adoption state is verified
from the authoritative surface and recorded durably.
