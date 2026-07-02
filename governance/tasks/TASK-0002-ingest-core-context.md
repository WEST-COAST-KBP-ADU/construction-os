# TASK-0002: Ingest KBP Core context package v0.1

- **Status:** done
- **Date approved:** 2026-07-02
- **Approved by:** owner (uploaded the context package to the session)
- **Related:** DR-0001, charter (Core section), `context/kbp-core-context-package-v0.1.md`

## Objective

Bring the owner-provided KBP Core context package (pinned to
`kbp-core-engineering/kbp-core` `main` @ `bb52a6f`) into SourceTrue as a
zero-authority projection, and synthesize a Core-compatibility architecture
record defining what Construction OS may design now (contracts-first) and what
is prohibited.

## In scope

- Store the package verbatim under `governance/context/` with a registry README
- New record `governance/architecture/core-compatibility.md`, including a DRAFT
  (not adopted) candidate domain operation vocabulary with honest effect classes
- Pointer updates in `charter.md` and `governance/README.md`

## Out of scope / prohibited

- Any application code or automation
- Any write, PR, or design flowing back into kbp-core
- Any claim of live Core integration
- Adopting the operation vocabulary (requires its own decision record)

## Acceptance criteria

- Package stored verbatim with pin recorded; registry lists it
- Core-compatibility record marks every inherited claim as pinned and
  re-verification-required
- Draft vocabulary maps AI-free work to `local_write` and all client-facing /
  money / permit operations to approval-required effect classes
- Merged to `main`

## Evidence plan

RUN-0002: timestamp, event type, accept/reject result, sanitized summary.

## Boundary check

- [x] Work stays inside BOUNDARIES.md
- [x] No provider configuration or external action
- [x] Evidence plan uses only whitelisted lab-safe fields
