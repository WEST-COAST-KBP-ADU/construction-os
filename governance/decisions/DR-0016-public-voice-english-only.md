# DR-0016: Public automated voice is English-only

- **Status:** adopted
- **Date:** 2026-08-04
- **Decider:** owner
- **Supersedes:** DR-0003
- **Related:** DR-0002, DR-0004, DR-0015, `architecture/voice-lab.md`

## Context

DR-0003 adopted English primary, Spanish secondary, and Russian disabled for
public phone voice. The owner changed that policy on 2026-08-04 while keeping
all public-phone authority closed.

Language capability and a marketed public service are different things. The
platform may support a human operator internally without promising that an
automated public receptionist will serve callers in that language.

## Decision

If a public automated receptionist is separately authorized in a later phase,
its public language is **English only**.

Spanish and Russian are internal/operator capabilities only. They may be used
for internal assistance or future controlled lab evaluation, but they must not
be advertised, routed, or represented as public automated receptionist
service without a new owner-adopted decision.

DR-0002 remains binding: real-time media is a separate service, not a
Next.js/Vercel request path.

## What this record does NOT authorize

- a public phone number or production traffic;
- carrier, SIP, media, STT, LLM, TTS, or other provider selection;
- recording, transcript retention, or provider training use;
- intake, callback, booking, messaging, or any external business action;
- public Spanish or Russian web copy; web localization requires its own scope.

DR-0015 keeps public phone and production voice closed through Phase 1. The
Phase 5 reference is a nonbinding map, not implementation authority.

## Consequences

- DR-0003 is retained only as superseded provenance.
- Voice architecture, risk summaries, handover text, and persona drafts must
  not promise Spanish or Russian public automated service.
- Internal/operator capability must remain clearly separated from public
  marketing and call routing.

## Revisit trigger

Documented quality, safety, privacy, retention, and operator evidence for an
additional public language, followed by a new owner decision.

## Boundary check

- [x] No public phone, vendor, credential, traffic, transcript, or recording
- [x] No contact or external action authorized
- [x] DR-0002 architecture and DR-0004 retention boundary preserved
