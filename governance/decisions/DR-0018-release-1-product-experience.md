# DR-0018: Release 1 product, experience, and product graph-memory contract

- **Status:** proposed
- **Date:** 2026-08-11
- **Decider:** owner (`avoroncov971-maker`)
- **Packet:** `RELEASE1-PRODUCT-EXPERIENCE-001`, Issue #174, `gate:g1`,
  `domain:product-definition`
- **Pinned base:** `main@22bccbf413fefac19adc3de693a2b415360459a6`
- **Governing records:** `governance/BOUNDARIES.md`,
  `governance/office/OPERATING-MODEL-v5.md`,
  `governance/office/PROGRAM-PLAN-v1.md`
- **Related:** DR-0004, DR-0005, DR-0008, DR-0011, DR-0012, DR-0013, DR-0014,
  DR-0015, DR-0016, DR-0017; Issues #142, #151, #161, #162, #174, #177
- **Program position:** Stage 1 deliverable. Exit `G1 DECISION READY` is reached
  only by the Owner's adoption and merge, never by review alone.

This record decides what Release 1 of the West Coast KBP ADU customer platform
is. It authorizes no implementation, changes no application byte, produces no
asset, and opens no external effect. It is a definition record only.

---

## Evidence classification legend

Every load-bearing statement in this record carries exactly one marker.

| Marker | Meaning | Authority |
| :--- | :--- | :--- |
| `[F]` | Verified fact observed in merged `main` at the pinned base, in a merged decision record, or in verified live-site evidence | Truth |
| `[OD]` | Owner direction recorded in a GitHub Issue or comment, not yet a merged record | Direction, not adoption |
| `[PD]` | Proposed decision made by this record, awaiting Owner adoption | None until merged |
| `[DD]` | Deferred decision — explicitly not made here, with the named gate that must make it | None |
| `[U]` | Unknown — the fact does not exist in any authoritative source available at the pinned base | None |

A `[PD]` marker never becomes `[F]` by review, by a green check, or by this
record's existence. It becomes binding only at the Owner's merge.

### Evidence base and its currency

`[F]` The current-truth product inventory used by this record is the
`RESULT — RELEASE1-EVIDENCE-001` comment on Issue #162, produced at
`main@e32be9ea7cb265f6c6c0a65002a59bfe1419916c`.

`[F]` `git diff --name-only e32be9ea7cb265f6c6c0a65002a59bfe1419916c
22bccbf413fefac19adc3de693a2b415360459a6 -- app src public package.json
package-lock.json` returns zero paths. The application surface, catalog data,
media, and dependency set are byte-identical between the evidence anchor and
this record's pinned base. The Issue #162 inventory is therefore current at
`main@22bccbf4`, and every product fact below was additionally re-verified
against the pinned base bytes named in each row.

`[F]` The fourteen paths that do differ between the two commits are the Stage 0
control-plane and governance additions merged by PR #172 and the CLAUDE.md /
STATE.md updates that accompanied them. None of them is an application path.

---

## Context

`[F]` The platform ships 18 public URLs from an 11-pattern route registry in
`src/lib/routes.ts`, all `publicationState: "published"`. All 18 return HTTP 200
behind a single 308 redirect from the apex host to the `www` host.

`[F]` The site contains no form, no input, no `mailto:`, no `tel:`, no `fetch`,
no storage primitive, and no analytics primitive on any of the 18 routes. There
is no lead consequence anywhere. This is the intended state under DR-0013 and
DR-0015, not a defect.

`[F]` Two disjoint model taxonomies exist. The public catalog release
`2026.09.0` publishes `adu-s-450`, `adu-a-600`, `adu-b-800`, each with
`maturity: "concept_only"` and digest-verified projection. The Studio catalog
release `2026.08.0` publishes `studio-450`, `one-bed-600`, `two-bed-800` and is
imported directly by `StudioWorkbench.tsx`. The two identity spaces never meet
in code.

`[F]` Of the three Studio archetypes, only `one-bed-600` resolves a facade
image. `resolveA600ConceptAsset` in `HardieMotionStage.tsx` returns `null` for
`studio-450` and `two-bed-800`, and both fall back to an image-free panel with
every facade control `disabled`.

`[F]` No Owner-adopted record decides whether Release 1 exposes non-A600 models
in the Studio, which host is canonical, which navigation set is primary, which
municipalities are published as served, or whether the dormant portal content
system returns. Issue #162 registers these as gaps H-1 through H-6.

`[F]` `governance/office/OPERATING-MODEL-v5.md` and
`governance/office/PROGRAM-PLAN-v1.md` each retain the literal string
`Status: **PROPOSED**` together with the clause "Operative only from the commit
at which the Owner merges it." Both files were merged to `main` by PR #172 at
`main@22bccbf4`. By their own terms they are therefore operative at this
record's pinned base, and this record treats them as binding.

Stage 1 of `PROGRAM-PLAN-v1.md` requires that Release 1 be decided in exact
terms before anything is designed or built. This record is that decision.

---

## 1. Global objective and Release 1 product definition

### 1.1 The single global Objective

`[PD]` Exactly one stable top-level Objective governs the West Coast KBP ADU
customer platform. It does not change between releases; releases are decided
against it.

| Field | Value |
| :--- | :--- |
| Objective ID | `OBJ-P2-1` |
| Stability | Permanent. Never renumbered, never forked, never duplicated. |
| Statement | Build and operate the West Coast KBP ADU customer platform so that a homeowner considering an accessory dwelling unit can understand the owned model catalog, configure a specific A600 concept, and reach a bounded human handoff, with every published statement traceable to committed evidence and every property-specific conclusion withheld from automation. |
| Product | Product 2 — West Coast KBP ADU customer platform |
| Repository | `WEST-COAST-KBP-ADU/construction-os` |
| Authority | The Objective orders and traces work. It approves nothing, adopts nothing, dispatches nothing, and launches no worker. |

`[F]` Product 1 / Deedseal is the controlled-engineering foundation on which
Product 2 is *intended* to rely. `[DD]` Every public label, cross-brand
transition, public dependency claim, and cross-repository technical binding
between Product 2 and Product 1 is deferred — see §11.1.

### 1.2 Release 1 product definition

| Field | Release 1 |
| :--- | :--- |
| User | A homeowner or small property owner in the DR-0014 core market who is evaluating whether an ADU is worth pursuing, and who has not committed to a vendor. |
| Problem | ADU information is fragmented, vendor claims are unverifiable, and configuration tools either capture contact details before delivering value or present decorative imagery as if it were a designed building. |
| Value | A truthful, no-contact, no-tracking product surface: an owned model catalog with explicit maturity and explicit unknowns, one physically coherent configurable A600 concept, an evidence-traceable process narrative, and a deterministic configuration identity the visitor can carry away without giving anything up. |
| Completion boundary | Release 1 is complete when the nine contract routes in §3 satisfy every §9 quality target and every §10 visual condition, verified on a combined `main` Preview at the exact head, and the Owner merges. Release 1 is not complete on a green check, an isolated fragment Preview, or a review verdict. |

#### Included scope — Release 1 contains exactly these

`[PD]`

1. The nine contract routes enumerated in §3.1, at the three viewports in §9.1.
2. One configurable A600 Studio experience, A600-only, per §5 and §6.
3. The CTA inventory in §4 and no other CTA.
4. The claims matrix in §7 as the complete set of public claims.
5. The visual production contract in §10, bound to PROGRAM-PLAN V1–V6.
6. The quality targets in §9, every one numeric or binary.
7. The product graph-memory contract in §8, as a contract — with the Release 1
   instantiation boundary stated in §8.6.

#### Excluded scope — Release 1 contains none of these

`[PD]`

1. Any contact, intake, form, booking, email, or phone surface.
2. Any analytics, pixel, tag manager, cookie, session replay, or attribution
   primitive.
3. Any client-facing GIS, parcel, price, schedule, permit, zoning, entitlement,
   feasibility, or buildability output.
4. Any persisted customer, property, or configuration record.
5. Any non-A600 configurable Studio experience.
6. Any public Product 1 / Deedseal brand, label, or dependency claim.
7. Any multilingual public voice, telephony, or reception surface.
8. Any autonomous real-world action or external business effect.

`[F]` Exclusions 1–3 restate DR-0015 §2 closed surfaces and are not narrowed by
this record. Exclusion 4 restates `governance/BOUNDARIES.md` retention rules.

### 1.3 Delivery graph — `Objective → Module → WorkStream → WorkItem`

`[PD]` The delivery graph is a deterministic tracing structure. It has exactly
four node kinds and exactly three structural edge kinds.

#### Node kinds

| Kind | Identity form | Cardinality rule |
| :--- | :--- | :--- |
| `Objective` | `OBJ-P2-1` | Exactly one, permanently. |
| `Module` | `MOD-NN` | Each Module has exactly one `belongs_to_objective` edge, and it targets `OBJ-P2-1`. |
| `WorkStream` | `WS-NNx` | Each WorkStream has exactly one `belongs_to_module` edge. |
| `WorkItem` | `WI-NNNN` | Each WorkItem has exactly one `belongs_to_workstream` edge. |

#### Structural edges — deterministic and acyclic

| Edge | Domain → Range | Cardinality |
| :--- | :--- | :--- |
| `belongs_to_objective` | `Module` → `Objective` | exactly 1 |
| `belongs_to_module` | `WorkStream` → `Module` | exactly 1 |
| `belongs_to_workstream` | `WorkItem` → `WorkStream` | exactly 1 |

Because each edge is exactly-one and the graph is acyclic, every WorkItem,
WorkStream, and Module resolves to `OBJ-P2-1` by exactly one path. That single
path is the objective edge required by Issue #174 §1.

#### Traceability edges — attach external artifacts to a WorkItem only

| Edge | Domain → Range | Cardinality | Note |
| :--- | :--- | :--- | :--- |
| `realized_by_issue` | `WorkItem` → GitHub Issue URL | 0..n | A packet Issue. |
| `realized_by_branch` | `WorkItem` → branch name | 0..n | One branch per packet. |
| `realized_by_pull_request` | `WorkItem` → PR URL | 0..n | One Draft PR per packet. |
| `reviewed_at_head` | `WorkItem` → 40-hex SHA | 0..n | A new commit invalidates the prior verdict. |
| `decided_by_owner` | `WorkItem` → Owner comment or merge commit URL | 0..n | Owner only. |
| `evidenced_by` | `WorkItem` → committed evidence path or artifact URL | 0..n | Artifact, never assertion. |
| `observed_in_deployment` | `WorkItem` → deployment ID plus canonical-domain observation | 0..n | Preview is evidence, not acceptance. |
| `gated_by` | `WorkItem` → gate ID (`G1`, `G2A`, `G2B`, `G2C`, `G3`, `G4`, `G5`, `G6`) | 0..n | Ordering only. |

`[PD]` **Authority boundary of the delivery graph.** The graph orders and traces
work. It never approves, adopts, certifies, merges, dispatches, launches a
worker, deploys, or triggers an external effect. It never infers a state that no
artifact records. An absent edge means *not recorded*, never *not true* and
never *approved*.

#### Module register — every Module has exactly one edge to `OBJ-P2-1`

| Module | Name | `belongs_to_objective` | Release 1 in scope |
| :--- | :--- | :--- | :--- |
| `MOD-01` | Arrival and narrative | `OBJ-P2-1` | yes |
| `MOD-02` | Owned model catalog | `OBJ-P2-1` | yes |
| `MOD-03` | A600 configuration Studio | `OBJ-P2-1` | yes |
| `MOD-04` | Process and trust content | `OBJ-P2-1` | yes |
| `MOD-05` | Services and coverage | `OBJ-P2-1` | yes |
| `MOD-06` | Continuation and evidence retrieval | `OBJ-P2-1` | yes |
| `MOD-07` | Visual production and asset binding | `OBJ-P2-1` | yes |
| `MOD-08` | Quality harness and release verification | `OBJ-P2-1` | yes |
| `MOD-09` | Product graph memory | `OBJ-P2-1` | yes |
| `MOD-10` | Claims and publication integrity | `OBJ-P2-1` | yes |
| `MOD-11` | Qualification and human handoff | `OBJ-P2-1` | no — Stage 7 |
| `MOD-12` | Reception and memory | `OBJ-P2-1` | no — Stage 8 |
| `MOD-13` | Catalog expansion beyond A600 | `OBJ-P2-1` | no — Stage 9 |

#### WorkStream and WorkItem register

| WorkItem | Statement | WorkStream | Module | Gate |
| :--- | :--- | :--- | :--- | :--- |
| `WI-0101` | Lock the Home hero contract, its single approved A600 master, and its two CTAs | `WS-01A` Home composition | `MOD-01` | `G2A` |
| `WI-0102` | Lock the Home section inventory and each section's exit | `WS-01A` Home composition | `MOD-01` | `G2A` |
| `WI-0103` | Bind every Home image to a Stage 4 model-bound master with provenance | `WS-01B` Home media binding | `MOD-01` | `G4` |
| `WI-0201` | Keep `/models` bound to validated public release `2026.09.0` with digest recomputation | `WS-02A` Catalog projection | `MOD-02` | `G3` |
| `WI-0202` | Lock the A600 detail route contract as the single configurable model entry | `WS-02A` Catalog projection | `MOD-02` | `G2A` |
| `WI-0203` | State non-A600 concept-only disclosure on `/models` and on each non-A600 detail route | `WS-02B` Non-A600 disclosure | `MOD-02` | `G1` |
| `WI-0301` | Implement the §5 state machine with every state, event, guard, and transition named | `WS-03A` Studio state machine | `MOD-03` | `G5` |
| `WI-0302` | Preserve deterministic configuration identity and its pinned replay vector | `WS-03A` Studio state machine | `MOD-03` | `G3` |
| `WI-0303` | Make every refusal state reachable through an exposed control | `WS-03A` Studio state machine | `MOD-03` | `G5` |
| `WI-0304` | Bind the Studio to the `2026.09.0` A600 identity and retire the parallel `2026.08.0` archetype identity from the Release 1 surface | `WS-03B` Model binding | `MOD-03` | `G5` |
| `WI-0305` | Keep executable geometry authoritative and never replaced by a decorative image | `WS-03B` Model binding | `MOD-03` | `G4` |
| `WI-0306` | Gate every material selection on the fail-closed material registry | `WS-03C` Material binding | `MOD-03` | `G2B` |
| `WI-0307` | Bind every Studio facade state to a Stage 4 model-bound master | `WS-03C` Material binding | `MOD-03` | `G4` |
| `WI-0401` | Lock the `/process` contract and its journey exit | `WS-04A` Content routes | `MOD-04` | `G2A` |
| `WI-0402` | Lock the `/about` contract | `WS-04A` Content routes | `MOD-04` | `G2A` |
| `WI-0403` | Lock the `/faq` contract and its journey exit | `WS-04A` Content routes | `MOD-04` | `G2A` |
| `WI-0404` | Correct the self-referential breadcrumb parent on the four content routes | `WS-04B` Content defects | `MOD-04` | `G5` |
| `WI-0501` | Lock the five `/services/[slug]` contracts | `WS-05A` Service routes | `MOD-05` | `G2A` |
| `WI-0502` | Lock the `/service-areas` contract and its official-source discipline | `WS-05B` Coverage | `MOD-05` | `G2A` |
| `WI-0503` | Align the machine-readable service-area claim with the §7 published list | `WS-05B` Coverage | `MOD-05` | `G6` |
| `WI-0601` | Lock the journey-exit contract on `/studio`, `/process`, `/faq` | `WS-06A` Journey exits | `MOD-06` | `G2A` |
| `WI-0602` | Lock configuration-identity retrieval, its copy affordance, and its non-persistence statement | `WS-06B` Evidence retrieval | `MOD-06` | `G5` |
| `WI-0701` | Produce the complete V2 sealed scene recipe for every Release 1 master view | `WS-07A` Sealed recipe | `MOD-07` | `G2B` |
| `WI-0702` | Produce and actual-size review the 1440 / 820 / 390 derivatives | `WS-07B` Derivatives | `MOD-07` | `G4` |
| `WI-0703` | Record complete provenance for every published asset at the `docs/media/` standard | `WS-07C` Provenance | `MOD-07` | `G2B` |
| `WI-0801` | Establish rendered-viewport, accessibility, and console-error evidence | `WS-08A` Rendered evidence | `MOD-08` | `G2C` |
| `WI-0802` | Establish a repository-defined enforcement pipeline for the declared gates | `WS-08B` Enforcement | `MOD-08` | `G2C` |
| `WI-0803` | Enforce the §9.6 bundle and Core Web Vitals budgets | `WS-08C` Budgets | `MOD-08` | `G3` |
| `WI-0804` | Enforce canonical host, sitemap host, robots host, and structured-data coverage | `WS-08D` Publication integrity | `MOD-08` | `G6` |
| `WI-0901` | Maintain the §1.3 delivery graph as derived, deterministic, and authority-free | `WS-09A` Delivery graph | `MOD-09` | `G1` |
| `WI-0902` | Maintain the §8 customer-domain graph contract and its instantiation boundary | `WS-09B` Customer-domain graph | `MOD-09` | `G1` |
| `WI-1001` | Keep the §7 claims matrix the complete and current set of public claims | `WS-10A` Claims | `MOD-10` | `G6` |
| `WI-1002` | Bring `/llms.txt` inside the governed claim surface or withdraw it | `WS-10B` Ungoverned surfaces | `MOD-10` | `G6` |
| `WI-1003` | Remove manufacturer and color names from public asset paths | `WS-10C` Asset naming | `MOD-10` | `G4` |

`[PD]` No Issue, branch, pull request, review, Owner decision, evidence
artifact, or deployment observation enters this graph except as a traceability
edge on exactly one WorkItem. Nothing attaches directly to a Module, a
WorkStream, or the Objective.

---

## 2. Complete journey and module map

`[PD]` The Release 1 journey has eight named steps. Every step names its module,
its entry transition, and its exit transitions. There is no unnamed transition
and no implicit exit.

| Step | Name | Module | Entry transition | Exit transitions |
| :--- | :--- | :--- | :--- | :--- |
| `J1` | Arrival | `MOD-01` | External entry to `/`; header link from any route; footer link from any route | `T-J1-A` → `J2` catalog via "Explore models"; `T-J1-B` → `J4` configuration via "Open Concept Studio"; `T-J1-C` → `J6` services; `T-J1-D` → `J7` coverage; `T-J1-E` → `J5` process/trust |
| `J2` | Catalog comprehension | `MOD-02` | `T-J1-A`; header "Models"; breadcrumb from a model detail route | `T-J2-A` → `J3` A600 detail; `T-J2-B` → `J4` configuration; `T-J2-C` → `J2R` non-A600 disclosure |
| `J2R` | Non-A600 concept-only disclosure | `MOD-02` | `T-J2-C` | `T-J2R-A` → `J3` A600 detail; `T-J2R-B` → `J2` catalog |
| `J3` | A600 model understanding | `MOD-02` | `T-J2-A`; `T-J2R-A`; direct entry to `/models/adu-a-600` | `T-J3-A` → `J4` configuration; `T-J3-B` → `J2` catalog |
| `J4` | A600 configuration | `MOD-03` | `T-J1-B`; `T-J2-B`; `T-J3-A`; direct entry to `/studio` | `T-J4-A` → `J5` process; `T-J4-B` → `J5` FAQ; `T-J4-C` → `J8` evidence retrieval; `T-J4-R` → `S6` refusal, in-place, per §5 |
| `J5` | Process and trust | `MOD-04` | `T-J1-E`; `T-J4-A`; `T-J4-B`; header "ADU Process"; header "About" | `T-J5-A` → `J4` configuration; `T-J5-B` → `J5` peer trust route; `T-J5-C` → `J6` services |
| `J6` | Service comprehension | `MOD-05` | `T-J1-C`; `T-J5-C`; service explorer from `/about`, `/compare`, any service route | `T-J6-A` → `J6` peer service route; `T-J6-B` → `J7` coverage |
| `J7` | Coverage comprehension | `MOD-05` | `T-J1-D`; `T-J6-B`; header "Service Areas" | `T-J7-A` → external official source, same tab; `T-J7-B` → jurisdiction context route |
| `J8` | Evidence retrieval | `MOD-06` | `T-J4-C` | `T-J8-A` → clipboard success, in-place; `T-J8-F` → clipboard failure, in-place, per §4 |

### 2.1 Decision and approval steps are absent from Release 1 by decision

`[PD]` Issue #174 §2 names "decision/approval" as a journey step. In Release 1
there is no visitor-facing decision or approval step, because DR-0015 §2 keeps
intake, booking, and every contact surface closed and
`governance/BOUNDARIES.md` places AI outside the visitor decision path.

`[PD]` The Release 1 journey therefore terminates at `J8`. Decision and approval
are modeled in the customer-domain graph as node types `Decision` and `Approval`
(§8.2) with **zero Release 1 instances** and an Owner-only authority rule. The
visitor-facing decision and approval steps are `[DD]` deferred to Stage 7,
`MOD-11`, and require the separate privacy, consent, retention, and recipient
decisions named in PROGRAM-PLAN Stage 7.

This is a stated absence with a named later gate, not an omission.

### 2.2 Named journey defects carried into Release 1 work

| ID | Defect | `[F]` source | WorkItem |
| :--- | :--- | :--- | :--- |
| `JD-1` | Header and footer navigation are two disjoint hand-maintained sets, neither derived from the route registry | `Header.tsx` local `primaryNavigation`; `siteConfig.nav` | `WI-0804` |
| `JD-2` | Header "Models" and header CTA "Explore models" are adjacent duplicate links to `/models` | `Header.tsx` | `WI-0804` |
| `JD-3` | `ContentHero` passes each page's own URL as `parentHref` on `/about`, `/compare`, `/process`, `/faq` | `ContentHero.tsx` | `WI-0404` |
| `JD-4` | `/studio` offers no in-body return to `/models` or `/models/[model]` | `journeyExits.ts` | `WI-0601` |
| `JD-5` | `/services/adu-legalization` is absent from the Home service set | `homepageServices.ts` | `WI-0102` |

---

## 3. Exact route and publication contract

### 3.1 The nine Release 1 contract routes

`[PD]` Release 1 contracts exactly these nine routes. Each row's authoritative
source is the merged path at `main@22bccbf4`.

| # | Route | Public / private | Audience | Purpose | Entry | Exit | CTA | Required state | Empty / error / refusal state | Authoritative source | Release 1 disposition |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| R1 | `/` | Public | Unqualified arriving homeowner | Acquisition — establish the owned catalog and the truth boundary | External entry; header logo; footer | `T-J1-A`…`T-J1-E` | "Explore models" → `/models`; "Open Concept Studio" → `/studio` | Validated public release `2026.09.0`; `homepageServices`; `jurisdictionPages` | Release-identity assertion fails closed and the route does not build; unresolved service card renders with no link and a stated reason; no partial catalog is ever rendered | `app/page.tsx` | Retained, re-targeted at `G2A`, re-mediated at `G4` |
| R2 | `/models` | Public | Homeowner comparing owned models | Acquisition — publish three concept-only families with explicit unknowns | `T-J1-A`; header "Models" | `T-J2-A`…`T-J2-C` | "View {model} model" ×3 → `/models/{id}`; "Open Concept Studio" → `/studio` | Validated public release `2026.09.0` with digest recomputation | Digest or maturity drift fails closed at build; zero models is a build failure, never an empty list | `app/models/page.tsx` | Retained; non-A600 rows carry the §6.3 disclosure |
| R3 | `/models/adu-a-600` | Public | Homeowner evaluating the A600 | Qualification — the single configurable model record | `T-J2-A`; `T-J2R-A`; direct entry | `T-J3-A`; `T-J3-B` | "Open Concept Studio" → `/studio`; "Back to models" → `/models` | Validated `adu-a-600` entry; `dynamicParams = false` | Unknown model id returns `notFound()`; no model is synthesized | `app/models/[model]/page.tsx` | Retained; becomes the Release 1 configuration entry point |
| R4 | `/studio` | Public | Homeowner configuring an A600 concept | Qualification — deterministic, anonymous A600 configuration | `T-J1-B`; `T-J2-B`; `T-J3-A`; direct entry | `T-J4-A`…`T-J4-C`; `T-J4-R` | "Open Concept Studio" is the inbound CTA; outbound "See the ADU process" → `/process`; "Review common questions" → `/faq`; "Copy ID" → clipboard | A600 model identity; catalog release; material registry eligibility | Every invalid state produces a named refusal per §5.4; no image-free silent fallback is permitted in Release 1 | `app/studio/page.tsx`, `StudioWorkbench.tsx` | Retained; restricted to A600 per §6 |
| R5 | `/process` | Public | Homeowner assessing how work is controlled | Trust — the controlled-execution narrative | `T-J1-E`; `T-J4-A`; header | `T-J5-A`; `T-J5-B` | "Open Concept Studio" → `/studio`; "Review common questions" → `/faq` | `processPage`; `journeyExits.process` | Missing content record fails the build; the route never renders a partial narrative | `app/process/page.tsx` | Retained, re-targeted at `G2A` |
| R6 | `/services/[slug]` | Public | Homeowner matching a need to a service | Acquisition — five service records | `T-J1-C`; `T-J5-C`; service explorer | `T-J6-A`; `T-J6-B` | Related-service links → `/services/{slug}`; service explorer → 5× `/services/{slug}` | `servicePages`; `dynamicParams = false` | Unknown slug returns `notFound()`; no service is synthesized | `app/services/[slug]/page.tsx` | Retained; all five slugs stay published |
| R7 | `/service-areas` | Public | Homeowner checking coverage | Qualification — jurisdiction context with official sources | `T-J1-D`; `T-J6-B`; header | `T-J7-A`; `T-J7-B` | "Open {jurisdiction} context" ×2 → `/adu-builder/{slug}`; official-source outbound links | `jurisdictionPages` | Every regulatory item that lacks an official source is withheld, never softened; each published item carries `Requires official source verification.` | `app/service-areas/page.tsx` | Retained; claim list aligned by `WI-0503` |
| R8 | `/about` | Public | Homeowner assessing the operator | Trust — operating model and principles | `T-J1-E`; header | `T-J5-B`; `T-J5-C` | Service explorer → 5× `/services/{slug}` | `aboutPage` | Missing content record fails the build; no business credential is rendered until the §7 Owner-confirmation rows are supplied | `app/about/page.tsx` | Retained; unconfirmed business claims stay withheld |
| R9 | `/faq` | Public | Homeowner with unresolved questions | Trust — bounded answers that refuse property conclusions | `T-J4-B`; `T-J5-B`; footer | `T-J5-A`; `T-J5-B` | "Open Concept Studio" → `/studio`; "See the ADU process" → `/process` | `faqPage`; `journeyExits.faq` | Any answer that would become a property-specific conclusion is withheld and the truth boundary is restated | `app/faq/page.tsx` | Retained, re-targeted at `G2A` |

### 3.2 Success, failure, and refusal behavior for every contract route

| Route | Success | Failure | Refusal |
| :--- | :--- | :--- | :--- |
| R1 `/` | Route returns 200, renders hero plus every declared section, and every image is a `G4` model-bound master | Build fails closed on release-identity drift; a served 5xx is a §9.8 violation | Renders the unresolved service card with its stated reason and no link, rather than inventing a destination |
| R2 `/models` | Returns 200 and lists exactly the three validated `2026.09.0` families with maturity and unknowns visible | Build fails closed on digest, count, or maturity drift | Withholds any maturity promotion that lacks separate evidence |
| R3 `/models/adu-a-600` | Returns 200 with the validated A600 record and both CTAs reachable | Build fails closed if `adu-a-600` is absent from the validated release | Returns `notFound()` for any model id outside the release |
| R4 `/studio` | Returns 200, reaches `S3 READY`, and displays a stable 12-character configuration identity | Build fails closed on catalog validation failure; a runtime exception resolves to `S6 REFUSED` with a named reason code, never a blank stage | `S6 REFUSED` per §5.4, with the reason code rendered and every prior valid state preserved |
| R5 `/process` | Returns 200 with the full narrative and its journey exit | Build fails closed on a missing content record | Withholds any step that would state a schedule or approval outcome |
| R6 `/services/[slug]` | Returns 200 for each of the five slugs with its service record and related links | Build fails closed on a missing service record | Returns `notFound()` for any slug outside `servicePages` |
| R7 `/service-areas` | Returns 200 with each jurisdiction, its official sources, and the required verification sentence | Build fails closed on a missing jurisdiction record | Withholds any regulatory item lacking an official source rather than paraphrasing it |
| R8 `/about` | Returns 200 with the operating-model content | Build fails closed on a missing content record | Withholds every business credential and project fact not supplied through §7 |
| R9 `/faq` | Returns 200 with every answer plus its journey exit | Build fails closed on a missing content record | Withholds any answer that would become a property-specific conclusion, and restates the truth boundary |

### 3.3 Published routes outside the Release 1 contract

`[F]` The registry publishes 18 URLs. The nine contract routes above expand to
13 of them. The remaining five, plus one static public claim surface, are
recorded here so the contract does not silently contradict merged truth.

| URL | `[F]` status at base | `[PD]` Release 1 disposition |
| :--- | :--- | :--- |
| `/models/adu-s-450` | Published, 200, `maturity: concept_only` | Remains published unchanged; carries the §6.3 non-A600 disclosure; not a contract route; not configurable |
| `/models/adu-b-800` | Published, 200, `maturity: concept_only` | Remains published unchanged; carries the §6.3 non-A600 disclosure; not a contract route; not configurable |
| `/compare` | Published, 200, reachable from the footer only | Remains published unchanged; not a contract route; not re-targeted at `G2A`; reachability defect recorded as `JD-1` |
| `/adu-builder/sacramento` | Published, 200, official-source jurisdiction context | Remains published unchanged; every regulatory item continues to carry `Requires official source verification.` |
| `/adu-builder/sacramento-county` | Published, 200, official-source jurisdiction context | Remains published unchanged; every regulatory item continues to carry `Requires official source verification.` |
| `/llms.txt` | Served 200 as a static asset; absent from the registry and the sitemap; carries market and operating claims; covered by no test | Governed by `WI-1002` before `G6`: brought inside the §7 claims matrix or withdrawn. Until then it is an ungoverned public claim surface and is recorded as residual risk `RR-4` |

`[PD]` "Not a contract route" means the route stays published and truthful but
is not carried into the `G2A` visual target, does not consume a Release 1 visual
budget, and is not a `G6` release blocker on its own visual quality. Its claims
remain fully bound by §7.

### 3.4 Canonical host

`[F]` `siteConfig.url` is `https://westcoastkbp.com`. Every emitted canonical,
every one of the 18 sitemap `<loc>` values, the `robots.txt` `Sitemap:` line,
and `metadataBase` name that apex host. Production serves `www` and
308-redirects the apex. No test asserts canonical host.

`[PD]` The Release 1 canonical host is `https://www.westcoastkbp.com` — the host
that actually serves the bytes. Canonical, sitemap, robots, and `metadataBase`
are aligned to it by `WI-0804` before `G6`. This resolves gap H-3 and is
recorded as `CONFLICT-2` in §13.

---

## 4. CTA contract

`[PD]` Release 1 contains exactly these seven CTA classes. No CTA exists without
a named destination and an observable result. Any control that would produce no
observable result is removed, not disabled.

| CTA | Label at base | Location | Destination | Payload | Consent | Success | Failure | Retry | Duplicate submission | Privacy behavior |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `CTA-1` | "Explore models" | `/` hero; header | `/models` | none | not required — no data leaves the browser | Client-side navigation completes and `/models` renders | Navigation failure surfaces the browser's own error; no state is lost because none exists | Visitor re-activates the link; behavior is identical | Idempotent; repeated activation is indistinguishable from one | No identifier, cookie, storage write, or network call |
| `CTA-2` | "Open Concept Studio" | `/` hero; `/` Studio section; `/models`; `/models/[model]`; `/process`; `/faq` | `/studio` | none | not required | `/studio` renders and reaches `S3 READY` | Navigation failure surfaces the browser's own error | Identical on re-activation | Idempotent | No identifier, cookie, storage write, or network call |
| `CTA-3` | "View {model} model" | `/models` model cards | `/models/{modelId}` | none | not required | The model detail route renders the validated record | Unknown id resolves to `notFound()`; no model is synthesized | Identical on re-activation | Idempotent | No identifier, cookie, storage write, or network call |
| `CTA-4` | "See the ADU process" / "Review common questions" | `/studio`, `/process`, `/faq` journey exits | `/process` or `/faq` | none | not required | The destination route renders with its journey exit | Navigation failure surfaces the browser's own error | Identical on re-activation | Idempotent | No identifier, cookie, storage write, or network call |
| `CTA-5` | "Copy ID" | `/studio` current-configuration block | Browser clipboard | The full configuration identity string | not required — the visitor initiates the write to their own clipboard | Clipboard receives the identity; the live region states that nothing was saved or sent | Clipboard denial states that copy is unavailable, the identity stays visible, and nothing was sent | Visitor re-activates; behavior is identical | Idempotent; the clipboard holds one value | No network call; nothing persists in the page beyond the session |
| `CTA-6` | "Add current" / "Compare concepts" | `/studio` comparison rail | In-memory comparison list, maximum three entries | The current configuration input object | not required — memory only | The configuration enters the list and the live region states that nothing was saved or sent | If the list already holds three entries, the "Add current" control is absent rather than failing silently | Visitor re-activates; behavior is identical | The current configuration is de-duplicated before insertion, so one configuration can occupy at most one slot | Cleared on reload; no storage, no network call |
| `CTA-7` | "Open {jurisdiction} context" and official-source links | `/service-areas`; `/adu-builder/[jurisdiction]` | Internal jurisdiction route, or an external `.gov` source in the same tab | none | not required | The destination loads | An unreachable external source is the external host's failure; the internal route continues to render its own content and the verification sentence | Visitor re-activates | Idempotent | `rel="noreferrer"` is retained on every external link; no referrer is sent |

### 4.1 Refusal behavior for every CTA

`[PD]` Refusal is a stated outcome on the control itself. A silently inert or
unexplained control is a `G5` failure.

| CTA | Refusal condition | Refusal behavior |
| :--- | :--- | :--- |
| `CTA-1` | none — `/models` is always publishable, or the build fails closed | If `/models` cannot be built from a validated release, the route is not published and the CTA is absent rather than dead |
| `CTA-2` | none — `/studio` is always publishable, or the build fails closed | If `/studio` cannot be built, the CTA is absent rather than dead |
| `CTA-3` | The model id is outside the validated release | The card is not rendered; no synthesized model and no dead link |
| `CTA-4` | none — both destinations are contract routes | If a destination is unpublishable, the exit renders only its remaining valid action |
| `CTA-5` | The browser denies clipboard access | The live region states that copy is unavailable, the identity stays visible, and nothing was sent |
| `CTA-6` | The comparison list already holds three entries | The "Add current" control is absent and the three-entry limit is stated |
| `CTA-7` | A jurisdiction has no official source for an item | The item is withheld with `Requires official source verification.` rather than paraphrased, and no link is rendered |
| every CTA | The A600-only rule denies a non-A600 configuration | Reason code `model_not_configurable_in_release_1` with the §6.3.2 disclosure text |

### 4.2 CTA prohibitions for Release 1

`[PD]`

1. No CTA may collect, transmit, or persist any visitor input. `[F]` Zero
   egress, storage, and analytics primitives exist at the pinned base, and
   `zeroEgress.test.ts` asserts this for the Studio visitor path.
2. No CTA may promise a price, a schedule, an approval, a permit outcome, or a
   buildability outcome.
3. No CTA may exist whose destination is unnamed or whose result is
   unobservable.
4. A control that is unavailable states the exact reason on the control itself.
   A silently inert control is a `G5` failure.

---

## 5. A600 Studio state machine

`[PD]` The Release 1 Studio is a deterministic state machine over A600 only. It
has eight named states, nine named events, four named guards, fifteen named
transitions, and no implicit
fallback. Every transition below is named. Any state or transition not named
here does not exist in Release 1.

### 5.1 States

| State | Name | Meaning | Terminal |
| :--- | :--- | :--- | :--- |
| `S0` | `MOUNTED` | The route has rendered; no configuration has been evaluated | no |
| `S1` | `DEFAULTS_APPLIED` | The A600 default selection set is loaded | no |
| `S2` | `VALIDATING` | The candidate input is being validated and hashed | no |
| `S3` | `READY` | A valid candidate exists and its configuration identity is displayed | no |
| `S4` | `COMPARING` | The comparison panel is open over a valid candidate | no |
| `S5` | `IDENTITY_EXPORTED` | The configuration identity has been written to the clipboard | **yes** |
| `S6` | `REFUSED` | A named guard denied the requested state; the prior valid candidate is preserved | no |
| `S7` | `EXITED` | The visitor has navigated to a journey-exit destination | **yes** |

`[PD]` `S5` and `S7` are the only terminal states. `S5` is terminal in the sense
that Release 1 defines no further step after the identity leaves the page; the
visitor may still return to `S3`. `S7` ends the Studio session.

### 5.2 Events

| Event | Trigger |
| :--- | :--- |
| `E1 MOUNT` | The `/studio` route renders |
| `E2 SELECT_OPTION` | The visitor activates a facade or facade-color control |
| `E3 VALIDATE` | A candidate input changes |
| `E4 VALIDATION_OK` | Validation and hashing complete successfully |
| `E5 VALIDATION_DENIED` | A guard denies the candidate |
| `E6 OPEN_COMPARISON` | The visitor opens the comparison panel |
| `E7 CLOSE_COMPARISON` | The visitor closes the comparison panel, or changes a selection |
| `E8 COPY_IDENTITY` | The visitor activates "Copy ID" |
| `E9 EXIT` | The visitor activates a journey-exit CTA |

### 5.3 Guards

| Guard | Condition | Reason code |
| :--- | :--- | :--- |
| `G-CAT` | The requested value exists in the pinned catalog release for A600 | `unknown_option_value` |
| `G-COMPAT` | The requested value is not denied by a catalog compatibility rule for the current selection set | the catalog's own `reason_code` |
| `G-MAT` | The requested material selection is eligible in the material registry — adopted, locally available, and texture-rights present | `material_not_eligible` |
| `G-MEDIA` | A Stage 4 model-bound master exists for the resulting facade state | `master_absent` |

`[F]` At the pinned base the material registry records every James Hardie
profile and color as `local_availability: "unverified"`,
`west_coast_kbp_offering: "not_adopted"`, `texture_rights: "absent"`, and
`ui_eligible: false`. `G-MAT` therefore denies every manufacturer-named material
until `G2B` adopts at least one. This is the intended fail-closed behavior.

### 5.4 Transitions — complete and exhaustive

| # | From | Event | Guard result | To | Observable result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `T1` | `S0` | `E1 MOUNT` | — | `S1` | A600 defaults are applied |
| `T2` | `S1` | `E3 VALIDATE` | — | `S2` | The status region states that a deterministic configuration is being built |
| `T3` | `S2` | `E4 VALIDATION_OK` | `G-CAT` ∧ `G-COMPAT` ∧ `G-MAT` ∧ `G-MEDIA` all pass | `S3` | The configuration identity and the matched master are displayed |
| `T4` | `S2` | `E5 VALIDATION_DENIED` | any guard fails | `S6` | The failing guard's reason code is rendered; the prior valid candidate is preserved |
| `T5` | `S3` | `E2 SELECT_OPTION` | `G-CAT` ∧ `G-COMPAT` ∧ `G-MAT` ∧ `G-MEDIA` all pass | `S2` | The selection is accepted and revalidated |
| `T6` | `S3` | `E2 SELECT_OPTION` | any guard fails | `S6` | The failing guard's reason code is rendered on the control and in the status region |
| `T7` | `S3` | `E6 OPEN_COMPARISON` | — | `S4` | The comparison panel opens over the current candidate |
| `T8` | `S4` | `E7 CLOSE_COMPARISON` | — | `S3` | The panel closes; the candidate is unchanged |
| `T9` | `S4` | `E2 SELECT_OPTION` | — | `S2` | The panel closes and the selection is revalidated |
| `T10` | `S3` | `E8 COPY_IDENTITY` | clipboard write resolves | `S5` | The identity is on the clipboard; the live region states that nothing was saved or sent |
| `T11` | `S3` | `E8 COPY_IDENTITY` | clipboard write rejects | `S3` | The live region states that copy is unavailable, the identity remains visible, and nothing was sent |
| `T12` | `S5` | `E2 SELECT_OPTION` | guards evaluated as in `T5` / `T6` | `S2` or `S6` | The visitor continues configuring |
| `T13` | `S6` | `E2 SELECT_OPTION` | all guards pass | `S2` | The refusal clears and the accepted selection is revalidated |
| `T14` | `S6` | `E2 SELECT_OPTION` | any guard fails | `S6` | The new reason code replaces the previous one; no state is lost |
| `T15` | `S3`, `S4`, `S5`, `S6` | `E9 EXIT` | — | `S7` | The journey-exit destination loads |

`[PD]` There is no transition into a state that renders neither a master nor a
named refusal. The image-free "preview pending" panel observed at the pinned
base is **not** a Release 1 state; under §6 the archetypes that produced it are
absent from the Studio.

### 5.5 Persistence, restoration, and identity

| Property | `[PD]` Release 1 contract |
| :--- | :--- |
| Persistence | None. No cookie, no `localStorage`, no `sessionStorage`, no server write, no URL state. |
| Restoration | None. A reload returns to `S1` with A600 defaults. This is stated on the surface, so the visitor is never surprised by a silent loss. |
| Configuration identity | SHA-256 over a canonical JSON serialization of `{schema, catalog_version, archetype, layout, selections, disclaimer_version}` with object keys recursively sorted and the hash field itself excluded. |
| Identity display | The first 12 hexadecimal characters, uppercased. |
| Identity direction | Export only. There is no import, no restore-by-identity, and no URL parameter. Release 1 makes no promise that an identity can be redeemed. |
| Determinism | Identical input produces a byte-identical identity, asserted against a pinned known vector and a byte-identical replay assertion. |

### 5.6 Geometry authority and media binding

`[PD]`

1. Approved A600 geometry, dimensions, openings, roof, facade assemblies, and
   model identity are authoritative. A decorative image never substitutes for
   them.
2. Every facade state resolves to a Stage 4 model-bound master produced from
   that geometry through the Stage 2B sealed recipe. `G-MEDIA` denies any state
   with no master.
3. A material selection is a reference to a registry record, never a free color
   value. The rendered label, the asset it resolves, and the registry record
   name the same thing. `[F]` At the pinned base the same state carries three
   different names — option key `sage`, asset filename `evening-blue`, UI label
   "Blue concept" — and this three-way divergence is closed by `WI-0306`.
4. Responsive equivalence: the same state model, the same guards, the same
   refusal codes, and the same master identity at 1440, 820, and 390. Only the
   derivative crop differs, and each crop is recorded per §10.

---

## 6. The A600-only decision

### 6.1 Decision

`[PD]` **Release 1 exposes exactly one configurable model: the A600.** The
Studio configures `adu-a-600` and nothing else.

`[F]` No adopted decision record at the pinned base authorizes a contrary
position. DR-0015 §4 states a 2D-first direction for a future configurator and
explicitly does not authorize a `/studio` route; no later record widened the
configurable set. The A600-only decision is therefore not overturning an adopted
contrary decision — see `CONFLICT-1` in §13 for the `/studio` route status.

### 6.2 Exact reason

`[F]` Only `one-bed-600` resolves a facade image. `resolveA600ConceptAsset`
returns `null` for `studio-450` and `two-bed-800`, so two of three archetypes
are permanently in an image-free state with every facade control disabled.

`[F]` `two-bed-800` is mapped in the Studio catalog to
`assets/images/residential-addition@1`. That mapping remains live catalog data
at the pinned base, and `assetManifest.test.ts` still asserts it, even though
the resolver no longer renders it. Issue #142 records this as verified defect 3.

`[PD]` Under PROGRAM-PLAN V5.4 an unbound surrogate standing in for a
model-bound master is a formal rejection, and under V5.6 hero, detail, and
Studio views must share one approved model and material identity. Two of the
three archetypes cannot satisfy either condition in Release 1 without Stage 2B
rights and Stage 4 masters that do not exist. Shipping them configurable would
require either a surrogate or a permanent disabled state — both are rejections.
Restricting to A600 is the only option that satisfies V4 and V5 with the assets
Release 1 can actually produce.

### 6.3 Catalog and public implications

`[PD]`

1. `/models` continues to publish all three families as `maturity:
   concept_only`. Publishing a concept-only record is truthful and is not a
   configuration promise.
2. Each non-A600 model row on `/models` and each non-A600 detail route carries
   this exact disclosure: *"This model is a concept-only record. It is not
   configurable in Release 1."*
3. `/models/adu-a-600` is the single configuration entry point and is the only
   model route in the Release 1 contract.
4. The Studio archetype selector exposes A600 only. `studio-450` and
   `two-bed-800` are absent from the Release 1 Studio surface — not present and
   disabled.
5. The `two-bed-800` → `residential-addition@1` catalog mapping and its
   `license` block are removed from the Release 1 Studio data surface by
   `WI-0304`, which closes Issue #142 defect 3 in data and not only in
   rendering.

### 6.4 Refusal behavior for non-A600 models

`[PD]`

1. Any request to configure a non-A600 model is refused with reason code
   `model_not_configurable_in_release_1` and the §6.3.2 disclosure text.
2. The refusal is a stated outcome on the surface, never a blank stage, never an
   image-free panel, and never a disabled control without a reason.
3. `assertValidCandidate` continues to throw `unknown_archetype` for any
   archetype outside the Release 1 set, and the Studio renders that refusal
   rather than degrading.

### 6.5 Later-release boundary

`[PD]` The S450 and B800 configurable experiences are `[DD]` deferred to Stage 9
`MOD-13`, in the order S450 then B800, each carrying its own professional model,
asset, rights, and release gate, and each requiring the Stage 4 pipeline proven
first. No Release 1 surface may imply that a non-A600 configuration is
forthcoming on a date, in a release, or at all.

---

## 7. Claims matrix

`[PD]` Every public claim Release 1 makes appears in this matrix. A claim absent
from this matrix may not be published. Status values: `Backed` (committed
evidence), `Owner-confirmation-required`, `Withheld` (may not be published in
Release 1), `Deferred` (belongs to a later release).

### 7.1 Product and design claims

| Claim | Source | Status |
| :--- | :--- | :--- |
| The current release contains exactly three concept families | Validated release `2026.09.0` with fail-closed identity assertion; `publicModelCatalog.test.ts` | Backed |
| Model IDs, versions, program, area band, envelope, footprint, increment grid, and provenance class | Digest-recomputed projection from `2026.09.0`; `modelContract.test.ts` | Backed |
| Every family is `maturity: concept_only` | Contract rejects maturity promotion without separate evidence | Backed |
| The A600 is the only configurable model in Release 1 | This record §6 | Backed on adoption of this record |
| Non-A600 models are concept-only records and are not configurable in Release 1 | This record §6.3 | Backed on adoption of this record |
| The Concept Studio is property-agnostic and collects no address or contact information | Source sweep returns zero form, egress, and storage primitives; `zeroEgress.test.ts` | Backed |
| The replay hash is stable for the pinned catalog release | Pinned known vector plus byte-identical replay assertion | Backed |
| Every image is conceptual and is not a completed West Coast KBP project | Per-image caption; `homepage.test.ts` asserts the labeling | Backed |
| The platform is a development preview provided for testing and review only | Root-layout notice; `developmentPreview.test.ts` | Backed |

### 7.2 Construction, schedule, and cost claims

| Claim | Source | Status |
| :--- | :--- | :--- |
| Any price, price range, or cost figure | none exists | Withheld — DR-0015 §2 and `governance/BOUNDARIES.md` |
| Any schedule, duration, or delivery date | none exists | Withheld — DR-0015 §2 and `governance/BOUNDARIES.md` |
| Any construction-quality, warranty, or workmanship promise | none exists | Withheld — no evidence package exists |
| Completed project count, portfolio, gallery, or testimonial | none exists | Owner-confirmation-required — blocked on the Owner's business-facts and photography package, per DR-0013 |

### 7.3 Jurisdiction, service-area, and feasibility claims

| Claim | Source | Status |
| :--- | :--- | :--- |
| Regulatory items published on `/service-areas` and `/adu-builder/[jurisdiction]` | 14 official `.gov` sources; `jurisdictionPages.test.ts` asserts a warning plus an official source on every item. Each published item carries: `Requires official source verification.` | Backed, with the required verification sentence |
| The published served-municipality list | DR-0014 core market: Sacramento ring — City of Sacramento, Sacramento County including Elk Grove, Citrus Heights, Folsom, Rancho Cordova, Galt, Isleton; Placer / El Dorado ring — Roseville, Rocklin, Lincoln, Granite Bay, El Dorado Hills. `Requires official source verification.` | Owner-confirmation-required — `WI-0503` aligns the machine-readable claim to this list before `G6` |
| Any statement that a specific parcel may or may not host an ADU | none exists | Withheld — `governance/BOUNDARIES.md`; DR-0012 remains proposed with its Research Gate open |
| Any permit, code, zoning, entitlement, or buildability conclusion | none exists | Withheld — `governance/BOUNDARIES.md` |
| Any GIS or parcel output shown to a visitor | none exists | Withheld — DR-0015 §2; DR-0012 proposed |
| Any feasibility conclusion | none exists | Withheld. Where any uncertain jurisdiction or feasibility context is published, it carries: `Requires official source verification.` |

### 7.4 Material and manufacturer claims

| Claim | Source | Status |
| :--- | :--- | :--- |
| A named manufacturer product, profile, or color is offered | Material registry records every entry as `not_adopted`, `unverified`, `texture_rights: absent`, `ui_eligible: false` | Withheld until `G2B` adopts at least one entry with verified local availability and publication rights |
| Any partnership, certification, endorsement, or manufacturer authorization | none exists | Withheld permanently absent a separate Owner-adopted record and a rights package |
| Facade-material appearance shown in the Studio | Stage 4 model-bound master with a V2 sealed recipe | Backed only at `G4`; before `G4` the Studio states that the visual is a concept study and names no manufacturer product |
| Manufacturer and color names appearing in public asset URLs | `[F]` `hardie-plank`, `hardie-panel`, `iron-gray` appear in served `src` and `srcset` values while the registry records those entries ineligible | Withheld — `WI-1003` removes manufacturer and color names from public asset paths before `G4` |

### 7.5 Controlled-execution and evidence claims

| Claim | Source | Status |
| :--- | :--- | :--- |
| The Owner reviews every commitment before it is made | `siteConfig` and `/llms.txt`; no committed operational evidence | Owner-confirmation-required |
| The three-planes and truth-boundary operating-model narrative on `/` | `app/page.tsx`; governance records describe the internal model, not an operational guarantee | Owner-confirmation-required |
| The `/about` operating-model and principles content | `aboutPage` | Owner-confirmation-required |
| The `/compare` ad-hoc versus controlled positioning | `comparePage`; comparative claim about unnamed third parties | Owner-confirmation-required |
| Business credentials, licence, insurance, and project facts | `siteConfig.footer.trustProof` self-labels as pending | Owner-confirmation-required — withheld until supplied |
| Any public statement that Product 2 is built on, powered by, or dependent on Product 1 / Deedseal | none exists | Deferred — §11.1 |

### 7.6 Acceptance-language prohibition

`[PD]` The following words and phrases may not appear in Release 1 public copy
as a quality claim, because none has a measurable acceptance rule behind it:
`premium`, `best-in-class`, `guaranteed`, `certified`, `approved`, `fastest`,
`cheapest`, `hassle-free`, `turnkey`, `worry-free`. A quality statement is
publishable only when §9 defines its numeric or binary acceptance.

---

## 8. Product graph-memory contract and orchestration binding

`[PD]` Product memory is a graph of durable domain facts and their evidence. It
is never chat history, model memory, or session state.

### 8.1 Two graphs, two authorities, one binding

| Graph | Governs | Authority | May decide |
| :--- | :--- | :--- | :--- |
| Delivery graph (§1.3) | `Objective`, `Module`, `WorkStream`, `WorkItem` and their traceability edges | Derived from merged bytes, live GitHub state, and committed evidence | nothing |
| Customer-domain graph (§8.2) | The ten customer-domain node types | Derived from committed evidence and Owner decisions | nothing |

`[PD]` **Binding rule.** The two graphs bind through exactly one edge kind:

`serves` : `WorkItem` → customer-domain node type.

`serves` is a documentation edge. It states which customer-domain node type a
WorkItem exists to make true. It transfers no authority in either direction. A
delivery-graph fact never becomes a customer-domain fact, and a customer-domain
fact never becomes a delivery-graph fact. Merging the two authorities is
prohibited.

| WorkItem | `serves` |
| :--- | :--- |
| `WI-0201`, `WI-0202`, `WI-0203` | `ADUModel` |
| `WI-0301`, `WI-0302`, `WI-0303`, `WI-0304` | `Configuration` |
| `WI-0306` | `MaterialSelection` |
| `WI-0305`, `WI-0307`, `WI-0701`, `WI-0702`, `WI-0703` | `Evidence` |
| `WI-0602` | `Configuration`, `Evidence` |
| `WI-0502`, `WI-0503` | `SiteConstraint` |
| `WI-0901`, `WI-0902`, `WI-1001` | `Decision` |

### 8.2 Customer-domain node types — all ten required types

| Node | Purpose | Stable identity | Provenance | Authority — who may assert it |
| :--- | :--- | :--- | :--- | :--- |
| `Customer` | A person or entity considering an ADU | Opaque generated identifier; never a name, email, phone, or address | The consented intake event that created it | Only a human recipient acting under an Owner-adopted privacy decision |
| `Property` | A real parcel under consideration | Opaque generated identifier; never an APN, parcel number, or street address in this graph | The consented intake event that created it | Only a human recipient acting under an Owner-adopted privacy decision |
| `SiteConstraint` | A jurisdictional or physical constraint relevant to a `Property` | `{jurisdiction_slug}:{constraint_key}:{effective_date}` | The exact official source URL and its verification date | Only an official source. Every instance carries `Requires official source verification.` |
| `ADUModel` | An owned model record | `{model_id}@{release_version}` | The validated public catalog release and its recomputed digest | The catalog release, validated fail-closed |
| `Configuration` | One deterministic model configuration | The SHA-256 configuration identity defined in §5.5 | The catalog release, the selection set, and the disclaimer version that produced it | The deterministic builder only. A configuration is never edited; a change produces a new identity |
| `MaterialSelection` | A chosen material, profile, and colour within a `Configuration` | `{registry_record_id}@{registry_version}` | The material registry record, its source URL, and its verification date | The registry, fail-closed on eligibility |
| `Document` | A durable artifact exchanged with a customer | Content hash plus a stable document identifier | The system or human that produced it, with a timestamp | Only a human recipient under an Owner-adopted privacy decision |
| `Decision` | A recorded decision about the product or an engagement | `DR-NNNN` for product decisions; `{engagement_id}:{sequence}` for engagement decisions | The merged record or the persisted Owner comment | Owner only for adoption. A proposed decision is a `Decision` node with status `proposed` |
| `Approval` | An explicit authorization to proceed | `{decision_id}:{approval_sequence}` | The persisted Owner action and its exact URL | **Owner only.** No automated actor may create an `Approval` |
| `Evidence` | An artifact that supports an assertion | Content hash plus the artifact path or URL | The command, run, tool version, and timestamp that produced it | Any actor may produce evidence. Evidence never approves anything |

### 8.3 Deterministic edges between customer-domain nodes

| Edge | Domain → Range | Cardinality | Rule |
| :--- | :--- | :--- | :--- |
| `considers` | `Customer` → `Property` | 0..n | Created only by a consented intake event |
| `constrained_by` | `Property` → `SiteConstraint` | 0..n | Created only from an official source |
| `configures` | `Customer` → `Configuration` | 0..n | Anonymous in Release 1: the edge has no `Customer` endpoint and is therefore not instantiated |
| `instance_of` | `Configuration` → `ADUModel` | exactly 1 | A configuration without a model is invalid |
| `selects` | `Configuration` → `MaterialSelection` | 0..n | Each selection must pass the registry eligibility guard |
| `sited_at` | `Configuration` → `Property` | 0..1 | Absent in Release 1 |
| `describes` | `Document` → `Configuration` or `Property` | 0..n | — |
| `records` | `Decision` → any node | 0..n | A decision records; it does not create domain truth |
| `authorizes` | `Approval` → `Decision` | exactly 1 | An approval always targets exactly one decision |
| `supports` | `Evidence` → any node | 0..n | Evidence supports; it never authorizes |
| `supersedes` | any node → the same node type | 0..1 | Points to the exact prior version identity |
| `corrects` | any node → the same node type | 0..1 | Points to the exact corrected version identity |
| `retracts` | any node → the same node type | 0..1 | Points to the exact retracted version identity |

### 8.4 Versioning, correction, retraction, and supersession

`[PD]`

1. **Append-only.** No node and no edge is ever mutated in place or deleted. A
   change is a new version with a new identity plus one of `supersedes`,
   `corrects`, or `retracts` pointing at the exact prior identity.
2. **Version identity.** Every node identity carries or resolves to a version.
   Two versions of the same subject are two nodes, never one node with two
   values.
3. **Correction** means the prior version stated something inaccurately and the
   new version states it accurately. The prior version remains readable and
   remains marked corrected.
4. **Retraction** means the prior version should not have been asserted at all.
   A retracted node is never silently removed; it is marked retracted, its
   supporting evidence is retained, and no downstream assertion may continue to
   rely on it.
5. **Supersession** means the prior version was accurate for its period and a
   newer version now governs. The prior version stays in place, as
   `governance/decisions/README.md` already requires for decision records.
6. **Reading rule.** A reader that resolves a subject follows `supersedes` and
   `corrects` forward to the current version, and refuses to return a retracted
   version as current.

### 8.5 The prohibition on inference from absence

`[PD]` **The graph must never infer approval, feasibility, rights, cost,
schedule, or jurisdictional truth from missing evidence.** Specifically:

1. A missing `Approval` node means *not approved*. It never means approved,
   pending-and-therefore-fine, or implicitly authorized.
2. A missing `SiteConstraint` means *not researched*. It never means
   unconstrained, permitted, or buildable.
3. A missing rights record on an asset means *no rights*. It never means
   permissive use.
4. A missing cost or schedule node means *no cost or schedule statement
   exists*. It is never rendered as zero, as a range, or as "contact us".
5. A missing `Evidence` edge means *unproven*. It never means true.
6. Absence is always reported as a named gap, never resolved by inference. A
   reader that cannot resolve a required fact fails closed.

### 8.6 Release 1 instantiation boundary

`[PD]` The contract above is complete. Release 1 instantiates only part of it,
because DR-0015 §2 and `governance/BOUNDARIES.md` keep intake closed.

| Node type | Release 1 instances | Reason |
| :--- | :--- | :--- |
| `ADUModel` | 3 — the validated `2026.09.0` families | Already published |
| `Configuration` | Ephemeral, in-browser only, never persisted anywhere | §5.5 persistence contract |
| `MaterialSelection` | 0 eligible until `G2B` adopts a registry entry | `G-MAT` fails closed |
| `Evidence` | Many — committed provenance, run records, test output | Already the governance model |
| `Decision` | The adopted decision records, plus this record on adoption | Already the governance model |
| `SiteConstraint` | The published official-source jurisdiction items | Already published, each carrying `Requires official source verification.` |
| `Customer` | **0** | No intake exists; instantiating one would persist PII |
| `Property` | **0** | Same |
| `Document` | **0** | No customer-facing artifact is produced |
| `Approval` | **0** visitor-facing | Owner approval is recorded in `governance/`, not in a customer graph |

`[PD]` Creating a `Customer`, `Property`, or `Document` instance requires the
Stage 7 privacy, consent, retention, and recipient decisions. Release 1 does not
open that door, and no Release 1 surface may create one.

### 8.7 Consent, access, and retention boundaries

| Boundary | `[PD]` Rule |
| :--- | :--- |
| Consent | A `Customer`, `Property`, or `Document` node may be created only from an explicit, recorded, purpose-scoped consent event. Consent for one purpose never extends to another. |
| Access | `Customer`, `Property`, and `Document` nodes are readable only by a named human recipient under an Owner-adopted decision. No automated actor reads them to make a decision. |
| Storage location | `governance/` never holds a `Customer`, `Property`, `Document`, real address, APN, parcel or permit identifier tied to a real inquiry, payment data, transcript, recording, credential, or secret. This restates `governance/BOUNDARIES.md` unchanged. |
| Retention | Minimal retention is the default. `Configuration` is not retained at all in Release 1. Lab evidence is limited to the `governance/BOUNDARIES.md` whitelist: timestamp, test variant ID, event type, accept/reject result, latency marker, error class, sanitized non-PII summary. |
| Deletion | A deletion request retracts the affected nodes per §8.4.4 and removes the underlying payload, retaining only the retraction marker and its timestamp. |
| AI boundary | No automated actor creates an `Approval`, asserts a `SiteConstraint`, or places itself in the visitor decision path. |

### 8.8 Named gaps in the graph contract

| Gap | Statement | Resolving gate |
| :--- | :--- | :--- |
| `GG-1` | The physical storage medium, schema encoding, and query surface for both graphs are undecided | `G2C` |
| `GG-2` | The engineering-graph and cold-start projection under Issue #177 is a separate canonical slice; its schemas are authoritative for the delivery graph's serialized form and are not restated here | Issue #177 merge |
| `GG-3` | Consent event shape, recipient identity, and deletion mechanics are undefined | Stage 7 |
| `GG-4` | No `MaterialSelection` is instantiable until at least one registry entry is adopted with verified local availability and publication rights | `G2B` |
| `GG-5` | `SiteConstraint` coverage exists for two jurisdictions only — City of Sacramento and unincorporated Sacramento County. Every other jurisdiction in the DR-0014 core market has zero instances. `Requires official source verification.` | Stage 7 or a later coverage packet |

---

## 9. Exact quality targets

`[PD]` Every target is numeric or binary. A target expressed as an adjective is
not a target and may not be substituted for a row below.

### 9.1 Responsive viewports

| ID | Requirement | Exact target |
| :--- | :--- | :--- |
| `Q1.1` | Review viewports | Exactly 3: 1440×1000, 820×1180, 390×844 CSS pixels |
| `Q1.2` | Contract routes rendered at every viewport | 9 of 9 |
| `Q1.3` | Horizontal document overflow at any of the 3 viewports | 0 px |
| `Q1.4` | Layout breakage — overlapping, clipped, or unreadable text | 0 occurrences |
| `Q1.5` | Actual-size review of the 1440 / 820 / 390 derivatives, recorded | Binary: performed and recorded, or the gate fails |

### 9.2 Accessibility

| ID | Requirement | Exact target |
| :--- | :--- | :--- |
| `Q2.1` | Text contrast, normal text | ≥ 4.5:1 |
| `Q2.2` | Text contrast, large text (≥ 24 px, or ≥ 18.66 px bold) | ≥ 3:1 |
| `Q2.3` | Non-text UI component and graphical object contrast | ≥ 3:1 |
| `Q2.4` | Automated accessibility violations, serious or critical, per contract route | 0 |
| `Q2.5` | Images with a programmatic text alternative or an explicit decorative marking | 100% |
| `Q2.6` | Interactive controls with an accessible name | 100% |
| `Q2.7` | Pages with exactly one `h1` and no skipped heading level | 9 of 9 |
| `Q2.8` | Live-region announcement of every Studio status change | Binary: present |

### 9.3 Keyboard and focus

| ID | Requirement | Exact target |
| :--- | :--- | :--- |
| `Q3.1` | Interactive controls reachable by keyboard alone | 100% |
| `Q3.2` | Keyboard traps | 0 |
| `Q3.3` | Visible focus indicator thickness | ≥ 2 CSS px |
| `Q3.4` | Focus indicator contrast against both adjacent colours | ≥ 3:1 |
| `Q3.5` | DOM order equal to visual order on every contract route | 9 of 9 |
| `Q3.6` | Journey-exit primary action precedes the secondary action in DOM order | Binary: true |
| `Q3.7` | Skip-to-content control present and functional | Binary: present |

### 9.4 Reduced motion

| ID | Requirement | Exact target |
| :--- | :--- | :--- |
| `Q4.1` | Under `prefers-reduced-motion: reduce`, transform, translate, scale, and parallax animation duration | 0 ms |
| `Q4.2` | Under `prefers-reduced-motion: reduce`, the Studio facade transition | Immediate swap, 0 ms crossfade |
| `Q4.3` | Content that is only reachable through an animation | 0 occurrences |
| `Q4.4` | Auto-playing motion that a visitor cannot stop | 0 occurrences |

### 9.5 Animation duration and rate

| ID | Requirement | Exact target |
| :--- | :--- | :--- |
| `Q5.1` | Any single animation duration, default motion preference | ≤ 1200 ms |
| `Q5.2` | Interaction feedback latency from activation to first visual change | ≤ 100 ms |
| `Q5.3` | Sustained animation frame rate at each of the 3 viewports | ≥ 55 fps |
| `Q5.4` | Flashes per second anywhere on the surface | ≤ 3 |

### 9.6 Bundle and performance budgets

| ID | Requirement | Exact target |
| :--- | :--- | :--- |
| `Q6.1` | First-load JavaScript per contract route, gzipped | ≤ 180 KB |
| `Q6.2` | First-load JavaScript for `/studio`, gzipped | ≤ 250 KB |
| `Q6.3` | Total CSS delivered per contract route, gzipped | ≤ 60 KB |
| `Q6.4` | Total image bytes on `/` at the 1440 viewport, after responsive selection | ≤ 500 KB |
| `Q6.5` | Total image bytes on `/` at the 390 viewport, after responsive selection | ≤ 250 KB |
| `Q6.6` | Client components on the Release 1 surface | ≤ 3 |
| `Q6.7` | Runtime dependencies in `package.json` | ≤ 12 |

### 9.7 Core Web Vitals

| ID | Requirement | Exact target |
| :--- | :--- | :--- |
| `Q7.1` | Largest Contentful Paint, 75th percentile, mobile | ≤ 2500 ms |
| `Q7.2` | Interaction to Next Paint, 75th percentile | ≤ 200 ms |
| `Q7.3` | Cumulative Layout Shift, 75th percentile | ≤ 0.10 |
| `Q7.4` | Time to First Byte, 75th percentile | ≤ 800 ms |

### 9.8 Console, network, and route integrity

| ID | Requirement | Exact target |
| :--- | :--- | :--- |
| `Q8.1` | Application-origin console errors per contract route | 0 |
| `Q8.2` | Application-origin console warnings per contract route | 0 |
| `Q8.3` | Failed network requests (4xx or 5xx) per contract route | 0 |
| `Q8.4` | Contract routes returning HTTP 200 on the canonical host | 13 of 13 expanded URLs |
| `Q8.5` | Registry URLs returning HTTP 200 | 18 of 18 |
| `Q8.6` | Redirect hops from the canonical host to a rendered contract route | 0 |
| `Q8.7` | Dead, unresolved, or destination-less CTAs | 0 |
| `Q8.8` | Emitted canonical URLs naming a host that redirects | 0 |
| `Q8.9` | Sitemap `<loc>` values naming a host that redirects | 0 |
| `Q8.10` | Contract routes emitting valid, parseable structured data | 9 of 9 |
| `Q8.11` | Public claim surfaces outside the §7 claims matrix | 0 |

### 9.9 Studio determinism

| ID | Requirement | Exact target |
| :--- | :--- | :--- |
| `Q9.1` | Identity stability — identical input, repeated builds | Byte-identical across 100 consecutive builds |
| `Q9.2` | Identity length displayed | Exactly 12 uppercase hexadecimal characters |
| `Q9.3` | Distinct reachable configurations producing an identical identity | 0 |
| `Q9.4` | Distinct reachable configurations resolving an identical master image | 0 |
| `Q9.5` | Named state-machine transitions with test coverage | 15 of 15 |
| `Q9.6` | Named refusal reason codes reachable through an exposed control and asserted | 100% |
| `Q9.7` | Studio states rendering neither a master nor a named refusal | 0 |
| `Q9.8` | Network requests, storage writes, or capture primitives on the Studio visitor path | 0 |

### 9.10 Image dimensions and formats

| ID | Requirement | Exact target |
| :--- | :--- | :--- |
| `Q10.1` | Master render width, before derivative generation | ≥ 2880 px |
| `Q10.2` | Derivative widths produced per master | Exactly 3: 1440, 820, 390 |
| `Q10.3` | Delivered formats per derivative | AVIF and WebP, 2 of 2 |
| `Q10.4` | Single delivered derivative file size at 1440 | ≤ 220 KB |
| `Q10.5` | Single delivered derivative file size at 390 | ≤ 90 KB |
| `Q10.6` | Published images carrying an intrinsic width and height attribute | 100% |
| `Q10.7` | Published images carrying a complete provenance record | 100% |
| `Q10.8` | Public asset paths containing a manufacturer or colour product name | 0 |

### 9.11 Evidence freshness

| ID | Requirement | Exact target |
| :--- | :--- | :--- |
| `Q11.1` | Age of the official-source verification behind any published jurisdiction item at release | ≤ 90 days |
| `Q11.2` | Age of the material-registry verification behind any published material claim at release | ≤ 90 days |
| `Q11.3` | Age of the review verdict relative to the released head | Exactly the released head; a new commit invalidates it |
| `Q11.4` | Published claims in §7 with a source and a status | 100% |
| `Q11.5` | Published claims whose status is `Withheld` that nevertheless appear on a surface | 0 |

---

## 10. Visual contract

`[PD]` Release 1 is bound to `governance/office/PROGRAM-PLAN-v1.md`
*Physically coherent professional visual production* V1 through V6, without
weakening, paraphrase into an adjectival target, or satisfaction by a generic
camera, light, or material recipe.

### 10.1 Bindings

| Binding | `[PD]` Release 1 requirement |
| :--- | :--- |
| V1 source-of-truth hierarchy | Approved A600 geometry, dimensions, openings, roof, facade assemblies, and model identity are authoritative. Every master is rendered from that geometry through the Stage 2B pipeline. Generative AI is limited to explicitly approved concept exploration or bounded post-production and may not invent or alter geometry, openings, rooflines, material identity, construction details, site contact, shadows, reflections, or configuration truth. A generated bitmap alone is not an acceptable model-bound master. |
| V2 sealed scene recipe | Every Release 1 master view records every V2 field. An absent field is a missing fact, never a default. Any field change produces a new recipe identity and a new run record. |
| V3 professional stack rule | Presentation capabilities may present a locked master and may never substitute for master production. A missing professional capability is not replaced by CSS effects, flat colour swatches, generated imagery, or any lower-quality surrogate. |
| V4 acceptance conditions | All seven V4 conditions hold for every released visual, including that hero, model detail, and Studio views derive from the **same approved A600 model and material identity** and use named camera and light recipes. |
| V5 rejection conditions | All seven rejection conditions in §10.3 apply. Any one of them fails the gate. |
| V6 fail-closed rule | Any missing geometry, calibrated camera, lighting decision, approved material source or provenance, professional tool capability, colour pipeline, or acceptance reference is `BLOCKED — MISSING SOURCE OR RIGHTS` or `BLOCKED — MISSING PRODUCT DECISION`. It is never resolved by improvisation, prompt variation, upscaling, smoothing, decorative overlay, or an unrelated stock or generated image. |

### 10.2 One A600 identity across three surfaces

`[PD]` The Home hero, the `/models/adu-a-600` detail view, and every Studio
facade state derive from one approved A600 geometry and one approved material
identity. Cross-view geometry, material, light, exposure, and colour-temperature
consistency is recorded as evidence at `G4` and re-checked at `G6`.

`[PD]` The masters and their 1440, 820, and 390 derivatives are reviewed **at
actual display size**, and that review is recorded. An absent actual-size review
is itself a rejection under V5.7.

### 10.3 The seven formal rejection conditions

Each of the following is a formal rejection. A submission exhibiting any one of
them fails its gate; it is not accepted with a note or a follow-up.

1. Plastic, wax, painted-clay, generic-noise, or flat-recolor material
   appearance in place of an approved real product at correct physical scale.
2. Warped architecture, floating structure, duplicated openings, inconsistent
   roof or facade geometry, melted edges, invented construction details, random
   landscaping occlusion, or cross-view material or light drift.
3. Inconsistent light, shadows, reflections, exposure, or colour temperature
   within a view or across views.
4. An unbound stock, generated, upscaled, smoothed, or decorated surrogate
   standing in for a model-bound master.
5. Missing rights, provenance, camera record, light record, or colour pipeline.
6. Hero, detail, and Studio views that do not share one approved model and
   material identity.
7. Absent actual-size review of the 1440, 820, and 390 derivatives.

### 10.4 Verified visual state at the pinned base

| `[F]` Fact | Consequence |
| :--- | :--- |
| All 12 published WebP assets are generated concept media; zero photographic assets exist | Every one is an unbound surrogate under V5.4 until Stage 4 replaces it |
| 1 of 12 assets carries a complete provenance record; 4 carry none, 3 of those 4 render on the Home route | V5.5 rejection until `WI-0703` closes it |
| No responsive derivative, AVIF output, or art-directed crop exists | `Q10.2` and `Q10.3` are unmet at the base |
| No rendered-viewport, visual-regression, or actual-size review harness exists | V5.7 rejection until `WI-0801` closes it |

`[PD]` Release 1 therefore cannot pass `G5` or `G6` on the assets present at the
pinned base. That is the intended fail-closed reading, and it is why `MOD-07`
and `MOD-08` are Release 1 modules.

---

## 11. Later-release boundaries

`[DD]` Each item below is explicitly deferred. No Release 1 surface may publish,
imply, promise, or schedule any of them.

### 11.1 Product 1 / Deedseal public brand bridge

`[DD]` The public label `Powered by Deedseal`, any cross-brand transition, any
public dependency claim, and any cross-repository technical binding between
Product 2 and Product 1 are **deferred**. They require a separate cross-contour
brief and Product 1 confirmation, then a separate Owner-adopted decision.

`[PD]` Until then: the string `Powered by Deedseal` is **not approved public
copy** and may not appear on any public surface, in any metadata, in any
structured data, in `/llms.txt`, or in any asset. Product 1 repositories,
implementation, secrets, claims, and policy are out of scope for this record and
for Release 1.

### 11.2 Other deferrals

| Item | `[DD]` Deferred to | Condition to open |
| :--- | :--- | :--- |
| Non-A600 configurable catalog (S450, then B800) | Stage 9, `MOD-13` | Stage 4 A600 pipeline proven and merged; per-model rights and release gate |
| Multilingual public reception and voice | Stage 8, `MOD-12` | DR-0016 keeps public automated voice English-only; telephony remains barred by `governance/BOUNDARIES.md` absent an Owner-approved packet |
| Qualification, intake, `/start`, and human handoff | Stage 7, `MOD-11` | Separate Owner-adopted privacy, consent, retention, and recipient decisions. `G6` alone is insufficient |
| Client-facing GIS, parcel, or screening output | separate gate | DR-0012 remains proposed and its Research Gate remains open |
| Analytics, pixels, tag managers, attribution, and campaign activation | separate gate | DR-0015 §2 keeps all of them closed |
| Business-process automation and CRM or Workspace writes | separate gate | `governance/BOUNDARIES.md` |
| Autonomous real-world actions and external business effects | separate gate | `governance/BOUNDARIES.md` |
| The dormant portal content system — approximately 330 lines in `siteConfig` and 17 orphaned components | separate gate | `[F]` None of it renders on any of the 18 URLs. `[PD]` It is not Release 1 content. Its retirement or return is a separate decision; Release 1 neither renders nor deletes it |
| Any feature lacking an adopted source or a rights package | not scheduled | An adopted source and a rights package must exist first |

---

## 12. Dependency map

`[PD]` `G1` is this record's Owner adoption. It gates `G2A`, `G2B`, and `G2C`.

### 12.1 Inputs each gate requires from this record

| Gate | Required inputs from this record |
| :--- | :--- |
| `G2A` Visual target | §3 route contract; §4 CTA contract; §5 state machine; §9 quality targets; §10 visual contract; the §2 journey map |
| `G2B` A600 asset readiness | §6 A600-only decision; §5.6 geometry and media binding; §10.1 V1/V2 bindings; §7.4 material claim status; §9.10 image targets |
| `G2C` Platform and quality architecture | §9 quality targets in full; §5 determinism requirements; §8.8 `GG-1`; §3 route contract |

### 12.2 Missing inputs and the gate each one blocks

| Missing input | `[F]` state at the pinned base | Blocks |
| :--- | :--- | :--- |
| Approved A600 geometry, dimensions, openings, roof, and facade assemblies | `adu-a-600@1.0.0` exists as an executable profile but explicitly blocks STEP, GLB, and render materialization | `G2B`, then `G4` |
| Complete V2 sealed scene recipe for every Release 1 master view | None exists | `G2B`, then `G4` |
| Colour-management decision — an intentional AgX or ACES-equivalent choice | Unselected | `G2B` |
| Lighting basis — project north plus solar azimuth and elevation from a declared location, date, and time, or a declared studio/HDRI setup | Undeclared | `G2B` |
| Physically scaled PBR material identity with source and provenance | Registry records every entry `not_adopted`, `unverified`, rights `absent` | `G2B` |
| Owner-authorized new-construction and material media plus its manifest | Issue #142 unblock condition 2 is unmet; zero photographic assets exist | `G2B`, then `G4` |
| Provenance for the four assets that lack any record | 3 of the 4 render on the Home route | `G2B`, then `G6` |
| Rendered-viewport, accessibility, visual-regression, E2E, console-error, and performance harness | None exists; no DOM environment is configured | `G2C`, then `G5`, then `G6` |
| A repository-defined enforcement pipeline for the declared gates | `.github/workflows/` contains one validation-only workflow with read-only permissions and no build, test, lint, or type gate | `G2C` |
| Canonical-host decision | §3.4 proposes `www`; unadopted until this record is merged | `G6` |
| Published served-municipality list | §7.3 proposes the DR-0014 core market; Owner confirmation required | `G6` |
| Business credentials, project facts, and photography package | Self-labelled pending in `siteConfig.footer.trustProof` | `G6` for the §7.5 claims only |
| Governance disposition for `/llms.txt` | Ungoverned public claim surface | `G6` |

`[PD]` Every row above is `BLOCKED — MISSING SOURCE OR RIGHTS` or
`BLOCKED — MISSING PRODUCT DECISION` at its named gate. None is resolved by a
surrogate, an invented value, or an improvisation.

---

## 13. Decision conflicts and supersession

### 13.1 Records this decision retains unchanged

`governance/BOUNDARIES.md`; `governance/README.md`;
`governance/office/OPERATING-MODEL-v5.md`;
`governance/office/PROGRAM-PLAN-v1.md`; DR-0001; DR-0002; DR-0004; DR-0005;
DR-0006; DR-0007; DR-0009; DR-0011; DR-0014; DR-0016; DR-0017 as constrained by
OPERATING-MODEL-v5 §1.1.

DR-0010 and DR-0012 remain `proposed`. This record neither adopts nor rejects
them, and asserts nothing that depends on either.

### 13.2 Records this decision narrows

| Record | What is narrowed | What is untouched |
| :--- | :--- | :--- |
| DR-0008 | Portal Blueprint v0.1 is narrowed for Release 1 to the nine contract routes in §3.1 and the five published non-contract routes in §3.3. No other blueprint surface is a Release 1 target | Blueprint §2 information architecture stays adopted; DR-0015 already superseded Blueprint §8 sequencing |
| DR-0013 | The homepage decision is narrowed by the §3 route contract, the §4 CTA contract, and the §10 visual contract, which set exact targets the original record did not | DR-0013's carried-over discipline — screening-only language, no cost/schedule/approval claim, conceptual imagery labelled, numbered process narrative — is retained in full and restated in §7 |
| DR-0015 | Nothing in §2's closed surfaces is narrowed. §4's 2D-first configurator direction is narrowed only in that Release 1's A600 Studio is defined here as a concrete, deterministic, no-persistence surface | DR-0015 §2 closed surfaces, §5 pilot boundary, §6 voice boundary, and §7 market sourcing are retained unchanged |

### 13.3 Records this decision supersedes

None. This record supersedes no adopted decision record.

### 13.4 Recorded conflicts and their proposed resolutions

`[PD]` Every conflict below is stated exactly and resolved by an explicit
proposal. No conflict is silently chosen, and none is left unresolved. Each
resolution binds only on the Owner's adoption of this record.

**`CONFLICT-1` — `/studio` exists while DR-0015 §4 states it was not
authorized.**
`[F]` DR-0015 §4 (adopted 2026-08-04) states: "This design direction does not
authorize Phase 2 code, assets, dependencies, or a `/studio` route today."
`[F]` `/studio` is a published route in merged `main` at the pinned base, is
registered in `publicRouteRegistry`, appears in the sitemap, and returns HTTP
200 in production.
`[PD]` Resolution: merged `main` is truth, so the route exists as a fact. This
record proposes that the Owner ratify the `/studio` route through the §3 route
contract and the §5 state machine, which supply the exact boundaries DR-0015 §4
required and did not have. DR-0015 §4's *closed-surface* provisions in §2 are
untouched: the Studio remains no-contact, no-tracking, no-persistence, and
property-agnostic. Adopting this record ratifies the route; it does not reopen
any DR-0015 §2 surface. If the Owner declines, `/studio` must be withdrawn by a
separate packet rather than left in an unratified state.

**`CONFLICT-2` — canonical host names the redirecting host.**
`[F]` `siteConfig.url` is the apex `https://westcoastkbp.com`; production serves
`www` and 308-redirects the apex; every canonical, every sitemap `<loc>`, the
robots `Sitemap:` line, and `metadataBase` name the apex; no test asserts
canonical host.
`[PD]` Resolution: `https://www.westcoastkbp.com` is the Release 1 canonical
host, per §3.4, aligned by `WI-0804` before `G6`, with `Q8.8` and `Q8.9` set
to 0.

**`CONFLICT-3` — two funnel vocabularies.**
`[F]` `publicRouteJob` has four values — Acquisition, Trust, Qualification,
Handoff. `siteConfig`'s `FunnelContribution` has five, including `conversion`,
which has no registry counterpart. Neither is derived from the other.
`[PD]` Resolution: `publicRouteJob` is the single Release 1 vocabulary.
`FunnelContribution` leaves the Release 1 contract with the dormant portal
content system in §11.2.

**`CONFLICT-4` — header and footer navigation disagree.**
`[F]` Two disjoint hand-maintained sets; `/models` and `/service-areas` are
header-only; `/compare`, `/faq`, `/services/*`, `/adu-builder/*` are
footer-only; the header carries a duplicate link to `/models`.
`[PD]` Resolution: the Release 1 primary navigation derives from
`publicRouteRegistry` and lists exactly the nine contract routes' entry paths —
`/models`, `/models/adu-a-600`, `/studio`, `/process`, `/services/detached-adu`,
`/service-areas`, `/about`, `/faq` — with `/` reached through the site logo. The
duplicate header CTA is removed. Footer coverage may exceed this set but may not
contradict it. Implemented by `WI-0804`.

**`CONFLICT-5` — machine-readable service area contradicts DR-0014 build
order.**
`[F]` `SERVICE_AREA` enumerates all five Placer / El Dorado towns plus Folsom
and Citrus Heights, but names neither the City of Sacramento nor Sacramento
County except as the unstructured string "Sacramento Region, CA". It is emitted
as `schema.org` `City` nodes on the Home route and on all five service routes.
`/llms.txt` repeats the same Placer-first list. The only jurisdiction routes that
exist are City of Sacramento and unincorporated Sacramento County.
`[PD]` Resolution: the published served-municipality list is the DR-0014 core
market in full, both rings, with the Sacramento ring named explicitly, per §7.3.
`Requires official source verification.` Aligned by `WI-0503` before `G6`, and
Owner-confirmed per §7.3.

**`CONFLICT-6` — the dormant portal content system describes a different
product.**
`[F]` Approximately 330 lines of `siteConfig` content and 17 components render
on none of the 18 URLs.
`[PD]` Resolution: it is not Release 1 content. Release 1 neither renders nor
deletes it. Its retirement or return is a separate decision, recorded in §11.2.

**`CONFLICT-7` — an orphaned asset manifest is still enforced by test.**
`[F]` `assetManifest` is no longer on the rendering path, yet
`assetManifest.test.ts` asserts it "maps exactly the licensed catalog refs used
by every archetype", and the `two-bed-800` → `residential-addition@1` mismatch
plus its `license` block remain live catalog data.
`[PD]` Resolution: under §6.3.5 the non-A600 archetypes and their mappings leave
the Release 1 Studio data surface, and `WI-0304` updates the enforcing test to
assert the Release 1 binding rather than an abandoned one.

**`CONFLICT-8` — the Studio refusal surface is unreachable.**
`[F]` Both catalog compatibility rules deny only `windows` and `interior`
values; neither has an exposed control; the A600 defaults avoid both denials, so
every clickable state is valid and the refusal branch cannot be triggered by any
visitor interaction.
`[PD]` Resolution: `Q9.6` requires every named refusal reason code to be
reachable through an exposed control and asserted. Implemented by `WI-0303`.
Release 1 does not ship a refusal path that only a unit test can see.

**`CONFLICT-9` — governance records marked `PROPOSED` are merged and
operative.**
`[F]` `OPERATING-MODEL-v5.md` and `PROGRAM-PLAN-v1.md` retain
`Status: **PROPOSED**` while stating they are operative from the commit at which
the Owner merges them, and both were merged by PR #172 at the pinned base.
`[PD]` Resolution: by their own terms both are operative at `main@22bccbf4`, and
this record treats them as binding. The retained `PROPOSED` string is a stale
status line, not a live authority question. Correcting it belongs to a
`domain:governance` packet and is outside this record's allowlist.

---

## 14. Owner decision

`[PD]` **Status remains `proposed`.** Nothing in this record is adopted by its
existence, by a passing gate, by a green check, by a Draft pull request, or by
an independent review verdict.

`[F]` Under `governance/office/OPERATING-MODEL-v5.md` §2 and §9, and
`governance/README.md` rule 4, the Owner — Tony, `avoroncov971-maker` — alone
adopts this decision, and adoption occurs through merge. Silence is not
approval. The author of this record's head SHA can never review, accept,
certify, or merge it.

### What the Owner is being asked to decide

1. Adopt the single global Objective `OBJ-P2-1` and the §1.2 Release 1 scope
   boundary.
2. Adopt the §3 nine-route contract and the §3.3 disposition of the five
   published non-contract routes.
3. Adopt the §4 CTA contract.
4. Adopt the §5 A600 Studio state machine.
5. Adopt the §6 A600-only decision, including the removal of non-A600
   archetypes from the Release 1 Studio surface.
6. Adopt the §7 claims matrix, and supply or withhold each
   `Owner-confirmation-required` row.
7. Adopt the §8 product graph-memory contract and its §8.6 Release 1
   instantiation boundary.
8. Adopt the §9 quality targets as the exact Release 1 acceptance rules.
9. Adopt the §10 visual contract binding.
10. Adopt the §11 deferrals, including keeping `Powered by Deedseal` out of
    Release 1 public copy.
11. Decide each of the nine conflicts in §13.4, in particular `CONFLICT-1`
    (`/studio` ratification), `CONFLICT-2` (canonical host), and `CONFLICT-5`
    (published service area).

Exit `G1 DECISION READY` is reached only after the Owner-adopted decision is
merged. It is not reached by review alone.

---

## Alternatives considered

| Alternative | Why it lost |
| :--- | :--- |
| Ship all three Studio archetypes in Release 1 | Two of three have no model-bound master and no rights path before `G4`. Shipping them requires either a surrogate (V5.4 rejection) or a permanent disabled state, and it breaks the V5.6 one-identity rule |
| Keep the Studio bound to the `2026.08.0` archetype taxonomy and retain the disclosure | Preserves two disjoint identity spaces indefinitely, so no Release 1 surface can satisfy V4's requirement that hero, detail, and Studio derive from one approved model identity |
| Make the apex the canonical host and redirect `www` to it | Would require a production DNS and hosting change outside this record's authority, and would invalidate live production behaviour rather than describe it |
| Defer the whole route contract to Stage 2A | Stage 2A locks visual targets against a route contract. Without §3 there is nothing to lock, and `G2A` cannot open |
| Model product memory as one graph covering both delivery and customer domains | Collapses two distinct authorities into one, which is exactly what Issue #174 §8 prohibits, and would let a delivery fact read as a customer-domain fact |
| Instantiate `Customer` and `Property` nodes in Release 1 to prove the graph | Persists production PII with no adopted privacy decision, violating `governance/BOUNDARIES.md` and DR-0004 |
| Stop `BLOCKED` on `CONFLICT-1` rather than record it | §13 of the packet requires exactly this conflicts-and-supersession section, and the record's `proposed` status leaves the choice with the Owner. Stopping would deliver nothing and still leave the conflict unrecorded |

---

## Consequences

**Becomes true.** Release 1 has an exact, testable definition: nine routes, one
configurable model, seven CTA classes, eight states, fifteen transitions, and
seventy-one numeric or binary quality targets. Every public claim has a source
and a status. Two graphs exist with separate authorities and one documented
binding edge. Nine standing contradictions are recorded with proposed
resolutions instead of being carried silently into implementation.

**Becomes harder.** Release 1 cannot ship on the assets present at the pinned
base: 11 of 12 published images lack complete provenance, none has responsive
derivatives, and no rendered-evidence harness exists. `G2B` and `G2C` must
therefore complete real work before `G5` can open. The A600-only decision
narrows the visible product.

**Becomes forbidden.** Publishing a claim absent from §7. Shipping a CTA without
a named destination and observable result. Rendering a Studio state that shows
neither a master nor a named refusal. Substituting an unbound surrogate for a
model-bound master. Placing `Powered by Deedseal` or any Product 1 dependency
claim on a public surface. Instantiating a `Customer`, `Property`, or `Document`
node. Inferring approval, feasibility, rights, cost, schedule, or jurisdictional
truth from missing evidence.

**Becomes required.** A `[PD]` marker on every proposal until the Owner merges.
An exact-head non-author review before any Owner gate. `Requires official source
verification.` on every uncertain GIS, jurisdiction, or feasibility statement.

---

## Revisit trigger

This record must be re-examined when any one of the following occurs:

1. The Owner opens a contact, intake, tracking, public-phone, or Stage 7
   capability, which changes §1.2, §2.1, §4, and §8.6.
2. `G2B` adopts a material identity with verified local availability and
   publication rights, which changes §5.3 `G-MAT`, §7.4, and `GG-4`.
3. Stage 4 proves the deterministic A600 pipeline, which opens the Stage 9
   non-A600 boundary in §6.5.
4. A cross-contour brief and Product 1 confirmation open the §11.1 brand bridge.
5. The public catalog release advances beyond `2026.09.0`, which changes §7.1
   and the `ADUModel` identity form in §8.2.
6. Any conflict in §13.4 is decided differently by the Owner than this record
   proposes.
7. Issue #177 merges, which fixes the serialized form of the delivery graph and
   closes `GG-2`.

---

## Boundary check

- [x] No PII, secrets, transcripts, or recordings introduced. §8.6 sets
  `Customer`, `Property`, and `Document` instances to zero for Release 1, and
  §8.7 restates the `governance/BOUNDARIES.md` storage rules unchanged.
- [x] No external action authorized implicitly. This record authorizes no
  implementation, no deployment, no dependency, no asset production, and no
  external effect. Every proposal carries a `[PD]` marker and binds only on the
  Owner's merge.
- [x] Research claims verified or marked. Every uncertain GIS, jurisdiction, and
  feasibility statement in §7.3, §8.2, §8.8, and §13.4 carries the exact text
  `Requires official source verification.`
- [x] No pricing, permit, zoning, buildability, feasibility, or legal conclusion
  is stated. §7.2 and §7.3 record every such claim as `Withheld`.
- [x] No public Product 1 / Deedseal brand, label, dependency claim, or
  cross-repository binding is asserted. §11.1 defers all of them and states that
  `Powered by Deedseal` is not approved public copy.
- [x] AI remains outside the visitor decision path. §8.2 restricts `Approval`
  creation to the Owner, and §8.5 forbids inference from absence.
