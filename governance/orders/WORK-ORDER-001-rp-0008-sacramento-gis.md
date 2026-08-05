# WORK-ORDER-001 — Execute RP-0008: Sacramento GIS official-source research

- **Issued by:** Claude, operational lead (OPERATING-MODEL-v2)
- **Executor:** ChatGPT, bounded worker
- **Date:** 2026-08-04
- **Pinned base:** `main@c3271f3`
- **Binding spec:** `governance/research/RP-0008-gis-sources-sacramento.md` §3–§4
- **Branch:** `agent/work-order-001-rp-0008`

## Why this order, now

The property-first funnel is the platform's differentiator and it is blocked on
exactly one thing: verified official sources for the core market. RP-0008 was
written as an executable protocol but could not be run — the reviewer's
environment is denied outbound access to all eight official hosts (403 at proxy
CONNECT, recorded in the packet). Your environment has live web access. This is
environment-fit routing, not a reassignment of blame.

Nothing else in the queue is unblocked and this valuable. TASK-0011 city pages
depend on this research for their regulatory content. The studio (TASK-0013) is
already shipped and needs no research.

## Single outcome

Replace `governance/research/RP-0008-gis-sources-sacramento.md` with an executed
research packet at RP-0007 depth or better, covering **two separate
jurisdictions**: City of Sacramento, and unincorporated Sacramento County.

## Execute exactly this

Run §3 of the existing packet — all ten items, **twice, once per jurisdiction** —
recording a direct URL and access timestamp for each. Then §4: hand-trace five
public non-residential addresses per jurisdiction, including at least one near
the city/county boundary.

Three things in §3 carry most of the value; do not compress them:

1. **Item 7, terms of use — quote verbatim.** Paraphrase is not evidence. This
   is the item most likely to kill or reshape the product, and it must be
   quotable to counsel without re-fetching.
2. **The provenance question in §2, row 2.** Search results suggest the City's
   zoning service is published on County infrastructure. If true, the accountable
   agency and the hosting agency differ, and terms, cadence, and support may
   belong to whoever hosts rather than whoever authors. Resolve it explicitly.
3. **Jurisdiction determination (§3 item 11).** Given a point, which authority
   governs it? Record the boundary layer and its behavior at edges and recent
   annexations. Without this, both matrix rows are unusable.

Also fill the two coverage-matrix rows in
`governance/architecture/property-intelligence-v0.1.md` §5, replacing the
placeholder rows. A row may read `verified` only when items 1–10 are answered
from primary sources for that jurisdiction. **Partial is an acceptable and
expected outcome; overstating is not.**

## Owned paths

- `governance/research/RP-0008-gis-sources-sacramento.md` (rewrite)
- `governance/research/README.md` (its status cell only)
- `governance/architecture/property-intelligence-v0.1.md` (§5 matrix rows only)
- `governance/evidence/RUN-0014-rp-0008-execution.md` (new)
- `governance/office/STATE.md` (Lane B row only)

## Must not touch

`app/`, `src/`, `public/`, dependencies, any other governance record, any other
STATE row. No code of any kind — this order authorizes research only.

## Hard limits

- No bulk retrieval, scraping at volume, or automated polling. Low-volume manual
  probes only.
- No vendor signup, no API key, no account.
- No real inquiry address, no residential address, no PII of any kind — fixtures
  are public buildings only.
- No parcel-specific zoning, permit, feasibility, or buildability conclusion.
  Every uncertain statement carries verbatim: `Requires official source
  verification.`
- Do not activate any integration or write an adapter. Research output only.
- Statutory citations are collected for the owner and counsel and marked
  `requires owner/counsel verification`. You do not verify statute.

## Acceptance evidence the PR must contain

- Per jurisdiction: all ten §3 items answered, each with URL and access date, or
  explicitly marked unresolved with the reason.
- Terms of use quoted verbatim for every source relied on.
- Five fixture traces per jurisdiction, with every mismatch, multi-parcel hit,
  and boundary ambiguity recorded — including the failures. RP-0007's 5/5
  geocoded, 2/5 clean parcel joins is the benchmark; underperforming it is a
  product finding to report, not a failure to hide.
- The jurisdiction-determination answer, or an explicit statement that it could
  not be established.
- Both matrix rows filled, with honest `verified` / `partial` status.
- RUN-0014 with whitelisted evidence fields only.

## When blocked

Report the exact failure — the URL, the response, what you attempted — in the PR
thread, and stop. Do not substitute a secondary aggregator for an official
source, do not fill a cell from a search summary, and do not silently narrow
scope. A partial packet that is honest about its gaps is worth more than a
complete-looking one that is not.

## Verdict routing

One draft PR from `main@c3271f3`. Claude reviews at the exact head SHA and posts
`REVIEW: PASS` or `REVIEW: CHANGES REQUESTED`. Owner merges. Do not approve,
mark Ready, or merge.
