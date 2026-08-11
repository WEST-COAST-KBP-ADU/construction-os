# SESSION-START — canonical cold start

This is the first repository-specific document a fresh session reads. It exists
so that a session with no chat history can reconstruct the authoritative system
state, the exact stopping point, and the operating board from merged repository
bytes plus live GitHub evidence.

It is deliberately **stable**. It carries no current packet, no current SHA, no
queue position, and no board occupancy. Everything mutable is reconstructed by
running the hydration below against live GitHub. If this file ever appears to
tell you what is currently active, that is a defect — re-read from GitHub.

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
| ChatGPT Lead is a control-plane role and authors no repository byte, and never becomes the fallback executor. | [`../office/OPERATING-MODEL-v5.md`](../office/OPERATING-MODEL-v5.md) §2, §4 |
| Workers are bounded executors: one packet, one branch, one Draft PR, one declared allowlist. | [`../office/OPERATING-MODEL-v5.md`](../office/OPERATING-MODEL-v5.md) §2 |
| An author never reviews, accepts, certifies, or merges its own head. Roles are scoped to the engagement, not the model. | [`../office/OPERATING-MODEL-v5.md`](../office/OPERATING-MODEL-v5.md) §3 |
| Product 2 is this repository, `WEST-COAST-KBP-ADU/construction-os` — the West Coast KBP ADU customer platform. | [`../README.md`](../README.md), [`../charter.md`](../charter.md) |
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
3. `STATE.md` — as a possibly stale index only.
4. Live `main` and its exact current SHA.
5. Every open Issue: body, **every** comment, labels, and linked pull requests.
6. Every open pull request: metadata, exact head SHA, draft status, checks, reviews, and comments.
7. Merge records and any production-verification evidence for recently merged work.

Record for every source: its URL, an immutable SHA, the observation time,
whether the read was complete, and each named gap. Those five fields are what
make the result auditable; a source without them cannot support a decision.

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
state, worker and session, branch, pull request and head where present, domain
lease, blockers and required clearing evidence; the Owner gate; the latest
exact-head review; merge and production-verification state; the discrepancies
between `STATE.md`, labels and Project fields, Issues and pull requests, and
live `main`; the three-slot board; exactly one next executable control-plane
action; and every named gap.

The builder consumes the engineering graph rather than duplicating it: it runs
[`../../tools/memory/build-graph.mjs`](../../tools/memory/build-graph.mjs) over the
same frozen observation and carries that projection's canonical heads, invalid
reviews, unresolved blockers, runnable work, named gaps, and split-brain report
into its own output. There is one engineering-fact hierarchy, not two.

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
| Incomplete GitHub data under an occupied slot or an open gate | `COLD004_INCOMPLETE_SOURCE` |
| More or fewer than the three logical slots | `COLD005_SLOT_CARDINALITY` |
| An occupied mutation slot with no persisted `STARTED` evidence | `COLD006_SLOT_WITHOUT_STARTED` |
| Two mutation slots sharing a domain lease or an allowlisted path | `COLD007_DOMAIN_LEASE_CONFLICT` |
| A reviewer engagement that authored the head it reviews | `COLD008_REVIEWER_AUTHORED_HEAD` |
| A verdict bound to anything other than the current exact head | `COLD009_STALE_EXACT_HEAD_REVIEW` |
| Two live records claiming one WorkItem at different heads | `COLD010_CONFLICTING_ACTIVE_HEADS` |
| A source watermark that regresses | `COLD011_WATERMARK_REGRESSION` |
| Output that would read as approval, acceptance, or a worker launch | `COLD012_AUTHORITY_BEARING_OUTPUT` |

Missing evidence is named, never inferred. A missing fact is reported as a gap
with the exact record that would close it.

## 4. The canonical three-slot board

The result always carries exactly these three logical slots:

| Slot | Kind | Holds |
| :--- | :--- | :--- |
| `M1` | mutation worker 1 | one bounded packet, one branch, one Draft PR, one allowlist |
| `M2` | mutation worker 2 | the same, under a **disjoint** allowlist and domain lease |
| `R1` | independent reviewer | one read-only adversarial review at one exact head |

Rules, all enforced by the builder:

- Normal mode permits at most **two** mutation engagements and exactly **one**
  read-only reviewer. There is no third mutation slot.
- An occupied mutation slot requires persisted `STARTED` evidence and a session
  identity. `DISPATCH` is not `STARTED`; a closed window is not a result.
- Two occupied mutation slots require disjoint allowlists **and** disjoint
  domain leases.
- `R1` may review only an exact head it did not author, and only while that head
  is current. A new commit invalidates every earlier verdict immediately.
- A free slot is **explicit**, carries a stated reason, and is never silently
  filled.
- Nothing in this repository launches a worker. Comments, labels, the Issue
  Form, the Project, and Actions all launch nothing. Tony manually opens each
  engagement. See [`../control-plane/README.md`](../control-plane/README.md) §3.

### Refill loop

```text
hydrate -> reconcile -> allocate M1/M2 -> collect RESULT -> allocate R1
-> exact-head verdict -> Owner gate -> Owner merge -> verify -> cleanup -> refill
```

The loop is continuous: a slot released by a merge, a blocker, or a terminal
`RESULT` is refilled only from a re-hydrated board, never from memory of what was
running before.

### The one next action

The result names exactly one next executable control-plane action, chosen by a
fixed precedence and tie-broken by lowest Issue number, so two sessions reading
the same evidence choose the same step:

1. `ASSEMBLE_OWNER_GATE` — a non-author verdict is bound to the current exact head.
2. `REQUEST_INDEPENDENT_REVIEW` — a `RESULT` exists with no current non-author verdict and `R1` is free.
3. `PUBLISH_DISPATCH_FOR_MANUAL_OWNER_LAUNCH` — a mutation slot is free and a ready packet holds a disjoint lease.
4. `AWAIT_ACTIVE_SLOT_RESULT` — no slot can be refilled until an occupied one reports.
5. `RECONCILE_STALE_STATE_INDEX` — nothing else is executable and the committed index has drifted.
6. `NAMED_GAP_BLOCKS_ACTION` — nothing is executable; the blocking gaps are named.

Every action is a preparation step for a human. None approves, accepts, merges,
or launches anything.

## 5. Verification

```bash
node --test tools/memory/build-graph.test.mjs tools/memory/build-session-start.test.mjs
```

The suite builds every fixture in-process and covers a fresh board, a stale
committed index, a missing source, incomplete comments, split brain, a stale
review, overlapping leases, a repeated failed precondition, a free slot, a full
board, and watermark regression. It also audits that both root instruction files
route here, that this folder hard-codes no mutable current truth, and that the
output carries no authority-bearing token.
