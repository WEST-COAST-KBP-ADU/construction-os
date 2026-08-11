# Deterministic engineering graph memory

This directory defines a rebuildable projection of authoritative engineering
evidence. The graph is an index, never an authority source. It cannot approve,
merge, dispatch, launch a worker, accept a review, or change GitHub state.
Before any later mutation, critical facts must be read again from GitHub.

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
WorkItems with their leases, blockers and required clearing evidence, the Owner
gate, the latest exact-head review, merge and production-verification state, the
discrepancies between the committed index and live evidence, the canonical
`M1`/`M2`/`R1` board, exactly one next executable control-plane action, and every
named gap.

The cold start **consumes** the graph rather than duplicating it. It runs
`build-graph.mjs` over the same frozen observation and carries that projection's
canonical heads, invalid reviews, unresolved blockers, runnable work, named gaps,
and split-brain report into its own output, so there is one engineering-fact
hierarchy and one set of graph reason codes.

A stale committed queue index is reported as a discrepancy and then ignored for
live dispatch. Incomplete evidence under an occupied slot or an open gate,
wrong slot cardinality, an occupied mutation slot without persisted `STARTED`
evidence, overlapping leases or allowlists, a reviewer that authored the head it
reviews, a verdict bound to a superseded head, two live records claiming one
WorkItem at different heads, a watermark regression, and any authority-bearing
output all fail closed with a stable `COLD0NN` code. Missing evidence is a named
gap, never an inference.

Like the graph, the result is derived, deterministic, rebuildable, and never
committed, and it cannot approve, accept, merge, dispatch, or launch a worker.

```bash
node --test tools/memory/build-graph.test.mjs tools/memory/build-session-start.test.mjs
```
