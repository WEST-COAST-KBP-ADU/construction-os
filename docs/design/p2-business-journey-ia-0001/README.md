# P2-BUSINESS-JOURNEY-IA-0001 — construction-to-proof public experience

Packet index. Narrative, information architecture, interaction intent, and copy
structure only. **This packet changes no runtime byte.** It creates no visual
board, selects no visual direction, and adds no route.

| Field | Value |
| :--- | :--- |
| Packet ID | `P2-BUSINESS-JOURNEY-IA-0001` |
| Issue | [WEST-COAST-KBP-ADU/construction-os#247](https://github.com/WEST-COAST-KBP-ADU/construction-os/issues/247) |
| Dispatch | [`DISPATCH — READY_TO_LAUNCH`, comment 5272892811](https://github.com/WEST-COAST-KBP-ADU/construction-os/issues/247#issuecomment-5272892811) — `worker_id: 247 == issue_id: 247` |
| Repository | `WEST-COAST-KBP-ADU/construction-os` |
| Exact base | `main@cf099534cb0256a1748641972abbdad49fcf8645` |
| Branch | `agent/p2-business-journey-ia-0001` |
| Activity mode | docs-only mutation |
| Authority | Tony (`avoroncov971-maker`) alone selects, approves, merges, and publishes. |

Every repository citation in this packet is pinned to the exact base:

```
https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/<path>
```

## Artifacts

| File | Owns |
| :--- | :--- |
| `README.md` | Packet index, route and section inventory, claim-status legend, declared deviations, named gaps. |
| [`homepage-journey.md`](homepage-journey.md) | The eight-unit narrative spine; every required field per unit. |
| [`interaction-scenario.md`](interaction-scenario.md) | One lead → bounded work → verified record → graph memory scenario; graph dispatch and graph memory in human language; the bidirectional proof loop. |
| [`copy-deck.md`](copy-deck.md) | Every proposed public sentence with its source link and claim status; the literal-prohibition sweep. |
| [`integration-handoff.json`](integration-handoff.json) | Four non-overlapping future code domains with disjoint path leases and a declared mount seam. |

## Product truth this packet is built on

Fixed by the Owner in the
[dual-product correction](https://github.com/WEST-COAST-KBP-ADU/construction-os/issues/246#issuecomment-5272808181)
and in the [P2 director entry](https://github.com/kbp-core-engineering/kbp-dev-office/issues/373):

```
DeedSeal (Product 1) → West Coast KBP / KBP OS (first living construction-business use case)
  → public operating proof → DeedSeal
```

- The visible category is classical premium ADU and general construction. AI is
  infrastructure, never the hero, and never the category label.
- The operating idea must be understandable with no AI vocabulary: a real
  business objective becomes bounded work with explicit acceptance and refusal;
  accepted, permitted outcomes become the business's own connected memory.
- Product 1's green pulsing dot is forbidden on Product 2.
- [`src/lib/deedsealCrossReference.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/lib/deedsealCrossReference.ts)
  is byte-immutable here. Blob SHA at base: `caa6e9c26f33d164229747f8a1f855c0d0186ae3`.

## Claim-status legend

Every proposed public sentence in this packet carries exactly one status.

| Status | Meaning | Rendering rule |
| :--- | :--- | :--- |
| `SHIPPABLE_NOW` | Every assertion is traceable to committed bytes at the exact base and implies no capability the site does not already have. | May render in present tense. |
| `DESIGN_TARGET` | Describes intended operating behavior that exists as a committed contract or lab module but is **not** publicly demonstrated. | Must render as declared intent, never as present-tense operating fact, and must sit beside its own boundary line. |
| `EVIDENCE_REQUIRED` | Cannot ship until a named missing artifact exists. The missing artifact is named at the sentence. | Must not render at all until the named evidence lands and the Owner approves. |

`DESIGN_TARGET` is not a softer `SHIPPABLE_NOW`. A `DESIGN_TARGET` sentence that
loses its labeling becomes a false operating claim and fails the packet.

## Current public route inventory — exact bytes at the base

Eleven route files under `app/**/page.tsx`, expanding to nineteen public paths.
Sources:
[`src/lib/routes.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/lib/routes.ts),
[`src/lib/contentPages.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/lib/contentPages.ts),
[`src/lib/jurisdictionPages.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/lib/jurisdictionPages.ts),
[`src/lib/publicModelCatalog.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/lib/publicModelCatalog.ts).

| Route file | Public path(s) | Registry job | Disposition in the future implementation packet |
| :--- | :--- | :--- | :--- |
| `app/page.tsx` | `/` | Acquisition | **Replace** the narrative spine; see the section inventory below. |
| `app/models/page.tsx` | `/models` | Acquisition | **Keep.** Destination of U6 and U7. |
| `app/models/[model]/page.tsx` | `/models/adu-s-450`, `/models/adu-a-600`, `/models/adu-b-800` | Qualification | **Keep.** Unlinked from the homepage spine; reached through `/models`. |
| `app/studio/page.tsx` | `/studio` | Qualification | **Keep.** Homepage section demoted to a destination in U7. |
| `app/service-areas/page.tsx` | `/service-areas` | Qualification | **Keep.** Homepage section moved into U7. |
| `app/adu-builder/[jurisdiction]/page.tsx` | `/adu-builder/sacramento`, `/adu-builder/sacramento-county` | Qualification | **Keep.** Reached through `/service-areas`; no longer a homepage unit. |
| `app/services/[slug]/page.tsx` | `/services/detached-adu`, `/services/garage-conversion`, `/services/attached-adu`, `/services/jadu`, `/services/adu-legalization` | Acquisition | **Keep.** Destinations of U2. |
| `app/process/page.tsx` | `/process` | Trust | **Keep.** Destination of U4. |
| `app/about/page.tsx` | `/about` | Trust | **Keep.** Destination of U7. |
| `app/faq/page.tsx` | `/faq` | Trust | **Keep.** Destination of U7. |
| `app/compare/page.tsx` | `/compare` | Qualification | **Keep.** Currently unlinked from the homepage; becomes a U7 destination. |

No route is created, renamed, redirected, or removed by this packet or by the
implementation packet it hands off. `/services/adu-legalization` is a published
route with no homepage entry today; U2 gives it one. **Residential Addition has
no route at the base and must stay unresolved** — see
[`src/lib/homepageServices.ts`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/src/lib/homepageServices.ts).

## Current homepage section inventory — exact bytes at the base

Ten rendered units in
[`app/page.tsx`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/app/page.tsx),
in document order, plus three layout-level units from
[`app/layout.tsx`](https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/app/layout.tsx).

| # | Current unit (`aria-labelledby` / component) | Current heading at the base | Disposition | Lands in |
| :--- | :--- | :--- | :--- | :--- |
| H0 | `HeroBlueprintStage` | `From the first lead to a managed construction process.` | **Reframe** — composition and mechanism kept, first-fold copy replaced. | U1 |
| H1 | `product-planes-title` | `Three planes, each with a different job.` | **Replace** — its three limit lines survive as refusal lines inside the bounded-work unit; the "planes" framing does not. | U4 |
| H2 | `owned-models-title` | `The current release contains exactly three concept families.` | **Move** — release-bound record evidence belongs in the proof layer, not in the second fold. | U6 |
| H3 | `concept-studio-title` | `Explore anonymously, before a property is in view.` | **Move** — the strongest live anonymous action becomes the lead entry point of U3 and a destination in U7. | U3, U7 |
| H4 | `service-paths-title` (`#services`) | `Name the path, then open the right context.` | **Reframe** — becomes "what the business does", stated as construction work rather than as route selection. | U2 |
| H5 | `process-title` | `Orient, explore, review context, then make a human decision.` | **Reframe** — becomes how bounded work, owner decisions, and records move. | U4 |
| H6 | `service-context-title` | `City and County context stay separate.` | **Move** — jurisdiction separation is real and stays, one level down. | U7 |
| H7 | `truth-boundary-title` | `Keep facts, concepts, and unknowns visibly apart.` | **Reframe** — becomes the proof/record layer, absorbing H2's record evidence. | U6 |
| H8 | `final-exits-title` | `Choose the next context without opening an intake.` | **Reframe** — becomes the destination rail, absorbing H3 and H6. | U7 |
| H9 | `.spine-crosslink` aside | frozen Deedseal sentence | **Keep, byte-exact.** Presentation may change; the sentence and both destinations may not. | U8 |
| L1 | `DevelopmentNotice` | `Development preview` + two lines | **Reframe** — Owner verdict: the banner reads as unfinished; the truth (live intake off) is preserved as one calm line. Layout-level, not a homepage unit. | header/Hero domain |
| L2 | `Header` | primary navigation, `brand-seal` mark | **Keep.** Flagged: the `brand-seal` element is a Product 2 identity surface and must be checked against the Product 1 dot prohibition by the visual lane, not by this packet. | header/Hero domain |
| L3 | `Footer` | coverage, disclaimers, preview notice | **Keep.** Its disclaimer and no-guarantees lines are the site's standing truth floor and are not duplicated in the spine. | out of scope |

Ten homepage units become the eight public units in
[`homepage-journey.md`](homepage-journey.md). Nothing is deleted without a
destination: H1's limits move to U4, H2 to U6, H3 to U3 and U7, H6 to U7.

## Declared deviations

Recorded as fact, not reconciled silently.

1. **Executor model.** The Issue and the dispatch require one fresh ChatGPT
   Work / Codex engagement at exact model `gpt-5.6-sol`. This packet was
   authored by a Claude Code engagement at exact model `claude-opus-5`, launched
   by the Owner with the MS-02 worker line from
   [kbp-dev-office#373](https://github.com/kbp-core-engineering/kbp-dev-office/issues/373)
   ("Ты — воркер N. Выполни этот Issue дословно"). Zero subagents were used and
   there is no second author. The Owner decides whether the deviation is
   accepted; this packet does not decide it.
2. **Brand spelling.** The frozen public sentence and the repository source use
   `Deedseal`. Issue #247 and the Owner correction use `DeedSeal`. Public copy
   in this packet follows the committed bytes (`Deedseal`) because the frozen
   sentence cannot be reworded. The divergence is reported, not resolved.

## Named gaps

Facts this packet could not establish from the exact base. None is guessed.

| Gap | Why it matters | Who resolves it |
| :--- | :--- | :--- |
| Sibling proof-bridge output (`P2-DEEDSEAL-PROOF-BRIDGE-0001`, #248) is not yet committed. | U8's supporting copy around the frozen sentence is deliberately unset here; every candidate is marked `EVIDENCE_REQUIRED` and tagged `DEPENDS_ON_248` in the copy deck. | #248, then the implementation packet. |
| Sibling visual selection (`P2-HERO-VISUAL-SELECTION-0001`, #246) is unresolved. | U1's composition, imagery, and motion are visual-direction neutral here by instruction. Copy is specified; art direction is not. | Owner selection on #246. |
| No public integration record between Product 2 and Product 1 exists. | Every "integrated", "running on", or `Powered by DeedSeal` present-tense formulation stays `EVIDENCE_REQUIRED` and unshippable. | Product 1 publication gate. |
| Reception/memory and lead-funnel contracts are committed but not publicly deployed behavior. | U3, U4, and U5 are `DESIGN_TARGET` in full and must render as declared intent. | Strategy Phase B / C packets. |
| The header `brand-seal` mark has not been adjudicated against the Product 1 dot prohibition. | A Product 2 identity element could collide with a Product 1 device. | Visual lane, at an exact head, with eyes on a Preview. |
| Residential Addition has no published route. | U2 must present it without a link and without inventing one. | A future services packet. |

## Verification performed for this packet

Recorded in the Draft PR's command and evidence table with exact tails. Docs-only
diff: no browser, runtime, deployment, or Production evidence is claimed, and no
Preview is claimed.
