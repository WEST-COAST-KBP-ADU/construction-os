# DR-0011: Lead intake data handling — where a captured lead is allowed to live

- **Status:** proposed — awaiting owner approval
- **Date:** 2026-08-03
- **Decider:** owner
- **Related:** DR-0004 (minimal retention), DR-0006 (domain operation
  vocabulary), DR-0007 (leadgen channels), DR-0008 (portal blueprint, proposed),
  BOUNDARIES.md, `architecture/portal-blueprint-v0.1.md` §4

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

Consequence: **no lead capture surface can ship until a destination for lead
payloads exists and is owner-approved.** This is the single blocking decision
in front of the entire revenue track. Writing intake code first would place the
first commit outside the platform's own boundary.

## Decision (proposed)

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
4. **The destination is chosen from the options below** (this is what the owner
   is being asked to pick).

### Destination options

| Option | What it is | PII surface | Cost of reversal |
| :----- | :--------- | :---------- | :--------------- |
| **A — owner mailbox (recommended)** | Intake formats a plain notification to the owner's own business mailbox; nothing is stored by the platform at all | One: the mailbox the owner already reads | Near zero — no schema, no migration |
| B — managed CRM | Payload written straight into a hosted CRM record | CRM vendor becomes a processor; needs vendor retention/training review per DR-0004 | Vendor lock, export required |
| C — self-hosted store | Platform-owned encrypted store behind the owner's control | Largest — the platform becomes the custodian | Highest; adds backup, access, and breach duties |

Option A is recommended because it makes the first revenue increment shippable
without adding a data-custody obligation, and because it degrades correctly: if
the owner later adopts B or C, the intake contract does not change — only the
forwarder behind it does.

## What this record does NOT decide

- Whether the blueprint itself is adopted (that is DR-0008, still proposed).
- Any provider, vendor, or account selection — sending mail is `external_io`
  under DR-0006 and requires its own approved task packet.
- Analytics, pixels, or tracking of any kind (DR-0007 governs channels; nothing
  here authorizes a tag).
- Whether AI touches the intake path. It does not, in the first increment.
- Any feasibility, cost, zoning, or timeline output — BOUNDARIES.md forbids
  those conclusions regardless of destination.

## Consequences

- The intake route is a thin, testable boundary: validate → evidence → forward.
- Retention questions stay answerable with one sentence to a client: the
  platform stores nothing.
- If the owner picks B or C later, this record is superseded, not amended.

## Revisit trigger

A funnel tier that cannot function without durable state on the platform side
(for example, a returning-visitor client portal), reviewed against DR-0004.

## Boundary check

- [x] No PII, secrets, transcripts, or recordings introduced
- [x] No external action authorized implicitly — forwarding requires its own packet
- [x] No provider or vendor selected
- [x] No feasibility, cost, or code conclusion asserted
