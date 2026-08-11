import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { resolveA600ConceptAsset } from "./HardieMotionStage";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const component = readFileSync(path.join(ROOT, "src/components/studio/HardieMotionStage.tsx"), "utf8");
const styles = readFileSync(path.join(ROOT, "src/components/studio/HardieMotionStage.module.css"), "utf8");
const workbench = readFileSync(path.join(ROOT, "src/components/studio/StudioWorkbench.tsx"), "utf8");

describe("A600 source render viewport", () => {
  it.each([
    ["lap-siding", "sage", "/images/adu-600-hardie-plank-evening-blue-concept-v1.webp"],
    ["lap-siding", "charcoal", "/images/adu-600-hardie-plank-iron-gray-concept-v1.webp"],
    ["dark-siding", "sage", "/images/adu-600-hardie-panel-evening-blue-concept-v1.webp"],
    ["dark-siding", "charcoal", "/images/adu-600-hardie-panel-iron-gray-concept-v1.webp"],
  ])("maps the exact A600 %s / %s source", (exterior, palette, asset) => {
    expect(resolveA600ConceptAsset("one-bed-600", exterior, palette)).toBe(asset);
  });

  it("fails closed for unsupported selections and non-A600 models", () => {
    expect(resolveA600ConceptAsset("one-bed-600", "stucco-smooth", "sage")).toBeNull();
    expect(resolveA600ConceptAsset("one-bed-600", "lap-siding", "warm-white")).toBeNull();
    expect(resolveA600ConceptAsset("studio-450", "lap-siding", "sage")).toBeNull();
    expect(component).toContain("The viewport fails closed when an exact A600 render is not mapped.");
    expect(component).not.toContain("fallbackImage");
  });

  it("keeps the lossy source inside its exact Retina display budget", () => {
    expect(component).toContain('sizes="(max-width: 836px) 100vw, 836px"');
    expect(component).toContain("unoptimized");
    expect(styles).toContain("width: min(100%, 836px)");
    expect(styles).toContain("aspect-ratio: 1672 / 941");
    expect(styles).toContain("object-fit: contain");
    expect(styles).not.toContain("object-fit: cover");
  });

  it("uses bounded Motion primitives and honors reduced motion", () => {
    expect(component).toContain('from "motion/react"');
    expect(component).toContain("useReducedMotion()");
    expect(component).toContain("duration: reduceMotion ? 0 : 0.22");
    expect(component).toContain("<AnimatePresence initial={false}");
    expect(workbench).toContain('<MotionConfig reducedMotion="user">');
    expect(workbench).toContain("duration: reduceMotion ? 0 : 0.18");
  });

  it("never manufactures apparent detail with blur, scale, filters or sweeps", () => {
    for (const banned of ["blur(", "backdrop-filter", "filter:", "scale(", "materialSweep", "Replay transition"]) {
      expect(component).not.toContain(banned);
      expect(styles).not.toContain(banned);
    }
  });

  it("uses generic concept labels and retains the physical-sample boundary", () => {
    for (const label of ["Horizontal lap", "Vertical panel", "Blue study", "Charcoal study"]) {
      expect(component).toContain(label);
      expect(workbench).toContain(label);
    }

    for (const productClaim of ["Hardie Plank", "Hardie Panel", "Evening Blue", "Iron Gray", "Matched Hardie"]) {
      expect(component).not.toContain(productClaim);
      expect(workbench).not.toContain(productClaim);
    }

    expect(component).toContain("physical sample and local availability verification required");
    expect(component).toContain("Not a completed West Coast KBP project");
  });
});
