import { describe, expect, it, vi } from "vitest";
import { computeDigest } from "../studio/modelContract";
import {
  GRAPH_EDGE_SCHEMA,
  GRAPH_NODE_SCHEMA,
  IDENTITY_ASSERTION_SCHEMA,
  MEMORY_CONSENT_GRANT_SCHEMA,
  MEMORY_DATA_CLASSES,
  MEMORY_OPERATIONS,
  MUTATION_PROPOSAL_SCHEMA,
  RECEPTION_AUDIENCE,
  TENANT_ID,
  type GraphEdge,
  type GraphNode,
  type IdentityAssertion,
  type MemoryConsentGrant,
  type ProposedMutation,
} from "./receptionMemoryContract";
import {
  DELETION_CAPABILITY_SCHEMA,
  HUMAN_APPROVAL_SCHEMA,
  MEMORY_LIFECYCLE_COMMAND_KINDS,
  MEMORY_LIFECYCLE_COMMAND_SCHEMA,
  MEMORY_LIFECYCLE_ENGINE_VERSION,
  MEMORY_LIFECYCLE_REFUSAL_CODES,
  authorizeMemoryRetrieval,
  computeMemoryLifecycleStateDigest,
  createEmptyMemoryLifecycleState,
  executeMemoryLifecycleCommand,
  exportSubjectMemory,
  validateDeletionCapability,
  type DeletionCapability,
  type MemoryLifecycleCommand,
  type MemoryLifecycleState,
  type RetrievalGateRequest,
} from "./memoryLifecycleEngine";

const IDS = {
  subject: "subject_aaaaaaaaaaaaaaaa",
  session: "session_aaaaaaaaaaaaaaaa",
  project: "project_aaaaaaaaaaaaaaaa",
  subjectNode: "node_subjectaaaaaaaaaa",
  projectNode: "node_projectaaaaaaaaaa",
  consentNode: "node_consentaaaaaaaaaa",
  artifactNode: "node_artifactaaaaaaaaa",
  factNode: "node_factaaaaaaaaaaaaa",
  correctedFactNode: "node_factbbbbbbbbbbbbb",
  otherFactNode: "node_factccccccccccccc",
  consent: "consent_aaaaaaaaaaaaaaaa",
  assertion: "assertion_aaaaaaaaaaaaaaaa",
  source: "source_aaaaaaaaaaaaaaaa",
  edgeSubjectProject: "edge_subjectprojectaa",
  edgeSubjectConsent: "edge_subjectconsentaa",
  edgeProjectArtifact: "edge_projectartifacta",
  edgeProjectFact: "edge_projectfactaaaaa",
  edgeCorrection: "edge_correctionaaaaaaa",
  capability: "capability_aaaaaaaaaaaaaaaa",
} as const;

const AT = "2026-08-08T07:01:00Z";

function identity(): IdentityAssertion {
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
    nonce: "nonce_aaaaaaaaaaaaaaaa",
    verifier_version: "identity-verifier/1.0.0",
  };
}

function consent(): MemoryConsentGrant {
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
    expires_at: "2026-09-08T06:00:00Z",
    revoked_at: null,
  };
}

function node(
  nodeId: string,
  kind: GraphNode["kind"],
  payload: GraphNode["payload"],
  retentionClass: GraphNode["retention_class"] = "project_active",
): GraphNode {
  return {
    schema: GRAPH_NODE_SCHEMA,
    node_id: nodeId,
    tenant_id: TENANT_ID,
    kind,
    version: 1,
    created_at: "2026-08-08T06:00:00Z",
    retention_class: retentionClass,
    payload,
  } as GraphNode;
}

function edge(
  edgeId: string,
  from: string,
  to: string,
  kind: GraphEdge["kind"],
  deletionBehavior: GraphEdge["deletion_behavior"] = "remove_relationship",
): GraphEdge {
  return {
    schema: GRAPH_EDGE_SCHEMA,
    edge_id: edgeId,
    tenant_id: TENANT_ID,
    kind,
    from_node_id: from,
    to_node_id: to,
    version: 1,
    created_at: "2026-08-08T06:00:00Z",
    valid_from: "2026-08-08T06:00:00Z",
    valid_until: null,
    source_ref: IDS.source,
    policy_label: "memory-policy/1.0.0",
    deletion_behavior: deletionBehavior,
  } as GraphEdge;
}

const SUBJECT = node(IDS.subjectNode, "subject", {
  subject_id: IDS.subject,
  identity_vault_ref: "vault_aaaaaaaaaaaaaaaa",
});
const PROJECT = node(IDS.projectNode, "project", {
  project_id: IDS.project,
  project_state: "active",
});
const CONSENT_NODE = node(IDS.consentNode, "consent_grant", {
  consent_grant_id: IDS.consent,
  purpose: "project_continuity",
});
const ARTIFACT = node(IDS.artifactNode, "technical_artifact_ref", {
  artifact_id: "artifact_aaaaaaaaaaaaaaaa",
  artifact_schema: "adu-technical-artifact/1",
  artifact_digest: "sha256:" + "a".repeat(64),
  release: "1.0.0",
  custody_ref: "custody_aaaaaaaaaaaaaaaa",
});
const STALE_FACT = node(IDS.factNode, "fact_assertion", {
  fact_code: "site_constraint",
  value_code: "setback_pending",
  truth_class: "stale",
  provenance_refs: [IDS.source],
  observed_at: "2026-08-08T06:00:00Z",
  verified_at: null,
  expires_at: "2026-09-08T06:00:00Z",
  dispute_state: "none",
});

const SUBJECT_PROJECT = edge(
  IDS.edgeSubjectProject, IDS.subjectNode, IDS.projectNode,
  "participates_in_project");
const SUBJECT_CONSENT = edge(
  IDS.edgeSubjectConsent, IDS.subjectNode, IDS.consentNode, "consented_for");
const PROJECT_ARTIFACT = edge(
  IDS.edgeProjectArtifact, IDS.projectNode, IDS.artifactNode,
  "references_artifact", "retain_sanitized_reference");
const PROJECT_FACT = edge(
  IDS.edgeProjectFact, IDS.projectNode, IDS.factNode, "asserted_by");

function seededState(): MemoryLifecycleState {
  return {
    ...createEmptyMemoryLifecycleState(),
    node_versions: [ARTIFACT, STALE_FACT, SUBJECT, CONSENT_NODE, PROJECT],
    edge_versions: [
      PROJECT_FACT, PROJECT_ARTIFACT, SUBJECT_CONSENT, SUBJECT_PROJECT,
    ],
  };
}

function mutation(
  material: GraphNode | GraphEdge,
  operation: "append_node" | "append_edge",
  dedupeKey = "dedupe_aaaaaaaaaaaaaaaa",
): ProposedMutation {
  const common = {
    schema: MUTATION_PROPOSAL_SCHEMA,
    mutation_id: "mutation_aaaaaaaaaaaaaaaa",
    tenant_id: TENANT_ID,
    subject_id: IDS.subject,
    project_id: IDS.project,
    purpose: "project_continuity" as const,
    session_id: IDS.session,
    audience: RECEPTION_AUDIENCE,
    channel: "web_text" as const,
    identity_assertion_id: IDS.assertion,
    consent_grant_id: IDS.consent,
    proposed_at: AT,
    deduplication_key: dedupeKey,
    retention_class:
      operation === "append_node"
        ? (material as GraphNode).retention_class
        : ("project_active" as const),
  };
  return operation === "append_node"
    ? { ...common, operation, node: material as GraphNode }
    : { ...common, operation, edge: material as GraphEdge };
}

function commandBase(
  kind: MemoryLifecycleCommand["kind"],
  dedupeKey = "dedupe_aaaaaaaaaaaaaaaa",
) {
  return {
    schema: MEMORY_LIFECYCLE_COMMAND_SCHEMA,
    command_id: "command_aaaaaaaaaaaaaaaa",
    kind,
    tenant_id: TENANT_ID,
    subject_id: IDS.subject,
    project_id: IDS.project,
    purpose: "project_continuity" as const,
    session_id: IDS.session,
    audience: RECEPTION_AUDIENCE,
    channel: "web_text" as const,
    evaluated_at: AT,
    deduplication_key: dedupeKey,
  };
}

function correctedFact(
  truthClass: "customer_stated" | "verified" = "customer_stated",
  retentionClass: GraphNode["retention_class"] = "project_active",
): GraphNode {
  return node(IDS.correctedFactNode, "fact_assertion", {
    fact_code: "site_constraint",
    value_code: "setback_confirmed",
    truth_class: truthClass,
    provenance_refs: [IDS.source],
    observed_at: "2026-08-08T06:00:00Z",
    verified_at: truthClass === "verified" ? AT : null,
    expires_at: "2026-09-08T06:00:00Z",
    dispute_state: "resolved",
  }, retentionClass);
}

function correctionCommand(
  proposed: GraphNode,
  humanApproval: Record<string, unknown> | null = null,
): MemoryLifecycleCommand {
  const relation = edge(
    IDS.edgeCorrection, proposed.node_id, IDS.factNode, "supersedes");
  return {
    ...commandBase("correct_assertion"),
    kind: "correct_assertion",
    prior_node_id: IDS.factNode,
    prior_node_version: 1,
    node_mutation: mutation(proposed, "append_node"),
    edge_mutation: mutation(relation, "append_edge"),
    human_approval: humanApproval,
  } as MemoryLifecycleCommand;
}

function capability(
  overrides: Record<string, unknown> = {},
): DeletionCapability {
  return {
    schema: DELETION_CAPABILITY_SCHEMA,
    capability_id: IDS.capability,
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
    expires_at: "2026-09-08T06:00:00Z",
    ...overrides,
  } as DeletionCapability;
}

function retrieval(): RetrievalGateRequest {
  return {
    tenant_id: TENANT_ID,
    subject_id: IDS.subject,
    project_id: IDS.project,
    purpose: "project_continuity",
    session_id: IDS.session,
    audience: RECEPTION_AUDIENCE,
    channel: "web_text",
    consent_grant_id: IDS.consent,
    evaluated_at: AT,
  };
}

async function activate(
  state: MemoryLifecycleState,
): Promise<MemoryLifecycleState> {
  const result = await executeMemoryLifecycleCommand(state, {
    ...commandBase(
      "activate_deletion_capability", "dedupe_capabilityaaaaaaa"),
    command_id: "command_capabilityaaaaaaa",
    kind: "activate_deletion_capability",
    capability: capability(),
  }, identity(), consent());
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.reason_code);
  return result.state;
}

describe("lifecycle surface and validation", () => {
  it("pins a frozen closed command and refusal vocabulary", () => {
    expect(MEMORY_LIFECYCLE_ENGINE_VERSION).toBe(
      "memory-lifecycle-engine/1.0.0");
    expect(MEMORY_LIFECYCLE_COMMAND_KINDS).toHaveLength(6);
    expect(Object.isFrozen(MEMORY_LIFECYCLE_COMMAND_KINDS)).toBe(true);
    expect(new Set(MEMORY_LIFECYCLE_REFUSAL_CODES).size).toBe(
      MEMORY_LIFECYCLE_REFUSAL_CODES.length);
  });

  it("creates a deeply frozen canonical empty state", () => {
    const state = createEmptyMemoryLifecycleState();
    expect(Object.isFrozen(state)).toBe(true);
    expect(Object.isFrozen(state.node_versions)).toBe(true);
    expect(state.node_versions).toEqual([]);
  });

  it("validates exact command keys and tenant first", async () => {
    const proposed = node(IDS.otherFactNode, "fact_assertion", {
      ...(STALE_FACT as Extract<GraphNode, { kind: "fact_assertion" }>).payload,
      truth_class: "customer_stated",
    });
    const valid = {
      ...commandBase("append_mutation"),
      kind: "append_mutation" as const,
      mutation: mutation(proposed, "append_node"),
    };
    expect(await executeMemoryLifecycleCommand(seededState(), {
      ...valid, extra: true,
    }, identity(), consent())).toEqual({
      ok: false, reason_code: "invalid_command_shape",
    });
    expect(await executeMemoryLifecycleCommand(seededState(), {
      tenant_id: "tenant_other",
    }, identity(), consent())).toEqual({
      ok: false, reason_code: "invalid_tenant",
    });
  });

  it("never throws for hostile getters", async () => {
    const hostile = Object.defineProperty({}, "tenant_id", {
      enumerable: true,
      get() {
        throw new Error("hostile");
      },
    });
    await expect(executeMemoryLifecycleCommand(
      seededState(), hostile, identity(), consent(),
    )).resolves.toEqual({
      ok: false, reason_code: "invalid_untrusted_input",
    });
  });
});

describe("append-only mutation and deterministic idempotency", () => {
  it("validates a proposed append through Slice 1 and freezes cloned outputs", async () => {
    const proposed = node(IDS.otherFactNode, "fact_assertion", {
      ...(STALE_FACT as Extract<GraphNode, { kind: "fact_assertion" }>).payload,
      truth_class: "customer_stated",
    });
    const command = {
      ...commandBase("append_mutation"),
      kind: "append_mutation" as const,
      mutation: mutation(proposed, "append_node"),
    };
    const state = seededState();
    const before = JSON.stringify(state);
    const result = await executeMemoryLifecycleCommand(
      state, command, identity(), consent());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(JSON.stringify(state)).toBe(before);
    expect(result.state.node_versions).toContainEqual(proposed);
    expect(Object.isFrozen(result.state)).toBe(true);
    expect(Object.isFrozen(result.state.node_versions)).toBe(true);
    expect(Object.isFrozen(result.state.node_versions[0].payload)).toBe(true);
  });

  it("returns a byte-identical accepted result for identical replay", async () => {
    const proposed = node(IDS.otherFactNode, "fact_assertion", {
      ...(STALE_FACT as Extract<GraphNode, { kind: "fact_assertion" }>).payload,
      truth_class: "customer_stated",
    });
    const command = {
      ...commandBase("append_mutation"),
      kind: "append_mutation" as const,
      mutation: mutation(proposed, "append_node"),
    };
    const first = await executeMemoryLifecycleCommand(
      seededState(), command, identity(), consent());
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    const replay = await executeMemoryLifecycleCommand(
      first.state, structuredClone(command), identity(), consent());
    expect(replay.ok).toBe(true);
    if (!replay.ok) return;
    expect(JSON.stringify(replay.accepted_result)).toBe(
      JSON.stringify(first.accepted_result));
    expect(replay.state.evidence).toHaveLength(first.state.evidence.length);
  });

  it("refuses the same deduplication key with different material", async () => {
    const firstNode = node(IDS.otherFactNode, "fact_assertion", {
      ...(STALE_FACT as Extract<GraphNode, { kind: "fact_assertion" }>).payload,
      truth_class: "customer_stated",
    });
    const firstCommand = {
      ...commandBase("append_mutation"),
      kind: "append_mutation" as const,
      mutation: mutation(firstNode, "append_node"),
    };
    const first = await executeMemoryLifecycleCommand(
      seededState(), firstCommand, identity(), consent());
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    const changed = {
      ...firstCommand,
      command_id: "command_bbbbbbbbbbbbbbbb",
      mutation: {
        ...firstCommand.mutation,
        mutation_id: "mutation_bbbbbbbbbbbbbbbb",
      },
    };
    expect(await executeMemoryLifecycleCommand(
      first.state, changed, identity(), consent())).toEqual({
      ok: false, reason_code: "deduplication_conflict",
    });
  });

  it("retains old node versions when appending a new version", async () => {
    const prior = node(IDS.otherFactNode, "fact_assertion", {
      ...(STALE_FACT as Extract<GraphNode, { kind: "fact_assertion" }>).payload,
      truth_class: "customer_stated",
    });
    const state = { ...seededState(), node_versions: [
      ...seededState().node_versions, prior,
    ] };
    const next = { ...prior, version: 2, payload: {
      ...prior.payload, value_code: "setback_rechecked",
    } } as GraphNode;
    const result = await executeMemoryLifecycleCommand(state, {
      ...commandBase("append_mutation"),
      kind: "append_mutation",
      mutation: mutation(next, "append_node"),
    }, identity(), consent());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.node_versions.filter(
      (entry) => entry.node_id === IDS.otherFactNode).map(
        (entry) => entry.version)).toEqual([1, 2]);
  });

  it("refuses a version gap", async () => {
    const next = { ...STALE_FACT, node_id: IDS.otherFactNode, version: 2 };
    expect(await executeMemoryLifecycleCommand(seededState(), {
      ...commandBase("append_mutation"),
      kind: "append_mutation",
      mutation: mutation(next, "append_node"),
    }, identity(), consent())).toEqual({
      ok: false, reason_code: "node_version_conflict",
    });
  });

  it("surfaces Slice 1 exact-key refusal for malformed proposed mutation", async () => {
    const malformed = {
      ...mutation(STALE_FACT, "append_node"),
      extra: "forbidden",
    };
    expect(await executeMemoryLifecycleCommand(seededState(), {
      ...commandBase("append_mutation"),
      kind: "append_mutation",
      mutation: malformed,
    }, identity(), consent())).toEqual({
      ok: false, reason_code: "invalid_mutation_shape",
    });
  });

  it("binds tenant, subject, project, purpose, session, and channel material", async () => {
    const proposed = node(IDS.otherFactNode, "fact_assertion", {
      ...(STALE_FACT as Extract<GraphNode, { kind: "fact_assertion" }>).payload,
      truth_class: "customer_stated",
    });
    const nested = mutation(proposed, "append_node") as ProposedMutation;
    expect(await executeMemoryLifecycleCommand(seededState(), {
      ...commandBase("append_mutation"),
      kind: "append_mutation",
      mutation: { ...nested, session_id: "session_bbbbbbbbbbbbbbbb" },
    }, identity(), consent())).toEqual({
      ok: false, reason_code: "session_mismatch",
    });
  });

  it("refuses duplicate append-only state versions before execution", async () => {
    const malformed = {
      ...seededState(),
      node_versions: [...seededState().node_versions, SUBJECT],
    };
    expect(await executeMemoryLifecycleCommand(malformed, {
      ...commandBase("revoke_consent"),
      kind: "revoke_consent",
      consent_grant_id: IDS.consent,
    }, identity(), consent())).toEqual({
      ok: false, reason_code: "invalid_state_shape",
    });
  });
});

describe("correction and explicit truth authority", () => {
  it("appends a new assertion and an explicit supersedes relationship", async () => {
    const proposed = correctedFact();
    const approval = {
      schema: HUMAN_APPROVAL_SCHEMA,
      approval_id: "approval_aaaaaaaaaaaaaaaa",
      tenant_id: TENANT_ID,
      subject_id: IDS.subject,
      project_id: IDS.project,
      purpose: "project_continuity",
      session_id: IDS.session,
      approval_kind: "authoritative_truth_upgrade",
      target_node_id: proposed.node_id,
      proposed_material_digest: await computeDigest(proposed),
      decision: "approved",
      approver_role: "human_owner",
      approved_at: AT,
    };
    const result = await executeMemoryLifecycleCommand(
      seededState(), correctionCommand(proposed, approval),
      identity(), consent());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.node_versions).toContainEqual(proposed);
    expect(result.state.edge_versions).toContainEqual(
      expect.objectContaining({
        kind: "supersedes",
        from_node_id: proposed.node_id,
        to_node_id: IDS.factNode,
      }));
    expect(result.state.node_versions).toContainEqual(STALE_FACT);
  });

  it("refuses stale or disputed truth upgrade without approval", async () => {
    expect(await executeMemoryLifecycleCommand(
      seededState(), correctionCommand(correctedFact()), identity(), consent(),
    )).toEqual({ ok: false, reason_code: "human_approval_required" });
  });

  it("refuses an approval that is not digest-bound to proposed material", async () => {
    const proposed = correctedFact("verified");
    const approval = {
      schema: HUMAN_APPROVAL_SCHEMA,
      approval_id: "approval_aaaaaaaaaaaaaaaa",
      tenant_id: TENANT_ID,
      subject_id: IDS.subject,
      project_id: IDS.project,
      purpose: "project_continuity",
      session_id: IDS.session,
      approval_kind: "authoritative_truth_upgrade",
      target_node_id: proposed.node_id,
      proposed_material_digest: "sha256:" + "b".repeat(64),
      decision: "approved",
      approver_role: "human_owner",
      approved_at: AT,
    };
    expect(await executeMemoryLifecycleCommand(
      seededState(), correctionCommand(proposed, approval),
      identity(), consent(),
    )).toEqual({
      ok: false, reason_code: "human_approval_material_mismatch",
    });
  });

  it("requires the sensitive approval class for policy-controlled truth", async () => {
    const proposed = correctedFact("verified", "policy_controlled");
    const approval = {
      schema: HUMAN_APPROVAL_SCHEMA,
      approval_id: "approval_aaaaaaaaaaaaaaaa",
      tenant_id: TENANT_ID,
      subject_id: IDS.subject,
      project_id: IDS.project,
      purpose: "project_continuity",
      session_id: IDS.session,
      approval_kind: "authoritative_truth_upgrade",
      target_node_id: proposed.node_id,
      proposed_material_digest: await computeDigest(proposed),
      decision: "approved",
      approver_role: "human_owner",
      approved_at: AT,
    };
    expect(await executeMemoryLifecycleCommand(
      seededState(), correctionCommand(proposed, approval),
      identity(), consent(),
    )).toEqual({
      ok: false, reason_code: "truth_upgrade_not_authorized",
    });
  });
});

describe("unlink, canonical export, and retrieval lifecycle", () => {
  it("tombstones only the exact commercial relationship", async () => {
    const state = seededState();
    const technicalBefore = JSON.stringify({
      nodes: state.node_versions.filter((entry) =>
        entry.kind === "technical_artifact_ref"),
      edges: state.edge_versions.filter((entry) =>
        entry.kind === "references_artifact"),
    });
    const result = await executeMemoryLifecycleCommand(state, {
      ...commandBase("unlink_relationship"),
      kind: "unlink_relationship",
      edge_id: IDS.edgeSubjectProject,
      edge_version: 1,
    }, identity(), consent());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.edge_tombstones).toHaveLength(1);
    expect(result.state.edge_tombstones[0]).toEqual(expect.objectContaining({
      target_id: IDS.edgeSubjectProject,
      target_version: 1,
      reason_code: "commercial_unlink",
    }));
    expect(JSON.stringify({
      nodes: result.state.node_versions.filter((entry) =>
        entry.kind === "technical_artifact_ref"),
      edges: result.state.edge_versions.filter((entry) =>
        entry.kind === "references_artifact"),
    })).toBe(technicalBefore);
  });

  it("refuses unlinking immutable technical relationships", async () => {
    expect(await executeMemoryLifecycleCommand(seededState(), {
      ...commandBase("unlink_relationship"),
      kind: "unlink_relationship",
      edge_id: IDS.edgeProjectArtifact,
      edge_version: 1,
    }, identity(), consent())).toEqual({
      ok: false, reason_code: "relationship_not_commercial",
    });
  });

  it("exports deterministic subject-scoped canonical material", async () => {
    const first = await exportSubjectMemory(seededState(), retrieval(), consent());
    const reversed = {
      ...seededState(),
      node_versions: [...seededState().node_versions].reverse(),
      edge_versions: [...seededState().edge_versions].reverse(),
    };
    const second = await exportSubjectMemory(reversed, retrieval(), consent());
    expect(first).toEqual(second);
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    expect(first.value.nodes.map((entry) => entry.node_id)).toEqual(
      [...first.value.nodes.map((entry) => entry.node_id)].sort());
    expect(first.value.export_digest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(Object.isFrozen(first.value)).toBe(true);
    expect(Object.isFrozen(first.value.nodes[0].payload)).toBe(true);
  });

  it("blocks retrieval immediately after consent revocation", async () => {
    const revoked = await executeMemoryLifecycleCommand(seededState(), {
      ...commandBase("revoke_consent"),
      kind: "revoke_consent",
      consent_grant_id: IDS.consent,
    }, identity(), consent());
    expect(revoked.ok).toBe(true);
    if (!revoked.ok) return;
    expect(authorizeMemoryRetrieval(
      revoked.state, retrieval(), consent(),
    )).toEqual({ ok: false, reason_code: "consent_revoked" });
    expect(await exportSubjectMemory(
      revoked.state, retrieval(), consent(),
    )).toEqual({ ok: false, reason_code: "consent_revoked" });
  });
});

describe("provider deletion capability and subject deletion", () => {
  it("accepts a complete pure capability contract", () => {
    const result = validateDeletionCapability(capability());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(Object.isFrozen(result.value)).toBe(true);
  });

  it("refuses missing, ambiguous, extra-key, and insufficient capability", () => {
    expect(validateDeletionCapability(null)).toEqual({
      ok: false, reason_code: "invalid_deletion_capability_shape",
    });
    expect(validateDeletionCapability({
      ...capability(), extra: true,
    })).toEqual({
      ok: false, reason_code: "invalid_deletion_capability_shape",
    });
    expect(validateDeletionCapability({
      ...capability(), backup_deletion: "unknown",
    })).toEqual({
      ok: false, reason_code: "insufficient_deletion_capability",
    });
  });

  it("refuses deletion before capability activation", async () => {
    expect(await executeMemoryLifecycleCommand(seededState(), {
      ...commandBase("delete_subject"),
      kind: "delete_subject",
      deletion_request_id: "deletion_aaaaaaaaaaaaaaaa",
      capability_id: IDS.capability,
    }, identity(), consent())).toEqual({
      ok: false, reason_code: "deletion_capability_missing",
    });
  });

  it("refuses activation of an expired capability without consulting a clock", async () => {
    expect(await executeMemoryLifecycleCommand(seededState(), {
      ...commandBase("activate_deletion_capability"),
      kind: "activate_deletion_capability",
      capability: capability({
        verified_at: "2026-07-08T06:00:00Z",
        expires_at: "2026-08-08T07:00:00Z",
      }),
    }, identity(), consent())).toEqual({
      ok: false, reason_code: "deletion_capability_expired",
    });
  });

  it("refuses ambiguous activation after a different capability is active", async () => {
    const active = await activate(seededState());
    expect(await executeMemoryLifecycleCommand(active, {
      ...commandBase(
        "activate_deletion_capability", "dedupe_capabilitybbbbbbb"),
      command_id: "command_capabilitybbbbbbb",
      kind: "activate_deletion_capability",
      capability: capability({
        capability_id: "capability_bbbbbbbbbbbbbbbb",
        provider_ref: "provider_bbbbbbbbbbbbbbbb",
      }),
    }, identity(), consent())).toEqual({
      ok: false, reason_code: "ambiguous_deletion_capability",
    });
  });

  it("tombstones subject scope and refuses retrieval immediately", async () => {
    const active = await activate(seededState());
    const technicalBefore = JSON.stringify({
      node: active.node_versions.find((entry) =>
        entry.kind === "technical_artifact_ref"),
      edge: active.edge_versions.find((entry) =>
        entry.kind === "references_artifact"),
    });
    const deleted = await executeMemoryLifecycleCommand(active, {
      ...commandBase("delete_subject", "dedupe_deletionaaaaaaaa"),
      command_id: "command_deletionaaaaaaaa",
      kind: "delete_subject",
      deletion_request_id: "deletion_aaaaaaaaaaaaaaaa",
      capability_id: IDS.capability,
    }, identity(), consent());
    expect(deleted.ok).toBe(true);
    if (!deleted.ok) return;
    expect(deleted.state.subject_tombstones).toHaveLength(1);
    expect(authorizeMemoryRetrieval(
      deleted.state, retrieval(), consent(),
    )).toEqual({ ok: false, reason_code: "subject_deleted" });
    expect(JSON.stringify({
      node: deleted.state.node_versions.find((entry) =>
        entry.kind === "technical_artifact_ref"),
      edge: deleted.state.edge_versions.find((entry) =>
        entry.kind === "references_artifact"),
    })).toBe(technicalBefore);
  });

  it("replays deletion deterministically and idempotently", async () => {
    const active = await activate(seededState());
    const command = {
      ...commandBase("delete_subject", "dedupe_deletionaaaaaaaa"),
      command_id: "command_deletionaaaaaaaa",
      kind: "delete_subject" as const,
      deletion_request_id: "deletion_aaaaaaaaaaaaaaaa",
      capability_id: IDS.capability,
    };
    const first = await executeMemoryLifecycleCommand(
      active, command, identity(), consent());
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    const replay = await executeMemoryLifecycleCommand(
      first.state, structuredClone(command), identity(), consent());
    expect(replay.ok).toBe(true);
    if (!replay.ok) return;
    expect(replay.accepted_result).toEqual(first.accepted_result);
    expect(replay.state.subject_tombstones).toEqual(
      first.state.subject_tombstones);
    expect(replay.state.evidence).toEqual(first.state.evidence);
  });
});

describe("evidence, canonical digests, and clock-free operation", () => {
  it("records only sanitized lifecycle evidence fields", async () => {
    const result = await executeMemoryLifecycleCommand(seededState(), {
      ...commandBase("revoke_consent"),
      kind: "revoke_consent",
      consent_grant_id: IDS.consent,
    }, identity(), consent());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(Object.keys(result.state.evidence[0]).sort()).toEqual([
      "command_digest", "command_id", "command_kind", "evidence_id",
      "material_digest", "occurred_at", "outcome", "schema", "subject_id",
      "tenant_id",
    ]);
    const serialized = JSON.stringify(result.state.evidence);
    expect(serialized).not.toContain("payload");
    expect(serialized).not.toContain("raw");
    expect(serialized).not.toContain("value_code");
  });

  it("produces stable state digests independent of input array order", async () => {
    const first = await computeMemoryLifecycleStateDigest(seededState());
    const second = await computeMemoryLifecycleStateDigest({
      ...seededState(),
      node_versions: [...seededState().node_versions].reverse(),
      edge_versions: [...seededState().edge_versions].reverse(),
    });
    expect(first).toBe(second);
    expect(first).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it("does not read Date.now", async () => {
    const now = vi.spyOn(Date, "now").mockImplementation(() => {
      throw new Error("clock access forbidden");
    });
    const result = await exportSubjectMemory(
      seededState(), retrieval(), consent());
    expect(result.ok).toBe(true);
    expect(now).not.toHaveBeenCalled();
    now.mockRestore();
  });
});
