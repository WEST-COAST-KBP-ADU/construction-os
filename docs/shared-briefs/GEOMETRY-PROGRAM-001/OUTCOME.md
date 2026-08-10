# OUTCOME — A600-EXECUTABLE-PROFILE-001

## Result

The Owner-adopted A600 v1 product basis is materialized as the first
repository-owned `adu-executable-geometry/1` profile and registered at
`adu-a-600@1.0.0`.

- Execution base: `main@cd893dbbb715c8e0b567158116e1de79a4a87dc1`
- Reviewed artifact head: `085353bf0f7d3bec86eb7c9a46977bde9f822d9a`
- Reviewed artifact SHA-256: `54cb40a6212916d83ab5638ae05330d113a06dc9c09a03fe5f120875f03da5f4`
- Exact-head verdict: Issue #115 comment `5234465734`
- Owner adoption: Issue #115 comment `5234481099`
- Executable profile: `src/data/studio/models/executable/adu-a-600@1.0.0.json`
- Executable profile digest: `sha256:cb29815c8b2ce306b0bf3cae4fc8810cb3cecc3adba1bfbb62c8c75421ff9afd`

## Transcription record

| Accepted artifact truth | Executable profile field |
| :-- | :-- |
| 20×30 ft gross envelope / 600 sq ft | q16 envelope `3840 × 5760`; `gross_area2_q16sq = 44236800` |
| Seven CCW zones / 144, 24, 48, 84, 60, 204, 36 sq ft | Seven ordered `plan_regions` and bound `spaces`; exact total, zero gap or overlap |
| Six undirected adjacencies | Symmetric `adjacent_space_refs`; five opening-derived pairs plus ENTRY–HALL open boundary |
| Twelve schedule openings | Twelve unique `openings`, each owned by exactly one semantic wall run |
| D-BED-01 32 in; jambs 74..106 in | host `wall-bedroom-hall`; offset `32 q16`; width `512 q16`; absolute jambs `1184..1696 q16` |
| FRONT / RIGHT / REAR / LEFT roles | right-handed origin at FRONT-LEFT; +x RIGHT, +y REAR, +z UP; no transform |
| Gable 4:12; +y ridge; nominal 12-in eave; 9-ft plate | two continuous gable planes; pitch `1/3`; ridge parallel +y; `192 q16` overhang; `1728 q16` plate |
| Nominal 3 ft × 6 ft 8 in entry | nominal `576 × 1280 q16`; net clear remains null / not evaluated |
| Semantic materials only | eight semantic material slots and eight unresolved assembly slots; no commercial product fields |

The profile is authored directly as `owner_adopted`; no reviewed candidate
profile was re-minted by flipping `adoption_state`. Its identity is the profile
digest above plus this external binding to the reviewed SVG and Owner decision.
Any authored-value change requires a new profile version and review.

## D08 fail-closed boundary

D08 remains open. Floor and wall thicknesses, wall/junction solids, and roof
assembly thickness are explicit null/unresolved fields. The contract accepts
this only at `concept_only`, refuses plausible numeric thickness smuggling with
`XG_UNRESOLVED_GEOMETRY_SMUGGLED`, and refuses STEP, GLB, or render
materialization with `XG_REQUIRED_GEOMETRY_UNRESOLVED`.

## Remaining professional blockers

All eight gates remain `not_evaluated`: architectural test fit, egress openings,
universal accessibility, structural/foundation, energy, MEP, fire/WUI, and
site/jurisdiction. Door/window performance and handing where not evidenced,
net-clear dimensions, D08 assemblies, ridge/overall-height professional
conclusion, permit/code compliance, parcel fit, price, schedule, and construction
readiness remain unadopted.

## Verification

The profile suite covers strict duplicate-key refusal, canonical replay, complete
real release/model/source binding, exact coverage and topology, opening ownership,
D-BED-01 identity, roof continuity/pitch, D08 smuggling, materialization refusal,
and zone/opening/adjacency/roof/digest/maturity/adoption/professional-gate
mutations. Final command evidence is recorded in Issue #135 RESULT and the Draft
PR.
