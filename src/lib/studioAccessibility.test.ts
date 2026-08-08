import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const stylesheet = readFileSync(
  resolve(process.cwd(), "src/components/studio/StudioWorkbench.module.css"),
  "utf8",
);
const workbench = readFileSync(
  resolve(process.cwd(), "src/components/studio/StudioWorkbench.tsx"),
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

describe("Studio comparison accessibility", () => {
  it("keeps the comparison action readable at rest and on hover", () => {
    const pageTokens = stylesheet.match(/\.page\s*\{([\s\S]*?)\n\}/)?.[1];
    const compareRule = stylesheet.match(/\.compareButton\s*\{([\s\S]*?)\n\}/)?.[1];
    const hoverRule = stylesheet.match(/\.compareButton:hover\s*\{([\s\S]*?)\n\}/)?.[1];

    expect(pageTokens).toBeDefined();
    expect(compareRule).toContain("background: var(--studio-accent-dark)");
    expect(hoverRule).toContain("background: var(--studio-ink)");

    const restingBackground = token(pageTokens!, "--studio-accent-dark");
    const hoverBackground = token(pageTokens!, "--studio-ink");

    expect(contrastRatio("#ffffff", restingBackground)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#ffffff", hoverBackground)).toBeGreaterThanOrEqual(4.5);
  });

  it("connects the disclosure button to its conditional comparison panel", () => {
    expect(workbench).toMatch(
      /className=\{styles\.compareButton\}[\s\S]*?aria-expanded=\{comparisonOpen\}[\s\S]*?aria-controls="studio-comparison-panel"/,
    );
    expect(workbench).toMatch(
      /comparisonOpen\s*\?\s*\([\s\S]*?<section[\s\S]*?id="studio-comparison-panel"[\s\S]*?aria-labelledby="comparison-heading"/,
    );
    expect(workbench.match(/aria-controls="studio-comparison-panel"/g)).toHaveLength(1);
    expect(workbench.match(/id="studio-comparison-panel"/g)).toHaveLength(1);
  });
});
