# STARTER CATALOG — Minimum owned ADU model families

## Catalog release target

The minimum start is three one-story detached ADU model families. They cover
the smallest useful range without multiplying layouts before the model contract
and validation pipeline are proven.

| Family ID | Working name | Program | Gross-area envelope | Footprint envelope | Initial maturity |
| --- | --- | --- | ---: | --- | --- |
| `adu-s-450` | Compact Studio | studio / 1 bath | 400–500 sq ft | width 16–20 ft; depth 22–28 ft | `concept_only` |
| `adu-a-600` | One Bedroom | 1 bed / 1 bath | 550–650 sq ft | width 18–24 ft; depth 25–34 ft | `concept_only` |
| `adu-b-800` | Two Bedroom | 2 bed / 1 bath | 750–850 sq ft | width 22–28 ft; depth 28–38 ft | `concept_only` |

Width/depth ranges are catalog design envelopes, not a claim that every
Cartesian combination is valid. A release validator must enforce gross area,
layout, circulation, opening, roof, and other intra-model constraints.

## Parameters exposed in the first technical release

- footprint width and depth on an explicit increment grid;
- fixed one-story massing;
- family-specific layout variant;
- entry side and model orientation;
- roof form from a family-specific allow-list;
- window package from a family-specific allow-list;
- exterior wall finish and palette as presentation parameters;
- interior finish tier as a presentation parameter.

Bedrooms, bathrooms, story count, allowable area band, and structural-grid
assumptions are family invariants in the starter release. Changing an invariant
requires a new model version or a new family, not an ad hoc configuration.

## Required owned artifacts per family

1. canonical parameter definition;
2. deterministic geometry source artifact;
3. derived 2D plan/elevation views;
4. presentation renders clearly marked conceptual until promoted;
5. automated contract and geometry checks;
6. provenance record proving West Coast KBP origin;
7. release digest and change record.

## Promotion states

`concept_only → design_validated → engineering_reviewed → permit_package`

Promotion is monotonic only through a new immutable version with named evidence.
The starter catalog begins at `concept_only`. The UI must not infer a higher
state from attractive renders, dimensional data, or a jurisdiction reference
evaluation.

## Exclusions

No municipal plan IDs, municipal drawing dimensions, traced geometry, imported
PDF vectors, copied room layouts, third-party CAD/BIM files, or permit-ready
claims belong in the starter catalog.
