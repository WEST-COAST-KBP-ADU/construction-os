import { canonicalDigestInput, computeDigest } from "../studio/modelContract";
import {
  RECEPTION_AUDIENCE,
  TENANT_ID,
  validateGraphEdge,
  validateGraphNode,
  validateMemoryConsentGrant,
  validateProposedMutation,
  type GraphEdge,
  type GraphNode,
  type MemoryPurpose,
  type ProposedMutation,
  type ReceptionChannel,
  type RefusalCode,
  type TruthClass,
} from "./receptionMemoryContract";

export const MEMORY_LIFECYCLE_ENGINE_VERSION =
  "memory-lifecycle-engine/1.0.0" as const;
export const MEMORY_LIFECYCLE_STATE_SCHEMA = "memory-lifecycle-state/1" as const;
export const MEMORY_LIFECYCLE_COMMAND_SCHEMA = "memory-lifecycle-command/1" as const;
export const HUMAN_APPROVAL_SCHEMA = "memory-human-approval/1" as const;
export const DELETION_CAPABILITY_SCHEMA = "memory-deletion-capability/1" as const;
export const LIFECYCLE_EVIDENCE_SCHEMA = "memory-lifecycle-evidence/1" as const;
export const SUBJECT_EXPORT_SCHEMA = "memory-subject-export/1" as const;
export const ACCEPTED_RESULT_SCHEMA = "memory-lifecycle-accepted-result/1" as const;

export const MEMORY_LIFECYCLE_COMMAND_KINDS = Object.freeze([
  "append_mutation",
  "correct_assertion",
  "unlink_relationship",
  "revoke_consent",
  "delete_subject",
  "activate_deletion_capability",
] as const);
export type MemoryLifecycleCommandKind =
  (typeof MEMORY_LIFECYCLE_COMMAND_KINDS)[number];

export const MEMORY_LIFECYCLE_REFUSAL_CODES = Object.freeze([
  "invalid_state_shape",
  "invalid_command_shape",
  "invalid_command_schema",
  "invalid_command_id",
  "invalid_command_kind",
  "invalid_deduplication_key",
  "deduplication_conflict",
  "command_binding_mismatch",
  "invalid_human_approval_shape",
  "invalid_human_approval_schema",
  "human_approval_required",
  "human_approval_binding_mismatch",
  "human_approval_material_mismatch",
  "node_version_conflict",
  "edge_version_conflict",
  "node_tombstoned",
  "edge_tombstoned",
  "edge_endpoint_missing",
  "correction_target_missing",
  "correction_target_ambiguous",
  "correction_target_ineligible",
  "correction_relation_invalid",
  "truth_upgrade_not_authorized",
  "relationship_missing",
  "relationship_already_unlinked",
  "relationship_not_commercial",
  "relationship_out_of_scope",
  "technical_material_changed",
  "consent_grant_missing",
  "consent_already_revoked",
  "subject_missing",
  "subject_ambiguous",
  "subject_deleted",
  "deletion_capability_missing",
  "deletion_capability_mismatch",
  "deletion_capability_expired",
  "invalid_deletion_capability_shape",
  "invalid_deletion_capability_schema",
  "ambiguous_deletion_capability",
  "insufficient_deletion_capability",
  "invalid_retrieval_request_shape",
  "retrieval_consent_mismatch",
  "invalid_export_request_shape",
  "project_out_of_scope",
] as const);

export type MemoryLifecycleRefusalCode =
  | RefusalCode
  | (typeof MEMORY_LIFECYCLE_REFUSAL_CODES)[number];

export type LifecycleFailure = Readonly<{
  ok: false;
  reason_code: MemoryLifecycleRefusalCode;
}>;

export type HumanApprovalArtifact = Readonly<{
  schema: typeof HUMAN_APPROVAL_SCHEMA;
  approval_id: string;
  tenant_id: typeof TENANT_ID;
  subject_id: string;
  project_id: string | null;
  purpose: MemoryPurpose;
  session_id: string;
  approval_kind: "authoritative_truth_upgrade" | "sensitive_truth_upgrade";
  target_node_id: string;
  proposed_material_digest: string;
  decision: "approved";
  approver_role: "human_owner";
  approved_at: string;
}>;

export type DeletionCapability = Readonly<{
  schema: typeof DELETION_CAPABILITY_SCHEMA;
  capability_id: string;
  tenant_id: typeof TENANT_ID;
  provider_ref: string;
  primary_store_deletion: "supported";
  backup_deletion: "supported";
  immutable_backup_disposition: "cryptographic_erasure" | "expiry_enforced";
  deletion_scope: "subject_scoped";
  completion_semantics: "deterministic_acknowledgement";
  maximum_completion_seconds: number;
  contract_version: string;
  verified_at: string;
  expires_at: string;
}>;

export type LifecycleTombstone = Readonly<{
  tombstone_id: string;
  target_kind: "node_version" | "edge_version" | "subject";
  target_id: string;
  target_version: number | null;
  subject_id: string;
  reason_code: "commercial_unlink" | "subject_deletion";
  effective_at: string;
  command_id: string;
}>;

export type LifecycleEvidenceRecord = Readonly<{
  schema: typeof LIFECYCLE_EVIDENCE_SCHEMA;
  evidence_id: string;
  tenant_id: typeof TENANT_ID;
  subject_id: string;
  command_id: string;
  command_kind: MemoryLifecycleCommandKind;
  outcome: "accepted";
  command_digest: string;
  material_digest: string;
  occurred_at: string;
}>;

export type LifecycleAcceptedResult = Readonly<{
  schema: typeof ACCEPTED_RESULT_SCHEMA;
  command_id: string;
  command_kind: MemoryLifecycleCommandKind;
  deduplication_key: string;
  command_digest: string;
  state_digest: string;
  evidence_digest: string;
}>;

export type DeduplicationRecord = Readonly<{
  deduplication_key: string;
  command_digest: string;
  accepted_result: LifecycleAcceptedResult;
}>;

export type MemoryLifecycleState = Readonly<{
  schema: typeof MEMORY_LIFECYCLE_STATE_SCHEMA;
  tenant_id: typeof TENANT_ID;
  node_versions: readonly GraphNode[];
  edge_versions: readonly GraphEdge[];
  node_tombstones: readonly LifecycleTombstone[];
  edge_tombstones: readonly LifecycleTombstone[];
  subject_tombstones: readonly LifecycleTombstone[];
  revoked_consent_grant_ids: readonly string[];
  active_deletion_capability: DeletionCapability | null;
  deduplication_records: readonly DeduplicationRecord[];
  evidence: readonly LifecycleEvidenceRecord[];
}>;

type CommandBase<K extends MemoryLifecycleCommandKind> = Readonly<{
  schema: typeof MEMORY_LIFECYCLE_COMMAND_SCHEMA;
  command_id: string;
  kind: K;
  tenant_id: typeof TENANT_ID;
  subject_id: string;
  project_id: string | null;
  purpose: MemoryPurpose;
  session_id: string;
  audience: typeof RECEPTION_AUDIENCE;
  channel: ReceptionChannel;
  evaluated_at: string;
  deduplication_key: string;
}>;

export type AppendMutationCommand = CommandBase<"append_mutation"> &
  Readonly<{ mutation: ProposedMutation }>;
export type CorrectAssertionCommand = CommandBase<"correct_assertion"> &
  Readonly<{
    prior_node_id: string;
    prior_node_version: number;
    node_mutation: ProposedMutation;
    edge_mutation: ProposedMutation;
    human_approval: HumanApprovalArtifact | null;
  }>;
export type UnlinkRelationshipCommand = CommandBase<"unlink_relationship"> &
  Readonly<{ edge_id: string; edge_version: number }>;
export type RevokeConsentCommand = CommandBase<"revoke_consent"> &
  Readonly<{ consent_grant_id: string }>;
export type DeleteSubjectCommand = CommandBase<"delete_subject"> &
  Readonly<{ deletion_request_id: string; capability_id: string }>;
export type ActivateDeletionCapabilityCommand =
  CommandBase<"activate_deletion_capability"> &
    Readonly<{ capability: DeletionCapability }>;

export type MemoryLifecycleCommand =
  | AppendMutationCommand
  | CorrectAssertionCommand
  | UnlinkRelationshipCommand
  | RevokeConsentCommand
  | DeleteSubjectCommand
  | ActivateDeletionCapabilityCommand;

export type LifecycleSuccess = Readonly<{
  ok: true;
  state: MemoryLifecycleState;
  accepted_result: LifecycleAcceptedResult;
}>;
export type LifecycleResult = LifecycleSuccess | LifecycleFailure;

export type RetrievalGateRequest = Readonly<{
  tenant_id: typeof TENANT_ID;
  subject_id: string;
  project_id: string | null;
  purpose: MemoryPurpose;
  session_id: string;
  audience: typeof RECEPTION_AUDIENCE;
  channel: ReceptionChannel;
  consent_grant_id: string;
  evaluated_at: string;
}>;

export type SubjectExport = Readonly<{
  schema: typeof SUBJECT_EXPORT_SCHEMA;
  tenant_id: typeof TENANT_ID;
  subject_id: string;
  project_id: string | null;
  purpose: MemoryPurpose;
  session_id: string;
  exported_at: string;
  nodes: readonly GraphNode[];
  edges: readonly GraphEdge[];
  state_digest: string;
  export_digest: string;
}>;

type PlainRecord = Record<string, unknown>;

const STATE_KEYS = [
  "schema", "tenant_id", "node_versions", "edge_versions", "node_tombstones",
  "edge_tombstones", "subject_tombstones", "revoked_consent_grant_ids",
  "active_deletion_capability", "deduplication_records", "evidence",
] as const;
const COMMAND_COMMON_KEYS = [
  "schema", "command_id", "kind", "tenant_id", "subject_id", "project_id",
  "purpose", "session_id", "audience", "channel", "evaluated_at",
  "deduplication_key",
] as const;
const COMMAND_KEYS = {
  append_mutation: [...COMMAND_COMMON_KEYS, "mutation"],
  correct_assertion: [
    ...COMMAND_COMMON_KEYS, "prior_node_id", "prior_node_version",
    "node_mutation", "edge_mutation", "human_approval",
  ],
  unlink_relationship: [...COMMAND_COMMON_KEYS, "edge_id", "edge_version"],
  revoke_consent: [...COMMAND_COMMON_KEYS, "consent_grant_id"],
  delete_subject: [...COMMAND_COMMON_KEYS, "deletion_request_id", "capability_id"],
  activate_deletion_capability: [...COMMAND_COMMON_KEYS, "capability"],
} as const satisfies Record<MemoryLifecycleCommandKind, readonly string[]>;
const APPROVAL_KEYS = [
  "schema", "approval_id", "tenant_id", "subject_id", "project_id", "purpose",
  "session_id", "approval_kind", "target_node_id", "proposed_material_digest",
  "decision", "approver_role", "approved_at",
] as const;
const CAPABILITY_KEYS = [
  "schema", "capability_id", "tenant_id", "provider_ref",
  "primary_store_deletion", "backup_deletion", "immutable_backup_disposition",
  "deletion_scope", "completion_semantics", "maximum_completion_seconds",
  "contract_version", "verified_at", "expires_at",
] as const;
const TOMBSTONE_KEYS = [
  "tombstone_id", "target_kind", "target_id", "target_version", "subject_id",
  "reason_code", "effective_at", "command_id",
] as const;
const EVIDENCE_KEYS = [
  "schema", "evidence_id", "tenant_id", "subject_id", "command_id",
  "command_kind", "outcome", "command_digest", "material_digest", "occurred_at",
] as const;
const ACCEPTED_KEYS = [
  "schema", "command_id", "command_kind", "deduplication_key",
  "command_digest", "state_digest", "evidence_digest",
] as const;
const DEDUPE_KEYS = [
  "deduplication_key", "command_digest", "accepted_result",
] as const;
const RETRIEVAL_KEYS = [
  "tenant_id", "subject_id", "project_id", "purpose", "session_id", "audience",
  "channel", "consent_grant_id", "evaluated_at",
] as const;
const EXPORT_KEYS = [
  "schema", "tenant_id", "subject_id", "project_id", "purpose", "session_id",
  "exported_at", "nodes", "edges", "state_digest", "export_digest",
] as const;

const OPAQUE_SUFFIX = /^[a-z0-9]{16,64}$/;
const DEDUPE = /^dedupe_[A-Za-z0-9_-]{16,80}$/;
const DIGEST = /^sha256:[0-9a-f]{64}$/;
const VERSIONED =
  /^[a-z][a-z0-9-]*(?:\/[a-z][a-z0-9-]*)*\/(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/;
const PROVIDER_REF = /^provider_[a-z0-9]{16,64}$/;
const PURPOSES = Object.freeze([
  "current_session_service", "returning_customer_continuity", "project_continuity",
] as const);
const CHANNELS = Object.freeze(["web_text", "web_voice", "phone"] as const);
const COMMERCIAL_RELATIONSHIPS = new Set<GraphEdge["kind"]>([
  "owns_contact", "consented_for", "associated_with_property",
  "participates_in_project", "continues_journey", "summarized_from",
  "asserted_by", "authorized_for", "retained_under",
]);
const TECHNICAL_NODE_KINDS = new Set<GraphNode["kind"]>([
  "technical_artifact_ref", "evidence_ref",
]);
const TECHNICAL_EDGE_KINDS = new Set<GraphEdge["kind"]>([
  "references_artifact", "verified_by", "evidenced_by",
]);

function failure(reason_code: MemoryLifecycleRefusalCode): LifecycleFailure {
  return { ok: false, reason_code };
}

function isPlainRecord(value: unknown): value is PlainRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function exactKeys(value: unknown, keys: readonly string[]): value is PlainRecord {
  if (!isPlainRecord(value)) return false;
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length &&
    actual.every((key, index) => key === expected[index]);
}

function isOpaqueId(value: unknown, prefix: string): value is string {
  if (typeof value !== "string") return false;
  const marker = prefix + "_";
  return value.startsWith(marker) && OPAQUE_SUFFIX.test(value.slice(marker.length));
}

function isDigest(value: unknown): value is string {
  return typeof value === "string" && DIGEST.test(value);
}

function utcMillis(value: unknown): number | null {
  if (typeof value !== "string" ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value)) return null;
  const millis = Date.parse(value);
  return Number.isFinite(millis) ? millis : null;
}

function positiveInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) > 0;
}

function uniqueBy<T>(values: readonly T[], key: (value: T) => string): boolean {
  return new Set(values.map(key)).size === values.length;
}

function contiguousVersions<T>(
  values: readonly T[],
  id: (value: T) => string,
  version: (value: T) => number,
): boolean {
  const grouped = new Map<string, number[]>();
  for (const value of values) {
    const versions = grouped.get(id(value)) ?? [];
    versions.push(version(value));
    grouped.set(id(value), versions);
  }
  return [...grouped.values()].every((versions) =>
    versions.sort((left, right) => left - right)
      .every((entry, index) => entry === index + 1));
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const entry of Object.values(value as Record<string, unknown>)) deepFreeze(entry);
  }
  return value;
}

function freezeClone<T>(value: T): T {
  return deepFreeze(structuredClone(value));
}

function sortNodes(nodes: readonly GraphNode[]): GraphNode[] {
  return [...nodes].sort((left, right) =>
    left.node_id.localeCompare(right.node_id) || left.version - right.version);
}

function sortEdges(edges: readonly GraphEdge[]): GraphEdge[] {
  return [...edges].sort((left, right) =>
    left.edge_id.localeCompare(right.edge_id) || left.version - right.version);
}

function sortTombstones(values: readonly LifecycleTombstone[]): LifecycleTombstone[] {
  return [...values].sort((left, right) =>
    left.tombstone_id.localeCompare(right.tombstone_id));
}

function canonicalState(state: MemoryLifecycleState): MemoryLifecycleState {
  return {
    ...state,
    node_versions: sortNodes(state.node_versions),
    edge_versions: sortEdges(state.edge_versions),
    node_tombstones: sortTombstones(state.node_tombstones),
    edge_tombstones: sortTombstones(state.edge_tombstones),
    subject_tombstones: sortTombstones(state.subject_tombstones),
    revoked_consent_grant_ids: [...state.revoked_consent_grant_ids].sort(),
    deduplication_records: [...state.deduplication_records].sort((left, right) =>
      left.deduplication_key.localeCompare(right.deduplication_key)),
    evidence: [...state.evidence].sort((left, right) =>
      left.evidence_id.localeCompare(right.evidence_id)),
  };
}

export function createEmptyMemoryLifecycleState(): MemoryLifecycleState {
  return deepFreeze({
    schema: MEMORY_LIFECYCLE_STATE_SCHEMA,
    tenant_id: TENANT_ID,
    node_versions: [],
    edge_versions: [],
    node_tombstones: [],
    edge_tombstones: [],
    subject_tombstones: [],
    revoked_consent_grant_ids: [],
    active_deletion_capability: null,
    deduplication_records: [],
    evidence: [],
  });
}

function validTombstone(value: unknown): value is LifecycleTombstone {
  if (!exactKeys(value, TOMBSTONE_KEYS) ||
      !isOpaqueId(value.tombstone_id, "tombstone") ||
      (value.target_kind !== "node_version" &&
       value.target_kind !== "edge_version" &&
       value.target_kind !== "subject") ||
      typeof value.target_id !== "string" || value.target_id.length === 0 ||
      (value.target_version !== null && !positiveInteger(value.target_version)) ||
      !isOpaqueId(value.subject_id, "subject") ||
      (value.reason_code !== "commercial_unlink" &&
       value.reason_code !== "subject_deletion") ||
      utcMillis(value.effective_at) === null ||
      !isOpaqueId(value.command_id, "command")) return false;
  return true;
}

function validAcceptedResult(value: unknown): value is LifecycleAcceptedResult {
  return exactKeys(value, ACCEPTED_KEYS) &&
    value.schema === ACCEPTED_RESULT_SCHEMA &&
    isOpaqueId(value.command_id, "command") &&
    MEMORY_LIFECYCLE_COMMAND_KINDS.includes(
      value.command_kind as MemoryLifecycleCommandKind) &&
    typeof value.deduplication_key === "string" &&
    DEDUPE.test(value.deduplication_key) &&
    isDigest(value.command_digest) && isDigest(value.state_digest) &&
    isDigest(value.evidence_digest);
}

function validEvidence(value: unknown): value is LifecycleEvidenceRecord {
  return exactKeys(value, EVIDENCE_KEYS) &&
    value.schema === LIFECYCLE_EVIDENCE_SCHEMA &&
    isOpaqueId(value.evidence_id, "evidence") &&
    value.tenant_id === TENANT_ID &&
    isOpaqueId(value.subject_id, "subject") &&
    isOpaqueId(value.command_id, "command") &&
    MEMORY_LIFECYCLE_COMMAND_KINDS.includes(
      value.command_kind as MemoryLifecycleCommandKind) &&
    value.outcome === "accepted" && isDigest(value.command_digest) &&
    isDigest(value.material_digest) && utcMillis(value.occurred_at) !== null;
}

function capabilityFailure(value: unknown): MemoryLifecycleRefusalCode | null {
  if (!exactKeys(value, CAPABILITY_KEYS)) return "invalid_deletion_capability_shape";
  if (value.schema !== DELETION_CAPABILITY_SCHEMA) {
    return "invalid_deletion_capability_schema";
  }
  if (!isOpaqueId(value.capability_id, "capability") ||
      value.tenant_id !== TENANT_ID ||
      typeof value.provider_ref !== "string" ||
      !PROVIDER_REF.test(value.provider_ref) ||
      typeof value.contract_version !== "string" ||
      !VERSIONED.test(value.contract_version) ||
      utcMillis(value.verified_at) === null ||
      utcMillis(value.expires_at) === null ||
      utcMillis(value.verified_at)! >= utcMillis(value.expires_at)! ||
      !positiveInteger(value.maximum_completion_seconds)) {
    return "invalid_deletion_capability_shape";
  }
  if (value.primary_store_deletion !== "supported" ||
      value.backup_deletion !== "supported" ||
      (value.immutable_backup_disposition !== "cryptographic_erasure" &&
       value.immutable_backup_disposition !== "expiry_enforced") ||
      value.deletion_scope !== "subject_scoped" ||
      value.completion_semantics !== "deterministic_acknowledgement") {
    return "insufficient_deletion_capability";
  }
  return null;
}

export function validateDeletionCapability(
  value: unknown,
): Readonly<{ ok: true; value: DeletionCapability }> | LifecycleFailure {
  try {
    const problem = capabilityFailure(value);
    if (problem) return failure(problem);
    return { ok: true, value: freezeClone(value as DeletionCapability) };
  } catch {
    return failure("invalid_untrusted_input");
  }
}

function validateState(value: unknown): MemoryLifecycleState | LifecycleFailure {
  try {
    if (isPlainRecord(value) && value.tenant_id !== TENANT_ID) {
      return failure("invalid_tenant");
    }
    if (!exactKeys(value, STATE_KEYS) ||
        value.schema !== MEMORY_LIFECYCLE_STATE_SCHEMA ||
        !Array.isArray(value.node_versions) ||
        !Array.isArray(value.edge_versions) ||
        !Array.isArray(value.node_tombstones) ||
        !Array.isArray(value.edge_tombstones) ||
        !Array.isArray(value.subject_tombstones) ||
        !Array.isArray(value.revoked_consent_grant_ids) ||
        !Array.isArray(value.deduplication_records) ||
        !Array.isArray(value.evidence)) return failure("invalid_state_shape");
    for (const node of value.node_versions) {
      const checked = validateGraphNode(node);
      if (!checked.ok) return failure(checked.reason_code);
    }
    for (const edge of value.edge_versions) {
      const checked = validateGraphEdge(edge);
      if (!checked.ok) return failure(checked.reason_code);
    }
    const typedNodes = value.node_versions as GraphNode[];
    const typedEdges = value.edge_versions as GraphEdge[];
    if (!uniqueBy(typedNodes, (node) => node.node_id + ":" + node.version) ||
        !uniqueBy(typedEdges, (edge) => edge.edge_id + ":" + edge.version) ||
        !contiguousVersions(typedNodes, (node) => node.node_id,
          (node) => node.version) ||
        !contiguousVersions(typedEdges, (edge) => edge.edge_id,
          (edge) => edge.version)) {
      return failure("invalid_state_shape");
    }
    const allNodeIds = new Set(typedNodes.map((node) => node.node_id));
    if (typedEdges.some((edge) =>
      !allNodeIds.has(edge.from_node_id) || !allNodeIds.has(edge.to_node_id))) {
      return failure("edge_endpoint_missing");
    }
    if (!value.node_tombstones.every(validTombstone) ||
        !value.edge_tombstones.every(validTombstone) ||
        !value.subject_tombstones.every(validTombstone)) {
      return failure("invalid_state_shape");
    }
    const tombstones = [
      ...value.node_tombstones,
      ...value.edge_tombstones,
      ...value.subject_tombstones,
    ] as LifecycleTombstone[];
    if (!uniqueBy(tombstones, (entry) => entry.tombstone_id) ||
        (value.node_tombstones as LifecycleTombstone[]).some((entry) =>
          entry.target_kind !== "node_version") ||
        (value.edge_tombstones as LifecycleTombstone[]).some((entry) =>
          entry.target_kind !== "edge_version") ||
        (value.subject_tombstones as LifecycleTombstone[]).some((entry) =>
          entry.target_kind !== "subject")) {
      return failure("invalid_state_shape");
    }
    if (!value.revoked_consent_grant_ids.every((entry) =>
          isOpaqueId(entry, "consent")) ||
        new Set(value.revoked_consent_grant_ids).size !==
          value.revoked_consent_grant_ids.length) {
      return failure("invalid_state_shape");
    }
    if (value.active_deletion_capability !== null) {
      const problem = capabilityFailure(value.active_deletion_capability);
      if (problem) return failure(problem);
    }
    for (const record of value.deduplication_records) {
      if (!exactKeys(record, DEDUPE_KEYS) ||
          typeof record.deduplication_key !== "string" ||
          !DEDUPE.test(record.deduplication_key) ||
          !isDigest(record.command_digest) ||
          !validAcceptedResult(record.accepted_result) ||
          record.deduplication_key !== record.accepted_result.deduplication_key ||
          record.command_digest !== record.accepted_result.command_digest) {
        return failure("invalid_state_shape");
      }
    }
    if (!uniqueBy(value.deduplication_records as DeduplicationRecord[],
          (entry) => entry.deduplication_key) ||
        !value.evidence.every(validEvidence) ||
        !uniqueBy(value.evidence as LifecycleEvidenceRecord[],
          (entry) => entry.evidence_id)) {
      return failure("invalid_state_shape");
    }
    return freezeClone(value as MemoryLifecycleState);
  } catch {
    return failure("invalid_untrusted_input");
  }
}

function validateCommand(value: unknown): MemoryLifecycleCommand | LifecycleFailure {
  try {
    if (isPlainRecord(value) && value.tenant_id !== TENANT_ID) {
      return failure("invalid_tenant");
    }
    if (!isPlainRecord(value)) return failure("invalid_command_shape");
    if (typeof value.kind !== "string" ||
        !MEMORY_LIFECYCLE_COMMAND_KINDS.includes(
          value.kind as MemoryLifecycleCommandKind)) {
      return failure("invalid_command_kind");
    }
    const kind = value.kind as MemoryLifecycleCommandKind;
    if (!exactKeys(value, COMMAND_KEYS[kind])) return failure("invalid_command_shape");
    if (value.schema !== MEMORY_LIFECYCLE_COMMAND_SCHEMA) {
      return failure("invalid_command_schema");
    }
    if (!isOpaqueId(value.command_id, "command")) return failure("invalid_command_id");
    if (!isOpaqueId(value.subject_id, "subject") ||
        (value.project_id !== null && !isOpaqueId(value.project_id, "project")) ||
        !PURPOSES.includes(value.purpose as MemoryPurpose) ||
        !isOpaqueId(value.session_id, "session") ||
        value.audience !== RECEPTION_AUDIENCE ||
        !CHANNELS.includes(value.channel as ReceptionChannel) ||
        utcMillis(value.evaluated_at) === null) {
      return failure("invalid_command_shape");
    }
    if (typeof value.deduplication_key !== "string" ||
        !DEDUPE.test(value.deduplication_key)) {
      return failure("invalid_deduplication_key");
    }
    switch (kind) {
      case "append_mutation":
        if (!isPlainRecord(value.mutation)) return failure("invalid_command_shape");
        break;
      case "correct_assertion":
        if (!isOpaqueId(value.prior_node_id, "node") ||
            !positiveInteger(value.prior_node_version) ||
            !isPlainRecord(value.node_mutation) ||
            !isPlainRecord(value.edge_mutation) ||
            (value.human_approval !== null &&
             !isPlainRecord(value.human_approval))) {
          return failure("invalid_command_shape");
        }
        break;
      case "unlink_relationship":
        if (!isOpaqueId(value.edge_id, "edge") ||
            !positiveInteger(value.edge_version)) {
          return failure("invalid_command_shape");
        }
        break;
      case "revoke_consent":
        if (!isOpaqueId(value.consent_grant_id, "consent")) {
          return failure("invalid_command_shape");
        }
        break;
      case "delete_subject":
        if (!isOpaqueId(value.deletion_request_id, "deletion") ||
            !isOpaqueId(value.capability_id, "capability")) {
          return failure("invalid_command_shape");
        }
        break;
      case "activate_deletion_capability":
        if (!isPlainRecord(value.capability)) return failure("invalid_command_shape");
        break;
    }
    return freezeClone(value as MemoryLifecycleCommand);
  } catch {
    return failure("invalid_untrusted_input");
  }
}

function commandBindsMutation(
  command: CommandBase<MemoryLifecycleCommandKind>,
  mutation: ProposedMutation,
): boolean {
  return mutation.tenant_id === command.tenant_id &&
    mutation.subject_id === command.subject_id &&
    mutation.project_id === command.project_id &&
    mutation.purpose === command.purpose &&
    mutation.session_id === command.session_id &&
    mutation.audience === command.audience &&
    mutation.channel === command.channel &&
    mutation.proposed_at === command.evaluated_at &&
    mutation.deduplication_key === command.deduplication_key;
}

function currentNodes(state: MemoryLifecycleState): GraphNode[] {
  const latest = new Map<string, GraphNode>();
  for (const node of state.node_versions) {
    const prior = latest.get(node.node_id);
    if (!prior || node.version > prior.version) latest.set(node.node_id, node);
  }
  return [...latest.values()].filter((node) =>
    !state.node_tombstones.some((entry) =>
      entry.target_id === node.node_id && entry.target_version === node.version));
}

function currentEdges(state: MemoryLifecycleState): GraphEdge[] {
  const latest = new Map<string, GraphEdge>();
  for (const edge of state.edge_versions) {
    const prior = latest.get(edge.edge_id);
    if (!prior || edge.version > prior.version) latest.set(edge.edge_id, edge);
  }
  return [...latest.values()].filter((edge) =>
    !state.edge_tombstones.some((entry) =>
      entry.target_id === edge.edge_id && entry.target_version === edge.version));
}

function subjectRoots(state: MemoryLifecycleState, subjectId: string): GraphNode[] {
  return currentNodes(state).filter((node) =>
    node.kind === "subject" && node.payload.subject_id === subjectId);
}

function scopedGraph(
  state: MemoryLifecycleState,
  subjectId: string,
  projectId: string | null,
): { nodes: GraphNode[]; edges: GraphEdge[] } | LifecycleFailure {
  const roots = subjectRoots(state, subjectId);
  if (roots.length === 0) return failure("subject_missing");
  if (roots.length !== 1) return failure("subject_ambiguous");
  const nodes = currentNodes(state);
  const nodeById = new Map(nodes.map((node) => [node.node_id, node]));
  const edges = currentEdges(state);
  const blockedShared = new Set<string>();
  for (const edge of edges) {
    const left = nodeById.get(edge.from_node_id);
    const right = nodeById.get(edge.to_node_id);
    if (left?.kind === "subject" && left.payload.subject_id !== subjectId) {
      blockedShared.add(edge.to_node_id);
    }
    if (right?.kind === "subject" && right.payload.subject_id !== subjectId) {
      blockedShared.add(edge.from_node_id);
    }
  }
  const visited = new Set<string>([roots[0].node_id]);
  const queue = [roots[0].node_id];
  while (queue.length > 0) {
    const cursor = queue.shift()!;
    for (const edge of edges) {
      let next: string | null = null;
      if (edge.from_node_id === cursor) next = edge.to_node_id;
      if (edge.to_node_id === cursor) next = edge.from_node_id;
      if (!next || visited.has(next) || blockedShared.has(next)) continue;
      const node = nodeById.get(next);
      if (!node) continue;
      if (node.kind === "subject" && node.payload.subject_id !== subjectId) continue;
      visited.add(next);
      queue.push(next);
    }
  }
  if (projectId !== null) {
    const matches = nodes.filter((node) =>
      node.kind === "project" && node.payload.project_id === projectId);
    if (matches.length !== 1 || !visited.has(matches[0].node_id)) {
      return failure("project_out_of_scope");
    }
  }
  return {
    nodes: sortNodes(nodes.filter((node) => visited.has(node.node_id))),
    edges: sortEdges(edges.filter((edge) =>
      visited.has(edge.from_node_id) && visited.has(edge.to_node_id))),
  };
}

function technicalProjection(state: MemoryLifecycleState): unknown {
  return {
    nodes: sortNodes(state.node_versions.filter((node) =>
      TECHNICAL_NODE_KINDS.has(node.kind))),
    edges: sortEdges(state.edge_versions.filter((edge) =>
      TECHNICAL_EDGE_KINDS.has(edge.kind))),
  };
}

function stateDigestProjection(state: MemoryLifecycleState): unknown {
  return {
    schema: state.schema,
    tenant_id: state.tenant_id,
    node_versions: sortNodes(state.node_versions),
    edge_versions: sortEdges(state.edge_versions),
    node_tombstones: sortTombstones(state.node_tombstones),
    edge_tombstones: sortTombstones(state.edge_tombstones),
    subject_tombstones: sortTombstones(state.subject_tombstones),
    revoked_consent_grant_ids: [...state.revoked_consent_grant_ids].sort(),
    active_deletion_capability: state.active_deletion_capability,
    evidence: [...state.evidence].sort((left, right) =>
      left.evidence_id.localeCompare(right.evidence_id)),
  };
}

export async function computeMemoryLifecycleStateDigest(
  value: unknown,
): Promise<string | null> {
  try {
    const state = validateState(value);
    if ("ok" in state) return null;
    return computeDigest(stateDigestProjection(state));
  } catch {
    return null;
  }
}

function appendMutation(
  state: MemoryLifecycleState,
  mutation: ProposedMutation,
): MemoryLifecycleState | LifecycleFailure {
  if (mutation.operation === "append_node") {
    const versions = state.node_versions.filter((node) =>
      node.node_id === mutation.node.node_id);
    const expected = versions.length === 0 ? 1 :
      Math.max(...versions.map((node) => node.version)) + 1;
    if (mutation.node.version !== expected) return failure("node_version_conflict");
    if (state.node_tombstones.some((entry) =>
      entry.target_id === mutation.node.node_id)) return failure("node_tombstoned");
    if (mutation.node.kind === "technical_artifact_ref" && versions.length > 0) {
      const prior = versions[versions.length - 1];
      if (prior.kind !== "technical_artifact_ref" ||
          canonicalDigestInput(prior.payload) !==
            canonicalDigestInput(mutation.node.payload)) {
        return failure("technical_material_changed");
      }
    }
    return { ...state, node_versions: [...state.node_versions, mutation.node] };
  }
  const versions = state.edge_versions.filter((edge) =>
    edge.edge_id === mutation.edge.edge_id);
  const expected = versions.length === 0 ? 1 :
    Math.max(...versions.map((edge) => edge.version)) + 1;
  if (mutation.edge.version !== expected) return failure("edge_version_conflict");
  if (state.edge_tombstones.some((entry) =>
    entry.target_id === mutation.edge.edge_id)) return failure("edge_tombstoned");
  const nodes = currentNodes(state);
  if (!nodes.some((node) => node.node_id === mutation.edge.from_node_id) ||
      !nodes.some((node) => node.node_id === mutation.edge.to_node_id)) {
    return failure("edge_endpoint_missing");
  }
  if (TECHNICAL_EDGE_KINDS.has(mutation.edge.kind) && versions.length > 0) {
    const prior = versions[versions.length - 1];
    if (canonicalDigestInput(prior) !== canonicalDigestInput(mutation.edge)) {
      return failure("technical_material_changed");
    }
  }
  return { ...state, edge_versions: [...state.edge_versions, mutation.edge] };
}

function truthClass(node: GraphNode): TruthClass | null {
  if (node.kind === "fact_assertion" || node.kind === "interaction_summary") {
    return node.payload.truth_class;
  }
  return null;
}

async function validateApproval(
  approval: unknown,
  command: CorrectAssertionCommand,
  prior: GraphNode,
  proposed: GraphNode,
): Promise<LifecycleFailure | null> {
  const priorTruth = truthClass(prior);
  const proposedTruth = truthClass(proposed);
  const authoritative = proposedTruth === "verified" && priorTruth !== "verified";
  const staleOrDisputedUpgrade =
    (priorTruth === "stale" || priorTruth === "disputed") &&
    proposedTruth !== "stale" && proposedTruth !== "disputed";
  const sensitive = proposed.retention_class === "policy_controlled";
  if (!authoritative && !staleOrDisputedUpgrade && !sensitive) return null;
  if (approval === null) return failure("human_approval_required");
  if (!exactKeys(approval, APPROVAL_KEYS)) {
    return failure("invalid_human_approval_shape");
  }
  if (approval.schema !== HUMAN_APPROVAL_SCHEMA) {
    return failure("invalid_human_approval_schema");
  }
  if (!isOpaqueId(approval.approval_id, "approval") ||
      approval.tenant_id !== command.tenant_id ||
      approval.subject_id !== command.subject_id ||
      approval.project_id !== command.project_id ||
      approval.purpose !== command.purpose ||
      approval.session_id !== command.session_id ||
      approval.target_node_id !== proposed.node_id ||
      approval.decision !== "approved" ||
      approval.approver_role !== "human_owner" ||
      approval.approved_at !== command.evaluated_at ||
      (approval.approval_kind !== "authoritative_truth_upgrade" &&
       approval.approval_kind !== "sensitive_truth_upgrade")) {
    return failure("human_approval_binding_mismatch");
  }
  if (sensitive && approval.approval_kind !== "sensitive_truth_upgrade") {
    return failure("truth_upgrade_not_authorized");
  }
  if (approval.proposed_material_digest !== await computeDigest(proposed)) {
    return failure("human_approval_material_mismatch");
  }
  return null;
}

function makeTombstone(
  command: MemoryLifecycleCommand,
  suffix: string,
  targetKind: LifecycleTombstone["target_kind"],
  targetId: string,
  targetVersion: number | null,
  reasonCode: LifecycleTombstone["reason_code"],
): LifecycleTombstone {
  return {
    tombstone_id: "tombstone_" + suffix,
    target_kind: targetKind,
    target_id: targetId,
    target_version: targetVersion,
    subject_id: command.subject_id,
    reason_code: reasonCode,
    effective_at: command.evaluated_at,
    command_id: command.command_id,
  };
}

async function applyCommandMaterial(
  state: MemoryLifecycleState,
  command: MemoryLifecycleCommand,
  identity: unknown,
  consent: unknown,
  commandDigest: string,
): Promise<MemoryLifecycleState | LifecycleFailure> {
  switch (command.kind) {
    case "append_mutation": {
      const checked = validateProposedMutation(command.mutation, identity, consent);
      if (!checked.ok) return failure(checked.reason_code);
      if (!commandBindsMutation(command, checked.value)) {
        return failure("command_binding_mismatch");
      }
      return appendMutation(state, checked.value);
    }
    case "correct_assertion": {
      const nodeChecked = validateProposedMutation(
        command.node_mutation, identity, consent);
      if (!nodeChecked.ok) return failure(nodeChecked.reason_code);
      const edgeChecked = validateProposedMutation(
        command.edge_mutation, identity, consent);
      if (!edgeChecked.ok) return failure(edgeChecked.reason_code);
      if (!commandBindsMutation(command, nodeChecked.value) ||
          !commandBindsMutation(command, edgeChecked.value)) {
        return failure("command_binding_mismatch");
      }
      if (nodeChecked.value.operation !== "append_node" ||
          edgeChecked.value.operation !== "append_edge") {
        return failure("correction_relation_invalid");
      }
      const matches = state.node_versions.filter((node) =>
        node.node_id === command.prior_node_id &&
        node.version === command.prior_node_version);
      if (matches.length === 0) return failure("correction_target_missing");
      if (matches.length !== 1) return failure("correction_target_ambiguous");
      const prior = matches[0];
      const proposed = nodeChecked.value.node;
      if ((prior.kind !== "fact_assertion" &&
           prior.kind !== "interaction_summary") ||
          proposed.kind !== prior.kind ||
          proposed.node_id === prior.node_id) {
        return failure("correction_target_ineligible");
      }
      const relation = edgeChecked.value.edge;
      if (relation.kind !== "supersedes" ||
          relation.from_node_id !== proposed.node_id ||
          relation.to_node_id !== prior.node_id) {
        return failure("correction_relation_invalid");
      }
      const approvalFailure = await validateApproval(
        command.human_approval, command, prior, proposed);
      if (approvalFailure) return approvalFailure;
      const withNode = appendMutation(state, nodeChecked.value);
      if ("ok" in withNode) return withNode;
      return appendMutation(withNode, edgeChecked.value);
    }
    case "unlink_relationship": {
      const before = await computeDigest(technicalProjection(state));
      const matches = state.edge_versions.filter((edge) =>
        edge.edge_id === command.edge_id && edge.version === command.edge_version);
      if (matches.length === 0) return failure("relationship_missing");
      const edge = matches[0];
      if (!COMMERCIAL_RELATIONSHIPS.has(edge.kind)) {
        return failure("relationship_not_commercial");
      }
      if (state.edge_tombstones.some((entry) =>
        entry.target_id === edge.edge_id &&
        entry.target_version === edge.version)) {
        return failure("relationship_already_unlinked");
      }
      const scope = scopedGraph(state, command.subject_id, command.project_id);
      if ("ok" in scope) return scope;
      if (!scope.edges.some((entry) =>
        entry.edge_id === edge.edge_id && entry.version === edge.version)) {
        return failure("relationship_out_of_scope");
      }
      const suffix = commandDigest.slice(7, 23);
      const next = {
        ...state,
        edge_tombstones: [
          ...state.edge_tombstones,
          makeTombstone(command, suffix, "edge_version", edge.edge_id,
            edge.version, "commercial_unlink"),
        ],
      };
      return before === await computeDigest(technicalProjection(next))
        ? next : failure("technical_material_changed");
    }
    case "revoke_consent": {
      if (state.revoked_consent_grant_ids.includes(command.consent_grant_id)) {
        return failure("consent_already_revoked");
      }
      const matches = currentNodes(state).filter((node) =>
        node.kind === "consent_grant" &&
        node.payload.consent_grant_id === command.consent_grant_id);
      if (matches.length !== 1) return failure("consent_grant_missing");
      const scope = scopedGraph(state, command.subject_id, command.project_id);
      if ("ok" in scope) return scope;
      if (!scope.nodes.some((node) => node.node_id === matches[0].node_id)) {
        return failure("command_binding_mismatch");
      }
      return {
        ...state,
        revoked_consent_grant_ids: [
          ...state.revoked_consent_grant_ids, command.consent_grant_id,
        ],
      };
    }
    case "activate_deletion_capability": {
      const checked = validateDeletionCapability(command.capability);
      if (!checked.ok) return checked;
      const evaluated = utcMillis(command.evaluated_at)!;
      if (evaluated < utcMillis(checked.value.verified_at)! ||
          evaluated >= utcMillis(checked.value.expires_at)!) {
        return failure("deletion_capability_expired");
      }
      if (state.active_deletion_capability &&
          state.active_deletion_capability.capability_id !==
            checked.value.capability_id) {
        return failure("ambiguous_deletion_capability");
      }
      return { ...state, active_deletion_capability: checked.value };
    }
    case "delete_subject": {
      if (state.subject_tombstones.some((entry) =>
        entry.subject_id === command.subject_id)) return failure("subject_deleted");
      const capability = state.active_deletion_capability;
      if (!capability) return failure("deletion_capability_missing");
      if (capability.capability_id !== command.capability_id) {
        return failure("deletion_capability_mismatch");
      }
      if (utcMillis(command.evaluated_at)! >= utcMillis(capability.expires_at)!) {
        return failure("deletion_capability_expired");
      }
      const scope = scopedGraph(state, command.subject_id, command.project_id);
      if ("ok" in scope) return scope;
      const before = await computeDigest(technicalProjection(state));
      const suffix = commandDigest.slice(7, 23);
      const nodeTombstones = scope.nodes
        .filter((node) => !TECHNICAL_NODE_KINDS.has(node.kind))
        .map((node, index) => makeTombstone(
          command,
          suffix.slice(0, 12) + index.toString(16).padStart(4, "0"),
          "node_version", node.node_id, node.version, "subject_deletion"));
      const edgeTombstones = scope.edges
        .filter((edge) => COMMERCIAL_RELATIONSHIPS.has(edge.kind))
        .map((edge, index) => makeTombstone(
          command,
          suffix.slice(0, 12) + (index + 4096).toString(16).padStart(4, "0"),
          "edge_version", edge.edge_id, edge.version, "subject_deletion"));
      const next: MemoryLifecycleState = {
        ...state,
        node_tombstones: [...state.node_tombstones, ...nodeTombstones],
        edge_tombstones: [...state.edge_tombstones, ...edgeTombstones],
        subject_tombstones: [
          ...state.subject_tombstones,
          makeTombstone(command, suffix.slice(0, 12) + "ffff", "subject",
            command.subject_id, null, "subject_deletion"),
        ],
      };
      return before === await computeDigest(technicalProjection(next))
        ? next : failure("technical_material_changed");
    }
  }
}

async function finalizeAccepted(
  state: MemoryLifecycleState,
  command: MemoryLifecycleCommand,
  commandDigest: string,
): Promise<LifecycleSuccess> {
  const materialDigest = await computeDigest({
    node_versions: state.node_versions,
    edge_versions: state.edge_versions,
    node_tombstones: state.node_tombstones,
    edge_tombstones: state.edge_tombstones,
    subject_tombstones: state.subject_tombstones,
    revoked_consent_grant_ids: state.revoked_consent_grant_ids,
    active_deletion_capability: state.active_deletion_capability,
  });
  const evidence: LifecycleEvidenceRecord = {
    schema: LIFECYCLE_EVIDENCE_SCHEMA,
    evidence_id: "evidence_" + commandDigest.slice(7, 23),
    tenant_id: TENANT_ID,
    subject_id: command.subject_id,
    command_id: command.command_id,
    command_kind: command.kind,
    outcome: "accepted",
    command_digest: commandDigest,
    material_digest: materialDigest,
    occurred_at: command.evaluated_at,
  };
  const evidenceDigest = await computeDigest(evidence);
  const withEvidence = canonicalState({
    ...state,
    evidence: [...state.evidence, evidence],
  });
  const stateDigest = await computeDigest(stateDigestProjection(withEvidence));
  const acceptedResult: LifecycleAcceptedResult = {
    schema: ACCEPTED_RESULT_SCHEMA,
    command_id: command.command_id,
    command_kind: command.kind,
    deduplication_key: command.deduplication_key,
    command_digest: commandDigest,
    state_digest: stateDigest,
    evidence_digest: evidenceDigest,
  };
  const finalState = canonicalState({
    ...withEvidence,
    deduplication_records: [
      ...withEvidence.deduplication_records,
      {
        deduplication_key: command.deduplication_key,
        command_digest: commandDigest,
        accepted_result: acceptedResult,
      },
    ],
  });
  return deepFreeze({
    ok: true,
    state: freezeClone(finalState),
    accepted_result: freezeClone(acceptedResult),
  });
}

export async function executeMemoryLifecycleCommand(
  stateValue: unknown,
  commandValue: unknown,
  identity: unknown = null,
  consent: unknown = null,
): Promise<LifecycleResult> {
  try {
    const checkedState = validateState(stateValue);
    if ("ok" in checkedState) return checkedState;
    const checkedCommand = validateCommand(commandValue);
    if ("ok" in checkedCommand) return checkedCommand;
    const commandDigest = await computeDigest(checkedCommand);
    const prior = checkedState.deduplication_records.find((entry) =>
      entry.deduplication_key === checkedCommand.deduplication_key);
    if (prior) {
      if (prior.command_digest !== commandDigest) {
        return failure("deduplication_conflict");
      }
      return deepFreeze({
        ok: true,
        state: freezeClone(checkedState),
        accepted_result: freezeClone(prior.accepted_result),
      });
    }
    const next = await applyCommandMaterial(
      checkedState, checkedCommand, identity, consent, commandDigest);
    if ("ok" in next) return next;
    return finalizeAccepted(next, checkedCommand, commandDigest);
  } catch {
    return failure("invalid_untrusted_input");
  }
}

function retrievalFailure(
  state: MemoryLifecycleState,
  request: unknown,
  consent: unknown,
): LifecycleFailure | null {
  if (isPlainRecord(request) && request.tenant_id !== TENANT_ID) {
    return failure("invalid_tenant");
  }
  if (!exactKeys(request, RETRIEVAL_KEYS) ||
      !isOpaqueId(request.subject_id, "subject") ||
      (request.project_id !== null && !isOpaqueId(request.project_id, "project")) ||
      !PURPOSES.includes(request.purpose as MemoryPurpose) ||
      !isOpaqueId(request.session_id, "session") ||
      request.audience !== RECEPTION_AUDIENCE ||
      !CHANNELS.includes(request.channel as ReceptionChannel) ||
      !isOpaqueId(request.consent_grant_id, "consent") ||
      utcMillis(request.evaluated_at) === null) {
    return failure("invalid_retrieval_request_shape");
  }
  const typed = request as RetrievalGateRequest;
  if (state.subject_tombstones.some((entry) =>
    entry.subject_id === typed.subject_id)) return failure("subject_deleted");
  if (state.revoked_consent_grant_ids.includes(typed.consent_grant_id)) {
    return failure("consent_revoked");
  }
  const checked = validateMemoryConsentGrant(consent, {
    tenant_id: typed.tenant_id,
    subject_id: typed.subject_id,
    purpose: typed.purpose,
    channel: typed.channel,
    operation: "read_context",
    data_classes: [],
    evaluated_at: typed.evaluated_at,
  });
  if (!checked.ok) return failure(checked.reason_code);
  if (checked.value.consent_grant_id !== typed.consent_grant_id ||
      checked.value.subject_id !== typed.subject_id ||
      checked.value.purpose !== typed.purpose) {
    return failure("retrieval_consent_mismatch");
  }
  return null;
}

export function authorizeMemoryRetrieval(
  stateValue: unknown,
  request: unknown,
  consent: unknown,
): Readonly<{ ok: true }> | LifecycleFailure {
  try {
    const checkedState = validateState(stateValue);
    if ("ok" in checkedState) return checkedState;
    return retrievalFailure(checkedState, request, consent) ??
      deepFreeze({ ok: true });
  } catch {
    return failure("invalid_untrusted_input");
  }
}

export async function exportSubjectMemory(
  stateValue: unknown,
  requestValue: unknown,
  consent: unknown,
): Promise<Readonly<{ ok: true; value: SubjectExport }> | LifecycleFailure> {
  try {
    const checkedState = validateState(stateValue);
    if ("ok" in checkedState) return checkedState;
    const gate = retrievalFailure(checkedState, requestValue, consent);
    if (gate) return gate;
    const request = requestValue as RetrievalGateRequest;
    const graph = scopedGraph(checkedState, request.subject_id, request.project_id);
    if ("ok" in graph) return graph;
    const stateDigest = await computeDigest(stateDigestProjection(checkedState));
    const withoutDigest = {
      schema: SUBJECT_EXPORT_SCHEMA,
      tenant_id: TENANT_ID,
      subject_id: request.subject_id,
      project_id: request.project_id,
      purpose: request.purpose,
      session_id: request.session_id,
      exported_at: request.evaluated_at,
      nodes: graph.nodes,
      edges: graph.edges,
      state_digest: stateDigest,
    };
    const result: SubjectExport = {
      ...withoutDigest,
      export_digest: await computeDigest(withoutDigest),
    };
    if (!exactKeys(result, EXPORT_KEYS)) return failure("invalid_export_request_shape");
    return { ok: true, value: freezeClone(result) };
  } catch {
    return failure("invalid_untrusted_input");
  }
}
