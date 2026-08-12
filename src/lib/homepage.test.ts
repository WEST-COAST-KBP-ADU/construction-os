import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import sitemap from "../../app/sitemap";
import {
  PREMIUM_WORKBENCH_HERO_ACTIONS,
  PREMIUM_WORKBENCH_HERO_COPY,
  PREMIUM_WORKBENCH_HERO_MEDIA,
} from "../components/home/premiumWorkbenchHero.contract";
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

const heroComponent = homeComponentSource("PremiumWorkbenchHero.tsx");
const heroStyles = homeComponentSource("PremiumWorkbenchHero.module.css");
const stage = homeComponentSource("HeroBlueprintStage.tsx");
const stageStyles = homeComponentSource("HeroBlueprintStage.module.css");
const sequence = homeComponentSource("LiveBlueprintSequence.tsx");
const sequenceStyles = homeComponentSource("LiveBlueprintSequence.module.css");

/*
 * The hero moved out of `app/page.tsx` into the Option 2 modules at
 * OPTION2-HERO-INTEGRATION-001, so the first-fold boundaries are asserted
 * against the component and its contract. Asserting them against `page.tsx`
 * alone would keep passing while testing nothing.
 */
const heroSurfaces = [heroComponent, stage, sequence].join("\n");

const imagePaths = [
  "public/images/balanced-residential-addition-concept-v2.webp",
  "public/images/balanced-process-materials-concept-v2.webp",
  "public/images/balanced-interior-concept-v2.webp",
];

describe("PUBLIC-CONCEPT-VERTICAL-001 homepage", () => {
  it("uses optimized local images and labels every one as conceptual", () => {
    for (const imagePath of [...imagePaths, `public${PREMIUM_WORKBENCH_HERO_MEDIA.src}`]) {
      const absolutePath = resolve(process.cwd(), imagePath);
      expect(existsSync(absolutePath)).toBe(true);
      expect(statSync(absolutePath).size).toBeLessThan(400_000);
    }

    // Three conceptual figures remain in the page; the fourth is the hero's own
    // disclosure, which now travels with the component that owns the imagery.
    expect(page.match(/<figcaption/g)).toHaveLength(3);
    expect(heroComponent.match(/<figcaption/g)).toHaveLength(1);
    expect(page).toContain("next/image");
  });

  it("pins the Option 2 workbench surface and exact concept-safe public copy", () => {
    expect(PREMIUM_WORKBENCH_HERO_MEDIA.src).toBe(
      "/images/balanced-process-materials-concept-v2.webp",
    );
    expect(page).not.toContain("balanced-adu-hero-concept-v2.webp");
    expect(page).not.toContain("homepage-gabled-adu-concept-v1.webp");
    expect(PREMIUM_WORKBENCH_HERO_COPY.kicker).toBe("KBP OS · ADU + General Construction");
    expect(PREMIUM_WORKBENCH_HERO_COPY.heading).toBe(
      "From the first lead to a managed construction process.",
    );
    expect(PREMIUM_WORKBENCH_HERO_COPY.lede).toContain(
      "lead-generation and process-management platform",
    );
    expect(PREMIUM_WORKBENCH_HERO_MEDIA.disclosure).toContain("Conceptual imagery");
    expect(PREMIUM_WORKBENCH_HERO_MEDIA.disclosure).toContain(
      "Not a West Coast KBP project, an approved plan, a permit, a parcel, or a material specification.",
    );

    const copy = Object.values(PREMIUM_WORKBENCH_HERO_COPY).join(" ");

    expect(copy).not.toMatch(
      /James Hardie|\bHardie\b|A450|A600|A800|completed project|customer property/i,
    );
  });

  it("keeps the first fold an unoverlaid editorial split that recomposes image-first", () => {
    expect(heroStyles).toMatch(/\.composition\s*\{[\s\S]*?grid-template-columns:\s*46fr 54fr/);
    expect(heroStyles).toMatch(
      /@media \(max-width: 63\.99rem\)[\s\S]*?\.composition\s*\{[\s\S]*?grid-template-columns:\s*1fr/,
    );
    // No scrim, gradient, or overlay is painted across the photograph itself.
    expect(heroStyles).not.toMatch(/\.surfaceImage[^}]*(?:scrim|gradient|opacity)/i);
    expect(heroComponent).toContain("preload");
    expect(heroComponent).not.toContain("priority");
    // The superseded homepage-only hero is gone from both files, not just one.
    expect(page).not.toContain("spine-hero");
    expect(stylesheet).not.toContain("spine-hero");
    expect(stylesheet).not.toContain("spine-image-settle");
  });

  it("keeps the required product narrative in the exact decision order", () => {
    const sectionMarkers = [
      "<HeroBlueprintStage />",
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
    expect(PREMIUM_WORKBENCH_HERO_ACTIONS.map((action) => [action.href, action.label])).toEqual([
      ["/models", "Explore models"],
      ["/studio", "Open Concept Studio"],
    ]);
    expect(PREMIUM_WORKBENCH_HERO_ACTIONS.map((action) => action.emphasis)).toEqual([
      "primary",
      "secondary",
    ]);
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
    const heroCopy = [
      ...Object.values(PREMIUM_WORKBENCH_HERO_COPY),
      PREMIUM_WORKBENCH_HERO_MEDIA.disclosure,
      ...PREMIUM_WORKBENCH_HERO_ACTIONS.map((action) => action.label),
    ].join(" ");

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

    // Every module that moves in the first fold answers reduced motion itself.
    expect(heroStyles).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.action\s*\{\s*transition:\s*none/,
    );
    expect(heroStyles).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*?--blueprint-motion-enabled:\s*0/,
    );
    expect(sequenceStyles).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*?animation:\s*none\s*!important/,
    );

    // The drawing's static frame is complete: reduced motion reveals every
    // layer rather than freezing a partial one.
    expect(sequence).toContain('motion === "static"');
    expect(sequenceStyles).toMatch(
      /\.figure\[data-motion="static"\][\s\S]*?opacity:\s*1;\s*transition:\s*none/,
    );
  });

  it("mounts the Option 2 stage as the only first fold, with one public rail", () => {
    // The stage is the single homepage mount; nothing else composes the hero.
    expect(page.match(/<HeroBlueprintStage \/>/g)).toHaveLength(1);
    expect(page).toContain('import HeroBlueprintStage from "@/src/components/home/HeroBlueprintStage"');

    // The Project chapter mounts slot-only, so its five-phase rail and caption
    // apparatus never reach the first fold.
    expect(stage).toContain('surface="slot"');
    expect(stage).not.toContain('surface="chapter"');
    expect(sequence).toContain('const slotted = surface === "slot"');
    expect(sequence).toMatch(/\{slotted \? null : \(\s*<ol className=\{styles\.rail\}/);
    expect(sequence).toMatch(/\{slotted \? null : <p className=\{styles\.phaseCaption\}/);

    // `plan` and `build` stay internal motion states, never public chapters.
    expect(stage).toContain("heroChapterForPhase");
    expect(heroComponent).toContain("HERO_CHAPTERS.map");
  });

  it("keeps the Record recipe opted in, scoped, and free of global token leaks", () => {
    // The import has to precede every rule or CSS silently drops it.
    const importLines = stylesheet
      .split("\n")
      .filter((line) => line.trimStart().startsWith("@import"));

    expect(importLines[1]).toContain("option2-premium.tokens.css");
    expect(stylesheet.indexOf("@import \"../src/styles/option2-premium.tokens.css\";")).toBeLessThan(
      stylesheet.indexOf(":root {"),
    );

    // Opt-in is a single subtree attribute, and the recipe defines nothing globally.
    expect(stage).toContain("data-o2-premium");
    // The shell declares no `--o2-*` property of its own; it only imports them.
    expect(stylesheet).not.toMatch(/--o2-[a-z-]+\s*:/);

    const tokens = readFileSync(
      resolve(process.cwd(), "src/styles/option2-premium.tokens.css"),
      "utf8",
    );

    expect(tokens).not.toMatch(/^:root\s*\{/m);

    // The bridge re-points base tokens inside the subtree only; it never
    // redefines an `--o2-*` value and never writes a global selector.
    const stageRules = stageStyles.replaceAll(/\/\*[\s\S]*?\*\//g, "");

    expect(stageRules).not.toMatch(/^\s*--o2-[a-z-]+:/m);
    expect((stageRules.match(/^[^\s@}][^{]*(?=\{)/gm) ?? []).map((s) => s.trim())).toEqual([
      ".stage",
    ]);
  });

  it("holds the public disclosure above whatever is mounted into the slot", () => {
    // Geometric and paint-order containment, both stated, so the public claim
    // cannot be occluded by the drawing in any regime.
    expect(heroStyles).toMatch(/\.motionSlot\s*\{[\s\S]*?z-index:\s*0/);
    expect(heroStyles).toMatch(/\.disclosure\s*\{[\s\S]*?z-index:\s*1/);
    expect(sequenceStyles).toMatch(
      /\.figure\[data-surface="slot"\]\s*\{[\s\S]*?overflow:\s*hidden/,
    );
    expect(sequenceStyles).toMatch(
      /\.figure\[data-surface="slot"\]\s*\{[\s\S]*?grid-template-rows:\s*minmax\(0, 1fr\) min\(38cqb, 7rem\)/,
    );
    // The mounted variant sets no `z-index` of its own to escape with.
    const slotRules = sequenceStyles.slice(
      sequenceStyles.indexOf('.figure[data-surface="slot"]'),
      sequenceStyles.indexOf("/* ------------------------------------------------------------------ caption */"),
    );

    expect(slotRules).not.toContain("z-index");

    // The drawing's own claim boundary rides the disclosure strip.
    expect(stage).toContain("supplementalDisclosure");
    expect(heroComponent).toContain("supplementalDisclosure");
  });

  it("drops the card treatment where the sheet lies on the workbench", () => {
    const slotRules = sequenceStyles.slice(
      sequenceStyles.indexOf('.figure[data-surface="slot"] .sheet'),
      sequenceStyles.indexOf(".slotCaption"),
    );

    expect(slotRules).toMatch(/border:\s*0/);
    expect(slotRules).toMatch(/border-radius:\s*0/);
    expect(slotRules).not.toMatch(/box-shadow:\s*inset/);
  });
});
