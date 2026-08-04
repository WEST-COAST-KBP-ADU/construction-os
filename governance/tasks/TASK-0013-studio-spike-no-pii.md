# TASK-0013: Concept studio spike — no PII, no capture, 2D-first

- **Status:** in_progress
- **Date approved:** 2026-08-04
- **Approved by:** owner (directive: technical part and visual first, landing
  pages last)
- **Related:** REVIEW-0001 §3.3/§5, roadmap Phase 2, DR-0013 (demo posture —
  this task is compatible with it: nothing here captures anything)

## Objective

Prove the "technical wow" on `/studio` with zero PII and zero capture: a
synthetic sample property, a small curated ADU concept catalog, deterministic
configuration, and a 2D/pre-rendered visual experience. 3D is NOT in scope
until 2D is proven insufficient (REVIEW-0001 §3.3).

## In scope

- `/studio` route: visitor explores a curated ADU concept on a synthetic
  sample property (no address entry — the address field does not exist).
- Curated catalog v0: 2–3 archetypes × size band, layout family, exterior
  (stucco/siding), material/color palette, roof, windows, interior package.
  Versioned typed JSON; every asset's license recorded.
- Deterministic configuration schema + content hash: same selections, same
  catalog version → identical artifact. Replay test proves it.
- Option-compatibility rules as data, not code branches.
- 2D/pre-rendered variant swaps (layered images or server-rendered stills).
  Lazy-loaded client island; the current photography stays the LCP surface.
- Scenario comparison (2–3 side-by-side candidates) + stable config summary.
- "Conceptual — not a completed West Coast KBP project" labeling throughout.
- Accessibility AA; mobile is a designed experience, not a shrunk desktop.

## Out of scope / prohibited

- Address entry, GIS calls, any form, any capture, any contact surface
  (DR-0013 demo posture stands).
- 3D/WebGL dependencies (needs its own decision after 2D evidence).
- AI anywhere in the visitor path; generated imagery presented as real work.
- Pricing of any kind.

## Acceptance criteria

- Same input + catalog version → byte-identical config artifact (test).
- Mobile p75: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 on deployed preview; numbers
  in the PR.
- Zero network egress beyond first-party (test or HAR evidence in PR).
- Golden screenshots, mobile + desktop, in PR.
- lint/build/test green. One draft PR.

## Evidence plan

RUN-0013: timestamp, event type, accept/reject, latency markers, sanitized
summary.

## Boundary check

- [ ] No PII, no capture, no contact surface
- [ ] No vendor/dependency added without listing why in the PR
- [ ] Evidence plan uses only whitelisted lab-safe fields
