# DEEDSEAL INTEGRATION BOUNDARY — Product 2 consumer contract

## Verified anchor and current limitation

The current repository-backed Product 1 anchor is `kbp-dev-office@cf3ab75285804f3c01aed9f9658b70ff1def0ddb`. It fixes Product 1's finish line: complete key ceremonies including weekly hardware-root use, a working Owner cockpit, then the fork to Product 2.

The same anchor reports performed owner-granted effects, one brokered model call, signer/evidence cycle, and remaining gaps. It does not publish a Product 2 consumer API or prove the finish line complete. Therefore this document defines the target boundary, not a live integration.

The older Product 2 `core-compatibility.md` anchor at `kbp-core@bb52a6f` is historical and insufficient for implementation.

## Target role split

Product 2 owns customer experience, identity/consent integration, graph memory, domain validation, and candidate artifacts.

Deedseal owns effect authorization, deny-by-default grant validation, isolated execution, constrained broker/provider access, custody, append-only evidence position, and offline-verifiable result envelopes.

The model owns neither plane.

## Candidate operation families

- `memory.read_context` — read-only, exact scope and digest.
- `memory.propose_mutation` — local candidate only; no durable write.
- `memory.commit_mutation` — controlled durable Product 2 write.
- `reception.create_handoff_candidate` — local candidate.
- `lead.advance_state` — controlled Product 2 state transition.
- `project.create_candidate_artifact` — local candidate.
- `external.contact_customer` — external effect, human/owner gate.
- `external.schedule_appointment` — external effect, human/owner gate.
- `external.send_proposal` — external/legal/commercial effect, human/owner gate.

Names and effect classes remain provisional until mapped to the exact Product 1 contract.

## Required request binding

A future adapter must bind operation schema/version, Product 2 actor/session, tenant, subject/project opaque IDs, purpose, consent digest, context-packet digest, candidate artifact digest, effect class, destination/provider contour, expiry, replay nonce, expected changed records/surfaces, evidence policy, and owner/human approval where required.

No PII, raw audio, transcript, provider credential, or unbounded prompt belongs in the grant or durable Deedseal evidence.

## Result binding

The returned envelope must bind exact request/grant digest, operation result code, sanitized output digest, evidence/log position, custody/service attestation, execution identity, contract versions, and refusal reason. Product 2 accepts no side-channel success.

## Integration gates

1. Product 1 full-working-state disposition is merged.
2. Exact Product 1 consumer contract and conformance vectors exist.
3. Product 2 pins repository, commit, schema, and compatibility policy.
4. Synthetic positive/negative adapter probes pass.
5. Cross-customer, replay, overbroad grant, wrong digest, expired consent, unauthorized provider, and durable-surface leakage probes pass.
6. Product 1 and Product 2 independent reviews are complete.
7. Tony separately authorizes non-production integration.
8. Production PII, public voice, and external contact each keep separate activation gates.

## Fail-closed rule

Until every gate above is satisfied, Product 2 remains `Deedseal-targeted`, not `Deedseal-integrated`. Any missing contract, signature, digest, scope, custody proof, or evidence position refuses.
