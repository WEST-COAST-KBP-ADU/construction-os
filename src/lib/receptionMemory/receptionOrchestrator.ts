import { computeDigest } from "../studio/modelContract";
import {
  LOCALES,
  RECEPTION_AUDIENCE,
  RECEPTION_CHANNELS,
  TENANT_ID,
  TERMINAL_RECEPTION_STATES,
  validateIdentityAssertion,
  validateMemoryConsentGrant,
  validateReceptionTransition,
  type ContextPacket,
  type IdentityAssertion,
  type Locale,
  type MemoryConsentGrant,
  type ReceptionChannel,
  type ReceptionState,
} from "./receptionMemoryContract";
import {
  assembleCanonicalContextPacket,
  type ContextPolicyRequest,
  type SyntheticMemoryGraph,
} from "./contextPolicyEngine";
import {
  executeMemoryLifecycleCommand,
  type MemoryLifecycleCommand,
  type MemoryLifecycleState,
} from "./memoryLifecycleEngine";

export const RECEPTION_ORCHESTRATOR_VERSION = "reception-orchestrator/1.0.0" as const;
export const RECEPTION_REQUEST_SCHEMA = "reception-orchestration-request/1" as const;
export const RECEPTION_RESULT_SCHEMA = "reception-orchestration-result/1" as const;
export const RECEPTION_EVIDENCE_SCHEMA = "reception-orchestration-evidence/1" as const;
export const SEMANTIC_FIXTURE_SCHEMA = "reception-semantic-fixture/1" as const;

export const CANONICAL_INTENTS = Object.freeze([
  "disclose_memory", "grant_consent", "verify_identity", "retrieve_context",
  "apply_memory_effect", "end_reception",
] as const);
export type CanonicalIntent = (typeof CANONICAL_INTENTS)[number];

export const ORCHESTRATOR_REFUSAL_CODES = Object.freeze([
  "invalid_request_shape", "invalid_schema", "invalid_request_id",
  "invalid_tenant", "invalid_locale", "invalid_channel", "channel_inactive",
  "invalid_binding", "invalid_semantic_shape", "semantic_binding_mismatch",
  "invalid_transition", "terminal_state", "disclosure_required",
  "consent_required", "identity_required", "context_scope_required",
  "policy_request_required", "policy_request_widening", "lifecycle_command_required",
  "lifecycle_command_widening", "invalid_orchestrator_state",
  "invalid_semantic_fixture_shape", "unknown_semantic_token", "mixed_locale_tokens",
  "missing_semantic_slot", "ambiguous_semantic_mapping", "semantic_replay_mismatch",
  "internal_refusal",
] as const);
export type OrchestratorRefusalCode =
  | (typeof ORCHESTRATOR_REFUSAL_CODES)[number]
  | string;

export type CanonicalSemantic = Readonly<{
  intent: CanonicalIntent;
  subject_slot: string;
  project_slot: string | null;
  purpose_slot: "current_session_service" | "returning_customer_continuity" | "project_continuity";
}>;

export type ReceptionOrchestratorState = Readonly<{
  reception_state: ReceptionState;
  last_request_id: string | null;
  last_request_digest: string | null;
  last_result: Omit<ReceptionOrchestratorSuccess, "state"> | null;
}>;

export type ReceptionOrchestrationRequest = Readonly<{
  schema: typeof RECEPTION_REQUEST_SCHEMA;
  request_id: string;
  tenant_id: typeof TENANT_ID;
  subject_id: string;
  project_id: string | null;
  purpose: CanonicalSemantic["purpose_slot"];
  session_id: string;
  audience: typeof RECEPTION_AUDIENCE;
  locale: Locale;
  channel: ReceptionChannel;
  evaluated_at: string;
  from_state: ReceptionState;
  to_state: ReceptionState;
  semantic: CanonicalSemantic;
  identity: IdentityAssertion | null;
  consent: MemoryConsentGrant | null;
  policy_request: ContextPolicyRequest | null;
  lifecycle_command: MemoryLifecycleCommand | null;
}>;

export type ReceptionEvidence = Readonly<{
  schema: typeof RECEPTION_EVIDENCE_SCHEMA;
  request_id: string;
  request_digest: string;
  semantic_digest: string;
  tenant_id: typeof TENANT_ID;
  subject_id: string;
  session_id: string;
  from_state: ReceptionState;
  to_state: ReceptionState;
  outcome: "accepted";
  occurred_at: string;
}>;

export type ReceptionOrchestratorSuccess = Readonly<{
  ok: true;
  schema: typeof RECEPTION_RESULT_SCHEMA;
  state: ReceptionOrchestratorState;
  request_digest: string;
  semantic_digest: string;
  evidence: ReceptionEvidence;
  context_packet: ContextPacket | null;
  lifecycle_state: MemoryLifecycleState;
}>;
export type ReceptionOrchestratorFailure = Readonly<{ ok: false; reason_code: OrchestratorRefusalCode }>;
export type ReceptionOrchestratorResult = ReceptionOrchestratorSuccess | ReceptionOrchestratorFailure;

export type SemanticFixture = Readonly<{
  schema: typeof SEMANTIC_FIXTURE_SCHEMA;
  locale: Locale;
  intent_token: string;
  subject_token: string;
  project_token: string | null;
  purpose_token: string;
}>;

const REQUEST_KEYS = ["schema", "request_id", "tenant_id", "subject_id", "project_id", "purpose", "session_id", "audience", "locale", "channel", "evaluated_at", "from_state", "to_state", "semantic", "identity", "consent", "policy_request", "lifecycle_command"] as const;
const SEMANTIC_KEYS = ["intent", "subject_slot", "project_slot", "purpose_slot"] as const;
const FIXTURE_KEYS = ["schema", "locale", "intent_token", "subject_token", "project_token", "purpose_token"] as const;
const STATE_KEYS = ["reception_state", "last_request_id", "last_request_digest", "last_result"] as const;
const ID = /^[a-z][a-z0-9_]{2,95}$/;

const TOKENS = Object.freeze({
  en: Object.freeze({ intents: { disclose: "disclose_memory", consent: "grant_consent", identity: "verify_identity", context: "retrieve_context", memory: "apply_memory_effect", end: "end_reception" }, purposes: { session: "current_session_service", returning: "returning_customer_continuity", project: "project_continuity" }, subject: "subject", project: "project" }),
  es: Object.freeze({ intents: { divulgar: "disclose_memory", consentimiento: "grant_consent", identidad: "verify_identity", contexto: "retrieve_context", memoria: "apply_memory_effect", finalizar: "end_reception" }, purposes: { sesion: "current_session_service", regreso: "returning_customer_continuity", proyecto: "project_continuity" }, subject: "sujeto", project: "proyecto" }),
  ru: Object.freeze({ intents: { раскрытие: "disclose_memory", согласие: "grant_consent", личность: "verify_identity", контекст: "retrieve_context", память: "apply_memory_effect", завершить: "end_reception" }, purposes: { сессия: "current_session_service", возврат: "returning_customer_continuity", проект: "project_continuity" }, subject: "субъект", project: "проект" }),
} as const);

function plain(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const p = Object.getPrototypeOf(value);
  return p === Object.prototype || p === null;
}
function exact(value: unknown, keys: readonly string[]): value is Record<string, unknown> {
  return plain(value) && Object.keys(value).length === keys.length && keys.every((key) => key in value);
}
function frozen<T>(value: T): T {
  if (Array.isArray(value)) return Object.freeze(value.map(frozen)) as T;
  if (plain(value)) return Object.freeze(Object.fromEntries(Object.entries(value).map(([k, v]) => [k, frozen(v)]))) as T;
  return value;
}
function fail(reason_code: OrchestratorRefusalCode): ReceptionOrchestratorFailure { return frozen({ ok: false, reason_code }); }
function validState(value: unknown): value is ReceptionOrchestratorState {
  return exact(value, STATE_KEYS) && typeof value.reception_state === "string" &&
    (value.last_request_id === null || typeof value.last_request_id === "string") &&
    (value.last_request_digest === null || typeof value.last_request_digest === "string");
}

export function createReceptionOrchestratorState(): ReceptionOrchestratorState {
  return frozen({ reception_state: "anonymous", last_request_id: null, last_request_digest: null, last_result: null });
}

export async function computeSemanticDigest(value: CanonicalSemantic): Promise<string> {
  return computeDigest({ intent: value.intent, project_slot: value.project_slot, purpose_slot: value.purpose_slot, subject_slot: value.subject_slot });
}

export async function resolveSemanticFixture(value: unknown): Promise<Readonly<{ ok: true; value: CanonicalSemantic; semantic_digest: string }> | ReceptionOrchestratorFailure> {
  try {
    if (!exact(value, FIXTURE_KEYS)) return fail("invalid_semantic_fixture_shape");
    if (value.schema !== SEMANTIC_FIXTURE_SCHEMA || !LOCALES.includes(value.locale as Locale)) return fail("invalid_semantic_fixture_shape");
    const locale = value.locale as Locale;
    const table = TOKENS[locale];
    const intent = (table.intents as Record<string, CanonicalIntent>)[value.intent_token as string];
    const purpose = (table.purposes as Record<string, CanonicalSemantic["purpose_slot"]>)[value.purpose_token as string];
    if (!intent || !purpose) return fail("unknown_semantic_token");
    if (value.subject_token !== table.subject || (value.project_token !== null && value.project_token !== table.project)) return fail("mixed_locale_tokens");
    const semantic = frozen({ intent, subject_slot: "bound_subject", project_slot: value.project_token === null ? null : "bound_project", purpose_slot: purpose });
    return frozen({ ok: true, value: semantic, semantic_digest: await computeSemanticDigest(semantic) });
  } catch { return fail("internal_refusal"); }
}

function sameBinding(request: ReceptionOrchestrationRequest): boolean {
  const s = request.semantic;
  if (s.subject_slot !== "bound_subject" || s.project_slot !== (request.project_id === null ? null : "bound_project") || s.purpose_slot !== request.purpose) return false;
  for (const candidate of [request.policy_request, request.lifecycle_command]) {
    if (candidate === null) continue;
    if (!plain(candidate)) return false;
    if (candidate.tenant_id !== request.tenant_id || candidate.subject_id !== request.subject_id || candidate.project_id !== request.project_id || candidate.purpose !== request.purpose || candidate.session_id !== request.session_id || candidate.audience !== request.audience || candidate.channel !== request.channel || candidate.evaluated_at !== request.evaluated_at) return false;
  }
  return true;
}

export async function orchestrateReception(
  stateInput: unknown,
  requestInput: unknown,
  graph: SyntheticMemoryGraph,
  lifecycleState: MemoryLifecycleState,
): Promise<ReceptionOrchestratorResult> {
  try {
    if (!validState(stateInput)) return fail("invalid_orchestrator_state");
    if (!exact(requestInput, REQUEST_KEYS)) return fail("invalid_request_shape");
    const request = requestInput as unknown as ReceptionOrchestrationRequest;
    if (request.schema !== RECEPTION_REQUEST_SCHEMA) return fail("invalid_schema");
    if (!ID.test(request.request_id)) return fail("invalid_request_id");
    if (request.tenant_id !== TENANT_ID || request.audience !== RECEPTION_AUDIENCE) return fail("invalid_tenant");
    if (!LOCALES.includes(request.locale)) return fail("invalid_locale");
    if (!RECEPTION_CHANNELS.includes(request.channel)) return fail("invalid_channel");
    if (request.channel !== "web_text") return fail("channel_inactive");
    if (!exact(request.semantic, SEMANTIC_KEYS) || !sameBinding(request)) return fail("semantic_binding_mismatch");
    if (TERMINAL_RECEPTION_STATES.includes(request.from_state as "ended")) return fail("terminal_state");
    const transition = validateReceptionTransition({ from_state: request.from_state, to_state: request.to_state });
    if (!transition.ok) return fail(transition.reason_code);

    const requestDigest = await computeDigest(request);
    if (stateInput.last_request_id === request.request_id) {
      if (stateInput.last_request_digest !== requestDigest || stateInput.last_result === null) return fail("semantic_replay_mismatch");
      return frozen({ ...structuredClone(stateInput.last_result), state: structuredClone(stateInput) });
    }
    if (stateInput.reception_state !== request.from_state) return fail("invalid_transition");

    if (request.to_state !== "disclosed" && request.from_state === "anonymous") return fail("disclosure_required");
    if (["identity_candidate", "identity_verified", "context_scoped", "active"].includes(request.to_state) && request.consent === null) return fail("consent_required");
    if (["identity_verified", "context_scoped", "active"].includes(request.to_state) && request.identity === null) return fail("identity_required");
    if (request.consent !== null) {
      const c = validateMemoryConsentGrant(request.consent, { tenant_id: request.tenant_id, subject_id: request.subject_id, purpose: request.purpose, channel: request.channel, operation: request.semantic.intent === "apply_memory_effect" ? "propose_append_node" : "read_context", data_classes: request.consent.data_classes, evaluated_at: request.evaluated_at });
      if (!c.ok) return fail(c.reason_code);
    }
    if (request.identity !== null) {
      const i = validateIdentityAssertion(request.identity, { tenant_id: request.tenant_id, audience: request.audience, session_id: request.session_id, evaluated_at: request.evaluated_at });
      if (!i.ok || request.identity.subject_id !== request.subject_id) return fail(i.ok ? "invalid_binding" : i.reason_code);
    }

    let contextPacket: ContextPacket | null = null;
    let nextLifecycle = lifecycleState;
    if (request.semantic.intent === "retrieve_context") {
      if (request.policy_request === null || request.identity === null || request.consent === null) return fail("policy_request_required");
      const policy = await assembleCanonicalContextPacket(graph, request.policy_request, request.identity, request.consent);
      if (!policy.ok) return fail(policy.reason_code);
      contextPacket = policy.value;
    } else if (request.policy_request !== null) return fail("policy_request_widening");
    if (request.semantic.intent === "apply_memory_effect") {
      if (request.lifecycle_command === null || request.identity === null || request.consent === null) return fail("lifecycle_command_required");
      const lifecycle = await executeMemoryLifecycleCommand(lifecycleState, request.lifecycle_command, request.identity, request.consent);
      if (!lifecycle.ok) return fail(lifecycle.reason_code);
      nextLifecycle = lifecycle.state;
    } else if (request.lifecycle_command !== null) return fail("lifecycle_command_widening");

    const semanticDigest = await computeSemanticDigest(request.semantic);
    const evidence = frozen({ schema: RECEPTION_EVIDENCE_SCHEMA, request_id: request.request_id, request_digest: requestDigest, semantic_digest: semanticDigest, tenant_id: TENANT_ID, subject_id: request.subject_id, session_id: request.session_id, from_state: request.from_state, to_state: request.to_state, outcome: "accepted" as const, occurred_at: request.evaluated_at });
    const shell = { ok: true as const, schema: RECEPTION_RESULT_SCHEMA, request_digest: requestDigest, semantic_digest: semanticDigest, evidence, context_packet: contextPacket, lifecycle_state: nextLifecycle };
    const nextState = frozen({ reception_state: request.to_state, last_request_id: request.request_id, last_request_digest: requestDigest, last_result: shell });
    return frozen({ ...shell, state: nextState });
  } catch { return fail("internal_refusal"); }
}
