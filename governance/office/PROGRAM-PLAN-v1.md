# Program Plan v1 — stage-gated platform program

Status: **PROPOSED**. Operative only from the commit at which the Owner merges
it.

Authority: Owner direction recorded in Issue #161 `PROGRAM-RESET-001`.
Governing model: `OPERATING-MODEL-v5.md`.
Base: `main@e32be9ea7cb265f6c6c0a65002a59bfe1419916c`.

This record defines the complete stage-gated program, its dependency gates, and
the exit condition of each stage. It authorizes no implementation by itself.
Each stage is entered only by an Owner-dispatched packet that satisfies the
Definition of Ready in `OPERATING-MODEL-v5.md` §6.

## Dependency graph

```
G0 → G1 → {G2A, G2B, G2C}
G2C → G3
G2B + G3 → G4
G2A + G3 + G4 → G5 → G6
```

- Stages 7 and 8 require separate privacy, identity, and recipient decisions.
  They are not unlocked by `G6`.
- Stage 9 requires the proven A600 pipeline from Stage 4.
- No stage may start from an unmerged predecessor.

---

## Stage 0 — PROGRAM RESET

- **Purpose.** Replace the ad-hoc visual execution model with a governed,
  stage-gated program, and record the current control baseline in committed
  bytes.
- **Entry preconditions.** Owner direction in Issue #161; verified post-cleanup
  portfolio; pinned base `main@e32be9ea7cb265f6c6c0a65002a59bfe1419916c`.
- **Authoritative inputs.** Issue #161 body and all comments; `AGENTS.md`;
  `governance/README.md`; `governance/BOUNDARIES.md`;
  `governance/office/OPERATING-MODEL-v4.md`; `governance/office/STATE.md`;
  archived Issue #151; paused Issues #160 and #142; paused PRs #84/#86/#90 and
  their latest review comments; live GitHub PR/Issue lists and exact
  `origin/main`.
- **Modules / domains.** `governance/office/**` only, and within it exactly four
  paths: `OPERATING-MODEL-v5.md`, `PROGRAM-PLAN-v1.md`,
  `PORTFOLIO-DISPOSITION-2026-08-10.md`, `STATE.md`.
- **Parallel lanes and forbidden overlap.** One mutation lane only. One
  concurrent read-only evidence lane is permitted and owns no file domain.
  Forbidden: any application, runtime, test, dependency, CSS, asset, or content
  path; `OPERATING-MODEL-v4.md`.
- **Required worker/tool role.** One named terminal executor. No subagents, no
  background or asynchronous lanes.
- **Evidence.** Exact base and head SHA; four-path changed-path audit;
  `git diff --check`; `npm ci`; `npm test`; `npm run lint`; `npx tsc --noEmit`;
  `npm run build`; live portfolio reconciliation; Draft PR; remote-bytes
  equality.
- **Non-author review.** One separate non-author Codex Pro engagement at the
  exact result SHA.
- **Owner gate.** Tony alone adopts and merges.
- **Exit condition.** `G0 CONTROLLED` — v5, program plan, portfolio disposition,
  and current state board merged to `main`.
- **Downstream dependencies.** Gates every other stage. Nothing else starts
  until `G0` is merged.

---

## Stage 1 — PRODUCT / EXPERIENCE DEFINITION

- **Purpose.** Decide what Release 1 is, in exact terms, before anything is
  designed or built.
- **Entry preconditions.** `G0 CONTROLLED` merged.
- **Authoritative inputs.** Merged Stage 0 records; Issue #151 production
  baseline; Issue #162 `RELEASE1-EVIDENCE-001` current-truth evidence; live
  route surface; Issue #142 visual-truth defect record.
- **Modules / domains.** Decision records and definition documents only. No
  implementation domain.
- **Deliverables.** Release 1 scope; complete journey and module map; route,
  publication, CTA, and state contract; A600 Studio state machine; claims
  matrix; the A600-only decision; exact visual, responsive, accessibility,
  motion, bundle, and performance targets; explicit later-release boundaries.
- **Parallel lanes and forbidden overlap.** One authoring lane. Forbidden: any
  implementation, asset production, or dependency change.
- **Required worker/tool role.** Authored by the Opus 5 Worker; independently
  reviewed by a non-author engagement.
- **Evidence.** Every target stated as an exact measurable value. No adjectival
  target. Every claim in the claims matrix carries its source, and any uncertain
  GIS, jurisdiction, or feasibility statement carries
  `Requires official source verification.`
- **Non-author review.** Independent adversarial review at the exact head.
- **Owner gate.** Tony-adopted decision. Exit is not reached by review alone.
- **Exit condition.** `G1 DECISION READY`, only after the Tony-adopted decision.
- **Downstream dependencies.** Gates Stages 2A, 2B, and 2C.

---

## Stage 2A — VISUAL TARGET

- **Purpose.** Lock the exact visual target for every Release 1 surface before
  implementation.
- **Entry preconditions.** `G1 DECISION READY`.
- **Authoritative inputs.** Stage 1 decision; Issue #162 evidence; existing
  route surface.
- **Modules / domains.** Design target records and referenced target artifacts.
  No application code.
- **Deliverables.** Real-content targets for Home, Models, A600 detail, Studio,
  Process, Services, Service Areas, About, and FAQ, at **1440×1000**,
  **820×1180**, and **390×844**; exact components, states, motion, and refusals.
  **No placeholders.**
- **Parallel lanes and forbidden overlap.** May run parallel to 2B and 2C.
  Forbidden overlap with 2C's platform decisions and with any shared CSS/token
  or layout domain.
- **Required worker/tool role.** Named terminal executor; non-author reviewer.
- **Evidence.** Every surface represented at all three viewports with real
  content. Missing content is `BLOCKED — MISSING SOURCE OR RIGHTS`, not a
  placeholder.
- **Non-author review.** Independent review at the exact head.
- **Owner gate.** Owner adoption of the visual target.
- **Exit condition.** `G2A VISUAL TARGET LOCKED`.
- **Downstream dependencies.** With `G3` and `G4`, gates Stage 5.

---

## Stage 2B — A600 MODEL / ASSET READINESS

- **Purpose.** Resolve every render-critical professional unknown for A600
  before any asset is produced.
- **Entry preconditions.** `G1 DECISION READY`.
- **Authoritative inputs.** Stage 1 decision; Issue #142 media-intake contract
  and rights requirements; Owner-supplied professional media and manifest.
- **Modules / domains.** Asset readiness records; render recipe definitions.
- **Deliverables.** Resolved render-critical professional unknowns; render
  toolchain; camera, light, material, and color recipes; asset sizes and crops;
  material identity, rights, and adoption.
- **Parallel lanes and forbidden overlap.** May run parallel to 2A and 2C.
  Forbidden: producing final assets before rights are resolved.
- **Required worker/tool role.** Named terminal executor with the professional
  inputs available in-session.
- **Evidence.** Rights status recorded per asset. Material identity matched to
  current official product information with source URL and verification date.
  No partnership, certification, or endorsement claim.
- **Non-author review.** Independent review at the exact head.
- **Owner gate.** Owner adoption of material identity and rights.
- **Exit condition.** `G2B ASSET READY`. **Missing professional input or rights
  is `BLOCKED`. No upscale, no invention.**
- **Downstream dependencies.** With `G3`, gates Stage 4.

---

## Stage 2C — PLATFORM / QUALITY ARCHITECTURE

- **Purpose.** Decide which platform capabilities are actually required, and
  what the quality harness must enforce.
- **Entry preconditions.** `G1 DECISION READY`.
- **Authoritative inputs.** Stage 1 targets; Issue #160 `PRO-VISUAL-STACK-001`
  as a candidate dependency slice; `AGENTS.md` and the bundled Next.js
  documentation under `node_modules/next/dist/docs/`.
- **Modules / domains.** Architecture decision records only.
- **Deliverables.** A decision on which Motion, GSAP, Rive, and Three
  capabilities are genuinely required; lazy and client-only rules; bundle
  budgets; CI; E2E; visual regression; accessibility; security; observability;
  rollback.
- **Parallel lanes and forbidden overlap.** May run parallel to 2A and 2B.
  Forbidden: installing dependencies at this stage; that is Stage 3.
- **Required worker/tool role.** Named terminal executor; non-author reviewer.
- **Evidence.** Each capability retained is justified against a Stage 1 target.
  A capability with no target is dropped, not deferred.
- **Non-author review.** Independent review at the exact head.
- **Owner gate.** Owner adoption of the platform and quality architecture.
- **Exit condition.** `G2C TECHNICAL READY`.
- **Downstream dependencies.** Gates Stage 3.

---

## Stage 3 — SHARED ENGINEERING FOUNDATION

- **Purpose.** Build the shared foundation once, serially, before any vertical
  consumes it.
- **Entry preconditions.** `G2C TECHNICAL READY` merged.
- **Authoritative inputs.** Stage 2C decision; Stage 1 exact targets.
- **Modules / domains.** Package manifests and lockfile; quality harness; design
  tokens and primitives; canonical catalog projection. These are **exclusive
  single-writer domains**.
- **Deliverables.** Serialized tooling slice; quality harness; exact design
  tokens and primitives; canonical catalog projection.
- **Parallel lanes and forbidden overlap.** **Serialized — one writer at a
  time.** No parallel lane may touch manifests, lockfile, global CSS/tokens,
  shared layout/navigation, schemas/catalog, or deployment configuration while
  this stage is live.
- **Required worker/tool role.** Named terminal executor per slice; non-author
  reviewer per head.
- **Evidence.** Clean install from the resulting lockfile; `npm test`;
  `npm run lint`; `npx tsc --noEmit`; `npm run build`; dependency audit;
  changed-path audit; exact-head canonical Preview.
- **Non-author review.** Independent review at each exact head.
- **Owner gate.** Owner merges each slice serially.
- **Exit condition.** `G3 FOUNDATION GREEN`. **No page redesign occurs in this
  stage.**
- **Downstream dependencies.** With `G2B`, gates Stage 4. With `G2A` and `G4`,
  gates Stage 5.

---

## Stage 4 — DETERMINISTIC A600 ASSET PIPELINE

- **Purpose.** Produce A600 media deterministically and reproducibly, bound to
  the model.
- **Entry preconditions.** `G2B ASSET READY` and `G3 FOUNDATION GREEN`, both
  merged.
- **Authoritative inputs.** Stage 2B recipes, rights, and material identity;
  Stage 3 foundation.
- **Modules / domains.** Geometry generator; export pipeline; derivative
  pipeline; asset masters and evidence records.
- **Deliverables.** Geometry generator; STEP, GLB, plan, and elevation outputs;
  sealed Blender/Cycles recipe; libvips derivatives; model-bound masters; run,
  environment, and output evidence.
- **Parallel lanes and forbidden overlap.** Single lane over the asset domain.
  Forbidden overlap with Stage 5 verticals consuming the same assets.
- **Required worker/tool role.** Named terminal executor with the sealed
  toolchain.
- **Evidence.** Deterministic reproduction: identical inputs produce identical
  outputs, with run and environment evidence recorded. Executable geometry
  remains authoritative and is never replaced by a decorative image.
- **Non-author review.** Independent review at the exact head.
- **Owner gate.** Owner adopts the released media set.
- **Exit condition.** `G4 A600 MEDIA RELEASED`.
- **Downstream dependencies.** With `G2A` and `G3`, gates Stage 5. Proven
  pipeline is required by Stage 9.

---

## Stage 5 — PRODUCT VERTICALS

- **Purpose.** Implement the public product from locked targets and released
  assets only.
- **Entry preconditions.** `G2A VISUAL TARGET LOCKED`, `G3 FOUNDATION GREEN`,
  and `G4 A600 MEDIA RELEASED`, all merged.
- **Authoritative inputs.** Locked Stage 2A targets; Stage 4 released assets;
  Stage 1 route/CTA/state contract.
- **Modules / domains.** Studio A600; Home, navigation, and narrative; Models,
  catalog, and content routes. Each vertical owns a disjoint domain.
- **Deliverables.** Studio A600; Home/navigation/narrative; Models/catalog/
  content routes — **only** from locked targets and released assets.
- **Parallel lanes and forbidden overlap.** At most two mutation lanes plus one
  read-only reviewer, and only across disjoint verticals. Shared layout,
  navigation, tokens, and catalog remain exclusive single-writer domains and are
  not touched concurrently by two verticals.
- **Required worker/tool role.** One named terminal executor per vertical
  packet.
- **Evidence.** Full tests, and rendered evidence at **1440**, **820**, and
  **390**. No placeholder content. No asset invented at implementation time.
- **Non-author review.** Independent review at each exact head.
- **Owner gate.** Owner merges each vertical serially; base drift rechecked
  after every merge.
- **Exit condition.** `G5 PUBLIC PRODUCT COMPLETE`, verified on a **combined
  `main` Preview**, not on isolated fragment previews.
- **Downstream dependencies.** Gates Stage 6.

---

## Stage 6 — RELEASE 1

- **Purpose.** Release the coherent public product as one system.
- **Entry preconditions.** `G5 PUBLIC PRODUCT COMPLETE`.
- **Authoritative inputs.** Stage 1 route contract; Stage 5 combined Preview;
  Issue #151 adopted release rule; Issue #162 evidence.
- **Modules / domains.** Whole public surface; SEO and metadata surfaces;
  rollback configuration.
- **Deliverables.** All **18 current public URLs** and their CTAs; SEO, schema,
  sitemap, and robots; responsive consistency; accessibility, performance,
  security, dependency, and claim audits; rollback; **two independent verdicts**.
  The exact enumeration of the 18 URLs is established by the Stage 1 route and
  publication contract and by Issue #162's evidence lane; it is not inferred at
  release time. Issue #151 verifies six of them — `/`, `/models`, `/studio`,
  `/process`, `/service-areas`, `/about` — as the historical minimum route
  surface.
- **Parallel lanes and forbidden overlap.** One integration candidate only. No
  concurrent visual release wave.
- **Required worker/tool role.** Named terminal executors for audits; two
  distinct non-author review engagements.
- **Evidence.** Exact-head canonical Preview; then, after merge, combined
  production, domain, runtime, and rollback verification.
- **Non-author review.** **Two independent verdicts**, from two distinct
  non-author engagements.
- **Owner gate.** **Tony alone merges.**
- **Exit condition.** `G6 RELEASED`, only after post-merge combined production,
  domain, runtime, and rollback verification.
- **Downstream dependencies.** Does not by itself unlock Stages 7, 8, or 9.

---

## Stage 7 — CONTROLLED QUALIFICATION / HUMAN HANDOFF

- **Purpose.** Introduce qualification and human handoff under explicit privacy
  authority.
- **Entry preconditions.** `G6 RELEASED`, **and** separate Owner-adopted
  privacy, consent, retention, and recipient decisions. `G6` alone is
  insufficient.
- **Authoritative inputs.** `governance/BOUNDARIES.md`; adopted privacy and
  retention decision records; Research Gate outputs per DR-0005.
- **Modules / domains.** Qualification flow; site-fact provider; storage,
  deletion, and export surfaces.
- **Deliverables.** Privacy, consent, retention, and security contract;
  site-fact provider; human recipient and recovery path; `/start`; storage,
  deletion, and export.
- **Parallel lanes and forbidden overlap.** Forbidden overlap with the public
  product domain released at Stage 6.
- **Required worker/tool role.** Named terminal executor; non-author reviewer.
- **Evidence.** No production PII persisted absent an Owner-approved packet. AI
  remains out of the visitor decision path. Boundary compliance recorded per
  surface.
- **Non-author review.** Independent review at the exact head.
- **Owner gate.** Owner adopts the privacy posture, then merges.
- **Exit condition.** **Separate release**, not folded into Release 1.
- **Downstream dependencies.** None automatic.

---

## Stage 8 — RECEPTION / MEMORY

- **Purpose.** Repair and land the paused Reception Memory stack, then extend it
  only through separate gates.
- **Entry preconditions.** `G0` merged for the re-entry gate definition; then
  the Stage 7 privacy and identity decisions for anything beyond repair.
- **Authoritative inputs.** PR #84 exact-head review verdict
  `BLOCKED FOR REVISION` at `b6b38150d868f8038d16508699527b6c5cbdd41b`; PRs #86
  and #90; Issues #83, #85, #88.
- **Modules / domains.** `src/lib/receptionMemory/**` and its tests.
- **Ordered sequence.** Repair and review **#84 → #86 → #90** first. #84 is the
  blocked root: its latest exact-head review records **30 of 44 refusal codes
  untested**, and no downstream claim is valid until that root is re-packeted
  and repaired. Only then: synthetic persistence, identity, and consent;
  web-text EN/ES/RU; the Product 1 adapter; and voice/phone.
- **Parallel lanes and forbidden overlap.** Strictly serial through the stack.
  **Zero dependent packets on an unmerged predecessor** — #86 and #90 remain
  paused while #84 is unrepaired.
- **Required worker/tool role.** Named terminal executor per slice; non-author
  reviewer per head.
- **Evidence.** One negative fixture per unasserted refusal code, or per
  declared equivalence class with explicit justification. Mutation proof for
  load-bearing guards.
- **Non-author review.** Independent review at each exact head; a new commit
  invalidates the prior verdict.
- **Owner gate.** Owner merges each slice serially.
- **Exit condition.** Repair landed; **voice and phone are separate release
  gates**, each requiring its own Owner decision.
- **Downstream dependencies.** Voice/telephony remains barred by
  `governance/BOUNDARIES.md` absent an Owner-approved packet.

---

## Stage 9 — CATALOG EXPANSION

- **Purpose.** Extend the catalog beyond A600 only on a proven pipeline.
- **Entry preconditions.** Stage 4 A600 pipeline proven and merged.
- **Authoritative inputs.** Stage 4 pipeline and evidence; Stage 2B rights and
  material identity method.
- **Modules / domains.** Per-model geometry, assets, catalog entries, and
  routes.
- **Ordered sequence.** **S450 first, then B800.** Each carries **its own
  professional model, asset, and release gate.**
- **Parallel lanes and forbidden overlap.** One model at a time over the shared
  catalog domain. No concurrent write to schemas or catalog.
- **Required worker/tool role.** Named terminal executor per model; non-author
  reviewer.
- **Evidence.** Deterministic pipeline reproduction per model. No placeholder
  and no upscaled or invented asset. Models without matched verified media
  remain explicitly `Preview pending`.
- **Non-author review.** Independent review at each exact head.
- **Owner gate.** Owner merges each model release.
- **Exit condition.** Per-model release gate satisfied.
- **Downstream dependencies.** None.

---

## Program-wide rules

1. Every stage entry is a packet satisfying `OPERATING-MODEL-v5.md` §6.
2. No stage starts from an unmerged predecessor.
3. Merges are serialized; remaining heads are rechecked for base drift after
   every merge.
4. Preview is engineering evidence; production is the Owner's merge.
5. Missing professional input, rights, or an unmade Owner decision is
   `BLOCKED` — never a placeholder, surrogate, or invented value.
