import {
  CONTEXT_PACKET_MAX_EDGES,
  CONTEXT_PACKET_MAX_NODES,
  CONTEXT_PACKET_SCHEMA,
  RECEPTION_AUDIENCE,
  TENANT_ID,
  computeContextPacketDigest,
  validateContextPacketForUse,
  validateGraphEdge,
  validateGraphNode,
  validateIdentityAssertion,
  validateMemoryConsentGrant,
  type ContextPacket,
  type ContextPacketUseBinding,
  type ContractFailure,
  type DisclosureClass,
  type GraphEdge,
  type GraphEdgeKind,
  type GraphNode,
  type GraphNodeKind,
  type IdentityAssertion,
  type Locale,
  type MemoryConsentGrant,
  type MemoryDataClass,
  type MemoryPurpose,
  type ReceptionChannel,
  type RefusalCode,
} from "./receptionMemoryContract";

export const CONTEXT_POLICY_ENGINE_VERSION =
  "context-policy-engine/1.0.0" as const;

export const CONTEXT_TRAVERSAL_PLANS = Object.freeze([
  "subject_continuity_v1",
  "project_continuity_v1",
] as const);

export type ContextTraversalPlanId =
  (typeof CONTEXT_TRAVERSAL_PLANS)[number];

export const CONTEXT_POLICY_REFUSAL_CODES = Object.freeze([
  "invalid_policy_request_shape",
  "invalid_graph_shape",
  "unsupported_traversal_plan",
  "plan_purpose_mismatch",
  "project_binding_required",
  "project_binding_forbidden",
  "identity_subject_mismatch",
  "identity_assurance_insufficient",
  "consent_binding_mismatch",
  "duplicate_graph_node",
  "duplicate_graph_edge",
  "graph_edge_endpoint_missing",
  "subject_root_not_found",
  "subject_root_ambiguous",
  "project_not_found",
  "project_ambiguous",
  "project_not_reachable",
  "depth_ceiling_exceeded",
  "node_ceiling_exceeded",
  "edge_ceiling_exceeded",
  "packet_has_no_provenance",
] as const);

export type ContextPolicyRefusalCode =
  | RefusalCode
  | (typeof CONTEXT_POLICY_REFUSAL_CODES)[number];

export type ContextPolicyFailure = Readonly<{
  ok: false;
  reason_code: ContextPolicyRefusalCode;
}>;

export type ContextPolicyResult =
  | Readonly<{ ok: true; value: ContextPacket }>
  | ContextPolicyFailure;

export type SyntheticMemoryGraph = Readonly<{
  tenant_id: typeof TENANT_ID;
  nodes: readonly GraphNode[];
  edges: readonly GraphEdge[];
}>;

export type ContextPolicyRequest = Readonly<{
  tenant_id: typeof TENANT_ID;
  subject_id: string;
  project_id: string | null;
  purpose: MemoryPurpose;
  session_id: string;
  audience: typeof RECEPTION_AUDIENCE;
  locale: Locale;
  channel: ReceptionChannel;
  traversal_plan: ContextTraversalPlanId;
  maximum_disclosure_class: DisclosureClass;
  maximum_depth: number;
  maximum_nodes: number;
  maximum_edges: number;
  packet_id: string;
  issued_at: string;
  expires_at: string;
  evaluated_at: string;
}>;

type TraversalPlan = Readonly<{
  purposes: readonly MemoryPurpose[];
  project_binding: "forbidden" | "required";
  maximum_disclosure_class: DisclosureClass;
  maximum_depth: number;
  maximum_nodes: number;
  maximum_edges: number;
  edge_kinds: readonly GraphEdgeKind[];
}>;

const SUBJECT_EDGES = Object.freeze([
  "owns_contact",
  "consented_for",
  "continues_journey",
  "summarized_from",
  "asserted_by",
  "verified_by",
  "supersedes",
  "authorized_for",
  "evidenced_by",
] as const satisfies readonly GraphEdgeKind[]);

const PROJECT_EDGES = Object.freeze([
  "associated_with_property",
  "participates_in_project",
  "continues_journey",
  "references_artifact",
  "summarized_from",
  "asserted_by",
  "verified_by",
  "supersedes",
  "authorized_for",
  "evidenced_by",
] as const satisfies readonly GraphEdgeKind[]);

const PLANS: Readonly<Record<ContextTraversalPlanId, TraversalPlan>> =
  Object.freeze({
    subject_continuity_v1: Object.freeze({
      purposes: Object.freeze([
        "current_session_service",
        "returning_customer_continuity",
      ] as const),
      project_binding: "forbidden",
      maximum_disclosure_class: "customer",
      maximum_depth: 2,
      maximum_nodes: 12,
      maximum_edges: 20,
      edge_kinds: SUBJECT_EDGES,
    }),
    project_continuity_v1: Object.freeze({
      purposes: Object.freeze(["project_continuity"] as const),
      project_binding: "required",
      maximum_disclosure_class: "project_sensitive",
      maximum_depth: 3,
      maximum_nodes: 24,
      maximum_edges: 48,
      edge_kinds: PROJECT_EDGES,
    }),
  });

const REQUEST_KEYS = Object.freeze([
  "tenant_id",
  "subject_id",
  "project_id",
  "purpose",
  "session_id",
  "audience",
  "locale",
  "channel",
  "traversal_plan",
  "maximum_disclosure_class",
  "maximum_depth",
  "maximum_nodes",
  "maximum_edges",
  "packet_id",
  "issued_at",
  "expires_at",
  "evaluated_at",
]);

const GRAPH_KEYS = Object.freeze(["tenant_id", "nodes", "edges"]);
const DISCLOSURE_RANK: Readonly<Record<DisclosureClass, number>> =
  Object.freeze({ public: 0, customer: 1, project_sensitive: 2 });

const NODE_DISCLOSURE: Readonly<Record<GraphNodeKind, DisclosureClass>> =
  Object.freeze({
    subject: "customer",
    contact_channel: "customer",
    consent_grant: "customer",
    property: "project_sensitive",
    lead_journey: "customer",
    project: "project_sensitive",
    technical_artifact_ref: "project_sensitive",
    interaction_summary: "customer",
    fact_assertion: "project_sensitive",
    authorization_grant: "project_sensitive",
    retention_directive: "project_sensitive",
    evidence_ref: "project_sensitive",
  });

const EDGE_DISCLOSURE: Readonly<Record<GraphEdgeKind, DisclosureClass>> =
  Object.freeze({
    owns_contact: "customer",
    consented_for: "customer",
    associated_with_property: "project_sensitive",
    participates_in_project: "project_sensitive",
    continues_journey: "customer",
    references_artifact: "project_sensitive",
    summarized_from: "customer",
    asserted_by: "project_sensitive",
    verified_by: "project_sensitive",
    supersedes: "project_sensitive",
    disputes: "project_sensitive",
    authorized_for: "project_sensitive",
    retained_under: "project_sensitive",
    evidenced_by: "project_sensitive",
  });

const NODE_DATA_CLASS: Readonly<Record<GraphNodeKind, MemoryDataClass>> =
  Object.freeze({
    subject: "identity_reference",
    contact_channel: "contact_channel",
    consent_grant: "consent",
    property: "property_reference",
    lead_journey: "lead_journey",
    project: "project",
    technical_artifact_ref: "technical_artifact_reference",
    interaction_summary: "interaction_summary",
    fact_assertion: "fact_assertion",
    authorization_grant: "authorization",
    retention_directive: "retention",
    evidence_ref: "evidence_reference",
  });

const EDGE_DATA_CLASS: Readonly<Record<GraphEdgeKind, MemoryDataClass>> =
  Object.freeze({
    owns_contact: "contact_channel",
    consented_for: "consent",
    associated_with_property: "property_reference",
    participates_in_project: "project",
    continues_journey: "lead_journey",
    references_artifact: "technical_artifact_reference",
    summarized_from: "interaction_summary",
    asserted_by: "fact_assertion",
    verified_by: "fact_assertion",
    supersedes: "fact_assertion",
    disputes: "fact_assertion",
    authorized_for: "authorization",
    retained_under: "retention",
    evidenced_by: "evidence_reference",
  });

type PlainRecord = Record<string, unknown>;

function failure(reason_code: ContextPolicyRefusalCode): ContextPolicyFailure {
  return Object.freeze({ ok: false, reason_code });
}

function isPlainRecord(value: unknown): value is PlainRecord {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function exactKeys(value: unknown, keys: readonly string[]): value is PlainRecord {
  if (!isPlainRecord(value)) return false;
  const expected = new Set(keys);
  return (
    Object.keys(value).every((key) => expected.has(key)) &&
    keys.every((key) => key in value)
  );
}

function isSafePositiveInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) > 0;
}

function utcMillis(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{3}))?Z$/.exec(
      value,
    );
  if (!match) return null;
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return null;
  return new Date(parsed).toISOString() ===
    `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}.${match[7] ?? "000"}Z`
    ? parsed
    : null;
}

function isOpaqueId(value: unknown, prefix: string): value is string {
  return (
    typeof value === "string" &&
    value.startsWith(`${prefix}_`) &&
    /^[a-z0-9]{16,64}$/.test(value.slice(prefix.length + 1))
  );
}

function isAllowedString<T extends string>(
  value: unknown,
  values: readonly T[],
): value is T {
  return typeof value === "string" && values.includes(value as T);
}

function isOverClassified(
  itemClass: DisclosureClass,
  requestClass: DisclosureClass,
): boolean {
  return DISCLOSURE_RANK[itemClass] > DISCLOSURE_RANK[requestClass];
}

function validateRequest(
  value: unknown,
): ContextPolicyFailure | Readonly<{ ok: true; value: ContextPolicyRequest; plan: TraversalPlan }> {
  if (!isPlainRecord(value) || value.tenant_id !== TENANT_ID) {
    return failure("invalid_tenant");
  }
  if (!exactKeys(value, REQUEST_KEYS)) {
    return failure("invalid_policy_request_shape");
  }
  if (!isAllowedString(value.traversal_plan, CONTEXT_TRAVERSAL_PLANS)) {
    return failure("unsupported_traversal_plan");
  }
  const plan = PLANS[value.traversal_plan];
  if (!isAllowedString(value.purpose, [
    "current_session_service",
    "returning_customer_continuity",
    "project_continuity",
  ] as const)) {
    return failure("invalid_purpose");
  }
  if (!plan.purposes.includes(value.purpose)) {
    return failure("plan_purpose_mismatch");
  }
  if (plan.project_binding === "required" && value.project_id === null) {
    return failure("project_binding_required");
  }
  if (plan.project_binding === "forbidden" && value.project_id !== null) {
    return failure("project_binding_forbidden");
  }
  if (
    !isOpaqueId(value.subject_id, "subject") ||
    (value.project_id !== null && !isOpaqueId(value.project_id, "project")) ||
    !isOpaqueId(value.session_id, "session") ||
    !isOpaqueId(value.packet_id, "packet") ||
    value.audience !== RECEPTION_AUDIENCE ||
    !isAllowedString(value.locale, ["en", "es", "ru"] as const) ||
    !isAllowedString(value.channel, ["web_text", "web_voice", "phone"] as const) ||
    !isAllowedString(value.maximum_disclosure_class, [
      "public",
      "customer",
      "project_sensitive",
    ] as const) ||
    utcMillis(value.issued_at) === null ||
    utcMillis(value.expires_at) === null ||
    utcMillis(value.evaluated_at) === null
  ) {
    return failure("invalid_policy_request_shape");
  }
  if (
    !isSafePositiveInteger(value.maximum_depth) ||
    value.maximum_depth > plan.maximum_depth
  ) {
    return failure("depth_ceiling_exceeded");
  }
  if (
    !isSafePositiveInteger(value.maximum_nodes) ||
    value.maximum_nodes > plan.maximum_nodes ||
    value.maximum_nodes > CONTEXT_PACKET_MAX_NODES
  ) {
    return failure("node_ceiling_exceeded");
  }
  if (
    !isSafePositiveInteger(value.maximum_edges) ||
    value.maximum_edges > plan.maximum_edges ||
    value.maximum_edges > CONTEXT_PACKET_MAX_EDGES
  ) {
    return failure("edge_ceiling_exceeded");
  }
  if (
    DISCLOSURE_RANK[value.maximum_disclosure_class] >
    DISCLOSURE_RANK[plan.maximum_disclosure_class]
  ) {
    return failure("invalid_disclosure_class");
  }
  return {
    ok: true,
    value: value as ContextPolicyRequest,
    plan,
  };
}

function validateGraph(
  value: unknown,
):
  | ContextPolicyFailure
  | Readonly<{
      ok: true;
      nodes: readonly GraphNode[];
      edges: readonly GraphEdge[];
      nodeById: ReadonlyMap<string, GraphNode>;
    }> {
  if (!isPlainRecord(value) || value.tenant_id !== TENANT_ID) {
    return failure("invalid_tenant");
  }
  if (!exactKeys(value, GRAPH_KEYS) || !Array.isArray(value.nodes) || !Array.isArray(value.edges)) {
    return failure("invalid_graph_shape");
  }
  if (value.nodes.length > 256) return failure("node_ceiling_exceeded");
  if (value.edges.length > 512) return failure("edge_ceiling_exceeded");

  const nodes: GraphNode[] = [];
  const nodeIds = new Set<string>();
  for (const candidate of value.nodes) {
    const result = validateGraphNode(candidate);
    if (!result.ok) return failure(result.reason_code);
    if (nodeIds.has(result.value.node_id)) return failure("duplicate_graph_node");
    nodeIds.add(result.value.node_id);
    nodes.push(result.value);
  }

  const edges: GraphEdge[] = [];
  const edgeIds = new Set<string>();
  for (const candidate of value.edges) {
    const result = validateGraphEdge(candidate);
    if (!result.ok) return failure(result.reason_code);
    if (edgeIds.has(result.value.edge_id)) return failure("duplicate_graph_edge");
    if (
      !nodeIds.has(result.value.from_node_id) ||
      !nodeIds.has(result.value.to_node_id)
    ) {
      return failure("graph_edge_endpoint_missing");
    }
    edgeIds.add(result.value.edge_id);
    edges.push(result.value);
  }

  nodes.sort((left, right) => left.node_id.localeCompare(right.node_id));
  edges.sort((left, right) => left.edge_id.localeCompare(right.edge_id));
  return {
    ok: true,
    nodes,
    edges,
    nodeById: new Map(nodes.map((node) => [node.node_id, node])),
  };
}

function nodeIsTruthExcluded(node: GraphNode, evaluatedAt: number): "stale" | "disputed" | null {
  if (node.kind === "interaction_summary") {
    if (node.payload.truth_class === "stale") return "stale";
    if (node.payload.truth_class === "disputed") return "disputed";
  }
  if (node.kind === "fact_assertion") {
    if (
      node.payload.truth_class === "stale" ||
      (node.payload.expires_at !== null &&
        (utcMillis(node.payload.expires_at) ?? Number.NEGATIVE_INFINITY) <= evaluatedAt)
    ) {
      return "stale";
    }
    if (
      node.payload.truth_class === "disputed" ||
      node.payload.dispute_state === "disputed"
    ) {
      return "disputed";
    }
  }
  return null;
}

function edgeIsActive(edge: GraphEdge, evaluatedAt: number): boolean {
  const from = utcMillis(edge.valid_from);
  const until = edge.valid_until === null ? null : utcMillis(edge.valid_until);
  return from !== null && from <= evaluatedAt && (until === null || evaluatedAt < until);
}

function validAuthorizations(
  nodes: readonly GraphNode[],
  edges: readonly GraphEdge[],
  request: ContextPolicyRequest,
  evaluatedAt: number,
): ReadonlySet<string> {
  const grants = new Map(
    nodes
      .filter((node) => node.kind === "authorization_grant")
      .filter(
        (node) =>
          node.payload.subject_id === request.subject_id &&
          node.payload.session_id === request.session_id &&
          node.payload.purpose === request.purpose &&
          node.payload.operations.includes("read_context") &&
          (utcMillis(node.payload.expires_at) ?? Number.NEGATIVE_INFINITY) > evaluatedAt,
      )
      .map((node) => [node.node_id, node]),
  );

  const authorized = new Set<string>();
  for (const edge of edges) {
    if (
      edge.kind !== "authorized_for" ||
      !edgeIsActive(edge, evaluatedAt) ||
      !grants.has(edge.from_node_id)
    ) {
      continue;
    }
    const target = nodes.find((node) => node.node_id === edge.to_node_id);
    const grant = grants.get(edge.from_node_id);
    if (target && grant?.kind === "authorization_grant" && grant.payload.node_kinds.includes(target.kind)) {
      authorized.add(target.node_id);
    }
  }
  return authorized;
}

function protectedByCoParticipant(
  nodes: readonly GraphNode[],
  edges: readonly GraphEdge[],
  subjectId: string,
): ReadonlySet<string> {
  const otherSubjectNodes = new Set(
    nodes
      .filter(
        (node) => node.kind === "subject" && node.payload.subject_id !== subjectId,
      )
      .map((node) => node.node_id),
  );
  const protectedNodes = new Set(otherSubjectNodes);
  for (const edge of edges) {
    if (otherSubjectNodes.has(edge.from_node_id)) protectedNodes.add(edge.to_node_id);
    if (otherSubjectNodes.has(edge.to_node_id)) protectedNodes.add(edge.from_node_id);
  }
  return protectedNodes;
}

function exclusionForNode(
  node: GraphNode,
  request: ContextPolicyRequest,
  consent: MemoryConsentGrant,
  evaluatedAt: number,
  protectedNodes: ReadonlySet<string>,
  authorizedNodes: ReadonlySet<string>,
): string | null {
  const truthExclusion = nodeIsTruthExcluded(node, evaluatedAt);
  if (truthExclusion === "stale") return "excluded_stale";
  if (truthExclusion === "disputed") return "excluded_disputed";
  if (isOverClassified(NODE_DISCLOSURE[node.kind], request.maximum_disclosure_class)) {
    return "excluded_over_classified";
  }
  if (!consent.data_classes.includes(NODE_DATA_CLASS[node.kind])) {
    return "excluded_unconsented_data_class";
  }
  if (protectedNodes.has(node.node_id) && !authorizedNodes.has(node.node_id)) {
    return "excluded_unauthorized_participant";
  }
  if (
    node.kind === "project" &&
    request.project_id !== null &&
    node.payload.project_id !== request.project_id
  ) {
    return "excluded_other_project";
  }
  return null;
}

function underlyingFailure(result: ContractFailure): ContextPolicyFailure {
  return failure(result.reason_code);
}

export async function assembleCanonicalContextPacket(
  graphInput: unknown,
  requestInput: unknown,
  identityInput: unknown,
  consentInput: unknown,
): Promise<ContextPolicyResult> {
  try {
    const requestResult = validateRequest(requestInput);
    if (!requestResult.ok) return requestResult;
    const request = requestResult.value;
    const plan = requestResult.plan;

    const graphResult = validateGraph(graphInput);
    if (!graphResult.ok) return graphResult;
    const { nodes, edges, nodeById } = graphResult;

    const identityResult = validateIdentityAssertion(identityInput, {
      tenant_id: request.tenant_id,
      audience: request.audience,
      session_id: request.session_id,
      evaluated_at: request.evaluated_at,
    });
    if (!identityResult.ok) return underlyingFailure(identityResult);
    const identity: IdentityAssertion = identityResult.value;
    if (identity.subject_id !== request.subject_id) {
      return failure("identity_subject_mismatch");
    }
    if (
      request.project_id !== null &&
      identity.assurance_class !== "verified_project_participant"
    ) {
      return failure("identity_assurance_insufficient");
    }

    const activeConsentResult = validateMemoryConsentGrant(consentInput, {
      tenant_id: request.tenant_id,
      subject_id: request.subject_id,
      purpose: request.purpose,
      channel: request.channel,
      operation: "read_context",
      data_classes: [],
      evaluated_at: request.evaluated_at,
    });
    if (!activeConsentResult.ok) return underlyingFailure(activeConsentResult);
    const consent = activeConsentResult.value;
    if (
      consent.subject_id !== request.subject_id ||
      consent.purpose !== request.purpose
    ) {
      return failure("consent_binding_mismatch");
    }

    const roots = nodes.filter(
      (node) =>
        node.kind === "subject" && node.payload.subject_id === request.subject_id,
    );
    if (roots.length === 0) return failure("subject_root_not_found");
    if (roots.length > 1) return failure("subject_root_ambiguous");

    const projects =
      request.project_id === null
        ? []
        : nodes.filter(
            (node) =>
              node.kind === "project" &&
              node.payload.project_id === request.project_id,
          );
    if (request.project_id !== null && projects.length === 0) {
      return failure("project_not_found");
    }
    if (projects.length > 1) return failure("project_ambiguous");

    const evaluatedAt = utcMillis(request.evaluated_at)!;
    const authorizedNodes = validAuthorizations(
      nodes,
      edges,
      request,
      evaluatedAt,
    );
    const protectedNodes = protectedByCoParticipant(
      nodes,
      edges,
      request.subject_id,
    );
    const exclusions = new Set<string>();
    const allowedEdges = edges.filter(
      (edge) =>
        plan.edge_kinds.includes(edge.kind) && edgeIsActive(edge, evaluatedAt),
    );
    if (edges.some((edge) => !plan.edge_kinds.includes(edge.kind))) {
      exclusions.add("excluded_non_allowlisted_edge");
    }
    if (edges.some((edge) => plan.edge_kinds.includes(edge.kind) && !edgeIsActive(edge, evaluatedAt))) {
      exclusions.add("excluded_inactive_edge");
    }

    const adjacency = new Map<string, Array<Readonly<{ edge: GraphEdge; next: string }>>>();
    for (const edge of allowedEdges) {
      const left = adjacency.get(edge.from_node_id) ?? [];
      left.push({ edge, next: edge.to_node_id });
      adjacency.set(edge.from_node_id, left);
      const right = adjacency.get(edge.to_node_id) ?? [];
      right.push({ edge, next: edge.from_node_id });
      adjacency.set(edge.to_node_id, right);
    }
    for (const links of adjacency.values()) {
      links.sort((left, right) => {
        const byNode = left.next.localeCompare(right.next);
        return byNode === 0 ? left.edge.edge_id.localeCompare(right.edge.edge_id) : byNode;
      });
    }

    const selected = new Map<string, GraphNode>();
    const visitedDepth = new Map<string, number>();
    const queue: Array<Readonly<{ nodeId: string; depth: number }>> = [
      { nodeId: roots[0].node_id, depth: 0 },
    ];
    visitedDepth.set(roots[0].node_id, 0);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const node = nodeById.get(current.nodeId)!;
      const exclusion = exclusionForNode(
        node,
        request,
        consent,
        evaluatedAt,
        protectedNodes,
        authorizedNodes,
      );
      if (exclusion !== null) {
        exclusions.add(exclusion);
        continue;
      }
      selected.set(node.node_id, node);
      if (selected.size > request.maximum_nodes) {
        return failure("node_ceiling_exceeded");
      }
      const links = adjacency.get(node.node_id) ?? [];
      if (current.depth >= request.maximum_depth) {
        if (links.some((link) => !visitedDepth.has(link.next))) {
          exclusions.add("excluded_depth_ceiling");
        }
        continue;
      }
      for (const link of links) {
        if (visitedDepth.has(link.next)) continue;
        visitedDepth.set(link.next, current.depth + 1);
        queue.push({ nodeId: link.next, depth: current.depth + 1 });
      }
    }

    if (
      request.project_id !== null &&
      !selected.has(projects[0].node_id)
    ) {
      return failure("project_not_reachable");
    }

    const selectedEdges: GraphEdge[] = [];
    for (const edge of allowedEdges) {
      if (!selected.has(edge.from_node_id) || !selected.has(edge.to_node_id)) continue;
      if (edge.kind === "disputes") {
        exclusions.add("excluded_disputed");
        continue;
      }
      if (isOverClassified(EDGE_DISCLOSURE[edge.kind], request.maximum_disclosure_class)) {
        exclusions.add("excluded_over_classified");
        continue;
      }
      if (!consent.data_classes.includes(EDGE_DATA_CLASS[edge.kind])) {
        exclusions.add("excluded_unconsented_data_class");
        continue;
      }
      selectedEdges.push(edge);
      if (selectedEdges.length > request.maximum_edges) {
        return failure("edge_ceiling_exceeded");
      }
    }

    const selectedNodes = [...selected.values()].sort((left, right) =>
      left.node_id.localeCompare(right.node_id),
    );
    selectedEdges.sort((left, right) => left.edge_id.localeCompare(right.edge_id));

    const provenance = new Set(selectedEdges.map((edge) => edge.source_ref));
    for (const node of selectedNodes) {
      if (node.kind === "fact_assertion") {
        for (const source of node.payload.provenance_refs) provenance.add(source);
      }
    }
    if (provenance.size === 0) return failure("packet_has_no_provenance");

    const packetWithoutDigest: ContextPacket = {
      schema: CONTEXT_PACKET_SCHEMA,
      packet_id: request.packet_id,
      tenant_id: request.tenant_id,
      subject_id: request.subject_id,
      project_id: request.project_id,
      purpose: request.purpose,
      session_id: request.session_id,
      audience: request.audience,
      locale: request.locale,
      channel: request.channel,
      policy_version: consent.policy_version,
      consent_grant_id: consent.consent_grant_id,
      identity_assertion_id: identity.assertion_id,
      issued_at: request.issued_at,
      expires_at: request.expires_at,
      maximum_disclosure_class: request.maximum_disclosure_class,
      nodes: selectedNodes,
      edges: selectedEdges,
      provenance_refs: [...provenance].sort(),
      exclusions: [...exclusions].sort(),
      packet_digest: `sha256:${"0".repeat(64)}`,
    };
    const packet: ContextPacket = {
      ...packetWithoutDigest,
      packet_digest: await computeContextPacketDigest(packetWithoutDigest),
    };
    const binding: ContextPacketUseBinding = {
      tenant_id: request.tenant_id,
      subject_id: request.subject_id,
      project_id: request.project_id,
      purpose: request.purpose,
      session_id: request.session_id,
      audience: request.audience,
      locale: request.locale,
      channel: request.channel,
      evaluated_at: request.evaluated_at,
    };
    const validated = await validateContextPacketForUse(
      packet,
      identity,
      consent,
      binding,
    );
    return validated.ok ? validated : underlyingFailure(validated);
  } catch {
    return failure("invalid_untrusted_input");
  }
}
