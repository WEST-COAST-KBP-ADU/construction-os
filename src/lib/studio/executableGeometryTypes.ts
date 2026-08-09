/**
 * Runtime-neutral data types for `adu-executable-geometry/1`.
 *
 * These records deliberately carry authored geometry and semantic evidence only.
 * They do not contain defaults, transforms, renderer options, construction claims,
 * manufacturer data, or product geometry.
 */

export const EXECUTABLE_GEOMETRY_SCHEMA = "adu-executable-geometry/1" as const;

export const EXECUTABLE_GEOMETRY_GATE_IDS = [
  "architectural_test_fit",
  "egress_openings",
  "universal_accessibility",
  "structural_foundation",
  "energy",
  "mep",
  "fire_wui",
  "site_jurisdiction",
] as const;

export const EXECUTABLE_GEOMETRY_SLOT_ROLES = [
  "exterior_field",
  "exterior_trim",
  "roof_field",
  "glazing",
  "entry",
  "interior_floor",
  "interior_wall",
  "casework",
] as const;

export type ExecutableGeometryGateId = (typeof EXECUTABLE_GEOMETRY_GATE_IDS)[number];
export type ExecutableGeometrySlotRole = (typeof EXECUTABLE_GEOMETRY_SLOT_ROLES)[number];

export type ExecutableGeometryAdoptionState =
  | "candidate_not_adopted"
  | "owner_adopted"
  | "retired";

export type ExecutableGeometryMaturity =
  | "concept_only"
  | "design_validated"
  | "engineering_reviewed"
  | "permit_package";

export type ExecutableGeometryRegionRole =
  | "space"
  | "exterior_wall"
  | "partition"
  | "junction"
  | "reserved_void";

export type ExecutableGeometryWallKind = "exterior" | "partition";
export type ExecutableGeometryJunctionRule =
  | "miter"
  | "butt_continuing"
  | "butt_terminating"
  | "tee"
  | "cross";
export type ExecutableGeometryRoofEdgeRole =
  | "eave"
  | "rake"
  | "ridge"
  | "hip"
  | "valley"
  | "high_side"
  | "low_side"
  | "shared";
export type ExecutableGeometryDrainageRole =
  | "discharge"
  | "flow_divide"
  | "no_discharge"
  | "collector_pending_design";
export type ExecutableGeometryOpeningKind = "door" | "window";
export type ExecutableGeometryDoorOperation =
  | "swing_in"
  | "swing_out"
  | "sliding"
  | "pocket";
export type ExecutableGeometryWindowOperation =
  | "fixed"
  | "casement"
  | "awning"
  | "slider"
  | "single_hung";
export type ExecutableGeometryHanding = "left" | "right" | "not_applicable";
export type ExecutableGeometryTruthState = "unresolved_semantic" | "concept_generic";
export type ExecutableGeometryGateStatus =
  | "not_evaluated"
  | "outside_concept_scope"
  | "reviewed_pass"
  | "revision_required";
export type ExecutableGeometryNetClearState =
  | "not_evaluated"
  | "manufacturer_evidence_pending"
  | "verified"
  | "not_applicable";

export type ExecutableGeometryPitch = {
  rise: number;
  run: number;
};

export type ExecutableGeometryModelBinding = {
  model_id: string;
  model_version: string;
  release_version: string;
  release_digest: string;
  geometry_source_ref: string;
  geometry_source_digest: string;
  reference_configuration: Record<string, string | number>;
  reference_configuration_digest: string;
};

export type ExecutableGeometryProvenance = {
  origin: "west_coast_kbp_original";
  author: string;
  creation_record: string;
  attestation: string;
  design_input_evidence_refs: string[];
  municipal_source_used: false;
  third_party_geometry_used: false;
  copied_plan_geometry_used: false;
};

export type ExecutableGeometryUnits = {
  length: "q16_in";
  area: "q16sq";
};

export type ExecutableGeometryPrecision = {
  length_quantum_q16: 1;
  coordinate_bound_q16: number;
};

export type ExecutableGeometryCoordinateFrame = {
  origin: "front_left_exterior_wall_corner";
  x_axis: "right";
  y_axis: "rear";
  z_axis: "up";
  handedness: "right";
  canonical_orientation: 0;
};

export type ExecutableGeometryLevel = {
  level_id: string;
  authored_order: number;
  floor_z_q16: number;
  ceiling_z_q16: number;
};

export type ExecutableGeometryPlanVertex = {
  vertex_id: string;
  authored_order: number;
  level_id: string;
  x_q16: number;
  y_q16: number;
};

export type ExecutableGeometryGrossEnvelope = {
  envelope_id: string;
  authored_order: number;
  level_id: string;
  ring_vertex_ids: string[];
  area2_q16sq: number;
};

export type ExecutableGeometryPlanRegion = {
  region_id: string;
  authored_order: number;
  level_id: string;
  role: ExecutableGeometryRegionRole;
  owner_ref: string;
  ring_vertex_ids: string[];
  area2_q16sq: number;
};

export type ExecutableGeometrySpace = {
  space_id: string;
  authored_order: number;
  level_id: string;
  program_role: string;
  region_ref: string;
  adjacent_space_refs: string[];
  outside_professional_scope: boolean;
  area2_q16sq: number;
};

export type ExecutableGeometryFloorPlate = {
  floor_plate_id: string;
  authored_order: number;
  level_id: string;
  gross_envelope_ref: string;
  bottom_z_q16: number;
  top_z_q16: number;
  material_slot_refs: string[];
  assembly_slot_refs: string[];
};

export type ExecutableGeometryWallRun = {
  wall_id: string;
  authored_order: number;
  kind: ExecutableGeometryWallKind;
  level_id: string;
  start_vertex_id: string;
  end_vertex_id: string;
  plan_region_ref: string;
  thickness_q16: number;
  base_z_q16: number;
  head_z_q16: number;
  left_space_ref: string | "exterior";
  right_space_ref: string | "exterior";
  material_slot_refs: string[];
  assembly_slot_refs: string[];
  start_junction_ref: string;
  end_junction_ref: string;
  opening_ids: string[];
};

export type ExecutableGeometryWallJunction = {
  junction_id: string;
  authored_order: number;
  level_id: string;
  region_ref: string;
  member_wall_ids: string[];
  rule: ExecutableGeometryJunctionRule;
};

export type ExecutableGeometryRoofVertex = {
  roof_vertex_id: string;
  authored_order: number;
  x_q16: number;
  y_q16: number;
  z_q16: number;
};

export type ExecutableGeometryRoofEdge = {
  roof_edge_id: string;
  authored_order: number;
  start_vertex_id: string;
  end_vertex_id: string;
  role: ExecutableGeometryRoofEdgeRole;
  adjacent_plane_ids: string[];
  overhang_q16: number;
  eave_z_q16: number | null;
  drainage_role: ExecutableGeometryDrainageRole;
};

export type ExecutableGeometryRoofPlane = {
  roof_plane_id: string;
  authored_order: number;
  edge_ids: string[];
  pitch: ExecutableGeometryPitch;
  fall_direction: "left" | "right" | "front" | "rear";
  form: "gable" | "shed" | "hip" | "valley";
  material_slot_refs: string[];
  assembly_slot_refs: string[];
};

export type ExecutableGeometryNetClear = {
  state: ExecutableGeometryNetClearState;
  width_q16: number | null;
  height_q16: number | null;
  area2_q16sq: number | null;
  evidence_refs: string[];
};

export type ExecutableGeometryOpening = {
  opening_id: string;
  authored_order: number;
  level_id: string;
  kind: ExecutableGeometryOpeningKind;
  host_wall_id: string;
  datum: "host_start_to_opening_start";
  offset_q16: number;
  cut_width_q16: number;
  cut_height_q16: number;
  sill_q16: number;
  head_q16: number;
  nominal_width_q16: number;
  nominal_height_q16: number;
  room_served_refs: Array<string | "exterior">;
  material_slot_refs: string[];
  assembly_slot_refs: string[];
  net_clear: ExecutableGeometryNetClear;
  operation: ExecutableGeometryDoorOperation | ExecutableGeometryWindowOperation;
  handing: ExecutableGeometryHanding;
};

export type ExecutableGeometrySlot = {
  slot_id: string;
  authored_order: number;
  role: ExecutableGeometrySlotRole;
  scope: string;
  truth_state: ExecutableGeometryTruthState;
};

export type ExecutableGeometryAreaAccounting = {
  gross_area2_q16sq: number;
  net_area2_q16sq: number;
  region_area2_q16sq: number;
  wall_junction_reserved_area2_q16sq: number;
};

export type ExecutableGeometryProfessionalGate = {
  gate_id: ExecutableGeometryGateId;
  authored_order: number;
  status: ExecutableGeometryGateStatus;
  evidence_refs: string[];
  reviewer_role: string | null;
  checked_at: string | null;
};

export type ExecutableGeometryProfile = {
  schema: typeof EXECUTABLE_GEOMETRY_SCHEMA;
  profile_id: string;
  profile_version: string;
  adoption_state: ExecutableGeometryAdoptionState;
  maturity: ExecutableGeometryMaturity;
  model_binding: ExecutableGeometryModelBinding;
  provenance: ExecutableGeometryProvenance;
  units: ExecutableGeometryUnits;
  precision: ExecutableGeometryPrecision;
  coordinate_frame: ExecutableGeometryCoordinateFrame;
  levels: ExecutableGeometryLevel[];
  plan_vertices: ExecutableGeometryPlanVertex[];
  gross_envelopes: ExecutableGeometryGrossEnvelope[];
  plan_regions: ExecutableGeometryPlanRegion[];
  spaces: ExecutableGeometrySpace[];
  floor_plates: ExecutableGeometryFloorPlate[];
  wall_runs: ExecutableGeometryWallRun[];
  wall_junctions: ExecutableGeometryWallJunction[];
  roof_vertices: ExecutableGeometryRoofVertex[];
  roof_edges: ExecutableGeometryRoofEdge[];
  roof_planes: ExecutableGeometryRoofPlane[];
  openings: ExecutableGeometryOpening[];
  material_slots: ExecutableGeometrySlot[];
  assembly_slots: ExecutableGeometrySlot[];
  area_accounting: ExecutableGeometryAreaAccounting;
  professional_gates: ExecutableGeometryProfessionalGate[];
  profile_digest: string;
};

/** Injected test/runtime binding; no profile may choose or synthesize this graph. */
export type ExecutableGeometryBindingContext = {
  model: {
    schema: "adu-model/1";
    model_id: string;
    version: string;
    maturity: ExecutableGeometryMaturity;
    geometry: {
      source_ref: string;
      digest: string;
    };
  };
  release: {
    schema: "adu-model-release/1";
    release_version: string;
    release_digest: string;
  };
  geometry_source: {
    schema: "adu-geometry-source/1";
    model_id: string;
    reference_configuration: Record<string, string | number>;
  };
};

export type ExecutableGeometryRefusalCode =
  | "XG_SCHEMA_UNKNOWN"
  | "XG_SHAPE_MISSING_FIELD"
  | "XG_SHAPE_UNKNOWN_FIELD"
  | "XG_JSON_DUPLICATE_NAME"
  | "XG_ID_INVALID"
  | "XG_ID_DUPLICATE"
  | "XG_ORDER_INVALID"
  | "XG_REF_UNRESOLVED"
  | "XG_BINDING_MODEL_MISMATCH"
  | "XG_BINDING_RELEASE_MISMATCH"
  | "XG_BINDING_SOURCE_MISMATCH"
  | "XG_DIGEST_MISMATCH"
  | "XG_UNIT_INVALID"
  | "XG_PRECISION_INVALID"
  | "XG_COORDINATE_UNSAFE"
  | "XG_TRANSFORM_FORBIDDEN"
  | "XG_RING_OPEN"
  | "XG_RING_DEGENERATE"
  | "XG_RING_SELF_INTERSECTION"
  | "XG_REGION_OVERLAP"
  | "XG_REGION_OUTSIDE_ENVELOPE"
  | "XG_AREA_ACCOUNTING_MISMATCH"
  | "XG_ENCLOSURE_GAP"
  | "XG_ENCLOSURE_OVERLAP"
  | "XG_WALL_JUNCTION_INVALID"
  | "XG_OPENING_HOST_MISSING"
  | "XG_OPENING_HOST_MULTIPLE"
  | "XG_OPENING_OUT_OF_HOST"
  | "XG_OPENING_OFFSET_INVALID"
  | "XG_OPENING_VERTICAL_INVALID"
  | "XG_OPENING_HANDING_INVALID"
  | "XG_OPENING_ROOM_MISMATCH"
  | "XG_ROOF_DISCONTINUITY"
  | "XG_ROOF_TOPOLOGY_AMBIGUOUS"
  | "XG_ROOF_PITCH_MISMATCH"
  | "XG_MATERIAL_SLOT_UNKNOWN"
  | "XG_MATERIAL_CLAIM_UNSUPPORTED"
  | "XG_GATE_STATUS_MISSING"
  | "XG_MATURITY_GATE_UNSATISFIED";

export type ExecutableGeometryValidationSuccess = {
  ok: true;
  profile: ExecutableGeometryProfile;
};

export type ExecutableGeometryValidationFailure = {
  ok: false;
  code: ExecutableGeometryRefusalCode;
  pointer: string;
  involved_ids?: string[];
};

export type ExecutableGeometryValidationResult =
  | ExecutableGeometryValidationSuccess
  | ExecutableGeometryValidationFailure;
