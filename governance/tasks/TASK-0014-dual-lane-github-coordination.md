# TASK-0014 — Dual-lane GitHub coordination

- **Status:** in_progress
- **Approved:** 2026-08-06
- **Authority:** Owner directive in GitHub Issue #49
- **Pinned base:** `main@34a5fbb73548a3d336cb533e8f98c84650bc8ca6`
- **Owner:** Tony
- **Operational lead:** ChatGPT
- **Independent lane:** Fable 5 or Opus 5, named per packet

## Objective

Adopt a professional repository-backed communication protocol for two
engineering lanes. GitHub Issues carry dispatch, handoff, review requests,
blockers, and owner gates. Durable analysis and outcomes remain in the shared
repository layer. Pull requests remain the mutation and code-review surface.

The protocol must remove routine terminal and chat relay through the Owner while
preserving exact-SHA evidence, non-author review, bounded scopes, and
Owner-only adoption and merge.

## Owned paths

- `governance/tasks/TASK-0014-dual-lane-github-coordination.md`
- `governance/tasks/README.md`
- `governance/sops/SOP-0001-dual-lane-github-coordination.md`
- `governance/sops/README.md`
- `.github/ISSUE_TEMPLATE/dual-lane-packet.yml`

## Binding requirements

1. Define exactly two coordination lanes:
   - Lane A: the Operational Lead, with named bounded executors inside the lane.
   - Lane B: one named independent engineer, Fable 5 or Opus 5.
2. Keep the Owner outside both engineering lanes as final decision authority and
   sole merger.
3. Use one GitHub Issue per bounded packet and one branch plus one Draft PR per
   implementation scope.
4. Use `docs/shared-briefs/<packet-id>/` for durable cross-lane content.
5. Require exact base and head SHAs for dispatch, result, review request, and
   verdict.
6. Prohibit an artifact author from accepting the same artifact.
7. Publish code-review verdicts on the PR and mirror them into the Issue.
8. Replace routine terminal/chat handoffs with Issue state comments.
9. Preserve adopted AI authority limits and require explicit Owner gates for
   merge, adoption, external publication, access changes, and material
   production promotion.
10. Provide a GitHub Issue form that encodes these requirements.

## Acceptance

- The SOP is unambiguous enough to run a research packet, implementation packet,
  or review request without a separate terminal instruction.
- The Issue form requires the packet ID, exact source SHA, primary and
  independent lanes, single outcome, shared artifact, acceptance evidence, and
  non-goals.
- The proposed change contains no runtime code, product copy, asset,
  dependency, deployment, access-control, or active design implementation.
- A non-author lane returns one SHA-pinned recommendation:
  `PASS` or `CHANGES REQUESTED`.
- Owner alone merges.

## Non-goals

No implementation of the premium design slices, municipal-plan research,
Studio changes, repository permissions, bot installation, GitHub Actions,
external sending, deployment, or production promotion.

## Evidence and closure

- Coordination Issue: #49
- Draft PR: recorded in Issue #49 after creation
- Review verdict: recorded on the PR and mirrored into Issue #49
- Merge and final outcome: Owner gate
