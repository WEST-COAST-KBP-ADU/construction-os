# OUTCOME — PRODUCT-001

## Result

The Owner's product choice is converted into a bounded repository architecture:

- West Coast KBP owns and versions the model geometry;
- the minimum catalog contains three model families: compact studio, one
  bedroom, and two bedroom;
- `adu-model/1` separates technical model releases from presentation
  configurations;
- `jurisdiction-profile/1` and `jurisdiction-evaluation/1` keep municipal facts
  in a cited, expiring, fail-closed reference layer;
- municipal drawings and third-party model licences are outside the geometry
  pipeline and are not starter-catalog dependencies.

## Current-state disposition

- Existing Concept Studio archetypes and deterministic configuration machinery
  remain unchanged and may be migrated by a later implementation slice.
- Existing conceptual images remain presentation-only.
- PR #61 is preserved as research evidence and removed from the model-creation
  critical path; it makes no product geometry decision.
- No jurisdiction profile is adopted by this slice.

## Verification

- Scope is documentation-only and limited to the six files authorized by #62.
- The four accepted decision clauses are present in `DECISION.md`.
- Three starter families and maturity boundaries are present in
  `STARTER-CATALOG.md`.
- Model, profile, and evaluation objects have distinct schemas and versioning.
- The contracts prohibit municipal geometry ingestion and fail closed on stale,
  missing, conflicting, unknown, or interpretation-dependent inputs.
- No code, asset, dependency, deployment, external contact, or merge is changed.

## Remaining gates

1. Independent Fable 5 review pinned to the exact result SHA.
2. Tony's merge decision.
3. A separate Claude Code implementation slice after the contract is on
   `main`; that slice must add machine-readable types/validators, owned catalog
   data, tests, and migration without UI or jurisdiction claims.

This outcome does not certify any design for construction or permitting.
