import {
  canonicalDigestInput,
  computeDigest,
  isUtcTimestamp,
} from "../studio/modelContract";

export const RECEPTION_MEMORY_CONTRACT_VERSION =
  "reception-memory-contract/1.0.0" as const;
export const TENANT_ID = "tenant_west_coast_kbp_adu" as const;
export const RECEPTION_AUDIENCE = "west_coast_kbp_reception" as const;

export const IDENTITY_ASSERTION_SCHEMA =
  "reception-identity-assertion/1" as const;
export const MEMORY_CONSENT_GRANT_SCHEMA = "memory-consent-grant/1" as const;
export const GRAPH_NODE_SCHEMA = "memory-graph-node/1" as const;
export const GRAPH_EDGE_SCHEMA = "memory-graph-edge/1" as const;
export const CONTEXT_PACKET_SCHEMA = "memory-context-packet/1" as const;
export const MUTATION_PROPOSAL_SCHEMA = "memory-mutation-proposal/1" as const;

export const IDENTITY_ASSERTION_MAX_TTL_SECONDS = 300;
export const CONTEXT_PACKET_MAX_TTL_SECONDS = 120;
export const CONTEXT_PACKET_MAX_NODES = 32;
export const CONTEXT_PACKET_MAX_EDGES = 64;
export const CONTEXT_PACKET_MAX_BYTES = 65_536;

export const RECEPTION_STATES = Object.freeze([
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
] as const);

export type ReceptionState = (typeof RECEPTION_STATES)[number];

export const TERMINAL_RECEPTION_STATES = Object.freeze([
  "escalated",
  "ended",
  "refused",
] as const satisfies readonly ReceptionState[]);

export const PERMITTED_RECEPTION_TRANSITIONS = Object.freeze([
  ["anonymous", "disclosed"],
  ["anonymous", "ended"],
  ["anonymous", "refused"],
  ["disclosed", "consent_candidate"],
  ["disclosed", "ended"],
  ["disclosed", "refused"],
  ["consent_candidate", "identity_candidate"],
  ["consent_candidate", "ended"],
  ["consent_candidate", "refused"],
  ["identity_candidate", "identity_verified"],
  ["identity_candidate", "escalated"],
  ["identity_candidate", "ended"],
  ["identity_candidate", "refused"],
  ["identity_verified", "context_scoped"],
  ["identity_verified", "escalated"],
  ["identity_verified", "ended"],
  ["identity_verified", "refused"],
  ["context_scoped", "active"],
  ["context_scoped", "escalated"],
  ["context_scoped", "ended"],
  ["context_scoped", "refused"],
  ["active", "escalated"],
  ["active", "ended"],
  ["active", "refused"],
] as const satisfies readonly (readonly [ReceptionState, ReceptionState])[]);

export const LOCALES = Object.freeze(["en", "es", "ru"] as const);
export const RECEPTION_CHANNELS = Object.freeze([
  "web_text",
  "web_voice",
  "phone",
] as const);
export const MEMORY_PURPOSES = Object.freeze([
  "current_session_service",
  "returning_customer_continuity",
  "project_continuity",
] as const);
export const MEMORY_OPERATIONS = Object.freeze([
  "read_context",
  "propose_append_node",
  "propose_append_edge",
] as const);
export const MEMORY_DATA_CLASSES = Object.freeze([
  "identity_reference",
  "contact_channel",
  "consent",
  "property_reference",
  "lead_journey",
  "project",
  "technical_artifact_reference",
  "interaction_summary",
  "fact_assertion",
  "authorization",
  "retention",
  "evidence_reference",
] as const);

export type Locale = (typeof LOCALES)[number];
export type ReceptionChannel = (typeof RECEPTION_CHANNELS)[number];
export type MemoryPurpose = (typeof MEMORY_PURPOSES)[number];
export type MemoryOperation = (typeof MEMORY_OPERATIONS)[number];
export type MemoryDataClass = (typeof MEMORY_DATA_CLASSES)[number];

export const GRAPH_NODE_KINDS = Object.freeze([
  "subject",
  "contact_channel",
  "consent_grant",
  "property",
  "lead_journey",
  "project",
  "technical_artifact_ref",
  "interaction_summary",
  "fact_assertion",
  "authorization_grant",
  "retention_directive",
  "evidence_ref",
] as const);

export const GRAPH_EDGE_KINDS = Object.freeze([
  "owns_contact",
  "consented_for",
  "associated_with_property",
  "participates_in_project",
  "continues_journey",
  "references_artifact",
  "summarized_from",
  "asserted_by",
  "verified_by",
  "supersedes",
  "disputes",
  "authorized_for",
  "retained_under",
  "evidenced_by",
] as const);

export const TRUTH_CLASSES = Object.freeze([
  "customer_stated",
  "source_observed",
  "verified",
  "inferred",
  "disputed",
  "stale",
  "unknown",
] as const);

export const RETENTION_CLASSES = Object.freeze([
  "session",
  "consented_short",
  "project_active",
  "policy_controlled",
] as const);

export const DISCLOSURE_CLASSES = Object.freeze([
  "public",
  "customer",
  "project_sensitive",
] as const);

export type GraphNodeKind = (typeof GRAPH_NODE_KINDS)[number];
export type GraphEdgeKind = (typeof GRAPH_EDGE_KINDS)[number];
export type TruthClass = (typeof TRUTH_CLASSES)[number];
export type RetentionClass = (typeof RETENTION_CLASSES)[number];
export type DisclosureClass = (typeof DISCLOSURE_CLASSES)[number];

export const REFUSAL_CODES = Object.freeze([
  "invalid_untrusted_input",
  "invalid_transition_shape",
  "invalid_reception_state",
  "terminal_state_transition_forbidden",
  "illegal_reception_transition",
  "invalid_binding_shape",
  "invalid_identity_shape",
  "invalid_identity_schema",
  "invalid_identity_id",
  "invalid_tenant",
  "invalid_subject_id",
  "invalid_session_id",
  "invalid_audience",
  "invalid_assurance_class",
  "invalid_nonce",
  "invalid_verifier_version",
  "invalid_timestamp",
  "invalid_time_window",
  "identity_ttl_exceeded",
  "identity_not_yet_valid",
  "identity_expired",
  "audience_mismatch",
  "session_mismatch",
  "subject_mismatch",
  "invalid_consent_shape",
  "invalid_consent_schema",
  "invalid_consent_id",
  "invalid_purpose",
  "invalid_channel",
  "invalid_operation",
  "invalid_data_class",
  "invalid_policy_version",
  "invalid_canonical_order",
  "duplicate_array_value",
  "consent_not_yet_valid",
  "consent_expired",
  "consent_revoked",
  "purpose_mismatch",
  "channel_not_consented",
  "operation_not_consented",
  "data_class_not_consented",
  "invalid_node_shape",
  "invalid_node_schema",
  "invalid_node_id",
  "invalid_node_kind",
  "invalid_node_version",
  "invalid_retention_class",
  "invalid_node_payload",
  "invalid_edge_shape",
  "invalid_edge_schema",
  "invalid_edge_id",
  "invalid_edge_kind",
  "invalid_edge_version",
  "invalid_edge_endpoint",
  "invalid_edge_validity",
  "invalid_deletion_behavior",
  "invalid_packet_shape",
  "invalid_packet_schema",
  "invalid_packet_id",
  "invalid_locale",
  "invalid_disclosure_class",
  "invalid_digest",
  "digest_mismatch",
  "packet_ttl_exceeded",
  "packet_not_yet_valid",
  "packet_expired",
  "packet_outlives_identity",
  "packet_outlives_consent",
  "packet_binding_mismatch",
  "packet_too_large",
  "packet_node_limit_exceeded",
  "packet_edge_limit_exceeded",
  "duplicate_node_id",
  "duplicate_edge_id",
  "edge_endpoint_not_disclosed",
  "invalid_provenance_ref",
  "invalid_exclusion_code",
  "invalid_mutation_shape",
  "invalid_mutation_schema",
  "invalid_mutation_id",
  "unsupported_mutation_operation",
  "invalid_deduplication_key",
  "mutation_binding_mismatch",
  "cross_tenant_reference",
] as const);

export type RefusalCode = (typeof REFUSAL_CODES)[number];
export type ContractFailure = Readonly<{
  ok: false;
  reason_code: RefusalCode;
}>;
export type ContractSuccess<T> = Readonly<{ ok: true; value: T }>;
export type ContractResult<T> = ContractSuccess<T> | ContractFailure;

export type ReceptionTransition = Readonly<{
  from_state: ReceptionState;
  to_state: ReceptionState;
}>;

export type IdentityAssertion = Readonly<{
  schema: typeof IDENTITY_ASSERTION_SCHEMA;
  assertion_id: string;
  tenant_id: typeof TENANT_ID;
  subject_id: string;
  audience: typeof RECEPTION_AUDIENCE;
  session_id: string;
  assurance_class: "verified_contact_control" | "verified_project_participant";
  issued_at: string;
  expires_at: string;
  nonce: string;
  verifier_version: string;
}>;

export type IdentityAssertionBinding = Readonly<{
  tenant_id: typeof TENANT_ID;
  audience: typeof RECEPTION_AUDIENCE;
  session_id: string;
  evaluated_at: string;
}>;

export type MemoryConsentGrant = Readonly<{
  schema: typeof MEMORY_CONSENT_GRANT_SCHEMA;
  consent_grant_id: string;
  tenant_id: typeof TENANT_ID;
  subject_id: string;
  purpose: MemoryPurpose;
  data_classes: readonly MemoryDataClass[];
  operations: readonly MemoryOperation[];
  channels: readonly ReceptionChannel[];
  policy_version: string;
  granted_at: string;
  expires_at: string;
  revoked_at: string | null;
}>;

export type ConsentUseBinding = Readonly<{
  tenant_id: typeof TENANT_ID;
  subject_id: string;
  purpose: MemoryPurpose;
  channel: ReceptionChannel;
  operation: MemoryOperation;
  data_classes: readonly MemoryDataClass[];
  evaluated_at: string;
}>;

type BaseGraphNode<K extends GraphNodeKind, P> = Readonly<{
  schema: typeof GRAPH_NODE_SCHEMA;
  node_id: string;
  tenant_id: typeof TENANT_ID;
  kind: K;
  version: number;
  created_at: string;
  retention_class: RetentionClass;
  payload: Readonly<P>;
}>;

export type SubjectNode = BaseGraphNode<
  "subject",
  { subject_id: string; identity_vault_ref: string }
>;
export type ContactChannelNode = BaseGraphNode<
  "contact_channel",
  {
    channel_ref: string;
    channel_kind: "email" | "phone";
    verification_state: "unverified" | "verified";
  }
>;
export type ConsentGrantNode = BaseGraphNode<
  "consent_grant",
  { consent_grant_id: string; purpose: MemoryPurpose }
>;
export type PropertyNode = BaseGraphNode<
  "property",
  { property_ref: string }
>;
export type LeadJourneyNode = BaseGraphNode<
  "lead_journey",
  { journey_id: string }
>;
export type ProjectNode = BaseGraphNode<
  "project",
  {
    project_id: string;
    project_state: "candidate" | "active" | "paused" | "closed";
  }
>;
export type TechnicalArtifactRefNode = BaseGraphNode<
  "technical_artifact_ref",
  {
    artifact_id: string;
    artifact_schema: string;
    artifact_digest: string;
    release: string;
    custody_ref: string;
  }
>;
export type InteractionSummaryNode = BaseGraphNode<
  "interaction_summary",
  {
    summary_code: string;
    truth_class: TruthClass;
    source_event_refs: readonly string[];
  }
>;
export type FactAssertionNode = BaseGraphNode<
  "fact_assertion",
  {
    fact_code: string;
    value_code: string;
    truth_class: TruthClass;
    provenance_refs: readonly string[];
    observed_at: string;
    verified_at: string | null;
    expires_at: string | null;
    dispute_state: "none" | "disputed" | "resolved";
  }
>;
export type AuthorizationGrantNode = BaseGraphNode<
  "authorization_grant",
  {
    authorization_grant_id: string;
    subject_id: string;
    session_id: string;
    purpose: MemoryPurpose;
    operations: readonly MemoryOperation[];
    node_kinds: readonly GraphNodeKind[];
    expires_at: string;
  }
>;
export type RetentionDirectiveNode = BaseGraphNode<
  "retention_directive",
  {
    retention_directive_id: string;
    retention_class: RetentionClass;
    legal_hold_state: "not_authorized" | "separately_authorized";
    deletion_status: "not_requested" | "blocked" | "queued" | "completed";
    export_status: "not_requested" | "blocked" | "queued" | "completed";
  }
>;
export type EvidenceRefNode = BaseGraphNode<
  "evidence_ref",
  {
    evidence_ref: string;
    evidence_digest: string;
    evidence_kind: "product_2_sanitized" | "deedseal_sanitized";
  }
>;

export type GraphNode =
  | SubjectNode
  | ContactChannelNode
  | ConsentGrantNode
  | PropertyNode
  | LeadJourneyNode
  | ProjectNode
  | TechnicalArtifactRefNode
  | InteractionSummaryNode
  | FactAssertionNode
  | AuthorizationGrantNode
  | RetentionDirectiveNode
  | EvidenceRefNode;

type EdgeOfKind<K extends GraphEdgeKind> = Readonly<{
  schema: typeof GRAPH_EDGE_SCHEMA;
  edge_id: string;
  tenant_id: typeof TENANT_ID;
  kind: K;
  from_node_id: string;
  to_node_id: string;
  version: number;
  created_at: string;
  valid_from: string;
  valid_until: string | null;
  source_ref: string;
  policy_label: string;
  deletion_behavior:
    | "remove_relationship"
    | "tombstone_relationship"
    | "retain_sanitized_reference";
}>;

export type GraphEdge = {
  [K in GraphEdgeKind]: EdgeOfKind<K>;
}[GraphEdgeKind];

export type ContextPacket = Readonly<{
  schema: typeof CONTEXT_PACKET_SCHEMA;
  packet_id: string;
  tenant_id: typeof TENANT_ID;
  subject_id: string;
  project_id: string | null;
  purpose: MemoryPurpose;
  session_id: string;
  audience: typeof RECEPTION_AUDIENCE;
  locale: Locale;
  channel: ReceptionChannel;
  policy_version: string;
  consent_grant_id: string;
  identity_assertion_id: string;
  issued_at: string;
  expires_at: string;
  maximum_disclosure_class: DisclosureClass;
  nodes: readonly GraphNode[];
  edges: readonly GraphEdge[];
  provenance_refs: readonly string[];
  exclusions: readonly string[];
  packet_digest: string;
}>;

export type ContextPacketUseBinding = Readonly<{
  tenant_id: typeof TENANT_ID;
  subject_id: string;
  project_id: string | null;
  purpose: MemoryPurpose;
  session_id: string;
  audience: typeof RECEPTION_AUDIENCE;
  locale: Locale;
  channel: ReceptionChannel;
  evaluated_at: string;
}>;

type MutationBase<O extends "append_node" | "append_edge"> = Readonly<{
  schema: typeof MUTATION_PROPOSAL_SCHEMA;
  mutation_id: string;
  tenant_id: typeof TENANT_ID;
  subject_id: string;
  project_id: string | null;
  purpose: MemoryPurpose;
  session_id: string;
  audience: typeof RECEPTION_AUDIENCE;
  channel: ReceptionChannel;
  identity_assertion_id: string;
  consent_grant_id: string;
  proposed_at: string;
  deduplication_key: string;
  retention_class: RetentionClass;
  operation: O;
}>;

export type ProposedAppendNodeMutation = MutationBase<"append_node"> &
  Readonly<{ node: GraphNode }>;
export type ProposedAppendEdgeMutation = MutationBase<"append_edge"> &
  Readonly<{ edge: GraphEdge }>;
export type ProposedMutation =
  | ProposedAppendNodeMutation
  | ProposedAppendEdgeMutation;

type PlainRecord = Record<string, unknown>;

const TRANSITION_KEYS = ["from_state", "to_state"] as const;
const IDENTITY_KEYS = [
  "schema",
  "assertion_id",
  "tenant_id",
  "subject_id",
  "audience",
  "session_id",
  "assurance_class",
  "issued_at",
  "expires_at",
  "nonce",
  "verifier_version",
] as const;
const IDENTITY_BINDING_KEYS = [
  "tenant_id",
  "audience",
  "session_id",
  "evaluated_at",
] as const;
const CONSENT_KEYS = [
  "schema",
  "consent_grant_id",
  "tenant_id",
  "subject_id",
  "purpose",
  "data_classes",
  "operations",
  "channels",
  "policy_version",
  "granted_at",
  "expires_at",
  "revoked_at",
] as const;
const CONSENT_BINDING_KEYS = [
  "tenant_id",
  "subject_id",
  "purpose",
  "channel",
  "operation",
  "data_classes",
  "evaluated_at",
] as const;
const NODE_KEYS = [
  "schema",
  "node_id",
  "tenant_id",
  "kind",
  "version",
  "created_at",
  "retention_class",
  "payload",
] as const;
const EDGE_KEYS = [
  "schema",
  "edge_id",
  "tenant_id",
  "kind",
  "from_node_id",
  "to_node_id",
  "version",
  "created_at",
  "valid_from",
  "valid_until",
  "source_ref",
  "policy_label",
  "deletion_behavior",
] as const;
const PACKET_KEYS = [
  "schema",
  "packet_id",
  "tenant_id",
  "subject_id",
  "project_id",
  "purpose",
  "session_id",
  "audience",
  "locale",
  "channel",
  "policy_version",
  "consent_grant_id",
  "identity_assertion_id",
  "issued_at",
  "expires_at",
  "maximum_disclosure_class",
  "nodes",
  "edges",
  "provenance_refs",
  "exclusions",
  "packet_digest",
] as const;
const PACKET_BINDING_KEYS = [
  "tenant_id",
  "subject_id",
  "project_id",
  "purpose",
  "session_id",
  "audience",
  "locale",
  "channel",
  "evaluated_at",
] as const;
const MUTATION_COMMON_KEYS = [
  "schema",
  "mutation_id",
  "tenant_id",
  "subject_id",
  "project_id",
  "purpose",
  "session_id",
  "audience",
  "channel",
  "identity_assertion_id",
  "consent_grant_id",
  "proposed_at",
  "deduplication_key",
  "retention_class",
  "operation",
] as const;

const PAYLOAD_KEYS = {
  subject: ["subject_id", "identity_vault_ref"],
  contact_channel: ["channel_ref", "channel_kind", "verification_state"],
  consent_grant: ["consent_grant_id", "purpose"],
  property: ["property_ref"],
  lead_journey: ["journey_id"],
  project: ["project_id", "project_state"],
  technical_artifact_ref: [
    "artifact_id",
    "artifact_schema",
    "artifact_digest",
    "release",
    "custody_ref",
  ],
  interaction_summary: ["summary_code", "truth_class", "source_event_refs"],
  fact_assertion: [
    "fact_code",
    "value_code",
    "truth_class",
    "provenance_refs",
    "observed_at",
    "verified_at",
    "expires_at",
    "dispute_state",
  ],
  authorization_grant: [
    "authorization_grant_id",
    "subject_id",
    "session_id",
    "purpose",
    "operations",
    "node_kinds",
    "expires_at",
  ],
  retention_directive: [
    "retention_directive_id",
    "retention_class",
    "legal_hold_state",
    "deletion_status",
    "export_status",
  ],
  evidence_ref: ["evidence_ref", "evidence_digest", "evidence_kind"],
} as const satisfies Record<GraphNodeKind, readonly string[]>;

const DIGEST = /^sha256:[0-9a-f]{64}$/;
const SEMVER = /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/;
const VERSIONED_IDENTIFIER =
  /^[a-z][a-z0-9-]*(?:\/[a-z][a-z0-9-]*)*\/(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/;
const SCHEMA_IDENTIFIER =
  /^[a-z][a-z0-9-]*(?:\/[a-z][a-z0-9-]*)*\/(?:[1-9]\d*)$/;
const BOUNDED_CODE = /^[a-z][a-z0-9_]{1,63}$/;
const OPAQUE_ID_SUFFIX = /^[a-z0-9]{16,64}$/;
const DEDUPLICATION_KEY = /^dedupe_[A-Za-z0-9_-]{16,80}$/;

function fail(reason_code: RefusalCode): ContractFailure {
  return { ok: false, reason_code };
}

function isPlainRecord(value: unknown): value is PlainRecord {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function exactKeys(value: unknown, required: readonly string[]): value is PlainRecord {
  if (!isPlainRecord(value)) return false;
  const allowed = new Set(required);
  return (
    Object.keys(value).every((key) => allowed.has(key)) &&
    required.every((key) => key in value)
  );
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === "string" && allowed.includes(value as T);
}

function isOpaqueId(value: unknown, prefix: string): value is string {
  return (
    typeof value === "string" &&
    value.startsWith(`${prefix}_`) &&
    OPAQUE_ID_SUFFIX.test(value.slice(prefix.length + 1))
  );
}

function isDigest(value: unknown): value is string {
  return typeof value === "string" && DIGEST.test(value);
}

function isVersionedIdentifier(value: unknown, prefix?: string): value is string {
  return (
    typeof value === "string" &&
    VERSIONED_IDENTIFIER.test(value) &&
    (prefix === undefined || value.startsWith(`${prefix}/`))
  );
}

function isSchemaIdentifier(value: unknown): value is string {
  return typeof value === "string" && SCHEMA_IDENTIFIER.test(value);
}

function isBoundedCode(value: unknown): value is string {
  return typeof value === "string" && BOUNDED_CODE.test(value);
}

function utcMillis(value: unknown): number | null {
  if (!isUtcTimestamp(value)) return null;
  const parsed = Date.parse(value as string);
  return Number.isFinite(parsed) ? parsed : null;
}

function hasCanonicalStrings<T extends string>(
  value: unknown,
  allowed: readonly T[] | null,
  allowEmpty = false,
): value is readonly T[] {
  if (!Array.isArray(value) || (!allowEmpty && value.length === 0)) return false;
  if (!value.every((entry) => typeof entry === "string")) return false;
  if (allowed !== null && !value.every((entry) => allowed.includes(entry as T))) {
    return false;
  }
  for (let index = 1; index < value.length; index += 1) {
    if ((value[index - 1] as string) >= (value[index] as string)) return false;
  }
  return true;
}

function canonicalStringFailure<T extends string>(
  value: unknown,
  allowed: readonly T[] | null,
  invalidCode: RefusalCode,
  allowEmpty = false,
): RefusalCode | null {
  if (!Array.isArray(value) || (!allowEmpty && value.length === 0)) return invalidCode;
  if (!value.every((entry) => typeof entry === "string")) return invalidCode;
  if (new Set(value).size !== value.length) return "duplicate_array_value";
  if (allowed !== null && !value.every((entry) => allowed.includes(entry as T))) {
    return invalidCode;
  }
  return hasCanonicalStrings(value, allowed, allowEmpty)
    ? null
    : "invalid_canonical_order";
}

function freezeClone<T>(value: T): T {
  if (Array.isArray(value)) {
    return Object.freeze(value.map((entry) => freezeClone(entry))) as T;
  }
  if (isPlainRecord(value)) {
    const clone = Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [key, freezeClone(nested)]),
    );
    return Object.freeze(clone) as T;
  }
  return value;
}

function firstTenantFailure(value: unknown): RefusalCode | null {
  if (!isPlainRecord(value)) return null;
  return value.tenant_id === TENANT_ID ? null : "invalid_tenant";
}

function validateTransitionInternal(value: unknown): RefusalCode | null {
  if (!exactKeys(value, TRANSITION_KEYS)) return "invalid_transition_shape";
  if (!oneOf(value.from_state, RECEPTION_STATES) || !oneOf(value.to_state, RECEPTION_STATES)) {
    return "invalid_reception_state";
  }
  if (TERMINAL_RECEPTION_STATES.includes(value.from_state as (typeof TERMINAL_RECEPTION_STATES)[number])) {
    return "terminal_state_transition_forbidden";
  }
  return PERMITTED_RECEPTION_TRANSITIONS.some(
    ([from, to]) => from === value.from_state && to === value.to_state,
  )
    ? null
    : "illegal_reception_transition";
}

export function validateReceptionTransition(
  value: unknown,
): ContractResult<ReceptionTransition> {
  try {
    const reason = validateTransitionInternal(value);
    return reason
      ? fail(reason)
      : { ok: true, value: freezeClone(value as ReceptionTransition) };
  } catch {
    return fail("invalid_untrusted_input");
  }
}

function validateIdentityBindingInternal(value: unknown): RefusalCode | null {
  const tenantFailure = firstTenantFailure(value);
  if (tenantFailure) return tenantFailure;
  if (!exactKeys(value, IDENTITY_BINDING_KEYS)) return "invalid_binding_shape";
  if (value.audience !== RECEPTION_AUDIENCE) return "invalid_audience";
  if (!isOpaqueId(value.session_id, "session")) return "invalid_session_id";
  if (utcMillis(value.evaluated_at) === null) return "invalid_timestamp";
  return null;
}

function validateIdentityInternal(
  value: unknown,
  binding: unknown,
): RefusalCode | null {
  const tenantFailure = firstTenantFailure(value);
  if (tenantFailure) return tenantFailure;
  const bindingFailure = validateIdentityBindingInternal(binding);
  if (bindingFailure) return bindingFailure;
  if (!exactKeys(value, IDENTITY_KEYS)) return "invalid_identity_shape";
  if (value.schema !== IDENTITY_ASSERTION_SCHEMA) return "invalid_identity_schema";
  if (!isOpaqueId(value.assertion_id, "assertion")) return "invalid_identity_id";
  if (!isOpaqueId(value.subject_id, "subject")) return "invalid_subject_id";
  if (value.audience !== RECEPTION_AUDIENCE) return "invalid_audience";
  if (!isOpaqueId(value.session_id, "session")) return "invalid_session_id";
  if (!oneOf(value.assurance_class, ["verified_contact_control", "verified_project_participant"] as const)) {
    return "invalid_assurance_class";
  }
  if (!isOpaqueId(value.nonce, "nonce")) return "invalid_nonce";
  if (!isVersionedIdentifier(value.verifier_version, "identity-verifier")) {
    return "invalid_verifier_version";
  }

  const issued = utcMillis(value.issued_at);
  const expires = utcMillis(value.expires_at);
  const evaluated = utcMillis((binding as PlainRecord).evaluated_at);
  if (issued === null || expires === null || evaluated === null) return "invalid_timestamp";
  if (expires <= issued) return "invalid_time_window";
  if ((expires - issued) / 1000 > IDENTITY_ASSERTION_MAX_TTL_SECONDS) {
    return "identity_ttl_exceeded";
  }

  const expected = binding as IdentityAssertionBinding;
  if (value.audience !== expected.audience) return "audience_mismatch";
  if (value.session_id !== expected.session_id) return "session_mismatch";
  if (evaluated < issued) return "identity_not_yet_valid";
  if (evaluated >= expires) return "identity_expired";
  return null;
}

export function validateIdentityAssertion(
  value: unknown,
  binding: unknown,
): ContractResult<IdentityAssertion> {
  try {
    const reason = validateIdentityInternal(value, binding);
    return reason
      ? fail(reason)
      : { ok: true, value: freezeClone(value as IdentityAssertion) };
  } catch {
    return fail("invalid_untrusted_input");
  }
}

function validateConsentUseBindingInternal(value: unknown): RefusalCode | null {
  const tenantFailure = firstTenantFailure(value);
  if (tenantFailure) return tenantFailure;
  if (!exactKeys(value, CONSENT_BINDING_KEYS)) return "invalid_binding_shape";
  if (!isOpaqueId(value.subject_id, "subject")) return "invalid_subject_id";
  if (!oneOf(value.purpose, MEMORY_PURPOSES)) return "invalid_purpose";
  if (!oneOf(value.channel, RECEPTION_CHANNELS)) return "invalid_channel";
  if (!oneOf(value.operation, MEMORY_OPERATIONS)) return "invalid_operation";
  const classesFailure = canonicalStringFailure(
    value.data_classes,
    MEMORY_DATA_CLASSES,
    "invalid_data_class",
    true,
  );
  if (classesFailure) return classesFailure;
  if (utcMillis(value.evaluated_at) === null) return "invalid_timestamp";
  return null;
}

function validateConsentInternal(
  value: unknown,
  binding: unknown,
): RefusalCode | null {
  const tenantFailure = firstTenantFailure(value);
  if (tenantFailure) return tenantFailure;
  const bindingFailure = validateConsentUseBindingInternal(binding);
  if (bindingFailure) return bindingFailure;
  if (!exactKeys(value, CONSENT_KEYS)) return "invalid_consent_shape";
  if (value.schema !== MEMORY_CONSENT_GRANT_SCHEMA) return "invalid_consent_schema";
  if (!isOpaqueId(value.consent_grant_id, "consent")) return "invalid_consent_id";
  if (!isOpaqueId(value.subject_id, "subject")) return "invalid_subject_id";
  if (!oneOf(value.purpose, MEMORY_PURPOSES)) return "invalid_purpose";

  const dataFailure = canonicalStringFailure(
    value.data_classes,
    MEMORY_DATA_CLASSES,
    "invalid_data_class",
  );
  if (dataFailure) return dataFailure;
  const operationFailure = canonicalStringFailure(
    value.operations,
    MEMORY_OPERATIONS,
    "invalid_operation",
  );
  if (operationFailure) return operationFailure;
  const channelFailure = canonicalStringFailure(
    value.channels,
    RECEPTION_CHANNELS,
    "invalid_channel",
  );
  if (channelFailure) return channelFailure;
  if (!isVersionedIdentifier(value.policy_version, "memory-policy")) {
    return "invalid_policy_version";
  }

  const granted = utcMillis(value.granted_at);
  const expires = utcMillis(value.expires_at);
  const revoked = value.revoked_at === null ? null : utcMillis(value.revoked_at);
  const evaluated = utcMillis((binding as PlainRecord).evaluated_at);
  if (
    granted === null ||
    expires === null ||
    evaluated === null ||
    (value.revoked_at !== null && revoked === null)
  ) {
    return "invalid_timestamp";
  }
  if (
    expires <= granted ||
    (revoked !== null && (revoked < granted || revoked > expires))
  ) {
    return "invalid_time_window";
  }

  const expected = binding as ConsentUseBinding;
  if (value.subject_id !== expected.subject_id) return "subject_mismatch";
  if (value.purpose !== expected.purpose) return "purpose_mismatch";
  if (evaluated < granted) return "consent_not_yet_valid";
  if (revoked !== null && evaluated >= revoked) return "consent_revoked";
  if (evaluated >= expires) return "consent_expired";
  if (!(value.channels as readonly string[]).includes(expected.channel)) {
    return "channel_not_consented";
  }
  if (!(value.operations as readonly string[]).includes(expected.operation)) {
    return "operation_not_consented";
  }
  for (const dataClass of expected.data_classes) {
    if (!(value.data_classes as readonly string[]).includes(dataClass)) {
      return "data_class_not_consented";
    }
  }
  return null;
}

export function validateMemoryConsentGrant(
  value: unknown,
  binding: unknown,
): ContractResult<MemoryConsentGrant> {
  try {
    const reason = validateConsentInternal(value, binding);
    return reason
      ? fail(reason)
      : { ok: true, value: freezeClone(value as MemoryConsentGrant) };
  } catch {
    return fail("invalid_untrusted_input");
  }
}

function validatePayload(kind: GraphNodeKind, payload: unknown): RefusalCode | null {
  if (!exactKeys(payload, PAYLOAD_KEYS[kind])) return "invalid_node_payload";
  const p = payload as PlainRecord;

  switch (kind) {
    case "subject":
      return isOpaqueId(p.subject_id, "subject") && isOpaqueId(p.identity_vault_ref, "vault")
        ? null
        : "invalid_node_payload";
    case "contact_channel":
      return isOpaqueId(p.channel_ref, "channel") &&
        oneOf(p.channel_kind, ["email", "phone"] as const) &&
        oneOf(p.verification_state, ["unverified", "verified"] as const)
        ? null
        : "invalid_node_payload";
    case "consent_grant":
      return isOpaqueId(p.consent_grant_id, "consent") && oneOf(p.purpose, MEMORY_PURPOSES)
        ? null
        : "invalid_node_payload";
    case "property":
      return isOpaqueId(p.property_ref, "property") ? null : "invalid_node_payload";
    case "lead_journey":
      return isOpaqueId(p.journey_id, "journey") ? null : "invalid_node_payload";
    case "project":
      return isOpaqueId(p.project_id, "project") &&
        oneOf(p.project_state, ["candidate", "active", "paused", "closed"] as const)
        ? null
        : "invalid_node_payload";
    case "technical_artifact_ref":
      return isOpaqueId(p.artifact_id, "artifact") &&
        isSchemaIdentifier(p.artifact_schema) &&
        isDigest(p.artifact_digest) &&
        typeof p.release === "string" &&
        SEMVER.test(p.release) &&
        isOpaqueId(p.custody_ref, "custody")
        ? null
        : "invalid_node_payload";
    case "interaction_summary": {
      const refsFailure = canonicalStringFailure(
        p.source_event_refs,
        null,
        "invalid_node_payload",
      );
      return isBoundedCode(p.summary_code) &&
        oneOf(p.truth_class, TRUTH_CLASSES) &&
        refsFailure === null &&
        (p.source_event_refs as readonly unknown[]).every((ref) => isOpaqueId(ref, "event"))
        ? null
        : refsFailure ?? "invalid_node_payload";
    }
    case "fact_assertion": {
      const refsFailure = canonicalStringFailure(
        p.provenance_refs,
        null,
        "invalid_node_payload",
      );
      const observed = utcMillis(p.observed_at);
      const verified = p.verified_at === null ? null : utcMillis(p.verified_at);
      const expires = p.expires_at === null ? null : utcMillis(p.expires_at);
      if (
        !isBoundedCode(p.fact_code) ||
        !isBoundedCode(p.value_code) ||
        !oneOf(p.truth_class, TRUTH_CLASSES) ||
        refsFailure !== null ||
        !(p.provenance_refs as readonly unknown[]).every((ref) => isOpaqueId(ref, "source")) ||
        observed === null ||
        (p.verified_at !== null && verified === null) ||
        (p.expires_at !== null && expires === null) ||
        (verified !== null && verified < observed) ||
        (expires !== null && expires <= observed) ||
        !oneOf(p.dispute_state, ["none", "disputed", "resolved"] as const)
      ) {
        return refsFailure ?? "invalid_node_payload";
      }
      return null;
    }
    case "authorization_grant": {
      const operationsFailure = canonicalStringFailure(
        p.operations,
        MEMORY_OPERATIONS,
        "invalid_node_payload",
      );
      const kindsFailure = canonicalStringFailure(
        p.node_kinds,
        GRAPH_NODE_KINDS,
        "invalid_node_payload",
      );
      return isOpaqueId(p.authorization_grant_id, "authorization") &&
        isOpaqueId(p.subject_id, "subject") &&
        isOpaqueId(p.session_id, "session") &&
        oneOf(p.purpose, MEMORY_PURPOSES) &&
        operationsFailure === null &&
        kindsFailure === null &&
        utcMillis(p.expires_at) !== null
        ? null
        : operationsFailure ?? kindsFailure ?? "invalid_node_payload";
    }
    case "retention_directive":
      return isOpaqueId(p.retention_directive_id, "retention") &&
        oneOf(p.retention_class, RETENTION_CLASSES) &&
        oneOf(p.legal_hold_state, ["not_authorized", "separately_authorized"] as const) &&
        oneOf(p.deletion_status, ["not_requested", "blocked", "queued", "completed"] as const) &&
        oneOf(p.export_status, ["not_requested", "blocked", "queued", "completed"] as const)
        ? null
        : "invalid_node_payload";
    case "evidence_ref":
      return isOpaqueId(p.evidence_ref, "evidence") &&
        isDigest(p.evidence_digest) &&
        oneOf(p.evidence_kind, ["product_2_sanitized", "deedseal_sanitized"] as const)
        ? null
        : "invalid_node_payload";
  }
}

function validateNodeInternal(value: unknown): RefusalCode | null {
  const tenantFailure = firstTenantFailure(value);
  if (tenantFailure) return tenantFailure;
  if (!exactKeys(value, NODE_KEYS)) return "invalid_node_shape";
  if (value.schema !== GRAPH_NODE_SCHEMA) return "invalid_node_schema";
  if (!isOpaqueId(value.node_id, "node")) return "invalid_node_id";
  if (!oneOf(value.kind, GRAPH_NODE_KINDS)) return "invalid_node_kind";
  if (!Number.isSafeInteger(value.version) || (value.version as number) < 1) {
    return "invalid_node_version";
  }
  if (utcMillis(value.created_at) === null) return "invalid_timestamp";
  if (!oneOf(value.retention_class, RETENTION_CLASSES)) return "invalid_retention_class";
  return validatePayload(value.kind, value.payload);
}

export function validateGraphNode(value: unknown): ContractResult<GraphNode> {
  try {
    const reason = validateNodeInternal(value);
    return reason ? fail(reason) : { ok: true, value: freezeClone(value as GraphNode) };
  } catch {
    return fail("invalid_untrusted_input");
  }
}

function validateEdgeInternal(value: unknown): RefusalCode | null {
  const tenantFailure = firstTenantFailure(value);
  if (tenantFailure) return tenantFailure;
  if (!exactKeys(value, EDGE_KEYS)) return "invalid_edge_shape";
  if (value.schema !== GRAPH_EDGE_SCHEMA) return "invalid_edge_schema";
  if (!isOpaqueId(value.edge_id, "edge")) return "invalid_edge_id";
  if (!oneOf(value.kind, GRAPH_EDGE_KINDS)) return "invalid_edge_kind";
  if (!isOpaqueId(value.from_node_id, "node") || !isOpaqueId(value.to_node_id, "node")) {
    return "invalid_edge_endpoint";
  }
  if (value.from_node_id === value.to_node_id) return "invalid_edge_endpoint";
  if (!Number.isSafeInteger(value.version) || (value.version as number) < 1) {
    return "invalid_edge_version";
  }
  const created = utcMillis(value.created_at);
  const validFrom = utcMillis(value.valid_from);
  const validUntil = value.valid_until === null ? null : utcMillis(value.valid_until);
  if (
    created === null ||
    validFrom === null ||
    (value.valid_until !== null && validUntil === null)
  ) {
    return "invalid_timestamp";
  }
  if (validFrom < created || (validUntil !== null && validUntil <= validFrom)) {
    return "invalid_edge_validity";
  }
  if (!isOpaqueId(value.source_ref, "source")) return "invalid_provenance_ref";
  if (!isVersionedIdentifier(value.policy_label, "memory-policy")) {
    return "invalid_policy_version";
  }
  if (!oneOf(value.deletion_behavior, [
    "remove_relationship",
    "tombstone_relationship",
    "retain_sanitized_reference",
  ] as const)) {
    return "invalid_deletion_behavior";
  }
  return null;
}

export function validateGraphEdge(value: unknown): ContractResult<GraphEdge> {
  try {
    const reason = validateEdgeInternal(value);
    return reason ? fail(reason) : { ok: true, value: freezeClone(value as GraphEdge) };
  } catch {
    return fail("invalid_untrusted_input");
  }
}

const NODE_DATA_CLASS: Readonly<Record<GraphNodeKind, MemoryDataClass>> = Object.freeze({
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

const EDGE_DATA_CLASS: Readonly<Record<GraphEdgeKind, MemoryDataClass>> = Object.freeze({
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

function validatePacketBindingInternal(value: unknown): RefusalCode | null {
  const tenantFailure = firstTenantFailure(value);
  if (tenantFailure) return tenantFailure;
  if (!exactKeys(value, PACKET_BINDING_KEYS)) return "invalid_binding_shape";
  if (!isOpaqueId(value.subject_id, "subject")) return "invalid_subject_id";
  if (value.project_id !== null && !isOpaqueId(value.project_id, "project")) {
    return "invalid_binding_shape";
  }
  if (!oneOf(value.purpose, MEMORY_PURPOSES)) return "invalid_purpose";
  if (!isOpaqueId(value.session_id, "session")) return "invalid_session_id";
  if (value.audience !== RECEPTION_AUDIENCE) return "invalid_audience";
  if (!oneOf(value.locale, LOCALES)) return "invalid_locale";
  if (!oneOf(value.channel, RECEPTION_CHANNELS)) return "invalid_channel";
  if (utcMillis(value.evaluated_at) === null) return "invalid_timestamp";
  return null;
}

function validateSortedRecords(
  value: unknown,
  key: "node_id" | "edge_id",
  invalidCode: RefusalCode,
  duplicateCode: RefusalCode,
): RefusalCode | null {
  if (!Array.isArray(value)) return invalidCode;
  const seen = new Set<string>();
  let prior: string | null = null;
  for (const entry of value) {
    if (!isPlainRecord(entry) || typeof entry[key] !== "string") return invalidCode;
    const id = entry[key] as string;
    if (seen.has(id)) return duplicateCode;
    if (prior !== null && prior >= id) return "invalid_canonical_order";
    seen.add(id);
    prior = id;
  }
  return null;
}

function validatePacketStructureInternal(value: unknown): RefusalCode | null {
  const tenantFailure = firstTenantFailure(value);
  if (tenantFailure) return tenantFailure;
  if (!exactKeys(value, PACKET_KEYS)) return "invalid_packet_shape";
  if (value.schema !== CONTEXT_PACKET_SCHEMA) return "invalid_packet_schema";
  if (!isOpaqueId(value.packet_id, "packet")) return "invalid_packet_id";
  if (!isOpaqueId(value.subject_id, "subject")) return "invalid_subject_id";
  if (value.project_id !== null && !isOpaqueId(value.project_id, "project")) {
    return "invalid_packet_shape";
  }
  if (!oneOf(value.purpose, MEMORY_PURPOSES)) return "invalid_purpose";
  if (!isOpaqueId(value.session_id, "session")) return "invalid_session_id";
  if (value.audience !== RECEPTION_AUDIENCE) return "invalid_audience";
  if (!oneOf(value.locale, LOCALES)) return "invalid_locale";
  if (!oneOf(value.channel, RECEPTION_CHANNELS)) return "invalid_channel";
  if (!isVersionedIdentifier(value.policy_version, "memory-policy")) {
    return "invalid_policy_version";
  }
  if (!isOpaqueId(value.consent_grant_id, "consent")) return "invalid_consent_id";
  if (!isOpaqueId(value.identity_assertion_id, "assertion")) return "invalid_identity_id";
  if (!oneOf(value.maximum_disclosure_class, DISCLOSURE_CLASSES)) {
    return "invalid_disclosure_class";
  }
  if (!isDigest(value.packet_digest)) return "invalid_digest";

  const issued = utcMillis(value.issued_at);
  const expires = utcMillis(value.expires_at);
  if (issued === null || expires === null) return "invalid_timestamp";
  if (expires <= issued) return "invalid_time_window";
  if ((expires - issued) / 1000 > CONTEXT_PACKET_MAX_TTL_SECONDS) {
    return "packet_ttl_exceeded";
  }

  if (!Array.isArray(value.nodes)) return "invalid_packet_shape";
  if (value.nodes.length > CONTEXT_PACKET_MAX_NODES) return "packet_node_limit_exceeded";
  const nodeOrderFailure = validateSortedRecords(
    value.nodes,
    "node_id",
    "invalid_packet_shape",
    "duplicate_node_id",
  );
  if (nodeOrderFailure) return nodeOrderFailure;
  for (const node of value.nodes) {
    const reason = validateNodeInternal(node);
    if (reason) return reason;
    if ((node as GraphNode).tenant_id !== value.tenant_id) return "cross_tenant_reference";
  }

  if (!Array.isArray(value.edges)) return "invalid_packet_shape";
  if (value.edges.length > CONTEXT_PACKET_MAX_EDGES) return "packet_edge_limit_exceeded";
  const edgeOrderFailure = validateSortedRecords(
    value.edges,
    "edge_id",
    "invalid_packet_shape",
    "duplicate_edge_id",
  );
  if (edgeOrderFailure) return edgeOrderFailure;
  const nodeIds = new Set((value.nodes as GraphNode[]).map((node) => node.node_id));
  for (const edge of value.edges) {
    const reason = validateEdgeInternal(edge);
    if (reason) return reason;
    const typedEdge = edge as GraphEdge;
    if (typedEdge.tenant_id !== value.tenant_id) return "cross_tenant_reference";
    if (!nodeIds.has(typedEdge.from_node_id) || !nodeIds.has(typedEdge.to_node_id)) {
      return "edge_endpoint_not_disclosed";
    }
  }

  const provenanceFailure = canonicalStringFailure(
    value.provenance_refs,
    null,
    "invalid_provenance_ref",
  );
  if (provenanceFailure) return provenanceFailure;
  if (!(value.provenance_refs as readonly unknown[]).every((ref) => isOpaqueId(ref, "source"))) {
    return "invalid_provenance_ref";
  }
  const exclusionFailure = canonicalStringFailure(
    value.exclusions,
    null,
    "invalid_exclusion_code",
    true,
  );
  if (exclusionFailure) return exclusionFailure;
  if (!(value.exclusions as readonly unknown[]).every(isBoundedCode)) {
    return "invalid_exclusion_code";
  }

  const bytes = new TextEncoder().encode(canonicalDigestInput(value)).byteLength;
  if (bytes > CONTEXT_PACKET_MAX_BYTES) return "packet_too_large";
  return null;
}

function packetDataClasses(packet: ContextPacket): readonly MemoryDataClass[] {
  const classes = new Set<MemoryDataClass>();
  for (const node of packet.nodes) classes.add(NODE_DATA_CLASS[node.kind]);
  for (const edge of packet.edges) classes.add(EDGE_DATA_CLASS[edge.kind]);
  return [...classes].sort() as MemoryDataClass[];
}

export function canonicalContextPacketDigestInput(packet: unknown): string {
  return canonicalDigestInput(packet, ["packet_digest"]);
}

export async function computeContextPacketDigest(packet: unknown): Promise<string> {
  return computeDigest(packet, ["packet_digest"]);
}

export async function validateContextPacketForUse(
  value: unknown,
  identity: unknown,
  consent: unknown,
  binding: unknown,
): Promise<ContractResult<ContextPacket>> {
  try {
    const bindingFailure = validatePacketBindingInternal(binding);
    if (bindingFailure) return fail(bindingFailure);
    const structureFailure = validatePacketStructureInternal(value);
    if (structureFailure) return fail(structureFailure);

    const packet = value as ContextPacket;
    const expected = binding as ContextPacketUseBinding;
    const identityFailure = validateIdentityInternal(identity, {
      tenant_id: expected.tenant_id,
      audience: expected.audience,
      session_id: expected.session_id,
      evaluated_at: expected.evaluated_at,
    } satisfies IdentityAssertionBinding);
    if (identityFailure) return fail(identityFailure);
    const assertion = identity as IdentityAssertion;

    const consentFailure = validateConsentInternal(consent, {
      tenant_id: expected.tenant_id,
      subject_id: expected.subject_id,
      purpose: expected.purpose,
      channel: expected.channel,
      operation: "read_context",
      data_classes: packetDataClasses(packet),
      evaluated_at: expected.evaluated_at,
    } satisfies ConsentUseBinding);
    if (consentFailure) return fail(consentFailure);
    const grant = consent as MemoryConsentGrant;

    if (
      packet.tenant_id !== expected.tenant_id ||
      packet.subject_id !== expected.subject_id ||
      packet.project_id !== expected.project_id ||
      packet.purpose !== expected.purpose ||
      packet.session_id !== expected.session_id ||
      packet.audience !== expected.audience ||
      packet.locale !== expected.locale ||
      packet.channel !== expected.channel ||
      packet.identity_assertion_id !== assertion.assertion_id ||
      packet.consent_grant_id !== grant.consent_grant_id ||
      assertion.subject_id !== packet.subject_id ||
      grant.subject_id !== packet.subject_id ||
      grant.purpose !== packet.purpose
    ) {
      return fail("packet_binding_mismatch");
    }

    const issued = utcMillis(packet.issued_at)!;
    const expires = utcMillis(packet.expires_at)!;
    const evaluated = utcMillis(expected.evaluated_at)!;
    const identityIssued = utcMillis(assertion.issued_at)!;
    const identityExpires = utcMillis(assertion.expires_at)!;
    const consentGranted = utcMillis(grant.granted_at)!;
    const consentExpires = utcMillis(grant.expires_at)!;
    if (evaluated < issued) return fail("packet_not_yet_valid");
    if (evaluated >= expires) return fail("packet_expired");
    if (issued < identityIssued || issued < consentGranted) {
      return fail("packet_binding_mismatch");
    }
    if (expires > identityExpires) return fail("packet_outlives_identity");
    if (expires > consentExpires) return fail("packet_outlives_consent");

    const expectedDigest = await computeContextPacketDigest(packet);
    if (packet.packet_digest !== expectedDigest) return fail("digest_mismatch");
    return { ok: true, value: freezeClone(packet) };
  } catch {
    return fail("invalid_untrusted_input");
  }
}

function mutationDataClass(mutation: ProposedMutation): MemoryDataClass {
  return mutation.operation === "append_node"
    ? NODE_DATA_CLASS[mutation.node.kind]
    : EDGE_DATA_CLASS[mutation.edge.kind];
}

function validateMutationStructureInternal(value: unknown): RefusalCode | null {
  const tenantFailure = firstTenantFailure(value);
  if (tenantFailure) return tenantFailure;
  if (!isPlainRecord(value)) return "invalid_mutation_shape";
  if (value.operation !== "append_node" && value.operation !== "append_edge") {
    return "unsupported_mutation_operation";
  }
  const payloadKey = value.operation === "append_node" ? "node" : "edge";
  if (!exactKeys(value, [...MUTATION_COMMON_KEYS, payloadKey])) {
    return "invalid_mutation_shape";
  }
  if (value.schema !== MUTATION_PROPOSAL_SCHEMA) return "invalid_mutation_schema";
  if (!isOpaqueId(value.mutation_id, "mutation")) return "invalid_mutation_id";
  if (!isOpaqueId(value.subject_id, "subject")) return "invalid_subject_id";
  if (value.project_id !== null && !isOpaqueId(value.project_id, "project")) {
    return "invalid_mutation_shape";
  }
  if (!oneOf(value.purpose, MEMORY_PURPOSES)) return "invalid_purpose";
  if (!isOpaqueId(value.session_id, "session")) return "invalid_session_id";
  if (value.audience !== RECEPTION_AUDIENCE) return "invalid_audience";
  if (!oneOf(value.channel, RECEPTION_CHANNELS)) return "invalid_channel";
  if (!isOpaqueId(value.identity_assertion_id, "assertion")) return "invalid_identity_id";
  if (!isOpaqueId(value.consent_grant_id, "consent")) return "invalid_consent_id";
  if (utcMillis(value.proposed_at) === null) return "invalid_timestamp";
  if (typeof value.deduplication_key !== "string" || !DEDUPLICATION_KEY.test(value.deduplication_key)) {
    return "invalid_deduplication_key";
  }
  if (!oneOf(value.retention_class, RETENTION_CLASSES)) return "invalid_retention_class";

  if (value.operation === "append_node") {
    const nodeFailure = validateNodeInternal(value.node);
    if (nodeFailure) return nodeFailure;
    const node = value.node as GraphNode;
    if (node.tenant_id !== value.tenant_id) {
      return "cross_tenant_reference";
    }
    if (node.retention_class !== value.retention_class) return "mutation_binding_mismatch";
  } else {
    const edgeFailure = validateEdgeInternal(value.edge);
    if (edgeFailure) return edgeFailure;
    if ((value.edge as GraphEdge).tenant_id !== value.tenant_id) {
      return "cross_tenant_reference";
    }
  }
  return null;
}

export function validateProposedMutation(
  value: unknown,
  identity: unknown,
  consent: unknown,
): ContractResult<ProposedMutation> {
  try {
    const structureFailure = validateMutationStructureInternal(value);
    if (structureFailure) return fail(structureFailure);
    const mutation = value as ProposedMutation;
    const identityFailure = validateIdentityInternal(identity, {
      tenant_id: mutation.tenant_id,
      audience: mutation.audience,
      session_id: mutation.session_id,
      evaluated_at: mutation.proposed_at,
    } satisfies IdentityAssertionBinding);
    if (identityFailure) return fail(identityFailure);
    const assertion = identity as IdentityAssertion;
    const consentFailure = validateConsentInternal(consent, {
      tenant_id: mutation.tenant_id,
      subject_id: mutation.subject_id,
      purpose: mutation.purpose,
      channel: mutation.channel,
      operation:
        mutation.operation === "append_node"
          ? "propose_append_node"
          : "propose_append_edge",
      data_classes: [mutationDataClass(mutation)],
      evaluated_at: mutation.proposed_at,
    } satisfies ConsentUseBinding);
    if (consentFailure) return fail(consentFailure);
    const grant = consent as MemoryConsentGrant;

    if (
      mutation.identity_assertion_id !== assertion.assertion_id ||
      mutation.consent_grant_id !== grant.consent_grant_id ||
      mutation.subject_id !== assertion.subject_id ||
      mutation.subject_id !== grant.subject_id ||
      mutation.purpose !== grant.purpose
    ) {
      return fail("mutation_binding_mismatch");
    }

    if (mutation.operation === "append_node") {
      const node = mutation.node;
      switch (node.kind) {
        case "subject":
          if (node.payload.subject_id !== mutation.subject_id) {
            return fail("mutation_binding_mismatch");
          }
          break;
        case "consent_grant":
          if (
            node.payload.consent_grant_id !== mutation.consent_grant_id ||
            node.payload.purpose !== mutation.purpose
          ) {
            return fail("mutation_binding_mismatch");
          }
          break;
        case "project":
          if (node.payload.project_id !== mutation.project_id) {
            return fail("mutation_binding_mismatch");
          }
          break;
        case "authorization_grant":
          if (
            node.payload.subject_id !== mutation.subject_id ||
            node.payload.session_id !== mutation.session_id ||
            node.payload.purpose !== mutation.purpose
          ) {
            return fail("mutation_binding_mismatch");
          }
          break;
      }
    }

    return { ok: true, value: freezeClone(mutation) };
  } catch {
    return fail("invalid_untrusted_input");
  }
}
