# HANDOVER — Portal Build v1

**Audience:** builder engineer (Codex / ChatGPT) per DR-0009.
**Repository:** `WEST-COAST-KBP-ADU/construction-os`
**Issued:** 2026-08-03 · Owner directive: start with visual identity, GIS
groundwork, and platform content.

> **Supersession notice (2026-08-04):** This handover predates DR-0014,
> DR-0015, and DR-0016. Those records and the current task packet control any
> conflict. Phase 1 is no-contact/no-tracking; DR-0011 selects only a future
> pilot destination; public automated voice is English-only and public phone
> remains closed. The older queue and phase labels below are provenance.

This document is self-contained enough to start from. It is not a substitute
for the governance records it cites — read those before writing code.

---

## 0. Precondition

This precondition is historical. The referenced governance records were merged.
For new work, verify the current committed `main`, read the active task packet,
and branch only from its pinned or owner-approved base. Do not reuse the stale
historical branch named in earlier versions of this handover.

---

## 1. What this repository is

A Next.js 16 (App Router) application deployed on Vercel, serving
`westcoastkbp.com` — the public platform site for a California ADU and
residential construction business operating in the Sacramento region.

The repository has two halves with a hard wall between them:

| Path | Role |
| :--- | :--- |
| `governance/` | **SourceTrue.** Records and rules only. Never imported, executed, or deployed. Contains no runtime code, no PII, no secrets. |
| everything else | The application runtime. |

The site today is a single-page public preview: nine sections on `app/page.tsx`,
in-page anchor navigation, and — stated explicitly in `src/lib/siteConfig.ts` —
zero collection, submission, storage, or tracking of any kind. Every CTA is an
inert placeholder.

Your job in this handover is to make it look like a real product and read like
a real product, **without changing that last fact**. DR-0015 opens acquisition
content only; production capture remains closed behind later gates (§7).

---

## 2. Your role and authority

Per DR-0009 you are the **builder**: you design and write implementation code
and site content under the owner's direction.

You do not have approval authority. Specifically, you never:

- merge to `main` — the owner merges, always;
- decide anything that a decision record would decide;
- invent a business fact (license number, warranty term, project photo,
  price, timeline, credential) that the owner has not supplied;
- add a vendor, account, SDK, tracking tag, or external service.

When you hit a question that a governance record should answer and none does,
stop and surface it rather than choosing. A surfaced question costs an hour.
A wrong invented fact on a public construction site costs more.

---

## 3. Hard constraints

These come from `governance/BOUNDARIES.md` and `governance/charter.md`, both
adopted. They bind every line you write. Read both files in full before your
first commit.

**Content constraints — nothing visitor-facing may:**

- promise or imply a price, cost range, or schedule;
- state or imply a permit, code, zoning, buildability, entitlement, or legal
  conclusion — including soft forms like "your lot qualifies";
- publish a credential (CSLB number, insurance, warranty terms) until the
  owner supplies the business facts package;
- present stock or placeholder imagery as a real completed project;
- use non-English copy on public pages under this handover; no localization
  packet exists. Separately, DR-0016 limits any future public automated voice
  to English and keeps Spanish/Russian as internal/operator capabilities.

Any statement that is uncertain and screening-flavored carries the exact
required wording:

> Requires official source verification.

**Technical constraints — do not, in this handover:**

- add any form that submits anywhere, any input that is persisted, any email
  send, any API route that accepts user data;
- add analytics, pixels, tag managers, session recording, or cookies;
- load fonts, scripts, or styles from a third-party origin at runtime
  (self-host everything);
- introduce a database, ORM, auth, or CMS;
- add a dependency without saying why in the PR description.

**Data constraints:**

- No PII anywhere — not in code, not in fixtures, not in commit messages, not
  in `governance/`. Street address, email, phone, name, and APN/parcel
  identifiers tied to real inquiries are all PII.
- Test fixtures use public non-residential addresses (city hall, library) or
  synthetic data. Never a real inquiry.

---

## 4. Stack and repository orientation

```
app/                    App Router: layout.tsx, page.tsx, globals.css
src/components/         Section components (Hero, TrustBar, Process, …)
src/lib/siteConfig.ts   Single source of truth for all public-facing copy
src/lib/structuredData.ts  JSON-LD builders
src/lib/lab/            Intake lab modules from TASK-0003 (not wired to the site)
public/                 Static assets, llms.txt, robots, sitemap
governance/             SourceTrue (see §1)
```

- Next.js `16.2.4`, React `19.2.4`, Tailwind CSS v4 (PostCSS plugin),
  TypeScript, ESLint 9, Vitest.
- Scripts: `npm run dev` · `npm run build` · `npm run lint` · `npm test`.

**Read `AGENTS.md` at the repository root before writing any Next.js code.**
This Next.js version carries breaking changes against older conventions; the
canonical reference is `node_modules/next/dist/docs/`. Do not write from
memory of an older App Router.

All public copy flows through `src/lib/siteConfig.ts`. When you add routes,
extend that pattern — one typed source of truth per surface — rather than
inlining strings into components.

---

## 5. Workflow

One task = one meaning = one pull request. Three tasks are queued below;
TASK-0008 may be split into at most three PRs along the natural content
seams noted in its packet.

For each task:

1. Branch from `main`.
2. Implement exactly what the packet's **In scope** section lists. If you find
   yourself editing something outside it, that is a signal to stop and ask.
3. `npm run lint` and `npm run build` must pass. `npm test` must pass if the
   task adds or touches tests.
4. Open a **draft** pull request. Title: `TASK-000N: <packet objective>`.
   Body must contain:
   - what changed, in prose, not a file list;
   - the packet's acceptance criteria as a checklist with evidence for each
     (numbers, screenshots, command output — not assertions);
   - anything you deliberately did not do, and why;
   - any question you surfaced instead of deciding.
5. Add a run record `governance/evidence/RUN-000N-<slug>.md` using
   `governance/templates/run-record.md`. Whitelisted fields only: timestamp,
   event type, accept/reject result, latency marker, error class, sanitized
   non-PII summary. Nothing else — this is a hard boundary, not a style note.
6. Update the registry row in `governance/tasks/README.md` (status → `done`
   only after the owner merges).
7. Stop. Wait for owner review before starting the next task.

---

## 6. The queue

Execute in order. Task 3 is independent and may run in parallel.

### TASK-0007 — Land the portal design foundation
Packet: `TASK-0007-visual-identity-pass.md` · Blueprint §9

**Do not build a new homepage.** The design foundation already exists, unmerged,
on `feature/task-0006a-production-grade-portal-foundation-v0.1`: token layer in
`app/globals.css` plus a component system. Your job is to rebase that branch onto
`main`, audit every visitor-facing string against `BOUNDARIES.md`, strip any
address input from `PropertyScreeningPreview` (capture is blocked), enforce that
no component hard-codes a color/size/spacing value, self-host fonts, and land it.

Quality bar, measured on the deployed Vercel preview, not locally: Lighthouse
mobile Performance ≥ 90, Accessibility ≥ 95, LCP < 2.5s, CLS < 0.1. Paste the
numbers and before/after screenshots into the PR.

Read the packet in full — it lists the conflict-resolution rule and the exact
audit obligations.

### TASK-0008 — P1 content build-out
Packet: `TASK-0008-p1-content-buildout.md` · Blueprint §§2–3, §8 (P1)
Depends on TASK-0007 tokens.

Build the blueprint's information architecture as real routes: five service
pages, `/process`, `/faq` (from the approved draft at
`governance/drafts/faq-adu-draft-v1.md`), seven city pages under
`/adu-builder/[city]`, an `/about` shell, and `/compare`. Extend JSON-LD and
FAQPage coverage to every new route; update `sitemap` and `public/llms.txt`.

The city pages are the trap in this task. Seven find-replace clones with a
swapped city name are worse than one page — thin duplicated content is
actively penalized in AI-search retrieval (RP-0001), which is the channel this
whole site is being built for. Each city page must carry substantively
different material: local statutory-floor education, jurisdiction-specific
process structure, genuinely local context. If you cannot source real
differentiation for a city, ship fewer city pages and say so.

Still zero capture: no forms, no email fields, no booking. Pricing, ROI, and
cost content stay out — they are blocked by a policy decision the owner has
not made (blueprint §10).

### TASK-0009 — GIS source research, first jurisdiction
Packet: `TASK-0009-gis-source-research.md` · Design:
`governance/architecture/property-intelligence-v0.1.md` §§5, 8

**Research only. No code, no integration, no vendor account.** Output is a
single research packet `governance/research/RP-0007-gis-sources-<jurisdiction>.md`
following `governance/templates/research-packet.md`.

DR-0014 supersedes the old Roseville default. Sacramento County
(unincorporated) and City of Sacramento are the first build-order authorities;
RP-0007 Roseville remains the sourcing-method template.

Answer, with citations: which public endpoints expose parcel geometry, lot
area, zoning district, and overlay layers; what each source's terms of use say
verbatim about automated querying, attribution, and redistribution of derived
output; whether a free public geocoder suffices; how often each layer refreshes
and how staleness is detectable. Fill the coverage-matrix row in
`property-intelligence-v0.1.md` §5 with verified answers.

Then hand-trace five public non-residential addresses end to end and record
every mismatch you find between sources. That spot-check is the most valuable
part of this task — it is the only thing that will tell the owner whether the
public data is good enough to build a product on.

Collect current California ADU statutory-floor citations for the owner and
counsel, marked **"requires owner/counsel verification."** You do not verify
statute, and you never state a floor as fact.

---

## 7. Blocked — do not build, do not work around

| Blocked | Blocking gate |
| :------ | :------------ |
| Any lead capture, intake form, or email field | DR-0015 keeps production intake closed; DR-0011 selects only a future pilot destination and does not authorize implementation |
| Address-first screening tool, any parcel lookup in the app | DR-0012 (proposed) + open Research Gate; TASK-0009 is what closes it |
| Cost, pricing, ROI, timeline content | Cost & timeline display policy (blueprint §10) — no decision record exists |
| Credentials, real portfolio, team facts | Owner business-facts package not supplied |
| Analytics, pixels, CRM, consent banner | DR-0015 keeps these closed; later privacy, consent, measurement, and implementation gates are required |
| Voice, phone routing, provider config | DR-0015 keeps public phone closed; Phase 5+ is nonbinding; DR-0002 and DR-0016 apply |

If a task appears to require something in this table, it is scoped wrong.
Surface it; do not route around it.

---

## 8. Owner inputs still outstanding

Do not invent any of these. Where a page structurally needs one, use a
visibly-labeled placeholder that says `pending owner input` — never a
plausible-looking fake.

- Business facts package: CSLB license number, insurance and warranty terms,
  real project photography, team bios.
- Confirmation of the first jurisdiction for TASK-0009.
- Future pilot bounds, consent/privacy controls, and DR-0012 disposition.

---

## 9. Authoritative reading list

In priority order:

1. `governance/BOUNDARIES.md` — hard limits, non-negotiable
2. `governance/charter.md` — identity, authority model, GIS boundary
3. `governance/architecture/portal-blueprint-v0.1.md` — the build plan (adopted, DR-0008)
4. `AGENTS.md` (repo root) — Next.js version guidance
5. Your task packet in `governance/tasks/`
6. `governance/architecture/property-intelligence-v0.1.md` — for TASK-0009
7. `governance/decisions/README.md` — what is adopted vs. merely proposed

A record that is `proposed` decides nothing. Only `adopted` records have force.
