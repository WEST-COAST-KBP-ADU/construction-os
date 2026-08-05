# RUN-0016 — Studio asset integrity

Status: merged; independent post-merge PASS reported; deployed browser state **NOT VERIFIED**

Recorded: 2026-08-05T14:45:57Z

Local browser verified: 2026-08-05T14:59:34Z

Post-merge status synchronized: 2026-08-05

## Source anchor and scope

- Repository: `WEST-COAST-KBP-ADU/construction-os`
- Work order: `WORK-ORDER-003-studio-asset-integrity`
- Product base: `main@9f7c06d409ba1ba2eb7f82a2e306ad7f55cdb64e`
- Current target branch at execution start: `main@35c22898b8b7259f511f2dbde178bb62c175140e`
- Builder branch: `agent/work-order-003-studio-asset-integrity`
- Code head before this evidence record: `9319c488cf2f63432a8241bccbafad40a985b860`
- Final product head: `0e0f7ba952a979c93bd18570b870214c161d6e34`
- Owner merge: PR #41, `main@cdee1503ba5fab5481a0ad07393f1ca36191b909`; GitHub `merged_at` 2026-08-05T15:56:43Z
- Independent review provenance: Fable reported `REVIEW-WO003-POSTMERGE: PASS` for the exact final product head. No committed REVIEW artifact exists at the synchronization base; this registrar update records the reported disposition but does not self-verify it.
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
- The first evidence head `85006a93794f2492484717b410beecb75da82098` also deployed `READY` as `dpl_ANWs9YXFvRFZE7Duep6DfqP89DVV`; the canonical `west-coast-kbp-platform-preview` check succeeded.

## Browser acceptance

Local exact-source browser acceptance: PASS.

| Probe | Desktop 1487×1058 | Mobile 390×844 |
|---|---:|---:|
| `/studio` response | 200 | 200 |
| Studio 450 main image | 1026×684 natural | 390×260 natural |
| `Concept B` thumbnail | 160×106 natural | 160×106 natural |
| Horizontal overflow | none | none |
| Next error overlay | absent | absent |
| Application console errors | 0 | 0 |
| Page errors | 0 | 0 |
| Failed requests | 0 | 0 |
| Failed first-party images | 0 | 0 |

- Deterministic configuration sequence: `B62013C355B0` (600) → `66FA6518F3D6` (450) → `130FDBBD7AE4` (800).
- `Studio + Comfort` remained disabled with the exact compact-interior refusal reason.
- `Studio + Shed + Tall` remained disabled with the exact roof/window-clearance refusal reason.
- The comparison panel opened and retained its no-lead language.
- Desktop screenshot: `wo003-studio-450-desktop-1487x1058.png`, SHA-256 `b4c15edb3ea62ef1b4a873d2db04a5e28f4a5aeb4baa4a543eaba204d475eefc`.
- Mobile screenshot: `wo003-studio-450-mobile-390x844.png`, SHA-256 `917c3b8103b983e50d894666be63df9d4f49be13e0b89b0b4a0904055ab03b33`.
- Machine-readable result: `wo003-browser-results.json`, SHA-256 `749debb0fcbb6372c280b0eeb9a58afd7e1b8f078f167a5bc81af25629b9c4bf`.
- QA used temporary Playwright `1.62.1` with Chromium `149.0.7827.0`; neither package was added to the repository or product dependencies.

Deployed browser acceptance: **NOT VERIFIED**. The exact preview redirected the cloud browser to Vercel login, and end-to-end custody of the canonical domain is not yet evidenced. No temporary share URL, protection bypass, domain change, or Vercel setting change was created by the builder. Vercel READY is retained only as build evidence.

## Post-merge disposition

- The Owner merged PR #41 at the exact product head identified above.
- Fable reported an independent post-merge PASS for that exact head; a committed REVIEW artifact is still absent and remains a provenance gap.
- Repository governance states that merge to `main` may auto-deploy. This record does not claim production was untouched and does not infer which bytes the canonical domain serves.
- Canonical deployed behavior and p75 field evidence remain **NOT VERIFIED**.
- `TASK-0013` remains open until deployed browser and field evidence are completed.
