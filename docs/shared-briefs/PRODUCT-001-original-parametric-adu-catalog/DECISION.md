# DECISION — Build an original parametric ADU catalog

- Status: **ACCEPTED BY OWNER**
- Owner decision date: 2026-08-06 (America/Los_Angeles)
- Repository record: Issue #62 / PRODUCT-001

## Decision

West Coast KBP will create and maintain its own parameterized ADU model
families.

Municipal programs are a reference layer for requirements, constraints,
submission procedures, code-cycle evidence, and review questions. Municipal
drawings are not product geometry inputs and will not be copied, traced,
converted, transformed, or used to derive West Coast KBP 2D/3D models.

Licensing third-party model geometry is outside the current phase and is not a
dependency for the starter catalog.

## Product boundary

The product has two independent versioned objects:

1. **Owned model release** — West Coast KBP geometry, parameters, layouts,
   provenance, validation evidence, and presentation artifacts.
2. **Jurisdiction reference profile** — official-source requirements,
   constraints, submission facts, currency metadata, and bounded evaluation
   rules.

The jurisdiction layer may evaluate a model release. It may not mutate, patch,
or generate model geometry. A model change always creates a new owned model
version and must be justified by West Coast KBP design intent and validation,
not by copying an external drawing.

## Consequences

- The first catalog can proceed without a rights gate for municipal drawings.
- PR #61 remains useful evidence about municipal programs but is not on the
  critical path for model creation.
- Existing Studio images remain conceptual presentation assets; they do not
  become technical geometry by this decision.
- Jurisdiction-specific claims require current official evidence and a separate
  evaluation record.
- Any future proposal to ingest or license third-party geometry requires a new
  Owner decision record before implementation.

## Explicitly not decided

This decision does not approve a construction design, establish code
compliance, select a CAD/BIM authoring stack, authorize professional services,
or claim that a model can be permitted or built on a specific parcel.
