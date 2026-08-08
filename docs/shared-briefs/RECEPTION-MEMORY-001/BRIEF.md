# BRIEF — RECEPTION-MEMORY-001

## Anchor

- Repository: `WEST-COAST-KBP-ADU/construction-os`
- Product 2 base: `main@337ce6de8fb8ccf6de6a19088c1807eef14e3f6b`
- Architecture Issue: #74
- Author lane: Codex / ChatGPT Operational Lead
- Required reviewer: Fable 5 at the exact author result SHA
- Owner: Tony; only Tony accepts architecture and merges
- Product 1 evidence anchor: `kbp-core-engineering/kbp-dev-office@cf3ab75285804f3c01aed9f9658b70ff1def0ddb`
- Product 1 decision: `docs/coordination/decisions/decision-product-1-full-working-state.md`

## Owner direction

Product 2 has one premium conversational entrance across web and, after a separate production gate, phone. It serves at least English, Spanish, and Russian. A returning customer can resume the correct project only after explicit consent and identity verification. Durable continuity is owned by Product 2 as a provider-neutral graph-memory service. Requested effects pass through Product 1 / Deedseal once Product 1 reaches its recorded full-working-state finish line and exposes an exact consumer contract.

## Verified current state

The repository already records a hybrid voice architecture, a premium receptionist persona, a controlled sales funnel, an immutable model contract, a fail-closed jurisdiction evaluator, and a deterministic lead ledger. It does not contain a persistent customer graph, verified returning-customer identity flow, public multilingual voice contract, or proven Deedseal integration.

Current binding conflicts are explicit:

- DR-0016 permits public automated voice in English only.
- DR-0004 and `governance/BOUNDARIES.md` prohibit production PII persistence.
- `governance/architecture/core-compatibility.md` is stale and says Core-compatible, not integrated.
- Product 1's current finish-line record says the fork to Product 2 follows completed key ceremonies, weekly hardware-root use, and a working Owner cockpit. Those conditions are not claimed complete here.

## Architecture question

What exact contracts let Product 2 provide premium multilingual reception and consented returning-customer continuity while preventing identity confusion, cross-customer memory leakage, prompt-injected or poisoned memory, provider lock-in, uncontrolled PII retention, and any model bypass of Deedseal authority?

## Proposed end-to-end contour

```
web / future phone entrance
→ locale + disclosure
→ consent and purpose gate
→ identity candidate
→ verified identity session
→ deterministic context-policy assembler
→ scoped graph context packet
→ model session
→ candidate memory mutation or requested effect
→ validation and human/owner gate
→ Deedseal-controlled authorization and isolated execution
→ evidence/result
→ provenance-bound graph update
```

The model never queries the graph directly, never decides identity, never grants itself a wider context, and never performs an effect.

## Required author records

- `DECISION.md`
- `RECEPTION-CONTRACT.md`
- `GRAPH-MEMORY-CONTRACT.md`
- `DEEDSEAL-INTEGRATION-BOUNDARY.md`
- `OUTCOME.md`

The reviewer alone owns `FABLE-ANALYSIS.md`.

## Review questions for Fable

1. Is the system boundary coherent, minimal, and compatible with the recorded Product 1 finish line?
2. Does identity verification fail closed without making caller ID, email, remembered facts, or voice biometrics sufficient?
3. Can any graph edge, summary, retrieval rule, export, or deletion path cause cross-customer or cross-project leakage?
4. Can prompt injection or poisoned memory change authority, policy, provenance, or durable facts?
5. Are mutable commercial identity and immutable technical artifacts genuinely separable?
6. Are EN/ES/RU semantics equivalent at disclosure, consent, refusal, escalation, and deletion boundaries?
7. Does the proposed plan defer vendors, production PII, public phone, and runtime integration until their evidence gates?
8. Is any slice premature, missing, redundant, or ordered incorrectly?
9. What exact revisions are required before Tony can accept the plan?

## Non-goals

No vendor, database, CRM, vector store, graph product, phone number, SIP route, credential, production PII, biometric identification, recording, transcript retention, public voice traffic, Product 1 mutation, deployment, or merge.
