# SESSION-START — canonical cold start

This is the first repository-specific document a fresh session reads. It exists
so that a session with no chat history can reconstruct the authoritative system
state, the exact stopping point, and the operating board from merged repository
bytes plus live GitHub evidence.

It is deliberately **stable**. It carries no current packet, no current SHA, no
queue position, and no board occupancy. Everything mutable is reconstructed by
running the hydration below against live GitHub. If this file ever appears to
tell you what is currently active, that is a defect — re-read from GitHub.

This repository's current contour is `CONSTRUCTION`; its model- and
vendor-neutral role address is `role.construction.operations-director`, for the
West Coast KBP / ADU and construction operational domain. The role remains
`referenced-not-frozen`. Product 2 remains valid business and product vocabulary
inside the Construction contour, not a current top-level contour; the legacy
`PRODUCT_2 / product-adu` address resolves to `CONSTRUCTION / construction`.
Addressing the role does not hydrate PostgreSQL, activate runtime, grant
credentials, or produce business or external effects.

## 0. Execution surface

This entry works from any repository-attached checkout: a Cloud Codex or Claude
Code cloud session with this repository attached, or a ChatGPT Lead engagement
with the GitHub repository connected and read access to Issues and pull
requests.

It requires no particular machine, no named local clone directory, and no manual
worktree. A session that cannot resolve a repository-attached checkout stops at
`BLOCKED — EXECUTION SURFACE OR PATH STATE` and reports the exact failed
command; it does not clone by hand to work around the gap.

A mutating session proves, before publishing `STARTED`:

```bash
git rev-parse --show-toplevel   # resolves, exit 0
git ls-files | wc -l            # repository bytes are present
git status --porcelain          # empty
git rev-parse HEAD              # equals the packet's pinned base
```

## 1. Stable system understanding

These facts change only by an Owner-adopted decision. Each is stated once, here,
with the record that governs it. Read the record; do not trust a summary.

| Fact | Governing record |
| :--- | :--- |
| Tony (`avoroncov971-maker`) is the sole Owner, approver, and merger. Silence is not approval. | [`../office/OPERATING-MODEL-v5.md`](../office/OPERATING-MODEL-v5.md) §2, [`../control-plane/README.md`](../control-plane/README.md) §1 |
| The Owner alone launches the model- and vendor-neutral Construction Operations Director role. Its current address is contour `CONSTRUCTION`, role `role.construction.operations-director`; the role status is `referenced-not-frozen`. | Owner-adopted external record `kbp-core-engineering/kbp-dev-office: manifests/contour/deedseal-contour-topology-v1.json`, pinned by the adopting packet |
| ChatGPT Lead is a control-plane role and authors no repository byte, and never becomes the fallback executor. | [`../office/OPERATING-MODEL-v5.md`](../office/OPERATING-MODEL-v5.md) §2, §4 |
| Workers are bounded executors: one packet, one branch, one Draft PR, one declared allowlist. | [`../office/OPERATING-MODEL-v5.md`](../office/OPERATING-MODEL-v5.md) §2 |
| An author never reviews, accepts, certifies, or merges its own head. Roles are scoped to the engagement, not the model. | [`../office/OPERATING-MODEL-v5.md`](../office/OPERATING-MODEL-v5.md) §3 |
| Product 2 is business/product vocabulary inside the Construction contour for this repository, `WEST-COAST-KBP-ADU/construction-os`: West Coast KBP, the real Greater Sacramento ADU and general-construction business, operating AI-natively on its own owner-controlled platform, KBP OS. Product 2 is not a current top-level contour. The business is not reducible to lead generation, inquiry transport, a website, a Hero, a CRM, or a generic AI agent. | [`../product/PRODUCT-BOUNDARIES-v1.0.md`](../product/PRODUCT-BOUNDARIES-v1.0.md) sections A, B and C, [`../README.md`](../README.md), [`../charter.md`](../charter.md) |
| Product 2 direction is repository data, not conversation: one persistent, machine-checkable goal graph carries the NORTH_STAR, outcomes, modules, work and evidence. | [`../product/PRODUCT2-LIVE-GOAL-GRAPH-v1.json`](../product/PRODUCT2-LIVE-GOAL-GRAPH-v1.json), [`../product/PRODUCT2-GRAPH-FOUNDATION-ALIGNMENT-v1.md`](../product/PRODUCT2-GRAPH-FOUNDATION-ALIGNMENT-v1.md) |
| The only Product 1 cross-contour relation is the frozen `West Coast KBP — first user`. Runtime, identity, authority, data, Graph Memory, and product branding are never shared across contours. | [`../product/PRODUCT-BOUNDARIES-v1.0.md`](../product/PRODUCT-BOUNDARIES-v1.0.md) sections A and B, [`../../src/lib/deedsealCrossReference.ts`](../../src/lib/deedsealCrossReference.ts) |
| Product 1 / Deedseal is an **external** controlled-engineering foundation with its own repositories and authority. Public `Powered by Deedseal` labelling, cross-brand transition, public dependency claims, and cross-repository technical binding are **deferred** until a separately adopted decision opens them. | [`../BOUNDARIES.md`](../BOUNDARIES.md), Product 1 boundary sections of the Release 1 decision record once adopted |
| Hard prohibitions bind every session and are not negotiated inside a packet. | [`../BOUNDARIES.md`](../BOUNDARIES.md) |
| Stages and gates, and the visual production contract. | [`../office/PROGRAM-PLAN-v1.md`](../office/PROGRAM-PLAN-v1.md) |
| Lifecycle, labels, Project semantics, fail-closed codes, and the manual-launch boundary. | [`../control-plane/README.md`](../control-plane/README.md) |
| Issue state protocol. | [`../sops/SOP-0001-dual-lane-github-coordination.md`](../sops/SOP-0001-dual-lane-github-coordination.md) |

### Truth ranking

Ranked; when two disagree the higher wins and the divergence is **reported**,
never silently resolved. The full statement is
[`../control-plane/README.md`](../control-plane/README.md) §1.

1. The Owner's explicit decision.
2. Merged `main` and verified GitHub state at an exact SHA.
3. Verified execution output — the exact command and its observed output.
4. `BOUNDARIES.md`, then `OPERATING-MODEL-v5.md`, then `PROGRAM-PLAN-v1.md`.
5. Labels, Project fields, and gate results — derived indexes.
6. Chat, terminal scrollback, and model memory — not durable state, never evidence.

[`../office/STATE.md`](../office/STATE.md) is a committed **index** of live
truth, at rank 5. It is routinely behind `main`. A cold start reads it only to
detect and report drift, and never uses it to decide live dispatch.

## 2. Hydration

Re-read the following before any dispatch, review, gate, or mutation. The list
is the complete source set for one cold start; anything you cannot read becomes
a named gap, never an inference.

1. This file, then [`README.md`](README.md) in this directory.
2. `BOUNDARIES.md`, `OPERATING-MODEL-v5.md`, `PROGRAM-PLAN-v1.md`, `../control-plane/README.md`.
3. The persistent Product 2 goal graph — see [§2a](#2a-hydrate-the-persistent-goal-graph) below. Hydrate it before any dispatch.
4. `STATE.md` — as a possibly stale index only.
5. Live `main` and its exact current SHA.
6. Every open Issue: body, **every** comment, labels, and linked pull requests.
7. Every open pull request: metadata, exact head SHA, draft status, checks, reviews, and comments.
8. Merge records and any production-verification evidence for recently merged work.

Record for every source: its URL, an immutable SHA, the observation time,
whether the read was complete, and each named gap. Those five fields are what
make the result auditable; a source without them cannot support a decision.

## 2a. Hydrate the persistent goal graph

Product 2 direction is repository data. A session reconstructs **what the work
is for** from [`../product/PRODUCT2-LIVE-GOAL-GRAPH-v1.json`](../product/PRODUCT2-LIVE-GOAL-GRAPH-v1.json),
never from chat memory or from a model's own proposal.

```bash
node tools/memory/check-product2-live-goal-graph.mjs
```

The checker is fail-closed against the Owner-adopted minimal four-by-four
contract, vendored byte-identically at
[`../product/VENDORED-MINIMAL-GOAL-CONTRACT-v1.schema.json`](../product/VENDORED-MINIMAL-GOAL-CONTRACT-v1.schema.json)
with its provenance recorded outside its bytes. Four node types — `GOAL`,
`MODULE_SUBGRAPH`, `WORK_NODE`, `EVIDENCE`; four edge types — `ADVANCES`,
`DEPENDS_ON`, `SUPERSEDES`, `PROVES`. No fifth type is admitted, and no session
designs a parallel vocabulary.

It refuses an unknown node or edge type, an orphan Work Node, an `ADVANCES`
edge that does not end on a live goal, an unmet `DEPENDS_ON` presented as
executable, duplicate terminal evidence, a missing path to the NORTH_STAR, and
any conflation of Product 1 and Product 2 authority or memory. On success it
prints the active path, the terminal state of every branch, and the graph
digest. A refusal **stops the cold start**; it is never a warning.

Then verify the graph against live GitHub. The graph states intended state and
observes nothing about itself, so a Work Node it calls active is a claim to be
checked against the Issue, the branch, the pull request head, and the persisted
`STARTED` evidence. Where the two disagree, live GitHub wins and the divergence
is **reported**, never silently resolved.

The hydrated result is reported in this order:

```text
NORTH_STAR -> current OUTCOME -> current MODULE_SUBGRAPH
           -> active or next WORK_NODE -> expected EVIDENCE
```

Selection is constrained, not advisory:

- Work is selectable only when it has a valid `ADVANCES` path to the NORTH_STAR
  **and** every declared `DEPENDS_ON` gate carries an accepted terminal result.
- A free lane, a chat discussion, a label, an opened Issue, a green check, or a
  model proposal is **not progress**. Only an accepted terminal result with its
  evidence moves the graph, and a capability the boundary classifies
  `NOT_OPENED` is not opened by any packet.
- Nothing is marked running without a persisted `STARTED` event.
- Tony remains the sole material authority. The graph prepares decisions and
  takes none.

### Two graph surfaces, kept distinct

| Surface | What it is | Committed |
| :--- | :--- | :--- |
| [`../product/PRODUCT2-LIVE-GOAL-GRAPH-v1.json`](../product/PRODUCT2-LIVE-GOAL-GRAPH-v1.json) | The authority-routed **intent and work** graph: what Product 2 is for, and what advances it. Changes only by an Owner-adopted decision in a bounded packet. | yes |
| The engineering projection built by [`../../tools/memory/build-graph.mjs`](../../tools/memory/build-graph.mjs) | A derived **observation** of Issues, branches, pull requests, reviews, merges, deployments, and evidence. Rebuilt from a frozen observation; an index, never an authority source. | no |

Neither replaces the other. The projection is not deleted, merged into, or
reinterpreted by the goal graph. Intended state is never inferred from the
projection, and observed state is never asserted by the goal graph. A
contradiction between them is a reported discrepancy, never an average.

## 3. `COLD_START_RESULT/v1`

Hydration produces one machine-readable result, validated against
[`session-start-v1.schema.json`](session-start-v1.schema.json) and built by
[`../../tools/memory/build-session-start.mjs`](../../tools/memory/build-session-start.mjs):

```bash
node tools/memory/build-session-start.mjs --input <frozen-observation.json> --output /tmp/cold-start.json
```

It contains the repository and exact current `mainSha`; the observation
watermark and complete source list; the product boundary and current program
stage and gate; every active and ready WorkItem with its Issue URL, lifecycle
state, permanent lane, `Worker-N` identity and session, branch, pull request and
head where present, domain lease, blockers and required clearing evidence; the
Owner gate; every review bound to an exact head, dispatched, running, or
concluded; merge and production-verification state; the discrepancies between
`STATE.md`, labels and Project fields, Issues and pull requests, and live `main`;
the three-lane board; exactly one next executable control-plane action; and every
named gap.

The builder consumes the engineering graph rather than duplicating it: it runs
[`../../tools/memory/build-graph.mjs`](../../tools/memory/build-graph.mjs) over the
same frozen observation and carries that projection's canonical heads, invalid
reviews, unresolved blockers, runnable work, named gaps, and split-brain report
into its own output. There is one engineering-fact hierarchy, not two, and the
graph binds the **decision** as well as the output: no work is proposed for
dispatch unless the graph lists it in `runnableWork`, and work the graph calls
runnable while the observation carries an unresolved blocker for it stops the
cold start on `COLD016_GRAPH_CONTRADICTION` rather than being averaged out.

Output is derived, deterministic, rebuildable, source-watermarked, and
correction- and retraction-preserving. Identical frozen inputs produce
byte-identical bytes. It is generated into a temporary directory and is never
committed. It approves nothing, accepts nothing, merges nothing, dispatches
nothing, and launches nothing.

### Fail-closed conditions

A stale committed queue index is **reported and then ignored** for live
dispatch — it is a discrepancy, not a stop.

These stop the cold start with a stable reason code:

| Condition | Code |
| :--- | :--- |
| Incomplete GitHub data under an occupied lane or an open gate | `COLD004_INCOMPLETE_SOURCE` |
| A board whose keys are not exactly the three permanent lanes, or an allocation other than two product lanes and one workflow lane | `COLD005_SLOT_CARDINALITY` |
| An occupied lane with no persisted `STARTED` evidence | `COLD006_SLOT_WITHOUT_STARTED` |
| Two mutation activities sharing a domain lease or an allowlisted path | `COLD007_DOMAIN_LEASE_CONFLICT` |
| A reviewer engagement that authored the head it reviews | `COLD008_REVIEWER_AUTHORED_HEAD` |
| A review bound to anything other than the current exact head | `COLD009_STALE_EXACT_HEAD_REVIEW` |
| Two live records claiming one WorkItem at different heads | `COLD010_CONFLICTING_ACTIVE_HEADS` |
| A source watermark that regresses | `COLD011_WATERMARK_REGRESSION` |
| Output that would read as approval, acceptance, or a worker launch | `COLD012_AUTHORITY_BEARING_OUTPUT` |
| A board-eligible WorkItem with a missing, unbacked, or contradictory lane classification | `COLD013_LANE_CLASSIFICATION` |
| Workflow work seated in a product lane, or product work seated in the workflow lane | `COLD014_LANE_SLOT_MISMATCH` |
| Any executable worker identity that is not `Worker-N` for its own Issue number | `COLD015_WORKER_IDENTITY` |
| A dispatch decision that contradicts the graph's `runnableWork` or `unresolvedBlockers` | `COLD016_GRAPH_CONTRADICTION` |
| Two lanes holding a review of the same WorkItem | `COLD017_DUPLICATE_REVIEW` |

Missing evidence is named, never inferred. A missing fact is reported as a gap
with the exact record that would close it.

## 4. The canonical three-lane board

The result always carries exactly these three permanent lanes:

| Slot | Permanent lane | Required allocation |
| :--- | :--- | :--- |
| `P1` | Product 2 | one Product 2 WorkItem, or an explicit free state |
| `P2` | Product 2 | one Product 2 WorkItem, or an explicit free state |
| `W1` | Workflow | one graph-memory, cold-start, orchestration, control-plane, or engineering-workflow WorkItem, or an explicit free state |

Exactly two lanes are reserved for Product 2 advancement and exactly one for
workflow and graph advancement. That split is permanent and is not reallocated
by any session.

### Lane is not activity

Mutation versus independent read-only review is an **activity mode inside** a
lane, never a permanent slot identity. A review of a product head occupies `P1`
or `P2`; a review of a workflow head occupies `W1`. A lane therefore carries
both a permanent `lane` and a current `activityMode`.

### Worker identity

`Worker-N = Issue #N` is the engagement identity, everywhere. Slot label,
activity mode, retry number, session, branch, pull request, and head never
replace it, and any other string used as a worker identifier fails closed on
`COLD015_WORKER_IDENTITY` — in the board, in the WorkItem record, in a review
record, and in the graph's `Worker` nodes alike.

Rules, all enforced by the builder:

- Every WorkItem that can be allocated to a lane carries a deterministic `lane`
  classification backed by source evidence. Missing, unbacked, or contradictory
  classification fails closed; it is never guessed from a title.
- An occupied lane binds one WorkItem, one `Worker-N`, one Issue URL, one
  session, persisted `STARTED` evidence, a domain lease, and — when the activity
  is review — the exact current head under review.
- `DISPATCH` is not `STARTED`; a closed window is not a result.
- Two mutation activities require disjoint allowlists **and** disjoint domain
  leases. A read-only review takes no write lease.
- A review may hold only an exact head it did not author, and only while that
  head is current. A new commit invalidates every earlier verdict immediately.
- A review already bound to an exact head — dispatched, running, or concluded —
  suppresses any request for a second review of that same head, and two lanes
  reviewing one WorkItem fail closed.
- Every live `active` mutation or review engagement is seated in exactly one
  lane, or it is reported as a named blocking discrepancy. Live work is never
  silently dropped because no lane was assigned to it.
- A free lane is **explicit**, carries a stated reason, and is never silently
  filled. It may also name the `Worker-N` that has been dispatched into it.
- Nothing in this repository launches a worker. Comments, labels, the Issue
  Form, the Project, and Actions all launch nothing. Tony manually opens each
  engagement. See [`../control-plane/README.md`](../control-plane/README.md) §3.

### Occupancy target versus authoritative state

The operating target is continuous occupancy of all three lanes. That target is
an aim, never a claim: **live GitHub state is authoritative**. A lane may stand
`free` after a dispatch has been published and before Tony has manually opened
that engagement, and the projection reports it as free with its reason — and,
when known, the dispatched `Worker-N` — rather than reporting the lane as filled.
No repository artifact launches a worker, so no repository artifact can move a
lane from dispatched to occupied.

### Refill loop

```text
hydrate -> reconcile -> classify lane -> allocate P1/P2 product and W1 workflow
-> collect RESULT -> allocate same-lane read-only review -> exact-head verdict
-> Owner gate -> Owner merge -> verify -> cleanup -> refill the same lane
```

The loop is continuous and **lane-local**: a lane released by a merge, a blocker,
or a terminal `RESULT` is refilled from eligible work in that same permanent
lane, and only from a re-hydrated board, never from memory of what was running
before. A product review consumes a product lane and never `W1`; a workflow
review consumes `W1` and never `P1` or `P2`.

### The one next action

The result names exactly one next executable control-plane action, chosen by a
fixed precedence and tie-broken by lowest Issue number, so two sessions reading
the same evidence choose the same step:

1. `RECONCILE_UNSEATED_ENGAGEMENT` — a live engagement is running in no lane; nothing else is executable until the board represents it.
2. `ASSEMBLE_OWNER_GATE` — a non-author verdict is bound to the current exact head.
3. `REQUEST_INDEPENDENT_REVIEW` — a `RESULT` exists with no review bound to its current exact head and that item's own lane is free.
4. `PUBLISH_DISPATCH_FOR_MANUAL_OWNER_LAUNCH` — a lane is free and a ready packet in that same lane is runnable in the graph under a disjoint lease.
5. `AWAIT_ACTIVE_SLOT_RESULT` — no lane can be refilled until an occupied one reports.
6. `RECONCILE_STALE_STATE_INDEX` — nothing else is executable and the committed index has drifted.
7. `NAMED_GAP_BLOCKS_ACTION` — nothing is executable; the blocking gaps are named.

Every action is a preparation step for a human. None approves, accepts, merges,
or launches anything.

## 5. Verification

```bash
node tools/memory/check-product2-live-goal-graph.mjs
node --test tools/memory/build-graph.test.mjs tools/memory/build-session-start.test.mjs \
  tools/memory/check-product2-live-goal-graph.test.mjs
```

The goal-graph suite proves the committed manifest validates with zero
refusals, that the vendored contract is byte-identical to the pinned accepted
source, that the NORTH_STAR is the adopted canon's own statement rather than a
paraphrase, and that the deterministic path from the active packet to the
NORTH_STAR prints. Its negative fixtures each assert one refusal: an unknown
node or edge type, an orphan Work Node, an `ADVANCES` target that is not a live
goal, an unmet `DEPENDS_ON` presented as executable, duplicate terminal
evidence, a missing or ambiguous path to the NORTH_STAR, Product 1 / Product 2
authority or memory conflation, a node marked running without a persisted
`STARTED` event, a join satisfied while a required branch is unfinished,
evidence without an exact source, and a graph that goes silent about status,
gaps, or surface separation.

The cold-start suite builds every fixture in-process and covers a fresh board, a stale
committed index, a missing source, incomplete comments, split brain, a stale
review, overlapping leases, a repeated failed precondition, a free lane, a full
board, and watermark regression. Its adversarial fixtures cover a wrong lane key
set, a wrong two-product-one-workflow allocation, lane inversion in both
directions, a missing or unbacked lane source, an occupied lane without
`STARTED`, an author-reviewer collision, a stale reviewed head, a `Worker-N`
that disagrees with its Issue number in the board, the WorkItem, a review, and
the graph, blocked work offered in a candidate queue, a runnable/blocked
contradiction, an active unseated mutation, an active unseated reviewer, an
already-dispatched exact-head reviewer, duplicate-review suppression, and zero
silent omission of a live engagement. It also audits that both root instruction
files route here, that this folder hard-codes no mutable current truth, and that
the output carries no authority-bearing token.
