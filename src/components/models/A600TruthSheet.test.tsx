import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import profileJson from "@/src/data/studio/models/executable/adu-a-600@1.0.0.json";
import { A600_EXECUTABLE_PROFILE } from "@/src/lib/studio/executableProfiles";

import A600TruthSheet, {
  A600_TRUTH_SHEET_MODEL_ID,
  A600TruthSheetUnavailable,
  A600TruthSheetView,
  area2Q16sqToWholeSqFt,
  buildA600TruthSheet,
  formatFeetInches,
  formatInches,
  q16ToWholeFeet,
  type A600TruthSheetModel,
} from "./A600TruthSheet";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const ROUTE_PATH = path.join(ROOT, "app/models/[model]/page.tsx");
const COMPONENT_PATH = path.join(ROOT, "src/components/models/A600TruthSheet.tsx");
const STYLES_PATH = path.join(ROOT, "src/components/models/A600TruthSheet.module.css");

const route = readFileSync(ROUTE_PATH, "utf8");
const component = readFileSync(COMPONENT_PATH, "utf8");
const styles = readFileSync(STYLES_PATH, "utf8");

const profile = A600_EXECUTABLE_PROFILE;

async function loadSheet(): Promise<A600TruthSheetModel> {
  const result = await buildA600TruthSheet();

  if (!result.ok) {
    throw new Error(`expected a valid A600 sheet, got ${result.code}`);
  }

  return result.sheet;
}

async function renderSheet(): Promise<string> {
  return renderToStaticMarkup(<A600TruthSheetView sheet={await loadSheet()} />);
}

describe("A600 truth sheet unit conversions", () => {
  it("converts exact q16 lengths to whole feet only when they are whole feet", () => {
    expect(q16ToWholeFeet(3840)).toBe(20);
    expect(q16ToWholeFeet(5760)).toBe(30);
    expect(q16ToWholeFeet(1728)).toBe(9);
    expect(q16ToWholeFeet(2368)).toBeNull();
  });

  it("converts exact q16 lengths to feet and inches", () => {
    expect(formatFeetInches(1728)).toBe("9 ft 0 in");
    expect(formatFeetInches(2368)).toBe("12 ft 4 in");
    expect(formatFeetInches(640)).toBe("3 ft 4 in");
    expect(formatFeetInches(192)).toBe("1 ft 0 in");
    expect(formatFeetInches(1735)).toBe("9 ft 0 7/16 in");
  });

  it("converts exact q16 lengths to inches", () => {
    expect(formatInches(576)).toBe("36 in");
    expect(formatInches(1280)).toBe("80 in");
    expect(formatInches(0)).toBe("0 in");
    expect(formatInches(584)).toBe("36 1/2 in");
  });

  it("converts doubled q16 ring areas to square feet", () => {
    // area2 is twice the shoelace area, so 20 x 30 ft is 2 * 3840 * 5760.
    expect(area2Q16sqToWholeSqFt(2 * 3840 * 5760)).toBe(600);
    expect(area2Q16sqToWholeSqFt(profile.area_accounting.gross_area2_q16sq)).toBe(600);
    expect(area2Q16sqToWholeSqFt(1)).toBeNull();
  });
});

describe("A600 truth sheet projection", () => {
  it("is built from the validated adopted profile", async () => {
    const sheet = await loadSheet();

    expect(sheet.identity).toContainEqual({
      label: "Profile",
      value: `${profile.profile_id} · version ${profile.profile_version}`,
      pointer: "/profile_id",
    });
    expect(sheet.identity).toContainEqual({
      label: "Adoption state",
      value: "owner adopted",
      pointer: "/adoption_state",
    });
    expect(sheet.identity).toContainEqual({
      label: "Maturity",
      value: "concept only",
      pointer: "/maturity",
    });
  });

  it("publishes only geometry the profile fixes, with its exact conversions", async () => {
    const sheet = await loadSheet();
    const value = (label: string) =>
      sheet.geometry.find((fact) => fact.label === label)?.value;

    expect(value("Reference footprint")).toBe("20 × 30 ft");
    expect(value("Reference floor area")).toBe("600 sq ft gross envelope");
    expect(value("Levels")).toBe("1 level (level-0)");
    expect(value("Plate height")).toBe("9 ft 0 in floor to ceiling datum");
    expect(value("Roof form")).toBe("gable, 2 planes");
    expect(value("Roof pitch")).toBe("1 : 3 (4 in 12)");
    expect(value("Eave height")).toBe("9 ft 0 in above the floor datum");
    expect(value("Ridge height")).toBe("12 ft 4 in above the floor datum");
    expect(value("Ridge above eave")).toBe("3 ft 4 in");
    expect(value("Roof overhang")).toBe("12 in at eaves and rakes");
    expect(value("Exterior wall runs")).toBe("11 exterior runs, 11 partitions");
  });

  it("agrees with the raw adopted JSON for every published length", () => {
    expect(profile).toStrictEqual(profileJson);
    expect(profile.levels[0].ceiling_z_q16).toBe(1728);
    expect(Math.max(...profile.roof_vertices.map((v) => v.z_q16))).toBe(2368);
    expect(profile.model_binding.reference_configuration.footprint_width_ft).toBe(20);
    expect(profile.model_binding.reference_configuration.footprint_depth_ft).toBe(30);
  });

  it("schedules exactly the openings hosted on exterior walls", async () => {
    const sheet = await loadSheet();
    const exteriorWallIds = new Set(
      profile.wall_runs
        .filter((wall) => wall.kind === "exterior")
        .map((wall) => wall.wall_id),
    );
    const expected = profile.openings.filter((opening) =>
      exteriorWallIds.has(opening.host_wall_id),
    );

    expect(sheet.openings.total).toBe(expected.length);
    expect(sheet.openings.total).toBe(7);
    expect(sheet.openings.doors).toBe(1);
    expect(sheet.openings.windows).toBe(6);
    expect(sheet.openings.rows.map((row) => row.openingId)).toStrictEqual([
      "d-entry-01",
      "w-bed-01",
      "w-kit-01",
      "w-liv-01",
      "w-liv-02",
      "w-liv-03",
      "w-entry-01",
    ]);
    expect(sheet.openings.rows[0]).toStrictEqual({
      openingId: "d-entry-01",
      kind: "door",
      face: "front",
      nominal: "36 in × 80 in",
      sill: "0 in",
      head: "80 in",
      operation: "swing in",
    });
  });

  it("names no interior opening in the exterior schedule", async () => {
    const sheet = await loadSheet();

    for (const interior of ["d-bed-01", "d-bath-01", "d-stor-01", "o-kit-liv-01", "o-hall-liv-01"]) {
      expect(sheet.openings.rows.some((row) => row.openingId === interior)).toBe(false);
    }
  });

  it("derives the unresolved list from the record rather than prose", async () => {
    const sheet = await loadSheet();
    const titles = sheet.unresolved.map((item) => item.title);

    for (const title of [
      "Wall thickness",
      "Assemblies",
      "Material identity and rights",
      "Trim, roof edge, and drainage",
      "Foundation and grade",
      "Entry landing and step",
      "Mechanical, electrical, and plumbing",
      "Site, parcel, and jurisdiction",
      "Landscaping and hardscape",
      "Net and usable area",
      "Clear opening dimensions and egress",
      "Professional review",
    ]) {
      expect(titles).toContain(title);
    }

    const basis = (title: string) =>
      sheet.unresolved.find((item) => item.title === title)?.basis;

    expect(basis("Wall thickness")).toBe(
      "thickness_q16 is null on 22 of 22 wall runs",
    );
    expect(basis("Assemblies")).toBe(
      "8 of 8 assembly slots are unresolved_semantic",
    );
    expect(basis("Material identity and rights")).toBe(
      "8 of 8 material slots are concept_generic",
    );
    expect(basis("Professional review")).toBe(
      "8 of 8 professional gates are not_evaluated",
    );
    expect(basis("Clear opening dimensions and egress")).toBe(
      "12 of 12 openings have no verified net_clear; the egress_openings gate is not_evaluated",
    );
  });

  it("carries the binding digests in the provenance disclosure", async () => {
    const sheet = await loadSheet();
    const value = (label: string) =>
      sheet.provenance.find((entry) => entry.label === label)?.value;

    expect(value("Profile digest")).toBe(profile.profile_digest);
    expect(value("Release digest")).toBe(profile.model_binding.release_digest);
    expect(value("Geometry source digest")).toBe(
      profile.model_binding.geometry_source_digest,
    );
    expect(value("Reference configuration digest")).toBe(
      profile.model_binding.reference_configuration_digest,
    );
    expect(sheet.evidenceRefs).toStrictEqual(
      profile.provenance.design_input_evidence_refs,
    );
  });
});

describe("A600 truth sheet fails closed", () => {
  it("refuses a profile that is not the adopted A600 record", async () => {
    const drifted = { ...profile, adoption_state: "candidate_not_adopted" };
    const result = await buildA600TruthSheet(drifted);

    expect(result.ok).toBe(false);
  });

  it("refuses a profile whose envelope area contradicts its footprint", async () => {
    const drifted = {
      ...profile,
      area_accounting: {
        ...profile.area_accounting,
        gross_area2_q16sq: profile.area_accounting.gross_area2_q16sq + 73728,
      },
    };
    const result = await buildA600TruthSheet(drifted);

    expect(result.ok).toBe(false);
  });

  it("refuses an unrecognised record instead of guessing", async () => {
    const refused = await buildA600TruthSheet({ schema: "not-a-profile" });

    expect(refused.ok).toBe(false);
    expect(refused).toHaveProperty("code");
  });

  it("renders the validated sheet from the default route entry point", async () => {
    const markup = renderToStaticMarkup(await A600TruthSheet());

    expect(markup).toContain('data-testid="a600-truth-sheet"');
    expect(markup).toContain("600 sq ft gross envelope");
  });

  it("renders a refusal notice carrying no A600 fact", () => {
    const markup = renderToStaticMarkup(
      <A600TruthSheetUnavailable code="XG_DIGEST_MISMATCH" pointer="/profile_digest" />,
    );

    expect(markup).toContain('data-testid="a600-truth-sheet-unavailable"');
    expect(markup).toContain("XG_DIGEST_MISMATCH");
    expect(markup).not.toContain("600 sq ft");
    expect(markup).not.toContain("20 × 30 ft");
    expect(markup).not.toContain("9 ft 0 in");
    expect(markup).not.toContain(profile.profile_digest);
  });

  it("never falls back to another model record", () => {
    expect(component).not.toContain("adu-b-800");
    expect(component).not.toContain("adu-s-450");
    expect(component).toContain("no A600 fact is shown");
  });
});

describe("A600 truth sheet publishes no surrogate and no forbidden claim", () => {
  it("renders no image, canvas, or drawing primitive", async () => {
    const markup = await renderSheet();

    for (const tag of ["<img", "<svg", "<canvas", "<picture", "<video", "background-image"]) {
      expect(markup).not.toContain(tag);
    }

    expect(component).not.toContain("next/image");
    expect(styles).not.toContain("background-image");
    expect(styles).not.toContain("url(");
  });

  it("states the concept boundary in customer copy", async () => {
    const markup = await renderSheet();

    expect(markup).toContain("Owner-adopted concept geometry record");
    expect(markup).toContain(
      "It is not a permit set, a construction document, a property fit, a material specification, a price, a schedule, an availability statement, or a buildability conclusion.",
    );
    expect(markup).toContain("Requires official source verification.");
  });

  it("claims no price, schedule, permit, or manufacturer fact", async () => {
    const markup = (await renderSheet()).toLowerCase();

    for (const claim of [
      "$",
      "usd",
      "per sq ft",
      "starting at",
      "available",
      "weeks to build",
      "lead time",
      "permit-ready",
      "permit ready",
      "code compliant",
      "buildable",
      "james hardie",
      "hardie",
      "stucco system",
    ]) {
      expect(markup).not.toContain(claim);
    }

    // Material and rights language may appear only as an explicit denial.
    expect(markup).toContain(
      "no manufacturer, product line, colour, finish, warranty, or licensing fact is recorded",
    );
    expect(markup.split("manufacturer").length - 1).toBe(2);
    expect(markup.split("warranty").length - 1).toBe(1);
  });

  it("keeps adopted facts and unresolved facts semantically distinct", async () => {
    const markup = await renderSheet();

    expect(markup).toContain("Fixed geometry");
    expect(markup).toContain("Not resolved by this record");
    expect(markup).toContain('id="a600-unresolved-title"');
    expect(markup).toContain('aria-labelledby="a600-unresolved-title"');
    expect(styles).toContain(".unresolvedBlock");
    expect(styles).toContain(".unresolvedItem");
  });

  it("keeps provenance available without dominating the customer view", async () => {
    const markup = await renderSheet();

    expect(markup).toContain("<details");
    expect(markup).toContain("Source, profile, and release binding");
    expect(markup).not.toContain("<details open");
  });

  it("stays responsive without horizontal page overflow", () => {
    expect(styles).toContain("overflow-x: auto");
    expect(styles).toContain("max-width: 100%");
    expect(styles).toContain("@media (max-width: 48rem)");
    expect(styles).toContain("grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr))");
  });
});

describe("A600 truth sheet route wiring", () => {
  it("is mounted on the A600 model route only", () => {
    expect(A600_TRUTH_SHEET_MODEL_ID).toBe("adu-a-600");
    expect(route).toContain(
      "{model.modelId === A600_TRUTH_SHEET_MODEL_ID ? <A600TruthSheet /> : null}",
    );
    expect(route).toContain("<ModelDetail catalog={catalog} model={model} />");
    expect(route).toContain("export const dynamicParams = false;");
    expect(route).toContain("export async function generateStaticParams()");
    expect(route).toContain("export async function generateMetadata(");
  });
});
