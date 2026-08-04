# Hybrid Voice Lab Architecture

Status: hybrid-first direction adopted (DR-0002). No vendor selected in any
role. All vendor names below are candidates pending Research Gate verification.
Public phone and production traffic remain closed under DR-0015.

## Target flow

```
Phone / SIP carrier
→ media / orchestration layer
→ STT / listening engine
→ LLM reasoning engine
→ TTS / premium voice engine
→ caller audio response
→ sanitized structured intake artifact
→ Core-compatible OwnerReview packet candidate
→ no external business action without owner approval
```

## Role split and candidates

| Role | Responsibility | Candidates (none selected) |
| :--- | :------------- | :------------------------- |
| Carrier / SIP | Phone number, PSTN/SIP transport, routing to media layer | Telnyx, Twilio, Bandwidth, SignalWire |
| Media / orchestration | Stream audio, coordinate STT→LLM→TTS, turn-taking, barge-in, timing, safe events to control layer | LiveKit, Pipecat, custom Node/WebSocket service, provider-managed bridge |
| STT / listening | Speech → text/events, turn detection, interruption, noisy phone audio | Deepgram Flux/Nova, ElevenLabs Scribe, OpenAI transcription, Cartesia Ink, provider-native |
| LLM / reasoning | Safe receptionist responses, intent classification, next question, sanitized output, packet candidate. **No final authority.** | OpenAI model first; others evaluated later |
| TTS / premium voice | Safe response text → premium audio | ElevenLabs, Cartesia Sonic, Telnyx Ultra Voices, OpenAI voice, others after research |
| Control / artifact layer | Webhooks, guardrails, artifact builder, packet builder, lab logs | App code in this repository |

## Voice brand requirements

Calm, professional, concise, human-comfortable, premium; not robotic, not
rushed, not overpromising. If public automated voice is separately authorized,
it is English-only. Spanish and Russian are internal/operator capabilities and
must not be advertised or routed as public automated service (DR-0016).

## Known constraints and traps

- **Latency stacking.** Each hop (carrier → media → STT → LLM → TTS) adds
  delay; the premium feel degrades past roughly one second voice-to-voice.
  A latency budget must be computed per candidate stack before selection.
- **Barge-in is the differentiator.** Interruption handling separates a premium
  receptionist from a phone bot; it must be a first-class requirement in media
  layer selection.
- **Telephony audio is 8 kHz and noisy.** STT candidates must be verified on
  phone-band audio, not studio samples.
- **Guardrails must be deterministic.** Prompt-only guardrails are an overclaim
  risk (price/schedule/permit promises). A deterministic post-filter with
  refusal templates backs the prompt.
- **Provider retention defaults.** Many STT/TTS/LLM providers retain audio and
  transcripts by default, silently violating the no-retention boundary. Each
  candidate's data retention and training-use policy requires official
  verification before selection.
- **Vendor lock-in is highest at the media layer.** It carries the largest
  switching cost; choose it last and keep it abstracted.

## Research findings on file (not adopted as truth)

External research (2026) suggested: OpenAI Realtime SIP may suit a private lab
prototype but not a production public number without live latency /
interruption / reliability evidence; production candidates include Telnyx
full-stack, ElevenLabs + carrier, or a hybrid/custom stack; a
Deepgram + Cartesia + LiveKit/Pipecat-style stack may be the stronger long-term
control path at higher engineering complexity.

Explicitly **not adopted** from that research: durable transcript logging and
call recording/transcript persistence. Every vendor pricing, latency, model,
GA, benchmark, or compliance claim requires official verification.
