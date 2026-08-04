# TASK-0010: Premium architectural homepage and global shell

- **Status:** in_progress
- **Date approved:** 2026-08-03
- **Approved by:** owner
- **Related:** DR-0008 (adopted), TASK-0007, TASK-0008

## Objective

Replace the technical-portal homepage with an architectural editorial public
experience for attainable ADU and substantial residential construction, while
preserving the existing controlled, non-capturing public-surface boundaries.

## Owner visual direction

- Photography carries approximately 90% of the first-view visual weight;
  technical drawing lines, axes, and motion remain a restrained supporting layer.
- The market image is attainable middle / upper-middle residential work, not
  mansion, resort, or speculative luxury.
- Owner selected concept 01 on 2026-08-03: a balanced editorial design-build
  direction with serif display typography, five residential paths, a restrained
  process band, and material/interior evidence.
- Show ordinary California lots, practical footprints, believable materials,
  and lived-in residential scale.
- Generated imagery is conceptual and must never be represented as completed
  West Coast KBP work.

## In scope

- Full-screen architectural homepage hero.
- Homepage content hierarchy for ADUs, conversions, and substantial residential
  work using only existing routes.
- Global header, responsive navigation, and footer.
- Optimized, project-local conceptual imagery with recorded provenance.
- Responsive, accessibility, performance, route, link, and button QA.
- Calm blueprint geometry and reduced-motion-safe animation.
- Runtime-dependency reductions needed to produce a deterministic build.

## Out of scope / prohibited

- Forms, intake, contact collection, analytics, pricing, schedules, credentials,
  or completed-project claims.
- Permit, code, zoning, engineering, legal, or buildability conclusions.
- Production, domain, billing, credentials, team membership, Vercel settings,
  or integration changes.
- Approval, merge, or deletion of the task branch.

## Acceptance criteria

- One bounded branch from verified `main` and one Draft PR.
- Homepage reads as residential architecture, not SaaS, a technical portal,
  cyberpunk/HUD, handyman work, or luxury resort marketing.
- Every CTA resolves to an existing route and no visitor data is captured.
- Conceptual images are local, optimized, accurately described, and labeled.
- Header and navigation work at desktop and mobile widths; keyboard focus remains
  visible; motion honors `prefers-reduced-motion`.
- `npm run lint`, `npm test`, and `npm run build` pass.
- Vercel preview and deployed desktop/mobile screenshots are attached or the
  exact external blocker is recorded without claiming completion.

## Image provenance

The four v2 assets were generated with the built-in OpenAI image generation
tool on 2026-08-03 for the owner-selected balanced direction. They depict
fictional concepts and contain no client, parcel, project, or production facts.

| Asset | Source SHA-256 | Published SHA-256 | Intended use |
| :---- | :------------- | :---------------- | :----------- |
| `balanced-adu-hero-concept-v2.webp` | `cfec0edb5f0de439ea0da641144f49ef98afa4d4c028cbf49d3c00d6b25a510d` | `ba9ae05b88f05fe287bc358e534c8eadf0128698a366e8e1abc9263523787b80` | Full-screen hero |
| `balanced-residential-addition-concept-v2.webp` | `8be834257efc84e3b181b9d433b37f2775349481fea21f93b724b16bb5a45793` | `b4a19d4a251d983005df4f565bf708845989dbd47d675f7e84f83086bbee21a0` | Solutions editorial image |
| `balanced-process-materials-concept-v2.webp` | `24cff628c55fb0f9108d4b80b9e03a5b9a3c539295e56f5860adec98659fb1f0` | `d49460d7ab2b632f92e0d0f588e1c8d4b4ceaa009d56d4a8e7ccf2eb0812eefe` | Process/material review image |
| `balanced-interior-concept-v2.webp` | `3572de42ae8057f4f7724e1e281f2c68f89eb8dde3af0f8b43ac59de6df037c0` | `312184c2614296bd25dcde6487637ee0b12e3fc4b69274084452fa13303f360c` | Quality/interior image |

## Evidence plan

RUN-0010 will record the pinned base and branch commit, changed-file scope,
lint/test/build results, route and interaction checks, Vercel status, screenshot
evidence, deviations, and any remaining external blockers. No PII is permitted.

## Boundary check

- [x] Work stays inside `BOUNDARIES.md`.
- [x] No provider configuration or external business action is authorized.
- [x] No visitor data capture, production PII, price, schedule, or credential is introduced.
- [x] Evidence plan uses only lab-safe and repository-state fields.

