KBP_PACKET/v1

<!--
This template is the pull request contract for WEST-COAST-KBP-ADU/construction-os.
Every marker below is required and is validated by the `KBP Packet Gate` check.
Do not delete a heading. If a value does not apply, write the exact reason.
Do not copy state from chat or terminal scrollback: every claim needs an artifact.
-->

## Packet binding

- Linked Issue: #
- Packet ID:
- Branch:
- Base SHA (full 40-hex):
- Head SHA (full 40-hex):
- Domain lease:

## Declared allowlist

<!-- Reproduce the exact allowlist from the linked Issue, one path per line, marked create / modify / delete. -->

```
```

## Actual changed paths

<!-- Output of: git diff --name-status <base> <head>. Must be a subset of the declared allowlist. -->

```
```

## Commands and evidence

| Command | Expected | Observed | Evidence |
| :--- | :--- | :--- | :--- |
|  |  |  |  |

## Preview

- Preview required for this diff: yes / no
- Reason:
- Canonical check `Vercel – west-coast-kbp-platform-preview`:
- Disposition:

<!--
A docs-only or infrastructure diff produces no browser, runtime, deployment, or
Production evidence, and none may be claimed from it. The
`Vercel – nextjs-boilerplate` status is noncanonical and is not evidence in
either direction.
-->

## Independent review

- Named non-author reviewer:
- Exact reviewed head SHA:
- Review URL:
- Terminal verdict:

## Owner gate

- Owner gate state: not requested / requested / decided
- Exact head presented to the Owner:
- Owner decision and where it is recorded:

## Production

- [ ] This pull request touched no Production surface: no deployment was triggered, no DNS, access, ruleset, branch-protection, secret, billing, or provider configuration was changed, and Production was not promoted.

## Residual risk and rollback

- Residual risk:
- Rollback:

## Author attestation

- [ ] This pull request is Draft and remains Draft until the Owner gate.
- [ ] I am the author engagement of this head and I have not reviewed, approved, certified, or merged my own work.
- [ ] Every claim above is backed by an artifact — exact SHA, command output, check run, review URL, or official source — not by assertion.
- [ ] The changed paths are exactly a subset of the allowlist declared in the linked Issue.
- [ ] No AI worker is launched by anything in this pull request.
