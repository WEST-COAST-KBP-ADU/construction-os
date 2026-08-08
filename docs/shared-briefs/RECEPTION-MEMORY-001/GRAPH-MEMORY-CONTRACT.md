# GRAPH MEMORY CONTRACT — consented customer and project continuity

## Boundary

Graph memory is a Product 2 data plane behind deterministic policy. It is not exposed to the model, public client, voice provider, or Product 1 runtime. Vector similarity may propose candidates; it never authorizes retrieval, linking, or identity.

## Node classes

- `Subject`: opaque customer/person identity; PII lives only in a protected identity vault reference.
- `ContactChannel`: verified/unverified channel state by opaque reference.
- `ConsentGrant`: purpose, data classes, operations, policy version, expiry, revocation.
- `Property`: commercial relationship to an address/property identity; sensitive locator stored outside immutable artifacts.
- `LeadJourney`: reference to the deterministic lead ledger.
- `Project`: mutable commercial project container.
- `TechnicalArtifactRef`: opaque ID, schema, digest, release, and custody reference only.
- `InteractionSummary`: minimal derived summary with source event references.
- `FactAssertion`: value, truth class, provenance, observed/verified time, expiry, dispute state.
- `AuthorizationEdge`: who/session/purpose may access which node classes and operations.
- `RetentionDirective`: retention class, legal hold state if separately authorized, deletion/export status.
- `EvidenceRef`: pointer to sanitized Deedseal or Product 2 evidence, never raw PII.

## Edge classes

`owns_contact`, `consented_for`, `associated_with_property`, `participates_in_project`, `continues_journey`, `references_artifact`, `summarized_from`, `asserted_by`, `verified_by`, `supersedes`, `disputes`, `authorized_for`, `retained_under`, and `evidenced_by`.

Every edge has tenant, source, version, created time, validity window, policy label, and deletion behavior. Unknown edge types refuse.

## Mutable and immutable separation

Immutable technical artifacts are addressed by digest and contain no reverse pointer to subject, phone, email, street address tied to an inquiry, or private project notes. The mutable graph may reference an artifact. Deleting a subject removes or tombstones the graph-side relationship under policy while leaving the artifact digest valid and non-identifying.

Evidence ledgers record that an operation occurred and its sanitized digest/result. They do not become the customer graph. The graph does not rewrite evidence history.

## Read protocol

A read request binds tenant, verified subject assertion, project selector, purpose, requested node/edge classes, session, locale, policy version, and nonce. The policy engine:

1. validates identity assertion and consent;
2. resolves exact subject and project scope;
3. rejects stale, revoked, disputed, over-classified, or cross-scope paths;
4. traverses only an allowlisted relation plan with depth and cardinality limits;
5. emits a minimal canonical context packet;
6. records sanitized allow/refuse evidence.

No open-ended graph query or model-authored traversal enters this boundary.

## Write protocol

The model can submit only a proposed mutation. A deterministic validator checks exact schema, provenance, truth class, subject/project bindings, consent, deduplication key, and retention class. Sensitive or authoritative upgrades require human review. Accepted mutations are append-only versions; correction supersedes rather than overwrites. Duplicate/replayed commands are idempotent or refuse with stable reason codes.

## Summary discipline

A summary is never a source. It stores source-event references and distinguishes direct customer statement, verified fact, inference, dispute, and unknown. Regeneration from sources must be possible. Poisoned or prompt-like content is inert quoted data and cannot become instructions.

## Correction, export, deletion, unlink

- correction creates a new assertion and supersession edge;
- export is subject-scoped, authenticated, purpose-checked, rate-limited, and evidence-producing;
- unlink removes a commercial relationship without altering the technical artifact;
- deletion follows an adopted retention contract, blocks retrieval immediately, and produces a sanitized completion/refusal record;
- a missing provider capability, backup behavior, legal hold, or ambiguous scope blocks activation.

## Mandatory negative probes

Cross-subject traversal, cross-project traversal, tenant confusion, candidate-match disclosure, stale identity assertion, revoked consent, poisoned summary, prompt injection, illegal truth upgrade, unknown edge, unbounded depth, mass export, deletion replay, backup resurrection, provider-retained copy, and PII inserted into immutable technical fields.
