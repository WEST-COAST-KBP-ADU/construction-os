# FABLE-ANALYSIS — RECEPTION-MEMORY-001 full concept attack

Independent adversarial architecture review. Reviewer-owned file.

---

## 1. Review anchor and non-authorship

| Item | Value |
| :-- | :-- |
| **Exact author SHA reviewed** | `0f6b34abee50b0e4b9068837a9c54934a2113d0d` |
| Branch | `architecture/reception-memory-001` |
| Product 2 base | `main@337ce6de8fb8ccf6de6a19088c1807eef14e3f6b` — verified ancestor; merge simulation against current `main@9df7937` is clean |
| Author scope | exactly six files under `docs/shared-briefs/RECEPTION-MEMORY-001/`, +391/−0, docs-only |
| Reviewer | Fable 5. **Non-authorship:** I authored none of the six files under review; my sole artifact is this analysis. I modified no author file, no runtime, no PR metadata; nothing is merged. |

Method: full read of all six author files; every repository anchor they cite
re-verified directly, including the cross-repository Product 1 anchor; attack
run across the fourteen mandated areas; no vendor, runtime, or PII activity.

---

## 2. Verified facts (checked, not trusted)

| Claim in the packet | Verification | Result |
| :-- | :-- | :-- |
| DR-0016 restricts public automated voice to English only | `governance/decisions/DR-0016-public-voice-english-only.md:22` | **VERIFIED** — and its scope is *voice*, which matters for F-1 |
| DR-0004 / BOUNDARIES prohibit production PII persistence, recordings, transcripts | `DR-0004:16-20`, `governance/BOUNDARIES.md:36-44` | **VERIFIED** |
| `core-compatibility.md` is stale: compatible-not-integrated | pinned to `kbp-core@bb52a6f` (2026-07-02) | **VERIFIED** |
| Product 1 finish line: key ceremonies + weekly hardware root + Owner cockpit, then fork | `kbp-dev-office@cf3ab752…:docs/coordination/decisions/decision-product-1-full-working-state.md`, read at the exact anchor | **VERIFIED**, including the Owner's verbatim words and the overruled engineering cut |
| Product 2 has funnel/lead/model/jurisdiction contracts; no customer graph, no verified identity flow | current `main` tree | **VERIFIED** |
| Six author files, nothing else, no runtime | three-dot diff vs merge base | **VERIFIED** |

The BRIEF's honesty about its own conflicts — naming DR-0016, DR-0004,
BOUNDARIES, and the unfinished Product 1 gate as *binding, unresolved
constraints* rather than obstacles waved away — is the strongest property of
this packet. The attack found the architecture largely sound; both blocking
findings are consistency-of-record and definitional, not structural.

---

## 3. The fourteen attack areas

**A1 — false/ambiguous returning identity: HOLDS.** Candidates are never
sufficient (caller ID, email, cookie, remembered facts, name, voice likeness
are candidate-only); verification is externalized to a separately approved
boundary returning a short-lived, audience-bound assertion with nonce and
expiry; failed matching reveals neither existence nor project detail; terminal
sessions cannot be revived. Residual: O-3 (co-participants), O-4 (timing).

**A2 — enumeration and cross-scope leakage: HOLDS.** Non-disclosure on
failure; negative probes explicitly include enumeration, candidate-match
disclosure, cross-subject/cross-project traversal, and tenant confusion; the
read protocol requires all five scopes (tenant, subject, project, purpose,
session) to bind structurally. Residual: the tenant scope itself is undefined
— that is F-2.

**A3 — consent confusion, widening, revocation races, replay: MOSTLY HOLDS.**
Consent binds subject/purpose/data-classes/operations/channels/policy-version/
time/expiry, is unbundled, and supports session-service-without-durable-memory
— the right shape. Revocation blocks future retrieval immediately. One genuine
race is unaddressed: a context packet issued *before* revocation stays live
until its own expiry, and nothing bounds that expiry or says whether
revocation ends active sessions — O-2.

**A4 — prompt injection / authority escalation through memory: HOLDS.**
Invariant 7, model never queries the graph, packets are deterministically
assembled, poisoned/prompt-like content is inert quoted data, and the Slice 4
harness names exactly these cases. Enforcement mechanics are implementation
work; the architectural position is correct.

**A5 — poisoned summaries, stale/disputed facts, illegal upgrades: HOLDS.**
Seven truth classes; inference never silently upgrades; summaries are never
sources, store source-event references, and must be regenerable; the read
protocol rejects stale/disputed/revoked paths; authoritative upgrades require
human review.

**A6 — graph lifecycle (traversal, cardinality, export, correction, unlink,
deletion, backups, provider copies): HOLDS.** Allowlisted traversal plans with
depth/cardinality ceilings; no model-authored traversal; correction by
supersession; subject-scoped rate-limited export; deletion under an adopted
retention contract with immediate retrieval block; **activation blocks on
missing provider capability, backup behavior, legal hold, or ambiguous
scope** — the clause that usually goes missing is present. Negative probes
include backup resurrection and provider-retained copies.

**A7 — plane separation: HOLDS.** Four planes are cleanly distinguished:
identity vault (PII), mutable commercial graph, immutable digest-addressed
technical artifacts with no reverse pointers, and Deedseal evidence that
records operations without becoming the customer graph. This extends the
PRODUCT-002 two-plane rule consistently and matches the shipped `leadContract`
opaque-reference discipline. Residual: O-5 (evidence pseudonymity statement).

**A8 — EN/ES/RU equivalence: HOLDS ARCHITECTURALLY.** One canonical intent and
policy representation; translations are versioned presentation resources; each
language must independently pass disclosure, consent comprehension, identity
prompts, restricted-claim refusal, escalation, correction/export/deletion, and
semantic-equivalence tests; detection suggests but cannot switch locale
without confirmation; unsupported language routes to a human-safe fallback.
Residuals: the governance record conflict (F-1) and human fallback capacity
per language (O-6).

**A9 — web/voice convergence with media outside Next.js/Vercel: HOLDS.** The
DECISION places phone/SIP in a separate real-time media service, never in a
long-lived Next.js/Vercel request path, matching DR-0002's hybrid voice-lab
record and the review mandate verbatim.

**A10 — Product 1 sequencing: HOLDS, with one tension to record.** The
Owner's decision (verified at the exact anchor) is: ceremonies complete,
hardware root in weekly use, working cockpit — then the fork. The author
blocks Slice 5 and every live effect on that gate and keeps Slices 0–4 as
synthetic contract work. That reading is consistent with how the programme
already operates — Product 2 portal/funnel/lead work has proceeded throughout
under the Owner's direction — but a strict reading of "finish, then fork"
could be stretched to cover even paper architecture. O-7 asks the OUTCOME to
make Tony's acceptance of Slice 0 an explicit confirmation that parallel
contract work is inside the decision's intent, so the question can never be
re-litigated later.

**A11 — Deedseal binding PII/side channels: HOLDS.** Grants and durable
evidence carry no PII, raw audio, transcripts, credentials, or unbounded
prompts; requests bind consent digest, context-packet digest, expiry, replay
nonce, and expected-changed-surfaces; results bind request/grant digest,
evidence position, custody attestation; "Product 2 accepts no side-channel
success." Residual: O-5 — state explicitly that subject deletion severs the
vault linkage and Deedseal's append-only records retain only unlinkable
opaque IDs, mirroring the statement already made for technical artifacts.

**A12 — provider neutrality and activation gates: SUFFICIENT.** Adapters
mandatory (invariant 14); Slice 6 runs Research Gates per provider category
under the repository's existing official-source discipline; Slice 8 is a full
privacy/security/retention packet; Slice 10 splits web memory, public voice,
phone routing, production Deedseal execution, and external actions into
separate owner gates.

**A13 — overengineering audit: NOTHING TO DELETE.** Hunted for removable
layers, node classes, operations, and slices. Twelve node classes each carry a
distinct lifecycle; `ConsentGrant`/`RetentionDirective`/`AuthorizationEdge`
follow one consistent reified-grant pattern (misnaming noted in O-1);
`LeadJourney` and `TechnicalArtifactRef` reference existing ledgers instead of
duplicating them — the exact anti-duplication choice this review would
otherwise demand. The ten-slice order is dependency-correct: schemas →
policy engine → lifecycle → orchestrator/harness → P1 contract gate →
providers → lab → privacy → pilot → activation. Slices 2 and 3 could
theoretically merge, but each is independently reviewable at meaningful size;
keeping them split is the better review posture. **No slice is premature,
missing, redundant, or misordered. No corrected slice order is required.**

**A14 — missing acceptance criteria before Slice 1: TWO FOUND.** They are the
blocking findings.

---

## 4. Blocking findings

### F-1 — supersession of operative governance is asserted by a shared-brief, not by a decision record

**Where:** `DECISION.md:5` — "Supersedes on acceptance: DR-0016 only for the
public EN/ES/RU language direction; DR-0004 and BOUNDARIES only through later
privacy/retention activation records."

**Defect.** In this repository's own constitution, merged `main` is the only
truth and owner decisions live as DR records in `governance/decisions/`. If
Tony merges this packet as written, `main` will simultaneously contain
DR-0016 — operative, "public language is **English only**" — and an accepted
architecture whose language direction contradicts it, with the supersession
recorded only inside a shared-brief that the decisions registry never
references. This programme has already paid once for registry truth drifting
from merged reality (the WORK-ORDER-003 registry-restoration packet exists
for exactly that class of failure). A second copy of that failure mode should
not be merged knowingly.

Note also that DR-0016's scope is public automated **voice**. The multilingual
*web text* direction may not conflict with DR-0016 at all — which makes the
blanket "supersedes on acceptance" both stronger than necessary and less
precise than required.

**Bounded correction (one paragraph, author files only), either option:**
1. amend `DECISION.md` so Slice 0 acceptance explicitly includes cutting a
   superseding/amending DR in `governance/decisions/` (language direction),
   with DR-0004/BOUNDARIES amendments deferred to the Slice 8 activation
   packet as already stated; **or**
2. drop the supersession claim now: DR-0016 remains operative until the
   public-voice activation gate (Slice 9/10), where its superseding DR is cut;
   the architecture meanwhile *prepares* EN/ES/RU without changing public
   policy — which is factually what Slices 1–8 do anyway.

### F-2 — `tenant` is load-bearing everywhere and defined nowhere

**Where:** `DECISION.md` invariant 8; `GRAPH-MEMORY-CONTRACT.md` §Edge
classes (required edge fields), §Read protocol step 2, §Mandatory negative
probes ("tenant confusion"); `DEEDSEAL-INTEGRATION-BOUNDARY.md` §Required
request binding.

**Defect.** Tenant is one of the five scopes that "must all bind", a required
field on every edge, a bound field of every read and every Deedseal request,
and the subject of a mandatory negative probe — and no file says what a
tenant *is*. One operating company? A legal entity? A product? Could a future
Deedseal-side consumer be a second tenant? Slice 1 freezes schemas with a
`tenant` field; Slice 2 implements tenant binding; any later definition that
differs from the implementer's guess reopens the frozen schemas — which is
precisely the "cannot cut Slice 1 without reopening architecture" condition
this review is required to test.

**Bounded correction (one short section in `GRAPH-MEMORY-CONTRACT.md`):**
define the tenant model now. The minimal safe definition consistent with
everything else in the packet: a tenant is one operating business boundary;
exactly one exists at adoption (West Coast KBP ADU); the field is structural
isolation and future-proofing; tenants are minted only by an owner-accepted
decision record; no cross-tenant edge, read, packet, or grant is expressible.

---

## 5. Non-blocking observations

- **O-1** — `AuthorizationEdge` is listed under **Node** classes. It follows
  the same reified-grant pattern as `ConsentGrant`/`RetentionDirective`
  (node + `authorized_for`/`consented_for`/`retained_under` edges), so the
  model is consistent — but the name will mislead Slice 1 implementers.
  Rename to `AuthorizationGrant`.
- **O-2** — revocation vs in-flight packets: specify a maximum context-packet
  TTL and state whether revocation terminates active sessions or only blocks
  the next read. Invariant 4 covers the next read; the delivered packet is
  the residue.
- **O-3** — multi-participant projects (two spouses, one property): the
  authorization primitives exist, but no rule states whether verified subject
  A may access project P created under subject B. Make co-participant rules a
  Slice 2 acceptance item.
- **O-4** — identity endpoints should carry a constant-shape/latency-bucketed
  response requirement into the Slice 4 harness, so enumeration cannot move
  from content (already closed) to timing.
- **O-5** — state explicitly in `DEEDSEAL-INTEGRATION-BOUNDARY.md` that
  subject deletion severs the vault mapping, leaving append-only evidence
  holding only unlinkable opaque IDs — the mirror of the statement the graph
  contract already makes for technical artifacts.
- **O-6** — per-language human fallback capacity (who answers the escalated
  Russian call?) belongs in Slice 9's activation criteria alongside
  per-language quality evidence.
- **O-7** — have `OUTCOME.md` state that Tony's Slice 0 acceptance explicitly
  confirms Slices 1–4 contract work as within the Product 1 decision's
  intent (see A10), so the sequencing question is settled once, on the
  record.

## 6. Inferences and unknowns (separated per mandate)

**Inferences (reasoned, not evidenced):** that context-packet structural
encoding will suffice to keep retrieved text inert (A4 — testable in Slice 4);
that the reified-grant graph pattern will express future authorization needs
without new node classes (A13).

**Unknowns (correctly open, correctly gated):** every vendor category
(identity, graph store, model, STT/TTS/media, carrier), retention periods,
legal basis and privacy text, DPA/subprocessors, regions, backup/DR targets,
budget, launch — all named in `DECISION.md` §Not decided and gated behind
Slices 6/8/10. The Product 1 consumer contract does not exist yet; the packet
says so plainly and stays `Deedseal-targeted`, not `-integrated`.

## 7. Verdict

The concept is coherent, minimal for what it must do, provider-neutral, and
honest about every constraint it has not yet earned the right to cross. The
slice order is dependency-correct and needs no rearrangement. Two bounded
corrections — one governance-consistency paragraph (F-1) and one tenant
definition (F-2) — are required before Slice 1 can be cut without reopening
architecture; both are author-file edits of a few lines, and neither touches
the structural design.

Verdict pins to author SHA `0f6b34abee50b0e4b9068837a9c54934a2113d0d`; any new
author commit invalidates it. Codex reconciles findings in the author-owned
files; Tony alone accepts the architecture and merges.

BLOCKED FOR REVISION
