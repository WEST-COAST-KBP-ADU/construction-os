import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import PropertyFitLab from "./PropertyFitLab";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const source = readFileSync(path.join(HERE, "PropertyFitLab.tsx"), "utf8");
const styles = readFileSync(path.join(HERE, "PropertyFitLab.module.css"), "utf8");
const markup = renderToStaticMarkup(<PropertyFitLab />);

describe("PropertyFitLab", () => {
  it("renders the synthetic boundary and exact uncertainty copy", () => {
    expect(markup).toContain("Synthetic lab");
    expect(markup.match(/Requires official source verification\./g)).toHaveLength(2);
    expect(markup).toContain("Conceptual geometry screening only. Not a survey, zoning determination, permit decision, or construction feasibility finding.");
  });

  it("renders all canonical archetypes, controls, and semantic states", () => {
    for (const value of ["studio-450", "one-bed-600", "two-bed-800", "400–500 sq ft", "550–650 sq ft", "750–850 sq ft"]) {
      expect(markup).toContain(value);
    }
    for (const label of ["Rotate footprint 90°", "Previous valid candidate", "Next valid candidate", "Assumed buffer", "Assumed exclusions", "Reset lab"]) {
      expect(markup).toContain(label);
    }
    for (const term of ["synthetic", "assumed", "unknown", "human-review-required"]) {
      expect(markup).toContain(term);
    }
  });

  it("keeps every visible control native and state-bound", () => {
    expect(markup.match(/<button/g)).toHaveLength(9);
    expect(source.match(/onClick=/g)?.length).toBeGreaterThanOrEqual(7);
    expect(markup).not.toContain("disabled");
    expect(markup).toContain('aria-live="polite"');
    expect(markup).toContain('role="img"');
  });

  it("has a 320-safe layout and reduced-motion contract", () => {
    expect(styles).toMatch(/@media \(max-width: 360px\)/);
    expect(styles).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
    expect(styles).toContain("overflow-wrap: anywhere");
  });

  it("contains no collection, egress, persistence, or analytics implementation", () => {
    expect(source).not.toMatch(/<input|<form|fetch\(|XMLHttpRequest|localStorage|sessionStorage|document\.cookie|analytics|sendBeacon/i);
  });
});
