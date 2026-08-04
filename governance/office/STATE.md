# STATE — single shared board

Owner of this file: Claude (registrar). ChatGPT edits only its own lane rows,
in the same PR as the work. Merged `main` is the only truth; this board is the
index, not the source.

Updated: 2026-08-04d — PR #31 merged (d89dbb5): operating model, STATE, REVIEW-0001, studio spec, TASK-0013

## Lanes

| Lane | Now | Next | Blocked by |
| :--- | :-- | :--- | :--------- |
| A build (ChatGPT) | Close out TASK-0007/0010 evidence | TASK-0013 studio spike (2D, no PII) | — |
| B research (ChatGPT) | RP-0008 Sacramento GIS (city + county, two rows) | — | — |
| C governance (Claude) | REVIEW-0002 issued: PR #30 audit = PASS | REVIEW of next builder PR | — |
| Landing pages | **parked last** (owner 2026-08-04) — TASK-0011 | after lanes A+B ship | owner order |

## Owner decision queue (blocking, in order)

2. Open lead-generation phase? (supersedes DR-0013 demo posture) — not before
   technical+visual done, per owner 2026-08-04.
3. DR-0011 destination (recommended: option A, owner mailbox).
4. First ICP, one sentence.
5. Business facts package (CSLB, insurance, photos, team) — blocks trust
   content only.

## Infrastructure notes

- Two Vercel projects were bound to this repository. The canonical one is
  `west-coast-kbp-platform-preview` (team KBP CORE, Pro) — green. A stray
  `nextjs-boilerplate` project on a separate Vercel team (`kbp-sistem`, Hobby,
  not accessible from the owner's login) posted a permanent red status:
  "Cannot deploy from a private GitHub organization repository on the Hobby
  plan." Owner removed the branch-deploy binding on 2026-08-04; verify on the
  next PR. **If a red `Vercel – nextjs-boilerplate` check reappears, it is
  cosmetic — it never blocked merge and never reflected the site.** Do not
  remove the Vercel GitHub App installation to fix it: one installation serves
  both projects, so removing it would kill the live deploy.

## Standing constraints (do not re-litigate in chat)

- Demo posture: no contact surface of any kind (DR-0013).
- Market: Sacramento ring leads build order; both rings core (DR-0014).
- No AI in visitor-facing decision path; deterministic pipeline only.
- Public copy English; RU/ES = internal operator capability, unadvertised.
- 2D-first in the studio; 3D only on evidence (REVIEW-0001 §3.3).
- One task, one branch, one draft PR; owner merges.

## Done (chronological tail)

- 2026-08-03: PR #20/#21 governance base; PR #28 DR-0013 + TASK-0011.
- 2026-08-04: PR #30 (DR-0015/0016, builder) and PR #31 (operating model, STATE, REVIEW-0001, studio spec, TASK-0013) merged. REVIEW-0001 issued; queue reordered technical-first; TASK-0013
  written; PR #29 opened (DR-0014 tail + reviews + operating model).
