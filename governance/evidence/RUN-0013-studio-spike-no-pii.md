# RUN-0013: Concept Studio spike — no PII, no capture, 2D-first

- **Task packet:** TASK-0013
- **Timestamp:** 2026-08-04T22:57:37Z
- **Executor:** Codex builder
- **Result:** partial — engineering checks accepted; browser and deployed performance evidence pending

## What was done

Prepared the selected Editorial Workbench as a deterministic `/studio` implementation on
`main@c10ed964455288865cbf981c47bad326717eaba0`. The visitor can explore three curated archetypes, data-defined option
compatibility, in-memory comparison, and a stable SHA-256 configuration identifier. No address,
contact, price, GIS, AI, persistence, or external provider path is introduced.

## Evidence (whitelisted fields only)

| Field | Value |
| :---- | :---- |
| timestamp | 2026-08-04T22:57:37Z |
| test variant ID | `task-0013-editorial-workbench-candidate` |
| event type | `local_candidate_validation` |
| accept/reject result | partial — 63/63 tests, lint, TypeScript and production build passed; visual acceptance remains blocked |
| latency marker | production compile 5.0 s; deployed LCP/INP/CLS not measured |
| error class | `cloud_browser_runtime_initialization_failed` |
| sanitized summary | `/studio` is statically prerendered. Deterministic replay, SHA-256 known vector, data-defined refusal, fail-closed construction, and source-level zero-egress/capture/storage probes passed. Cloud browser failed before tab acquisition, so desktop/mobile screenshots, interaction evidence, console inspection, HAR and deployed Core Web Vitals are not asserted. |

## Boundary status

- No PII, address, form, capture, contact surface, storage, pricing, GIS, AI, WebGL, or new dependency.
- Catalog assets are repository-controlled conceptual images with explicit license rows.
- Candidate configurations remain in browser memory and are not sent or persisted.
- Conceptual-project and no-buildability/no-price/no-schedule disclaimers remain visible.

## Open acceptance gates

- Browser-rendered desktop and mobile comparison against the selected Editorial Workbench.
- Interaction, keyboard/focus, console, and first-party-only network evidence.
- Deployed p75 LCP, INP, and CLS measurements on the exact PR head.
- SHA-pinned non-author review and Owner disposition.
