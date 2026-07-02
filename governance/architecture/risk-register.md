# Risk Register

Status: living document. Reviewed when any related decision record is proposed.

| # | Risk | Area | Impact | Mitigation direction |
| :- | :--- | :--- | :----- | :------------------- |
| R-01 | Prompt-only guardrails let the assistant promise price/schedule or make permit/code/zoning conclusions | Overclaim / legal | High | Deterministic post-filter + refusal templates on top of prompts; forbidden-claim test suite in the lab |
| R-02 | PII leaks into logs or evidence records | Privacy / PII | High | Structural sanitization: whitelisted evidence schema; fields not in the schema are never recorded |
| R-03 | Provider default retention of audio/transcripts silently violates the no-retention boundary | Privacy / vendor | High | Official verification of each provider's retention and training-use policy before selection |
| R-04 | Latency stacking across carrier→media→STT→LLM→TTS kills the premium feel | Latency / brand | High | Latency budget per candidate stack; streaming end-to-end; measure before committing |
| R-05 | Real-time media attempted inside Next.js/Vercel serverless runtime | Architecture trap | High | Media plane is a separate service by decision (DR-0002) |
| R-06 | Vendor lock-in at the media/orchestration layer | Vendor lock-in | Medium | Choose media layer last; keep provider roles behind interfaces |
| R-07 | Per-minute cost stacking (carrier + STT + LLM + TTS) escalates | Cost | Medium | Verified pricing per candidate before selection; cost model in the architecture decision |
| R-08 | GIS screening output represented as feasibility/entitlement to a client | Legal / overclaim | High | Mandatory wording "Requires official source verification"; internal-only scores; owner review before any client-facing use |
| R-09 | Business Flow claimed as Core-integrated without verification | Source-of-truth drift | Medium | Charter states Core-compatible only; claims require verification + decision record |
| R-10 | External research treated as truth | Governance | Medium | Research Gate: research packets have zero authority until owner-adopted (DR-0005) |
| R-11 | Spanish voice quality unverified while policy promises Spanish secondary | Brand / language | Medium | Per-vendor Spanish STT/TTS quality verification in the Research Gate |
| R-12 | Single-repo SourceTrue boundary erodes (code, PII, or secrets creep into `governance/`) | Governance | Medium | DR-0001 rules; boundary checklist in templates; revisit trigger defined in DR-0001 |
| R-13 | Unbounded scope: provider config, phone routing, or Google writes happen without a task packet | Operational control | High | Hard prohibitions in BOUNDARIES.md; every action traces to an approved task packet |
| R-14 | Support burden of a custom hybrid stack exceeds a small team's capacity | Operational complexity | Medium | Sequencing keeps vendor-independent lab first; production readiness is its own decision (step 9) |
