# BRIEF — RESEARCH-002 primary verification of pre-approved ADU plans

## Status and anchor

- **Packet type:** VERIFICATION RESEARCH
- **Repository:** `WEST-COAST-KBP-ADU/construction-os`
- **Product base:** branch created directly from current `main` on 2026-08-06
- **Predecessor packet:** `RESEARCH-001`
- **Predecessor result:** `66dd0018e810d6dd9acf3b957e406c68a5113c3c`
- **Predecessor review verdict:** `ACCEPT AS EVIDENCE-BLOCKED`
- **Lane A:** ChatGPT Operational Lead
- **Lane B:** Fable 5, independent verification author
- **Branch:** `research/preapproved-adu-primary-verification-v1`
- **Product mutation:** none authorized

## Single outcome

Resolve the primary-evidence block for the five ranked jurisdictions from
RESEARCH-001. Determine whether their pre-approved plan programs and candidate
plan sets are current under the code cycle effective 2026-01-01, then establish
the primary rights record needed to decide whether any plan can proceed to an
Owner/counsel clearance gate for derivative 2D/3D Studio representation.

This packet verifies evidence. It does not adopt a shortlist and does not make
a legal conclusion.

## Jurisdiction scope

Exactly these five, in this order:

1. City of Sacramento
2. unincorporated Sacramento County
3. City of Elk Grove
4. City of Citrus Heights
5. City of Roseville

Lincoln may be read only as the minimum comparison source needed to resolve the
reported AB 130 wording conflict. It is not a sixth candidate in this packet.

## Required execution order

### Gate A — resolve U-2 first

Before any other plan-level work:

1. Retrieve the current official program and plan-index pages for each of the
   five jurisdictions.
2. Retrieve the official Lincoln page containing the reported AB 130/code-update
   statement.
3. Retrieve the current official California code-cycle source needed to interpret
   the 2026-01-01 transition.
4. Record the exact official wording, retrieval timestamp, HTTP status, content
   hash, and direct URL.
5. Determine for each candidate program whether its library is:
   - `CURRENT — 2025 CODE OR EXPLICITLY VALID AFTER 2026-01-01`;
   - `EXPIRED/SUPERSEDED`;
   - `CURRENT STATUS NOT ESTABLISHED`.

If fewer than two of the five programs can be supported as current by primary
evidence, stop plan-level work and return `BLOCKED — CURRENCY`. Do not spend
the packet on rights extraction for expired or unverified programs.

### Gate B — execute predecessor §11 Steps 1–4

For every program that clears Gate A:

1. Retrieve the program page, plan-index page, one full plan PDF cover sheet,
   and any official terms/legal page.
2. Record retrieval timestamp, HTTP status, content hash, stated code cycle,
   printed expiration date, plan identifiers, and exact rights language or
   confirmed absence.
3. Resolve Sacramento City/County duplication U-3 by comparing plan identifiers
   and sheet sets directly.
4. Build the rights record for each candidate plan:
   - permit-application use;
   - modification;
   - commercial contractor use;
   - republication;
   - derivative 2D/3D Studio model creation and display;
   - designer/plan/municipal name or mark use.
5. Classify each right only as `PERMITTED`, `RESTRICTED`, or
   `UNKNOWN — OWNER/COUNSEL CLEARANCE REQUIRED`.

Absence of published terms is an evidence finding, not permission.

## Evidence standard

- Terminal facts require direct primary official retrieval.
- Search results and engine synthesis may locate sources but cannot support a
  terminal fact.
- Each material factual cell must include a direct official URL and access date.
- Record quoted language minimally; do not reproduce drawing sheets or large
  copyrighted excerpts.
- Preserve contradictions rather than reconciling them by inference.
- A policy or network denial must be reported as a method deviation. Do not
  route around an access control.

## Deliverable

Create exactly:

`docs/shared-briefs/RESEARCH-002-preapproved-adu-primary-verification/FABLE-ANALYSIS.md`

The analysis must contain:

1. exact method, environment, and review anchor;
2. Gate A U-2 currency matrix and terminal decision;
3. primary-source retrieval ledger with URL, timestamp, HTTP status, and SHA-256;
4. current plan/version matrix for programs clearing Gate A;
5. Sacramento City/County U-3 comparison;
6. plan-level rights matrix;
7. explicit U-4/U-5/U-10 Owner/counsel gates;
8. evidence-backed recommendation for the next operational action;
9. exactly one terminal recommendation:
   - `READY FOR OWNER/COUNSEL RIGHTS GATE`;
   - `BLOCKED — CURRENCY`;
   - `BLOCKED — PRIMARY RETRIEVAL`;
   - `BLOCKED — EVIDENCE CONFLICT`.

Commit only that file to the packet branch and post `RESULT` in the GitHub
Issue with the exact result SHA, artifact path, primary-source count, deviations,
unresolved gates, and terminal recommendation.

## Acceptance evidence

- U-2 is executed before any avoidable downstream work.
- Every terminal factual claim is supported by a directly retrieved primary
  source.
- All five scoped jurisdictions receive an explicit currency disposition.
- Lincoln's reported AB 130 wording is checked in its original official context.
- Rights are never inferred from public availability.
- The diff after this brief contains exactly `FABLE-ANALYSIS.md`.
- A non-author review evaluates the exact result SHA.
- Tony alone adopts any shortlist, approves counsel outreach, and merges.

## Non-goals

No application, Studio catalog, design, asset, dependency, navigation,
deployment, governance, production, pricing, CRM, lead-capture, or construction
operations changes. No municipality or designer contact. No license purchase.
No legal conclusion. No shortlist adoption. No merge.
