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

const homeComponentSource = (name: string) =>
  readFileSync(resolve(process.cwd(), `src/components/home/${name}`), "utf8");

const heroComponent = homeComponentSource("HousePortalHero.tsx");
const heroStyles = homeComponentSource("HousePortalHero.module.css");

/*
 * The hero moved out of `app/page.tsx` into the Option 2 modules at
 * OPTION2-HERO-INTEGRATION-001, so the first-fold boundaries are asserted
 * against the component and its contract. Asserting them against `page.tsx`
 * alone would keep passing while testing nothing.
 */
const heroSurfaces = heroComponent;

const imagePaths = [
  "public/images/balanced-residential-addition-concept-v2.webp",
  "public/images/balanced-process-materials-concept-v2.webp",
  "public/images/balanced-interior-concept-v2.webp",
];

describe("PUBLIC-CONCEPT-VERTICAL-001 homepage", () => {
  it("uses optimized local images and labels every one as conceptual", () => {
    for (const imagePath of [...imagePaths, "public/images/house-portal/property-stage-photo-master.png"]) {
      const absolutePath = resolve(process.cwd(), imagePath);
      expect(existsSync(absolutePath)).toBe(true);
      expect(statSync(absolutePath).size).toBeGreaterThan(0);
    }

    // Three conceptual figures remain in the page; the fourth is the hero's own
    // disclosure, which now travels with the component that owns the imagery.
    expect(page.match(/<figcaption/g)).toHaveLength(3);
    expect(heroComponent).toContain("Conceptual visualization");
    expect(page).toContain("next/image");
  });

  it("pins the house portal surface and exact concept-safe public copy", () => {
    expect(page).not.toContain("balanced-adu-hero-concept-v2.webp");
    expect(page).not.toContain("homepage-gabled-adu-concept-v1.webp");
    expect(heroComponent).toContain("See what your property can become.");
    expect(heroComponent).toContain("property-specific feasibility result");
  });

  it("keeps the property image primary and recomposes image-first", () => {
    expect(heroStyles).toMatch(/\.media\s*\{[^}]*position:\s*absolute[^}]*inset:\s*0/);
    expect(heroStyles).toMatch(/@media \(max-width: 51\.25rem\)[\s\S]*?grid-template-rows/);
    expect(heroStyles).toContain("transform-origin: 82% 68%");
    expect(heroComponent).toContain("preload");
    expect(heroComponent).not.toContain("priority");
    expect(page).not.toContain("spine-hero");
  });

  it("keeps the required product narrative in the exact decision order", () => {
    const sectionMarkers = [
      "<HousePortalHero />",
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
    expect(heroComponent).toContain('href="/property-fit-lab"');
    expect(heroComponent).toContain('href="/models"');
    expect(heroComponent).toContain("HOUSE_PORTAL_DESTINATION");
    expect(heroSurfaces).not.toContain('href="/start"');
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
    for (const source of [page, heroSurfaces]) {
      expect(source).not.toMatch(/<(?:form|input|textarea|select)\b/i);
      expect(source).not.toMatch(/licensed|insured|award-winning|luxury|resort|mansion/i);
    }

    expect(page).not.toMatch(/\$\s?\d|\b\d+\s*(?:day|week|month|year)s?\b/i);
    // The hero surfaces carry motion durations in milliseconds, so the money and
    // calendar-duration guard is applied to the copy they publish, not to timing.
    const heroCopy = heroComponent;

    expect(heroCopy).not.toMatch(/\$\s?\d|\b\d+\s*(?:day|week|month|year)s?\b/i);
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
    expect(stylesheet).toContain("@media (prefers-reduced-motion: reduce)");
    expect(heroStyles).toContain("@media (prefers-reduced-motion: reduce)");
    expect(heroComponent).toContain('matchMedia("(prefers-reduced-motion: reduce)")');
  });

  it("mounts the house portal as the only first fold", () => {
    expect(page.match(/<HousePortalHero \/>/g)).toHaveLength(1);
    expect(page).toContain('import HousePortalHero from "@/src/components/home/HousePortalHero"');
    expect(heroComponent.match(/<h1/g)).toHaveLength(1);
  });

  it("keeps the disclosure and portal above the clipped image", () => {
    expect(heroStyles).toMatch(/\.editorial\s*\{[\s\S]*?z-index:\s*2/);
    expect(heroStyles).toMatch(/\.portal\s*\{[\s\S]*?z-index:\s*3/);
    expect(heroStyles).toContain("overflow: clip");
    expect(heroComponent).toContain("property-specific feasibility result");
  });
});
