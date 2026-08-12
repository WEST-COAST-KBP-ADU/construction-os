# Option 2 — premium light, color, and typography recipe

**Packet:** `PREMIUM-LIGHT-COLOR-SYSTEM-001` · Issue #229 · Record chapter
**Base:** `main@bd3f336140a320ea81008cf415a05861fb034de2`
**Status:** isolated precursor. This packet defines the recipe. It integrates
nothing.

Owner selected Option 2: a premium architectural workbench — left editorial
copy, right daylight drafting table, blueprint drawings as the living product
mechanism. This document is the written half of that decision. The mechanical
half is `src/styles/option2-premium.tokens.css`, bound by
`src/styles/option2-premium.contract.ts` and proved by
`src/styles/option2-premium.contract.test.ts`.

Where the two disagree, **the contract wins**. Prose here that no test enforces
is marked as a review rule, not a guarantee.

## What this replaces

The current homepage reads pale, cheap, and flat, and it does so for reasons
that are measurable rather than matters of taste:

| Current | Why it reads cheap | Recipe |
| --- | --- | --- |
| `--color-surface: #FCFBF8` under `--color-ink-muted: #59615D` | near-white ground with mid-gray copy — pale on pale, no material | `paper-base #EBE2D3` under `ink-body #2E463C`, 7.95:1 |
| `--shadow-card: 0 0.75rem 2.5rem rgb(34 38 36 / 0.07)` | one layer, no x offset, no light source, near-black pigment | four-token elevation ladder, multi-layer, offset on one azimuth, warm pigment |
| `--color-gold: #C58A52` | bright orange, used as an accent anywhere | `copper-line #A9682F` for hairlines; only `copper-text #6B3A15` may carry type |
| flat `--color-canvas` behind flat `--color-surface` | nothing sits on anything | sheet at L\* 90.2 on workbench at L\* 73.8 — a 16.4 L\* material step |

## 1. The physical light model

One window, upper-left. Everything else follows from it.

| Property | Value | Token |
| --- | --- | --- |
| Azimuth (screen-space direction light travels) | 135° — upper-left to lower-right | `--o2-light-azimuth` |
| Elevation | 35° | `--o2-light-elevation` |
| White balance | 5200K daylight through glass | `--o2-light-temperature` |
| Cast offset ratio (x:y) | 0.7, tolerance ±0.35 | `--o2-light-offset-ratio` |
| Exposure floor / ceiling | L\* 10 – 97 | `--o2-exposure-shadow-floor` / `-highlight-ceiling` |
| Measured palette range | L\* 10.69 (`ink-primary`) – 96.37 (`surface-raised`) | — |
| Scene dynamic range | 14.23:1 (`paper-lit` to `canvas-deep`) | — |
| Paper roughness | 0.86 (near-fully diffuse) | `--o2-roughness-paper` |
| Graphite roughness | 0.70 | `--o2-roughness-graphite` |
| Copper roughness | 0.34 (the only semi-specular material) | `--o2-roughness-copper` |
| Specular ceiling | 0.12 | `--o2-specular-max` |
| Grain | 0.028 opacity at 1.5px | `--o2-grain-opacity` / `-scale` |
| Veil ceiling | 0.32 | `--o2-veil-opacity-max` |

**Highlight roll-off.** No token reaches white. The brightest surface in the
system is `surface-raised #F9F4EC` at L\* 96.37, and specular highlights
compress into it rather than clipping. Photographic roll-off, not a blown page.

**Shadow density.** No token reaches black. The deepest is `ink-primary
#10201A` at L\* 10.69. Cast shadows use `shadow-cast #2A211A`, a warm pigment,
never neutral black, and no single shadow layer exceeds 30% density.

**White balance.** The illumination family — paper, warm canvas, light
surfaces, and the shadow pigment — is held to R > B channel-wise. The focus ring
and success signal are deliberately exempt: both must sit off the warm axis so
neither can be mistaken for decoration.

**Grain.** Monochrome multiply, amplitude ≤ 4% luminance, 1–2px spatial
frequency, and never applied over text.

## 2. Color

Semantic roles only. Exact sRGB, uppercase six-digit, one value per role.

### Paper — the drafting sheet

| Token | sRGB | L\* | Role |
| --- | --- | --- | --- |
| `--o2-paper-lit` | `#F4EDE1` | 93.99 | daylight-struck sheet |
| `--o2-paper-base` | `#EBE2D3` | 90.21 | sheet mid-tone; the Hero ground |
| `--o2-paper-shade` | `#DFD5C3` | 85.61 | shadow side of the sheet |
| `--o2-paper-edge` | `#D0C2AC` | 79.03 | the sheet's cut edge |

### Canvas — the ground the sheet lies on

| Token | sRGB | L\* | Role |
| --- | --- | --- | --- |
| `--o2-canvas-base` | `#C2B49A` | 73.83 | workbench top |
| `--o2-canvas-deep` | `#16211C` | 11.57 | Record proof ground |
| `--o2-canvas-deep-lit` | `#24322B` | 19.35 | lit face of the Record ground |

### Surface — panels on and in the sheet

| Token | sRGB | L\* | Role |
| --- | --- | --- | --- |
| `--o2-surface-raised` | `#F9F4EC` | 96.37 | panel above the sheet |
| `--o2-surface-recessed` | `#E5DBC9` | 87.75 | trough cut into the sheet |
| `--o2-surface-inverse` | `#1B2822` | 14.77 | inverse panel |

### Forest ink — editorial typography

| Token | sRGB | L\* | Role |
| --- | --- | --- | --- |
| `--o2-ink-primary` | `#10201A` | 10.69 | display and headline |
| `--o2-ink-secondary` | `#23382F` | 21.55 | strong body, button labels |
| `--o2-ink-body` | `#2E463C` | 27.54 | lede and running copy |
| `--o2-ink-muted` | `#4A5C53` | 37.36 | supporting copy |
| `--o2-ink-inverse` | `#F4EEE3` | 94.28 | copy on the Record ground |
| `--o2-ink-inverse-muted` | `#C3CFC6` | 82.00 | supporting copy, inverse |

Green-dominant across the whole ramp (G > R, G ≥ B), so body copy never drifts
to neutral gray under any exposure.

### Graphite — blueprint lines and annotation

| Token | sRGB | L\* | Role |
| --- | --- | --- | --- |
| `--o2-graphite-primary` | `#33403C` | 25.85 | section cut, primary wall |
| `--o2-graphite-secondary` | `#566761` | 42.06 | partitions, dimension strings |
| `--o2-graphite-tertiary` | `#74847E` | 53.73 | construction and setback lines |
| `--o2-graphite-annotation` | `#3B4A45` | 30.05 | mono annotation type |

Held to ≤ 24 channel spread. Drawing hierarchy is carried by **line weight**,
not by hue: `hairline 0.5px · thin 1px · medium 1.5px · heavy 2px · section 3px`.

### Copper — oxidized, restrained

| Token | sRGB | L\* | Role |
| --- | --- | --- | --- |
| `--o2-copper-text` | `#6B3A15` | 29.93 | **the only copper cleared for type** |
| `--o2-copper-mark` | `#8A4F22` | 39.77 | markers, underlines |
| `--o2-copper-line` | `#A9682F` | 50.15 | hairlines and rules |
| `--o2-copper-wash` | `#EDD9BF` | 87.68 | tint behind a copper label |

Strict R > G > B. Copper is an accent of hairlines and small marks — it is never
a fill, never a gradient, and never running text.

### Lines, focus, and signal

| Token | sRGB | Role | Contrast duty |
| --- | --- | --- | --- |
| `--o2-line-grid` | `#D3C7B2` | blueprint grid ruling | decorative, exempt |
| `--o2-line-hairline` | `#C7B9A3` | sheet ruling | decorative, exempt |
| `--o2-line-standard` | `#82735B` | boundaries | ≥ 3:1 on every paper and surface step |
| `--o2-line-strong` | `#63594A` | dividers, button borders | ≥ 3:1 |
| `--o2-focus-ring` | `#0E5C6E` | focus on light grounds | ≥ 3:1 |
| `--o2-focus-ring-inverse` | `#6FD3E4` | focus on the Record ground | ≥ 3:1 |
| `--o2-focus-halo` | `#F8F2E8` | inner halo | — |
| `--o2-signal-success` | `#1B6B49` | verified status | ≥ 4.5:1 as text |
| `--o2-signal-success-wash` | `#DCE9DE` | status fill | — |
| `--o2-signal-success-inverse` | `#7FD8A6` | verified status, inverse | ≥ 4.5:1 as text |

Focus is `2px` at `2px` offset, on both grounds. One ring per ground is
required: a single color cannot clear 3:1 against both paper and the Record
ground.

### Material separation

Two adjacent physical surfaces are told apart by lightness step and contact
shadow, not by a 3:1 ratio. These are enforced in CIE L\*:

| Plane | Step | Required |
| --- | --- | --- |
| sheet on workbench | 16.38 L\* | ≥ 6 |
| sheet cut edge on workbench | 5.19 L\* | ≥ 3 |
| lit to shaded across one sheet | 8.37 L\* | ≥ 5 |
| panel above sheet | 6.16 L\* | ≥ 3 |
| trough cut into sheet | 2.46 L\* | ≥ 1.5 |

## 3. Hero contrast matrix

Every text and meaningful non-text pair the Hero puts on screen, including the
control panel it renders and the drawing layer. Ratios are WCAG 2.1, computed
from the stylesheet's own values at test time — not transcribed.

Thresholds are **derived, not asserted**: each text pair's requirement comes
from its type role resolved at all three viewports, and a role that is large
type on desktop but normal type on mobile is held to the stricter threshold.

| Pair | Foreground | Background | Ratio | Req | Basis | |
| --- | --- | --- | --- | --- | --- | --- |
| `hero.eyebrow` | `copper-text` #6B3A15 | `paper-base` #EBE2D3 | **7.30** | 4.5 | label bold, 12px at desktop | PASS |
| `hero.title` | `ink-primary` #10201A | `paper-base` #EBE2D3 | **13.15** | 3.0 | display bold, 40px at mobile | PASS |
| `hero.lede` | `ink-body` #2E463C | `paper-base` #EBE2D3 | **7.95** | 4.5 | lede regular, 17px at mobile | PASS |
| `hero.highlight` | `ink-muted` #4A5C53 | `paper-base` #EBE2D3 | **5.55** | 4.5 | bodySm regular, 15px | PASS |
| `hero.badge.label` | `copper-text` #6B3A15 | `copper-wash` #EDD9BF | **6.82** | 4.5 | label bold, 12px | PASS |
| `hero.cta.primary.label` | `ink-inverse` #F4EEE3 | `canvas-deep` #16211C | **14.34** | 4.5 | bodySm bold, 15px | PASS |
| `hero.cta.secondary.label` | `ink-secondary` #23382F | `surface-raised` #F9F4EC | **11.43** | 4.5 | bodySm bold, 15px | PASS |
| `hero.panel.label` | `graphite-annotation` #3B4A45 | `paper-lit` #F4EDE1 | **8.02** | 4.5 | label bold, 12px | PASS |
| `hero.panel.title` | `ink-primary` #10201A | `surface-raised` #F9F4EC | **15.42** | 3.0 | title bold, 22px at mobile | PASS |
| `hero.panel.item.label` | `ink-secondary` #23382F | `surface-recessed` #E5DBC9 | **9.12** | 4.5 | bodySm bold, 15px | PASS |
| `hero.panel.item.detail` | `ink-muted` #4A5C53 | `surface-recessed` #E5DBC9 | **5.19** | 4.5 | bodySm regular, 15px | PASS |
| `hero.panel.status.ready` | `signal-success` #1B6B49 | `signal-success-wash` #DCE9DE | **5.16** | 4.5 | label bold, 12px | PASS |
| `hero.panel.notice` | `copper-text` #6B3A15 | `copper-wash` #EDD9BF | **6.82** | 4.5 | bodySm regular, 15px | PASS |
| `hero.drawing.annotation` | `graphite-annotation` #3B4A45 | `paper-shade` #DFD5C3 | **6.42** | 4.5 | annotation regular, 13px | PASS |
| `hero.drawing.dimension` | `graphite-secondary` #566761 | `paper-lit` #F4EDE1 | **5.14** | 4.5 | annotation regular, 13px | PASS |
| `hero.record.body` | `ink-inverse-muted` #C3CFC6 | `canvas-deep` #16211C | **10.30** | 4.5 | body regular, 16px at mobile | PASS |
| `hero.record.signal` | `signal-success-inverse` #7FD8A6 | `canvas-deep` #16211C | **9.68** | 4.5 | label bold, 12px | PASS |
| `hero.rule.standard` | `line-standard` #82735B | `paper-base` #EBE2D3 | **3.59** | 3.0 | section boundary | PASS |
| `hero.rule.standard.onPanel` | `line-standard` #82735B | `surface-recessed` #E5DBC9 | **3.36** | 3.0 | panel boundary | PASS |
| `hero.rule.standard.onShade` | `line-standard` #82735B | `paper-shade` #DFD5C3 | **3.17** | 3.0 | boundary on shaded sheet | PASS |
| `hero.rule.strong` | `line-strong` #63594A | `paper-base` #EBE2D3 | **5.35** | 3.0 | divider | PASS |
| `hero.copper.hairline` | `copper-line` #A9682F | `paper-base` #EBE2D3 | **3.47** | 3.0 | accent hairline | PASS |
| `hero.copper.mark` | `copper-mark` #8A4F22 | `paper-base` #EBE2D3 | **5.07** | 3.0 | marker and underline | PASS |
| `hero.badge.border` | `copper-line` #A9682F | `copper-wash` #EDD9BF | **3.25** | 3.0 | badge boundary | PASS |
| `hero.drawing.line.primary` | `graphite-primary` #33403C | `paper-lit` #F4EDE1 | **9.31** | 3.0 | primary drawing line | PASS |
| `hero.drawing.line.secondary` | `graphite-secondary` #566761 | `paper-lit` #F4EDE1 | **5.14** | 3.0 | secondary drawing line | PASS |
| `hero.drawing.line.construction` | `graphite-tertiary` #74847E | `paper-lit` #F4EDE1 | **3.38** | 3.0 | construction line | PASS |
| `hero.cta.secondary.border` | `line-strong` #63594A | `surface-raised` #F9F4EC | **6.27** | 3.0 | button boundary | PASS |
| `hero.focus.ring` | `focus-ring` #0E5C6E | `paper-base` #EBE2D3 | **5.89** | 3.0 | focus on paper | PASS |
| `hero.focus.ring.onRaised` | `focus-ring` #0E5C6E | `surface-raised` #F9F4EC | **6.91** | 3.0 | focus on a panel | PASS |
| `hero.focus.ring.inverse` | `focus-ring-inverse` #6FD3E4 | `canvas-deep` #16211C | **9.55** | 3.0 | focus on Record ground | PASS |

Two pairs are **declared decorative** and exempt from 1.4.11 by intent, because
they carry no information: `line-grid` and `line-hairline` on paper. They are
listed in the contract as `DECORATIVE_PAIRS` — an exemption a reviewer cannot
see is an exemption nobody agreed to.

## 4. Typography

No font is added. The repository already loads **Source Serif 4** and **Inter**
through `next/font` in `app/layout.tsx`; the annotation face is the system mono
stack. The token stacks resolve through `var(--font-source-serif)` and
`var(--font-inter)` with in-`var()` fallbacks, so the file stays correct when
cherry-picked into a subtree that has not declared those variables.

| Role | Family | 1440 | 820 | 390 | Weight | Leading |
| --- | --- | --- | --- | --- | --- | --- |
| `display` | editorial | 76.00 px | 54.74 px | 40.00 px | 700 | 1.04 |
| `headline` | editorial | 46.68 px | 35.65 px | 28.01 px | 700 | 1.12 |
| `title` | editorial | 29.69 px | 25.15 px | 22.00 px | 700 | 1.20 |
| `lede` | interface | 20.85 px | 18.58 px | 17.00 px | 400 | 1.55 |
| `body` | interface | 17.92 px | 16.78 px | 16.00 px | 400 | 1.65 |
| `bodySm` | interface | 15.00 px | 15.00 px | 15.00 px | 400 | 1.65 |
| `label` | interface | 12.00 px | 12.00 px | 12.00 px | 700 | 1.40 |
| `annotation` | annotation (mono) | 13.00 px | 13.00 px | 13.00 px | 400 | 1.40 |

- **Editorial** (Source Serif 4) carries display, headline, and title. This is
  what makes the page read as an architectural document rather than a SaaS
  landing page.
- **Interface** (Inter) carries lede, body, labels, and controls.
- **Annotation** (mono) is reserved for values the product actually holds —
  dimensions, identifiers, revisions, timestamps.

Tracking tightens as type grows (`-0.022em` display → `0em` body) and opens for
uppercase labels (`0.14em`). Measure is capped at `16ch` display, `34ch` lede,
`62ch` body.

Floors hold at every viewport: body ≥ 16px, label ≥ 12px, annotation ≥ 12px, and
the scale may never grow as the viewport narrows.

### Responsive spacing

| Token | 1440 | 820 | 390 |
| --- | --- | --- | --- |
| `--o2-space-hero-block` | 115.88 px | 80.45 px | 56.00 px |
| `--o2-gutter` | 45.81 px | 30.58 px | 20.01 px |
| `--o2-column-gap` | 80.00 px | 53.09 px | 32.00 px |

Shell caps at `82.5rem` (1320px). The blueprint grid module is `2.75rem`.

The Hero is a two-column split above 900px — editorial copy left, drafting table
right — and a single column below it, copy first. The drawing plate is
`16/10` on desktop and `4/3` on tablet and mobile; it **bleeds off its column**
rather than floating as a card.

## 5. Elevation

Four heights, one light. Every elevation is multi-layer, offset down and to the
right at the modelled x:y ratio, cast in `shadow-cast #2A211A`, and capped at
30% per layer.

| Token | Use | First layer (x, y) | Ratio |
| --- | --- | --- | --- |
| `--o2-shadow-contact` | a mark touching the sheet | 1px, 2px | 0.50 |
| `--o2-shadow-sheet` | the sheet on the workbench | 2px, 3px | 0.67 |
| `--o2-shadow-panel` | a panel on the sheet | 3px, 5px | 0.60 |
| `--o2-shadow-lifted` | the drafting plate | 4px, 7px | 0.57 |
| `--o2-shadow-trough` | inset, a cut into the sheet | inset 2px, 3px | 0.67 |

**Washes are material; veils are scrims.** `--o2-wash-daylight` is the sheet's
own exposure falloff along the light azimuth and is fully opaque.
`--o2-veil-plate-edge` is the only scrim, capped at 32%, so a drawing stays
readable through it.

**Blur is bounded.** `veil 2px`, `edge 4px`, ceiling `6px`. There is no glass:
no `backdrop-filter` token exists, and the contract fails if one appears.

## 6. Motion

Shared verbatim with Workers 227 and 228 so the Hero, the drawing stage, and the
Record rail move as one system.

| Token | Default | Reduced motion |
| --- | --- | --- |
| `--o2-duration-instant` | 90ms | 1ms |
| `--o2-duration-fast` | 160ms | 1ms |
| `--o2-duration-standard` | 240ms | 1ms |
| `--o2-duration-deliberate` | 420ms | 1ms |
| `--o2-motion-daylight-sweep` | 1400ms | 1ms |
| `--o2-easing-standard` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | `linear` |
| `--o2-easing-entrance` | `cubic-bezier(0.16, 1, 0.3, 1)` | `linear` |
| `--o2-easing-exit` | `cubic-bezier(0.4, 0, 1, 1)` | `linear` |
| `--o2-motion-lift` | -2px | 0px |
| `--o2-motion-reveal-shift` | 12px | 0px |
| `--o2-motion-parallax-depth` | 8px | 0px |
| `--o2-motion-reveal-fade` | 1 | 1 |

**Hierarchy.** Deliberate is reserved for the daylight sweep and the drawing
reveal — the two moments that are the product. Standard covers panel and plate
transitions, fast covers hover and focus, instant covers state flips.

**Substitution.** Under `prefers-reduced-motion: reduce`, every distance
collapses to zero and every duration to 1ms, which leaves `motion-reveal-fade`
as the only surviving channel: a lift-and-settle becomes a plain cross-fade.
1ms rather than 0ms keeps `transitionend` firing, so a consumer that sequences
on it still completes. The contract fails if any motion token lacks a
substitution, or if a substitution still moves.

## 7. Anti-patterns

Nine are mechanical — the suite fails on them. Two are the reviewer's. The
boundary is declared rather than implied.

| Anti-pattern | Rule | Enforcement |
| --- | --- | --- |
| pale-on-pale | no intended text pair below AA; sheet ≥ 6 L\* above workbench | mechanical |
| square photo card | no plate aspect at or near 1:1; plate bleeds, never floats | mechanical |
| cheap drop shadow | multi-layer, on-azimuth, density-capped, warm pigment | mechanical |
| glass | no `backdrop-filter` token | mechanical |
| excessive blur | no blur above the ceiling | mechanical |
| obscuring gradient | washes opaque; veils capped at 32% | mechanical |
| orange body text | only `copper-text`, only at label and small-body roles | mechanical |
| raw color | a color literal only as the whole value of a registered color token | mechanical |
| new font dependency | stacks resolve only to families the repo already loads | mechanical |
| fake technical microcopy | mono annotation only for values the product holds | **review** |
| decorative drawing | the blueprint is the mechanism, not an illustration behind it | **review** |

## 8. How the contract binds

`option2-premium.contract.ts` holds rules; the CSS holds values. The TS restates
no color, size, or duration — every validator is fed the parsed stylesheet, so a
value cannot drift from the rule that governs it.

The suite is 91 tests. Sixty-five prove the committed file satisfies each rule;
**26 are mutation tests** that break the stylesheet in a specific way and assert
the contract rejects it. A contract that only ever sees a passing file proves
nothing, so each named failure condition has a test that goes red when the rule
is weakened:

- a text pair pushed below AA, and a non-text pair below 3:1
- a raw hex, a raw color function, and a named CSS color smuggled in as a keyword
- a color token written in a non-exact form, and an unregistered token
- a missing motion token, a missing reduced-motion substitution, and a
  substitution that still moves
- a single-layer shadow, one that contradicts the light, and one past the density cap
- blur past the ceiling, a veil that would obscure the drawing, a square plate
- a new font, unwarm paper, hued graphite, non-copper copper
- a blown highlight, a crushed shadow, a sheet that stops lifting off the workbench
- two tokens sharing a value, body type under the floor, a scale that inverts
- tokens leaking onto `:root`, and a glass effect

## 9. Adoption

The stylesheet is inert. Nothing imports it, and it writes to
`[data-o2-premium]` rather than `:root`, so cherry-picking it changes no
rendered byte. A later integration packet opts a subtree in:

```html
<body data-o2-premium>
```

That integration is **not** this packet. Out of scope here and deliberately
untouched: `app/globals.css`, `app/page.tsx`, every component, every image,
`package.json`, and any deployment configuration.

### Open items for the integration node

- The Hero component and `globals.css` still consume the old `--color-*` tokens.
  Mapping the two systems, or replacing one, is integration work.
- `--o2-grain-opacity` and `--o2-grain-scale` declare the grain envelope but no
  grain texture exists yet; producing one is a separate packet.
- The recipe assumes the drawing layer is real product geometry. Sourcing it is
  Workers 227/228 territory, not this packet's.
