---
description: Rebuild the live queue board from authoritative surfaces, not from STATE.md
allowed-tools: Bash(git fetch:*), Bash(git log:*), Bash(git rev-parse:*), Read, Glob, Grep, mcp__github__list_issues, mcp__github__list_pull_requests, mcp__github__issue_read, mcp__github__pull_request_read, mcp__github__get_check_run
---

Rebuild the current queue from authoritative state. `STATE.md` is an index and
may be stale — never report it as current without checking it against live data.

Gather, in this order:

1. `git fetch origin main` and the exact current `main` SHA.
2. Open Issues and open PRs, with head SHAs and draft status.
3. For each open PR: check status, and whether its base is behind current `main`.
4. `governance/office/STATE.md` and the active operating model.

Then report:

- **Anchor** — current `main` SHA, and any governance record whose recorded
  anchor no longer matches it. Name each stale anchor explicitly.
- **In flight** — each open packet: Issue, PR, head SHA, lane, last state
  transition, and whether it is waiting on execution, review, or the Owner.
- **Blocked** — the exact blocking fact or missing artifact for each, not a
  general description.
- **Free capacity** — which executor slots are idle and which non-overlapping
  packets could fill them.
- **Owner gates** — packets whose only remaining step is an Owner decision or
  merge, each with its reviewed head SHA and verdict.
- **Divergence** — any place a committed record and an Issue disagree.

Report contradictions rather than resolving them silently. Do not update
`STATE.md` as part of this command; propose the update and let a bounded packet
carry it.

$ARGUMENTS
