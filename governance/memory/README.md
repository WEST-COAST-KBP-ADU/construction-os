# Deterministic engineering graph memory

This directory defines a rebuildable projection of authoritative engineering
evidence. The graph is an index, never an authority source. It cannot approve,
merge, dispatch, launch a worker, accept a review, or change GitHub state.
Before any later mutation, critical facts must be read again from GitHub.

## Two graph surfaces, and why they stay apart

This repository carries two graphs. They answer different questions, they are
authored by different acts, and neither is rewritten into the other.

| | Derived engineering graph — **this directory** | Persistent Product 2 goal graph |
| :--- | :--- | :--- |
| Question | What has actually happened? | What is the work for? |
| Kind | Derived **observation** of Issues, branches, pull requests, reviews, merges, deployments, and evidence | Authority-routed **intent and work** graph |
| Authored by | `build-graph.mjs`, from a frozen observation of live GitHub | An Owner-adopted decision carried by a bounded packet |
| Location | `tools/memory/build-graph.mjs`, `graph-source-truth-v1.schema.json` | `../product/PRODUCT2-LIVE-GOAL-GRAPH-v1.json` |
| Committed | No — generated into a temporary directory | Yes — it is repository data |
| Vocabulary | The lineage and edge types described below | The Owner-adopted four-by-four contract: `GOAL`, `MODULE_SUBGRAPH`, `WORK_NODE`, `EVIDENCE`; `ADVANCES`, `DEPENDS_ON`, `SUPERSEDES`, `PROVES` |
| Checked by | `node --test tools/memory/build-graph.test.mjs` | `node tools/memory/check-product2-live-goal-graph.mjs` |

The goal graph is validated against the accepted minimal four-by-four contract,
vendored byte-identically at
`../product/VENDORED-MINIMAL-GOAL-CONTRACT-v1.schema.json`. Because the vendored
bytes must stay identical to the accepted source, they cannot carry their own
provenance: the source repository, path, exact revision, blob SHA, and content
digest are recorded outside the bytes, in the manifest's `vendored_contract`
block and in the header of `tools/memory/check-product2-live-goal-graph.mjs`,
which refuses a vendored copy whose digest has drifted. That provenance is
deliberately **not** repeated in this directory, whose own audit forbids a
hard-coded exact SHA.

Intended state is never inferred from the projection, and observed state is
never asserted by the goal graph. A cold start hydrates the goal graph for
direction and this projection for evidence, then reports any contradiction
between them as a named discrepancy. It never merges, averages, or silently
reconciles the two. Deleting, folding in, or reinterpreting either surface is
outside any ordinary packet.

## Source and projection contract

`graph-source-truth-v1.schema.json` describes normalized output. Frozen input is
JSON with the same `schemaVersion`, `watermark`, `sources`, `nodes`, and `edges`
members, plus an optional `previousWatermark`. Every fact and relationship must
carry one or more `sourceRefs`. Sources record their GitHub URL, immutable source
SHA, observation time, completeness, and explicit named gaps.

The supported lineage is:

```text
Objective -> WorkItem -> Attempt -> Dispatch -> Worker -> Branch
-> PullRequest -> Review -> OwnerDecision -> Merge -> Deployment -> Evidence
```

`Blocker`, `Refusal`, `Correction`, `Retraction`, and `NamedGap` are first-class
nodes. The edge vocabulary includes `depends_on`, `supersedes`, `attempts`,
`produced`, `reviews_exact_head`, `blocks`, `resolves`, and `deployed_as`.

## Fail-closed behavior

The builder rejects unknown fields, malformed values, duplicate identities,
dangling references, missing provenance, conflicting canonical heads, watermark
regression, inference presented as fact, and a repeated failed dispatch with the
same evidence and precondition fingerprint. Stable reason codes are exported by
`tools/memory/build-graph.mjs`.

A canonical head exists only when an explicit `OwnerDecision` with disposition
`retain` names it and a retained `Review` names that exact head. Reviews whose
`reviewedHeadSha` differs from `currentHeadSha` are listed as invalid. Blockers
remain unresolved until an explicit `resolves` edge exists. Runnable work must
be explicitly marked runnable and have no incomplete dependency or unresolved
blocking edge. Multiple active or retained heads, sessions, branches, PRs, or
dispositions for one WorkItem are reported as split-brain.

Corrections and retractions do not overwrite history: they remain nodes linked
by `corrects`, `retracts`, `resolves`, or `supersedes`. Missing GitHub evidence
is represented as a named gap and is never inferred.

## Rebuild

```bash
node tools/memory/build-graph.mjs --input /tmp/frozen-input.json --output /tmp/graph.json
```

The builder sorts identities and object keys and emits a final newline. Identical
canonical inputs therefore produce byte-identical JSON. Generated graphs belong
in a temporary directory and must not be committed.

Focused verification:

```bash
node --test tools/memory/build-graph.test.mjs
```

The in-process fixtures cover the complete #169/#171/#170/#172 lineage: the
first two #171 execution paths were non-runnable, RERUN 1 retained Candidate B,
Candidate A remains audit-only, and the Owner merged PR #172. Tests also cover
deterministic rebuild, exact-head invalidation, repeated-precondition refusal and
new-evidence recovery, corrections, retractions, split-brain, provenance,
dangling edges, and watermark regression.

## Cold start

`SESSION-START.md` is the canonical entry for a fresh session, and both root
instruction files route to it before any other repository-specific read. It is
the stable half of this directory: it names the Owner, the control-plane and
worker roles, the Product 2 / Product 1 boundary, and the truth ranking by
pointing at the records that govern them, and it deliberately carries no current
packet, SHA, queue position, or board occupancy.

The live half is reconstructed at read time.
`session-start-v1.schema.json` describes the normalized `COLD_START_RESULT/v1`
projection, and `tools/memory/build-session-start.mjs` builds it:

```bash
node tools/memory/build-session-start.mjs --input /tmp/frozen-observation.json --output /tmp/cold-start.json
```

The result carries the exact current `mainSha`, the observation watermark and
complete source list, the product boundary and program stage, active and ready
WorkItems with their permanent lane, `Worker-N` identity, leases, blockers and
required clearing evidence, the Owner gate, every review bound to an exact head
whether dispatched, running, or concluded, merge and production-verification
state, the discrepancies between the committed index and live evidence, the
canonical `P1`/`P2`/`W1` board, exactly one next executable control-plane action,
and every named gap.

The board carries exactly two permanent Product 2 lanes and exactly one
permanent workflow lane. Lane is permanent; mutation versus independent
read-only review is the lane's current activity mode, so a review of a product
head occupies `P1` or `P2` and a review of a workflow head occupies `W1`. A
released lane is refilled from eligible work in that same lane. `Worker-N =
Issue #N` is the engagement identity everywhere, and a slot label, branch, pull
request, or session is never accepted in its place. The operating target is
continuous occupancy, but live GitHub state is authoritative: a lane stands free
until Tony manually launches the dispatched worker, and no repository artifact
launches anything.

The cold start **consumes** the graph rather than duplicating it. It runs
`build-graph.mjs` over the same frozen observation and carries that projection's
canonical heads, invalid reviews, unresolved blockers, runnable work, named gaps,
and split-brain report into its own output, so there is one engineering-fact
hierarchy and one set of graph reason codes. The graph binds the decision too:
work absent from `runnableWork` is never proposed for dispatch, and a
graph/observation contradiction about runnability fails closed.

A stale committed queue index is reported as a discrepancy and then ignored for
live dispatch. Incomplete evidence under an occupied lane or an open gate, a
board whose key set or two-to-one lane allocation is wrong, an occupied lane
without persisted `STARTED` evidence, overlapping leases or allowlists, a
reviewer that authored the head it reviews, a review bound to a superseded head,
two live records claiming one WorkItem at different heads, a watermark
regression, any authority-bearing output, a missing or contradictory lane
classification, work seated in the wrong lane, a worker identity that is not
`Worker-N` for its own Issue, a dispatch that contradicts the graph, and two
lanes reviewing one WorkItem all fail closed with a stable `COLD0NN` code. A live
`active` engagement seated in no lane is reported as a named blocking
discrepancy and blocks every allocation step. Missing evidence is a named gap,
never an inference.

Like the graph, the result is derived, deterministic, rebuildable, and never
committed, and it cannot approve, accept, merge, dispatch, or launch a worker.

```bash
node tools/memory/check-product2-live-goal-graph.mjs
node --test tools/memory/build-graph.test.mjs tools/memory/build-session-start.test.mjs \
  tools/memory/check-product2-live-goal-graph.test.mjs
```

The goal-graph checker prints the deterministic path from the active Work Node
to the Product 2 NORTH_STAR, the terminal state of every branch and join, the
next executable Work Node, and an order-independent digest of the manifest. Its
negative suite proves the refusals fire: an unknown node or edge type, an orphan
Work Node, an `ADVANCES` target that is not a live goal, an unmet `DEPENDS_ON`
presented as executable, duplicate terminal evidence, a missing or ambiguous
path to the NORTH_STAR, and Product 1 / Product 2 authority or memory
conflation.
