# DECISION — GEOMETRY-PROGRAM-001 · D01–D13 package

**Status: NOT ADOPTED.** This file is the Owner decision surface. Nothing here
is in force until Tony adopts it and the adoption is committed. Context is in
`BRIEF.md`; the evidence is #111, #113, #114 and the fork verdicts in #115.

Adopt as a package, or revise individual rows and adopt the rest. Every row was
carried unchanged through three adversarial review cycles unless noted.

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

## Your options

**Adopt the package.** D08 stays open by design; D04's "service facade" nuance is
recorded as a follow-up before S450 and B800. This unblocks profile authoring.

**Revise rows, adopt the rest.** Name the rows to change and the replacement
values. Rows that move re-open only their own downstream work.

**Reject.** The candidate returns to design with your direction; the schema layer
already merged stays valid, since it carries no product geometry.

## Preconditions before this decision is safe to make

1. A clean fork verdict at exact head `36aba39` — the third cycle. Two prior
   verdicts are spent and cannot certify these bytes.
2. Nothing else. The professional architectural test fit is required before the
   geometry is **adopted as buildable**, not before you decide the product shape.

## What happens after adoption

`ADU-A600-EXECUTABLE-PROFILE-001` authors the real profile against the merged
schema, then an authorized California design professional test-fits it. Only
then does `/models` bind to it, Studio migrates off legacy catalog `2026.08.0`,
and model-bound renders become possible for the Home hero.

Two schema amendments from the first fork verdict fold in at profile-authoring
time: resolve the `adoption_state`-inside-digest tension so adopted bytes equal
reviewed bytes, and state the jamb-at-junction rule explicitly.

## Standing limits

Adopting this package makes no permit, code, structural, energy, site-fit,
price, schedule, or construction-readiness claim, and promotes no model beyond
`concept_only`.
