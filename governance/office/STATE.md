# STATE — single shared board

Owner of this file: the team lead under `OPERATING-MODEL-v4` (adopted
2026-08-09, `main@9de3fbc`). Merged `main` is the only truth; this board is an
index of it, never a substitute.

Synchronized: 2026-08-09 (second sync) from `main@7cd7e2d`.

## Merged this cycle — eight Owner merges

| PR | What landed | Anchor |
| :-- | :-- | :-- |
| #121 | `OPERATING-MODEL-v4` + `DR-0017` — Claude lead, parallel Codex execution, session contract, harness-enforced no-self-merge | `9de3fbc` |
| #120 | `DESIGN-004` colour system, full-checkout verified before merge | `c9ea40a` |
| #122 | Registry synchronization; GPT-5.6 critical-fork lane; Worker 1–3 numbering; two-stream rule | `75b3c81` |
| #126 | `vitest.config.ts` — full `npm test` restored (#117) | `1f018cc` |
| #124 | Typed public route registry, sitemap derived from it (#96 safe work) | `2ab4a64` |
| #125 | `adu-executable-geometry/1` contract: 38 refusal codes, JCS canonical JSON, q16 integers, 24 mutation probes (#123) | `bd74c19` |
| #127 | Projection render-generation and namespace regression guards, mutant-verified (#116) | `5c6b48d` |
| #128 | `GEOMETRY-PROGRAM-001` shared brief + D01–D13 Owner decision surface | `7cd7e2d` |

`main` is fully green: 21 test files, 417 tests, lint and production build clean.
Issues closed this cycle: #108, #112, #116, #117, #118, #123.

## Lane occupancy

| Lane | Engagement | State |
| :--- | :--- | :--- |
| Lead | Queue, remediation, evidence, gates | active; also executed #117, #116, and the A600 correction packets after executor no-shows |
| Workers 1–3 (Codex) | — | **idle — environment defect.** All three launched sessions lacked a repository checkout (`fatal: not a git repository`); one delivered unrunnable code, one delivered nothing, one stopped correctly at preflight. Do not relaunch until sessions have a provisioned clone. |
| Critical-fork review (GPT-5.6) | #115 — A600 gate | fourth-cycle verdict pending at exact head `6fc0d96` |
| Fable 5 advisory (cross-repo) | `kbp-dev-office` PR #212 | `BLOCKED FOR REVISION` published: un-superseded iPad-console decision; stale anchors; two moderate findings |

## Geometry program — the critical path

Schema layer merged (#125). Decision surface on `main`
(`docs/shared-briefs/GEOMETRY-PROGRAM-001/DECISION.md`). A600 candidate at
PR #119 head `6fc0d96`, SHA-256 `0f45841b…`.

| Cycle | Head | Verdict | Defects |
| :-- | :-- | :-- | :-- |
| 1 | `8f6c63c1` | BLOCKED | mirrored plan projection; two evidence-free adjacency edges; three junction-colliding opening rows |
| 2 | `15586303` | BLOCKED | provenance missing on revised rows; ENTRY–HALL mislabelled opening-derived; roof plan orientation; section drawn 6.86:12 |
| 3 | `36aba39` | BLOCKED | CF-3/CF-4 closed; provenance still contradicted on metadata/footer; adjacency arrows; clipped provenance line |
| 4 | `6fc0d96` | **pending** | RF-1/RF-2/NF-1 corrections applied and lead-verified |

After a clean verdict: Owner reads `DECISION.md`, adopts/revises D01–D13 →
`ADU-A600-EXECUTABLE-PROFILE-001` → professional test fit → `/models`, Studio
migration off legacy `2026.08.0`, model-bound renders for Home.

## Rendered-evidence gate — closed at lab level

56-cell Playwright sweep on the production build at `main@7cd7e2d`: 8 routes ×
3 viewports × 2 schemes + reduced-motion controls. Zero failures: no horizontal
overflow, zero console errors, one `h1` per route, focus visible 16/16, and the
computed body background matches the adopted palette byte-exactly in both
schemes (`#F3EFE7` / `#101513`). Recorded on #118 (closed). **Lab evidence only**
— canonical-domain field evidence remains open under TASK-0013 / P0–P3.

## Cross-repository program

`kbp-dev-office` PR #212 (`PRODUCT-SYSTEM-0001`) directs one product program:
Deedseal horizontal platform, Construction OS first vertical, Codex
technical/product lead, Fable 5 advisory. The Fable advisory verdict is
`BLOCKED FOR REVISION` (B-1 un-superseded iPad decision, B-2 stale anchors).
After its revision and Owner merge there, a successor task cuts a local adoption
packet **in this repository under this repository's own operating model** —
`docs/tasks/product-system-implementation-0001/TASK.md` in that repo. Until that
local packet is Owner-merged here, v4 remains this repository's operating model
unchanged.

## Open queue

| Issue | Work | State |
| :--- | :--- | :--- |
| #115 | A600 fork gate | verdict pending, cycle 4 |
| #114 | A600 candidate | PR #119 open at `6fc0d96`, body current |
| #105 | Model-bound Home hero | blocked: Owner direction adoption + geometry-derived assets |
| #96 | IA contract adoption | registry safe-work merged; Owner decisions 1–13 of the proposal remain open |
| #91 | Current-surface route/CTA/visual audit | partially covered by the #118 lab sweep; durable RESULT still absent |
| #85/#86, #83/#84 | Reception-memory slices 3–4 | PRs open, **not Draft**; awaiting non-author review path |
| #88/#90 | Reception-memory hardening | draft, reviewed non-blocking |
| #59 | `[CONTROL]` queue issue | overlaps this board — one should link to the other |
| #64, #68, #51–#61 | Research contour | gated; `Requires official source verification.` |

## Blockers

- **Codex executor environment** — sessions need a provisioned repository clone
  before any relaunch. Three failures out of three launches.
- Canonical-domain DNS/HTTP: **NOT VERIFIED**; deployed p75 CWV absent
  (TASK-0013, P0/P3). Vercel READY is build evidence only.
- RP-0008: ten empirical fixture traces absent.
- #105 asset inputs: renders, hero pair, provenance records do not exist and
  cannot be produced by an executor lane.

## Standing constraints

- Demo posture: no contact surface, no PII, no external effect.
- Sacramento leads build order; other jurisdictions research-gated.
- No AI in the visitor-facing decision path. Studio stays 2D-first.
- One packet = one bounded outcome = one branch = one Draft PR = one declared
  file allowlist. Merge to `main` may auto-deploy. The Owner alone merges.
