# STATE — single shared board

Owner of this file: Claude, operational lead (OPERATING-MODEL-v2). The worker
edits only its own lane row, in the same PR as the work. Merged `main` is the
only truth; this board is the index, not the source.

Updated: 2026-08-04f — operational control taken; base `main@c3271f3`

## Queue — set by the operational lead, executed in this order

| # | Work | Executor | State |
| :- | :--- | :------- | :---- |
| 1 | **WORK-ORDER-001** — execute RP-0008 Sacramento GIS, two jurisdictions | ChatGPT | issued |
| 2 | Close TASK-0013 registry with deployed p75 CWV + screenshot evidence | ChatGPT | queued — see blockers |
| 3 | TASK-0011 city + resource pages, Sacramento ring first | ChatGPT | queued — depends on #1 for regulatory content |
| 4 | Review every worker PR at exact head SHA | Claude | continuous |

Nothing starts out of order. The worker takes #1 and stops at its PR.

## Shipped

- `/studio` deterministic editorial workbench — merged (PR #35, `c3271f3`).
  Catalog release `2026.08.0`: 3 archetypes, 2 compatibility rules, 3 assets
  with license rows filled. Tests present: `studio.test.ts`, `zeroEgress.test.ts`.
  Local visual/interaction QA passed. Registry cell reads `in_progress` pending
  deployed p75 evidence — closes under queue item 2.
- Public site: home, services ×5, process, faq, about, compare. JSON-LD,
  sitemap, llms.txt. No capture anywhere.

## Owner decision queue — only these reach the owner

1. Open the lead-generation phase? Not before the technical and visual track is
   done — owner order, 2026-08-04.
2. First ICP — one sentence.
3. Business facts package (CSLB, insurance, photo rights, team). Blocks trust
   content only; nothing else waits on it.

DR-0011 is adopted (Option A, pilot destination only) and no longer a pending
decision. Everything else is the operational lead's call.

## Known blockers

- **Deployed visual evidence** — the worker's cloud browser timed out against
  the canonical domain (`cloud_browser_navigation_timeout`, 2026-08-04), so
  TASK-0007/0010/0013 still lack deployed p75 LCP/INP/CLS and the full
  screenshot set. Recorded as `partial` in RUN-0007 and RUN-0010, never waived.
  If it fails again: report the exact failure and stop. Local screenshots are
  not a substitute for deployed evidence.
- **GIS hosts unreachable from the reviewer environment** — eight official hosts
  return 403 at proxy CONNECT. This is why WORK-ORDER-001 routes to the worker.

## Infrastructure notes

- Canonical Vercel project: `west-coast-kbp-platform-preview` (team KBP CORE,
  Pro) — green. A stray `nextjs-boilerplate` project on a separate Vercel team
  (`kbp-sistem`, Hobby, unreachable from the owner's login) posts a permanent
  red status. **Cosmetic — it never blocked a merge and never reflected the
  site.** Do not remove the Vercel GitHub App installation to silence it: one
  installation serves both projects, so removing it would kill the live deploy.
- `main` is protected: PR required, force-push blocked, deletion restricted.
  Required approvals stay at 0 — all PRs are authored by the owner's account and
  GitHub forbids self-approval, so requiring one would deadlock every merge.
  Required status checks stay off while the stray red check exists.
- Merge to `main` auto-deploys production. Owner merge is therefore also a
  production-release authorization.

## Standing constraints — do not re-litigate

- Demo posture: no contact surface of any kind (DR-0013, DR-0015).
- Market: both rings core; Sacramento leads build order (DR-0014).
- No AI in the visitor-facing decision path; deterministic only.
- Public copy English. RU/ES are internal operator capability, unadvertised
  (DR-0016).
- Studio is 2D-first; 3D only on evidence (REVIEW-0001 §3.3).
- One order = one branch = one draft PR. Owner merges.

## Stale branches — owner cleanup, low priority

Fourteen `agent/*`, `claude/*`, `feature/*`, `platform/*` branches are merged or
abandoned. Delete from the branches page when convenient; harmless.
