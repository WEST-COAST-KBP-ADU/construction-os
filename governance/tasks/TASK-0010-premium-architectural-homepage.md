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

Both assets were generated with the built-in OpenAI image generation tool on
2026-08-03 for this task. They depict fictional concepts and contain no client,
parcel, project, or production facts.

| Asset | Source SHA-256 | Published SHA-256 | Intended use |
| :---- | :------------- | :---------------- | :----------- |
| `attainable-adu-hero-concept-v1.webp` | `e2356a8c65dd7398da6a7c4e01978082da8af811088a926d7ca1b7ff9127846c` | `90226ec38c12f9187d4d9a2a3d03e4113ae10aeaabee98a5b5bed1b9e5773093` | Full-screen hero |
| `attainable-residential-addition-concept-v1.webp` | `8184301c9f6708406249e6e0c171b37f450179fde7ed995501e31701ac502f1f` | `edc3f8b2155f6faf3ea8f8ecb6915b7f5e91889bc083546ef5a68e95bd3ced1b` | Editorial residential story |

## Evidence plan

RUN-0010 will record the pinned base and branch commit, changed-file scope,
lint/test/build results, route and interaction checks, Vercel status, screenshot
evidence, deviations, and any remaining external blockers. No PII is permitted.

## Boundary check

- [x] Work stays inside `BOUNDARIES.md`.
- [x] No provider configuration or external business action is authorized.
- [x] No visitor data capture, production PII, price, schedule, or credential is introduced.
- [x] Evidence plan uses only lab-safe and repository-state fields.

