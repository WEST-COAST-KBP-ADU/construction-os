# DR-0014: Market area correction — Sacramento first, not Roseville

- **Status:** adopted
- **Date:** 2026-08-03
- **Decider:** owner
- **Related:** charter (Identity), blueprint §2, RP-0007, TASK-0009, TASK-0011,
  `architecture/property-intelligence-v0.1.md` §5

## Context

The charter's founding text listed the target operating area as "Roseville,
Rocklin, Lincoln, Folsom, Granite Bay, El Dorado Hills, Citrus Heights" —
Placer-county towns first, and **the City of Sacramento and Sacramento County
absent entirely**.

Everything downstream inherited that ordering without questioning it: the
blueprint's city-page list, RP-0007's choice of Roseville as the first GIS
jurisdiction, TASK-0009's default, and TASK-0011's page list. No record ever
tested the premise against the owner's actual business.

Owner correction, 2026-08-03: the core market is Sacramento and Sacramento
County. Building the funnel around Roseville first targets a fraction of the
addressable market and would not sell.

## Decision

Two levels, not three. **Core** contains both rings below; neither is an
"expansion market."

**Core market:**

- **Sacramento ring** — City of Sacramento and Sacramento County, including the
  unincorporated county and the incorporated cities within it: Elk Grove,
  Citrus Heights, Folsom, Rancho Cordova, Galt, Isleton.
- **Placer / El Dorado ring** — Roseville, Rocklin, Lincoln, Granite Bay,
  El Dorado Hills.

**Horizon:** Northern California.

Sacramento leads in **build order** — it is the largest share of the core and
the work starts there. That is a sequencing statement, not a market boundary:
the Placer and El Dorado ring is core market and is sold to, not deferred to a
later phase.

Note that Folsom and Citrus Heights sit in Sacramento County and were already
on the old list; they move up rather than in. Roseville, Rocklin, Lincoln, and
Granite Bay are Placer County and move to tier 2. Granite Bay is unincorporated
Placer, so it is county jurisdiction, not city.

## Consequences

- **RP-0007 (Roseville GIS research) is not wasted and is not discarded.** It
  proved the method end to end on a jurisdiction with good published layers. It
  is now the second jurisdiction, and its structure is the template for the
  Sacramento work.
- The first GIS jurisdiction becomes **Sacramento County** (parcel and zoning
  authority for unincorporated areas) and the **City of Sacramento**. These are
  two distinct jurisdictions with separate layers; treat them as two rows in the
  coverage matrix, not one.
- City-page priority reorders to the tier-1 list.
- Any later record citing the old market order is corrected by this one.

## What this record does NOT decide

- Whether the ADU rules differ between these jurisdictions — that is research,
  not a decision.
- Any vendor, data source, or endpoint.
- Service-area claims on the public site: nothing may state coverage of a
  jurisdiction the business is not actually licensed and operating in.

## Revisit trigger

Owner opens a market outside the three tiers above.

## Boundary check

- [x] No PII, secrets, or vendor introduced
- [x] No public service-area claim authorized by this record alone
