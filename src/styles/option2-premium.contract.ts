/**
 * Option 2 — premium light, color, and typography contract.
 *
 * Record chapter of the Option 2 visual system (Issue #229).
 *
 * This module holds the *rules*. `option2-premium.tokens.css` holds the
 * *values*. Nothing here restates a color, size, or duration that the CSS
 * already declares: every validator below is fed the parsed stylesheet, so a
 * value can never drift from the rule that governs it. Editing the CSS without
 * satisfying these rules fails `option2-premium.contract.test.ts`.
 *
 * The module is deliberately free of Node APIs so it stays importable from any
 * environment; the test performs the file read and hands the text in.
 */

export const OPTION2_PREMIUM_CONTRACT_VERSION =
  "option2-premium-contract/1.0.0" as const;

/** Attribute a consumer sets to opt a subtree into the recipe. */
export const OPTION2_PREMIUM_SCOPE = "[data-o2-premium]" as const;

/** Every token in the file lives under this prefix. */
export const TOKEN_PREFIX = "--o2-" as const;

/* ------------------------------------------------------------------------ *
 * Color science — WCAG 2.1 relative luminance and CIE L*.
 * ------------------------------------------------------------------------ */

export type Rgb = readonly [number, number, number];

const HEX_PATTERN = /^#[0-9A-F]{6}$/;

/** Parses the one hex form this contract permits: uppercase, six digits. */
export function parseHex(hex: string): Rgb {
  if (!HEX_PATTERN.test(hex)) {
    throw new Error(
      `Expected an uppercase six-digit sRGB hex value, received "${hex}".`,
    );
  }
  return [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16),
  ] as const;
}

function toLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** WCAG 2.1 relative luminance. */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = parseHex(hex);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** WCAG 2.1 contrast ratio, always >= 1. */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort(
    (x, y) => y - x,
  );
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * CIE L* lightness. Used for the exposure envelope and for material plane
 * separation, where a WCAG ratio is the wrong instrument: two adjacent
 * physical surfaces are told apart by lightness step and cast shadow, not by
 * the 3:1 threshold that governs meaningful graphics.
 */
export function lightnessLstar(hex: string): number {
  const y = relativeLuminance(hex);
  return y > 0.008856 ? 116 * Math.cbrt(y) - 16 : 903.3 * y;
}

/** Rounds to two decimals for stable reporting. */
export const round2 = (n: number): number => Math.round(n * 100) / 100;

/* ------------------------------------------------------------------------ *
 * Token registry — the closed set of names the stylesheet may declare.
 * ------------------------------------------------------------------------ */

export type TokenKind =
  | "color"
  | "shadow"
  | "gradient-wash"
  | "gradient-veil"
  | "font-stack"
  | "type-size"
  | "duration"
  | "easing"
  | "distance"
  | "length"
  | "number"
  | "aspect"
  | "angle";

export type TokenFamily =
  | "light"
  | "paper"
  | "canvas"
  | "surface"
  | "ink"
  | "graphite"
  | "copper"
  | "line"
  | "focus"
  | "signal"
  | "shadow"
  | "blur"
  | "wash"
  | "stroke"
  | "radius"
  | "plate"
  | "type"
  | "space"
  | "layout"
  | "motion";

export interface TokenSpec {
  readonly family: TokenFamily;
  readonly kind: TokenKind;
}

function group(
  family: TokenFamily,
  kind: TokenKind,
  names: readonly string[],
): readonly (readonly [string, TokenSpec])[] {
  return names.map((name) => [name, { family, kind }] as const);
}

export const TOKEN_REGISTRY: ReadonlyMap<string, TokenSpec> = new Map([
  ...group("light", "angle", ["light-azimuth", "light-elevation"]),
  ...group("light", "number", [
    "light-temperature",
    "light-offset-ratio",
    "exposure-shadow-floor",
    "exposure-highlight-ceiling",
    "roughness-paper",
    "roughness-graphite",
    "roughness-copper",
    "specular-max",
    "grain-opacity",
  ]),
  ...group("light", "length", ["grain-scale"]),

  ...group("paper", "color", [
    "paper-lit",
    "paper-base",
    "paper-shade",
    "paper-edge",
  ]),
  ...group("canvas", "color", [
    "canvas-base",
    "canvas-deep",
    "canvas-deep-lit",
  ]),
  ...group("surface", "color", [
    "surface-raised",
    "surface-recessed",
    "surface-inverse",
  ]),
  ...group("ink", "color", [
    "ink-primary",
    "ink-secondary",
    "ink-body",
    "ink-muted",
    "ink-inverse",
    "ink-inverse-muted",
  ]),
  ...group("graphite", "color", [
    "graphite-primary",
    "graphite-secondary",
    "graphite-tertiary",
    "graphite-annotation",
  ]),
  ...group("copper", "color", [
    "copper-text",
    "copper-mark",
    "copper-line",
    "copper-wash",
  ]),
  ...group("line", "color", [
    "line-grid",
    "line-hairline",
    "line-standard",
    "line-strong",
  ]),
  ...group("focus", "color", [
    "focus-ring",
    "focus-ring-inverse",
    "focus-halo",
  ]),
  ...group("focus", "length", ["focus-width", "focus-offset"]),
  ...group("signal", "color", [
    "signal-success",
    "signal-success-wash",
    "signal-success-inverse",
  ]),

  ...group("shadow", "color", ["shadow-cast"]),
  ...group("shadow", "shadow", [
    "shadow-contact",
    "shadow-sheet",
    "shadow-panel",
    "shadow-lifted",
    "shadow-trough",
  ]),

  ...group("blur", "length", ["blur-veil", "blur-edge", "blur-max"]),

  ...group("wash", "number", ["veil-opacity-max"]),
  ...group("wash", "gradient-wash", [
    "wash-daylight",
    "wash-table",
    "wash-record",
  ]),
  ...group("wash", "gradient-veil", ["veil-plate-edge"]),

  ...group("stroke", "length", [
    "stroke-hairline",
    "stroke-thin",
    "stroke-medium",
    "stroke-heavy",
    "stroke-section",
  ]),
  ...group("radius", "length", [
    "radius-sheet",
    "radius-panel",
    "radius-plate",
    "radius-marker",
  ]),
  ...group("plate", "aspect", [
    "plate-aspect-desktop",
    "plate-aspect-tablet",
    "plate-aspect-mobile",
  ]),

  ...group("type", "font-stack", [
    "font-editorial",
    "font-interface",
    "font-annotation",
  ]),
  ...group("type", "type-size", [
    "type-display",
    "type-headline",
    "type-title",
    "type-lede",
    "type-body",
    "type-body-sm",
    "type-label",
    "type-annotation",
  ]),
  ...group("type", "number", [
    "leading-display",
    "leading-headline",
    "leading-title",
    "leading-lede",
    "leading-body",
    "leading-annotation",
    "weight-regular",
    "weight-medium",
    "weight-semibold",
    "weight-bold",
  ]),
  ...group("type", "length", [
    "tracking-display",
    "tracking-headline",
    "tracking-title",
    "tracking-body",
    "tracking-label",
    "tracking-annotation",
    "measure-display",
    "measure-lede",
    "measure-body",
  ]),

  ...group("space", "length", [
    "space-hairline",
    "space-1",
    "space-2",
    "space-3",
    "space-4",
    "space-5",
    "space-6",
    "space-7",
    "space-8",
    "space-9",
  ]),
  ...group("layout", "type-size", [
    "space-hero-block",
    "gutter",
    "column-gap",
  ]),
  ...group("layout", "length", ["shell-max", "grid-module"]),

  ...group("motion", "duration", [
    "duration-instant",
    "duration-fast",
    "duration-standard",
    "duration-deliberate",
    "motion-daylight-sweep",
  ]),
  ...group("motion", "easing", [
    "easing-standard",
    "easing-entrance",
    "easing-exit",
  ]),
  ...group("motion", "distance", [
    "motion-lift",
    "motion-reveal-shift",
    "motion-parallax-depth",
  ]),
  ...group("motion", "number", ["motion-reveal-fade"]),
]);

/** Motion tokens that must also appear in the reduced-motion block. */
export const MOTION_TOKENS: readonly string[] = Object.freeze(
  [...TOKEN_REGISTRY.entries()]
    .filter(([, spec]) => spec.family === "motion")
    .map(([name]) => name),
);

/* ------------------------------------------------------------------------ *
 * Physical light model.
 * ------------------------------------------------------------------------ */

export const LIGHT_MODEL = Object.freeze({
  /** Screen-space direction the light travels: upper-left window to lower-right. */
  azimuthDeg: 135,
  elevationDeg: 35,
  /** Correlated color temperature of the modelled daylight. */
  temperatureK: 5200,
  /**
   * Horizontal:vertical ratio of a cast shadow at the elevation above. Every
   * elevation's first shadow layer must obey it within tolerance.
   */
  shadowOffsetRatio: 0.7,
  shadowOffsetTolerance: 0.35,
  /** Peak density any single shadow layer may reach, in percent. */
  shadowDensityCeilingPct: 30,
  /** Minimum layers per elevation. One layer is the cheap-drop-shadow tell. */
  shadowMinLayers: 2,
} as const);

/**
 * Hue discipline per family, expressed as channel-order rules. These are what
 * make "warm architectural paper", "forest ink", "neutral graphite", and
 * "oxidized copper" mechanical rather than descriptive.
 */
export type HueRule = "warm" | "forest" | "neutral" | "copper" | "unconstrained";

export const FAMILY_HUE_RULES: Readonly<Record<TokenFamily, HueRule>> =
  Object.freeze({
    light: "unconstrained",
    paper: "warm",
    canvas: "unconstrained",
    surface: "unconstrained",
    ink: "unconstrained",
    graphite: "neutral",
    copper: "copper",
    line: "warm",
    focus: "unconstrained",
    signal: "unconstrained",
    shadow: "warm",
    blur: "unconstrained",
    wash: "unconstrained",
    stroke: "unconstrained",
    radius: "unconstrained",
    plate: "unconstrained",
    type: "unconstrained",
    space: "unconstrained",
    layout: "unconstrained",
    motion: "unconstrained",
  });

/** Per-token overrides where the family rule is not the right instrument. */
export const TOKEN_HUE_RULES: Readonly<Record<string, HueRule>> = Object.freeze({
  "canvas-base": "warm",
  "canvas-deep": "forest",
  "canvas-deep-lit": "forest",
  "surface-raised": "warm",
  "surface-recessed": "warm",
  "surface-inverse": "forest",
  "ink-primary": "forest",
  "ink-secondary": "forest",
  "ink-body": "forest",
  "ink-muted": "forest",
  "ink-inverse": "warm",
  // Cool by intent: the focus ring and the success signal must sit off the
  // warm axis so neither can be mistaken for decoration.
  "focus-ring": "unconstrained",
  "focus-ring-inverse": "unconstrained",
  "focus-halo": "warm",
});

/** Maximum channel spread permitted for a token under the "neutral" rule. */
export const NEUTRAL_MAX_CHANNEL_SPREAD = 24;

/**
 * Material plane separation, in CIE L*. Physical reads, not WCAG pairs: the
 * sheet is told from the workbench by lightness step plus contact shadow.
 */
export const MATERIAL_PLANES = Object.freeze([
  { id: "sheet-on-table", near: "paper-base", far: "canvas-base", minDeltaL: 6 },
  { id: "sheet-cut-edge", near: "paper-edge", far: "canvas-base", minDeltaL: 3 },
  { id: "sheet-exposure-falloff", near: "paper-lit", far: "paper-shade", minDeltaL: 5 },
  { id: "panel-above-sheet", near: "surface-raised", far: "paper-base", minDeltaL: 3 },
  { id: "trough-in-sheet", near: "paper-base", far: "surface-recessed", minDeltaL: 1.5 },
] as const);

/* ------------------------------------------------------------------------ *
 * Typography roles and viewports.
 * ------------------------------------------------------------------------ */

export type TypeWeight = "regular" | "medium" | "semibold" | "bold";

export interface TypeRoleSpec {
  /** Token supplying the size. */
  readonly sizeToken: string;
  readonly weight: TypeWeight;
  readonly leadingToken: string;
}

export const TYPE_ROLES: Readonly<Record<string, TypeRoleSpec>> = Object.freeze({
  display: { sizeToken: "type-display", weight: "bold", leadingToken: "leading-display" },
  headline: { sizeToken: "type-headline", weight: "bold", leadingToken: "leading-headline" },
  title: { sizeToken: "type-title", weight: "bold", leadingToken: "leading-title" },
  lede: { sizeToken: "type-lede", weight: "regular", leadingToken: "leading-lede" },
  body: { sizeToken: "type-body", weight: "regular", leadingToken: "leading-body" },
  bodySm: { sizeToken: "type-body-sm", weight: "regular", leadingToken: "leading-body" },
  label: { sizeToken: "type-label", weight: "bold", leadingToken: "leading-annotation" },
  annotation: { sizeToken: "type-annotation", weight: "regular", leadingToken: "leading-annotation" },
});

/** The three verification viewports named in the packet. */
export const VIEWPORTS = Object.freeze([
  { id: "desktop", width: 1440, height: 900 },
  { id: "tablet", width: 820, height: 1180 },
  { id: "mobile", width: 390, height: 844 },
] as const);

export type ViewportId = (typeof VIEWPORTS)[number]["id"];

/** Root font size the clamp resolutions assume. */
export const ROOT_FONT_PX = 16;

/** Floors that hold at every viewport. */
export const TYPE_FLOORS = Object.freeze({
  bodyMinPx: 16,
  labelMinPx: 12,
  annotationMinPx: 12,
});

/* ------------------------------------------------------------------------ *
 * WCAG thresholds.
 * ------------------------------------------------------------------------ */

export const WCAG_AA_NORMAL = 4.5;
export const WCAG_AA_LARGE = 3;
export const WCAG_NON_TEXT = 3;

/** WCAG 2.1 large-text thresholds, in CSS px. */
export const LARGE_TEXT_PX = 24;
export const LARGE_TEXT_BOLD_PX = 18.66;

export function isLargeText(sizePx: number, weight: TypeWeight): boolean {
  const bold = weight === "bold" || weight === "semibold";
  return bold ? sizePx >= LARGE_TEXT_BOLD_PX : sizePx >= LARGE_TEXT_PX;
}

/* ------------------------------------------------------------------------ *
 * Hero pairs. Every text and meaningful non-text pair the Option 2 Hero puts
 * on screen, including the control panel it renders and the drafting-table
 * drawing layer.
 * ------------------------------------------------------------------------ */

export interface TextPair {
  readonly id: string;
  readonly foreground: string;
  readonly background: string;
  /** Key of TYPE_ROLES; determines whether AA large or AA normal applies. */
  readonly role: keyof typeof TYPE_ROLES;
  readonly weight: TypeWeight;
}

export const HERO_TEXT_PAIRS: readonly TextPair[] = Object.freeze([
  { id: "hero.eyebrow", foreground: "copper-text", background: "paper-base", role: "label", weight: "bold" },
  { id: "hero.title", foreground: "ink-primary", background: "paper-base", role: "display", weight: "bold" },
  { id: "hero.lede", foreground: "ink-body", background: "paper-base", role: "lede", weight: "regular" },
  { id: "hero.highlight", foreground: "ink-muted", background: "paper-base", role: "bodySm", weight: "regular" },
  { id: "hero.badge.label", foreground: "copper-text", background: "copper-wash", role: "label", weight: "bold" },
  { id: "hero.cta.primary.label", foreground: "ink-inverse", background: "canvas-deep", role: "bodySm", weight: "bold" },
  { id: "hero.cta.secondary.label", foreground: "ink-secondary", background: "surface-raised", role: "bodySm", weight: "bold" },
  { id: "hero.panel.label", foreground: "graphite-annotation", background: "paper-lit", role: "label", weight: "bold" },
  { id: "hero.panel.title", foreground: "ink-primary", background: "surface-raised", role: "title", weight: "bold" },
  { id: "hero.panel.item.label", foreground: "ink-secondary", background: "surface-recessed", role: "bodySm", weight: "bold" },
  { id: "hero.panel.item.detail", foreground: "ink-muted", background: "surface-recessed", role: "bodySm", weight: "regular" },
  { id: "hero.panel.status.ready", foreground: "signal-success", background: "signal-success-wash", role: "label", weight: "bold" },
  { id: "hero.panel.notice", foreground: "copper-text", background: "copper-wash", role: "bodySm", weight: "regular" },
  { id: "hero.drawing.annotation", foreground: "graphite-annotation", background: "paper-shade", role: "annotation", weight: "regular" },
  { id: "hero.drawing.dimension", foreground: "graphite-secondary", background: "paper-lit", role: "annotation", weight: "regular" },
  { id: "hero.record.body", foreground: "ink-inverse-muted", background: "canvas-deep", role: "body", weight: "regular" },
  { id: "hero.record.signal", foreground: "signal-success-inverse", background: "canvas-deep", role: "label", weight: "bold" },
]);

export interface NonTextPair {
  readonly id: string;
  readonly foreground: string;
  readonly background: string;
  /** What the pair identifies; documented so a reviewer can judge the rule. */
  readonly purpose: string;
}

export const HERO_NON_TEXT_PAIRS: readonly NonTextPair[] = Object.freeze([
  { id: "hero.rule.standard", foreground: "line-standard", background: "paper-base", purpose: "section boundary" },
  { id: "hero.rule.standard.onPanel", foreground: "line-standard", background: "surface-recessed", purpose: "panel boundary" },
  { id: "hero.rule.standard.onShade", foreground: "line-standard", background: "paper-shade", purpose: "boundary on the shaded sheet" },
  { id: "hero.rule.strong", foreground: "line-strong", background: "paper-base", purpose: "divider" },
  { id: "hero.copper.hairline", foreground: "copper-line", background: "paper-base", purpose: "accent hairline" },
  { id: "hero.copper.mark", foreground: "copper-mark", background: "paper-base", purpose: "marker and underline" },
  { id: "hero.badge.border", foreground: "copper-line", background: "copper-wash", purpose: "badge boundary" },
  { id: "hero.drawing.line.primary", foreground: "graphite-primary", background: "paper-lit", purpose: "primary drawing line" },
  { id: "hero.drawing.line.secondary", foreground: "graphite-secondary", background: "paper-lit", purpose: "secondary drawing line" },
  { id: "hero.drawing.line.construction", foreground: "graphite-tertiary", background: "paper-lit", purpose: "construction line" },
  { id: "hero.cta.secondary.border", foreground: "line-strong", background: "surface-raised", purpose: "button boundary" },
  { id: "hero.focus.ring", foreground: "focus-ring", background: "paper-base", purpose: "focus indicator on paper" },
  { id: "hero.focus.ring.onRaised", foreground: "focus-ring", background: "surface-raised", purpose: "focus indicator on a panel" },
  { id: "hero.focus.ring.inverse", foreground: "focus-ring-inverse", background: "canvas-deep", purpose: "focus indicator on the Record ground" },
]);

/**
 * Decorative pairs, exempt from 1.4.11 by intent. Listing them is the point:
 * an exemption a reviewer cannot see is an exemption nobody agreed to.
 */
export const DECORATIVE_PAIRS: readonly NonTextPair[] = Object.freeze([
  { id: "hero.grid.ruling", foreground: "line-grid", background: "paper-base", purpose: "blueprint grid ruling; carries no information" },
  { id: "hero.hairline.ruling", foreground: "line-hairline", background: "paper-base", purpose: "sheet ruling; carries no information" },
]);

/**
 * Copper steps that may never carry running text. `copper-text` is absent
 * because it is the one cleared step, and only for eyebrows and labels.
 */
export const COPPER_TEXT_FORBIDDEN: readonly string[] = Object.freeze([
  "copper-line",
  "copper-mark",
  "copper-wash",
]);

/** Roles `copper-text` is cleared for. Body and lede are not among them. */
export const COPPER_TEXT_PERMITTED_ROLES: readonly string[] = Object.freeze([
  "label",
  "bodySm",
]);

/* ------------------------------------------------------------------------ *
 * Anti-patterns. `mechanical` entries are proved by the test suite;
 * `review` entries are the reviewer's, and are declared so the boundary
 * between the two is explicit rather than implied.
 * ------------------------------------------------------------------------ */

export interface AntiPattern {
  readonly id: string;
  readonly rule: string;
  readonly enforcement: "mechanical" | "review";
}

export const ANTI_PATTERNS: readonly AntiPattern[] = Object.freeze([
  { id: "pale-on-pale", rule: "No intended text pair below its WCAG AA threshold, and the sheet must sit at least 6 L* above the workbench.", enforcement: "mechanical" },
  { id: "square-photo-card", rule: "No plate aspect is 1:1 or near it; the drawing region bleeds off the column rather than floating as a card.", enforcement: "mechanical" },
  { id: "cheap-drop-shadow", rule: "Every elevation is multi-layer, offset along the one light direction, capped in density, and cast in warm pigment rather than black.", enforcement: "mechanical" },
  { id: "glass", rule: "No backdrop filter token exists.", enforcement: "mechanical" },
  { id: "excessive-blur", rule: "No blur exceeds the declared ceiling.", enforcement: "mechanical" },
  { id: "obscuring-gradient", rule: "Washes are opaque material; veils are capped below the declared maximum so a drawing stays readable through one.", enforcement: "mechanical" },
  { id: "orange-body-text", rule: "Only copper-text may carry type, and only at label and small-body roles.", enforcement: "mechanical" },
  { id: "raw-color", rule: "A color literal may appear only as the whole value of a registered color token.", enforcement: "mechanical" },
  { id: "new-font-dependency", rule: "Font stacks resolve only to families the repository already loads.", enforcement: "mechanical" },
  { id: "fake-technical-microcopy", rule: "Mono annotation type is reserved for values the product actually holds — dimensions, identifiers, timestamps. Invented specification strings are prohibited.", enforcement: "review" },
  { id: "decorative-drawing", rule: "The blueprint is the product mechanism on screen, not an illustration behind it.", enforcement: "review" },
]);

/* ------------------------------------------------------------------------ *
 * Stylesheet parsing.
 * ------------------------------------------------------------------------ */

export interface ParsedTokens {
  /** Declarations in the base scope block. */
  readonly base: ReadonlyMap<string, string>;
  /** Declarations inside the reduced-motion block. */
  readonly reduced: ReadonlyMap<string, string>;
  /** Comment-stripped source, for structural assertions. */
  readonly source: string;
}

const REDUCED_MOTION_AT_RULE = "@media (prefers-reduced-motion: reduce)";

function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, " ");
}

function readDeclarations(text: string): Map<string, string> {
  const declarations = new Map<string, string>();
  const pattern = /(--[a-zA-Z0-9-]+)\s*:\s*([^;{}]+);/g;
  let match = pattern.exec(text);
  while (match !== null) {
    const [, name, rawValue] = match;
    declarations.set(name, rawValue.replace(/\s+/g, " ").trim());
    match = pattern.exec(text);
  }
  return declarations;
}

/**
 * Splits the stylesheet into its base scope and its reduced-motion override.
 * The file declares exactly one of each, which the validators confirm.
 */
export function parseTokenFile(css: string): ParsedTokens {
  const source = stripComments(css);
  const atRuleStart = source.indexOf(REDUCED_MOTION_AT_RULE);

  if (atRuleStart === -1) {
    return { base: readDeclarations(source), reduced: new Map(), source };
  }

  // Walk braces from the at-rule to find its true end, so a nested block
  // cannot terminate it early.
  let depth = 0;
  let cursor = source.indexOf("{", atRuleStart);
  const bodyStart = cursor;
  while (cursor < source.length) {
    const char = source[cursor];
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) break;
    }
    cursor += 1;
  }

  const reducedBlock = source.slice(bodyStart, cursor + 1);
  const baseBlock = source.slice(0, atRuleStart) + source.slice(cursor + 1);

  return {
    base: readDeclarations(baseBlock),
    reduced: readDeclarations(reducedBlock),
    source,
  };
}

/** Strips the `--o2-` prefix. */
export const shortName = (declaration: string): string =>
  declaration.startsWith(TOKEN_PREFIX)
    ? declaration.slice(TOKEN_PREFIX.length)
    : declaration;

/** Full custom-property name for a registry key. */
export const fullName = (token: string): string => `${TOKEN_PREFIX}${token}`;

/**
 * Extracts the color palette actually declared by the stylesheet.
 *
 * Only well-formed values are admitted. A malformed color is a violation that
 * `validateNoRawColors` reports; admitting it here would instead throw out of
 * whichever downstream validator parsed it first, turning a reportable finding
 * into a crash. Tokens dropped here surface as missing-token violations.
 */
export function buildPalette(parsed: ParsedTokens): ReadonlyMap<string, string> {
  const palette = new Map<string, string>();
  for (const [declaration, value] of parsed.base) {
    const token = shortName(declaration);
    if (TOKEN_REGISTRY.get(token)?.kind === "color" && HEX_PATTERN.test(value)) {
      palette.set(token, value);
    }
  }
  return palette;
}

/* ------------------------------------------------------------------------ *
 * Value grammar.
 * ------------------------------------------------------------------------ */

/** Function and keyword identifiers a non-color token may name. */
export const PERMITTED_IDENTIFIERS: readonly string[] = Object.freeze([
  "calc", "clamp", "color-mix", "cubic-bezier", "in", "inset", "linear",
  "linear-gradient", "max", "min", "none", "radial-gradient", "srgb",
  "transparent",
]);

/** Font families the repository already loads. Nothing else may be named. */
export const PERMITTED_FONT_FAMILIES: readonly string[] = Object.freeze([
  "Source Serif 4", "Inter", "SFMono-Regular", "Consolas", "Georgia",
  "system-ui", "serif", "sans-serif", "monospace",
]);

/** Custom properties a font stack may resolve through. */
export const PERMITTED_FONT_VARIABLES: readonly string[] = Object.freeze([
  "--font-source-serif", "--font-inter", "--font-mono",
]);

const COLOR_FUNCTION_PATTERN =
  /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\s*\(/i;
const HEX_LITERAL_PATTERN = /#[0-9a-fA-F]{3,8}\b/;

/** Removes numbers with their units so unit names are not read as keywords. */
function stripNumerics(value: string): string {
  return value.replace(
    /-?\d*\.?\d+(?:px|rem|em|ch|vw|vh|vmin|vmax|deg|rad|turn|ms|s|fr|%|K)?/g,
    " ",
  );
}

/** Removes `var(--name)` and `var(--name, fallback)` references. */
function stripVarReferences(value: string): string {
  return value.replace(/var\(\s*--[a-zA-Z0-9-]+\s*(?:,[^()]*)?\)/g, " ");
}

/** Every `--name` referenced through `var()` in a value. */
export function referencedVariables(value: string): string[] {
  return [...value.matchAll(/var\(\s*(--[a-zA-Z0-9-]+)/g)].map(
    (match) => match[1],
  );
}

/** Bare identifiers left in a value once strings, vars, and numbers are gone. */
export function bareIdentifiers(value: string): string[] {
  const withoutStrings = value.replace(/"[^"]*"|'[^']*'/g, " ");
  const cleaned = stripNumerics(stripVarReferences(withoutStrings));
  return [...cleaned.matchAll(/[a-zA-Z][a-zA-Z0-9-]*/g)].map((m) => m[0]);
}

export interface ShadowLayer {
  readonly inset: boolean;
  readonly offsetX: number;
  readonly offsetY: number;
  readonly densityPct: number | null;
  readonly usesShadowPigment: boolean;
}

/** Splits a shadow value into layers at top-level commas. */
export function splitTopLevel(value: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const char of value) {
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    if (char === "," && depth === 0) {
      parts.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  if (current.trim() !== "") parts.push(current.trim());
  return parts;
}

const LENGTH_PATTERN = /^-?\d*\.?\d+px$/;

export function parseShadowLayers(value: string): ShadowLayer[] {
  return splitTopLevel(value).map((layer) => {
    const inset = /^inset\b/.test(layer);
    const body = inset ? layer.replace(/^inset\s+/, "") : layer;
    const lengths = body
      .split(/\s+/)
      .filter((part) => part === "0" || LENGTH_PATTERN.test(part))
      .map((part) => Number.parseFloat(part));
    // Scans to the layer's first percentage. A `)`-bounded scan would stop at
    // the closing paren of `var(--o2-shadow-cast)` and never reach the density.
    const density = /color-mix\([^%]*?(\d*\.?\d+)%/.exec(body);
    return {
      inset,
      offsetX: lengths[0] ?? Number.NaN,
      offsetY: lengths[1] ?? Number.NaN,
      densityPct: density ? Number.parseFloat(density[1]) : null,
      usesShadowPigment: body.includes(fullName("shadow-cast")),
    };
  });
}

/* ------------------------------------------------------------------------ *
 * Length and clamp resolution.
 * ------------------------------------------------------------------------ */

/** Resolves a single `<number><unit>` term to px. */
export function termToPx(term: string, viewportPx: number): number {
  const match = /^(-?\d*\.?\d+)(px|rem|em|vw|vh)?$/.exec(term.trim());
  if (match === null) return Number.NaN;
  const magnitude = Number.parseFloat(match[1]);
  switch (match[2]) {
    case "rem":
    case "em":
      return magnitude * ROOT_FONT_PX;
    case "vw":
      return (magnitude / 100) * viewportPx;
    case "vh":
      return Number.NaN;
    case "px":
    case undefined:
      return magnitude;
    default:
      return Number.NaN;
  }
}

/** Sums `A + Bvw`-style expressions. */
function sumTerms(expression: string, viewportPx: number): number {
  return expression
    .split("+")
    .map((term) => termToPx(term, viewportPx))
    .reduce((total, value) => total + value, 0);
}

/**
 * Resolves a `clamp(min, preferred, max)` value — or a bare length — to px at
 * a given viewport width, the way a browser would.
 */
export function resolveSizePx(value: string, viewportPx: number): number {
  const clamp = /^clamp\((.+)\)$/.exec(value.trim());
  if (clamp === null) return termToPx(value, viewportPx);

  const [minimum, preferred, maximum] = splitTopLevel(clamp[1]);
  if (minimum === undefined || preferred === undefined || maximum === undefined) {
    return Number.NaN;
  }
  return Math.min(
    Math.max(sumTerms(preferred, viewportPx), termToPx(minimum, viewportPx)),
    termToPx(maximum, viewportPx),
  );
}

/* ------------------------------------------------------------------------ *
 * Validators. Each returns a list of human-readable violations; empty means
 * the rule holds.
 * ------------------------------------------------------------------------ */

export type Violations = readonly string[];

/** Every declared property is namespaced and registered, and none is missing. */
export function validateRegistryCoverage(parsed: ParsedTokens): Violations {
  const problems: string[] = [];
  const declared = new Set<string>();

  for (const declaration of parsed.base.keys()) {
    if (!declaration.startsWith(TOKEN_PREFIX)) {
      problems.push(`${declaration} is outside the ${TOKEN_PREFIX} namespace.`);
      continue;
    }
    const token = shortName(declaration);
    if (!TOKEN_REGISTRY.has(token)) {
      problems.push(`${declaration} is declared but not registered in the contract.`);
    }
    declared.add(token);
  }

  for (const token of TOKEN_REGISTRY.keys()) {
    if (!declared.has(token)) {
      problems.push(`${fullName(token)} is registered but not declared in the stylesheet.`);
    }
  }
  return problems;
}

/**
 * The raw-color rule. A color literal is legal only as the entire value of a
 * registered color token; every other token reaches color through `var()`.
 */
export function validateNoRawColors(parsed: ParsedTokens): Violations {
  const problems: string[] = [];

  for (const [declaration, value] of parsed.base) {
    const token = shortName(declaration);
    const spec = TOKEN_REGISTRY.get(token);
    if (spec === undefined) continue;

    if (spec.kind === "color") {
      if (!HEX_PATTERN.test(value)) {
        problems.push(
          `${declaration} must be one uppercase six-digit sRGB hex value, found "${value}".`,
        );
      }
      continue;
    }

    if (spec.kind === "font-stack") continue;

    if (HEX_LITERAL_PATTERN.test(value)) {
      problems.push(`${declaration} contains a raw hex color: "${value}".`);
    }
    if (COLOR_FUNCTION_PATTERN.test(value)) {
      problems.push(`${declaration} contains a raw color function: "${value}".`);
    }
    for (const identifier of bareIdentifiers(value)) {
      if (!PERMITTED_IDENTIFIERS.includes(identifier)) {
        problems.push(
          `${declaration} names "${identifier}", which is neither a permitted keyword nor a semantic token reference.`,
        );
      }
    }
  }
  return problems;
}

/** No `var()` reference points at an unregistered token. */
export function validateReferences(parsed: ParsedTokens): Violations {
  const problems: string[] = [];
  for (const [declaration, value] of parsed.base) {
    const spec = TOKEN_REGISTRY.get(shortName(declaration));
    for (const reference of referencedVariables(value)) {
      if (spec?.kind === "font-stack") {
        if (!PERMITTED_FONT_VARIABLES.includes(reference)) {
          problems.push(`${declaration} resolves through unapproved font variable ${reference}.`);
        }
        continue;
      }
      if (!reference.startsWith(TOKEN_PREFIX) || !TOKEN_REGISTRY.has(shortName(reference))) {
        problems.push(`${declaration} references ${reference}, which is not a registered token.`);
      }
    }
  }
  return problems;
}

/** No two color tokens carry the same value. */
export function validateNoDuplicateColors(
  palette: ReadonlyMap<string, string>,
): Violations {
  const problems: string[] = [];
  const seen = new Map<string, string>();
  for (const [token, value] of palette) {
    const previous = seen.get(value);
    if (previous !== undefined) {
      problems.push(`${fullName(token)} duplicates ${fullName(previous)} (${value}).`);
    }
    seen.set(value, token);
  }
  return problems;
}

function hueRuleFor(token: string): HueRule {
  const override = TOKEN_HUE_RULES[token];
  if (override !== undefined) return override;
  const family = TOKEN_REGISTRY.get(token)?.family;
  return family === undefined ? "unconstrained" : FAMILY_HUE_RULES[family];
}

/** White balance and pigment identity, as channel-order rules. */
export function validateHue(palette: ReadonlyMap<string, string>): Violations {
  const problems: string[] = [];
  for (const [token, value] of palette) {
    const [r, g, b] = parseHex(value);
    switch (hueRuleFor(token)) {
      case "warm":
        if (r <= b) {
          problems.push(`${fullName(token)} (${value}) is not warm: red ${r} must exceed blue ${b}.`);
        }
        break;
      case "forest":
        if (!(g > r && g >= b)) {
          problems.push(`${fullName(token)} (${value}) is not forest-dominant: green must lead (${r},${g},${b}).`);
        }
        break;
      case "copper":
        if (!(r > g && g > b)) {
          problems.push(`${fullName(token)} (${value}) is not copper: needs red > green > blue (${r},${g},${b}).`);
        }
        break;
      case "neutral": {
        const spread = Math.max(r, g, b) - Math.min(r, g, b);
        if (spread > NEUTRAL_MAX_CHANNEL_SPREAD) {
          problems.push(`${fullName(token)} (${value}) is too saturated for graphite: spread ${spread} exceeds ${NEUTRAL_MAX_CHANNEL_SPREAD}.`);
        }
        break;
      }
      case "unconstrained":
        break;
    }
  }
  return problems;
}

/**
 * The exposure envelope, read from the stylesheet's own floor and ceiling so
 * the declared physics and the actual palette cannot disagree.
 */
export function validateExposureEnvelope(
  parsed: ParsedTokens,
  palette: ReadonlyMap<string, string>,
): Violations {
  const problems: string[] = [];
  const floor = Number.parseFloat(parsed.base.get(fullName("exposure-shadow-floor")) ?? "");
  const ceiling = Number.parseFloat(parsed.base.get(fullName("exposure-highlight-ceiling")) ?? "");

  if (Number.isNaN(floor) || Number.isNaN(ceiling)) {
    return ["The exposure envelope tokens are missing or unreadable."];
  }

  for (const [token, value] of palette) {
    const lightness = lightnessLstar(value);
    if (lightness < floor) {
      problems.push(`${fullName(token)} (${value}) is crushed at L* ${round2(lightness)}, below the floor of ${floor}.`);
    }
    if (lightness > ceiling) {
      problems.push(`${fullName(token)} (${value}) is blown at L* ${round2(lightness)}, above the ceiling of ${ceiling}.`);
    }
  }
  return problems;
}

/** Material planes separate by lightness step, not by WCAG ratio. */
export function validateMaterialPlanes(
  palette: ReadonlyMap<string, string>,
): Violations {
  const problems: string[] = [];
  for (const plane of MATERIAL_PLANES) {
    const near = palette.get(plane.near);
    const far = palette.get(plane.far);
    if (near === undefined || far === undefined) {
      problems.push(`Material plane ${plane.id} references a missing token.`);
      continue;
    }
    const delta = Math.abs(lightnessLstar(near) - lightnessLstar(far));
    if (delta < plane.minDeltaL) {
      problems.push(`Material plane ${plane.id} separates by only ${round2(delta)} L*, below the required ${plane.minDeltaL}.`);
    }
  }
  return problems;
}

export interface ContrastRow {
  readonly id: string;
  readonly foreground: string;
  readonly foregroundValue: string;
  readonly background: string;
  readonly backgroundValue: string;
  readonly ratio: number;
  readonly required: number;
  readonly kind: "text" | "non-text";
  readonly note: string;
  readonly passes: boolean;
}

/**
 * Required ratio for a text pair, derived from the resolved size at every
 * viewport rather than asserted. A role that is large type on desktop and
 * normal type on mobile is held to the stricter threshold.
 */
export function requiredRatioForText(
  pair: TextPair,
  parsed: ParsedTokens,
): { required: number; note: string } {
  const role = TYPE_ROLES[pair.role];
  const sizeValue = parsed.base.get(fullName(role.sizeToken)) ?? "";
  const sizes = VIEWPORTS.map((viewport) => ({
    id: viewport.id,
    px: resolveSizePx(sizeValue, viewport.width),
  }));
  const allLarge = sizes.every((size) => isLargeText(size.px, pair.weight));
  const smallest = sizes.reduce((a, b) => (a.px <= b.px ? a : b));
  return {
    required: allLarge ? WCAG_AA_LARGE : WCAG_AA_NORMAL,
    note: `${pair.role} ${pair.weight}, ${round2(smallest.px)}px at ${smallest.id}`,
  };
}

/** The full Hero contrast matrix, computed from the stylesheet's own values. */
export function contrastMatrix(
  parsed: ParsedTokens,
  palette: ReadonlyMap<string, string>,
): readonly ContrastRow[] {
  const rows: ContrastRow[] = [];

  for (const pair of HERO_TEXT_PAIRS) {
    const foregroundValue = palette.get(pair.foreground);
    const backgroundValue = palette.get(pair.background);
    if (foregroundValue === undefined || backgroundValue === undefined) continue;
    const { required, note } = requiredRatioForText(pair, parsed);
    const ratio = round2(contrastRatio(foregroundValue, backgroundValue));
    rows.push({
      id: pair.id,
      foreground: pair.foreground,
      foregroundValue,
      background: pair.background,
      backgroundValue,
      ratio,
      required,
      kind: "text",
      note,
      passes: ratio >= required,
    });
  }

  for (const pair of HERO_NON_TEXT_PAIRS) {
    const foregroundValue = palette.get(pair.foreground);
    const backgroundValue = palette.get(pair.background);
    if (foregroundValue === undefined || backgroundValue === undefined) continue;
    const ratio = round2(contrastRatio(foregroundValue, backgroundValue));
    rows.push({
      id: pair.id,
      foreground: pair.foreground,
      foregroundValue,
      background: pair.background,
      backgroundValue,
      ratio,
      required: WCAG_NON_TEXT,
      kind: "non-text",
      note: pair.purpose,
      passes: ratio >= WCAG_NON_TEXT,
    });
  }

  return rows;
}

export function validateContrast(
  parsed: ParsedTokens,
  palette: ReadonlyMap<string, string>,
): Violations {
  const problems: string[] = [];

  // A pair whose tokens are missing or malformed would otherwise drop out of
  // the matrix silently and read as a pass.
  for (const pair of [...HERO_TEXT_PAIRS, ...HERO_NON_TEXT_PAIRS]) {
    for (const token of [pair.foreground, pair.background]) {
      if (!palette.has(token)) {
        problems.push(`${pair.id} references ${fullName(token)}, which the stylesheet does not declare as a usable color.`);
      }
    }
  }

  for (const row of contrastMatrix(parsed, palette)) {
    if (row.passes) continue;
    problems.push(
      `${row.id} reaches only ${row.ratio}:1 against a required ${row.required}:1 ` +
        `(${row.foreground} ${row.foregroundValue} on ${row.background} ${row.backgroundValue}).`,
    );
  }

  return problems;
}

/** Copper never carries running text. */
export function validateCopperTextDiscipline(): Violations {
  const problems: string[] = [];
  for (const pair of HERO_TEXT_PAIRS) {
    if (COPPER_TEXT_FORBIDDEN.includes(pair.foreground)) {
      problems.push(`${pair.id} sets type in ${fullName(pair.foreground)}, which is a non-text copper step.`);
    }
    if (
      pair.foreground === "copper-text" &&
      !COPPER_TEXT_PERMITTED_ROLES.includes(pair.role)
    ) {
      problems.push(`${pair.id} uses copper-text at the "${pair.role}" role; copper type is limited to ${COPPER_TEXT_PERMITTED_ROLES.join(" and ")}.`);
    }
  }
  return problems;
}

/** Elevations are physical: multi-layer, directional, warm, and capped. */
export function validateShadows(parsed: ParsedTokens): Violations {
  const problems: string[] = [];
  for (const [token, spec] of TOKEN_REGISTRY) {
    if (spec.kind !== "shadow") continue;
    const value = parsed.base.get(fullName(token));
    if (value === undefined) continue;

    const layers = parseShadowLayers(value);
    if (layers.length < LIGHT_MODEL.shadowMinLayers) {
      problems.push(`${fullName(token)} has ${layers.length} layer(s); at least ${LIGHT_MODEL.shadowMinLayers} are required.`);
    }

    const [primary] = layers;
    if (primary !== undefined) {
      if (!(primary.offsetY > 0)) {
        problems.push(`${fullName(token)} does not cast downward: its first layer has a y offset of ${primary.offsetY}.`);
      }
      if (!(primary.offsetX >= 0)) {
        problems.push(`${fullName(token)} casts against the light: its first layer has a negative x offset.`);
      }
      const ratio = primary.offsetY === 0 ? Number.NaN : primary.offsetX / primary.offsetY;
      const drift = Math.abs(ratio - LIGHT_MODEL.shadowOffsetRatio);
      if (!(drift <= LIGHT_MODEL.shadowOffsetTolerance)) {
        problems.push(`${fullName(token)} casts at an x:y ratio of ${round2(ratio)}, off the light model's ${LIGHT_MODEL.shadowOffsetRatio} by more than ${LIGHT_MODEL.shadowOffsetTolerance}.`);
      }
    }

    for (const [index, layer] of layers.entries()) {
      if (!layer.usesShadowPigment) {
        problems.push(`${fullName(token)} layer ${index + 1} does not cast in the shared shadow pigment.`);
      }
      if (layer.densityPct === null) {
        problems.push(`${fullName(token)} layer ${index + 1} has no readable density.`);
        continue;
      }
      if (layer.densityPct > LIGHT_MODEL.shadowDensityCeilingPct) {
        problems.push(`${fullName(token)} layer ${index + 1} is ${layer.densityPct}% dense, above the ${LIGHT_MODEL.shadowDensityCeilingPct}% ceiling.`);
      }
    }
  }
  return problems;
}

/** Blur stays bounded and no glass effect is introduced. */
export function validateBlurAndGlass(parsed: ParsedTokens): Violations {
  const problems: string[] = [];
  const ceiling = termToPx(parsed.base.get(fullName("blur-max")) ?? "", 0);

  if (Number.isNaN(ceiling)) return ["The blur ceiling token is missing or unreadable."];

  for (const token of ["blur-veil", "blur-edge"]) {
    const value = parsed.base.get(fullName(token));
    if (value === undefined) continue;
    const px = termToPx(value, 0);
    if (px > ceiling) {
      problems.push(`${fullName(token)} is ${px}px, above the ${ceiling}px ceiling.`);
    }
  }

  if (/backdrop-filter/i.test(parsed.source)) {
    problems.push("The stylesheet declares a backdrop filter; this system has no glass.");
  }
  return problems;
}

/** Washes are material; veils are capped scrims. */
export function validateWashesAndVeils(parsed: ParsedTokens): Violations {
  const problems: string[] = [];
  const cap = Number.parseFloat(parsed.base.get(fullName("veil-opacity-max")) ?? "");
  if (Number.isNaN(cap)) return ["The veil opacity ceiling token is missing or unreadable."];
  const capPct = cap * 100;

  for (const [token, spec] of TOKEN_REGISTRY) {
    const value = parsed.base.get(fullName(token));
    if (value === undefined) continue;

    if (spec.kind === "gradient-wash" && value.includes("color-mix")) {
      problems.push(`${fullName(token)} is a material wash and must be opaque, but it mixes toward transparency.`);
    }

    if (spec.kind === "gradient-veil") {
      const densities = [...value.matchAll(/color-mix\([^%]*?(\d*\.?\d+)%/g)].map(
        (match) => Number.parseFloat(match[1]),
      );
      if (densities.length === 0) {
        problems.push(`${fullName(token)} declares no readable veil density.`);
      }
      for (const density of densities) {
        if (density > capPct) {
          problems.push(`${fullName(token)} reaches ${density}%, above the ${capPct}% veil ceiling — a drawing beneath it would be obscured.`);
        }
      }
    }
  }
  return problems;
}

/** The drawing region is never a square card. */
export function validatePlateGeometry(parsed: ParsedTokens): Violations {
  const problems: string[] = [];
  for (const [token, spec] of TOKEN_REGISTRY) {
    if (spec.kind !== "aspect") continue;
    const value = parsed.base.get(fullName(token));
    if (value === undefined) continue;
    const [width, height] = value.split("/").map((part) => Number.parseFloat(part));
    if (Number.isNaN(width) || Number.isNaN(height) || height === 0) {
      problems.push(`${fullName(token)} is not a readable aspect ratio: "${value}".`);
      continue;
    }
    const ratio = width / height;
    if (ratio < 1.2) {
      problems.push(`${fullName(token)} is ${round2(ratio)}:1, too close to the square photo card this recipe prohibits.`);
    }
  }
  return problems;
}

/** No font beyond what the repository already loads. */
export function validateFontStacks(parsed: ParsedTokens): Violations {
  const problems: string[] = [];
  for (const [token, spec] of TOKEN_REGISTRY) {
    if (spec.kind !== "font-stack") continue;
    const value = parsed.base.get(fullName(token));
    if (value === undefined) continue;

    const families = splitTopLevel(stripVarReferences(value))
      .map((part) => part.replace(/["']/g, "").trim())
      .filter((part) => part !== "");

    for (const family of families) {
      if (!PERMITTED_FONT_FAMILIES.includes(family)) {
        problems.push(`${fullName(token)} names "${family}", which the repository does not already load.`);
      }
    }

    const quoted = [...value.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
    for (const family of quoted) {
      if (!PERMITTED_FONT_FAMILIES.includes(family)) {
        problems.push(`${fullName(token)} falls back to "${family}", which the repository does not already load.`);
      }
    }
  }
  return problems;
}

/** Type resolves legibly at all three verification viewports. */
export function validateTypeScale(parsed: ParsedTokens): Violations {
  const problems: string[] = [];

  for (const [roleName, role] of Object.entries(TYPE_ROLES)) {
    const value = parsed.base.get(fullName(role.sizeToken));
    if (value === undefined) {
      problems.push(`Type role "${roleName}" references missing token ${fullName(role.sizeToken)}.`);
      continue;
    }
    let previous = Number.NEGATIVE_INFINITY;
    // Viewports run desktop to mobile, so sizes must be non-increasing.
    for (const viewport of VIEWPORTS) {
      const px = resolveSizePx(value, viewport.width);
      if (Number.isNaN(px)) {
        problems.push(`${fullName(role.sizeToken)} does not resolve at ${viewport.id}.`);
        break;
      }
      if (previous !== Number.NEGATIVE_INFINITY && px > previous) {
        problems.push(`${fullName(role.sizeToken)} grows as the viewport narrows, reaching ${round2(px)}px at ${viewport.id}.`);
      }
      previous = px;

      if (roleName === "body" && px < TYPE_FLOORS.bodyMinPx) {
        problems.push(`Body type falls to ${round2(px)}px at ${viewport.id}, below the ${TYPE_FLOORS.bodyMinPx}px floor.`);
      }
      if (roleName === "label" && px < TYPE_FLOORS.labelMinPx) {
        problems.push(`Label type falls to ${round2(px)}px at ${viewport.id}, below the ${TYPE_FLOORS.labelMinPx}px floor.`);
      }
      if (roleName === "annotation" && px < TYPE_FLOORS.annotationMinPx) {
        problems.push(`Annotation type falls to ${round2(px)}px at ${viewport.id}, below the ${TYPE_FLOORS.annotationMinPx}px floor.`);
      }
    }
  }
  return problems;
}

/** Every motion token has a reduced-motion substitution that actually reduces. */
export function validateMotion(parsed: ParsedTokens): Violations {
  const problems: string[] = [];

  if (parsed.reduced.size === 0) {
    return ["The stylesheet declares no reduced-motion block."];
  }

  for (const token of MOTION_TOKENS) {
    const base = parsed.base.get(fullName(token));
    const reduced = parsed.reduced.get(fullName(token));

    if (base === undefined) {
      problems.push(`${fullName(token)} is missing from the base scope.`);
      continue;
    }
    if (reduced === undefined) {
      problems.push(`${fullName(token)} has no reduced-motion substitution.`);
      continue;
    }

    const spec = TOKEN_REGISTRY.get(token);
    if (spec?.kind === "distance") {
      const px = termToPx(reduced, 0);
      if (px !== 0) {
        problems.push(`${fullName(token)} still moves ${reduced} under reduced motion; every distance must collapse to zero.`);
      }
    }
    if (spec?.kind === "duration") {
      const ms = /^(\d*\.?\d+)ms$/.exec(reduced);
      if (ms === null || Number.parseFloat(ms[1]) > 1) {
        problems.push(`${fullName(token)} is "${reduced}" under reduced motion; durations must collapse to at most 1ms.`);
      }
    }
    if (spec?.kind === "easing" && reduced !== "linear") {
      problems.push(`${fullName(token)} is "${reduced}" under reduced motion; curves must flatten to linear.`);
    }
  }
  return problems;
}

/** The stylesheet declares exactly one scope and one reduced-motion block. */
export function validateStructure(parsed: ParsedTokens): Violations {
  const problems: string[] = [];
  const scopes = parsed.source.split(OPTION2_PREMIUM_SCOPE).length - 1;
  if (scopes !== 2) {
    problems.push(`Expected the scope selector ${OPTION2_PREMIUM_SCOPE} exactly twice (base and reduced motion), found ${scopes}.`);
  }
  if (parsed.source.includes(":root")) {
    problems.push("The stylesheet writes to :root; the recipe must stay opt-in through its scope attribute.");
  }
  if (parsed.source.includes("@import")) {
    problems.push("The stylesheet imports another file; it must remain self-contained.");
  }
  return problems;
}

export interface ContractReport {
  readonly violations: Violations;
  readonly matrix: readonly ContrastRow[];
  readonly palette: ReadonlyMap<string, string>;
}

/** Runs every mechanical rule against a stylesheet. */
export function validateTokenFile(css: string): ContractReport {
  const parsed = parseTokenFile(css);
  const palette = buildPalette(parsed);

  const violations = [
    ...validateStructure(parsed),
    ...validateRegistryCoverage(parsed),
    ...validateNoRawColors(parsed),
    ...validateReferences(parsed),
    ...validateNoDuplicateColors(palette),
    ...validateHue(palette),
    ...validateExposureEnvelope(parsed, palette),
    ...validateMaterialPlanes(palette),
    ...validateContrast(parsed, palette),
    ...validateCopperTextDiscipline(),
    ...validateShadows(parsed),
    ...validateBlurAndGlass(parsed),
    ...validateWashesAndVeils(parsed),
    ...validatePlateGeometry(parsed),
    ...validateFontStacks(parsed),
    ...validateTypeScale(parsed),
    ...validateMotion(parsed),
  ];

  return { violations, matrix: contrastMatrix(parsed, palette), palette };
}
