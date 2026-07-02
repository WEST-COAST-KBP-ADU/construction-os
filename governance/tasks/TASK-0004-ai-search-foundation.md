# TASK-0004: AI-search technical foundation for westcoastkbp.com

- **Status:** done
- **Date approved:** 2026-07-02
- **Approved by:** owner (lead-gen foundation sequencing accepted; domain
  provided as the go signal)
- **Related:** DR-0007, RP-0001 (synthesis step 1), charter (domain)

## Objective

Make the public site legible to search engines and AI assistants using only
already-approved public copy: structured data, robots, sitemap. Draft (not
publish) the FAQ content for owner review.

## In scope

- `src/lib/structuredData.ts` — JSON-LD builder from siteConfig + charter
  service area; XSS-safe serializer
- JSON-LD script on the home page
- `app/robots.ts`, `app/sitemap.ts`
- `governance/drafts/faq-adu-draft-v1.md` — FAQ copy draft, owner review only

## Out of scope / prohibited

- No new visible site copy (FAQ ships only after owner approval)
- No tracking tags, pixels, or analytics (DR-0007 privacy gate)
- No pricing/schedule/permit/feasibility claims in structured data

## Acceptance criteria

- JSON-LD reflects only approved copy + charter service area
- `/robots.txt` and `/sitemap.xml` served by the app
- Build, lint, tests green; merged to `main`

## Evidence plan

RUN-0004: timestamp, event type, accept/reject result, sanitized summary.

## Boundary check

- [x] Work stays inside BOUNDARIES.md
- [x] No provider configuration or external action
- [x] Evidence plan uses only whitelisted lab-safe fields
