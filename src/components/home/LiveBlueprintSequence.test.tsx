import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  HOME_BLUEPRINT_PHASES,
  HOME_BLUEPRINT_PHASE_ORDER,
  HOME_BLUEPRINT_PROJECT_DRAWING,
} from "../../lib/homeBlueprintGeometry";
import type { HomeBlueprintPhase } from "../../lib/homeBlueprintGeometry";

import LiveBlueprintSequence, {
  COMPACT_VIEWPORT_QUERY,
  REDUCED_MOTION_QUERY,
  isLayerRevealed,
  nextBlueprintPhase,
  previousBlueprintPhase,
  resolveBlueprintKeyCommand,
  shouldAutoAdvance,
} from "./LiveBlueprintSequence";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const COMPONENT_SOURCE = readFileSync(path.join(HERE, "LiveBlueprintSequence.tsx"), "utf8");
const STYLE_SOURCE = readFileSync(path.join(HERE, "LiveBlueprintSequence.module.css"), "utf8");

const DRAWING = HOME_BLUEPRINT_PROJECT_DRAWING;

/** The server render is also the no-JavaScript render. */
const STATIC_MARKUP = renderToStaticMarkup(<LiveBlueprintSequence />);

function decode(markup: string): string {
  return markup
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

const STATIC_TEXT = decode(STATIC_MARKUP);

function renderedPathData(markup: string): string[] {
  return [...markup.matchAll(/ d="([^"]+)"/g)].map((match) => match[1]);
}

function cssClassPropertyValues(className: string, property: string): string[] {
  const propertyPattern = new RegExp(`${property}:\\s*([^;]+);`, "g");

  return [...STYLE_SOURCE.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(([, selectors]) =>
      selectors
        .replaceAll(/\/\*[\s\S]*?\*\//g, "")
        .split(",")
        .map((selector) => selector.trim().split(/\s+/).at(-1))
        .includes(`.${className}`),
    )
    .flatMap(([, , declarations]) =>
      [...declarations.matchAll(propertyPattern)].map((match) => match[1].trim()),
    );
}

function lastPixelPropertyValue(className: string, property: string): number {
  const value = cssClassPropertyValues(className, property).at(-1);
  if (value === undefined || !/^\d+px$/.test(value)) {
    throw new Error(`Expected final .${className} ${property} to be a pixel value, received ${String(value)}`);
  }
  return Number.parseInt(value, 10);
}

/* ------------------------------------------------------------ phase model */

describe("phase sequence", () => {
  it("advances through the five phases in drafting order and wraps", () => {
    const visited: HomeBlueprintPhase[] = [HOME_BLUEPRINT_PHASE_ORDER[0]];
    for (let step = 0; step < 4; step += 1) {
      visited.push(nextBlueprintPhase(visited[visited.length - 1]));
    }

    expect(visited).toEqual(["lead", "project", "plan", "build", "record"]);
    expect(nextBlueprintPhase("record")).toBe("lead");
    expect(previousBlueprintPhase("lead")).toBe("record");
    expect(previousBlueprintPhase("build")).toBe("plan");
  });

  it("reveals cumulatively, so the sheet reads as one drawing being drafted", () => {
    expect(isLayerRevealed("lead", "plan", "live")).toBe(true);
    expect(isLayerRevealed("plan", "plan", "live")).toBe(true);
    expect(isLayerRevealed("build", "plan", "live")).toBe(false);
    expect(isLayerRevealed("record", "record", "live")).toBe(true);
  });

  it("reveals every layer in static mode, whatever phase is selected", () => {
    for (const layer of HOME_BLUEPRINT_PHASE_ORDER) {
      for (const active of HOME_BLUEPRINT_PHASE_ORDER) {
        expect(isLayerRevealed(layer, active, "static")).toBe(true);
      }
    }
  });
});

/* --------------------------------------------------------------- keyboard */

describe("keyboard control", () => {
  it("moves selection with both arrow axes", () => {
    expect(resolveBlueprintKeyCommand("ArrowRight", "plan")).toEqual({ type: "select", phase: "build" });
    expect(resolveBlueprintKeyCommand("ArrowDown", "plan")).toEqual({ type: "select", phase: "build" });
    expect(resolveBlueprintKeyCommand("ArrowLeft", "plan")).toEqual({ type: "select", phase: "project" });
    expect(resolveBlueprintKeyCommand("ArrowUp", "plan")).toEqual({ type: "select", phase: "project" });
  });

  it("jumps to the first and last phase with Home and End", () => {
    expect(resolveBlueprintKeyCommand("Home", "build")).toEqual({ type: "select", phase: "lead" });
    expect(resolveBlueprintKeyCommand("End", "lead")).toEqual({ type: "select", phase: "record" });
  });

  it("pauses and resumes from the keyboard", () => {
    expect(resolveBlueprintKeyCommand("p", "lead")).toEqual({ type: "toggle" });
    expect(resolveBlueprintKeyCommand("P", "lead")).toEqual({ type: "toggle" });
  });

  it("ignores keys it does not own, so the page keeps its own shortcuts", () => {
    for (const key of ["Tab", "Enter", " ", "a", "Escape", "PageDown"]) {
      expect(resolveBlueprintKeyCommand(key, "lead")).toBeNull();
    }
  });

  it("gives the rail a roving tab stop with the active step marked", () => {
    expect(STATIC_MARKUP.match(/tabindex="0"/g)).toHaveLength(1);
    expect(STATIC_MARKUP.match(/tabindex="-1"/g)).toHaveLength(HOME_BLUEPRINT_PHASES.length - 1);
    expect(STATIC_MARKUP.match(/aria-current="step"/g)).toHaveLength(1);
  });
});

/* ------------------------------------------------------------------ pause */

describe("auto progression", () => {
  const running = {
    enabled: true,
    playing: true,
    interacting: false,
    documentHidden: false,
    reducedMotion: false,
    compact: false,
    mounted: true,
  };

  it("runs only once mounted, enabled and playing", () => {
    expect(shouldAutoAdvance(running)).toBe(true);
    expect(shouldAutoAdvance({ ...running, mounted: false })).toBe(false);
    expect(shouldAutoAdvance({ ...running, enabled: false })).toBe(false);
    expect(shouldAutoAdvance({ ...running, playing: false })).toBe(false);
  });

  it("pauses on hover or focus inside the figure", () => {
    expect(shouldAutoAdvance({ ...running, interacting: true })).toBe(false);
  });

  it("pauses while the page is hidden", () => {
    expect(shouldAutoAdvance({ ...running, documentHidden: true })).toBe(false);
  });

  it("never runs under reduced motion", () => {
    expect(shouldAutoAdvance({ ...running, reducedMotion: true })).toBe(false);
  });

  it("never runs on a mobile-width viewport", () => {
    expect(shouldAutoAdvance({ ...running, compact: true })).toBe(false);
  });

  it("watches the media queries it claims to watch", () => {
    expect(REDUCED_MOTION_QUERY).toBe("(prefers-reduced-motion: reduce)");
    expect(COMPACT_VIEWPORT_QUERY).toBe("(max-width: 47.999rem)");
    expect(COMPONENT_SOURCE).toContain("visibilitychange");
    expect(STYLE_SOURCE).toContain("@media (max-width: 47.999rem)");
    expect(STYLE_SOURCE).toContain("@media (prefers-reduced-motion: reduce)");
  });
});

/* ------------------------------------------- static / no-script readability */

describe("static readability", () => {
  it("server-renders in static mode with nothing hidden", () => {
    expect(STATIC_MARKUP).toContain('data-motion="static"');
    expect(STATIC_MARKUP).not.toContain('data-revealed="false"');
    expect(STATIC_MARKUP.match(/data-revealed="true"/g)?.length).toBeGreaterThan(
      DRAWING.paths.length,
    );
  });

  it("carries all five phase labels as readable text", () => {
    for (const phase of HOME_BLUEPRINT_PHASES) {
      expect(STATIC_TEXT).toContain(`>${phase.label}</span>`);
    }
    expect(STATIC_MARKUP.match(/<button/g)).toHaveLength(HOME_BLUEPRINT_PHASES.length + 1);
  });

  it("carries every generated line of the drawing, not a subset", () => {
    const rendered = new Set(renderedPathData(STATIC_MARKUP));

    for (const drawn of DRAWING.paths) {
      expect(rendered.has(drawn.d)).toBe(true);
    }
    for (const dimension of DRAWING.dimensions) {
      expect(rendered.has(dimension.d)).toBe(true);
    }
  });

  it("carries every room label and its area", () => {
    for (const space of DRAWING.spaceLabels) {
      expect(STATIC_TEXT).toContain(`>${space.label}</text>`);
      expect(STATIC_TEXT).toContain(`>${space.areaLabel}</text>`);
    }
  });

  it("keeps the measured facts in text, for the widths that thin the on-sheet annotation", () => {
    expect(STATIC_TEXT).toContain("20'-0\" × 30'-0\"");
    expect(STATIC_TEXT).toContain("600 sq ft");
    expect(STATIC_TEXT).toContain("wall head 9'-0\"");
    expect(STATIC_TEXT).toContain("ridge 12'-4\"");
  });

  it("states the profile's real adoption, maturity and gate state", () => {
    expect(STATIC_TEXT).toContain("owner_adopted");
    expect(STATIC_TEXT).toContain("concept_only");
    expect(STATIC_TEXT).toContain("gates 0 of 8 reviewed");
    expect(STATIC_TEXT).toContain(DRAWING.recordBlock.disclaimer);
  });
});

/* ------------------------------------------------------------ accessibility */

describe("accessible structure", () => {
  it("exposes the drawing as a described image", () => {
    expect(STATIC_MARKUP).toContain('role="img"');
    expect(STATIC_MARKUP).toMatch(/aria-labelledby="[^"]+-title"/);
    expect(STATIC_MARKUP).toMatch(/aria-describedby="[^"]+-description"/);
    expect(STATIC_TEXT).toContain(DRAWING.description);
  });

  it("joins the integrator's heading to its own title when one is supplied", () => {
    const withHeading = renderToStaticMarkup(<LiveBlueprintSequence headingId="hero-heading" />);
    expect(withHeading).toMatch(/aria-labelledby="hero-heading [^"]+-title"/);
  });

  it("names the rail and orders its steps", () => {
    expect(STATIC_MARKUP).toContain('aria-label="Blueprint drafting phases"');
    const order = [...STATIC_TEXT.matchAll(/<span class="[^"]*stepLabel[^"]*">([^<]+)<\/span>/g)].map(
      (match) => match[1],
    );
    expect(order).toEqual(HOME_BLUEPRINT_PHASES.map((phase) => phase.label));
  });

  it("gives every control a touch target of at least 44px and a visible focus ring", () => {
    expect(STYLE_SOURCE).toContain("min-block-size: 2.75rem");
    expect(STYLE_SOURCE).toContain("min-inline-size: 2.75rem");
    expect(STYLE_SOURCE.match(/:focus-visible/g)?.length).toBeGreaterThanOrEqual(2);
  });

  it("starts on the first phase and reports the active phase in the accessible title", () => {
    expect(STATIC_MARKUP).toContain('data-phase="lead"');
    expect(STATIC_TEXT).toContain("phase 1 of 5: Lead");
  });
});

/* ------------------------------------------------------- layout and honesty */

describe("layout guards", () => {
  it("scales to its container instead of forcing a width", () => {
    expect(STYLE_SOURCE).toContain("max-inline-size: 100%");
    expect(STYLE_SOURCE).toContain("inline-size: 100%");
    expect(STYLE_SOURCE).toContain("flex-wrap: wrap");
    expect(STYLE_SOURCE).not.toMatch(/\bwidth:\s*\d+px/);
    expect(STATIC_MARKUP).toContain("aspect-ratio:");
  });

  it("sizes the sheet from the derived viewBox rather than a fixed ratio", () => {
    expect(STATIC_MARKUP).toContain(`viewBox="${DRAWING.viewBoxAttribute}"`);
    expect(STATIC_MARKUP).toContain(
      `aspect-ratio:${DRAWING.viewBox.width} / ${DRAWING.viewBox.height}`,
    );
  });

  it("keeps record values effectively end-aligned after the CSS cascade", () => {
    expect(COMPONENT_SOURCE).toContain('textAnchor="end"');
    expect(cssClassPropertyValues("recordValue", "text-anchor")).toEqual(["middle", "end"]);
  });

  it("keeps the mobile record heading and subtitle inside the padded frame", () => {
    const recordPad = 128;
    const glyphAdvanceRatio = 0.62;
    const contentWidth = DRAWING.recordBlock.width - recordPad * 2;
    const mobileTitleSize = lastPixelPropertyValue("recordTitle", "font-size");
    const mobileSubtitleSize = lastPixelPropertyValue("recordSubtitle", "font-size");

    expect(COMPONENT_SOURCE).toContain(`const recordPad = ${recordPad};`);
    expect(mobileSubtitleSize).toBeLessThanOrEqual(206);

    for (const [text, fontSize] of [
      [DRAWING.recordBlock.title, mobileTitleSize],
      [DRAWING.recordBlock.subtitle, mobileSubtitleSize],
    ] as const) {
      expect(text.length * glyphAdvanceRatio * fontSize).toBeLessThanOrEqual(contentWidth);
    }
  });

  it("declares no new runtime dependency and no image asset", () => {
    expect(COMPONENT_SOURCE).not.toMatch(/from "(?!\.|react)/);
    expect(COMPONENT_SOURCE).not.toContain("<img");
    expect(COMPONENT_SOURCE).not.toContain("next/image");
    expect(STYLE_SOURCE).not.toContain("url(");
  });
});

describe("no handcrafted drawing", () => {
  it("contains no literal path data in the component source", () => {
    expect(COMPONENT_SOURCE).not.toMatch(/d="M[\s\d-]/);
    expect(COMPONENT_SOURCE).not.toMatch(/\bd=\{`/);
    expect(COMPONENT_SOURCE).not.toContain("<rect");
    expect(COMPONENT_SOURCE).not.toContain("<circle");
    expect(COMPONENT_SOURCE).not.toContain("<polygon");
  });

  it("renders no path that the geometry module did not generate", () => {
    const generated = new Set([
      ...DRAWING.paths.map((entry) => entry.d),
      ...DRAWING.dimensions.map((entry) => entry.d),
    ]);

    for (const rendered of renderedPathData(STATIC_MARKUP)) {
      expect(generated.has(rendered)).toBe(true);
    }
  });

  it("uses only the derived drawing, with no fallback geometry to fall back to", () => {
    expect(COMPONENT_SOURCE).toContain("drawing = HOME_BLUEPRINT_PROJECT_DRAWING");
    expect(COMPONENT_SOURCE).not.toMatch(/catch\s*\(/);
  });
});

describe("public copy boundary", () => {
  const forbidden = [
    /\$\d/,
    /\bprice\b/i,
    /\bcost\b/i,
    /\bpermitted\b/i,
    /\bapproved\b/i,
    /\bcertified\b/i,
    /\bzoning\b/i,
    /\bbuildable\b/i,
    /\bguarantee/i,
    /\bwarrant/i,
    /\bsurveyed\b/i,
    /\bweeks?\b/i,
    /\bmonths?\b/i,
    /\btimeline\b/i,
  ];

  const visibleText = STATIC_TEXT.replace(/<[^>]+>/g, " ");

  it.each(forbidden.map((pattern) => [pattern.source, pattern] as const))(
    "asserts nothing matching %s",
    (_label, pattern) => {
      expect(visibleText).not.toMatch(pattern);
    },
  );

  it("says plainly what the drawing is not", () => {
    expect(visibleText).toContain("Not a construction document, survey, or approval.");
  });
});
