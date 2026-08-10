import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import sitemap from "../../app/sitemap";
import { getServicePage } from "./contentPages";
import { homepageServices, homepageServiceSlugs } from "./homepageServices";
import { PUBLIC_MODEL_IDS } from "./publicModelCatalog";
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

describe("PUBLIC-CONCEPT-VERTICAL-001 homepage", () => {
  it("uses optimized local images and labels all four as conceptual", () => {
    for (const imagePath of imagePaths) {
      const absolutePath = resolve(process.cwd(), imagePath);
      expect(existsSync(absolutePath)).toBe(true);
      expect(statSync(absolutePath).size).toBeLessThan(400_000);
    }

    expect(page.match(/Conceptual imagery/g)).toHaveLength(4);
    expect(page).toContain("next/image");
  });

  it("keeps the required product narrative in the exact decision order", () => {
    const sectionMarkers = [
      'aria-labelledby="home-hero-title"',
      'aria-labelledby="product-planes-title"',
      'aria-labelledby="owned-models-title"',
      'aria-labelledby="concept-studio-title"',
      'aria-labelledby="service-paths-title"',
      'aria-labelledby="process-title"',
      'aria-labelledby="service-context-title"',
      'aria-labelledby="truth-boundary-title"',
      'aria-labelledby="final-exits-title"',
    ];
    const positions = sectionMarkers.map((marker) => page.indexOf(marker));

    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((left, right) => left - right));
  });

  it("pairs hero controls with their live, named destinations", () => {
    expect(page).toMatch(
      /<Link href="\/models" className="button button--light">\s*Explore models/,
    );
    expect(page).toMatch(
      /<Link href="\/studio" className="button button--outline-light">\s*Open Concept Studio/,
    );
    expect(page).not.toContain('href="/start"');
  });

  it("binds homepage service cards to the canonical service registry with specific CTAs", () => {
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
      homepageServiceSlugs.map((slug) => "/services/" + slug),
    );
    expect(linkedServices.map((service) => service.ctaLabel)).toEqual([
      "Explore detached ADUs",
      "Explore garage conversions",
      "Explore attached ADUs",
      "Explore JADUs",
    ]);

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

    expect(
      linkedServices.map(({ slug, icon }) => ({ slug, icon })),
    ).toEqual([
      { slug: "detached-adu", icon: "detached" },
      { slug: "garage-conversion", icon: "garage" },
      { slug: "attached-adu", icon: "attached" },
      { slug: "jadu", icon: "jadu" },
    ]);
    expect(residentialAddition.id).toBe("residential-addition");
    expect(residentialAddition.title).toBe("Residential Addition");
    expect(residentialAddition.icon).toBe("addition");
    expect(residentialAddition.description).toContain("not yet published");
    expect(residentialAddition.description).toContain("pending owner review");
    expect("href" in residentialAddition).toBe(false);
    expect("ctaLabel" in residentialAddition).toBe(false);
    expect(page).toContain("homepageServices.map");
    expect(page).toContain("service.ctaLabel");
    expect(page).not.toContain("Learn more");
  });

  it("keeps service breadcrumbs connected to one homepage anchor", () => {
    expect(page.match(/id="services"/g)).toHaveLength(1);
    expect(servicePageView).toContain('parentHref="/#services"');
  });

  it("projects the Home model preview from the same validated catalog contract", () => {
    expect(PUBLIC_MODEL_IDS).toEqual(["adu-s-450", "adu-a-600", "adu-b-800"]);
    expect(page).toContain("getPublicModelCatalog");
    expect(page).toContain('<ModelCatalog catalog={catalog} surface="home" />');
    expect(page).not.toContain("Compact Studio");
    expect(page).not.toContain("One Bedroom");
    expect(page).not.toContain("Two Bedroom");
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

  it("introduces no intake, credential, or luxury claim", () => {
    expect(page).not.toMatch(/<(?:form|input|textarea|select)\b/i);
    expect(page).not.toMatch(/\$\s?\d|\b\d+\s*(?:day|week|month|year)s?\b/i);
    expect(page).not.toMatch(/licensed|insured|award-winning|luxury|resort|mansion/i);
  });

  it("uses the pre-release global navigation without adding client JavaScript", () => {
    expect(header).toContain('{ label: "Models", href: "/models" }');
    expect(header).toContain('{ label: "Concept Studio", href: "/studio" }');
    expect(header).toContain('{ label: "ADU Process", href: "/process" }');
    expect(header).toContain('{ label: "Service Areas", href: "/service-areas" }');
    expect(header).toContain('{ label: "About", href: "/about" }');
    expect(header).toContain('{ label: "Explore models", href: "/models", cta: true }');
    expect(header).toContain('<details className="site-nav-mobile">');
    expect(header).toContain('<summary aria-label="Open navigation">');
    expect(header).not.toContain('"use client"');
  });

  it("keeps Home motion bounded and reduced-motion safe", () => {
    expect(stylesheet).toContain(".spine-hero__image");
    expect(stylesheet).toContain("@media (prefers-reduced-motion: reduce)");
    expect(stylesheet).toMatch(/\.spine-hero__image\s*\{[\s\S]*?animation:\s*none/);
  });
});
