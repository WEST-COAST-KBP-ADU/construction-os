# Platform Charter

Status: adopted · Owner handoff of 2026-07-02 is the founding source.

## Identity

West Coast KBP is a California construction / ADU business: ADU development and
construction, general construction operations, client intake, lead generation,
estimating, material takeoff, permit/admin workflow, inspection tracking,
client-facing documentation, internal SOPs, and controlled business execution.

Target operating area (corrected by DR-0014, 2026-08-03):

**Core market** — both of the following are core, not core plus expansion:

- City of Sacramento and Sacramento County, including the unincorporated county
  and the incorporated cities within it (Elk Grove, Citrus Heights, Folsom,
  Rancho Cordova, Galt, Isleton);
- Placer and El Dorado county markets: Roseville, Rocklin, Lincoln, Granite
  Bay, El Dorado Hills.

**Horizon** — Northern California.

Sacramento leads in *build order* because it is the largest share of the core,
not because the rest of the core is a later market.

The pre-DR-0014 text listed Placer-county towns first and omitted Sacramento
entirely. That ordering was inherited by the blueprint, the research packets,
and every task packet built on them; all are corrected to this list.

Public domain: **westcoastkbp.com** (owner-confirmed 2026-07-02). The public
platform site serves from this domain; it is the canonical base URL for site
metadata.

The platform (**Construction OS**) is not a generic CRM. It is a controlled
AI-assisted business operating layer for construction execution.

## Core execution principle

Every flow in the platform follows this pattern:

```
input
→ candidate artifact
→ validation / classification
→ OwnerReview packet
→ owner approval
→ controlled business action
→ evidence / run record
```

AI may assist, classify, summarize, recommend, and prepare packets.
AI never approves, never contacts clients, never triggers external business
actions, never concludes on permit/code/zoning/buildability matters.
The owner remains the final approval authority. Full limits: `BOUNDARIES.md`.

## Platform vision (future domains)

Lead generation → lead qualification → voice / web intake → GIS/property
intelligence → ADU feasibility screening candidate → OwnerReview packet →
estimate / offer workflow → permit/admin workflow → material takeoff →
scheduling / inspection tracking → client communication drafts → evidence /
run records.

The key idea: convert messy real-world signals into structured, reviewable,
owner-approved business actions.

## Lead generation channels

By owner decision (DR-0007), lead generation is built Google-first: Google
Business Profile, Google's real-estate / housing-search services, Google Ads /
Local Services Ads, Maps/geo services, and organic search — plus Meta as a
future channel. Concrete integrations pass the Research Gate first. DR-0015
keeps every tracking tag, pixel/CAPI path, campaign activation, and ad spend
closed through Phase 1; later deployment requires its own privacy, consent, and
implementation gates.

## Lead object concept

A lead starts as a candidate, never as a customer record. Lead states:

```
raw_signal → candidate_lead → qualified_candidate → owner_review_required
→ approved_for_followup | rejected | archived
```

No external action happens before owner approval. Outbound campaigns, client
contact, mass messaging, or automated outreach are not authorized until a
separate owner-approved workflow exists.

## GIS / property intelligence boundary

GIS output is a screening candidate only — never a legal, permit, engineering,
zoning, or buildability conclusion. Required wording for uncertain GIS outputs:
**"Requires official source verification."** Any lead score is internal
prioritization only and must never be represented to a client as feasibility,
entitlement, or approval.

## Voice platform direction

Premium controlled voice interface — calm, professional, concise, premium, not
robotic. If separately authorized later, public automated voice is English-only;
Spanish and Russian are internal/operator capabilities, not public services
(DR-0016). Public phone remains closed under DR-0015. Architecture remains the
hybrid-first, separate media-plane direction in DR-0002 and
`architecture/voice-lab.md`.

## Relationship to KBP Core

Business Flow is **Core-compatible, not Core-integrated**. Core-compatible
means: no direct side effects from a model, explicit owner approval, bounded
task packets, validated candidate artifacts, an evidence trail, a deterministic
control boundary, and no source-of-truth drift. Do not claim Business Flow runs
through KBP Core (`kbp-core-engineering/kbp-core`) until that is separately
verified and adopted through a decision record.

Concrete compatibility contracts (effect classes, gate/broker model, allowed
contracts-first design work) are recorded in
`architecture/core-compatibility.md`, derived from the pinned context package
in `context/`. Construction OS is a future second domain client of the kernel;
business automation is NOT_OPENED there, and nothing flows from this repository
back into kbp-core.

## Google Workspace

Google Workspace is an operational layer, not SourceTrue. No writes to Drive,
Docs, Sheets, Gmail, Calendar, or Forms are authorized until separate
owner-approved task packets exist.
