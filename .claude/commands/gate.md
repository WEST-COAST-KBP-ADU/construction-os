---
description: Assemble one Owner gate — the exact decision, its evidence, and its residual risk
allowed-tools: Bash(git fetch:*), Bash(git log:*), Bash(git rev-parse:*), Read, Glob, Grep, mcp__github__pull_request_read, mcp__github__issue_read, mcp__github__get_check_run, mcp__github__list_commits
---

Assemble one Owner gate. The Owner's time is the scarcest resource in this
project — the gate must be decidable without the Owner reading the diff.

A gate is only eligible when all of these hold. Check each, and if any fails,
report the gate as NOT READY and name the missing item instead of assembling it:

1. exact base and head SHA recorded;
2. declared changed paths, with nothing outside the packet allowlist;
3. required verification run, with observed output;
4. a non-author verdict at that same head SHA;
5. no unresolved blocking finding;
6. the decision is genuinely the Owner's — not an engineering choice being
   escalated to avoid making it.

Emit:

```
OWNER_GATE — <packet ID>

Decision requested
  <exactly one action only the Owner can take>

Reviewed head    <SHA>
Verdict          <verdict> by <non-author lane>
Verification     <commands and observed results>
Changed paths    <list>

What this changes if adopted
  <observable consequence, in plain business terms>

What it does not change
  <explicit non-effects — especially production, PII, cost, and public claims>

Residual risk
  <what remains unproven, and what would prove it>

Reversibility
  <how this is undone, and what becomes irreversible on merge>
```

State plainly whether merge triggers a production deploy. Never imply that a
green check, a passing test, or an engineering verdict constitutes Owner
approval. Do not merge, and do not mark anything Ready on the Owner's behalf.

$ARGUMENTS
