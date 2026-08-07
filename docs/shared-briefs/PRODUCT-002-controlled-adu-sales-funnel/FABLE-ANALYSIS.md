# FABLE-ANALYSIS — PRODUCT-002 controlled ADU sales funnel

Independent adversarial product/architecture review. Lane B, non-author.

---

## 1. Review anchor

| Item | Value |
| :-- | :-- |
| Repository | `WEST-COAST-KBP-ADU/construction-os` |
| **Exact reviewed author SHA** | `509ac04ed9d99263caf25537a868194df0040cfb` |
| Branch | `product/controlled-adu-sales-funnel-v1` |
| Base | `main@ae6eb26d2555292b88988d50b72eaa4db26bc4c8` — verified ancestor; head behind `main` by 0 |
| Author diff | exactly `BRIEF.md`, `DECISION.md`, `FUNNEL-CONTRACT.md`, `OUTCOME.md`; +599/−0 |
| Reviewer mutation | this file only; the four author files untouched |

Method: full read of all four author files at the pinned SHA, plus independent
verification of every factual claim they make about the repository, executed
against the working tree at that SHA. No search-mediated material; no official
source retrieval; no runtime code touched.

---

## 2. Verified findings (checked against the repository, not taken on trust)

| Author claim | Check | Result |
| :-- | :-- | :-- |
| `siteConfig.ts` disables intake, phone, tracking, routing, storage, external action (BRIEF §Current-state) | grep of `src/lib/siteConfig.ts` | **VERIFIED** — "Live intake disabled", "No live intake, tracking, or storage", "no phone routing, call handling, recording" |
| `governance/charter.md` already describes the lead loop (BRIEF §Current-state) | read | **VERIFIED** — `charter.md:59` "Lead generation → lead qualification → voice / web intake → GIS/property"; `:80` "A lead starts as a candidate, never as a customer record" |
| `adu-model/1` + three `concept_only` families on `main` | repo state at base | **VERIFIED** (PR #67 merged) |
| #66 / PR #69 untouched by this packet | diff vs base | **VERIFIED** — four files only, none in #69's set |
| Author scope documentation-only, exactly four files | `git diff --stat` | **VERIFIED** — 4 files, 599 insertions, 0 deletions |
| DR-0007 Google-first is respected by ACQUISITION-001 | `charter.md:70` | **VERIFIED** — consistent |
| OUTCOME claims "twelve funnel stages" (`OUTCOME.md:41`) | count of §3 state list | **NOT VERIFIED** — the machine names **14** distinct states (`anonymous_visit` … `won`, `lost`, plus `rejected`, `archived`). Minor factual defect; fold into the F-1 revision |

The forbidden-CTA vocabulary in `FUNNEL-CONTRACT.md` §5 is consistent with the
enforced `FORBIDDEN_CLAIM_VOCABULARY` in `src/lib/studio/jurisdictionContract.ts`
(PR #69), so the documentation layer and the runtime layer under review
elsewhere agree on what may never be said.

---

## 3. The eight required tests

### 3.1 Does every Catalog/GIS/Studio capability have a credible selling role?

**Yes.** `DECISION.md` §Mandatory-funnel-contribution forces every public
feature to declare exactly one of five contributions, and §5 of the contract
maps all nine public surfaces to a role and a bounded action. The showcase
failure mode is addressed structurally, not rhetorically: a feature with no
contribution is defined out of the public critical path. The strongest single
line in the packet is the Catalog CTA — `Check this model for my property` —
which converts a display asset into a qualification entry.

Inference (not verified): the mapping's effectiveness depends on copy that does
not exist yet; that is correctly deferred to LEAD-INTAKE-001.

### 3.2 Do the address-first and phone-first paths converge coherently?

**Architecturally yes** — both produce the same `lead-candidate/1` and the same
human-review semantics; a caller cannot bypass consent (`DECISION.md`
§Entry-paths). One gap, recorded as **O-1** below: `property_input` is a
**required** field of `lead-candidate/1` (§2.2), yet the phone-first path
explicitly serves high-intent callers who may not yet have a property — a
pre-acquisition shopper cannot be recorded at all. §4 already tolerates
"deliberately marked for manual geographic review" but still demands the
property be *supplied*. The two clauses do not quite meet.

### 3.3 Is immutable technical evidence correctly separated from PII/consent/attribution/sales state?

**Yes — this is the best-designed part of the packet.** The two-plane model
with a one-directional opaque reference (`DECISION.md` §Data-separation) is
exactly right: the technical plane never points at a person, so deleting the
commercial record genuinely severs the person-link. Consent is a separate
versioned record and may not be inferred from browsing (§2.3). The prohibition
list (names, phones, emails, inquiry-linked addresses, messages, notes) is
explicit about *which* artifacts it binds.

One residual, recorded as **O-3**: an inquiry-originated GIS site snapshot
survives in the immutable plane after the commercial record is deleted. The
orphaned snapshot is then a plain property record — defensible — but the §8
privacy-gate list does not currently ask the Owner to decide the fate of
inquiry-originated snapshots under retention/deletion. Add it to that list.

### 3.4 Can technical statuses accidentally imply eligibility/feasibility/price/permit?

**No credible path found.** §5 forbids the dangerous vocabulary in CTAs; §3
states `reference_consistent` cannot skip stages or create qualified/approved/
proposal/won; the jurisdiction layer's own disclaimer discipline (PR #69) backs
this at runtime. §4's "GIS or jurisdiction uncertainty blocks technical claims,
not the ability to request a human conversation" is the correct asymmetry.
Residual risk is copy-level (`service_area_candidate` shown as "you're in our
service area" is a fit statement, not feasibility) — a LEAD-INTAKE-001 review
item, not an architecture defect.

### 3.5 Are the funnel states and human-only transitions complete and non-circular?

**Non-circular: yes.** The transition table is a DAG; no cycle exists; human
authority is correctly pinned on every commitment transition, and the
human-only set matches #72's required rejection list exactly.

**Complete: no. This is the blocking finding — F-1 below.**

### 3.6 Is the minimum v0 genuinely manual-first, and is anything overengineered?

See §5, the adversarial audit. Short answer: the v0 is genuinely manual-first,
and the audit found **no unnecessary record** — but it found one sequencing
contradiction (**O-2**) inside the v0 list itself.

### 3.7 Does the architecture leave a safe path to production intake without pretending decisions are made?

**Yes.** §8 lists nine open decisions and blocks real PII behind them;
`OUTCOME.md` §Production-activation-boundary repeats the same boundary;
`DECISION.md` §Explicitly-not-decided disclaims provider, retention, privacy
text, recipient, number, price, and launch date. The inactive-feature-flag
posture for pre-adoption implementation is the right mechanism. With O-3 added
to §8, this test passes fully.

### 3.8 Is LEAD-CONTRACT-001 (#72) the correct first runtime slice?

**In shape, yes — it is the same contract-and-tests-before-UI pattern that
worked for `modelContract` and `jurisdictionContract`, and its blocked-until-
merge gate is correct. In content, not yet** — #72 hard-requires "a positive
test for every terminal funnel state and every permitted transition" of a
machine that currently contradicts its own measurement section. Cutting #72
against the machine as written would bake the dead ends of F-1 into the first
runtime slice and invalidate its review one cycle later. Fix F-1 first; then
#72 is exactly right.

---

## 4. Blocking finding

### F-1 — the funnel state machine strands mandatory records and contradicts its own measurement contract

**Where:** `FUNNEL-CONTRACT.md` §3 (state list and transition table) against
§4 (qualification), §6 (measurement), and `OUTCOME.md:41`.

**Defect, in three parts:**

1. **A valid-but-unqualified lead has no exit.** `lead_candidate` has exactly
   one outgoing transition — to `qualified_candidate`, which requires "bounded
   fit rules satisfied". A candidate with valid contact and affirmative consent
   who fails fit has no path to `rejected`, no path to `archived`, and no path
   to human review. §4 promises that uncertainty "blocks technical claims, not
   the ability to request a human conversation" — but the machine cannot
   deliver that promise, because `owner_review_required` is reachable only
   *through* `qualified_candidate`.

2. **Loss is unrecordable where measurement demands it.** §6 requires
   `lead_lost` "with bounded reason" and "loss/abandonment reason **by stage**
   and entry surface". The machine permits `rejected`/`archived` only from
   `owner_review_required` and `lost` only from `proposal`. A candidate who
   never answers after `approved_for_contact`, or ghosts after `contacted`, or
   walks away after `consultation`, has **no legal transition at all**. The
   machine cannot produce the by-stage loss data its own §6 requires.

3. **Terminal-state semantics are undefined.** `rejected` vs `archived` vs
   `lost` are never distinguished: which are terminal, who may archive, and
   whether a returning customer re-enters as a new candidate (they should — a
   new record, never a resurrected one) is unstated. `OUTCOME.md:41` miscounts
   the states ("twelve"; the machine names fourteen), which suggests the state
   set was not audited as a set.

**Why blocking rather than an observation:** this contract is the direct
specification for #72, whose acceptance requires positive tests for *every*
terminal state and *every* permitted transition, and a deterministic transition
function implementing *this* table. Implementing it as written produces a
validator that provably strands records; revising after #72 lands invalidates
that packet's independent review. The stated purpose of PRODUCT-002 is that
the first runtime packet "can be cut without reopening product intent" —
today it cannot.

**Bounded correction (no product-intent change, one file):**

1. add `lead_candidate → archived` (deterministic, bounded reason) for
   valid-but-unfit candidates, **or** route them to `owner_review_required`
   with a `manual_review` reason — either honours §4; pick one;
2. add authorized-human `→ lost` (bounded reason) from `approved_for_contact`,
   `contacted`, and `consultation`;
3. define terminal semantics: `rejected`, `lost`, `won` terminal; `archived`
   terminal-but-reopenable only as a **new** candidate record;
4. correct the stage count in `OUTCOME.md:41`;
5. re-check §6's event list against the completed machine (`lead_lost` becomes
   reachable at the stages §6 already assumes).

---

## 5. Adversarial overengineering audit and the minimum profitable v0

Hunted for records, gates, metrics, and slices that could be deleted without
losing money or safety:

| Candidate | Verdict |
| :-- | :-- |
| Four separate records (`scenario-ref`, `lead-candidate`, `consent-record`, `sales-handoff`) | **Keep all four.** Each has a distinct lifecycle and audience; merging consent into the candidate would break versioned-consent evidence; merging handoff would leak raw fields to review |
| 14-state machine for a manual v0 | **Keep** — the post-approval states are human-recorded rows, not software; collapsing them destroys the §6 funnel metrics that make v0 measurable |
| Deterministic qualification classifier in v0 | **Borderline, keep.** A human glance would do at v0 volume, but the classifier ships in slice 1 anyway, is cheap, and records reasons — which the human then reviews. It never auto-rejects (§4), so it cannot cost a sale |
| Six ordered slices | **Keep the order** — contract → intake → delivery → phone → measurement → acquisition puts PII-bearing and external-action steps behind their own gates. ACQUISITION last is correct: spend before measurement would be blind |
| UTM validation, idempotency keys, rate limiting | **Keep** — each guards a real failure mode already listed in §7 |
| CRM / voice agent / ad platform / accounts / pricing engine excluded from v0 | **Correct exclusions** — the v0 is genuinely manual-first |

**Nothing in the packet is unnecessary. The machine needs completion, not
reduction.** One internal contradiction inside the v0 list itself:

**O-2 — v0 item 10 ("stage counts sufficient to measure conversion") has
nowhere to live at v0.** First-party stage events arrive in
FUNNEL-MEASUREMENT-001 (slice 5); LEAD-DELIVERY-001 records submissions only.
Pre-submission counts (`property_start`, `screening_completed`) therefore have
no storage at v0. Either scope v0 measurement to submit-onward counts derived
from delivered candidates (recommended — zero new machinery), or say
explicitly that pre-submission counts wait for slice 5. Do **not** pull
analytics earlier to resolve this.

The minimum profitable v0 as specified — two CTAs, minimal questions, name
plus one contact method, explicit consent, validator, sanitized summary, one
approved destination, manual follow-up — is the correct smallest thing that
can sell an ADU. With O-2 clarified it is coherent end to end.

---

## 6. Observations, risks, unknowns (separated)

**Observations (non-blocking, fix opportunistically):**
- **O-1** — `property_input` required vs phone-first callers without a
  property (§3.2 above). Recommend an explicit
  `property_input: {absent: true, reason}` marker rather than optionality.
- **O-2** — v0 measurement sequencing (§5 above).
- **O-3** — orphaned inquiry-originated site snapshots: add their retention
  fate to the §8 gate list (§3.3 above).
- **O-4** — `OUTCOME.md:41` stage miscount (folds into F-1 item 4).

**Risks (real, accepted, correctly held elsewhere):**
- Superseding "lead generation last" is an Owner decision recorded in
  `DECISION.md` §Consequences with prior prohibitions kept in force — the
  reconciliation is honest and the deployed UI remains inert (verified).
- Copy-level implication risk on qualification surfaces — belongs to
  LEAD-INTAKE-001 review.

**Unknowns (correctly left open, no packet pretends otherwise):**
- privacy text, recipient, providers, retention period, published number,
  analytics — all listed in §8 / §Explicitly-not-decided;
- phone-path consent mechanics — deferred to PHONE-HANDOFF-001, which is the
  right place.

---

## 7. Terminal recommendation

# BLOCKED FOR REVISION

One blocking finding, F-1: the funnel state machine strands valid-but-unfit
candidates, cannot record loss at the stages its own measurement section
requires, and leaves terminal-state semantics undefined — and #72 would bake
that machine into the first runtime slice as written. The correction is
bounded, one file plus a one-line count fix, and reopens no product intent.

Everything else holds: the commercial architecture is sound, the two-plane
PII separation is the strongest part of the packet, the v0 is genuinely
manual-first with nothing overengineered, the production-activation boundary
is honest about what is undecided, and LEAD-CONTRACT-001 is the right first
slice the moment the machine is complete.

Verdict pins to author SHA `509ac04ed9d99263caf25537a868194df0040cfb`; any new
author commit invalidates it. The reviewer does not merge — Tony alone merges
PR #71.
