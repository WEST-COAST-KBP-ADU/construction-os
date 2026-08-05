# REVIEW-WO003-POSTMERGE — independent post-merge audit of PR #41

- **Reviewer:** Claude (Fable), independent non-author lane (OPERATING-MODEL-v3)
- **Reviewed:** 2026-08-05
- **Product head:** `0e0f7ba952a979c93bd18570b870214c161d6e34`
- **Merge commit:** `cdee1503ba5fab5481a0ad07393f1ca36191b909`
- **Base / merge base:** `35c22898…` / `9f7c06d4…` — all five provenance
  assertions from the engagement brief passed
- **Verdict:** **PASS** — anchored to the product head above; any new commit
  invalidates it. A clean review is not approval; merge authority is the Owner's.

This file is the committed record of a verdict previously delivered only via
chat transport. Chat is not SourceTrue; this closes that provenance gap for
WO-003. Full command transcripts were delivered in the engagement response;
the load-bearing results are reproduced here.

## What was independently reproduced at the exact head

- Scope: first-parent merge diff = exactly the five declared files,
  180 insertions / 8 deletions.
- Asset: size 181058, SHA-256 `0bf4bfa2…`, git blob `245d8250…`, **full decode**
  (Pillow) as WebP 1536×1024 RGB — not magic-bytes-only; visual inspection
  confirmed uniform light stucco, ordinary mid-market detached ADU, no siding
  or luxury cues.
- Resolver: one frozen manifest, `hasOwnProperty`-guarded lookup throwing exact
  `unknown_geometry_ref`; both call sites (main image, comparison thumbnail)
  route through it; the prior `imageByRef` map and silent thumbnail fallback are
  gone; no second resolution path found by search.
- Tests/build (clean install, node v22.22.2): targeted 9/9 including hostile
  keys (`toString`, `__proto__`, null, undefined); full 77/77; lint 0; build 0.
- Browser (production server, Chromium, 1487×1058 and 390×844): `/studio` 200,
  asset 200/181058, all images non-zero natural size, expected hash sequence
  600→450→800, zero console/page errors, zero failed requests, no horizontal
  overflow, no-lead language present.

## Findings (none merge-blocking)

1. **Process:** PR #41 merged before any independent verdict existed. Outcome
   safe this time; the pre-merge gate is re-affirmed in v3 practice.
2. **Stale records** created by the merge — corrected by PR #42 (see
   REVIEW-PR42-REGISTRY-TRUTH, PASS).
3. Browser exercise of the two compatibility refusal cases: NOT RUN (refusal
   path untouched by the diff; unit-covered). Deferred to the deployed-QA order.
4. Deployed state: **NOT VERIFIED** — unverifiable by any party until domain
   custody (P0) closes.
