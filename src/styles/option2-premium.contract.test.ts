import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  ANTI_PATTERNS,
  COPPER_TEXT_FORBIDDEN,
  DECORATIVE_PAIRS,
  HERO_NON_TEXT_PAIRS,
  HERO_TEXT_PAIRS,
  LIGHT_MODEL,
  MOTION_TOKENS,
  OPTION2_PREMIUM_CONTRACT_VERSION,
  OPTION2_PREMIUM_SCOPE,
  TOKEN_REGISTRY,
  TYPE_ROLES,
  VIEWPORTS,
  WCAG_AA_LARGE,
  WCAG_AA_NORMAL,
  WCAG_NON_TEXT,
  buildPalette,
  contrastMatrix,
  contrastRatio,
  fullName,
  lightnessLstar,
  parseTokenFile,
  relativeLuminance,
  resolveSizePx,
  validateBlurAndGlass,
  validateContrast,
  validateCopperTextDiscipline,
  validateExposureEnvelope,
  validateFontStacks,
  validateHue,
  validateMaterialPlanes,
  validateMotion,
  validateNoDuplicateColors,
  validateNoRawColors,
  validatePlateGeometry,
  validateReferences,
  validateRegistryCoverage,
  validateShadows,
  validateStructure,
  validateTokenFile,
  validateTypeScale,
  validateWashesAndVeils,
} from "./option2-premium.contract";

const TOKENS_CSS = readFileSync(
  fileURLToPath(new URL("./option2-premium.tokens.css", import.meta.url)),
  "utf8",
);

const parsed = parseTokenFile(TOKENS_CSS);
const palette = buildPalette(parsed);

/** Replaces one declaration's value, for the mutation tests below. */
function mutate(token: string, value: string, css = TOKENS_CSS): string {
  const pattern = new RegExp(`(${fullName(token)}\\s*:\\s*)([^;]+)(;)`);
  const next = css.replace(pattern, `$1${value}$3`);
  expect(next, `mutation of ${token} did not apply`).not.toBe(css);
  return next;
}

/** Deletes one declaration entirely. */
function remove(token: string, css = TOKENS_CSS): string {
  const pattern = new RegExp(`\\s*${fullName(token)}\\s*:\\s*[^;]+;`, "g");
  const next = css.replace(pattern, "");
  expect(next, `removal of ${token} did not apply`).not.toBe(css);
  return next;
}

describe("color science", () => {
  it("computes WCAG reference luminance and ratios", () => {
    expect(relativeLuminance("#FFFFFF")).toBeCloseTo(1, 10);
    expect(relativeLuminance("#000000")).toBeCloseTo(0, 10);
    expect(contrastRatio("#FFFFFF", "#000000")).toBeCloseTo(21, 10);
    expect(contrastRatio("#FFFFFF", "#FFFFFF")).toBeCloseTo(1, 10);
    // Reference pair from the WCAG technique examples.
    expect(contrastRatio("#767676", "#FFFFFF")).toBeGreaterThanOrEqual(4.5);
  });

  it("computes CIE L* against reference anchors", () => {
    expect(lightnessLstar("#FFFFFF")).toBeCloseTo(100, 4);
    expect(lightnessLstar("#000000")).toBeCloseTo(0, 4);
    expect(lightnessLstar("#777777")).toBeGreaterThan(48);
    expect(lightnessLstar("#777777")).toBeLessThan(52);
  });

  it("rejects any hex form other than uppercase six-digit sRGB", () => {
    for (const bad of ["#fff", "#ffffff", "#F4EDE", "rgb(1,2,3)", "white"]) {
      expect(() => relativeLuminance(bad)).toThrow();
    }
  });

  it("resolves clamp() the way a browser would", () => {
    expect(resolveSizePx("1rem", 1440)).toBe(16);
    expect(resolveSizePx("clamp(1rem, 0rem + 10vw, 4rem)", 390)).toBe(39);
    // Below the minimum, the floor wins.
    expect(resolveSizePx("clamp(1rem, 0rem + 1vw, 4rem)", 390)).toBe(16);
    // Above the maximum, the ceiling wins.
    expect(resolveSizePx("clamp(1rem, 0rem + 50vw, 4rem)", 1440)).toBe(64);
  });
});

describe("stylesheet structure", () => {
  it("parses a base scope and a reduced-motion block", () => {
    expect(parsed.base.size).toBeGreaterThan(0);
    expect(parsed.reduced.size).toBeGreaterThan(0);
    expect(TOKENS_CSS).toContain(OPTION2_PREMIUM_SCOPE);
  });

  it("stays opt-in and self-contained", () => {
    expect(validateStructure(parsed)).toEqual([]);
  });

  it("declares exactly the registered token set", () => {
    expect(validateRegistryCoverage(parsed)).toEqual([]);
    expect(parsed.base.size).toBe(TOKEN_REGISTRY.size);
  });

  it("resolves every var() reference to a registered token", () => {
    expect(validateReferences(parsed)).toEqual([]);
  });
});

describe("semantic color discipline", () => {
  it("confines color literals to registered color tokens", () => {
    expect(validateNoRawColors(parsed)).toEqual([]);
  });

  it("assigns every color token a distinct value", () => {
    expect(validateNoDuplicateColors(palette)).toEqual([]);
  });

  it("holds each family to its hue rule", () => {
    expect(validateHue(palette)).toEqual([]);
  });
});

describe("physical light model", () => {
  it("keeps every color inside the declared exposure envelope", () => {
    expect(validateExposureEnvelope(parsed, palette)).toEqual([]);
  });

  it("clips no highlight to white and crushes no shadow to black", () => {
    for (const [token, value] of palette) {
      expect(value, `${token} is pure white`).not.toBe("#FFFFFF");
      expect(value, `${token} is pure black`).not.toBe("#000000");
    }
  });

  it("separates material planes by lightness step", () => {
    expect(validateMaterialPlanes(palette)).toEqual([]);
  });

  it("casts every elevation along one light direction", () => {
    expect(validateShadows(parsed)).toEqual([]);
  });

  it("bounds blur and declares no glass", () => {
    expect(validateBlurAndGlass(parsed)).toEqual([]);
    expect(TOKENS_CSS).not.toMatch(/backdrop-filter/i);
  });

  it("keeps veils below the ceiling and washes opaque", () => {
    expect(validateWashesAndVeils(parsed)).toEqual([]);
  });
});

describe("Hero contrast matrix", () => {
  const matrix = contrastMatrix(parsed, palette);

  it("covers every declared Hero pair", () => {
    expect(matrix).toHaveLength(
      HERO_TEXT_PAIRS.length + HERO_NON_TEXT_PAIRS.length,
    );
  });

  it("meets WCAG AA on every intended text pair", () => {
    expect(validateContrast(parsed, palette)).toEqual([]);
  });

  it.each(matrix.map((row) => [row.id, row] as const))(
    "%s clears its threshold",
    (_id, row) => {
      expect(row.ratio).toBeGreaterThanOrEqual(row.required);
    },
  );

  it("derives thresholds from resolved type size, not assertion", () => {
    const title = matrix.find((row) => row.id === "hero.title");
    const highlight = matrix.find((row) => row.id === "hero.highlight");
    expect(title?.required).toBe(WCAG_AA_LARGE);
    expect(highlight?.required).toBe(WCAG_AA_NORMAL);
    for (const row of matrix.filter((entry) => entry.kind === "non-text")) {
      expect(row.required).toBe(WCAG_NON_TEXT);
    }
  });

  it("exempts only pairs that are declared decorative", () => {
    const enforced = new Set(
      [...HERO_TEXT_PAIRS, ...HERO_NON_TEXT_PAIRS].map((pair) => pair.id),
    );
    for (const pair of DECORATIVE_PAIRS) {
      expect(enforced.has(pair.id)).toBe(false);
      expect(pair.purpose).toContain("carries no information");
    }
  });
});

describe("typography", () => {
  it("adds no font the repository does not already load", () => {
    expect(validateFontStacks(parsed)).toEqual([]);
  });

  it("stays legible and non-inverting across all three viewports", () => {
    expect(validateTypeScale(parsed)).toEqual([]);
  });

  it.each(VIEWPORTS.map((viewport) => [viewport.id, viewport.width] as const))(
    "resolves the whole scale at %s",
    (_id, width) => {
      for (const role of Object.values(TYPE_ROLES)) {
        const value = parsed.base.get(fullName(role.sizeToken));
        expect(value).toBeDefined();
        const px = resolveSizePx(value ?? "", width);
        expect(Number.isNaN(px)).toBe(false);
        expect(px).toBeGreaterThanOrEqual(12);
        expect(px).toBeLessThanOrEqual(96);
      }
    },
  );

  it("keeps copper out of running text", () => {
    expect(validateCopperTextDiscipline()).toEqual([]);
    for (const pair of HERO_TEXT_PAIRS) {
      expect(COPPER_TEXT_FORBIDDEN).not.toContain(pair.foreground);
    }
  });
});

describe("motion", () => {
  it("substitutes every motion token under reduced motion", () => {
    expect(validateMotion(parsed)).toEqual([]);
  });

  it("declares a substitution for each motion token", () => {
    expect(MOTION_TOKENS.length).toBeGreaterThan(0);
    for (const token of MOTION_TOKENS) {
      expect(parsed.base.has(fullName(token)), `${token} base`).toBe(true);
      expect(parsed.reduced.has(fullName(token)), `${token} reduced`).toBe(true);
    }
  });

  it("leaves opacity as the surviving reveal channel", () => {
    expect(parsed.reduced.get(fullName("motion-reveal-shift"))).toBe("0px");
    expect(parsed.reduced.get(fullName("motion-parallax-depth"))).toBe("0px");
    expect(parsed.reduced.get(fullName("motion-lift"))).toBe("0px");
    expect(parsed.reduced.get(fullName("motion-reveal-fade"))).toBe("1");
  });
});

describe("geometry and anti-patterns", () => {
  it("keeps the drawing plate off a square aspect", () => {
    expect(validatePlateGeometry(parsed)).toEqual([]);
  });

  it("declares which anti-patterns are mechanical and which are review", () => {
    const mechanical = ANTI_PATTERNS.filter(
      (entry) => entry.enforcement === "mechanical",
    );
    const review = ANTI_PATTERNS.filter(
      (entry) => entry.enforcement === "review",
    );
    expect(mechanical.length).toBeGreaterThanOrEqual(9);
    expect(review.length).toBeGreaterThan(0);
    expect(new Set(ANTI_PATTERNS.map((entry) => entry.id)).size).toBe(
      ANTI_PATTERNS.length,
    );
  });
});

describe("the committed stylesheet satisfies the whole contract", () => {
  it("reports no violations", () => {
    const report = validateTokenFile(TOKENS_CSS);
    expect(report.violations).toEqual([]);
    expect(report.palette.size).toBeGreaterThan(30);
    expect(OPTION2_PREMIUM_CONTRACT_VERSION).toMatch(
      /^option2-premium-contract\/\d+\.\d+\.\d+$/,
    );
  });
});

/*
 * Mutation tests.
 *
 * A contract that only ever sees a passing file proves nothing. Each case
 * below breaks the stylesheet in a specific way the packet names, and asserts
 * the contract rejects it. If a rule is ever weakened, one of these goes green
 * where it should be red, and the suite fails.
 */
describe("the contract fails closed", () => {
  it("rejects a text pair that drops below WCAG AA", () => {
    // Lift body ink toward the paper until the lede pair falls under 4.5:1.
    const broken = mutate("ink-body", "#9AA79F");
    const report = validateTokenFile(broken);
    expect(report.violations.join("\n")).toMatch(/hero\.lede reaches only/);
  });

  it("rejects a non-text pair that drops below 3:1", () => {
    const broken = mutate("line-standard", "#C9BFAE");
    const report = validateTokenFile(broken);
    expect(report.violations.join("\n")).toMatch(/hero\.rule\.standard/);
  });

  it("rejects a raw hex color outside a color token", () => {
    const broken = mutate(
      "shadow-panel",
      "3px 5px 8px #2A211A, 6px 14px 28px #2A211A",
    );
    const report = validateTokenFile(broken);
    expect(report.violations.join("\n")).toMatch(/contains a raw hex color/);
  });

  it("rejects a raw color function outside a color token", () => {
    const broken = mutate(
      "shadow-contact",
      "1px 2px 2px rgba(0, 0, 0, 0.2), 0 1px 1px rgba(0, 0, 0, 0.1)",
    );
    const report = validateTokenFile(broken);
    expect(report.violations.join("\n")).toMatch(/raw color function/);
  });

  it("rejects a named CSS color smuggled in as a keyword", () => {
    const broken = mutate("wash-table", "linear-gradient(180deg, white, black)");
    const report = validateTokenFile(broken);
    expect(report.violations.join("\n")).toMatch(
      /names "white", which is neither a permitted keyword/,
    );
  });

  it("rejects a color token written in a non-exact form", () => {
    const broken = mutate("paper-base", "#ebe2d3");
    const report = validateTokenFile(broken);
    expect(report.violations.join("\n")).toMatch(
      /must be one uppercase six-digit sRGB hex value/,
    );
  });

  it("rejects an unregistered token", () => {
    const broken = TOKENS_CSS.replace(
      "--o2-paper-lit:",
      "--o2-paper-smuggled: #F4EDE1;\n  --o2-paper-lit:",
    );
    const report = validateTokenFile(broken);
    expect(report.violations.join("\n")).toMatch(
      /--o2-paper-smuggled is declared but not registered/,
    );
  });

  it("rejects a missing reduced-motion substitution", () => {
    const index = TOKENS_CSS.lastIndexOf("--o2-motion-parallax-depth: 0px;");
    expect(index).toBeGreaterThan(-1);
    const broken =
      TOKENS_CSS.slice(0, index) +
      TOKENS_CSS.slice(index + "--o2-motion-parallax-depth: 0px;".length);
    const report = validateTokenFile(broken);
    expect(report.violations.join("\n")).toMatch(
      /--o2-motion-parallax-depth has no reduced-motion substitution/,
    );
  });

  it("rejects a reduced-motion substitution that still moves", () => {
    const broken = TOKENS_CSS.replace(
      "--o2-motion-reveal-shift: 0px;",
      "--o2-motion-reveal-shift: 6px;",
    );
    const report = validateTokenFile(broken);
    expect(report.violations.join("\n")).toMatch(/still moves 6px/);
  });

  it("rejects a missing motion token", () => {
    const report = validateTokenFile(remove("duration-standard"));
    expect(report.violations.join("\n")).toMatch(
      /--o2-duration-standard is registered but not declared/,
    );
  });

  it("rejects a single-layer drop shadow", () => {
    const broken = mutate(
      "shadow-panel",
      "0 4px 12px color-mix(in srgb, var(--o2-shadow-cast) 18%, transparent)",
    );
    const report = validateTokenFile(broken);
    expect(report.violations.join("\n")).toMatch(/layer\(s\); at least/);
  });

  it("rejects a shadow that contradicts the light direction", () => {
    const broken = mutate(
      "shadow-sheet",
      "-6px 3px 4px color-mix(in srgb, var(--o2-shadow-cast) 20%, transparent), " +
        "4px 8px 16px color-mix(in srgb, var(--o2-shadow-cast) 12%, transparent)",
    );
    const report = validateTokenFile(broken);
    expect(report.violations.join("\n")).toMatch(/casts against the light/);
  });

  it("rejects a shadow denser than the ceiling", () => {
    const broken = mutate(
      "shadow-lifted",
      "4px 7px 12px color-mix(in srgb, var(--o2-shadow-cast) 64%, transparent), " +
        "10px 22px 44px color-mix(in srgb, var(--o2-shadow-cast) 14%, transparent)",
    );
    const report = validateTokenFile(broken);
    expect(report.violations.join("\n")).toMatch(
      new RegExp(`above the ${LIGHT_MODEL.shadowDensityCeilingPct}% ceiling`),
    );
  });

  it("rejects blur beyond the ceiling", () => {
    const report = validateTokenFile(mutate("blur-edge", "18px"));
    expect(report.violations.join("\n")).toMatch(/above the 6px ceiling/);
  });

  it("rejects a veil that would obscure the drawing", () => {
    const broken = mutate(
      "veil-plate-edge",
      "linear-gradient(var(--o2-light-azimuth), " +
        "color-mix(in srgb, var(--o2-shadow-cast) 0%, transparent) 62%, " +
        "color-mix(in srgb, var(--o2-shadow-cast) 78%, transparent) 100%)",
    );
    const report = validateTokenFile(broken);
    expect(report.violations.join("\n")).toMatch(/above the 32% veil ceiling/);
  });

  it("rejects a square photo plate", () => {
    const report = validateTokenFile(mutate("plate-aspect-desktop", "1 / 1"));
    expect(report.violations.join("\n")).toMatch(/square photo card/);
  });

  it("rejects a new font dependency", () => {
    const broken = mutate(
      "font-editorial",
      'var(--font-source-serif, "Source Serif 4"), "Playfair Display", serif',
    );
    const report = validateTokenFile(broken);
    expect(report.violations.join("\n")).toMatch(
      /"Playfair Display", which the repository does not already load/,
    );
  });

  it("rejects paper that loses its warm balance", () => {
    const report = validateTokenFile(mutate("paper-base", "#D3E2EB"));
    expect(report.violations.join("\n")).toMatch(/is not warm/);
  });

  it("rejects graphite that drifts into a hue", () => {
    const report = validateTokenFile(mutate("graphite-secondary", "#2F6BA8"));
    expect(report.violations.join("\n")).toMatch(/too saturated for graphite/);
  });

  it("rejects copper that is no longer copper", () => {
    const report = validateTokenFile(mutate("copper-line", "#2F7FA9"));
    expect(report.violations.join("\n")).toMatch(/is not copper/);
  });

  it("rejects a blown highlight and a crushed shadow", () => {
    expect(validateTokenFile(mutate("surface-raised", "#FFFFFF")).violations.join("\n")).toMatch(
      /is blown at L\*/,
    );
    expect(validateTokenFile(mutate("ink-primary", "#000000")).violations.join("\n")).toMatch(
      /is crushed at L\*/,
    );
  });

  it("rejects a sheet that no longer lifts off the workbench", () => {
    const report = validateTokenFile(mutate("canvas-base", "#E9E1D4"));
    expect(report.violations.join("\n")).toMatch(
      /Material plane sheet-on-table separates by only/,
    );
  });

  it("rejects two tokens sharing one value", () => {
    const report = validateTokenFile(mutate("paper-lit", "#EBE2D3"));
    expect(report.violations.join("\n")).toMatch(/duplicates/);
  });

  it("rejects body type below the legibility floor", () => {
    const broken = mutate("type-body", "clamp(0.6rem, 0.5rem + 0.2vw, 0.75rem)");
    const report = validateTokenFile(broken);
    expect(report.violations.join("\n")).toMatch(/below the 16px floor/);
  });

  it("rejects a scale that inverts as the viewport narrows", () => {
    // The ceiling has to stay clear of the resolved sizes, or the clamp
    // flattens the inversion and the mutation proves nothing.
    const broken = mutate("type-lede", "clamp(1rem, 3rem + -0.1vw, 4rem)");
    const report = validateTokenFile(broken);
    expect(report.violations.join("\n")).toMatch(
      /grows as the viewport narrows/,
    );
  });

  it("rejects leaking the tokens onto :root", () => {
    const broken = TOKENS_CSS.replace("[data-o2-premium] {", ":root {");
    const report = validateTokenFile(broken);
    expect(report.violations.join("\n")).toMatch(/writes to :root/);
  });

  it("rejects a glass effect", () => {
    const broken = TOKENS_CSS.replace(
      "--o2-blur-veil: 2px;",
      "--o2-blur-veil: 2px;\n  backdrop-filter: blur(20px);",
    );
    const report = validateTokenFile(broken);
    expect(report.violations.join("\n")).toMatch(/no glass/);
  });
});
