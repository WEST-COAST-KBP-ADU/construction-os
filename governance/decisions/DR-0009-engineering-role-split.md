# DR-0009: Engineering role split — builder vs. reviewer/analyst/registrar

- **Status:** adopted
- **Date:** 2026-07-04
- **Decider:** owner
- **Related:** charter (authority model), BOUNDARIES.md, DR-0005

## Context

The owner restructured the AI working model for cost efficiency and control:
day-to-day building moves to a subscription-based assistant (Codex/ChatGPT),
while the higher-cost reviewing model is reserved for high-leverage analysis.

## Decision

Two distinct AI roles, neither with approval authority:

1. **Builder (Codex/ChatGPT, owner-driven):** designs and writes
   implementation code and site content under the owner's direction. Must
   treat `governance/` as the source of truth (charter, BOUNDARIES.md,
   decision records, portal blueprint) when building.
2. **Reviewer / Analyst / Registrar (this platform's review assistant):**
   - reviews architecture and code changes for gaps, risks, boundary
     violations, Core-compatibility drift, and overclaims;
   - runs research through the Research Gate (RP-NNNN);
   - maintains SourceTrue: decision records, task packets, run records,
     risk register.
   By default it does NOT write implementation code; exceptions only by
   explicit owner request.

The owner remains the sole approval authority for both roles.

## Consequences

- Review findings are recorded in `governance/` (risk register updates,
  review notes in run records or PR comments), so the build side can act on
  them.
- Builder output that conflicts with an adopted decision record is flagged,
  not silently accepted; the owner resolves the conflict (supersede the DR or
  change the code).
- The reviewer keeps the registries current as building proceeds.

## Revisit trigger

Owner decision to change tooling or return implementation work to the
reviewer.

## Boundary check

- [x] No PII, secrets, transcripts, or recordings introduced
- [x] No external action authorized implicitly
- [x] Research claims verified or marked "Requires official source verification"
