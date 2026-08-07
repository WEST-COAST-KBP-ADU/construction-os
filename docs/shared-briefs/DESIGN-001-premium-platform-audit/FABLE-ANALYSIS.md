# FABLE-ANALYSIS — DESIGN-001 premium platform audit

## 1. Review anchor and method

- **Reviewed product SHA:** `main@65f3acd765d6a5286ec4b161d82cfe91afaad1f5` —
  verified equal to `origin/main` at review time; no drift. Audit branch head
  `ceb46e6f` adds only this brief directory; product bytes identical to `main`.
- **Date:** 2026-08-06 · **Reviewer:** Fable lane, analysis-only.
- **Viewports:** desktop 1440×900, tablet 768×1024, mobile 390×844.
- **Routes traversed (13):** `/`, `/about`, `/adu-builder/sacramento`,
  `/adu-builder/sacramento-county`, `/compare`, `/faq`, `/process`, five
  `/services/*`, `/studio`. The brief lists 12; the sacramento-county route
  exists and was audited as well.
- **Method deviation, disclosed:** the public preview URL is unreachable from
  the audit environment (proxy denies the host). The audit ran against a local
  production build (`next build` + `next start`) at the exact reviewed SHA —
  byte-identical source; deployment-layer behavior (CDN headers, p75 field
  data) is therefore out of scope and marked unknown.
- **Evidence:** 39 route×viewport automated passes (status, H1 count, overflow,
  console/page errors, failed requests, image natural sizes, link inventory,
  word counts), scripted interaction drives (Studio selection/refusal/reload,
  mobile menu, keyboard traversal with computed focus outlines), full-page
  screenshots, token-level contrast computation from `app/globals.css`.

## 2. Executive verdict

The platform is **technically clean and honestly written, but it does not yet
read as a premium product — it reads as a tasteful template.** Zero console
errors, zero broken links, one H1 per route, no overflow at any viewport,
visible focus everywhere: the engineering floor is genuinely good. The
perception gap has three specific, fixable roots, in order of impact:

1. **Typography is system-fallback.** Display headings are literally
   `Georgia, "Times New Roman", serif` (`app/globals.css:633`) and body is
   `"Avenir Next" … Arial` with nothing self-hosted. On most visitors'
   machines the "premium serif" renders as Times/Georgia and body as Arial.
   No amount of palette work survives that.
2. **The green system is structural wallpaper, not brand.** Deep forest
   (`#173c30`) is strong, but the supporting pale greens
   (`#dce8df`, `#ebeee8`, canvas `#f5f4ed`) wash sections into sameness, and
   the gold accent is so rare it reads as an accident. Long white-on-cream
   stretches between two dark bands = "well-built website," which is exactly
   the owner's stated perception.
3. **The flagship is hidden and mute.** `/studio` — the one genuinely
   differentiated asset — is not in the header or footer at all; it is linked
   only from the two jurisdiction pages. And inside it, five of six option
   groups produce **no visual change** (see §8), which is the precise
   mechanism that makes it feel like a decorative mockup.

The owner's four hypotheses: #1 partially confirmed (hero is a credible small
stucco ADU, but staged-dusk occupancy cues read lifestyle/listing, not new
construction); #2 confirmed as stated above; #3 confirmed with the causes
above; #4 confirmed for everything except the archetype switch, which does
work.

## 3. Verified findings, ranked

**P0 — none blocking release of the current demo.** Nothing broken ships today.
The items below block the *premium* objective, not the site.

**P1 (perception-critical):**

| # | Finding | Where | Evidence |
| :- | :-- | :-- | :-- |
| 1.1 | Display font is system Georgia/Times; no self-hosted fonts exist in the repo | `app/globals.css:633`, `:37`; no font assets under `app/fonts` in use | grep + rendered screenshots |
| 1.2 | Studio absent from header and footer navigation; reachable only via 2 jurisdiction pages | `src/lib/siteConfig.ts` nav (5 links); link-graph scan | `/studio` linked from: `/adu-builder/sacramento`, `-county` only |
| 1.3 | Five of six Studio option groups change nothing visually (image swaps only per archetype) | `StudioWorkbench` + one image per `geometry_ref` | image `src` unchanged across exterior/palette/roof/window/interior selections |
| 1.4 | `/faq` orphaned from global nav (one inline link from home only) | link-graph scan | `/faq` linked from: `/` |
| 1.5 | Hero art direction: dusk, patio furniture, interior lamps, tree-dominant crop → occupied-lifestyle read | `/` hero asset | screenshot review §6 |
| 1.6 | Gold accent under-deployed (footer label + Studio selected-states only); fails 4.5:1 on white at small sizes (3.53:1) | tokens `--color-gold` usage | contrast computation |

**P2 (quality/polish):**

| # | Finding | Where | Evidence |
| :- | :-- | :-- | :-- |
| 2.1 | Lazy images render as flat gray voids until scrolled into view — no blur/LQIP placeholder; in any instant capture (and slow connections) `/` shows two empty gray blocks | home "process"/"quality" images, jurisdiction pages | full-page screenshots; naturalWidth 0 pre-scroll, loads after |
| 2.2 | `--color-ink-subtle` on canvas = 3.95:1; on `surface-muted` = 3.72:1 — below AA 4.5:1 for the small caption/supporting text it is used for | tokens | computed ratios |
| 2.3 | Studio refusal copy is one generic sentence repeated under multiple groups ("Some choices are unavailable for this configuration."), while the catalog carries specific `reason` codes | `StudioWorkbench` reason rendering | interaction drive: 450+Comfort, Shed+Tall both disable correctly but show identical generic copy |
| 2.4 | Studio state: no URL/state contract — reload resets to default (verified), nothing shareable; `Copy ID` copies a hash no other surface accepts | Studio | reload drive: hash `D130FDBBD7AE` → `DB62013C355B` |
| 2.5 | Service cards: 24px-class outline icons + ~15 words + underline link, five in a row — the density/visual weight of a footer, in the middle of the homepage | `/` services band | screenshot |
| 2.6 | Home is 273 words with 3 CTAs, all of which lead to reading, none to the interactive asset | `/` | word counts, link graph |
| 2.7 | Two identical dusk-stucco photos style-match across hero and "solutions" (and Studio hero) — one art-direction note repeated, weakening each | `/`, `/studio` | screenshots |

**Technically correct but visually weak:** the whole `/compare` and `/process`
band structure (correct information, uniform table/cards, no moment of
distinction); mono-font hash/status lines in Studio (right instinct — reads
"instrument panel" — but unstyled).

## 4. Route-by-route matrix

| Route | Purpose answered? | Words | Severity | Action |
| :-- | :-- | --: | :-- | :-- |
| `/` | Brand promise; weak funnel to Studio | 273 | P1 | Rebalance hero art + route one primary CTA to Studio; rebuild services band (§10 S3, S6, S7) |
| `/about` | Honest "pending" posture | 441 | P2 | Fine for demo; needs business-facts package later (owner input) |
| `/adu-builder/sacramento` | Strong, sourced, differentiated | 614 | OK | Keep; add Studio cross-link prominence |
| `/adu-builder/sacramento-county` | Strong, sourced | 624 | P2 | Reachable only via city page — add to a "Coverage" footer group |
| `/compare` | Correct table, flat presentation | 439 | P2 | Typographic/format pass only (S7) |
| `/faq` | Best content density on the site | 884 | P1 | Add to global nav (S4) |
| `/process` | Clear steps | 494 | P2 | Format pass (S7) |
| `/services/*` ×5 | Consistent, sourced, slightly samey | 544–604 | P2 | Shared-template polish only (S7) |
| `/studio` | Works, deterministic, mute and hidden | 73 (text) | P1 | §8 target contract (S5, S6) |

No route is missing a purpose; no route makes a factual overreach — every
regulatory-flavored line carries the verification wording, and the demo
posture (no contact) is uniformly held.

## 5. Interaction / control matrix

| Control | Result |
| :-- | :-- |
| Header nav (5 links, all routes) | PASS — correct destinations, 3 viewports |
| Mobile menu (`<details>/<summary>`, no-JS) | PASS — opens, 11 visible links, correct targets |
| Footer nav | PASS |
| Home CTAs (hero ×2, process, quality) | PASS — resolve correctly |
| Service "Learn more" ×5 | PASS |
| Jurisdiction cross-links + Studio links | PASS |
| FAQ accordions | PASS (open/close verified in traversal) |
| Studio: archetype ×3 | PASS — image + hash + spec line update (`B62013C355B0 → 66FA6518F3D6 → 130FDBBD7AE4` for 600→450→800) |
| Studio: exterior/palette/roof/windows/interior | FUNCTIONAL PASS, VISUAL FAIL — state + hash update; imagery does not respond (finding 1.3) |
| Studio: deny-rules (450+Comfort; Shed+Tall) | PASS mechanically — options disable, hash stable; copy generic (2.3) |
| Studio: `Add current` / concept cards | PASS — adds up to 3, cards select |
| Studio: `Compare concepts` button | **UNKNOWN** — outcome not conclusively exercised; validate at implementation time |
| Studio: `Copy ID` | PASS (clipboard write) — but ID is accepted nowhere (2.4) |
| Keyboard traversal + visible focus | PASS — computed outline present on every stop sampled (15-stop walk) |
| Reload/back-forward state | FAIL by design — full reset, no URL state (2.4) |
| Console/pageerror/failed requests | 0 / 0 / 0 across 39 passes |
| Horizontal overflow | none at any viewport |
| Broken assets | none (gray voids are lazy-loading, not 404s — 2.1) |

## 6. Homepage hero — replacement image brief (implementation-ready)

**Subject:** one newly completed detached ADU, 400–800 sq ft class, in a real
Sacramento-pattern backyard — the same attainable class the catalog sells.
Uniform light stucco or the catalog's lap-siding option, simple gable or shed
roof, dark window frames.

**Mandatory new-construction cues (at least three visible):** crisp unweathered
stucco corners and roof edges; fresh flatwork with visible joints; new fence or
raw-cedar fence line; immature drought-tolerant planting (young lavender/salvia,
gravel mulch) rather than mature landscaping; clean meter/utility penetration;
no patina, no moss, no sagging gutters.

**Composition:** three-quarter front angle (not elevation-flat, not lifestyle
close-up); camera at ~1.6 m, level horizon; the building occupies 55–70% of
frame width; sky and yard breathing room top/left for the H1; primary entry and
at least two window openings visible.

**Light/season:** morning or mid-afternoon clear California light, shadows
crisp but not harsh; dry season. **Not dusk.** Dusk + lit interiors + patio
furniture is the current image's core problem — it reads occupied real-estate
listing.

**Occupancy:** none. No furniture on the patio, no people, no interior lamps
on, no personal objects. New-handover state; at most a single staged planter.

**Must be absent:** pools, stone cladding, luxury-compound cues, mature estate
landscaping, HDR sky, visible neighboring second stories dominating the roof
line, anything implying a completed West Coast KBP project (the conceptual
caption stays).

**Art direction, desktop vs mobile:** compose for a 2.4:1 desktop crop with
the subject weighted right (text sits left on canvas), and verify a 4:5 mobile
crop that keeps entry + one window + roof line; supply both crops rather than
center-cropping one master.

**Treatment:** one still image. No pairing, no carousel, no motion. The premium
signal at this stage is restraint plus correctness of the subject.

**Headline relationship:** keep "Room to live better." — it is good — but move
the H1 block onto the canvas field (left), off the photograph, eliminating the
white-on-photo legibility compromise and letting the image be lighter.

## 7. Premium visual direction — token-level

**Palette. Diagnosis first:** the failure is not forest green — it is that the
*supporting* system is three near-identical pale green-grays
(`#f5f4ed / #ebeee8 / #dce8df`) doing all the work between two dark bands, plus
an accent too scarce and too low-contrast to register. Recommended direction —
evolution, not rebrand:

| Token | Now | Recommend | Why |
| :-- | :-- | :-- | :-- |
| `--color-canvas` | `#f5f4ed` | `#f7f5f0` (warm limestone, less green) | kills the "pale green wash" at the root; photography warms up |
| `--color-surface-muted` | `#ebeee8` | `#efece4` warm sand | separates from canvas by temperature, not by another green |
| `--color-forest-soft` | `#dce8df` | reserve **only** for data/status chips, never section backgrounds | pale green becomes a signal, not wallpaper |
| `--color-forest` / `-deep` | keep | keep — this *is* the brand | verified 9.65:1 and 14.72:1 pairs are excellent |
| `--color-ink` | `#173128` (green-cast) | `#141b18` near-black | headings gain authority; green stays in surfaces, not text |
| `--color-ink-subtle` | `#6c7d74` | darken to ≥ `#5c6d64` and restrict to ≥16px | fixes the 3.95:1 AA miss (2.2) |
| `--color-gold` | `#b67d29`, rare | keep hue; deploy systematically: eyebrow labels, selected states, rules under H2s, Studio instrument accents; never body text on white below 18px | the accent must recur to be a system; 3.53:1 limits it to large/bold or on-dark |
| new `--color-terracotta` (optional) | — | `#a4562f` class, imagery-echo accent for one band per page | breaks the two-color monotony without luxury tropes |

**Typography — the highest-leverage single change on the platform:**

- **Display serif, self-hosted:** an editorial high-contrast serif in the
  Tiempos/Freight class; open-source concrete option that fits the character:
  **Source Serif 4** (headings 600–700, tight leading `--line-height-tight`),
  self-hosted via `next/font/local` or `next/font` — assets in-repo, no
  third-party origin (keeps the zero-egress rule).
- **Body/UI sans, self-hosted:** **Inter** (400/500/600) replacing the
  unhosted Avenir stack; tabular numerals ON for Studio spec/hash lines.
- Keep the existing scale tokens; add `letter-spacing: -0.01em` to display
  sizes ≥ 40px; keep mono for hashes/IDs — it is already the right instinct.
- Georgia/Times disappears from the platform entirely.

**Imagery direction:** one photographic grammar — daylight, unoccupied,
new-handover, consistent warm-neutral grade — across hero, solutions, services,
and Studio archetypes. Retire the second dusk photo (2.7). Every content image
gets a blur placeholder (2.1).

**Motion:** none added. Restraint is currently a strength; the only motion
worth having is 150–200ms ease on Studio selection states, which exists.

This direction communicates engineering competence and Northern-California
residential honesty; it deliberately avoids generic luxury tropes (no black-
and-gold, no marble, no full-bleed serif manifestos).

## 8. Concept Studio — audit and target contract

**Real today (verified):** deterministic config engine with stable replay hash
surfaced in UI and mono status line; three archetypes with per-archetype
imagery; two deny-rules that genuinely disable options; compare tray (≤3) with
thumbnails; Copy ID; honest "synthetic sample property / no address collected"
framing; keyboard-operable with visible focus; zero errors.

**Simulated/absent:** any visual response to exterior, palette, roof, windows,
interior (five of six groups — finding 1.3); dimensions beyond a sq-ft label;
bed/bath beyond archetype subtitle; floor-plan or footprint diagram; URL/state
persistence and shareability; per-reason refusal copy; any next step (zero
links in Studio main — a dead end by design, but a dead end).

**Must never be implied before backend support:** price, availability,
buildability on a real lot, lead capture, "save your design" accounts, or that
a configuration is an orderable product.

**Target-state contract (v1.1, still fully static and deterministic):**

1. **Visual correspondence, 2D-first (per REVIEW-0001 §3.3 — no 3D/WebGL):**
   per-archetype layered stills — base plate + exterior-finish variant ×3 +
   palette tint ×5 + roof variant ×2 as pre-rendered composites resolved by the
   existing fail-closed asset manifest (`geometry_ref + selections → asset
   key`). Catalog gains `asset_matrix` per archetype; unknown combination =
   refusal, never fallback. Asset count is bounded (3×3×5×2 composites can
   collapse to ~12 per archetype by tinting palette in-image at production
   time, not runtime).
2. **Spec panel:** dimensions (W×D), area, bed/bath, ceiling class per
   archetype from catalog data — factual, no price, each line sourced from the
   versioned catalog release.
3. **Refusal copy:** render the catalog `reason` per disabled option
   ("Comfort interior needs the 600+ footprint"), one line, next to the
   disabled control — the codes already exist.
4. **URL/state contract:** `?c=<config_hash>` resolvable — hash → selections
   lookup is already deterministic; reload/back/forward/share restore state.
   `Copy ID` copies the URL, closing 2.4.
5. **Next step without contact:** a single closing block linking to
   `/adu-builder/sacramento` ("check how review works in your jurisdiction")
   and `/faq` — no form, no capture, posture intact.
6. **Placement:** Studio enters header nav (S4) and receives the homepage
   primary CTA (S3). The flagship stops being hidden.

## 9. Accessibility, responsive, performance, technical

- **Passing now:** 1 H1/route ×13; visible focus (15-stop keyboard walk, all
  outlined); no-JS mobile menu; `role="note"` dev notice; no overflow at 390 /
  768 / 1440; alt present on all rendered images; 0 console errors; 0 failed
  requests; robots/sitemap/JSON-LD present on content routes.
- **Findings:** ink-subtle contrast (2.2); gold-on-white small text (1.6);
  lazy-image gray voids = perceived jank on slow connections (2.1 — fix with
  `placeholder="blur"` + explicit dimensions; hero must also be
  `priority`/eager); Studio images lack width/height-driven aspect boxes in the
  compare tray (minor CLS risk — validate at implementation).
- **Performance:** local static prerender for all 13 routes (SSG/Static in
  build output). Deployed p75 CWV remain **NOT VERIFIED** — blocked on P0
  domain custody; nothing here claims field performance.

## 10. Implementation sequence — bounded slices

| Slice | Objective | Owned surface | Acceptance evidence | Prereq |
| :-- | :-- | :-- | :-- | :-- |
| S1 | Self-hosted typography (Source Serif 4 display, Inter body/UI), Georgia stack removed | `app/fonts/*`, `app/globals.css` tokens, `app/layout.tsx` | zero third-party font origins; screenshots ×3 viewports; no FOIT (font-display: swap); full suite green | none |
| S2 | Palette rebalance per §7 (canvas/surface/ink/subtle/gold deployment rules; forest-soft demoted to chips) | `app/globals.css` tokens only | token diff table in PR; contrast table all-AA for text uses; before/after screenshots | S1 |
| S3 | Hero replacement + H1 onto canvas field + primary CTA → `/studio` | `/` hero component, `src/lib/siteConfig.ts` hero copy, asset | image per §6 brief (owner selects candidate first); mobile 4:5 crop verified; caption retained | owner-approved asset |
| S4 | IA repair: Studio + FAQ into header/footer; county page into footer "Coverage"; no other nav change | `src/lib/siteConfig.ts` nav/footer | link-graph scan shows no orphan routes; mobile menu unchanged mechanics | none |
| S5 | Image pipeline: blur placeholders + explicit dimensions + hero priority | image components/config, assets | no gray voids in instant full-page capture; CLS check on compare tray | none |
| S6 | Studio v1.1 per §8 items 1–5 (asset matrix, spec panel, refusal copy, URL state, next-step block) | Studio components, catalog release `2026.09.x`, asset manifest, tests | replay test extended to URL-state; refusal copy per reason; unknown combo refuses; screenshots of 3 finishes × 1 archetype | S1–S2; asset production; **split into 3 sub-orders at implementation** (assets / state-URL / spec+copy) |
| S7 | Editorial polish pass: services band rebuild (larger media or numbered list — kill the five-icon footer row), compare/process format pass | route components, tokens consumed only | before/after ×3 viewports; word counts unchanged ±10% | S1–S2 |
| S8 | Automated design gates: Playwright visual snapshots + axe pass in CI | test config, CI | axe: 0 serious/critical; snapshot baseline committed | **owner gate — adds dev dependencies**, currently prohibited without approval |

Each slice = one branch, one draft PR, one non-author review, owner merge —
per Operating Model v3. S6 is the largest and must be cut into three orders.

## 11. Non-goals and claims that stay disabled

No contact surface, phone, email, address, license number, form, or capture;
no pricing, cost ranges, ROI, schedule, or availability claims; no "completed
project" representation for any conceptual image; no analytics/pixels; no 3D
dependency; no removal of the Development Preview notice or the conceptual
captions; no marketing/SEO expansion, campaign, or business-workflow
automation; no deployment/DNS/Vercel change. Jurisdiction-page regulatory
wording and their verification lines remain untouched by every slice above.

## 12. Unknowns requiring implementation-time or owner validation

1. `Compare concepts` button outcome (matrix row UNKNOWN) — exercise and spec
   during S6.
2. Owner selection of the hero asset against §6 (candidates produced outside
   this engagement; licensing recorded per catalog discipline).
3. Deployed p75 CWV and real-domain rendering — blocked on P0 domain custody.
4. Whether S8's dev-dependency additions are approved (standing "no new
   dependency" rule requires an explicit owner exception).
5. Font licensing check at S1 if any non-OFL face is preferred over the
   open-source recommendation.
6. Palette tokens in §7 are directional hexes — final values need one round of
   in-context screenshot approval by the owner, not adoption sight-unseen.
7. Catalog `asset_matrix` production cost (≈12 composites/archetype ×3) —
   confirm against asset budget before S6 is ordered.
