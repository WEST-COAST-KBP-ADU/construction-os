@AGENTS.md

# Construction OS — operating contract for every AI session

This file loads in every session. Read it before proposing or writing anything.
Chat, terminal output, and model memory are not durable state.

## Authority

- Owner `avoroncov971-maker` alone adopts material decisions, accepts
  professional and legal risk, authorizes production promotion, and merges.
- No session approves, certifies, or merges its own work.
- Connector, credential, or write access grants no authority.

## Cold start — read this first

**[`governance/memory/SESSION-START.md`](governance/memory/SESSION-START.md) is
the first repository-specific document you read.** It is the one canonical entry
point, and it works from any repository-attached checkout — a cloud session with
this repository attached, or a lead engagement with the GitHub repository
connected. It never requires a particular machine, a named local clone, or a
manual worktree.

It carries the stable system understanding — Owner, roles, the Product 2 /
Product 1 boundary, the truth ranking — by pointing at the records that govern
each, and it carries no current packet, SHA, queue position, or board occupancy.
Everything mutable is rehydrated from live GitHub into a deterministic
`COLD_START_RESULT/v1`: the exact current `mainSha`, the live queue, the Owner
gate, the latest exact-head review, the `M1`/`M2`/`R1` board, the discrepancies
against the committed index, exactly one next executable action, and every named
gap. See `governance/memory/README.md` for the rebuild command.

The read order below is what that entry routes you through. Follow it after the
cold start, not instead of it.

## Read order for a fresh session

1. `governance/BOUNDARIES.md` — hard limits. Binding, non-negotiable.
2. `governance/office/OPERATING-MODEL-v5.md` — current roles, lanes, and loop.
3. `governance/office/PROGRAM-PLAN-v1.md` — current stages, gates, and the
   physically coherent professional visual production contract.
4. `governance/office/STATE.md` — queue index.
5. `governance/sops/SOP-0001-dual-lane-github-coordination.md` — Issue state protocol.
6. Open GitHub Issues and Draft PRs — live dispatch state.

`governance/office/OPERATING-MODEL-v4.md` and every earlier version are
**historical only**. v4's assignment of operational lead to the Claude lane is
terminated by v5 §1 and must not be adopted as current by any session.

Merged `main`, verified GitHub state, and verified execution output are truth.
`STATE.md` is an index of that truth, never a substitute for it. When a
committed record and an Issue disagree, the committed record wins and the
divergence is reported, not silently resolved.

## Hard stops

The full list is in `governance/BOUNDARIES.md` and binds every session. Without
an owner-approved packet, never: persist PII; state pricing, permit, zoning,
buildability, or legal conclusions; send client-facing messages; create CRM,
calendar, or Workspace records; trigger external business effects; configure
voice, telephony, or model providers; or place AI in the visitor decision path.

Any uncertain GIS, jurisdiction, or feasibility output must carry:
`Requires official source verification.`

## Change discipline

One packet = one bounded outcome = one branch = one Draft PR = one declared
file allowlist. Do not expand scope inside execution or review; new work becomes
a new packet. Blocked work stops at the exact failed precondition or command,
preserves completed work, and reports the smallest missing fact — it does not
guess, descope silently, or substitute local behavior for deployed evidence.

Claims require artifacts: exact SHA, test output, CI result, screenshot,
measurement, or official source. A green check is evidence, not approval.

## Verification

```bash
npm test        # vitest
npm run lint    # eslint
npm run build   # next build --webpack
```

Deployed behavior on the canonical domain is separate evidence. A successful
Vercel build does not prove the owner-visible domain serves those bytes.
