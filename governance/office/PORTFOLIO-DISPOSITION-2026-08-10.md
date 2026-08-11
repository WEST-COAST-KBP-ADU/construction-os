# Portfolio disposition — 2026-08-10 program reset

Status: **PROPOSED**. Historical record of the pre-reset portfolio and the
lead cleanup performed before `PROGRAM-RESET-001`.

Authority: Owner direction recorded in Issue #161 `PROGRAM-RESET-001`.
Anchor: `main@e32be9ea7cb265f6c6c0a65002a59bfe1419916c`.

This record is a **frozen historical snapshot**. It is not the live board; the
live board is `STATE.md`. The inventories below are not rewritten by later
activity.

## 1. Inventories

| Point in time | Open PRs | Open Issues |
| :--- | ---: | ---: |
| Before reset | **13** | **28** |
| After Issue #161 creation | **13** | **29** |
| After lead cleanup | **3** | **6** |

Arithmetic reconciliation: 13 − 10 PRs closed = 3. 29 − 23 Issues closed = 6.

> **Forward note, not a rewrite.** Read-only Issue #162
> `RELEASE1-EVIDENCE-001` was created after this snapshot, moving the live count
> to 3 open PRs / 7 open Issues. The historical 3/6 figures above stand as
> recorded. See `STATE.md` for live counts.

## 2. Pre-reset state at the same `main`

- 13 open PRs; 28 open Issues.
- `governance/office/OPERATING-MODEL-v4.md` assigned the lead role to
  Claude/Opus 5, conflicting with the Owner decision recorded in Issue #161.
- `governance/office/STATE.md` was synchronized to `main@c9ea40a` and claimed
  19 Issues / 10 PRs — stale against actual live state.
- Three overlapping Studio PRs: #156, #157, #159.
- Issue #59 was a historical journal rather than a bounded current queue.
- Issue #160 was not dispatchable and carries PROGRAM HOLD comment
  `5248194014`.

## 3. PRs closed without merge

All ten were closed **without merge**, with disposition recorded on each PR.
Verified independently at this anchor: none of the ten heads is an ancestor of
`origin/main@e32be9ea7cb265f6c6c0a65002a59bfe1419916c`. The same check
correctly identifies merged PRs #150 and #146 as ancestors, so the method
distinguishes merged from unmerged rather than reporting a uniform result.

### Superseded

| PR | Title | Exact head | Head branch |
| :--- | :--- | :--- | :--- |
| #159 | Studio: exact A600 Architectural Instrument | `d3885ff7ef6f6a32666b1360581ce17c05d7c192` | `agent/studio-architectural-instrument-001` |
| #156 | A600-only Concept Studio interaction and image-fidelity remediation | `6a4fefbd1fcf2894e214b043d0af1c15bdefd996` | `agent/studio-precision-shell-001` |
| #157 | STUDIO-PRECISION-STAGE-001: align matched render stage | `692ab6f2c101e69c3b00713b2fe6a00925af9d9e` | `agent/studio-precision-stage-001` |
| #129 | governance: second registry synchronization at `main@7cd7e2d` | `10e9bb1bc92b99c8c63901b63e77251be7172dae` | `claude/adu-team-leader-setup-e2wqz6` |

#156, #157, and #159 were the three overlapping Studio PRs. They contended for
the same Studio domain, which the concurrency contract in
`OPERATING-MODEL-v5.md` §8 now forbids.

### Archived evidence

| PR | Title | Exact head | Head branch |
| :--- | :--- | :--- | :--- |
| #61 | docs(research): close primary ADU verification in egress-capable lane | `3313ca474b306e67b58f4963db5e085e1c2a88c1` | `research/preapproved-adu-primary-verification-lane-a-v1` |
| #54 | RESEARCH-002: primary verification of pre-approved ADU plans | `f98f94645023e2ddd15e7189bb0143ceafe1eeb1` | `research/preapproved-adu-primary-verification-v1` |
| #52 | RESEARCH-001: official pre-approved ADU plan catalog | `66dd0018e810d6dd9acf3b957e406c68a5113c3c` | `research/preapproved-adu-plan-catalog-v1` |
| #45 | Research Gate: OpenAI Agents SDK control-plane boundary | `a2d38fa28be09433a75a29754261afaa09342517` | `agent/rp-0009-openai-agents-sdk-control-plane` |

Research output remains a proposal with zero authority until synthesized into an
Owner-adopted decision record. Closing these PRs adopted nothing.

### Stale / obsolete

| PR | Title | Exact head | Head branch |
| :--- | :--- | :--- | :--- |
| #43 | Commit review verdicts as repository artifacts (WO003 post-merge, PR #42) | `78436b1e749e6adfbc4ac140190a6d5ad2d486aa` | `claude/review-artifacts` |
| #44 | Issue WORK-ORDER-004 for RP-0008 trace closure | `e0596f2f7d6871a14e47ace81b43c85c6a144ff6` | `agent/issue-work-order-004-rp-0008-traces` |

## 4. Issues closed

**23 Issues** were closed as completed, evidence, or superseded, each with a
disposition comment recorded on the Issue itself. Those per-Issue comments are
the authoritative disposition record; this file does not restate or re-derive
them, and no Issue disposition is inferred here.

Explicitly noted:

- **#151** `SESSION-HANDOFF-20260810` was closed as completed on
  2026-08-11. It remains the source of the verified production baseline carried
  forward into `STATE.md` as a historical anchor.
- **#59** `[CONTROL] Product 2 ordered execution queue` was a historical journal
  overlapping the board rather than a bounded current queue.

## 5. Surviving open PRs — all PAUSED

| PR | Title | Exact head | Base branch | State |
| :--- | :--- | :--- | :--- | :--- |
| #84 | RECEPTION-MEMORY-004: add memory lifecycle engine | `b6b38150d868f8038d16508699527b6c5cbdd41b` | `architecture/reception-memory-slice2-policy-engine-v1` | PAUSED |
| #86 | RECEPTION-MEMORY-005: add channel-neutral orchestrator | `c0da7feb9242b8af8ddead71f150982debd5e55f` | `architecture/reception-memory-slice3-lifecycle-engine-v1` | PAUSED |
| #90 | RECEPTION-MEMORY-006: harden context activation boundary | `729d5252b62b5d1d0a136e4674e1bc66fead0f5f` | `architecture/reception-memory-slice4-orchestrator-v1` | PAUSED |

**#84 is the blocked root of the Reception stack.** Its latest exact-head review
verdict at `b6b38150d868f8038d16508699527b6c5cbdd41b` is
`BLOCKED FOR REVISION`: the engine declares 44 refusal codes and the test suite
asserts 14, leaving **30 of 44 refusal codes untested** across precisely the
consent, approval-binding, tombstone, and deletion-capability surface the engine
exists to enforce.

#86 and #90 are stacked on #84 and are **transitively paused**. No downstream
claim from either is valid until the root is re-packeted and repaired. This is
sequenced as Stage 8 in `PROGRAM-PLAN-v1.md`.

## 6. Surviving open Issues

| Issue | Title | State |
| :--- | :--- | :--- |
| #161 | `[PROGRAM-RESET-001]` Adopt no-lead-execution stage-gated operating model | **ACTIVE** |
| #160 | `PRO-VISUAL-STACK-001` install and verify professional interaction runtime | PAUSED |
| #142 | `[STUDIO-VISUAL-TRUTH-001]` Replace retrofit imagery and bind facade state to verified media | PAUSED |
| #83 | `[RECEPTION-MEMORY-004]` Slice 3 memory mutation and lifecycle engine | PAUSED |
| #85 | `[RECEPTION-MEMORY-005]` Slice 4 channel-neutral orchestrator and EN/ES/RU semantic harness | PAUSED |
| #88 | `[RECEPTION-MEMORY-006]` Close reviewed non-blocking hardening before activation | PAUSED |

Paused Issue/PR pairings: #83 ↔ #84, #85 ↔ #86, #88 ↔ #90.

#142 remains blocked on Owner media intake and publication rights; it is not
unblocked by this reset.

## 7. Statements of record

1. **No existing PR qualifies for Owner merge.** There is no Owner merge gate in
   the portfolio at this anchor.
2. **Only #161 is ACTIVE.** It is the sole mutation lane.
3. **#160, #142, #83, #85, #88 and PRs #84, #86, #90 are PAUSED.**
4. **All closed PRs were closed without merge**, verified by ancestry against
   `main@e32be9ea7cb265f6c6c0a65002a59bfe1419916c`.
5. **Branches, commits, threads, and evidence remain recoverable.** Every exact
   head above is recorded; no branch, commit, or thread was deleted or
   rewritten.
6. **No product or production bytes changed.** The lead cleanup closed and
   annotated GitHub records only. `main` is unchanged at
   `e32be9ea7cb265f6c6c0a65002a59bfe1419916c`, and no deployment was triggered.
7. **No implementation worker was authorized** by this cleanup.
