import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const COMPONENT_PATH = path.join(ROOT, "src/components/studio/HardieMotionStage.tsx");
const STYLES_PATH = path.join(ROOT, "src/components/studio/HardieMotionStage.module.css");
const WORKBENCH_PATH = path.join(ROOT, "src/components/studio/StudioWorkbench.tsx");
const component = readFileSync(COMPONENT_PATH, "utf8");
const styles = readFileSync(STYLES_PATH, "utf8");
const workbench = readFileSync(WORKBENCH_PATH, "utf8");

const ASSETS = [
  "adu-600-hardie-plank-evening-blue-concept-v1.webp",
  "adu-600-hardie-panel-evening-blue-concept-v1.webp",
  "adu-600-hardie-plank-iron-gray-concept-v1.webp",
  "adu-600-hardie-panel-iron-gray-concept-v1.webp",
] as const;

describe("A600 exterior concept motion preview", () => {
  it("binds four repository-controlled matched-material assets", () => {
    for (const asset of ASSETS) {
      const assetPath = path.join(ROOT, "public/images", asset);
      const bytes = readFileSync(assetPath);
      expect(statSync(assetPath).size).toBeGreaterThan(100_000);
      expect(bytes.subarray(0, 4).toString("ascii")).toBe("RIFF");
      expect(bytes.subarray(8, 12).toString("ascii")).toBe("WEBP");
      expect(component).toContain(`/images/${asset}`);
    }
  });

  it("B-1 uses generic public and configuration-facing concept labels", () => {
    for (const label of [
      "Horizontal lap concept",
      "Vertical panel concept",
      "Blue concept",
      "Charcoal concept",
    ]) {
      expect(component).toContain(label);
      expect(workbench).toContain(label);
    }

    for (const productClaim of [
      "Hardie Plank",
      "Hardie Panel",
      "Evening Blue",
      "Iron Gray",
      "Matched Hardie",
    ]) {
      expect(component).not.toContain(productClaim);
      expect(workbench).not.toContain(productClaim);
    }

    expect(component).toContain(
      "Concept render · physical sample and local availability verification required",
    );
  });

  it("B-2 remounts the stage on model changes and transitions only resolved A600 assets", () => {
    expect(workbench).toMatch(
      /<HardieMotionStage\s+key=\{archetype\}[\s\S]*?modelId=\{archetype\}/,
    );
    expect(component).toContain("previous: resolvedAsset ? current.current : null");
    expect(component).toContain("previewAvailable && renderState.current");
  });

  it("B-3 fails closed without an image for unmatched model previews", () => {
    expect(component).toContain(": null;");
    expect(component).toContain("This model stays image-free until a matched new-construction render exists.");
    expect(component).not.toContain("fallbackImage");
    expect(workbench).not.toContain("fallbackImage=");
    expect(workbench).toMatch(
      /item\.archetype === "one-bed-600"[\s\S]*?\? resolveStudioAsset\([\s\S]*?: null;/,
    );
    expect(workbench).toContain("<span>Preview pending</span>");
  });

  it("B-4 removes the unverified material lens", () => {
    expect(component).not.toContain("materialLens");
    expect(component).not.toContain("lensImage");
    expect(styles).not.toContain(".materialLens");
    expect(styles).not.toContain(".lensImage");
  });

  it("keeps same-model motion bounded and honors reduced-motion preferences", () => {
    expect(component).toContain("1150");
    expect(component).toContain("Replay transition");
    expect(styles).toContain("@media (prefers-reduced-motion: reduce)");
    expect(styles).toContain("animation: none;");
  });

  it("labels conceptual status and physical-sample boundary", () => {
    expect(component).toContain("Concept render · physical sample");
    expect(component).toContain("Conceptual — not a completed West Coast KBP project.");
  });
});
