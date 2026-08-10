import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  canonicalizeExecutableGeometry,
  resealExecutableGeometryProfile,
} from "./executableGeometryCanonical";
import type {
  ExecutableGeometryProfile,
  ExecutableGeometryRefusalCode,
} from "./executableGeometryTypes";
import {
  A600_EXECUTABLE_PROFILE,
  EXECUTABLE_PROFILE_REGISTRY,
  assertA600MaterializationAllowed,
  validateA600ExecutableProfile,
  validateA600ExecutableProfileJson,
} from "./executableProfiles";

const PROFILE_PATH = fileURLToPath(
  new URL("../../data/studio/models/executable/adu-a-600@1.0.0.json", import.meta.url),
);
const EXPECTED_DIGEST = "sha256:cb29815c8b2ce306b0bf3cae4fc8810cb3cecc3adba1bfbb62c8c75421ff9afd";

function clone(): ExecutableGeometryProfile {
  return JSON.parse(JSON.stringify(A600_EXECUTABLE_PROFILE)) as ExecutableGeometryProfile;
}

async function expectRefusal(
  code: ExecutableGeometryRefusalCode,
  mutate: (profile: ExecutableGeometryProfile) => void,
  reseal = true,
): Promise<void> {
  let candidate = clone();
  mutate(candidate);
  if (reseal) candidate = await resealExecutableGeometryProfile(candidate);
  const result = await validateA600ExecutableProfile(candidate);
  expect(result.ok).toBe(false);
  if (result.ok) throw new Error("Expected terminal refusal.");
  expect(result.code).toBe(code);
}

describe("adu-a-600@1.0.0 executable profile", () => {
  it("strictly parses, validates against the real release/model/source binding, and replays its digest", async () => {
    const raw = readFileSync(PROFILE_PATH, "utf8");
    const result = await validateA600ExecutableProfileJson(raw);
    expect(result).toMatchObject({ ok: true });
    expect(await validateA600ExecutableProfile()).toMatchObject({ ok: true });
    expect(A600_EXECUTABLE_PROFILE.profile_digest).toBe(EXPECTED_DIGEST);
    expect(canonicalizeExecutableGeometry(A600_EXECUTABLE_PROFILE)).toBe(
      canonicalizeExecutableGeometry(JSON.parse(raw)),
    );
    expect(EXECUTABLE_PROFILE_REGISTRY["adu-a-600@1.0.0"].profile.profile_digest).toBe(EXPECTED_DIGEST);
  });

  it("rejects duplicate JSON names before native parsing", async () => {
    const result = await validateA600ExecutableProfileJson(
      '{"schema":"adu-executable-geometry/1","schema":"adu-executable-geometry/1"}',
    );
    expect(result).toEqual({ ok: false, code: "XG_JSON_DUPLICATE_NAME", pointer: "" });
  });

  it("applies the owner-adoption binding to JSON registry input", async () => {
    const candidate = clone();
    candidate.adoption_state = "candidate_not_adopted";
    const result = await validateA600ExecutableProfileJson(
      JSON.stringify(await resealExecutableGeometryProfile(candidate)),
    );
    expect(result).toEqual({
      ok: false,
      code: "XG_ADOPTION_BINDING_MISMATCH",
      pointer: "/adoption_state",
    });
  });

  it("carries the exact owner-adopted envelope, seven CCW zones, topology, openings, and 4:12 roof", () => {
    expect(A600_EXECUTABLE_PROFILE.gross_envelopes[0].area2_q16sq).toBe(44_236_800);
    expect(A600_EXECUTABLE_PROFILE.plan_regions.map((region) => region.area2_q16sq)).toEqual([
      10_616_832, 1_769_472, 3_538_944, 6_193_152, 4_423_680, 15_040_512, 2_654_208,
    ]);
    expect(A600_EXECUTABLE_PROFILE.spaces.map((space) => space.adjacent_space_refs)).toEqual([
      ["space-hall"],
      ["space-hall"],
      ["space-entry", "space-bedroom", "space-bathroom", "space-living"],
      ["space-living"],
      ["space-hall"],
      ["space-hall", "space-kitchen", "space-storage"],
      ["space-living"],
    ]);
    expect(A600_EXECUTABLE_PROFILE.openings).toHaveLength(12);
    expect(new Set(A600_EXECUTABLE_PROFILE.openings.map((opening) => opening.opening_id)).size).toBe(12);
    expect(A600_EXECUTABLE_PROFILE.roof_planes.map((plane) => plane.pitch)).toEqual([
      { rise: 1, run: 3 },
      { rise: 1, run: 3 },
    ]);
    expect(A600_EXECUTABLE_PROFILE.coordinate_frame).toMatchObject({
      x_axis: "right",
      y_axis: "rear",
      canonical_orientation: 0,
    });
  });

  it("pins D-BED-01 to the 32-in HALL-BEDROOM cut at jambs 1184..1696 q16", () => {
    const opening = A600_EXECUTABLE_PROFILE.openings.find((candidate) => candidate.opening_id === "d-bed-01");
    expect(opening).toMatchObject({
      host_wall_id: "wall-bedroom-hall",
      offset_q16: 32,
      cut_width_q16: 512,
      nominal_width_q16: 512,
      room_served_refs: ["space-bedroom", "space-hall"],
    });
    const host = A600_EXECUTABLE_PROFILE.wall_runs.find((wall) => wall.wall_id === opening?.host_wall_id)!;
    const start = A600_EXECUTABLE_PROFILE.plan_vertices.find((vertex) => vertex.vertex_id === host.start_vertex_id)!;
    expect(start.y_q16 + opening!.offset_q16).toBe(1184);
    expect(start.y_q16 + opening!.offset_q16 + opening!.cut_width_q16).toBe(1696);
  });

  it("keeps D08 machine-visible and blocks STEP, GLB, and render materialization", () => {
    expect(A600_EXECUTABLE_PROFILE.geometry_resolution).toEqual({
      state: "blocked_unresolved_geometry",
      unresolved_fields: [
        "floor_assembly_thickness",
        "wall_assembly_thickness",
        "wall_junction_geometry",
        "roof_assembly_thickness",
      ],
      blocked_outputs: ["step", "glb", "render"],
    });
    for (const output of ["step", "glb", "render"] as const) {
      expect(() => assertA600MaterializationAllowed(output)).toThrow("XG_REQUIRED_GEOMETRY_UNRESOLVED");
    }
  });

  it("rejects plausible numeric thickness smuggling and all required source mutations", async () => {
    await expectRefusal("XG_UNRESOLVED_GEOMETRY_SMUGGLED", (profile) => {
      profile.wall_runs[0].thickness_q16 = 96;
    });
    await expectRefusal("XG_AREA_ACCOUNTING_MISMATCH", (profile) => {
      profile.plan_regions[0].area2_q16sq += 1;
    });
    await expectRefusal("XG_OPENING_OFFSET_INVALID", (profile) => {
      profile.openings[1].offset_q16 = 64;
    });
    await expectRefusal("XG_ADJACENCY_MISMATCH", (profile) => {
      profile.spaces[0].adjacent_space_refs = [];
    });
    await expectRefusal("XG_ROOF_PITCH_MISMATCH", (profile) => {
      profile.roof_planes[0].pitch = { rise: 1, run: 4 };
    });
    await expectRefusal("XG_DIGEST_MISMATCH", (profile) => {
      profile.provenance.attestation = "stale unsealed mutation";
    }, false);
    await expectRefusal("XG_REQUIRED_GEOMETRY_UNRESOLVED", (profile) => {
      profile.maturity = "design_validated";
    });
    await expectRefusal("XG_ADOPTION_BINDING_MISMATCH", (profile) => {
      profile.adoption_state = "candidate_not_adopted";
    });
    await expectRefusal("XG_GATE_STATUS_MISSING", (profile) => {
      profile.professional_gates[0].status = "reviewed_pass";
    });
    await expectRefusal("XG_SHAPE_UNKNOWN_FIELD", (profile) => {
      (profile as unknown as Record<string, unknown>).scale_x = -1;
    });
  });

  it("contains semantic slots and no manufacturer, SKU, price, availability, or legacy 6.8-ft adoption", () => {
    const serialized = JSON.stringify(A600_EXECUTABLE_PROFILE).toLowerCase();
    for (const forbidden of ["manufacturer", "sku", "price", "availability", '"height_ft":6.8', "nominal_2x6"]) {
      expect(serialized).not.toContain(forbidden);
    }
    expect(A600_EXECUTABLE_PROFILE.material_slots).toHaveLength(8);
    expect(A600_EXECUTABLE_PROFILE.assembly_slots.every((slot) => slot.truth_state === "unresolved_semantic")).toBe(true);
    expect(A600_EXECUTABLE_PROFILE.professional_gates.every((gate) => gate.status === "not_evaluated")).toBe(true);
  });
});
