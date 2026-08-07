# BRIEF — PRODUCT-001 original parametric ADU catalog foundation

## Anchor

- Repository: `WEST-COAST-KBP-ADU/construction-os`
- Product base: `main@03d651cd61555108e655b396697c15c5c92a30db`
- Issue: #62
- Author lane: ChatGPT Operational Lead
- Required reviewer: Fable 5 at the exact result SHA
- Owner: Tony; only Tony merges

## Single outcome

Freeze the minimum product architecture needed to build a West Coast KBP-owned
parametric ADU catalog while keeping municipal information in a separate,
non-authoritative reference compatibility layer.

## Current-state evidence

The existing Concept Studio already has a deterministic `config/1` candidate,
an immutable catalog release, three conceptual archetype slots, compatibility
rules, replay hashing, tests, and repository-controlled conceptual imagery.
Those assets are a useful UI prototype. They are not technical 2D/3D models,
permit documents, or evidence that any jurisdiction accepts a design.

PR #61 preserves primary-source research about selected municipal programs.
That evidence may inform later jurisdiction profiles, but rights to municipal
drawings are no longer a product prerequisite and the PR is not an input to
West Coast KBP model geometry.

## Required records

1. `DECISION.md` — the accepted Owner decision and consequences.
2. `STARTER-CATALOG.md` — the first three owned model families and their bounds.
3. `MODEL-CONTRACT.md` — the versioned model/release contract.
4. `JURISDICTION-COMPATIBILITY-CONTRACT.md` — the evidence and evaluation layer.
5. `OUTCOME.md` — what this slice closes and what it deliberately leaves open.

## Acceptance

- No municipal drawing can enter model provenance or geometry inputs.
- No third-party model licence is required for the first catalog.
- Every model family has an immutable version, provenance, maturity state,
  parameter envelope, geometry artifact references, and validation evidence.
- Jurisdiction profiles cite official sources, expire, and are evaluated without
  modifying model geometry.
- Evaluation fails closed and never means approval, eligibility, buildability,
  code compliance, or permit readiness.
- The next implementation slice can be cut without reopening the product choice.

## Non-goals

No CAD/BIM implementation, generated permit sheets, structural or MEP design,
parcel screening, municipal-plan ingestion, rights outreach, legal conclusion,
UI mutation, dependency change, deployment, production promotion, or merge.
