# RP-0006: AI training data as business strategy (owner-provided article + analysis)

- **Status:** received + synthesized
- **Date:** 2026-07-04
- **Source:** owner-provided article (RU) on Cloudflare crawler policy and
  "training data as the new oil" — zero authority
- **Feeds into:** DR-0010 (proposed), future production data policy DR

## Article claims (require official source verification)

- Cloudflare (fronting ~22.7% of websites) set a deadline (cited as Sept 15)
  for crawler operators to separate search bots from AI-training bots; mixed
  bots face permanent blocks. Pay Per Crawl has run since summer 2025.
- Google crawls with one combined bot for search and AI answers, so blocking
  it costs search traffic — pure-AI companies (OpenAI, Anthropic) take the
  hit while Google passes through.
- The old web deal (bots in exchange for referral traffic) is breaking:
  training crawlers take thousands of pages per referred visitor, and AI
  summaries cut clicks.
- Strategic question posed: "What place does AI training data occupy in our
  business strategy?"

Verification note: Cloudflare Pay Per Crawl (2025) and the combined-Googlebot
dynamics match previously known facts; the specific September deadline and
percentages are unverified press claims.

## Analysis for West Coast KBP

### 1. On the web side, our posture is the OPPOSITE of a publisher's

Publishers monetize pageviews, so AI crawlers are parasitic to them. We
monetize construction contracts; an AI answer that says "West Coast KBP,
Roseville, owner-reviewed process" IS our distribution, whether or not the
visitor clicks. Conclusion: keep the public site deliberately open to search
AND AI crawlers (robots.txt allow-all + llms.txt already shipped, TASK-0004/5).
Public marketing copy has no moat value to protect; the crawl cost of a small
site is negligible. Hard exception, standing rule: anything authenticated or
lead-related (future portal, admin, lead data) is never crawlable.

We host on Vercel, not Cloudflare — Cloudflare's crawler gates do not apply to
us directly; monitor Vercel bot-management defaults so they never silently
block AI crawlers we want.

### 2. The real "oil field" is not the site — it is the kernel's exhaust

What no competitor can crawl, buy, or replicate is the operational data the
platform produces by design:

| Data stream | Why it is training-grade |
| :---------- | :----------------------- |
| Sanitized intake artifacts (voice/web) | Structured, schema-validated, PII-free by construction |
| Owner verdicts on lead packets (approve/decline + reasoning) | **Expert labels** — supervised training data made by the owner's own judgment |
| GIS screening candidates vs later official verification outcomes | Ground truth for feasibility models |
| Permit timelines per jurisdiction (observed, dated) | Nobody publishes this for Sacramento; doubles as the public "permit timeline map" differentiator (RP-0004) |
| Estimates vs actuals, guardrail hits, refusal events | Calibration and safety tuning for the voice assistant |

The evidence chain (Core model) gives every record provenance — which is
exactly what makes a dataset legally and technically usable for training
later. The candidate → owner-review → verdict pipeline IS a labeling pipeline.

### 3. Tension with the privacy boundary — resolvable, but must be explicit

Training datasets want completeness; DR-0004 mandates minimal retention, no
PII, no transcripts. Resolution: the dataset lane contains only sanitized
structured records and verdicts (whitelisted fields), never raw audio/
transcripts/identities. Client consent language for aggregate/anonymized use
of project data goes into the future production data policy DR. Raw-data
retention remains NOT adopted.

### 4. Answer to the article's strategic question

"Training data" for West Coast KBP = (a) the public site as bait, open to all
bots; (b) the kernel's structured exhaust as a proprietary, un-crawlable
dataset accumulating from day one; (c) owner verdicts as the labeling engine.
The moat is not content — it is labeled operational truth about Sacramento ADU
construction.

## Recommendation

Adopt "dataset-by-design" as a platform principle (DR-0010 proposed):
versioned artifact schemas, verdicts recorded as labels, a sanitized-records
retention lane distinct from the PII prohibition, and a jurisdiction-facts
table. Zero new collection today; it is a design discipline, not a feature.
