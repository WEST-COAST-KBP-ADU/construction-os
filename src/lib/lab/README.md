# Text-Mode Intake Lab

Lab code for TASK-0003 (see `governance/tasks/TASK-0003-text-intake-lab.md`).
Proves the vendor-independent chain on synthetic data:

```
guardrails (screen + sanitize)
→ sanitized intake artifact (structural whitelist)
→ OwnerReview packet candidate (restricted-claim checked)
```

Status: **lab only, not production-authorized.** No network, no persistence,
no providers, no real data. Operation names follow DR-0006. Boundaries:
`governance/BOUNDARIES.md`.

| Module | DR-0006 operation | Effect class |
| :----- | :---------------- | :----------- |
| `intakeArtifact.ts` | `create_intake_artifact` | `local_write` |
| `ownerReviewPacket.ts` | `create_ownerreview_packet` | `local_write` |
| `guardrails.ts` | (enforcement, no effects) | — |

Tests: `npm test` (vitest, `*.test.ts` alongside the modules).
