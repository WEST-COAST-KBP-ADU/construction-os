# Homepage journey — the eight-unit narrative spine

Packet `P2-BUSINESS-JOURNEY-IA-0001`. Exact base
`main@cf099534cb0256a1748641972abbdad49fcf8645`.

Eight public units. No ninth. Every unit below carries the ten fields the Issue
requires. Copy shown here is the proposed copy; the sentence-by-sentence source
and claim status for each line is in [`copy-deck.md`](copy-deck.md), keyed by the
copy IDs (`U1-H`, `U1-B1`, …) used in this file.

Permalink prefix for every repository citation:
`https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/`

## The spine at a glance

| # | Unit | Job in one line | Claim status | Primary destination |
| :--- | :--- | :--- | :--- | :--- |
| U1 | Hero — the business | This is a premium ADU and general-construction business in California. | `SHIPPABLE_NOW` | `/services/detached-adu` |
| U2 | What the business does | These are the kinds of work it takes on. | `SHIPPABLE_NOW` | `/services/[slug]` |
| U3 | One project, from first contact | Here is how one job actually moves. | `DESIGN_TARGET` | `/studio` |
| U4 | Bounded work, decisions, records | Every objective is cut into work that can be accepted or refused, and a person decides. | `DESIGN_TARGET` | `/process` |
| U5 | The business remembers its own work | Accepted, permitted records become the business's connected memory. | `DESIGN_TARGET` | `/about` |
| U6 | What is on the record today | Here is what is already published, versioned, and checkable. | `SHIPPABLE_NOW` | `/models` |
| U7 | Where to go next | Choose the next context; nothing here submits. | `SHIPPABLE_NOW` | `/models`, `/process`, `/service-areas`, `/faq`, `/about`, `/compare`, `/studio` |
| U8 | Deedseal | The platform underneath, and its public proof. | `SHIPPABLE_NOW` (frozen sentence) | `https://deedseal.com` |

Reading arc: **business → work → one job → how work is governed → how the
business remembers → what is already provable → where to go → what it runs on.**
The visitor can stop after U2 and still have met a construction company. The
visitor who reads to U8 has met the platform without ever being asked to accept
an AI framing.

---

## U1 — Hero: a premium ADU and general-construction business

- **Five-second takeaway.** A serious California construction business that
  builds ADUs and takes general-construction work.
- **Exact purpose.** Establish category and seriousness before anything about
  systems, platforms, or memory is introduced. Replace the engineering-register
  first fold the Owner rejected as jargon
  ([kbp-dev-office#373](https://github.com/kbp-core-engineering/kbp-dev-office/issues/373)).
- **Source of truth.** `src/components/home/premiumWorkbenchHero.contract.ts`
  (`PREMIUM_WORKBENCH_HERO_COPY`, `PREMIUM_WORKBENCH_HERO_ACTIONS`,
  `HERO_CHAPTERS = ["lead","project","record"]`);
  `src/lib/siteConfig.ts` (`name`, `tagline`);
  `governance/office/STRATEGY-KBP-OS-v1.md` (ADU wedge, general construction
  residential and commercial).
- **Proposed heading** (`U1-H`) — `ADU and general construction, run as one
  managed process.`
- **Proposed body** (`U1-B1`, `U1-B2`) — `West Coast KBP designs and builds
  accessory dwelling units and takes on general construction work in
  California.` / `Every project is run as one connected process — from the first
  conversation to the record of what was actually built.`
- **Proposed CTA** — primary `See the work we take on` → `/services/detached-adu`;
  secondary `Open Concept Studio` → `/studio` (label carried unchanged from the
  base).
- **Proposed disclosure** (`U1-D`) — the media disclosure already committed in
  `PREMIUM_WORKBENCH_HERO_MEDIA.disclosure`, reproduced verbatim. Whatever
  imagery the visual lane selects must carry a disclosure of the same force.
- **Existing route destination.** `/services/detached-adu`, `/studio`. Both
  published at the base.
- **Desktop/mobile order.** Desktop 1 / mobile 1. Reading order identical:
  kicker → heading → body → actions → chapter rail → disclosure. On mobile the
  chapter rail sits below the actions and the reserved motion region collapses
  to a single static frame; the disclosure never scrolls out of the fold that
  contains the image.
- **Interaction / motion intent.** The existing three-chapter rail
  (`Lead · Project · Record`) is the entire motion vocabulary of the fold and is
  already earned copy: it previews U3 without explaining it. Motion is one
  unattended pass through the committed phases, then rest. No looping, no
  autoplay after the first pass, no parallax on the disclosure, no pulsing or
  breathing element of any kind, no moving wordmark. Under
  `prefers-reduced-motion: reduce` the fold must render one complete legible
  frame with the rail on its final state. **Visual-direction neutral:** this
  packet specifies the reading order and the motion budget, never the art.
- **Likely owner path.** `src/components/home/PremiumWorkbenchHero.tsx`,
  `src/components/home/premiumWorkbenchHero.contract.ts`,
  `src/components/home/HeroBlueprintStage.tsx`. Copy lives in the contract
  module, which is where the base already keeps it.
- **Claim status.** `SHIPPABLE_NOW`. Both sentences describe work categories
  already published under `/services/*` and assert no price, date, availability,
  credential, or completed project.

---

## U2 — What the business does

- **Five-second takeaway.** Detached ADUs, garage conversions, attached ADUs,
  JADUs, legalization — and additions, which are not published yet.
- **Exact purpose.** Answer "what can you build for me" with the exact published
  service set, and route each answer to its own existing page. This is the unit
  a homeowner scans before deciding whether the site is relevant to them.
- **Source of truth.** `src/lib/homepageServices.ts` (four linked services plus
  the deliberately unresolved Residential Addition), `src/lib/contentPages.ts`
  (`ServiceSlug`, five published service pages including `adu-legalization`),
  `src/lib/routes.ts` (`/services/[slug]` is `published`).
- **Proposed heading** (`U2-H`) — `The work we take on.`
- **Proposed body** (`U2-B1`) — `Five published service paths, each with its own
  page, scope, and review questions. General construction beyond ADUs is part of
  the business direction.` Per-card descriptions are carried unchanged from
  `homepageServices.ts` rather than rewritten.
- **Proposed CTA** — one per card, labels carried unchanged from the base
  (`Explore detached ADUs`, `Explore garage conversions`, `Explore attached
  ADUs`, `Explore JADUs`) plus `Explore ADU legalization` →
  `/services/adu-legalization`, a published route with no homepage entry today.
- **Proposed disclosure** (`U2-D`) — `Dedicated service details are not
  published. Route selection remains unresolved.` — reproduced verbatim from
  `app/page.tsx` for the Residential Addition card, which stays linkless.
- **Existing route destination.** `/services/detached-adu`,
  `/services/garage-conversion`, `/services/attached-adu`, `/services/jadu`,
  `/services/adu-legalization`.
- **Desktop/mobile order.** Desktop 2 / mobile 2. Desktop: heading and body left,
  card grid right or below; the unresolved card sits last and is visually
  quieter, never hidden. Mobile: single column, cards in the source order above,
  unresolved card last.
- **Interaction / motion intent.** Static. Hover and focus states only, at the
  shortest committed Option 2 duration. No card entrance choreography, no
  counters, no autoplaying carousel. A visitor scrolling fast must be able to
  read all six labels without waiting for anything to arrive.
- **Likely owner path.** `app/page.tsx` (`#services` section),
  `src/lib/homepageServices.ts`.
- **Claim status.** `SHIPPABLE_NOW`, with one condition: the sixth card must not
  gain a link, and no card may gain a price, duration, or availability line.

---

## U3 — One project, from first contact

- **Five-second takeaway.** You start anonymously; a person reviews before
  anyone contacts you; what gets agreed becomes a record.
- **Exact purpose.** Make the operating idea legible with no AI vocabulary, using
  one concrete path rather than an abstraction. This is the unit that converts
  "nice construction site" into "this business is run differently".
- **Source of truth.** `src/lib/leads/leadContract.ts` (`FUNNEL_STATES`,
  including `anonymous_visit`, `lead_candidate`, `owner_review_required`,
  `approved_for_contact`), `src/lib/lab/ownerReviewPacket.ts`
  (`status: "candidate"`, "executing it requires owner approval"),
  `app/studio/page.tsx` and `src/lib/journeyExits.ts`
  (`journeyExitTruthBoundary`), `governance/BOUNDARIES.md` (AI may not book,
  message, or approve). Full narration in
  [`interaction-scenario.md`](interaction-scenario.md).
- **Proposed heading** (`U3-H`) — `How one project moves.`
- **Proposed body** (`U3-B1` … `U3-B4`) — four steps, each one sentence, in this
  order: `You look first, anonymously.` / `A real objective becomes a short list
  of bounded work.` / `A person decides what advances, what waits, and what is
  refused.` / `What is agreed becomes a record of the project.`
- **Proposed CTA** — `Open Concept Studio` → `/studio` (the only step of this
  path a visitor can actually take today), secondary `See the ADU process` →
  `/process`.
- **Proposed disclosure** (`U3-D`) — `Steps two through four describe how the
  business is being built to run. They are not live today: this site has no
  intake, no account, no submission, and no scheduling.` Plus the committed
  boundary line from `journeyExits.ts` beside the Studio CTA, verbatim.
- **Existing route destination.** `/studio`, `/process`.
- **Desktop/mobile order.** Desktop 3 / mobile 3. Desktop: four steps on one
  horizontal rail, numbered, with the live/not-live boundary as a single line
  under the rail — not per step, which would read as four disclaimers. Mobile:
  vertical, same order and numbering; the boundary line stays directly under the
  fourth step and above the CTA so it is never separated from the claim it bounds.
- **Interaction / motion intent.** Sequence, not simultaneity: the four steps may
  reveal in order on first scroll into view, one short committed duration apart,
  once. No connector animation that implies data flowing on its own, no
  travelling dot along a path, no pulse, no network graphic. Reduced motion:
  all four steps present immediately.
- **Likely owner path.** New section in `app/page.tsx`; a new
  `src/components/home/journey/` component if the step rail needs its own
  module. Copy belongs in a data module beside `src/lib/homepageServices.ts`,
  not inline in JSX, so it can be test-pinned like the hero copy.
- **Claim status.** `DESIGN_TARGET` for steps 2–4; step 1 is `SHIPPABLE_NOW`
  (anonymous Concept Studio exists and is published). The unit fails if the
  boundary line in `U3-D` is dropped, moved out of the unit, or softened.

---

## U4 — Bounded work, human decisions, records

- **Five-second takeaway.** Work is cut small enough to accept or refuse, and a
  person — not a system — decides.
- **Exact purpose.** Explain graph dispatch without jargon and, in the same
  breath, state its limits. This unit carries the three refusal lines that the
  current "Three planes" section already publishes, which is why that section is
  replaced rather than deleted.
- **Source of truth.** `app/page.tsx` (`spine-planes__limit` lines: *Does not
  determine a property fit* / *Does not determine eligibility or buildability* /
  *Does not automate approval or commitment*), `governance/BOUNDARIES.md` ("AI
  may not, under any circumstances, independently: approve work, send
  client-facing messages, promise price or schedule…"),
  `src/lib/receptionMemory/contextPolicyEngine.ts`
  (`CONTEXT_POLICY_REFUSAL_CODES` — refusal is enumerated, not improvised),
  `src/lib/lab/ownerReviewPacket.ts`.
- **Proposed heading** (`U4-H`) — `Small enough to check.`
- **Proposed body** (`U4-B1`, `U4-B2`) — `A business objective is broken into
  bounded pieces of work, each with a stated outcome and a stated way to refuse
  it.` / `Nothing advances because it looks finished. It advances because a
  person accepted it.`
- **Proposed CTA** — `See the ADU process` → `/process`.
- **Proposed disclosure** (`U4-D1` … `U4-D3`) — the three committed limit lines,
  verbatim, presented as what the process does **not** decide.
- **Existing route destination.** `/process`.
- **Desktop/mobile order.** Desktop 4 / mobile 4. Desktop: two columns — the two
  body sentences left, the three refusal lines right as a plain list, equal
  weight, not a warning box. Mobile: body first, then the three refusal lines;
  they must not collapse behind a disclosure toggle.
- **Interaction / motion intent.** Static. This is the credibility unit; motion
  here reads as persuasion. Focus states only.
- **Likely owner path.** `app/page.tsx`, replacing the `product-planes-title`
  section in place and reusing its `spine-planes` copy.
- **Claim status.** `DESIGN_TARGET` for `U4-B1`/`U4-B2`; `SHIPPABLE_NOW` for the
  three refusal lines, which are already published bytes. No sentence in this
  unit may name an automated actor as the subject of a decision verb.

---

## U5 — The business remembers its own work

- **Five-second takeaway.** Only what was agreed and permitted is kept, and it
  stays connected to the project it came from.
- **Exact purpose.** Explain graph memory in human language, and pre-empt the
  surveillance reading in the same unit rather than in a footnote. This is the
  unit that makes the platform idea land without an AI category label.
- **Source of truth.** `src/lib/receptionMemory/receptionMemoryContract.ts`
  (`MEMORY_OPERATIONS = ["read_context","propose_append_node",
  "propose_append_edge"]` — appends are proposals, never writes;
  `MEMORY_PURPOSES`; `MEMORY_CONSENT_GRANT_SCHEMA`; context-packet TTL and node
  and edge ceilings), `src/lib/receptionMemory/contextPolicyEngine.ts`,
  `governance/BOUNDARIES.md` ("minimal retention, no production PII
  persistence, no recording retention, no transcript retention").
- **Proposed heading** (`U5-H`) — `The business remembers the project, not the
  person watching.`
- **Proposed body** (`U5-B1` … `U5-B3`) — `Accepted outcomes are kept as
  connected records: this decision belongs to that project, this document
  supports that decision.` / `Memory is added by proposal and only for a purpose
  that was permitted — never collected in passing.` / `Next time, the business
  starts from what was already agreed instead of asking again.`
- **Proposed CTA** — `Understand the operating model` → `/about`.
- **Proposed disclosure** (`U5-D`) — `No customer records exist on this site
  today. It collects nothing, stores nothing, and tracks nothing.` — consistent
  with the committed preview notice in `src/lib/siteConfig.ts`.
- **Existing route destination.** `/about`.
- **Desktop/mobile order.** Desktop 5 / mobile 5. Desktop: text-led, at most one
  quiet supporting diagram of two or three connected records — never a network
  cloud, never a constellation, never a brain. Mobile: text only; the diagram is
  dropped rather than shrunk to illegibility.
- **Interaction / motion intent.** Static, or one single connection drawn once at
  the committed medium duration. Nothing that pulses, orbits, breathes, or
  accumulates. **The Product 1 green pulsing dot is forbidden here and anywhere
  else on Product 2**; so is any dot-with-halo that reads as it.
- **Likely owner path.** New section in `app/page.tsx`; copy in a data module
  beside the U3 step copy.
- **Claim status.** `DESIGN_TARGET` in full. `U5-D` is `SHIPPABLE_NOW` and is the
  condition on which the rest of the unit may render at all.

---

## U6 — What is on the record today

- **Five-second takeaway.** Three model families are published with versions and
  provenance, every image is labelled conceptual, and unknowns stay unknown.
- **Exact purpose.** Convert the narrative into something checkable in the same
  session. This unit is the proof/record layer and it is the strongest
  `SHIPPABLE_NOW` material on the page, which is why the release-bound model
  catalog moves here from the second fold.
- **Source of truth.** `src/lib/publicModelCatalog.ts` (`PUBLIC_MODEL_IDS =
  ["adu-s-450","adu-a-600","adu-b-800"]`, release identity validation),
  `src/data/studio/models/releases/2026.09.0.json`, `app/page.tsx`
  (`truth-boundary-title` section: verified product facts / conceptual media /
  unknown and professional gates), `governance/BOUNDARIES.md` ("Requires
  official source verification.").
- **Proposed heading** (`U6-H`) — `What is already on the record.`
- **Proposed body** (`U6-B1`, `U6-B2`) — `Three concept families are published
  from one validated release, each with its own identifier, version, envelope,
  and maturity.` / `Facts, concepts, and unknowns are kept visibly apart, so a
  concept never reads as a conclusion.`
- **Proposed CTA** — `Inspect the owned families` → `/models`.
- **Proposed disclosure** (`U6-D1`, `U6-D2`) — the committed image label
  `Conceptual imagery—not a completed West Coast KBP project.` verbatim beside
  every image in the unit, and `Requires official source verification.` wherever
  a jurisdiction or feasibility statement appears.
- **Existing route destination.** `/models` (and `/models/adu-s-450`,
  `/models/adu-a-600`, `/models/adu-b-800` through the catalog cards, unchanged).
- **Desktop/mobile order.** Desktop 6 / mobile 6. Desktop: the three-part truth
  boundary as a row, the model catalog directly beneath it so the abstraction and
  its evidence share one screen. Mobile: truth boundary first, then catalog
  cards in release order; each card keeps its own maturity label on the card, not
  in a shared footnote.
- **Interaction / motion intent.** Static. Existing `ModelCatalog` behavior on
  `surface="home"` is carried unchanged; this packet proposes no change to it.
- **Likely owner path.** `app/page.tsx` (merging the `owned-models-title` and
  `truth-boundary-title` sections), `src/components/content/ModelCatalog.tsx`
  (consumed, not modified).
- **Claim status.** `SHIPPABLE_NOW`. Every assertion is release-bound at the
  exact base. The unit fails if any card gains a price, a build time, an
  availability statement, or a completed-project reference.

---

## U7 — Where to go next

- **Five-second takeaway.** Seven real places to continue, and nothing on this
  page submits anything.
- **Exact purpose.** Give every visitor an exit that matches their reason for
  being here, without opening an intake. Absorbs the standalone Concept Studio
  and service-area sections so the spine stays at eight units.
- **Source of truth.** `src/lib/routes.ts` (`publicRouteRegistry`, every
  destination `published`), `app/page.tsx` (`final-exits-title` nav),
  `src/lib/jurisdictionPages.ts` (two separate jurisdiction records),
  `src/lib/siteConfig.ts` (`developmentNotice.supporting`: live intake,
  submissions, customer accounts, and external actions are not enabled).
- **Proposed heading** (`U7-H`) — `Choose where to go next.`
- **Proposed body** (`U7-B1`) — `Nothing on this page submits, schedules, or
  contacts anyone.`
- **Proposed CTA** — seven, each carrying its own one-line reason: `Models` →
  `/models`; `ADU process` → `/process`; `Concept Studio` → `/studio`; `Service
  areas` → `/service-areas`; `Compare` → `/compare`; `FAQ` → `/faq`; `About` →
  `/about`. City and county guides stay one level down, reached from
  `/service-areas`, preserving the committed separation between the two
  jurisdiction records.
- **Proposed disclosure** (`U7-D`) — the Concept Studio boundary line from
  `journeyExits.ts`, verbatim, attached to the Studio destination only.
- **Existing route destination.** All seven published at the base.
- **Desktop/mobile order.** Desktop 7 / mobile 7. Desktop: 4 + 3 grid in the
  order above. Mobile: single column, same order; `Models` and `ADU process`
  first because they carry the highest-confidence material.
- **Interaction / motion intent.** Static. Hover and focus only.
- **Likely owner path.** `app/page.tsx` (`final-exits-title` section),
  `src/lib/journeyExits.ts` (consumed for the Studio boundary line, not
  modified).
- **Claim status.** `SHIPPABLE_NOW`.

---

## U8 — Deedseal

- **Five-second takeaway.** This business runs on a platform called Deedseal, and
  you can go and look at it.
- **Exact purpose.** Close the public proof loop calmly: Product 1 sends visitors
  to its first living use case, and this unit sends them back to Product 1 and
  its public proof. It is the last thing on the page and must not compete with
  the construction business for attention.
- **Source of truth.** `src/lib/deedsealCrossReference.ts` — **frozen, byte
  SHA `caa6e9c26f33d164229747f8a1f855c0d0186ae3` at the base.** Adopted wording
  from kbp-dev-office#363 / Owner comment 5267717279; boundary rule from
  `docs/shared-briefs/RECEPTION-MEMORY-001/DEEDSEAL-INTEGRATION-BOUNDARY.md`
  (Product 2 is Deedseal-targeted, not Deedseal-integrated); Owner
  [dual-product correction](https://github.com/WEST-COAST-KBP-ADU/construction-os/issues/246#issuecomment-5272808181).
- **Proposed heading** — **none.** The unit is one sentence and one link. A
  heading would promote it into a section and break the "calm bridge" intent.
- **Proposed body** (`U8-B`) — the frozen sentence, reproduced byte-exact from
  the committed constants, with `proof` as the single linked word:

  > KBP OS is the first user of Deedseal. The public integration record is not
  > yet available; view Deedseal’s current public proof.

- **Proposed CTA** — `Deedseal public proof record` → the commit-pinned
  `DEEDSEAL_PROOF_RECORD_URL`, carried verbatim from the frozen module. The
  linked word `proof` resolves to `DEEDSEAL_PUBLIC_URL`.
- **Proposed disclosure** — the frozen sentence is its own disclosure: its second
  clause withholds the integration claim. **No additional supporting sentence is
  specified by this packet.** Every candidate — including the future shorthand
  `Powered by Deedseal` — is `EVIDENCE_REQUIRED` and blocked on the sibling
  proof-bridge packet (#248) and on a public integration record. See the
  `DEPENDS_ON_248` rows in [`copy-deck.md`](copy-deck.md).
- **Existing route destination.** `https://deedseal.com` and the SHA-pinned proof
  record URL. Both are external and both are already published at the base.
- **Desktop/mobile order.** Desktop 8 / mobile 8, last on the page, above the
  footer. Identical order on both: statement, then record link.
- **Interaction / motion intent.** None. No entrance, no reveal, no logo, no
  wordmark, no seal, no passport, no box, and no pulsing dot — that device is
  Product 1's identity and has no right to appear on Product 2. Quiet type on a
  quiet band, distinct from the construction narrative above it.
- **Likely owner path.** `app/page.tsx` (`.spine-crosslink` aside),
  `app/globals.css` (`.spine-crosslink`), `src/styles/option2-premium.tokens.css`
  via the bridge idiom. `src/lib/deedsealCrossReference.ts` is **read-only for
  every future packet in this line.**
- **Claim status.** `SHIPPABLE_NOW` for the frozen sentence and both
  destinations, exactly as they render at the base.
  `EVIDENCE_REQUIRED` for anything added around it.

---

## Rules that bind the whole spine

1. **Eight units. No ninth.** A new idea replaces a unit or becomes a new packet.
2. **Every `DESIGN_TARGET` sentence renders inside a unit that also carries its
   boundary line.** Separating a claim from its boundary is a fail-closed
   condition, not a layout preference.
3. **AI is never the category.** No unit heading, kicker, CTA, or alt text may
   contain "AI", "AI-powered", "agent", "autonomous", "neural", "LLM", or a
   robot, face, chat-bubble, or network-cloud image.
4. **No autonomous actor is ever the subject of a decision verb.** A person
   decides; the system prepares, proposes, and refuses.
5. **Only published destinations.** No route is invented, and the Residential
   Addition card stays linkless.
6. **The frozen sentence is untouchable.** Byte-exact, both destinations intact.
7. **Motion budget for the whole page:** one hero pass, one U3 step sequence, at
   most one U5 connection. Everything else is static. Reduced motion renders the
   complete page with no loss of meaning.
