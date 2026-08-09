---
description: Cut one bounded packet and emit a ready-to-paste executor launch header
allowed-tools: Bash(git fetch:*), Bash(git rev-parse:*), Bash(git log:*), Read, Glob, Grep, mcp__github__list_issues, mcp__github__issue_read, mcp__github__list_pull_requests, mcp__github__get_file_contents
---

Cut exactly one bounded packet for an external executor session.

Before writing anything, verify against live state:

- current `main` SHA via `git fetch origin main`;
- that no open packet already owns the same outcome (no duplicate work);
- that the proposed write scope does not overlap any in-flight branch or PR
  (concurrent writers to one file domain are forbidden);
- that the outcome is permitted by `governance/BOUNDARIES.md` without a new
  Owner decision. If it is not, stop and say which boundary blocks it.

Allocate the next free record number by checking merged `main` **and** open PRs,
never by counting files alone.

Emit the packet in exactly this shape:

```
PACKET <ID> — <one-line outcome>

Repository:      WEST-COAST-KBP-ADU/construction-os
Base SHA:        <exact 40-char SHA>
Branch:          agent/<slug>-v1
Lane:            <executor identity>
Type:            RESEARCH | IMPLEMENTATION | REVIEW

Outcome
  <exactly one outcome, stated as an observable end state>

Write scope (allowlist — nothing outside this)
  <explicit paths>

Read scope
  <explicit paths or surfaces>

Required tools / mode
  <required skills, plugins, or mode>
Disabled
  <tools or plugins that could manufacture false evidence for this packet>

Verification (all must pass and be reported with output)
  npm test
  npm run lint
  npm run build
  <packet-specific probe, if any>

Durable output
  <exact files, Draft PR, and the Issue comment header that closes the packet>

Non-goals
  <what this packet must not touch>

Stop conditions
  Stop and report at the exact failed command if: <conditions>.
  Do not guess, do not descope silently, do not expand scope.

Forbidden
  Merging, approving own work, self-certifying, force-push, credential or
  provider configuration, PII persistence, scope expansion, and any action
  listed in governance/BOUNDARIES.md.

Terminal result
  One RESULT comment: exact head SHA, changed paths, commands run with observed
  output, declared deviations and unknowns, Draft PR URL.
```

The packet is authorization for exactly this scope and nothing else. One packet,
one branch, one Draft PR. The executor never reviews its own result.

$ARGUMENTS
