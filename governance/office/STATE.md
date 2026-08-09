# STATE — single shared board

Owner of this file: the team lead under the operating model in force —
`OPERATING-MODEL-v3` until the Owner merges `OPERATING-MODEL-v4`, and v4
thereafter. Merged `main` is the only truth; this board is the index, not the
source.

The queue below is stale at `main@4bb02f3` and is not a current statement of
work. It was last synchronized at `main@cdee150` and does not reflect the
packets merged since, nor the 19 open Issues and 10 open PRs now live. Refresh
it from authoritative surfaces before relying on any row.

Updated: 2026-08-05 — post-WORK-ORDER-003 registry synchronization from
`main@cdee1503ba5fab5481a0ad07393f1ca36191b909`.

P1 is this governance-only registry restoration. It changes no product,
infrastructure, credential, DNS, Vercel, or production setting and becomes
operative only if the Owner merges its reviewed Draft PR.

## Queue — executed in this order

| Priority | Work | Builder / executor | Independent reviewer | State |
| :-- | :--- | :--- | :--- | :--- |
| P0 | Recover domain-account custody and establish authoritative deployed evidence | Owner executes account steps; ChatGPT prepares one step at a time | Claude verifies DNS and HTTP externally | active external dependency; deployed state: **NOT VERIFIED** |
| P1 | Restore registry truth after WORK-ORDER-003 | ChatGPT registrar | Claude | branch-relative: pending while this Draft PR is open; complete only in the Owner-merged state at the exact reviewed head; no product change |
| P2 | Commit and review the ten empirical fixture traces for RP-0008 / WORK-ORDER-001 | ChatGPT research-evidence lane under a separate bounded packet | Claude | path **(a)** selected; read-only POST probes observed 10/10 geocoder and 30/30 join responses, but source evidence is not yet committed and RP-0008 remains partial |
| P3 | Close deployed evidence for TASK-0007, TASK-0010, TASK-0013, and the City/County jurisdiction pages | assigned by next order | non-author lane | after P0: record real-domain p75 CWV and desktop/mobile screenshots; local, preview, or Vercel READY evidence is not canonical-domain evidence |
| P4 | Build Elk Grove, Citrus Heights, Folsom, and Rancho Cordova jurisdiction pages | assigned only after official-source research | non-author lane | research-gated; research at most two jurisdictions at a time and do not write a page before its packet |
| P5 | TASK-0011 resources: `/adu-laws-2026`, `/grants`, and blog shell | assigned by future order | non-author lane | queued; legal/statutory claims require owner or counsel verification |
| P6 | Open the lead-generation phase | Owner decision | independent control review required | closed until P0 and P3 are evidenced, consent/retention/deletion text is adopted, and the Owner supplies a one-sentence ICP plus the business-facts package |

The OpenAI reasoning-plane proposal remains outside this revenue-critical
P0-P6 queue. A read-only data-boundary architecture challenge may proceed in
parallel, but runtime credentials, model calls, PII, canonical writes, and
visitor-path AI remain closed until a separate owner-authorized work order.

## Shipped

- `/studio` deterministic editorial workbench — merged (PR #35, `c3271f3`).
  Catalog release `2026.08.0`; no PII, capture, external effect, pricing, GIS, AI,
  or persistence. TASK-0013 remains `in_progress` because deployed p75 evidence
  is absent.
- WORK-ORDER-003 Studio 450 asset restoration and fail-closed asset integrity —
  product head `0e0f7ba952a979c93bd18570b870214c161d6e34`, merged by the
  Owner in PR #41 as
  `main@cdee1503ba5fab5481a0ad07393f1ca36191b909`.
  Fable reported `REVIEW-WO003-POSTMERGE: PASS` for that exact product head.
  No committed REVIEW artifact is present at this base, so repository-native
  review provenance remains open; this registrar sync does not self-attest the
  product verdict.
- City of Sacramento and unincorporated Sacramento County pages — merged in
  PR #39, `main@9f7c06d409ba1ba2eb7f82a2e306ad7f55cdb64e`.
- Public site routes and deterministic Studio shell described by their committed
  tasks and evidence records.

## Resolved product defect; deployed evidence remains open

The missing `/images/adu-courtyard-concept-v1.webp` and its two Studio
resolution paths were corrected by PR #41 at the product head pinned above.
The former Studio 450 404 is no longer an active source-tree defect.

Canonical-domain DNS and HTTP behavior remain **NOT VERIFIED**. A successful
Vercel build or status check is build evidence, not proof that the owner-visible
domain serves these bytes. TASK-0013 therefore remains open.

## Owner decision queue

1. Execute domain-custody recovery one controlled step at a time from the
   separately reviewed runbook. This PR authorizes no registrar, nameserver,
   DNS, Cloudflare, Vercel, credential, MFA, or billing mutation.
2. Lead generation remains closed until P0 and P3 are evidenced.
3. First ICP and the business-facts package remain future owner inputs; they do
   not block P0-P5 research and governance preparation.

## Known blockers and infrastructure notes

- End-to-end custody of the canonical domain and its serving accounts is not yet
  evidenced. Deployed state stays **NOT VERIFIED** until independent DNS and HTTP
  probes anchor the result.
- Deployed p75 LCP/INP/CLS for TASK-0013 remains unavailable; local or lab
  measurements are not substitutes for field evidence.
- RP-0008 remains partial because ten empirical fixture traces are absent.
  Any jurisdiction or feasibility output **Requires official source
  verification.**
- Canonical Vercel project is recorded as
  `west-coast-kbp-platform-preview`; a green check does not verify the public
  domain.
- Merge to `main` may auto-deploy production. Owner merge remains production
  release authorization; this Draft PR does not infer post-merge behavior.

## Standing constraints

- Demo posture: no contact surface, PII, or external effect.
- Sacramento leads build order; other jurisdiction pages require official-source
  research.
- No AI in the visitor-facing decision path.
- Studio stays 2D-first.
- One order = one bounded scope = one branch = one Draft PR. Owner merges.
