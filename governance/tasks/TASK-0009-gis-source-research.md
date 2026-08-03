# TASK-0009: GIS source research — first jurisdiction (research only, no code)

- **Status:** approved
- **Date approved:** 2026-08-03
- **Approved by:** owner (directive: «с этих гисданных»)
- **Related:** `architecture/property-intelligence-v0.1.md` §§5, 8; DR-0005,
  DR-0012 (proposed — this research is its blocking gate)

## Objective

Close Research Gate items 1, 3, 4, 5 of `property-intelligence-v0.1.md` §8 for
ONE jurisdiction (default: Roseville — owner may swap), producing RP-0007. No
code, no scraping at volume, no vendor signup.

## In scope — questions RP-0007 must answer with citations

1. Which public endpoints (county assessor / city GIS / state) expose parcel
   geometry, lot area, zoning district, and overlay layers for the
   jurisdiction; exact URLs, formats, query mechanics.
2. Terms of use per source: is automated querying permitted? attribution
   required? redistribution of derived output allowed? Quote the terms.
3. Geocoding options: is a free public geocoder (e.g. Census) adequate; what
   are its terms; what would require a vendor (vendor = separate DR).
4. Freshness: how often each layer updates; how staleness is detectable.
5. Fill the §5 coverage-matrix row for the jurisdiction with verified answers.
6. Data quality spot-check: 5 sample addresses (public buildings, NOT real
   inquiries) traced end-to-end by hand; record mismatches.

Also collect (for owner/counsel, not for builder to conclude): the current CA
ADU statutory-floor citations, marked "requires owner/counsel verification."

## Out of scope / prohibited

- Any implementation code, any live endpoint integration in the repo, any
  vendor account, any conclusion about buildability, any real-inquiry address.

## Acceptance criteria

- `governance/research/RP-0007-gis-sources-<jurisdiction>.md` per the research
  packet template; every claim cited or marked unverified; registry updated.

## Evidence plan

RUN-0009: timestamp, event type, accept/reject, sanitized summary.

## Boundary check

- [ ] Work stays inside BOUNDARIES.md
- [ ] No provider configuration or external action
- [ ] Evidence plan uses only whitelisted lab-safe fields
