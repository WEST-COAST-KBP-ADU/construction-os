import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const stylesheet = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");
const compareRoute = readFileSync(resolve(process.cwd(), "app/compare/page.tsx"), "utf8");
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

describe("portal visual-system regressions", () => {
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
      const inverseMutedInk = token(tokens, "--color-ink-inverse-muted");
      const headingInk = token(tokens, "--color-forest-deep");
      const darkSurface = token(tokens, "--color-forest-deep-surface");
      const bronze = token(tokens, "--color-gold");

      expect(contrastRatio(mutedInk, surface)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(mutedInk, mutedSurface)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(headingInk, mutedSurface)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(inverseMutedInk, darkSurface)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(bronze, darkSurface)).toBeGreaterThanOrEqual(4.5);
    }

    expect(stylesheet).toMatch(
      /\.brand__tagline\s*\{[\s\S]*?color:\s*var\(--color-ink-muted\)/,
    );
    expect(stylesheet).toMatch(
      /\.development-notice__label\s*\{[\s\S]*?color:\s*var\(--color-forest-deep\)/,
    );
    expect(stylesheet).toMatch(
      /\.development-notice__supporting\s*\{[\s\S]*?color:\s*var\(--color-ink-muted\)/,
    );
    expect(stylesheet).toMatch(
      /\.breadcrumb\s*\{[\s\S]*?color:\s*var\(--color-ink-muted\)/,
    );
    expect(stylesheet).toMatch(
      /\.content-section--dark \.content-section__intro\s*\{[\s\S]*?color:\s*var\(--color-ink-inverse-muted\)/,
    );
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
      const gold = token(tokens, "--color-gold-deep");
      const canvas = token(tokens, "--color-canvas");
      const surface = token(tokens, "--color-surface");
      const mutedSurface = token(tokens, "--color-surface-muted");
      const raisedSurface = token(tokens, "--color-surface-raised");
      const forestSurface = token(tokens, "--color-forest-deep-surface");

      expect(warning).not.toBe(gold);
      expect(focus).not.toBe(gold);
      expect(focus).not.toBe(warning);
      expect(contrastRatio(line, canvas)).toBeGreaterThanOrEqual(3);
      expect(contrastRatio(line, surface)).toBeGreaterThanOrEqual(3);
      expect(contrastRatio(line, mutedSurface)).toBeGreaterThanOrEqual(3);
      expect(contrastRatio(line, raisedSurface)).toBeGreaterThanOrEqual(3);
      expect(contrastRatio(focus, canvas)).toBeGreaterThanOrEqual(3);
      expect(contrastRatio(focus, forestSurface)).toBeGreaterThanOrEqual(3);
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
      /\.swatch\.optionSelected\s*\{[\s\S]*?box-shadow:\s*0 0 0 2px var\(--studio-paper\), 0 0 0 3px var\(--studio-accent\)/,
    );
    expect(
      stylesheet.lastIndexOf(
        ":is(a, button, summary):focus-visible:not([disabled])",
      ),
    ).toBeGreaterThan(stylesheet.indexOf(".development-notice__supporting"));
  });
  });
});
