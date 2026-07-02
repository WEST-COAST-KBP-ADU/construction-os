# TASK-0003: Text-mode intake lab — guardrails, artifact, packet builder

- **Status:** done
- **Date approved:** 2026-07-02
- **Approved by:** owner (chat approval: "делай оба")
- **Related:** DR-0002, DR-0004, DR-0006, `architecture/platform-map.md` (build
  sequencing steps 3–6)

## Objective

First lab code: prove the vendor-independent chain
`guardrails → sanitized intake artifact → OwnerReview packet candidate` in
text mode on synthetic data only.

## In scope

- Library code under `src/lib/lab/`:
  - deterministic guardrail module (restricted-claim screening + refusal
    templates + PII sanitizer)
  - sanitized intake artifact schema, whitelist builder, validator
  - OwnerReview packet candidate builder with restricted-claim checklist
- Unit tests for all three modules (test runner dev-dependency permitted)
- `src/lib/lab/README.md` marking lab status

## Out of scope / prohibited

- Any provider configuration or network call
- Any UI, route, or deploy-facing change
- Any real data; synthetic fixtures only
- Any persistence beyond in-memory values returned to the caller

## Acceptance criteria

- Guardrails block price/schedule promises and permit/code/zoning/buildability/
  legal/financing conclusions, with a refusal template per class
- PII (phone, email, street address, APN-like identifiers) never survives into
  an artifact; unknown fields are structurally dropped
- Packet builder emits a candidate with priority, reasoning, missing-info list,
  single proposed next action, and a restricted-claim checklist
- Tests pass; `next build` and lint remain green
- Merged to `main`

## Evidence plan

RUN-0003: timestamp, test variant ID, event type, accept/reject result,
sanitized summary.

## Boundary check

- [x] Work stays inside BOUNDARIES.md
- [x] No provider configuration or external action
- [x] Evidence plan uses only whitelisted lab-safe fields
