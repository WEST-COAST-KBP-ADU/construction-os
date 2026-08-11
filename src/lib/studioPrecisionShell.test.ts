import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const workbench = readFileSync(join(root, "src/components/studio/StudioWorkbench.tsx"), "utf8");
const css = readFileSync(join(root, "src/components/studio/StudioWorkbench.module.css"), "utf8");
type TextureGate = { texture_asset: unknown; texture_rights: string; ui_eligible: boolean };
const materialRegistry = JSON.parse(
  readFileSync(join(root, "src/data/materials/james-hardie/2026-08-10.json"), "utf8"),
) as { products: Array<{ profiles: TextureGate[] }>; colors: TextureGate[] };

describe("Studio precision shell", () => {
  it("uses the adopted Studio-local token contract", () => {
    for (const token of ["#1d2225", "#121619", "#e5e6e6", "#9ea0a1", "#5f656a", "#5d8bf4", "#37d880"]) {
      expect(css).toContain(token);
    }
  });

  it("keeps the required dock order and generic truth labels", () => {
    const dock = workbench.slice(workbench.indexOf('<section className={styles.dock}'));
    const orderedMarkers = ["<h2>Launch model</h2>", "{optionKeys.map", "<h2>Trim</h2>", '<h2 id="compare-title">Compare</h2>'];
    orderedMarkers.reduce((last, marker) => {
      const position = dock.indexOf(marker);
      expect(position).toBeGreaterThan(last);
      return position;
    }, -1);
    expect(workbench).toContain('exterior: "Facade system"');
    expect(workbench).toContain('palette: "Facade color"');
    for (const label of ["Horizontal lap concept", "Vertical panel concept", "Blue concept", "Charcoal concept", "White trim concept in the render"]) {
      expect(workbench).toContain(label);
    }
  });

  it("keeps trim informational and outside candidate state", () => {
    expect(workbench).toContain('className={`${styles.dockGroup} ${styles.trimInfo}`}');
    expect(workbench).toContain('aria-label="Fixed trim information"');
    expect(workbench).toContain("No verified close-up");
    expect(workbench).toContain("texture and physical sample unavailable");
    expect(workbench).not.toContain("studio-swatch-white-trim-concept-v1.webp");
    expect(workbench).not.toMatch(/selectOption\([^)]*trim/);
    expect(workbench).not.toMatch(/selections\.trim|trim:/);
  });

  it("keeps the public launch model and comparison A600-only", () => {
    expect(workbench).toContain('const A600_ARCHETYPE_ID = "one-bed-600" as const;');
    expect(workbench).toContain('aria-label="Launch model"');
    expect(workbench).toContain('A600 · One-bedroom ADU · 600 sq ft');
    expect(workbench).not.toContain("{catalog.archetypes.map");
    expect(workbench).not.toMatch(/selectArchetype|setArchetype/);
    expect(workbench).not.toMatch(/studio-450|two-bed-800|Preview pending/);
    expect(workbench).toContain('inputFor(A600_ARCHETYPE_ID, defaults)');
    expect(workbench).toContain('inputFor(A600_ARCHETYPE_ID, { ...defaults, exterior: "dark-siding", palette: "charcoal" })');
  });

  it("fails closed when non-A600 state reaches candidate or restore boundaries", () => {
    expect(workbench).toContain("if (archetype !== A600_ARCHETYPE_ID) throw new Error(PUBLIC_LAUNCH_MODEL_REFUSED);");
    expect(workbench).toContain("if (item.archetype !== A600_ARCHETYPE_ID)");
    expect(workbench).toContain("Restore refused: A600 is the only public launch model.");
    expect(workbench).toContain("disabled={disabled}");
  });

  it("binds each option to its exact full-resolution render detail", () => {
    expect(workbench).toContain("const preview = resolveA600ConceptAsset(");
    expect(workbench).toContain('key === "exterior" ? value : selections.exterior');
    expect(workbench).toContain('key === "palette" ? value : selections.palette');
    expect(workbench).toContain("Verified facade-system detail unavailable.");
    expect(workbench).toContain("Zoomed facade-system detail — no physical texture available.");
    expect(workbench).toContain("<Image src={preview} alt=\"\" fill sizes=\"20vw\" unoptimized />");
    expect(workbench).not.toContain("studio-swatch-");
    expect(css).toContain(".renderDetail img");
    expect(css).toContain("transform: scale(8.5)");
  });

  it("does not present already-stored comparison state as an active action", () => {
    expect(workbench).toContain("const currentAlreadyCompared = comparisonInputs.some(");
    expect(workbench).toContain("disabled={comparisonInputs.length >= 3 || currentAlreadyCompared}");
    expect(workbench).toContain('{currentAlreadyCompared ? "Current added" : "Add current"}');
  });

  it("does not publish prohibited reference labels", () => {
    expect(workbench).not.toMatch(/James Hardie|HardiePlank|HardiePanel|Evening Blue|Iron Gray|Arctic White/);
  });

  it("fails closed while manufacturer texture rights and UI eligibility are absent", () => {
    const entries = [
      ...materialRegistry.products.flatMap((product) => product.profiles),
      ...materialRegistry.colors,
    ];
    expect(entries).toHaveLength(15);
    expect(entries.every((entry) => entry.texture_asset === null)).toBe(true);
    expect(entries.every((entry) => entry.texture_rights === "absent")).toBe(true);
    expect(entries.every((entry) => entry.ui_eligible === false)).toBe(true);
  });
});
