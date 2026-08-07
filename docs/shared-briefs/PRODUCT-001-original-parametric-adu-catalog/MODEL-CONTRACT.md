# MODEL CONTRACT — `adu-model/1`

## Purpose

`adu-model/1` is the canonical immutable description of one released West Coast
KBP model-family version. Presentation configuration (`config/1`) may reference
it but may not replace it.

## Required top-level fields

| Field | Contract |
| --- | --- |
| `schema` | Exact value `adu-model/1`. |
| `model_id` | Stable family identifier such as `adu-a-600`. |
| `version` | Immutable semantic release version. |
| `maturity` | `concept_only`, `design_validated`, `engineering_reviewed`, or `permit_package`. |
| `title` | Human-readable owned model name. |
| `program` | Story, bedroom, bathroom, occupancy/use assumptions. |
| `envelope` | Area, width, depth, height, increment grid, and family invariants. |
| `parameters` | Typed parameters, units, allow-lists/ranges, defaults, and dependencies. |
| `constraints` | Machine-evaluable intra-model allow/deny rules and reason codes. |
| `geometry` | Canonical source ref, format, coordinate/unit contract, and digest. |
| `derived_artifacts` | Versioned plan/elevation/render refs and digests. |
| `provenance` | Ownership assertion and origin evidence. |
| `validation` | Validator version, checks, evidence refs, and terminal result. |
| `released_at` | UTC timestamp. |

## Provenance rule

`provenance.origin` must be `west_coast_kbp_original` for the starter catalog.
It must identify the repository-controlled creation record and attest that no
municipal or third-party drawing was used as geometry input. Reference material
may be recorded only in a separate research/evidence record and cannot appear
as a geometry source.

## Parameter rule

Each parameter declares:

- stable key;
- semantic category: `geometry`, `layout`, or `presentation`;
- value type and unit;
- range or enum allow-list;
- increment where numeric;
- default;
- affected derived artifacts;
- validation rule IDs.

Configurations outside the released parameter envelope are refused. Silent
clamping, inferred defaults for unknown keys, and best-effort geometry are
forbidden.

## Geometry rule

The canonical geometry source is deterministic and digest-bound. Generated 2D
views and renders are derived artifacts, not parallel sources of truth. A byte
or semantic geometry change requires a new model version, refreshed derived
artifacts, and rerun validation.

The existing repository-controlled Studio images may remain presentation
assets, but they cannot populate `geometry.source_ref` or prove technical-model
validation.

## Validation rule

A release fails closed unless all required checks for its maturity state are
present and successful. Minimum `concept_only` checks are:

- schema and identifier validity;
- parameter range and increment validity;
- gross-area and footprint envelope consistency;
- constraint evaluation for every published default/variant;
- deterministic geometry digest;
- derived-artifact binding;
- provenance completeness;
- replay stability.

Higher maturity states require separate, explicitly adopted evidence sets. No
jurisdiction profile can promote model maturity.

## Release and configuration binding

A user configuration binds exact `model_id`, `model_version`, catalog release,
parameter values, disclaimer version, and configuration hash. Replaying the
same canonical input must produce the same configuration and artifact bindings.

Unknown models, versions, parameters, rules, artifacts, or digests are terminal
errors. Mutable aliases such as `latest` are forbidden in persisted records.
