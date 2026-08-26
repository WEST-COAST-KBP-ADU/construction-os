import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const pagePath = resolve(process.cwd(), "app/studio/page.tsx");
const stylesheetPath = resolve(
  process.cwd(),
  "app/studio/studio-development.module.css",
);
const routesPath = resolve(process.cwd(), "src/lib/routes.ts");

const page = readFileSync(pagePath, "utf8");
const stylesheet = readFileSync(stylesheetPath, "utf8");
const routes = readFileSync(routesPath, "utf8");

describe("Concept Studio development hold surface", () => {
  it("publishes the exact static development boundary", () => {
    for (const copy of [
      "Concept Studio",
      "A new design workspace is in development.",
      "The previous technical prototype has been retired.",
      "Surface",
      "Status",
      "In development",
      "Configuration",
      "Comparison and saving",
      "Submissions",
      "Property data",
      "Not enabled",
      "Not collected",
    ]) {
      expect(page).toContain(copy);
    }

    expect(page).toContain('href="/models"');
    expect(page).toContain("Return to models");
  });

  it("retires the photograph, workbench, journey exit, and interactive prototype", () => {
    for (const retiredSurface of [
      "StudioWorkbench",
      "HardieMotionStage",
      "JourneyExit",
      "resolveStudioEntry",
      "searchParams",
      "next/image",
      "<img",
      "<picture",
      "<button",
      "<input",
      "<select",
      "<form",
      "useState",
      "use client",
    ]) {
      expect(page).not.toContain(retiredSurface);
    }

    expect(page).not.toMatch(/@\/src\/(?:components|lib|data)\/studio/);
  });

  it("keeps studio published as a static public route", () => {
    expect(routes).toContain('"/studio"');
    expect(page).toContain('canonical: "/studio"');
    expect(page).not.toContain("async function StudioPage");
  });

  it("uses only the accepted light-system roles and no image or motion surrogate", () => {
    expect(stylesheet).toContain("background: var(--color-canvas)");
    expect(stylesheet).toContain("color: var(--color-ink)");
    expect(stylesheet).toContain("var(--color-warning)");
    expect(stylesheet).toContain("var(--color-line-strong)");
    expect(stylesheet).toContain("@media (max-width: 40rem)");
    expect(stylesheet).toContain("@media (prefers-reduced-motion: reduce)");

    const executable = stylesheet.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(executable).not.toMatch(/#[0-9a-f]{3,8}/i);
    expect(executable).not.toMatch(/(?:background-image|url\(|linear-gradient|radial-gradient)/i);
    expect(executable).not.toMatch(/position:\s*(?:fixed|sticky)/i);

    const animationValues = [
      ...executable.matchAll(/animation(?:-name)?:\s*([^;]+);/gi),
    ].map((match) => match[1].trim());
    expect(animationValues).toEqual(["none !important"]);
  });
});
