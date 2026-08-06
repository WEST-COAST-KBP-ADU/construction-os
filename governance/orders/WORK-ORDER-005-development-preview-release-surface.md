# WORK-ORDER-005 — development-preview release surface

- **Issued by:** operational lead / registrar under Owner directive, 2026-08-06
- **Executor:** Claude Code builder lane
- **Independent reviewer:** ChatGPT non-author lane
- **Pinned base:** `main@9373df3925864cad06ef90dc1bca544b760439a8`
- **Related:** TASK-0010, TASK-0013
- **Allocated evidence record:** RUN-0017

## Single outcome

Make the current public Vercel release unmistakably a development and testing
version without weakening the professional visual system or opening any contact,
intake, data-capture, account, analytics, or external-action surface.

The release remains shareable by direct link for limited visual review. It is
not a lead-generation release.

## Owned paths

- `src/lib/siteConfig.ts`
- `src/components/DevelopmentNotice.tsx` (new)
- `app/layout.tsx`
- `app/globals.css`
- `src/lib/developmentPreview.test.ts` (new)
- `governance/evidence/RUN-0017-development-preview-release-surface.md`
- the WORK-ORDER-005 row in `governance/orders/README.md`, if the row remains
  owned by the builder at execution time

If implementation requires another product, test, metadata, sitemap, robots, or
configuration path, stop and request an amended order. Do not expand the owned
paths silently.

## Binding behavior

1. A compact, non-dismissible notice renders before the global header on every
   application route, including `/` and `/studio`.
2. The notice has two semantic parts:
   - label: `Development preview`;
   - message: `This platform is under active development and is provided for testing and review only.`
3. Supporting copy states that live intake, submissions, customer accounts, and
   external actions are not enabled.
4. Notice content comes from `siteConfig`; route components do not duplicate
   the copy.
5. The notice uses the existing design-token system, remains visually
   subordinate to primary navigation, and does not look like an error,
   emergency alert, cookie banner, or promotional CTA.
6. The release remains responsive, keyboard-safe, and screen-reader legible.
7. No phone number, email address, street address, contractor-license number,
   contact form, input, or submission control is introduced.
8. Current routes, metadata title/description/canonical behavior, structured
   data, navigation, Studio behavior, and conceptual-image disclaimers remain
   unchanged.

## Non-goals

- No homepage redesign, new route, new feature, backend, database, API, account,
  intake, contact, analytics, CRM, GIS, AI, voice, pricing, schedule, permit,
  zoning, buildability, or external integration.
- No public business credential, contractor-license, phone, email, or address.
- No Vercel project, domain, DNS, deployment-protection, environment-variable,
  credential, or access-control change.
- No new dependency.
- Do not claim production-domain custody, canonical-domain verification, field
  performance, or TASK-0010 / TASK-0013 completion.

## Required evidence

- Targeted test proves the exact configured label, primary message, and
  supporting no-live-surface statement.
- `npm run lint`, `npm test`, and `npm run build` with exact results.
- Local browser acceptance at desktop `1363×936` and mobile `390×844` for
  `/`, `/about`, `/adu-builder/sacramento`, `/compare`, `/faq`,
  `/process`, all generated `/services/*` routes, and `/studio`:
  - the notice is visible before the global header;
  - one H1 remains per route;
  - no horizontal overflow;
  - no framework overlay or application console error;
  - no broken first-party image;
  - no form, input, `tel:`, or `mailto:` control;
  - no phone-like, address-like, or contractor-license identifier.
- Desktop and mobile screenshots of `/` and `/studio` attached to the Draft
  PR or referenced by RUN-0017.
- Draft PR identifies exact base SHA, head SHA, changed files, commands,
  results, and any unavailable deployed evidence.

## Blocker behavior

Stop and report the exact fact if the pinned base drifted, an owned path
conflicts with another open PR, the global layout cannot cover every route, the
notice requires a client component or new dependency, an accessibility or
responsive assertion fails, or browser evidence is unavailable. Do not weaken
the notice, hide it behind interaction, introduce a contact surface, edit
deployment settings, or expand scope.

