import { describe, expect, it, vi } from "vitest";

import { HOUSE_PORTAL_DESTINATION, runHousePortalTransition } from "./housePortalMotion";

describe("house portal motion", () => {
  it("binds the exact destination and desktop cinematic contract", async () => {
    const to = vi.fn().mockReturnThis();
    const timeline = vi.fn(({ onComplete }) => ({ to, onComplete }));
    const create = vi.fn(() => "housePortalEase");
    const complete = vi.fn();
    await runHousePortalTransition({ media: {} as Element, fadingControls: {} as Element, reducedMotion: false, onComplete: complete, onFailure: vi.fn(), loadRuntime: async () => ({ gsap: { timeline, registerPlugin: vi.fn() }, CustomEase: { create } }) });
    expect(HOUSE_PORTAL_DESTINATION).toBe("/studio?entry=house-portal&model=adu-a-600");
    expect(create).toHaveBeenCalledWith("housePortalEase", "cubic-bezier(0.2, 0.8, 0.2, 1)");
    expect(to).toHaveBeenCalledWith(expect.anything(), { scale: 1.08, x: -56, y: -18, duration: 1.35 }, 0);
  });

  it("uses opacity only for reduced motion and fails open to navigation", async () => {
    const to = vi.fn().mockReturnThis();
    await runHousePortalTransition({ media: {} as Element, fadingControls: {} as Element, reducedMotion: true, onComplete: vi.fn(), onFailure: vi.fn(), loadRuntime: async () => ({ gsap: { timeline: () => ({ to }), registerPlugin: vi.fn() }, CustomEase: { create: () => "ease" } }) });
    expect(to).toHaveBeenCalledTimes(1);
    expect(to).toHaveBeenCalledWith(expect.anything(), { opacity: 0, duration: 0.14 }, 0);
    const failure = vi.fn();
    await runHousePortalTransition({ media: {} as Element, fadingControls: {} as Element, reducedMotion: false, onComplete: vi.fn(), onFailure: failure, loadRuntime: async () => { throw new Error("offline"); } });
    expect(failure).toHaveBeenCalledOnce();
  });
});
