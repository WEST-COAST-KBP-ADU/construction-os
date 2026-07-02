# RP-0003: Technical competitive audit — 12 CA ADU companies (owner-provided)

- **Status:** received + synthesized
- **Date:** 2026-07-03 (document dated June 2026)
- **Researcher:** Perplexity Computer (external) — zero authority
- **Provided by:** owner upload; verbatim PDF: `attachments/RP-0003-technical-audit.pdf`
- **Feeds into:** portal architecture decision record (pending)

## Key findings (as claimed by the document)

- Only 1 of 12 CA ADU competitors runs a modern JS framework (Abodu, Next.js);
  Sacramento has ZERO modern ADU portals. Local players: GBG (Wix, ads with no
  tracking), KGA (Nuxt + GoHighLevel + Meta Pixel — primary local technical
  threat), Redwood ADU (Wix).
- Seven confirmed market gaps: address-first intake, real client portal,
  Sacramento city-page SEO, Meta Pixel attribution locally, LLM/AI-search
  optimization (only LADU has /llms.txt), interactive qualification tools,
  broken competitors (Fortune ADU down; Nonna Homes license suspended) leaving
  branded demand uncaptured.
- Recommended stack: Next.js + Vercel (matches our existing platform), Supabase,
  GoHighLevel CRM, GTM + GA4 + Meta Pixel + Microsoft Clarity, /llms.txt.
- 8-week build plan: lead pipeline → 5 city pages → attribution/CRM → trust
  content.

## Alignment with our own research

Consistent with RP-0001 (AI-search foundation matters; LSA/attribution stack)
and RP-0002 (city pages, trust factors, same competitor tiers). No material
contradictions found.

## Conflicts with current governance (must be decided before build)

1. **PII persistence.** The recommended lead pipeline stores name/phone/email/
   address in Supabase. DR-0004 currently defaults to NO production PII
   persistence. Building this requires a superseding decision record with a
   defined production data policy (storage location, retention, access,
   consent).
2. **Tracking stack.** Meta Pixel/GTM/GA4/Clarity are privacy-gated by DR-0007
   (consent, CCPA notice, site copy update) before any tag ships.
3. **CRM automation.** GoHighLevel SMS/email sequences are external actions;
   under our model they fire only after owner-approved leads, matching the
   document's own "Owner sees every lead" constraint.
4. **Feasibility tool wording.** "Your lot may qualify" outputs must carry
   screening-only language ("Requires official source verification") and no
   cost promises — the audit's example output includes a cost range, which our
   boundaries do not currently allow.

## Verification status

Stack detections are labeled CONFIRMED/LIKELY by the document's methodology
(header/source inspection). Treat all vendor and competitor claims as
observational snapshots (June 2026); re-verify before relying on any single
fact for a decision.
