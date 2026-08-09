# BRIEF — GEOMETRY-PROGRAM-001

One page of state for the executable-geometry program. Written because the
program's history is spread across six long Issue comments in #111, #113, #114,
and #115, and no single surface says where it stands.

## Anchor

- Repository: `WEST-COAST-KBP-ADU/construction-os`
- `main` at authoring: `5c6b48d`
- Artifact under review: PR #119, head `36aba39`, one file
  `docs/design/a600/A600-CONCEPT-TESTFIT-001.svg`
- Fork gate: Issue #115 — critical-fork review lane per `OPERATING-MODEL-v4`
- Owner: Tony. Only Tony adopts the decision package and merges.

## What this program is

The catalog adopted in PRODUCT-001 (`STARTER-CATALOG.md`) declares three owned
model families — `adu-s-450`, `adu-a-600`, `adu-b-800` — all at maturity
`concept_only`. `MODEL-CONTRACT.md` requires each released model to bind a
canonical, digest-bound geometry source, and forbids derived views from acting
as a parallel truth.

That geometry does not exist yet. The current `adu-geometry-source/1` records
are declaration envelopes: rectangle derivation, massing limits, area fractions,
a coarse entry, and facade-level window counts. They carry no plan topology, no
wall or junction solids, no roof graph, and no opening placement. A renderer
handed those records would have to invent the missing semantics.

This program closes that gap for the lead family, `adu-a-600`, and establishes
the pattern the other two follow.

## Why it gates everything downstream

Once geometry is adopted it becomes the digest that `/models`, model detail
pages, comparison, the Studio migration off legacy catalog `2026.08.0`, and
every model-bound render on the public surface bind to. Changing it later means
a new profile version, re-rendered assets, and re-review of everything derived.
It is the most irreversible product decision after the company name — which is
why it runs through an adversarial fork gate rather than straight to the Owner.

## Where it stands

**Built and merged.** The schema layer is complete and on `main`:
`adu-executable-geometry/1` with 38 stable refusal codes, RFC 8785 canonical
JSON, integer 1/16-inch geometry, area accounting by exact sum, one-host opening
ownership, explicit roof topology, and no transform or default fields. Its 24
adversarial mutation probes all refuse with exact code and JSON Pointer
(`main@bd74c19`, PR #125). The validator cannot be filled in by a renderer:
every missing semantic is terminal.

**Under review.** The A600 candidate test-fit — an exact-coordinate editable SVG
carrying six decision frames: truth boundary, program and adjacency, dimensioned
plan, opening schedule, roof and section logic, and the D01–D13 delta. It is a
decision artifact, not adopted geometry.

**Not started, correctly blocked.** `ADU-A600-EXECUTABLE-PROFILE-001` — authoring
the real profile — waits on a clean fork verdict, the Owner's D01–D13 adoption,
and an authorized California design professional's test fit.

## Review history

Three cycles, seven defects found and corrected. Every one was real.

| Cycle | Head | Verdict | Found |
| :-- | :-- | :-- | :-- |
| 1 | `8f6c63c1` | `BLOCKED FOR DESIGN REVISION` | Plan rendered as a reflection of the declared coordinate frame, inverting every handed reading; adjacency graph drew two relations with no supporting opening; three opening rows collided with wall junctions and would refuse under the schema |
| 2 | `15586303` | `BLOCKED FOR DESIGN REVISION` | Revised opening rows carried no provenance for their divergence from #114; ENTRY–HALL edge claimed to be opening-derived when no opening exists; roof plan kept the old FRONT/REAR orientation after frame 02 was re-projected; section drawn at 6.86:12 against its own 4:12 label |
| 3 | `36aba39` | pending | — |

The cost of skipping this gate would have been those defects entering the
adopted geometry, then the catalog, then the renders, then the public surface.

## Independently verified at head `36aba39`

Recomputed from the integer q16 coordinates rather than the rendered points: all
seven zone polygons close, each declared area matches its exact shoelace with
zero error, all seven are counter-clockwise in model orientation per the schema,
and they sum to exactly 600 sq ft against the 20×30 envelope. Section slopes
measure exactly 4:12 on both the roof path and the pitch indicator. The
y-flipped projection group contains no text nodes, so no glyph is mirrored.
Artifact SHA-256 `5862cbb56a708f801bc0541dcb7c32ea309ad83d8d099c26068b624dde534ea3`.

## What is not claimed

The artifact makes no professional architectural, code, accessibility, egress,
structural, energy, MEP, fire/WUI, site-fit, permit, price, schedule, or
construction-readiness claim. Furniture and circulation feasibility are
unverified and declared so. Assembly thicknesses (D08) remain deliberately
unresolved. These stay visibly unknown rather than being filled in.

## Open decisions

The D01–D13 package is in `DECISION.md` — one page, one line per decision, with
what accepting each one commits the product to. That file is the Owner surface;
this brief is the context behind it.
