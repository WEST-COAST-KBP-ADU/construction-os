# STATE — single shared board

Owner of this file: the team lead under `OPERATING-MODEL-v4` (adopted
2026-08-09, `main@9de3fbc`). Merged `main` is the only truth; this board is an
index of it, never a substitute.

Synchronized: 2026-08-09 from `main@c9ea40a`, against 19 open Issues and 10 open
PRs read from GitHub at that anchor.

## Lane occupancy

Executor lanes are numbered Worker 1–3 by Owner convention (2026-08-09); each
worker is one external Codex session running one packet at a time.

| Lane | Packet | State |
| :--- | :----- | :---- |
| Worker 1 | #123 `EXECUTABLE-GEOMETRY-SCHEMA-001` | DISPATCH issued; launch pending |
| Worker 2 | #117 `TEST-HARNESS-ALIAS-001`, then #116 `STUDIO-PROJECTION-COVERAGE-001` | DISPATCH issued; launch pending |
| Worker 3 | #96 `IA-REGISTRY-001` | DISPATCH issued; launch pending |
| Independent review | non-author lane | idle; engaged at each executor RESULT |
| Critical-fork review | #115 — GPT-5.6, dual-key with Fable 5 | arms when #114 publishes its final result |

## Recently adopted by Owner merge

- `OPERATING-MODEL-v4` and `DR-0017` — PR #121, `main@9de3fbc`. Claude lead,
  parallel Codex execution, session contract, harness-enforced no-self-merge.
- `DESIGN-004` colour system — PR #120, `main@c9ea40a`. Two files:
  `app/globals.css`, `src/lib/visualSystem.test.ts`. Full-checkout verification
  at the reviewed head is recorded on the PR: 384 tests pass, lint clean, build
  succeeds.
- `STUDIO-MODEL-PROJECTION-001` — PR #109, `main@4bb02f3`.

## Open queue

### Engineering

| Issue | Work | State |
| :--- | :--- | :--- |
| #117 | Restore full `npm test` on `main` | dispatched — no `vitest.config.ts` exists, so the tsconfig `@/*` alias does not resolve under vitest and `src/lib/homepage.test.ts` fails at import |
| #116 | Projection generation and namespace regression guards | dispatched |
| #115 | Adversarial decision review of the geometry foundation | prepared; decision-fork lane |
| #108 | Fail-closed canonical model read projection | PR #109 merged; verify remaining scope, then close or re-scope |

### Landing and public surface

| Issue | Work | State |
| :--- | :--- | :--- |
| #105 | Owned model-bound Home hero and asset provenance contract | next landing dispatch |
| #96 | Public route, navigation, and CTA contract | queued behind #105 |
| #114 | A600 dimensioned owner-gate design candidate | Draft PR #119 open |
| #91 | Independent current-surface route, CTA, and visual audit | open |
| #118 | Colour system and token normalization | PR #120 merged; verify token-normalization scope, then close or re-scope |

### Reception memory — architecture contour

| Issue | PR | State |
| :--- | :--- | :--- |
| #88 | #90 (draft) | reviewed non-blocking hardening, not closed |
| #85 | #86 | open, **not Draft** |
| #83 | #84 | open, **not Draft** |

### Research — gated

`#68` material sourcing, `#64` PRODUCT-001 architecture review packet, `#60`,
`#53`, `#51` pre-approved ADU plan verification (PRs #61, #54, #52, #44, #45,
#43). All research output remains a proposal until an Owner gate is recorded,
and any jurisdiction or feasibility statement carries
`Requires official source verification.`

## Divergence and hygiene findings

- **Issue #112 is superseded.** `OPERATING-MODEL-004` was Owner-adopted on
  2026-08-08 but lived only as Issue text; `OPERATING-MODEL-v4` now carries that
  shape in committed bytes. #112 also still pins `main@65164b9` and calls PR #109
  an active mutation; both are stale. Close it against v4.
- **Three PRs were open rather than Draft** — #120 was merged from that state,
  and #86 and #84 remain open. The standing rule is Draft until the Owner gate.
  Either restore Draft or change the rule deliberately.
- **Issue #59** `[CONTROL] Product 2 ordered execution queue` overlaps this
  board. One of the two is the queue; the other should link to it.

## Blockers unchanged by this synchronization

- Canonical-domain DNS and HTTP behaviour remain **NOT VERIFIED**. A green Vercel
  check is build evidence, not proof the owner-visible domain serves those bytes.
- Deployed p75 LCP/INP/CLS for TASK-0013 remains unavailable; lab measurement is
  not field evidence.
- RP-0008 remains partial: ten empirical fixture traces are absent.
- Rendered viewport, dark-scheme, and reduced-motion matrices for the merged
  colour system remain unverified.

## Standing constraints

- Demo posture: no contact surface, no PII, no external effect.
- Sacramento leads build order; other jurisdictions require official-source
  research before a page exists.
- No AI in the visitor-facing decision path. Studio stays 2D-first.
- One packet = one bounded outcome = one branch = one Draft PR = one declared
  file allowlist. Merge to `main` may auto-deploy. The Owner alone merges.
