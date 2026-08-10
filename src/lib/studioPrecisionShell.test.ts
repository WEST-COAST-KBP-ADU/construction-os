import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const workbench = readFileSync(join(root, "src/components/studio/StudioWorkbench.tsx"), "utf8");
const css = readFileSync(join(root, "src/components/studio/StudioWorkbench.module.css"), "utf8");

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
    for (const label of ["Horizontal lap concept", "Vertical panel concept", "Blue concept", "Charcoal concept", "White trim concept — fixed in this preview"]) {
      expect(workbench).toContain(label);
    }
  });

  it("keeps trim informational and outside candidate state", () => {
    expect(workbench).toContain('className={`${styles.dockGroup} ${styles.trimInfo}`}');
    expect(workbench).toContain('aria-label="Fixed trim information"');
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

  it("uses every dedicated swatch", () => {
    expect(workbench).toContain("disabled={disabled}");
    for (const filename of ["studio-swatch-lap-blue-concept-v1.webp", "studio-swatch-panel-blue-concept-v1.webp", "studio-swatch-lap-charcoal-concept-v1.webp", "studio-swatch-panel-charcoal-concept-v1.webp", "studio-swatch-white-trim-concept-v1.webp"]) {
      expect(workbench).toContain(filename);
      expect(() => readFileSync(join(root, "public/images", filename))).not.toThrow();
    }
  });

  it("does not publish prohibited reference labels", () => {
    expect(workbench).not.toMatch(/James Hardie|HardiePlank|HardiePanel|Evening Blue|Iron Gray|Arctic White/);
  });
});
