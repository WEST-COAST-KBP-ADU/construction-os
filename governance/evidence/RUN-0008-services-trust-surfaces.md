# RUN-0008: Services and trust surfaces

| Field | Value |
| :---- | :---- |
| timestamp | 2026-08-04T02:10Z |
| event type | static route build and deployed-preview status verification |
| accept/reject result | partial |
| latency marker | production build compile: 4.1 s; deployed route probe: not measured |
| error class | preview_route_url_unavailable_without_vercel_session |
| sanitized summary | Seven public routes generated; lint accepted; build accepted; 46 of 46 tests accepted; local route probes accepted; invalid service slug rejected with 404; static no-capture, visual-token, runtime-origin, and FAQPage guards accepted; authorized Vercel preview deployment status accepted; direct deployed route inspection remains unverified. |
