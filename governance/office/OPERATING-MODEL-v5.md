# Operating Model v5 — no-lead-execution, stage-gated program

Status: **PROPOSED**. Operative only from the commit at which the Owner merges
it. Until that merge, `OPERATING-MODEL-v4.md` remains the operative record.

Supersedes: `OPERATING-MODEL-v4.md`.
Authority: Owner direction recorded in Issue #161 `PROGRAM-RESET-001`.
Base: `main@e32be9ea7cb265f6c6c0a65002a59bfe1419916c`.

## 1. Supersession statement

`OPERATING-MODEL-v4.md` is superseded by this record and is retained unmodified
as the historical account of the Claude-lead / parallel-Codex shape adopted at
`main@9de3fbc`. v4 is not edited by this reset; it points forward only through
this statement. Where v4 and v5 disagree, v5 governs from its merge commit.

The specific v4 provision the Owner has terminated is its assignment of
operational lead to the Claude/Opus 5 lane (v4 §2, §3). Under v5 no model lane
holds lead **and** execution authority, and the lead role holds no
repository-byte authority at all.

The ad-hoc visual execution model is terminated. Work is dispatched only as
exact repository-backed packets against pinned bases.

## 2. Roles

| Role | Holds | Cannot |
| :--- | :---- | :----- |
| **Owner — Tony (`avoroncov971-maker`)** | Sole authority to adopt material decisions, open stages, accept professional and legal risk, approve, merge, and authorize production promotion. | Delegate adoption or merge by implication. Silence is not approval. |
| **ChatGPT Lead — control plane** | Inspect authoritative state; create and amend task Issues; allocate and deconflict lanes; reconcile evidence; request independent review; prepare Owner gates; evidence-backed GitHub queue hygiene after worker results. | Author or edit any repository byte. Become a fallback executor. Merge, adopt, approve, deploy, or certify. |
| **Opus 5 Worker — bounded terminal executor** | Author repository bytes for exactly one issued packet, in one clone, one branch, one Draft PR, one declared allowlist. Publish `STARTED` and `RESULT`. | Reinterpret intent, widen the allowlist, self-review, mark Ready, merge, or deploy. |
| **Codex Workers — bounded terminal executors** | Same execution contract as the Opus 5 Worker, one issued packet per engagement. | Same limits as the Opus 5 Worker. |
| **Independent Reviewer — non-author engagement** | Read-only adversarial review pinned to one exact head SHA; one terminal verdict. | Edit the reviewed head, author bytes, approve on the Owner's behalf, merge, or treat a green check as acceptance. |

Claude Code / Opus 5 and Codex terminal sessions are bounded workers, not
product owners.

## 3. Engagement-scoped author/reviewer separation

Roles are scoped to the **engagement**, not to the model. Two engagements
running the same model family remain distinct engagements in distinct sessions.

1. The author of a head SHA can never review, accept, certify, or merge that
   head.
2. A review engagement never runs in the session that authored or led the bytes
   it examines.
3. Records never collapse two engagements into one; doing so would make the
   author-never-reviews-itself rule unverifiable.
4. Lane identity is recorded as the declared engagement, the model that actually
   ran, the clone, the branch, and the session label.
5. A new commit invalidates an older review verdict.

## 4. Mandatory non-interpretation clauses

These two clauses are binding and are reproduced without weakening.

> ChatGPT Lead is a control-plane role only. It MUST NOT implement or edit
> repository code, tests, product documentation, dependencies, design files,
> assets, Figma, branches, commits, implementation PRs, Preview deployments, or
> production deployments. It MAY inspect authoritative state, create and amend
> task Issues, allocate and deconflict lanes, reconcile evidence, request
> independent review, prepare Owner gates, and perform evidence-backed GitHub
> queue hygiene after worker results. Every repository-byte mutation is authored
> by a named terminal executor and reviewed by a different non-author
> engagement.

> A worker packet is closed-world authorization. The executor MUST NOT
> reinterpret ambiguous intent, invent a missing product decision, source,
> asset, geometry, interaction, visual reference, quality target, dependency, or
> acceptance rule; substitute a lower-quality surrogate; or widen the allowlist.
> Any missing or conflicting material precondition requires a fail-closed
> BLOCKED result before implementation proceeds.

### Additional enforceable rules

1. An executor receives an exact repository-backed packet, not open-ended
   intent.
2. A packet must declare one outcome, pinned base, named worker/model, clone,
   session, branch, complete authoritative inputs, exact allowlist, domain
   lease, prohibitions, quality target, deterministic gates, reviewer,
   integration order, stop conditions, RESULT and cleanup.
3. Phrases such as `smallest suitable module`, `relevant docs`, `make it
   premium`, `use the best asset`, or equivalent open delegation are prohibited.
4. The author cannot review, accept, certify, or merge its own result.
5. ChatGPT cannot become the fallback executor when a worker blocks.
6. `DISPATCH` is not `STARTED`. `STARTED` requires evidence of the real terminal
   session, clone, branch, and base.
7. A new commit invalidates an older review verdict.
8. Preview is worker-created engineering evidence. Production occurs only
   through Tony's merge; ChatGPT Lead never invokes deploy.

## 5. Packet schema

Every dispatched packet declares all of the following. A packet missing any
field is not dispatchable.

| Field | Requirement |
| :--- | :--- |
| Outcome | Exactly one bounded outcome. |
| Pinned base | Exact `main@<40-hex>`, or exact parent head for a stacked packet. |
| Worker and model | Named executor and exact model ID. |
| Clone | Exact isolated checkout path. |
| Session | Exact session label. |
| Branch | Exactly one branch. |
| Authoritative inputs | Complete enumerated read order; no "relevant docs". |
| Exact allowlist | Enumerated file paths, create or modify stated per path. |
| Domain lease | Exclusive file/domain ownership claimed for the packet's life. |
| Prohibitions | Explicit out-of-scope surfaces. |
| Quality target | Exact, measurable; no adjectival targets. |
| Deterministic gates | Exact commands and expected outcomes. |
| Reviewer | Named non-author engagement. |
| Integration order | Position relative to predecessors and dependents. |
| Stop conditions | Named fail-closed `BLOCKED` codes. |
| RESULT and cleanup | Required comment shape and lease release. |

## 6. Definition of Ready

A packet may be dispatched only when every item holds:

1. One outcome, stated as a single verifiable sentence.
2. Base pinned to an exact SHA that currently exists on the remote.
3. All authoritative inputs enumerated and reachable by the worker.
4. Exact allowlist declared, with each path marked create or modify.
5. Every allowlisted path free of a competing live domain lease.
6. Intended new paths verified absent at the pinned base.
7. Quality target expressed in exact measurable terms.
8. Deterministic gates expressed as exact commands.
9. Named non-author reviewer identified in advance.
10. Named `BLOCKED` stop conditions enumerated.
11. No dependency on an unmerged predecessor.
12. Every material product decision the packet relies on is already
    Owner-adopted, or the packet is itself the decision-preparation packet and
    implements nothing.

Failing any item, the packet stays `READY`-ineligible. The Lead repairs the
packet; it does not dispatch and let the worker infer.

## 7. WIP and domain-lease rules

1. A domain lease is exclusive for the life of a packet, from `STARTED` to
   `CLEANUP`.
2. No two live packets may hold overlapping file domains.
3. A lease is released only at `CLEANUP`, after merge or after an abandoned
   packet is explicitly closed.
4. A worker that discovers its leased path mutated by another lane stops
   `BLOCKED — PATH OR DOMAIN CONFLICT`.
5. Leases are declared in the packet and recorded on the live board.

## 8. Concurrency contract

- Normal mode: maximum **two mutation workers plus one read-only reviewer**.
- Hard maximum **three mutation lanes**, and only with completely disjoint file
  domains.
- **Exclusive single-writer domains** — never concurrent, one writer at a time:
  package manifests and lockfile; global CSS and tokens; shared layout and
  navigation; schemas and catalog; deployment configuration; shared Studio
  components.
- No more than **two PRs waiting for review**.
- **Zero dependent packets on an unmerged predecessor.**
- **One active visual release wave** and **one integration candidate**.
- **Merges are serialized.**
- After every merge, **remaining heads are rechecked for base drift**.

## 9. Lifecycle

```
READY → DISPATCH → STARTED → RESULT → LEAD_EVIDENCE_CHECK → REVIEW_REQUEST
→ REVIEW_VERDICT → OWNER_GATE → MERGE → PRODUCTION_VERIFY → CLEANUP
```

| State | Owner of the transition | Required evidence to leave the state |
| :--- | :--- | :--- |
| `READY` | Lead | Definition of Ready fully satisfied. |
| `DISPATCH` | Lead | Packet published. Dispatch alone changes nothing in the repository. |
| `STARTED` | Worker | Real terminal session, clone, branch, and exact base observed and published. |
| `RESULT` | Worker | Exact head SHA, changed paths, gate output, Draft PR, residual risk. |
| `LEAD_EVIDENCE_CHECK` | Lead | Claims reconciled against artifacts; divergence reported, not resolved silently. |
| `REVIEW_REQUEST` | Lead | Non-author engagement named and pinned to the exact head. |
| `REVIEW_VERDICT` | Reviewer | One terminal verdict at that exact head. |
| `OWNER_GATE` | Lead prepares, Owner decides | Decision requested, evidence, residual risk, reversibility. |
| `MERGE` | **Owner only** | Owner's explicit merge. |
| `PRODUCTION_VERIFY` | Worker or reviewer | Canonical-domain behaviour verified separately from build success. |
| `CLEANUP` | Lead | Lease released, board refreshed, branch disposition recorded. |

`DISPATCH` is not `STARTED`. Closing a session window does not create a result.

## 10. Fail-closed blockers

A worker stops immediately, preserves completed work, reports the smallest
missing fact, and does not guess, descope silently, or substitute. Named codes:

| Code | Condition |
| :--- | :--- |
| `BLOCKED — BASE DRIFT` | Pinned base no longer matches the remote. |
| `BLOCKED — PATH OR DOMAIN CONFLICT` | An intended new path exists, or another live lane owns an allowlisted path. |
| `BLOCKED — EXECUTION SURFACE OR PATH STATE` | Required session surface, clone, or path state is absent or unexpected. |
| `BLOCKED — MISSING PRODUCT DECISION` | An unmade Owner decision is a precondition. |
| `BLOCKED — MISSING SOURCE OR RIGHTS` | Required professional input, asset, or publication right is unavailable. |
| `BLOCKED — GATE FAILURE` | A deterministic gate fails at the exact head. |
| `BLOCKED — LIVE STATE DIVERGENCE` | GitHub live state differs materially from the packet. |

An executor may not resolve a blocker by widening scope. The Lead re-packets it.
ChatGPT Lead never converts itself into the executor.

## 11. Preview versus production authority

1. Preview is **worker-created engineering evidence**. It is never Owner
   acceptance.
2. A successful Vercel build does not prove the owner-visible domain serves
   those bytes.
3. The canonical GitHub status is `Vercel – west-coast-kbp-platform-preview`.
   The `Vercel – nextjs-boilerplate` Hobby-team status is **noncanonical**; its
   state is not evidence in either direction.
4. Production occurs only through the Owner's merge. ChatGPT Lead never invokes
   deploy, and no lane triggers a manual production deployment.
5. `PRODUCTION_VERIFY` is a separate, later step than `MERGE`: deployment state
   `READY` with `target=production`, Git binding to the exact merged SHA, custom
   domain alias attached, and the route surface inspected as one system.
6. A docs-only diff yields no browser or runtime evidence, and none may be
   claimed from it.

## 12. Lead cleanup boundaries

ChatGPT Lead may perform evidence-backed GitHub queue hygiene **after** worker
results, strictly within these limits.

The Lead **may**: close an Issue or PR without merge when the evidence for
superseded, archived, stale, or completed status is stated in the closing
comment; relabel; re-index the board; and record disposition.

The Lead **may not**: merge; mark a PR Ready; delete or rewrite a branch,
commit, or thread; alter a review verdict; close anything without a stated
evidence basis; or perform hygiene that changes a single repository byte.

All branches, commits, threads, and evidence remain recoverable after any
cleanup.

## 13. Standing boundaries

`governance/BOUNDARIES.md` and adopted decision records remain binding and are
unchanged by this record. This operating model opens no product, architecture,
production, credential, access-control, or spending decision. It changes
execution coordination and authority only.

Product 1, `kbp-core`, `kbp-dev-office`, and Deedseal remain outside these
packets unless the Owner explicitly opens that boundary.

Merged `main`, verified GitHub state, and verified execution output are truth.
`STATE.md` is an index of that truth, never a substitute. When a committed
record and an Issue disagree, the committed record wins and the divergence is
reported, not silently resolved.
