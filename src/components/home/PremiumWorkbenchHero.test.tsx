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
  HERO_PHASE_DERIVED_CHAPTERS,
  HERO_RAIL_LABEL,
  HERO_STANDING_CHAPTER,
  PREMIUM_WORKBENCH_HERO_ACTIONS,
  PREMIUM_WORKBENCH_HERO_CONTRACT_VERSION,
  PREMIUM_WORKBENCH_HERO_COPY,
  heroChapterElementId,
  isBlueprintMotionPhase,
  isHeroChapter,
} from "./premiumWorkbenchHero.contract";

const moduleDir = path.dirname(fileURLToPath(import.meta.url));

const COMPONENT_SOURCE = readFileSync(
  path.join(moduleDir, "PremiumWorkbenchHero.tsx"),
  "utf8",
);
const CONTRACT_SOURCE = readFileSync(
  path.join(moduleDir, "premiumWorkbenchHero.contract.ts"),
  "utf8",
);
const CSS_SOURCE = readFileSync(
  path.join(moduleDir, "PremiumWorkbenchHero.module.css"),
  "utf8",
);

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
  it("publishes the five internal motion phases in drafting order", () => {
    expect(BLUEPRINT_MOTION_PHASES).toEqual(["lead", "project", "plan", "build", "record"]);
    expect(BLUEPRINT_MOTION_DEFAULT_PHASE).toBe("lead");
    expect(BLUEPRINT_MOTION_SLOT_ID).toBe("blueprint-motion-slot");
  });

  it("publishes the four public stations, exactly and in order", () => {
    expect(HERO_CHAPTERS).toEqual([
      "lead",
      "bounded-work",
      "verified-record",
      "business-memory",
    ]);
    expect(HERO_CHAPTERS.map((chapter) => HERO_CHAPTER_LABELS[chapter])).toEqual([
      "Lead",
      "Bounded work",
      "Verified record",
      "Business memory",
    ]);
  });

  it("keeps the public stations separate from the internal phase vocabulary", () => {
    // The two vocabularies no longer share identifiers: the fold reads a
    // business progression, the instrument runs drafting phases.
    for (const chapter of HERO_CHAPTERS) {
      if (chapter === "lead") continue;
      expect(isBlueprintMotionPhase(chapter)).toBe(false);
    }
    expect(isHeroChapter("verified-record")).toBe(true);
    expect(isHeroChapter("plan")).toBe(false);
    expect(isBlueprintMotionPhase("plan")).toBe(true);
    expect(isBlueprintMotionPhase("Plan")).toBe(false);
    expect(isBlueprintMotionPhase(undefined)).toBe(false);
  });

  it("excludes business memory from every phase-derived station", () => {
    expect(HERO_PHASE_DERIVED_CHAPTERS).toEqual(["lead", "bounded-work", "verified-record"]);
    expect(HERO_STANDING_CHAPTER).toBe("business-memory");
    expect(HERO_PHASE_DERIVED_CHAPTERS).not.toContain(HERO_STANDING_CHAPTER);
    // Every phase-derived station is still a published station.
    for (const chapter of HERO_PHASE_DERIVED_CHAPTERS) {
      expect(HERO_CHAPTERS).toContain(chapter);
    }
  });

  it("binds the slot descriptor to the published values", () => {
    expect(BLUEPRINT_MOTION_SLOT_CONTRACT.version).toBe(PREMIUM_WORKBENCH_HERO_CONTRACT_VERSION);
    expect(PREMIUM_WORKBENCH_HERO_CONTRACT_VERSION).toBe("2.0.0");
    expect(BLUEPRINT_MOTION_SLOT_CONTRACT.slotId).toBe(BLUEPRINT_MOTION_SLOT_ID);
    expect(BLUEPRINT_MOTION_SLOT_CONTRACT.phases).toEqual(BLUEPRINT_MOTION_PHASES);
    expect(BLUEPRINT_MOTION_SLOT_CONTRACT.chapters).toEqual(HERO_CHAPTERS);
    expect(BLUEPRINT_MOTION_SLOT_CONTRACT.layout.containerName).toBe(BLUEPRINT_MOTION_SLOT_ID);
    expect(Object.isFrozen(BLUEPRINT_MOTION_SLOT_CONTRACT)).toBe(true);
  });

  it("publishes no media custom property, because there is no media", () => {
    expect(Object.keys(BLUEPRINT_MOTION_SLOT_CONTRACT.customProperties)).toEqual([
      "motionEnabled",
    ]);
  });

  it("addresses each station by a stable element id", () => {
    expect(heroChapterElementId("lead")).toBe("premium-workbench-hero-chapter-lead");
    expect(heroChapterElementId("business-memory")).toBe(
      "premium-workbench-hero-chapter-business-memory",
    );
    expect(new Set(HERO_CHAPTERS.map(heroChapterElementId)).size).toBe(HERO_CHAPTERS.length);
  });

  it("carries the two published calls to action, primary first", () => {
    expect(PREMIUM_WORKBENCH_HERO_ACTIONS.map((action) => [action.label, action.href])).toEqual([
      ["Open Concept Studio", "/studio"],
      ["See how a project runs", "/process"],
    ]);
    expect(PREMIUM_WORKBENCH_HERO_ACTIONS.map((action) => action.emphasis)).toEqual([
      "primary",
      "secondary",
    ]);
  });
});

/*
 * The mutation probes for this packet's single outcome. Each one fails the
 * moment the removed layer comes back, in any of the forms it could return in:
 * the import, the element, the asset reference, or the contract constant.
 */
describe("PremiumWorkbenchHero · the workbench bitmap is gone", () => {
  const markup = render(<PremiumWorkbenchHero />);

  it("imports no image machinery and renders no image element", () => {
    expect(COMPONENT_SOURCE).not.toContain("next/image");
    expect(COMPONENT_SOURCE).not.toMatch(/<Image\b/);
    expect(COMPONENT_SOURCE).not.toContain("<img");
    expect(markup).not.toContain("<img");
    expect(markup).not.toContain("<picture");
    expect(markup).not.toContain("srcset");
  });

  it("references no bitmap asset from the component, the contract, or the paint", () => {
    for (const [name, source] of [
      ["component", COMPONENT_SOURCE],
      ["contract", CONTRACT_SOURCE],
      ["stylesheet", CSS_SOURCE],
    ] as const) {
      expect(source, `${name} must not reference an asset`).not.toMatch(
        /\.(?:webp|png|jpe?g|avif|svg)\b/i,
      );
      expect(source, `${name} must not reference the retired workbench`).not.toContain(
        "balanced-process-materials",
      );
      expect(source, `${name} must not carry a background image`).not.toMatch(
        /url\(|background-image/,
      );
    }
  });

  it("keeps the retired media constant deleted rather than inert", () => {
    expect(CONTRACT_SOURCE).not.toMatch(/export const PREMIUM_WORKBENCH_HERO_MEDIA\b/);
    expect(CONTRACT_SOURCE).not.toMatch(/export const PREMIUM_WORKBENCH_HERO_MEDIA_ASPECT\b/);
    expect(COMPONENT_SOURCE).not.toContain("PREMIUM_WORKBENCH_HERO_MEDIA");
  });

  it("renders no image slot, fallback frame, or disclosure for the removed image", () => {
    // Nothing is mounted and nothing is disclosed, so the fold shows no strip
    // and no frame — not an empty one, not a placeholder one.
    expect(markup).not.toContain('data-disclosure="public-claim"');
    expect(markup).not.toContain("<figcaption");
    expect(markup).not.toContain("Conceptual imagery");
    expect(ruleBody(CSS_SOURCE, ".instrument")).not.toMatch(/border|box-shadow|border-radius/);
  });
});

describe("PremiumWorkbenchHero copy", () => {
  const markup = render(<PremiumWorkbenchHero />);
  const text = textOf(markup);

  it("uses the exact approved kicker, heading, and lede", () => {
    expect(PREMIUM_WORKBENCH_HERO_COPY.kicker).toBe(
      "WEST COAST KBP · ADU + GENERAL CONSTRUCTION",
    );
    expect(PREMIUM_WORKBENCH_HERO_COPY.heading).toBe(
      "A construction project, kept legible from first lead to verified record.",
    );
    expect(PREMIUM_WORKBENCH_HERO_COPY.lede).toBe(
      "KBP OS is designed to keep project facts, decisions, documents, and completed " +
        "work in one living record—organized by the system, controlled by people.",
    );
    expect(text).toContain(PREMIUM_WORKBENCH_HERO_COPY.kicker);
    expect(text).toContain(PREMIUM_WORKBENCH_HERO_COPY.heading);
    expect(text).toContain(PREMIUM_WORKBENCH_HERO_COPY.lede);
  });

  it("declares exactly one h1, and it carries the heading", () => {
    expect(countOf(markup, "<h1")).toBe(1);
    expect(markup).toMatch(
      /<h1[^>]*id="premium-workbench-hero-title"[^>]*>A construction project, kept legible from first lead to verified record\.<\/h1>/,
    );
    expect(markup).toContain('aria-labelledby="premium-workbench-hero-title"');
  });

  it("names the business before it names the platform", () => {
    // Construction reads first: the trade, then the journey, then the record.
    expect(text.indexOf("WEST COAST KBP")).toBeLessThan(text.indexOf("KBP OS"));
    expect(text).toContain("ADU + GENERAL CONSTRUCTION");
    // People are named as the deciders, in the approved words.
    expect(text).toContain("controlled by people");
  });

  it("keeps the first fold free of AI and orchestration vocabulary", () => {
    const forbidden = [
      /\bAI\b/,
      /\bagent\b/i,
      /\bmodel\b/i,
      /\bpipeline\b/i,
      /\borchestrat/i,
      /\bautomation\b/i,
      /\bDeedseal\b/i,
      /\bseal\b/i,
      /\bnode\b/i,
      /\bdashboard\b/i,
    ];
    for (const pattern of forbidden) {
      expect(text, `unexpected token matching ${pattern.source}`).not.toMatch(pattern);
    }
  });

  it("renders both published calls to action in order", () => {
    for (const action of PREMIUM_WORKBENCH_HERO_ACTIONS) {
      expect(markup).toContain(`href="${action.href}"`);
      expect(markup).toContain(action.label);
    }
    expect(markup.indexOf('href="/studio"')).toBeLessThan(markup.indexOf('href="/process"'));
    expect(markup).not.toContain('href="/start"');
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
      "supplier",
      "customer",
    ];
    const haystack = text.toLowerCase();
    for (const term of forbidden) {
      // The composition carries no disclosure of its own, so nothing in the
      // fold may state any of these even once.
      expect(countOf(haystack, term), `unexpected claim token: ${term}`).toBe(0);
    }
    // No address, no date, no count of completed projects. The station indices
    // are the fold's only digits, so the copy itself is what is measured here.
    const copy = [
      ...Object.values(PREMIUM_WORKBENCH_HERO_COPY),
      ...PREMIUM_WORKBENCH_HERO_ACTIONS.map((action) => action.label),
      ...HERO_CHAPTERS.map((chapter) => HERO_CHAPTER_LABELS[chapter]),
    ].join(" ");
    expect(copy).not.toMatch(/\d/);
  });
});

describe("PremiumWorkbenchHero reserved instrument region", () => {
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
      <PremiumWorkbenchHero blueprintMotionSlot={<p data-instrument="mounted">mounted</p>} />,
    );
    expect(markup).toContain('data-slot-state="filled"');
    expect(markup).toContain('<p data-instrument="mounted">mounted</p>');
    expect(openTagContaining(markup, `data-slot="${BLUEPRINT_MOTION_SLOT_ID}"`)).not.toContain(
      "aria-hidden",
    );
  });

  it("publishes the presented phase independently of the public station", () => {
    expect(render(<PremiumWorkbenchHero activeChapter="bounded-work" />)).toContain(
      'data-slot-phase="lead"',
    );
    expect(render(<PremiumWorkbenchHero motionPhase="build" />)).toContain(
      'data-slot-phase="build"',
    );
  });

  it("publishes the instrument's own claim boundary, and only when it has one", () => {
    const markup = render(
      <PremiumWorkbenchHero instrumentDisclosure="Not a construction document." />,
    );
    expect(markup).toContain('data-disclosure="public-claim"');
    expect(textOf(markup)).toContain("Not a construction document.");
    expect(countOf(markup, "<figcaption")).toBe(1);
  });
});

describe("PremiumWorkbenchHero public progression", () => {
  const markup = render(<PremiumWorkbenchHero />);

  it("renders exactly the four stations, in order, with their indices", () => {
    expect(countOf(markup, "data-hero-chapter=")).toBe(4);
    const text = textOf(markup);
    expect(text).toContain("01 Lead");
    expect(text).toContain("02 Bounded work");
    expect(text).toContain("03 Verified record");
    expect(text).toContain("04 Business memory");

    const order = [...markup.matchAll(/data-hero-chapter="([a-z-]+)"/g)].map((match) => match[1]);
    expect(order).toEqual([...HERO_CHAPTERS]);
  });

  it("names the rail for the project, not for the product", () => {
    expect(markup).toContain(`aria-label="${HERO_RAIL_LABEL}"`);
    expect(HERO_RAIL_LABEL).toBe("Project progression");
    expect(countOf(markup, "<ol")).toBe(1);
  });

  it("marks exactly one station current, defaulting to the first", () => {
    expect(countOf(markup, 'aria-current="step"')).toBe(1);
    expect(markup).toContain('data-active-chapter="lead"');
    expect(markup).toMatch(/data-hero-chapter="lead"[^>]*data-state="active"/);
    expect(markup).toMatch(/data-hero-chapter="bounded-work"[^>]*data-state="upcoming"/);
  });

  it("moves the current marker and completes the stations behind it", () => {
    const later = render(<PremiumWorkbenchHero activeChapter="verified-record" />);
    expect(countOf(later, 'aria-current="step"')).toBe(1);
    expect(later).toMatch(/data-hero-chapter="verified-record"[^>]*data-state="active"/);
    expect(later).toMatch(/data-hero-chapter="lead"[^>]*data-state="complete"/);
    expect(later).toMatch(/data-hero-chapter="bounded-work"[^>]*data-state="complete"/);
  });

  it("never marks business memory current, at any station the fold can present", () => {
    for (const chapter of HERO_PHASE_DERIVED_CHAPTERS) {
      const rendered = render(<PremiumWorkbenchHero activeChapter={chapter} />);
      expect(rendered).toMatch(/data-hero-chapter="business-memory"[^>]*data-state="standing"/);
      expect(countOf(rendered, 'aria-current="step"')).toBe(1);
      expect(rendered).not.toMatch(
        /data-hero-chapter="business-memory"[^>]*aria-current/,
      );
    }
  });
});

describe("PremiumWorkbenchHero composition rules", () => {
  const css = CSS_SOURCE;

  it("gives the instrument the dominant column at desktop", () => {
    expect(ruleBody(css, ".composition")).toContain("grid-template-columns: 46fr 54fr;");
  });

  it("keeps the instrument field edge to edge — never a floating card", () => {
    for (const selector of [".instrument", ".motionSlot"]) {
      const body = ruleBody(css, selector);
      expect(body, `${selector} must not be a card`).not.toMatch(/border-radius|box-shadow/);
    }
    expect(ruleBody(css, ".instrument")).toContain("margin: 0;");
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
    // The three media properties are gone from the paint as well as the contract.
    for (const retired of ["source-aspect", "object-fit", "object-position"]) {
      expect(slot).not.toContain(retired);
    }
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
  const css = CSS_SOURCE;
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

  it("paints the claim strip on the brand surface token, never the heading ink token", () => {
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

  it("paints the primary call to action hover fill on the brand surface token, never the heading ink token", () => {
    const body = ruleBody(css, ".actionPrimary:hover");
    expect(body).toContain("background: var(--color-forest-deep-surface, #121a17);");
    expect(body).not.toMatch(/background:\s*var\(\s*--(pwh-forest-deep|color-forest-deep)\s*[,)]/);
    // The hover rule changes the fill only; the label keeps the rest colour.
    expect(body).not.toMatch(/(^|[\s{;])color:/);
  });

  it("separates the instrument field from the editorial field by tone, in both schemes", () => {
    for (const scheme of ["light", "dark"] as const) {
      const field = resolve(declaration(".instrument", "background"), PALETTES[scheme]);
      const editorial = resolve(declaration(".editorial", "background"), PALETTES[scheme]);
      expect(field, `instrument field must differ from the paper in ${scheme}`).not.toBe(
        editorial,
      );
    }
  });

  for (const scheme of ["light", "dark"] as const) {
    const palette = PALETTES[scheme];

    it(`holds the claim strip at AA in ${scheme}`, () => {
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

    it(`holds the primary call to action at AA while hovered in ${scheme}`, () => {
      // The hover rule replaces the fill and inherits the rest label colour.
      const ratio = contrast(
        resolve(declaration(".actionPrimary", "color"), palette),
        resolve(declaration(".actionPrimary:hover", "background"), palette),
      );
      expect(
        ratio,
        `hovered primary CTA contrast in ${scheme}: ${ratio.toFixed(2)}:1`,
      ).toBeGreaterThanOrEqual(4.5);
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

    it(`holds the public progression at AA in ${scheme}`, () => {
      const rail = resolve(declaration(".rail", "background"), palette);
      for (const selector of ['.chapter[data-state="complete"]', '.chapter[data-state="active"]']) {
        const ratio = contrast(resolve(declaration(selector, "color"), palette), rail);
        expect(ratio, `${selector} in ${scheme}: ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
      }
      // The standing and upcoming stations take the muted ink from `.chapter`.
      const muted = contrast(resolve(declaration(".chapter", "color"), palette), rail);
      expect(muted, `muted station in ${scheme}: ${muted.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
    });
  }

  it("proves the rejected tokens are the failure, not an arbitrary preference", () => {
    // The two bytes an earlier revision replaced, measured in dark. These are
    // the ratios the reviewer observed in the browser at 759d2ff.
    const inverse = resolve("var(--pwh-ink-inverse)", dark);
    expect(contrast(inverse, dark["--color-forest-deep"])).toBeLessThan(4.5);
    expect(contrast(dark["--color-forest"], dark["--color-canvas"])).toBeLessThan(4.5);
  });
});
