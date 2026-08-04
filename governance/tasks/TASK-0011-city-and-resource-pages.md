# TASK-0011: City pages and resources — close the Blueprint §2 gap

- **Status:** approved
- **Date approved:** 2026-08-03
- **Approved by:** owner
- **Related:** DR-0008, DR-0013, DR-0014, DR-0015, blueprint §2, RP-0001,
  RP-0007

## Objective

Build the two route families that Blueprint §2 requires and the site still
lacks: city pages and resources. These are the AI-search surface the whole
lead-generation strategy rests on (RP-0001); without them the site has no
retrievable local content.

## In scope

**City pages — `/adu-builder/[city]`**

Market order is set by **DR-0014**, not by the old charter list.

All jurisdictions below are **core market sourcing scope**. The split is build
order, not market priority. A page ships only when it meets the official-source
standard below; insufficiently sourced pages remain explicitly omitted.

**Source first (Sacramento ring):** City of Sacramento, Sacramento County
(unincorporated), Elk Grove, Citrus Heights, Folsom, Rancho Cordova, Galt,
Isleton.

**Source next (Placer / El Dorado ring):** Roseville, Rocklin, Lincoln, Granite
Bay, El Dorado Hills.

Sacramento and unincorporated Sacramento County are **separate jurisdictions**
with separate permit paths and separate published layers. They get separate
pages; do not merge them into one "Sacramento" page.

Each page must carry substantively different material. Find-replace clones
with a swapped city name are worse than one page — thin duplicated
content is penalized in exactly the retrieval channel these pages exist to
win. Per city, source and write:

- the jurisdiction's own published ADU process and where it differs from its
  neighbors (permit path, review body, published timelines if the city
  publishes them — never invented);
- what the statutory floor means for typical lot patterns in that city,
  phrased categorically, never as a determination about any parcel;
- genuinely local context: typical lot and neighborhood character, common
  constraints;
- links to the jurisdiction's own official pages.

RP-0007 (Roseville) is the model for **sourcing depth**; Roseville is core
market under DR-0014, built in the second ring. If a jurisdiction cannot
be sourced to that standard, **ship fewer pages and say which and why** — do
not pad.

Every regulatory-flavored statement carries: "Requires official source
verification."

**Resources**

- `/adu-laws-2026` — plain-language explainer of current California ADU law,
  every claim citing the statute, marked "requires official source
  verification," no advice and no application to any specific property.
- `/grants` — publicly available ADU funding programs, each with its official
  source link and its current status. If a program's status cannot be verified
  today, it is omitted, not listed as uncertain.
- `/blog` — index shell only; no invented posts.

**Both**

- JSON-LD on every new route, matching the existing pattern.
- `app/sitemap.ts` and `public/llms.txt` updated.
- Navigation updated so the new routes are reachable.

## Out of scope / prohibited

- Any form, capture, contact field, booking, analytics, pixel, or tracking.
  DR-0011 selects only a future pilot destination; DR-0015 keeps Phase 1
  no-contact/no-tracking and does not authorize implementation.
- Cost, pricing, ROI, or timeline content (no policy decision exists).
- Credentials, portfolio, testimonials, team facts (owner inputs missing).
- Any statement that a specific property or project is approvable or
  permittable.
- Invented local facts. If it is not sourced, it does not ship.

## Acceptance criteria

- Routes live; each city page demonstrably differs from the others in content,
  not only in city name — state in the PR what differentiates each.
- Every external claim carries a source link; every regulatory statement
  carries the required wording.
- JSON-LD validates; sitemap and llms.txt include all new routes.
- `npm run lint`, `npm run build`, `npm test` green.
- PR lists any city or program deliberately omitted, and why.

## Evidence plan

RUN-0011: timestamp, event type, accept/reject result, route count, sanitized
non-PII summary.

## Boundary check

- [ ] Work stays inside BOUNDARIES.md
- [ ] No capture, tracking, vendor, or external action
- [ ] No invented fact ships
- [ ] Evidence plan uses only whitelisted lab-safe fields
