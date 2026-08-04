import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const stylesheet = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");
const compareRoute = readFileSync(resolve(process.cwd(), "app/compare/page.tsx"), "utf8");

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
});
