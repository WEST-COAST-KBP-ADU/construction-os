# RUN-0004: TASK-0004 executed — AI-search technical foundation

- **Task packet:** TASK-0004
- **Timestamp:** 2026-07-03
- **Executor:** engineering assistant (cloud session), owner-directed
- **Result:** accepted

## What was done

Added HomeAndConstructionBusiness JSON-LD to the home page (built strictly from
approved siteConfig copy plus the charter service area; XSS-safe serializer per
Next.js guidance), `app/robots.ts`, and `app/sitemap.ts`. Verified the JSON-LD
is present in the prerendered HTML and that `/robots.txt` and `/sitemap.xml`
are emitted as routes. Drafted the public ADU FAQ into
`governance/drafts/faq-adu-draft-v1.md` for owner review — not published.

## Evidence (whitelisted fields only)

| Field | Value |
| :---- | :---- |
| timestamp | 2026-07-03 |
| event type | ai_search_foundation_shipped |
| accept/reject result | accepted (build, lint, 38/38 tests green; JSON-LD verified in prerendered output) |
| sanitized summary | Structured data, robots, and sitemap live from approved copy only; FAQ copy staged as a governance draft pending owner approval |

## Deviations from the task packet

None.

## Follow-ups

- Owner: review/approve `governance/drafts/faq-adu-draft-v1.md` → follow-up
  task publishes the FAQ section with FAQPage JSON-LD.
- Owner: verify westcoastkbp.com renders the JSON-LD in production
  (validator.schema.org or Google Rich Results Test) — the sandbox cannot
  reach the live domain.
- Candidate TASK: lead-candidate object in the lab (charter lead states).
