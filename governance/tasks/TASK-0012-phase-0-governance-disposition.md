# TASK-0012: Record the bounded Phase 0 lead-generation disposition

- **Status:** in_progress
- **Date approved:** 2026-08-04
- **Approved by:** owner
- **Base:** `main@9876243492e1df747a8b2f618bc0008d12286c81`
- **Related:** REVIEW-0001 (advisory), DR-0003, DR-0008, DR-0011, DR-0013,
  DR-0014, DR-0015, DR-0016, TASK-0011

## Objective

Transcribe the owner's 2026-08-04 REVIEW-0001 disposition into one
governance-only Draft PR with internally consistent SourceTrue records.

## In scope

- Adopt DR-0015 for Phase 0 and bounded no-contact/no-tracking Phase 1.
- Adopt DR-0016 as the English-only successor to DR-0003.
- Adopt DR-0011 Option A only as a future bounded-pilot destination policy,
  without opening intake or automatic closed-loop attribution.
- Reconcile direct stale summaries in the decision registry, charter, portal
  blueprint, voice architecture/risk/persona, and builder handover.
- Add Galt and Isleton to TASK-0011's official-source sourcing scope.
- Apply the narrow DR-0014 wording correction required to keep both market
  rings core.
- Add this task packet, registry entry, and RUN-0012 evidence.

## Out of scope / prohibited

- Any runtime, `app/`, `src/`, `public/`, package, lockfile, infrastructure,
  Vercel, Cloudflare, credential, ruleset, or production change.
- Intake, form, email capture, booking, public phone, provider configuration,
  production PII, client-facing GIS output, parcel/buildability conclusion,
  analytics, cookies, pixels/CAPI, click-ID export, ad spend, or external
  contact.
- Implementing or authorizing Phase 2 through Phase 10.
- Importing the stale unapproved configurator task from another branch.
- Resolving unrelated pre-existing task-registry status mismatches.

## Acceptance criteria

- Current `main` still equals the pinned base before the branch is created.
- Changed paths are limited to `governance/**` and the intended file set.
- DR-0015 and DR-0016 are indexed; supersession pointers and statuses agree.
- DR-0011 states pilot-only Option A and explicitly denies launch and automatic
  closed-loop attribution.
- Active governance summaries no longer promise Spanish public automated voice
  or claim that lead generation is wholly unopened.
- TASK-0011 includes Galt and Isleton and keeps publication evidence-gated.
- Phase 2 through Phase 10 are labeled nonbinding and authorize nothing.
- Local-link, status/index, forbidden-surface, PII/secret, and whitespace probes
  pass with no new inconsistency.
- Repository lint, test, and build regressions are reported honestly.
- Exactly one branch and one Draft PR target `main`; no approve or merge.

## Evidence plan

RUN-0012 records the pinned base, governance-only scope result, validation
result, error class, and sanitized summary. No PII, secret, transcript,
credential, or external operational fact is recorded.

## Boundary check

- [x] Work stays inside BOUNDARIES.md
- [x] No provider configuration, production action, or external business effect
- [x] Evidence uses only whitelisted lab-safe fields
