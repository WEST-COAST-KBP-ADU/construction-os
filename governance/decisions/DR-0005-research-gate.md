# DR-0005: Research Gate required before major decisions

- **Status:** adopted
- **Date:** 2026-07-02
- **Decider:** owner
- **Related:** `templates/research-packet.md`, BOUNDARIES.md

## Context

Vendor, infrastructure, privacy, retention, voice, automation, provider,
production, and Google Workflow decisions carry cost, lock-in, and compliance
consequences. External research tools produce useful but unverified claims.

## Decision

A **Research Gate** precedes every important decision in the areas above:

```
Owner intent → Research Gate → research packet (RP-NNNN) → synthesis
→ boundary/compliance review → external review where needed
→ owner approval → decision record → implementation task packet
```

The research role (e.g. Perplexity Research Officer) has **zero authority**: it
is not SourceTrue and not a decision maker. Research packets must separate
official vendor facts, third-party claims, assumptions, risks, unknowns, and
items requiring official verification.

## Consequences

- No provider is selected, no infrastructure decided, and no retention rule
  changed on the strength of research output alone.
- Every unverified pricing/latency/model/GA/benchmark/compliance claim carries
  the wording "Requires official source verification."

## Revisit trigger

Owner decision to streamline the gate for low-stakes decisions.

## Boundary check

- [x] No PII, secrets, transcripts, or recordings introduced
- [x] No external action authorized implicitly
- [x] Research claims verified or marked "Requires official source verification"
