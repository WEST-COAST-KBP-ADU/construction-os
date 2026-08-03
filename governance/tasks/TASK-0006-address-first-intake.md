# TASK-0006: Address-first intake surface (funnel Tier 1)

- **Status:** draft — awaiting owner review
- **Date approved:** —
- **Approved by:** —
- **Related:** DR-0011 (proposed, blocking), DR-0008 (proposed, blocking),
  DR-0004, DR-0006, `architecture/portal-blueprint-v0.1.md` §§1–4

## Objective

Turn the public site from zero-capture into a working Tier 1 entry point: a
visitor enters a property address and what they want built, and the owner
receives a candidate lead. Nothing is stored by the platform, nothing is
promised to the visitor, and no AI sits in the request path.

## Blocking gates (this packet cannot start until both clear)

1. DR-0008 adopted — the blueprint is the build plan.
2. DR-0011 adopted with a destination chosen — otherwise there is nowhere for a
   lead to go that does not violate DR-0004.

## In scope

- `app/` — one intake route and its page section (address + project type +
  contact handle, one question at a time per BOUNDARIES.md).
- `src/lib/` — intake payload schema and validator; separate whitelist type for
  the evidence event; the forwarder behind an interface with no vendor bound.
- `src/components/` — the intake surface, replacing the inert hero CTA.
- `src/lib/siteConfig.ts` — the preview-scope notice is rewritten to describe
  what is actually true once capture exists. It must not overstate.
- Registry updates and `RUN-0006`.

## Out of scope / prohibited

- Any feasibility, buildability, zoning, permit, cost, or timeline output.
  Tier 1 captures; it does not screen. The blueprint's "screening summary"
  wording requires property data the platform does not have and conclusions
  BOUNDARIES.md forbids.
- Any AI call in the request path.
- Any persistence of the payload: no database, no file, no log field outside
  the BOUNDARIES.md whitelist.
- Provider or vendor configuration, analytics tags, pixels, calendar booking,
  CRM writes, email sending as an authorized production action (each is
  `external_io` and needs its own packet).
- Tier 2 (email gate) and Tier 3 (calendar) — separate packets.
- Visual design decisions — still a separate phase.

## Acceptance criteria

- A visitor can submit address + project type + one contact handle, and the
  owner receives it at the DR-0011 destination.
- Invalid or incomplete submissions fail closed with an honest message; no
  partial forward.
- The evidence event is constructed from the whitelist type, and a test proves
  a payload field cannot reach it even when the schema grows.
- No PII appears in any log, build artifact, or committed file — checked, not
  assumed.
- Every visitor-facing string carries no price, schedule, or code conclusion.
- `npm run lint` and `npm run build` green; deployed preview reviewed by the
  owner before promotion.

## Evidence plan

RUN-0006: timestamp, event type, accept/reject result, latency marker, error
class, sanitized non-PII summary. Nothing else.

## Boundary check

- [ ] Work stays inside BOUNDARIES.md
- [ ] No provider configuration or external action unless explicitly listed in scope
- [ ] Evidence plan uses only whitelisted lab-safe fields
- [ ] No feasibility, cost, zoning, or timeline conclusion reaches a visitor
