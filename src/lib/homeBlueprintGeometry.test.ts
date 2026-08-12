import { describe, expect, it } from "vitest";

import profileData from "../data/studio/models/executable/adu-a-600@1.0.0.json";

import {
  AREA2_Q16SQ_PER_SQUARE_FOOT,
  HOME_BLUEPRINT_ADOPTION_SEAL,
  HOME_BLUEPRINT_PHASES,
  HOME_BLUEPRINT_PHASE_ORDER,
  HOME_BLUEPRINT_PROJECT_DRAWING,
  HOME_BLUEPRINT_PROJECT_MOTION_STATES,
  HOME_BLUEPRINT_RAIL_PHASES,
  HOME_BLUEPRINT_SHEET_LAYOUT,
  HomeBlueprintGeometryRefusal,
  area2ToSquareFeet,
  deriveHomeBlueprintDrawing,
  formatFeetInches,
  homeBlueprintPhaseIndex,
  isHomeBlueprintPhase,
  verifyHomeBlueprintProjectGeometry,
} from "./homeBlueprintGeometry";
import type { ExecutableGeometryProfile } from "./studio/executableGeometryTypes";

const ADOPTED = profileData as unknown as ExecutableGeometryProfile;

function clone(): ExecutableGeometryProfile {
  return structuredClone(ADOPTED);
}

/* ------------------------------------------------------------------------ */
/* Independent re-derivation, written against the raw profile rather than    */
/* against the module under test.                                            */
/* ------------------------------------------------------------------------ */

const LAYOUT = HOME_BLUEPRINT_SHEET_LAYOUT;
const PLAN_WIDTH = Math.max(...ADOPTED.plan_vertices.map((vertex) => vertex.x_q16));
const PLAN_DEPTH = Math.max(...ADOPTED.plan_vertices.map((vertex) => vertex.y_q16));
const ELEVATION_ORIGIN_X = LAYOUT.planOriginX + PLAN_WIDTH + LAYOUT.gutterQ16;
const ELEVATION_GROUND_Y = LAYOUT.planOriginY + PLAN_DEPTH;

function vertex(vertexId: string) {
  const found = ADOPTED.plan_vertices.find((candidate) => candidate.vertex_id === vertexId);
  if (found === undefined) {
    throw new Error(`missing test vertex ${vertexId}`);
  }
  return found;
}

function planSheet(x: number, y: number): [number, number] {
  return [LAYOUT.planOriginX + x, LAYOUT.planOriginY + (PLAN_DEPTH - y)];
}

function elevationSheet(x: number, z: number): [number, number] {
  return [ELEVATION_ORIGIN_X + x, ELEVATION_GROUND_Y - z];
}

function numbersIn(pathData: string): number[] {
  return (pathData.match(/-?\d+/g) ?? []).map(Number);
}

function pairsIn(pathData: string): Array<[number, number]> {
  const values = numbersIn(pathData);
  const pairs: Array<[number, number]> = [];
  for (let index = 0; index + 1 < values.length; index += 2) {
    pairs.push([values[index], values[index + 1]]);
  }
  return pairs;
}

/** Every plan coordinate the authored profile can legitimately produce. */
function allowedPlanCoordinates(): { xs: Set<number>; ys: Set<number> } {
  const xs = new Set<number>();
  const ys = new Set<number>();

  for (const planVertex of ADOPTED.plan_vertices) {
    xs.add(planVertex.x_q16);
    ys.add(planVertex.y_q16);
  }

  for (const wall of ADOPTED.wall_runs) {
    const start = vertex(wall.start_vertex_id);
    const end = vertex(wall.end_vertex_id);
    const length = Math.hypot(end.x_q16 - start.x_q16, end.y_q16 - start.y_q16);
    const ux = (end.x_q16 - start.x_q16) / length;
    const uy = (end.y_q16 - start.y_q16) / length;

    for (const openingId of wall.opening_ids) {
      const opening = ADOPTED.openings.find((candidate) => candidate.opening_id === openingId);
      if (opening === undefined) {
        throw new Error(`missing test opening ${openingId}`);
      }
      for (const distance of [opening.offset_q16, opening.offset_q16 + opening.cut_width_q16]) {
        xs.add(start.x_q16 + ux * distance);
        ys.add(start.y_q16 + uy * distance);
      }
    }
  }

  return { xs, ys };
}

/** Every front-elevation coordinate the authored profile can legitimately produce. */
function allowedElevationCoordinates(): { xs: Set<number>; zs: Set<number> } {
  const level = ADOPTED.levels[0];
  const overhang = Math.max(...ADOPTED.roof_edges.map((edge) => edge.overhang_q16));
  const ridge = [...ADOPTED.roof_vertices].sort((left, right) => right.z_q16 - left.z_q16)[0];
  const pitch = ADOPTED.roof_planes[0].pitch;

  const xs = new Set<number>([0, PLAN_WIDTH, -overhang, PLAN_WIDTH + overhang, ridge.x_q16]);
  const zs = new Set<number>([
    level.floor_z_q16,
    level.ceiling_z_q16,
    ridge.z_q16,
    level.ceiling_z_q16 - (overhang * pitch.rise) / pitch.run,
  ]);

  for (const wall of ADOPTED.wall_runs) {
    const start = vertex(wall.start_vertex_id);
    const end = vertex(wall.end_vertex_id);
    if (wall.kind !== "exterior" || start.y_q16 !== 0 || end.y_q16 !== 0) {
      continue;
    }
    const direction = Math.sign(end.x_q16 - start.x_q16);
    for (const openingId of wall.opening_ids) {
      const opening = ADOPTED.openings.find((candidate) => candidate.opening_id === openingId);
      if (opening === undefined) {
        throw new Error(`missing test opening ${openingId}`);
      }
      xs.add(start.x_q16 + direction * opening.offset_q16);
      xs.add(start.x_q16 + direction * (opening.offset_q16 + opening.cut_width_q16));
      zs.add(opening.sill_q16);
      zs.add(opening.head_q16);
    }
  }

  return { xs, zs };
}

/* ------------------------------------------------------------------ tests */

describe("home blueprint units and formatting", () => {
  it("formats authored q16 lengths as drafting dimension strings", () => {
    expect(formatFeetInches(3840)).toBe("20'-0\"");
    expect(formatFeetInches(5760)).toBe("30'-0\"");
    expect(formatFeetInches(1728)).toBe("9'-0\"");
    expect(formatFeetInches(2368)).toBe("12'-4\"");
    expect(formatFeetInches(192)).toBe("1'-0\"");
  });

  it("keeps sub-inch remainders as reduced sixteenths", () => {
    expect(formatFeetInches(2376)).toBe("12'-4 1/2\"");
    expect(formatFeetInches(2369)).toBe("12'-4 1/16\"");
  });

  it("converts authored doubled areas to square feet", () => {
    expect(AREA2_Q16SQ_PER_SQUARE_FOOT).toBe(73728);
    expect(area2ToSquareFeet(ADOPTED.area_accounting.gross_area2_q16sq)).toBe(600);
  });
});

describe("home blueprint phase contract", () => {
  it("declares the five canonical phases in drafting order", () => {
    expect(HOME_BLUEPRINT_PHASE_ORDER).toEqual(["lead", "project", "plan", "build", "record"]);
    expect(HOME_BLUEPRINT_PHASES.map((phase) => phase.id)).toEqual([...HOME_BLUEPRINT_PHASE_ORDER]);
    expect(HOME_BLUEPRINT_PHASES.map((phase) => phase.index)).toEqual([0, 1, 2, 3, 4]);
  });

  it("is the union of the integration rail and the Project chapter motion states", () => {
    const union = [...new Set([...HOME_BLUEPRINT_RAIL_PHASES, ...HOME_BLUEPRINT_PROJECT_MOTION_STATES])];
    expect([...union].sort()).toEqual([...HOME_BLUEPRINT_PHASE_ORDER].sort());
    expect(HOME_BLUEPRINT_RAIL_PHASES).toEqual(["lead", "project", "record"]);
    expect(HOME_BLUEPRINT_PROJECT_MOTION_STATES).toEqual(["plan", "build", "record"]);
  });

  it("marks rail and Project-state membership consistently on every descriptor", () => {
    for (const phase of HOME_BLUEPRINT_PHASES) {
      expect(phase.rail).toBe((HOME_BLUEPRINT_RAIL_PHASES as readonly string[]).includes(phase.id));
      expect(phase.projectState).toBe(
        (HOME_BLUEPRINT_PROJECT_MOTION_STATES as readonly string[]).includes(phase.id),
      );
      expect(phase.holdMs).toBeGreaterThan(1500);
    }
  });

  it("declares one distinct drafting beat per phase", () => {
    expect(HOME_BLUEPRINT_PHASES.map((phase) => phase.beat)).toEqual([
      "stroke reveal",
      "layer registration",
      "dimension annotation",
      "sheet alignment",
      "record seal",
    ]);
  });

  it("resolves phase indexes and guards unknown phase names", () => {
    expect(homeBlueprintPhaseIndex("plan")).toBe(2);
    expect(isHomeBlueprintPhase("record")).toBe(true);
    expect(isHomeBlueprintPhase("permit")).toBe(false);
  });

  it("emits every phase's marks and only phases that exist", () => {
    const drawn = new Set([
      ...HOME_BLUEPRINT_PROJECT_DRAWING.paths.map((path) => path.phase),
      ...HOME_BLUEPRINT_PROJECT_DRAWING.dimensions.map((dimension) => dimension.phase),
    ]);
    expect([...drawn].sort()).toEqual([...HOME_BLUEPRINT_PHASE_ORDER].sort());
  });
});

describe("home blueprint geometry binding", () => {
  const drawing = HOME_BLUEPRINT_PROJECT_DRAWING;

  it("binds to the owner-adopted A600 profile and reports its exact provenance", () => {
    expect(drawing.chapter).toBe("project");
    expect(drawing.provenance.profileId).toBe("adu-a-600-profile-owner-adopted");
    expect(drawing.provenance.adoptionState).toBe("owner_adopted");
    expect(drawing.provenance.profileDigest).toBe(HOME_BLUEPRINT_ADOPTION_SEAL.profileDigest);
    expect(drawing.provenance.modelId).toBe(ADOPTED.model_binding.model_id);
    expect(drawing.provenance.releaseDigest).toBe(ADOPTED.model_binding.release_digest);
    expect(drawing.provenance.geometrySourceDigest).toBe(ADOPTED.model_binding.geometry_source_digest);
  });

  it("reports the profile's real maturity and gate state without softening it", () => {
    expect(drawing.provenance.maturity).toBe("concept_only");
    expect(drawing.provenance.gatesTotal).toBe(8);
    expect(drawing.provenance.gatesReviewed).toBe(0);
    expect(drawing.recordBlock.disclaimer).toContain("Not a construction document");
  });

  it("generates the gross envelope ring from the authored ring, not from a bounding box", () => {
    const envelopePath = drawing.paths.find((path) => path.kind === "envelope");
    const ring = ADOPTED.gross_envelopes[0].ring_vertex_ids.slice(0, -1);
    const expected = `M ${ring
      .map((vertexId) => {
        const source = vertex(vertexId);
        return planSheet(source.x_q16, source.y_q16).join(" ");
      })
      .join(" L ")} Z`;

    expect(envelopePath?.d).toBe(expected);
    // The authored ring keeps collinear vertices; a bounding box would have four.
    expect(envelopePath?.sourcePoints).toHaveLength(11);
  });

  it("cuts every opening out of its host wall run rather than drawing over it", () => {
    // wall-front-entry runs 3072 -> 3840 and hosts d-entry-01 at offset 96, width 576.
    const segments = drawing.paths.filter((path) => path.id.startsWith("segment-wall-front-entry-"));
    expect(segments.map((segment) => segment.d)).toEqual([
      `M ${planSheet(3072, 0).join(" ")} L ${planSheet(3168, 0).join(" ")}`,
      `M ${planSheet(3744, 0).join(" ")} L ${planSheet(3840, 0).join(" ")}`,
    ]);

    const opening = drawing.paths.find((path) => path.id === "opening-d-entry-01");
    expect(opening?.d).toBe(`M ${planSheet(3168, 0).join(" ")} L ${planSheet(3744, 0).join(" ")}`);
    expect(opening?.openingKind).toBe("door");
  });

  it("splits a wall hosting two openings into three solid spans", () => {
    // wall-rear-living runs 3072 -> 0 along the rear face and hosts two windows.
    const segments = drawing.paths.filter((path) => path.id.startsWith("segment-wall-rear-living-"));
    expect(segments).toHaveLength(3);
    expect(drawing.paths.filter((path) => path.id.startsWith("opening-w-liv-0"))).toHaveLength(3);
  });

  it("draws one plan mark per authored opening", () => {
    const planOpenings = drawing.paths.filter(
      (path) => path.kind === "opening" && path.space === "plan",
    );
    expect(planOpenings).toHaveLength(ADOPTED.openings.length);
    expect(new Set(planOpenings.map((path) => path.openingKind))).toEqual(
      new Set(["door", "window", "cased_opening"]),
    );
  });

  it("derives the front elevation roof line from the ridge vertex, pitch and rake overhang", () => {
    const rake = drawing.paths.find((path) => path.id === "elevation-roof-rake");
    // Rise 1 in 3 over a 192 overhang drops the rake exactly 64 below the 1728 head.
    expect(rake?.d).toBe(
      `M ${elevationSheet(-192, 1664).join(" ")} L ${elevationSheet(1920, 2368).join(" ")} L ${elevationSheet(4032, 1664).join(" ")}`,
    );
  });

  it("shows only openings that actually sit in the front plane", () => {
    const elevationOpenings = drawing.paths.filter(
      (path) => path.kind === "opening" && path.space === "elevation",
    );
    expect(elevationOpenings.map((path) => path.id)).toEqual(["elevation-opening-d-entry-01"]);
    expect(elevationOpenings[0].d).toBe(
      `M ${elevationSheet(3168, 0).join(" ")} L ${elevationSheet(3168, 1280).join(" ")} L ${elevationSheet(3744, 1280).join(" ")} L ${elevationSheet(3744, 0).join(" ")}`,
    );
  });

  it("registers the elevation onto the plan's own front line as a shared ground datum", () => {
    const ground = drawing.paths.find((path) => path.id === "elevation-ground-datum");
    const [, planFrontY] = planSheet(0, 0);
    expect(numbersIn(ground?.d ?? "")[1]).toBe(planFrontY);
    expect(numbersIn(ground?.d ?? "")[3]).toBe(planFrontY);
  });

  it("labels each space with its authored program role and authored area", () => {
    expect(drawing.spaceLabels).toHaveLength(ADOPTED.spaces.length);
    const total = drawing.spaceLabels.reduce((sum, label) => sum + label.areaSquareFeet, 0);
    expect(total).toBe(drawing.metrics.grossAreaSquareFeet);

    for (const label of drawing.spaceLabels) {
      const space = ADOPTED.spaces.find((candidate) => `space-label-${candidate.space_id}` === label.id);
      expect(label.areaSquareFeet).toBe(area2ToSquareFeet(space?.area2_q16sq ?? -1));
      expect(label.areaLabel).toBe(`${label.areaSquareFeet} sq ft`);
    }
  });

  it("fits every room label inside the room it names", () => {
    for (const label of drawing.spaceLabels) {
      const space = ADOPTED.spaces.find((candidate) => `space-label-${candidate.space_id}` === label.id);
      const region = ADOPTED.plan_regions.find((candidate) => candidate.region_id === space?.region_ref);
      const xs = (region?.ring_vertex_ids ?? []).map((vertexId) => vertex(vertexId).x_q16);
      const available = Math.max(...xs) - Math.min(...xs);

      expect(label.label.length * 0.62 * label.fontSize).toBeLessThanOrEqual(available);
      expect(label.areaLabel.length * 0.62 * label.areaFontSize).toBeLessThanOrEqual(available);
    }
  });

  it("measures dimensions against authored lengths and labels them consistently", () => {
    const overallWidth = drawing.dimensions.find((entry) => entry.id === "dim-plan-width-overall");
    const overallDepth = drawing.dimensions.find((entry) => entry.id === "dim-plan-depth-overall");
    const ridge = drawing.dimensions.find((entry) => entry.id === "dim-elevation-ridge");

    expect(overallWidth?.valueQ16).toBe(PLAN_WIDTH);
    expect(overallWidth?.label).toBe("20'-0\"");
    expect(overallDepth?.valueQ16).toBe(PLAN_DEPTH);
    expect(ridge?.valueQ16).toBe(2368);

    for (const dimension of drawing.dimensions) {
      expect(dimension.label).toBe(formatFeetInches(dimension.valueQ16));
      expect(dimension.valueQ16).toBeGreaterThan(0);
    }
  });

  it("keeps interior dimension chains summing to the overall dimensions", () => {
    const widthChain = drawing.dimensions.filter((entry) => /^dim-plan-width-\d/.test(entry.id));
    const depthChain = drawing.dimensions.filter((entry) => /^dim-plan-depth-\d/.test(entry.id));

    expect(widthChain.reduce((sum, entry) => sum + entry.valueQ16, 0)).toBe(PLAN_WIDTH);
    expect(depthChain.reduce((sum, entry) => sum + entry.valueQ16, 0)).toBe(PLAN_DEPTH);
  });
});

describe("no unbound numeric building geometry", () => {
  const drawing = HOME_BLUEPRINT_PROJECT_DRAWING;

  it("re-derives every building path from its own untranslated source points", () => {
    const building = drawing.paths.filter((path) => path.markClass === "building");
    expect(building.length).toBeGreaterThan(40);

    for (const path of building) {
      const map = path.space === "plan" ? planSheet : elevationSheet;
      const expected = path.sourcePoints.map((point) => `${map(point.x, point.y).join(" ")}`);
      const body = `M ${expected.join(" L ")}`;
      expect(path.d).toBe(path.closed ? `${body} Z` : body);
    }
  });

  it("admits no building coordinate that the authored profile cannot produce", () => {
    const plan = allowedPlanCoordinates();
    const elevation = allowedElevationCoordinates();

    for (const path of drawing.paths.filter((entry) => entry.markClass === "building")) {
      for (const [sheetX, sheetY] of pairsIn(path.d)) {
        if (path.space === "plan") {
          expect(plan.xs.has(sheetX - LAYOUT.planOriginX)).toBe(true);
          expect(plan.ys.has(PLAN_DEPTH - (sheetY - LAYOUT.planOriginY))).toBe(true);
        } else {
          expect(elevation.xs.has(sheetX - ELEVATION_ORIGIN_X)).toBe(true);
          expect(elevation.zs.has(ELEVATION_GROUND_Y - sheetY)).toBe(true);
        }
      }
    }
  });

  it("names the profile records behind every building mark", () => {
    for (const path of drawing.paths.filter((entry) => entry.markClass === "building")) {
      expect(path.sourceRefs.length).toBeGreaterThan(0);
      expect(path.sourcePoints.length).toBeGreaterThan(1);
    }
  });

  it("keeps process marks out of the building classes", () => {
    const buildingKinds = new Set(["envelope", "wall-exterior", "wall-partition", "opening", "roof"]);

    for (const path of drawing.paths) {
      if (buildingKinds.has(path.kind)) {
        expect(path.markClass).toBe("building");
      }
      if (path.markClass === "registration") {
        expect(["frame", "sequence", "datum", "origin"]).toContain(path.kind);
      }
    }
  });

  it("emits whole authored quanta only — no fractional sheet coordinates", () => {
    for (const path of drawing.paths) {
      expect(path.d).not.toMatch(/\d\.\d/);
      for (const value of numbersIn(path.d)) {
        expect(Number.isInteger(value)).toBe(true);
      }
    }
  });

  it("tracks the source: moving an authored vertex moves the drawn line with it", () => {
    const moved = clone();
    const target = moved.plan_vertices.find((candidate) => candidate.vertex_id === "v-x3840-y5760");
    if (target === undefined) {
      throw new Error("missing test vertex");
    }
    target.x_q16 = 4096;

    const before = HOME_BLUEPRINT_PROJECT_DRAWING.paths.find((path) => path.kind === "envelope");
    const after = deriveHomeBlueprintDrawing(moved).paths.find((path) => path.kind === "envelope");

    expect(after?.d).not.toBe(before?.d);
    expect(after?.d).toContain("4096");
    expect(deriveHomeBlueprintDrawing(moved).metrics.footprintWidthQ16).toBe(4096);
  });

  it("is deterministic: the same profile derives byte-identical geometry", () => {
    const first = deriveHomeBlueprintDrawing(clone());
    const second = deriveHomeBlueprintDrawing(clone());

    expect(first.paths.map((path) => path.d)).toEqual(second.paths.map((path) => path.d));
    expect(first.viewBoxAttribute).toBe(second.viewBoxAttribute);
    expect(first.viewBoxAttribute).toBe(HOME_BLUEPRINT_PROJECT_DRAWING.viewBoxAttribute);
  });
});

describe("home blueprint fails closed", () => {
  it("refuses a profile that is not owner-adopted", () => {
    const candidate = clone();
    candidate.adoption_state = "candidate_not_adopted";

    expect(() => deriveHomeBlueprintDrawing(candidate)).toThrow(HomeBlueprintGeometryRefusal);
    try {
      deriveHomeBlueprintDrawing(candidate);
    } catch (error) {
      expect((error as HomeBlueprintGeometryRefusal).code).toBe("HB_PROFILE_NOT_ADOPTED");
    }
  });

  it.each([
    ["profile_id", (profile: ExecutableGeometryProfile) => (profile.profile_id = "other-profile")],
    ["profile_digest", (profile: ExecutableGeometryProfile) => (profile.profile_digest = "sha256:0")],
    [
      "model binding",
      (profile: ExecutableGeometryProfile) => (profile.model_binding.model_id = "adu-b-800"),
    ],
  ])("refuses a profile whose %s breaks the adoption seal", (_label, mutate) => {
    const candidate = clone();
    mutate(candidate);

    expect(() => deriveHomeBlueprintDrawing(candidate)).toThrow(/HB_PROFILE_SEAL_MISMATCH/);
  });

  it("refuses an unknown schema and unsupported units", () => {
    const wrongSchema = clone();
    wrongSchema.schema = "adu-executable-geometry/2" as ExecutableGeometryProfile["schema"];
    expect(() => deriveHomeBlueprintDrawing(wrongSchema)).toThrow(/XG_SCHEMA_UNKNOWN/);

    const wrongUnits = clone();
    wrongUnits.units = { length: "mm", area: "q16sq" } as unknown as ExecutableGeometryProfile["units"];
    expect(() => deriveHomeBlueprintDrawing(wrongUnits)).toThrow(/HB_UNITS_UNSUPPORTED/);
  });

  it("refuses an opening that does not fit inside its host wall", () => {
    const candidate = clone();
    const opening = candidate.openings.find((entry) => entry.opening_id === "d-entry-01");
    if (opening === undefined) {
      throw new Error("missing test opening");
    }
    opening.cut_width_q16 = 4096;

    expect(() => deriveHomeBlueprintDrawing(candidate)).toThrow(/XG_OPENING_OUT_OF_HOST/);
  });

  it("refuses a wall that references a vertex the profile does not carry", () => {
    const candidate = clone();
    candidate.wall_runs[0].start_vertex_id = "v-does-not-exist";

    expect(() => deriveHomeBlueprintDrawing(candidate)).toThrow(/HB_RECORD_MISSING/);
  });
});

describe("full contract verification", () => {
  it("validates the adopted profile end to end and hands back the drawing", async () => {
    const result = await verifyHomeBlueprintProjectGeometry();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.drawing.paths.map((path) => path.d)).toEqual(
        HOME_BLUEPRINT_PROJECT_DRAWING.paths.map((path) => path.d),
      );
    }
  });

  it("returns a refusal code and no geometry when the canonical digest no longer matches", async () => {
    const tampered = clone();
    const target = tampered.plan_vertices.find((candidate) => candidate.vertex_id === "v-x3840-y5760");
    if (target === undefined) {
      throw new Error("missing test vertex");
    }
    target.x_q16 = 4096;

    const result = await verifyHomeBlueprintProjectGeometry(tampered);

    expect(result.ok).toBe(false);
    expect(result).not.toHaveProperty("drawing");
    if (!result.ok) {
      expect(result.code).toBeTruthy();
      expect(result.pointer).toBeTruthy();
    }
  });
});
