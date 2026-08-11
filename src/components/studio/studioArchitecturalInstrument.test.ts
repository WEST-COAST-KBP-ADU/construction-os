import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();
const packageJson = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const workbench = readFileSync(resolve(root, "src/components/studio/StudioWorkbench.tsx"), "utf8");
const planViewport = readFileSync(resolve(root, "src/components/studio/ArchitecturalPlanViewport.tsx"), "utf8");
const styles = readFileSync(resolve(root, "src/components/studio/StudioWorkbench.module.css"), "utf8");
const planSource = readFileSync(resolve(root, "public/design/a600/A600-CONCEPT-TESTFIT-001.svg"));
const profile = JSON.parse(readFileSync(resolve(root, "src/data/studio/models/executable/adu-a-600@1.0.0.json"), "utf8"));

describe("STUDIO-ARCHITECTURAL-INSTRUMENT-001", () => {
  it("pins Motion and uses the reduced-motion-safe feature bundle", () => {
    expect(packageJson.dependencies.motion).toBe("13.1.0");
    expect(workbench).toContain("LazyMotion");
    expect(workbench).toContain("domAnimation");
    expect(workbench).toContain('<MotionConfig reducedMotion="user">');
  });

  it("publishes the accepted A600 vector byte-for-byte", () => {
    expect(createHash("sha256").update(planSource).digest("hex")).toBe(
      "54cb40a6212916d83ab5638ae05330d113a06dc9c09a03fe5f120875f03da5f4",
    );
    expect(planViewport).toContain('/design/a600/A600-CONCEPT-TESTFIT-001.svg');
    expect(styles).toContain("width: 421.052632%");
    expect(styles).toContain("top: -172.670807%");
  });

  it("binds the owner-adopted executable profile and exact A600 facts", () => {
    expect(profile.profile_id).toBe("adu-a-600-profile-owner-adopted");
    expect(profile.adoption_state).toBe("owner_adopted");
    expect(profile.maturity).toBe("concept_only");
    expect(profile.model_binding.reference_configuration.footprint_width_ft).toBe(20);
    expect(profile.model_binding.reference_configuration.footprint_depth_ft).toBe(30);
    expect(profile.plan_regions).toHaveLength(7);
    expect(profile.openings).toHaveLength(12);
    expect(workbench).toContain("20 × 30 ft");
    expect(workbench).toContain("600 sq ft");
  });

  it("keeps Studio A600-only with three functional modes", () => {
    expect(workbench).toContain('type InstrumentMode = "exterior" | "plan" | "site"');
    expect(workbench).toContain('id: "exterior"');
    expect(workbench).toContain('id: "plan"');
    expect(workbench).toContain('id: "site"');
    expect(workbench).not.toContain("A450");
    expect(workbench).not.toContain("A800");
    expect(workbench).not.toContain('"studio-450"');
    expect(workbench).not.toContain('"two-bed-800"');
  });

  it("preserves compare, restore and deterministic ID actions", () => {
    expect(workbench).toContain("addCurrentConcept");
    expect(workbench).toContain("restoreConcept");
    expect(workbench).toContain("copyConfigurationId");
    expect(workbench).toContain("buildConfigurationCandidate");
  });

  it("contains no gradient, blur, parallax, zoom or synthetic-detail treatment", () => {
    for (const banned of ["linear-gradient", "radial-gradient", "backdrop-filter", "blur(", "scale(", "parallax", "materialSweep"]) {
      expect(workbench).not.toContain(banned);
      expect(styles).not.toContain(banned);
    }
  });
});
