import { describe, expect, it, vi } from "vitest";
import { TENANT_ID } from "./receptionMemoryContract";
import { createEmptyMemoryLifecycleState } from "./memoryLifecycleEngine";
import { RECEPTION_REQUEST_SCHEMA, SEMANTIC_FIXTURE_SCHEMA, computeSemanticDigest, createReceptionOrchestratorState, orchestrateReception, resolveSemanticFixture } from "./receptionOrchestrator";

const AT = "2026-08-08T08:00:00Z";
const semantic = { intent: "disclose_memory" as const, subject_slot: "bound_subject", project_slot: null, purpose_slot: "current_session_service" as const };
const request = (overrides: Record<string, unknown> = {}) => ({ schema: RECEPTION_REQUEST_SCHEMA, request_id: "request_aaaaaaaaaaaaaaaa", tenant_id: TENANT_ID, subject_id: "subject_aaaaaaaaaaaaaaaa", project_id: null, purpose: "current_session_service", session_id: "session_aaaaaaaaaaaaaaaa", audience: "west_coast_kbp_reception", locale: "en", channel: "web_text", evaluated_at: AT, from_state: "anonymous", to_state: "disclosed", semantic, identity: null, consent: null, policy_request: null, lifecycle_command: null, ...overrides });
const graph = { tenant_id: TENANT_ID, nodes: [], edges: [] } as const;

describe("channel-neutral reception orchestration", () => {
  it("accepts disclosure as the first transition and deeply freezes output", async () => {
    const input = request(); const before = structuredClone(input);
    const result = await orchestrateReception(createReceptionOrchestratorState(), input, graph, createEmptyMemoryLifecycleState());
    expect(result.ok).toBe(true); expect(input).toEqual(before);
    if (!result.ok) return;
    expect(result.state.reception_state).toBe("disclosed");
    expect(Object.isFrozen(result)).toBe(true); expect(Object.isFrozen(result.evidence)).toBe(true);
  });
  it("replays an identical request byte-identically", async () => {
    const first = await orchestrateReception(createReceptionOrchestratorState(), request(), graph, createEmptyMemoryLifecycleState());
    expect(first.ok).toBe(true); if (!first.ok) return;
    const replay = await orchestrateReception(first.state, structuredClone(request()), graph, createEmptyMemoryLifecycleState());
    expect(replay).toEqual(first);
  });
  it("refuses a changed replay", async () => {
    const first = await orchestrateReception(createReceptionOrchestratorState(), request(), graph, createEmptyMemoryLifecycleState());
    expect(first.ok).toBe(true); if (!first.ok) return;
    expect(await orchestrateReception(first.state, request({ locale: "es" }), graph, createEmptyMemoryLifecycleState())).toEqual({ ok: false, reason_code: "semantic_replay_mismatch" });
  });
  it("refuses extra keys and never throws", async () => {
    expect(await orchestrateReception(createReceptionOrchestratorState(), request({ raw_transcript: "forbidden" }), graph, createEmptyMemoryLifecycleState())).toEqual({ ok: false, reason_code: "invalid_request_shape" });
    const hostile = Object.create(null); Object.defineProperty(hostile, "schema", { get() { throw new Error("hostile"); } });
    expect(await orchestrateReception(hostile, request(), graph, createEmptyMemoryLifecycleState())).toEqual({ ok: false, reason_code: "invalid_orchestrator_state" });
  });
  it("keeps future voice and phone contract-ready but inactive", async () => {
    for (const channel of ["web_voice", "phone"]) expect(await orchestrateReception(createReceptionOrchestratorState(), request({ channel }), graph, createEmptyMemoryLifecycleState())).toEqual({ ok: false, reason_code: "channel_inactive" });
  });
  it("refuses cross-purpose, cross-session, and channel widening", async () => {
    expect(await orchestrateReception(createReceptionOrchestratorState(), request({ purpose: "project_continuity" }), graph, createEmptyMemoryLifecycleState())).toEqual({ ok: false, reason_code: "semantic_binding_mismatch" });
    expect(await orchestrateReception(createReceptionOrchestratorState(), request({ lifecycle_command: { tenant_id: TENANT_ID } }), graph, createEmptyMemoryLifecycleState())).toEqual({ ok: false, reason_code: "semantic_binding_mismatch" });
  });
  it("refuses terminal-state resume", async () => {
    const state = { reception_state: "ended", last_request_id: null, last_request_digest: null, last_result: null };
    expect(await orchestrateReception(state, request({ from_state: "ended", to_state: "ended" }), graph, createEmptyMemoryLifecycleState())).toEqual({ ok: false, reason_code: "terminal_state" });
  });
  it("does not consult an ambient clock", async () => {
    const now = vi.spyOn(Date, "now").mockImplementation(() => { throw new Error("clock"); });
    expect((await orchestrateReception(createReceptionOrchestratorState(), request(), graph, createEmptyMemoryLifecycleState())).ok).toBe(true);
    expect(now).not.toHaveBeenCalled(); now.mockRestore();
  });
});

describe("EN/ES/RU closed semantic harness", () => {
  const fixtures = [
    { locale: "en", intent_token: "disclose", subject_token: "subject", purpose_token: "session" },
    { locale: "es", intent_token: "divulgar", subject_token: "sujeto", purpose_token: "sesion" },
    { locale: "ru", intent_token: "раскрытие", subject_token: "субъект", purpose_token: "сессия" },
  ] as const;
  it("produces one canonical semantic material and digest in all locales", async () => {
    const results = await Promise.all(fixtures.map((f) => resolveSemanticFixture({ schema: SEMANTIC_FIXTURE_SCHEMA, ...f, project_token: null })));
    expect(results.every((x) => x.ok)).toBe(true);
    const accepted = results.filter((x): x is Extract<typeof x, { ok: true }> => x.ok);
    expect(new Set(accepted.map((x) => x.semantic_digest)).size).toBe(1);
    expect(accepted.map((x) => x.value)).toEqual([semantic, semantic, semantic]);
    expect(accepted[0].semantic_digest).toBe(await computeSemanticDigest(semantic));
  });
  it("refuses unknown locale, token, mixed locale, missing slot, and extra key", async () => {
    const base = { schema: SEMANTIC_FIXTURE_SCHEMA, locale: "en", intent_token: "disclose", subject_token: "subject", project_token: null, purpose_token: "session" };
    expect((await resolveSemanticFixture({ ...base, locale: "de" })).ok).toBe(false);
    expect(await resolveSemanticFixture({ ...base, intent_token: "unknown" })).toEqual({ ok: false, reason_code: "unknown_semantic_token" });
    expect(await resolveSemanticFixture({ ...base, subject_token: "sujeto" })).toEqual({ ok: false, reason_code: "mixed_locale_tokens" });
    const missing = { schema: base.schema, locale: base.locale, intent_token: base.intent_token, subject_token: base.subject_token, project_token: base.project_token };
    expect((await resolveSemanticFixture(missing)).ok).toBe(false);
    expect((await resolveSemanticFixture({ ...base, extra: true })).ok).toBe(false);
  });
});
