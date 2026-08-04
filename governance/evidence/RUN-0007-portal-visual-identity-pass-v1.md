# RUN-0007: Portal visual identity pass v1

| Field | Value |
| :---- | :---- |
| timestamp | 2026-08-04T01:08Z |
| event type | deployed preview verification |
| accept/reject result | partial |
| latency marker | production build compile: 4.4 s; deployed Lighthouse mobile: not measured |
| error class | measurement_environment_restricted; pagespeed_quota_exhausted |
| sanitized summary | Branch rebased on main; lint accepted; build accepted; 38 of 38 tests accepted; Vercel preview deployment accepted; static no-capture and token guards accepted; Lighthouse thresholds and complete before/after screenshot set remain unverified. |

## Close-out recheck — 2026-08-04T19:10:18Z

| Field | Value |
| :---- | :---- |
| timestamp | 2026-08-04T19:10:18Z |
| event type | canonical-site visual evidence recheck |
| accept/reject result | partial — required deployed mobile/desktop evidence remains unavailable |
| latency marker | navigation did not reach DOM before timeout |
| error class | cloud_browser_navigation_timeout |
| sanitized summary | Cloud browser connected, but navigation to the canonical public domain timed out before URL, title, viewport, DOM, or screenshot evidence could be recorded. Existing lint, build, test, preview, and static-guard evidence remains unchanged; Lighthouse mobile thresholds and a complete screenshot set remain unverified. |
