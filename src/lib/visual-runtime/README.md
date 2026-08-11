# Visual runtime — pinned capabilities and mandatory consumption rules

This directory installs and proves the professional visual-interaction runtime.
It adds capability only. It renders nothing, changes no route, and ships no
byte to a visitor.

`capabilities.ts` is a typed registry consumed **only** by `capabilities.test.ts`.
Importing it from a route or component is a defect, not a shortcut: it would
place the client-only payloads in a bundle by default.

## Pinned packages

| Package | Version | Environment |
| --- | --- | --- |
| `motion` | 13.1.0 | server-safe, lazy |
| `gsap` (core + `gsap/ScrollTrigger`) | 3.15.0 | server-safe, lazy |
| `@rive-app/react-webgl2` | 4.31.0 | client-only, lazy |
| `three` | 0.185.1 | client-only, lazy |
| `@react-three/fiber` | 9.7.0 | client-only, lazy |
| `@react-three/drei` | 10.7.8 | client-only, lazy |
| `@types/three` | 0.185.4 | dev dependency |

Versions are exact. Do not substitute, float, or upgrade any of them without a
new packet.

## Mandatory consumption rules

Every future use of this runtime must satisfy all of the following. These are
preconditions on the work, not review suggestions.

1. **Visual target selected before implementation.** An approved visual target
   exists and is named before any animation or scene code is written. Code
   first, target later is not permitted.
2. **Progressive enhancement.** The route must deliver its full meaning and all
   of its interaction with the visual runtime absent. Motion, scroll effects,
   Rive, and 3D are additive layers over content that already works.
3. **Reduced-motion fallback.** Honor `prefers-reduced-motion: reduce`. The
   reduced path is a real, designed, non-animated state — not the animated path
   running faster, and not a blank frame.
4. **Lazy loading and route-level code splitting.** Load every capability
   through a dynamic `import()` at the point of use, inside a client component.
   No visual-runtime package appears in a static import of a shared layout,
   a server component, or a module that a route imports eagerly.
5. **No Rive or 3D payload by default.** The Rive and Three/R3F/Drei payloads
   load only after an explicit trigger — user intent, viewport entry, or an
   idle callback — and never on first paint of a route.
6. **No generated asset or scene treated as product fact.** A generated
   animation, render, or 3D scene is illustrative only. It never stands as
   evidence of a real model, dimension, material, price, geometry, or
   buildability claim, and it is never presented to a visitor as one.
7. **No fake assets.** A CSS shape, `div` construction, or inline SVG must never
   stand in for an approved real asset. If the approved asset does not exist
   yet, the work is blocked — it is not substituted.

## Failure behavior

The client-only capabilities fail closed. Loading one outside a browser throws
`ClientOnlyCapabilityError` rather than degrading silently, so a server-side
import surfaces at once instead of at a visitor's first paint.

GSAP's `registerPlugin` is deliberately not called in this module. Plugin
registration is a browser-scoped side effect and belongs in the client component
that animates, behind the reduced-motion guard required by rule 3.
