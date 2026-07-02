# TASK-0001: Create the SourceTrue skeleton

- **Status:** done
- **Date approved:** 2026-07-02
- **Approved by:** owner (chat instruction: SourceTrue is created from scratch;
  structure delegated to the engineering assistant)
- **Related:** DR-0001

## Objective

Create the initial SourceTrue structure inside `governance/`: charter,
boundaries, architecture records, decision records for already-made owner
decisions, templates for all record types, and registries for tasks, research,
and evidence.

## In scope

- New files under `governance/` only
- A short pointer section in the repository root `README.md`
- Recording five already-made owner decisions as DR-0001…DR-0005

## Out of scope / prohibited

- Any application code
- Any provider configuration, phone routing, or deployment change
- Any Google Workspace action
- Any new decision not already made by the owner

## Acceptance criteria

- `governance/` contains README, charter, BOUNDARIES, architecture map, voice
  lab record, risk register, five adopted decision records, five templates, and
  registries for tasks/research/evidence
- No PII, secrets, transcripts, or runtime code anywhere under `governance/`
- Merged to `main`

## Evidence plan

RUN-0001: timestamp, event type, accept/reject result, sanitized summary.

## Boundary check

- [x] Work stays inside BOUNDARIES.md
- [x] No provider configuration or external action
- [x] Evidence plan uses only whitelisted lab-safe fields
