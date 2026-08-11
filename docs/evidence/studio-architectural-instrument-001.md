# STUDIO-ARCHITECTURAL-INSTRUMENT-001 evidence

## Scope

- Issue: #158
- Base: `e32be9ea7cb265f6c6c0a65002a59bfe1419916c`
- Branch: `agent/studio-architectural-instrument-001`
- Model: A600 only
- Working views: Exterior, Plan, Site gate

## Source truth

- Exterior: four repository-controlled A600 concept WebP sources at 1672 × 941 px.
- Display ceiling: 836 CSS px, preserving a 2× source-pixel budget on Retina displays.
- Image delivery: source WebP served unoptimized; no second lossy encoding.
- Plan source: `docs/design/a600/A600-CONCEPT-TESTFIT-001.svg` copied byte-for-byte to `public/design/a600/A600-CONCEPT-TESTFIT-001.svg`.
- Plan SHA-256: `54cb40a6212916d83ab5638ae05330d113a06dc9c09a03fe5f120875f03da5f4`.
- Executable profile: `adu-a-600-profile-owner-adopted` v1.0.0, maturity `concept_only`.
- Profile digest: `sha256:27df292e84fc6e00a2ddc5913c0f6175d94a91a4b0de32bf4dab2c3049eec5b3`.

## Motion contract

- Dependency: `motion@13.1.0`.
- Imports: `motion/react` with `LazyMotion`, `domAnimation`, `MotionConfig`, `AnimatePresence`, shared layout indicators, and `useReducedMotion`.
- Mode changes: 180 ms maximum.
- Render changes: 220 ms maximum.
- Animated properties: opacity, a 2% clip-path edge, and a 4 px mode-panel translation.
- Explicitly absent: blur, filters, image scaling, parallax, sweep effects, replay animation, and continuous idle motion.

## Truth and privacy boundaries

- The Site gate fails closed until parcel geometry and jurisdictional evidence exist.
- Studio collects no address or contact information.
- No property, zoning, permit, buildability, price, schedule, material-product, or completed-project conclusion is made.

## Local sparse-harness verification

- `npx vitest run src/components/studio/HardieMotionStage.test.ts src/components/studio/studioArchitecturalInstrument.test.ts src/lib/studioAccessibility.test.ts` — 20/20 passed.
- `npx tsc --noEmit` — passed.
- Focused ESLint across all changed TS/TSX test files — passed.
- Public/source SVG SHA-256 equality — passed.

## Remote verification

- Draft PR: pending
- Vercel preview: pending
- Full repository build: pending
- Desktop 1440 × 1000: pending
- iPad 820 × 1180: pending
- Phone 390 × 844: pending
