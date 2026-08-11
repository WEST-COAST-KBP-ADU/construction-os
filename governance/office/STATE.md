# STATE — live board

Owner of this file: the ChatGPT Lead control plane under
`OPERATING-MODEL-v5.md`. Merged `main` and verified GitHub state are the only
truth; this board is an index of them, never a substitute.

Synchronized: **2026-08-11** from `main@e32be9ea7cb265f6c6c0a65002a59bfe1419916c`,
against **3 open PRs / 7 open Issues** read from GitHub at that anchor.

This board carries current state only. Historical narrative lives in
`PORTFOLIO-DISPOSITION-2026-08-10.md` and is not restored here.

## Current stage

**`G0` / `PROGRAM-RESET-001`** — Issue #161.

Program stages and gates: `PROGRAM-PLAN-v1.md`. No stage beyond `G0` is open.

## Production anchor

**Verified historical baseline — valid until rechecked, not current evidence.**
Recorded from Issue #151 on 2026-08-10.

| Field | Value |
| :--- | :--- |
| Git binding | `main@e32be9ea7cb265f6c6c0a65002a59bfe1419916c` |
| Canonical Vercel project | `west-coast-kbp-platform-preview` / `prj_4InNL4BjzDO2aYzCBVKx1NBxpRFL` |
| Production deployment | `dpl_Dxayq9inhpHZUFeq1ianCRQF7hCm` |
| State / target | `READY` / `production` |
| Production alias | https://www.westcoastkbp.com |
| Route smoke at that deployment | `/`, `/models`, `/studio`, `/process`, `/service-areas`, `/about` each returned HTTP 200 |

This anchor is **not** re-verified by the current packet. A docs-only diff
produces no browser or runtime evidence. Recheck before relying on it.

## Active queue

| Issue | Packet | Lane | State |
| :--- | :--- | :--- | :--- |
| #161 | `PROGRAM-RESET-001` | mutation — sole authorized | ACTIVE |

**#161 is the only active mutation packet.** No other implementation worker is
authorized until `G0` is reviewed and merged.

## Paused dependencies

| Issue | PR | Pause reason |
| :--- | :--- | :--- |
| #160 | — | `PRO-VISUAL-STACK-001` not dispatchable; PROGRAM HOLD comment `5248194014` |
| #142 | — | `STUDIO-VISUAL-TRUTH-001` blocked on Owner media intake and publication rights |
| #83 | #84 | Blocked root of the Reception stack — latest exact-head review `BLOCKED FOR REVISION`, 30 of 44 refusal codes untested at `b6b38150d868f8038d16508699527b6c5cbdd41b` |
| #85 | #86 | Transitively paused on #84, at `c0da7feb9242b8af8ddead71f150982debd5e55f` |
| #88 | #90 | Transitively paused on #84, at `729d5252b62b5d1d0a136e4674e1bc66fead0f5f` |

Do not merge, mark Ready, repair, rebase, or stack new work on any paused
Issue or PR. Re-entry is sequenced as Stage 8 in `PROGRAM-PLAN-v1.md`.

## Live lanes

`DISPATCH` is not `STARTED`. **No lane is `STARTED` until that lane has posted
terminal evidence — real session, clone, branch, and exact base — to its own
Issue.** A lane with no posted evidence is not running, whatever any chat or
window suggests.

| Lane | Packet | Model | Authority | State |
| :--- | :--- | :--- | :--- | :--- |
| Mutation 1 | #161 `PROGRAM-RESET-001` | `claude-opus-5` | four-path governance lease | `STARTED` — evidence posted to #161 |
| Mutation 2 | — | — | — | not authorized |
| Read-only evidence | #162 `RELEASE1-EVIDENCE-001` | `claude-opus-5` | no file or domain lease | authorized, read-only |
| Independent review | — | Codex Pro, non-author | read-only at an exact head | arms at #161 `RESULT` |

Lane 1 holds an exclusive lease on exactly four paths:
`governance/office/OPERATING-MODEL-v5.md`, `PROGRAM-PLAN-v1.md`,
`PORTFOLIO-DISPOSITION-2026-08-10.md`, `STATE.md`.

#162 owns no file domain and cannot overlap that lease. It may write only
`STARTED`/`RESULT` comments in its own Issue, and may not modify repository
bytes, branch, commit, push, open a PR, implement, install, or deploy.

## Owner gate

**None open.** No PR qualifies for Owner merge at this anchor.

## Next gate

`#161` exact-head `RESULT` → independent **Codex Pro** review at that exact
SHA → **Tony merge**.

The author of the result cannot review, accept, certify, or merge it. A new
commit invalidates any earlier verdict.

## WIP rules

- Normal mode: maximum two mutation workers plus one read-only reviewer.
- Hard maximum three mutation lanes, only with completely disjoint file domains.
- Exclusive single-writer domains: package manifests and lockfile; global
  CSS/tokens; shared layout/navigation; schemas/catalog; deployment
  configuration; shared Studio components.
- No more than two PRs waiting for review.
- Zero dependent packets on an unmerged predecessor.
- One active visual release wave; one integration candidate.
- Merges serialized; remaining heads rechecked for base drift after every merge.

## Non-interpretation rules

- A worker packet is closed-world authorization. The executor must not
  reinterpret ambiguous intent; invent a missing product decision, source,
  asset, geometry, interaction, visual reference, quality target, dependency, or
  acceptance rule; substitute a lower-quality surrogate; or widen the allowlist.
  Any missing or conflicting material precondition requires a fail-closed
  `BLOCKED` result before implementation proceeds.
- ChatGPT Lead is a control-plane role only and authors no repository byte. It
  cannot become the fallback executor when a worker blocks.
- Open delegation — `smallest suitable module`, `relevant docs`, `make it
  premium`, `use the best asset` — is prohibited in a packet.
- Blocked work stops at the exact failed precondition, preserves completed work,
  and reports the smallest missing fact.

## Deployment checks

- **Canonical:** `Vercel – west-coast-kbp-platform-preview`. This is the only
  check that counts as build evidence.
- **Known noncanonical:** `Vercel – nextjs-boilerplate`, a Hobby-team status.
  Its state is not evidence in either direction, red or green.
- A green canonical check is build evidence, not approval, and does not prove
  the owner-visible domain serves those bytes. Production verification is a
  separate step after the Owner's merge.

## Standing constraints

- One packet = one bounded outcome = one branch = one Draft PR = one declared
  file allowlist.
- `governance/BOUNDARIES.md` binds every lane and is unchanged by this reset.
- Product 1, `kbp-core`, `kbp-dev-office`, and Deedseal remain outside these
  packets unless the Owner explicitly opens that boundary.
- The Owner alone adopts, approves, merges, and authorizes production.
