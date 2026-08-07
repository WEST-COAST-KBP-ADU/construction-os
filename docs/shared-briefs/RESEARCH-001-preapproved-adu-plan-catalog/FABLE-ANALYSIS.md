# FABLE-ANALYSIS — RESEARCH-001 official pre-approved ADU plan catalog

Lane B independent research author: Fable 5.
Packet: `RESEARCH-001`. Issue #51. Draft PR #52.

---

## 1. Method and exact review anchor

| Item | Value |
| :-- | :-- |
| Repository | `WEST-COAST-KBP-ADU/construction-os` |
| Exact product base | `main@af3beac2f24f7585de031cd3d46ac6fe6c9d9830` |
| Packet branch head read | `research/preapproved-adu-plan-catalog-v1@464d3460adae423aa87aa8b6f022f0d638431d32` |
| Brief read | `docs/shared-briefs/RESEARCH-001-preapproved-adu-plan-catalog/BRIEF.md`, in full, at that head |
| Research date (single access date for every source below) | 2026-08-07 |
| Product/governance mutation | none |
| Files added by this packet after the brief | this file only |

Base and head were verified locally before research began. The branch adds
only `BRIEF.md` on top of `af3beac`; there is no product drift between the
declared base and the branch.

### 1.1 Blocking method deviation — no primary source was retrieved

**This is the controlling limitation of this packet and it changes the
terminal recommendation.**

This session's egress policy permits GitHub and package registries only.
Every other host is refused by the policy proxy at CONNECT time with `403`.
That includes all ten candidate jurisdictions and every state source:

```
000  https://www.cityofsacramento.gov      000  https://www.roseville.ca.us
000  https://www.saccounty.gov             000  https://www.rocklin.ca.us
000  https://www.elkgrovecity.org          000  https://www.lincolnca.gov
000  https://www.folsom.ca.us              000  https://www.placer.ca.gov
000  https://www.citrusheights.net         000  https://www.hcd.ca.gov
000  https://www.cityofranchocordova.org   000  https://leginfo.legislature.ca.gov
000  https://adu.cityofsacramento.org      000  https://www.dgs.ca.gov
```

The proxy status endpoint records each as
`connect_rejected — gateway answered 403 to CONNECT (policy denial)`. The
environment's own operating instructions state that policy denials must be
reported rather than retried or routed around. They were not routed around.
Page-fetch tooling fails identically, because it egresses through the same
proxy.

**One research channel remained: web search.** Search returns official URLs
plus an engine-side synthesis of page content. That is sufficient to *locate*
primary evidence and to establish with reasonable confidence *which
jurisdictions operate a program*. It is **not** a primary read of an official
page. Under the brief's source hierarchy, secondary material "may be used only
to locate primary evidence and must not support a terminal fact."

Therefore every factual cell in sections 2–5 carries a verification status:

| Status | Meaning |
| :-- | :-- |
| `P` | retrieved directly from the primary official source |
| `S` | search-mediated; official URL located, page **not** retrieved |
| `X` | absent from every channel available in this session |

**Count of cells at `P`: zero.** Forty official URLs were located; none were
retrieved. Section 12 is the unblock procedure.

This deviation is structural, not a research shortfall, and it has precedent
in this programme: RP-0008 hit the identical wall on Sacramento County GIS
hosts in this lane and was closed only when a lane with egress executed the
probes. The same remedy applies here.

---

## 2. Candidate-jurisdiction matrix

All ten candidates have an explicit researched disposition. No jurisdiction
outside the bounded universe was added.

| # | Jurisdiction | Program located | Official program name | Program model | Primary official URL (located, unretrieved) | Status | Disposition |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| 1 | City of Sacramento | yes ×2 | "Shelf Ready ADU Plans"; separately "Preapproved ADU (AB-1332)" | agency-authored library **+** AB 1332 registry | `adu.cityofsacramento.org/Shelf-ready-plans`; `cityofsacramento.gov/community-development/building/building-programs/preapproved-adu-program-ab1332` | S | **Verification candidate — rank 1** |
| 2 | Unincorporated Sacramento County | yes | "Shelf Ready ADU Program" | agency-authored library | `building.saccounty.gov/pages/adu.aspx` | S | **Verification candidate — rank 2** |
| 3 | City of Elk Grove | yes ×2 | "City Pre-Approved ADU Plans"; "Master ADU Plans by Designers" | agency library **+** AB 1332 registry | `elkgrove.gov/accessory-dwelling-units/city-pre-approved-adu-plans-and-submittal-requirements` | S | **Verification candidate — rank 3** |
| 4 | City of Folsom | **no plan library located** | ADU Design Workbook only | guidance only | `folsom.ca.us/government/community-development/housing-services/accessory-dwelling-units` | S | Excluded from launch set; AB 1332 posture unresolved |
| 5 | City of Citrus Heights | yes ×2 | "Permit-Ready ADU Program (PRADU)"; "ADU Preapproved Plans (AB-1332)" | agency library **+** AB 1332 registry | `citrusheights.net/1108/Permit-Ready-ADU-Program` | S | **Verification candidate — rank 4** |
| 6 | City of Rancho Cordova | **no program located** | — | — | `cityofranchocordova.org/departments/community-development/building-and-safety` | X | Excluded; see 2.2 |
| 7 | City of Roseville | yes | "Preapproved ADU Plans (AB 1332)" | AB 1332 registry | `roseville.ca.us/government/departments/development_services/building/preapproved_a_d_u_plans___a_b_1332_` | S | **Verification candidate — rank 5** |
| 8 | City of Rocklin | yes | "Permit-Ready ADU Program" | AB 1332 registry, agency-branded models | `rocklin.ca.us/permit-ready-adus` | S | Reserve candidate |
| 9 | City of Lincoln | yes | "Pre-Approved ADU Plans (AB 1332)" | AB 1332 registry | `lincolnca.gov/business-and-development/planning-and-development/pre-approved-adu-plans-ab-1332/` | S | Reserve candidate |
| 10 | Unincorporated Placer County | yes | "Master ADU Program (AB 1332)" | AB 1332 registry | `placer.ca.gov/10074/Master-ADU-Program-AB-1332` | S | Reserve candidate — highest schema value, see 8.4 |

### 2.1 The governing structural finding: two incompatible program models

Eight of ten jurisdictions operate a program, but they are **not the same kind
of thing**, and conflating them would be the single most expensive error this
packet could hand downstream.

**Model A — agency-authored plan library.** The jurisdiction commissioned a
finite set of plans, publishes them, and gives them free to property owners in
that jurisdiction. Sacramento City, Sacramento County, Citrus Heights, and
Elk Grove's city-authored set. Characteristics: fixed and enumerable catalog,
consistent drawing quality, modification prohibited, geographic eligibility
limited to that jurisdiction.

**Model B — AB 1332 preapproval registry.** Government Code §65852.27, in
force 1 January 2025, requires every California local agency to accept ADU
plan submissions from *any* applicant, approve or deny them, and post
approved plans **together with the submitting applicant's contact
information** on the agency website. Roseville, Rocklin, Lincoln, Placer
County, and Elk Grove's designer track. Characteristics: catalog is an
open-ended directory of *privately owned* plans; contents change without
notice; the contact information is published precisely because the homeowner
is expected to go and license the plan from its owner.

The rights consequence is decisive and is developed in section 4: **Model B
plans are third-party intellectual property by construction.** A city posting
a plan is not a license to anyone; it is a code-compliance finding plus a
referral. Elk Grove makes the ownership explicit from the other direction —
per search, a design professional "has the option to request that the
pre-approved plans not be posted for public access," which is a right only an
owner holds.

### 2.2 Rancho Cordova and Folsom

Rancho Cordova: a site-restricted search across `cityofranchocordova.org`
returned the Building and Safety, Planning, Housing, and document-library
pages and **no** AB 1332 or pre-approved ADU page. Absence in search is weak
evidence of absence in fact, so this is recorded as `X` — unresolved, not
proven negative. Given the §65852.27 mandate, either the program exists and is
poorly indexed, or the jurisdiction is out of compliance. Both readings are
material and neither is established here.

Folsom: multiple channels agree that no city-published pre-approved plan
library exists, and that Folsom instead publishes an ADU Design Workbook.
Folsom adopted Ordinance No. 1361 on 14 April 2026, effective 14 May 2026,
updating Chapter 17.105 of the Folsom Municipal Code — an active ADU
rulemaking posture with no plan library attached. Its AB 1332 registry posture
was not located.

Neither jurisdiction enters the launch set. Neither is dismissed permanently.

---

## 3. Plan-level source matrix

Every plan-level attribute below is `S` or `X`. No plan set, drawing index,
title block, or revision date was retrieved. Where a value is absent from all
available channels it is `X` and is **not** estimated.

### 3.1 City of Sacramento — Shelf Ready ADU Plans

| Attribute | Value | Status |
| :-- | :-- | :-- |
| Administering authority | City of Sacramento, Community Development / Building | S |
| Plans located | 460 sf studio/1BR; 870 sf 2BR; 1,000 sf 2BR; 1,184 sf 3BR | S |
| Official plan identifiers | `X` — no plan number, sheet index, or version ID located | X |
| Bathrooms, stories, dimensions, construction type, roof form | `X` | X |
| Accessibility option | `X` for City set | X |
| Stated cost to owner | free | S |
| Code basis stated | 2022 California Residential Building Code; all-electric | S |
| Modification | not allowed; mirroring allowed | S |
| Files publicly downloadable | plan sets, a Floor Plans Comparison Handout (PDF), and a Shelf Ready Submittal Guide (PDF) exist at known URLs; **sheet-level contents unverified** | S |
| Revision / effective date | `X` | X |
| Local term used | "Shelf Ready"; the City separately runs an "AB-1332 Preapproved" program under a different name | S |
| Designer of record | `X` for the City set specifically — see 3.2 caution | X |

### 3.2 Unincorporated Sacramento County — Shelf Ready ADU Program

| Attribute | Value | Status |
| :-- | :-- | :-- |
| Administering authority | Building Permits and Inspection Division, Dept. of Community Development | S |
| Plans located | two 460 sf studio/1BR; 870 sf 2BR; 1,000 sf 2BR; 1,184 sf 3BR — **five sets** | S |
| Official plan identifiers | `X` | X |
| Stated cost to owner | free | S |
| Code basis stated | 2022 California Residential, Electrical, Mechanical, Plumbing Codes, including energy calculations | S |
| Modification | not permitted | S |
| Geographic eligibility | **unincorporated County only** | S |
| Designer of record | Laura Miller Design, working with County Planning and Building — **private firm authorship** | S |
| Revision / effective date | `X` | X |

**Caution carried forward.** The City and County size ladders are near-identical
(460 / 870 / 1,000 / 1,184). Either the two agencies published a shared or
derived plan family, or search has cross-contaminated two distinct programs.
This ambiguity is unresolvable without primary retrieval and it directly
affects catalog de-duplication — the brief scores "plan diversity without
catalog duplication," and this is exactly where duplication would enter. It is
logged as unknown U-3 in section 10.

### 3.3 City of Citrus Heights — PRADU

| Attribute | Value | Status |
| :-- | :-- | :-- |
| Administering authority | City of Citrus Heights | S |
| Plans located | three models: two 1BR/1BA, one 2BR/1BA | S |
| Size range | 499–749 sf | S |
| Configurable options stated | choice of roof lines; choice of exterior finishes; interior layout option with accessible features (wider doorways and hallways); reversed/flipped plan format | S |
| Official plan identifiers | `X` | X |
| Stated cost to owner | free to **Citrus Heights property owners** | S |
| Programme launched | summer 2021; 26 ADUs built on these plans as of the cited report; 31 ADU permits issued citywide in 2025 | S |
| Funding | grant from California Dept. of Housing and Community Development | S |
| Code basis stated | `X` — **not located, and this matters acutely given a 2021 launch** | X |
| Designer of record | `X` | X |

Citrus Heights is the only located program that **publishes an official
configurability envelope** — roof line, exterior finish, accessible interior
layout, mirroring. That maps directly onto a Studio option model without
inventing anything (section 8).

### 3.4 City of Rocklin — Permit-Ready ADU Program

| Attribute | Value | Status |
| :-- | :-- | :-- |
| Plans located | Model A1, Model A2, Model B1, Model B2 | S |
| Model B1 | 749 sf detached ADU; artifact named `pradup-model_b1_pc1_approved.pdf` — the `pc1` token suggests plan-check cycle 1 | S |
| Model A1 / A2 / B2 attributes | `X` | X |
| Authorship | "designed by ADU builders, private licensed architects/engineers, and private designers" — **explicitly third-party** | S |
| Review | reviewed by Rocklin Building Department; 30-day approve/deny on complete applications | S |

### 3.5 Elk Grove, Roseville, Lincoln, Placer County — registry contents

For all four, the **registry exists and the plan roster was not retrieved**.
Roster contents are `X`. What was established is programme mechanics:

| Jurisdiction | Established mechanics | Status |
| :-- | :-- | :-- |
| Elk Grove | Plans posted under "Available Pre-Approved ADU Plans by Designer" with the Design Professional's website, email and phone; **plans cannot be revised and must be permitted as designed**; pre-approval "does not constitute approval to begin construction"; site-specific design, planning/zoning approval and a building permit still required; **plans valid only for the current triennial CRC cycle, expiration date must be printed on the plans**; designer may opt out of public posting | S |
| Roseville | Plans preapproved by the City; **still require site-specific design and permitting**; site-specific package must carry site plan, zoning compliance, utility services, fire sprinkler system, and photovoltaic layout/design; 30-day approve/deny; 10 business days first review cycle, 5 business days subsequent; plans posted with applicant contact information per AB 1332 | S |
| Lincoln | Master ADU Plan applications submitted in person; address left blank; design options limited to siding/roofing materials, **selected before submittal**; blank title-block area required per sheet for address and owner name; per search, "pre-approved ADU plans are not subject to code updates until January 2032 (AB 130)" — see 9.2, this conflicts with 3.6 | S |
| Placer County | Accepting Master ADU applications since 1 January 2025; **"ADU Master Plans are non-site specific"**; plans reviewed against current County-adopted building codes; permitted design options: minor architectural features, siding/roofing materials, attached garages/decks; **options affecting living square footage require a separate master plan submittal**; **maximum four elevations with minor roof differences per plan** | S |

Placer County's rule set is the most precisely drawn configurability boundary
located anywhere in the ten, and section 8 builds the schema around it.

### 3.6 Cross-cutting currency finding — the 1 January 2026 code transition

Independent of rights, a second gate applies to the entire region.

- The 2025 California Building Standards Code took effect **1 January 2026**. `S`
- Pre-approvals run with the triennial code cycle. Elk Grove states this on its
  own program page and requires the expiration date printed on the plans. `S`
- Multiple sources state that pre-approved ADU plans drawn to the 2022 code
  became unusable on 31 December 2025 and that jurisdictions asked designers to
  resubmit under the 2025 code. `S`
- AB 130, signed 30 June 2025, froze new residential building standards from
  1 October 2025 to 1 June 2031, and the Building Standards Commission stated
  there will be no 2028 residential cycle. The 2025 Code was adopted **before**
  AB 130 and is unaffected — it still took effect 1 January 2026. `S`

The correct reading is therefore: **one last mandatory reissue at the
1 January 2026 boundary, then an unusually long stability window to 2031.**

Today is 2026-08-07 — seven months past that boundary. Yet the Sacramento City
and Sacramento County programs are still described in the material reachable
from here as meeting the **2022** code, and Citrus Heights launched on a 2021
vintage with no stated code basis at all. Either those pages are stale, or the
libraries have not been reissued and are currently unusable. **Which of the two
is true cannot be determined without retrieving the pages**, and it is
dispositive: a catalog built on expired plans would be worse than no catalog,
because it would be confidently wrong in a permitting context.

The same finding carries the strategic upside. If reissue under the 2025 Code
is confirmed, AB 130 means that catalog stays code-valid until roughly 2031.
That is a genuinely unusual asset-life window for a plan-backed product, and it
is the strongest argument for doing this work properly rather than quickly.

---

## 4. Rights and product-use matrix

The brief instructs: do not infer a license from public download availability.
Applied strictly, and reinforced by an explicit negative result — **no license,
terms-of-use, copyright, or reuse language was located for any plan in any of
the ten jurisdictions, through any available channel.** A targeted search for
exactly that language returned no such terms and confirmed the gap.

Rights are assessed per the six uses named in the brief. `U` =
`UNKNOWN — OWNER/COUNSEL CLEARANCE REQUIRED`; `R` = `RESTRICTED` on located
official language.

| Right | Model A libraries (Sac City, Sac County, Citrus Heights, EG city set) | Model B registries (Roseville, Rocklin, Lincoln, Placer, EG designer track) |
| :-- | :-- | :-- |
| Download and use for a permit application | `R` — permitted, but only for a property owner **in that jurisdiction**; County set explicitly unincorporated-only, Citrus Heights explicitly "Citrus Heights property owners" | `U` — the agency grants code approval, not use; use is between owner and plan owner |
| Modification | `R` — expressly prohibited (Sac City, Sac County, Elk Grove). Sac City permits mirroring; Citrus Heights permits mirroring and a stated option envelope | `R` — Elk Grove: "cannot be revised and must be permitted as designed" |
| Commercial contractor use | `U` — no located language addressing contractor use at all | `U` — presumptively requires a licence from the plan owner |
| Republication of plan images or drawings | `U` | `U` — third-party copyright; publication contrary to §65852.27 posting is not implied |
| **Creation and display of derivative 2D/3D Studio models** | `U` | `U` |
| Use of designer name, plan name, or municipal mark | `U` — and municipal marks carry an independent endorsement-confusion risk | `U` |

### 4.1 Why the derivative-model row is the binding constraint

Concept Studio's entire product thesis is the derivative-model row, and it is
`U` in every cell of both columns. Nothing located supports it and nothing
located forbids it. Three structural facts sharpen the risk rather than
softening it:

1. **Private authorship is confirmed, not suspected.** Sacramento County's
   library is attributed to Laura Miller Design; Rocklin's models are stated to
   be authored by private architects, engineers, designers, and builders.
   Architectural works and technical drawings are ordinarily protected, and
   authorship sitting with a private firm means the municipality may never have
   held the rights it would need in order to pass any onward.
2. **Every located grant is party-limited and purpose-limited.** "Free to
   residents of unincorporated Sacramento County" and "free to Citrus Heights
   property owners" are grants to homeowners for permitting. West Coast KBP is
   neither the grantee nor within the purpose.
3. **AB 1332 publishes contact details as a routing mechanism.** The statute
   pairs each posted plan with its applicant's contact information. The natural
   reading is that the visitor must transact with the plan owner. A registry
   built for referral is not a licence.

**No plan in any of the ten jurisdictions currently clears the rights gate.**
Per the brief, rights uncertainty is a gate, not a penalty. This alone forecloses
`ADOPT SHORTLIST` today, independently of the retrieval and currency problems.

### 4.2 The clearance path is narrow, and it is not a research task

Two viable routes exist, both owner/counsel decisions and both outside this
packet's authority: obtain a written licence from each plan's author, or
commission original West Coast KBP plans and submit them for preapproval under
AB 1332 — which every one of these jurisdictions must accept from any
applicant. The second route inverts the problem: it makes West Coast KBP the
plan owner, with unambiguous rights to model, display and market its own
designs, and puts its contact information on eight municipal websites. It is
recorded here as an evidenced structural option, **not** recommended, adopted,
or priced.

---

## 5. Remaining site-specific review matrix

This matrix is the compliance spine of any public-facing Studio surface. Every
row is officially sourced, and the located language is unusually consistent.

| Site-specific item | Located official language / source | Status |
| :-- | :-- | :-- |
| Pre-approval is **not** permission to build | Elk Grove: obtaining a pre-approved plan "does not constitute approval to begin construction… A building permit is still required prior to starting any work" | S |
| Site-specific design and permit approval | Elk Grove and Roseville both state it explicitly and independently | S |
| Site plan showing ADU placement | required by Sacramento City and Sacramento County to use a shelf-ready plan | S |
| Planning and zoning approval | Elk Grove states planning/zoning approval remains required; Roseville requires zoning-ordinance compliance in the submittal | S |
| Utility services | Roseville site-specific submittal component | S |
| Fire sprinkler protection system | Roseville site-specific submittal component | S |
| Photovoltaic layout and design | Roseville site-specific submittal component | S |
| Foundation and soils | `X` — not located in any program page reachable from here; standard practice suggests it is site-specific, **but this analysis does not assert it** | X |
| Plans are non-site-specific by definition | Placer County: "ADU Master Plans are non-site specific" | S |
| Geographic eligibility limits | Sacramento County: unincorporated County only; Citrus Heights: Citrus Heights property owners; Roseville: within city limits | S |
| Plan currency / expiration | Elk Grove: valid only for the current triennial CRC cycle; expiration date must be listed on the plans | S |
| Statutory processing clock | 30 days to approve or deny a complete application using preapproved plans (Elk Grove, Roseville, Rocklin, per §65852.27) | S |

**Product rule derived from this matrix, and it is not optional.** Any Studio
surface presenting an official plan must state, adjacent to the plan and not
behind a link, that a pre-approved plan is not permission to build and that
site-specific review still applies. On this repository's existing standard,
regulatory output carrying residual uncertainty must also carry
`Requires official source verification.` verbatim. Every cell in this matrix is
`S` or `X`, so on today's evidence that string applies to all of it.

---

## 6. Scored shortlist — five jurisdictions

**Read this as a ranked verification queue, not an adoption list.** The brief
requires a scored shortlist of three to five launch jurisdictions and one is
delivered; the terminal recommendation in section 11 nonetheless withholds
adoption, because scoring evidence quality cannot substitute for having the
evidence. Ranks 1–5 are the order in which primary verification should be
spent.

### 6.1 Weighting

Weights follow the brief's rubric. Rights clarity is scored but **also acts as a
gate**: a jurisdiction cannot be adopted on a strong composite while rights
remain `U`, which is presently every jurisdiction.

| Criterion | Weight | Rationale |
| :-- | --: | :-- |
| Rights clarity for commercial use and derivative visualization | 25 | Gate criterion — brief §"Prioritization rubric" |
| Source currency and maintenance risk | 20 | Elevated from ordinary weight by the 1 Jan 2026 code transition (§3.6) |
| Breadth and quality of downloadable technical source material | 15 | Determines whether a faithful model package is buildable at all |
| Feasibility of deterministic 2D-first Studio representation | 12 | Repository constraint: Studio stays 2D-first absent evidence |
| Relevance to the Sacramento–Placer service region | 10 | Sacramento core, Placer horizon |
| Low risk of misleading users about permit status | 8 | Fail-closed demo posture |
| Current and clearly documented official status | 6 | Programme legibility |
| Plan diversity without catalog duplication | 4 | Catalog quality |

Scores are 0–5 per criterion on evidence located in this session, multiplied by
weight, normalized to 100. **Rights scores 1/5 everywhere** — nonzero only
because the programs are real and identifiable, which makes clearance a
tractable ask rather than an open-ended one.

### 6.2 Scores

| Rank | Jurisdiction | Rights (25) | Currency (20) | Material (15) | 2D feas. (12) | Region (10) | Mislead risk (8) | Status (6) | Diversity (4) | **Total** |
| --: | :-- | --: | --: | --: | --: | --: | --: | --: | --: | --: |
| 1 | City of Sacramento | 1 | 2 | 4 | 4 | 5 | 4 | 4 | 4 | **57.6** |
| 2 | Unincorporated Sacramento County | 1 | 2 | 4 | 4 | 5 | 4 | 4 | 3 | **56.8** |
| 3 | City of Elk Grove | 1 | 4 | 2 | 3 | 4 | 5 | 5 | 3 | **56.4** |
| 4 | City of Citrus Heights | 1 | 1 | 3 | 5 | 4 | 4 | 4 | 4 | **50.8** |
| 5 | City of Roseville | 1 | 4 | 1 | 3 | 3 | 5 | 5 | 2 | **50.6** |
| — | Unincorporated Placer County | 1 | 4 | 1 | 4 | 3 | 4 | 4 | 2 | 50.2 |
| — | City of Rocklin | 1 | 3 | 2 | 3 | 3 | 4 | 4 | 3 | 47.4 |
| — | City of Lincoln | 1 | 3 | 1 | 3 | 2 | 3 | 4 | 2 | 41.8 |
| — | City of Folsom | 0 | 0 | 0 | 0 | 4 | 3 | 2 | 0 | 12.4 |
| — | City of Rancho Cordova | 0 | 0 | 0 | 0 | 4 | 2 | 0 | 0 | 9.2 |

### 6.3 Reading the scores

The top five cluster inside seven points, which is itself the finding: **no
jurisdiction is distinguished by evidence quality, because no jurisdiction has
been primarily verified.** The spread reflects programme structure, not
verified fact, and it will move once real pages are read.

- **Sacramento City and County** lead on material breadth and regional fit — a
  finite, enumerable, agency-published catalog is the only shape that supports
  a coherent launch. Both are marked down hard on currency: both are described
  as 2022-code, and both sit seven months past the code boundary.
- **Elk Grove** scores lowest of the five on material because its roster was not
  retrieved, and highest on currency and mislead-risk because it publishes the
  clearest expiry discipline located anywhere — expiration printed on the plans
  — and states unambiguously that pre-approval is not permission to build.
- **Citrus Heights** is the best 2D-Studio fit in the set: three models, an
  officially stated option envelope, mirroring. Its currency score of 1 is the
  worst on the board — a 2021 launch with no located code basis is the most
  likely library in the region to be silently expired.
- **Roseville** and **Placer County** are near-identical registries. Placer is
  held just out of the five on regional priority, not on quality; its
  configurability rules are the most useful artifact found in this packet and
  are used in section 8 regardless of rank.

### 6.4 Recommended plans per shortlisted jurisdiction

The brief asks for two to four recommended plans per shortlisted jurisdiction
"when that many genuinely exist and are usable," and instructs: do not
manufacture symmetry. **No plan is recommended.** Usability has two components,
rights and currency, and both are unresolved for every candidate. Naming plans
now would manufacture exactly the false precision the brief forbids.

What can be stated is the candidate pool that verification should target:

| Jurisdiction | Candidate pool located | Sufficient for 2–4? |
| :-- | :-- | :-- |
| City of Sacramento | 4 sets (460 / 870 / 1,000 / 1,184 sf) | yes, if distinct from County — see U-3 |
| Sacramento County | 5 sets (2×460 / 870 / 1,000 / 1,184 sf) | yes, same caveat |
| Elk Grove | roster not retrieved | unknown |
| Citrus Heights | 3 models (499–749 sf) | yes — 3 |
| Roseville | roster not retrieved | unknown |

---

## 7. Layer separation

Required by the brief before any schema is proposed. Three layers, hard
boundaries, no leakage.

**Layer 1 — official immutable base plan.** Everything fixed by the
jurisdiction's approval: footprint, gross floor area, room topology, structural
system, egress, plan identifier, code cycle, expiration. Sacramento City,
Sacramento County and Elk Grove all prohibit modification; Elk Grove requires
the plan be "permitted as designed." Layer 1 is read-only in Studio, forever.

**Layer 2 — configurable, only where an official source says so.** Not a design
judgement — an enumeration of officially stated permissions:

| Configurable dimension | Officially stated by | Status |
| :-- | :-- | :-- |
| Mirroring / reversed plan | Sacramento City ("mirroring of the plans is allowed"); Citrus Heights (reversed plan format) | S |
| Roof line choice | Citrus Heights | S |
| Exterior finish choice | Citrus Heights; Placer County (siding/roofing materials); Lincoln (siding/roofing, selected before submittal) | S |
| Accessible interior layout option | Citrus Heights (wider doorways and hallways) | S |
| Minor architectural features | Placer County | S |
| Attached garages / decks | Placer County | S |
| Elevation variants | Placer County — **maximum four per plan, minor roof differences only** | S |

Anything not in this table is Layer 1. Placer County supplies the governing
negative rule: **any option that changes living square footage is not an
option — it is a different plan requiring separate submittal.** Studio must
enforce that as a hard invariant, not a warning.

**Layer 3 — site-specific engineering and permit review.** Section 5 in full.
Studio must never present Layer 3 as decided, defaulted, or estimated. It has
no lot, no soils, no utilities, no fire access. Layer 3 fields exist in the
schema only as explicit `not_determined_by_base_plan` markers.

---

## 8. Proposed normalized Studio catalog fields

Deterministic, fail-closed, and consistent with the existing catalog-release
model (append-only, versioned, `config_hash` over canonical form, deny-rules as
data). **Proposal only — no Studio data is created or mutated by this packet.**

### 8.1 Identity and provenance — all required, no defaults

| Field | Type | Notes |
| :-- | :-- | :-- |
| `plan_uid` | string | internal stable key; never derived from a municipal identifier |
| `jurisdiction_id` | enum | one of the ten; the accountable agency |
| `program_id` | enum | `agency_library` \| `ab1332_registry` — the Model A/B distinction from §2.1, load-bearing |
| `official_plan_identifier` | string \| `null` | `null` is legal and **must render** as "no official plan identifier published" |
| `official_source_url` | url | deep link to the specific plan page |
| `official_source_retrieved_at` | date | date the page was **retrieved**, not searched |
| `plan_author` | string \| `null` | e.g. Laura Miller Design; drives the rights record |
| `author_is_third_party` | bool | `true` ⇒ rights gate cannot be cleared by the agency |
| `code_cycle` | enum | `2022_CRC` \| `2025_CRC` |
| `code_cycle_verified_at` | date | required; see §9 |
| `expiration_date` | date \| `null` | Elk Grove prints it on the plan; capture it |

### 8.2 Layer 1 — official immutable base

`gross_floor_area_sf`, `bedrooms`, `bathrooms`, `stories`, `footprint_length_ft`,
`footprint_width_ft`, `construction_type`, `roof_form_base`,
`accessibility_option_available`, `all_electric`.

Every one is nullable, and **`null` means "not officially stated"** — it never
means zero, and it never falls back to a plausible value. A `null` renders as
an explicit gap. This is the same fail-closed posture as the existing asset
manifest, which throws on `unknown_geometry_ref` rather than substituting.

### 8.3 Layer 2 — configurable options

```
options: [
  { option_id, option_type, allowed_values[],
    official_permission_url, official_permission_quote,
    affects_living_area: false }
]
```

`option_type` ∈ `mirror` | `roof_line` | `exterior_finish` |
`accessible_layout` | `minor_architectural_feature` | `attached_garage` |
`attached_deck` | `elevation_variant`.

Three hard invariants:

1. **No option without a citation.** An option lacking
   `official_permission_url` is invalid catalog data and must fail the release,
   not degrade silently.
2. **`affects_living_area: true` is unrepresentable.** Per Placer County, such a
   change is a different plan. Schema-level rejection, not a runtime warning.
3. **`elevation_variant` is capped at four** where the jurisdiction states a cap.
   The cap is data, per jurisdiction, not a constant.

### 8.4 Layer 3 — site-specific, non-negotiable

```
site_specific_required: [
  site_plan, zoning_compliance, utility_services,
  fire_sprinkler_system, photovoltaic_layout,
  foundation_soils_review, planning_approval, building_permit
]
site_specific_status: "not_determined_by_base_plan"   // only legal value
```

`foundation_soils_review` is included as a schema slot while remaining `X` in
§5 — the slot is structural, its per-jurisdiction requirement is unverified and
must be marked so.

### 8.5 Rights record — gates rendering, not just reporting

```
rights: {
  permit_use, modification, commercial_contractor_use,
  republication, derivative_model_display, name_and_mark_use
}                              // each: PERMITTED | RESTRICTED | UNKNOWN
rights_source_url, rights_source_quote, rights_cleared_by: null
```

**Binding rule: `derivative_model_display != PERMITTED` ⇒ the plan must not be
rendered in Studio at all.** Not greyed out, not teased, not shown as
"coming soon" — absent from the catalog. On today's evidence that rule excludes
every plan in all ten jurisdictions, which is the correct and intended
behaviour of a fail-closed gate.

### 8.6 Disclosure block — required on every plan surface

`is_permission_to_build: false` (constant), the site-specific notice from §5,
the geographic eligibility limit, and `Requires official source verification.`
verbatim while any material field remains unverified.

---

## 9. Source and version invalidation policy

### 9.1 Invalidation triggers

| # | Trigger | Effect |
| :-- | :-- | :-- |
| 1 | `expiration_date` reached | plan leaves the catalog automatically; no grace period |
| 2 | California triennial code cycle advances | **every** plan at the superseded `code_cycle` is invalidated en bloc |
| 3 | Official source URL 404s, redirects, or changes content hash | plan enters `stale`; suppressed from Studio pending re-verification |
| 4 | `official_source_retrieved_at` older than 90 days | plan enters `stale` |
| 5 | Jurisdiction restates modification or option rules | all Layer 2 options for that jurisdiction invalidated pending re-citation |
| 6 | Any `rights` field moves off `PERMITTED` | immediate removal per §8.5 |
| 7 | AB 1332 registry entry disappears | assume withdrawn; remove, do not cache |

Trigger 7 is specific to Model B: registry contents are controlled by private
plan owners who may withdraw at any time, and Elk Grove's opt-out provision
shows withdrawal is an exercisable right. A cached copy of a withdrawn plan is
both stale data and a rights exposure.

### 9.2 The AB 130 stability window, and the contradiction inside it

Section 3.6 establishes one mandatory reissue at 1 January 2026, then no
residential code cycle until 2031. Policy consequence: **trigger 2 should be
expected to fire once, already, and then not again for roughly five years.**
That makes a one-time verification sweep unusually valuable — its result should
hold for years rather than months.

The contradiction must be recorded rather than smoothed. Lincoln's page is
reported to state that pre-approved plans "are not subject to code updates
until January 2032 (AB 130)," while the general rule and Elk Grove's own
program terms tie validity to the triennial cycle that turned over on
1 January 2026. Both cannot be true in the same scope. The likely reconciliation
is that Lincoln describes the post-2026 freeze window rather than immunity from
the 2025 transition — **but that is an inference, not evidence**, it originates
from a search synthesis rather than the page itself, and it is exactly the kind
of terminal fact the brief forbids resting on secondary material. Logged as
U-2.

### 9.3 Verification cadence

Full re-verification of every catalog plan every 90 days; immediate
re-verification on any trigger; catalog releases remain append-only with
invalidation recorded as a new release rather than an edit, preserving the
existing audit posture.

---

## 10. Uncertainties and owner/counsel gates

| ID | Uncertainty | Class | Resolution owner |
| :-- | :-- | :-- | :-- |
| U-1 | **No primary official source was retrieved. Zero facts in this analysis are at `P`.** | blocking, environmental | lane with egress (§11) |
| U-2 | Are the region's pre-approved libraries reissued under the 2025 Code, or expired since 31 Dec 2025? Lincoln/AB 130 conflict unresolved | blocking, factual | verification lane |
| U-3 | Are the Sacramento City and Sacramento County shelf-ready sets the same plan family? Near-identical size ladders | material, factual | verification lane |
| U-4 | No licence, terms-of-use, or copyright language located for **any** plan in **any** of the ten jurisdictions | blocking, legal | Owner + counsel |
| U-5 | Derivative 2D/3D Studio modelling rights — `UNKNOWN` in all twenty cells of §4 | blocking, legal | Owner + counsel |
| U-6 | Does Rancho Cordova operate an AB 1332 program? Absent from its own site in search | material, factual | verification lane |
| U-7 | Folsom's AB 1332 registry posture, distinct from its confirmed lack of a plan library | material, factual | verification lane |
| U-8 | Elk Grove, Roseville, Lincoln, Placer rosters entirely unretrieved — plan counts unknown | material, factual | verification lane |
| U-9 | Citrus Heights code basis unstated; 2021 launch makes silent expiry most likely here | material, factual | verification lane |
| U-10 | Use of municipal marks and designer names carries endorsement-confusion risk beyond copyright | material, legal | Owner + counsel |
| U-11 | Whether any jurisdiction publishes CAD/BIM rather than flattened PDF — determines whether a faithful 2D model is buildable or must be redrawn | material, factual | verification lane |

U-1, U-2, U-4 and U-5 are each independently sufficient to withhold adoption.

---

## 11. Unblock procedure

Precise enough to execute without re-deriving anything. Forty official URLs
were located and are named in sections 2–3; the ranked subset below is where
verification should start.

**Step 1 — retrieve, in rank order (§6.2):** for each of the five, the program
page, the plan-index page, one full plan PDF cover sheet, and any terms/legal
page. Record for each: retrieval timestamp, HTTP status, page content hash,
stated code cycle, printed expiration date, plan identifiers, and verbatim
rights language or its confirmed absence.

**Step 2 — resolve U-2 first.** If the region's libraries are expired, the
launch question changes shape entirely and steps 3–4 are wasted effort. Read
the code-cycle statement on each program page and Lincoln's AB 130 sentence in
its own words.

**Step 3 — resolve U-3** by comparing Sacramento City and County plan
identifiers and sheet sets directly.

**Step 4 — extract the rights record** per §8.5 for every candidate plan,
including explicit "no terms published" findings, which are themselves
evidence.

**Step 5 — Owner/counsel gate on U-4, U-5, U-10.** No amount of further
research resolves these; they are decisions.

Anything short of Step 5 leaves the shortlist unadoptable regardless of how
much factual material Steps 1–4 return.

---

## 12. Non-goals honoured

No application code, Studio catalog data, design token, asset, navigation,
dependency, deployment, governance, or production file was modified. No vendor
was selected, no licence purchased, no municipality contacted. No copyrighted
drawing sheet or substantial source excerpt was copied into this repository. No
claim is made that a pre-approved plan may be built without site-specific
permitting. No pricing, lead-capture, marketing, CRM, or construction-operations
work was performed. The shortlist is **not** adopted on the Owner's behalf.
This packet's diff contains only this file.

---

## 13. Terminal recommendation

# BLOCKED FOR EVIDENCE

Three independent gates are open, and any one of them alone is disqualifying.

1. **No primary source was retrieved.** Session egress policy refused all ten
   jurisdiction hosts and every state source at CONNECT. Forty official URLs
   were located; zero were read. The brief requires every material claim to be
   linked to a current primary official source, and holds that secondary
   material must not support a terminal fact. Not one fact here clears that bar.
2. **Currency is unresolved and points the wrong way.** The 2025 California
   Building Standards Code took effect 1 January 2026. The two strongest
   candidates are still described as 2022-code and the third launched in 2021.
   Whether the region's libraries were reissued or are silently expired is
   undetermined, and a catalog built on expired plans fails in a permitting
   context — the most expensive place to be wrong.
3. **Rights are unknown everywhere, including the one right the product
   requires.** No licence or reuse language was located for any plan in any
   jurisdiction. Derivative 2D/3D Studio model display is `UNKNOWN` in every
   cell of the rights matrix. Private authorship is confirmed in at least two
   programs, and every located grant runs to homeowners in that jurisdiction —
   not to a commercial contractor building a product catalog. Under the brief,
   rights uncertainty is a gate.

The stop condition in the brief is "no candidate can be supported by current
primary evidence." That condition is met exactly: eight of ten jurisdictions
operate a real, identifiable program, and **none of them is supported by
primary evidence obtained in this session.**

This is a recoverable block, not a negative finding on the strategy. The
programme landscape is real, the Sacramento–Placer region is unusually well
served, Placer County and Citrus Heights publish configurability rules precise
enough to build a schema against, and AB 130 offers a verified catalog an
unusually long stability window. Sections 6 through 9 are executable the day
Step 5 of §11 clears. What is missing is retrieval and clearance — neither of
which this lane is authorised or able to perform.

**Recommended next packet:** a bounded verification packet, executed by a lane
with unrestricted egress, scoped exactly to §11 Steps 1–4, returning primary
citations at `P` for the five ranked jurisdictions. On that evidence this
analysis can be re-scored and a shortlist proposed for the Owner's adoption.

---

Verdict pinned to the result SHA reported in Issue #51. Any new commit
invalidates it. The author of this analysis cannot issue its acceptance
verdict; a non-author lane must review at the exact result SHA. The Owner alone
adopts the shortlist and merges.
