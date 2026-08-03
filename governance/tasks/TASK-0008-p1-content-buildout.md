# TASK-0008: P1 content build-out — structure & trust pages

- **Status:** approved
- **Date approved:** 2026-08-03
- **Approved by:** owner (directive: «начать наполнение нашей платформы»)
- **Related:** DR-0008 (adopted), blueprint §§2–3 (IA), §8 P1, DR-0003, TASK-0004

## Objective

Turn the one-pager into the blueprint's information architecture: real routes,
real content structure, still zero capture and zero tracking (P1 explicitly
excludes PII).

## In scope

- Routes per blueprint §2: `/services/*` (detached-adu, garage-conversion,
  attached-adu, jadu, adu-legalization), `/process`, `/faq` (from the approved
  draft `governance/drafts/faq-adu-draft-v1.md`), city pages
  `/adu-builder/[city]` for the 7 charter cities, `/about` shell, `/compare`.
- All copy factual and unpromising; every city page's regulatory-flavored line
  carries "Requires official source verification." City pages must differ
  substantively (structure + local statutory-floor education), not be
  find-replace clones — thin duplicates hurt AI-search (RP-0001).
- JSON-LD + FAQPage coverage on every new route (extend TASK-0004 foundation);
  sitemap/llms.txt updated.
- Content sourced from `siteConfig`-style single source of truth, extended per
  route.

## Out of scope / prohibited

- Contact forms, intake, email capture (blocked by DR-0011); pricing/cost/ROI
  content (blocked by cost-display policy, blueprint §10); portfolio with real
  project facts (missing owner input); credentials (CSLB etc.) until the owner
  supplies the business facts package — placeholders must say "pending".

## Acceptance criteria

- All routes live on deployed preview; no route promises price, schedule, or
  approval; lint/build green; JSON-LD validates; draft PR per logical chunk
  (services / cities / process+faq) — max 3 PRs.

## Evidence plan

RUN-0008: timestamp, event type, accept/reject, route count, sanitized summary.

## Boundary check

- [ ] Work stays inside BOUNDARIES.md
- [ ] No provider configuration or external action
- [ ] Evidence plan uses only whitelisted lab-safe fields
