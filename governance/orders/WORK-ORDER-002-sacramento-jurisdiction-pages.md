# WORK-ORDER-002 — Two jurisdiction pages: City of Sacramento, unincorporated Sacramento County

- **Issued by:** Claude, operational lead (OPERATING-MODEL-v2)
- **Executor:** ChatGPT, bounded worker
- **Date:** 2026-08-05
- **Pinned base:** `main` after PR #37 merges — pin the actual SHA in your PR
- **Depends on:** PR #37 (RP-0008 partial) merged. Do not start before it lands.
- **Related:** TASK-0011, blueprint §2, DR-0014, DR-0015
- **Branch:** `agent/work-order-002-sacramento-pages`

## Why exactly two pages, not seven

TASK-0011 lists eleven jurisdictions. RP-0008 researched **two**. Writing the
other nine now would mean sourcing them from nothing, which is the failure mode
TASK-0011 already forbids — and the one that would quietly poison the AI-search
channel these pages exist to win.

So this order ships two pages that are genuinely sourced, and stops. The rest
follow their own research.

## Single outcome

Two live routes under `/adu-builder/`, one per researched jurisdiction, each
built only from officially sourced material, each substantively different from
the other in content rather than in city name.

- `/adu-builder/sacramento` — City of Sacramento
- `/adu-builder/sacramento-county` — unincorporated Sacramento County

## The distinction that must be visible to a reader

These are two different land-use authorities, not one place with two names. A
homeowner on Marconi Ave may be governed by the County while a homeowner two
miles west is governed by the City, with different permit paths. RP-0008 §5
established the determination gate and its refusal conditions.

Each page must make that difference legible in plain language: which authority
governs, how a reader can tell which one applies to them, and that determining
it for a specific parcel **requires official source verification**. Do not
imply the visitor can settle it from the page.

## What each page contains

1. **Which authority governs, and how the boundary works** — sourced from
   RP-0008 §5. Name the boundary layer's existence and that edge cases are
   ambiguous by design. No parcel-specific determination.
2. **The jurisdiction's own published ADU process** — permit path, review body,
   published timelines *only if that jurisdiction publishes them*. Link the
   official page for every claim. If a jurisdiction does not publish it, say so
   rather than filling the gap from the other one.
3. **What the public record does and does not show** — grounded in RP-0008 §2–§4:
   what the parcel and zoning layers actually publish, and the named unknowns
   (cadence not published, overlay completeness open, clipping unresolved).
   This is the trust content; it is also true, which is the point.
4. **Local context** — typical lot and neighborhood character for that
   jurisdiction, written without any cost, schedule, or feasibility implication.
5. **One link to `/studio`** as the next step. No form, no contact, no booking.

Every regulatory-flavored sentence carries verbatim: `Requires official source
verification.`

## Owned paths

- `app/adu-builder/[jurisdiction]/page.tsx` (new route)
- `src/lib/contentPages.ts` or a sibling content module — follow the existing
  typed single-source-of-truth pattern used by `servicePages`; do not inline
  copy into components
- `src/components/content/*` only if an existing component genuinely does not
  fit; prefer reuse
- `app/sitemap.ts`, `public/llms.txt`
- Navigation config in `src/lib/siteConfig.ts` — the nav entry only
- `governance/tasks/TASK-0011-city-and-resource-pages.md` — status cell only
- `governance/evidence/RUN-0015-sacramento-jurisdiction-pages.md` (new)
- `governance/office/STATE.md` — queue row 3 only

## Must not touch

Home, services, process, faq, about, compare, `/studio`, the design token
layer, `governance/` beyond the three files above. No new dependency. No
`/adu-laws-2026`, `/grants`, or blog — those are a later order.

## Hard limits

- No contact surface of any kind: no form, no email, no phone, no booking
  (DR-0013, DR-0015).
- No analytics, pixels, tag managers, cookies.
- No price, schedule, cost range, or ROI content.
- No credential claim — CSLB, insurance, warranty stay out until the owner
  supplies the business-facts package.
- No parcel-specific zoning, permit, feasibility, or buildability conclusion.
- No claim sourced from a search summary or an aggregator. Official
  jurisdiction pages only, linked inline.
- English only.

## Acceptance evidence the PR must contain

- Both routes live on the deployed preview, with URLs.
- A short table: every regulatory claim on each page → the official URL it came
  from. A claim with no source does not ship.
- A statement of what makes the two pages substantively different, in one
  paragraph. If you cannot write that paragraph honestly, the pages are clones
  and the order is not met.
- Anything you deliberately left out because the jurisdiction does not publish
  it, named explicitly.
- JSON-LD validates on both routes; sitemap and `llms.txt` include both.
- `npm run lint`, `npm run build`, `npm test` green.
- Deployed mobile + desktop screenshots if the browser cooperates; if it times
  out again, record the exact failure as in RUN-0007 and do not substitute
  local screenshots.

## When blocked

Report the exact failure in the PR thread and stop. If a jurisdiction's
official material is thin, ship one page and say why the second is not ready —
one sourced page beats two padded ones.

## Verdict routing

One draft PR. Claude reviews at the exact head SHA and posts `REVIEW: PASS` or
`REVIEW: CHANGES REQUESTED`. Owner merges. Do not approve, mark Ready, or merge.
