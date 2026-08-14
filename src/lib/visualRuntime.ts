import type { gsap as Gsap } from "gsap";

export type VisualMotionMode = "normal" | "reduced-motion" | "no-motion";

export type VisualRuntimeTiming = Readonly<{
  transitionMs: number;
  settleMs: number;
}>;

export const VISUAL_RUNTIME_TIMING: Readonly<
  Record<VisualMotionMode, VisualRuntimeTiming>
> = Object.freeze({
  normal: Object.freeze({ transitionMs: 480, settleMs: 120 }),
  "reduced-motion": Object.freeze({ transitionMs: 120, settleMs: 0 }),
  "no-motion": Object.freeze({ transitionMs: 0, settleMs: 0 }),
});

export interface VisualAnimationHandle {
  pause(): unknown;
  resume(): unknown;
  kill(): unknown;
}

export interface VisualRuntimeController {
  readonly paused: boolean;
  readonly tornDown: boolean;
  register(animation: VisualAnimationHandle): () => void;
  pause(): void;
  resume(): void;
  teardown(): void;
}

export type VisualRuntimeReady = Readonly<{
  status: VisualMotionMode;
  timing: VisualRuntimeTiming;
  gsap: typeof Gsap | null;
  controller: VisualRuntimeController;
}>;

export type VisualRuntimeResult =
  | VisualRuntimeReady
  | Readonly<{ status: "unavailable"; reason: "client-environment-required" }>
  | Readonly<{ status: "load-failure"; reason: string }>;

export type VisualMotionRequest = VisualMotionMode | "auto";

type VisibilityDocument = Pick<
  Document,
  "addEventListener" | "removeEventListener" | "visibilityState"
>;

export interface VisualRuntimeEnvironment {
  isClient(): boolean;
  document(): VisibilityDocument | null;
  prefersReducedMotion(): boolean;
  loadGsap(): Promise<typeof Gsap>;
}

function defaultEnvironment(): VisualRuntimeEnvironment {
  return {
    isClient: () => typeof window !== "undefined" && typeof document !== "undefined",
    document: () => (typeof document === "undefined" ? null : document),
    prefersReducedMotion: () =>
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    loadGsap: async () => {
      const loadedGsap = await import("gsap");
      return loadedGsap.gsap;
    },
  };
}

function failureReason(error: unknown): string {
  if (error instanceof Error && error.message.trim()) return error.message;
  return "gsap-load-failed";
}

function resolveMotionMode(
  request: VisualMotionRequest,
  environment: VisualRuntimeEnvironment,
): VisualMotionMode {
  if (request !== "auto") return request;
  return environment.prefersReducedMotion() ? "reduced-motion" : "normal";
}

function createController(
  visibilityDocument: VisibilityDocument,
): VisualRuntimeController {
  const animations = new Set<VisualAnimationHandle>();
  let manuallyPaused = false;
  let visibilityPaused = visibilityDocument.visibilityState === "hidden";
  let tornDown = false;

  const shouldPause = () => manuallyPaused || visibilityPaused;
  const pauseAll = () => animations.forEach((animation) => animation.pause());
  const resumeAll = () => animations.forEach((animation) => animation.resume());

  const onVisibilityChange = () => {
    if (tornDown) return;
    const wasPaused = shouldPause();
    visibilityPaused = visibilityDocument.visibilityState === "hidden";
    if (!wasPaused && shouldPause()) pauseAll();
    if (wasPaused && !shouldPause()) resumeAll();
  };

  visibilityDocument.addEventListener("visibilitychange", onVisibilityChange);

  return {
    get paused() {
      return shouldPause();
    },
    get tornDown() {
      return tornDown;
    },
    register(animation) {
      if (tornDown) {
        animation.kill();
        return () => undefined;
      }

      animations.add(animation);
      if (shouldPause()) animation.pause();

      let registered = true;
      return () => {
        if (!registered) return;
        registered = false;
        animations.delete(animation);
      };
    },
    pause() {
      if (tornDown || manuallyPaused) return;
      const wasPaused = shouldPause();
      manuallyPaused = true;
      if (!wasPaused) pauseAll();
    },
    resume() {
      if (tornDown || !manuallyPaused) return;
      const wasPaused = shouldPause();
      manuallyPaused = false;
      if (wasPaused && !shouldPause()) resumeAll();
    },
    teardown() {
      if (tornDown) return;
      tornDown = true;
      visibilityDocument.removeEventListener(
        "visibilitychange",
        onVisibilityChange,
      );
      animations.forEach((animation) => animation.kill());
      animations.clear();
    },
  };
}

export function createVisualRuntimeBoundary(
  environment: VisualRuntimeEnvironment = defaultEnvironment(),
) {
  const requests = new Map<VisualMotionMode, Promise<VisualRuntimeResult>>();
  let gsapLoad: Promise<typeof Gsap> | undefined;

  const loadGsapOnce = () => {
    gsapLoad ??= environment.loadGsap();
    return gsapLoad;
  };

  return async function requestVisualRuntime(
    request: VisualMotionRequest = "auto",
  ): Promise<VisualRuntimeResult> {
    if (!environment.isClient()) {
      return {
        status: "unavailable",
        reason: "client-environment-required",
      };
    }

    const visibilityDocument = environment.document();
    if (!visibilityDocument) {
      return {
        status: "unavailable",
        reason: "client-environment-required",
      };
    }

    const mode = resolveMotionMode(request, environment);
    const existing = requests.get(mode);
    if (existing) return existing;

    const pending = (async (): Promise<VisualRuntimeResult> => {
      if (mode === "no-motion") {
        return {
          status: mode,
          timing: VISUAL_RUNTIME_TIMING[mode],
          gsap: null,
          controller: createController(visibilityDocument),
        };
      }

      try {
        const gsap = await loadGsapOnce();
        return {
          status: mode,
          timing: VISUAL_RUNTIME_TIMING[mode],
          gsap,
          controller: createController(visibilityDocument),
        };
      } catch (error) {
        return { status: "load-failure", reason: failureReason(error) };
      }
    })();

    requests.set(mode, pending);
    return pending;
  };
}

export const requestVisualRuntime = createVisualRuntimeBoundary();
