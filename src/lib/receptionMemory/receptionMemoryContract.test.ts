import { describe, expect, it, vi } from "vitest";

import {
  CONTEXT_PACKET_MAX_NODES,
  CONTEXT_PACKET_SCHEMA,
  GRAPH_EDGE_KINDS,
  GRAPH_EDGE_SCHEMA,
  GRAPH_NODE_KINDS,
  GRAPH_NODE_SCHEMA,
  IDENTITY_ASSERTION_SCHEMA,
  MEMORY_CONSENT_GRANT_SCHEMA,
  MEMORY_DATA_CLASSES,
  MEMORY_OPERATIONS,
  MUTATION_PROPOSAL_SCHEMA,
  RECEPTION_AUDIENCE,
  RECEPTION_STATES,
  TENANT_ID,
  TERMINAL_RECEPTION_STATES,
  canonicalContextPacketDigestInput,
  computeContextPacketDigest,
  validateContextPacketForUse,
  validateGraphEdge,
  validateGraphNode,
  validateIdentityAssertion,
  validateMemoryConsentGrant,
  validateProposedMutation,
  validateReceptionTransition,
  type ContextPacket,
  type ContextPacketUseBinding,
  type GraphEdge,
  type GraphNode,
  type IdentityAssertion,
  type IdentityAssertionBinding,
  type MemoryConsentGrant,
  type ProposedAppendEdgeMutation,
  type ProposedAppendNodeMutation,
} from "./receptionMemoryContract";

const IDS = Object.freeze({
  assertion: "assertion_aaaaaaaaaaaaaaaa",
  subject: "subject_aaaaaaaaaaaaaaaa",
  otherSubject: "subject_bbbbbbbbbbbbbbbb",
  session: "session_aaaaaaaaaaaaaaaa",
  otherSession: "session_bbbbbbbbbbbbbbbb",
  nonce: "nonce_aaaaaaaaaaaaaaaa",
  consent: "consent_aaaaaaaaaaaaaaaa",
  packet: "packet_aaaaaaaaaaaaaaaa",
  project: "project_aaaaaaaaaaaaaaaa",
  nodeA: "node_aaaaaaaaaaaaaaaa",
  nodeB: "node_bbbbbbbbbbbbbbbb",
  edge: "edge_aaaaaaaaaaaaaaaa",
  sourceA: "source_aaaaaaaaaaaaaaaa",
  sourceB: "source_bbbbbbbbbbbbbbbb",
  mutation: "mutation_aaaaaaaaaaaaaaaa",
  dedupe: "dedupe_aaaaaaaaaaaaaaaa",
});

function identity(overrides: Record<string, unknown> = {}): IdentityAssertion {
  return {
    schema: IDENTITY_ASSERTION_SCHEMA,
    assertion_id: IDS.assertion,
    tenant_id: TENANT_ID,
    subject_id: IDS.subject,
    audience: RECEPTION_AUDIENCE,
    session_id: IDS.session,
    assurance_class: "verified_project_participant",
    issued_at: "2026-08-08T07:00:00Z",
    expires_at: "2026-08-08T07:05:00Z",
    nonce: IDS.nonce,
    verifier_version: "identity-verifier/1.0.0",
    ...overrides,
  } as IdentityAssertion;
}

function identityBinding(
  overrides: Record<string, unknown> = {},
): IdentityAssertionBinding {
  return {
    tenant_id: TENANT_ID,
    audience: RECEPTION_AUDIENCE,
    session_id: IDS.session,
    evaluated_at: "2026-08-08T07:01:00Z",
    ...overrides,
  } as IdentityAssertionBinding;
}

function consent(overrides: Record<string, unknown> = {}): MemoryConsentGrant {
  return {
    schema: MEMORY_CONSENT_GRANT_SCHEMA,
    consent_grant_id: IDS.consent,
    tenant_id: TENANT_ID,
    subject_id: IDS.subject,
    purpose: "project_continuity",
    data_classes: [...MEMORY_DATA_CLASSES].sort(),
    operations: [...MEMORY_OPERATIONS].sort(),
    channels: ["web_text"],
    policy_version: "memory-policy/1.0.0",
    granted_at: "2026-08-08T06:00:00Z",
    expires_at: "2026-08-08T08:00:00Z",
    revoked_at: null,
    ...overrides,
  } as MemoryConsentGrant;
}

function node(
  kind: GraphNode["kind"] = "subject",
  overrides: Record<string, unknown> = {},
): GraphNode {
  const payloads: Record<GraphNode["kind"], Record<string, unknown>> = {
    subject: {
      subject_id: IDS.subject,
      identity_vault_ref: "vault_aaaaaaaaaaaaaaaa",
    },
    contact_channel: {
      channel_ref: "channel_aaaaaaaaaaaaaaaa",
      channel_kind: "email",
      verification_state: "verified",
    },
    consent_grant: {
      consent_grant_id: IDS.consent,
      purpose: "project_continuity",
    },
    property: { property_ref: "property_aaaaaaaaaaaaaaaa" },
    lead_journey: { journey_id: "journey_aaaaaaaaaaaaaaaa" },
    project: { project_id: IDS.project, project_state: "active" },
    technical_artifact_ref: {
      artifact_id: "artifact_aaaaaaaaaaaaaaaa",
      artifact_schema: "adu-model/1",
      artifact_digest: `sha256:${"a".repeat(64)}`,
      release: "1.0.0",
      custody_ref: "custody_aaaaaaaaaaaaaaaa",
    },
    interaction_summary: {
      summary_code: "project_scope_confirmed",
      truth_class: "customer_stated",
      source_event_refs: ["event_aaaaaaaaaaaaaaaa"],
    },
    fact_assertion: {
      fact_code: "preferred_model",
      value_code: "adu_a_001",
      truth_class: "customer_stated",
      provenance_refs: [IDS.sourceA],
      observed_at: "2026-08-08T06:55:00Z",
      verified_at: null,
      expires_at: "2026-09-08T06:55:00Z",
      dispute_state: "none",
    },
    authorization_grant: {
      authorization_grant_id: "authorization_aaaaaaaaaaaaaaaa",
      subject_id: IDS.subject,
      session_id: IDS.session,
      purpose: "project_continuity",
      operations: ["read_context"],
      node_kinds: ["project", "subject"],
      expires_at: "2026-08-08T07:05:00Z",
    },
    retention_directive: {
      retention_directive_id: "retention_aaaaaaaaaaaaaaaa",
      retention_class: "project_active",
      legal_hold_state: "not_authorized",
      deletion_status: "not_requested",
      export_status: "not_requested",
    },
    evidence_ref: {
      evidence_ref: "evidence_aaaaaaaaaaaaaaaa",
      evidence_digest: `sha256:${"b".repeat(64)}`,
      evidence_kind: "product_2_sanitized",
    },
  };

  return {
    schema: GRAPH_NODE_SCHEMA,
    node_id: IDS.nodeA,
    tenant_id: TENANT_ID,
    kind,
    version: 1,
    created_at: "2026-08-08T06:55:00Z",
    retention_class: "project_active",
    payload: payloads[kind],
    ...overrides,
  } as unknown as GraphNode;
}

function edge(
  kind: GraphEdge["kind"] = "participates_in_project",
  overrides: Record<string, unknown> = {},
): GraphEdge {
  return {
    schema: GRAPH_EDGE_SCHEMA,
    edge_id: IDS.edge,
    tenant_id: TENANT_ID,
    kind,
    from_node_id: IDS.nodeA,
    to_node_id: IDS.nodeB,
    version: 1,
    created_at: "2026-08-08T06:56:00Z",
    valid_from: "2026-08-08T06:56:00Z",
    valid_until: null,
    source_ref: IDS.sourceA,
    policy_label: "memory-policy/1.0.0",
    deletion_behavior: "remove_relationship",
    ...overrides,
  } as GraphEdge;
}

function packetBase(overrides: Record<string, unknown> = {}): ContextPacket {
  const subject = node("subject", { node_id: IDS.nodeA });
  const project = node("project", { node_id: IDS.nodeB });
  return {
    schema: CONTEXT_PACKET_SCHEMA,
    packet_id: IDS.packet,
    tenant_id: TENANT_ID,
    subject_id: IDS.subject,
    project_id: IDS.project,
    purpose: "project_continuity",
    session_id: IDS.session,
    audience: RECEPTION_AUDIENCE,
    locale: "en",
    channel: "web_text",
    policy_version: "memory-policy/1.0.0",
    consent_grant_id: IDS.consent,
    identity_assertion_id: IDS.assertion,
    issued_at: "2026-08-08T07:00:30Z",
    expires_at: "2026-08-08T07:02:00Z",
    maximum_disclosure_class: "project_sensitive",
    nodes: [subject, project],
    edges: [edge()],
    provenance_refs: [IDS.sourceA],
    exclusions: ["raw_contact_value"],
    packet_digest: `sha256:${"0".repeat(64)}`,
    ...overrides,
  } as ContextPacket;
}

async function packet(overrides: Record<string, unknown> = {}): Promise<ContextPacket> {
  const candidate = packetBase(overrides);
  return {
    ...candidate,
    packet_digest: await computeContextPacketDigest(candidate),
  };
}

function contextBinding(
  overrides: Record<string, unknown> = {},
): ContextPacketUseBinding {
  return {
    tenant_id: TENANT_ID,
    subject_id: IDS.subject,
    project_id: IDS.project,
    purpose: "project_continuity",
    session_id: IDS.session,
    audience: RECEPTION_AUDIENCE,
    locale: "en",
    channel: "web_text",
    evaluated_at: "2026-08-08T07:01:00Z",
    ...overrides,
  } as ContextPacketUseBinding;
}

function appendNodeMutation(
  overrides: Record<string, unknown> = {},
): ProposedAppendNodeMutation {
  return {
    schema: MUTATION_PROPOSAL_SCHEMA,
    mutation_id: IDS.mutation,
    tenant_id: TENANT_ID,
    subject_id: IDS.subject,
    project_id: IDS.project,
    purpose: "project_continuity",
    session_id: IDS.session,
    audience: RECEPTION_AUDIENCE,
    channel: "web_text",
    identity_assertion_id: IDS.assertion,
    consent_grant_id: IDS.consent,
    proposed_at: "2026-08-08T07:01:00Z",
    deduplication_key: IDS.dedupe,
    retention_class: "project_active",
    operation: "append_node",
    node: node("subject"),
    ...overrides,
  } as ProposedAppendNodeMutation;
}

function appendEdgeMutation(
  overrides: Record<string, unknown> = {},
): ProposedAppendEdgeMutation {
  return {
    schema: MUTATION_PROPOSAL_SCHEMA,
    mutation_id: IDS.mutation,
    tenant_id: TENANT_ID,
    subject_id: IDS.subject,
    project_id: IDS.project,
    purpose: "project_continuity",
    session_id: IDS.session,
    audience: RECEPTION_AUDIENCE,
    channel: "web_text",
    identity_assertion_id: IDS.assertion,
    consent_grant_id: IDS.consent,
    proposed_at: "2026-08-08T07:01:00Z",
    deduplication_key: IDS.dedupe,
    retention_class: "project_active",
    operation: "append_edge",
    edge: edge(),
    ...overrides,
  } as ProposedAppendEdgeMutation;
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value as Record<string, unknown>)) {
      deepFreeze(nested);
    }
  }
  return value;
}

function isDeepFrozen(value: unknown): boolean {
  if (value === null || typeof value !== "object") return true;
  return Object.isFrozen(value) && Object.values(value).every(isDeepFrozen);
}

describe("reception state contract", () => {
  it("publishes the exact state and terminal sets", () => {
    expect(RECEPTION_STATES).toEqual([
      "anonymous",
      "disclosed",
      "consent_candidate",
      "identity_candidate",
      "identity_verified",
      "context_scoped",
      "active",
      "escalated",
      "ended",
      "refused",
    ]);
    expect(TERMINAL_RECEPTION_STATES).toEqual(["escalated", "ended", "refused"]);
  });

  it("accepts sequential progress and refuses skips or terminal revival", () => {
    expect(validateReceptionTransition({ from_state: "anonymous", to_state: "disclosed" }).ok).toBe(true);
    expect(validateReceptionTransition({ from_state: "anonymous", to_state: "active" })).toEqual({
      ok: false,
      reason_code: "illegal_reception_transition",
    });
    expect(validateReceptionTransition({ from_state: "refused", to_state: "anonymous" })).toEqual({
      ok: false,
      reason_code: "terminal_state_transition_forbidden",
    });
  });

  it("rejects unknown keys on the transition record", () => {
    expect(validateReceptionTransition({ from_state: "anonymous", to_state: "disclosed", inferred: true })).toEqual({
      ok: false,
      reason_code: "invalid_transition_shape",
    });
  });
});

describe("identity assertion contract", () => {
  it("accepts only a short-lived assertion bound to this audience and session", () => {
    const input = identity();
    const result = validateIdentityAssertion(input, identityBinding());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).not.toBe(input);
    expect(isDeepFrozen(result.value)).toBe(true);
  });

  it.each([
    [identity({ expires_at: "2026-08-08T07:05:01Z" }), identityBinding(), "identity_ttl_exceeded"],
    [identity({ issued_at: "2026-02-29T07:00:00Z" }), identityBinding(), "invalid_timestamp"],
    [identity(), identityBinding({ session_id: IDS.otherSession }), "session_mismatch"],
    [identity(), identityBinding({ evaluated_at: "2026-08-08T07:05:00Z" }), "identity_expired"],
  ])("refuses invalid, replayed, or mismatched identity assertions", (input, binding, reason) => {
    expect(validateIdentityAssertion(input, binding)).toEqual({ ok: false, reason_code: reason });
  });

  it("validates tenant before any disclosure-bearing field", () => {
    expect(validateIdentityAssertion({ ...identity(), tenant_id: "tenant_attacker", subject_id: "PII" }, identityBinding())).toEqual({
      ok: false,
      reason_code: "invalid_tenant",
    });
  });

  it("rejects unknown keys in both assertion and binding records", () => {
    expect(validateIdentityAssertion({ ...identity(), caller_id: "+19165550123" }, identityBinding())).toEqual({
      ok: false,
      reason_code: "invalid_identity_shape",
    });
    expect(validateIdentityAssertion(identity(), { ...identityBinding(), provider: "foreign" })).toEqual({
      ok: false,
      reason_code: "invalid_binding_shape",
    });
  });
});

describe("purpose-specific consent contract", () => {
  const use = {
    tenant_id: TENANT_ID,
    subject_id: IDS.subject,
    purpose: "project_continuity",
    channel: "web_text",
    operation: "read_context",
    data_classes: ["identity_reference", "project"],
    evaluated_at: "2026-08-08T07:01:00Z",
  } as const;

  it("accepts a canonical, affirmative grant and returns a frozen clone", () => {
    const input = deepFreeze(consent());
    const before = JSON.stringify(input);
    const result = validateMemoryConsentGrant(input, use);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).not.toBe(input);
    expect(isDeepFrozen(result.value)).toBe(true);
    expect(JSON.stringify(input)).toBe(before);
  });

  it.each([
    [{ ...use, purpose: "current_session_service" }, "purpose_mismatch"],
    [{ ...use, channel: "phone" }, "channel_not_consented"],
    [{ ...use, operation: "propose_append_node" }, "operation_not_consented"],
    [{ ...use, data_classes: ["identity_reference", "retention"] }, "data_class_not_consented"],
  ] as const)("enforces the exact granted use", (binding, reason) => {
    const restricted = consent({
      data_classes: ["identity_reference", "project"],
      operations: ["read_context"],
    });
    expect(validateMemoryConsentGrant(restricted, binding)).toEqual({ ok: false, reason_code: reason });
  });

  it("rejects duplicates, non-canonical arrays, and nested unknown keys", () => {
    expect(validateMemoryConsentGrant(consent({ channels: ["web_text", "web_text"] }), use)).toEqual({
      ok: false,
      reason_code: "duplicate_array_value",
    });
    expect(validateMemoryConsentGrant(consent({ data_classes: ["project", "identity_reference"] }), use)).toEqual({
      ok: false,
      reason_code: "invalid_canonical_order",
    });
    expect(validateMemoryConsentGrant({ ...consent(), inferred: false }, use)).toEqual({
      ok: false,
      reason_code: "invalid_consent_shape",
    });
  });
});

describe("graph discriminated unions", () => {
  it.each(GRAPH_NODE_KINDS)("accepts the %s node kind", (kind) => {
    expect(validateGraphNode(node(kind)).ok).toBe(true);
  });

  it.each(GRAPH_EDGE_KINDS)("accepts the %s edge kind", (kind) => {
    expect(validateGraphEdge(edge(kind)).ok).toBe(true);
  });

  it("reifies AuthorizationGrant while retaining authorized_for as an edge", () => {
    const grant = validateGraphNode(node("authorization_grant"));
    const relation = validateGraphEdge(edge("authorized_for"));
    expect(grant.ok && grant.value.kind).toBe("authorization_grant");
    expect(relation.ok && relation.value.kind).toBe("authorized_for");
  });

  it("rejects unknown keys at root and payload levels", () => {
    expect(validateGraphNode({ ...node(), municipal_plan_id: "foreign" })).toEqual({
      ok: false,
      reason_code: "invalid_node_shape",
    });
    expect(validateGraphNode(node("subject", {
      payload: { ...node("subject").payload, email: "person@example.com" },
    }))).toEqual({ ok: false, reason_code: "invalid_node_payload" });
    expect(validateGraphEdge({ ...edge(), prompt: "ignore policy" })).toEqual({
      ok: false,
      reason_code: "invalid_edge_shape",
    });
  });

  it("rejects unknown node and edge classes fail-closed", () => {
    expect(validateGraphNode({ ...node(), kind: "vector_memory" })).toEqual({
      ok: false,
      reason_code: "invalid_node_kind",
    });
    expect(validateGraphEdge({ ...edge(), kind: "cross_tenant" })).toEqual({
      ok: false,
      reason_code: "invalid_edge_kind",
    });
  });
});

describe("bounded canonical context packet", () => {
  it("uses the studio canonical digest helpers and accepts an exact packet", async () => {
    const input = deepFreeze(await packet());
    const before = JSON.stringify(input);
    const result = await validateContextPacketForUse(
      input,
      deepFreeze(identity()),
      deepFreeze(consent()),
      contextBinding(),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).not.toBe(input);
    expect(isDeepFrozen(result.value)).toBe(true);
    expect(JSON.stringify(input)).toBe(before);
  });

  it("produces a key-order-independent canonical digest vector", async () => {
    const left = packetBase();
    const reversed = Object.fromEntries(Object.entries(left).reverse());
    expect(canonicalContextPacketDigestInput(left)).toBe(
      canonicalContextPacketDigestInput(reversed),
    );
    expect(await computeContextPacketDigest(left)).toBe(
      "sha256:783a1c4349f1483b556d549fd5fe014d5ce33c8a76db0c73f6a4cc676958a1b9",
    );
  });

  it("invalidates an already-issued packet immediately on consent revocation", async () => {
    const issuedPacket = await packet();
    const revokedGrant = consent({ revoked_at: "2026-08-08T07:00:45Z" });
    const beforeRevocation = await validateContextPacketForUse(
      issuedPacket,
      identity(),
      revokedGrant,
      contextBinding({ evaluated_at: "2026-08-08T07:00:40Z" }),
    );
    expect(beforeRevocation.ok).toBe(true);
    expect(await validateContextPacketForUse(
      issuedPacket,
      identity(),
      revokedGrant,
      contextBinding({ evaluated_at: "2026-08-08T07:00:45Z" }),
    )).toEqual({ ok: false, reason_code: "consent_revoked" });
  });

  it.each([
    [async () => ({ ...(await packet()), packet_digest: `sha256:${"f".repeat(64)}` }), "digest_mismatch"],
    [async () => packet({ expires_at: "2026-08-08T07:02:31Z" }), "packet_ttl_exceeded"],
    [async () => packet({ nodes: [node("project", { node_id: IDS.nodeB }), node("subject", { node_id: IDS.nodeA })] }), "invalid_canonical_order"],
    [async () => packet({ edges: [edge("participates_in_project", { to_node_id: "node_cccccccccccccccc" })] }), "edge_endpoint_not_disclosed"],
  ] as const)("refuses non-canonical or unbound packet material", async (makeInput, reason) => {
    expect(await validateContextPacketForUse(
      await makeInput(),
      identity(),
      consent(),
      contextBinding(),
    )).toEqual({ ok: false, reason_code: reason });
  });

  it("enforces node cardinality and exact packet keys", async () => {
    const nodes = Array.from({ length: CONTEXT_PACKET_MAX_NODES + 1 }, (_, index) =>
      node("subject", { node_id: `node_${index.toString(36).padStart(16, "0")}` }),
    );
    const oversized = await packet({ nodes, edges: [] });
    expect(await validateContextPacketForUse(oversized, identity(), consent(), contextBinding())).toEqual({
      ok: false,
      reason_code: "packet_node_limit_exceeded",
    });
    const unknownKey = { ...(await packet()), raw_transcript: "secret" };
    expect(await validateContextPacketForUse(unknownKey, identity(), consent(), contextBinding())).toEqual({
      ok: false,
      reason_code: "invalid_packet_shape",
    });
  });

  it("refuses packets that outlive their identity assertion", async () => {
    const shortIdentity = identity({ expires_at: "2026-08-08T07:01:30Z" });
    expect(await validateContextPacketForUse(
      await packet(),
      shortIdentity,
      consent(),
      contextBinding(),
    )).toEqual({ ok: false, reason_code: "packet_outlives_identity" });
  });
});

describe("proposed mutation envelopes", () => {
  it("accepts append-node and append-edge proposals only", () => {
    expect(validateProposedMutation(appendNodeMutation(), identity(), consent()).ok).toBe(true);
    expect(validateProposedMutation(appendEdgeMutation(), identity(), consent()).ok).toBe(true);
    for (const operation of ["correct_node", "export_subject", "unlink", "delete_subject"]) {
      expect(validateProposedMutation(
        { ...appendNodeMutation(), operation },
        identity(),
        consent(),
      )).toEqual({ ok: false, reason_code: "unsupported_mutation_operation" });
    }
  });

  it("binds the proposed record to identity, consent, tenant, subject, and retention", () => {
    expect(validateProposedMutation(
      appendNodeMutation({ identity_assertion_id: "assertion_bbbbbbbbbbbbbbbb" }),
      identity(),
      consent(),
    )).toEqual({ ok: false, reason_code: "mutation_binding_mismatch" });
    expect(validateProposedMutation(
      appendNodeMutation({ node: node("subject", { tenant_id: "tenant_attacker" }) }),
      identity(),
      consent(),
    )).toEqual({ ok: false, reason_code: "invalid_tenant" });
    expect(validateProposedMutation(
      appendNodeMutation({ retention_class: "session" }),
      identity(),
      consent(),
    )).toEqual({ ok: false, reason_code: "mutation_binding_mismatch" });
  });

  it("returns a deeply frozen clone without mutating any frozen input", () => {
    const proposal = deepFreeze(appendNodeMutation());
    const assertion = deepFreeze(identity());
    const grant = deepFreeze(consent());
    const before = JSON.stringify({ proposal, assertion, grant });
    const result = validateProposedMutation(proposal, assertion, grant);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).not.toBe(proposal);
    expect(isDeepFrozen(result.value)).toBe(true);
    expect(JSON.stringify({ proposal, assertion, grant })).toBe(before);
  });
});

describe("untrusted-input and determinism guarantees", () => {
  it("never throws for arbitrary untrusted records", async () => {
    const hostile = new Proxy({}, { ownKeys: () => { throw new Error("hostile"); } });
    for (const input of [null, undefined, 1, "memory", [], {}, hostile]) {
      expect(() => validateReceptionTransition(input)).not.toThrow();
      expect(() => validateIdentityAssertion(input, input)).not.toThrow();
      expect(() => validateMemoryConsentGrant(input, input)).not.toThrow();
      expect(() => validateGraphNode(input)).not.toThrow();
      expect(() => validateGraphEdge(input)).not.toThrow();
      expect(() => validateProposedMutation(input, input, input)).not.toThrow();
      await expect(validateContextPacketForUse(input, input, input, input)).resolves.toMatchObject({ ok: false });
    }
  });

  it("is clock-free and deterministic", async () => {
    const now = vi.spyOn(Date, "now").mockReturnValue(9999999999999);
    const transition = { from_state: "anonymous", to_state: "disclosed" };
    expect(validateReceptionTransition(transition)).toEqual(validateReceptionTransition(transition));
    expect(validateIdentityAssertion(identity(), identityBinding())).toEqual(
      validateIdentityAssertion(identity(), identityBinding()),
    );
    const input = await packet();
    expect(await validateContextPacketForUse(input, identity(), consent(), contextBinding())).toEqual(
      await validateContextPacketForUse(input, identity(), consent(), contextBinding()),
    );
    expect(now).not.toHaveBeenCalled();
    now.mockRestore();
  });
});
