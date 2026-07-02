# DR-0006: Domain operation vocabulary v1

- **Status:** adopted
- **Date:** 2026-07-02
- **Decider:** owner
- **Related:** `architecture/core-compatibility.md`, DR-0004, BOUNDARIES.md

## Context

The KBP Core context package (pinned `bb52a6f`) permits contracts-first design
of a domain operation vocabulary with honest effect classes. A draft table was
prepared in `architecture/core-compatibility.md` and reviewed by the owner.

## Decision

The candidate vocabulary is adopted as **v1**:

| Operation | Effect class | Default verdict |
| :-------- | :----------- | :-------------- |
| `create_lead_candidate` | `local_write` | gate-checked |
| `create_intake_artifact` | `local_write` | gate-checked |
| `create_ownerreview_packet` | `local_write` | gate-checked |
| `create_estimate_draft` | `local_write` | gate-checked |
| `send_client_email` | `external_io` | require_approval |
| `create_calendar_event` | `external_io` | require_approval |
| `write_crm_record` | `external_io` | require_approval |
| `schedule_crew` | `external_io` | require_approval |
| `submit_permit_doc` | `external_io` (candidate for `destructive`) | require_approval |
| `issue_purchase_order` | `financial` | require_approval |

Invariant: AI-free work is `local_write` on candidate artifacts only; every
client-facing, calendar, CRM, permit, or money operation sits in an
approval-required effect class.

## Consequences

- Lab code names its artifact-producing functions after these operations.
- New operations require a superseding decision record; none may be added ad
  hoc in code.
- The vocabulary remains a design contract only — no broker, gate, or
  automation exists in this repository.

## Revisit trigger

Kernel-side opening of business automation in kbp-core, or a new business
domain operation that does not fit the v1 list.

## Boundary check

- [x] No PII, secrets, transcripts, or recordings introduced
- [x] No external action authorized implicitly
- [x] Research claims verified or marked "Requires official source verification"
