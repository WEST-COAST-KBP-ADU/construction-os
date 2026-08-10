# Design QA — Studio Hardie Motion

## Visual truth

- Source: the four exact-state A600 new-construction renders in `public/images/adu-600-hardie-*-concept-v1.webp`.
- Implementation capture: `docs/evidence/studio-hardie-motion-preview-20260810.jpg` at 1348 × 926.
- Verified route: the Vercel Preview `/studio` deployment for `agent/studio-hardie-motion-001`.

## Side-by-side review

- The live stage preserves the source A600 geometry, roofline, openings, landscaping, trim, and lighting.
- The 16:9 source is intentionally cropped inside the stage; the facade remains the primary focal point and the controls remain visible without hiding the material change.
- The material label, sample disclaimer, lens detail, replay control, and 1.1 s resolve are legible over all four states.
- Hardie controls are enabled only when a matched A600 render exists. The 450 and 800 models remain selectable and explain the bounded preview instead of showing a mismatched facade.

## Interaction verification

| Flow | Result |
| --- | --- |
| Plank / Evening Blue | Pass — image and deterministic ID update |
| Panel / Evening Blue | Pass — image and deterministic ID update |
| Panel / Iron Gray | Pass — image and deterministic ID update |
| Plank / Iron Gray | Pass — image and deterministic ID update |
| Replay transition | Pass |
| 450 and 800 model selection | Pass — Hardie controls disabled with visible explanation |
| Add current / compare / close | Pass — three concepts rendered in memory |
| Copy configuration ID | Pass |
| Browser application warnings or errors | Pass — none from the Preview origin |

## Issues and disposition

- Resolved: the previous motion concept referenced PNG files that were not deployed, producing broken-image question marks.
- Resolved: facade and color controls now map to repository-contained WebP assets and visibly change the rendered material.
- Accepted for this bounded release: matched material motion is available on A600 first; A450 and A800 receive dedicated renders in a later pass.

## Decision

Pass. The deployed Preview is visually coherent, uses real repository assets, and the core Studio journey is functional.
