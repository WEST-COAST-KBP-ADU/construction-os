# Boundaries

Status: adopted. These limits bind every AI-assisted flow, every lab experiment,
and every engineering task in this platform. They can be changed only by an
owner-adopted decision record.

## AI authority limits

AI (voice assistant, reasoning engine, or any assistant in the loop) **may**:

- greet a caller and explain that a human will review sensitive questions
- collect minimal safe intake, one question at a time
- classify inquiries and identify missing information
- produce sanitized summaries
- produce OwnerReview packet candidates
- assist, classify, summarize, recommend, and prepare packets

AI **may not**, under any circumstances, independently:

- approve work
- send client-facing messages
- promise price or schedule
- make permit / code / zoning / buildability / legal conclusions
- provide financing or tax advice
- book binding appointments or create calendar events
- create or write CRM records
- write to Google Workspace or send Gmail
- trigger external business actions or production workflows
- store sensitive customer data
- collect excessive PII
- route production phone traffic
- configure providers or deploy infrastructure

## Data / privacy / retention

Default rule: **minimal retention, no production PII persistence, no recording
retention, no transcript retention.**

Never stored in `governance/` (SourceTrue):

- real customer identity, phone number, email, street address
- APN / parcel / permit identifiers tied to real inquiries
- payment information
- raw transcripts or recordings
- provider credentials, API keys, secrets
- operational project facts

Allowed lab-safe evidence fields (whitelist — anything not listed does not get
recorded):

- timestamp
- test variant ID
- event type
- accept/reject result
- latency marker
- error class
- sanitized non-PII summary

Any recording or transcript retention requires separate owner approval and
privacy/legal review first.

## Engineering hard prohibitions

Without an owner-approved task packet, do not:

- create application code
- configure OpenAI, ElevenLabs, Deepgram, Cartesia, Telnyx, Twilio, Bandwidth,
  or SignalWire
- route a phone number or set up SIP trunking
- deploy to Vercel / Cloudflare (beyond the already-operating public site)
- write to Google Workspace
- modify KBP Core or claim Business Flow currently runs through KBP Core
- treat external research output (Perplexity or otherwise) as SourceTrue

## Research Gate

A Research Gate is required before important platform, vendor, infrastructure,
privacy, retention, voice, automation, provider, production, and Google
Workflow decisions (see DR-0005). Research packets must separate: official
vendor facts, third-party claims, assumptions, risks, unknowns, and items
requiring official verification.

Decision flow:

```
Owner intent → Research Gate → research packet → synthesis
→ boundary/compliance review → external review where needed
→ owner approval → decision record → implementation task packet
```

## Required wording

Any uncertain screening output (GIS, feasibility, vendor claim) must carry:

> Requires official source verification.
