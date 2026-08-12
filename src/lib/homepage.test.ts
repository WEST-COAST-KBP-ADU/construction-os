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
  "public/images/balanced-residential-addition-concept-v2.webp",
  "public/images/balanced-process-materials-concept-v2.webp",
  "public/images/balanced-interior-concept-v2.webp",
];

const heroComponent = readFileSync(
  resolve(process.cwd(), "src/components/home/ProjectJourneyHero.tsx"),
  "utf8",
);

describe("PUBLIC-CONCEPT-VERTICAL-001 homepage", () => {
  it("uses optimized local images and labels all three as conceptual", () => {
    for (const imagePath of imagePaths) {
      const absolutePath = resolve(process.cwd(), imagePath);
      expect(existsSync(absolutePath)).toBe(true);
      expect(statSync(absolutePath).size).toBeLessThan(400_000);
    }

    expect(page.match(/<figcaption/g)).toHaveLength(3);
    expect(page).toContain("next/image");
  });

  /*
   * HERO-SCENARIO-IMPLEMENTATION-001 · the first fold is the construction-first
   * hero adopted on #212, shipped in its `ASSET_FALLBACK` state. #215 proved the
   * committed asset source cannot stand for the A600, so the page renders no
   * house image, placeholder, or surrogate above the fold. The hero's own
   * behavior is verified in `src/components/home/ProjectJourneyHero.test.tsx`;
   * what is pinned here is how the page composes it.
   */
  it("mounts the project journey hero and no hero image", () => {
    expect(page).toContain(
      'import ProjectJourneyHero from "@/src/components/home/ProjectJourneyHero";',
    );
    expect(page).toContain("<ProjectJourneyHero />");
    expect(page).not.toContain("spine-hero");
    expect(page).not.toContain("homepage-gabled-adu-concept-v1.webp");
    expect(page).not.toContain("balanced-adu-hero-concept-v2.webp");
    expect(page).not.toContain("attainable-adu-hero-concept-v1.webp");
    expect(page).not.toMatch(/adu-600-hardie-(?:panel|plank)/);

    const heroPosition = page.indexOf("<ProjectJourneyHero />");
    const firstImagePosition = page.indexOf("<Image");

    expect(heroPosition).toBeGreaterThan(0);
    expect(firstImagePosition).toBeGreaterThan(heroPosition);
  });

  it("carries exactly one H1 and exactly two first-fold CTAs", () => {
    expect(page).not.toContain("<h1");
    expect(heroComponent.match(/<h1\b/g)).toHaveLength(1);
    expect(heroComponent).toContain('id="home-hero-title"');
    expect(heroComponent.match(/<Link\b/g)).toHaveLength(1);
    expect(heroComponent).toContain('{ label: "Open Concept Studio", href: "/studio", tone: "primary" },');
    expect(heroComponent).toContain(
      '{ label: "See how a project runs", href: "/process", tone: "secondary" },',
    );
    expect(heroComponent).not.toContain('href="/start"');
    expect(page).not.toContain('href="/start"');
  });

  it("opens the section after the hero on stages, not a second hero", () => {
    const heroPosition = page.indexOf("<ProjectJourneyHero />");
    const sectionPositions = [...page.matchAll(/aria-labelledby="([a-z-]+)"/g)]
      .filter((match) => match.index > heroPosition)
      .map((match) => match[1]);

    expect(sectionPositions[0]).toBe("process-title");
    expect(page).toContain(
      "<h2 id=\"process-title\">Orient, explore, review context, then make a human decision.</h2>",
    );
  });

  it("keeps the required product narrative in the exact decision order", () => {
    const sectionMarkers = [
      'aria-labelledby="process-title"',
      'aria-labelledby="product-planes-title"',
      'aria-labelledby="owned-models-title"',
      'aria-labelledby="concept-studio-title"',
      'aria-labelledby="service-paths-title"',
      'aria-labelledby="service-context-title"',
      'aria-labelledby="truth-boundary-title"',
      'aria-labelledby="final-exits-title"',
    ];
    const positions = sectionMarkers.map((marker) => page.indexOf(marker));

    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((left, right) => left - right));
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
    // The hero no longer owns any global motion; its own bounded motion is
    // scoped to `ProjectJourneyHero.module.css` and verified beside it.
    expect(page).not.toContain("spine-image-settle");
    expect(stylesheet).toContain("@media (prefers-reduced-motion: reduce)");
    expect(heroComponent).toContain(
      'const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";',
    );
  });
});
