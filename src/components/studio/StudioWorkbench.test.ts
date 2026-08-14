import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { resolveA600ConceptAsset } from "./HardieMotionStage";
import { INITIAL_COMPARISON_STATES } from "./StudioWorkbench";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const WORKBENCH_PATH = path.join(ROOT, "src/components/studio/StudioWorkbench.tsx");
const workbench = readFileSync(WORKBENCH_PATH, "utf8");

function resolvedAssetsFor(states: typeof INITIAL_COMPARISON_STATES): string[] {
  return states.map((state) => {
    const asset = resolveA600ConceptAsset(state.archetype, state.exterior, state.palette);
    expect(asset).not.toBeNull();
    return asset as string;
  });
}

describe("Studio initial comparison seed", () => {
  it("seeds exactly two initial comparison states", () => {
    expect(INITIAL_COMPARISON_STATES.length).toBe(2);
  });

  it("seeds only A600 archetype states", () => {
    for (const state of INITIAL_COMPARISON_STATES) {
      expect(state.archetype).toBe("one-bed-600");
    }
  });

  it("resolves a concept asset for every seeded state", () => {
    for (const state of INITIAL_COMPARISON_STATES) {
      expect(resolveA600ConceptAsset(state.archetype, state.exterior, state.palette)).not.toBeNull();
    }
  });

  it("resolves distinct concept assets across the seeded states", () => {
    const assets = resolvedAssetsFor(INITIAL_COMPARISON_STATES);
    expect(new Set(assets).size).toBe(INITIAL_COMPARISON_STATES.length);
  });

  it("binds every seeded state to a non-empty repository-controlled public asset", () => {
    for (const asset of resolvedAssetsFor(INITIAL_COMPARISON_STATES)) {
      expect(asset.startsWith("/")).toBe(true);
      const assetPath = path.join(ROOT, "public", asset);
      expect(statSync(assetPath).isFile()).toBe(true);
      expect(statSync(assetPath).size).toBeGreaterThan(0);
      expect(readFileSync(assetPath).byteLength).toBeGreaterThan(0);
    }
  });

  it("varies facade and facade color while holding the seeded archetype constant", () => {
    const exteriors = INITIAL_COMPARISON_STATES.map((state) => state.exterior);
    const palettes = INITIAL_COMPARISON_STATES.map((state) => state.palette);
    const archetypes = INITIAL_COMPARISON_STATES.map((state) => state.archetype);

    expect(new Set(exteriors).size).toBe(INITIAL_COMPARISON_STATES.length);
    expect(new Set(palettes).size).toBe(INITIAL_COMPARISON_STATES.length);
    expect(new Set(archetypes).size).toBe(1);
  });

  it("derives the comparison initializer from the exported constant and seeds no disabled archetype", () => {
    expect(workbench).toContain("export const INITIAL_COMPARISON_STATES");
    expect(workbench).toMatch(
      /useState<ConfigurationCandidateInput\[\]>\(\(\) =>\s*INITIAL_COMPARISON_STATES\.map\(/,
    );
    expect(workbench).not.toContain('inputFor("studio-450")');
  });

  it("keeps the archetype selector bound to the full catalog", () => {
    expect(workbench).toContain("catalog.archetypes.map((item) => (");
    expect(workbench).toContain("2026.08.0");
  });
});
