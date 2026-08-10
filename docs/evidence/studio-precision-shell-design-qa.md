# Studio precision shell design QA

## Evidence basis

- Product base: `main@e32be9ea7cb265f6c6c0a65002a59bfe1419916c`
- Selected design input: `design/studio-precision-configurator-selected-v1@38b57662b064c2d1ae40a7c7b3d7a7aac2b95e02`
- Exact reference: `docs/design/studio-precision-configurator-selected-v1.jpg` at that commit
- Reference SHA-256: `c854b5a2ee0ba29288688e43cf37198ba11afcc150bf23a83714c9590ca9d661`
- Same-state implementation: `docs/evidence/studio-precision-shell-preview-20260810.jpg`, 1487 × 1058 viewport, A600 / horizontal lap / blue concept

## Reference comparison

The implementation adopts the selected reference's dominant full-stage house, compact upper-left editorial title and precision descriptor, secondary upper-right model status, and one graphite decision dock. The dock preserves the selected order: model size, facade system, facade color, fixed trim information, then comparison. The public implementation intentionally differs from the illustrative reference by retaining generic concept labels and the existing global header, truth caption, deterministic configuration status, and in-memory-only disclosures.

At tablet and mobile widths the dock moves below the image instead of obscuring the conceptual caption or house. At desktop it floats over the stage. The stage component itself and its frozen four-prop interface remain unchanged for clean integration with the parallel stage lane.

## Findings and fixes

- P0: none observed.
- P1, fixed: the former separate right-side configurator competed with the house. It was replaced with the single ordered lower dock.
- P1, fixed: A450 and A800 could imply selectable facade media. Both pending models now keep facade and color controls disabled, with no carried-over image.
- P1, fixed: fixed trim could be mistaken for configuration state. It is now a non-interactive information region and remains absent from candidate/hash inputs.
- P1, fixed: mobile floating controls risked obscuring media and truth copy. The dock now recomposes below the stage at 820 px and below.
- P2, fixed: material choices used plain controls. Five dedicated render-derived WebP crops now appear through `next/image` beside generic labels.
- P2, fixed: keyboard focus needed to remain visible on the dark dock. A three-pixel blue outline is present and browser-verified.
- P2, fixed: comparison, copy-ID, restore, live status, and in-memory truth were visually dominant or separated from the decisions. They are now subordinate but remain operational and explicit.
- P3 polish: the parallel stage lane may refine internal stage framing without requiring a workbench API change.

## Rendered gate

Chromium production-build checks ran at 390 × 844, 820 × 1180, 1440 × 1000, and 1487 × 1058. All four reported zero horizontal overflow, no application console/page errors, complete non-broken images, visible focus, and active reduced-motion preference. The exercised flows covered A600 horizontal/blue, A600 vertical/charcoal, A450 pending, A800 pending, add current, comparison open/close, exact restore, and Configuration ID copy. Both pending models kept facade controls disabled. Lazy comparison media loaded when opened.

The viewport captures used for inspection were `/tmp/studio-390x844.png`, `/tmp/studio-820x1180.png`, and `/tmp/studio-1440x1000.png`; the committed same-state 1487 × 1058 evidence is the file listed above.

final result: passed
