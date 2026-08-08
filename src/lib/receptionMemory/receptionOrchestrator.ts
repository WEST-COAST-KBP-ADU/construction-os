import { computeDigest } from "../studio/modelContract";
import {
  LOCALES,
  MEMORY_PURPOSES,
  PERMITTED_RECEPTION_TRANSITIONS,
  RECEPTION_AUDIENCE,
  RECEPTION_CHANNELS,
  RECEPTION_STATES,
  TENANT_ID,
  TERMINAL_RECEPTION_STATES,
  validateContextPacketForUse,
  validateIdentityAssertion,
  validateMemoryConsentGrant,
  validateReceptionTransition,
  type ContextPacket,
  type IdentityAssertion,
  type Locale,
  type MemoryConsentGrant,
  type RefusalCode,
  type ReceptionChannel,
  type ReceptionState,
} from "./receptionMemoryContract";
import {
  assembleCanonicalContextPacket,
  type ContextPolicyRefusalCode,
  type ContextPolicyRequest,
  type SyntheticMemoryGraph,
} from "./contextPolicyEngine";
import {
  authorizeMemoryRetrieval,
  executeMemoryLifecycleCommand,
  type MemoryLifecycleRefusalCode,
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
  "consent_required", "consent_scope_widening", "identity_required",
  "identity_scope_widening", "context_scope_required",
  "policy_request_required", "policy_request_widening", "lifecycle_command_required",
  "lifecycle_command_widening", "invalid_orchestrator_state",
  "invalid_semantic_fixture_shape", "unknown_semantic_token", "mixed_locale_tokens",
  "missing_semantic_slot", "ambiguous_semantic_mapping", "semantic_replay_mismatch",
  "internal_refusal",
] as const);
export type OrchestratorRefusalCode =
  | (typeof ORCHESTRATOR_REFUSAL_CODES)[number]
  | RefusalCode
  | ContextPolicyRefusalCode
  | MemoryLifecycleRefusalCode;

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
const RESULT_SHELL_KEYS = ["ok", "schema", "request_digest", "semantic_digest", "evidence", "context_packet", "lifecycle_state"] as const;
const EVIDENCE_KEYS = ["schema", "request_id", "request_digest", "semantic_digest", "tenant_id", "subject_id", "session_id", "from_state", "to_state", "outcome", "occurred_at"] as const;
const ID = /^[a-z][a-z0-9_]{2,95}$/;
const DIGEST = /^sha256:[a-f0-9]{64}$/;
const UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;

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
  if (!plain(value)) return false;
  const ownKeys = Reflect.ownKeys(value);
  if (ownKeys.length !== keys.length || ownKeys.some((key) => typeof key !== "string" || !keys.includes(key))) return false;
  return keys.every((key) => {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return descriptor !== undefined && descriptor.enumerable && "value" in descriptor;
  });
}
function frozen<T>(value: T): T {
  if (Array.isArray(value)) return Object.freeze(value.map(frozen)) as T;
  if (plain(value)) return Object.freeze(Object.fromEntries(Object.entries(value).map(([k, v]) => [k, frozen(v)]))) as T;
  return value;
}
function fail(reason_code: OrchestratorRefusalCode): ReceptionOrchestratorFailure { return frozen({ ok: false, reason_code }); }

function canonicalData(value: unknown, ancestors = new Set<object>()): boolean {
  if (value === null || typeof value === "string" || typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value !== "object") return false;
  if (ancestors.has(value)) return false;
  ancestors.add(value);
  if (Array.isArray(value)) {
    const ownKeys = Reflect.ownKeys(value);
    const expectedKeys = [...value.keys()].map(String);
    const validArray = ownKeys.length === expectedKeys.length + 1 && ownKeys.includes("length") &&
      expectedKeys.every((key) => {
        const descriptor = Object.getOwnPropertyDescriptor(value, key);
        return descriptor !== undefined && descriptor.enumerable && "value" in descriptor && canonicalData(descriptor.value, ancestors);
      });
    ancestors.delete(value);
    return validArray;
  }
  const keys = Reflect.ownKeys(value);
  const validKeys = keys.every((key) => {
    if (typeof key !== "string") return false;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return descriptor !== undefined && descriptor.enumerable && "value" in descriptor && canonicalData(descriptor.value, ancestors);
  });
  ancestors.delete(value);
  return validKeys && plain(value);
}

function validEvidence(value: unknown): value is ReceptionEvidence {
  return exact(value, EVIDENCE_KEYS) && value.schema === RECEPTION_EVIDENCE_SCHEMA &&
    typeof value.request_id === "string" && ID.test(value.request_id) &&
    typeof value.request_digest === "string" && DIGEST.test(value.request_digest) &&
    typeof value.semantic_digest === "string" && DIGEST.test(value.semantic_digest) &&
    value.tenant_id === TENANT_ID && typeof value.subject_id === "string" &&
    typeof value.session_id === "string" && typeof value.from_state === "string" &&
    RECEPTION_STATES.includes(value.from_state as ReceptionState) &&
    typeof value.to_state === "string" && RECEPTION_STATES.includes(value.to_state as ReceptionState) &&
    value.outcome === "accepted" && typeof value.occurred_at === "string" && UTC.test(value.occurred_at);
}

function validCachedResult(value: unknown): value is Omit<ReceptionOrchestratorSuccess, "state"> {
  return exact(value, RESULT_SHELL_KEYS) && value.ok === true && value.schema === RECEPTION_RESULT_SCHEMA &&
    typeof value.request_digest === "string" && DIGEST.test(value.request_digest) &&
    typeof value.semantic_digest === "string" && DIGEST.test(value.semantic_digest) &&
    validEvidence(value.evidence) && value.evidence.request_digest === value.request_digest &&
    value.evidence.semantic_digest === value.semantic_digest &&
    (value.context_packet === null || (plain(value.context_packet) && canonicalData(value.context_packet))) &&
    plain(value.lifecycle_state) && canonicalData(value.lifecycle_state);
}

function validState(value: unknown): value is ReceptionOrchestratorState {
  if (!exact(value, STATE_KEYS) || typeof value.reception_state !== "string" ||
      !RECEPTION_STATES.includes(value.reception_state as ReceptionState)) return false;
  const empty = value.last_request_id === null && value.last_request_digest === null && value.last_result === null;
  if (empty) return value.reception_state === "anonymous" ||
    TERMINAL_RECEPTION_STATES.includes(value.reception_state as (typeof TERMINAL_RECEPTION_STATES)[number]);
  if (typeof value.last_request_id !== "string" || !ID.test(value.last_request_id) ||
      typeof value.last_request_digest !== "string" || !DIGEST.test(value.last_request_digest) ||
      !validCachedResult(value.last_result)) return false;
  return value.last_result.request_digest === value.last_request_digest &&
    value.last_result.evidence.request_id === value.last_request_id &&
    value.last_result.evidence.to_state === value.reception_state;
}

export function createReceptionOrchestratorState(): ReceptionOrchestratorState {
  return frozen({ reception_state: "anonymous", last_request_id: null, last_request_digest: null, last_result: null });
}

export async function computeSemanticDigest(value: CanonicalSemantic): Promise<string> {
  return computeDigest({ intent: value.intent, project_slot: value.project_slot, purpose_slot: value.purpose_slot, subject_slot: value.subject_slot });
}

export async function resolveSemanticFixture(value: unknown): Promise<Readonly<{ ok: true; value: CanonicalSemantic; semantic_digest: string }> | ReceptionOrchestratorFailure> {
  try {
    if (!plain(value)) return fail("invalid_semantic_fixture_shape");
    if (FIXTURE_KEYS.some((key) => Object.getOwnPropertyDescriptor(value, key) === undefined)) return fail("missing_semantic_slot");
    if (!exact(value, FIXTURE_KEYS)) return fail("invalid_semantic_fixture_shape");
    if ([value.intent_token, value.subject_token, value.purpose_token, value.project_token]
      .some((token) => Array.isArray(token) && token.length > 1)) return fail("ambiguous_semantic_mapping");
    if (typeof value.intent_token !== "string" || value.intent_token.length === 0 ||
        typeof value.subject_token !== "string" || value.subject_token.length === 0 ||
        typeof value.purpose_token !== "string" || value.purpose_token.length === 0 ||
        (value.project_token !== null && typeof value.project_token !== "string")) return fail("invalid_semantic_fixture_shape");
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

function validCanonicalSemantic(value: unknown): value is CanonicalSemantic {
  return exact(value, SEMANTIC_KEYS) && typeof value.intent === "string" &&
    CANONICAL_INTENTS.includes(value.intent as CanonicalIntent) &&
    typeof value.subject_slot === "string" &&
    (value.project_slot === null || typeof value.project_slot === "string") &&
    typeof value.purpose_slot === "string" &&
    MEMORY_PURPOSES.includes(value.purpose_slot as CanonicalSemantic["purpose_slot"]);
}

function intentForTransition(from: ReceptionState, to: ReceptionState): CanonicalIntent | null {
  if (TERMINAL_RECEPTION_STATES.includes(to as (typeof TERMINAL_RECEPTION_STATES)[number])) return "end_reception";
  const key = `${from}:${to}`;
  switch (key) {
    case "anonymous:disclosed": return "disclose_memory";
    case "disclosed:consent_candidate": return "grant_consent";
    case "consent_candidate:identity_candidate":
    case "identity_candidate:identity_verified": return "verify_identity";
    case "identity_verified:context_scoped": return "retrieve_context";
    case "context_scoped:active": return "apply_memory_effect";
    default: return null;
  }
}

function sequenceFailure(request: ReceptionOrchestrationRequest): OrchestratorRefusalCode | null {
  const expected = intentForTransition(request.from_state, request.to_state);
  if (expected === request.semantic.intent) return null;
  switch (expected) {
    case "disclose_memory": return "disclosure_required";
    case "grant_consent": return "consent_required";
    case "verify_identity": return "identity_required";
    case "retrieve_context":
    case "apply_memory_effect": return "context_scope_required";
    default: return "invalid_semantic_shape";
  }
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

async function evaluateRequest(
  request: ReceptionOrchestrationRequest,
  graph: SyntheticMemoryGraph,
  lifecycleState: MemoryLifecycleState,
  requestDigest: string,
  priorContext: ContextPacket | null,
): Promise<Readonly<{ ok: true; shell: Omit<ReceptionOrchestratorSuccess, "state"> }> | ReceptionOrchestratorFailure> {
  const sequenceProblem = sequenceFailure(request);
  if (sequenceProblem) return fail(sequenceProblem);

  if (request.semantic.intent === "disclose_memory") {
    if (request.consent !== null) return fail("consent_scope_widening");
    if (request.identity !== null) return fail("identity_scope_widening");
  }
  if (request.semantic.intent === "grant_consent" && request.identity !== null) return fail("identity_scope_widening");
  if (["grant_consent", "verify_identity", "retrieve_context", "apply_memory_effect"].includes(request.semantic.intent) && request.consent === null) return fail("consent_required");
  if (["identity_verified", "context_scoped", "active"].includes(request.to_state) && request.identity === null) return fail("identity_required");

  let activeConsent: MemoryConsentGrant | null = null;
  if (request.consent !== null && request.semantic.intent !== "end_reception") {
    const checked = validateMemoryConsentGrant(request.consent, {
      tenant_id: request.tenant_id,
      subject_id: request.subject_id,
      purpose: request.purpose,
      channel: request.channel,
      operation: "read_context",
      data_classes: ["identity_reference"],
      evaluated_at: request.evaluated_at,
    });
    if (!checked.ok) return fail(checked.reason_code);
    activeConsent = checked.value;
  }

  let activeIdentity: IdentityAssertion | null = null;
  if (request.identity !== null && request.semantic.intent !== "end_reception") {
    const checked = validateIdentityAssertion(request.identity, {
      tenant_id: request.tenant_id,
      audience: request.audience,
      session_id: request.session_id,
      evaluated_at: request.evaluated_at,
    });
    if (!checked.ok || checked.value.subject_id !== request.subject_id) return fail(checked.ok ? "invalid_binding" : checked.reason_code);
    activeIdentity = checked.value;
  }

  let contextPacket: ContextPacket | null = null;
  let nextLifecycle = frozen(structuredClone(lifecycleState));
  if (request.semantic.intent === "retrieve_context") {
    if (request.policy_request === null || activeIdentity === null || activeConsent === null) return fail("policy_request_required");
    const gate = authorizeMemoryRetrieval(lifecycleState, {
      tenant_id: request.tenant_id,
      subject_id: request.subject_id,
      project_id: request.project_id,
      purpose: request.purpose,
      session_id: request.session_id,
      audience: request.audience,
      channel: request.channel,
      consent_grant_id: activeConsent.consent_grant_id,
      evaluated_at: request.evaluated_at,
    }, activeConsent);
    if (!gate.ok) return fail(gate.reason_code);
    const policy = await assembleCanonicalContextPacket(graph, request.policy_request, activeIdentity, activeConsent);
    if (!policy.ok) return fail(policy.reason_code);
    const checkedPacket = await validateContextPacketForUse(policy.value, activeIdentity, activeConsent, {
      tenant_id: request.tenant_id,
      subject_id: request.subject_id,
      project_id: request.project_id,
      purpose: request.purpose,
      session_id: request.session_id,
      audience: request.audience,
      locale: request.locale,
      channel: request.channel,
      evaluated_at: request.evaluated_at,
    });
    if (!checkedPacket.ok) return fail(checkedPacket.reason_code);
    contextPacket = checkedPacket.value;
  } else if (request.policy_request !== null) return fail("policy_request_widening");

  if (request.semantic.intent === "apply_memory_effect") {
    if (request.lifecycle_command === null || activeIdentity === null || activeConsent === null) return fail("lifecycle_command_required");
    if (priorContext === null) return fail("context_scope_required");
    const gate = authorizeMemoryRetrieval(lifecycleState, {
      tenant_id: request.tenant_id,
      subject_id: request.subject_id,
      project_id: request.project_id,
      purpose: request.purpose,
      session_id: request.session_id,
      audience: request.audience,
      channel: request.channel,
      consent_grant_id: activeConsent.consent_grant_id,
      evaluated_at: request.evaluated_at,
    }, activeConsent);
    if (!gate.ok) return fail(gate.reason_code);
    const scoped = await validateContextPacketForUse(priorContext, activeIdentity, activeConsent, {
      tenant_id: request.tenant_id,
      subject_id: request.subject_id,
      project_id: request.project_id,
      purpose: request.purpose,
      session_id: request.session_id,
      audience: request.audience,
      locale: request.locale,
      channel: request.channel,
      evaluated_at: request.evaluated_at,
    });
    if (!scoped.ok) return fail(scoped.reason_code);
    contextPacket = scoped.value;
    const lifecycle = await executeMemoryLifecycleCommand(lifecycleState, request.lifecycle_command, activeIdentity, activeConsent);
    if (!lifecycle.ok) return fail(lifecycle.reason_code);
    nextLifecycle = lifecycle.state;
  } else if (request.lifecycle_command !== null) return fail("lifecycle_command_widening");

  const semanticDigest = await computeSemanticDigest(request.semantic);
  const evidence = frozen({ schema: RECEPTION_EVIDENCE_SCHEMA, request_id: request.request_id, request_digest: requestDigest, semantic_digest: semanticDigest, tenant_id: TENANT_ID, subject_id: request.subject_id, session_id: request.session_id, from_state: request.from_state, to_state: request.to_state, outcome: "accepted" as const, occurred_at: request.evaluated_at });
  const shell = frozen({ ok: true as const, schema: RECEPTION_RESULT_SCHEMA, request_digest: requestDigest, semantic_digest: semanticDigest, evidence, context_packet: contextPacket, lifecycle_state: nextLifecycle });
  return frozen({ ok: true as const, shell });
}

export async function orchestrateReception(
  stateInput: unknown,
  requestInput: unknown,
  graph: SyntheticMemoryGraph,
  lifecycleState: MemoryLifecycleState,
): Promise<ReceptionOrchestratorResult> {
  try {
    if (!validState(stateInput)) return fail("invalid_orchestrator_state");
    if (plain(requestInput)) {
      const tenant = Object.getOwnPropertyDescriptor(requestInput, "tenant_id");
      if (tenant && "value" in tenant && tenant.value !== TENANT_ID) return fail("invalid_tenant");
    }
    if (!exact(requestInput, REQUEST_KEYS)) return fail("invalid_request_shape");
    const request = requestInput as unknown as ReceptionOrchestrationRequest;
    if (request.schema !== RECEPTION_REQUEST_SCHEMA) return fail("invalid_schema");
    if (!ID.test(request.request_id)) return fail("invalid_request_id");
    if (request.tenant_id !== TENANT_ID) return fail("invalid_tenant");
    if (!ID.test(request.subject_id) || !ID.test(request.session_id) ||
        (request.project_id !== null && !ID.test(request.project_id)) ||
        request.audience !== RECEPTION_AUDIENCE || !MEMORY_PURPOSES.includes(request.purpose) ||
        typeof request.evaluated_at !== "string" || !UTC.test(request.evaluated_at)) return fail("invalid_binding");
    if (!LOCALES.includes(request.locale)) return fail("invalid_locale");
    if (!RECEPTION_CHANNELS.includes(request.channel)) return fail("invalid_channel");
    if (request.channel !== "web_text") return fail("channel_inactive");
    if (!validCanonicalSemantic(request.semantic)) return fail("invalid_semantic_shape");
    if (!sameBinding(request)) return fail("semantic_binding_mismatch");
    if (TERMINAL_RECEPTION_STATES.includes(request.from_state as "ended")) return fail("terminal_state");
    const transition = validateReceptionTransition({ from_state: request.from_state, to_state: request.to_state });
    if (!transition.ok) return fail(transition.reason_code);
    if (!PERMITTED_RECEPTION_TRANSITIONS.some(([from, to]) => from === request.from_state && to === request.to_state)) return fail("invalid_transition");

    const requestDigest = await computeDigest(request);
    const replay = stateInput.last_request_id === request.request_id;
    if (replay) {
      if (stateInput.last_request_digest !== requestDigest || stateInput.last_result === null ||
          stateInput.reception_state !== request.to_state) return fail("semantic_replay_mismatch");
    } else if (stateInput.reception_state !== request.from_state) return fail("invalid_transition");

    const priorContext = stateInput.last_result?.context_packet ?? null;
    const evaluated = await evaluateRequest(request, graph, lifecycleState, requestDigest, priorContext);
    if (!evaluated.ok) return evaluated;
    if (replay && stateInput.last_result !== null &&
        await computeDigest(stateInput.last_result) !== await computeDigest(evaluated.shell)) return fail("semantic_replay_mismatch");

    const nextState = frozen({ reception_state: request.to_state, last_request_id: request.request_id, last_request_digest: requestDigest, last_result: evaluated.shell });
    return frozen({ ...evaluated.shell, state: nextState });
  } catch { return fail("internal_refusal"); }
}
