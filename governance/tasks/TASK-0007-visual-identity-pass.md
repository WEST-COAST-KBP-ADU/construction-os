# TASK-0007: Land the portal design foundation (supersedes the from-scratch plan)

- **Status:** approved
- **Date approved:** 2026-08-03
- **Approved by:** owner
- **Related:** DR-0008 (adopted), blueprint §9, TASK-0006A, RP-0004

## Why this packet changed

The original packet said "build a visual identity from scratch." Audit of the
repository found that work already exists, unmerged, on branch
`feature/task-0006a-production-grade-portal-foundation-v0.1` (TASK-0006A):
a token layer in `app/globals.css` (palette, radii, shadows, dark mode) and a
component system (`PortalSection`, `PortalCard`, `StatusBadge`,
`ProjectObjectCard`, `PropertyScreeningPreview`, `EvidenceStrip`,
`ControlPanelPreview`, `NextActionBlock`). 28 files, 1 commit, one commit
behind `main` at audit time.

Rebuilding that is waste. **This packet is now: rebase, harden, and land that
branch.** Do not start a parallel homepage.

## In scope

1. Rebase `feature/task-0006a-production-grade-portal-foundation-v0.1` onto
   current `main`. Resolve conflicts in favor of `main` for anything under
   `governance/`, in favor of the branch for anything under `app/`, `src/`.
2. Audit every visitor-facing string on the branch against `BOUNDARIES.md`.
   Delete or reword anything that promises price or schedule, implies a permit /
   zoning / buildability conclusion, publishes an unsupplied credential, or
   presents placeholder imagery as a real project. Sample project objects must
   be visibly labeled as samples.
3. `PropertyScreeningPreview` must be static and inert — no address input, no
   form, no submit, no state that captures anything. Address capture is blocked
   by DR-0011 and DR-0012. If the branch contains a working input, strip it to
   a static preview.
4. Structural check: no component contains a hard-coded color, font size, or
   spacing value. Everything resolves through the token layer. Fix what does not.
5. Self-host any font. No third-party origin loaded at runtime.
6. Accessibility AA: focus states, contrast, semantics, keyboard order.

## Out of scope / prohibited

New routes (that is TASK-0008), any form or capture, analytics, vendors,
pricing content, credentials, real project facts.

## Acceptance criteria

- Branch rebased on `main`, conflicts resolved, history clean.
- `npm run lint`, `npm run build`, `npm test` all green.
- Deployed Vercel preview: Lighthouse mobile Performance ≥ 90,
  Accessibility ≥ 95, LCP < 2.5s, CLS < 0.1. Paste the numbers in the PR.
- Before/after screenshots in the PR, mobile and desktop.
- A line-by-line statement in the PR of every string you changed for boundary
  reasons, and why.
- No input element anywhere that accepts visitor data.

## Evidence plan

RUN-0007: timestamp, event type, accept/reject result, Lighthouse scores as
latency markers, sanitized non-PII summary.

## Note on numbering

`TASK-0006A` (that branch's own packet) and `TASK-0006` (Tier 1 intake, draft,
blocked) are different records. Do not merge or renumber them.

## Boundary check

- [ ] Work stays inside BOUNDARIES.md
- [ ] No provider configuration or external action
- [ ] No visitor data capture introduced
- [ ] Evidence plan uses only whitelisted lab-safe fields
