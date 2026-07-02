# RP-0005: Voice module maturity research (VOICE-RESEARCH-001, owner-provided)

- **Status:** received + synthesized
- **Date:** 2026-07-03 (document dated June 30, 2026)
- **Researcher:** external research packet — zero authority
- **Provided by:** owner (chat, full text on file with owner); condensed
  decision-relevant extraction below
- **Feeds into:** DR-0002 execution (voice lab), future voice architecture DR

## Executive verdicts (as claimed)

- **OpenAI Realtime SIP is mature enough for a private lab prototype** (GA
  since Aug 28, 2025; gpt-realtime-2 since May 7, 2026; SIP flow officially
  documented; 1–3 days engineering). Known issues: SIP audio-init race
  condition (buffer audio until `session.created`), unsupported
  `turn_detection` fields, model set at accept step.
- **Not yet the sole production stack**: P50 ~1,080 ms / P95 ~3,200 ms latency
  and 41% interruption recovery are below premium receptionist bar
  (sub-800 ms P50 practical, sub-500 ms premium).
- **Production candidates:** Telnyx full-stack (~$0.07–0.10/min, owned-network
  latency) or ElevenLabs Conversational AI + carrier (P50 320 ms, best voice,
  ~$0.15–0.25/min). Cascaded Pipecat/LiveKit + Deepgram Flux + Cartesia Sonic
  (~40 ms TTS TTFB) is the phase-3 scale option (>5,000 min/month).
- **Defer:** gpt-realtime-2 fine-tuning (enterprise-only, Q4 2026), Hume EVI as
  primary (best barge-in 89% but P50 780 ms, 10-day Feb 2026 outage).

## Recommended phasing (as claimed)

1. **Lab (1–2 weeks):** Architecture A — OpenAI Realtime SIP + Twilio/Telnyx
   trunk; validate accept/reject webhook gate, safe intake, first OwnerReview
   packet from a real call. ~$15–70/month at 50 calls × 3 min.
2. **Production (4–8 weeks later):** Architecture C (Telnyx) or D (ElevenLabs +
   Telnyx) depending on voice-quality priority.
3. **Scale:** Architecture E (cascaded custom) past ~5,000 min/month.

Latency reference (P50/P95, June 2026 benchmarks): ElevenLabs 320/1,120 ms ·
Telnyx est. 350–450/1,000–1,500 ms · Twilio→bridge→OpenAI 850–950/~2,500 ms ·
OpenAI direct 1,080/3,200 ms · Hume 780/2,400 ms.

Pricing all-in per minute: A $0.12–0.50 · B (Twilio CR + GPT-4o) $0.08–0.15 ·
C $0.07–0.10 · D $0.15–0.25 · E $0.06–0.10.

## Alignment with our governance

- Confirms DR-0002 (hybrid-first, media plane separate, vendor-per-role) and
  the RP-0001-era caution on OpenAI-Realtime-only production.
- The document's own non-negotiables (no dangerous claims, sanitized intake
  artifact, OwnerReview packet, server-side accept/reject gate) mirror
  BOUNDARIES.md and the TASK-0003 lab chain exactly.

## Conflicts with current governance (flagged, not adopted)

1. **"Log all session transcripts to a durable store" (lab) and "call
   recording and transcript persistence" (production)** directly contradict
   DR-0004 and the charter's explicit NON-adoption of transcript/recording
   retention. Not adopted. Any retention requires a superseding decision
   record with privacy/legal review. Lab evidence stays within the whitelist.
2. Vendor selection is NOT made by this packet (Research Gate rule): Telnyx/
   ElevenLabs/Twilio choices become decision records only after official
   verification of current pricing, retention/DPA terms, and Spanish quality
   (DR-0003 requires ES verification).
3. Provider retention rows in the packet are self-reported summaries — each
   requires official source verification before a production decision.

## Requires official source verification

gpt-realtime-2 pricing and SIP endpoint details; Telnyx Conversational AI
pricing/BAA; ElevenLabs compliance posture and per-minute cost; Deepgram Flux/
Aura-2 rates; Cartesia enterprise retention; all third-party latency
benchmarks.
