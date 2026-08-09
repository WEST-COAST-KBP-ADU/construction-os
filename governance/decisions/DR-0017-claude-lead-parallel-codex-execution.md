# DR-0017 — Claude lead with parallel Codex execution

- **Status:** proposed — pending Owner adoption by merge
- **Date:** 2026-08-09
- **Supersedes:** the role allocation in `OPERATING-MODEL-v3`
- **Consolidates:** Issue #112 `OPERATING-MODEL-004` (Owner-adopted 2026-08-08,
  never committed)
- **Base:** `main@4bb02f3`

## Context

Three operating shapes were simultaneously live:

1. `governance/office/OPERATING-MODEL-v3.md`, committed, naming ChatGPT as
   operational lead and Claude as default reviewer;
2. `governance/sops/SOP-0001-dual-lane-github-coordination.md`, status
   `proposed`, describing Lane A / Lane B;
3. Issue #112, Owner-adopted on 2026-08-08, describing an operational lead with
   two workers, an independent reviewer, and a Fable 5 decision fork — recorded
   only as Issue text.

Because the repository holds that committed bytes are truth, the committed model
and the practised model disagreed structurally, and a fresh session reading only
the repository would adopt roles nobody was actually working under.

Two further defects were observed at this base:

- `CLAUDE.md` imported only `AGENTS.md`, which carries Next.js framework rules
  alone. `BOUNDARIES.md`, the operating model, and the queue index never entered
  a fresh session's context automatically, so every session began outside its
  own governance until it happened to read it.
- `node_modules` was absent, so `npm test`, `npm run lint`, and `npm run build`
  could not run, and the `node_modules/next/dist/docs/` guides that `AGENTS.md`
  requires reading did not exist. A session that cannot verify cannot produce
  evidence.

## Decision

The Owner directs that the Claude lane hold operational lead and that Codex
serve as the primary execution lane, with two to three sessions running in
parallel on disjoint write scopes.

`OPERATING-MODEL-v4` commits that shape, retires the three-way ambiguity, and
records model assignment per lane. The controls that the prior models existed to
enforce are preserved without exception:

- bounded packets, one packet to one branch to one Draft PR;
- one writer per file domain;
- an author never reviews or certifies its own work;
- evidence by artifact, never by assertion;
- Owner-only adoption and Owner-only merge.

Lane identity is recorded by the model that actually ran. Claude Opus 5 and
Fable 5 remain distinct lanes and are not recorded interchangeably, because
collapsing them would make the authorship-separation rule unverifiable from the
records themselves.

## Consequences

- The lead maintains the queue, cuts packets, deconflicts lanes, reconciles
  evidence, and prepares Owner gates. It does not merge, adopt, or self-certify.
- Executor sessions receive an explicit write allowlist and stop conditions, and
  return one RESULT with observed command output.
- Review remains a separate non-author lane at an exact head SHA.
- Session context now loads the boundaries, the operating model, and the queue
  index by default, and the verification gate installs itself at session start.
- `OPERATING-MODEL-v3` becomes historical. `SOP-0001` remains the Issue state
  protocol; its Lane A / Lane B naming is read through the role table in v4.

## Non-effects

This record opens no product, architecture, production, credential,
access-control, spending, or public-claim decision. It changes execution
coordination only. `governance/BOUNDARIES.md` and all adopted decision records
remain binding and unchanged.
