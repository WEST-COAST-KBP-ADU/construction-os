@AGENTS.md

# Construction OS — operating contract for every AI session

This file loads in every session. Read it before proposing or writing anything.
Chat, terminal output, and model memory are not durable state.

## Authority

- Owner `avoroncov971-maker` alone adopts material decisions, accepts
  professional and legal risk, authorizes production promotion, and merges.
- No session approves, certifies, or merges its own work.
- Connector, credential, or write access grants no authority.

## Read order for a fresh session

1. `governance/BOUNDARIES.md` — hard limits. Binding, non-negotiable.
2. `governance/office/OPERATING-MODEL-v4.md` — current roles, lanes, and loop.
3. `governance/office/STATE.md` — queue index.
4. `governance/sops/SOP-0001-dual-lane-github-coordination.md` — Issue state protocol.
5. Open GitHub Issues and Draft PRs — live dispatch state.

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
