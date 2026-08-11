/**
 * Typed capability registry for the pinned professional visual-interaction
 * runtime.
 *
 * This module exists to prove the pinned packages resolve, typecheck, and
 * coexist with React 19.2.4 / Next.js 16.2.4. It is consumed only by
 * `capabilities.test.ts`. It must not be imported by any route or component:
 * doing so would pull the heavy client-only capabilities into a bundle by
 * default, which the consumption rules in `./README.md` forbid.
 *
 * The `import type` statements below are erased at runtime. They give the
 * typechecker a static reference to every pinned entrypoint while leaving the
 * runtime module graph empty until a `load()` is explicitly awaited.
 */

import type * as MotionReact from "motion/react";
import type * as RiveReactWebgl2 from "@rive-app/react-webgl2";
import type * as Three from "three";
import type * as ReactThreeFiber from "@react-three/fiber";
import type * as ReactThreeDrei from "@react-three/drei";

export const visualCapabilityIds = [
  "motion",
  "gsap",
  "rive-webgl2",
  "three-r3f-drei",
] as const;

export type VisualCapabilityId = (typeof visualCapabilityIds)[number];

/**
 * `server-safe` capabilities may be evaluated during server rendering. They
 * still load lazily so route bundles stay free of them by default.
 *
 * `client-only` capabilities carry a browser-dependent payload. They fail
 * closed when loaded outside a browser rather than degrading silently.
 */
export type VisualCapabilityEnvironment = "server-safe" | "client-only";

export interface VisualCapability<TModule> {
  readonly id: VisualCapabilityId;
  /** Package specifiers this capability loads, exactly as installed. */
  readonly specifiers: readonly string[];
  readonly environment: VisualCapabilityEnvironment;
  readonly load: () => Promise<TModule>;
}

/**
 * Thrown when a `client-only` capability is loaded outside a browser. Failing
 * closed keeps a browser-dependent payload from being pulled into server
 * evaluation by mistake.
 */
export class ClientOnlyCapabilityError extends Error {
  readonly capabilityId: VisualCapabilityId;

  constructor(capabilityId: VisualCapabilityId) {
    super(
      `Visual capability "${capabilityId}" is client-only and cannot be loaded outside a browser.`,
    );
    this.name = "ClientOnlyCapabilityError";
    this.capabilityId = capabilityId;
  }
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function assertBrowser(capabilityId: VisualCapabilityId): void {
  if (!isBrowser()) {
    throw new ClientOnlyCapabilityError(capabilityId);
  }
}

export type MotionCapabilityModule = typeof MotionReact;

export interface GsapCapabilityModule {
  readonly gsap: typeof import("gsap").gsap;
  readonly ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger;
}

export type RiveCapabilityModule = typeof RiveReactWebgl2;

export interface ThreeCapabilityModule {
  readonly three: typeof Three;
  readonly fiber: typeof ReactThreeFiber;
  readonly drei: typeof ReactThreeDrei;
}

/**
 * Motion's React entrypoint. Server-safe: importing it registers nothing and
 * touches no browser global.
 */
const motionCapability: VisualCapability<MotionCapabilityModule> = {
  id: "motion",
  specifiers: ["motion/react"],
  environment: "server-safe",
  load: () => import("motion/react"),
};

/**
 * GSAP core plus the ScrollTrigger plugin.
 *
 * `registerPlugin` is deliberately NOT called here. Registration is a
 * browser-scoped side effect and belongs in the client component that actually
 * animates, guarded by a reduced-motion check.
 */
const gsapCapability: VisualCapability<GsapCapabilityModule> = {
  id: "gsap",
  specifiers: ["gsap", "gsap/ScrollTrigger"],
  environment: "server-safe",
  load: async () => {
    const [core, scrollTrigger] = await Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
    ]);

    return { gsap: core.gsap, ScrollTrigger: scrollTrigger.ScrollTrigger };
  },
};

/** Rive WebGL2. Client-only: the renderer requires a live WebGL2 context. */
const riveCapability: VisualCapability<RiveCapabilityModule> = {
  id: "rive-webgl2",
  specifiers: ["@rive-app/react-webgl2"],
  environment: "client-only",
  load: async () => {
    assertBrowser("rive-webgl2");

    return import("@rive-app/react-webgl2");
  },
};

/** Three.js with React Three Fiber and Drei. Client-only for the same reason. */
const threeCapability: VisualCapability<ThreeCapabilityModule> = {
  id: "three-r3f-drei",
  specifiers: ["three", "@react-three/fiber", "@react-three/drei"],
  environment: "client-only",
  load: async () => {
    assertBrowser("three-r3f-drei");

    const [three, fiber, drei] = await Promise.all([
      import("three"),
      import("@react-three/fiber"),
      import("@react-three/drei"),
    ]);

    return { three, fiber, drei };
  },
};

export const visualRuntimeCapabilities = {
  motion: motionCapability,
  gsap: gsapCapability,
  "rive-webgl2": riveCapability,
  "three-r3f-drei": threeCapability,
} as const satisfies Record<VisualCapabilityId, VisualCapability<unknown>>;

export type VisualRuntimeCapabilities = typeof visualRuntimeCapabilities;
