# OwnerReview Packet — <subject>

> Template for the packet candidates the platform generates (voice intake,
> lead candidates, GIS screening). A packet is always a CANDIDATE until the
> owner approves it. Lab versions use fake data only.

- **Packet ID:** ORP-<source>-<id>
- **Created:** YYYY-MM-DDTHH:MMZ
- **Source:** voice intake | web form | GIS screen | manual
- **Status:** candidate | approved | rejected

## Sanitized summary

Non-PII summary of the inquiry/candidate. In production flows, PII handling is
governed by BOUNDARIES.md; in the lab, all data is synthetic.

## Classification

Inquiry type, candidate priority (high / medium / low), reasoning summary.

## Missing information

What could not be collected or verified. GIS-derived items carry the wording:
"Requires official source verification."

## Proposed next action (requires owner approval)

The single next action the owner is being asked to approve. Nothing in this
packet executes without that approval.

## Restricted-claim check

- [ ] No price promise
- [ ] No schedule promise
- [ ] No permit / code / zoning / buildability / legal conclusion
- [ ] No excessive PII collected
