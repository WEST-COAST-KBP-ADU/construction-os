# KBP Core — Context Package for the Construction OS Session v0.1

- **Purpose:** self-contained bootstrap context about `kbp-core-engineering/kbp-core`
  for a Claude session working on **Construction OS** that has NO access to the
  kbp-core repository. Read this fully before designing anything around the Core.
- **Pinned source state:** `main` @ `bb52a6f` (merge of PR #359), 2026-07-02.
  Everything below was read from committed repo state at that SHA — not from chat
  memory. **This document is a projection, not source of truth**: if the receiving
  session later gets repo access, committed repo state wins on any conflict.
- **Owner / sole authority:** `avoroncov971-maker`. AI (any session, any model) is a
  bounded capability — never approval, merge, or authority.

---

## 1. What KBP is (committed product hierarchy)

1. **KBP (product category):** a controlled, visible, inspectable execution system
   for AI answers / actions / artifacts — a deterministic control plane around
   probabilistic models. Every AI result is *candidate material* that must pass a
   typed, gate-checked, evidence-recorded crossing before acceptance. Commercial
   axis: predictability, for domains where the cost of failure exceeds the value of
   lucky peaks.
2. **KBP Core (the kernel):** deterministic control layer — policy gate + execution
   broker + hash-chained evidence machinery. Lives in `kbp-core-engineering/kbp-core`.
3. **DEV OFFICE v1 (proof domain #1):** software engineering — one explicit task in,
   one PR-ready accepted artifact package out. Chosen because code is
   machine-verifiable.
4. **Construction OS (future domain #2):** business flow (construction / ADU) as a
   SECOND CLIENT of the SAME kernel. Committed status in kbp-core: **future product
   contour only — business automation is NOT_OPENED**. No product branch until
   K1–K5 complete and the Core proves itself on domain #1.

## 2. Core architecture (as implemented at the pinned SHA)

### 2.1 `app/core/policy_gate.py` (~1341 lines) — the single decision authority

- Pure function: `decide(PolicyGateRequest) -> PolicyGateDecision`. No I/O, no
  side effects. ALL policy lives here (gate monopoly).
- `PolicyGateRequest` fields: `action_type`, `actor_role`, `claimed_scope`,
  `action_level: int`, `risk_class: int`, `evidence_plan`,
  `capability_token_context`, `capability_grant`, `owner_authority_proof_result`,
  `target`, `operation_class`, `operation_binding`, `operation_binding_required`.
- `PolicyGateDecision`: `verdict` (`"allow"` | `"require_approval"` | block),
  `reason_code` (stable string), `operation_binding` (echoed when authorized).
- Action types: `read_only`, `docs_evidence`, `model_proposal`, `local_write`,
  `reversible_external_surface`, `protected_action`.
- Effect classes: `read_only`, `local_write`, `repo_write`, `external_io`,
  `destructive`, `financial`, `physical`. The last three ALWAYS require approval
  (`APPROVAL_EFFECT_CLASSES`).
- Actor roles: `implementation_agent`, `owner`. Grant issuer allowlist:
  `OWNER_GRANT_ISSUERS = {"avoroncov971-maker"}`.
- **Fail-closed everywhere**: missing, malformed, mismatched, ambiguous
  (`"do whatever is needed"` is an explicit blocked sentinel), stale, revoked, or
  unverified input → block with a stable `reason_code`. Examples of stable codes:
  `block_docs_evidence_local_mutation_not_authorized`,
  `block_l1_effect_without_operation_authorization_binding`,
  `caller_supplied_execution_hook_not_allowed`.
- **Honest deny is the product**: a deny is correct behavior, never friction to be
  patched around.

### 2.2 `app/runtime/execution_broker.py` (~458 lines) — the only effect path

- `execute(action_envelope: Mapping) -> BrokerExecutionResult`. The broker holds NO
  policy; it builds an `OperationAuthorizationBinding` from the envelope, calls
  `policy_gate.decide()`, and refuses dispatch unless the decision's binding equals
  the built binding exactly (`_enforce_decision_binding`).
- Envelope required fields: `operation`, `target`, `action_type`, `claimed_scope`,
  `action_level: int`, `risk_class: int`, `declared_effects: list[str]`; optional
  authority context (`capability_grant`, `capability_token_context`,
  `owner_authority_proof_result`, `evidence_plan`). Any envelope key starting with
  `_` is rejected (no caller-supplied execution hooks).
- Registered operations (`BROKER_OPERATION_SPECS`): `write_bytes`, `write_text`,
  `write_json_text`, `create_directory`, `create_symlink`, `remove_path`
  (effect `local_write`); `subprocess_run` (`external_io`); `http_request`
  (`destructive`/`external_io`); `openai_responses_create` (`external_io`).
- `verdict == "require_approval"` returns `executed=False` (no side effect);
  anything not `"allow"` raises `ExecutionBrokerDecisionBlocked`.

### 2.3 `app/runtime/gate_monopoly.py` — helper enforcing "no side effect without a gate decision"

`require_policy_gate_decision(...)` raises `GateMonopolyError` unless the gate
allows. CI job "gate monopoly absolute audit" is a required check on `main`.

### 2.4 Evidence chain (`app/runtime/`)

`event_builder` / `event_canonicalizer` / `event_hash` / `chain_hash` /
`sqlite_wal_event_store` / `event_chain_verifier`: canonicalized events,
SHA-256 hash-chained, stored in SQLite WAL, independently verifiable. This is the
intended substrate for all evidence (currently evidence files are still
hand-written JSON — migration to chain-projection is roadmapped, see §4).

### 2.5 `app/proof_source/` — owner-authority proof (partial)

`OwnerAuthorityProofResult`: a rich verification-result contract (verification
state, principal identity, grant id, scope, validity/revocation/freshness states,
fail-closed reason). Today only an **explicit-input adapter** exists. **No
signing, no crypto, no key management, no registry, no runtime lookup.** Bare
`issued_by` strings and self-asserted token fields are explicitly NOT sufficient.

## 3. Authority and governance invariants (binding, committed)

1. Owner (`avoroncov971-maker`) is the sole approve/merge authority.
   `author != approver/merger` mandatory. Passing checks are evidence, not approval.
2. **Gate monopoly:** no side effect without `policy_gate.decide() == allow`.
3. **Two-layer authority (P3, committed):** meta level — GitHub ruleset +
   CODEOWNERS + owner approval govern changes to the Core; object level — the Core
   governs execution of work. **The Core must never authorize modification of the
   Core.**
4. Evidence reference is not authority. Self-declared `action_level` / `risk_class`
   / labels never unlock dispatch.
5. Work discipline: every change = one roadmap step = one bounded task packet
   (`allowed_files` superset of `changed_files`) + evidence + runrecord + PR.
6. SourceTrue: committed repo state + verified GitHub PR/CI state + verified
   terminal output win; chat memory is never source of truth.
7. **P2 (recorded ASSUMPTION):** current control is structural, NOT cryptographic —
   the Core enforces structure (binding/scope/effect/fail-closed) but cannot yet
   verify owner-authority authenticity. Do not design anything that pretends
   otherwise.

## 4. Current position (pinned @ `bb52a6f`)

- Roadmap gates 0–9: DONE/CLOSED. Gate 10 does not exist.
- **Workflow-Through-Core convergence is locked** as the canonical seven-phase
  roadmap (`docs/plans/workflow-through-core-seven-phase-roadmap-v0.1.md`):
  - Phase 0 (baseline/preconditions): **DONE** (PR #358).
  - **NEXT:** precondition block — **P1 broker containment** (path/URL scope
    contour, argv allowlist, explicit credential sourcing — next implementation
    slice), P2 assumption, P3 rule, **K7** narrow runtime-opening owner decision
    (workflow domain only, command-by-command, human-initiated, no scheduler/daemon).
  - Phases 1′–3′ (evidence/state/closeout through Core), 4–6: NOT_OPENED until
    preconditions pass.
- H1 (operation authorization binding): CLOSED. H2 (grant authenticity): PARTIAL —
  explicit-input adapter only; gate/broker integration NOT_OPENED.
- **NOT_OPENED (hard list):** runtime loop, scheduler, daemon, autonomous producer,
  provider/model framework, storage/DB backend, signing/crypto/keys, verifier
  backend, registry, external actuation beyond the bounded smokes, approval
  automation, merge automation, **business automation, Construction/ADU
  implementation**, Gmail/Google/client/vendor/field automation.

## 5. What this means for the Construction OS session

**Model: Construction OS = second domain client of the same kernel. One-way
dependency: Construction OS depends on Core contracts; NOTHING flows back into
kbp-core from the business repo (committed boundary: business material must not
enter kbp-core).**

Allowed now (contracts-first, no automation):

1. **Design the domain operation vocabulary** as future
   `BROKER_OPERATION_SPECS`-style entries: e.g. `send_client_email`,
   `create_estimate`, `issue_purchase_order`, `schedule_crew`, `submit_permit_doc` —
   each with an honest effect class. Most business operations are `external_io`,
   `destructive`, or `financial` → i.e. **`require_approval` or grant-bound by
   default**. Do not invent new effect classes lightly; map to the seven existing
   ones.
2. **Design grants/scopes for the domain**: what a `CapabilityGrant.allowed_scope`
   means in construction terms (project id, client id, dollar limit, document
   contour). Follow the same fail-closed matching the gate already does.
3. **Design the evidence model**: what event types a business action emits into the
   hash chain; what an "accepted artifact package" is for a bid/estimate/permit.
4. **Structure the repo the same way**: ROADMAP as canonical, bounded packets,
   evidence, runrecords, CODEOWNERS, fail-closed CI gates. Reuse the pattern, not
   the code.

NOT allowed / do not design toward (until owner opens them in kbp-core):

- No business AUTOMATION implementation (it is NOT_OPENED in the kernel repo).
- No direct writes/PRs to kbp-core from the Construction OS side; kernel changes go
  only through kbp-core's own owner-approved packets.
- No scheduler/daemon/autonomous loop shapes.
- No assumption of cryptographic authority (P2): treat owner-authority as
  explicit-input for now.
- No secrets in envelopes/contracts; credential sourcing is a known open item (P1).

Integration mechanics (when the time comes, in this order of maturity):
pin kbp-core by SHA as a read-only provenance/contract anchor (the same pattern
kbp-core itself uses in `PROVENANCE.md`) → vendor only the contract surface
(schemas/dataclass shapes) with a pinned-SHA record → eventually consume Core as a
versioned package. Never copy kernel code ad hoc.

## 6. How to treat this document in the new session

- Treat every statement here as **pinned to `bb52a6f`** — re-verify against the
  repo when access exists; newer commits supersede this package.
- Treat owner chat statements about repo state as ASSUMPTIONS until verified
  against a ref/SHA (kbp-core's committed state-claim verification contract).
- The owner remains the only approval/merge authority in BOTH repos. This package
  grants no authority and opens no surface.
