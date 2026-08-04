# RP-0007: Roseville GIS sources and geocoding suitability

- **Status:** open (research complete enough for owner review; terms blocker remains)
- **Date:** 2026-08-03
- **Researcher:** Codex researcher — zero authority
- **Requested by:** TASK-0009
- **Feeds into:** DR-0012 (proposed)
- **Pinned repository base:** `main@f223792529c7c88987c44efb15a849956022ac1d`
- **Checked:** 2026-08-04T06:03Z

## Question

For Roseville, California, identify official public sources for parcel geometry,
lot area, zoning, and relevant overlays; record query mechanics, freshness and
terms; evaluate the U.S. Census geocoder; and manually trace five public-building
addresses without making any parcel-specific feasibility or buildability claim.

This packet is research only. It authorizes no implementation, source polling,
redistribution, vendor signup, or client-facing output. Every result below is a
screening candidate. **Requires official source verification.**

## Method and boundary

- Official City of Roseville, Placer County, U.S. Census Bureau, CAL FIRE, and
  California Legislative Information sources only.
- Five addresses are published City facilities, not customer or inquiry data.
- Requests were low-volume manual probes on 2026-08-04 UTC.
- No data dump was persisted in SourceTrue; only sanitized findings are recorded.
- No legal, zoning, permit, entitlement, or buildability conclusion is made.

## Verified official sources

### Roseville GIS catalog and layers

The City identifies its [GIS Open Data Portal](https://data-roseville.opendata.arcgis.com/)
from the official [Center for GIS page](https://www.roseville.ca.us/departments/information_technology/center_for_gis.php).
The portal publishes a machine-readable
[DCAT-US catalog](https://data-roseville.opendata.arcgis.com/api/feed/dcat-us/1.1.json),
ArcGIS GeoServices REST endpoints, and bulk CSV, Shapefile, GeoJSON, and KML
downloads.

| Need | Official layer and endpoint | Useful fields | Query mechanics | Freshness evidence |
| :--- | :--- | :--- | :--- | :--- |
| Address normalization | [Address Point](https://data-roseville.opendata.arcgis.com/datasets/8fd926e0b86b4b129b727b02a5dcf094_0) · `https://ags.roseville.ca.us/arcgis/rest/services/PublicServices/Address/MapServer/0` | `ADDR1`, `ADDRCLS`, `ADDRSTS`, `ZIP`, `LASTEDITDATE` | `.../query?where=<standardized address>&outFields=...&returnGeometry=true&outSR=4326&f=geojson` | Catalog modified 2026-05-18; maximum observed `LASTEDITDATE` 2026-07-30; 79,783 records at check time. Published cadence not found. |
| Parcel geometry and lot area | [Parcel Polygon](https://data-roseville.opendata.arcgis.com/datasets/e926c66d03c94558b1522c0ecbb407b8_1) · `https://ags.roseville.ca.us/arcgis/rest/services/PublicServices/ParcelPublishing/MapServer/1` | `APN`, `ACRES`, `EXTUSE`, `ZIPCODE`, `LASTEDITDATE` | Point-in-polygon query with `geometry=x,y`, `geometryType=esriGeometryPoint`, `inSR=4326`, `spatialRel=esriSpatialRelIntersects`; supports JSON, GeoJSON, PBF; 2,000-record response limit. | Catalog modified 2026-05-18; maximum observed `LASTEDITDATE` 2026-07-09; 59,939 records. Published cadence not found. |
| Zoning district | [Zoning](https://data-roseville.opendata.arcgis.com/datasets/9ca1584dc47243bb9dc89f793aa2e8f4_30) · `https://ags.roseville.ca.us/arcgis/rest/services/PublicServices/PropertyInformationToolLayers/MapServer/30` | `ZONING`, `ZN_CODE1..3`, `ORDINANCE_NO`, `LASTEDITDATE` | Same point-in-polygon mechanics; supports JSON, GeoJSON, PBF; 2,000-record response limit. | Catalog modified 2026-05-19; maximum observed `LASTEDITDATE` 2026-07-09; 1,491 records. Published cadence not found. |
| 100-year floodplain candidate | [Floodplain](https://data-roseville.opendata.arcgis.com/) · `https://ags.roseville.ca.us/arcgis/rest/services/PublicServices/PropertyInformationToolLayers/MapServer/2` | Layer-specific attributes require schema pinning before use. | ArcGIS spatial query. | Catalog modified 2026-05-19. Published cadence not found. |
| Specific-plan overlay candidate | [Specific Plan](https://data-roseville.opendata.arcgis.com/datasets/4c3080e9d0524fe292c30d4e080481c7_29) · `https://ags.roseville.ca.us/arcgis/rest/services/PublicServices/PropertyInformationToolLayers/MapServer/29` | Layer-specific attributes require schema pinning before use. | ArcGIS spatial query. | Catalog modified 2026-05-18. Published cadence not found. |
| Open-space/wetland-preserve candidate | [Open Space](https://data-roseville.opendata.arcgis.com/datasets/945e4084c7324a2ca97a09db2abfd867_2) · `https://ags.roseville.ca.us/arcgis/rest/services/PublicServices/ParksRecreation/MapServer/2` | Layer-specific attributes require schema pinning before use. | ArcGIS spatial query. | Catalog modified 2026-05-18. Published cadence not found. |
| Fire-hazard-severity candidate | [CAL FIRE GIS](https://www.fire.ca.gov/what-we-do/fire-resource-assessment-program/gis-mapping-and-data-analytics) and [OSFM FHSZ](https://osfm.fire.ca.gov/what-we-do/community-wildfire-preparedness-and-mitigation/fire-hazard-severity-zones) | Current adopted LRA/SRA zone and effective version must be pinned. | Download/viewer exists; exact production endpoint and Roseville adoption status not verified. | Current statewide pages checked 2026-08-03. **Requires official source verification.** |

Placer County also publishes a [GIS portal](https://www.placer.ca.gov/2842/GIS-and-Online-Maps)
and current `Public Parcels` / `Zoning OpenData` feature services. For incorporated
Roseville screening, the City layers are the narrower candidate source. County
materials explicitly direct users to recorded documents and local governing
agencies for official parcel size or use.

## Terms, attribution, and redistribution

| Source | What the official source says | Finding |
| :--- | :--- | :--- |
| Roseville GIS | The catalog disclaimer says datasets are for “general inquiries only” and that some data may be “incomplete or outdated.” | Public REST and bulk-download interfaces are exposed. No explicit statement was found granting recurring automated querying, required attribution wording, or redistribution of derived parcel-level output. **Terms blocker — Requires official source verification and owner/counsel review.** |
| Placer County GIS | The dataset notice says the data is provided “AS IS” and is “for planning purposes only.” | No authoritative boundary/title use. No explicit automation or derived-output redistribution grant was located. **Requires official source verification.** |
| U.S. Census Geocoder | The [official API documentation](https://geocoding.geo.census.gov/geocoder/Geocoding_Services_API.html) exposes single-record and batch endpoints to the general public. The 2026 [User Guide](https://www2.census.gov/geo/pdfs/maps-data/data/Census_Geocoder_User_Guide.pdf) documents batches up to 10,000 records and 5 MB. | Suitable for bounded candidate geocoding without vendor signup. No geocoder-specific SLA or explicit derivative-redistribution clause was identified. Do not infer an unrestricted production grant. **Requires official source verification.** |

No source-specific attribution string was found in the layer metadata; the
address layer identifies `Development Services, City of Roseville` as copyright
text. A conservative future report would name the agency, layer, endpoint, and
read timestamp, but that is a proposed control, not a verified legal conclusion.

## Geocoder assessment

Candidate endpoint:

`https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=<encoded>&benchmark=Public_AR_Current&format=json`

The Census documentation states that results are calculated from MAF/TIGER
address ranges. This mattered in the probe: all five addresses matched, but the
returned coordinates were street-range interpolations. A direct join from those
coordinates to Roseville polygons produced only 2/5 parcel hits and 3/5 zoning
hits. Therefore Census alone is not adequate for deterministic parcel selection.

A Roseville `Address Point` normalization step recovered official site points
for all five facilities. One address required normalization from `BLVD` to the
City layer's `BL`. Address-point joins then produced parcel and zoning candidates
for all five facilities, but two addresses returned multiple official points.
The safe behavior is to reject ambiguity, not choose the nearest or first record.

## Five-address manual spot-check

Facility addresses are corroborated by City pages, including the City footer
and the [Downtown Library Vision Plan notice](https://roseville.ca.us/articles/Downtown-Library-Vision-Plan-892.php).
APNs below are public-record test results for public facilities, never customer
data, and do not imply feasibility.

| Public facility | Census match | Direct Census-point join | City address-point result | Parcel / zoning candidate | Mismatch or refusal signal |
| :--- | :--- | :--- | :--- | :--- | :--- |
| City Hall, 311 Vernon St | exact formatted address | zoning only; parcel miss | 2 situs points | `013-124-017-000` or `013-124-018-000`; `CBD/SA-DT` | One address maps to two official points/parcels. Must refuse automatic parcel choice. |
| Downtown Library, 225 Taylor St | exact formatted address | zoning only; parcel miss | 1 situs point | `013-290-004-000`; `CMU/SA-DT` | Census point fell on street range; City point recovered polygon join. |
| Riley Library, 1501 Pleasant Grove Blvd | exact formatted address | no parcel or zoning hit | 1 secondary point after `BLVD`→`BL` normalization | `477-110-004-000`; `PR` | Abbreviation mismatch plus street interpolation. Normalization must be explicit and tested. |
| Maidu Library, 1530 Maidu Dr | exact formatted address | parcel + zoning hit | 1 secondary point | `469-020-004-000`; `PR` | Census happened to intersect the large park parcel; this success does not remove interpolation risk. |
| Maidu Community Center, 1550 Maidu Dr | exact formatted address | parcel + zoning hit | 2 situs points | `469-020-004-000` or `469-020-005-000`; `PR` | One address maps to two park parcels. Must refuse automatic parcel choice. |

Probe summary: Census 5/5 address matches; direct Census-coordinate parcel join
2/5; direct zoning join 3/5; City address-point lookup 5/5 after one explicit
normalization; 2/5 addresses remained parcel-ambiguous. Exact values were read
2026-08-04 UTC and may change.

## Freshness and staleness controls

No official update cadence was found for the City address, parcel, zoning, or
overlay layers. The portal-level DCAT `modified` timestamp is not sufficient by
itself: observed feature `LASTEDITDATE` maxima were later than catalog modified
dates. A future adapter would need to record at least:

1. endpoint and layer ID;
2. schema fingerprint;
3. query/read timestamp;
4. catalog `modified` value;
5. maximum source `LASTEDITDATE` where present;
6. configured maximum age approved by an owner-adopted decision;
7. fail-closed behavior when any marker is absent, regresses, or exceeds policy.

No maximum-age policy is adopted. **Requires official source verification.**

## Coverage matrix row

| Jurisdiction | Parcel layer | Zoning layer | Overlays | Status |
| :--- | :--- | :--- | :--- | :--- |
| Roseville | City `Parcel Polygon` MapServer/1: geometry, `APN`, `ACRES`; queryable | City `Zoning` MapServer/30: zoning codes and ordinance field; queryable | Floodplain, Specific Plan, and Open Space are queryable candidates; current FHSZ endpoint/adoption and historic overlay remain unverified | **partial — technical sources verified; terms, cadence, FHSZ/historic coverage, and ambiguity policy open** |

## California ADU statutory-floor citations

Collected for owner/counsel; these are not builder-supplied rules and are not
approved for implementation.

- [Government Code §66314](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=66314.) includes the 1,200-square-foot detached cap, no-more-than-four-foot side/rear setback rule, and parking constraints; effective text notes a 2026 amendment.
- [Government Code §66321](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=66321.) includes minimum local maximum-size allowances, the 800-square-foot/four-foot floor, and height floors; effective text notes a 2026 amendment.
- [Government Code §66323](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=66323.) describes ministerial categories including a detached unit on a qualifying single-family lot, subject to stated size/height/setback conditions; effective text notes a 2026 amendment.
- [Government Code §66333](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=66333.) addresses JADU ordinance conditions; effective text notes a 2026 amendment.

**All statutory-floor interpretation requires owner/counsel verification before
any rules table, public copy, screening logic, or client-facing use.**

## Assumptions

- Roseville remains the first jurisdiction selected by TASK-0009.
- Public City facility addresses are acceptable non-customer test fixtures.
- Layer availability observed during the manual probe does not imply SLA.

## Risks and unknowns

- Automated querying, attribution, caching, and redistribution permissions are
  not explicit in the located City/County notices.
- Address points can be duplicated or span multiple parcels.
- A street-address geocoder can land on a right-of-way rather than a parcel.
- FHSZ source version and Roseville LRA adoption status are not pinned.
- No historic-district polygon source was verified.
- No source cadence or approved maximum staleness threshold exists.
- ArcGIS schemas, layer IDs, codes, or endpoints may change without notice.
- A public record remains screening evidence, not a zoning/buildability result.

## Requires official source verification

Before implementation, obtain written or otherwise authoritative confirmation
for City/County automated-query, attribution, caching, and derived-output terms;
pin FHSZ and any historic overlay; define freshness policy; and have owner/counsel
verify current statutory text and report language.

## Synthesis

Roseville has enough public technical coverage to justify a future bounded
adapter design, but not enough verified authority or ambiguity policy to build
or publish one. The strongest candidate sequence is Census as a non-authoritative
address candidate, Roseville Address Point normalization, then parcel/zoning
spatial joins. Any zero-match, multi-point, multi-parcel, stale, schema-drift, or
source-down condition must refuse a parcel-specific output and route to
OwnerReview. No implementation is authorized by this packet.

