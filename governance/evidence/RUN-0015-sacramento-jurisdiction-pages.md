# RUN-0015 — Sacramento jurisdiction pages

| Field | Value |
| :---- | :---- |
| timestamp | 2026-08-05T02:29:50Z |
| test variant ID | WORK-ORDER-002 / Sacramento jurisdiction pages / static-source-v1 |
| event type | bounded route implementation and static evidence check |
| accept/reject result | partial — source implementation complete; deployed preview and repository-runtime checks pending Draft PR |
| base | `main@035e7d4d13a3aef0a04129467a2c0fb87493f387` |
| branch | `agent/work-order-002-sacramento-pages` |
| latency marker | not measured |
| error class | repository_runtime_unavailable_for_local_checks |
| sanitized non-PII summary | Two statically generated jurisdiction routes use a typed content source, official City/County links, deterministic JSON-LD, refusal language, reciprocal route links, and one `/studio` next step per page. No address, parcel, customer, contact, tracking, price, schedule, permit outcome, or feasibility result is collected or produced. |

## Route result

| Route | Authority represented | Status |
| :---- | :-------------------- | :----- |
| `/adu-builder/sacramento` | City of Sacramento | source implemented; preview pending |
| `/adu-builder/sacramento-county` | unincorporated Sacramento County | source implemented; preview pending |

## Regulatory claim → official source

| Page | Claim group | Official URL |
| :--- | :---------- | :----------- |
| City | City/unincorporated boundary and refusal gate | https://mapservices.gis.saccounty.gov/arcgis/rest/services/POLITICAL/MapServer/3 |
| City | City ADU resource and permit-ready plan entry point | https://www.cityofsacramento.gov/community-development/planning/housing/accessory-dwelling-units |
| City | Electronic building-permit submission route | https://www.cityofsacramento.gov/content/dam/portal/cdd/Building/Forms/CDD-0200_Application-for-Building-Permit_Part-I.pdf |
| City | Site-specific review remains for preapproved plans | https://www.cityofsacramento.gov/community-development/building/building-programs/preapproved-adu-program-ab1332 |
| City | Zoning fields, hosting, cadence, clipping, overlay unknowns | https://mapservices.gis.saccounty.gov/arcgis/rest/services/CITY_of_SACRAMENTO/MapServer/3 |
| County | Unincorporated-area gate and County ADU zoning guide | https://planning.saccounty.gov/content/dam/cd/planning/transition-docs/resources/adu-guide.pdf |
| County | County building-permit entry points | https://development.saccounty.gov/us/en/building-permits-inspection.html |
| County | Shelf-ready plan audience and modification boundary | https://development.saccounty.gov/us/en/building-permits-inspection/news/shelf-ready-adu-plans-now-available.html |
| County | Countywide parcel fields and jurisdiction-field caveat | https://mapservices.gis.saccounty.gov/arcgis/rest/services/PARCELS/MapServer/8 |
| County | County zoning fields and clipping/cadence unknowns | https://mapservices.gis.saccounty.gov/arcgis/rest/services/PLANNING/MapServer/16 |
| County | Published planning-overlay candidates | https://mapservices.gis.saccounty.gov/arcgis/rest/services/PLANNING/MapServer |

All regulatory items in the typed source carry verbatim:
`Requires official source verification.`

## Substantive difference

The City page routes readers to City Building Division submission and the
City's permit-ready/preapproved plan resources, while preserving the unresolved
publisher status of City zoning on County GIS infrastructure. The County page
starts with the County guide's unincorporated-area gate, separates Planning and
Environmental Review from Building Permits & Inspection, and describes the
County's shelf-ready plan boundary plus County parcel/zoning fields. They do not
share a swapped-name template or a common permit-path claim.

## Deliberate omissions

- No City or County general ADU review timeline: none was published in the
  reviewed official pages.
- No jurisdiction-wide typical lot dimensions: the reviewed sources do not
  support a single responsible value for either route.
- No fixture result, address, APN, parcel, zoning, overlay, permit, feasibility,
  or buildability determination.
- No claim that the County zoning layer is clipped exactly to unincorporated
  territory.
- No claim that the County-hosted City zoning layer has a resolved accountable
  publisher.

## Checks

### Static content/JSON-LD probe

```text
PASS: 2 routes; sourced regulatory warnings; official hosts; JSON-LD serialization
PASS: no contact, analytics, cookie, or price surface
```

### Repository checks

| Command | Result |
| :------ | :----- |
| `npm run lint` | not executed — the connected repository write capability does not expose a local checkout/runtime |
| `npm run build` | not executed — same limitation |
| `npm test` | not executed — same limitation; `jurisdictionPages.test.ts` added for CI/reviewer execution |
| deployed mobile/desktop screenshots | pending Draft PR preview; no local screenshot substituted |

The earlier local compiler probe returned exactly:

```text
/bin/bash: line 1: tsc: command not found
```

This RUN is therefore `partial`, not accepted or verified. Claude must attach
the Draft PR preview URLs and repository-runtime results before a PASS verdict.
