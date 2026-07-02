# DR-0001: Single repository with `governance/` as SourceTrue

- **Status:** adopted
- **Date:** 2026-07-02
- **Decider:** owner
- **Related:** TASK-0001, platform charter

## Context

The founding handoff described a two-repository model: `construction-os`
(SourceTrue, records only) and `nextjs-boilerplate` (implementation lab). In
practice the original SourceTrue repository was nearly empty and was deleted;
the implementation repository was renamed to become the single main repository.
Cloud engineering sessions are scoped to one repository at a time, so a
two-repo split forces constant context switching, while the SourceTrue content
is currently being created from scratch.

## Decision

One repository holds both planes with a hard internal boundary:

- `governance/` — SourceTrue: records, rules, templates. No runtime code, no
  PII, no secrets.
- Everything outside `governance/` — implementation lab (Next.js app and future
  control/artifact code).

## Alternatives considered

- **Recreate the two-repo model** — full conformance with the founding handoff,
  but reintroduces the one-repo-per-session friction for no content benefit
  while SourceTrue is young.
- **Git submodule / monorepo merge of two repos** — rejected earlier: private
  submodules complicate Vercel builds, and there was no second repo content to
  merge.

## Consequences

- The SourceTrue boundary is enforced by convention and checklists rather than
  repository ACLs.
- The rule "SourceTrue must not contain runtime code" applies at directory
  level: nothing in `governance/` is imported, executed, or deployed.
- All BOUNDARIES.md storage prohibitions apply to `governance/` exactly as they
  would to a dedicated repository.

## Revisit trigger

Re-examine if any of these occur: a team beyond the owner + one engineer gains
write access; production PII handling is authorized anywhere in the platform;
governance records need different visibility/permissions than application code.

## Boundary check

- [x] No PII, secrets, transcripts, or recordings introduced
- [x] No external action authorized implicitly
- [x] Research claims verified or marked "Requires official source verification"
