# Studio precision stage design QA

Date: 2026-08-10

Issue: #155

Product base: `e32be9ea7cb265f6c6c0a65002a59bfe1419916c`

Design input: `38b57662b064c2d1ae40a7c7b3d7a7aac2b95e02`

## Exact reference and evidence

- Reference: `docs/design/studio-precision-configurator-selected-v1.jpg` at the exact design-input commit.
- Reference derivative: 1200×854 JPEG, SHA-256 `c854b5a2ee0ba29288688e43cf37198ba11afcc150bf23a83714c9590ca9d661`.
- Implementation evidence: `docs/evidence/studio-precision-stage-preview-20260810.jpg` at 1487×1058, SHA-256 `8f6b4e3885403b5498e6e2a1ad093b80bd152fb3b3303a0ec5af685e5a35e7d9`.
- Same state: A600 / one-bedroom / 600 sq ft / Horizontal lap concept / Blue concept.

## Comparison

The implementation follows the reference stage hierarchy: the matched house is the dominant visual, its roofline, openings, facade, and entry remain visible, and one compact graphite metadata plate sits at the upper right. The plate presents model, program, size, and concept-render status. Green is confined to the render-status dot. The existing public implementation retains generic concept labels rather than the reference's illustrative manufacturer labels.

The stage-owned lower treatment is deliberately smaller than the reference dock because the sibling shell lane owns the workbench controls and dock composition. Within this lane, the material/truth plate stays adjacent to the render, replay is subordinate, and the public conceptual-use and physical-sample/local-availability boundaries remain visible. Graphite and neutral token fallbacks match the selected direction while allowing the ancestor shell tokens to take precedence.

The transition uses only an exact 1100 ms clip/crossfade. No sweep, decorative gradient, fallback image, or unsupported-model media is present. Reduced motion removes both animations and the previous layer so the selected final image is immediate. A450 and A800 use the same graphite surface and explicitly state that they remain image-free until a matched new-construction render exists.

## Rendered Chromium gate

Fresh production-build Chromium inspection covered 390×844, 820×1180, 1440×1000, and the 1487×1058 reference-comparison viewport. At every viewport it exercised all four resolved A600 facade/color states, replay, A600 → A450, A450 → A800, and return to A600.

- Horizontal overflow: none (`scrollWidth === clientWidth` at every viewport).
- Media: all four exact resolver assets loaded; A450 and A800 became image-free immediately; A600 returned to its exact matched asset.
- Composition: house, roofline, openings, metadata, truth copy, and caption remained visible without overlap or broken media.
- Interaction: replay remained subordinate and keyboard-focus visible.
- Runtime: no app-origin console errors or uncaught page errors.

## Severity review and fixes

- P0: none found.
- P1 fixed: removed the decorative sweep and gradient; prevented any previous A600 image from surviving a model change; preserved immediate reduced-motion final state; kept pending models image-free.
- P2 fixed: moved selection metadata to the upper right; separated the green render-status signal from selection/focus blue; reduced replay prominence; added graphite fallbacks and responsive metadata/truth recomposition.
- Outstanding P0/P1/P2: none.

final result: passed
