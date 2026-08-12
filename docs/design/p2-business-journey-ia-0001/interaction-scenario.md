# Interaction scenario — first lead to graph memory

Packet `P2-BUSINESS-JOURNEY-IA-0001`. Exact base
`main@cf099534cb0256a1748641972abbdad49fcf8645`.

One scenario. It begins with a first lead and ends with a verified business
record becoming part of the business's own graph memory. **The human is the
governing actor at every transition that has an effect.** No step shows an
autonomous external action, because no autonomous external action is permitted:
`governance/BOUNDARIES.md` forbids AI from independently approving work, sending
client-facing messages, promising price or schedule, booking appointments,
writing CRM records, or triggering external business actions.

The scenario is **synthetic**. It carries no name, no address, no parcel or
permit identifier, no contact detail, and no project fact — the retention rule in
`governance/BOUNDARIES.md` applies to this document as much as to a runtime.

Status of the scenario as a whole: **`DESIGN_TARGET` from step 2 onward.** Step 1
is `SHIPPABLE_NOW`. Nothing here may be rendered publicly as present-tense
operating fact.

Permalink prefix: `https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/cf099534cb0256a1748641972abbdad49fcf8645/`

---

## The scenario

### Step 1 — A homeowner looks, anonymously

A property owner in the Sacramento region wants a detached ADU for a parent. They
read the homepage, open two service pages, and open Concept Studio. They compare
concept directions without entering an address, a parcel identifier, or any
contact detail.

- **Actor:** the visitor.
- **State at the base:** `anonymous_visit` — `src/lib/leads/leadContract.ts`,
  `FUNNEL_STATES[0]`. Reception state `anonymous` —
  `src/lib/receptionMemory/receptionMemoryContract.ts`, `RECEPTION_STATES[0]`.
- **What the business keeps:** nothing. Concept Studio is property-agnostic and
  collects no address or contact information (`app/page.tsx`,
  `concept-studio-title` section). The committed boundary line applies verbatim:
  *Concept Studio is anonymous and does not evaluate a parcel or create an
  eligibility, buildability, permit, price, or schedule conclusion.*
  (`src/lib/journeyExits.ts`, `journeyExitTruthBoundary`.)
- **Status:** `SHIPPABLE_NOW`. This step is live at the base.

### Step 2 — An objective is stated, and consent is asked for before anything is kept

The homeowner decides to go further and states an objective in their own words:
a detached unit for a family member, on their property, this year's project. Only
now is identity or contact information relevant — and it is asked for explicitly,
for a stated purpose, before it is kept.

- **Actor:** the visitor states; the business asks.
- **State:** `property_intent` → `screening_candidate` → `lead_candidate`
  (`leadContract.ts`). Reception `anonymous` → `disclosed` →
  `consent_candidate` → `identity_candidate` → `identity_verified`, each an
  explicitly permitted transition in `PERMITTED_RECEPTION_TRANSITIONS`.
- **The gate:** a consent grant (`MEMORY_CONSENT_GRANT_SCHEMA`) binds what may be
  kept to one declared purpose from `MEMORY_PURPOSES` —
  `current_session_service`, `returning_customer_continuity`, or
  `project_continuity`. There is no fourth purpose, and no "general" purpose.
- **Refusal is a first-class outcome:** `refused` and `ended` are reachable
  terminal states from every non-terminal reception state. A visitor who declines
  is not degraded into a lesser path; the conversation ends.
- **Status:** `DESIGN_TARGET`.

### Step 3 — The objective becomes bounded work

"A detached ADU for a parent" is not a task. It is decomposed into a short list
of bounded pieces of work, each with one stated outcome, the facts it needs, and
the exact way it can be refused. For this objective the list is small and
ordinary: identify which official sources govern this property's jurisdiction;
assemble the questions a professional review will ask; select a concept family to
work from; state what is still unknown.

- **Actor:** the system prepares the decomposition. It does not act on it.
- **Grounding:** this is the same discipline the engineering board already runs
  on — one packet, one bounded outcome, one declared allowlist (`CLAUDE.md`,
  *Change discipline*). The construction business is dispatched the same way.
- **What "bounded" means, concretely:** a piece of work that cannot quietly
  widen. It names its outcome before it starts, it names what would make it
  stop, and work that turns out to be different work becomes a new piece rather
  than an expansion of this one.
- **Refusal is enumerated, not improvised:**
  `src/lib/receptionMemory/contextPolicyEngine.ts` publishes
  `CONTEXT_POLICY_REFUSAL_CODES` — a closed list including
  `consent_binding_mismatch`, `identity_assurance_insufficient`,
  `project_binding_required`, and ceiling breaches. A request that does not
  satisfy its policy is refused by name, not silently degraded.
- **Hard limit:** no piece of this work may state a price, a schedule, an
  availability, an eligibility, a buildability, a permit outcome, or a zoning
  conclusion. Any uncertain jurisdiction or feasibility output carries
  `Requires official source verification.`
- **Status:** `DESIGN_TARGET`.

### Step 4 — A person decides

Each bounded piece arrives for review as a **candidate**, never as a completed
action. `src/lib/lab/ownerReviewPacket.ts` is explicit: the packet's `status` is
the literal `"candidate"`, it carries one `proposedNextAction`, and the module's
own contract states that *executing it requires owner approval*. The reviewer
accepts, holds for more context, or declines.

- **Actor:** a person at West Coast KBP. This is the only actor in the scenario
  who can cause an effect.
- **State:** `owner_review_required` → `approved_for_contact` **only** on an
  explicit human decision (`leadContract.ts`, `FUNNEL_STATES`). No transition
  into `contacted` exists without passing through the human decision first.
- **What the visitor sees:** that a person is in the loop, and where. This is the
  claim the business is actually making, and it is the one the public copy in
  U4 carries: *Nothing advances because it looks finished. It advances because a
  person accepted it.*
- **Status:** `DESIGN_TARGET`.

### Step 5 — The accepted outcome becomes a record

The accepted decision, and the evidence it rests on, become a record of this
project: what was decided, what it was decided from, and which project it belongs
to. A record is written because a person accepted it — not because a
conversation happened.

- **Actor:** the person's acceptance is what creates the record.
- **Grounding:** `receptionMemoryContract.ts` publishes the node vocabulary
  (`project`, `lead_journey`, `fact_assertion`, `evidence_ref`,
  `consent_grant`, `authorization_grant`, `retention_directive`) and the edge
  vocabulary (`participates_in_project`, `asserted_by`, `verified_by`,
  `evidenced_by`, `supersedes`, `retained_under`). A record is a node plus the
  edges that hold it to its project and its evidence.
- **Correction is part of the design:** `supersedes` and `disputes` exist in the
  committed edge vocabulary. A wrong record is superseded on the record, not
  erased from it.
- **Status:** `DESIGN_TARGET`.

### Step 6 — The record becomes the business's memory

The next time this project moves — a second conversation, a later phase, a
question a year on — the business starts from what was already agreed instead of
asking again.

- **Actor:** the person, again. Memory is read to prepare a human decision; it
  does not make one.
- **The mechanism, exactly as committed:** `MEMORY_OPERATIONS` is
  `["read_context", "propose_append_node", "propose_append_edge"]`. Appends are
  **proposals**. There is no `write`, no `delete`, and no `update` operation in
  the vocabulary. What is read is a bounded context packet — capped at 32 nodes,
  64 edges, 64 KiB, and a 120-second time-to-live
  (`CONTEXT_PACKET_MAX_NODES`, `CONTEXT_PACKET_MAX_EDGES`,
  `CONTEXT_PACKET_MAX_BYTES`, `CONTEXT_PACKET_MAX_TTL_SECONDS`) — and only along
  one of two declared traversal plans, `subject_continuity_v1` or
  `project_continuity_v1`.
- **Status:** `DESIGN_TARGET`.

---

## Graph dispatch, in human language

Public copy must be able to say this without a single technical term:

> A real objective is broken into bounded pieces of work. Each piece states its
> outcome before it starts and states how it can be refused. A person decides
> which pieces advance.

What must never be said instead:

| Rejected | Why |
| :--- | :--- |
| "AI breaks your project into tasks" | Makes AI the category and the actor. The Owner fixed the category as construction. |
| "Agents dispatch work automatically" | Claims autonomous action, which `governance/BOUNDARIES.md` forbids. |
| "The graph decides what happens next" | Removes the human decision, which is the actual product claim. |
| "Our neural engine manages your project" | Vocabulary the Owner rejected as engineering jargon on the first fold. |

The word **graph** may appear in internal records like this one. It does not
belong in public copy: the reader does not need it to understand the idea, and
using it recruits the wrong category.

---

## Graph memory, in human language

> Only what was accepted and permitted is kept, and it stays connected to the
> project it came from. Nothing is collected in passing.

Three properties make that sentence true rather than reassuring, each traceable
to committed bytes:

1. **Permitted.** Memory is bound to a consent grant with one declared purpose
   from a closed list of three. No grant, no memory.
2. **Proposed, not written.** The only append operations are
   `propose_append_node` and `propose_append_edge`. A proposal is reviewable by
   definition.
3. **Bounded on read.** Context is capped in nodes, edges, bytes, and seconds,
   and traversed only along a declared plan. There is no "read everything about
   this person" operation to reach for.

And what the business does **not** do, stated in the same unit rather than in a
footnote: `governance/BOUNDARIES.md` fixes minimal retention, no production PII
persistence, no recording retention, and no transcript retention. Real customer
identity, contact details, parcel and permit identifiers, payment information,
and raw transcripts are never stored in `governance/`.

Formulations that are forbidden because they imply surveillance or
indiscriminate retention:

| Rejected | Why |
| :--- | :--- |
| "We remember everything about your project" | Indiscriminate retention. False against the consent binding and the ceilings. |
| "The system learns from every conversation" | Implies retention without consent and training on transcripts. |
| "Your data makes our AI smarter" | Both surveillance framing and an AI category claim. |
| "We never delete anything" | `supersedes` is not immortality, and retention is directive-bound. |

---

## The bidirectional proof loop

```
DeedSeal (Product 1)
      │  advertises its first living use case
      ▼
West Coast KBP / KBP OS (Product 2)
      │  returns the visitor to Product 1 and its public proof
      ▼
DeedSeal public proof record
```

**DeedSeal → West Coast KBP.** Product 1 presents Product 2 as its first living
construction-business use case. That direction is Product 1's to publish; this
packet neither asserts it on Product 2's surface nor mutates any `deedseal/*`
repository.

**West Coast KBP → DeedSeal.** Product 2 returns the visitor with the frozen
sentence in U8, byte-exact:

> KBP OS is the first user of Deedseal. The public integration record is not yet
> available; view Deedseal’s current public proof.

The sentence does two jobs at once, which is why it cannot be reworded: the first
clause carries the adopted first-user relationship; the second explicitly
withholds any publicly proven integration. Product 2 is **Deedseal-targeted, not
Deedseal-integrated** (`src/lib/deedsealCrossReference.ts` and the boundary brief
it cites).

What closes the loop is the **public operating proof** — a real construction
business visibly run this way. That is the thing Product 2 must eventually be,
and it is why the U6 record layer matters more than any adjective in U1.

### What is blocked, and on what

| Claim | Status | Blocked on |
| :--- | :--- | :--- |
| "KBP OS is the first user of Deedseal." | `SHIPPABLE_NOW` | Nothing — frozen, adopted, published at the base. |
| "The public integration record is not yet available." | `SHIPPABLE_NOW` | Nothing — frozen and true at the base. |
| `Powered by Deedseal` | `EVIDENCE_REQUIRED` | A public integration record **and** Owner approval. Intended future shorthand; not shippable present-tense copy. |
| "West Coast KBP runs on Deedseal." | `EVIDENCE_REQUIRED` | Same. Present tense asserts the integration the frozen sentence withholds. |
| "The first construction business running on Deedseal." | `EVIDENCE_REQUIRED` | Same. |
| Any supporting sentence beside the frozen sentence | `EVIDENCE_REQUIRED` | Sibling packet `P2-DEEDSEAL-PROOF-BRIDGE-0001` (#248). Tagged `DEPENDS_ON_248` in [`copy-deck.md`](copy-deck.md) and deliberately unset here rather than guessed. |
