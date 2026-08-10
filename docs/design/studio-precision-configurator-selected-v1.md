# Studio Precision Configurator — selected visual target v1

## Decision

Owner selected displayed direction 1 on 2026-08-10.

This reference defines the composition for the next Concept Studio visual wave:
a full-stage precision configurator with the matched house render as the dominant object,
a compact title/meta overlay, and one dark lower control dock.

Reference image: `studio-precision-configurator-selected-v1.jpg`

- Source resolution: 1487 × 1058
- Repository review derivative: 1200 × 854 JPEG
- Review derivative SHA-256: `c854b5a2ee0ba29288688e43cf37198ba11afcc150bf23a83714c9590ca9d661`

## Visual contract

- Studio-only shell: graphite `#1D2225`
- Dock/deep surface: `#121619`
- Primary text: `#E5E6E6`
- Muted text: `#9EA0A1`
- Strong boundary: `#5F656A`
- Selected/focus signal: `#5D8BF4`
- Live/status signal only: `#37D880`
- No pale warm canvas, bronze decoration, pastel blocks, orange controls, gradients used as decoration, generic SaaS cards, or large colored fills inside Studio.
- Source Serif 4 remains the editorial title face. Inter remains the UI face.
- Preserve the existing global Header and route destinations in this Studio-first wave.

## Composition contract

Desktop:
- begin the Studio stage immediately below the global header;
- target stage height `calc(100svh - header)`, with the matched render filling the stage;
- title at upper left and current model/render status at upper right;
- one lower dock containing model, facade, color, fixed trim information, and compare;
- no separate right-side configurator panel;
- secondary status/configuration ID stays accessible without becoming the dominant visual block.

Tablet/mobile:
- preserve the same decision order and visual hierarchy;
- never let the dock obscure the house or truth caption;
- recompose the dock below the image when required;
- no horizontal page overflow, clipped controls, or hidden state;
- all enabled controls remain keyboard/touch operable.

## Product-truth overrides

The reference image contains illustrative manufacturer/product labels. They are not approved public claims.

Implementation must retain generic public labels:
- `Horizontal lap concept`
- `Vertical panel concept`
- `Blue concept`
- `Charcoal concept`
- `White trim concept — fixed in this preview`

Do not publish James Hardie product/family/color names, endorsement, availability, exact texture, or physical-sample equivalence until a later evidence-bound eligibility decision.

A450 and A800 remain image-free fail-closed states until exact matched renders exist.
The fixed white trim display is informational, not an interactive selection and not part of the configuration hash in this wave.
The existing A600 resolver remains the single source for stage and comparison media.

## Asset rule

Any dock swatch must be a dedicated repository-controlled raster crop derived reproducibly from the existing matched A600 conceptual renders. Do not use CSS color blocks, remote/manufacturer media, random web imagery, or uncropped full-scene thumbnails as texture substitutes. Record source asset, crop box, dimensions, command, output SHA-256, and conceptual-use boundary.

## Release rule

This reference is design input only. Workers remain pinned to the exact production base named in their Issues.
Preview is engineering evidence only. Tony alone approves and merges. The combined wave must reach one READY production deployment and then pass the whole-site gate in Issue #151.
