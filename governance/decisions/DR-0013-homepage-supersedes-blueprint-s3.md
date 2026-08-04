# DR-0013: The architectural homepage supersedes Blueprint §3

- **Status:** adopted
- **Date:** 2026-08-03
- **Decider:** owner (concept 01 selected 2026-08-03; TASK-0010)
- **Related:** DR-0008, `architecture/portal-blueprint-v0.1.md` §3/§3a, TASK-0010

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
| Address-first hero CTA | The site's single largest differentiator is not on the homepage. Restore when DR-0011/DR-0012 clear. |
| Social-proof bar, testimonials, credentials | No trust signal above the fold. Blocked on the owner's business-facts package, not on design. |
| Sticky nav with license + phone | No contact path exists on the site. **Deliberate** — owner ruling 2026-08-03: this is a demo, no contact surface until the owner opens one. Not a defect; do not "fix" it. |
| Cost transparency, ROI calculator | Policy-gated; unchanged. |
| Gallery / portfolio | Blocked on real project photography. |

## Demo posture (owner ruling, 2026-08-03)

The site is a **demo**. It carries no contact path, no capture, and no
commercial surface by intent, not by omission. Lead generation is a later
phase. Consequently DR-0011 and DR-0012 are **not blocking anything today** —
they are prerequisites for a phase the owner has not opened.

No task packet may add a phone number, email address, contact form, booking
link, or any other contact surface until the owner opens that phase in a
superseding record. A builder finding the site "missing contact information"
is observing an intended property.

## Revisit trigger

Owner opens the lead-generation phase. At that point DR-0011 and DR-0012 move
from dormant to blocking, and the dropped rows above reopen in order.

## Boundary check

- [x] No PII, secrets, or vendor introduced
- [x] No new visitor-facing claim authorized
- [x] Blueprint §2 left intact
