import { describe, expect, it } from "vitest";

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
  type GraphEdgeKind,
  type GraphNode,
  type GraphNodeKind,
  type IdentityAssertion,
  type MemoryConsentGrant,
} from "./receptionMemoryContract";
import {
  CONTEXT_POLICY_ENGINE_VERSION,
  CONTEXT_POLICY_REFUSAL_CODES,
  CONTEXT_TRAVERSAL_PLANS,
  assembleCanonicalContextPacket,
  type ContextPolicyRequest,
  type SyntheticMemoryGraph,
} from "./contextPolicyEngine";

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
  otherProject: "project_bbbbbbbbbbbbbbbb",
  primarySubjectNode: "node_aaaaaaaaaaaaaaaa",
  projectNode: "node_bbbbbbbbbbbbbbbb",
  propertyNode: "node_cccccccccccccccc",
  freshFactNode: "node_dddddddddddddddd",
  staleFactNode: "node_eeeeeeeeeeeeeeee",
  disputedFactNode: "node_ffffffffffffffff",
  otherSubjectNode: "node_gggggggggggggggg",
  sharedSummaryNode: "node_hhhhhhhhhhhhhhhh",
  authorizationNode: "node_iiiiiiiiiiiiiiii",
  sourceA: "source_aaaaaaaaaaaaaaaa",
  sourceB: "source_bbbbbbbbbbbbbbbb",
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

function request(overrides: Record<string, unknown> = {}): ContextPolicyRequest {
  return {
    tenant_id: TENANT_ID,
    subject_id: IDS.subject,
    project_id: IDS.project,
    purpose: "project_continuity",
    session_id: IDS.session,
    audience: RECEPTION_AUDIENCE,
    locale: "en",
    channel: "web_text",
    traversal_plan: "project_continuity_v1",
    maximum_disclosure_class: "project_sensitive",
    maximum_depth: 3,
    maximum_nodes: 24,
    maximum_edges: 48,
    packet_id: IDS.packet,
    issued_at: "2026-08-08T07:01:00Z",
    expires_at: "2026-08-08T07:02:00Z",
    evaluated_at: "2026-08-08T07:01:00Z",
    ...overrides,
  } as ContextPolicyRequest;
}

function payload(kind: GraphNodeKind): Record<string, unknown> {
  switch (kind) {
    case "subject":
      return { subject_id: IDS.subject, identity_vault_ref: "vault_aaaaaaaaaaaaaaaa" };
    case "project":
      return { project_id: IDS.project, project_state: "active" };
    case "property":
      return { property_ref: "property_aaaaaaaaaaaaaaaa" };
    case "fact_assertion":
      return {
        fact_code: "preferred_model",
        value_code: "adu_a_001",
        truth_class: "verified",
        provenance_refs: [IDS.sourceA],
        observed_at: "2026-08-08T06:00:00Z",
        verified_at: "2026-08-08T06:30:00Z",
        expires_at: "2026-09-08T06:00:00Z",
        dispute_state: "none",
      };
    case "interaction_summary":
      return {
        summary_code: "project_scope_confirmed",
        truth_class: "verified",
        source_event_refs: ["event_aaaaaaaaaaaaaaaa"],
      };
    case "authorization_grant":
      return {
        authorization_grant_id: "authorization_aaaaaaaaaaaaaaaa",
        subject_id: IDS.subject,
        session_id: IDS.session,
        purpose: "project_continuity",
        operations: ["read_context"],
        node_kinds: ["interaction_summary"],
        expires_at: "2026-08-08T07:05:00Z",
      };
    default:
      throw new Error(`fixture does not support ${kind}`);
  }
}

function node(
  nodeId: string,
  kind: GraphNodeKind,
  payloadOverrides: Record<string, unknown> = {},
): GraphNode {
  return {
    schema: GRAPH_NODE_SCHEMA,
    node_id: nodeId,
    tenant_id: TENANT_ID,
    kind,
    version: 1,
    created_at: "2026-08-08T06:00:00Z",
    retention_class: "project_active",
    payload: { ...payload(kind), ...payloadOverrides },
  } as GraphNode;
}

let edgeCounter = 0;

function edge(
  fromNodeId: string,
  toNodeId: string,
  kind: GraphEdgeKind,
  overrides: Record<string, unknown> = {},
): GraphEdge {
  edgeCounter += 1;
  const suffix = edgeCounter.toString(36).padStart(16, "0");
  return {
    schema: GRAPH_EDGE_SCHEMA,
    edge_id: `edge_${suffix}`,
    tenant_id: TENANT_ID,
    kind,
    from_node_id: fromNodeId,
    to_node_id: toNodeId,
    version: 1,
    created_at: "2026-08-08T06:00:00Z",
    valid_from: "2026-08-08T06:00:00Z",
    valid_until: null,
    source_ref: IDS.sourceA,
    policy_label: "memory-policy/1.0.0",
    deletion_behavior: "remove_relationship",
    ...overrides,
  } as GraphEdge;
}

function projectGraph(options: {
  stale?: boolean;
  disputed?: boolean;
  coParticipant?: boolean;
  authorization?: boolean;
} = {}): SyntheticMemoryGraph {
  edgeCounter = 0;
  const nodes: GraphNode[] = [
    node(IDS.primarySubjectNode, "subject"),
    node(IDS.projectNode, "project"),
    node(IDS.propertyNode, "property"),
    node(IDS.freshFactNode, "fact_assertion"),
  ];
  const edges: GraphEdge[] = [
    edge(IDS.primarySubjectNode, IDS.projectNode, "participates_in_project"),
    edge(IDS.projectNode, IDS.propertyNode, "associated_with_property"),
    edge(IDS.projectNode, IDS.freshFactNode, "asserted_by"),
  ];
  if (options.stale) {
    nodes.push(
      node(IDS.staleFactNode, "fact_assertion", {
        truth_class: "stale",
      }),
    );
    edges.push(edge(IDS.projectNode, IDS.staleFactNode, "asserted_by"));
  }
  if (options.disputed) {
    nodes.push(
      node(IDS.disputedFactNode, "fact_assertion", {
        truth_class: "disputed",
        dispute_state: "disputed",
      }),
    );
    edges.push(edge(IDS.projectNode, IDS.disputedFactNode, "asserted_by"));
  }
  if (options.coParticipant) {
    nodes.push(
      node(IDS.otherSubjectNode, "subject", {
        subject_id: IDS.otherSubject,
        identity_vault_ref: "vault_bbbbbbbbbbbbbbbb",
      }),
      node(IDS.sharedSummaryNode, "interaction_summary"),
    );
    edges.push(
      edge(IDS.projectNode, IDS.sharedSummaryNode, "summarized_from"),
      edge(IDS.otherSubjectNode, IDS.sharedSummaryNode, "summarized_from"),
    );
  }
  if (options.authorization) {
    nodes.push(node(IDS.authorizationNode, "authorization_grant"));
    edges.push(
      edge(IDS.authorizationNode, IDS.sharedSummaryNode, "authorized_for"),
    );
  }
  return { tenant_id: TENANT_ID, nodes, edges };
}

function subjectGraph(): SyntheticMemoryGraph {
  edgeCounter = 0;
  const summary = node(IDS.sharedSummaryNode, "interaction_summary");
  const fact = node(IDS.freshFactNode, "fact_assertion");
  return {
    tenant_id: TENANT_ID,
    nodes: [node(IDS.primarySubjectNode, "subject"), summary, fact],
    edges: [
      edge(IDS.primarySubjectNode, IDS.sharedSummaryNode, "summarized_from"),
      edge(IDS.primarySubjectNode, IDS.freshFactNode, "asserted_by"),
    ],
  };
}

function subjectRequest(overrides: Record<string, unknown> = {}): ContextPolicyRequest {
  return request({
    project_id: null,
    purpose: "returning_customer_continuity",
    traversal_plan: "subject_continuity_v1",
    maximum_disclosure_class: "customer",
    maximum_depth: 2,
    maximum_nodes: 12,
    maximum_edges: 20,
    ...overrides,
  });
}

function subjectConsent(overrides: Record<string, unknown> = {}): MemoryConsentGrant {
  return consent({ purpose: "returning_customer_continuity", ...overrides });
}

describe("context policy surface", () => {
  it("pins a versioned engine and closed traversal allowlist", () => {
    expect(CONTEXT_POLICY_ENGINE_VERSION).toBe("context-policy-engine/1.0.0");
    expect(CONTEXT_TRAVERSAL_PLANS).toEqual([
      "subject_continuity_v1",
      "project_continuity_v1",
    ]);
    expect(Object.isFrozen(CONTEXT_TRAVERSAL_PLANS)).toBe(true);
    expect(new Set(CONTEXT_POLICY_REFUSAL_CODES).size).toBe(
      CONTEXT_POLICY_REFUSAL_CODES.length,
    );
  });

  it("assembles a canonical Slice 1 context packet", async () => {
    const result = await assembleCanonicalContextPacket(
      projectGraph(),
      request(),
      identity(),
      consent(),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.nodes.map((entry) => entry.node_id)).toEqual([
      IDS.primarySubjectNode,
      IDS.projectNode,
      IDS.propertyNode,
      IDS.freshFactNode,
    ]);
    expect(result.value.edges).toHaveLength(3);
    expect(result.value.packet_digest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(result.value.provenance_refs).toEqual([IDS.sourceA]);
  });

  it("is deterministic across graph input order", async () => {
    const graph = projectGraph();
    const reversed = {
      ...graph,
      nodes: [...graph.nodes].reverse(),
      edges: [...graph.edges].reverse(),
    };
    const first = await assembleCanonicalContextPacket(graph, request(), identity(), consent());
    const second = await assembleCanonicalContextPacket(reversed, request(), identity(), consent());
    expect(first).toEqual(second);
  });

  it("returns a deeply frozen cloned packet without mutating inputs", async () => {
    const graph = projectGraph();
    const before = JSON.stringify(graph);
    const result = await assembleCanonicalContextPacket(graph, request(), identity(), consent());
    expect(JSON.stringify(graph)).toBe(before);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).not.toBe(graph);
    expect(Object.isFrozen(result.value)).toBe(true);
    expect(Object.isFrozen(result.value.nodes)).toBe(true);
    expect(Object.isFrozen(result.value.nodes[0])).toBe(true);
    expect(Object.isFrozen(result.value.nodes[0].payload)).toBe(true);
  });
});

describe("fail-closed bindings and gates", () => {
  it("refuses the request tenant before malformed request fields", async () => {
    const result = await assembleCanonicalContextPacket(
      projectGraph(),
      { tenant_id: "tenant_other" },
      null,
      null,
    );
    expect(result).toEqual({ ok: false, reason_code: "invalid_tenant" });
  });

  it("refuses the graph tenant before graph traversal", async () => {
    const result = await assembleCanonicalContextPacket(
      { tenant_id: "tenant_other", nodes: "bad", edges: "bad" },
      request(),
      identity(),
      consent(),
    );
    expect(result).toEqual({ ok: false, reason_code: "invalid_tenant" });
  });

  it("refuses a non-allowlisted traversal plan", async () => {
    const result = await assembleCanonicalContextPacket(
      projectGraph(),
      request({ traversal_plan: "free_form_graph_query" }),
      identity(),
      consent(),
    );
    expect(result).toEqual({ ok: false, reason_code: "unsupported_traversal_plan" });
  });

  it("binds traversal plan to purpose", async () => {
    const result = await assembleCanonicalContextPacket(
      projectGraph(),
      request({ purpose: "current_session_service" }),
      identity(),
      consent(),
    );
    expect(result).toEqual({ ok: false, reason_code: "plan_purpose_mismatch" });
  });

  it("requires a project for project traversal", async () => {
    const result = await assembleCanonicalContextPacket(
      projectGraph(),
      request({ project_id: null }),
      identity(),
      consent(),
    );
    expect(result).toEqual({ ok: false, reason_code: "project_binding_required" });
  });

  it("forbids project widening in subject traversal", async () => {
    const result = await assembleCanonicalContextPacket(
      subjectGraph(),
      subjectRequest({ project_id: IDS.project }),
      identity(),
      subjectConsent(),
    );
    expect(result).toEqual({ ok: false, reason_code: "project_binding_forbidden" });
  });

  it("binds identity to subject", async () => {
    const result = await assembleCanonicalContextPacket(
      projectGraph(),
      request(),
      identity({ subject_id: IDS.otherSubject }),
      consent(),
    );
    expect(result).toEqual({ ok: false, reason_code: "identity_subject_mismatch" });
  });

  it("binds identity to session through Slice 1", async () => {
    const result = await assembleCanonicalContextPacket(
      projectGraph(),
      request(),
      identity({ session_id: IDS.otherSession }),
      consent(),
    );
    expect(result).toEqual({ ok: false, reason_code: "session_mismatch" });
  });

  it("requires project-participant assurance for project context", async () => {
    const result = await assembleCanonicalContextPacket(
      projectGraph(),
      request(),
      identity({ assurance_class: "verified_contact_control" }),
      consent(),
    );
    expect(result).toEqual({ ok: false, reason_code: "identity_assurance_insufficient" });
  });

  it("binds consent to purpose", async () => {
    const result = await assembleCanonicalContextPacket(
      projectGraph(),
      request(),
      identity(),
      consent({ purpose: "returning_customer_continuity" }),
    );
    expect(result).toEqual({ ok: false, reason_code: "purpose_mismatch" });
  });

  it("refuses consent immediately at revocation time", async () => {
    const result = await assembleCanonicalContextPacket(
      projectGraph(),
      request(),
      identity(),
      consent({ revoked_at: "2026-08-08T07:01:00Z" }),
    );
    expect(result).toEqual({ ok: false, reason_code: "consent_revoked" });
  });

  it("refuses expired identity without reading the clock", async () => {
    const result = await assembleCanonicalContextPacket(
      projectGraph(),
      request({ evaluated_at: "2026-08-08T07:05:00Z" }),
      identity(),
      consent(),
    );
    expect(result).toEqual({ ok: false, reason_code: "identity_expired" });
  });
});

describe("traversal exclusions and participant authority", () => {
  it("excludes stale facts", async () => {
    const result = await assembleCanonicalContextPacket(
      projectGraph({ stale: true }),
      request(),
      identity(),
      consent(),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.nodes.some((entry) => entry.node_id === IDS.staleFactNode)).toBe(false);
    expect(result.value.exclusions).toContain("excluded_stale");
  });

  it("excludes disputed facts", async () => {
    const result = await assembleCanonicalContextPacket(
      projectGraph({ disputed: true }),
      request(),
      identity(),
      consent(),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.nodes.some((entry) => entry.node_id === IDS.disputedFactNode)).toBe(false);
    expect(result.value.exclusions).toContain("excluded_disputed");
  });

  it("excludes statically over-classified nodes and edges", async () => {
    const result = await assembleCanonicalContextPacket(
      subjectGraph(),
      subjectRequest(),
      identity(),
      subjectConsent(),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.nodes.some((entry) => entry.node_id === IDS.freshFactNode)).toBe(false);
    expect(result.value.exclusions).toContain("excluded_over_classified");
  });

  it("excludes non-allowlisted edge families", async () => {
    const graph = projectGraph();
    edgeCounter = 20;
    const withDispute = {
      ...graph,
      edges: [
        ...graph.edges,
        edge(IDS.freshFactNode, IDS.propertyNode, "disputes"),
      ],
    };
    const result = await assembleCanonicalContextPacket(
      withDispute,
      request(),
      identity(),
      consent(),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.edges.some((entry) => entry.kind === "disputes")).toBe(false);
    expect(result.value.exclusions).toContain("excluded_non_allowlisted_edge");
  });

  it("excludes a co-participant node without explicit grant and edge", async () => {
    const result = await assembleCanonicalContextPacket(
      projectGraph({ coParticipant: true }),
      request(),
      identity(),
      consent(),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.nodes.some((entry) => entry.node_id === IDS.sharedSummaryNode)).toBe(false);
    expect(result.value.exclusions).toContain("excluded_unauthorized_participant");
  });

  it("admits a co-participant node only with bound AuthorizationGrant + authorized_for", async () => {
    const result = await assembleCanonicalContextPacket(
      projectGraph({ coParticipant: true, authorization: true }),
      request(),
      identity(),
      consent(),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.nodes.some((entry) => entry.node_id === IDS.sharedSummaryNode)).toBe(true);
    expect(result.value.edges.some((entry) => entry.kind === "authorized_for")).toBe(true);
  });

  it("refuses an expired co-participant grant", async () => {
    const graph = projectGraph({ coParticipant: true, authorization: true });
    const expired = {
      ...graph,
      nodes: graph.nodes.map((entry) =>
        entry.kind === "authorization_grant"
          ? node(IDS.authorizationNode, "authorization_grant", {
              expires_at: "2026-08-08T07:01:00Z",
            })
          : entry,
      ),
    };
    const result = await assembleCanonicalContextPacket(
      expired,
      request(),
      identity(),
      consent(),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.nodes.some((entry) => entry.node_id === IDS.sharedSummaryNode)).toBe(false);
  });
});

describe("ceilings, malformed graphs, and never-throw behavior", () => {
  it("refuses a requested depth above the allowlisted plan", async () => {
    const result = await assembleCanonicalContextPacket(
      projectGraph(),
      request({ maximum_depth: 4 }),
      identity(),
      consent(),
    );
    expect(result).toEqual({ ok: false, reason_code: "depth_ceiling_exceeded" });
  });

  it("refuses a requested node ceiling above the plan", async () => {
    const result = await assembleCanonicalContextPacket(
      projectGraph(),
      request({ maximum_nodes: 25 }),
      identity(),
      consent(),
    );
    expect(result).toEqual({ ok: false, reason_code: "node_ceiling_exceeded" });
  });

  it("refuses when traversal would exceed requested node cardinality", async () => {
    const result = await assembleCanonicalContextPacket(
      projectGraph(),
      request({ maximum_nodes: 1 }),
      identity(),
      consent(),
    );
    expect(result).toEqual({ ok: false, reason_code: "node_ceiling_exceeded" });
  });

  it("records deterministic depth exclusion without traversing further", async () => {
    const result = await assembleCanonicalContextPacket(
      projectGraph(),
      request({ maximum_depth: 1 }),
      identity(),
      consent(),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.nodes).toHaveLength(2);
    expect(result.value.exclusions).toContain("excluded_depth_ceiling");
  });

  it("refuses duplicate graph node identifiers", async () => {
    const graph = projectGraph();
    const result = await assembleCanonicalContextPacket(
      { ...graph, nodes: [...graph.nodes, graph.nodes[0]] },
      request(),
      identity(),
      consent(),
    );
    expect(result).toEqual({ ok: false, reason_code: "duplicate_graph_node" });
  });

  it("refuses graph edges with absent endpoints", async () => {
    const graph = projectGraph();
    edgeCounter = 30;
    const result = await assembleCanonicalContextPacket(
      {
        ...graph,
        edges: [
          ...graph.edges,
          edge(IDS.projectNode, "node_zzzzzzzzzzzzzzzz", "asserted_by"),
        ],
      },
      request(),
      identity(),
      consent(),
    );
    expect(result).toEqual({ ok: false, reason_code: "graph_edge_endpoint_missing" });
  });

  it("refuses an unreachable bound project", async () => {
    const graph = projectGraph();
    const result = await assembleCanonicalContextPacket(
      { ...graph, edges: graph.edges.slice(1) },
      request(),
      identity(),
      consent(),
    );
    expect(result).toEqual({ ok: false, reason_code: "project_not_reachable" });
  });

  it("never throws for hostile getters", async () => {
    const hostile = Object.defineProperty({}, "tenant_id", {
      enumerable: true,
      get() {
        throw new Error("hostile getter");
      },
    });
    await expect(
      assembleCanonicalContextPacket(projectGraph(), hostile, identity(), consent()),
    ).resolves.toEqual({ ok: false, reason_code: "invalid_untrusted_input" });
  });
});
