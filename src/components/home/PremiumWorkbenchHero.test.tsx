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

/*
 * Both colour schemes, resolved against the real palette.
 *
 * These assertions do not read the stylesheet as prose. They resolve each
 * declaration through the module's `--pwh-` aliases into `app/globals.css`,
 * take the hex the browser would take in each scheme, and compute the ratio.
 * A token whose role is wrong therefore fails here even though the stylesheet
 * still "mentions" a colour.
 */
describe("PremiumWorkbenchHero colour scheme durability", () => {
  const css = readFileSync(path.join(moduleDir, "PremiumWorkbenchHero.module.css"), "utf8");
  const globals = readFileSync(
    path.join(moduleDir, "..", "..", "..", "app", "globals.css"),
    "utf8",
  );

  /** Text of the balanced `{ … }` block opening at or after `from`. */
  function blockAt(source: string, from: number): string {
    const open = source.indexOf("{", from);
    expect(open, "no block to read").toBeGreaterThan(-1);
    let depth = 0;
    for (let cursor = open; cursor < source.length; cursor += 1) {
      if (source[cursor] === "{") depth += 1;
      else if (source[cursor] === "}") {
        depth -= 1;
        if (depth === 0) return source.slice(open + 1, cursor);
      }
    }
    throw new Error("unbalanced block in globals.css");
  }

  function literals(block: string): Record<string, string> {
    const found: Record<string, string> = {};
    for (const [, name, hex] of block.matchAll(/(--[a-z0-9-]+):\s*(#[0-9a-fA-F]{6})/g)) {
      found[name] = hex.toLowerCase();
    }
    return found;
  }

  const darkAt = globals.indexOf("@media (prefers-color-scheme: dark)");
  expect(darkAt, "globals.css must declare a dark scheme").toBeGreaterThan(-1);
  const darkMedia = blockAt(globals, darkAt);
  const light = literals(blockAt(globals, globals.indexOf(":root {")));
  const dark = { ...light, ...literals(blockAt(darkMedia, darkMedia.indexOf(":root"))) };
  const PALETTES = { light, dark } as const;

  const heroAliases = ruleBody(css, ".hero");

  /** Resolves one declaration to the hex a browser would paint in `scheme`. */
  function resolve(value: string, palette: Record<string, string>): string {
    let current = value.trim();
    for (let hop = 0; hop < 8; hop += 1) {
      const reference = current.match(/var\(\s*(--[a-z0-9-]+)\s*(?:,\s*([^)]+))?\)/);
      if (!reference) break;
      const [, name, fallback] = reference;
      if (name.startsWith("--pwh-")) {
        const alias = heroAliases.match(new RegExp(`${name}:\\s*([^;]+);`))?.[1];
        expect(alias, `missing alias ${name}`).toBeTruthy();
        current = alias as string;
        continue;
      }
      const resolved = palette[name] ?? fallback;
      expect(resolved, `unresolvable ${name}`).toBeTruthy();
      current = (resolved as string).trim();
    }
    expect(current, `not a hex colour: ${value}`).toMatch(/^#[0-9a-fA-F]{6}$/);
    return current.toLowerCase();
  }

  /*
   * Exact property, never a longhand that merely ends in it: `border-color`
   * must not answer a request for `color`.
   */
  function declaration(selector: string, property: string): string {
    const body = ruleBody(css, selector);
    const value = body
      .slice(body.indexOf("{") + 1)
      .split(";")
      .map((entry) => entry.trim())
      .find((entry) => entry.startsWith(`${property}:`))
      ?.slice(property.length + 1)
      .trim();
    expect(value, `missing ${property} on ${selector}`).toBeTruthy();
    return value as string;
  }

  function luminance(hex: string): number {
    const channels = (hex.replace("#", "").match(/.{2}/g) as string[])
      .map((channel) => Number.parseInt(channel, 16) / 255)
      .map((channel) =>
        channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
      );
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  }

  function contrast(foreground: string, background: string): number {
    const [high, low] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
    return (high + 0.05) / (low + 0.05);
  }

  it("reads a palette that genuinely inverts, so these guards have teeth", () => {
    // If either of these ever stopped inverting, the checks below would pass
    // for the wrong reason.
    expect(dark["--color-forest-deep"]).not.toBe(light["--color-forest-deep"]);
    expect(dark["--color-forest"]).not.toBe(light["--color-forest"]);
    // The brand surface stays dark in both schemes; the heading ink does not.
    expect(light["--color-forest-deep-surface"]).toBe("#121a17");
    expect(dark["--color-forest-deep-surface"]).toBe("#0c110f");
  });

  it("paints the media disclosure on the brand surface token, never the heading ink token", () => {
    const body = ruleBody(css, ".disclosure");
    expect(body).toContain("background: var(--color-forest-deep-surface, #121a17);");
    expect(body).not.toMatch(/background:\s*var\(\s*--(pwh-forest-deep|color-forest-deep)\s*[,)]/);
  });

  it("paints the secondary call to action in heading ink, never the forest surface token", () => {
    const body = ruleBody(css, ".actionSecondary");
    expect(body).toContain("color: var(--pwh-forest-deep);");
    expect(body).not.toMatch(/\bcolor:\s*var\(\s*--pwh-forest\s*[,)]/);
    // The control is unfilled, so the editorial field is its true background.
    expect(body).toContain("background: transparent;");
  });

  for (const scheme of ["light", "dark"] as const) {
    const palette = PALETTES[scheme];

    it(`holds the media disclosure at AA in ${scheme}`, () => {
      const ratio = contrast(
        resolve(declaration(".disclosure", "color"), palette),
        resolve(declaration(".disclosure", "background"), palette),
      );
      expect(ratio, `disclosure contrast in ${scheme}: ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
    });

    it(`holds the secondary call to action at AA in ${scheme}`, () => {
      const ratio = contrast(
        resolve(declaration(".actionSecondary", "color"), palette),
        resolve(declaration(".editorial", "background"), palette),
      );
      expect(ratio, `secondary CTA contrast in ${scheme}: ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
    });

    it(`holds the heading, lede, kicker, and primary call to action at AA in ${scheme}`, () => {
      const field = resolve(declaration(".editorial", "background"), palette);
      const pairs: [string, string, string][] = [
        ["heading", declaration(".title", "color"), field],
        ["lede", declaration(".lede", "color"), field],
        ["kicker", declaration(".kicker", "color"), field],
        [
          "primary CTA",
          declaration(".actionPrimary", "color"),
          declaration(".actionPrimary", "background"),
        ],
      ];
      for (const [name, foreground, background] of pairs) {
        const ratio = contrast(resolve(foreground, palette), resolve(background, palette));
        expect(ratio, `${name} contrast in ${scheme}: ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
      }
    });
  }

  it("proves the rejected tokens are the failure, not an arbitrary preference", () => {
    // The two bytes this revision replaced, measured in dark. These are the
    // ratios the reviewer observed in the browser at 759d2ff.
    const inverse = resolve("var(--pwh-ink-inverse)", dark);
    expect(contrast(inverse, dark["--color-forest-deep"])).toBeLessThan(4.5);
    expect(contrast(dark["--color-forest"], dark["--color-canvas"])).toBeLessThan(4.5);
  });
});
