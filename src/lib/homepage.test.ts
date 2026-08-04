import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const page = readFileSync(resolve(process.cwd(), "app/page.tsx"), "utf8");
const header = readFileSync(resolve(process.cwd(), "src/components/Header.tsx"), "utf8");
const stylesheet = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");

const imagePaths = [
  "public/images/balanced-adu-hero-concept-v2.webp",
  "public/images/balanced-residential-addition-concept-v2.webp",
  "public/images/balanced-process-materials-concept-v2.webp",
  "public/images/balanced-interior-concept-v2.webp",
];

describe("TASK-0010 residential homepage", () => {
  it("uses optimized local images and labels all four as conceptual", () => {
    for (const imagePath of imagePaths) {
      const absolutePath = resolve(process.cwd(), imagePath);
      expect(existsSync(absolutePath)).toBe(true);
      expect(statSync(absolutePath).size).toBeLessThan(400_000);
    }

    expect(page.match(/Conceptual/g)).toHaveLength(4);
    expect(page).toContain("next/image");
  });

  it("keeps every homepage destination on an existing public route", () => {
    const hrefs = [...page.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
    const allowed = new Set([
      "/services/detached-adu",
      "/services/garage-conversion",
      "/process",
      "/about",
      "/faq",
      "/compare",
    ]);

    expect(hrefs.length).toBeGreaterThan(0);
    expect(hrefs.every((href) => allowed.has(href))).toBe(true);
  });

  it("introduces no intake, pricing, schedule, credential, or luxury claim", () => {
    expect(page).not.toMatch(/<(?:form|input|textarea|select)\b/i);
    expect(page).not.toMatch(/\$\s?\d|\b\d+\s*(?:day|week|month|year)s?\b/i);
    expect(page).not.toMatch(/licensed|insured|award-winning|luxury|resort|mansion/i);
  });

  it("provides a semantic mobile navigation without adding client JavaScript", () => {
    expect(header).toContain("<details className=\"site-nav-mobile\">");
    expect(header).toContain("<summary aria-label=\"Open navigation\">");
    expect(header).not.toContain('"use client"');
  });

  it("keeps the architectural motion bounded and reduced-motion safe", () => {
    expect(stylesheet).toContain("@keyframes hero-settle");
    expect(stylesheet).toContain("@media (prefers-reduced-motion: reduce)");
    expect(stylesheet).toMatch(/\.residential-hero__image\s*\{[\s\S]*?animation:\s*none/);
  });
});
