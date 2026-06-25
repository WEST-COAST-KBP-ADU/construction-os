# VOICE-LAB-001 Private Phone Secretary Prototype Runbook

Status: private lab only. Do not use with production phone traffic, real client data, call recording, transcript retention, CRM, Calendar, Gmail, Google Workspace writes, ads, or public launch.

## Required Environment Variables

Set these locally only. Never commit real values.

```bash
OPENAI_API_KEY=
OPENAI_WEBHOOK_SECRET=
OPENAI_REALTIME_MODEL=
VOICE_LAB_ACTIVE_VARIANT=A
VOICE_LAB_VARIANT_A_VOICE=
VOICE_LAB_VARIANT_B_VOICE=
VOICE_LAB_VARIANT_C_VOICE=
```

Use an OpenAI Realtime model that supports SIP and a voice name from the current OpenAI account documentation or dashboard. The app intentionally does not hardcode voice names.

## OpenAI Webhook Setup

1. Create an OpenAI webhook endpoint pointed at:
   `https://<public-lab-url>/api/voice/openai-sip-webhook`
2. Subscribe only to the incoming Realtime SIP call event:
   `realtime.call.incoming`
3. Copy the webhook signing secret into `OPENAI_WEBHOOK_SECRET`.
4. Keep the endpoint private to lab testing. Do not reuse this route for production phone traffic.

If the official OpenAI SDK is not installed or webhook verification is unavailable, the route returns `LAB_ONLY_UNVERIFIED` and will not accept calls.

## Twilio SIP Trunk / Number Checklist

1. Use a Twilio test phone number or lab-only SIP trunk.
2. Connect the number/trunk to the OpenAI Realtime SIP connector.
3. Disable call recording.
4. Disable transcript or voicemail persistence.
5. Route only lab testers to the number.
6. Do not attach CRM, Calendar, Gmail, Google Workspace, or production automation.

## Select The Active Variant

Set `VOICE_LAB_ACTIVE_VARIANT` to `A`, `B`, or `C`.

- `A`: premium calm baseline
- `B`: warmer concierge
- `C`: crisper intake screener

Restart the local server after changing env values.

## Run Locally

```bash
npm run dev -- --hostname 127.0.0.1 --port 3000
```

The webhook path is:

```text
http://127.0.0.1:3000/api/voice/openai-sip-webhook
```

## Expose Local Server

Use one lab tunnel at a time.

```bash
ngrok http 3000
```

or:

```bash
cloudflared tunnel --url http://127.0.0.1:3000
```

Use the generated HTTPS URL in the OpenAI webhook endpoint.

## Call And Test

1. Confirm the dev server is running.
2. Confirm the tunnel is live.
3. Confirm OpenAI webhook delivery is enabled for `realtime.call.incoming`.
4. Place a test call to the lab Twilio number.
5. Verify the assistant discloses it is automated and lab-only early in the call.
6. Switch variants with `VOICE_LAB_ACTIVE_VARIANT`, restart, and repeat.

## Test Checklist

- Naturalness: does the voice sound human-comfortable without pretending to be human?
- Latency: does the first response and turn-taking feel acceptable?
- Interruption: can the caller interrupt and redirect naturally?
- Breathing / pauses / rhythm: are pauses calm and premium, not rushed or robotic?
- Premium tone: does the assistant sound composed, concise, and respectful?
- Guardrail refusals: does it refuse price, timeline, buildability, permit, zoning, code, legal, and binding appointment requests?
- Handoff: does it route restricted or uncertain questions to human review?

## Lab Safety Boundary

This prototype must not record calls, persist transcripts, store caller phone numbers, store exact addresses, write to CRM, write to Calendar, write to Gmail, write to Google Workspace, launch publicly, or handle production phone traffic.

Allowed logs only:

- timestamp
- variant id
- call event type
- accept/reject result
- latency markers when available
- error class
