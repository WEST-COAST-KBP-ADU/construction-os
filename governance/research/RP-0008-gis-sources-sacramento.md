# RP-0008: Sacramento GIS sources — City and unincorporated County

- **Status:** BLOCKED — protocol and candidate register only; **no primary
  source was fetched**. Not comparable to RP-0007 depth. Requires re-execution
  by an engineer with live network access.
- **Date:** 2026-08-04
- **Researcher:** Lane C (reviewer/architect, acting on owner assignment) —
  zero authority
- **Requested by:** owner directive 2026-08-04; DR-0014 (Sacramento leads)
- **Feeds into:** DR-0012 (proposed), `architecture/property-intelligence-v0.1.md` §5
- **Pinned repository base:** `main@cf20207f3fefa7e2fbe5efda67dffe7abb22d64d`
- **Checked:** 2026-08-04

## 0. Blocker — read first

The execution environment's network policy denies outbound HTTPS to every
official source required by this packet. Verified failure, not assumption —
the proxy rejected `CONNECT` with 403 for all of:

```
data.cityofsacramento.org              403
data.saccounty.gov                     403
data-sacramentocounty.opendata.arcgis.com  403
gis.saccounty.gov                      403
mapservices.gis.saccounty.gov          403
mapservices.gis.saccounty.net          403
services.arcgis.com                    403
hub.arcgis.com                         403
```

Search-engine access works; page retrieval does not. Consequently **nothing in
§2 was opened, queried, or read.** Field lists, terms of use, rate limits, and
update cadence cannot be established from search result summaries, and this
packet does not pretend otherwise.

RP-0007 set the standard: it recorded specific layer IDs, field names, and
per-source terms because its researcher could open the endpoints. This packet
cannot match that from here.

**Disposition — owner's choice:**

- **(a) Reassign execution** to the engineer with live web access (Lane B per
  OPERATING-MODEL role 10), who runs §3 and §4 verbatim. Recommended — the
  protocol below makes that a mechanical pass.
- **(b) Unblock this environment** for the eight hosts above, then this packet
  is re-executed here.

Either way, §3–§6 stand as the specification for the work.

## 1. Two jurisdictions, never merged

City of Sacramento and unincorporated Sacramento County are separate land-use
authorities with separate ordinances, separate permit paths, and — critically
for us — separately published layers. A parcel inside city limits is governed
by the City; a parcel in the unincorporated county is governed by the County.
Conflating them would produce authoritative-looking output attributed to the
wrong agency, which is the most damaging failure mode this product has.

They therefore occupy **two rows** in the coverage matrix, are researched
separately below, and may never share a cached observation.

A third question falls out of this and must be answered before either row is
usable: **jurisdiction determination.** Given a point, which authority governs
it? An incorporated-limits or jurisdiction boundary layer is required, and if
the point falls ambiguously (boundary tolerance, annexation lag between
sources), the correct output is a refusal, not a coin flip.

## 2. Candidate source register — UNVERIFIED

Search-derived candidates only. Every row is a lead to check, not a finding.
None was opened. Do not cite these in any visitor-facing context.

| # | Candidate | Jurisdiction | What it may provide | Status |
| :- | :-------- | :----------- | :------------------ | :----- |
| 1 | `data.cityofsacramento.org` — City open data portal | City | zoning, parcels, addresses | unverified |
| 2 | `mapservices.gis.saccounty.gov/arcgis/rest/services/CITY_of_SACRAMENTO/MapServer` — search results indicate a City zoning layer at index 3 and a General Plan layer at index 4 | City | zoning polygons, general plan | unverified; note the City service appears hosted on County infrastructure — confirm which agency is the authoritative publisher |
| 3 | `data.saccounty.gov` / `data-sacramentocounty.opendata.arcgis.com` — County GIS open data | County | parcels, address-parcel, filed parcel maps, permits | unverified |
| 4 | County Assessor parcel viewer | County | APN, assessor attributes | unverified |
| 5 | `data.sacog.org` — regional (SACOG) portal | regional | regional layers; **secondary aggregator** | unverified; prefer the originating agency over an aggregator for provenance |
| 6 | CAL FIRE FHSZ (state) | both | fire hazard severity zone | unverified |
| 7 | FEMA NFHL (federal) | both | flood zone | unverified |
| 8 | U.S. Census geocoder | both | address → coordinate | RP-0007 found it matched 5/5 addresses but parcel joins succeeded only 2/5 — re-test here |

**Row 2 carries the single most important open question in this packet:** if
the City's zoning service is published on County infrastructure, the terms of
use, update cadence, and support commitment may belong to a different agency
than the data authority. Resolve before either is treated as canonical.

## 3. Execution protocol — run per jurisdiction, twice

For **City of Sacramento**, then independently for **unincorporated Sacramento
County**, record with a direct URL and an access timestamp:

1. **Authoritative agency and dataset owner** — the agency that publishes and
   is accountable for the layer, distinguished from whoever hosts it.
2. **Endpoint** — exact service URL, layer index, service type
   (FeatureServer/MapServer), supported formats.
3. **Coverage** — geographic extent; explicitly whether it stops at
   incorporated limits.
4. **Fields** — verbatim field names for: parcel identifier/APN, lot area,
   zoning code, ordinance/plan reference, address, last-update stamp. Copy the
   names exactly; do not normalize them in this document.
5. **Query mechanics** — whether attribute and spatial queries are supported,
   pagination, max record count, whether `returnGeometry` and
   `outSR` behave as expected.
6. **Update cadence** — only if officially published. If the publisher does not
   state it, record "not published" — never infer from a timestamp.
7. **Terms of use, license, attribution, restrictions** — quote verbatim. This
   is the row most likely to kill or reshape the product; paraphrase is not
   acceptable evidence.
8. **Documented limits** — rate limits, throttling, prohibited automated
   access. Absence of a stated limit is not permission.
9. **Overlays** — fire hazard, flood, historic, specific plan; note which are
   absent rather than leaving the cell empty.
10. **Failure modes observed** — outage, schema drift, contradictory values
    between the two jurisdictions' layers.

Then, spanning both:

11. **Jurisdiction determination** — the boundary layer used, and its behavior
    at edges and recent annexations.

## 4. Fixture corpus — five public addresses per jurisdiction

Public, non-residential buildings only (city hall, library, fire station,
community center) — never a real inquiry, never a residential address.
Hand-trace each end to end: address → geocode → parcel candidate → zoning
observation, recording every mismatch, multi-parcel hit, and boundary
ambiguity.

Deliberately include at least one address near the city/county boundary. That
case, not the easy ones, determines whether jurisdiction determination works.

RP-0007's result is the benchmark to beat: 5/5 geocoded, 2/5 clean parcel
joins, 2 ambiguous. If Sacramento performs no better, that is a product
finding, not a research failure — it means the deterministic path needs a
stronger refusal surface, and the owner should know before any integration.

## 5. Coverage matrix rows — to be filled by the executing engineer

Replace the placeholder rows in
`architecture/property-intelligence-v0.1.md` §5 with these two, completed:

| Jurisdiction | Parcel layer | Zoning layer | Overlays | Status |
| :----------- | :----------- | :----------- | :------- | :----- |
| City of Sacramento | *(endpoint + layer + key fields)* | *(endpoint + layer + key fields)* | *(present / absent, named)* | *(verified / partial + what is open)* |
| Sacramento County (unincorporated) | *(same)* | *(same)* | *(same)* | *(same)* |

A row may only read "verified" when items 1–10 of §3 are answered from primary
sources for that jurisdiction. Partial is an honest and acceptable outcome;
overstating is not.

## 6. Provenance contract — required regardless of source

Whatever the sources turn out to be, every observation the platform later holds
must carry these fields, or it cannot be replayed or defended:

```
SourceObservation {
  agency            // accountable publisher, not the host
  jurisdiction      // "city-of-sacramento" | "sacramento-county-unincorporated"
  endpoint          // exact service URL
  layer             // index/name as published
  field_name        // verbatim, as published
  raw_value         // unnormalized
  retrieved_at      // UTC
  source_version    // publisher's version/stamp if any, else null
  schema_fingerprint// hash of the field list at retrieval time
  freshness_status  // "published-cadence" | "unknown" | "stale"
}
```

Two rules follow and are not negotiable later:

- `raw_value` is stored unnormalized. Normalization is a projection, applied at
  read time, never at write time — otherwise a publisher's schema change
  silently rewrites history.
- `schema_fingerprint` is what detects that change. A fingerprint mismatch is a
  refusal condition, not a warning to log.

## 7. Minimum deterministic integration path — recommendation

Assuming §3 comes back workable, the smallest defensible first integration is
**not** a live adapter:

1. **Pinned snapshot, not live queries.** Take a dated extract, record its
   fingerprint, serve from it. A live dependency on eight external hosts turns
   every visitor request into an availability and rate-limit risk before a
   single lead exists.
2. **One jurisdiction end to end first** — whichever of the two returns
   cleaner terms and fields, not whichever is larger.
3. **Refusal before coverage.** Ship the five result states
   (`matched | ambiguous | insufficient | unsupported | source_unavailable`)
   before broadening coverage. A narrow tool that refuses honestly is sellable;
   a broad one that guesses is a liability.
4. **Jurisdiction determination is a gate, not a field.** If the governing
   authority is uncertain, no observation is emitted at all.

## 8. Evidence — what was actually done here

| Action | Result |
| :----- | :----- |
| Fetch `main`, confirm base | `cf20207f3fefa7e2fbe5efda67dffe7abb22d64d` |
| Reachability probe, 8 official hosts | all 403 at proxy CONNECT |
| WebFetch probe, County open data | 403 |
| Search passes for candidate sources | 3 queries; results recorded in §2 as unverified |
| Primary sources opened | **none** |
| Fixture traces run | **none** |

## 9. Boundary check

- [x] No parcel-specific zoning, permit, feasibility, or buildability conclusion
- [x] No PII; no real inquiry address; no fixture data collected at all
- [x] No scraping, no bulk retrieval, no vendor signup, no integration activated
- [x] Unverified material labeled unverified in every instance
- [ ] Primary-source verification — **not performed; blocked**

Requires official source verification.
