export const LEAD_SCHEMA = "lead-candidate/1" as const;
export const CONSENT_SCHEMA = "consent-record/1" as const;
export const TECHNICAL_SCENARIO_REF_SCHEMA = "technical-scenario-ref/1" as const;
export const SALES_HANDOFF_SCHEMA = "sales-handoff/1" as const;
export const FUNNEL_EVENT_SCHEMA = "lead-funnel-event/1" as const;
export const LEAD_CONTRACT_VERSION = "lead-contract/1.0.0" as const;

export const FUNNEL_STATES = Object.freeze([
  "anonymous_visit",
  "property_intent",
  "screening_candidate",
  "lead_candidate",
  "qualified_candidate",
  "owner_review_required",
  "approved_for_contact",
  "contacted",
  "consultation",
  "proposal",
  "won",
  "lost",
  "rejected",
  "archived",
] as const);

export type FunnelState = (typeof FUNNEL_STATES)[number];

export const TERMINAL_FUNNEL_STATES = Object.freeze([
  "won",
  "lost",
  "rejected",
  "archived",
] as const satisfies readonly FunnelState[]);

export const SOURCE_CHANNELS = Object.freeze([
  "organic_search",
  "direct",
  "referral",
  "paid_search",
  "local_services",
  "business_profile",
  "social",
  "partner",
  "phone",
  "unknown",
] as const);

export const PROJECT_INTENTS = Object.freeze([
  "detached_adu",
  "attached_adu",
  "garage_conversion",
  "jadu",
  "adu_legalization",
  "other_residential",
] as const);

export const QUALIFICATION_REASONS = Object.freeze([
  "adu_intent_confirmed",
  "service_region_candidate",
  "manual_geographic_review",
  "property_absent_phone_path",
  "technical_facts_incomplete",
  "technical_conflict_recorded",
  "contact_and_consent_valid",
  "outside_declared_region",
] as const);

export const TECHNICAL_LIMITATIONS = Object.freeze([
  "concept_only",
  "site_facts_incomplete",
  "jurisdiction_reference_only",
  "professional_review_required",
] as const);

export const FUNNEL_REASON_CODES = Object.freeze([
  "visitor_property_start",
  "property_input_normalized",
  "valid_contact_and_consent",
  "bounded_fit_satisfied",
  "manual_review_required",
  "sanitized_handoff_prepared",
  "owner_approved_contact",
  "owner_rejected",
  "owner_archived",
  "contact_completed",
  "contact_lost",
  "consultation_completed",
  "consultation_lost",
  "proposal_issued",
  "proposal_lost",
  "agreement_won",
] as const);

export type SourceChannel = (typeof SOURCE_CHANNELS)[number];
export type ProjectIntent = (typeof PROJECT_INTENTS)[number];
export type QualificationReason = (typeof QUALIFICATION_REASONS)[number];
export type TechnicalLimitation = (typeof TECHNICAL_LIMITATIONS)[number];
export type FunnelReasonCode = (typeof FUNNEL_REASON_CODES)[number];

export type TechnicalScenarioReference = Readonly<{
  schema: typeof TECHNICAL_SCENARIO_REF_SCHEMA;
  scenario_id: string;
  scenario_digest: string;
  model_id: string;
  model_version: string;
  site_snapshot_id: string | null;
  evaluation_id: string | null;
  created_at: string;
  maturity: "concept_only" | "design_validated" | "engineering_reviewed" | "permit_package";
  limitations: readonly TechnicalLimitation[];
}>;

export type TechnicalScenarioBinding = Readonly<{
  scenario_id: string;
  scenario_digest: string;
  model_id: string;
  model_version: string;
}>;

export type ConsentRecord = Readonly<{
  schema: typeof CONSENT_SCHEMA;
  consent_record_id: string;
  lead_candidate_id: string;
  consent_text_version: string;
  privacy_notice_version: string;
  affirmative_contact_consent: true;
  inferred: false;
  captured_at: string;
  originating_surface: "address_start" | "phone_intake" | "scenario_handoff";
  allowed_contact_channels: readonly ("phone" | "email")[];
}>;

export type PropertyInput =
  | Readonly<{ kind: "supplied_address"; address_text: string }>
  | Readonly<{ kind: "absent"; reason: "phone_first_no_property" }>;

export type LeadCandidate = Readonly<{
  schema: typeof LEAD_SCHEMA;
  lead_candidate_id: string;
  created_at: string;
  updated_at: string;
  source_channel: SourceChannel;
  entry_path: string;
  utm: Readonly<{
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  }> | null;
  service_area_candidate: "in_declared_region" | "manual_review" | "outside_declared_region" | "unknown";
  project_intent: ProjectIntent;
  property_input: PropertyInput;
  contact_name: string;
  phone: string | null;
  email: string | null;
  preferred_contact_method: "phone" | "email" | "either";
  consent_record_id: string;
  technical_scenario_ref: TechnicalScenarioReference | null;
  state: FunnelState;
  qualification_reasons: readonly QualificationReason[];
  owner_review_status: "not_reviewed" | "pending" | "approved" | "rejected" | "archived";
  project_timing: "immediate" | "three_to_six_months" | "six_to_twelve_months" | "later" | "unknown" | null;
  financing_readiness: "ready" | "researching" | "needs_financing" | "unknown" | null;
  budget_band: "under_200k" | "200k_to_300k" | "300k_to_450k" | "over_450k" | "unknown" | null;
  occupancy_goal: "family" | "rental" | "workforce" | "flexible" | "unknown" | null;
  note: string | null;
}>;

export type FunnelEvent = Readonly<{
  schema: typeof FUNNEL_EVENT_SCHEMA;
  event_id: string;
  journey_id: string;
  lead_candidate_id: string | null;
  from_state: FunnelState;
  to_state: FunnelState;
  actor_type: "visitor" | "deterministic_system" | "authorized_human";
  authority_basis: "visitor_intent" | "validated_input" | "bounded_classification" | "prepared_handoff" | "human_decision";
  occurred_at: string;
  reason_code: FunnelReasonCode;
  idempotency_key: string;
}>;

export type FunnelTransitionCommand = FunnelEvent;

export type SalesHandoff = Readonly<{
  schema: typeof SALES_HANDOFF_SCHEMA;
  handoff_id: string;
  lead_candidate_id: string;
  prepared_at: string;
  technical_scenario_ref: TechnicalScenarioReference | null;
  project_intent: ProjectIntent;
  service_area_candidate: LeadCandidate["service_area_candidate"];
  contact_channel: Readonly<{
    method: "phone" | "email";
    normalized_value: string;
  }>;
  known_fact_codes: readonly string[];
  missing_fact_codes: readonly string[];
  qualification_reasons: readonly QualificationReason[];
  recommended_next_action: "owner_review";
  owner_decision: "pending";
  owner_decided_at: null;
}>;

export type ContractFailure = Readonly<{ ok: false; reason_code: string }>;
export type ValidationSuccess<T> = Readonly<{ ok: true; value: T }>;
export type ValidationResult<T> = ValidationSuccess<T> | ContractFailure;

export type TransitionSuccess = Readonly<{
  ok: true;
  event: FunnelEvent;
  idempotent_replay: boolean;
}>;
export type TransitionResult = TransitionSuccess | ContractFailure;

const CANDIDATE_KEYS = [
  "schema", "lead_candidate_id", "created_at", "updated_at", "source_channel", "entry_path", "utm",
  "service_area_candidate", "project_intent", "property_input", "contact_name", "phone", "email",
  "preferred_contact_method", "consent_record_id", "technical_scenario_ref", "state",
  "qualification_reasons", "owner_review_status", "project_timing", "financing_readiness", "budget_band",
  "occupancy_goal", "note",
] as const;
const CONSENT_KEYS = [
  "schema", "consent_record_id", "lead_candidate_id", "consent_text_version", "privacy_notice_version",
  "affirmative_contact_consent", "inferred", "captured_at", "originating_surface", "allowed_contact_channels",
] as const;
const TECH_REF_KEYS = [
  "schema", "scenario_id", "scenario_digest", "model_id", "model_version", "site_snapshot_id",
  "evaluation_id", "created_at", "maturity", "limitations",
] as const;
const TECH_BINDING_KEYS = ["scenario_id", "scenario_digest", "model_id", "model_version"] as const;
const EVENT_KEYS = [
  "schema", "event_id", "journey_id", "lead_candidate_id", "from_state", "to_state", "actor_type",
  "authority_basis", "occurred_at", "reason_code", "idempotency_key",
] as const;
const UTM_KEYS = ["source", "medium", "campaign", "content", "term"] as const;
const SUPPLIED_PROPERTY_KEYS = ["kind", "address_text"] as const;
const ABSENT_PROPERTY_KEYS = ["kind", "reason"] as const;

const LEAD_ID = /^lead_[a-z0-9]{16,64}$/;
const CONSENT_ID = /^consent_[a-z0-9]{16,64}$/;
const SCENARIO_ID = /^scenario_[a-z0-9]{16,64}$/;
const SITE_SNAPSHOT_ID = /^site_[a-z0-9]{16,64}$/;
const EVALUATION_ID = /^evaluation_[a-z0-9]{16,64}$/;
const HANDOFF_ID = /^handoff_[a-z0-9]{16,64}$/;
const EVENT_ID = /^event_[a-z0-9]{16,64}$/;
const JOURNEY_ID = /^journey_[a-z0-9]{16,64}$/;
const IDEMPOTENCY_KEY = /^idem_[A-Za-z0-9_-]{16,80}$/;
const MODEL_ID = /^adu-[a-z]-\d{3}$/;
const SEMVER = /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/;
const VERSIONED_TEXT = /^(?:contact-consent|privacy-notice)\/(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/;
const DIGEST = /^sha256:[0-9a-f]{64}$/;
const UTC_TIMESTAMP = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z$/;
const E164_PHONE = /^\+[1-9]\d{7,14}$/;
const NORMALIZED_EMAIL = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;
const ROUTE = /^\/[a-z0-9][a-z0-9/_-]{0,126}$/;
const BOUNDED_CODE = /^[a-z][a-z0-9_]{1,63}$/;
const CONTROL_CHARACTER = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

type PlainRecord = Record<string, unknown>;

function isPlainRecord(value: unknown): value is PlainRecord {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function exactKeys(value: unknown, required: readonly string[], optional: readonly string[] = []): value is PlainRecord {
  if (!isPlainRecord(value)) return false;
  const allowed = new Set([...required, ...optional]);
  return Object.keys(value).every((key) => allowed.has(key)) && required.every((key) => key in value);
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === "string" && allowed.includes(value as T);
}

function isStrictUtcTimestamp(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const match = UTC_TIMESTAMP.exec(value);
  if (!match) return false;
  const parts = match.slice(1).map(Number);
  const [year, month, day, hour, minute, second] = parts;
  if (year < 1 || year > 9999 || hour > 23 || minute > 59 || second > 59) return false;
  const instant = Date.UTC(year, month - 1, day, hour, minute, second);
  if (!Number.isFinite(instant)) return false;
  const rebuilt = new Date(instant);
  return rebuilt.getUTCFullYear() === year && rebuilt.getUTCMonth() === month - 1 &&
    rebuilt.getUTCDate() === day && rebuilt.getUTCHours() === hour &&
    rebuilt.getUTCMinutes() === minute && rebuilt.getUTCSeconds() === second;
}

function isNormalizedText(value: unknown, min: number, max: number, multiline = false): value is string {
  if (typeof value !== "string" || value.length < min || value.length > max) return false;
  if (value !== value.trim() || CONTROL_CHARACTER.test(value)) return false;
  if (!multiline && /[\r\n\t]/.test(value)) return false;
  return multiline || !/\s{2,}/.test(value);
}

function isNormalizedEmail(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 254 || value !== value.toLowerCase()) return false;
  const at = value.lastIndexOf("@");
  if (at <= 0 || at > 64 || value.includes("..")) return false;
  return NORMALIZED_EMAIL.test(value);
}

function isNormalizedPhone(value: unknown): value is string {
  return typeof value === "string" && E164_PHONE.test(value);
}

function hasUniqueValues(value: readonly unknown[]): boolean {
  return new Set(value).size === value.length;
}

function validateTechnicalScenarioReferenceInternal(value: unknown): string | null {
  if (!exactKeys(value, TECH_REF_KEYS)) return "invalid_technical_reference_shape";
  if (value.schema !== TECHNICAL_SCENARIO_REF_SCHEMA) return "invalid_technical_reference_schema";
  if (typeof value.scenario_id !== "string" || !SCENARIO_ID.test(value.scenario_id)) return "invalid_scenario_id";
  if (typeof value.scenario_digest !== "string" || !DIGEST.test(value.scenario_digest)) return "invalid_scenario_digest";
  if (typeof value.model_id !== "string" || !MODEL_ID.test(value.model_id)) return "invalid_model_id";
  if (typeof value.model_version !== "string" || !SEMVER.test(value.model_version) || ["latest", "current", "stable", "head", "next"].includes(value.model_version)) return "mutable_or_invalid_model_version";
  if (value.site_snapshot_id !== null && (typeof value.site_snapshot_id !== "string" || !SITE_SNAPSHOT_ID.test(value.site_snapshot_id))) return "invalid_site_snapshot_id";
  if (value.evaluation_id !== null && (typeof value.evaluation_id !== "string" || !EVALUATION_ID.test(value.evaluation_id))) return "invalid_evaluation_id";
  if (!isStrictUtcTimestamp(value.created_at)) return "invalid_technical_reference_timestamp";
  if (!oneOf(value.maturity, ["concept_only", "design_validated", "engineering_reviewed", "permit_package"] as const)) return "invalid_model_maturity";
  if (!Array.isArray(value.limitations) || value.limitations.length === 0 || !hasUniqueValues(value.limitations) || !value.limitations.every((entry) => oneOf(entry, TECHNICAL_LIMITATIONS))) return "invalid_technical_limitations";
  return null;
}

function validateTechnicalScenarioBindingInternal(value: unknown): string | null {
  if (!exactKeys(value, TECH_BINDING_KEYS)) return "invalid_technical_binding_shape";
  if (typeof value.scenario_id !== "string" || !SCENARIO_ID.test(value.scenario_id)) return "invalid_scenario_id";
  if (typeof value.scenario_digest !== "string" || !DIGEST.test(value.scenario_digest)) return "invalid_scenario_digest";
  if (typeof value.model_id !== "string" || !MODEL_ID.test(value.model_id)) return "invalid_model_id";
  if (typeof value.model_version !== "string" || !SEMVER.test(value.model_version)) return "mutable_or_invalid_model_version";
  return null;
}

function validateConsentInternal(value: unknown): string | null {
  if (!exactKeys(value, CONSENT_KEYS)) return "invalid_consent_shape";
  if (value.schema !== CONSENT_SCHEMA) return "invalid_consent_schema";
  if (typeof value.consent_record_id !== "string" || !CONSENT_ID.test(value.consent_record_id)) return "invalid_consent_id";
  if (typeof value.lead_candidate_id !== "string" || !LEAD_ID.test(value.lead_candidate_id)) return "invalid_consent_lead_id";
  if (typeof value.consent_text_version !== "string" || !VERSIONED_TEXT.test(value.consent_text_version) || !value.consent_text_version.startsWith("contact-consent/")) return "invalid_consent_text_version";
  if (typeof value.privacy_notice_version !== "string" || !VERSIONED_TEXT.test(value.privacy_notice_version) || !value.privacy_notice_version.startsWith("privacy-notice/")) return "invalid_privacy_notice_version";
  if (value.affirmative_contact_consent !== true) return "consent_not_affirmative";
  if (value.inferred !== false) return "inferred_consent_forbidden";
  if (!isStrictUtcTimestamp(value.captured_at)) return "invalid_consent_timestamp";
  if (!oneOf(value.originating_surface, ["address_start", "phone_intake", "scenario_handoff"] as const)) return "invalid_consent_surface";
  if (!Array.isArray(value.allowed_contact_channels) || value.allowed_contact_channels.length === 0 || !hasUniqueValues(value.allowed_contact_channels) || !value.allowed_contact_channels.every((entry) => oneOf(entry, ["phone", "email"] as const))) return "invalid_consent_channels";
  return null;
}

function validatePropertyInput(value: unknown): string | null {
  if (!isPlainRecord(value)) return "invalid_property_input";
  if (value.kind === "supplied_address") {
    if (!exactKeys(value, SUPPLIED_PROPERTY_KEYS)) return "invalid_property_input_shape";
    return isNormalizedText(value.address_text, 5, 240) ? null : "invalid_or_oversized_address";
  }
  if (value.kind === "absent") {
    if (!exactKeys(value, ABSENT_PROPERTY_KEYS)) return "invalid_property_input_shape";
    return value.reason === "phone_first_no_property" ? null : "invalid_absent_property_reason";
  }
  return "invalid_property_input_kind";
}

function validateUtm(value: unknown): string | null {
  if (value === null) return null;
  if (!exactKeys(value, [], UTM_KEYS) || Object.keys(value).length === 0) return "invalid_utm_shape";
  for (const field of Object.values(value)) {
    if (!isNormalizedText(field, 1, 100)) return "invalid_or_oversized_utm";
  }
  return null;
}

function validateCandidateInternal(value: unknown): string | null {
  if (!exactKeys(value, CANDIDATE_KEYS)) return "invalid_candidate_shape";
  if (value.schema !== LEAD_SCHEMA) return "invalid_candidate_schema";
  if (typeof value.lead_candidate_id !== "string" || !LEAD_ID.test(value.lead_candidate_id)) return "invalid_lead_candidate_id";
  if (!isStrictUtcTimestamp(value.created_at) || !isStrictUtcTimestamp(value.updated_at) || value.updated_at < value.created_at) return "invalid_candidate_timestamps";
  if (!oneOf(value.source_channel, SOURCE_CHANNELS)) return "invalid_source_channel";
  if (typeof value.entry_path !== "string" || !ROUTE.test(value.entry_path)) return "invalid_entry_path";
  const utmFailure = validateUtm(value.utm);
  if (utmFailure) return utmFailure;
  if (!oneOf(value.service_area_candidate, ["in_declared_region", "manual_review", "outside_declared_region", "unknown"] as const)) return "invalid_service_area_candidate";
  if (!oneOf(value.project_intent, PROJECT_INTENTS)) return "invalid_project_intent";
  const propertyFailure = validatePropertyInput(value.property_input);
  if (propertyFailure) return propertyFailure;
  if (!isNormalizedText(value.contact_name, 1, 100)) return "invalid_or_oversized_contact_name";
  if (value.phone !== null && !isNormalizedPhone(value.phone)) return "invalid_phone";
  if (value.email !== null && !isNormalizedEmail(value.email)) return "invalid_email";
  if (value.phone === null && value.email === null) return "contact_method_required";
  if (!oneOf(value.preferred_contact_method, ["phone", "email", "either"] as const)) return "invalid_preferred_contact_method";
  if (value.preferred_contact_method === "phone" && value.phone === null) return "preferred_phone_missing";
  if (value.preferred_contact_method === "email" && value.email === null) return "preferred_email_missing";
  if (typeof value.consent_record_id !== "string" || !CONSENT_ID.test(value.consent_record_id)) return "invalid_consent_id";
  if (value.technical_scenario_ref !== null) {
    const referenceFailure = validateTechnicalScenarioReferenceInternal(value.technical_scenario_ref);
    if (referenceFailure) return referenceFailure;
  }
  if (!oneOf(value.state, FUNNEL_STATES)) return "invalid_funnel_state";
  if (!Array.isArray(value.qualification_reasons) || !hasUniqueValues(value.qualification_reasons) || !value.qualification_reasons.every((entry) => oneOf(entry, QUALIFICATION_REASONS))) return "invalid_qualification_reasons";
  if (!oneOf(value.owner_review_status, ["not_reviewed", "pending", "approved", "rejected", "archived"] as const)) return "invalid_owner_review_status";
  if (value.project_timing !== null && !oneOf(value.project_timing, ["immediate", "three_to_six_months", "six_to_twelve_months", "later", "unknown"] as const)) return "invalid_project_timing";
  if (value.financing_readiness !== null && !oneOf(value.financing_readiness, ["ready", "researching", "needs_financing", "unknown"] as const)) return "invalid_financing_readiness";
  if (value.budget_band !== null && !oneOf(value.budget_band, ["under_200k", "200k_to_300k", "300k_to_450k", "over_450k", "unknown"] as const)) return "invalid_budget_band";
  if (value.occupancy_goal !== null && !oneOf(value.occupancy_goal, ["family", "rental", "workforce", "flexible", "unknown"] as const)) return "invalid_occupancy_goal";
  if (value.note !== null && !isNormalizedText(value.note, 1, 1000, true)) return "invalid_or_oversized_note";
  return null;
}

export function validateTechnicalScenarioReference(value: unknown): ValidationResult<TechnicalScenarioReference> {
  try {
    const reason = validateTechnicalScenarioReferenceInternal(value);
    return reason ? { ok: false, reason_code: reason } : { ok: true, value: value as TechnicalScenarioReference };
  } catch {
    return { ok: false, reason_code: "invalid_technical_reference_input" };
  }
}

export function validateConsentRecord(value: unknown): ValidationResult<ConsentRecord> {
  try {
    const reason = validateConsentInternal(value);
    return reason ? { ok: false, reason_code: reason } : { ok: true, value: value as ConsentRecord };
  } catch {
    return { ok: false, reason_code: "invalid_consent_input" };
  }
}

export function validateLeadCandidate(
  candidate: unknown,
  consent: unknown,
  technicalBinding: unknown = null,
): ValidationResult<LeadCandidate> {
  try {
    const candidateFailure = validateCandidateInternal(candidate);
    if (candidateFailure) return { ok: false, reason_code: candidateFailure };
    const consentFailure = validateConsentInternal(consent);
    if (consentFailure) return { ok: false, reason_code: consentFailure };

    const typedCandidate = candidate as LeadCandidate;
    const typedConsent = consent as ConsentRecord;
    if (typedCandidate.consent_record_id !== typedConsent.consent_record_id || typedCandidate.lead_candidate_id !== typedConsent.lead_candidate_id) return { ok: false, reason_code: "consent_binding_mismatch" };
    if (typedConsent.captured_at < typedCandidate.created_at || typedConsent.captured_at > typedCandidate.updated_at) return { ok: false, reason_code: "consent_timestamp_outside_candidate_window" };
    if (typedCandidate.phone !== null && !typedConsent.allowed_contact_channels.includes("phone")) return { ok: false, reason_code: "phone_not_consented" };
    if (typedCandidate.email !== null && !typedConsent.allowed_contact_channels.includes("email")) return { ok: false, reason_code: "email_not_consented" };
    if (typedCandidate.property_input.kind === "absent" && typedCandidate.source_channel !== "phone") return { ok: false, reason_code: "absent_property_requires_phone_path" };
    if (typedCandidate.technical_scenario_ref === null) {
      if (technicalBinding !== null) return { ok: false, reason_code: "unexpected_technical_binding" };
    } else {
      if (technicalBinding === null) return { ok: false, reason_code: "technical_binding_required" };
      const bindingFailure = validateTechnicalScenarioBindingInternal(technicalBinding);
      if (bindingFailure) return { ok: false, reason_code: bindingFailure };
      const binding = technicalBinding as TechnicalScenarioBinding;
      const reference = typedCandidate.technical_scenario_ref;
      if (
        reference.scenario_id !== binding.scenario_id ||
        reference.scenario_digest !== binding.scenario_digest ||
        reference.model_id !== binding.model_id ||
        reference.model_version !== binding.model_version
      ) return { ok: false, reason_code: "technical_binding_mismatch" };
      if (reference.created_at > typedCandidate.updated_at) return { ok: false, reason_code: "technical_reference_from_future" };
    }

    const status = typedCandidate.owner_review_status;
    if (typedCandidate.state === "owner_review_required" && status !== "pending") return { ok: false, reason_code: "owner_review_status_mismatch" };
    if (["approved_for_contact", "contacted", "consultation", "proposal", "won", "lost"].includes(typedCandidate.state) && status !== "approved") return { ok: false, reason_code: "owner_review_status_mismatch" };
    if (typedCandidate.state === "rejected" && status !== "rejected") return { ok: false, reason_code: "owner_review_status_mismatch" };
    if (typedCandidate.state === "archived" && status !== "archived") return { ok: false, reason_code: "owner_review_status_mismatch" };
    return { ok: true, value: typedCandidate };
  } catch {
    return { ok: false, reason_code: "invalid_candidate_input" };
  }
}

type TransitionRule = Readonly<{
  from: FunnelState;
  to: FunnelState;
  actor: FunnelEvent["actor_type"];
  basis: FunnelEvent["authority_basis"];
  reason: FunnelReasonCode;
}>;

export const PERMITTED_TRANSITIONS: readonly TransitionRule[] = Object.freeze([
  { from: "anonymous_visit", to: "property_intent", actor: "visitor", basis: "visitor_intent", reason: "visitor_property_start" },
  { from: "property_intent", to: "screening_candidate", actor: "deterministic_system", basis: "validated_input", reason: "property_input_normalized" },
  { from: "screening_candidate", to: "lead_candidate", actor: "visitor", basis: "validated_input", reason: "valid_contact_and_consent" },
  { from: "lead_candidate", to: "qualified_candidate", actor: "deterministic_system", basis: "bounded_classification", reason: "bounded_fit_satisfied" },
  { from: "lead_candidate", to: "owner_review_required", actor: "deterministic_system", basis: "bounded_classification", reason: "manual_review_required" },
  { from: "qualified_candidate", to: "owner_review_required", actor: "deterministic_system", basis: "prepared_handoff", reason: "sanitized_handoff_prepared" },
  { from: "owner_review_required", to: "approved_for_contact", actor: "authorized_human", basis: "human_decision", reason: "owner_approved_contact" },
  { from: "owner_review_required", to: "rejected", actor: "authorized_human", basis: "human_decision", reason: "owner_rejected" },
  { from: "owner_review_required", to: "archived", actor: "authorized_human", basis: "human_decision", reason: "owner_archived" },
  { from: "approved_for_contact", to: "contacted", actor: "authorized_human", basis: "human_decision", reason: "contact_completed" },
  { from: "approved_for_contact", to: "lost", actor: "authorized_human", basis: "human_decision", reason: "contact_lost" },
  { from: "contacted", to: "consultation", actor: "authorized_human", basis: "human_decision", reason: "consultation_completed" },
  { from: "contacted", to: "lost", actor: "authorized_human", basis: "human_decision", reason: "contact_lost" },
  { from: "consultation", to: "proposal", actor: "authorized_human", basis: "human_decision", reason: "proposal_issued" },
  { from: "consultation", to: "lost", actor: "authorized_human", basis: "human_decision", reason: "consultation_lost" },
  { from: "proposal", to: "won", actor: "authorized_human", basis: "human_decision", reason: "agreement_won" },
  { from: "proposal", to: "lost", actor: "authorized_human", basis: "human_decision", reason: "proposal_lost" },
]);

function validateEventInternal(value: unknown): string | null {
  if (!exactKeys(value, EVENT_KEYS)) return "invalid_event_shape";
  if (value.schema !== FUNNEL_EVENT_SCHEMA) return "invalid_event_schema";
  if (typeof value.event_id !== "string" || !EVENT_ID.test(value.event_id)) return "invalid_event_id";
  if (typeof value.journey_id !== "string" || !JOURNEY_ID.test(value.journey_id)) return "invalid_journey_id";
  if (value.lead_candidate_id !== null && (typeof value.lead_candidate_id !== "string" || !LEAD_ID.test(value.lead_candidate_id))) return "invalid_event_lead_id";
  if (!oneOf(value.from_state, FUNNEL_STATES) || !oneOf(value.to_state, FUNNEL_STATES)) return "invalid_event_state";
  if (!oneOf(value.actor_type, ["visitor", "deterministic_system", "authorized_human"] as const)) return "invalid_actor_type";
  if (!oneOf(value.authority_basis, ["visitor_intent", "validated_input", "bounded_classification", "prepared_handoff", "human_decision"] as const)) return "invalid_authority_basis";
  if (!isStrictUtcTimestamp(value.occurred_at)) return "invalid_event_timestamp";
  if (!oneOf(value.reason_code, FUNNEL_REASON_CODES)) return "invalid_event_reason_code";
  if (typeof value.idempotency_key !== "string" || !IDEMPOTENCY_KEY.test(value.idempotency_key)) return "invalid_idempotency_key";
  return null;
}

function sameEvent(left: FunnelEvent, right: FunnelEvent): boolean {
  return EVENT_KEYS.every((key) => left[key] === right[key]);
}

export function transitionFunnelState(command: unknown, priorEvents: readonly unknown[] = []): TransitionResult {
  try {
    const eventFailure = validateEventInternal(command);
    if (eventFailure) return { ok: false, reason_code: eventFailure };
    if (!Array.isArray(priorEvents)) return { ok: false, reason_code: "invalid_prior_events" };

    const typedCommand = command as FunnelTransitionCommand;
    const typedPrior: FunnelEvent[] = [];
    for (const prior of priorEvents) {
      const priorFailure = validateEventInternal(prior);
      if (priorFailure) return { ok: false, reason_code: "invalid_prior_event" };
      typedPrior.push(prior as FunnelEvent);
    }

    const sameIdempotency = typedPrior.find((event) => event.idempotency_key === typedCommand.idempotency_key);
    if (sameIdempotency) {
      return sameEvent(sameIdempotency, typedCommand)
        ? { ok: true, event: sameIdempotency, idempotent_replay: true }
        : { ok: false, reason_code: "idempotency_conflict" };
    }
    if (typedPrior.some((event) => event.event_id === typedCommand.event_id)) return { ok: false, reason_code: "duplicate_event_id" };
    if (TERMINAL_FUNNEL_STATES.includes(typedCommand.from_state as (typeof TERMINAL_FUNNEL_STATES)[number])) return { ok: false, reason_code: "terminal_state_transition_forbidden" };

    const rule = PERMITTED_TRANSITIONS.find((candidate) => candidate.from === typedCommand.from_state && candidate.to === typedCommand.to_state);
    if (!rule) return { ok: false, reason_code: "illegal_funnel_transition" };
    if (typedCommand.actor_type !== rule.actor) {
      return rule.actor === "authorized_human"
        ? { ok: false, reason_code: "human_authority_required" }
        : { ok: false, reason_code: "incorrect_transition_actor" };
    }
    if (typedCommand.authority_basis !== rule.basis) return { ok: false, reason_code: "invalid_transition_authority_basis" };
    if (typedCommand.reason_code !== rule.reason) return { ok: false, reason_code: "transition_reason_mismatch" };
    if (["lead_candidate", "qualified_candidate", "owner_review_required", "approved_for_contact", "contacted", "consultation", "proposal", "won", "lost", "rejected", "archived"].includes(typedCommand.to_state) && typedCommand.lead_candidate_id === null) return { ok: false, reason_code: "lead_id_required_for_candidate_state" };

    return { ok: true, event: typedCommand, idempotent_replay: false };
  } catch {
    return { ok: false, reason_code: "invalid_transition_input" };
  }
}

export type HandoffPreparation = Readonly<{
  handoff_id: string;
  prepared_at: string;
  known_fact_codes: readonly string[];
  missing_fact_codes: readonly string[];
}>;

function validCodeList(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.length <= 32 && hasUniqueValues(value) && value.every((entry) => typeof entry === "string" && BOUNDED_CODE.test(entry));
}

export function buildSalesHandoff(
  candidate: unknown,
  consent: unknown,
  preparation: unknown,
  technicalBinding: unknown = null,
): ValidationResult<SalesHandoff> {
  try {
    const validated = validateLeadCandidate(candidate, consent, technicalBinding);
    if (!validated.ok) return validated;
    if (!exactKeys(preparation, ["handoff_id", "prepared_at", "known_fact_codes", "missing_fact_codes"])) return { ok: false, reason_code: "invalid_handoff_preparation_shape" };
    if (typeof preparation.handoff_id !== "string" || !HANDOFF_ID.test(preparation.handoff_id)) return { ok: false, reason_code: "invalid_handoff_id" };
    if (!isStrictUtcTimestamp(preparation.prepared_at) || preparation.prepared_at < validated.value.updated_at) return { ok: false, reason_code: "invalid_handoff_timestamp" };
    const knownFactCodes = preparation.known_fact_codes;
    const missingFactCodes = preparation.missing_fact_codes;
    if (!validCodeList(knownFactCodes) || !validCodeList(missingFactCodes)) return { ok: false, reason_code: "invalid_handoff_fact_codes" };
    if (knownFactCodes.some((code) => missingFactCodes.includes(code))) return { ok: false, reason_code: "contradictory_handoff_fact_codes" };

    const lead = validated.value;
    const consentRecord = consent as ConsentRecord;
    const preferred = lead.preferred_contact_method === "email" ? "email" : lead.preferred_contact_method === "phone" ? "phone" : lead.phone !== null ? "phone" : "email";
    if (!consentRecord.allowed_contact_channels.includes(preferred)) return { ok: false, reason_code: "handoff_channel_not_consented" };
    const normalizedValue = preferred === "phone" ? lead.phone : lead.email;
    if (normalizedValue === null) return { ok: false, reason_code: "handoff_contact_missing" };

    const handoff: SalesHandoff = {
      schema: SALES_HANDOFF_SCHEMA,
      handoff_id: preparation.handoff_id,
      lead_candidate_id: lead.lead_candidate_id,
      prepared_at: preparation.prepared_at,
      technical_scenario_ref: lead.technical_scenario_ref,
      project_intent: lead.project_intent,
      service_area_candidate: lead.service_area_candidate,
      contact_channel: { method: preferred, normalized_value: normalizedValue },
      known_fact_codes: [...knownFactCodes],
      missing_fact_codes: [...missingFactCodes],
      qualification_reasons: [...lead.qualification_reasons],
      recommended_next_action: "owner_review",
      owner_decision: "pending",
      owner_decided_at: null,
    };
    return { ok: true, value: handoff };
  } catch {
    return { ok: false, reason_code: "invalid_handoff_input" };
  }
}
