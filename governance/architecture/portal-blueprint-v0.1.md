# Portal Blueprint v0.1 — westcoastkbp.com

Status: ADOPTED (DR-0008), **partially superseded — see §3a and §8**.
DR-0015 supersedes phase sequencing and keeps Phase 1 no-contact/no-tracking.
Synthesis of RP-0001…RP-0005 under the platform charter and BOUNDARIES.md.
Design (visual identity, typography, motion) is an explicitly SEPARATE phase —
see §9.

## 1. What we are building

Not a brochure site: the first **AI-native ADU portal** in the Sacramento
market. Differentiators, each validated by research:

1. **Address-first intake** — the visitor starts with their property address,
   not a contact form (gap: zero competitors have it).
2. **Real client portal** — the platform's object-control model (scope, state,
   milestones, approvals, evidence, next action) shown to the client (gap:
   zero competitors have it; Nonna Homes' collapse made project visibility a
   selling point).
3. **AI voice receptionist** — premium controlled voice intake (DR-0002),
   feeding the same lead pipeline.
4. **Owner-gated everything** — no promise, price, schedule, or external
   action without owner approval. The kernel is the brand.
5. **AI-search-native** — structured data, llms.txt, answer-first content
   (RP-0001; only one CA competitor does this).

## 2. Site information architecture (target)

```
HOME
SERVICES        /services/detached-adu · /garage-conversion · /attached-adu
                /jadu · /adu-legalization
PROCESS         /process (numbered steps) · /process/permits-and-zoning
                /process/timelines-by-city   [gated by timeline policy →DR]
PORTFOLIO       /portfolio (filter: type/city) · before-after · video tours
PRICING         /pricing/cost-guide [gated by cost policy →DR] · /financing
                /roi-calculator [gated →DR]
WHY US          /about (team, story) · /credentials (CSLB, insurance, warranty)
                /reviews · /compare (vs generic contractor / prefab)
RESOURCES       /blog · /adu-laws-2026 · /grants · /faq
CITIES          /adu-builder/[city] — Sacramento City, Sacramento County
                (unincorporated), Elk Grove, Citrus Heights, Folsom, Rancho
                Cordova, Galt, Isleton, Roseville, Rocklin, Lincoln,
                Granite Bay, El Dorado Hills (DR-0014; sourcing-gated)
CONTACT         /contact — target only; closed through Phase 1 (DR-0015)
CLIENT PORTAL   /portal — authenticated (later phase, own DRs)
Technical       /llms.txt · /sitemap.xml · /robots.txt · JSON-LD everywhere
```

## 3a. SUPERSEDED — §3 no longer describes the homepage (DR-0013)

The 15-section homepage below was replaced by the architectural editorial
homepage the owner selected on 2026-08-03 (concept 01, TASK-0010): four
sections — hero, solutions, process, quality. §3 is retained for provenance
only; it is **not** the build target. See DR-0013 for what carried over and
what was dropped. The information architecture in §2 is unaffected and remains
in force.

## 3. Homepage section order (15 sections, adapted from RP-0004) — SUPERSEDED

Sticky nav (license + phone + CTA) → Hero (real Sacramento ADU, address-first
CTA) → Property tool → Social-proof bar → ADU type selector → Numbered process
→ Gallery → Cost transparency section [policy-gated] → Testimonials (named,
local) → Credentials → ROI calculator [policy-gated] → Comparison table → Team
→ City expertise grid → Final CTA + short form.

Boundary overlay: every feasibility/cost/timeline output carries screening-only
language ("Requires official source verification"; owner reviews every
commitment). The tool sells *control and honesty*, not promises.

## 4. Lead funnel (historical target; not implementation authority)

DR-0015 keeps intake, contact, and tracking closed through Phase 1. The table
below is retained as design provenance and cannot open a route or external
effect without later owner gates.

| Tier | Visitor experience | Kernel mapping (DR-0006) |
| :--- | :----------------- | :----------------------- |
| 1 — anonymous tool | Address → screening summary, no contact required | `create_lead_candidate` (local_write); raw_signal → candidate_lead |
| 2 — email gate | Full report + educational nurture by email | qualified_candidate; email send is external_io → owner-approved flow config |
| 3 — calendar | Book a site visit slot | owner_review_required → approved_for_followup after owner decision |

Every lead lands in the owner review dashboard before any human follow-up.
Automation (CRM sequences) only ever runs on owner-approved leads.

## 5. Technical stack (candidates; each external service needs its own DR after verification)

| Layer | Decision state |
| :---- | :------------- |
| Next.js + Vercel | **Already ours** — confirmed by RP-0003 as top-of-market |
| Supabase (leads, portal data) | Candidate — gated by production data policy DR |
| GoHighLevel (CRM/pipeline/calendar) | Candidate — verification + approval-flow design |
| GTM + GA4 + Meta Pixel + Clarity | Candidate — privacy gate (DR-0007): consent, CCPA notice, site copy update first |
| Google Maps/parcel APIs (address tool) | Candidate — GIS layer research packet needed |
| Resend/SendGrid (transactional email) | Candidate — data policy DR |
| /llms.txt + AI crawler access | **Shipped with this blueprint** (technical, zero-risk) |

## 6. Voice module (per RP-0005, under DR-0002)

- **Lab:** OpenAI Realtime SIP + carrier trunk; validate accept/reject gate,
  safe intake, OwnerReview packet from a real call. Transcripts are NOT
  durably stored (DR-0004) — lab evidence stays within the whitelist.
- **Production candidates:** no vendor selected. Any later evaluation requires
  official pricing, retention, privacy, latency, and safety verification.
  Public automated voice is English-only under DR-0016; Spanish and Russian are
  internal/operator capabilities. Public phone remains closed under DR-0015.

## 7. Client portal (later phase)

Ten-module blueprint on file (RP-0004): timeline tracker, permit status, photo
updates, document vault, payments, change orders, messaging, inspections,
selections, rental tracker. Involves production PII, payments, and auth —
requires its own decision records. Not in v0.1 build scope.

## 8. Build phases — SUPERSEDED by DR-0015

The P0-P5 sequence below is retained for provenance only. DR-0015 opens only
its governance Phase 0 and bounded no-contact/no-tracking Phase 1; its Phase
2-10 table is nonbinding and authorizes no implementation.

- **P0 — policy gates (owner decisions):** production data policy; cost &
  timeline display policy; then vendor DRs as verified.
- **P1 — structure & trust (no PII, no tracking):** service pages, process,
  credentials, FAQ (approved draft), 7–10 city pages, portfolio shell,
  comparison table, full JSON-LD/FAQPage coverage. Content built from
  owner-provided business facts (CSLB, warranty, photos).
- **P2 — intake:** address-first tool (screening-only wording) + lead
  candidate pipeline + owner review dashboard (uses TASK-0003 lab modules).
- **P3 — attribution & CRM:** consent banner + privacy page + GTM/GA4/Pixel/
  Clarity + GoHighLevel handoff (post-approval leads only).
- **P4 — voice lab** (parallel from P2, per §6).
- **P5 — client portal + ROI/estimator tools** (after policy DRs and real
  project data).

## 9. Design phase — separate, next

The owner requires a maximally modern, technically excellent site. Design gets
its own phase with its own review: visual identity, typography, layout system,
motion, photography direction. RP-0004's style proposal (deep forest green +
gold, DM Sans/Inter, real photos only) enters that phase as **input, not a
decision**. Technical quality bar regardless of design outcome: Core Web
Vitals green (LCP < 2.5s, CLS < 0.1), mobile-first, accessibility AA.

## 10. Open owner decisions (blocking respective phases)

1. Production data policy (PII storage/consent/retention) → blocks P2+.
2. Cost & timeline display policy → blocks pricing/ROI/timeline content.
3. Vendor adoptions after verification: Supabase, GoHighLevel, tracking stack,
   voice vendors, Maps/parcel data source.
4. Business facts package: CSLB number, insurance/warranty terms, project
   photos, team info → blocks P1 trust content.
