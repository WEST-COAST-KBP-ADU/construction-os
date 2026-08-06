# RUN-0017 — development-preview release surface

Status: implementation and local browser acceptance complete; Draft PR pending
non-author review and Owner merge; deployed state **NOT VERIFIED**

- **Work order:** WORK-ORDER-005
- **Executor:** Claude Code builder lane
- **Timestamp:** 2026-08-06T23:25:00Z
- **Order pinned base:** `main@9373df3925864cad06ef90dc1bca544b760439a8`
- **Owner-directed execution base:** `main@aec594e0a0648668ba45b2696993f02b9c2f58f0`
  (current `main` at execution start; contains the merged order itself — no
  product drift between the two bases affects the owned paths)
- **Branch:** `claude/wo005-development-preview`

## What was done

Added a site-wide, non-dismissible development-preview notice rendered once in
the root layout before the global header on every route. Content lives only in
`siteConfig.developmentNotice` (label / message / supporting); the component
reads it and route components never duplicate it. Styling is token-only
(`--color-surface-muted`, `--color-line`, label/body-sm type tokens), visually
subordinate to primary navigation, and carries `role="note"` — not an alert.

No contact surface, input, tel/mailto, credential, analytics, dependency,
route, metadata, structured-data, navigation, or Studio behavior change.

## Evidence (whitelisted fields only)

| Field | Value |
| :---- | :---- |
| timestamp | 2026-08-06T23:25:00Z |
| test variant ID | WORK-ORDER-005 / development-preview-surface-v1 |
| event type | bounded implementation + local browser acceptance |
| accept/reject result | accepted locally; deployed evidence not claimed |
| latency marker | not measured |
| error class | none |
| sanitized summary | Notice renders before header on all 12 routes at both required viewports; all binding-behavior checks pass; two initial flags investigated and resolved as false positives. |

## Commands and exact results

| Command | Result |
| :-- | :-- |
| `npm test -- src/lib/developmentPreview.test.ts` | 3/3 passed |
| `npm test` (full) | 80/80 passed, 11 files |
| `npm run lint` | exit 0 |
| `npm run build` | exit 0; route list unchanged plus no new routes |

## Local browser acceptance

Production server (`next start`), Chromium via Playwright, viewports
**1363×936** and **390×844**, all 12 required routes (`/`, `/about`,
`/adu-builder/sacramento`, `/compare`, `/faq`, `/process`, five `/services/*`,
`/studio`) — 24 route×viewport checks:

- HTTP 200: 24/24
- Notice present **before** the global header in DOM order: 24/24
- Notice contains exact label, message, and supporting statement: 24/24
- Exactly one H1 per route: 24/24
- Horizontal overflow: 0
- Framework overlay: 0; console/page errors: 0; failed requests: 0
- `form / input / textarea / select`: 0; `tel:` / `mailto:`: 0
- Phone-like, address-like, or contractor-license identifiers: 0

Two initial automated flags were investigated and resolved, not suppressed:

1. Two zero-naturalWidth images on `/` are `loading="lazy"` assets below the
   fold; after scroll both load and the count is 0. Pre-existing behavior, not
   a broken image.
2. A license-pattern regex hit on `/about` traced to (a) honest copy stating
   licensing details "remain pending" and (b) the digits `691722` inside the
   hashed build asset name `c9730a691722b160.css`. No credential or license
   number is published.

## Screenshots (referenced, not committed)

| Artifact | SHA-256 |
| :-- | :-- |
| `wo005-desktop-home.png` (1363×936, `/`) | `068328597c58fdc18fcd3ca83d0e6de9605723e966bb83d9a957231ec7f45cc8` |
| `wo005-desktop-studio.png` (1363×936, `/studio`) | `aa01410b8ac94c0fbb09884d72c0ad0b605d69b472d706e07c90c705db854031` |
| `wo005-mobile-home.png` (390×844, `/`) | `cd23ef7ce94293c334bd95355270b5c5ea3910f3fe615a53fb2e5c2281e7d777` |
| `wo005-mobile-studio.png` (390×844, `/studio`) | `543ae24c5517cd2c1468e92c0c2a70e2f404c82471e92c645f837b597b75ae54` |

## Deviations and limitations

- The component imports `siteConfig` via a relative path rather than the `@/`
  alias: the vitest runner resolves no path alias, and adding one would touch a
  configuration path outside the owned set. Behavior is identical.
- Deployed, canonical-domain, and p75 field evidence are **not claimed** and
  remain blocked on P0 domain custody. Vercel preview status is build evidence
  only.
- This record does not close TASK-0010 or TASK-0013.

## Handoff

Draft PR only. Non-author reviewer: ChatGPT lane. Owner remains the sole
merger. Any new commit invalidates evidence pinned to the head below.
