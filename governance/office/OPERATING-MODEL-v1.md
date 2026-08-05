# Operating Model v1 — role split and shared coordination plane

Status: **SUPERSEDED by `OPERATING-MODEL-v2.md`** (owner directive, 2026-08-04).
Retained for provenance. Where v1 and v2 differ, v2 controls: Claude holds
operational control and issues work orders; ChatGPT is a bounded worker.
Date: 2026-08-04. Audience: both AI engineers and the owner.

## 1. Why

Both engineers have been doing overlapping generalist work. This document
splits the product's needed roles into two non-overlapping portfolios with one
shared state surface, so work runs in parallel lanes instead of in sequence.

## 2. Roles the product needs, and who holds each

| # | Role | Holder | Notes |
| :- | :--- | :----- | :---- |
| 1 | Product owner / final authority | **Owner** | Only merge/approve authority. One action at a time. |
| 2 | System architect | **Claude** | Architecture records, trust boundaries, Core compatibility |
| 3 | Reviewer / adversarial analyst | **Claude** | Reviews builder PRs and external plans (REVIEW-NNNN) |
| 4 | Registrar / SourceTrue keeper | **Claude** | DR/TASK/RP/RUN registries, STATE board, numbering |
| 5 | Privacy & boundary officer | **Claude** | BOUNDARIES/DR-0004 enforcement in every review |
| 6 | Lead implementation engineer | **ChatGPT** | App code, components, routes, tests |
| 7 | UI / interface designer | **ChatGPT** | Design tokens, layout, motion; owner picks concepts |
| 8 | Visual/content producer | **ChatGPT** | Imagery pipeline, curated catalog assets, copy drafts |
| 9 | SEO / AI-search engineer | **ChatGPT** | JSON-LD, llms.txt, sitemap, city-page retrieval quality |
| 10 | GIS research engineer | **ChatGPT** | RP-000N source research (needs live web access) |
| 11 | QA / evidence engineer | **ChatGPT** | Tests, Lighthouse/CWV runs, golden screenshots, RUN records |
| 12 | DevOps (Vercel/GitHub hygiene) | **Owner + Claude** | Owner clicks; Claude diagnoses and preps exact steps |
| 13 | Voice/media architect (future) | **Claude** (design) → **ChatGPT** (build) | Dormant until lead-gen phase opens |
| 14 | Legal/licensing checkpoints | **Owner + counsel** | AI flags, never concludes |

Rule of thumb: **ChatGPT produces; Claude verifies and records; the owner
decides.** Claude does not write app code (DR-0009 exception only by explicit
owner request). ChatGPT does not edit governance records other than its own
RUN records and registry status cells.

## 3. Parallel lanes (this is where ×2 comes from)

Three lanes that never block each other:

- **Lane A — build (ChatGPT):** current queue §6 of HANDOVER-portal-v1:
  visual close-out → TASK-0012 studio spike → TASK-0011 last.
- **Lane B — research (ChatGPT, parallel-safe):** RP-0008 Sacramento GIS;
  future RP-NNNN. Research never touches app code, so it can run alongside
  Lane A.
- **Lane C — governance & review (Claude):** reviews of every Lane A PR,
  decision-record drafting, architecture for the next phase (voice, intake,
  price book), STATE board upkeep.

The owner's serial bottleneck (merges) stays serial by design — everything
else parallelizes.

## 4. Shared coordination plane

**The repository is the only shared memory.** Chats are volatile; neither
engineer sees the other's chat. Anything not committed does not exist.

Single state surface: `governance/office/STATE.md` — one screen, current
truth. Claude owns the file; ChatGPT updates only its own lane rows via PR.
Format is fixed (see the file). Every PR that changes lane state must update
its row in the same PR.

Handoff protocol:

1. Owner directive → Claude converts to TASK/DR record + STATE row.
2. ChatGPT builds on a branch, opens **draft PR**, fills evidence, updates its
   STATE row and RUN record in the same PR.
3. Claude reviews the PR (boundaries, claims, evidence), posts verdict in the
   PR, updates STATE.
4. Owner merges. Merge = the only state that counts as done.

Cross-engineer questions travel as files (`governance/reviews/REVIEW-NNNN`),
not as chat retellings — the 2026-08-04 roadmap/REVIEW-0001 exchange is the
working precedent.

## 5. Collision rules

- One file domain, one writer: `app/`+`src/` = ChatGPT; `governance/` =
  Claude, except RUN-NNNN files and a task's own registry status cell.
- One task = one branch = one draft PR. No second PR touching the same files
  while the first is open.
- Numbering (DR/TASK/RP/RUN/REVIEW) is allocated by Claude only — ask before
  taking a number.
- Disagreement between engineers → both positions in one file → owner picks.
  No silent overrides.

## 6. Acknowledgment

ChatGPT: reply in your next PR description with `operating-model: v1 ack` and
follow §4–5 from then on. Objections go into a REVIEW-NNNN file, not prose in
chat.
