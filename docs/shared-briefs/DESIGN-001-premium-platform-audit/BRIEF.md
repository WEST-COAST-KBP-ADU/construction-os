# DESIGN-001 — Premium platform design and technical-quality audit

Status: **OPEN — awaiting Fable 5 analysis**

## Authority and bounded objective

Tony has restricted the active workstream to one objective only: bring the
published West Coast KBP ADU platform to a premium, coherent, technically
complete design state.

This engagement is analysis only. Inspect the current product and write the
requested analysis artifact. Do not change application code, assets, deployment,
configuration, governance records, or external services.

## Exact source state

- Repository: `WEST-COAST-KBP-ADU/construction-os`
- Review base: `main@65f3acd765d6a5286ec4b161d82cfe91afaad1f5`
- Published preview: `https://west-coast-kbp-platform-preview.vercel.app/`
- Concept Studio: `https://west-coast-kbp-platform-preview.vercel.app/studio`
- Current public surface: 12 routes:
  - `/`
  - `/about`
  - `/adu-builder/sacramento`
  - `/compare`
  - `/faq`
  - `/process`
  - five `/services/*` routes
  - `/studio`
- The repository is private; the preview URL is public.
- A site-wide Development Preview notice is intentionally present.
- Phone, email, street address, contractor license number, live intake,
  customer accounts, submissions, and external actions must remain unpublished
  or disabled during this development stage.

If `main` has moved when work begins, record the observed SHA and stop. Do not
silently review a different product state.

## Owner-observed design defects

Treat these as mandatory hypotheses to test, not conclusions to echo:

1. The current homepage hero image appears to show an older occupied or retrofit
   house, not credible premium new ADU construction.
2. The pale green visual system does not create the intended premium product
   perception.
3. The portal still feels like a well-built website rather than a distinctive,
   high-trust premium platform.
4. Concept Studio must feel intentional, technically credible, and integrated
   with the platform—not like an isolated mockup or decorative configurator.

## Required review method

Inspect the actual rendered preview and the exact repository source. Review at
minimum desktop `1440×900`, tablet `768×1024`, and mobile `390×844`.
Traverse every public route and exercise every visible interactive control.

Do not limit the review to above-the-fold screenshots. Inspect complete pages,
navigation paths, menus, accordions, comparisons, internal links, buttons,
cards, image behavior, focus/hover/active/disabled states, responsive changes,
and Studio state transitions.

Distinguish:

- verified defect;
- product/design weakness;
- technically correct but visually weak behavior;
- recommendation;
- unknown requiring implementation-time validation.

## Audit scope

### A. Premium visual system

Evaluate the full system, not isolated hex values:

- brand character and differentiation;
- palette, contrast, surfaces, borders, shadows, and depth;
- typography, type scale, line length, rhythm, and hierarchy;
- spacing, grid, density, alignment, and component consistency;
- imagery direction, crop quality, art direction, and authenticity;
- motion and interaction restraint;
- desktop/mobile continuity;
- whether the design communicates premium residential construction,
  engineering competence, trust, and Northern California relevance without
  becoming generic luxury branding.

For the palette, provide a concrete recommended token direction and explain why
it is superior to the current pale-green system. Do not propose fashion-driven
decoration without product rationale.

### B. Homepage and hero

Determine whether the hero image represents new ADU construction credibly.
Specify:

- the exact subject the replacement image should show;
- construction/new-build cues that must be visible;
- composition, camera angle, lighting, season, landscaping, occupancy, and crop;
- what must be absent to avoid retrofit, stock-photo, or real-estate-listing
  perception;
- desktop and mobile art-direction requirements;
- recommended headline/CTA relationship and information hierarchy;
- whether one still image, a paired architectural view, or another restrained
  treatment best serves the platform.

Do not source or generate the final asset in this engagement. Produce an
implementation-ready image brief.

### C. Route-by-route product design

For every route, evaluate:

- page purpose and user question answered;
- hierarchy and narrative sequence;
- redundant, missing, weak, or misleading sections;
- CTA clarity and destination;
- visual consistency and premium perception;
- content density and scannability;
- image relevance and quality;
- mobile behavior;
- trust claims and factual overreach;
- dead ends and cross-route continuity.

Return a compact route matrix with severity and recommended action.

### D. Interaction and technical-quality surface

Exercise every visible control and report exact evidence for:

- header and footer navigation;
- mobile menu;
- buttons, links, cards, accordions, selectors, tabs, toggles, and comparison
  controls;
- keyboard traversal and visible focus;
- hover, active, selected, disabled, loading, empty, error, and reset states
  where applicable;
- internal destination correctness;
- broken assets, layout shift, overflow, clipping, duplicate H1, console errors,
  failed requests, and obvious performance regressions;
- accessibility semantics and contrast;
- behavior with JavaScript loading slowly or state refreshing where relevant.

A control that looks clickable but has no correct outcome is a blocking defect.
Do not treat a successful build as interaction evidence.

### E. Concept Studio / model builder

Audit the complete Studio user journey and its relationship to the intended ADU
model/configuration experience:

- entry point and promise;
- model selection and model-address/identifier clarity;
- available configurations and their hierarchy;
- image/model fidelity and correspondence to selections;
- dimensions, area, bedroom/bathroom data, pricing/status disclaimers, and other
  technical attributes;
- state persistence, URL/addressability, back/forward behavior, reload behavior,
  and shareability;
- validation, impossible combinations, empty/error/loading states;
- desktop, touch, keyboard, and mobile usability;
- next-step behavior while live intake and external actions are disabled;
- whether the Studio feels like a credible product tool rather than a static
  marketing component.

Identify what is already real, what is simulated, what is missing, and what
must never be implied before the backend supports it. Recommend the correct
technical and UX target state, but do not design business-process automation.

### F. Design-system and implementation implications

Map recommendations to likely implementation surfaces:

- global tokens;
- shared components;
- route-specific composition;
- asset pipeline and art direction;
- interaction/state model;
- Studio data model and URL/state contract;
- automated visual, interaction, accessibility, and regression checks.

Do not write code. The output must be precise enough for ChatGPT to cut one
bounded implementation work order at a time for the Claude Code lane.

## Required output

Create exactly:

`docs/shared-briefs/DESIGN-001-premium-platform-audit/FABLE-ANALYSIS.md`

The file must contain:

1. Exact reviewed SHA, URL, date, viewports, routes, and evidence method.
2. Executive verdict: current maturity and the main perception gap.
3. Verified findings ranked `P0`, `P1`, `P2`, with route/component and
   evidence.
4. Route-by-route matrix.
5. Interaction/control matrix with pass/fail/unknown.
6. Homepage hero and replacement-image specification.
7. Recommended premium visual direction, including concrete token-level palette
   and typography guidance.
8. Full Concept Studio audit and target-state contract.
9. Accessibility, responsive, performance, and technical-quality findings.
10. A dependency-aware implementation sequence divided into small bounded
    slices. Each slice must state objective, owned surface, acceptance evidence,
    and prerequisites.
11. Explicit non-goals and claims that must remain disabled/unpublished.
12. Unknowns that require implementation-time or owner validation.

Recommendations must cite observed evidence. Avoid generic redesign language,
competitor mimicry, arbitrary “luxury” tropes, or scope expansion into
marketing, sales, production deployment, infrastructure, or business workflows.

## Completion condition

The engagement is complete only when `FABLE-ANALYSIS.md` is committed on the
same shared-brief branch and is detailed enough to produce the first bounded
design implementation order without another exploratory round.
