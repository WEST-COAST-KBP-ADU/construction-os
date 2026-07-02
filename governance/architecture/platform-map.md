# Platform Component Map

Status: living document. Structural decisions referenced here are adopted via
decision records; everything else is direction, not commitment.

## Planes

The platform separates into four planes with hard boundaries between them:

### 1. Media plane (real time) — future separate service

SIP carrier → media/orchestration layer → streaming STT → LLM reasoning →
streaming TTS → caller audio. Owns turn-taking, barge-in, and the latency
budget. **Not built yet. Not hosted inside Next.js/Vercel** — serverless
runtimes cannot hold long-lived WebSocket/RTP media sessions (DR-0002).

### 2. Control / artifact plane — this repository (app code)

Next.js app: webhook/control surface, session coordination, deterministic
guardrail enforcement, sanitized intake artifact builder, OwnerReview packet
candidate builder, lab-safe logging. This is the implementation lab; nothing in
it is production-authorized until an owner decision says so.

### 3. Governance plane — this repository (`governance/`)

SourceTrue: decisions, task packets, research packets, evidence, boundaries,
templates, SOPs. No runtime code, no PII, no secrets (DR-0001).

### 4. External action plane — not authorized

Google Workspace, CRM, calendar, client messaging, phone routing. Exists only
as future direction; every write requires its own owner-approved task packet.

## Module split for the voice lab

| Module | Home |
| :----- | :--- |
| Webhook/control endpoints | app code (this repo) |
| Guardrail module (deterministic post-filter, refusal templates) | app code (this repo) |
| Intake artifact schema + validator | app code (this repo) |
| OwnerReview packet candidate builder | app code (this repo) |
| Lab-safe evidence logger (whitelisted fields only) | app code (this repo) |
| Real-time audio pipeline, STT/TTS streaming, barge-in | future media service |
| Carrier/SIP, STT, TTS, LLM providers | external, behind interfaces, none selected |
| Decisions, task packets, research, evidence | `governance/` |
| Google Workspace flows | not authorized yet |

All provider roles (carrier, STT, TTS, LLM) sit behind abstract interfaces in
lab code so vendor changes never become rewrites.

## Build sequencing (adopted direction)

Text-first: prove the vendor-independent chain before any audio or provider
work.

1. Research / official verification (Research Gate)
2. Architecture decision records
3. Lab scaffold (app code)
4. **Reasoning/guardrail proof — text-mode simulated dialogs, fake data**
5. **Sanitized intake artifact proof**
6. **OwnerReview packet proof**
7. Media/STT/TTS proof (requires vendor decisions from the Research Gate)
8. Lab evidence review
9. Production readiness decision

Rationale: steps 4–6 are vendor-independent, zero-PII, zero-provider-cost, and
survive any later stack choice; step 7 is gated on research that runs in
parallel.
