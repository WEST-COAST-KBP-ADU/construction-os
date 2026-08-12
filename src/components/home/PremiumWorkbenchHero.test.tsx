import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import PremiumWorkbenchHero from "./PremiumWorkbenchHero";
import {
  BLUEPRINT_MOTION_DEFAULT_PHASE,
  BLUEPRINT_MOTION_PHASES,
  BLUEPRINT_MOTION_SLOT_CONTRACT,
  BLUEPRINT_MOTION_SLOT_ID,
  HERO_CHAPTERS,
  HERO_CHAPTER_LABELS,
  PREMIUM_WORKBENCH_HERO_ACTIONS,
  PREMIUM_WORKBENCH_HERO_CONTRACT_VERSION,
  PREMIUM_WORKBENCH_HERO_COPY,
  PREMIUM_WORKBENCH_HERO_MEDIA,
  PREMIUM_WORKBENCH_HERO_MEDIA_ASPECT,
  heroChapterElementId,
  isBlueprintMotionPhase,
  isHeroChapter,
} from "./premiumWorkbenchHero.contract";

const moduleDir = path.dirname(fileURLToPath(import.meta.url));

function render(node: Parameters<typeof renderToStaticMarkup>[0]): string {
  return renderToStaticMarkup(node);
}

function textOf(markup: string): string {
  return markup
    .replace(/<[^>]*>/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function countOf(haystack: string, needle: string): number {
  return haystack.split(needle).length - 1;
}

/** Returns the whole opening tag of the element carrying `marker`. */
function openTagContaining(markup: string, marker: string): string {
  const at = markup.indexOf(marker);
  expect(at, `missing ${marker}`).toBeGreaterThan(-1);
  return markup.slice(markup.lastIndexOf("<", at), markup.indexOf(">", at) + 1);
}

/** Extracts the declarations of a single top-level rule from the CSS source. */
function ruleBody(css: string, selector: string): string {
  const start = css.indexOf(`${selector} {`);
  expect(start, `missing rule ${selector}`).toBeGreaterThan(-1);
  const end = css.indexOf("}", start);
  return css.slice(start, end);
}

describe("premiumWorkbenchHero.contract", () => {
  it("publishes the five stable motion phases in narrative order", () => {
    expect(BLUEPRINT_MOTION_PHASES).toEqual(["lead", "project", "plan", "build", "record"]);
    expect(BLUEPRINT_MOTION_DEFAULT_PHASE).toBe("lead");
    expect(BLUEPRINT_MOTION_SLOT_ID).toBe("blueprint-motion-slot");
  });

  it("renders three rail chapters, each drawn from the phase vocabulary", () => {
    expect(HERO_CHAPTERS).toEqual(["lead", "project", "record"]);
    for (const chapter of HERO_CHAPTERS) {
      expect(isBlueprintMotionPhase(chapter)).toBe(true);
      expect(HERO_CHAPTER_LABELS[chapter]).toBeTruthy();
    }
  });

  it("guards phase and chapter membership", () => {
    expect(isBlueprintMotionPhase("plan")).toBe(true);
    expect(isBlueprintMotionPhase("Plan")).toBe(false);
    expect(isBlueprintMotionPhase(undefined)).toBe(false);
    expect(isHeroChapter("record")).toBe(true);
    // `plan` and `build` exist as phases but are not surfaced in the rail.
    expect(isHeroChapter("plan")).toBe(false);
  });

  it("binds the slot descriptor to the published values", () => {
    expect(BLUEPRINT_MOTION_SLOT_CONTRACT.version).toBe(PREMIUM_WORKBENCH_HERO_CONTRACT_VERSION);
    expect(BLUEPRINT_MOTION_SLOT_CONTRACT.slotId).toBe(BLUEPRINT_MOTION_SLOT_ID);
    expect(BLUEPRINT_MOTION_SLOT_CONTRACT.phases).toEqual(BLUEPRINT_MOTION_PHASES);
    expect(BLUEPRINT_MOTION_SLOT_CONTRACT.chapters).toEqual(HERO_CHAPTERS);
    expect(BLUEPRINT_MOTION_SLOT_CONTRACT.layout.containerName).toBe(BLUEPRINT_MOTION_SLOT_ID);
    expect(Object.isFrozen(BLUEPRINT_MOTION_SLOT_CONTRACT)).toBe(true);
  });

  it("addresses each rail chapter by a stable element id", () => {
    expect(heroChapterElementId("lead")).toBe("premium-workbench-hero-chapter-lead");
    expect(new Set(HERO_CHAPTERS.map(heroChapterElementId)).size).toBe(HERO_CHAPTERS.length);
  });

  it("carries the workbench source dimensions of the committed asset", () => {
    expect(PREMIUM_WORKBENCH_HERO_MEDIA.src).toBe(
      "/images/balanced-process-materials-concept-v2.webp",
    );
    expect(PREMIUM_WORKBENCH_HERO_MEDIA.width).toBe(1500);
    expect(PREMIUM_WORKBENCH_HERO_MEDIA.height).toBe(1000);
    expect(PREMIUM_WORKBENCH_HERO_MEDIA_ASPECT).toBe(1.5);
  });

  it("carries the calls to action published at the packet base", () => {
    expect(PREMIUM_WORKBENCH_HERO_ACTIONS.map((action) => [action.label, action.href])).toEqual([
      ["Explore models", "/models"],
      ["Open Concept Studio", "/studio"],
    ]);
    expect(PREMIUM_WORKBENCH_HERO_ACTIONS[0].emphasis).toBe("primary");
  });
});

describe("PremiumWorkbenchHero copy", () => {
  const markup = render(<PremiumWorkbenchHero />);
  const text = textOf(markup);

  it("uses the exact approved kicker, heading, and lede", () => {
    expect(text).toContain(PREMIUM_WORKBENCH_HERO_COPY.kicker);
    expect(text).toContain(PREMIUM_WORKBENCH_HERO_COPY.heading);
    expect(text).toContain(PREMIUM_WORKBENCH_HERO_COPY.lede);
    expect(PREMIUM_WORKBENCH_HERO_COPY.kicker).toBe("KBP OS · ADU + General Construction");
    expect(PREMIUM_WORKBENCH_HERO_COPY.heading).toBe(
      "From the first lead to a managed construction process.",
    );
  });

  it("declares exactly one h1, and it carries the heading", () => {
    expect(countOf(markup, "<h1")).toBe(1);
    expect(markup).toMatch(
      /<h1[^>]*id="premium-workbench-hero-title"[^>]*>From the first lead to a managed construction process\.<\/h1>/,
    );
    expect(markup).toContain('aria-labelledby="premium-workbench-hero-title"');
  });

  it("renders both published calls to action in order", () => {
    for (const action of PREMIUM_WORKBENCH_HERO_ACTIONS) {
      expect(markup).toContain(`href="${action.href}"`);
      expect(markup).toContain(action.label);
    }
    expect(markup.indexOf('href="/models"')).toBeLessThan(markup.indexOf('href="/studio"'));
  });

  it("states no price, schedule, permit, guarantee, or autonomous-action claim", () => {
    const forbidden = [
      "price",
      "pricing",
      "$",
      "quote",
      "estimate",
      "permit",
      "zoning",
      "buildable",
      "guarantee",
      "guaranteed",
      "warranty",
      "approved plan",
      "automatically",
      "autonomous",
      "instantly",
      "free consultation",
    ];
    const haystack = text.toLowerCase();
    const disclosure = PREMIUM_WORKBENCH_HERO_MEDIA.disclosure.toLowerCase();
    for (const term of forbidden) {
      // A term is admissible only where the media disclosure refuses it, and
      // never more often than the refusal itself states it.
      expect(countOf(haystack, term), `unexpected claim token: ${term}`).toBe(
        countOf(disclosure, term),
      );
    }
  });
});

describe("PremiumWorkbenchHero workbench surface", () => {
  const markup = render(<PremiumWorkbenchHero />);

  it("renders the committed workbench asset with a descriptive alt", () => {
    expect(markup).toContain(encodeURIComponent(PREMIUM_WORKBENCH_HERO_MEDIA.src));
    expect(markup).toContain(`alt="${PREMIUM_WORKBENCH_HERO_MEDIA.alt}"`);
    expect(countOf(markup, "<img")).toBe(1);
    expect(markup).toContain('sizes="(max-width: 63.99rem) 100vw, 54vw"');
  });

  it("labels the imagery without making a project, plan, or material claim", () => {
    expect(textOf(markup)).toContain(PREMIUM_WORKBENCH_HERO_MEDIA.disclosure);
    expect(markup).toContain("<figcaption");
  });
});

describe("PremiumWorkbenchHero reserved blueprint region", () => {
  it("reserves the region and draws nothing when no child is supplied", () => {
    const markup = render(<PremiumWorkbenchHero />);
    expect(markup).toContain(`id="${BLUEPRINT_MOTION_SLOT_ID}"`);
    expect(markup).toContain(`data-slot="${BLUEPRINT_MOTION_SLOT_ID}"`);
    expect(markup).toContain('data-slot-state="reserved"');
    expect(markup).toContain('data-slot-phases="lead project plan build record"');
    expect(markup).toContain('data-slot-phase="lead"');
    expect(markup).toContain(`data-slot-version="${PREMIUM_WORKBENCH_HERO_CONTRACT_VERSION}"`);
    // Reserved and empty: hidden from assistive technology, and no filler node.
    expect(markup).toMatch(
      new RegExp(`<div[^>]*id="${BLUEPRINT_MOTION_SLOT_ID}"[^>]*></div>`),
    );
    expect(openTagContaining(markup, `data-slot="${BLUEPRINT_MOTION_SLOT_ID}"`)).toContain(
      'aria-hidden="true"',
    );
  });

  it("mounts a supplied child and stops hiding the region", () => {
    const markup = render(
      <PremiumWorkbenchHero blueprintMotionSlot={<p data-worker="228">mounted</p>} />,
    );
    expect(markup).toContain('data-slot-state="filled"');
    expect(markup).toContain('<p data-worker="228">mounted</p>');
    expect(openTagContaining(markup, `data-slot="${BLUEPRINT_MOTION_SLOT_ID}"`)).not.toContain(
      "aria-hidden",
    );
  });

  it("publishes the presented phase, overridable independently of the rail", () => {
    expect(render(<PremiumWorkbenchHero activeChapter="project" />)).toContain(
      'data-slot-phase="project"',
    );
    expect(render(<PremiumWorkbenchHero motionPhase="build" />)).toContain(
      'data-slot-phase="build"',
    );
  });
});

describe("PremiumWorkbenchHero chapter rail", () => {
  const markup = render(<PremiumWorkbenchHero />);

  it("renders the three chapters in order with their indices", () => {
    expect(textOf(markup)).toContain("01 Lead");
    expect(textOf(markup)).toContain("02 Project");
    expect(textOf(markup)).toContain("03 Record");
    let cursor = -1;
    for (const chapter of HERO_CHAPTERS) {
      const next = markup.indexOf(`id="${heroChapterElementId(chapter)}"`);
      expect(next).toBeGreaterThan(cursor);
      cursor = next;
    }
  });

  it("marks exactly one chapter current, defaulting to the chapter this module owns", () => {
    expect(countOf(markup, 'aria-current="step"')).toBe(1);
    expect(markup).toContain('data-active-chapter="lead"');
    expect(markup).toMatch(/data-hero-chapter="lead"[^>]*data-state="active"/);
    expect(markup).toMatch(/data-hero-chapter="project"[^>]*data-state="upcoming"/);
  });

  it("moves the current marker when another chapter is presented", () => {
    const projectMarkup = render(<PremiumWorkbenchHero activeChapter="project" />);
    expect(countOf(projectMarkup, 'aria-current="step"')).toBe(1);
    expect(projectMarkup).toMatch(/data-hero-chapter="project"[^>]*data-state="active"/);
  });
});

describe("PremiumWorkbenchHero composition rules", () => {
  const css = readFileSync(path.join(moduleDir, "PremiumWorkbenchHero.module.css"), "utf8");

  it("splits the composition 46 / 54 at desktop", () => {
    expect(ruleBody(css, ".composition")).toContain("grid-template-columns: 46fr 54fr;");
  });

  it("keeps the workbench surface edge to edge — never a floating card", () => {
    for (const selector of [".surface", ".surfaceImage", ".motionSlot"]) {
      const body = ruleBody(css, selector);
      expect(body, `${selector} must not be a card`).not.toMatch(/border-radius|box-shadow/);
    }
    expect(ruleBody(css, ".surface")).toContain("margin: 0;");
  });

  it("uses no glassmorphism anywhere in the composition", () => {
    expect(css).not.toMatch(/backdrop-filter|filter:\s*blur/);
  });

  it("collapses to a single column below the desktop breakpoint", () => {
    expect(css).toContain("@media (max-width: 63.99rem)");
    expect(css).toContain("@media (max-width: 30rem)");
    expect(css).toContain("grid-template-columns: 1fr;");
  });

  it("clips horizontal overflow at the section boundary", () => {
    expect(ruleBody(css, ".hero")).toContain("overflow-x: clip;");
  });

  it("carries a reduced-motion state and publishes it to the reserved region", () => {
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    const reduced = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"));
    expect(reduced).toContain("transition: none;");
    expect(reduced).toContain("--blueprint-motion-enabled: 0;");
  });

  it("declares the custom properties the reserved region publishes", () => {
    const slot = ruleBody(css, ".motionSlot");
    for (const property of Object.values(BLUEPRINT_MOTION_SLOT_CONTRACT.customProperties)) {
      expect(slot, `missing ${property}`).toContain(`${property}:`);
    }
    expect(slot).toContain("inset: 0;");
    expect(slot).toContain("pointer-events: none;");
  });

  it("gives every interactive element a visible focus state", () => {
    expect(ruleBody(css, ".action:focus-visible")).toContain("outline:");
  });
});
