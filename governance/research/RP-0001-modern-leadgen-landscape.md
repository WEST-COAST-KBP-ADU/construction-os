# RP-0001: Modern lead generation landscape — Google + Meta, mid-2026

- **Status:** synthesized
- **Date:** 2026-07-02
- **Researcher:** engineering assistant (web research) — zero authority
- **Requested by:** owner intent (DR-0007: Google-first + Meta Pixel; owner
  direction: "the most modern lead generation methods")
- **Feeds into:** future channel/implementation decision records

## Question

What lead-generation products and methods actually exist and matter in
mid-2026 across the Google ecosystem and Meta, for a home-services / ADU
construction business in Northern California?

## Official vendor facts

(from vendor-operated sources; re-verify before any decision)

- **Google Local Services Ads (LSA)** exist for home-service categories with
  pay-per-lead pricing and business verification (license, insurance,
  background checks). Source: [Google Local Services Help](https://support.google.com/localservices/answer/6224841).
- **Google expanded "Local Services Ads for Home Listings"** (real-estate
  listing ads with pricing, images, home features; HouseCanary data
  partnership) — buyers can call/message/book **local real-estate agents**
  from the ad. Source: [Google blog](https://blog.google/products/ads-commerce/new-real-estate-ads-formats/).
  ⚠️ Aimed at agents, not contractors — relevance to ADU lead gen is a signal,
  not a channel yet.
- **Gemini app features for small businesses** announced by Google, including
  business-profile-aware assistance. Source: [Google blog](https://blog.google/innovation-and-ai/products/gemini-app/gemini-features-for-businesses/).
- **Performance Max lead-gen best practices** (first-party data, Enhanced
  Conversions with hashed email/phone, one primary conversion action).
  Source: [Google Ads Help](https://support.google.com/google-ads/answer/13775965).

## Third-party claims

(agency/analyst blogs; plausible but unverified)

- LSA badges consolidated into a single **"Google Verified"** checkmark
  (Oct 2025); money-back guarantee discontinued Nov 2025; typical home-service
  lead cost ~$25–80, blended ~$53; contractor adoption ~70%.
- **Google Business Profile 2026:** "Ask Maps" conversational search reads
  profiles/reviews/photos; AI-generated services and Q&A on profiles;
  AI summaries now gate local visibility.
- **Meta (April 2026):** AI-enhanced Pixel and a one-click "Meta-enabled
  Conversions API"; Meta-reported ~17.8% lower cost per result with CAPI;
  running Meta ads without CAPI loses ~30–40% of conversion signal.
- **AI search (AEO/GEO):** AI Overviews appear in a majority of local-service
  queries (claims range 68–80%+); ~45% of homeowners use AI tools to find
  contractors; organic CTR drops ~35%+ when AI Overviews appear; winning
  factors: schema markup, FAQ/answer-first content, entity consistency,
  review authority, freshness.

## Assumptions

- The Sacramento-region ADU niche behaves like the broader US home-services
  market these sources describe.
- Google's agent-focused real-estate ad products may later open to, or
  inspire, contractor-facing equivalents.

## Risks and unknowns

- **Tension with our privacy boundary:** modern performance marketing runs on
  first-party data fed back to platforms (Enhanced Conversions, CAPI lead
  events with hashed email/phone). Our platform defaults to minimal
  PII (DR-0004). Using these methods requires a deliberate, owner-approved
  marketing-data policy (consent, hashing, retention) — this is the single
  biggest open design question for the lead-gen layer.
- Which Google "real estate / housing search" surfaces are actually open to a
  construction business (vs. licensed agents) is unknown.
- Third-party statistics above may be marketing inflation.

## Requires official source verification

1. Google Verified badge: current requirements, cost model, CA eligibility for
   general contractors / ADU builders.
2. LSA category list for construction/remodeling in California.
3. GBP "Ask Maps" / AI Q&A: official feature state and business controls.
4. Meta-enabled Conversions API: official setup terms, data handling, and
   whether "one-click" mode meets our privacy constraints.
5. HouseCanary/home-listings ads: eligibility beyond licensed agents.
6. All pricing and adoption statistics.

## Synthesis

The modern (mid-2026) lead-gen stack for this business looks like:

1. **Foundation (no privacy cost, start anytime):** a complete, active Google
   Business Profile + a public site structured for AI search (schema, FAQ,
   answer-first ADU content per city). AI assistants now read these directly;
   this is the cheapest high-leverage work and fits every boundary we have.
2. **Verified paid channel:** Google LSA with the Verified badge —
   pay-per-lead, aligned with our candidate-lead model (each paid lead lands
   as `candidate_lead` for owner review). Requires owner-side business
   verification (license, insurance).
3. **Performance layer (privacy-gated):** Google Ads/PMax with Enhanced
   Conversions + Meta Pixel with Conversions API. Effective per vendors, but
   requires the marketing-data policy decision first (consent banner, hashed
   identifiers, site privacy text) — see DR-0007 consequences.
4. **Watch, don't build:** Google's real-estate listing ads (agent-focused
   today) and GIS-based outbound candidates (own charter direction) — revisit
   after inbound channels run.

No decision is made by this packet. The owner decides sequencing.
