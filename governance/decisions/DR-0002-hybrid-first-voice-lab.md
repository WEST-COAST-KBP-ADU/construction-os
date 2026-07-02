# DR-0002: Hybrid-first voice lab; media plane separate from Next.js

- **Status:** adopted
- **Date:** 2026-07-02
- **Decider:** owner
- **Related:** `architecture/voice-lab.md`, RP (voice research, pre-repo), DR-0005

## Context

The voice receptionist is brand-critical and must reach premium, low-latency,
interruption-capable quality. Building an OpenAI-Realtime-only stack first and
rebuilding into a hybrid later risks duplicated work. External research
(unverified, zero authority) suggests hybrid stacks offer stronger long-term
control at higher engineering complexity.

## Decision

1. The voice lab targets a **hybrid architecture** from the start:
   carrier/SIP → media/orchestration → STT → LLM → TTS, with distinct,
   swappable providers per role.
2. The **real-time media plane is a separate service**, not part of the
   Next.js application. Next.js remains the control/artifact layer only.
   Serverless runtimes cannot hold long-lived media sessions.
3. **No vendor is selected in any role.** Selection requires the Research Gate
   (DR-0005) with officially verified latency, retention, pricing, and language
   quality facts.

## Alternatives considered

- **OpenAI Realtime end-to-end first** — fastest prototype; rejected as the
  primary path due to rebuild risk, though it may still serve as a private lab
  reference point.
- **Provider full-stack (e.g. Telnyx end-to-end)** — remains a production
  candidate; not chosen pre-research.

## Consequences

- The lab proves the vendor-independent chain (guardrails → artifact →
  OwnerReview packet) in text mode before any audio work.
- The media layer is chosen last, since it carries the highest lock-in.
- Higher engineering complexity is accepted in exchange for control and voice
  quality.

## Revisit trigger

Live lab evidence showing a single-vendor stack meets the premium latency and
interruption bar at acceptable cost and retention terms.

## Boundary check

- [x] No PII, secrets, transcripts, or recordings introduced
- [x] No external action authorized implicitly
- [x] Research claims verified or marked "Requires official source verification"
