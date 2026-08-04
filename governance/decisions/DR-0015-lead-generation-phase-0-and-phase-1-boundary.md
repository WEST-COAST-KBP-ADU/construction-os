# DR-0015: Open lead generation for Phase 0 and bounded Phase 1

- **Status:** adopted
- **Date:** 2026-08-04
- **Decider:** owner
- **Pinned base:** `main@9876243492e1df747a8b2f618bc0008d12286c81`
- **Related:** REVIEW-0001 (independent advisory input), DR-0004, DR-0005,
  DR-0007, DR-0008, DR-0011, DR-0012, DR-0013, DR-0014, TASK-0011

## Context

DR-0013 intentionally kept the public site in a demo-only posture: lead
generation was not open, and no contact, capture, or commercial surface was
allowed. A 2026-08-04 lead-generation roadmap and independent REVIEW-0001
recommended a value-before-contact product direction, but neither artifact was
committed SourceTrue and neither had authority by itself.

The owner approved a bounded disposition on 2026-08-04. This record contains
the adopted subset directly; it does not adopt the external roadmap or review
by reference.

## Decision

### 1. Authority opens only through Phase 1

- **Phase 0 is open** for governance, product-boundary, research, capacity, and
  experiment-economics work under separately approved records or task packets.
  Phase 0 is governance and analysis, not runtime or unbounded research
  authority.
- **Phase 1 is open** only for a no-contact, no-tracking acquisition
  foundation under separately approved task packets. Permitted work includes
  officially sourced public content, static city/service landing structures,
  navigation, sitemap, JSON-LD, `llms.txt`, and the already approved
  TASK-0011.
- This decision does not authorize implementation work that lacks its own
  approved task packet.

### 2. Closed surfaces remain closed

The following remain prohibited until a later owner-adopted decision and
bounded task packet explicitly open them:

- production intake, real-inquiry address input, forms, email capture, booking,
  or any other contact surface;
- a public phone number, production call routing, or automated public voice;
- client-facing GIS output, parcel selection, price/schedule output, or any
  permit, code, zoning, entitlement, feasibility, or buildability conclusion;
- analytics cookies, tag managers, GA, pixels, CAPI, session replay, click-ID
  export, audience upload, automated offline conversion export, or automatic
  closed-loop attribution;
- campaign activation, ad-platform optimization, ad spend, CRM writes,
  outbound messages, or any other external business effect.

DR-0012 remains proposed and its Research Gate remains open. This record does
not narrow `BOUNDARIES.md`.

### 3. Phase 2 through Phase 10 are a nonbinding map

| Phase | Candidate outcome | Authority state |
| :---- | :---------------- | :-------------- |
| 2 | No-PII configurator lab, synthetic fixtures, 2D-first | Map only; no implementation authorized |
| 3 | Sacramento City and unincorporated Sacramento County GIS authority/research, treated as two jurisdictions | Map only; research requires its own packet |
| 4 | Integrated non-production vertical slice | Map only |
| 5 | Consented intake and OwnerReview; voice may be considered here or later | Map only; intake and phone remain closed |
| 6 | Google demand capture | Map only; tracking and spend remain closed |
| 7 | Meta demand creation | Map only; pixels/CAPI and spend remain closed |
| 8 | Owner-reviewed planning packet and estimating | Map only |
| 9 | Construction delivery OS | Map only |
| 10 | Controlled external effects and jurisdiction scale | Map only |

Each later phase requires a new owner gate informed by evidence from the
preceding work. Names in this table are sequencing aids, not commitments,
budgets, vendor choices, or task authorization.

### 4. The future configurator is 2D-first

If Phase 2 is later opened, its first bounded spike must use deterministic
layered 2D or pre-rendered variants with synthetic fixtures. A 3D dependency
or asset pipeline requires a separate owner gate and evidence that 2D is
insufficient for comprehension or conversion. That gate must also account for
mobile performance, accessibility, deterministic replay, asset licensing,
maintenance burden, and total cost of ownership.

This design direction does not authorize Phase 2 code, assets, dependencies,
or a `/studio` route today.

### 5. Pilot destination and measurement are separate decisions

DR-0011 Option A (one owner-controlled mailbox) is adopted only as the
destination policy for a future bounded pilot. It does not open intake and
does not authorize a provider, mailbox integration, or external I/O.

The pilot policy stores no lead payload, click identifier, or attribution
mapping in the platform. It therefore does not provide automatic closed-loop
attribution. Any future measurement export and any future bidding goal are
separate owner gates; neither is enabled by this record.

`owner_qualified` remains a candidate first paid-media optimization event, not
an enabled export or an adopted schema. Its exact definition, evidence, and
platform-specific volume gate remain Phase 0 work. No universal conversion
threshold is adopted.

### 6. Voice remains one future entrance, not a second product

A future voice entrance, if separately opened, must feed the same controlled
candidate-artifact and OwnerReview model as web intake. DR-0002's separate
media-plane architecture remains binding. DR-0016 separately sets public
automated voice to English-only. No public phone or call path is opened here.

### 7. Market sourcing follows DR-0014

TASK-0011 sourcing scope includes Galt and Isleton in the Sacramento ring.
Publication remains official-source and evidence-gated: a page that cannot
meet the packet's sourcing standard does not ship.

Phase 3's candidate GIS work begins with City of Sacramento and
unincorporated Sacramento County as separate authority rows. This sequencing
does not authorize public GIS output or imply data availability.

## Supersession boundaries

- This record supersedes **only** DR-0013's statement that lead generation is
  wholly unopened. DR-0013's homepage decision and Blueprint §2 information
  architecture remain adopted.
- This record supersedes DR-0008 / Portal Blueprint v0.1 §8 phase sequencing.
  The older P0-P5 list remains provenance only.
- DR-0007's channel direction remains adopted, but no tracking or campaign
  action is opened.
- DR-0012 remains proposed; no client-facing screening exception is adopted.

## Remaining Phase 0 gates

Before any later production or paid-acquisition phase can open, separate
owner decisions must resolve at least:

- the first ICP and an exact `owner_qualified` definition;
- pilot duration, volume, stop conditions, and owner-review capacity;
- consent, Notice at Collection, retention, deletion, incident, and privacy
  rights handling;
- DR-0012 and the applicable GIS/legal Research Gate;
- measurement-export and bidding-goal gates;
- experiment budget, success rule, hold rule, and shutdown rule.

An owner-capacity breach pauses acquisition; it never relaxes OwnerReview.

## Consequences

- Phase 1 may build acquisition content without pretending contact exists.
- TASK-0011 may source Galt and Isleton, subject to its existing evidence bar.
- No later phase can inherit authority merely because it appears in the map.
- A future GIS prohibition or unusable source terms may force a design-first
  plus manual-review product; this record promises no production GIS path.

## Revisit trigger

Any request to add contact, tracking, a real address, a public phone, a
client-facing GIS result, campaign spend, or another Phase 2+ capability.

## Boundary check

- [x] Governance-only; no runtime, production, provider, credential, or deploy
- [x] No production PII, contact surface, tracking, or external action
- [x] GIS conclusions and DR-0012 remain closed
- [x] Later phases explicitly carry zero implementation authority
