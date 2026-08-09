---
description: Non-author adversarial review pinned to an exact head SHA
allowed-tools: Bash(git fetch:*), Bash(git diff:*), Bash(git log:*), Bash(git rev-parse:*), Bash(npm test:*), Bash(npm run lint:*), Bash(npm run build:*), Read, Glob, Grep, mcp__github__pull_request_read, mcp__github__issue_read, mcp__github__get_check_run, mcp__github__get_job_logs, mcp__github__list_commits
---

Perform a read-only adversarial review at one exact head SHA.

First establish eligibility. If this session authored or repaired the bytes
under review, stop: an author cannot issue its own verdict. Say so and name
which lane should review instead.

Pin the head SHA before reading anything, and re-check it at the end. If the
head moved during review, the verdict is void — say so and request a new review
request rather than silently rebasing onto the new SHA.

Review against:

- the packet's declared outcome and write allowlist — flag every changed path
  outside the allowlist;
- `governance/BOUNDARIES.md` and adopted decision records;
- correctness: run the verification commands yourself and report observed
  output, rather than trusting the executor's claim or a green check;
- evidence: every claim in the RESULT must be backed by an artifact you can
  see. Unverifiable claims are findings, not accepted facts.

Try to break the change before accepting it. Look for the failure the author
did not consider: boundary inputs, fail-open paths, silent catches, state that
survives across requests, and claims that hold locally but were never proven in
the deployed surface.

Emit exactly one terminal verdict:

- `NO BLOCKING FINDING` — with the reviewed SHA and what you actually ran; or
- `BLOCKED FOR REVISION` — with each finding as: exact file and line, why it is
  wrong, the concrete failure it produces, and what would resolve it.

Do not modify the reviewed head. Do not approve, do not merge, and do not treat
a green check or an Owner comment as engineering acceptance. Do not expand scope
inside review — new work becomes a new packet.

$ARGUMENTS
