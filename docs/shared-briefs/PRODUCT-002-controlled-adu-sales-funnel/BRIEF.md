# BRIEF — PRODUCT-002 controlled ADU sales funnel

## Anchor

- Repository: `WEST-COAST-KBP-ADU/construction-os`
- Product base: `main@ae6eb26d2555292b88988d50b72eaa4db26bc4c8`
- Issue: #70
- Author lane: ChatGPT Operational Lead
- Required reviewer: Fable 5 at the exact result SHA
- Owner: Tony; only Tony merges
- In-flight independent work: #66 / Draft PR #69; this packet does not touch its four files

## Owner direction

Product 2 is built to sell West Coast KBP ADU projects. It is not a passive
showcase and it is not a general-purpose software product.

Catalog, GIS, jurisdiction evaluation, Studio, reports, proposals, and project
records must each advance one controlled commercial path:

```
discover
→ start with a property
→ establish trust with source-backed facts
→ configure and qualify
→ human sales handoff
→ reviewed proposal
→ ADU construction sale
```

This replaces the earlier sequencing that kept public lead generation blocked
until after the preview.

## Current-state evidence

The repository already contains the product pieces required to build a credible
funnel, but they are not connected commercially:

- `adu-model/1` and three owned `concept_only` model families are on `main`;
- #66 / PR #69 implements a reference-only jurisdiction evaluator;
- the public portal has service, process, comparison, and conceptual Studio
  surfaces;
- `src/lib/siteConfig.ts` explicitly disables intake, phone, tracking, routing,
  storage, and external action;
- `governance/charter.md` already describes lead generation, qualification,
  property intelligence, review, estimate, and offer as the intended product
  loop;
- current governance keeps production PII, public phone, provider writes,
  tracking, advertising spend, and automated outreach closed until bounded
  approval gates exist.

The architecture must resolve that tension without weakening evidence,
privacy, or human commitment boundaries.

## Product question

How must Product 2 be structured so that every public feature has a measurable
role in selling an ADU while technical evidence remains reproducible,
non-promissory, and separate from personal and commercial data?

## Required records

1. `DECISION.md` — accepted commercial purpose and product boundaries.
2. `FUNNEL-CONTRACT.md` — stages, records, gates, CTA mapping, and metrics.
3. `FABLE-ANALYSIS.md` — independent adversarial product/architecture review authored by Fable 5 at the exact author result SHA.
4. `OUTCOME.md` — what is frozen and the next bounded implementation slices.

## Acceptance

- the terminal commercial outcome is an ADU construction sale;
- Studio is the customer-facing qualification and sales surface;
- Catalog, GIS, and jurisdiction records retain independent technical truth;
- address-first and phone-first paths converge on a human sales gate;
- PII and consent are isolated from immutable technical artifacts;
- every feature declares whether it attracts, builds trust, qualifies,
  converts, or hands off;
- minimum profitable v0 is manual-first and provider-light;
- technical status cannot imply price, schedule, permit, code, eligibility, or
  buildability;
- the first runtime implementation packet can be cut without reopening product
  intent;
- Fable 5 returns exactly one terminal recommendation: `NO BLOCKING FINDING` or
  `BLOCKED FOR REVISION` with exact findings.

## Non-goals

No runtime code, CRM or provider selection, production data collection, public
phone activation, analytics/pixel deployment, advertising campaign or spend,
automated outreach, appointment booking, instant quote, deployment, or merge.
