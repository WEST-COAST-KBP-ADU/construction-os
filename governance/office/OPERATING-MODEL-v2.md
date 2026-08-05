# Operating Model v2 — operational control

Status: adopted by owner directive, 2026-08-04. Supersedes OPERATING-MODEL-v1.
Base: `main@c3271f3`.

## 1. What changed and why

v1 split roles but left dispatch ambiguous: both engineers proposed work, and
the owner became the relay between two chats. That is the bottleneck the owner
removed on 2026-08-04.

**Claude takes operational control. ChatGPT becomes a bounded worker.** The
owner keeps exactly two powers: principal decisions, and merge.

## 2. Authority

| Actor | Holds | Cannot |
| :---- | :---- | :----- |
| **Owner** | Principal decisions (market, budget, business facts, opening a phase, vendor). Merge. Anything irreversible or outward-facing. | — |
| **Claude — operational lead** | Sets the queue and its order. Writes every work order. Allocates all record numbers. Owns `governance/`. Reviews every worker PR and issues the verdict. Maintains STATE. Escalates to the owner only what genuinely needs a decision. | Merge. Approve own work. Write `app/`/`src/` unless a work order assigns it. Open a phase the owner has not opened. |
| **ChatGPT — bounded worker** | Executes one work order at a time, exactly as scoped. Writes `app/`, `src/`, `public/`, tests, assets, research packets. Produces evidence. | Choose what to work on. Allocate record numbers. Edit decision records, architecture records, or STATE outside its own lane row. Merge, approve, or mark Ready. Expand scope. |

The worker's skills and tools are broad; its **authority** is narrow. That
combination is the point: it can do almost anything, on exactly one thing at a
time, chosen by the operational lead.

## 3. The loop

```
owner decision (rare)
  → Claude writes WORK-ORDER-NNN into the repository
  → ChatGPT executes it, opens one draft PR with evidence
  → Claude reviews at the exact head SHA, posts PASS or CHANGES REQUESTED
  → CHANGES REQUESTED is the worker's next work item; it fixes and pushes
  → on PASS, owner merges
  → Claude refreshes STATE and issues the next work order
```

The owner appears twice: at a principal decision, and at merge. Nowhere else.
No status reporting to the owner between those points.

## 4. Work orders

A work order is the only thing that authorizes worker action. It lives at
`governance/orders/WORK-ORDER-NNN-<slug>.md` and states:

- pinned base SHA;
- the single outcome, and the non-goals;
- owned file paths, and what it must not touch;
- the binding spec or record it must satisfy;
- acceptance evidence the PR must contain;
- what to do when blocked — never guess, never silently descope.

If the worker finds the order wrong, it says so in the PR thread and stops.
It does not improvise a better order.

## 5. Blocked work

A blocked order is reported with the exact failure, not worked around:
the command, the error, what was attempted. Then the worker stops and waits.
The operational lead reroutes — to the other engineer, to a different order,
or to the owner if the block is a decision.

Environment fit is a routing input: work needing live web access routes to
ChatGPT; work needing repository-wide reasoning and review routes to Claude.

## 6. Collision rules (carried from v1, unchanged)

- One file domain, one writer: `app/` + `src/` + `public/` = worker;
  `governance/` = operational lead, except the worker's own RUN records and its
  own registry status cell.
- One order = one branch = one draft PR.
- All record numbers (DR / TASK / RP / RUN / REVIEW / WORK-ORDER) come from the
  operational lead.
- Verdicts pin to a head SHA. A new commit invalidates the verdict.

## 7. What does not change

BOUNDARIES.md and every adopted DR remain binding on both engineers. Operational
control is authority over *sequencing and review*, never over the boundary. The
demo posture (DR-0013/DR-0015), the market definition (DR-0014), determinism in
the visitor path, and owner-only merge are unaffected by this record.
