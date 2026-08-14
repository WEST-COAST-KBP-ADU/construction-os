import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it, vi } from "vitest";

import {
  VISUAL_RUNTIME_TIMING,
  createVisualRuntimeBoundary,
  type VisualRuntimeEnvironment,
} from "./visualRuntime";

function harness(options: { client?: boolean; reduced?: boolean } = {}) {
  const listeners = new Set<() => void>();
  let visibilityState: DocumentVisibilityState = "visible";
  const document = {
    addEventListener: (_name: string, listener: EventListenerOrEventListenerObject) =>
      listeners.add(listener as () => void),
    removeEventListener: (
      _name: string,
      listener: EventListenerOrEventListenerObject,
    ) => listeners.delete(listener as () => void),
    get visibilityState() {
      return visibilityState;
    },
  };
  const gsap = { marker: "gsap" };
  const loadGsap = vi.fn(async () => gsap);
  const environment: VisualRuntimeEnvironment = {
    isClient: () => options.client ?? true,
    document: () => (options.client === false ? null : document),
    prefersReducedMotion: () => options.reduced ?? false,
    loadGsap: loadGsap as unknown as VisualRuntimeEnvironment["loadGsap"],
  };

  return {
    environment,
    gsap,
    loadGsap,
    listenerCount: () => listeners.size,
    setVisibility(state: DocumentVisibilityState) {
      visibilityState = state;
      listeners.forEach((listener) => listener());
    },
  };
}

function animation() {
  return { pause: vi.fn(), resume: vi.fn(), kill: vi.fn() };
}

describe("bounded visual runtime", () => {
  it("is safe to import and refuses loading without a client environment", async () => {
    const test = harness({ client: false });
    const request = createVisualRuntimeBoundary(test.environment);

    await expect(request()).resolves.toEqual({
      status: "unavailable",
      reason: "client-environment-required",
    });
    expect(test.loadGsap).not.toHaveBeenCalled();
  });

  it("keeps GSAP behind the explicit dynamic-load boundary", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/lib/visualRuntime.ts"),
      "utf8",
    );

    expect(source).toContain('import type { gsap as Gsap } from "gsap"');
    expect(source).toContain('await import("gsap")');
    expect(source).not.toMatch(/^import (?!type).*from ["']gsap["']/m);
  });

  it("shares one lazy load across concurrent calls", async () => {
    const test = harness();
    let release!: () => void;
    test.environment.loadGsap = vi.fn(
      () =>
        new Promise<never>((resolve) => {
          release = () => resolve(test.gsap as never);
        }),
    );
    const request = createVisualRuntimeBoundary(test.environment);

    const first = request("normal");
    const second = request("reduced-motion");
    expect(test.environment.loadGsap).toHaveBeenCalledTimes(1);
    release();

    const [firstResult, secondResult] = await Promise.all([first, second]);
    expect(firstResult.status).toBe("normal");
    expect(secondResult.status).toBe("reduced-motion");
  });

  it("pins exact normal, reduced, and no-motion timing", () => {
    expect(VISUAL_RUNTIME_TIMING).toEqual({
      normal: { transitionMs: 480, settleMs: 120 },
      "reduced-motion": { transitionMs: 120, settleMs: 0 },
      "no-motion": { transitionMs: 0, settleMs: 0 },
    });
  });

  it("makes the motion preference load-bearing and completes no-motion without GSAP", async () => {
    const reduced = harness({ reduced: true });
    const reducedResult = await createVisualRuntimeBoundary(reduced.environment)();
    expect(reducedResult.status).toBe("reduced-motion");
    expect(reduced.loadGsap).toHaveBeenCalledTimes(1);

    const none = harness();
    const noMotionResult = await createVisualRuntimeBoundary(none.environment)(
      "no-motion",
    );
    expect(noMotionResult).toMatchObject({
      status: "no-motion",
      timing: { transitionMs: 0, settleMs: 0 },
      gsap: null,
    });
    expect(none.loadGsap).not.toHaveBeenCalled();
  });

  it("pauses and resumes registered work manually and on visibility changes", async () => {
    const test = harness();
    const result = await createVisualRuntimeBoundary(test.environment)("normal");
    if (result.status !== "normal") throw new Error("Expected normal runtime");
    const handle = animation();
    result.controller.register(handle);

    result.controller.pause();
    result.controller.pause();
    expect(handle.pause).toHaveBeenCalledTimes(1);
    result.controller.resume();
    expect(handle.resume).toHaveBeenCalledTimes(1);

    test.setVisibility("hidden");
    expect(handle.pause).toHaveBeenCalledTimes(2);
    test.setVisibility("visible");
    expect(handle.resume).toHaveBeenCalledTimes(2);
  });

  it("tears down once, removes visibility work, and kills late registrations", async () => {
    const test = harness();
    const result = await createVisualRuntimeBoundary(test.environment)("normal");
    if (result.status !== "normal") throw new Error("Expected normal runtime");
    const active = animation();
    result.controller.register(active);
    expect(test.listenerCount()).toBe(1);

    result.controller.teardown();
    result.controller.teardown();
    expect(active.kill).toHaveBeenCalledTimes(1);
    expect(test.listenerCount()).toBe(0);

    const late = animation();
    result.controller.register(late);
    expect(late.kill).toHaveBeenCalledTimes(1);
  });

  it("caches a stable load failure and does not retry implicitly", async () => {
    const test = harness();
    test.environment.loadGsap = vi.fn(async () => {
      throw new Error("chunk unavailable");
    });
    const request = createVisualRuntimeBoundary(test.environment);

    await expect(request("normal")).resolves.toEqual({
      status: "load-failure",
      reason: "chunk unavailable",
    });
    await expect(request("normal")).resolves.toEqual({
      status: "load-failure",
      reason: "chunk unavailable",
    });
    expect(test.environment.loadGsap).toHaveBeenCalledTimes(1);
  });
});
