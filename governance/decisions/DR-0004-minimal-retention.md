# DR-0004: Minimal retention / no-PII default boundary

- **Status:** adopted
- **Date:** 2026-07-02
- **Decider:** owner
- **Related:** BOUNDARIES.md, R-02/R-03 in the risk register

## Context

The platform will eventually touch inquiries tied to real people and
properties. External research recommended durable transcript logging and call
recording persistence; the owner explicitly declined both.

## Decision

Default rule across the platform: **minimal retention, no production PII
persistence, no recording retention, no transcript retention.** Lab evidence is
limited to the whitelisted fields in BOUNDARIES.md (timestamp, test variant ID,
event type, accept/reject result, latency marker, error class, sanitized
non-PII summary). Anything not whitelisted is not recorded.

Any recording or transcript retention requires separate owner approval and a
privacy/legal review, recorded as a superseding decision record.

## Consequences

- Sanitization must be structural (schema whitelists), not best-effort
  filtering.
- Provider selection must verify each vendor's default retention and
  training-use policies against official sources.
- The recommendation to log durable transcripts is formally **not adopted**.

## Revisit trigger

A production workflow that legally or operationally requires retention,
reviewed by privacy/legal counsel and approved by the owner.

## Boundary check

- [x] No PII, secrets, transcripts, or recordings introduced
- [x] No external action authorized implicitly
- [x] Research claims verified or marked "Requires official source verification"
