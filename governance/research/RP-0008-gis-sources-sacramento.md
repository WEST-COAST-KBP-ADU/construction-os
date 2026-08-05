# RP-0008: Sacramento GIS sources — City and unincorporated County

- **Status:** PARTIAL — official layer metadata opened; parameterized fixture queries blocked by the execution environment
- **Date:** 2026-08-04
- **Researcher:** ChatGPT, bounded worker under WORK-ORDER-001 — zero authority
- **Feeds into:** DR-0012 (proposed), `architecture/property-intelligence-v0.1.md` §5
- **Pinned base:** `main@c3271f3`; execution branch created from `main@69bcaf43d0f848f7de27c4937616badd391b4dd7`
- **Access window:** 2026-08-05T01:06:00Z–2026-08-05T01:21:29Z

This packet records source observations only. It makes no parcel-specific zoning,
permit, feasibility, or buildability conclusion. Research has zero authority.

## 1. Executive result

The County ArcGIS Server exposes separate queryable feature layers for the
countywide parcel base, County zoning, City zoning, and jurisdiction polygons.
The City zoning layer is named as City data but is physically hosted at
`mapservices.gis.saccounty.gov`. The service and layer metadata leave
`Copyright Text`, author, and description blank, so the accountable publisher
of that particular layer was **not established**. Hosting agency and accountable
agency must remain separate provenance fields.

The official County geocoder exposes `JURISDICTION`, and the County parcel
layer exposes `JURISDICTION`, `TRA_JURISDICTION`, and
`GIS_JURISDICTION`. However, the environment rejected every parameterized
`findAddressCandidates` URL before the server response was retrieved.
Therefore no fixture reached parcel or zoning join. Both jurisdictions remain
`partial`.

Requires official source verification.

## 2. Shared parcel source

- URL: https://mapservices.gis.saccounty.gov/arcgis/rest/services/PARCELS/MapServer/8
- Accessed: 2026-08-05T01:13:00Z
- Layer: `Active GIS Parcel Base` (MapServer layer 8), polygon Feature Layer.
- Coverage metadata extent: WKID 2226; X 6602455.675135225–6842162.521507964,
  Y 1769452.7875283062–2030220.3568713963. This is countywide, not a
  City-only parcel source.
- Relevant verbatim fields: `PARCEL_NUMBER`, `APN_DASH`, `APN10`,
  `LOTSIZE`, `STREET_NBR`, `STREET_NAME`, `SITUS_ADD1`,
  `SITUS_ADD2`, `INSERT_DATE`, `CREATED_DATE`, `EVENT_DATE`,
  `JURISDICTION`, `TRA_JURISDICTION`, `GIS_JURISDICTION`,
  `PARCEL_STATUS`.
- Mechanics published in metadata: JSON/geoJSON/PBF; `Query`; standardized
  queries; pagination, distance queries, statistics, distinct, order-by;
  max record count 2,000.
- `returnGeometry` and `outSR` behavior was not executed because the
  parameterized query path was blocked.
- Update cadence: not published. Dates in records are not a published cadence.
- Failure/privacy note: the layer also publishes owner and mailing fields.
  Those fields are outside this work order and must not be retrieved or stored.

## 3. City of Sacramento — protocol items 1–10

1. **Agency / owner.** City policy says City departments control City data and
   the City IT department administers the City portal. The actual zoning layer
   is hosted by Sacramento County; its metadata does not identify author,
   copyright holder, or accountable publisher. Accountable agency for this
   layer: unresolved. Requires official source verification.
   URLs: https://www.cityofsacramento.gov/information-technology/gis/data and
   https://mapservices.gis.saccounty.gov/arcgis/rest/services/CITY_of_SACRAMENTO/MapServer/3
   (accessed 2026-08-05T01:08:00Z).
2. **Endpoint.** `CITY_of_SACRAMENTO/MapServer/3`, `City of Sacramento
   Zoning`, polygon Feature Layer; JSON/geoJSON/PBF; MapServer max 2,000.
   General Plan is layer 4; PUD and SPD are layers 2 and 1.
3. **Coverage.** Published extent WKID 2226; X
   6687183.479104504–6743983.942931175, Y
   1921798.0605930835–2011766.2359713316. Metadata does not state that the
   polygons stop exactly at current incorporated limits. Requires official
   source verification.
4. **Fields.** Zoning: `ZONE`, `BASE_ZONE`, `OVERLAY`, `PUDNAME`,
   `SPDNAME`, `PROJ_NUMB`, `ORDINANCE`, `ORD_DATE`, `CHANG_DATE`,
   `URL`, `DESCRIPTIO`. Parcel/address/area fields come from shared parcel
   layer §2; the City zoning layer has no APN, address, or lot-area field.
5. **Query mechanics.** Queryable; standardized queries; pagination, distance,
   statistics, distinct and order-by published; JSON/geoJSON/PBF; max 2,000.
   Actual spatial query, `returnGeometry`, and `outSR` behavior unresolved
   due environment rejection.
6. **Update cadence.** Not published in layer/service metadata.
7. **Terms.** Official City Open Data Terms, verbatim excerpt:
   “The User accepts and agrees to the Terms by machine-consuming, or
   downloading and using the Data”. Source:
   https://www.cityofsacramento.gov/content/dam/portal/it/gis/open-data/OpenDataPolicy.pdf
   (p. 12, accessed 2026-08-05T01:09:00Z). The document also says additional
   dataset/page terms are incorporated; none were present in the opened layer
   metadata. Whether City terms govern a City-named layer on County
   infrastructure is unresolved and requires owner/counsel verification.
8. **Documented limits.** No rate or throttle limit was published in opened
   service metadata. Absence is not permission. City terms are binding on
   machine consumption; legal effect and product use require owner/counsel
   verification.
9. **Overlays.** Present in City service: SPD (1), PUD (2), General Plan (4);
   `OVERLAY`, `PUDNAME`, `SPDNAME` fields on zoning. Fire, flood, historic,
   and specific-plan completeness were not established.
10. **Observed failures.** Blank author/copyright/description; County hosting
    versus unresolved City accountability; no published cadence; parameterized
    geocoder/query URLs rejected by the environment before a source response.

## 4. Sacramento County (unincorporated) — protocol items 1–10

1. **Agency / owner.** Sacramento County GIS is the official host and portal
   publisher for the opened parcel and planning services. The individual
   service metadata leaves author/copyright blank; department-level
   accountability beyond County GIS was not established.
   URLs: https://data.saccounty.gov/ and
   https://mapservices.gis.saccounty.gov/arcgis/rest/services/PLANNING/MapServer/16
   (accessed 2026-08-05T01:07:00Z–01:14:00Z).
2. **Endpoint.** Parcel: `PARCELS/MapServer/8`, `Active GIS Parcel Base`.
   Zoning: `PLANNING/MapServer/16`, `County Zoning`. Both polygon Feature
   Layers; JSON/geoJSON/PBF; max 2,000.
3. **Coverage.** Parcel extent is countywide. County zoning extent WKID 2226;
   X 6601072.500080049–6840875.550328642, Y
   1768500.7500623167–2030220.3568713963. Metadata does not say layer 16 is
   clipped to unincorporated territory, despite the `JURISDICTION` field.
   Requires official source verification.
4. **Fields.** Parcel fields are in §2. Zoning fields:
   `B_ZONE`, `ZONE_ALL`, `DESCRIPTION`, `JURISDICTION`,
   `OVERLAY_1`, `OVERLAY_2`, `OVERLAY_3`, `ZONE_DESC`. No ordinance
   reference or last-update field is published on layer 16.
5. **Query mechanics.** Queryable; standardized queries; pagination, distance,
   statistics, distinct and order-by published; JSON/geoJSON/PBF; max 2,000.
   Actual spatial query, `returnGeometry`, and `outSR` behavior unresolved
   due environment rejection.
6. **Update cadence.** Not published in opened layer/service metadata.
7. **Terms.** County portal disclaimer, verbatim excerpt: “Sacramento County
   makes no representations about the suitability of this data for any
   purpose. All data is provided "as is" without warranty”. Source:
   https://data.saccounty.gov/ (accessed 2026-08-05T01:07:00Z). No separate
   license or attribution text appeared in opened layer metadata. Full legal
   effect requires owner/counsel verification.
8. **Documented limits.** No rate or throttle limit published in opened service
   metadata. Absence is not permission.
9. **Overlays.** PLANNING service publishes SPA (6), erosion (46), NPA (7),
   Parkway Corridor (8), Surface Mining (9), Mobile Home Park (10), flood (14),
   CalFire local/state response FHSZ (79/80), specific-plan land use (69), and
   other planning layers. Historic coverage was not found. Overlay completeness
   for the two jurisdictions remains unresolved.
10. **Observed failures.** Blank author/copyright; no cadence; parcel layer
    includes multiple jurisdiction fields whose conflict behavior is
    undocumented; parameterized query URLs rejected before a source response.

## 5. Jurisdiction determination (item 11)

Primary candidate gate:
https://mapservices.gis.saccounty.gov/arcgis/rest/services/POLITICAL/MapServer/3
(accessed 2026-08-05T01:15:00Z).

`City Boundaries with Unincorporated` is a queryable polygon Feature Layer
with fields `DISTRICT`, `CITY_NAME`, `ID`, and `DISCREPANCY_AG`.
The County geocoder also advertises `JURISDICTION`; the parcel layer advertises
three jurisdiction fields. Given a point, the intended deterministic gate is a
spatial query against layer 3, followed by agreement checks against geocoder and
parcel jurisdiction fields. Any zero hit, multiple hit, boundary-touching result,
`DISCREPANCY_AG` value, or disagreement must refuse.

Edge inclusion rules, geometry tolerance, refresh cadence, and behavior for
recent annexations were not published and could not be probed. A point on or
near an edge must therefore be `ambiguous`, not assigned. Requires official
source verification.

## 6. Fixture corpus and blocked traces

All fixtures are public non-residential facilities. Addresses were taken from
official City or Sacramento Public Library pages. None is a customer inquiry
and no fixture was persisted outside this packet.

| Jurisdiction | Public fixture | Boundary purpose | Trace result |
| :----------- | :------------- | :--------------- | :----------- |
| City | Central Library — 828 I St, Sacramento, CA 95814 | ordinary | geocode blocked; no parcel/zoning observation |
| City | Pannell Community Center — 2450 Meadowview Rd, Sacramento, CA 95832 | ordinary | geocode blocked; no parcel/zoning observation |
| City | South Natomas Community Center — 2921 Truxel Rd, Sacramento, CA 95833 | ordinary | geocode blocked; no parcel/zoning observation |
| City | North Natomas Community Center — 2601 New Market Dr, Sacramento, CA 95835 | near-boundary candidate | proximity and trace unresolved |
| City | Hagginwood Community Center — 3271 Marysville Blvd, Sacramento, CA 95815 | ordinary | geocode blocked; no parcel/zoning observation |
| County | Arcade Library — 2443 Marconi Ave, Sacramento, CA 95821 | near-boundary candidate | proximity and trace unresolved |
| County | Carmichael Library — 5605 Marconi Ave, Carmichael, CA 95608 | ordinary | geocode blocked; no parcel/zoning observation |
| County | North Highlands-Antelope Library — 4235 Antelope Rd, Antelope, CA 95843 | ordinary | geocode blocked; no parcel/zoning observation |
| County | Rio Linda Library — 6724 6th St, Rio Linda, CA 95673 | ordinary | geocode blocked; no parcel/zoning observation |
| County | Orangevale Library — 8820 Greenback Ln, Orangevale, CA 95662 | ordinary | geocode blocked; no parcel/zoning observation |

Official address sources:
https://www.cityofsacramento.gov/content/dam/portal/ypce/Community-Centers/FACITLITY%20RENTAL%20GUIDE%20Packet_Final%20July%202024.pdf,
https://www.saclibrary.org/visit-us,
https://www.saclibrary.org/visit-us/arcade,
https://www.saclibrary.org/visit-us/carmichael,
https://www.saclibrary.org/visit-us/north-highlands-antelope,
https://www.saclibrary.org/visit-us/rio-linda, and
https://www.saclibrary.org/visit-us/orangevale
(accessed 2026-08-05T01:17:00Z–01:19:00Z).

### Exact blocker

Attempted endpoint:
`https://mapservices.gis.saccounty.gov/arcgis/rest/services/PointAddress/GeocodeServer/findAddressCandidates`

Parameters for each fixture: `SingleLine=<fixture>`,
`outFields=Match_addr,Addr_type,JURISDICTION,Ref_ID`,
`maxLocations=3`, `outSR=4326`, `f=pjson`.

All ten attempts returned the environment response:
`URL ... is not safe to open (non-retryable error)`.
This was not an HTTP response from Sacramento County. No retry, alternate
aggregator, bulk endpoint, parcel query, or zoning query was attempted after the
blocker. Consequently: geocode 0/10 evidenced; clean parcel joins 0/10
evidenced; zoning observations 0/10 evidenced; mismatches/multi-parcel/boundary
ambiguities cannot be measured.

## 7. Coverage conclusion

| Jurisdiction | Parcel layer | Zoning layer | Overlays | Status |
| :----------- | :----------- | :----------- | :------- | :----- |
| City of Sacramento | County `PARCELS/MapServer/8`: `APN_DASH`, `LOTSIZE`, `SITUS_ADD1`, `GIS_JURISDICTION` | County-hosted `CITY_of_SACRAMENTO/MapServer/3`: `ZONE`, `ORDINANCE`, `CHANG_DATE` | SPD/PUD/General Plan present; fire/flood/historic/specific-plan completeness open | partial — accountable publisher, terms applicability, cadence, boundary behavior, and fixtures open |
| Sacramento County (unincorporated) | County `PARCELS/MapServer/8`: `APN_DASH`, `LOTSIZE`, `SITUS_ADD1`, `GIS_JURISDICTION` | County `PLANNING/MapServer/16`: `B_ZONE`, `ZONE_ALL`, `JURISDICTION`, `OVERLAY_1..3` | SPA, flood, FHSZ, specific-plan candidates present; historic completeness open | partial — unincorporated clipping, terms/license, cadence, boundary behavior, and fixtures open |

Neither row is verified. Requires official source verification.

## 8. Boundary check

- [x] Two jurisdictions kept separate
- [x] No parcel-specific zoning, permit, feasibility, or buildability conclusion
- [x] Public non-residential fixtures only; no inquiry address or production PII
- [x] No bulk retrieval, polling, signup, key, vendor, adapter, or integration
- [x] Uncertainty carries the required wording
- [ ] Fixture traces complete — blocked at parameterized geocoder request
- [ ] Accountable publisher for County-hosted City zoning resolved
- [ ] Terms and automated/derived-use posture cleared by owner/counsel
