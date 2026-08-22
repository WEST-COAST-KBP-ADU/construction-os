# Copy deck — every proposed public sentence

Packet `P2-BUSINESS-JOURNEY-IA-0001`. Exact base
`main@cf099534cb0256a1748641972abbdad49fcf8645`.

Every public sentence proposed for the homepage spine appears exactly once below,
with one source link and one claim status. A sentence that is not in this deck
must not ship. Unit definitions and per-unit fields are in
[`homepage-journey.md`](homepage-journey.md); the scenario the U3–U5 copy
narrates is in [`interaction-scenario.md`](interaction-scenario.md).

Permalink prefix used by every source link:

```
https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/
```

**Status legend.** `SHIPPABLE_NOW` — traceable to committed bytes at the base,
implies no capability the site lacks; may render in present tense.
`DESIGN_TARGET` — declared intent, backed by a committed contract but not
publicly demonstrated; must render beside its own boundary line, never as
present-tense operating fact. `EVIDENCE_REQUIRED` — must not render until the
named artifact exists and the Owner approves.

Rows tagged **`DEPENDS_ON_248`** are deliberately unset by this packet and are
owned by the sibling proof-bridge packet
[#248](https://github.com/WEST-COAST-KBP-ADU/construction-os/issues/248). They are
named here so the implementation packet cannot silently invent them.

---

## U1 — Hero

| ID | Exact copy | Source | Status |
| :--- | :--- | :--- | :--- |
| `U1-K` | `West Coast KBP · ADU + General Construction` | [`src/lib/siteConfig.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/lib/siteConfig.ts) (`name`, `tagline`); [`premiumWorkbenchHero.contract.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/components/home/premiumWorkbenchHero.contract.ts) (`kicker`, replacing `KBP OS ·` with the business name per the Owner's category ruling) | `SHIPPABLE_NOW` |
| `U1-H` | `ADU and general construction, run as one managed process.` | [`governance/office/STRATEGY-KBP-OS-v1.md`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/governance/office/STRATEGY-KBP-OS-v1.md) (ADU wedge, general construction open field); [`premiumWorkbenchHero.contract.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/components/home/premiumWorkbenchHero.contract.ts) (`heading` at the base) | `SHIPPABLE_NOW` |
| `U1-B1` | `West Coast KBP designs and builds accessory dwelling units and takes on general construction work in California.` | [`src/lib/contentPages.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/lib/contentPages.ts) (five published service pages); [`src/lib/siteConfig.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/lib/siteConfig.ts) (`description`) | `SHIPPABLE_NOW` |
| `U1-B2` | `Every project is run as one connected process — from the first conversation to the record of what was actually built.` | [`premiumWorkbenchHero.contract.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/components/home/premiumWorkbenchHero.contract.ts) (`HERO_CHAPTERS = ["lead","project","record"]`) | `DESIGN_TARGET` |
| `U1-C1` | `See the work we take on` → `/services/detached-adu` | [`src/lib/routes.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/lib/routes.ts) (`/services/[slug]`, `published`) | `SHIPPABLE_NOW` |
| `U1-C2` | `Open Concept Studio` → `/studio` | [`app/page.tsx`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/app/page.tsx) (label carried unchanged from the base) | `SHIPPABLE_NOW` |
| `U1-R` | Chapter rail labels `Lead` · `Project` · `Record` | [`premiumWorkbenchHero.contract.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/components/home/premiumWorkbenchHero.contract.ts) (`HERO_CHAPTER_LABELS`, verbatim) | `SHIPPABLE_NOW` |
| `U1-D` | `Conceptual imagery—plan and material studies under review. Not a West Coast KBP project, an approved plan, a permit, a parcel, or a material specification.` | [`premiumWorkbenchHero.contract.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/components/home/premiumWorkbenchHero.contract.ts) (`PREMIUM_WORKBENCH_HERO_MEDIA.disclosure`, verbatim) | `SHIPPABLE_NOW` |

**Retired at the base.** `KBP OS is a lead-generation and process-management
platform for ADU and general construction—residential and commercial. We’re open
to GC projects beyond ADUs.` — the Owner ruled this register engineering jargon
([kbp-dev-office#373](https://github.com/kbp-core-engineering/kbp-dev-office/issues/373)).
`U1-B1` replaces it. The second sentence is not carried forward in any form: as
public copy it reads as an availability statement, which the prohibitions bar.

---

## U2 — What the business does

| ID | Exact copy | Source | Status |
| :--- | :--- | :--- | :--- |
| `U2-H` | `The work we take on.` | [`src/lib/homepageServices.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/lib/homepageServices.ts) | `SHIPPABLE_NOW` |
| `U2-B1` | `Five published service paths, each with its own page, scope, and review questions. General construction beyond ADUs is part of the business direction.` | [`src/lib/contentPages.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/lib/contentPages.ts) (`ServiceSlug` — five slugs, each with `scopeItems` and `reviewInputs`); [`governance/office/STRATEGY-KBP-OS-v1.md`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/governance/office/STRATEGY-KBP-OS-v1.md) | `SHIPPABLE_NOW` |
| `U2-S1` | `Private, independent living space for family, guests, or multi-generational use.` + CTA `Explore detached ADUs` → `/services/detached-adu` | [`src/lib/homepageServices.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/lib/homepageServices.ts) (verbatim) | `SHIPPABLE_NOW` |
| `U2-S2` | `Transform underused space into comfortable, code-conscious living space.` + CTA `Explore garage conversions` → `/services/garage-conversion` | [`src/lib/homepageServices.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/lib/homepageServices.ts) (verbatim) | `SHIPPABLE_NOW` |
| `U2-S3` | `Connected space planned to work with the home's architecture and everyday flow.` + CTA `Explore attached ADUs` → `/services/attached-adu` | [`src/lib/homepageServices.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/lib/homepageServices.ts) (verbatim) | `SHIPPABLE_NOW` |
| `U2-S4` | `A compact way to make more useful space within the home you already have.` + CTA `Explore JADUs` → `/services/jadu` | [`src/lib/homepageServices.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/lib/homepageServices.ts) (verbatim) | `SHIPPABLE_NOW` |
| `U2-S5` | CTA `Explore ADU legalization` → `/services/adu-legalization`; card description carried from the service page's own `description` field, not written here | [`src/lib/contentPages.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/lib/contentPages.ts) (`slug: "adu-legalization"`); [`src/lib/routes.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/lib/routes.ts) | `SHIPPABLE_NOW` |
| `U2-S6` | `More room, light, and function through an addition that belongs with the home.` — **no link** | [`src/lib/homepageServices.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/lib/homepageServices.ts) (verbatim, first sentence of the unresolved entry) | `SHIPPABLE_NOW` |
| `U2-D` | `Dedicated service details are not published. Route selection remains unresolved.` | [`app/page.tsx`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/app/page.tsx) (verbatim) | `SHIPPABLE_NOW` |

---

## U3 — One project, from first contact

| ID | Exact copy | Source | Status |
| :--- | :--- | :--- | :--- |
| `U3-H` | `How one project moves.` | [`src/lib/leads/leadContract.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/lib/leads/leadContract.ts) (`FUNNEL_STATES`) | `DESIGN_TARGET` |
| `U3-B1` | `You look first, anonymously.` | [`app/page.tsx`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/app/page.tsx) (Concept Studio is property-agnostic and collects no address or contact information) | `SHIPPABLE_NOW` |
| `U3-B2` | `A real objective becomes a short list of bounded work.` | [`src/lib/receptionMemory/contextPolicyEngine.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/lib/receptionMemory/contextPolicyEngine.ts); [`CLAUDE.md`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/CLAUDE.md) (*Change discipline*) | `DESIGN_TARGET` |
| `U3-B3` | `A person decides what advances, what waits, and what is refused.` | [`src/lib/lab/ownerReviewPacket.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/lib/lab/ownerReviewPacket.ts) (`status: "candidate"`; executing requires owner approval); [`governance/BOUNDARIES.md`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/governance/BOUNDARIES.md) | `DESIGN_TARGET` |
| `U3-B4` | `What is agreed becomes a record of the project.` | [`src/lib/receptionMemory/receptionMemoryContract.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/lib/receptionMemory/receptionMemoryContract.ts) (`GRAPH_NODE_KINDS`, `GRAPH_EDGE_KINDS`) | `DESIGN_TARGET` |
| `U3-C1` | `Open Concept Studio` → `/studio` | [`app/page.tsx`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/app/page.tsx) | `SHIPPABLE_NOW` |
| `U3-C2` | `See the ADU process` → `/process` | [`app/page.tsx`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/app/page.tsx) (label carried unchanged) | `SHIPPABLE_NOW` |
| `U3-D` | `Steps two through four describe how the business is being built to run. They are not live today: this site has no intake, no account, no submission, and no scheduling.` | [`src/lib/siteConfig.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/lib/siteConfig.ts) (`developmentNotice.supporting`) | `SHIPPABLE_NOW` |
| `U3-D2` | `Concept Studio is anonymous and does not evaluate a parcel or create an eligibility, buildability, permit, price, or schedule conclusion.` | [`src/lib/journeyExits.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/lib/journeyExits.ts) (`journeyExitTruthBoundary`, verbatim) | `SHIPPABLE_NOW` |

`U3-D` is a rendering condition on `U3-B2` … `U3-B4`, not an optional footnote.

---

## U4 — Bounded work, human decisions, records

| ID | Exact copy | Source | Status |
| :--- | :--- | :--- | :--- |
| `U4-H` | `Small enough to check.` | [`CLAUDE.md`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/CLAUDE.md) (*Change discipline*) | `DESIGN_TARGET` |
| `U4-B1` | `A business objective is broken into bounded pieces of work, each with a stated outcome and a stated way to refuse it.` | [`src/lib/receptionMemory/contextPolicyEngine.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/lib/receptionMemory/contextPolicyEngine.ts) (`CONTEXT_POLICY_REFUSAL_CODES` — refusal is a closed, named list) | `DESIGN_TARGET` |
| `U4-B2` | `Nothing advances because it looks finished. It advances because a person accepted it.` | [`src/lib/lab/ownerReviewPacket.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/lib/lab/ownerReviewPacket.ts); [`src/lib/leads/leadContract.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/lib/leads/leadContract.ts) (`owner_review_required` precedes `approved_for_contact`) | `DESIGN_TARGET` |
| `U4-C1` | `See the ADU process` → `/process` | [`src/lib/routes.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/lib/routes.ts) | `SHIPPABLE_NOW` |
| `U4-D1` | `Does not determine a property fit.` | [`app/page.tsx`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/app/page.tsx) (verbatim) | `SHIPPABLE_NOW` |
| `U4-D2` | `Does not determine eligibility or buildability.` | [`app/page.tsx`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/app/page.tsx) (verbatim) | `SHIPPABLE_NOW` |
| `U4-D3` | `Does not automate approval or commitment.` | [`app/page.tsx`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/app/page.tsx) (verbatim) | `SHIPPABLE_NOW` |

---

## U5 — The business remembers its own work

| ID | Exact copy | Source | Status |
| :--- | :--- | :--- | :--- |
| `U5-H` | `The business remembers the project, not the person watching.` | [`governance/BOUNDARIES.md`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/governance/BOUNDARIES.md) (minimal retention; no transcript or recording retention) | `DESIGN_TARGET` |
| `U5-B1` | `Accepted outcomes are kept as connected records: this decision belongs to that project, this document supports that decision.` | [`src/lib/receptionMemory/receptionMemoryContract.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/lib/receptionMemory/receptionMemoryContract.ts) (`participates_in_project`, `evidenced_by`, `asserted_by`) | `DESIGN_TARGET` |
| `U5-B2` | `Memory is added by proposal and only for a purpose that was permitted — never collected in passing.` | [`src/lib/receptionMemory/receptionMemoryContract.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/lib/receptionMemory/receptionMemoryContract.ts) (`MEMORY_OPERATIONS` is read plus two `propose_append_*`; `MEMORY_PURPOSES` is a closed list of three; `MEMORY_CONSENT_GRANT_SCHEMA`) | `DESIGN_TARGET` |
| `U5-B3` | `Next time, the business starts from what was already agreed instead of asking again.` | [`src/lib/receptionMemory/contextPolicyEngine.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/lib/receptionMemory/contextPolicyEngine.ts) (`subject_continuity_v1`, `project_continuity_v1`) | `DESIGN_TARGET` |
| `U5-C1` | `Understand the operating model` → `/about` | [`app/page.tsx`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/app/page.tsx) (label carried from the base exits nav) | `SHIPPABLE_NOW` |
| `U5-D` | `No customer records exist on this site today. It collects nothing, stores nothing, and tracks nothing.` | [`src/lib/siteConfig.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/lib/siteConfig.ts) (`footer.previewNotice`: *no data is collected*; `developmentNotice.supporting`) | `SHIPPABLE_NOW` |

`U5-D` is a rendering condition on `U5-B1` … `U5-B3`.

---

## U6 — What is on the record today

| ID | Exact copy | Source | Status |
| :--- | :--- | :--- | :--- |
| `U6-H` | `What is already on the record.` | [`src/lib/publicModelCatalog.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/lib/publicModelCatalog.ts) | `SHIPPABLE_NOW` |
| `U6-B1` | `Three concept families are published from one validated release, each with its own identifier, version, envelope, and maturity.` | [`src/lib/publicModelCatalog.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/lib/publicModelCatalog.ts) (`PUBLIC_MODEL_IDS`, release identity validation); [`src/data/studio/models/releases/2026.09.0.json`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/data/studio/models/releases/2026.09.0.json) | `SHIPPABLE_NOW` |
| `U6-B2` | `Facts, concepts, and unknowns are kept visibly apart, so a concept never reads as a conclusion.` | [`app/page.tsx`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/app/page.tsx) (`truth-boundary-title` section) | `SHIPPABLE_NOW` |
| `U6-L1` | `Verified product facts` / `Release-bound model IDs, versions, program, envelope, maturity, and provenance.` | [`app/page.tsx`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/app/page.tsx) (verbatim) | `SHIPPABLE_NOW` |
| `U6-L2` | `Conceptual media` / `Every image is labeled beside the image and is not presented as a completed project.` | [`app/page.tsx`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/app/page.tsx) (verbatim) | `SHIPPABLE_NOW` |
| `U6-L3` | `Unknown / professional gates` / `Property, approval, and construction questions remain outside an editorial card.` | [`app/page.tsx`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/app/page.tsx) (verbatim) | `SHIPPABLE_NOW` |
| `U6-C1` | `Inspect the owned families` → `/models` | [`app/page.tsx`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/app/page.tsx) (`Inspect the owned families.`) | `SHIPPABLE_NOW` |
| `U6-D1` | `Conceptual imagery—not a completed West Coast KBP project.` | [`app/page.tsx`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/app/page.tsx) (verbatim) | `SHIPPABLE_NOW` |
| `U6-D2` | `Requires official source verification.` | [`governance/BOUNDARIES.md`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/governance/BOUNDARIES.md) (required wording, verbatim) | `SHIPPABLE_NOW` |

---

## U7 — Where to go next

| ID | Exact copy | Source | Status |
| :--- | :--- | :--- | :--- |
| `U7-H` | `Choose where to go next.` | [`app/page.tsx`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/app/page.tsx) (`final-exits-title`) | `SHIPPABLE_NOW` |
| `U7-B1` | `Nothing on this page submits, schedules, or contacts anyone.` | [`src/lib/siteConfig.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/lib/siteConfig.ts) (`developmentNotice.supporting`; `footer.previewNotice`) | `SHIPPABLE_NOW` |
| `U7-E1` | `Models` / `Inspect the owned families.` → `/models` | [`app/page.tsx`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/app/page.tsx) (verbatim) | `SHIPPABLE_NOW` |
| `U7-E2` | `Process` / `See the review sequence.` → `/process` | [`app/page.tsx`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/app/page.tsx) (verbatim) | `SHIPPABLE_NOW` |
| `U7-E3` | `Concept Studio` / `Explore anonymously, before a property is in view.` → `/studio` | [`app/page.tsx`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/app/page.tsx) (`concept-studio-title`, verbatim) | `SHIPPABLE_NOW` |
| `U7-E4` | `Service areas` / `Browse service-area sources.` → `/service-areas` | [`app/page.tsx`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/app/page.tsx) (`Browse service-area sources`) | `SHIPPABLE_NOW` |
| `U7-E5` | `Compare` / `See how controlled work differs from ad-hoc work.` → `/compare` | [`src/lib/contentPages.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/lib/contentPages.ts) (`ComparePage`, `ComparisonRow` — `adHoc` versus `controlled`) | `SHIPPABLE_NOW` |
| `U7-E6` | `FAQ` / `Read bounded answers.` → `/faq` | [`app/page.tsx`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/app/page.tsx) (verbatim) | `SHIPPABLE_NOW` |
| `U7-E7` | `About` / `Understand the operating model.` → `/about` | [`app/page.tsx`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/app/page.tsx) (verbatim) | `SHIPPABLE_NOW` |
| `U7-D` | `Concept Studio is anonymous and does not evaluate a parcel or create an eligibility, buildability, permit, price, or schedule conclusion.` | [`src/lib/journeyExits.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/lib/journeyExits.ts) (verbatim) | `SHIPPABLE_NOW` |

The two jurisdiction guides (`/adu-builder/sacramento`,
`/adu-builder/sacramento-county`) are intentionally **not** promoted into this
rail. They stay one level below `/service-areas`, preserving the committed
separation of the two records
([`src/lib/jurisdictionPages.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/lib/jurisdictionPages.ts)).

---

## U8 — Deedseal bridge

| ID | Exact copy | Source | Status |
| :--- | :--- | :--- | :--- |
| `U8-B` | `KBP OS is the first user of Deedseal. The public integration record is not yet available; view Deedseal’s current public proof.` — the word `proof` is the single link, to `https://deedseal.com` | [`src/lib/deedsealCrossReference.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/lib/deedsealCrossReference.ts) (`DEEDSEAL_CROSS_REFERENCE_SENTENCE`; byte SHA `caa6e9c26f33d164229747f8a1f855c0d0186ae3`) | `SHIPPABLE_NOW` — **frozen; byte-exact only** |
| `U8-C1` | `Deedseal public proof record` → `DEEDSEAL_PROOF_RECORD_URL` (commit-pinned to `ae60603a001387fcdbb9f25628b3bfbc015e2311`) | [`src/lib/deedsealCrossReference.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/lib/deedsealCrossReference.ts) (`DEEDSEAL_PROOF_RECORD_LABEL`, `DEEDSEAL_PROOF_RECORD_URL`) | `SHIPPABLE_NOW` — carried verbatim |

### Deliberately unset — owned by #248

Named so the implementation packet cannot invent them. **`DEPENDS_ON_248`.**

| ID | Intent | Blocked on | Status |
| :--- | :--- | :--- | :--- |
| `U8-X1` `DEPENDS_ON_248` | Any supporting sentence placed beside the frozen sentence (a kicker, a label, a one-line explanation of what Deedseal is). | #248 output, then Owner approval. | `EVIDENCE_REQUIRED` |
| `U8-X2` `DEPENDS_ON_248` | `Powered by Deedseal` as a shipped mark or line. Intended future shorthand; explorable only as an explicitly annotated candidate. | A public integration record **and** Owner approval. | `EVIDENCE_REQUIRED` |
| `U8-X3` `DEPENDS_ON_248` | Any sentence describing what the bidirectional proof loop proves, in public voice. | #248 output. | `EVIDENCE_REQUIRED` |
| `U8-X4` `DEPENDS_ON_248` | Any Product 1 → Product 2 arrival copy ("you came from Deedseal…"). | #248 output; Product 1 owns its own side. | `EVIDENCE_REQUIRED` |

---

## Layout-level copy — recommended, outside the eight units

| ID | Exact copy | Source | Status |
| :--- | :--- | :--- | :--- |
| `L1-N` | `Live intake, submissions, customer accounts, and external actions are not enabled.` — proposed as one calm line replacing the two-line `Development preview` banner treatment. The truth is preserved; the alarm is not. | [`src/lib/siteConfig.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/lib/siteConfig.ts) (`developmentNotice.supporting`, verbatim); Owner verdict in [kbp-dev-office#373](https://github.com/kbp-core-engineering/kbp-dev-office/issues/373) | `SHIPPABLE_NOW` |

`L1-N` belongs to the header/Hero domain in
[`integration-handoff.json`](integration-handoff.json), not to the post-Hero
narrative domain. Dropping the `Development preview` **label** while keeping the
sentence is a copy change only; whether the banner remains a distinct band is a
visual decision this packet does not make.

---

## Literal prohibition sweep

Run against every `Exact copy` cell above.

| Prohibited claim class | Result | How it is enforced |
| :--- | :--- | :--- |
| Price, cost, estimate, financing | **None present.** No numeral denotes money anywhere in the deck. | No unit may carry a price line; `U6` cards are release records, not offers. |
| Date, schedule, duration, timeline | **None present.** The only dates in this packet are commit and release identifiers in source citations, never public copy. | `U1-B2` says "one connected process", never how long it takes. |
| Availability, capacity, "accepting projects", "open to" | **None present.** The base sentence `We’re open to GC projects beyond ADUs.` is explicitly retired and not carried forward. | `U2-B1` states the published service set and the business direction, not intake capacity. |
| Certification, licence, credential, insurance | **None present.** | The committed footer already states business credentials remain pending owner input; the spine adds nothing. |
| Partnership, affiliation, endorsement, client list | **None present.** | Deedseal is named only through the frozen first-user sentence, which is a product relationship the Owner adopted, not a partnership claim. |
| Completed project, portfolio, testimonial, review | **None present.** | Every image carries `U6-D1` or `U1-D`; both explicitly deny a completed project. |
| Autonomous AI action; AI as decision-maker | **None present.** No sentence has an automated actor as the subject of a decision verb. | `U3-B3` and `U4-B2` make the person the subject; the whole-spine rule bans "AI", "agent", "autonomous", "neural", "LLM" from public copy. |
| Completed Deedseal integration; `Powered by Deedseal` | **None present.** | `U8-B` is frozen and withholds it in its own second clause; `U8-X2` is `EVIDENCE_REQUIRED`. |
| Permit, zoning, eligibility, buildability, legal conclusion | **None present.** | `U4-D1` … `U4-D3` and `U6-D2` state the refusals explicitly. |
| PII, real customer facts, parcel or permit identifiers | **None present.** | The scenario in `interaction-scenario.md` is synthetic and carries no identity, contact, address, or parcel data. |

Every CTA destination in this deck resolves to a route published at the exact
base, or to the two external Deedseal destinations already committed in the
frozen module. No destination is invented, and the Residential Addition card
(`U2-S6`) carries no link.

### Executed sweep — every hit reviewed in context

A term-level sweep of the 61 renderable rows (`SHIPPABLE_NOW` and
`DESIGN_TARGET`) for `price`, `cost`, `schedul*`, `availab*`, `completed
project`, `eligib*`, `buildab*`, `permit*`, and `integration` returns **19
hits, all of them inside a negation, a refusal, or a withholding clause. Zero
asserted claims.**

| Rows | Hit terms | Why the hit is not a claim |
| :--- | :--- | :--- |
| `U1-D`, `U6-L2` | `permit`, `completed project` | Media disclosures. Both sentences exist to deny a completed project, an approved plan, and a permit. |
| `U3-D` | `scheduling` | States that scheduling is **not** live. |
| `U3-D2`, `U7-D` | `eligibility`, `buildability`, `permit`, `price`, `schedule` | The committed Concept Studio boundary line, verbatim: it enumerates the conclusions the Studio does **not** create. |
| `U4-D2` | `eligibility`, `buildability` | `Does not determine eligibility or buildability.` — a published refusal line. |
| `U5-B2` | `permitted` | "a purpose that was permitted" — consent vocabulary, not a building permit. |
| `U7-B1` | `submits, schedules` | States that the page schedules nothing. |
| `U8-B` | `integration` | The frozen sentence's own second clause, which withholds the integration claim. |

The certification, partnership, autonomous-AI, and `Powered by Deedseal` classes
return **no hit at all** in renderable copy. `Powered by Deedseal` appears in this
packet only as `U8-X2`, an `EVIDENCE_REQUIRED` row that must not render.
