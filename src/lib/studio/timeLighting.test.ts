import { describe, expect, it } from "vitest";

import { resolveDeviceLighting, resolveLightingMode } from "./timeLighting";

describe("Studio device-time lighting resolver", () => {
  it.each(Array.from({ length: 24 }, (_, hour) => [hour]))(
    "resolves local hour %i deterministically",
    (hour) => {
      const expected = hour >= 7 && hour <= 16 ? "day" : hour >= 17 && hour <= 19 ? "dusk" : "night";
      expect(resolveLightingMode(hour)).toBe(expected);
    },
  );

  it.each([
    [6, "night"],
    [7, "day"],
    [16, "day"],
    [17, "dusk"],
    [19, "dusk"],
    [20, "night"],
  ] as const)("holds the %i:00 boundary at %s", (hour, expected) => {
    expect(resolveLightingMode(hour)).toBe(expected);
  });

  it("reads the local hour from the supplied device Date", () => {
    const deviceTime = new Date(2026, 7, 14, 18, 30);
    expect(resolveDeviceLighting(deviceTime)).toBe("dusk");
  });

  it.each([-1, 24, 7.5, Number.NaN])("refuses invalid local hour %s", (hour) => {
    expect(() => resolveLightingMode(hour)).toThrow("local_hour_out_of_range");
  });
});
