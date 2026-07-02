# DR-0003: Public voice language policy — EN primary, ES secondary, RU disabled

- **Status:** adopted
- **Date:** 2026-07-02
- **Decider:** owner
- **Related:** `architecture/voice-lab.md`, R-11 in the risk register

## Context

The receptionist voice is brand-critical. The business direction includes
RU / EN / ES support, but public voice quality must meet a premium bar before
any language is exposed on a public number.

## Decision

For the public phone voice: **English primary, Spanish secondary, Russian
disabled.** Russian may be used internally but is not part of the public
receptionist until its voice quality is proven and this record is superseded.

## Consequences

- Vendor evaluation must verify Spanish STT and TTS quality on phone-band
  audio, not only English.
- Public-facing materials must not promise Russian-language phone service.

## Revisit trigger

Lab evidence that Russian STT/TTS quality meets the same premium bar as
English, plus owner approval.

## Boundary check

- [x] No PII, secrets, transcripts, or recordings introduced
- [x] No external action authorized implicitly
- [x] Research claims verified or marked "Requires official source verification"
