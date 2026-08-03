# HANDOVER — Portal build v1 (builder queue)

Entry point for the builder (Codex/ChatGPT) per DR-0009. Owner directive
2026-08-03: start with visual design, GIS groundwork, and platform content.

## Rules that bind every task below

- `governance/` is the source of truth. Read `BOUNDARIES.md`, `charter.md`,
  DR-0003, DR-0004, DR-0011 (proposed), DR-0012 (proposed) before writing
  anything. Blueprint: `../architecture/portal-blueprint-v0.1.md` (adopted,
  DR-0008).
- One task = one PR, draft, owner merges. Never push to `main`.
- No vendor accounts, no tracking tags, no forms that submit anywhere, no PII,
  no price/schedule/permit/zoning/buildability claims in any visitor-facing
  string. English-only public copy (DR-0003).
- Repo is Next.js App Router on Vercel — read `AGENTS.md` at repo root first:
  this Next.js version has breaking changes; consult `node_modules/next/dist/docs/`
  before coding.
- Every uncertain screening-flavored statement carries: "Requires official
  source verification."
- Each finished task gets a RUN-NNNN record (whitelisted fields only) and a
  registry row.

## Queue (execute in order; 3 is parallel-safe)

### 1. TASK-0007 — Visual identity pass v1
See `TASK-0007-visual-identity-pass.md`.

### 2. TASK-0008 — P1 content build-out (structure & trust)
See `TASK-0008-p1-content-buildout.md`. Depends on TASK-0007 design tokens.

### 3. TASK-0009 — GIS source research, first jurisdiction (no code)
See `TASK-0009-gis-source-research.md`. Research only; output is RP-0007.
Runs parallel to 1–2.

## Owner inputs still missing (do not invent them)

- Business facts package: CSLB number, insurance/warranty terms, real project
  photos, team info → until provided, TASK-0008 uses clearly-labeled
  placeholders and publishes no credential claims.
- First jurisdiction confirmation for TASK-0009 (default: Roseville, first in
  charter list).
- DR-0011 destination choice and DR-0012 adoption — both block any intake or
  screening code. Not in this queue.
