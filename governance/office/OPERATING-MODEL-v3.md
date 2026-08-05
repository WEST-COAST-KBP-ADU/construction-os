# Operating Model v3 — owner-directed dual-lane control

Status: proposed by owner directive, 2026-08-05. On owner merge, supersedes
OPERATING-MODEL-v2.
Base: `main@9f7c06d409ba1ba2eb7f82a2e306ad7f55cdb64e`.

## 1. Decision

The Owner appointed ChatGPT as the current operational lead for Construction OS
and directed continuous product execution. This version removes the stale
model-specific ownership in v2 while preserving the controls that matter:
bounded work, one writer per file domain, independent review, evidence, and
owner-only merge.

## 2. Roles and authority

| Role | Holds | Cannot |
| :--- | :---- | :----- |
| **Owner** | Principal decisions, phase opening, budget, business facts, irreversible or outward-facing actions, and merge. | Delegate final approval or merge by implication. |
| **Operational lead / registrar — ChatGPT** | Maintains the queue, allocates record numbers, writes work orders, assigns builder and reviewer lanes, maintains governance indexes, and escalates only owner decisions or hard blockers. | Merge, approve its own work, waive boundaries or evidence, or act outside an issued order when serving as builder. |
| **Builder — assigned per work order** | Implements exactly one issued work order and produces evidence in one branch and one Draft PR. ChatGPT or Claude may serve as builder. | Expand scope, merge, mark Ready, or independently validate its own work. |
| **Independent reviewer — non-author lane** | Reviews the exact PR head SHA, runs or inspects required probes, and issues PASS or CHANGES REQUESTED. The default reviewer for ChatGPT-authored work is Claude; the default reviewer for Claude-authored work is ChatGPT. | Modify product bytes in the same review engagement, approve its own work, merge, or treat green CI as owner approval. |

Each engagement declares one role. A participant that authored or repaired the
product change cannot be its independent reviewer at that head SHA.

## 3. Controlled loop

1. The Owner opens a phase or makes a principal decision when needed.
2. The operational lead writes a committed `WORK-ORDER-NNN` with a pinned base,
   owned paths, non-goals, acceptance evidence, and blocker behavior.
3. The assigned builder executes exactly that order in one branch and opens one
   Draft PR.
4. A non-author reviewer evaluates the exact head SHA and records PASS or
   CHANGES REQUESTED. A new commit invalidates the verdict.
5. The Owner alone merges. Merge to `main` remains production-release
   authorization where auto-deploy applies.
6. The operational lead refreshes `STATE.md` and issues the next bounded order.

## 4. Work-order and collision rules

- A committed work order is the only authorization for builder mutations.
- One order = one bounded scope = one branch = one Draft PR.
- `app/`, `src/`, `public/`, and tests belong to the assigned builder for that
  order. Governance records belong to the operational lead, except the builder's
  allocated RUN record and its own lane status explicitly listed by the order.
- No participant writes to the same file domain concurrently.
- All DR, TASK, RP, RUN, REVIEW, and WORK-ORDER numbers are allocated by the
  registrar and checked against merged `main` and open PRs before use.

## 5. Blockers and evidence

Blocked work stops at the exact failed precondition or command. The builder does
not guess, silently descope, bypass credentials, or substitute local behavior
for deployed evidence. Claims require committed bytes plus the relevant test,
CI, browser, screenshot, measurement, or official-source artifact.

## 6. Standing boundaries

`BOUNDARIES.md` and adopted decision records remain binding. This operating
model does not open lead generation, contact, PII capture, GIS conclusions,
pricing, permit conclusions, production integration, 3D/WebGL, or visitor-path
AI. Those require their own owner-authorized phase and work order.

