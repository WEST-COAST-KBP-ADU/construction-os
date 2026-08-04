# RUN-0008: Services and trust surfaces

| Field | Value |
| :---- | :---- |
| timestamp | 2026-08-04T02:22Z |
| event type | static route build, visual regression audit, and deployed-preview status verification |
| accept/reject result | partial |
| latency marker | production build compile: 4.2 s; deployed route probe: not measured |
| error class | preview_route_url_unavailable_without_vercel_session |
| sanitized summary | Seven public routes generated; lint accepted; build accepted; 48 of 48 tests accepted; local route probes accepted before the visual pass; invalid service slug rejected with 404; static no-capture, visual-token, runtime-origin, responsive comparison, dark-mode contrast, and FAQPage guards accepted; authorized Vercel preview deployment status accepted; direct deployed route inspection remains unverified. |
