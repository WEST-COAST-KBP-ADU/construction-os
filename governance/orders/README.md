# Work orders

A committed work order is the only artifact that authorizes builder mutation.
It is issued by the operational lead / registrar, executed by the assigned
builder, and reviewed by a non-author lane at an exact head SHA.

| # | Order | Builder | Reviewer | State |
| :- | :---- | :------ | :------- | :---- |
| [001](WORK-ORDER-001-rp-0008-sacramento-gis.md) | Execute RP-0008 — Sacramento GIS, City + unincorporated County | ChatGPT | Claude | partial; remaining fixture probes blocked |
| [002](WORK-ORDER-002-sacramento-jurisdiction-pages.md) | Implement two sourced Sacramento jurisdiction pages | ChatGPT | Claude | merged in PR #39 |
| [003](WORK-ORDER-003-studio-asset-integrity.md) | Restore Studio 450 asset and enforce asset integrity | ChatGPT | Claude | merged by Owner in PR #41 at product head `0e0f7ba952a979c93bd18570b870214c161d6e34`; post-merge PASS reported; deployed state **NOT VERIFIED** |
| [005](WORK-ORDER-005-development-preview-release-surface.md) | Add a site-wide development-preview release notice | Claude Code | ChatGPT | issued on pinned `main@9373df3925864cad06ef90dc1bca544b760439a8`; implementation prohibited until Owner merge |

