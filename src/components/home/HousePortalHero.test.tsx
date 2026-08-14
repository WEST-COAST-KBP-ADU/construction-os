import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(process.cwd(), "src/components/home/HousePortalHero.tsx"), "utf8");
const styles = readFileSync(resolve(process.cwd(), "src/components/home/HousePortalHero.module.css"), "utf8");

describe("HousePortalHero", () => {
  it("publishes the adopted copy, truthful exits, and one accessible A600 portal", () => {
    expect(source).toContain("See what your property can become.");
    expect(source).toContain('href="/property-fit-lab"');
    expect(source).toContain("Synthetic example");
    expect(source).toContain('href="/models"');
    expect(source).toContain('aria-label="Explore the detached A600 in Studio"');
    expect(source).not.toMatch(/<(?:form|input)\b/);
    expect(source).not.toContain("Existing/Proposed");
  });

  it("guards repeated activation, resets on browser back, and has responsive focus rules", () => {
    expect(source).toContain("if (transitioning.current) return");
    expect(source).toContain('window.addEventListener("pageshow", reset)');
    expect(styles).toContain("overflow: clip");
    expect(styles).toContain(":focus-visible");
    expect(styles).toContain("@media (max-width: 24.375rem)");
    expect(styles).toContain("@media (prefers-reduced-motion: reduce)");
  });
});
