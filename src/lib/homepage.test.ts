import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import sitemap from "../../app/sitemap";
import { getServicePage } from "./contentPages";
import { homepageServices, homepageServiceSlugs } from "./homepageServices";
import { siteConfig } from "./siteConfig";

const page = readFileSync(resolve(process.cwd(), "app/page.tsx"), "utf8");
const header = readFileSync(resolve(process.cwd(), "src/components/Header.tsx"), "utf8");
const stylesheet = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");
const servicePageView = readFileSync(
  resolve(process.cwd(), "src/components/content/ServicePageView.tsx"),
  "utf8",
);

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

    expect(page.match(/Conceptual imagery/g)).toHaveLength(4);
    expect(page).toContain("next/image");
  });

  it("keeps every homepage destination on an existing public route", () => {
    const hrefs = [...page.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
    const allowed = new Set(["/services/detached-adu", "/process", "/about"]);

    expect(hrefs.length).toBeGreaterThan(0);
    expect(hrefs.every((href) => allowed.has(href))).toBe(true);
  });

  it("binds homepage service cards to the canonical service registry", () => {
    const linkedServices = homepageServices.filter((service) => service.kind === "linked");

    expect(homepageServiceSlugs).toEqual([
      "detached-adu",
      "garage-conversion",
      "attached-adu",
      "jadu",
    ]);
    expect(homepageServices).toHaveLength(5);
    expect(linkedServices).toHaveLength(4);
    expect(linkedServices.map((service) => service.slug)).toEqual(homepageServiceSlugs);
    expect(linkedServices.map((service) => service.href)).toEqual(
      homepageServiceSlugs.map((slug) => `/services/${slug}`),
    );

    for (const service of linkedServices) {
      expect(service.title).toBe(getServicePage(service.slug).shortTitle);
    }

    const residentialAddition = homepageServices.find(
      (service) => service.kind === "unresolved",
    );

    expect(residentialAddition).toBeDefined();

    if (!residentialAddition) {
      throw new Error("Residential Addition homepage card is missing.");
    }

    expect(residentialAddition.id).toBe("residential-addition");
    expect(residentialAddition.title).toBe("Residential Addition");
    expect("href" in residentialAddition).toBe(false);
    expect(page).toContain("homepageServices.map");
    expect(page).toContain('service.kind === "linked"');
  });

  it("keeps service breadcrumbs connected to one homepage anchor", () => {
    expect(page.match(/id="services"/g)).toHaveLength(1);
    expect(servicePageView).toContain('parentHref="/#services"');
  });

  it("publishes the existing Studio route exactly once in the sitemap", () => {
    const studioUrl = new URL("/studio", siteConfig.url).toString();
    const studioEntries = sitemap().filter((entry) => entry.url === studioUrl);

    expect(studioEntries).toHaveLength(1);
    expect(studioEntries[0]).toMatchObject({
      changeFrequency: "monthly",
      priority: 0.8,
    });
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
