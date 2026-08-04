# RUN-0010: TASK-0010 architectural homepage and global shell

- **Task packet:** TASK-0010
- **Timestamp:** 2026-08-04T04:13Z
- **Executor:** ChatGPT Codex builder
- **Result:** partial

## What was done

Replaced the technical-portal homepage with the owner-approved attainable
architectural editorial direction. Added a full-screen ADU hero, residential
service paths, an editorial addition story, controlled-process and verification
sections, a responsive global navigation shell, a revised footer, and two
optimized conceptual images. Opened Draft PR #26 from the pinned `main` base.

## Evidence (whitelisted fields only)

| Field | Value |
| :---- | :---- |
| timestamp | 2026-08-04T04:13Z |
| test variant ID | TASK-0010 / California room to grow |
| event type | bounded homepage build and preview verification |
| accept/reject result | partial: implementation and desktop preview accepted; mobile visual screenshot not captured |
| latency marker | production build compile 4.4 s; 14 routes generated |
| error class | agent-preview environment limitation; browser mobile viewport unavailable |
| sanitized summary | `main@f223792529c7c88987c44efb15a849956022ac1d`; implementation commit `de18cf23fe06f8294f609445ea191262e1068eac`; 11 changed files; lint accepted; 56/56 tests accepted; production build accepted; canonical Vercel deployment READY; homepage and process navigation rendered; no Next error overlay; no project runtime errors found for `/` in the one-hour verification window. |

## Preview evidence

- Canonical Vercel project: `west-coast-kbp-platform-preview`.
- Deployment source commit matched
  `de18cf23fe06f8294f609445ea191262e1068eac` and Draft PR #26.
- `Vercel – west-coast-kbp-platform-preview`: success.
- `Vercel – nextjs-boilerplate`: legacy failure pointing to the historical
  Hobby/private-org upgrade path; it did not block the canonical deployment.
- Browser title: `West Coast KBP — ADU & Residential Construction`.
- Hero and residential-story images reported non-zero optimized dimensions.
- `/process` navigation completed and rendered the expected H1.
- Browser application error overlay: absent.
- Vercel runtime errors for `/`, prior one-hour window: none found.
- Desktop screenshots:
  - `TASK-0010-desktop-hero.jpg`
  - `TASK-0010-desktop-story.jpg`

## Deviations from the task packet

- The selected Default templates plugin did not expose the requested
  `app_block` capability in this session. No substitute template or hidden
  dependency was introduced.
- Construction OS is not a Sites-managed checkout and has no
  `.openai/hosting.json`. A parallel Sites project was not created because that
  would establish an unapproved duplicate hosting contour.
- The local agent-preview runtime could not run this Next.js checkout: direct
  Next dev failed while reading network interfaces, and the Sites preview
  wrapper forwarded Vite-only flags that Next rejects. The production build and
  canonical Vercel deployment were used for verification instead.
- The available cloud browser does not expose a supported viewport-resize
  operation. A framed mobile-emulation attempt was blocked by browser security
  policy and was not retried or bypassed. Responsive CSS, semantic mobile
  navigation, and reduced-motion behavior are covered by regression tests, but
  a mobile screenshot remains required before changing this run to accepted.

## Follow-ups

- Owner visual review of Draft PR #26 and the authenticated Vercel preview.
- Capture one real mobile-width preview screenshot and exercise the native
  `details` mobile menu before marking TASK-0010 done.
- Do not merge, approve, or change production from this run.

## Owner-selected balanced revision

- **Timestamp:** 2026-08-04T04:44Z
- **Selected concept:** concept 01, balanced middle / upper-middle editorial
  design-build direction.
- **Pinned parent:** `0b305cd397b8128b1cfb1aca213892db84c9c2cb`.
- **Scope:** homepage composition, four new conceptual assets, focused
  regression expectations, and SourceTrue provenance only.
- **Status before remote verification:** pending. No lint, test, build, CI,
  deployment, desktop screenshot, or mobile screenshot result is asserted by
  this note.

## Close-out recheck — 2026-08-04T19:10:18Z

| Field | Value |
| :---- | :---- |
| timestamp | 2026-08-04T19:10:18Z |
| test variant ID | TASK-0010 close-out recheck |
| event type | canonical-site visual evidence recheck |
| accept/reject result | partial — mobile visual and native menu evidence remain unavailable |
| latency marker | navigation did not reach DOM before timeout |
| error class | cloud_browser_navigation_timeout |
| sanitized summary | Cloud browser connected, but navigation to the canonical public domain timed out before URL, title, viewport, DOM, native mobile-menu interaction, or screenshot evidence could be recorded. No completion claim is made. |
