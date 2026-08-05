# RUN-0016 — Studio asset integrity

Status: implementation complete; browser acceptance pending independent access

Recorded: 2026-08-05T14:45:57Z

## Source anchor and scope

- Repository: `WEST-COAST-KBP-ADU/construction-os`
- Work order: `WORK-ORDER-003-studio-asset-integrity`
- Product base: `main@9f7c06d409ba1ba2eb7f82a2e306ad7f55cdb64e`
- Current target branch at execution start: `main@35c22898b8b7259f511f2dbde178bb62c175140e`
- Builder branch: `agent/work-order-003-studio-asset-integrity`
- Code head before this evidence record: `9319c488cf2f63432a8241bccbafad40a985b860`
- The base-to-target delta was the governance-only merge that issued this order. Product bytes were unchanged.
- No catalog, layout, copy, compatibility, route, dependency, infrastructure, credential, analytics, AI, or external-action behavior was changed.

## Implemented product bytes

- Added `public/images/adu-courtyard-concept-v1.webp`.
  - dimensions: 1536×1024
  - bytes: 181058
  - SHA-256: `0bf4bfa2306311e10a9420c7b0fb9c5b89eb200eadf71e9bc5d875bbc8bb3334`
  - Git blob: `245d825016afa9fbce04df5e25eab4b964077a7f`
- Added a typed, client-safe `STUDIO_ASSET_MANIFEST` and the single `resolveStudioAsset` fail-closed resolver.
- Routed both the main Studio image and comparison thumbnails through that resolver.
- Removed the comparison thumbnail's silent fallback to the main image.
- Added regression coverage for catalog/manifest equality, repository file presence, RIFF/WEBP signatures, exact approved asset digest, positive resolution, and unknown/absent/prototype-key refusal.

## Provenance checks

- Reconstructed build/test workspace from the pinned product base and compared 65 source/config/public text files by Git blob SHA: 65 matched, 0 mismatched, 0 unresolved.
- Verified all referenced baseline Studio and homepage WebPs against their pinned-base Git blob SHAs.
- The approved Studio 450 asset Git blob matches the branch blob exactly.

## Local verification

| Command / probe | Result |
|---|---|
| `sha256sum public/images/adu-courtyard-concept-v1.webp` | PASS — exact `0bf4bfa2…3334` |
| `npm test -- src/lib/studio/assetManifest.test.ts` | PASS — 1 file, 9 tests |
| `npm run lint` | PASS — exit 0 |
| `npm test` | PASS — 10 files, 77 tests |
| `npm run build` | PASS — Next.js 16.2.4, TypeScript complete, 17 static pages, `/studio` generated |
| local `GET /images/adu-courtyard-concept-v1.webp` | PASS — HTTP 200, `image/webp`, 181058 bytes, exact SHA-256 |
| local `GET /studio` | PASS — HTTP 200 |

Runtime notes: Node `v24.14.0`, npm `11.9.0`, locally resolved Vitest `4.1.10`. The npm `http-proxy` deprecation notice is an environment warning, not a product failure.

## Exact-commit preview build

- Deployment: `dpl_Hj5kTbWww38NoGhWsVssyQqBvYp1`
- URL: `west-coast-kbp-platform-preview-85p05uqdr-kbp-core-s-projects.vercel.app`
- Git SHA: `9319c488cf2f63432a8241bccbafad40a985b860`
- Branch: `agent/work-order-003-studio-asset-integrity`
- State: `READY`
- Vercel build compiled successfully, completed TypeScript, and generated the expected routes including `/studio`.

## Browser acceptance

Pending, not claimed as PASS.

- The exact preview is behind Vercel deployment protection and redirects the cloud browser to Vercel login.
- The cloud browser cannot reach the local development server (`ERR_BLOCKED_BY_CLIENT`).
- The available cloud browser reports a 1363×936 viewport and exposes no viewport-resize operation, so the required 1487×1058 and 390×844 captures were not fabricated.
- No temporary share URL, protection bypass, production change, or unapproved browser fallback was created.
- Therefore `naturalWidth`/`naturalHeight`, overlay/console/network, horizontal overflow, and desktop/mobile screenshots remain pending.

## Handoff

- Draft PR only; builder must not mark Ready, approve, merge, or provide an independent verdict.
- Independent reviewer: Claude, per Operating Model v3.
- Owner remains the sole merger.
- `TASK-0013` remains open until deployed browser evidence is completed.
