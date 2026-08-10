# Design QA — Studio Exterior Concept Motion Remediation

## Visual truth

- Source: four repository-controlled, exact-state A600 new-construction concept renders. Their existing provenance record remains authoritative; no generated WebP bytes changed in this remediation.
- Implementation capture: `docs/evidence/studio-hardie-motion-preview-20260810.jpg` at 1440 × 1200.
- Verification target: the exact-head Vercel Preview for the existing `agent/studio-hardie-motion-001` branch and Draft PR #146. The deployment ID, URL, and commit are recorded in Issue #149's `REMEDIATION_RESULT`.

## Remediation review

- B-1: public controls, stage copy, selection summaries, and configuration-facing labels use `Horizontal lap concept`, `Vertical panel concept`, `Blue concept`, and `Charcoal concept`. The conceptual-render, physical-sample, and local-availability boundaries remain visible.
- B-2: a model selection remounts the stage, so A600 media cannot persist or animate underneath A450 or A800.
- B-3: A450 and A800 use a neutral, image-free pending state. Their comparison entries are image-free as well; no unrelated retrofit/addition media is rendered.
- B-4: the unverified circular material lens was removed. The four A600 facade/color states remain visibly distinct through the full-stage render.
- B-5: the main A600 stage and every A600 comparison thumbnail use one deterministic facade/color concept resolver. Comparison cards no longer resolve from archetype geometry; unsupported states and non-A600 models resolve to no image.
- The A600 stage preserves the source geometry, roofline, openings, landscaping, trim, lighting, replay control, and 1.1-second same-model resolve.
- The mobile replay control and conceptual disclaimer remain separated at the narrow verification viewport.

## Interaction verification

| Flow | Result |
| --- | --- |
| Horizontal lap concept / Blue concept | Pass — distinct image and deterministic ID update |
| Horizontal lap concept / Charcoal concept | Pass — distinct image and deterministic ID update |
| Vertical panel concept / Blue concept | Pass — distinct image and deterministic ID update |
| Vertical panel concept / Charcoal concept | Pass — distinct image and deterministic ID update |
| Replay same-model transition | Pass — two-layer resolve starts and settles to one image |
| A600 → A450 | Pass — immediate image-free pending stage; no cross-model transition |
| A600 → A800 | Pass — immediate image-free pending stage; no retrofit/addition image |
| Add current | Pass — the selected A600 facade/color state appears as the corresponding thumbnail |
| Two distinct A600 thumbnails | Pass — different facade/color candidates use different exact-state concept assets |
| Comparison card restore | Pass — selecting an A600 card restores its selections and the same stage asset |
| A450/A800 comparison entries | Pass — unmatched thumbnails remain image-free `Preview pending` |
| Compare / close | Pass — the in-memory comparison opens and closes |
| Copy configuration ID | Pass — browser reports the copy outcome without sending data |
| Desktop 1440 × 1200 | Pass — no horizontal overflow or application warnings/errors |
| iPad 768 × 1024 | Pass — no horizontal overflow or application warnings/errors |
| Mobile 390 × 844 | Pass — no horizontal overflow, overlap, or application warnings/errors |

## Repository verification

- Focused B-1 through B-5 regression coverage: pass (13 tests, including four exact mappings and null behavior).
- Full Vitest suite: pass.
- ESLint: pass.
- TypeScript (`tsc --noEmit`): pass.
- Next.js production build: pass.
- Allowlist and generated WebP byte checks: pass.

## Decision

Pass. The exact-head Preview is visually coherent, keeps the stage and comparison rail bound to the same A600 visual state, fails closed for unmatched models and ineligible material claims, preserves the bounded A600 motion interaction, and leaves PR #146 Draft.
