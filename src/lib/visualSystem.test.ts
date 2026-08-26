import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const stylesheet = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");
const compareRoute = readFileSync(resolve(process.cwd(), "app/compare/page.tsx"), "utf8");
const header = readFileSync(
  resolve(process.cwd(), "src/components/Header.tsx"),
  "utf8",
);
// Executable declarations only: a comment naming a removed device is a record
// of the removal, never a restoration of it.
const executableStylesheet = stylesheet.replace(/\/\*[\s\S]*?\*\//g, "");
const executableHeader = header.replace(/\{?\/\*[\s\S]*?\*\/\}?/g, "");
const studioStylesheet = readFileSync(
  resolve(process.cwd(), "src/components/studio/StudioWorkbench.module.css"),
  "utf8",
);

function hexToLuminance(hex: string): number {
  const channels = hex
    .replace("#", "")
    .match(/.{2}/g)
    ?.map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4,
    );

  if (!channels || channels.length !== 3) {
    throw new Error(`Expected a six-digit hex color, received ${hex}`);
  }

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(foreground: string, background: string): number {
  const foregroundLuminance = hexToLuminance(foreground);
  const backgroundLuminance = hexToLuminance(background);

  return (
    (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
    (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
  );
}

function token(block: string, name: string): string {
  const value = block.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})`))?.[1];

  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function variableAlias(block: string, name: string): string {
  const value = block.match(
    new RegExp(`${name}:\\s*var\\((--[a-z0-9-]+)\\)`),
  )?.[1];

  if (!value) throw new Error(`Missing alias ${name}`);
  return value;
}

const LIGHT_PALETTE = {
  "--color-canvas": "#F3EFE7",
  "--color-surface": "#FCFBF8",
  "--color-surface-muted": "#E6DED2",
  "--color-surface-raised": "#FCFBF8",
  "--color-forest": "#2A3E36",
  "--color-forest-deep": "#121A17",
  "--color-forest-deep-surface": "#121A17",
  "--color-forest-soft": "#E7DFD4",
  "--color-gold": "#C58A52",
  "--color-gold-deep": "#74451F",
  "--color-gold-soft": "#EBDAC5",
  "--color-ink": "#202522",
  "--color-ink-muted": "#59615D",
  "--color-ink-subtle": "#5D6560",
  "--color-ink-inverse": "#F7F3EB",
  "--color-ink-inverse-muted": "#C9CEC9",
  "--color-line": "#D3CABC",
  "--color-line-strong": "#81756A",
  "--color-success": "#1F6A45",
  "--color-warning": "#91450C",
  "--color-danger": "#8E3838",
  "--color-focus": "#117990",
  "--color-focus-contrast": "#FCFBF8",
  "--color-signal": "#39D98A",
} as const;

const DARK_PALETTE = {
  "--color-canvas": "#101513",
  "--color-surface": "#171D1B",
  "--color-surface-muted": "#222A27",
  "--color-surface-raised": "#29322E",
  "--color-forest": "#35443D",
  "--color-forest-deep": "#F3EFE7",
  "--color-forest-deep-surface": "#0C110F",
  "--color-forest-soft": "#2B342F",
  "--color-gold": "#D9A36D",
  "--color-gold-deep": "#E9BE91",
  "--color-gold-soft": "#3C2C20",
  "--color-ink": "#F3EFE7",
  "--color-ink-muted": "#C9CEC9",
  "--color-ink-subtle": "#A4ADA7",
  "--color-ink-inverse": "#F7F3EB",
  "--color-ink-inverse-muted": "#C9CEC9",
  "--color-line": "#37413D",
  "--color-line-strong": "#738078",
  "--color-success": "#8FD1A8",
  "--color-warning": "#FFB568",
  "--color-danger": "#F0AEAE",
  "--color-focus": "#5CCAD2",
  "--color-focus-contrast": "#F7F3EB",
  "--color-signal": "#39D98A",
} as const;

const SHARED_ARCHITECTURAL_ALIASES = {
  "--color-shell": "--color-forest-deep-surface",
  "--color-shell-raised": "--color-forest",
  "--color-shell-text": "--color-ink-inverse",
  "--color-shell-text-muted": "--color-ink-inverse-muted",
  "--color-boundary": "--color-line",
  "--color-boundary-strong": "--color-line-strong",
  "--color-selection": "--color-gold-deep",
  "--color-selection-soft": "--color-gold-soft",
  "--color-focus-ring": "--color-focus",
} as const;

const STUDIO_STRUCTURAL_ALIASES = {
  "--studio-canvas": "--color-canvas",
  "--studio-paper": "--color-surface-raised",
  "--studio-panel": "--color-surface",
  "--studio-panel-muted": "--color-surface-muted",
  "--studio-ink": "--color-ink",
  "--studio-muted": "--color-ink-muted",
  "--studio-subtle": "--color-ink-subtle",
  "--studio-line": "--color-boundary",
  "--studio-line-strong": "--color-boundary-strong",
  "--studio-accent": "--color-selection",
  "--studio-accent-soft": "--color-selection-soft",
  /*
   * PRODUCT2-WESTCOASTKBP-LIGHT-SURFACE-FINAL-REPAIR-0001.
   *
   * `--studio-accent-dark` is the Studio's primary-action fill, and it aliased
   * `--color-shell`. That held only while the shell was a dark ground: the
   * light lock moved `--color-shell` to `#F5F5F1`, the fill collapsed onto the
   * rail the control sits on, and `Compare concepts` rendered as bare text at
   * 1.00:1. It aliases `--color-ink` now, and the four interaction roles below
   * carry the rest of the states. `studioAccessibility.test.ts` resolves this
   * whole chain to real hex and measures every state against the light lock.
   */
  "--studio-accent-dark": "--color-ink",
  "--studio-action-ink": "--color-ink-inverse",
  "--studio-action-hover": "--color-selection",
  "--studio-action-active": "--color-gold-deep",
  "--studio-action-ring": "--color-focus-ring",
  "--studio-shell": "--color-shell",
  "--studio-shell-raised": "--color-shell-raised",
  "--studio-shell-ink": "--color-shell-text",
  "--studio-shell-muted": "--color-shell-text-muted",
} as const;

const TEMPORARY_STUDIO_SWATCHES = [
  "#f1eee4",
  "#d6c8b3",
  "#bda48d",
  "#7d8778",
  "#50524e",
] as const;

describe("portal visual-system regressions", () => {
  it("pins the exact California Material Modernism token contract", () => {
    const lightTokens = stylesheet.match(/:root \{([\s\S]*?)\n\}/)?.[1];
    const darkTokens = stylesheet.match(
      /@media \(prefers-color-scheme: dark\) \{\s*:root \{([\s\S]*?)\n\s*\}/,
    )?.[1];

    expect(lightTokens).toBeDefined();
    expect(darkTokens).toBeDefined();

    for (const [name, value] of Object.entries(LIGHT_PALETTE)) {
      expect(token(lightTokens!, name)).toBe(value);
    }

    for (const [name, value] of Object.entries(DARK_PALETTE)) {
      expect(token(darkTokens!, name)).toBe(value);
    }

    expect(lightTokens).toContain("--color-signal-rgb: 57 217 138;");
    expect(darkTokens).toContain("--color-signal-rgb: 57 217 138;");
  });

  it("maps architectural roles onto the pinned light and dark palette", () => {
    const lightTokens = stylesheet.match(/:root \{([\s\S]*?)\n\}/)?.[1];
    const darkTokens = stylesheet.match(
      /@media \(prefers-color-scheme: dark\) \{\s*:root \{([\s\S]*?)\n\s*\}/,
    )?.[1];

    expect(lightTokens).toBeDefined();
    expect(darkTokens).toBeDefined();

    for (const tokens of [lightTokens!, darkTokens!]) {
      for (const [role, source] of Object.entries(
        SHARED_ARCHITECTURAL_ALIASES,
      )) {
        expect(variableAlias(tokens, role)).toBe(source);
      }
    }

    expect(variableAlias(lightTokens!, "--color-selection-contrast")).toBe(
      "--color-ink-inverse",
    );
    expect(variableAlias(darkTokens!, "--color-selection-contrast")).toBe(
      "--color-forest-deep-surface",
    );
  });

  it("makes Studio structural roles global aliases and refuses raw-color drift", () => {
    const studioTokens = studioStylesheet.match(/\.page \{([\s\S]*?)\n\}/)?.[1];

    expect(studioTokens).toBeDefined();

    for (const [role, source] of Object.entries(STUDIO_STRUCTURAL_ALIASES)) {
      expect(variableAlias(studioTokens!, role)).toBe(source);
    }

    const executableStudioStyles = studioStylesheet.replace(
      /\/\*[\s\S]*?\*\//g,
      "",
    );
    const rawHexValues = [
      ...executableStudioStyles.matchAll(/#[0-9a-fA-F]{6}/g),
    ].map(([value]) => value.toLowerCase());

    expect(rawHexValues).toEqual(TEMPORARY_STUDIO_SWATCHES);
    expect(studioStylesheet).toContain(
      "Temporary product-option placeholders; not material or texture claims.",
    );
    expect(executableStudioStyles).not.toMatch(
      /:\s*(?:white|black)\s*(?:;|!important)/i,
    );
  });

  it("keeps the emerald signal declared as a token and unpainted by Product 2", () => {
    // P2-CHROME-CANON-ALIGN-0001: the pinned signal token contract is
    // unchanged, but canon E7 forbids painting the borrowed Product 1 signal
    // anywhere on Product 2. Repainting it fails here.
    // Three declarations now: the base `:root`, the system-dark remap, and the
    // canonical light lock that re-pins every token the remap overrides.
    expect(stylesheet.match(/--color-signal:\s*#39D98A;/g)).toHaveLength(3);
    expect(
      stylesheet.match(/--color-signal-rgb:\s*57 217 138;/g),
    ).toHaveLength(3);

    const outsideDeclarations = stylesheet
      .replace(/--color-signal:\s*#39D98A;/g, "")
      .replace(/--color-signal-rgb:\s*57 217 138;/g, "");

    expect(outsideDeclarations).not.toContain("var(--color-signal");
    expect(outsideDeclarations).not.toMatch(
      /#39d98a|rgb\(\s*57\s+217\s+138\s*\//i,
    );
  });

  it("refuses the brand-seal device and its pulse anywhere in the shell", () => {
    // Canon E7 mutation probe: restoring a brand-seal element, the
    // brand-signal-pulse animation, or any green pulsing-dot paint in the
    // Product 2 header must fail here.
    expect(executableStylesheet).not.toContain("brand-seal");
    expect(executableStylesheet).not.toContain("brand-signal-pulse");
    expect(executableStylesheet).not.toMatch(/@keyframes\s+brand-/);
    expect(executableHeader).not.toContain("brand-seal");
    expect(executableHeader).not.toContain("brand-signal-pulse");

    // No substituted mark either: Product 2's identity is typographic only.
    const brandLink = header.match(
      /<Link href="\/" className="brand"[\s\S]*?<\/Link>/,
    )?.[0];

    expect(brandLink).toBeDefined();
    expect(brandLink).not.toMatch(/<svg|<img|<Image|role="img"|aria-hidden/i);
    expect(brandLink).toContain('className="brand__name"');
    /*
     * PRODUCT2-WESTCOASTKBP-LIGHT-SURFACE-FINAL-REPAIR-0001.
     *
     * The Owner's header is the name-only West Coast KBP wordmark. Restoring
     * the shared header had reintroduced `brand__tagline` inside the brand
     * link and inverted this assertion to match; it is inverted back. The
     * tagline is untouched in the footer and in document metadata.
     */
    expect(brandLink).not.toContain("brand__tagline");
    expect(executableHeader).not.toContain("brand__tagline");
    expect(header).toContain("accessibility.brandHomeLabel");

    /*
     * PRODUCT2-WESTCOASTKBP-LIGHT-SHELL-COHERENCE-REPAIR-0001.
     *
     * The brand link stays a wordmark with no device. What this probe no
     * longer asserts is the *absence* of navigation: the shared header carries
     * the complete primary navigation on all twelve public routes. Two `Link`
     * elements are written — the brand link, and the one inside the map that
     * renders every navigation destination. A device smuggled into the brand
     * link still fails above.
     */
    expect(executableHeader.match(/<Link\b/g)).toHaveLength(2);
    expect(executableHeader).toMatch(/<nav\b/);
    expect(executableHeader).toContain("NavigationLinks");
  });

  it("keeps every first-screen page hero on the light enterprise system", () => {
    /*
     * PRODUCT2-WESTCOASTKBP-LIGHT-SURFACE-FINAL-REPAIR-0001.
     *
     * `.model-page-hero` is the first screen of `/models` and `/service-areas`;
     * `.model-detail__hero` is the first screen of every `/models/[model]`
     * route. Both painted `--color-forest-deep-surface` under
     * `--color-ink-inverse` with a serif display heading, covering 51–64% of
     * the first screen at desktop. The Owner does not retain large dark page
     * heroes. Reintroducing a dark ground, inverse ink or the serif display
     * face on either hero must fail here.
     */
    const heroGround = executableStylesheet.match(
      /\n\.model-page-hero,\n\.model-detail__hero \{([\s\S]*?)\n\}/,
    )?.[1];

    expect(heroGround).toBeDefined();
    expect(heroGround).toContain("background: var(--color-surface)");
    expect(heroGround).toContain("color: var(--color-ink)");
    expect(heroGround).not.toContain("--color-forest-deep-surface");
    expect(heroGround).not.toContain("--color-ink-inverse");

    const heroHeading = executableStylesheet.match(
      /\n\.model-page-hero h1,\n\.model-detail__title \{([\s\S]*?)\n\}/,
    )?.[1];

    expect(heroHeading).toBeDefined();
    expect(heroHeading).toContain("font-family: var(--font-sans)");
    expect(heroHeading).toContain("color: var(--color-ink)");
    expect(heroHeading).not.toContain("var(--font-serif)");

    // No rule anywhere may put inverse ink inside either hero again: inverse
    // ink is light, and both heroes are now light grounds.
    for (const scope of [".model-page-hero", ".model-detail__hero"]) {
      for (const [, body] of executableStylesheet.matchAll(
        new RegExp(`\\n[^\\n{}]*\\${scope}[^\\n{}]*\\{([\\s\\S]*?)\\n\\}`, "g"),
      )) {
        expect(body).not.toContain("--color-ink-inverse");
        expect(body).not.toContain("--color-forest-deep-surface");
      }
    }

    // The dark-ground accent fallback is for mid-page content bands only. If a
    // hero is ever added back to that list it is a dark ground again.
    const accentFallback = executableStylesheet.match(
      /\n\.content-section--dark,\n([\s\S]*?)\{/,
    )?.[1];

    expect(accentFallback).toBe(".spine-section--dark ");
  });

  it("keeps the Product 2 mark stationary in every motion state", () => {
    // Canon E5 mutation probe: the logo does not move. Any animation or
    // transition reaching the brand link or its typographic parts fails here,
    // so no ambient motion can be reintroduced under a different name.
    const brandRules = [
      ...executableStylesheet.matchAll(
        /(^|\n)([^\n{}]*\.brand(?:__[a-z]+)?[^\n{}]*)\{([^}]*)\}/g,
      ),
    ];

    expect(brandRules.length).toBeGreaterThan(0);

    for (const [, , selector, body] of brandRules) {
      expect(body, `brand rule ${selector.trim()}`).not.toMatch(
        /(^|[;\s])(animation|transition)(-[a-z]+)?\s*:/,
      );
    }
  });

  it("paints header and notice chrome only from Option 2 role tokens", () => {
    // Canon E2 mutation probe: the shell carries one visual system. A raw
    // color, a second palette, or a semantic status paint in the header or the
    // release line fails here.
    const finalShell = executableStylesheet.slice(
      executableStylesheet.indexOf(".brand {"),
    );
    const chromeRules = [
      ...finalShell.matchAll(
        /(^|\n)([^\n{}]*(?:\.brand|\.site-header|\.site-nav|\.development-notice)[^\n{}]*)\{([^}]*)\}/g,
      ),
    ];

    expect(chromeRules.length).toBeGreaterThan(0);

    for (const [, , selector, body] of chromeRules) {
      expect(body, `chrome rule ${selector.trim()}`).not.toMatch(
        /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/,
      );
      expect(body, `chrome rule ${selector.trim()}`).not.toMatch(
        /var\(--color-(?:danger|warning|success|signal)\b/,
      );
    }

    // No Hero, decorative graph, AI-show surface, or device protagonist is
    // introduced into the chrome by this alignment.
    expect(executableHeader).not.toMatch(
      /Hero|canvas|graph|A600|<video|backdrop-filter/i,
    );
  });

  it("locks the whole public surface light at the document root", () => {
    /*
     * PRODUCT2-WESTCOASTKBP-LIGHT-SHELL-COHERENCE-REPAIR-0001.
     *
     * The Owner selected one light enterprise system for the entire public
     * surface. The system-dark remap above is retained as the record of the
     * legacy behaviour, but it can no longer reach a rendered page: the lock
     * re-declares every property it touches at `:root`, later in the sheet and
     * at equal specificity, so source order decides and the result is the same
     * light shell under either OS preference.
     */
    const darkAt = executableStylesheet.indexOf(
      "@media (prefers-color-scheme: dark)",
    );
    // The remap nests `:root` inside the media block, so the lock is the first
    // `:root` that starts *after* the media block closes.
    const darkInnerEnd = executableStylesheet.indexOf("\n  }", darkAt);
    const darkEnd = executableStylesheet.indexOf("\n}", darkInnerEnd) + 2;
    const lockAt = executableStylesheet.indexOf(":root {", darkEnd);

    expect(darkAt).toBeGreaterThan(-1);
    expect(darkInnerEnd).toBeGreaterThan(darkAt);
    expect(lockAt).toBeGreaterThan(darkEnd);

    const lockBlock = executableStylesheet.slice(
      lockAt,
      executableStylesheet.indexOf("\n}", lockAt) + 2,
    );
    const darkBlock = executableStylesheet.slice(darkAt, darkInnerEnd + 4);

    // Completeness: not one property may be remapped dark without an answer.
    const remapped = [...darkBlock.matchAll(/^\s{4}(--[a-z0-9-]+):/gm)].map(
      ([, name]) => name,
    );

    expect(remapped.length).toBeGreaterThan(0);
    for (const name of remapped) {
      expect(lockBlock, `${name} is remapped dark and never re-pinned`).toMatch(
        new RegExp(`^\\s{2}${name}:`, "m"),
      );
    }

    // The lock is the light palette, and it carries the scheme itself.
    expect(lockBlock).toContain("color-scheme: light;");
    expect(token(lockBlock, "--color-canvas")).toBe("#F5F5F1");
    expect(token(lockBlock, "--color-ink")).toBe("#202522");

    // Text on the locked ground clears AA, including the status colours the
    // superseded front-door-scoped block never re-pinned.
    const ground = token(lockBlock, "--color-canvas");
    for (const name of [
      "--color-ink",
      "--color-ink-muted",
      "--color-success",
      "--color-warning",
      "--color-danger",
    ]) {
      expect(
        contrastRatio(token(lockBlock, name), ground),
        `${name} on the locked canvas`,
      ).toBeGreaterThanOrEqual(4.5);
    }

    // The root element, not only `body`, owns the scheme and the ground. This
    // is the surface iPadOS paints during rubber-band overscroll, and the one
    // the superseded block left resolving dark.
    const htmlAt = executableStylesheet.indexOf("\nhtml {");
    const htmlBlock = executableStylesheet.slice(
      htmlAt,
      executableStylesheet.indexOf("\n}", htmlAt) + 2,
    );

    expect(htmlAt).toBeGreaterThan(-1);
    expect(htmlBlock).toContain("color-scheme: light;");
    expect(htmlBlock).toContain("background-color: var(--color-canvas);");

    // And no rule selects the shell by which page is being rendered.
    expect(executableStylesheet).not.toContain("body:has(.spine-home)");
  });

  it("keeps footer ink on the same shell roles as the footer ground", () => {
    /*
     * PRODUCT2-WESTCOASTKBP-LIGHT-SHELL-COHERENCE-REPAIR-0001 regression guard.
     *
     * The footer chrome was written for a dark footer and read
     * `--color-ink-inverse` and a literal 64% white. Once the shell ground
     * locked light and the footer stopped being hidden on the front door, that
     * ink measured 1.09:1 on its own background — present in the DOM, visible
     * to a `getBoundingClientRect` check, and unreadable to a person. Ground
     * and ink must move together, so both come from the shell roles.
     */
    const finalFooter = executableStylesheet.slice(
      executableStylesheet.lastIndexOf(".site-footer {"),
    );
    const footerRules = [
      ...finalFooter.matchAll(
        /(^|\n)([^\n{}]*\.(?:site-footer|footer__)[^\n{}]*)\{([^}]*)\}/g,
      ),
    ];

    expect(footerRules.length).toBeGreaterThan(0);

    for (const [, , selector, body] of footerRules) {
      expect(body, `footer rule ${selector.trim()}`).not.toMatch(
        /var\(--color-ink-inverse/,
      );
      // No literal white ink either — that is the same defect spelled out.
      expect(body, `footer rule ${selector.trim()}`).not.toMatch(
        /color:\s*(?:#f{3,8}\b|rgba?\(\s*255[\s,]+255[\s,]+255)/i,
      );
    }
  });

  it("keeps dark-mode headings readable while retaining a dark brand surface", () => {
    const darkTokens = stylesheet.match(
      /@media \(prefers-color-scheme: dark\) \{\s*:root \{([\s\S]*?)\n\s*\}/,
    )?.[1];

    expect(darkTokens).toBeDefined();
    const heading = token(darkTokens!, "--color-forest-deep");
    const surface = token(darkTokens!, "--color-surface");
    const brandSurface = token(darkTokens!, "--color-forest-deep-surface");

    expect(contrastRatio(heading, surface)).toBeGreaterThanOrEqual(4.5);
    expect(heading).not.toBe(brandSurface);
    expect(stylesheet).not.toMatch(/background:\s*var\(--color-forest-deep\);/);
  });

  it("presents the release status as one calm line of shell chrome", () => {
    // Canon E12 mutation probe: an uppercase, letter-spaced, raised, or
    // otherwise plaque-like treatment of the release status must fail here.
    const notice = stylesheet.match(
      /\.development-notice \{[\s\S]*?\.development-notice__supporting \{[\s\S]*?\n\}/,
    )?.[0];

    expect(notice).toBeDefined();

    // Sentence case and quiet weight — no uppercase badge.
    expect(notice).toContain("text-transform: none;");
    expect(notice).toContain("letter-spacing: normal;");
    expect(notice).not.toMatch(/text-transform:\s*uppercase/);
    expect(notice).toMatch(
      /\.development-notice__label\s*\{[\s\S]*?font-weight:\s*var\(--font-weight-medium\)/,
    );

    // Shell surface with hairline separation — not a raised strip or a card.
    expect(notice).toMatch(
      /\.development-notice \{[\s\S]*?background:\s*var\(--color-shell\);/,
    );
    expect(notice).not.toContain("var(--color-shell-raised)");
    expect(notice).toContain(
      "border-bottom: var(--line-width) solid var(--color-boundary-strong);",
    );

    // No alert color, glow, pill, or card.
    expect(notice).not.toMatch(/box-shadow|border-radius|text-shadow/);
    expect(notice).not.toMatch(
      /var\(--color-(?:danger|warning|success|signal|gold)\b/,
    );

    // Removing the calm-line mobile containment rule must fail here. The line
    // is one row at desktop and wraps cleanly when narrow, so the frozen text
    // is never the thing that gives way.
    expect(stylesheet).toMatch(
      /@media \(max-width: 47\.5rem\) \{\s*\.development-notice__label \{\s*white-space: normal;[\s\S]*?\.development-notice__message \{\s*overflow-wrap: break-word;/,
    );
  });

  it("keeps comparison semantics visible in the stacked mobile treatment", () => {
    expect(compareRoute.match(/data-label=/g)).toHaveLength(2);
    expect(stylesheet).toContain("content: attr(data-label)");
    expect(stylesheet).toContain(".comparison-table-wrap {\n    overflow: visible;");
  });

  it("keeps small shell text readable in both color schemes", () => {
    const lightTokens = stylesheet.match(/:root \{([\s\S]*?)\n\}/)?.[1];
    const darkTokens = stylesheet.match(
      /@media \(prefers-color-scheme: dark\) \{\s*:root \{([\s\S]*?)\n\s*\}/,
    )?.[1];

    expect(lightTokens).toBeDefined();
    expect(darkTokens).toBeDefined();

    for (const tokens of [lightTokens!, darkTokens!]) {
      const surface = token(tokens, "--color-surface");
      const mutedSurface = token(tokens, "--color-surface-muted");
      const mutedInk = token(tokens, "--color-ink-muted");
      const subtleInk = token(tokens, "--color-ink-subtle");
      const inverseMutedInk = token(tokens, "--color-ink-inverse-muted");
      const headingInk = token(tokens, "--color-forest-deep");
      const darkSurface = token(tokens, "--color-forest-deep-surface");
      const bronze = token(tokens, "--color-gold");

      const canvas = token(tokens, "--color-canvas");
      const raisedSurface = token(tokens, "--color-surface-raised");
      const bronzeDeep = token(tokens, "--color-gold-deep");

      for (const lightSurface of [
        canvas,
        surface,
        mutedSurface,
        raisedSurface,
      ]) {
        expect(contrastRatio(mutedInk, lightSurface)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(headingInk, lightSurface)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(bronzeDeep, lightSurface)).toBeGreaterThanOrEqual(4.5);
      }

      expect(contrastRatio(subtleInk, mutedSurface)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(inverseMutedInk, darkSurface)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(bronze, darkSurface)).toBeGreaterThanOrEqual(4.5);
    }

    const finalShell = stylesheet.slice(
      stylesheet.indexOf("/* Final shell overrides live after the legacy route system by design. */"),
    );

    /*
     * PRODUCT2-WESTCOASTKBP-LIGHT-SURFACE-FINAL-REPAIR-0001: the header is the
     * name-only wordmark, so `brand__tagline` is no longer rendered and its
     * four rules — two `display: none` media overrides, the base type rule and
     * the shell colour override — are removed rather than left as dead style
     * for an element that cannot appear. This pins the removal in both files.
     */
    expect(finalShell).not.toContain(".brand__tagline");
    expect(stylesheet).not.toContain(".brand__tagline");
    expect(executableHeader).not.toContain("brand__tagline");
    /* The rest of the shell chrome the light lock repaired stays pinned. */
    expect(finalShell).toContain(".site-header");
    expect(stylesheet).toMatch(
      /\.development-notice__label\s*\{[\s\S]*?color:\s*var\(--color-shell-text\)/,
    );
    expect(stylesheet).toMatch(
      /\.development-notice__supporting\s*\{[\s\S]*?color:\s*var\(--color-shell-text-muted\)/,
    );
    expect(stylesheet).toContain(
      ".breadcrumb {\n  display: flex;\n  align-items: center;\n  gap: var(--space-2);\n  color: var(--color-ink-muted);",
    );
    expect(stylesheet).toMatch(
      /\.content-section--dark \.content-section__intro\s*\{[\s\S]*?color:\s*var\(--color-ink-inverse-muted\)/,
    );
  });

  it("meets AA for every text pair used by the shell and Studio", () => {
    for (const [scheme, palette] of [
      ["light", LIGHT_PALETTE],
      ["dark", DARK_PALETTE],
    ] as const) {
      const selectionContrast =
        scheme === "light"
          ? palette["--color-ink-inverse"]
          : palette["--color-forest-deep-surface"];
      const textPairs = [
        ["body on canvas", palette["--color-ink"], palette["--color-canvas"]],
        ["muted on canvas", palette["--color-ink-muted"], palette["--color-canvas"]],
        ["muted on paper", palette["--color-ink-muted"], palette["--color-surface-raised"]],
        ["disabled on muted", palette["--color-ink-subtle"], palette["--color-surface-muted"]],
        ["shell text", palette["--color-ink-inverse"], palette["--color-forest-deep-surface"]],
        ["shell muted", palette["--color-ink-inverse-muted"], palette["--color-forest-deep-surface"]],
        ["raised shell muted", palette["--color-ink-inverse-muted"], palette["--color-forest"]],
        ["selected control", selectionContrast, palette["--color-gold-deep"]],
        ["success status", palette["--color-success"], palette["--color-surface"]],
        ["warning status", palette["--color-warning"], palette["--color-surface"]],
        ["danger status", palette["--color-danger"], palette["--color-surface"]],
      ] as const;

      for (const [name, foreground, background] of textPairs) {
        expect(
          contrastRatio(foreground, background),
          `${scheme} ${name}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("separates semantic colors and keeps boundaries and focus visible", () => {
    const lightTokens = stylesheet.match(/:root \{([\s\S]*?)\n\}/)?.[1];
    const darkTokens = stylesheet.match(
      /@media \(prefers-color-scheme: dark\) \{\s*:root \{([\s\S]*?)\n\s*\}/,
    )?.[1];

    expect(lightTokens).toBeDefined();
    expect(darkTokens).toBeDefined();

    for (const tokens of [lightTokens!, darkTokens!]) {
      const line = token(tokens, "--color-line-strong");
      const focus = token(tokens, "--color-focus");
      const warning = token(tokens, "--color-warning");
      const success = token(tokens, "--color-success");
      const danger = token(tokens, "--color-danger");
      const signal = token(tokens, "--color-signal");
      const bronze = token(tokens, "--color-gold");
      const gold = token(tokens, "--color-gold-deep");
      const canvas = token(tokens, "--color-canvas");
      const surface = token(tokens, "--color-surface");
      const mutedSurface = token(tokens, "--color-surface-muted");
      const raisedSurface = token(tokens, "--color-surface-raised");
      const forestSurface = token(tokens, "--color-forest-deep-surface");

      expect(
        new Set([signal, bronze, focus, warning, success, danger]).size,
      ).toBe(6);
      expect(warning).not.toBe(gold);
      expect(focus).not.toBe(gold);
      expect(focus).not.toBe(warning);
      expect(contrastRatio(line, canvas)).toBeGreaterThanOrEqual(3);
      expect(contrastRatio(line, surface)).toBeGreaterThanOrEqual(3);
      expect(contrastRatio(line, mutedSurface)).toBeGreaterThanOrEqual(3);
      expect(contrastRatio(line, raisedSurface)).toBeGreaterThanOrEqual(3);
      expect(contrastRatio(line, forestSurface)).toBeGreaterThanOrEqual(3);
      for (const adjacentSurface of [
        canvas,
        surface,
        mutedSurface,
        raisedSurface,
        forestSurface,
      ]) {
        expect(contrastRatio(focus, adjacentSurface)).toBeGreaterThanOrEqual(3);
      }
    }

    expect(stylesheet).toContain(":where(a, button, summary):focus-visible");
    expect(stylesheet).toContain(
      ":is(a, button, summary):focus-visible:not([disabled])",
    );
    expect(stylesheet).toContain(
      "box-shadow: 0 0 0 0.125rem var(--color-focus-contrast) !important;",
    );
    expect(stylesheet).toContain(
      'button[aria-pressed="true"]:focus-visible:not([disabled]):not([style*="--swatch-color"])',
    );
    expect(stylesheet).toContain(
      "inset 0 0 0 0.0625rem var(--studio-accent, var(--color-gold-deep)),",
    );
    expect(stylesheet).toContain(
      'button[aria-pressed="true"][style*="--swatch-color"]:focus-visible:not([disabled])',
    );
    expect(stylesheet).toContain(
      "0 0 0 0.3125rem var(--color-focus-contrast) !important;",
    );
    expect(studioStylesheet).toMatch(
      /\.optionSelected\s*\{[\s\S]*?box-shadow:\s*inset 0 0 0 1px var\(--studio-accent\)/,
    );
    expect(studioStylesheet).toMatch(
      /\.optionSelected\s*\{[\s\S]*?background:\s*var\(--studio-accent-soft\)/,
    );
    expect(studioStylesheet).toMatch(
      /\.swatch\.optionSelected\s*\{[\s\S]*?box-shadow:\s*0 0 0 2px var\(--studio-paper\), 0 0 0 3px var\(--studio-accent\)/,
    );
    expect(
      stylesheet.lastIndexOf(
        ":is(a, button, summary):focus-visible:not([disabled])",
      ),
    ).toBeGreaterThan(stylesheet.indexOf(".development-notice__supporting"));
  });

  it("keeps Studio focus, selection, and reduced-motion composition explicit", () => {
    expect(stylesheet).toContain(
      "outline: var(--focus-outline-width) solid var(--color-focus-ring);",
    );
    expect(studioStylesheet).toContain(".optionButton:hover:not(:disabled)");
    expect(studioStylesheet).toContain(".optionButton:disabled,");
    expect(studioStylesheet).toContain("border-style: dashed;");
    expect(studioStylesheet).toMatch(
      /@media \(max-width: 42rem\) \{[\s\S]*?\.conceptList \{[\s\S]*?display: grid;[\s\S]*?grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);[\s\S]*?overflow: visible;/,
    );
    /*
     * PRODUCT2-WESTCOASTKBP-LIGHT-SURFACE-FINAL-REPAIR-0001: `.compareButton`
     * joins the reduced-motion list. Its four interaction states cross-fade
     * their fill, so under `prefers-reduced-motion: reduce` that transition
     * must be dropped like every other one in this stylesheet.
     */
    expect(studioStylesheet).toMatch(
      /@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?\.stageImage,[\s\S]*?\.optionButton,[\s\S]*?\.optionSelected,[\s\S]*?\.compareButton \{\s*transition: none;/,
    );
  });
});
