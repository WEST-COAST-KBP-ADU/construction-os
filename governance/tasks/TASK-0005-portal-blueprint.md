# TASK-0005: Assemble Portal Blueprint v0.1 + ship llms.txt

- **Status:** done
- **Date approved:** 2026-07-03
- **Approved by:** owner ("Да, делаем, собираем полностью структуру")
- **Related:** DR-0008 (proposed), RP-0001…RP-0005, TASK-0004

## Objective

Synthesize all five research packets into one canonical build plan
(`architecture/portal-blueprint-v0.1.md`) with a proposed adoption record
(DR-0008), and ship the zero-risk /llms.txt AI-crawler file identified in
RP-0003 as a day-one item.

## In scope

- `governance/architecture/portal-blueprint-v0.1.md`
- `governance/decisions/DR-0008-portal-architecture.md` (status: proposed)
- `public/llms.txt` (content strictly from approved public copy + charter)
- Registry updates

## Out of scope / prohibited

- Any vendor configuration, tracking tags, PII handling
- Any visual design decision (separate phase per owner)
- New visible site copy beyond the llms.txt summary of existing approved copy

## Acceptance criteria

- Blueprint covers IA, homepage order, funnel-to-kernel mapping, stack
  candidates with decision gates, voice phasing, build phases, open decisions
- DR-0008 lists what it does NOT decide
- /llms.txt served; build/lint/tests green; merged to main

## Evidence plan

RUN-0005: timestamp, event type, accept/reject result, sanitized summary.

## Boundary check

- [x] Work stays inside BOUNDARIES.md
- [x] No provider configuration or external action
- [x] Evidence plan uses only whitelisted lab-safe fields
