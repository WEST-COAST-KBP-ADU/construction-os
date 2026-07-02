# Core Compatibility — What "Core-compatible" Means Concretely

Status: design direction, not integration. Everything here derives from the
KBP Core context package v0.1 (`../context/kbp-core-context-package-v0.1.md`),
pinned to `kbp-core-engineering/kbp-core` `main` @ `bb52a6f` (2026-07-02).
**Every claim requires re-verification against the kbp-core repository when
access exists.** Construction OS remains Core-compatible, NOT Core-integrated
(charter); business automation is NOT_OPENED in the kernel.

## The kernel model we must stay compatible with

- **Policy gate is the single decision authority.** A pure
  `decide(request) -> decision` function; all policy lives there; verdicts are
  `allow` / `require_approval` / block with stable reason codes. Fail-closed on
  anything missing, malformed, ambiguous, stale, or unverified. An honest deny
  is correct behavior, not friction.
- **Execution broker is the only effect path.** It holds no policy; it builds an
  operation authorization binding, asks the gate, and refuses dispatch unless
  the decision's binding matches exactly. No caller-supplied execution hooks.
- **Evidence is hash-chained.** Canonicalized events, SHA-256 chained,
  independently verifiable.
- **Effect classes (seven, do not invent new ones lightly):** `read_only`,
  `local_write`, `repo_write`, `external_io`, `destructive`, `financial`,
  `physical`. The last three ALWAYS require approval.
- **Authority is structural, not cryptographic (P2 assumption).** Owner
  authority today is explicit-input only; nothing may be designed as if signed
  authority exists. Self-declared levels/labels never unlock dispatch.
- **The Core never authorizes modification of the Core (P3).** One-way
  dependency: Construction OS depends on Core contracts; nothing flows back
  into kbp-core from this repository.

This maps cleanly onto our own pattern: the platform's
`candidate → validation → OwnerReview → approval → action → evidence` flow is
the business-domain projection of `gate → broker → evidence chain`.

## Allowed design work now (contracts-first, no automation)

Per the context package §5, before any integration exists we may design:

1. **Domain operation vocabulary** — future broker-operation-spec-style entries
   with honest effect classes (draft below).
2. **Grant/scope semantics** — what an allowed scope means in construction
   terms: project id, client id, dollar limit, document contour, jurisdiction.
3. **Evidence model** — which event types a business action emits; what an
   "accepted artifact package" is for a bid / estimate / permit.
4. **Repo discipline** — bounded packets, evidence, run records, fail-closed
   gates. Reuse the pattern, not the code.

## Candidate domain operation vocabulary (adopted as v1 — DR-0006)

Honest effect classes; anything `external_io` / `destructive` / `financial` is
`require_approval` by default, which matches BOUNDARIES.md exactly.

| Operation (candidate) | Effect class | Default verdict |
| :-------------------- | :----------- | :-------------- |
| `create_lead_candidate` | `local_write` | gate-checked |
| `create_intake_artifact` | `local_write` | gate-checked |
| `create_ownerreview_packet` | `local_write` | gate-checked |
| `create_estimate_draft` | `local_write` | gate-checked |
| `send_client_email` | `external_io` | require_approval |
| `create_calendar_event` | `external_io` | require_approval |
| `write_crm_record` | `external_io` | require_approval |
| `schedule_crew` | `external_io` | require_approval |
| `submit_permit_doc` | `external_io` (irreversibility note: candidate for `destructive`) | require_approval |
| `issue_purchase_order` | `financial` | require_approval |

Note the split: everything the AI may do freely is `local_write` on candidate
artifacts; every client-facing, calendar, CRM, permit, or money operation sits
in an approval-required class. This is the same boundary BOUNDARIES.md draws in
prose, now in effect-class terms.

## Evidence model direction

Business evidence events must satisfy BOTH contracts: the Core's chain
(canonical, hash-linked, verifiable) and DR-0004 (minimal retention, whitelisted
fields, no PII). Consequence: **sanitization happens before an event is
emitted**, never after. An event that would need PII to be meaningful is not an
allowed event.

## Prohibited until the owner opens them in kbp-core

- Business automation implementation (NOT_OPENED in the kernel).
- Any write/PR to kbp-core from this side.
- Scheduler / daemon / autonomous-loop shapes.
- Designs assuming cryptographic authority (P2).
- Secrets in envelopes or contracts.

## Integration maturity path (when the time comes, in order)

1. Pin kbp-core by SHA as a read-only provenance/contract anchor.
2. Vendor only the contract surface (schemas / dataclass shapes) with a
   pinned-SHA record.
3. Eventually consume the Core as a versioned package.

Never copy kernel code ad hoc.
