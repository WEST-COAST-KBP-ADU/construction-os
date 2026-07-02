# SourceTrue — West Coast KBP Business Flow Platform

This directory is the **Business SourceTrue**: the single authoritative record of
governance, architecture, decisions, task packets, research packets, and evidence
for the West Coast KBP Business Flow Platform (Construction OS).

The application runtime (Next.js site, future control/artifact layer) lives in
this same repository **outside** this directory. `governance/` contains records
and rules only — never runtime code.

## Structure

| Path | Contents |
| :--- | :------- |
| `charter.md` | Platform identity, vision, and authority model |
| `BOUNDARIES.md` | Hard prohibitions, AI authority limits, data/retention rules |
| `architecture/` | Component map, voice lab architecture, Core compatibility, risk register |
| `context/` | External context packages — pinned projections, zero authority |
| `decisions/` | Decision records (DR-NNNN) — owner-adopted decisions only |
| `tasks/` | Task packets (TASK-NNNN) — bounded, owner-approved work units |
| `research/` | Research packets (RP-NNNN) — Research Gate outputs, zero authority |
| `evidence/` | Run records (RUN-NNNN) — evidence of executed task packets |
| `templates/` | Canonical templates for all record types |
| `sops/` | Standard operating procedures |

## Rules of this directory

1. **No runtime code.** Nothing here is imported, executed, or deployed.
2. **No production PII.** No real customer identity, phone, email, address,
   APN/parcel/permit identifiers, payment data.
3. **No raw transcripts, no recordings, no provider credentials, no API keys,
   no secrets, no operational project facts.**
4. **Owner is the final approval authority.** A decision exists only when a
   decision record marks it `adopted`.
5. **Research is not truth.** External research (Perplexity or otherwise) enters
   only as a research packet and has zero authority until synthesized into an
   owner-adopted decision record.
6. **Every meaningful change arrives through a task packet** and leaves a run
   record behind.

## Record numbering

Records are numbered sequentially and never renumbered: `DR-0001`, `TASK-0001`,
`RP-0001`, `RUN-0001`. A superseded record stays in place with status
`superseded` and a pointer to its successor.
