# TASK-0007: Visual identity pass v1

- **Status:** approved
- **Date approved:** 2026-08-03
- **Approved by:** owner (directive: «начать нужно с визуала»)
- **Related:** DR-0008 (adopted), blueprint §9, RP-0004

## Objective

Give the existing one-page preview a real visual identity: design tokens,
typography, layout system, motion — the blueprint §9 quality bar — without
changing what the site claims or collects (still zero capture).

## In scope

- Design tokens in one place (CSS variables / Tailwind config): palette,
  type scale, spacing, radii, shadows. RP-0004's proposal (deep forest green +
  gold, DM Sans/Inter) is **input, not a decision** — builder presents the
  applied result; owner accepts or redirects.
- Restyle existing components (`src/components/*`) on those tokens; mobile-first.
- Motion: subtle, performance-safe (no layout shift).
- Placeholder imagery clearly labeled as placeholder — no stock passed off as
  real projects (real photos are a missing owner input).
- Accessibility AA; Core Web Vitals green (LCP < 2.5s, CLS < 0.1).

## Out of scope / prohibited

- New copy or claims; new routes; forms; fonts loaded from third-party
  origins at runtime (self-host); analytics; vendor accounts.

## Acceptance criteria

- All colors/type/spacing flow from tokens; no hard-coded values in components.
- Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95 on the deployed
  preview; CLS < 0.1.
- `npm run lint` and `npm run build` green. Draft PR with before/after
  screenshots for owner review.

## Evidence plan

RUN-0007: timestamp, event type, accept/reject, Lighthouse scores as latency
markers, sanitized summary.

## Boundary check

- [ ] Work stays inside BOUNDARIES.md
- [ ] No provider configuration or external action
- [ ] Evidence plan uses only whitelisted lab-safe fields
