# DECISION — Proposed reception and memory architecture

- Status: **PROPOSED — FABLE REVIEW AND OWNER ACCEPTANCE REQUIRED**
- Architecture Issue: #74
- Current policy: DR-0016 remains operative for public automated voice; this architecture prepares EN/ES/RU but does not change public voice policy
- Required future record: any public EN/ES/RU voice activation must include an owner-accepted decision record that explicitly amends or supersedes DR-0016; DR-0004 and BOUNDARIES change only through later privacy/retention activation records
- Does not activate production behavior

## Proposed decision

Product 2 adopts one provider-neutral reception domain with two channel adapters:

- web text/voice on the Product 2 customer surface;
- phone/SIP through a separate real-time media service, never through a long-lived Next.js/Vercel request path.

The architecture targets conversational service in English, Spanish, and Russian only after each language passes equivalent safety, quality, disclosure, refusal, and escalation tests. Channel or language does not change authority. DR-0016 remains operative for public automated voice until the separate public-voice activation gate adopts the required superseding or amending decision record.

Durable returning-customer continuity is a Product 2 graph-memory service. It is not provider memory, model conversation history, a transcript archive, a vector database used as authority, or Deedseal's evidence ledger.

Product 1 / Deedseal remains the only target effect contour: owner-signed/granted authority, deny by default, isolated execution, and evidence. Product 2 contracts may be prepared now, but no integration or readiness claim exists until Product 1 reaches its recorded full-working-state boundary and an exact consumer contract is pinned by repository, version, schema, and SHA.

## Invariants

1. Candidate matching is not authentication.
2. Sensitive context unlocks only after verified identity and active purpose-specific consent.
3. The model receives a bounded context packet, never graph or database credentials.
4. Context policy is deterministic, versioned, fail-closed, and evaluated before every read and mutation.
5. Every durable statement carries provenance and one truth class: customer-stated, source-observed, verified, inferred, disputed, stale, or unknown.
6. Inference never silently upgrades to fact.
7. Prompt text and retrieved memory cannot alter policy, authority, consent, retention, or tool grants.
8. Customer/project isolation is structural: tenant, subject, project, purpose, and session scopes must all bind.
9. Raw audio and transcripts are non-retained by default.
10. Commercial identity can be corrected, exported, unlinked, or deleted without changing immutable technical digests.
11. Immutable technical artifacts contain opaque commercial references at most and never point back to PII.
12. Every read, proposed write, accepted write, correction, export, unlink, deletion, refusal, and effect request produces sanitized evidence.
13. Humans retain all commitments: contact, feasibility, price, schedule, permit/code, appointment confirmation, proposal, and sale.
14. Providers remain replaceable behind explicit adapters.

## Product 1 sequencing

Architecture preparation and synthetic contract work may proceed in Product 2. Live Product 2 execution through Deedseal is blocked until all are true:

- Product 1 full-working-state completion is repository-backed;
- hardware-root weekly use and Owner cockpit are evidenced;
- an exact Product 1 consumer contract is published;
- the Product 2 adapter is tested against that exact contract;
- Tony separately accepts activation.

## Not decided

No storage engine, graph vendor, embedding model, identity provider, voice stack, retention period, legal basis, privacy text, DPA, production region, backup policy, disaster recovery target, public launch, or budget.
