import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const stylesheet = readFileSync(resolve(process.cwd(), "src/components/studio/StudioWorkbench.module.css"), "utf8");
const workbench = readFileSync(resolve(process.cwd(), "src/components/studio/StudioWorkbench.tsx"), "utf8");

function luminance(hex: string): number {
  const channels = hex.slice(1).match(/.{2}/g)!.map((part) => Number.parseInt(part, 16) / 255).map((value) =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(foreground: string, background: string): number {
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

describe("A600 Architectural Instrument accessibility", () => {
  it("keeps primary instrument text and the comparison action above AA contrast", () => {
    expect(contrast("#f0f3f4", "#090b0d")).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#071018", "#67adf7")).toBeGreaterThanOrEqual(4.5);
    expect(stylesheet).toContain("--studio-ink: #f0f3f4");
    expect(stylesheet).toContain("--studio-black: #090b0d");
    expect(stylesheet).toContain("background: var(--studio-blue)");
    expect(stylesheet).toContain("color: #071018");
  });

  it("provides keyboard focus and at least 44px controls", () => {
    expect(stylesheet).toContain(".page button:focus-visible");
    expect(stylesheet).toContain("outline: 2px solid var(--studio-blue-bright)");
    expect(stylesheet).toContain("min-height: 2.75rem");
    expect(stylesheet).toContain("min-height: 4rem");
  });

  it("exposes the three working views as a labelled tab interface", () => {
    expect(workbench).toContain('role="tablist"');
    expect(workbench).toContain('role="tab"');
    expect(workbench).toContain("aria-selected={selected}");
    expect(workbench).toContain('role="tabpanel"');
    expect(workbench).toContain('aria-controls="studio-mode-panel"');
    expect(workbench).toContain("aria-labelledby={`studio-mode-${mode}`}");
  });

  it("connects the comparison disclosure to one conditional panel", () => {
    expect(workbench).toMatch(/className=\{styles\.compareButton\}[\s\S]*?aria-expanded=\{comparisonOpen\}[\s\S]*?aria-controls="studio-comparison-panel"/);
    expect(workbench).toContain('id="studio-comparison-panel"');
    expect(workbench).toContain('aria-labelledby="comparison-heading"');
    expect(workbench.match(/aria-controls="studio-comparison-panel"/g)).toHaveLength(1);
    expect(workbench.match(/id="studio-comparison-panel"/g)).toHaveLength(1);
  });

  it("keeps the unverified site state fail-closed and input-free", () => {
    expect(workbench).toContain("SITE-GATE / FAIL-CLOSED");
    expect(workbench).toContain("No parcel is loaded.");
    expect(workbench).toContain("No buildability conclusion is made.");
    expect(workbench).toContain("No address or contact information is collected in Studio.");
    expect(workbench).not.toContain("<input");
    expect(workbench).not.toContain("<form");
  });
});
