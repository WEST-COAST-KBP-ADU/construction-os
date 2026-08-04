# REVIEW-0001 — Response to "Lead-generation and platform development roadmap" (2026-08-04)

Reviewer: platform review assistant (reviewer/analyst/registrar per DR-0009)
Reviewed artifact: engineering handoff dated 2026-08-04, pinned `main@9782cf6`
Status: independent review; not an adopted decision record
Owner decisions requested: §6

## 1. Verdict

**Accepted as the core product direction, with three corrections (§3).** The
roadmap converges independently with adopted and proposed SourceTrue records —
price-book-only pricing with expiry (DR-0012 draft), refusal-as-product,
DR-0013 supersession as the Phase 0 gate, deterministic visitor path with AI
outside it, owner-only external action. Convergence from two independent
engineering passes is evidence the architecture is right-shaped.

The central thesis is endorsed: value before contact — a source-linked
screening candidate plus a curated concept configurator, capture only after
delivered value. This is materially stronger than a contractor lead form.

## 2. Accepted without amendment

- Channel model: Google captures demand, Meta creates it; no campaign traffic
  to the homepage; campaign-to-page mapping table.
- 10-stage funnel with per-stage artifacts and fail-closed behavior.
- Two entrance paths (property-first / design-first); design-first ships
  before production GIS.
- Modular monolith; three trust domains; typed JSON canonical, everything
  else a projection.
- Non-negotiable invariants list, verbatim.
- Data classes and initial privacy posture (no pixels pre-consent-decision,
  GPC fail-closed, no session replay in intake flows).
- `owner_qualified` as the first paid-media optimization event, never
  `lead_submitted`.
- Risk register and phase-gate structure.

## 3. Corrections required before adoption

### 3.1 Market assumption is stale (blocking, mechanical)

The pinned `main@9782cf6` predates DR-0014 (PR #29). The corrected charter:
core market is two rings — **Sacramento ring** (City of Sacramento, Sacramento
County unincorporated, Elk Grove, Citrus Heights, Folsom, Rancho Cordova, Galt,
Isleton) and **Placer/El Dorado ring** (Roseville, Rocklin, Lincoln, Granite
Bay, El Dorado Hills); horizon is Northern California. Sacramento leads in
build order only; both rings are core.

Consequences:
- Phase 3 retitles to **"Sacramento GIS authority and sandbox"**: City of
  Sacramento and unincorporated Sacramento County, two jurisdictions, two
  coverage-matrix rows. RP-0007 (Roseville) stands as the method template; its
  equivalent for the Sacramento ring is RP-0008.
- Phase 1 / TASK-0011 city-page order: Sacramento ring first.
- Assumption 4 ("Roseville remains the research-first jurisdiction") is void.

### 3.2 The voice entrance is missing (scope gap)

Owner direction (2026-08-03/04): a voice receptionist is a primary platform
entrance — premium voice, EN public-facing; RU/ES as operator capability, not
an advertised service (DR-0003 amendment pending).

Required treatment: **voice is a second entrance into the same funnel, not a
second product.** A call must yield the same canonical artifacts as the web
path — `ScreeningCandidate`, `LeadCandidate`, `OwnerReviewPacket` — with the
same consent, PII, and fail-closed semantics. Phase placement: at or after
Phase 5, because a phone number is a contact surface and is blocked by
DR-0013's demo posture exactly as forms are. Architecture constraint already
adopted (DR-0002): media plane is a separate service, not Next.js/Vercel.
Amend the roadmap to carry a voice row in the funnel table and a Phase 5+
entry, so the two entrances cannot drift into two funnels.

### 3.3 Adopt Phase 0–1 only; the rest is a map, not a commitment

Phases 2–10 are directionally sound but must not be adopted as a plan in one
act — that is course-lock beyond evidence. Adoption scope now: Phase 0
(decision packet) and Phase 1 (acquisition foundation). Each later phase gets
its own owner gate informed by the previous phase's measured outcome.

Within Phase 2, one hard amendment: **the spike must prove the 2D/pre-rendered
variant first**; 3D is adopted only if 2D demonstrably fails on conversion or
comprehension. Rationale: 3D asset production is the roadmap's largest hidden
TCO (the document concedes this in review item 9), and the majority of paid
traffic will be mobile, where heavy 3D is the top conversion risk (the
document's own risk table, row 5). The spike's decision criteria are accepted
as written; the default is inverted — 2D unless proven insufficient, not 3D
unless proven harmful.

## 4. Answers to the ten requested challenges (position, pending evidence)

1. **Monolith split** — sufficient. A separate worker is justified only for
   (a) the future voice media plane (DR-0002, long-lived sessions) and
   (b) GIS fetch/cache if source rate limits force queuing. The broker stays
   in-process until an external effect with real credentials exists.
2. **Rendering** — default 2D/pre-rendered; hybrid only on evidence (§3.3).
3. **Config JSON / catalog / licensing** — schema-versioned typed JSON with a
   content hash, catalog as append-only versioned releases (same discipline as
   the rules table in Property Intelligence v0.1); asset licenses recorded per
   release; no asset ships without a recorded license.
4. **Address/click-ID isolation** — POST-only for address entry; no address in
   URL, referrer, analytics, or LLM prompts; server-side session artifact keyed
   by opaque ID; CSP + `Referrer-Policy: same-origin`; egress tests as CI
   fixtures. Endorse the document's invariant verbatim.
5. **Roseville legal/operational viability** — unresolved; now a tier-2
   question. The blocking version of it is Sacramento's (RP-0008).
6. **Refusal model completeness** — the five result types
   (`matched | ambiguous | insufficient | unsupported | source_unavailable`)
   are complete for v1. Add one UX requirement: every refusal names its next
   step for the visitor ("request manual review"), so a refusal still converts.
7. **Consent/lead-state vs closed-loop measurement** — the state machine
   supports it; the boundary is that only `owner_qualified` and later states
   may ever be exported to ad platforms, as aggregate/offline conversions,
   post-consent, never raw artifacts.
8. **First optimization event** — `owner_qualified` is correct. Minimum cohort
   before automated bidding: do not hand Google/Meta an optimization signal on
   fewer than ~30 qualified events per platform per 30 days; below that, manual
   campaigns only. (Threshold to be revisited with real volume.)
9. **TCO** — the dominant lines are 3D asset production, per-jurisdiction
   source/legal maintenance, and owner review minutes. §3.3 caps the first;
   DR-0014's build order caps the second; Phase 0 must set an owner-capacity
   budget (minutes/lead) for the third, and it is the number most likely to
   force descoping.
10. **Phase evidence / rejection triggers** — each phase gate as written, plus
    two global rejection triggers: (a) Sacramento GIS terms prohibit production
    use → the product pivots to design-first + manual review, and the GIS
    layer stays internal; (b) owner review capacity is exceeded at pilot
    volume → pause acquisition, do not relax review.

## 5. Immediate bounded sequence — amended

1. Merge PR #29 (DR-0014) so `main` states the correct market. *(owner)*
2. TASK-0011 on its existing branch, Sacramento ring first, official sources
   only, one draft PR, no contact/tracking. *(builder — already approved)*
3. Phase 0 decision packet, pinned to post-#29 `main`, drafted by the reviewer
   for owner adoption: open/reject lead-gen phase (supersede DR-0013), first
   ICP, funnel + `owner_qualified` definition, data/consent/retention posture,
   DR-0011/DR-0012 disposition, voice-entrance placement, experiment economics
   and owner capacity. Governance only. *(reviewer, on owner go)*
4. Post-adoption: no-PII configurator spike per §3.3 (2D-first). *(builder)*
5. RP-0008 — Sacramento city + county GIS research to the RP-0007 standard.
   *(builder, parallel with 4)*

Production intake, pixels, ad spend, and external contact remain closed until
the Phase 0 record is adopted and the relevant negative tests pass.

## 6. Owner decisions actually blocking (compressed from the document's 14)

1. Open the lead-generation phase (supersede DR-0013) — yes/no.
2. First ICP, one sentence.
3. DR-0011 destination (reviewer recommendation stands: option A, owner
   mailbox, platform stores nothing).

All other listed unknowns are resolvable inside Phase 0–1 work or are already
answered by adopted records (market: DR-0014; price display: DR-0012 pending
its Research Gate; business facts: outstanding owner input, blocks trust
content only).
