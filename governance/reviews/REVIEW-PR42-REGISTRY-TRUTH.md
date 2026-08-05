# REVIEW-PR42-REGISTRY-TRUTH — independent review of the registry restoration

- **Reviewer:** Claude (Fable), independent non-author lane (OPERATING-MODEL-v3)
- **Reviewed:** 2026-08-05
- **Base:** `cdee1503ba5fab5481a0ad07393f1ca36191b909` (= `main` at review time)
- **Head:** `ce63c7081cfa7e8545a91b781088135b6c5e8695`
- **Verdict:** **PASS** — pinned to the head above; merged by the Owner as
  `main@9373df3…`. GitHub-native copy of this verdict:
  PR #42, comment `5196013616`.

## Verified

- Remote head, base equality with `main`, ahead 6 / behind 0, whitespace clean.
- Exactly 4 files, all `governance/**`, 75+/40− — including the justified
  fourth file (`orders/README.md` stale WORK-ORDER-003 row).
- v3 adoption anchor factually correct: `35c2289` is merge commit "#40" with
  two parents.
- PR #41 product head and merge commit recorded identically to my own
  post-merge audit of the same SHAs.
- RUN-0016 history layered, not rewritten: original timestamps kept,
  synchronization appended.
- STATE reshaped to the accepted P0–P6 queue verbatim, including the OpenAI
  reasoning-plane exclusion; former Studio 450 404 moved to resolved; every
  deployed-state statement reads NOT VERIFIED.
- The PR resisted three tempting overclaims: it does not self-attest the
  product verdict, does not claim production untouched, and downgraded
  "auto-deploys" to "may auto-deploy" — the safe direction while domain
  custody is unresolved.

## Findings

1. **[informational, resolved by this file's PR]** Review provenance lived in
   chat transport only. This directory now holds committed verdicts;
   GitHub PR comments remain the interim record for same-day dispositions.
2. **[informational]** Registrar authorship of RUN-0016 edits is legitimate
   under operative v3 role definitions; no file-domain violation.
