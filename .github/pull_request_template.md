KBP_PACKET/v1

<!--
One packet = one bounded outcome = one branch = one Draft PR = one declared file allowlist.

A mutation pull request stays a DRAFT until the Owner gate is open. Do not mark it Ready,
do not approve it, and do not merge it. A green check is evidence, not approval.

Fill every section. Leave no heading empty — the KBP Packet Gate audits for these exact
headings and fails closed when a required marker is missing. Where a section does not
apply, write the exact reason it does not apply rather than deleting the heading.
-->

## Packet

- Linked Issue: #
- Packet ID:
- Domain lease:

## Exact commits

| Field | Value |
| :--- | :--- |
| Branch | |
| Base SHA | |
| Head SHA | |

Base and head are full 40-character lowercase commit SHAs. A new commit on this branch
invalidates every earlier review verdict and requires a fresh review at the new exact head.

## Declared allowlist

<!-- Copy the exact allowlist from the Issue, one concrete path per line, prefixed create / modify / delete. -->

```
```

## Actual changed paths

<!-- Output of: git diff --name-status <base>..<head> -->

```
```

Every actual changed path must appear in the declared allowlist. Any path outside it is a
fail-closed condition, not a detail to reconcile after the fact.

## Command and evidence table

| Command | Expected | Observed | Evidence |
| :--- | :--- | :--- | :--- |
| | | | |

## Preview

- Preview required for this diff: <!-- yes / no -->
- Disposition: <!-- exact Preview deployment evidence, or the exact reason none is required -->

A docs-only or infrastructure diff produces no browser, runtime, deployment, or Production
evidence, and none may be claimed from it. Preview is worker-created engineering evidence;
it is never Owner acceptance.

## Review

- Named non-author reviewer:
- Exact reviewed SHA:
- Review URL:

The author of a head SHA can never review, accept, certify, or merge that head. Two
engagements running the same model family remain distinct engagements. GitHub account
identity alone does not prove engagement separation — the review record must declare its
own model, lane, and session, and state its non-authorship explicitly.

## Owner gate

- Owner gate state: <!-- not requested / requested / decided -->
- Owner decision evidence: <!-- link to the persisted Owner comment, or "none" -->

Tony alone adopts this outcome and merges this pull request.

## Production

<!-- State explicitly that Production is untouched by this pull request, or name exactly what changes. -->

Production untouched by this pull request:

## Residual risk and rollback

- Residual risk:
- Rollback:

## Confirmations

- [ ] I did not review, approve, accept, or certify my own work in this pull request.
- [ ] This pull request carries exactly one packet, one branch, and one declared allowlist.
- [ ] Every actual changed path appears in the declared allowlist above.
- [ ] This pull request remains a Draft until the Owner gate is open, and I will not merge it.
- [ ] No AI worker is launched by any file in this pull request, and no workflow it adds holds a write permission.
