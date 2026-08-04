# TASK-0006A: Production-Grade Portal Design Foundation v0.1

- **Status:** done
- **Date approved:** 2026-07-04
- **Approved by:** owner
- **Related:** DR-0008, TASK-0005, governance/BOUNDARIES.md

## Objective

Create the first high-end, production-grade visual foundation for the West
Coast KBP Construction OS public portal.

## In scope

- UI-only public homepage work in the Next.js app.
- Global design foundation:
  - typography scale
  - spacing rhythm
  - color tokens
  - surface/card system
  - border/shadow system
  - button styles
  - status badge styles
  - responsive container system
  - clear focus and hover states
- Homepage public portal surface:
  - top navigation with working in-page anchors only
  - premium hero
  - operations cockpit visual preview
  - service lanes
  - project control preview
  - active project object preview using fake/sanitized sample objects
  - property screening preview as static controlled preview only
  - GC / Partner coordination lane
  - voice front door preview, clearly not live
  - final CTA using only working in-page anchors
- Reusable components:
  - `PortalSection`
  - `PortalCard`
  - `StatusBadge`
  - `ProjectObjectCard`
  - `ControlPanelPreview`
  - `EvidenceStrip`
  - `NextActionBlock`
  - `ModulePreviewCard`

## Out of scope / prohibited

- KBP Core changes.
- Open PR #4 / private voice lab SIP webhook work.
- Vercel configuration or manual deployment.
- Backend, auth, database, live forms, tracking, analytics, CRM, or provider
  work.
- Google Workspace writes.
- GIS API, phone routing, SIP, Telnyx, Twilio, or OpenAI Realtime
  configuration.
- Real project data, client names, addresses, photos, costs, schedules,
  permits, or documents.
- Fake login, fake search, fake project portal, fake phone functionality, fake
  loading states, or fake success states.
- Pricing, schedule promises, permit/code/zoning/buildability conclusions, PII,
  or production data.

## Acceptance criteria

- Page looks like the beginning of a high-end construction operations product.
- Page does not look like a generic landing page or generic contractor brochure.
- All visible clickable elements point to existing in-page anchors.
- No dead buttons, fake forms, fake search, fake login, or fake functional
  claims.
- All not-live functions are clearly marked as Preview / Not live / Owner
  approval required.
- Active Projects Preview uses fake/sanitized objects only.
- Property Screening Preview includes exactly:
  `Requires official source verification.`
- Voice Front Door is clearly not live.
- `npm run lint` passes.
- `npm test` passes.
- `npm run build` passes.

## Evidence plan

RUN-0006A will contain timestamp, event type, accept/reject result, error class
if any, command results, and a sanitized summary. No PII, secrets, live data, or
external writes are recorded.

## Boundary check

- [x] Work stays inside BOUNDARIES.md
- [x] No provider configuration or external action unless explicitly listed in scope
- [x] Evidence plan uses only whitelisted lab-safe fields
