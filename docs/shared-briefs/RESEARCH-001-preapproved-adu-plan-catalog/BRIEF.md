# BRIEF — RESEARCH-001 official pre-approved ADU plan catalog

## Status and anchor

- **Packet type:** RESEARCH
- **Repository:** `WEST-COAST-KBP-ADU/construction-os`
- **Exact product base:** `main@af3beac2f24f7585de031cd3d46ac6fe6c9d9830`
- **Lane A:** ChatGPT Operational Lead
- **Lane B:** Fable 5, independent research author
- **Branch:** `research/preapproved-adu-plan-catalog-v1`
- **Product mutation:** none authorized

## Owner intent

West Coast KBP ADU intends to base Concept Studio on real official
pre-approved ADU plan programs rather than synthetic house archetypes. The
first release must avoid a chaotic all-jurisdiction catalog: it should identify
a small set of launch jurisdictions and a bounded set of official plans in each
jurisdiction that can become the factual source for full Studio model packages.

"Pre-approved" must never be represented as permission to build without a
site-specific permit. Site conditions, zoning and setbacks, utilities, fire
access, foundation/soils, energy compliance, owner eligibility, fees, plan
currency, and local issuance may still require separate review.

## Single outcome

Produce one evidence-backed recommendation for the first official-plan-backed
Concept Studio catalog:

1. a prioritized launch shortlist of **three to five jurisdictions** in the
   Sacramento–Placer operating region; and
2. for every shortlisted jurisdiction, **two to four official plan designs**
   when that many genuinely exist and are usable.

If a jurisdiction has no qualifying official program or too few usable plans,
say so explicitly. Do not manufacture symmetry.

## Candidate jurisdiction universe

Research these candidates first, using current official sources:

- City of Sacramento
- unincorporated Sacramento County
- City of Elk Grove
- City of Folsom
- City of Citrus Heights
- City of Rancho Cordova
- City of Roseville
- City of Rocklin
- City of Lincoln
- unincorporated Placer County

A jurisdiction outside this list may be added only when an official regional or
state program directly changes the recommendation. This packet recommends
launch zones; it does not adopt them.

## Qualifying source hierarchy

Use primary official evidence wherever available:

1. city or county building/planning department pages;
2. official plan-library or permit portal;
3. official downloadable plan sets, specifications, handbooks, checklists, and
   adoption resolutions;
4. official state or regional program pages when the local authority explicitly
   relies on them.

Secondary sources may be used only to locate primary evidence and must not
support a terminal fact. Record the access date for every source. Link directly
to the supporting official page or file.

## Required research matrix

For each candidate jurisdiction record:

- official program name and current status;
- exact official URL;
- administering authority;
- plan/provider/designer name;
- every available model name or identifier;
- gross floor area, bedrooms, bathrooms, stories, dimensions, construction
  type, roof form, and accessibility option when officially stated;
- files publicly available: floor plans, elevations, sections, structural,
  foundation, MEP, energy/T24, specifications, renderings, CAD/BIM, or other;
- file format and revision/effective date;
- whether the local authority calls the plans pre-approved, pre-reviewed,
  permit-ready, or something materially different;
- what review remains site-specific;
- geographic eligibility and owner/site constraints;
- local fees or program costs only when officially stated and current;
- update/expiration risk;
- exact missing facts.

## Rights and product-use analysis

For every shortlisted plan, distinguish public access from legal reuse. Record
whether the official source explicitly permits:

- downloading and using the plan for a permit application;
- modification;
- commercial contractor use;
- republication of plan images or drawings;
- creation and display of derivative 2D/3D Studio models;
- use of the architect/designer name, plan name, or municipal mark.

Do not infer a license from public download availability. Classify each right as
`PERMITTED`, `RESTRICTED`, or `UNKNOWN — OWNER/COUNSEL CLEARANCE REQUIRED`,
with the exact source language summarized and linked. Do not copy copyrighted
drawing sheets or large source excerpts into the repository.

## Studio feasibility analysis

For each shortlisted plan, assess whether official source data is sufficient to
build a faithful deterministic Studio model package containing:

- canonical plan identity and source/version binding;
- footprint and exterior dimensions;
- room/door/window topology;
- elevations and roof geometry;
- exterior material choices that remain within the official approval;
- immutable official-base attributes versus configurable attributes;
- site-specific fields that cannot be decided by the base plan;
- required provenance and disclaimer fields;
- source-update invalidation rule.

Separate three layers explicitly:

1. **official immutable base plan**;
2. **Studio visualization/configuration choices supported by official
   evidence**;
3. **site-specific engineering and permit review**.

Do not recommend arbitrary visual options that would invalidate or materially
depart from the official approval.

## Prioritization rubric

Score candidate launch jurisdictions and plans using explicit evidence:

- current and clearly documented official status;
- breadth and quality of downloadable technical source material;
- rights clarity for commercial use and derivative visualization;
- relevance to West Coast KBP's Sacramento–Placer service region;
- plan diversity without catalog duplication;
- feasibility of deterministic 2D-first Studio representation;
- low risk of misleading users about permit status;
- source currency and maintenance risk.

Explain weighting and show the score components. Rights uncertainty is a gate,
not a cosmetic penalty.

## Deliverable

Create exactly:

`docs/shared-briefs/RESEARCH-001-preapproved-adu-plan-catalog/FABLE-ANALYSIS.md`

The analysis must include:

1. method and exact review anchor;
2. candidate-jurisdiction matrix;
3. plan-level source matrix;
4. rights/reuse matrix;
5. remaining site-specific review matrix;
6. scored shortlist of three to five launch jurisdictions;
7. two to four recommended plans per shortlisted jurisdiction when available;
8. proposed normalized Studio catalog fields;
9. source/version invalidation policy;
10. uncertainties and owner/counsel gates;
11. exactly one terminal recommendation: `ADOPT SHORTLIST` or
    `BLOCKED FOR EVIDENCE`.

Commit only that file to the packet branch. Post a GitHub Issue comment headed
`RESULT` with the exact result commit SHA, artifact path, source count,
deviations, and terminal recommendation.

## Acceptance evidence

- Every material claim is linked to a current primary official source.
- All ten candidate jurisdictions have an explicit researched disposition.
- Every recommended plan is tied to an official plan/version identifier or is
  clearly marked as lacking one.
- Public availability is not treated as a reuse license.
- Site-specific permit requirements remain explicit.
- The proposed Studio schema cleanly separates official, configurable, and
  site-specific data.
- The diff contains only `FABLE-ANALYSIS.md` in this packet directory after
  this brief.
- A non-author review will evaluate the exact result SHA before adoption.

## Non-goals and stop conditions

Do not:

- modify application code, existing Studio data, design tokens, assets,
  navigation, deployment, dependencies, governance, or production;
- select vendors, purchase licenses, contact municipalities, or make legal
  conclusions;
- download or republish full copyrighted plan sets into this repository;
- claim that a pre-approved plan can be built without site-specific permitting;
- expand into pricing, lead capture, marketing campaigns, CRM, or construction
  operations;
- adopt the shortlist on behalf of the Owner.

If an official source is unavailable, contradictory, or silent on reuse rights,
record the uncertainty and continue the remaining research. Stop only if no
candidate can be supported by current primary evidence.
