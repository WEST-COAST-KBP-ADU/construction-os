# Product 2 business operating-loop motion runtime v0.1

Status: bounded implementation contract. This document does not claim that the
Hero or any visible route motion has been implemented.

## Purpose and boundary

`src/lib/visualRuntime.ts` is the only Product 2 GSAP loading boundary. It makes
the frozen Section E causal sequence implementable later without turning motion
into decoration:

> property and intent → sources and unknowns → bounded work → human review →
> accepted record → next action

The boundary does not mount that sequence, change public copy, start an
animation on import, or authorize any external action. GSAP is bundled as the
exact direct dependency `3.15.0`; the boundary performs no provider or network
fetch beyond loading the application's own dynamic chunk.

## Runtime contract

- Import and server evaluation do not access browser globals or load GSAP.
- `requestVisualRuntime()` is the explicit client request. Concurrent requests
  for one resolved motion mode share one promise and one outcome.
- `auto` resolves to `reduced-motion` when the client preference requires it and
  otherwise resolves to `normal`. A caller can explicitly require `no-motion`.
- Normal timing is `480 ms` transition plus `120 ms` settle. Reduced timing is
  `120 ms` with no settle. No-motion timing is zero and completes without
  loading GSAP. These values are data, not ambient timers started by the module.
- A non-client request returns stable `unavailable`; a rejected application
  chunk returns stable `load-failure`. Neither condition retries implicitly.
- Consumers register their animation handles with the returned controller.
  Manual pause/resume and document visibility pause/resume are explicit.
  Teardown removes the visibility listener and kills registered handles exactly
  once; a handle registered after teardown is killed immediately.

Reduced and no-motion paths preserve the complete causal order. They may reduce
or remove interpolation, but later Hero work must still render every meaningful
state and must not replace causal communication with ambient motion, parallax,
logo motion, AI-show imagery, or a fake graph.

## Deliberate limitations

This packet supplies capability only. It creates no Hero timeline, route import,
React hook, visible output, Preview claim, public claim, Product 1 relationship,
analytics, persistence, provider call, or production/deployment change. Later
Hero work must consume this boundary from its own bounded packet and obtain
independent exact-head visual review.
