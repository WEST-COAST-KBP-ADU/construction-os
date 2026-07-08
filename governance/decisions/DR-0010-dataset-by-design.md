# DR-0010: Dataset-by-design principle

- **Status:** proposed — awaiting owner approval
- **Date:** 2026-07-04
- **Decider:** owner
- **Related:** RP-0006, DR-0004 (minimal retention), DR-0006 (operations),
  charter (evidence model)

## Context

Training-grade data is a strategic asset ("new oil"), and the platform
already produces structured, labeled, provenance-carrying records as a side
effect of its controlled-execution design. Whether that exhaust becomes a
usable proprietary dataset depends on design discipline applied from day one
— it cannot be retrofitted onto unversioned, unlabeled records later.

## Decision (proposed)

Four standing rules for everything the platform builds:

1. **Versioned schemas.** Every artifact type (intake, lead packet, screening
   result, run record) carries an explicit `schemaVersion`; schema changes are
   recorded, never silent.
2. **Verdicts are labels.** Every owner decision on a candidate (approve /
   decline / edit, with optional reason) is stored as a structured verdict
   attached to the artifact it judged.
3. **Sanitized dataset lane.** Whitelisted, PII-free structured records and
   verdicts are retained long-term as the platform dataset. This lane is
   distinct from — and does not weaken — DR-0004: raw audio, transcripts, and
   identities remain non-retained.
4. **Jurisdiction facts table.** Observed, dated facts (permit submission →
   approval durations per city, fee events) accumulate as a verified-facts
   dataset; it also feeds the public permit-timeline resource (RP-0004
   differentiator #1).

## Explicitly NOT decided

- No model training, fine-tuning, or data licensing is authorized.
- No new data collection from clients or callers.
- Client consent language and any production PII handling stay with the
  future production data policy DR.

## Consequences

- Builder (Codex) implements schemas with versions and verdict fields from
  the first migration; reviewer checks this in every data-touching diff.
- The lab modules (TASK-0003) gain `schemaVersion` and verdict structures in
  their next revision.

## Revisit trigger

First proposal to actually train or license on the dataset — requires its own
decision record plus privacy/legal review.

## Boundary check

- [x] No PII, secrets, transcripts, or recordings introduced
- [x] No external action authorized implicitly
- [x] Research claims verified or marked "Requires official source verification"
