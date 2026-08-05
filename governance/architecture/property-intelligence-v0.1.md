# Property Intelligence v0.1 — address-first screening from public records

Status: PROPOSED design. Research Gate is **OPEN** (§8) — nothing here is
verified against a live source, because this document was written without
network access to county or state endpoints. Adoption requires DR-0012.

Origin: owner intent, 2026-08-03 — "a visitor types an address, immediately
sees what they can build, and gets a commercial offer by email."

## 1. Why this is the strongest move available

RP-0002 found that zero competitors in the market open with an address. Every
one of them opens with a contact form, which asks the visitor to pay first (with
their phone number) and receive value later. Address-first inverts that: the
visitor pays with a fact that is already public, and receives something useful
before any human touches them.

The asset is not the calculator. Every national ADU brand has a calculator, and
every one of them is a marketing toy whose numbers cannot be traced to anything.
The asset is that **our answer is a citation, not a claim** — every number on
the report points at the public record it came from, on the date it was read.
That is the one thing a competitor with a bigger ad budget cannot copy quickly,
and it is the same thesis the evidence core is built on, applied to the top of
the funnel instead of the middle of a project.

## 2. The three layers — different certainty, different permission

The single most important structural decision: the report is not one number. It
is three layers, each with its own truth status, visibly separated.

### Layer 1 — Record (quotation, zero interpretation)

Verbatim attributes read from public government sources, each carrying source,
layer, and read date:

- parcel identifier, lot area, parcel geometry
- zoning district code as published by the jurisdiction
- overlay flags: fire hazard severity zone, flood zone, historic district
- existing structure footprint where the jurisdiction publishes it

We assert nothing here. We quote and link. A quotation of a public record is
not a zoning conclusion, which is what makes this layer publishable at all.

### Layer 2 — Statutory floor (deterministic rules, no interpretation)

California ADU statute sets minimums that a local agency may not go below.
Because they are floors rather than local discretion, they can be evaluated
deterministically from Layer 1 attributes without reading any specific city's
code — and a floor is the safest possible number to show, because local rules
can only be more permissive than it, never less.

The evaluation is a **versioned rules table**, not code and not a model:

```
rules/state-adu-floor.<version>.json
  effective_from, source_citation, verified_by, verified_on
  categories[]: { trigger conditions on Layer 1 attributes,
                  permitted category, required wording }
```

Every numeric value in that table is an input supplied and verified by the owner
against the official statute — never a number invented by an engineer or a
model. The table is dated and superseded, never edited in place, so any report
can be replayed against the rules that were in force when it was issued.

Output wording is categorical, never parcel-specific promise:

> Lots with these published attributes fall in the category where state law
> requires the jurisdiction to permit a detached ADU of up to <category>.
> Requires official source verification.

### Layer 3 — Indicative range (from the owner's pre-approved price book)

This is the mechanism that makes "instant offer" possible without any system
ever promising a price.

The owner approves, once, a price book: ADU type × size band → range, with a
validity date. The system does not compute, estimate, negotiate, or infer a
price. It performs a **lookup** in a document the owner already signed, and
prints the range with its validity date attached.

```
pricebook/<version>.json
  valid_from, valid_until, approved_by: owner, approved_on
  bands[]: { type, size_band, range_low, range_high, inclusions, exclusions }
```

When the price book expires, Layer 3 disappears from the report automatically
and the visitor sees Layers 1–2 plus an invitation to talk. Fail-closed: an
expired price book must never print a stale number.

## 3. What the visitor actually receives

Instant, on screen and by email:

- **Property Screening Report** — the three layers, sourced and dated, with
  screening-only wording on everything uncertain, and one honest paragraph
  naming what public data cannot see (§6).

What the visitor does **not** receive automatically, ever:

- a bid, a quote, a contract, a signature line, a schedule commitment
- a statement that their project is approvable, permittable, or buildable
- anything with a number that did not come from either a public record, the
  dated rules table, or the owner-signed price book

The gap between the report and a real proposal is the owner's signature, and
that gap is deliberate. It is also short: the report arrives with everything a
proposal needs already collected, so the owner's step is minutes, not hours.

## 4. Pipeline (deterministic; no model in the request path)

```
address
  → geocode                     (public geocoder; vendor choice = separate DR)
  → parcel lookup               (county GIS layer for that jurisdiction)
  → attribute extraction        (Layer 1, with provenance stamped per field)
  → rules evaluation            (Layer 2, versioned table)
  → price book lookup           (Layer 3, if valid; omitted if not)
  → report assembly             (templated; no generated prose)
  → deliver                     (screen + email from an approved template)
  → owner review packet         (candidate lead, per DR-0011 destination)
```

No LLM sits anywhere in that chain. Nothing in the visitor-facing output is
generated text. This is not a limitation to work around — a deterministic
pipeline is the only kind whose output can be replayed and defended later, and
replayability is the entire differentiator.

AI's legitimate place is beside the pipeline, not inside it: preparing the
owner's review packet, summarizing a batch of the week's screenings for the
owner, and drafting the follow-up the owner then edits and sends.

## 5. Jurisdiction coverage — start with one, not seven

Zoning and parcel data quality varies enormously between jurisdictions, and
that variance, not the software, is what will decide whether this works. The
adapter is per-jurisdiction with an explicit coverage matrix:

| Jurisdiction | Parcel layer | Zoning layer | Overlays | Status |
| :----------- | :----------- | :----------- | :------- | :----- |
| Roseville | City `Parcel Polygon` MapServer/1: geometry, `APN`, `ACRES`; queryable | City `Zoning` MapServer/30: codes and ordinance field; queryable | Floodplain, Specific Plan, and Open Space candidates verified; FHSZ/historic coverage incomplete | partial — RP-0007; terms, cadence, FHSZ/historic, and ambiguity policy open |
| **Sacramento County (unincorporated)** | County `PARCELS/MapServer/8`: `APN_DASH`, `LOTSIZE`, `SITUS_ADD1`, `GIS_JURISDICTION` | County `PLANNING/MapServer/16`: `B_ZONE`, `ZONE_ALL`, `JURISDICTION`, `OVERLAY_1..3` | SPA, flood, FHSZ, specific-plan candidates present; historic completeness open | **partial — RP-0008; fixtures, clipping, cadence, terms/license, and boundary behavior open** |
| **City of Sacramento** | County `PARCELS/MapServer/8`: `APN_DASH`, `LOTSIZE`, `SITUS_ADD1`, `GIS_JURISDICTION` | County-hosted `CITY_of_SACRAMENTO/MapServer/3`: `ZONE`, `ORDINANCE`, `CHANG_DATE` | SPD/PUD/General Plan present; fire/flood/historic/specific-plan completeness open | **partial — RP-0008; accountable publisher, terms applicability, cadence, boundary behavior, and fixtures open** |
| Elk Grove, Citrus Heights, Folsom, Rancho Cordova | ? | ? | ? | core, Sacramento ring, not started |
| Rocklin, Lincoln, Granite Bay, El Dorado Hills | ? | ? | ? | core, Placer/El Dorado ring, not started |

An address in an uncovered jurisdiction gets an honest answer — "we do not have
verified public data for this jurisdiction yet; a human will review your
request" — and still becomes a lead. Silent degradation to a guessed number is
the one failure mode that would destroy the entire premise.

Ship one jurisdiction end-to-end before adding a second. A second jurisdiction
teaches nothing that the first has not already taught, and seven half-covered
jurisdictions produce seven ways to be wrong in public.

## 6. What public data cannot see — stated to the visitor, not hidden

Named on every report, because a screening tool that hides its blind spots is
the exact thing that generates angry clients later:

- easements, deed restrictions, CC&Rs, HOA rules
- utility capacity, sewer versus septic, panel capacity
- slope, soils, drainage, tree protection
- fire access and turnaround requirements
- accuracy and currency of the jurisdiction's own published layers
- anything a plan checker will decide by judgment rather than by table

## 7. Failure modes and the required behavior

| Failure | Required behavior |
| :------ | :---------------- |
| Address not geocodable | Ask once for correction; then capture as lead, no report |
| Parcel not found | Honest miss, capture lead, no inferred parcel |
| Zoning layer absent or stale | Layers 1–2 degrade to what is sourced; never fill a gap |
| Source endpoint down | Report is not issued; visitor is told, not shown a cached number without its date |
| Price book expired | Layer 3 omitted entirely |
| Attributes contradict each other | No report; flag for owner review |

Every one of these is a refusal, and every refusal is logged as evidence. A
tool that refuses visibly is more persuasive to a homeowner who has been burned
than a tool that always has an answer.

## 8. Research Gate — open items (DR-0005)

Nothing below is verified. Each needs an external check before DR-0012 can be
adopted honestly:

1. Which charter-market jurisdictions publish parcel, zoning, and overlay
   layers as queryable public endpoints, under what terms of use.
2. Current California ADU statutory floors, verbatim from the statute, with
   citation — owner or counsel supplied, never engineer-supplied.
3. Terms of use and attribution requirements for each public source, including
   whether automated querying and redistribution of derived output is permitted.
4. Whether a free public geocoder is sufficient for the volume, or whether a
   vendor is required (vendor = separate DR).
5. Refresh cadence per source, and how staleness is disclosed on the report.
6. Legal review of the report as a document: disclaimer language, the boundary
   between screening and professional opinion, and CSLB advertising rules.
7. Whether emailing the report to a visitor requires consent handling under
   CCPA and the channel rules in DR-0007.

## 9. Relationship to the evidence core

Each issued report is a natural run: bounded inputs, a deterministic transform,
a dated artifact, and a verifiable record of which sources and which rules
version produced it. This makes the screening report a strong candidate for the
first **client-facing** document flow through the core, complementing the first
internal flow already chosen. A homeowner comparing three contractors can check
ours; that is a sales argument no competitor currently has.

Sequencing note: the core connection is gated by conditions outside this
repository and is not a dependency of shipping the report. Design the report so
the passport can attach later without changing its shape.

## 10. Boundary check

- [x] No feasibility, entitlement, permit, or buildability conclusion asserted
- [x] Required screening wording carried on every uncertain output
- [x] No price invented — Layer 3 is a lookup in an owner-signed document
- [x] No model in the visitor-facing request path
- [x] No PII persisted (DR-0011); address handled in-request only
- [x] No vendor selected; every external call remains a separate decision
- [ ] Research Gate closed — **open**, see §8
- [ ] BOUNDARIES.md amendment adopted — **required**, see DR-0012
