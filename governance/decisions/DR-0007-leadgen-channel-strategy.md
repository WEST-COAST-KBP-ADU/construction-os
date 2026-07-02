# DR-0007: Lead generation channel strategy — Google-first, plus Meta Pixel

- **Status:** adopted
- **Date:** 2026-07-02
- **Decider:** owner
- **Related:** charter (lead generation), DR-0005 (Research Gate), BOUNDARIES.md

## Context

The owner set a principled direction for how leads will be generated for the
ADU business in Northern California.

## Decision

1. **Lead generation is built on the Google ecosystem first.** Primary
   channels: Google Business Profile (Google My Business), Google's
   real-estate / housing-search related services, Google Ads / Local Services
   Ads, Maps/geo services, and organic Google search presence.
2. **Meta Pixel is additionally integrated** for ad tracking, audience
   building, and retargeting on Meta platforms (Facebook/Instagram).
3. Other channels (referrals, direct) continue but are secondary; no other paid
   platform is adopted without a superseding decision record.

## Consequences

- Every concrete Google or Meta integration still requires the Research Gate
  first: which services exist, their current names, API access, eligibility,
  pricing, and terms of service. All such facts carry
  "Requires official source verification" until verified — including which of
  Google's newer real-estate/housing services are available to contractors.
- **Deploying any tracking tag (Meta Pixel, Google tags) on the live site is a
  privacy-relevant external action**: it sends visitor data to third parties.
  The current public site states that it does not track or collect data, and
  California privacy law (CCPA/CPRA) applies. Therefore pixel/tag deployment
  requires its own owner-approved task packet including a privacy review,
  consent/notice update, and removal of the "no tracking" claims — before the
  first tag goes live.
- Lead intake from these channels still lands as candidate leads only:
  qualification, owner review, and approval before any follow-up (charter lead
  states). No automated outreach.
- Google Workspace write prohibitions (BOUNDARIES.md) are unchanged — this
  decision covers lead *sources*, not Workspace automation.

## Revisit trigger

Research showing a required capability is unavailable/discontinued on the
Google side, or channel economics that justify adding a non-Google platform.

## Boundary check

- [x] No PII, secrets, transcripts, or recordings introduced
- [x] No external action authorized implicitly (tags/pixels gated behind a
      future task packet with privacy review)
- [x] Research claims verified or marked "Requires official source verification"
