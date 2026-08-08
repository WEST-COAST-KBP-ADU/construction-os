import { describe, expect, it, vi } from "vitest";

import {
  GRAPH_EDGE_SCHEMA,
  GRAPH_NODE_SCHEMA,
  IDENTITY_ASSERTION_SCHEMA,
  MEMORY_CONSENT_GRANT_SCHEMA,
  MEMORY_DATA_CLASSES,
  MEMORY_OPERATIONS,
  RECEPTION_AUDIENCE,
  TENANT_ID,
  type GraphEdge,
  type GraphNode,
  type IdentityAssertion,
  type MemoryConsentGrant,
  type MemoryPurpose,
} from "./receptionMemoryContract";
import { type ContextPolicyRequest, type SyntheticMemoryGraph } from "./contextPolicyEngine";
import {
  DELETION_CAPABILITY_SCHEMA,
  MEMORY_LIFECYCLE_COMMAND_SCHEMA,
  createEmptyMemoryLifecycleState,
  type MemoryLifecycleCommand,
  type MemoryLifecycleState,
} from "./memoryLifecycleEngine";
import {
  ORCHESTRATOR_REFUSAL_CODES,
  RECEPTION_REQUEST_SCHEMA,
  SEMANTIC_FIXTURE_SCHEMA,
  computeSemanticDigest,
  createReceptionOrchestratorState,
  orchestrateReception,
  resolveSemanticFixture,
  type CanonicalIntent,
  type CanonicalSemantic,
  type ReceptionOrchestrationRequest,
  type ReceptionOrchestratorState,
  type ReceptionOrchestratorSuccess,
} from "./receptionOrchestrator";

const AT = "2026-08-08T07:01:00Z";
const PURPOSE = "returning_customer_continuity" as const;
const IDS = Object.freeze({
  subject: "subject_aaaaaaaaaaaaaaaa",
  session: "session_aaaaaaaaaaaaaaaa",
  assertion: "assertion_aaaaaaaaaaaaaaaa",
  consent: "consent_aaaaaaaaaaaaaaaa",
  subjectNode: "node_subjectaaaaaaaaaa",
  summaryNode: "node_summaryaaaaaaaaaa",
  contactNode: "node_contactaaaaaaaaaa",
  edgeSummary: "edge_summaryaaaaaaaaaa",
  edgeContact: "edge_contactaaaaaaaaaa",
  source: "source_aaaaaaaaaaaaaaaa",
  packet: "packet_aaaaaaaaaaaaaaaa",
});

function semantic(intent: CanonicalIntent, purpose: MemoryPurpose = PURPOSE): CanonicalSemantic {
  return { intent, subject_slot: "bound_subject", project_slot: null, purpose_slot: purpose };
}

function turn(
  fromState: ReceptionOrchestrationRequest["from_state"] = "anonymous",
  toState: ReceptionOrchestrationRequest["to_state"] = "disclosed",
  intent: CanonicalIntent = "disclose_memory",
  requestId = "request_aaaaaaaaaaaaaaaa",
  overrides: Record<string, unknown> = {},
): ReceptionOrchestrationRequest {
  return {
    schema: RECEPTION_REQUEST_SCHEMA,
    request_id: requestId,
    tenant_id: TENANT_ID,
    subject_id: IDS.subject,
    project_id: null,
    purpose: PURPOSE,
    session_id: IDS.session,
    audience: RECEPTION_AUDIENCE,
    locale: "en",
    channel: "web_text",
    evaluated_at: AT,
    from_state: fromState,
    to_state: toState,
    semantic: semantic(intent),
    identity: null,
    consent: null,
    policy_request: null,
    lifecycle_command: null,
    ...overrides,
  } as ReceptionOrchestrationRequest;
}

function identity(overrides: Record<string, unknown> = {}): IdentityAssertion {
  return {
    schema: IDENTITY_ASSERTION_SCHEMA,
    assertion_id: IDS.assertion,
    tenant_id: TENANT_ID,
    subject_id: IDS.subject,
    audience: RECEPTION_AUDIENCE,
    session_id: IDS.session,
    assurance_class: "verified_contact_control",
    issued_at: "2026-08-08T07:00:00Z",
    expires_at: "2026-08-08T07:05:00Z",
    nonce: "nonce_aaaaaaaaaaaaaaaa",
    verifier_version: "identity-verifier/1.0.0",
    ...overrides,
  } as IdentityAssertion;
}

function consent(overrides: Record<string, unknown> = {}): MemoryConsentGrant {
  return {
    schema: MEMORY_CONSENT_GRANT_SCHEMA,
    consent_grant_id: IDS.consent,
    tenant_id: TENANT_ID,
    subject_id: IDS.subject,
    purpose: PURPOSE,
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

const SUBJECT: GraphNode = {
  schema: GRAPH_NODE_SCHEMA,
  node_id: IDS.subjectNode,
  tenant_id: TENANT_ID,
  kind: "subject",
  version: 1,
  created_at: "2026-08-08T06:00:00Z",
  retention_class: "consented_short",
  payload: { subject_id: IDS.subject, identity_vault_ref: "vault_aaaaaaaaaaaaaaaa" },
};
const SUMMARY: GraphNode = {
  schema: GRAPH_NODE_SCHEMA,
  node_id: IDS.summaryNode,
  tenant_id: TENANT_ID,
  kind: "interaction_summary",
  version: 1,
  created_at: "2026-08-08T06:00:00Z",
  retention_class: "consented_short",
  payload: { summary_code: "adu_scope_confirmed", truth_class: "verified", source_event_refs: ["event_aaaaaaaaaaaaaaaa"] },
};
const CONTACT: GraphNode = {
  schema: GRAPH_NODE_SCHEMA,
  node_id: IDS.contactNode,
  tenant_id: TENANT_ID,
  kind: "contact_channel",
  version: 1,
  created_at: "2026-08-08T06:00:00Z",
  retention_class: "consented_short",
  payload: { channel_ref: "channel_aaaaaaaaaaaaaaaa", channel_kind: "email", verification_state: "verified" },
};
function edge(edgeId: string, to: string, kind: GraphEdge["kind"]): GraphEdge {
  return {
    schema: GRAPH_EDGE_SCHEMA,
    edge_id: edgeId,
    tenant_id: TENANT_ID,
    kind,
    from_node_id: IDS.subjectNode,
    to_node_id: to,
    version: 1,
    created_at: "2026-08-08T06:00:00Z",
    valid_from: "2026-08-08T06:00:00Z",
    valid_until: null,
    source_ref: IDS.source,
    policy_label: "memory-policy/1.0.0",
    deletion_behavior: "remove_relationship",
  };
}
const GRAPH: SyntheticMemoryGraph = {
  tenant_id: TENANT_ID,
  nodes: [SUBJECT, SUMMARY, CONTACT],
  edges: [edge(IDS.edgeSummary, IDS.summaryNode, "summarized_from"), edge(IDS.edgeContact, IDS.contactNode, "owns_contact")],
};

function policy(overrides: Record<string, unknown> = {}): ContextPolicyRequest {
  return {
    tenant_id: TENANT_ID,
    subject_id: IDS.subject,
    project_id: null,
    purpose: PURPOSE,
    session_id: IDS.session,
    audience: RECEPTION_AUDIENCE,
    locale: "en",
    channel: "web_text",
    traversal_plan: "subject_continuity_v1",
    maximum_disclosure_class: "customer",
    maximum_depth: 2,
    maximum_nodes: 12,
    maximum_edges: 20,
    packet_id: IDS.packet,
    issued_at: AT,
    expires_at: "2026-08-08T07:02:00Z",
    evaluated_at: AT,
    ...overrides,
  } as ContextPolicyRequest;
}

function lifecycleCommand(overrides: Record<string, unknown> = {}): MemoryLifecycleCommand {
  return {
    schema: MEMORY_LIFECYCLE_COMMAND_SCHEMA,
    command_id: "command_aaaaaaaaaaaaaaaa",
    kind: "activate_deletion_capability",
    tenant_id: TENANT_ID,
    subject_id: IDS.subject,
    project_id: null,
    purpose: PURPOSE,
    session_id: IDS.session,
    audience: RECEPTION_AUDIENCE,
    channel: "web_text",
    evaluated_at: AT,
    deduplication_key: "dedupe_aaaaaaaaaaaaaaaa",
    capability: {
      schema: DELETION_CAPABILITY_SCHEMA,
      capability_id: "capability_aaaaaaaaaaaaaaaa",
      tenant_id: TENANT_ID,
      provider_ref: "provider_aaaaaaaaaaaaaaaa",
      primary_store_deletion: "supported",
      backup_deletion: "supported",
      immutable_backup_disposition: "cryptographic_erasure",
      deletion_scope: "subject_scoped",
      completion_semantics: "deterministic_acknowledgement",
      maximum_completion_seconds: 86400,
      contract_version: "deletion-contract/1.0.0",
      verified_at: "2026-08-08T06:00:00Z",
      expires_at: "2026-08-09T06:00:00Z",
    },
    ...overrides,
  } as MemoryLifecycleCommand;
}

async function accepted(
  state: ReceptionOrchestratorState,
  request: ReceptionOrchestrationRequest,
  lifecycleState: MemoryLifecycleState = createEmptyMemoryLifecycleState(),
  graph: SyntheticMemoryGraph = GRAPH,
): Promise<ReceptionOrchestratorSuccess> {
  const result = await orchestrateReception(state, request, graph, lifecycleState);
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.reason_code);
  return result;
}

async function toIdentityVerified(
  grant: MemoryConsentGrant = consent(),
  lifecycleState: MemoryLifecycleState = createEmptyMemoryLifecycleState(),
): Promise<ReceptionOrchestratorSuccess> {
  const disclosed = await accepted(createReceptionOrchestratorState(), turn(), lifecycleState);
  const consented = await accepted(disclosed.state, turn("disclosed", "consent_candidate", "grant_consent", "request_bbbbbbbbbbbbbbbb", { consent: grant }), lifecycleState);
  const candidate = await accepted(consented.state, turn("consent_candidate", "identity_candidate", "verify_identity", "request_cccccccccccccccc", { consent: grant }), lifecycleState);
  return accepted(candidate.state, turn("identity_candidate", "identity_verified", "verify_identity", "request_dddddddddddddddd", { consent: grant, identity: identity() }), lifecycleState);
}

async function toContextScoped(
  grant: MemoryConsentGrant = consent(),
  lifecycleState: MemoryLifecycleState = createEmptyMemoryLifecycleState(),
  graph: SyntheticMemoryGraph = GRAPH,
): Promise<ReceptionOrchestratorSuccess> {
  const verified = await toIdentityVerified(grant, lifecycleState);
  return accepted(verified.state, turn("identity_verified", "context_scoped", "retrieve_context", "request_eeeeeeeeeeeeeeee", {
    consent: grant,
    identity: identity(),
    policy_request: policy(),
  }), lifecycleState, graph);
}

describe("channel-neutral reception orchestration", () => {
  it("pins a closed refusal vocabulary", () => {
    expect(Object.isFrozen(ORCHESTRATOR_REFUSAL_CODES)).toBe(true);
    expect(new Set(ORCHESTRATOR_REFUSAL_CODES).size).toBe(ORCHESTRATOR_REFUSAL_CODES.length);
  });

  it("accepts disclosure first without mutating input and deeply freezes output", async () => {
    const input = turn();
    const before = structuredClone(input);
    const result = await accepted(createReceptionOrchestratorState(), input);
    expect(input).toEqual(before);
    expect(result.state.reception_state).toBe("disclosed");
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.state)).toBe(true);
    expect(Object.isFrozen(result.evidence)).toBe(true);
    expect(Object.isFrozen(result.lifecycle_state)).toBe(true);
  });

  it("replays an identical request byte-identically after deterministic re-evaluation", async () => {
    const first = await accepted(createReceptionOrchestratorState(), turn());
    const replay = await orchestrateReception(first.state, structuredClone(turn()), GRAPH, createEmptyMemoryLifecycleState());
    expect(replay).toEqual(first);
    expect(JSON.stringify(replay)).toBe(JSON.stringify(first));
  });

  it("refuses primitive, array, and structurally forged replay material", async () => {
    const first = await accepted(createReceptionOrchestratorState(), turn());
    for (const lastResult of [42, [1, 2, 3]]) {
      const forged = { ...structuredClone(first.state), last_result: lastResult };
      expect(await orchestrateReception(forged, turn(), GRAPH, createEmptyMemoryLifecycleState())).toEqual({ ok: false, reason_code: "invalid_orchestrator_state" });
    }
    const forged = structuredClone(first.state) as unknown as { last_result: Record<string, unknown> };
    forged.last_result.context_packet = { arbitrary: "forged" };
    expect(await orchestrateReception(forged, turn(), GRAPH, createEmptyMemoryLifecycleState())).toEqual({ ok: false, reason_code: "semantic_replay_mismatch" });
  });

  it("refuses changed, cross-session, and cross-purpose replay", async () => {
    const first = await accepted(createReceptionOrchestratorState(), turn());
    const variants = [
      turn("anonymous", "disclosed", "disclose_memory", "request_aaaaaaaaaaaaaaaa", { locale: "es" }),
      turn("anonymous", "disclosed", "disclose_memory", "request_aaaaaaaaaaaaaaaa", { session_id: "session_bbbbbbbbbbbbbbbb" }),
      turn("anonymous", "disclosed", "disclose_memory", "request_aaaaaaaaaaaaaaaa", { purpose: "current_session_service", semantic: semantic("disclose_memory", "current_session_service") }),
    ];
    for (const variant of variants) {
      expect(await orchestrateReception(first.state, variant, GRAPH, createEmptyMemoryLifecycleState())).toEqual({ ok: false, reason_code: "semantic_replay_mismatch" });
    }
  });

  it("enforces exact data-only request and state envelopes without throwing", async () => {
    expect(await orchestrateReception(createReceptionOrchestratorState(), { ...turn(), raw_transcript: "forbidden" }, GRAPH, createEmptyMemoryLifecycleState())).toEqual({ ok: false, reason_code: "invalid_request_shape" });
    const nonEnumerable = structuredClone(turn()) as Record<string, unknown>;
    Object.defineProperty(nonEnumerable, "hidden", { value: true });
    expect(await orchestrateReception(createReceptionOrchestratorState(), nonEnumerable, GRAPH, createEmptyMemoryLifecycleState())).toEqual({ ok: false, reason_code: "invalid_request_shape" });
    const hostile = Object.create(null);
    Object.defineProperty(hostile, "reception_state", { get() { throw new Error("hostile"); } });
    expect((await orchestrateReception(hostile, turn(), GRAPH, createEmptyMemoryLifecycleState())).ok).toBe(false);
  });

  it("refuses the wrong tenant before an incomplete shape and validates bindings", async () => {
    expect(await orchestrateReception(createReceptionOrchestratorState(), { tenant_id: "tenant_other" }, GRAPH, createEmptyMemoryLifecycleState())).toEqual({ ok: false, reason_code: "invalid_tenant" });
    expect(await orchestrateReception(createReceptionOrchestratorState(), turn("anonymous", "disclosed", "disclose_memory", "request_aaaaaaaaaaaaaaaa", { audience: "other" }), GRAPH, createEmptyMemoryLifecycleState())).toEqual({ ok: false, reason_code: "invalid_binding" });
    expect(await orchestrateReception(createReceptionOrchestratorState(), turn("anonymous", "disclosed", "disclose_memory", "request_aaaaaaaaaaaaaaaa", { semantic: { ...semantic("disclose_memory"), purpose_slot: "project_continuity" } }), GRAPH, createEmptyMemoryLifecycleState())).toEqual({ ok: false, reason_code: "semantic_binding_mismatch" });
  });

  it("returns stable outer-envelope refusal codes", async () => {
    const cases = [
      [turn("anonymous", "disclosed", "disclose_memory", "request_aaaaaaaaaaaaaaaa", { schema: "wrong" }), "invalid_schema"],
      [turn("anonymous", "disclosed", "disclose_memory", "x"), "invalid_request_id"],
      [turn("anonymous", "disclosed", "disclose_memory", "request_aaaaaaaaaaaaaaaa", { locale: "de" }), "invalid_locale"],
      [turn("anonymous", "disclosed", "disclose_memory", "request_aaaaaaaaaaaaaaaa", { channel: "fax" }), "invalid_channel"],
      [turn("anonymous", "disclosed", "grant_consent"), "disclosure_required"],
    ] as const;
    for (const [input, reason] of cases) {
      expect(await orchestrateReception(createReceptionOrchestratorState(), input, GRAPH, createEmptyMemoryLifecycleState())).toEqual({ ok: false, reason_code: reason });
    }
    const disclosed = await accepted(createReceptionOrchestratorState(), turn());
    expect(await orchestrateReception(disclosed.state, turn("anonymous", "disclosed", "disclose_memory", "request_newaaaaaaaaaaaa"), GRAPH, disclosed.lifecycle_state)).toEqual({ ok: false, reason_code: "invalid_transition" });
    const hostile = new Proxy({}, { getPrototypeOf() { throw new Error("hostile"); } });
    expect(await orchestrateReception(createReceptionOrchestratorState(), hostile, GRAPH, createEmptyMemoryLifecycleState())).toEqual({ ok: false, reason_code: "internal_refusal" });
  });

  it("keeps future voice and phone contract-ready but inactive", async () => {
    for (const channel of ["web_voice", "phone"]) {
      expect(await orchestrateReception(createReceptionOrchestratorState(), turn("anonymous", "disclosed", "disclose_memory", "request_aaaaaaaaaaaaaaaa", { channel }), GRAPH, createEmptyMemoryLifecycleState())).toEqual({ ok: false, reason_code: "channel_inactive" });
    }
  });

  it("enforces the complete disclosure-consent-identity-context-active sequence", async () => {
    const scoped = await toContextScoped();
    expect(scoped.context_packet).not.toBeNull();
    const active = await accepted(scoped.state, turn("context_scoped", "active", "apply_memory_effect", "request_ffffffffffffffff", {
      consent: consent(),
      identity: identity(),
      lifecycle_command: lifecycleCommand(),
    }), scoped.lifecycle_state);
    expect(active.state.reception_state).toBe("active");
    expect(active.context_packet).toEqual(scoped.context_packet);
    expect(active.lifecycle_state.active_deletion_capability?.capability_id).toBe("capability_aaaaaaaaaaaaaaaa");
    const replay = await orchestrateReception(active.state, turn("context_scoped", "active", "apply_memory_effect", "request_ffffffffffffffff", {
      consent: consent(), identity: identity(), lifecycle_command: lifecycleCommand(),
    }), GRAPH, active.lifecycle_state);
    expect(replay).toEqual(active);
  });

  it("cannot advance by repeating disclose_memory across later states", async () => {
    const disclosed = await accepted(createReceptionOrchestratorState(), turn());
    expect(await orchestrateReception(disclosed.state, turn("disclosed", "consent_candidate", "disclose_memory", "request_bbbbbbbbbbbbbbbb"), GRAPH, disclosed.lifecycle_state)).toEqual({ ok: false, reason_code: "consent_required" });
  });

  it("emits and tests every mandatory sequencing gate", async () => {
    const disclosed = await accepted(createReceptionOrchestratorState(), turn());
    expect(await orchestrateReception(disclosed.state, turn("disclosed", "consent_candidate", "grant_consent", "request_bbbbbbbbbbbbbbbb"), GRAPH, disclosed.lifecycle_state)).toEqual({ ok: false, reason_code: "consent_required" });
    const consented = await accepted(disclosed.state, turn("disclosed", "consent_candidate", "grant_consent", "request_bbbbbbbbbbbbbbbb", { consent: consent() }), disclosed.lifecycle_state);
    const candidate = await accepted(consented.state, turn("consent_candidate", "identity_candidate", "verify_identity", "request_cccccccccccccccc", { consent: consent() }), consented.lifecycle_state);
    expect(await orchestrateReception(candidate.state, turn("identity_candidate", "identity_verified", "verify_identity", "request_dddddddddddddddd", { consent: consent() }), GRAPH, candidate.lifecycle_state)).toEqual({ ok: false, reason_code: "identity_required" });
    const verified = await accepted(candidate.state, turn("identity_candidate", "identity_verified", "verify_identity", "request_dddddddddddddddd", { consent: consent(), identity: identity() }), candidate.lifecycle_state);
    expect(await orchestrateReception(verified.state, turn("identity_verified", "context_scoped", "apply_memory_effect", "request_eeeeeeeeeeeeeeee", { consent: consent(), identity: identity() }), GRAPH, verified.lifecycle_state)).toEqual({ ok: false, reason_code: "context_scope_required" });
    expect(await orchestrateReception(verified.state, turn("identity_verified", "context_scoped", "retrieve_context", "request_eeeeeeeeeeeeeeee", { consent: consent(), identity: identity() }), GRAPH, verified.lifecycle_state)).toEqual({ ok: false, reason_code: "policy_request_required" });
    const scoped = await toContextScoped();
    expect(await orchestrateReception(scoped.state, turn("context_scoped", "active", "apply_memory_effect", "request_ffffffffffffffff", { consent: consent(), identity: identity() }), GRAPH, scoped.lifecycle_state)).toEqual({ ok: false, reason_code: "lifecycle_command_required" });
    const missingScope = structuredClone(scoped.state) as unknown as { last_result: Record<string, unknown> };
    missingScope.last_result.context_packet = null;
    expect(await orchestrateReception(missingScope, turn("context_scoped", "active", "apply_memory_effect", "request_ffffffffffffffff", { consent: consent(), identity: identity(), lifecycle_command: lifecycleCommand() }), GRAPH, scoped.lifecycle_state)).toEqual({ ok: false, reason_code: "context_scope_required" });
  });

  it("refuses consent, identity, policy, and lifecycle widening", async () => {
    expect(await orchestrateReception(createReceptionOrchestratorState(), turn("anonymous", "disclosed", "disclose_memory", "request_aaaaaaaaaaaaaaaa", { consent: consent() }), GRAPH, createEmptyMemoryLifecycleState())).toEqual({ ok: false, reason_code: "consent_scope_widening" });
    expect(await orchestrateReception(createReceptionOrchestratorState(), turn("anonymous", "disclosed", "disclose_memory", "request_aaaaaaaaaaaaaaaa", { identity: identity() }), GRAPH, createEmptyMemoryLifecycleState())).toEqual({ ok: false, reason_code: "identity_scope_widening" });
    expect(await orchestrateReception(createReceptionOrchestratorState(), turn("anonymous", "disclosed", "disclose_memory", "request_aaaaaaaaaaaaaaaa", { policy_request: policy() }), GRAPH, createEmptyMemoryLifecycleState())).toEqual({ ok: false, reason_code: "policy_request_widening" });
    expect(await orchestrateReception(createReceptionOrchestratorState(), turn("anonymous", "disclosed", "disclose_memory", "request_aaaaaaaaaaaaaaaa", { lifecycle_command: lifecycleCommand() }), GRAPH, createEmptyMemoryLifecycleState())).toEqual({ ok: false, reason_code: "lifecycle_command_widening" });
  });

  it("binds consent to an independent minimum reception data class", async () => {
    const disclosed = await accepted(createReceptionOrchestratorState(), turn());
    const insufficient = consent({ data_classes: ["retention"] });
    expect(await orchestrateReception(disclosed.state, turn("disclosed", "consent_candidate", "grant_consent", "request_bbbbbbbbbbbbbbbb", { consent: insufficient }), GRAPH, disclosed.lifecycle_state)).toEqual({ ok: false, reason_code: "data_class_not_consented" });
  });

  it("records excluded_unconsented_data_class for reachable non-consented material", async () => {
    const limited = consent({ data_classes: ["identity_reference", "interaction_summary"] });
    const scoped = await toContextScoped(limited);
    expect(scoped.context_packet?.nodes.map((node) => node.node_id)).toEqual([IDS.subjectNode, IDS.summaryNode].sort());
    expect(scoped.context_packet?.nodes.some((node) => node.node_id === IDS.contactNode)).toBe(false);
    expect(scoped.context_packet?.exclusions).toContain("excluded_unconsented_data_class");
  });

  it("blocks context immediately after grant revocation or subject deletion", async () => {
    const verified = await toIdentityVerified();
    const revokedState: MemoryLifecycleState = {
      ...createEmptyMemoryLifecycleState(),
      revoked_consent_grant_ids: [IDS.consent],
    };
    const contextTurn = turn("identity_verified", "context_scoped", "retrieve_context", "request_eeeeeeeeeeeeeeee", { consent: consent(), identity: identity(), policy_request: policy() });
    expect(await orchestrateReception(verified.state, contextTurn, GRAPH, revokedState)).toEqual({ ok: false, reason_code: "consent_revoked" });

    const deletedState: MemoryLifecycleState = {
      ...createEmptyMemoryLifecycleState(),
      subject_tombstones: [{
        tombstone_id: "tombstone_aaaaaaaaaaaaaaaa",
        target_kind: "subject",
        target_id: IDS.subject,
        target_version: null,
        subject_id: IDS.subject,
        reason_code: "subject_deletion",
        effective_at: AT,
        command_id: "command_aaaaaaaaaaaaaaaa",
      }],
    };
    expect(await orchestrateReception(verified.state, contextTurn, GRAPH, deletedState)).toEqual({ ok: false, reason_code: "subject_deleted" });
  });

  it("honors Slice 1 terminal transitions from anonymous and refuses resume", async () => {
    for (const terminal of ["ended", "refused"] as const) {
      const result = await accepted(createReceptionOrchestratorState(), turn("anonymous", terminal, "end_reception", `request_${terminal}aaaaaaaa`));
      expect(result.state.reception_state).toBe(terminal);
      expect(await orchestrateReception(result.state, turn(terminal, terminal, "end_reception", "request_terminalaaaaaaa"), GRAPH, result.lifecycle_state)).toEqual({ ok: false, reason_code: "terminal_state" });
    }
  });

  it("does not consult an ambient clock", async () => {
    const now = vi.spyOn(Date, "now").mockImplementation(() => { throw new Error("clock"); });
    expect((await orchestrateReception(createReceptionOrchestratorState(), turn(), GRAPH, createEmptyMemoryLifecycleState())).ok).toBe(true);
    expect(now).not.toHaveBeenCalled();
    now.mockRestore();
  });
});

describe("EN/ES/RU closed semantic harness", () => {
  const fixtures = [
    { locale: "en", intent_token: "disclose", subject_token: "subject", purpose_token: "returning" },
    { locale: "es", intent_token: "divulgar", subject_token: "sujeto", purpose_token: "regreso" },
    { locale: "ru", intent_token: "раскрытие", subject_token: "субъект", purpose_token: "возврат" },
  ] as const;

  it("produces one canonical semantic material, transition, acceptance class, and digest", async () => {
    const resolved = await Promise.all(fixtures.map((fixture) => resolveSemanticFixture({ schema: SEMANTIC_FIXTURE_SCHEMA, ...fixture, project_token: null })));
    expect(resolved.every((result) => result.ok)).toBe(true);
    const acceptedSemantics = resolved.filter((result): result is Extract<typeof result, { ok: true }> => result.ok);
    expect(new Set(acceptedSemantics.map((result) => result.semantic_digest)).size).toBe(1);
    expect(acceptedSemantics.map((result) => result.value)).toEqual([semantic("disclose_memory"), semantic("disclose_memory"), semantic("disclose_memory")]);
    const outcomes = await Promise.all(acceptedSemantics.map((result, index) => orchestrateReception(createReceptionOrchestratorState(), turn("anonymous", "disclosed", "disclose_memory", `request_locale${index}aaaaaaaa`, { locale: fixtures[index].locale, semantic: result.value }), GRAPH, createEmptyMemoryLifecycleState())));
    expect(outcomes.map((result) => result.ok)).toEqual([true, true, true]);
    expect(outcomes.filter((result): result is ReceptionOrchestratorSuccess => result.ok).map((result) => result.semantic_digest)).toEqual(acceptedSemantics.map((result) => result.semantic_digest));
    expect(acceptedSemantics[0].semantic_digest).toBe(await computeSemanticDigest(semantic("disclose_memory")));
  });

  it("returns stable refusals for unknown locale/token and mixed-locale tokens", async () => {
    const base = { schema: SEMANTIC_FIXTURE_SCHEMA, locale: "en", intent_token: "disclose", subject_token: "subject", project_token: null, purpose_token: "returning" };
    expect(await resolveSemanticFixture({ ...base, locale: "de" })).toEqual({ ok: false, reason_code: "invalid_semantic_fixture_shape" });
    expect(await resolveSemanticFixture({ ...base, intent_token: "unknown" })).toEqual({ ok: false, reason_code: "unknown_semantic_token" });
    expect(await resolveSemanticFixture({ ...base, subject_token: "sujeto" })).toEqual({ ok: false, reason_code: "mixed_locale_tokens" });
  });

  it("distinguishes missing slots, ambiguous mappings, and extra keys", async () => {
    const base = { schema: SEMANTIC_FIXTURE_SCHEMA, locale: "en", intent_token: "disclose", subject_token: "subject", project_token: null, purpose_token: "returning" };
    const missing = { schema: base.schema, locale: base.locale, intent_token: base.intent_token, subject_token: base.subject_token, project_token: base.project_token };
    expect(await resolveSemanticFixture(missing)).toEqual({ ok: false, reason_code: "missing_semantic_slot" });
    expect(await resolveSemanticFixture({ ...base, intent_token: ["disclose", "context"] })).toEqual({ ok: false, reason_code: "ambiguous_semantic_mapping" });
    expect(await resolveSemanticFixture({ ...base, extra: true })).toEqual({ ok: false, reason_code: "invalid_semantic_fixture_shape" });
  });

  it("rejects malformed canonical semantic input before binding", async () => {
    expect(await orchestrateReception(createReceptionOrchestratorState(), turn("anonymous", "disclosed", "disclose_memory", "request_aaaaaaaaaaaaaaaa", { semantic: { intent: "unknown" } }), GRAPH, createEmptyMemoryLifecycleState())).toEqual({ ok: false, reason_code: "invalid_semantic_shape" });
  });
});
