# WORK-ORDER-003 — restore Studio 450 asset and enforce asset integrity

- **Issued by:** operational lead / registrar under owner directive, 2026-08-05
- **Executor:** ChatGPT builder lane
- **Independent reviewer:** Claude non-author lane
- **Pinned base:** `main@9f7c06d409ba1ba2eb7f82a2e306ad7f55cdb64e`
- **Related:** TASK-0013, RUN-0013
- **Allocated evidence record:** RUN-0016

## Single outcome

Restore the missing Studio 450 conceptual image with the Owner-selected v3 asset
and make every catalog `geometry_ref` resolve through one fail-closed,
repository-controlled asset path.

Approved candidate:

- target path: `public/images/adu-courtyard-concept-v1.webp`
- dimensions: `1536×1024`
- SHA-256: `0bf4bfa2306311e10a9420c7b0fb9c5b89eb200eadf71e9bc5d875bbc8bb3334`
- visual boundary: ordinary mid-market Sacramento-area detached ADU; uniform
  light stucco on all visible walls; no siding, luxury compound, pool, expensive
  stone, customer property, or claim that it is completed work

## Owned paths

- `public/images/adu-courtyard-concept-v1.webp`
- `src/lib/studio/assetManifest.ts` (new canonical resolver)
- `src/lib/studio/assetManifest.test.ts` (new integrity and refusal probes)
- `src/components/studio/StudioWorkbench.tsx` (only to consume the resolver)
- `governance/evidence/RUN-0016-studio-asset-integrity.md`
- the WORK-ORDER-003 row in `governance/orders/README.md`, if the row remains
  owned by the builder at execution time

If repository conventions require a differently named test file, stop and ask
the operational lead to amend the order; do not expand the owned paths silently.

## Binding behavior

1. The exact approved bytes occupy the target public path and match the pinned
   SHA-256.
2. One typed manifest maps all supported `geometry_ref` values to public paths.
3. One resolver is the canonical effect path for the main Studio image and
   comparison thumbnails.
4. Unknown or absent refs fail closed with a deterministic error; no placeholder,
   network fallback, or silent empty string is allowed.
5. The integrity test proves that every catalog archetype ref is mapped, every
   mapped file exists, every mapped WebP has a valid RIFF/WEBP signature and
   non-zero bytes, and an unknown ref is refused.

## Non-goals

- No redesign, copy, layout, catalog-option, configuration-hash, compatibility,
  route, navigation, or jurisdiction-page change.
- No new dependency.
- No PII, address, contact, pricing, schedule, GIS, zoning, permit,
  buildability, persistence, analytics, AI, or external request.
- No Vercel, domain, credential, ruleset, infrastructure, or production-setting
  change.
- Do not mark TASK-0013 complete; deployed p75 CWV and independent final review
  remain separate acceptance gates.

## Required evidence

- `sha256sum public/images/adu-courtyard-concept-v1.webp` equals the approved
  digest.
- `npm run lint`, `npm test`, and `npm run build` with exact results.
- Targeted positive and negative asset-manifest tests.
- Browser QA on `/studio` at desktop `1487×1058` and mobile `390×844`:
  Studio 450 main image and comparison thumbnail have `naturalWidth > 0` and
  `naturalHeight > 0`; no framework overlay, application console error, failed
  first-party image request, or horizontal overflow.
- Core deterministic selection and refusal behavior remains unchanged.
- Desktop and mobile screenshots attached to the Draft PR or RUN-0016.
- Draft PR identifies the exact base SHA, head SHA, changed files, commands,
  results, and any unavailable deployed evidence.

## Blocker behavior

Stop and report the exact fact if the base SHA drifted, the approved asset bytes
do not match the digest, an owned path conflicts with another open PR, the test
cannot validate public assets without a dependency, or browser/deployed evidence
is unavailable. Do not regenerate the image, substitute another asset, weaken
the assertion, or expand scope.

