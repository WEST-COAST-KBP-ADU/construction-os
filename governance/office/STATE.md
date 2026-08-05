# STATE — single shared board

Owner of this file: operational lead / registrar under OPERATING-MODEL-v3 once
that proposal is merged. Merged `main` is the only truth; this board is the
index, not the source.

Updated: 2026-08-05 — owner-directed lead handoff proposed at
`main@9f7c06d409ba1ba2eb7f82a2e306ad7f55cdb64e`.

## Queue — executed in this order

| # | Work | Builder | Reviewer | State |
| :- | :--- | :------ | :------- | :---- |
| 1 | **WORK-ORDER-003** — restore Studio 450 asset and enforce asset integrity | ChatGPT | Claude | issued; starts only after this governance PR is merged |
| 2 | Close TASK-0013 remaining deployed evidence without weakening p75 wording | assigned by next order | non-author lane | queued after WORK-ORDER-003 |
| 3 | Intake → Property Case → Candidate Artifact → OwnerReview vertical slice | assigned by future order | non-author lane | next architectural milestone; task packet required |
| 4 | Remaining Sacramento-ring jurisdiction pages | assigned after official-source research | non-author lane | research-gated |

## Shipped

- `/studio` deterministic editorial workbench — merged (PR #35, `c3271f3`).
  Catalog release `2026.08.0`; no PII, capture, external effect, pricing, GIS, AI,
  or persistence. TASK-0013 remains `in_progress` because deployed p75 evidence
  and final independent disposition are absent.
- City of Sacramento and unincorporated Sacramento County pages — merged in
  PR #39, `main@9f7c06d409ba1ba2eb7f82a2e306ad7f55cdb64e`.
- Public site routes and deterministic Studio shell described by their committed
  tasks and evidence records.

## Active defect

Production `/studio` references
`/images/adu-courtyard-concept-v1.webp`, which returns 404 for the Studio 450
main image and comparison thumbnail. WORK-ORDER-003 owns only restoration and
asset-integrity enforcement. It does not close TASK-0013's deployed-performance
gate.

## Owner decision queue

1. Merge or reject this proposed Operating Model v3 / WORK-ORDER-003 handoff.
2. Lead-generation phase remains closed until the technical and visual track is
   complete.
3. First ICP and business facts package remain future owner decisions; they do
   not block WORK-ORDER-003.

## Known blockers and infrastructure notes

- Deployed p75 LCP/INP/CLS for TASK-0013 remains unavailable; local or lab
  measurements are not substitutes for p75 field evidence.
- Canonical Vercel project remains `west-coast-kbp-platform-preview`. No Vercel
  or domain change is authorized by this proposal.
- Merge to `main` auto-deploys production. Owner merge is production-release
  authorization.

## Standing constraints

- Demo posture: no contact surface, PII, or external effect.
- Sacramento leads build order; other jurisdiction pages require official-source
  research.
- No AI in the visitor-facing decision path.
- Studio stays 2D-first.
- One order = one branch = one Draft PR. Owner merges.

