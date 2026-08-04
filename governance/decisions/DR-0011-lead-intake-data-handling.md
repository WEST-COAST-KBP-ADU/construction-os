# DR-0011: Lead intake data handling — where a captured lead is allowed to live

- **Status:** adopted — Option A for a future bounded pilot only
- **Date proposed:** 2026-08-03
- **Date adopted:** 2026-08-04
- **Decider:** owner
- **Related:** DR-0004 (minimal retention), DR-0006 (domain operation
  vocabulary), DR-0007 (leadgen channels), DR-0008 (portal blueprint),
  DR-0015, BOUNDARIES.md, `architecture/portal-blueprint-v0.1.md` §4

## Context

The public site currently captures nothing. `src/lib/siteConfig.ts` states it
plainly: nothing on the site collects, submits, emails, stores, or tracks, and
every CTA is an inert placeholder. The blueprint's three-tier funnel (§4)
cannot be built past a static mock until one question is answered.

A captured lead is production PII by construction. Tier 1 asks for a property
address; Tier 2 adds an email; Tier 3 adds a name and a time slot. BOUNDARIES.md
lists street address, email, phone, and APN/parcel identifiers tied to real
inquiries among the fields never stored in `governance/`, and DR-0004 sets
"no production PII persistence" as the platform-wide default — not merely a
SourceTrue rule.

A destination choice is necessary but not sufficient. DR-0015 keeps production
intake and every contact surface closed through Phase 1. Provider, consent,
privacy, pilot-bound, and external-I/O gates remain even after this destination
policy is adopted.

## Decision

1. **This repository never persists a lead payload.** No database, no JSON on
   disk, no commit, no log line containing address, email, phone, or name. The
   repo may record only the whitelisted evidence fields from BOUNDARIES.md
   (timestamp, event type, accept/reject result, latency marker, error class,
   sanitized non-PII summary).
2. **A lead payload leaves the request in one hop, to exactly one
   owner-controlled destination.** The intake route validates against a schema,
   emits a whitelisted evidence event, forwards the payload, and holds nothing.
3. **Sanitization is structural.** The evidence event is built from a separate
   whitelist type, never by stripping fields off the payload object.
4. **For a future bounded pilot, the sole destination is Option A: an
   owner-controlled business mailbox.** The platform keeps no lead payload.

### Adopted pilot limits

Selecting Option A does **not** authorize an intake route, provider, mailbox
integration, real lead, or external send. A later packet must define pilot
duration, volume, stop conditions, consent/privacy controls, deletion handling,
and the exact external-I/O path before any production PII is accepted.

The platform stores no click ID, pixel/CAPI data, lead-to-click mapping, or
offline-conversion state under Option A. Automatic closed-loop attribution is
therefore outside this pilot disposition and requires a superseding state/data
decision. DR-0012 remains independently blocking for visitor-facing GIS.

### Destination options (A selected for the bounded pilot)

| Option | What it is | PII surface | Cost of reversal |
| :----- | :--------- | :---------- | :--------------- |
| **A — owner mailbox (selected for pilot)** | Intake formats a plain notification to the owner's own business mailbox; nothing is stored by the platform at all | One: the mailbox the owner already reads | Near zero — no schema, no migration |
| B — managed CRM | Payload written straight into a hosted CRM record | CRM vendor becomes a processor; needs vendor retention/training review per DR-0004 | Vendor lock, export required |
| C — self-hosted store | Platform-owned encrypted store behind the owner's control | Largest — the platform becomes the custodian | Highest; adds backup, access, and breach duties |

Option A is selected because it minimizes platform custody and remains
reversible. Selection alone does not make an intake increment shippable. If the
owner later adopts B or C, this record is superseded and the full data boundary
is reviewed again.

## What this record does NOT decide

- Any intake implementation, launch, pilot bound, or consent/privacy policy.
- Any provider, vendor, or account selection — sending mail is `external_io`
  under DR-0006 and requires its own approved task packet.
- Analytics, pixels, click-ID storage/export, closed-loop attribution, or
  tracking of any kind (DR-0007 governs channels; nothing here authorizes a tag).
- Whether AI touches the intake path. It does not, in the first increment.
- Any feasibility, cost, zoning, or timeline output — BOUNDARIES.md forbids
  those conclusions regardless of destination.

## Consequences

- If separately authorized, the pilot intake route is a thin, testable
  boundary: validate → evidence → forward.
- Retention questions stay answerable with one sentence to a client: the
  platform stores nothing.
- If the owner picks B or C later, this record is superseded, not amended.

## Revisit trigger

A funnel tier that cannot function without durable state on the platform side,
a request for automatic attribution, or any destination beyond the selected
mailbox, reviewed against DR-0004.

## Boundary check

- [x] No PII, secrets, transcripts, or recordings introduced
- [x] No external action authorized implicitly — forwarding requires its own packet
- [x] No provider or vendor selected
- [x] No feasibility, cost, or code conclusion asserted
- [x] No intake launch, tracking, or automatic attribution authorized
