# WORK-ORDER-004 — Commit RP-0008 fixture traces

- **Issued by:** ChatGPT, operational lead / registrar (OPERATING-MODEL-v3)
- **Owner intent:** Continue P2 with a research-evidence Draft PR containing ten RP-0008 traces
- **Issued:** 2026-08-05
- **Issuance base:** `main@9373df3925864cad06ef90dc1bca544b760439a8`
- **Executor role:** ChatGPT, operational lead / registrar acting as the bounded research-record author
- **Independent reviewer:** Claude (Fable), non-author lane
- **Execution branch:** `agent/work-order-004-rp-0008-trace-closure`
- **Binding records:** `governance/BOUNDARIES.md`, `governance/research/RP-0008-gis-sources-sacramento.md`, and `governance/tasks/TASK-0009-gis-source-research.md`

This order is not operative until the Owner merges the governance-only Draft PR
that introduces it. The research-record author must then branch from the exact current `main`
commit containing this order, record that full SHA in RP-0008 and RUN-0014, and
stop if base drift creates a path or authority collision.

## Single outcome

Replace RP-0008's execution-environment query blocker with committed,
reproducible observations for the ten already-approved public, non-residential
fixtures: five in the City of Sacramento and five in unincorporated Sacramento
County.

This order closes only the empirical trace gap. It does not verify either
jurisdiction's full source row, open the property-first funnel, authorize an
adapter, or establish zoning, jurisdiction, permit, feasibility, entitlement,
or buildability conclusions. Both coverage rows must remain `partial`.

## Exact scope

The research-record author may change only:

1. `governance/research/RP-0008-gis-sources-sacramento.md`
2. `governance/research/README.md` — RP-0008 status cell only
3. `governance/architecture/property-intelligence-v0.1.md` — the City of
   Sacramento and unincorporated Sacramento County rows in §5 only
4. `governance/evidence/RUN-0014-rp-0008-execution.md` — append-only
   continuation; preserve the original environment rejection
5. `governance/office/STATE.md` — P2 row and its directly associated blocker
   only

No other file is owned by this execution engagement. In particular, do not
change `governance/orders/README.md`, `governance/evidence/README.md`, REVIEW
records, other STATE rows, application code, tests, dependencies, public
assets, infrastructure, credentials, DNS, Vercel, analytics, or production.

## Fixture corpus

Use exactly the fixtures already committed in RP-0008 §6:

### City of Sacramento

1. Central Library — `828 I St, Sacramento, CA 95814`
2. Pannell Community Center — `2450 Meadowview Rd, Sacramento, CA 95832`
3. South Natomas Community Center — `2921 Truxel Rd, Sacramento, CA 95833`
4. North Natomas Community Center — `2601 New Market Dr, Sacramento, CA 95835`
5. Hagginwood Community Center — `3271 Marysville Blvd, Sacramento, CA 95815`

### Sacramento County (unincorporated)

1. Arcade Library — `2443 Marconi Ave, Sacramento, CA 95821`
2. Carmichael Library — `5605 Marconi Ave, Carmichael, CA 95608`
3. North Highlands-Antelope Library — `4235 Antelope Rd, Antelope, CA 95843`
4. Rio Linda Library — `6724 6th St, Rio Linda, CA 95673`
5. Orangevale Library — `8820 Greenback Ln, Orangevale, CA 95662`

These fixtures are public facilities sourced in RP-0008. They are not customer
inquiries. Do not add or substitute residential, customer, lead, or production
addresses.

## Reproducible request protocol

Use a single low-volume, sequential, form-encoded POST capture as the durable
trace source. A pre-issuance diagnostic capture may be committed only when its
exact request schema, UTC timestamps, attempts, and allowlisted results are
preserved and challenged under this order; do not make another pass merely
because the order merged. Do not poll, bulk-download, scrape, parallelize, or
retry a successful request.

Every request uses `Content-Type: application/x-www-form-urlencoded`. Encode
each named form value once using standard URL form encoding. Record timestamps
as UTC RFC 3339 with whole-second precision.

### 1. Geocode

Endpoint:

```text
https://mapservices.gis.saccounty.gov/arcgis/rest/services/PointAddress/GeocodeServer/findAddressCandidates
```

Form fields:

```text
SingleLine=<fixture address>
outFields=Match_addr,Addr_type,JURISDICTION,Ref_ID
maxLocations=3
outSR=4326
f=pjson
```

Record UTC observation time, HTTP status, successful JSON parse, ArcGIS
service-error presence, candidate count, and each candidate's score and
`Addr_type`. Keep `maxLocations=3`; lowering it to one would conceal ambiguity.
Proceed to point-in-polygon observations only when exactly one candidate is
returned with `score=100` and `Addr_type=PointAddress`. Zero candidates, more
than one candidate, any lower score, or any other address type is a fail-closed
trace result; record it and do not select a point by rank or convenience.
Only for that single eligible public-facility candidate may RP-0008 retain the
matched address, `JURISDICTION`, `Ref_ID`, and point coordinates. For rejected
alternatives, retain only sanitized candidate count, score/type bands, and the
refusal reason; do not retain their address, `Ref_ID`, or location.

### 2. Three point-in-polygon observations

Use the selected geocoder point without modification. For each query send:

```text
geometry={"x":<x>,"y":<y>,"spatialReference":{"wkid":4326}}
geometryType=esriGeometryPoint
inSR=4326
spatialRel=esriSpatialRelIntersects
returnGeometry=false
f=pjson
```

Query these endpoints and allowlisted fields:

All endpoints below use the exact prefix
`https://mapservices.gis.saccounty.gov/arcgis/rest/services/`.

| Observation | Full endpoint | `outFields` |
| :-- | :-- | :-- |
| Boundary | `https://mapservices.gis.saccounty.gov/arcgis/rest/services/POLITICAL/MapServer/3/query` | `DISTRICT,CITY_NAME,ID,DISCREPANCY_AG` |
| Parcel | `https://mapservices.gis.saccounty.gov/arcgis/rest/services/PARCELS/MapServer/8/query` | `SITUS_ADD1,SITUS_ADD2,JURISDICTION,TRA_JURISDICTION,GIS_JURISDICTION,PARCEL_STATUS` |
| City zoning | `https://mapservices.gis.saccounty.gov/arcgis/rest/services/CITY_of_SACRAMENTO/MapServer/3/query` | `ZONE,BASE_ZONE,OVERLAY,PUDNAME,SPDNAME,PROJ_NUMB,ORDINANCE,ORD_DATE,CHANG_DATE,DESCRIPTIO` |
| County zoning | `https://mapservices.gis.saccounty.gov/arcgis/rest/services/PLANNING/MapServer/16/query` | `B_ZONE,ZONE_ALL,DESCRIPTION,JURISDICTION,OVERLAY_1,OVERLAY_2,OVERLAY_3,ZONE_DESC` |

Use City zoning for the five City fixtures and County zoning for the five
unincorporated fixtures. Record UTC time, HTTP status, service-error presence,
successful JSON parse, `exceededTransferLimit` key presence/value, feature
count, and the allowlisted attributes. A result other than exactly one feature
is a refusal; do not select from a multi-hit response. Do not store geometry,
owner or mailing fields, unrestricted payloads, cookies, tokens, headers, or
unrelated attributes.

The selected public-fixture geocoder point is the only permitted coordinate
evidence. `returnGeometry=false` is mandatory for boundary, parcel, and zoning;
do not retain polygon geometry. APN/parcel identifiers are not needed for the
named acceptance assertions and must not be committed in the fixture traces.

## Required analysis

For every fixture, record separately:

- transport and ArcGIS service result;
- geocoder cardinality and match quality;
- boundary, parcel, and zoning cardinality;
- agreement or disagreement between expected fixture jurisdiction, geocoder,
  boundary, and the three parcel jurisdiction fields;
- normalized fixture street address versus returned parcel situs;
- any zero hit, multi-hit, service error, ambiguity, or mismatch;
- whether the observation is a candidate fact or a fail-closed refusal.

Non-evidentiary pre-order diagnostics reported the following hypotheses. The
research-record author must reproduce or refute them from the committed trace;
the diagnostics themselves are not SourceTrue:

- `2921 Truxel Rd` geocodes as requested but intersects a parcel whose situs is
  `2881 Truxel Rd`;
- `2601 New Market Dr` geocodes as requested but intersects a parcel whose situs
  is `2700 N Park Dr`;
- `DISCREPANCY_AG` was populated on reported boundary features, while the field
  metadata publishes no description or coded-value domain. Reported values
  were `SACRAMENTO` for the City fixtures and `SACRAMENTO COUNTY` for the County
  fixtures.

Do not infer that a non-null `DISCREPANCY_AG` means discrepancy or refusal. Do
not infer the opposite. Treat its semantics as unresolved and keep automatic
jurisdiction acceptance fail-closed. A point intersection does not establish
distance from an edge or recent-annexation behavior.

Every jurisdiction, zoning, feasibility, or buildability statement must carry:

> Requires official source verification.

## Evidence placement

- Put the ten detailed traces and exact request templates in RP-0008.
- Append a dated continuation to RUN-0014. Preserve the original
  `environment_url_safety_rejection` and record only the BOUNDARIES.md evidence
  whitelist: timestamp/window, test variant, event type, accept/reject,
  latency marker, error class, and sanitized aggregate summary.
- Label RUN-0014's original section as WORK-ORDER-001 evidence and its new
  append-only continuation as WORK-ORDER-004 evidence so the two executions
  cannot be mistaken for one run.
- Do not commit raw response dumps or a collector script.
- The commit and Git blob SHA protect the exact RP bytes. Do not publish a
  semantic response hash unless the corresponding sanitized canonical
  projection and canonicalization algorithm are committed with it; a hash of
  unavailable bytes is not independent evidence.
- Update the research index, two architecture matrix rows, and P2 STATE wording
  only to remove the executed fixture/query blocker.
- Keep RP-0008 and both matrix rows `partial` for unresolved accountable
  publisher, terms/derived-use applicability, published cadence,
  unincorporated clipping, overlay completeness, edge/recent-annexation
  behavior, and `DISCREPANCY_AG` semantics.
- Treat the traces as private, internal verification evidence only. They do not
  authorize public republication, an adapter, product use, customer decisioning,
  or external effects. If an official source presents a restrictive or unclear
  access/redistribution notice during capture, stop and retain only sanitized
  request/result classifications pending terms verification.

## Acceptance

The Draft PR must show, without converting observations into conclusions:

- exactly ten geocoder fixture attempts, five per fixture group;
- three downstream POSTs only for each fixture that passes the unique-candidate
  predicate; forty total requests is the expected all-success path, not an
  invariant that permits querying after a refused geocoder result;
- exact endpoint, form schema, UTC observation time, HTTP status, JSON parse,
  ArcGIS error/transfer-limit key state, cardinality, and allowlisted result
  fields for every trace;
- exact counts for success, zero-hit, multi-hit, service-error, and situs
  agreement/mismatch classes;
- explicit treatment of both named situs mismatches;
- explicit unresolved semantics for `DISCREPANCY_AG`;
- historical RUN evidence preserved and a new append-only continuation;
- no changed files outside the five owned paths;
- `git diff --check` clean;
- no code, dependency, product, infrastructure, credential, DNS, Vercel,
  analytics, or production change.

The reviewer should replay the ten low-volume traces if its network permits. If
the official host remains blocked, mark replay `NOT RUN` with the exact blocker
and independently verify the committed request schema, cardinality math,
cross-record consistency, scope, privacy fields, refusal rules, and residual
unknowns. Green CI or a Vercel status is not research verification.

## Blocker behavior

On an HTTP error, ArcGIS service error, changed schema, authority mismatch,
base drift, fixture-source doubt, or unexpected sensitive field, stop further
mutation. Record the exact endpoint class, response status/error class, and the
minimum required correction without inserting a guessed value, secondary
aggregator, or silent fallback.

## Routing

One bounded execution branch and one Draft PR after this order is owner-merged.
Claude/Fable reviews the exact research head and returns `PASS` or
`CHANGES REQUESTED`. ChatGPT does not self-verify, mark Ready, approve, or
merge. The Owner alone merges.
