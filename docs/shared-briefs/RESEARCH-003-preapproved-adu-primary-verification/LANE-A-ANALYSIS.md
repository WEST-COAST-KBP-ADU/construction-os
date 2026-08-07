# LANE-A-ANALYSIS — RESEARCH-003 primary verification closure

## 1. Anchor and method

- Issue: #60
- Product base: `main@03d651cd61555108e655b396697c15c5c92a30db`
- Predecessor result: `RESEARCH-002@f98f94645023e2ddd15e7189bb0143ceafe1eeb1`
- Predecessor verdict: `ACCEPT AS EVIDENCE-BLOCKED`
- Retrieval date: 2026-08-07 UTC
- Author lane: ChatGPT Operational Lead
- Product/governance mutation: none

The lane first opened the scoped City of Lincoln page. It returned the official
page body, so the external-retrieval capability preflight passed before Gate A.
Terminal facts below use direct official municipal or State of California
retrievals. Search was used only to locate the current Roseville canonical URL
and a directly retrievable HCD copy of the California code bulletin; both
destination pages were then opened directly.

Twelve unique official pages/documents were retrieved. Two target limitations
are disclosed:

1. the DGS code page/PDF returned 403 to the managed reader, so the directly
   retrieved California Department of Housing and Community Development
   Information Bulletin 2025-03 was used for the same statewide effective-date
   fact;
2. Roseville's current plan attachment could not be opened by the managed
   reader, although its official program page, plan identifier, size, and named
   plan applicant were retrieved.

The managed reader exposes parsed official content, status, URL, access date,
and PDF page text but not the origin response bytes. Source-byte SHA-256 values
are therefore unavailable and are not invented. This is a method deviation from
the predecessor brief's raw-byte hash field, not a substitution of search
evidence for primary evidence.

## 2. Controlling State evidence

The California Department of Housing and Community Development states that the
2025 California Building Standards Code became effective on 2026-01-01 and
applies to permit applications dated on or after that date:

- https://www.hcd.ca.gov/sites/default/files/docs/building-standards/ib-2025-03.pdf

Current Health and Safety Code section 18938.5(d) separately preserves the
standards in effect for a residential dwelling based on an approved model-home
design for later dwellings using that design in the same jurisdiction, until
the design substantially changes or ten years pass:

- https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=HSC&sectionNum=18938.5.

Current Government Code section 65852.27(b) gives the 30-day AB-1332 processing
rule only to a plan preapproved, or identical to a plan approved, within the
current triennial California Building Standards Code cycle:

- https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=65852.27.

These are different scopes: applicable building standards for an approved model
design versus eligibility for the AB-1332 current-cycle expedited process.
Neither provision grants copyright or derivative-use rights.

## 3. Gate A — 2026 currency matrix

| Ranked jurisdiction | Direct official evidence | Disposition |
| --- | --- | --- |
| City of Sacramento | The AB-1332 page has no listed vendor plan and redirects users to the separate Shelf Ready library; that library expressly says its three plans meet the 2022 Residential Building Code. | `CURRENT STATUS NOT ESTABLISHED` |
| Unincorporated Sacramento County | The current Shelf Ready page offers five models and an active application path but expressly says the plans were checked to the 2022 California codes. It does not state that the library is grandfathered after 2026-01-01. | `CURRENT STATUS NOT ESTABLISHED` |
| City of Elk Grove | The current page says the listed plans meet all currently adopted California Residential Code requirements. The directly opened Plan 1 cover lists the 2025 CBC/CRC and related 2025 codes. | `CURRENT — 2025 CODE` |
| City of Citrus Heights | The separate AB-1332 vendor page says preapproval expired 2025-12-31 and that no vendors have submitted plans. The older LEAP Permit-Ready page still advertises three free models but states no code basis. | vendor program `EXPIRED/EMPTY`; ranked legacy library `CURRENT STATUS NOT ESTABLISHED` |
| City of Roseville | The current official page says the listed plan may be constructed in Roseville and identifies `BD25-4920`, a 748-sf detached two-bedroom plan, with plan applicant Selective Ventures LLC. | `CURRENT — EXPLICITLY LISTED FOR CONSTRUCTION AFTER 2026-01-01` |

Direct sources:

- Sacramento City Shelf Ready:
  https://adu.cityofsacramento.org/Shelf-ready-plans
- Sacramento City AB-1332:
  https://www.cityofsacramento.gov/community-development/building/building-programs/preapproved-adu-program-ab1332
- Sacramento County:
  https://development.saccounty.gov/us/en/building-permits-inspection/news/shelf-ready-adu-plans-now-available.html
- Elk Grove:
  https://elkgrove.gov/accessory-dwelling-units/city-pre-approved-adu-plans-and-submittal-requirements
- Citrus Heights legacy library:
  https://www.citrusheights.net/1108/Permit-Ready-ADU-Program
- Citrus Heights AB-1332:
  https://www.citrusheights.net/1374/ADU-Preapproved-Plans-AB-1332
- Roseville:
  https://www.roseville.ca.gov/development_services/building/preapproved_adu_plans_ab_1332.php

Programs supported as current: **2 of 5** — Elk Grove and Roseville. Gate A
therefore clears the brief's threshold, and Gate B is limited to those two.

## 4. Lincoln comparison and U-2

The Lincoln page contains both statements reported by the predecessor:

- approved master plans should be updated regularly to remain compliant with
  current City code; and
- the two posted plans are not subject to code updates until January 2032,
  attributed to AB 130.

It also requires designer authorization for site-specific use and prohibits
alteration:

- https://www.lincolnca.gov/business-and-development/planning-and-development/pre-approved-adu-plans-ab-1332/

The apparent contradiction is resolved as a scope distinction, not by choosing
one sentence over the other. The first is the general master-plan maintenance
rule. The second is a plan-specific claim consistent with the ten-year
model-design rule now codified in HSC 18938.5(d). The separate 30-day AB-1332
timing still uses a current-triennial-cycle condition in GOV 65852.27(b).
Whether Lincoln's posted legacy plans receive both grandfathered standards and
the statutory 30-day timing is a legal/program-administration interpretation
not decided here.

For the five ranked jurisdictions, U-2 is closed sufficiently to select the two
Gate B programs; no legal conclusion is made about the three unestablished
libraries.

## 5. Gate B — current plan/version record

### Elk Grove

- Plan: Plan 1, studio, 435 sf.
- Official PDF:
  https://elkgrove.gov/sites/default/files/city-files/Departments/Building/residential/accessory-dwelling-units/city-pre-approved-adu-plans/plan1-studio-unit-435-square-feet-locked-2025-codes.pdf
- Cover sheet: `A0.1`.
- Code basis: 2025 CBC, CRC, plumbing, mechanical, electrical, energy,
  CALGreen, and fire code.
- PDF posture: `NOT FOR CONSTRUCTION — REFERENCE ONLY`.
- Program posture: site-specific approval remains required; the plan cannot be
  revised and must be permitted as designed.
- Copyright/licence language: none located in the program page or the retrieved
  nine-page plan text.

### Roseville

- Plan: `BD25-4920`, 748-sf detached two-bedroom ADU.
- Named plan applicant: Selective Ventures LLC.
- Program posture: the official page says the plan may be constructed within
  Roseville, but still requires site-specific design and permitting approval.
- Plan attachment: linked by the official page but not retrievable through this
  managed reader; cover-sheet code text and source-byte hash remain unavailable.
- Copyright/licence language: none located on the official program page.
- Private authorship/contact listing is evidence of a rights holder, not a
  public licence.

## 6. U-3 Sacramento City/County duplication

The directly retrieved indexes do not support the predecessor's
search-mediated near-duplicate ladder:

- Sacramento City: 367 / 559 / 747 sf;
- Sacramento County: 460 / 870 / 1,000 / 1,184 sf, with two variants at 460 sf.

They are materially different published plan families. U-3 is therefore not a
reason to collapse the City and County libraries into one catalog entry.
Neither library proceeds to Gate B because 2026 currency remains unestablished.

## 7. Rights matrix

These classifications are evidence controls, not legal advice.

| Right | Elk Grove Plan 1 | Roseville BD25-4920 |
| --- | --- | --- |
| Permit-application use | `RESTRICTED` — site-specific approval; official PDF is reference-only | `RESTRICTED` — site-specific approval in Roseville |
| Modification | `RESTRICTED` — official page prohibits revision | `UNKNOWN — OWNER/COUNSEL CLEARANCE REQUIRED` |
| Commercial contractor use | `UNKNOWN — OWNER/COUNSEL CLEARANCE REQUIRED` | `UNKNOWN — OWNER/COUNSEL CLEARANCE REQUIRED` |
| Republication | `UNKNOWN — OWNER/COUNSEL CLEARANCE REQUIRED` | `UNKNOWN — OWNER/COUNSEL CLEARANCE REQUIRED` |
| Derivative 2D/3D Studio model creation/display | `UNKNOWN — OWNER/COUNSEL CLEARANCE REQUIRED` | `UNKNOWN — OWNER/COUNSEL CLEARANCE REQUIRED` |
| Designer/plan/municipal name or mark use | `UNKNOWN — OWNER/COUNSEL CLEARANCE REQUIRED` | `UNKNOWN — OWNER/COUNSEL CLEARANCE REQUIRED` |

U-4, U-5, and U-10 remain Owner/counsel gates. Public access, a municipal
preapproval, and a download link do not grant republication or derivative-model
rights.

## 8. Adopted dispatch-routing rule

For every future packet whose acceptance depends on external retrieval:

1. mark `EXTERNAL_RETRIEVAL_REQUIRED`;
2. before dispatch, run one direct reachability probe against a representative
   required official host in the assigned lane;
3. dispatch only after a body is retrieved;
4. a policy denial routes the unchanged packet to an egress-capable lane and is
   not counted as research execution.

This rule is adopted from the repeated RESEARCH-001/002 routing failure. Fable
must not receive another external-retrieval packet until its environment passes
the preflight.

## 9. Scope and terminal recommendation

No municipality or designer was contacted. No plan was republished. No legal
conclusion or shortlist was adopted. No application, Studio, asset, dependency,
deployment, production, governance, pricing, CRM, lead-capture, or construction
operations file changed.

# READY FOR OWNER/COUNSEL RIGHTS GATE

This terminal applies only to the two current evidence-supported programs:
Elk Grove and Roseville. It means primary evidence is sufficient to ask the
rights question; it does **not** authorize use, modeling, republication,
endorsement claims, or shortlist adoption.

A non-author review must pin to the exact result SHA. Any new commit invalidates
that review. Tony alone adopts a downstream product decision and merges.
