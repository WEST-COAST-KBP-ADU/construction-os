# DECISION — GEOMETRY-PROGRAM-001 · D01–D13 package

**Status: OWNER ADOPTED AS V1 PRODUCT BASIS — 2026-08-09.** Tony adopted D01–D13
as one package in Issue #115 comment `5234481099`, against reviewed SVG head
`085353bf0f7d3bec86eb7c9a46977bde9f822d9a`, artifact SHA-256
`54cb40a6212916d83ab5638ae05330d113a06dc9c09a03fe5f120875f03da5f4`, and the
exact-head no-blocking verdict in comment `5234465734`. D08 remains open, D09
remains intent-only, and the D04 detail remains deferred for S450/B800.

## The decisions

| ID | Decision | Proposed value | What adopting it commits |
| :-- | :-- | :-- | :-- |
| **D01** | Footprint | A600 gross envelope **20 ft × 30 ft = 600 sq ft** (S450 18×25, B800 25×32) | Fixes the area band all three families are designed and validated against. Recomputed exactly from the candidate; consistent across #111, #113, #114. |
| **D02** | Area budgets | Family planning budgets as published in #111; the A600 candidate tiles the envelope with **zero delta** | Budgets stay test-fit targets, never generators of room polygons. A profile that misses its budget fails review, not the schema. |
| **D03** | Adjacency | The published A600 graph: entry → hall → bedroom / bath / living, kitchen–living, living–storage; entry–hall is an **open boundary**, not a door | Fixes circulation topology for the family. Changing it later re-authors partitions, openings, and the plan. |
| **D04** | Facade roles | **FRONT** entry · **RIGHT** service · **REAR** primary daylight · **LEFT** secondary | Sets which facade carries which job across the whole line. *Open nuance:* the A600 candidate puts the kitchen window on LEFT while RIGHT holds storage/mech — pin what "service facade" means family-wide before S450/B800. |
| **D05** | Roof | **Gable 4:12**, ridge parallel to depth (+y), front/rear gable ends, nominal 12-in eave, 9-ft wall plate | Fixes massing and the silhouette every render and elevation inherits. Ridge height is deliberately **not** adopted (~12'4" implied, under the 16-ft envelope). |
| **D06** | Entry datum | Nominal **3 ft × 6 ft 8 in**; nominal, rough cut, and net clear stay three separate fields | Kills the `6.8 ft` ambiguity permanently. Net clear stays **unknown** until manufacturer evidence exists — no invented value. |
| **D07** | Opening policy | Room-driven schedule; **one host per opening**; every cut strictly inside its host's clear run | Three A600 rows were moved off wall junctions to satisfy this. Adopting the policy means openings that collide with junctions refuse rather than being tolerated. |
| **D08** | Assembly thickness | **Remains open — do not adopt** | Both engineering lanes agree this is not decidable yet. Wall bands in the drawing are disclaimed graphics, not thicknesses. Structural and rated-assembly truth is professional work. |
| **D09** | Universal-ready | Adopt as **intent only** | Design intent recorded; no accessibility or code compliance is claimed or implied. Interpretation requires an authorized professional. |
| **D10** | Mirroring | **No implicit mirroring.** A mirrored variant is a new profile version with fully re-authored coordinates, order, normals, and handing | Prevents a negative-scale transform from silently destabilizing handing and identity. The first fork verdict caught the drawing itself violating this — it is now corrected. |
| **D11** | Precision | Authored geometry in **integer 1/16-inch (q16)**; RFC 8785 canonical JSON; SHA-256 digests; rational pitch | Makes geometry byte-reproducible across tools. Already implemented and merged in the schema layer. |
| **D12** | Material slots | Semantic slots only — no manufacturer, SKU, price, availability, or procurement data inside geometry | Keeps product identity and offers out of the geometric truth layer. Verified absent from the candidate. |
| **D13** | Lead family | **`adu-a-600` first** | A600 exercises bedroom partition, wet core, and circulation. S450 would leave partition semantics untested; B800 carries unresolved split-bedroom topology. |

## What you are actually deciding

Not thirteen separate things. One thing: **whether this is the shape of the
West Coast KBP model line.** D01–D05 and D13 are product identity — footprint,
program, circulation, facade logic, silhouette, and which family leads. D06,
D07, D10, D11, D12 are engineering policy that protects that identity from
drifting. D08 and D09 are explicitly left open because deciding them now would
be claiming professional findings that do not exist.

## Adoption identity

The Owner decision adopts product-shape policy, not professional or buildable
geometry. The executable transcription is a separate immutable object. Its
profile digest, reviewed SVG identity, Owner-decision comment, exact-head verdict,
and field-by-field transcription record are bound in `OUTCOME.md`. Any authored
profile value change requires a new profile version and review.

## What happens after adoption

`A600-EXECUTABLE-PROFILE-001` materializes the repository-owned concept profile
against the merged schema. D08 remains machine-visible and blocks STEP, GLB, and
render materialization. An authorized California design professional test-fit
and the remaining gates are still required before any maturity promotion.

## Standing limits

Adopting this package makes no permit, code, structural, energy, site-fit,
price, schedule, or construction-readiness claim, and promotes no model beyond
`concept_only`.
