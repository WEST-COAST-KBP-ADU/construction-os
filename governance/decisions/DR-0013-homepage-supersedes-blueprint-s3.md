# DR-0013: The architectural homepage supersedes Blueprint §3

- **Status:** adopted — homepage decision active; demo posture partially
  superseded by DR-0015
- **Date:** 2026-08-03
- **Decider:** owner (concept 01 selected 2026-08-03; TASK-0010)
- **Related:** DR-0008, DR-0015, `architecture/portal-blueprint-v0.1.md`
  §3/§3a, TASK-0010

## Context

DR-0008 adopted the blueprint as the canonical build plan, and requires that
blueprint changes be recorded rather than absorbed silently. The owner then
selected a different homepage — an architectural editorial direction, four
sections — and TASK-0010 shipped it. The blueprint's §3 and the live site
therefore contradicted each other on paper. This record closes that gap.

## Decision

Blueprint §3 (15-section homepage) is **superseded**. The homepage built under
TASK-0010 is the current target: hero, solutions, process, quality.

Blueprint §2 (information architecture) is **unaffected and still binding** —
the route map, city pages, and resources sections remain the build target.

## What carried over from §3

- Screening-only language on every uncertain statement.
- No cost, schedule, or approval claim anywhere on the page.
- Conceptual imagery explicitly labeled as not a completed project.
- Numbered process narrative.

## What was dropped, and what that costs

| Dropped from §3 | Consequence to accept |
| :-------------- | :-------------------- |
| Address-first hero CTA | The site's single largest differentiator is not on the homepage. It remains closed until DR-0012 and a separate Phase 2+ owner gate clear; DR-0011 alone is insufficient. |
| Social-proof bar, testimonials, credentials | No trust signal above the fold. Blocked on the owner's business-facts package, not on design. |
| Sticky nav with license + phone | No contact path exists in Phase 1. **Deliberate** — DR-0015 opens acquisition content but keeps contact and public phone closed. Not a defect; do not "fix" it. |
| Cost transparency, ROI calculator | Policy-gated; unchanged. |
| Gallery / portfolio | Blocked on real project photography. |

## Demo posture — partially superseded by DR-0015

DR-0015 opens governance Phase 0 and a bounded no-contact/no-tracking Phase 1.
That supersedes only the statement that lead generation is wholly unopened.
The homepage decision above remains adopted.

The public site still carries no phone number, email address, form, booking
link, intake, tracking, or other contact surface. DR-0011 now selects only a
future pilot destination; it does not authorize implementation. DR-0012 and
its Research Gate remain open for any visitor-facing GIS output.

A builder finding the site "missing contact information" during Phase 1 is
still observing an intended property.

## Revisit trigger

Owner separately opens a contact, intake, tracking, public-phone, or Phase 2+
capability through an adopted record and bounded task packet.

## Boundary check

- [x] No PII, secrets, or vendor introduced
- [x] No new visitor-facing claim authorized
- [x] Blueprint §2 left intact
