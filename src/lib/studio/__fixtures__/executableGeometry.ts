import {
  computeReferenceConfigurationDigest,
  resealExecutableGeometryProfile,
} from "../executableGeometryCanonical";
import {
  EXECUTABLE_GEOMETRY_GATE_IDS,
  EXECUTABLE_GEOMETRY_SLOT_ROLES,
  type ExecutableGeometryBindingContext,
  type ExecutableGeometryPlanRegion,
  type ExecutableGeometryProfile,
  type ExecutableGeometrySlot,
} from "../executableGeometryTypes";

export const TEST_ONLY_NON_PRODUCT_MARKER = "TEST-ONLY / NON-PRODUCT";

const SHA_ONE = `sha256:${"1".repeat(64)}`;
const SHA_TWO = `sha256:${"2".repeat(64)}`;
const STRIPE_AREA2 = 8_192;
const STRIPE_COUNT = 24;
const GROSS_AREA2 = STRIPE_AREA2 * STRIPE_COUNT;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function slots(prefix: "material" | "assembly"): ExecutableGeometrySlot[] {
  return EXECUTABLE_GEOMETRY_SLOT_ROLES.map((role, authored_order) => ({
    slot_id: `${prefix}-${role.replaceAll("_", "-")}`,
    authored_order,
    role,
    scope: "test-only-profile",
    truth_state: "concept_generic",
  }));
}

function stripeRing(index: number): string[] {
  return [
    `p-${index}-front`,
    `p-${index + 1}-front`,
    `p-${index + 1}-rear`,
    `p-${index}-rear`,
    `p-${index}-front`,
  ];
}

function region(
  authored_order: number,
  role: ExecutableGeometryPlanRegion["role"],
  owner_ref: string,
): ExecutableGeometryPlanRegion {
  return {
    region_id: `region-${authored_order}`,
    authored_order,
    level_id: "level-0",
    role,
    owner_ref,
    ring_vertex_ids: stripeRing(authored_order),
    area2_q16sq: STRIPE_AREA2,
  };
}

function planVertices(): ExecutableGeometryProfile["plan_vertices"] {
  const vertices = Array.from({ length: STRIPE_COUNT + 1 }, (_, stripe) => [
    { vertex_id: `p-${stripe}-front`, level_id: "level-0", x_q16: stripe * 16, y_q16: 0 },
    { vertex_id: `p-${stripe}-rear`, level_id: "level-0", x_q16: stripe * 16, y_q16: 256 },
  ]).flat();

  return [
    ...vertices.map((vertex, authored_order) => ({ ...vertex, authored_order })),
    { vertex_id: "p-24-mid", authored_order: vertices.length, level_id: "level-0", x_q16: 384, y_q16: 128 },
    { vertex_id: "p-0-mid", authored_order: vertices.length + 1, level_id: "level-0", x_q16: 0, y_q16: 128 },
    { vertex_id: "p-gap-front", authored_order: vertices.length + 2, level_id: "level-0", x_q16: 328, y_q16: 0 },
    { vertex_id: "p-gap-rear", authored_order: vertices.length + 3, level_id: "level-0", x_q16: 328, y_q16: 256 },
    { vertex_id: "p-outside", authored_order: vertices.length + 4, level_id: "level-0", x_q16: 385, y_q16: 0 },
  ];
}

function exteriorWalls(): ExecutableGeometryProfile["wall_runs"] {
  const edges: Array<[string, string]> = [
    ["p-0-front", "p-12-front"],
    ["p-12-front", "p-24-front"],
    ["p-24-front", "p-24-mid"],
    ["p-24-mid", "p-24-rear"],
    ["p-24-rear", "p-12-rear"],
    ["p-12-rear", "p-0-rear"],
    ["p-0-rear", "p-0-mid"],
    ["p-0-mid", "p-0-front"],
  ];
  const material = "material-exterior-field";
  const assembly = "assembly-exterior-field";
  return edges.map(([start_vertex_id, end_vertex_id], authored_order) => ({
    wall_id: `wall-${authored_order}`,
    authored_order,
    kind: "exterior" as const,
    level_id: "level-0",
    start_vertex_id,
    end_vertex_id,
    plan_region_ref: `region-${authored_order}`,
    thickness_q16: 8,
    base_z_q16: 0,
    head_z_q16: 144,
    left_space_ref: "space-main",
    right_space_ref: "exterior" as const,
    material_slot_refs: [material],
    assembly_slot_refs: [assembly],
    start_junction_ref: `junction-${authored_order}`,
    end_junction_ref: `junction-${(authored_order + 1) % edges.length}`,
    opening_ids: authored_order === 0 ? ["opening-entry"] : authored_order === 1 ? ["opening-window"] : [],
  }));
}

function wallJunctions(): ExecutableGeometryProfile["wall_junctions"] {
  return [
    ...Array.from({ length: 8 }, (_, authored_order) => ({
      junction_id: `junction-${authored_order}`,
      authored_order,
      level_id: "level-0",
      region_ref: `region-${10 + authored_order}`,
      member_wall_ids: [`wall-${(authored_order + 7) % 8}`, `wall-${authored_order}`],
      rule: "miter" as const,
    })),
    {
      junction_id: "junction-8",
      authored_order: 8,
      level_id: "level-0",
      region_ref: "region-18",
      member_wall_ids: ["wall-8", "wall-9"],
      rule: "miter" as const,
    },
    {
      junction_id: "junction-9",
      authored_order: 9,
      level_id: "level-0",
      region_ref: "region-19",
      member_wall_ids: ["wall-8", "wall-9"],
      rule: "miter" as const,
    },
  ];
}

function roof(): Pick<ExecutableGeometryProfile, "roof_vertices" | "roof_edges" | "roof_planes"> {
  const roof_vertices: ExecutableGeometryProfile["roof_vertices"] = [
    ["roof-left-front", 0, 0, 144],
    ["roof-left-rear", 0, 256, 144],
    ["roof-ridge-front", 192, 0, 208],
    ["roof-ridge-rear", 192, 256, 208],
    ["roof-right-front", 384, 0, 144],
    ["roof-right-rear", 384, 256, 144],
  ].map(([roof_vertex_id, x_q16, y_q16, z_q16], authored_order) => ({
    roof_vertex_id: roof_vertex_id as string,
    authored_order,
    x_q16: x_q16 as number,
    y_q16: y_q16 as number,
    z_q16: z_q16 as number,
  }));
  const roof_edges: ExecutableGeometryProfile["roof_edges"] = [
    ["roof-eave-left", "roof-left-front", "roof-left-rear", "eave", ["roof-left"], 144, "discharge"],
    ["roof-rake-left-rear", "roof-left-rear", "roof-ridge-rear", "rake", ["roof-left"], null, "flow_divide"],
    ["roof-ridge", "roof-ridge-front", "roof-ridge-rear", "ridge", ["roof-left", "roof-right"], null, "flow_divide"],
    ["roof-rake-left-front", "roof-ridge-front", "roof-left-front", "rake", ["roof-left"], null, "flow_divide"],
    ["roof-eave-right", "roof-right-rear", "roof-right-front", "eave", ["roof-right"], 144, "discharge"],
    ["roof-rake-right-rear", "roof-ridge-rear", "roof-right-rear", "rake", ["roof-right"], null, "flow_divide"],
    ["roof-rake-right-front", "roof-right-front", "roof-ridge-front", "rake", ["roof-right"], null, "flow_divide"],
  ].map(([roof_edge_id, start_vertex_id, end_vertex_id, role, adjacent_plane_ids, eave_z_q16, drainage_role], authored_order) => ({
    roof_edge_id: roof_edge_id as string,
    authored_order,
    start_vertex_id: start_vertex_id as string,
    end_vertex_id: end_vertex_id as string,
    role: role as ExecutableGeometryProfile["roof_edges"][number]["role"],
    adjacent_plane_ids: adjacent_plane_ids as string[],
    overhang_q16: 0,
    eave_z_q16: eave_z_q16 as number | null,
    drainage_role: drainage_role as ExecutableGeometryProfile["roof_edges"][number]["drainage_role"],
  }));
  const roof_planes: ExecutableGeometryProfile["roof_planes"] = [
    {
      roof_plane_id: "roof-left",
      authored_order: 0,
      edge_ids: ["roof-eave-left", "roof-rake-left-rear", "roof-ridge", "roof-rake-left-front"],
      pitch: { rise: 1, run: 3 },
      fall_direction: "left",
      form: "gable",
      material_slot_refs: ["material-roof-field"],
      assembly_slot_refs: ["assembly-roof-field"],
    },
    {
      roof_plane_id: "roof-right",
      authored_order: 1,
      edge_ids: ["roof-eave-right", "roof-rake-right-front", "roof-ridge", "roof-rake-right-rear"],
      pitch: { rise: 1, run: 3 },
      fall_direction: "right",
      form: "gable",
      material_slot_refs: ["material-roof-field"],
      assembly_slot_refs: ["assembly-roof-field"],
    },
  ];
  return { roof_vertices, roof_edges, roof_planes };
}

export async function createTestOnlyExecutableGeometryFixture(): Promise<{
  profile: ExecutableGeometryProfile;
  context: ExecutableGeometryBindingContext;
}> {
  const reference_configuration = {
    test_only_marker: TEST_ONLY_NON_PRODUCT_MARKER,
    envelope_width_q16: 384,
    envelope_depth_q16: 256,
    roof_form: "gable",
  };
  const context: ExecutableGeometryBindingContext = {
    model: {
      schema: "adu-model/1",
      model_id: "adu-x-999",
      version: "1.0.0",
      maturity: "concept_only",
      geometry: { source_ref: "models/test-only/geometry/adu-x-999@1", digest: SHA_ONE },
    },
    release: { schema: "adu-model-release/1", release_version: "2099.01.0", release_digest: SHA_TWO },
    geometry_source: {
      schema: "adu-geometry-source/1",
      model_id: "adu-x-999",
      reference_configuration,
    },
  };
  const material_slots = slots("material");
  const assembly_slots = slots("assembly");
  const wall_runs = [
    ...exteriorWalls(),
    {
      wall_id: "wall-8",
      authored_order: 8,
      kind: "partition" as const,
      level_id: "level-0",
      start_vertex_id: "p-6-front",
      end_vertex_id: "p-6-rear",
      plan_region_ref: "region-8",
      thickness_q16: 6,
      base_z_q16: 0,
      head_z_q16: 144,
      left_space_ref: "space-main",
      right_space_ref: "space-secondary",
      material_slot_refs: ["material-interior-wall"],
      assembly_slot_refs: ["assembly-interior-wall"],
      start_junction_ref: "junction-8",
      end_junction_ref: "junction-9",
      opening_ids: [],
    },
    {
      wall_id: "wall-9",
      authored_order: 9,
      kind: "partition" as const,
      level_id: "level-0",
      start_vertex_id: "p-6-front",
      end_vertex_id: "p-6-rear",
      plan_region_ref: "region-9",
      thickness_q16: 6,
      base_z_q16: 0,
      head_z_q16: 144,
      left_space_ref: "space-main",
      right_space_ref: "space-secondary",
      material_slot_refs: ["material-interior-wall"],
      assembly_slot_refs: ["assembly-interior-wall"],
      start_junction_ref: "junction-8",
      end_junction_ref: "junction-9",
      opening_ids: [],
    },
  ];
  const plan_regions = [
    ...Array.from({ length: 8 }, (_, index) => region(index, "exterior_wall", `wall-${index}`)),
    region(8, "partition", "wall-8"),
    region(9, "partition", "wall-9"),
    ...Array.from({ length: 10 }, (_, index) => region(10 + index, "junction", `junction-${index}`)),
    region(20, "space", "space-main"),
    region(21, "space", "space-secondary"),
    region(22, "reserved_void", "reserved-0"),
    region(23, "reserved_void", "reserved-1"),
  ];
  const profile: ExecutableGeometryProfile = {
    schema: "adu-executable-geometry/1",
    profile_id: "adu-x-999-profile-test-only",
    profile_version: "1.0.0",
    adoption_state: "candidate_not_adopted",
    maturity: "concept_only",
    model_binding: {
      model_id: context.model.model_id,
      model_version: context.model.version,
      release_version: context.release.release_version,
      release_digest: context.release.release_digest,
      geometry_source_ref: context.model.geometry.source_ref,
      geometry_source_digest: context.model.geometry.digest,
      reference_configuration,
      reference_configuration_digest: await computeReferenceConfigurationDigest(reference_configuration),
    },
    provenance: {
      origin: "west_coast_kbp_original",
      author: "West Coast KBP test fixture",
      creation_record: TEST_ONLY_NON_PRODUCT_MARKER,
      attestation: "Test-only fixture. It is not a product model, construction document, or adopted geometry.",
      design_input_evidence_refs: [TEST_ONLY_NON_PRODUCT_MARKER],
      municipal_source_used: false,
      third_party_geometry_used: false,
      copied_plan_geometry_used: false,
    },
    units: { length: "q16_in", area: "q16sq" },
    precision: { length_quantum_q16: 1, coordinate_bound_q16: 10_000 },
    coordinate_frame: {
      origin: "front_left_exterior_wall_corner",
      x_axis: "right",
      y_axis: "rear",
      z_axis: "up",
      handedness: "right",
      canonical_orientation: 0,
    },
    levels: [{ level_id: "level-0", authored_order: 0, floor_z_q16: 0, ceiling_z_q16: 160 }],
    plan_vertices: planVertices(),
    gross_envelopes: [{
      envelope_id: "envelope-0",
      authored_order: 0,
      level_id: "level-0",
      ring_vertex_ids: [
        "p-0-front", "p-12-front", "p-24-front", "p-24-mid", "p-24-rear",
        "p-12-rear", "p-0-rear", "p-0-mid", "p-0-front",
      ],
      area2_q16sq: GROSS_AREA2,
    }],
    plan_regions,
    spaces: [
      {
        space_id: "space-main",
        authored_order: 0,
        level_id: "level-0",
        program_role: "test_only_primary",
        region_ref: "region-20",
        adjacent_space_refs: ["space-secondary"],
        outside_professional_scope: true,
        area2_q16sq: STRIPE_AREA2,
      },
      {
        space_id: "space-secondary",
        authored_order: 1,
        level_id: "level-0",
        program_role: "test_only_secondary",
        region_ref: "region-21",
        adjacent_space_refs: ["space-main"],
        outside_professional_scope: true,
        area2_q16sq: STRIPE_AREA2,
      },
    ],
    floor_plates: [{
      floor_plate_id: "floor-0",
      authored_order: 0,
      level_id: "level-0",
      gross_envelope_ref: "envelope-0",
      bottom_z_q16: 0,
      top_z_q16: 8,
      material_slot_refs: ["material-interior-floor"],
      assembly_slot_refs: ["assembly-interior-floor"],
    }],
    wall_runs,
    wall_junctions: wallJunctions(),
    ...roof(),
    openings: [
      {
        opening_id: "opening-entry",
        authored_order: 0,
        level_id: "level-0",
        kind: "door",
        host_wall_id: "wall-0",
        datum: "host_start_to_opening_start",
        offset_q16: 24,
        cut_width_q16: 32,
        cut_height_q16: 112,
        sill_q16: 0,
        head_q16: 112,
        nominal_width_q16: 32,
        nominal_height_q16: 112,
        room_served_refs: ["space-main", "exterior"],
        material_slot_refs: ["material-entry"],
        assembly_slot_refs: ["assembly-entry"],
        net_clear: { state: "not_evaluated", width_q16: null, height_q16: null, area2_q16sq: null, evidence_refs: [] },
        operation: "swing_in",
        handing: "left",
      },
      {
        opening_id: "opening-window",
        authored_order: 1,
        level_id: "level-0",
        kind: "window",
        host_wall_id: "wall-1",
        datum: "host_start_to_opening_start",
        offset_q16: 24,
        cut_width_q16: 32,
        cut_height_q16: 64,
        sill_q16: 48,
        head_q16: 112,
        nominal_width_q16: 32,
        nominal_height_q16: 64,
        room_served_refs: ["space-main", "exterior"],
        material_slot_refs: ["material-glazing"],
        assembly_slot_refs: ["assembly-glazing"],
        net_clear: { state: "not_evaluated", width_q16: null, height_q16: null, area2_q16sq: null, evidence_refs: [] },
        operation: "casement",
        handing: "right",
      },
    ],
    material_slots,
    assembly_slots,
    area_accounting: {
      gross_area2_q16sq: GROSS_AREA2,
      net_area2_q16sq: STRIPE_AREA2 * 2,
      region_area2_q16sq: GROSS_AREA2,
      wall_junction_reserved_area2_q16sq: GROSS_AREA2 - STRIPE_AREA2 * 2,
    },
    professional_gates: EXECUTABLE_GEOMETRY_GATE_IDS.map((gate_id, authored_order) => ({
      gate_id,
      authored_order,
      status: "not_evaluated",
      evidence_refs: [],
      reviewer_role: null,
      checked_at: null,
    })),
    profile_digest: `sha256:${"0".repeat(64)}`,
  };
  return { profile: await resealExecutableGeometryProfile(profile), context };
}

export function cloneTestOnlyExecutableGeometryProfile(profile: ExecutableGeometryProfile): ExecutableGeometryProfile {
  return clone(profile);
}
