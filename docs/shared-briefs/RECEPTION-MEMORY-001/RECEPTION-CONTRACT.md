# RECEPTION CONTRACT — channel-neutral customer entrance

## Purpose

Define identical authority and safety semantics for web and future real-time voice reception in English, Spanish, and Russian.

## Session states

`anonymous → disclosed → consent_candidate → identity_candidate → identity_verified → context_scoped → active → escalated | ended | refused`

No state may be skipped. `identity_candidate` exposes no sensitive history. Terminal sessions cannot be revived; a new session and new verification are required.

## Required inputs

- channel and channel session ID;
- requested locale;
- current disclosure version;
- requested purpose;
- consent candidate;
- identity evidence presented to a separately approved verifier;
- optional opaque lead/project hint;
- policy version and time source.

Unknown, malformed, stale, conflicting, or unsupported inputs refuse.

## Language contract

English, Spanish, and Russian use one canonical intent and policy representation. Translations are versioned presentation resources. Each language must independently pass:

- AI disclosure;
- consent comprehension;
- identity-verification prompts;
- restricted-claim refusals;
- emergency, anger, legal-threat, and vulnerable-person escalation;
- correction, export, and deletion requests;
- interruption/barge-in and noisy-audio recovery for voice;
- semantic equivalence tests against the canonical policy cases.

Automatic language detection may suggest a locale but cannot change it without confirmation. Unsupported or low-confidence language detection routes to a human-safe fallback.

## Identity and returning-customer continuity

Caller ID, email address, browser cookie, remembered facts, name, address, and voice likeness may generate candidates only. None is sufficient alone. Voice biometrics are outside scope.

A separately approved identity-verification boundary returns a short-lived, audience-bound assertion containing subject ID, assurance class, expiry, nonce, and verifier version. Reception accepts it only when all bindings match the current session. Failed or ambiguous matching reveals neither whether a customer exists nor project details.

## Consent

Consent binds subject, purpose, data classes, permitted operations, channels, policy version, time, and expiry. Consent is not bundled. A customer may allow current-session service while refusing durable memory. Revocation blocks future retrieval immediately and queues policy-controlled unlink/deletion work without rewriting immutable evidence.

## Context packet

Reception requests, but never assembles, a context packet. The deterministic policy boundary returns only fields allowed for the verified subject, selected project, stated purpose, channel, language, and session. The packet carries its own digest, expiry, policy version, provenance references, exclusions, and maximum disclosure class.

## Outputs

Reception may produce:

- sanitized lead candidate;
- request for human review;
- proposed memory mutation;
- proposed effect request;
- clarification/refusal/escalation event;
- session summary with provenance.

It may not write memory, contact a person, book an appointment, state feasibility/permit/code, quote price/schedule, or invoke an external effect.

## Abuse and failure cases

Explicit tests cover false match, enumeration, replayed identity assertion, revoked consent, cross-project hint, prompt injection, hostile retrieved text, stale facts, contradictory facts, unsupported locale, provider outage, partial audio, duplicate event, and interrupted deletion/export request. Failure is a stable refusal or human escalation, never best-effort disclosure.
