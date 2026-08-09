# Operating Model v4 — Claude lead, parallel Codex execution

Status: **PROPOSED**. Becomes operative only if the Owner merges this record.
Nothing in this file is adopted by its own presence on a branch.

Supersedes: `OPERATING-MODEL-v3.md`.
Consolidates: Issue #112 `OPERATING-MODEL-004`, adopted by the Owner on
2026-08-08, which was never committed to the repository.
Base: `main@4bb02f3`.

## 1. Why this record exists

Three operating shapes were live at once: `OPERATING-MODEL-v3` committed here
(ChatGPT lead, Claude default reviewer), `SOP-0001` at status `proposed`, and
Issue #112 adopted by the Owner but present only as Issue text. The repository
rule is that committed bytes are truth, so the committed model and the practised
model disagreed by construction.

The Owner has directed that the Claude lane hold operational lead and that Codex
serve as the primary execution lane, running two to three sessions in parallel.
This record commits that shape and retires the ambiguity.

## 2. Roles

| Role | Holds | Cannot |
| :--- | :---- | :----- |
| **Owner — Tony (`avoroncov971-maker`)** | Principal and architecture decisions, phase opening, budget, business facts, professional and legal risk, production promotion, and merge. | Delegate final adoption or merge by implication. Silence is not approval. |
| **Team lead — Claude (Opus 5)** | Live SourceTrue verification, critical-path selection, decomposition into bounded packets, lane assignment and deconfliction, queue and index maintenance, evidence reconciliation, Owner-gate preparation, and continuous forward motion until an Owner-only gate. | Merge, approve or certify its own work, waive a boundary, adopt a decision, or expand a packet mid-execution. |
| **Executor — Codex sessions (up to three concurrent)** | Implementation of exactly one issued packet per session: repository code, docs, tests, validators, and build evidence, in one branch and one Draft PR. | Expand scope, merge, mark Ready, self-review, or act outside the issued packet. |
| **Independent reviewer — non-author lane** | Read-only adversarial review at one exact head SHA, with one SHA-pinned verdict. | Edit the reviewed head, approve, merge, or treat green CI as acceptance. |
| **Fable 5 — decision fork** | Independent adversarial advice at forks affecting product architecture, trust boundaries, public claims, irreversible product identity, or multiple downstream packets. | Adopt, implement, or merge anything. Its finding informs the Owner; it does not decide. |

Each engagement declares exactly one role. A lane that authored or repaired the
bytes cannot review them at that head SHA.

Lane identity is recorded as the declared engagement plus the model that
actually ran. Roles are engagement-scoped, not model-scoped: when two lanes run
the same model family, they remain distinct engagements in distinct sessions,
and a fork or review engagement never runs in the session that authored or led
the bytes it examines. Records never collapse two engagements into one — that
would make the author-never-reviews-itself rule unverifiable.

## 3. Model assignment

| Lane | Model | Reason |
| :--- | :---- | :----- |
| Team lead | Fable 5 (Owner-directed 2026-08-09); Opus 5 when Fable 5 is unavailable | Decomposition, cross-record contradiction detection, and gate preparation are the reasoning-heavy surfaces. |
| Executor | Codex, highest available reasoning tier for implementation packets | Packets are bounded but correctness-critical; a cheaper tier moves cost from execution to review and remediation. |
| Executor, mechanical packets | Codex, fast tier | Renames, moves, formatting, and other packets with no design judgement. |
| Independent reviewer | The lane that did not author the bytes | Separation of authorship is the control; model tier is secondary to it. |
| Decision fork | Fable 5, in a separate session that did not author or lead the bytes | Reserved for adversarial advice at Owner-facing forks. |

## 4. Controlled loop

1. The Owner opens a phase or makes a principal decision when one is required.
2. The lead verifies live state and writes one bounded packet with a pinned base
   SHA, a write allowlist, verification, non-goals, and stop conditions.
3. The assigned executor executes exactly that packet in one branch and opens
   one Draft PR.
4. A non-author lane reviews the exact head SHA and records one terminal
   verdict. A new commit invalidates the verdict.
5. The lead assembles one Owner gate: decision requested, evidence, residual
   risk, and reversibility.
6. The Owner alone merges. Merge to `main` is production-release authorization
   wherever auto-deploy applies.
7. The lead refreshes the queue index and issues the next packet.

## 5. Concurrency contract

1. Up to three executor slots may run at once.
2. Parallel packets are permitted only when their write scopes and authoritative
   outputs are disjoint. No two lanes write one file domain concurrently.
3. The reviewer may always run concurrently, because it is read-only.
4. Each mutation uses one packet, one branch, one Draft PR, one exact base, and
   one declared file allowlist.
5. Parallel branches merge serially. Base drift requires re-verification;
   changed reviewed bytes require a new review.
6. Record numbers are allocated against merged `main` and open PRs before use.
7. Research and design outputs remain proposals until an Owner gate is recorded.
8. Product 1, `kbp-core`, `kbp-dev-office`, and Deedseal remain outside these
   packets unless the Owner explicitly opens that boundary.

## 6. Speed rules

- Keep executor slots filled with non-overlapping critical-path work whenever
  useful work exists.
- A blocked mutation lane converts immediately to research, test design, or
  artifact preparation that preserves the blocking decision.
- Do not idle waiting on one executor when another bounded packet can advance.
- Do not stack unreviewed mutation trains merely to keep a slot busy. Depth of
  unreviewed work is a debt, not throughput.
- Escalate to the Owner only for decisions that are genuinely the Owner's.
  Escalating an engineering choice is a delay, not a control.

## 7. Evidence

Claims require artifacts: exact SHA, test output, CI result, screenshot,
measurement, or official source. Local or preview results are not canonical
domain evidence. A green check is evidence, not approval. GitHub Issues, PRs,
committed records, and verified execution output are SourceTrue; chat is not.

Blocked work stops at the exact failed precondition or command, preserves
completed work, and reports the smallest missing fact or Owner-only action.

## 8. Standing boundaries

`governance/BOUNDARIES.md` and adopted decision records remain binding and are
unchanged by this record. This operating model opens no product, architecture,
production, credential, access-control, or spending decision. It changes
execution coordination only.
