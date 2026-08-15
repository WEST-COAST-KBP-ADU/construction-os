# Product 2 Graph Foundation Alignment v1

Status: **OWNER-ADOPTED**
Decision: `PRODUCT2-GRAPH-FOUNDATION-ALIGNMENT-0001`

## Adoption provenance

| Fact | Exact record |
| :--- | :--- |
| Adopted by | Owner `avoroncov971-maker`, who alone adopts and merges |
| Adopting merge | <https://github.com/WEST-COAST-KBP-ADU/construction-os/pull/318> |
| Merge commit | `af6b1f3ed22daedaa05c60a923891020da48e6bc` |
| Adopting Issue | <https://github.com/WEST-COAST-KBP-ADU/construction-os/issues/317> |

The adopted semantics below are unchanged by this reconciliation. What changed
is only status and provenance language: this header, the two paragraphs marked
**[Status reconciled]**, and four stale references that still called this
adopted record a "candidate". No vocabulary, authority, promotion rule, plane,
disposition or exclusion in this record was rewritten, widened or narrowed.

Adoption fixes this record's vocabulary as the language later Product 2 packets
are written in. It is not an activation: every non-activation clause below
remains in force, and this record still authorizes no production behaviour.

## North Star

Product 2 is the graph-native operating system for an ADU and general-construction business: every inquiry can become a source-backed, tenant-scoped commercial journey and, only through explicit authority gates, an opportunity and a project without losing provenance or granting automation commercial authority.

This record aligns vocabulary needed by the next two contract edges. It neither replaces current contracts nor designs the whole Construction OS.

## Channel vocabulary

The following fields are distinct and must not be collapsed:

| Field | Meaning | Examples and boundary |
| :--- | :--- | :--- |
| `acquisition_source` | How attention or intent was acquired. | Organic search, direct, referral, paid search, partner, or unknown. This is attribution, not transport or identity. |
| `interaction_surface` | Where a person or synthetic actor interacts with Product 2. | Website, Studio, Property Fit, a phone conversation, or an email exchange. A surface is not automatically an operational adapter. |
| `operational_ingress_channel` | The authenticated, policy-gated adapter that accepts an inbound operational event. | The intended production adapters are phone and email only. Adapter availability still requires later activation authority. |
| `response_channel` | The separately authorized route for a response. | Phone or email, selected under consent, recipient, content, and external-effect policy; ingress never implies response authority. |

Phone and email are the intended production `operational_ingress_channel` adapters. The current website, Studio, and Property Fit surfaces remain anonymous and synthetic under current boundaries. Website acquisition or interaction does not make the website a third operational ingress adapter. Surface activity can prepare an anonymous, non-PII candidate or an opaque technical reference, but it cannot create an authenticated operational event.

## Tenant-scoped graph roots

Each of these is an independent root within one tenant boundary:

- `Subject` — an opaque identity root whose PII, if later authorized, remains behind a protected vault reference;
- `LeadJourney` — the append-only provenance and commercial-intent journey;
- `Opportunity` — a separately admitted commercial opportunity;
- `Project` — a separately admitted construction-project root;
- `PropertyRef` — an opaque property reference, not an embedded address or a claim about feasibility.

No root owns or contains another root. In particular, `Project` ownership is not nested under one `Subject`: a project may have multiple authorized participants, and a subject may participate in multiple projects. Relationships exist only as tenant-scoped, versioned, typed edges with source, validity, policy, and deletion behavior. Examples include subject-to-journey participation, journey-to-opportunity promotion, opportunity-to-project admission, project-to-property association, and subject-to-project participation. An absent, unknown, or mismatched tenant or an unknown edge type refuses before traversal or disclosure.

## Promotion authority

The canonical promotion line is:

```text
IngressAttempt → LeadJourney → Opportunity → Project
```

These are admissions, not renames or automatic state inference:

| Promotion | Exact authority |
| :--- | :--- |
| `IngressAttempt → LeadJourney` | A deterministic contract validator may create a journey candidate only after schema, idempotency, tenant, channel-policy, minimal-consent, and provenance checks pass. It cannot verify identity, approve contact, or admit an opportunity. |
| `LeadJourney → Opportunity` | An authorized human commercial reviewer alone admits the opportunity through an explicit, evidence-bound decision after qualification and consent checks. A classifier may propose the transition but cannot execute it. |
| `Opportunity → Project` | The Owner or an Owner-designated authorized human project-admission role alone admits a project through an explicit, evidence-bound decision. A won lead, customer relationship, signature candidate, or model recommendation does not create a project. |

Every promotion produces a bounded append-only event carrying actor, authority basis, prior and next state, source references, timestamp, reason, correlation ID, and idempotency key. A rejection, expiry, withdrawal, or purge path does not silently promote. **Candidate-match is not authentication**: caller ID, an email sender, similarity, shared text, a thread, or a model match can propose candidates only. Identity verification and authorization remain independent deterministic gates.

## Four isolated graph planes

Isolation is mechanical, not a naming convention. The four planes are:

| Plane | Holds | Must not hold or do |
| :--- | :--- | :--- |
| Channel evidence plane | Immutable ingress envelopes, provider/source references, authenticity signals, protected-content references, timestamps, and digests. | Canonical identity, commercial promotion, project truth, or open graph traversal. |
| Identity and consent plane | Protected identity/contact material, verification assertions, consent grants, revocation, and opaque `Subject`/channel references. | Raw technical artifacts, commercial-state authority, or model-directed identity resolution. |
| Commercial relationship plane | `LeadJourney`, `Opportunity`, `Project`, `PropertyRef`, typed relations, bounded facts, and promotion events. | Raw PII, provider payloads, secrets, or immutable technical artifact bodies. |
| Technical and evidence plane | Immutable non-PII technical artifacts and sanitized evidence addressed by schema, exact version, and digest. | Reverse PII pointers, customer identity, private notes, or commercial promotion authority. |

Each plane requires a separate service role and credential, with an API capability allowlist that exposes only the minimum read, proposal, or acceptance operations for that plane. No shared superuser credential or database role may traverse all four planes. Cross-plane material is represented only by opaque typed references and cryptographic digests; raw payload copying and join-by-PII are forbidden. Tenant checks occur at every plane boundary. The choice of storage engine does not relax these requirements.

## AI authority ceiling

AI is proposal-only. It may classify an ingress attempt, extract a bounded schema candidate, propose candidate matches, prepare a sanitized summary, recommend a registered graph, or propose a mutation for deterministic and human review.

AI has no authority to resolve identity, authenticate a subject, perform arbitrary traversal, mutate canonical records, promote an ingress attempt or graph root, create an accepted customer or project, make a commitment, select a recipient, send a response, call a provider, or cause any external effect. Prompt content, transcripts, forwarded text, attachments, summaries, and similarity results are untrusted data and cannot widen these capabilities.

## Compatibility, migration, and disposition

| Existing source | Disposition under this decision |
| :--- | :--- |
| Adopted `FUNNEL-CONTRACT.md` | Remains adopted and stable. Its `source_channel` maps prospectively to `acquisition_source` where it expresses attribution; its phone path may later feed the phone operational adapter. Its funnel states remain the current commercial ledger until a separately versioned adapter is adopted. No transition, retention rule, or production gate is changed here. |
| `src/lib/leads/leadContract.ts` v1 | `lead-contract/1.0.0` and `lead-candidate/1` remain stable, including their raw-PII fields (`contact_name`, `phone`, `email`, supplied `address_text`, and `note`). A PII-free graph/vault boundary must be a later versioned adapter or v2 contract, never a silent schema reinterpretation. No v1 field is renamed, repurposed, removed, or newly authorized for production. |
| Reception Memory contract and context engine | Preserve tenant refusal, consent and verified-identity gates, bounded traversal plans, typed proposals, opaque vault/artifact references, digests, correction, revocation, and deletion refusal. A later version must add `Opportunity` and independent `PropertyRef` root semantics and remove any assumption that project scope is owned by or reachable only through one subject. Existing v1 behavior is not silently reinterpreted. |
| Issue #284 | Retain phone/email dispatcher direction, normalized intake, registered graph selection, stable journey provenance, human promotion, and terminal purge intent. Replace its single cumulative-graph wording with independent roots joined by typed edges, and replace direct `IntakeEvent → lead-candidate/1` assumptions with the versioned `IngressAttempt` bridge. It remains direction, not implementation or activation authority. |
| PR #84 | Preserve unchanged as a frozen, synthetic lifecycle-engine artifact at its recorded head and stacked base. Its review blocker and Owner freeze remain effective. This decision does not repair, rebase, review, merge, or treat it as current `main`. |
| PR #86 | Preserve unchanged as a frozen, channel-neutral orchestrator artifact dependent on #84. It may inform later adapter work but supplies no current activation or acceptance authority. This decision does not repair, rebase, review, merge, or alter its stack. |
| PR #90 | Preserve unchanged as frozen pre-activation hardening dependent on #86/#84. Its scope checks remain useful evidence only; this decision does not repair, rebase, review, merge, activate, or alter it. |

Append-only evidence establishes provenance and correction history; it does not itself decide deletion timing, backup erasure, legal hold, provider-copy behavior, or retained receipts. Deletion and backup semantics remain later Owner decisions behind privacy, retention, and provider-capability gates.

## Non-activation and exclusions

This decision authorizes no production PII; identity vault; database or provider choice; graph database adoption; PostgreSQL provider; phone number, telephony, mailbox, or email configuration; credentials; secrets; data migration; deployment; production activation; outbound message; call; commitment; or other external effect. **[Status reconciled]** Tony adopted this record by merging pull request #318 at `af6b1f3ed22daedaa05c60a923891020da48e6bc`; that adoption is a vocabulary decision only and carries none of the authorities this paragraph withholds. Tony alone merges any later change to it.

It includes no module registry, delivery DAG, neural layer, 3D work, Hero implementation, old-PR repair, runtime code, schema mutation, or provider research.

## Ordered follow-on code edges

**[Status reconciled]** The Owner has adopted and merged this record, so this
condition is satisfied. The only two follow-on code edges authorized for
separate packet preparation are, in order:

1. `DUAL-INGRESS-CONTRACT-0001`;
2. `INGRESS-ATTEMPT-LIFECYCLE-0001`.

Neither edge is implemented or activated by this record, and the second does not begin before the first is separately adopted and merged. Authorization to *prepare* a packet is not authorization to implement, activate, or merge one.
