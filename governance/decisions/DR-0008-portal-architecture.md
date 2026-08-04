# DR-0008: Adopt Portal Blueprint v0.1 as the build plan for westcoastkbp.com

- **Status:** adopted — Blueprint §8 sequencing superseded by DR-0015; the
  remaining architecture stays adopted subject to later superseding records
- **Date:** 2026-07-03
- **Decider:** owner
- **Related:** `architecture/portal-blueprint-v0.1.md`, RP-0001…RP-0005,
  DR-0002, DR-0004, DR-0006, DR-0007, DR-0015

## Context

Five research packets (two commissioned by the owner externally, three
produced in-session) converge on the same opportunity: the Sacramento ADU
market has no modern portal, no address-first intake, no client portal, and
weak attribution. The platform's own controlled-execution model is the
differentiator competitors lack.

## Decision

Adopt `architecture/portal-blueprint-v0.1.md` as the canonical build plan:
information architecture (§2–3), 3-tier lead funnel mapped to kernel
operations (§4), candidate stack with per-vendor decision gates (§5), voice
phasing (§6), deferred client portal (§7), build phases P0–P5 (§8), and a
separate dedicated design phase (§9).

DR-0015 supersedes only the §8 P0–P5 sequence. It opens governance Phase 0 and
a no-contact/no-tracking Phase 1; its Phase 2–10 table is nonbinding. The
blueprint's information architecture remains adopted where not otherwise
superseded.

## Explicitly NOT decided by this record

- Production data policy, cost/timeline display policy (own DRs, §10).
- Any vendor adoption (Supabase, GoHighLevel, tracking, voice, parcel data).
- Visual design (separate phase).
- Client portal scope.

## Consequences

- All site/portal task packets reference blueprint sections.
- Blueprint changes require a superseding version (v0.2, …) noted here.

## Revisit trigger

A later owner-approved intake phase reaches production — review the blueprint
against real lead data without relying on superseded phase numbering.

## Boundary check

- [x] No PII, secrets, transcripts, or recordings introduced
- [x] No external action authorized implicitly
- [x] Research claims verified or marked "Requires official source verification"
