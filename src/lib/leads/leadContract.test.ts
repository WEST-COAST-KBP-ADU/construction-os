import { describe, expect, it, vi } from "vitest";

import {
  CONSENT_SCHEMA,
  FUNNEL_EVENT_SCHEMA,
  LEAD_SCHEMA,
  PERMITTED_TRANSITIONS,
  SALES_HANDOFF_SCHEMA,
  TECHNICAL_SCENARIO_REF_SCHEMA,
  buildSalesHandoff,
  transitionFunnelState,
  validateConsentRecord,
  validateLeadCandidate,
  validateTechnicalScenarioReference,
  type ConsentRecord,
  type FunnelEvent,
  type LeadCandidate,
  type TechnicalScenarioReference,
} from "./leadContract";

const IDS = {
  lead: "lead_0123456789abcdef",
  consent: "consent_0123456789abcdef",
  scenario: "scenario_0123456789abcdef",
  site: "site_0123456789abcdef",
  evaluation: "evaluation_0123456789abcdef",
  journey: "journey_0123456789abcdef",
  event: "event_0123456789abcdef",
  handoff: "handoff_0123456789abcdef",
  idempotency: "idem_0123456789abcdef",
} as const;

function scenarioRef(): TechnicalScenarioReference {
  return {
    schema: TECHNICAL_SCENARIO_REF_SCHEMA,
    scenario_id: IDS.scenario,
    scenario_digest: `sha256:${"a".repeat(64)}`,
    model_id: "adu-a-450",
    model_version: "1.2.0",
    site_snapshot_id: IDS.site,
    evaluation_id: IDS.evaluation,
    created_at: "2026-08-07T18:00:00Z",
    maturity: "concept_only",
    limitations: ["concept_only", "jurisdiction_reference_only"],
  };
}

function scenarioBinding() {
  const reference = scenarioRef();
  return {
    scenario_id: reference.scenario_id,
    scenario_digest: reference.scenario_digest,
    model_id: reference.model_id,
    model_version: reference.model_version,
  };
}

function consent(): ConsentRecord {
  return {
    schema: CONSENT_SCHEMA,
    consent_record_id: IDS.consent,
    lead_candidate_id: IDS.lead,
    consent_text_version: "contact-consent/1.0.0",
    privacy_notice_version: "privacy-notice/1.0.0",
    affirmative_contact_consent: true,
    inferred: false,
    captured_at: "2026-08-07T18:01:00Z",
    originating_surface: "address_start",
    allowed_contact_channels: ["phone", "email"],
  };
}

function candidate(): LeadCandidate {
  return {
    schema: LEAD_SCHEMA,
    lead_candidate_id: IDS.lead,
    created_at: "2026-08-07T18:00:00Z",
    updated_at: "2026-08-07T18:02:00Z",
    source_channel: "organic_search",
    entry_path: "/start",
    utm: {
      source: "google",
      medium: "organic",
      campaign: "adu_property_start",
    },
    service_area_candidate: "manual_review",
    project_intent: "detached_adu",
    property_input: {
      kind: "supplied_address",
      address_text: "123 Example Street, Roseville, CA 95678",
    },
    contact_name: "Taylor Example",
    phone: "+19165550123",
    email: "taylor@example.com",
    preferred_contact_method: "phone",
    consent_record_id: IDS.consent,
    technical_scenario_ref: null,
    state: "lead_candidate",
    qualification_reasons: [
      "adu_intent_confirmed",
      "manual_geographic_review",
      "contact_and_consent_valid",
    ],
    owner_review_status: "not_reviewed",
    project_timing: "three_to_six_months",
    financing_readiness: "researching",
    budget_band: "300k_to_450k",
    occupancy_goal: "family",
    note: "Interested in a detached ADU with one bedroom.",
  };
}

function event(overrides: Partial<FunnelEvent> = {}): FunnelEvent {
  return {
    schema: FUNNEL_EVENT_SCHEMA,
    event_id: IDS.event,
    journey_id: IDS.journey,
    lead_candidate_id: null,
    from_state: "anonymous_visit",
    to_state: "property_intent",
    actor_type: "visitor",
    authority_basis: "visitor_intent",
    occurred_at: "2026-08-07T18:00:00Z",
    reason_code: "visitor_property_start",
    idempotency_key: IDS.idempotency,
    ...overrides,
  };
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value as Record<string, unknown>)) deepFreeze(nested);
  }
  return value;
}

describe("lead-candidate/1 validation", () => {
  it("accepts a fully bound provider-neutral candidate", () => {
    expect(validateLeadCandidate(candidate(), consent())).toEqual({ ok: true, value: candidate() });
  });

  it("requires and verifies the exact immutable technical scenario binding", () => {
    const input = { ...candidate(), technical_scenario_ref: scenarioRef() };
    expect(validateLeadCandidate(input, consent())).toEqual({ ok: false, reason_code: "technical_binding_required" });
    expect(validateLeadCandidate(input, consent(), scenarioBinding()).ok).toBe(true);
    expect(validateLeadCandidate(input, consent(), { ...scenarioBinding(), scenario_digest: `sha256:${"b".repeat(64)}` })).toEqual({
      ok: false,
      reason_code: "technical_binding_mismatch",
    });
    expect(validateLeadCandidate(input, consent(), { ...scenarioBinding(), customer_email: "pii@example.com" })).toEqual({
      ok: false,
      reason_code: "invalid_technical_binding_shape",
    });
    const futureReference = { ...scenarioRef(), created_at: "2026-08-07T18:03:00Z" };
    expect(validateLeadCandidate({ ...input, technical_scenario_ref: futureReference }, consent(), scenarioBinding())).toEqual({
      ok: false,
      reason_code: "technical_reference_from_future",
    });
  });

  it("accepts phone-first intent without a property only through the explicit marker", () => {
    const input = candidate();
    const phoneCandidate = {
      ...input,
      source_channel: "phone" as const,
      property_input: { kind: "absent" as const, reason: "phone_first_no_property" as const },
      service_area_candidate: "manual_review" as const,
    };
    const phoneConsent = { ...consent(), originating_surface: "phone_intake" as const };
    expect(validateLeadCandidate(phoneCandidate, phoneConsent).ok).toBe(true);
    expect(validateLeadCandidate({ ...phoneCandidate, source_channel: "direct" }, phoneConsent)).toEqual({
      ok: false,
      reason_code: "absent_property_requires_phone_path",
    });
  });

  it.each([
    ["candidate", () => ({ ...candidate(), municipal_plan_id: "foreign" })],
    ["UTM", () => ({ ...candidate(), utm: { source: "google", click_id: "foreign" } })],
    ["property", () => ({ ...candidate(), property_input: { ...candidate().property_input, apn: "forbidden" } })],
    ["technical reference", () => ({ ...candidate(), technical_scenario_ref: { ...scenarioRef(), customer_email: "pii@example.com" } })],
  ])("rejects unknown keys at the %s level", (_label, makeInput) => {
    expect(validateLeadCandidate(makeInput(), consent()).ok).toBe(false);
  });

  it("requires at least one contact method", () => {
    expect(validateLeadCandidate({ ...candidate(), phone: null, email: null }, consent())).toEqual({
      ok: false,
      reason_code: "contact_method_required",
    });
  });

  it.each([
    ["phone", { phone: "916-555-0123" }, "invalid_phone"],
    ["email normalization", { email: "Taylor@Example.com" }, "invalid_email"],
    ["email shape", { email: "not-an-email" }, "invalid_email"],
    ["address", { property_input: { kind: "supplied_address", address_text: "x".repeat(241) } }, "invalid_or_oversized_address"],
    ["name", { contact_name: "x".repeat(101) }, "invalid_or_oversized_contact_name"],
    ["note", { note: "x".repeat(1001) }, "invalid_or_oversized_note"],
    ["entry path", { entry_path: `/${"x".repeat(128)}` }, "invalid_entry_path"],
    ["source", { source_channel: "search_engine" }, "invalid_source_channel"],
  ])("rejects invalid or oversized %s", (_label, override, reason) => {
    expect(validateLeadCandidate({ ...candidate(), ...override }, consent())).toEqual({
      ok: false,
      reason_code: reason,
    });
  });

  it("rejects oversized and empty UTM values", () => {
    expect(validateLeadCandidate({ ...candidate(), utm: { campaign: "x".repeat(101) } }, consent())).toEqual({ ok: false, reason_code: "invalid_or_oversized_utm" });
    expect(validateLeadCandidate({ ...candidate(), utm: {} }, consent())).toEqual({ ok: false, reason_code: "invalid_utm_shape" });
  });

  it("rejects missing, false, inferred, stale-shape, and unbound consent", () => {
    expect(validateLeadCandidate(candidate(), null).ok).toBe(false);
    expect(validateLeadCandidate(candidate(), { ...consent(), affirmative_contact_consent: false })).toEqual({ ok: false, reason_code: "consent_not_affirmative" });
    expect(validateLeadCandidate(candidate(), { ...consent(), inferred: true })).toEqual({ ok: false, reason_code: "inferred_consent_forbidden" });
    expect(validateLeadCandidate(candidate(), { ...consent(), accepted_terms: true }).ok).toBe(false);
    expect(validateLeadCandidate(candidate(), { ...consent(), lead_candidate_id: "lead_ffffffffffffffff" })).toEqual({ ok: false, reason_code: "consent_binding_mismatch" });
  });

  it("rejects a contact channel not covered by affirmative consent", () => {
    expect(validateLeadCandidate(candidate(), { ...consent(), allowed_contact_channels: ["phone"] })).toEqual({ ok: false, reason_code: "email_not_consented" });
  });

  it.each([
    ["2026-02-29T18:00:00Z", "invalid_candidate_timestamps"],
    ["2026-04-31T18:00:00Z", "invalid_candidate_timestamps"],
    ["2026-08-07T24:00:00Z", "invalid_candidate_timestamps"],
    ["2026-08-07T18:00:00.000Z", "invalid_candidate_timestamps"],
  ])("rejects normalized or impossible candidate timestamp %s", (created_at, reason) => {
    expect(validateLeadCandidate({ ...candidate(), created_at }, consent())).toEqual({ ok: false, reason_code: reason });
  });

  it("accepts a real Gregorian leap day", () => {
    const input = { ...candidate(), created_at: "2024-02-29T18:00:00Z", updated_at: "2026-08-07T18:02:00Z" };
    expect(validateLeadCandidate(input, consent()).ok).toBe(true);
  });

  it("does not throw for arbitrary untrusted input", () => {
    for (const input of [null, undefined, 1, "lead", [], {}, { schema: LEAD_SCHEMA }]) {
      expect(() => validateLeadCandidate(input, input)).not.toThrow();
      expect(validateLeadCandidate(input, input).ok).toBe(false);
    }
  });

  it("leaves deeply frozen candidate and consent inputs byte-identical", () => {
    const input = deepFreeze(candidate());
    const consentInput = deepFreeze(consent());
    const before = JSON.stringify({ input, consentInput });
    expect(validateLeadCandidate(input, consentInput).ok).toBe(true);
    expect(JSON.stringify({ input, consentInput })).toBe(before);
  });
});

describe("technical scenario and consent isolation", () => {
  it("accepts an exact immutable technical reference", () => {
    expect(validateTechnicalScenarioReference(scenarioRef()).ok).toBe(true);
  });

  it.each([
    ["mutable model alias", { model_version: "latest" }, "mutable_or_invalid_model_version"],
    ["digest shape", { scenario_digest: "sha256:abc" }, "invalid_scenario_digest"],
    ["scenario identifier shape", { scenario_id: "scenario_customer@example.com" }, "invalid_scenario_id"],
    ["site identifier with PII", { site_snapshot_id: "site_9165550123@example.com" }, "invalid_site_snapshot_id"],
    ["free-text limitation", { limitations: ["call Jane at 9165550123"] }, "invalid_technical_limitations"],
  ])("rejects %s", (_label, override, reason) => {
    expect(validateTechnicalScenarioReference({ ...scenarioRef(), ...override })).toEqual({ ok: false, reason_code: reason });
  });

  it("rejects unknown consent keys and impossible consent dates", () => {
    expect(validateConsentRecord({ ...consent(), prechecked: false }).ok).toBe(false);
    expect(validateConsentRecord({ ...consent(), captured_at: "2026-02-29T18:00:00Z" })).toEqual({ ok: false, reason_code: "invalid_consent_timestamp" });
  });
});

describe("deterministic funnel transition", () => {
  it.each(PERMITTED_TRANSITIONS)("permits $from → $to with exact authority", (rule) => {
    const command = event({
      event_id: `event_${rule.from.padEnd(16, "0").replaceAll("_", "0")}`.slice(0, 70),
      lead_candidate_id: ["property_intent", "screening_candidate"].includes(rule.to) ? null : IDS.lead,
      from_state: rule.from,
      to_state: rule.to,
      actor_type: rule.actor,
      authority_basis: rule.basis,
      reason_code: rule.reason,
    });
    expect(transitionFunnelState(command)).toEqual({ ok: true, event: command, idempotent_replay: false });
  });

  it.each(["approved_for_contact", "contacted", "consultation", "proposal", "won", "lost"] as const)("rejects automated actors attempting the human-only %s state", (to) => {
    const rule = PERMITTED_TRANSITIONS.find((entry) => entry.to === to);
    expect(rule).toBeDefined();
    const command = event({
      lead_candidate_id: IDS.lead,
      from_state: rule!.from,
      to_state: rule!.to,
      actor_type: "deterministic_system",
      authority_basis: rule!.basis,
      reason_code: rule!.reason,
    });
    expect(transitionFunnelState(command)).toEqual({ ok: false, reason_code: "human_authority_required" });
  });

  it("rejects skipped, circular, and terminal-state transitions", () => {
    expect(transitionFunnelState(event({ from_state: "lead_candidate", to_state: "proposal", lead_candidate_id: IDS.lead }))).toEqual({ ok: false, reason_code: "illegal_funnel_transition" });
    expect(transitionFunnelState(event({ from_state: "contacted", to_state: "contacted", lead_candidate_id: IDS.lead }))).toEqual({ ok: false, reason_code: "illegal_funnel_transition" });
    for (const terminal of ["won", "lost", "rejected", "archived"] as const) {
      expect(transitionFunnelState(event({ from_state: terminal, to_state: "property_intent", lead_candidate_id: IDS.lead }))).toEqual({ ok: false, reason_code: "terminal_state_transition_forbidden" });
    }
  });

  it("rejects technical reference_consistent as transition authority", () => {
    const command = { ...event({
      lead_candidate_id: IDS.lead,
      from_state: "owner_review_required",
      to_state: "approved_for_contact",
      actor_type: "authorized_human",
      authority_basis: "human_decision",
      reason_code: "owner_approved_contact",
    }), reason_code: "reference_consistent" };
    expect(transitionFunnelState(command)).toEqual({ ok: false, reason_code: "invalid_event_reason_code" });
  });

  it("returns a byte-identical event for an exact idempotent replay", () => {
    const command = event();
    const result = transitionFunnelState(command, [structuredClone(command)]);
    expect(result).toEqual({ ok: true, event: command, idempotent_replay: true });
    expect(JSON.stringify(result.ok && result.event)).toBe(JSON.stringify(command));
  });

  it("rejects idempotency conflicts and duplicate event identifiers", () => {
    const command = event();
    expect(transitionFunnelState({ ...command, occurred_at: "2026-08-07T18:00:01Z" }, [command])).toEqual({ ok: false, reason_code: "idempotency_conflict" });
    expect(transitionFunnelState({ ...command, idempotency_key: "idem_ffffffffffffffff" }, [command])).toEqual({ ok: false, reason_code: "duplicate_event_id" });
  });

  it("rejects PII and unknown keys in bounded events", () => {
    expect(transitionFunnelState({ ...event(), email: "person@example.com" }).ok).toBe(false);
    expect(transitionFunnelState({ ...event(), journey_id: "journey_person@example.com" })).toEqual({ ok: false, reason_code: "invalid_journey_id" });
    expect(transitionFunnelState({ ...event(), reason_code: "+19165550123" })).toEqual({ ok: false, reason_code: "invalid_event_reason_code" });
  });

  it("is pure, clock-free, deterministic, and preserves frozen inputs", () => {
    const command = deepFreeze(event());
    const before = JSON.stringify(command);
    const now = vi.spyOn(Date, "now").mockReturnValueOnce(1).mockReturnValueOnce(9999999999999);
    const left = transitionFunnelState(command);
    const right = transitionFunnelState(command);
    expect(JSON.stringify(left)).toBe(JSON.stringify(right));
    expect(JSON.stringify(command)).toBe(before);
    expect(now).not.toHaveBeenCalled();
    now.mockRestore();
  });

  it("never throws for malformed commands or prior events", () => {
    for (const input of [null, {}, [], "event", { schema: FUNNEL_EVENT_SCHEMA }]) {
      expect(() => transitionFunnelState(input, [input])).not.toThrow();
      expect(transitionFunnelState(input, [input]).ok).toBe(false);
    }
  });
});

describe("sanitized human-review handoff", () => {
  it("builds a deterministic bounded packet without note or UTM payloads", () => {
    const preparation = {
      handoff_id: IDS.handoff,
      prepared_at: "2026-08-07T18:03:00Z",
      known_fact_codes: ["contact_valid", "adu_intent_known"],
      missing_fact_codes: ["site_review_pending"],
    };
    const first = buildSalesHandoff(candidate(), consent(), preparation);
    const second = buildSalesHandoff(candidate(), consent(), preparation);
    expect(first).toEqual(second);
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    expect(first.value.schema).toBe(SALES_HANDOFF_SCHEMA);
    expect(first.value.contact_channel).toEqual({ method: "phone", normalized_value: "+19165550123" });
    expect(JSON.stringify(first.value)).not.toContain("Interested in");
    expect(JSON.stringify(first.value)).not.toContain("adu_property_start");
    expect(JSON.stringify(first.value)).not.toContain("taylor@example.com");
  });

  it("rejects unknown preparation keys, raw facts, contradictions, and stale timestamps", () => {
    const base = {
      handoff_id: IDS.handoff,
      prepared_at: "2026-08-07T18:03:00Z",
      known_fact_codes: ["contact_valid"],
      missing_fact_codes: ["site_review_pending"],
    };
    expect(buildSalesHandoff(candidate(), consent(), { ...base, raw_note: "PII" }).ok).toBe(false);
    expect(buildSalesHandoff(candidate(), consent(), { ...base, known_fact_codes: ["contact person@example.com"] })).toEqual({ ok: false, reason_code: "invalid_handoff_fact_codes" });
    expect(buildSalesHandoff(candidate(), consent(), { ...base, missing_fact_codes: ["contact_valid"] })).toEqual({ ok: false, reason_code: "contradictory_handoff_fact_codes" });
    expect(buildSalesHandoff(candidate(), consent(), { ...base, prepared_at: "2026-08-07T18:01:00Z" })).toEqual({ ok: false, reason_code: "invalid_handoff_timestamp" });
  });

  it("does not mutate deeply frozen inputs", () => {
    const lead = deepFreeze(candidate());
    const consentInput = deepFreeze(consent());
    const preparation = deepFreeze({
      handoff_id: IDS.handoff,
      prepared_at: "2026-08-07T18:03:00Z",
      known_fact_codes: ["contact_valid"],
      missing_fact_codes: ["site_review_pending"],
    });
    const before = JSON.stringify({ lead, consentInput, preparation });
    expect(buildSalesHandoff(lead, consentInput, preparation).ok).toBe(true);
    expect(JSON.stringify({ lead, consentInput, preparation })).toBe(before);
  });
});
