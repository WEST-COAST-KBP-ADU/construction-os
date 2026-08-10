import {
  DuplicateJsonPropertyNameError,
  canonicalizeJson,
  computeExecutableGeometryDigest,
  computeReferenceConfigurationDigest,
  parseExecutableGeometryJson,
} from "./executableGeometryCanonical";
import {
  EXECUTABLE_GEOMETRY_GATE_IDS,
  EXECUTABLE_GEOMETRY_SCHEMA,
  EXECUTABLE_GEOMETRY_SLOT_ROLES,
  type ExecutableGeometryBindingContext,
  type ExecutableGeometryProfile,
  type ExecutableGeometryRefusalCode,
  type ExecutableGeometryResolution,
  type ExecutableGeometryValidationFailure,
  type ExecutableGeometryValidationResult,
} from "./executableGeometryTypes";

type UnknownRecord = Record<string, unknown>;

type Point = {
  x: bigint;
  y: bigint;
};

type Ring = {
  points: Point[];
  area2: bigint;
};

class Refusal extends Error {
  public constructor(
    public readonly code: ExecutableGeometryRefusalCode,
    public readonly pointer: string,
    public readonly involvedIds?: string[],
  ) {
    super(code);
    this.name = "Refusal";
  }
}

const PROFILE_ID_PATTERN = /^adu-[a-z]-[0-9]{3}-profile-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const GENERIC_ID_PATTERN = /^[a-z][a-z0-9_]*(?:-[a-z0-9_]+)*$/;
const SEMVER_PATTERN = /^\d+\.\d+\.\d+$/;
const DIGEST_PATTERN = /^sha256:[0-9a-f]{64}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MUTABLE_VERSION_ALIASES = new Set(["latest", "current", "stable", "head", "next"]);
const BIGINT_ZERO = BigInt(0);

const TOP_LEVEL_KEYS = [
  "schema",
  "profile_id",
  "profile_version",
  "adoption_state",
  "maturity",
  "model_binding",
  "provenance",
  "units",
  "precision",
  "coordinate_frame",
  "levels",
  "plan_vertices",
  "gross_envelopes",
  "plan_regions",
  "spaces",
  "floor_plates",
  "wall_runs",
  "wall_junctions",
  "roof_vertices",
  "roof_edges",
  "roof_planes",
  "openings",
  "material_slots",
  "assembly_slots",
  "area_accounting",
  "professional_gates",
  "profile_digest",
] as const;

function isRecord(value: unknown): value is UnknownRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function fail(code: ExecutableGeometryRefusalCode, pointer: string, involvedIds?: string[]): never {
  throw new Refusal(code, pointer, involvedIds);
}

function failureFrom(error: Refusal): ExecutableGeometryValidationFailure {
  return {
    ok: false,
    code: error.code,
    pointer: error.pointer,
    ...(error.involvedIds === undefined ? {} : { involved_ids: error.involvedIds }),
  };
}

function escapePointerSegment(value: string): string {
  return value.replace(/~/g, "~0").replace(/\//g, "~1");
}

function childPointer(pointer: string, key: string | number): string {
  return `${pointer}/${typeof key === "number" ? key : escapePointerSegment(key)}`;
}

function assertRecord(value: unknown, pointer: string): UnknownRecord {
  if (!isRecord(value)) {
    fail("XG_SHAPE_MISSING_FIELD", pointer);
  }
  return value;
}

function assertArray(value: unknown, pointer: string): unknown[] {
  if (!Array.isArray(value)) {
    fail("XG_SHAPE_MISSING_FIELD", pointer);
  }
  return value;
}

function assertExactKeys(value: unknown, keys: readonly string[], pointer: string): UnknownRecord {
  const record = assertRecord(value, pointer);
  const allowed = new Set(keys);

  for (const key of Object.keys(record)) {
    if (!allowed.has(key)) {
      fail("XG_SHAPE_UNKNOWN_FIELD", childPointer(pointer, key));
    }
  }

  for (const key of keys) {
    if (!(key in record)) {
      fail("XG_SHAPE_MISSING_FIELD", childPointer(pointer, key));
    }
  }

  return record;
}

function assertRecords(value: unknown, keys: readonly string[], pointer: string): void {
  const values = assertArray(value, pointer);
  values.forEach((entry, index) => {
    assertExactKeys(entry, keys, childPointer(pointer, index));
  });
}

function assertStringArray(value: unknown, pointer: string): void {
  assertArray(value, pointer).forEach((entry, index) => {
    if (typeof entry !== "string") {
      fail("XG_SHAPE_MISSING_FIELD", childPointer(pointer, index));
    }
  });
}

/** Structural checks live here so every unspecified member fails before semantics run. */
function assertProfileShape(value: unknown): ExecutableGeometryProfile {
  const profile = assertExactKeys(value, TOP_LEVEL_KEYS, "");

  assertExactKeys(
    profile.model_binding,
    [
      "model_id",
      "model_version",
      "release_version",
      "release_digest",
      "geometry_source_ref",
      "geometry_source_digest",
      "reference_configuration",
      "reference_configuration_digest",
    ],
    "/model_binding",
  );
  assertRecord((profile.model_binding as UnknownRecord).reference_configuration, "/model_binding/reference_configuration");

  assertExactKeys(
    profile.provenance,
    [
      "origin",
      "author",
      "creation_record",
      "attestation",
      "design_input_evidence_refs",
      "municipal_source_used",
      "third_party_geometry_used",
      "copied_plan_geometry_used",
    ],
    "/provenance",
  );
  assertStringArray((profile.provenance as UnknownRecord).design_input_evidence_refs, "/provenance/design_input_evidence_refs");

  assertExactKeys(profile.units, ["length", "area"], "/units");
  assertExactKeys(profile.precision, ["length_quantum_q16", "coordinate_bound_q16"], "/precision");
  assertExactKeys(
    profile.coordinate_frame,
    ["origin", "x_axis", "y_axis", "z_axis", "handedness", "canonical_orientation"],
    "/coordinate_frame",
  );

  assertRecords(profile.levels, ["level_id", "authored_order", "floor_z_q16", "ceiling_z_q16"], "/levels");
  assertRecords(
    profile.plan_vertices,
    ["vertex_id", "authored_order", "level_id", "x_q16", "y_q16"],
    "/plan_vertices",
  );
  assertRecords(
    profile.gross_envelopes,
    ["envelope_id", "authored_order", "level_id", "ring_vertex_ids", "area2_q16sq"],
    "/gross_envelopes",
  );
  assertRecords(
    profile.plan_regions,
    ["region_id", "authored_order", "level_id", "role", "owner_ref", "ring_vertex_ids", "area2_q16sq"],
    "/plan_regions",
  );
  assertRecords(
    profile.spaces,
    [
      "space_id",
      "authored_order",
      "level_id",
      "program_role",
      "region_ref",
      "adjacent_space_refs",
      "outside_professional_scope",
      "area2_q16sq",
    ],
    "/spaces",
  );
  assertRecords(
    profile.floor_plates,
    [
      "floor_plate_id",
      "authored_order",
      "level_id",
      "gross_envelope_ref",
      "bottom_z_q16",
      "top_z_q16",
      "material_slot_refs",
      "assembly_slot_refs",
    ],
    "/floor_plates",
  );
  assertRecords(
    profile.wall_runs,
    [
      "wall_id",
      "authored_order",
      "kind",
      "level_id",
      "start_vertex_id",
      "end_vertex_id",
      "plan_region_ref",
      "thickness_q16",
      "base_z_q16",
      "head_z_q16",
      "left_space_ref",
      "right_space_ref",
      "material_slot_refs",
      "assembly_slot_refs",
      "start_junction_ref",
      "end_junction_ref",
      "opening_ids",
    ],
    "/wall_runs",
  );
  assertRecords(
    profile.wall_junctions,
    ["junction_id", "authored_order", "level_id", "region_ref", "member_wall_ids", "rule"],
    "/wall_junctions",
  );
  assertRecords(
    profile.roof_vertices,
    ["roof_vertex_id", "authored_order", "x_q16", "y_q16", "z_q16"],
    "/roof_vertices",
  );
  assertRecords(
    profile.roof_edges,
    [
      "roof_edge_id",
      "authored_order",
      "start_vertex_id",
      "end_vertex_id",
      "role",
      "adjacent_plane_ids",
      "overhang_q16",
      "eave_z_q16",
      "drainage_role",
    ],
    "/roof_edges",
  );
  assertRecords(
    profile.roof_planes,
    [
      "roof_plane_id",
      "authored_order",
      "edge_ids",
      "pitch",
      "fall_direction",
      "form",
      "material_slot_refs",
      "assembly_slot_refs",
    ],
    "/roof_planes",
  );
  (profile.roof_planes as unknown[]).forEach((entry, index) => {
    assertExactKeys((entry as UnknownRecord).pitch, ["rise", "run"], childPointer(`/roof_planes/${index}`, "pitch"));
  });
  assertRecords(
    profile.openings,
    [
      "opening_id",
      "authored_order",
      "level_id",
      "kind",
      "host_wall_id",
      "datum",
      "offset_q16",
      "cut_width_q16",
      "cut_height_q16",
      "sill_q16",
      "head_q16",
      "nominal_width_q16",
      "nominal_height_q16",
      "room_served_refs",
      "material_slot_refs",
      "assembly_slot_refs",
      "net_clear",
      "operation",
      "handing",
    ],
    "/openings",
  );
  (profile.openings as unknown[]).forEach((entry, index) => {
    assertExactKeys(
      (entry as UnknownRecord).net_clear,
      ["state", "width_q16", "height_q16", "area2_q16sq", "evidence_refs"],
      `/openings/${index}/net_clear`,
    );
  });
  assertRecords(profile.material_slots, ["slot_id", "authored_order", "role", "scope", "truth_state"], "/material_slots");
  assertRecords(profile.assembly_slots, ["slot_id", "authored_order", "role", "scope", "truth_state"], "/assembly_slots");
  assertExactKeys(
    profile.area_accounting,
    ["gross_area2_q16sq", "net_area2_q16sq", "region_area2_q16sq", "wall_junction_reserved_area2_q16sq"],
    "/area_accounting",
  );
  assertRecords(
    profile.professional_gates,
    ["gate_id", "authored_order", "status", "evidence_refs", "reviewer_role", "checked_at"],
    "/professional_gates",
  );

  const stringArrayFields: Array<[unknown, string]> = [];
  const addArrayFields = (records: unknown[], fields: string[], root: string): void => {
    records.forEach((record, index) => {
      fields.forEach((field) => stringArrayFields.push([(record as UnknownRecord)[field], `/${root}/${index}/${field}`]));
    });
  };
  addArrayFields(profile.gross_envelopes as unknown[], ["ring_vertex_ids"], "gross_envelopes");
  addArrayFields(profile.plan_regions as unknown[], ["ring_vertex_ids"], "plan_regions");
  addArrayFields(profile.spaces as unknown[], ["adjacent_space_refs"], "spaces");
  addArrayFields(profile.floor_plates as unknown[], ["material_slot_refs", "assembly_slot_refs"], "floor_plates");
  addArrayFields(profile.wall_runs as unknown[], ["material_slot_refs", "assembly_slot_refs", "opening_ids"], "wall_runs");
  addArrayFields(profile.wall_junctions as unknown[], ["member_wall_ids"], "wall_junctions");
  addArrayFields(profile.roof_edges as unknown[], ["adjacent_plane_ids"], "roof_edges");
  addArrayFields(profile.roof_planes as unknown[], ["edge_ids", "material_slot_refs", "assembly_slot_refs"], "roof_planes");
  addArrayFields(profile.openings as unknown[], ["material_slot_refs", "assembly_slot_refs"], "openings");
  (profile.openings as unknown[]).forEach((record, index) => {
    stringArrayFields.push([(record as UnknownRecord).room_served_refs, `/openings/${index}/room_served_refs`]);
    stringArrayFields.push([((record as UnknownRecord).net_clear as UnknownRecord).evidence_refs, `/openings/${index}/net_clear/evidence_refs`]);
  });
  addArrayFields(profile.professional_gates as unknown[], ["evidence_refs"], "professional_gates");
  stringArrayFields.forEach(([entry, pointer]) => assertStringArray(entry, pointer));

  return profile as unknown as ExecutableGeometryProfile;
}

function assertString(value: unknown, pointer: string, code: ExecutableGeometryRefusalCode = "XG_ID_INVALID"): string {
  if (typeof value !== "string" || value.length === 0) {
    fail(code, pointer);
  }
  return value;
}

function assertSafeInteger(
  value: unknown,
  pointer: string,
  coordinate = false,
): number {
  if (typeof value !== "number" || !Number.isFinite(value) || !Number.isInteger(value)) {
    fail("XG_PRECISION_INVALID", pointer);
  }
  if (!Number.isSafeInteger(value)) {
    fail(coordinate ? "XG_COORDINATE_UNSAFE" : "XG_PRECISION_INVALID", pointer);
  }
  return value;
}

function assertId(value: unknown, pointer: string, profile = false): string {
  const id = assertString(value, pointer);
  if (!(profile ? PROFILE_ID_PATTERN : GENERIC_ID_PATTERN).test(id)) {
    fail("XG_ID_INVALID", pointer);
  }
  return id;
}

function assertOrderedCollection(
  records: readonly UnknownRecord[],
  idKey: string,
  pointer: string,
): void {
  const ids = new Set<string>();
  const orders = new Set<number>();

  records.forEach((record, index) => {
    const recordPointer = childPointer(pointer, index);
    const id = assertId(record[idKey], childPointer(recordPointer, idKey));
    const order = assertSafeInteger(record.authored_order, childPointer(recordPointer, "authored_order"));

    if (ids.has(id)) {
      fail("XG_ID_DUPLICATE", childPointer(recordPointer, idKey), [id]);
    }
    if (orders.has(order) || order !== index) {
      fail("XG_ORDER_INVALID", childPointer(recordPointer, "authored_order"), [id]);
    }
    ids.add(id);
    orders.add(order);
  });
}

function assertIdentifiersAndOrder(profile: ExecutableGeometryProfile): void {
  if (profile.schema !== EXECUTABLE_GEOMETRY_SCHEMA) {
    fail("XG_SCHEMA_UNKNOWN", "/schema");
  }
  assertId(profile.profile_id, "/profile_id", true);
  if (!SEMVER_PATTERN.test(assertString(profile.profile_version, "/profile_version")) || MUTABLE_VERSION_ALIASES.has(profile.profile_version.toLowerCase())) {
    fail("XG_ID_INVALID", "/profile_version");
  }
  if (!new Set(["candidate_not_adopted", "owner_adopted", "retired"]).has(profile.adoption_state)) {
    fail("XG_ID_INVALID", "/adoption_state");
  }
  if (!new Set(["concept_only", "design_validated", "engineering_reviewed", "permit_package"]).has(profile.maturity)) {
    fail("XG_ID_INVALID", "/maturity");
  }

  const collections: Array<[readonly UnknownRecord[], string, string]> = [
    [profile.levels as unknown as UnknownRecord[], "level_id", "/levels"],
    [profile.plan_vertices as unknown as UnknownRecord[], "vertex_id", "/plan_vertices"],
    [profile.gross_envelopes as unknown as UnknownRecord[], "envelope_id", "/gross_envelopes"],
    [profile.plan_regions as unknown as UnknownRecord[], "region_id", "/plan_regions"],
    [profile.spaces as unknown as UnknownRecord[], "space_id", "/spaces"],
    [profile.floor_plates as unknown as UnknownRecord[], "floor_plate_id", "/floor_plates"],
    [profile.wall_runs as unknown as UnknownRecord[], "wall_id", "/wall_runs"],
    [profile.wall_junctions as unknown as UnknownRecord[], "junction_id", "/wall_junctions"],
    [profile.roof_vertices as unknown as UnknownRecord[], "roof_vertex_id", "/roof_vertices"],
    [profile.roof_edges as unknown as UnknownRecord[], "roof_edge_id", "/roof_edges"],
    [profile.roof_planes as unknown as UnknownRecord[], "roof_plane_id", "/roof_planes"],
    [profile.openings as unknown as UnknownRecord[], "opening_id", "/openings"],
    [profile.material_slots as unknown as UnknownRecord[], "slot_id", "/material_slots"],
    [profile.assembly_slots as unknown as UnknownRecord[], "slot_id", "/assembly_slots"],
    [profile.professional_gates as unknown as UnknownRecord[], "gate_id", "/professional_gates"],
  ];
  collections.forEach(([records, idKey, pointer]) => assertOrderedCollection(records, idKey, pointer));
}

function greatestCommonDivisor(left: number, right: number): number {
  let a = Math.abs(left);
  let b = Math.abs(right);
  while (b !== 0) {
    const remainder = a % b;
    a = b;
    b = remainder;
  }
  return a;
}

function assertQ16Coordinate(value: unknown, pointer: string, bound: number): number {
  const coordinate = assertSafeInteger(value, pointer, true);
  if (Math.abs(coordinate) > bound) {
    fail("XG_COORDINATE_UNSAFE", pointer);
  }
  return coordinate;
}

function assertUnitsAndPrecision(profile: ExecutableGeometryProfile): void {
  if (profile.units.length !== "q16_in" || profile.units.area !== "q16sq") {
    fail("XG_UNIT_INVALID", "/units");
  }
  if (profile.precision.length_quantum_q16 !== 1) {
    fail("XG_PRECISION_INVALID", "/precision/length_quantum_q16");
  }
  const bound = assertSafeInteger(profile.precision.coordinate_bound_q16, "/precision/coordinate_bound_q16", true);
  if (bound <= 0 || bound > 1_000_000_000) {
    fail("XG_COORDINATE_UNSAFE", "/precision/coordinate_bound_q16");
  }
  const frame = profile.coordinate_frame;
  if (
    frame.origin !== "front_left_exterior_wall_corner" ||
    frame.x_axis !== "right" ||
    frame.y_axis !== "rear" ||
    frame.z_axis !== "up" ||
    frame.handedness !== "right"
  ) {
    fail("XG_UNIT_INVALID", "/coordinate_frame");
  }
  if (frame.canonical_orientation !== 0) {
    fail("XG_TRANSFORM_FORBIDDEN", "/coordinate_frame/canonical_orientation");
  }

  profile.levels.forEach((level, index) => {
    const floor = assertQ16Coordinate(level.floor_z_q16, `/levels/${index}/floor_z_q16`, bound);
    const ceiling = assertQ16Coordinate(level.ceiling_z_q16, `/levels/${index}/ceiling_z_q16`, bound);
    if (ceiling <= floor) {
      fail("XG_PRECISION_INVALID", `/levels/${index}/ceiling_z_q16`);
    }
  });
  profile.plan_vertices.forEach((vertex, index) => {
    assertQ16Coordinate(vertex.x_q16, `/plan_vertices/${index}/x_q16`, bound);
    assertQ16Coordinate(vertex.y_q16, `/plan_vertices/${index}/y_q16`, bound);
  });
  profile.roof_vertices.forEach((vertex, index) => {
    assertQ16Coordinate(vertex.x_q16, `/roof_vertices/${index}/x_q16`, bound);
    assertQ16Coordinate(vertex.y_q16, `/roof_vertices/${index}/y_q16`, bound);
    assertQ16Coordinate(vertex.z_q16, `/roof_vertices/${index}/z_q16`, bound);
  });
  const coordinateFields: Array<[unknown, string]> = [];
  profile.floor_plates.forEach((entry, index) => {
    coordinateFields.push([entry.bottom_z_q16, `/floor_plates/${index}/bottom_z_q16`]);
    if (entry.top_z_q16 !== null) coordinateFields.push([entry.top_z_q16, `/floor_plates/${index}/top_z_q16`]);
  });
  profile.wall_runs.forEach((entry, index) => {
    if (entry.thickness_q16 !== null) coordinateFields.push([entry.thickness_q16, `/wall_runs/${index}/thickness_q16`]);
    coordinateFields.push([entry.base_z_q16, `/wall_runs/${index}/base_z_q16`], [entry.head_z_q16, `/wall_runs/${index}/head_z_q16`]);
  });
  profile.roof_edges.forEach((entry, index) => {
    coordinateFields.push([entry.overhang_q16, `/roof_edges/${index}/overhang_q16`]);
    if (entry.eave_z_q16 !== null) {
      coordinateFields.push([entry.eave_z_q16, `/roof_edges/${index}/eave_z_q16`]);
    }
  });
  profile.openings.forEach((entry, index) => {
    ["offset_q16", "cut_width_q16", "cut_height_q16", "sill_q16", "head_q16", "nominal_width_q16", "nominal_height_q16"].forEach((key) => {
      coordinateFields.push([(entry as unknown as UnknownRecord)[key], `/openings/${index}/${key}`]);
    });
    if (entry.net_clear.width_q16 !== null) coordinateFields.push([entry.net_clear.width_q16, `/openings/${index}/net_clear/width_q16`]);
    if (entry.net_clear.height_q16 !== null) coordinateFields.push([entry.net_clear.height_q16, `/openings/${index}/net_clear/height_q16`]);
  });
  coordinateFields.forEach(([value, pointer]) => assertQ16Coordinate(value, pointer, bound));

  const areaFields: Array<[unknown, string]> = [
    [profile.area_accounting.gross_area2_q16sq, "/area_accounting/gross_area2_q16sq"],
    [profile.area_accounting.region_area2_q16sq, "/area_accounting/region_area2_q16sq"],
  ];
  if (profile.area_accounting.net_area2_q16sq !== null) areaFields.push([profile.area_accounting.net_area2_q16sq, "/area_accounting/net_area2_q16sq"]);
  if (profile.area_accounting.wall_junction_reserved_area2_q16sq !== null) areaFields.push([profile.area_accounting.wall_junction_reserved_area2_q16sq, "/area_accounting/wall_junction_reserved_area2_q16sq"]);
  profile.gross_envelopes.forEach((entry, index) => areaFields.push([entry.area2_q16sq, `/gross_envelopes/${index}/area2_q16sq`]));
  profile.plan_regions.forEach((entry, index) => areaFields.push([entry.area2_q16sq, `/plan_regions/${index}/area2_q16sq`]));
  profile.spaces.forEach((entry, index) => areaFields.push([entry.area2_q16sq, `/spaces/${index}/area2_q16sq`]));
  profile.openings.forEach((entry, index) => {
    if (entry.net_clear.area2_q16sq !== null) areaFields.push([entry.net_clear.area2_q16sq, `/openings/${index}/net_clear/area2_q16sq`]);
  });
  areaFields.forEach(([value, pointer]) => assertSafeInteger(value, pointer));

  profile.roof_planes.forEach((plane, index) => {
    const rise = assertSafeInteger(plane.pitch.rise, `/roof_planes/${index}/pitch/rise`);
    const run = assertSafeInteger(plane.pitch.run, `/roof_planes/${index}/pitch/run`);
    if (rise <= 0 || run <= 0 || greatestCommonDivisor(rise, run) !== 1) {
      fail("XG_PRECISION_INVALID", `/roof_planes/${index}/pitch`);
    }
  });
}

const UNRESOLVED_D08_FIELDS: ExecutableGeometryResolution["unresolved_fields"] = [
  "floor_assembly_thickness",
  "wall_assembly_thickness",
  "wall_junction_geometry",
  "roof_assembly_thickness",
] as const;
const BLOCKED_MATERIALIZATION_OUTPUTS: ExecutableGeometryResolution["blocked_outputs"] = ["step", "glb", "render"];

function sameOrderedStrings(actual: readonly string[], expected: readonly string[]): boolean {
  return actual.length === expected.length && actual.every((value, index) => value === expected[index]);
}

export function getExecutableGeometryResolution(
  profile: ExecutableGeometryProfile,
): ExecutableGeometryResolution {
  const unresolved_fields: ExecutableGeometryResolution["unresolved_fields"] = [];
  if (profile.floor_plates.some((plate) => plate.top_z_q16 === null)) {
    unresolved_fields.push("floor_assembly_thickness");
  }
  if (profile.wall_runs.some((wall) => wall.thickness_q16 === null || wall.plan_region_ref === null)) {
    unresolved_fields.push("wall_assembly_thickness");
  }
  if (profile.wall_junctions.some((junction) => junction.region_ref === null)) {
    unresolved_fields.push("wall_junction_geometry");
  }
  if (
    profile.assembly_slots.some(
      (slot) => slot.role === "roof_field" && slot.truth_state === "unresolved_semantic",
    )
  ) {
    unresolved_fields.push("roof_assembly_thickness");
  }
  return unresolved_fields.length === 0
    ? { state: "materialization_ready", unresolved_fields, blocked_outputs: [] }
    : {
        state: "blocked_unresolved_geometry",
        unresolved_fields,
        blocked_outputs: [...BLOCKED_MATERIALIZATION_OUTPUTS],
      };
}

function assertGeometryResolution(profile: ExecutableGeometryProfile): void {
  const floorAnyUnresolved = profile.floor_plates.some((plate) => plate.top_z_q16 === null);
  const floorAllUnresolved = profile.floor_plates.every((plate) => plate.top_z_q16 === null);
  const wallAnyUnresolved = profile.wall_runs.some(
    (wall) => wall.thickness_q16 === null || wall.plan_region_ref === null,
  );
  const wallAllUnresolved = profile.wall_runs.every(
    (wall) => wall.thickness_q16 === null && wall.plan_region_ref === null,
  );
  const junctionAnyUnresolved = profile.wall_junctions.some(
    (junction) => junction.region_ref === null,
  );
  const junctionAllUnresolved = profile.wall_junctions.every(
    (junction) => junction.region_ref === null,
  );
  if (
    (floorAnyUnresolved && !floorAllUnresolved) ||
    (wallAnyUnresolved && !wallAllUnresolved) ||
    (junctionAnyUnresolved && !junctionAllUnresolved)
  ) {
    fail("XG_UNRESOLVED_GEOMETRY_SMUGGLED", "/floor_plates");
  }
  const resolution = getExecutableGeometryResolution(profile);
  if (resolution.state === "materialization_ready") {
    if (
      profile.area_accounting.net_area2_q16sq === null ||
      profile.area_accounting.wall_junction_reserved_area2_q16sq === null
    ) {
      fail("XG_REQUIRED_GEOMETRY_UNRESOLVED", "/area_accounting");
    }
    return;
  }
  if (profile.maturity !== "concept_only") {
    fail("XG_REQUIRED_GEOMETRY_UNRESOLVED", "/maturity");
  }
  if (
    !sameOrderedStrings(resolution.unresolved_fields, UNRESOLVED_D08_FIELDS) ||
    profile.area_accounting.net_area2_q16sq !== null ||
    profile.area_accounting.wall_junction_reserved_area2_q16sq !== null
  ) {
    fail("XG_UNRESOLVED_GEOMETRY_SMUGGLED", "/floor_plates");
  }
}

export function assertExecutableGeometryMaterializable(
  profile: ExecutableGeometryProfile,
  output: "step" | "glb" | "render",
): void {
  if (getExecutableGeometryResolution(profile).blocked_outputs.includes(output)) {
    fail("XG_REQUIRED_GEOMETRY_UNRESOLVED", "/floor_plates", [output]);
  }
}

function mapById<T extends UnknownRecord>(records: readonly T[], idKey: string): Map<string, T> {
  return new Map(records.map((record) => [record[idKey] as string, record]));
}

function requireReference<T>(map: ReadonlyMap<string, T>, id: unknown, pointer: string): T {
  if (typeof id !== "string" || !map.has(id)) {
    fail("XG_REF_UNRESOLVED", pointer);
  }
  return map.get(id)!;
}

function sameJson(left: unknown, right: unknown): boolean {
  return canonicalizeJson(left) === canonicalizeJson(right);
}

async function assertReferencesAndBindings(
  profile: ExecutableGeometryProfile,
  context: ExecutableGeometryBindingContext,
): Promise<void> {
  const binding = profile.model_binding;
  if (
    context.model.schema !== "adu-model/1" ||
    binding.model_id !== context.model.model_id ||
    binding.model_version !== context.model.version ||
    profile.maturity !== context.model.maturity
  ) {
    fail("XG_BINDING_MODEL_MISMATCH", "/model_binding/model_id");
  }
  if (
    context.release.schema !== "adu-model-release/1" ||
    binding.release_version !== context.release.release_version ||
    binding.release_digest !== context.release.release_digest
  ) {
    fail("XG_BINDING_RELEASE_MISMATCH", "/model_binding/release_digest");
  }
  if (
    context.geometry_source.schema !== "adu-geometry-source/1" ||
    context.geometry_source.model_id !== context.model.model_id ||
    binding.geometry_source_ref !== context.model.geometry.source_ref ||
    binding.geometry_source_digest !== context.model.geometry.digest ||
    !sameJson(binding.reference_configuration, context.geometry_source.reference_configuration)
  ) {
    fail("XG_BINDING_SOURCE_MISMATCH", "/model_binding/geometry_source_ref");
  }
  const expectedConfigurationDigest = await computeReferenceConfigurationDigest(context.geometry_source.reference_configuration);
  const bindingConfigurationDigest = await computeReferenceConfigurationDigest(binding.reference_configuration);
  if (
    binding.reference_configuration_digest !== expectedConfigurationDigest ||
    bindingConfigurationDigest !== expectedConfigurationDigest
  ) {
    fail("XG_BINDING_SOURCE_MISMATCH", "/model_binding/reference_configuration_digest");
  }

  if (profile.provenance.origin !== "west_coast_kbp_original" || profile.provenance.municipal_source_used || profile.provenance.third_party_geometry_used || profile.provenance.copied_plan_geometry_used) {
    fail("XG_BINDING_SOURCE_MISMATCH", "/provenance");
  }

  const levels = mapById(profile.levels as unknown as UnknownRecord[], "level_id");
  const vertices = mapById(profile.plan_vertices as unknown as UnknownRecord[], "vertex_id");
  const envelopes = mapById(profile.gross_envelopes as unknown as UnknownRecord[], "envelope_id");
  const regions = mapById(profile.plan_regions as unknown as UnknownRecord[], "region_id");
  const spaces = mapById(profile.spaces as unknown as UnknownRecord[], "space_id");

  profile.plan_vertices.forEach((entry, index) => requireReference(levels, entry.level_id, `/plan_vertices/${index}/level_id`));
  profile.gross_envelopes.forEach((entry, index) => {
    requireReference(levels, entry.level_id, `/gross_envelopes/${index}/level_id`);
    entry.ring_vertex_ids.forEach((id, nested) => {
      const vertex = requireReference(vertices, id, `/gross_envelopes/${index}/ring_vertex_ids/${nested}`);
      if (vertex.level_id !== entry.level_id) fail("XG_REF_UNRESOLVED", `/gross_envelopes/${index}/ring_vertex_ids/${nested}`);
    });
  });
  profile.plan_regions.forEach((entry, index) => {
    requireReference(levels, entry.level_id, `/plan_regions/${index}/level_id`);
    entry.ring_vertex_ids.forEach((id, nested) => {
      const vertex = requireReference(vertices, id, `/plan_regions/${index}/ring_vertex_ids/${nested}`);
      if (vertex.level_id !== entry.level_id) fail("XG_REF_UNRESOLVED", `/plan_regions/${index}/ring_vertex_ids/${nested}`);
    });
  });
  profile.spaces.forEach((entry, index) => {
    requireReference(levels, entry.level_id, `/spaces/${index}/level_id`);
    const region = requireReference(regions, entry.region_ref, `/spaces/${index}/region_ref`);
    if (region.role !== "space" || region.level_id !== entry.level_id) fail("XG_REF_UNRESOLVED", `/spaces/${index}/region_ref`);
    entry.adjacent_space_refs.forEach((id, nested) => {
      if (id === entry.space_id) fail("XG_REF_UNRESOLVED", `/spaces/${index}/adjacent_space_refs/${nested}`);
      requireReference(spaces, id, `/spaces/${index}/adjacent_space_refs/${nested}`);
    });
    if (new Set(entry.adjacent_space_refs).size !== entry.adjacent_space_refs.length) {
      fail("XG_ADJACENCY_MISMATCH", `/spaces/${index}/adjacent_space_refs`);
    }
  });
  profile.spaces.forEach((entry, index) => {
    entry.adjacent_space_refs.forEach((id, nested) => {
      const adjacent = spaces.get(id) as unknown as ExecutableGeometryProfile["spaces"][number];
      if (!adjacent.adjacent_space_refs.includes(entry.space_id)) {
        fail("XG_ADJACENCY_MISMATCH", `/spaces/${index}/adjacent_space_refs/${nested}`, [entry.space_id, id]);
      }
    });
  });
  profile.floor_plates.forEach((entry, index) => {
    requireReference(levels, entry.level_id, `/floor_plates/${index}/level_id`);
    const envelope = requireReference(envelopes, entry.gross_envelope_ref, `/floor_plates/${index}/gross_envelope_ref`);
    if (envelope.level_id !== entry.level_id) fail("XG_REF_UNRESOLVED", `/floor_plates/${index}/gross_envelope_ref`);
  });
  profile.wall_runs.forEach((entry, index) => {
    requireReference(levels, entry.level_id, `/wall_runs/${index}/level_id`);
    const start = requireReference(vertices, entry.start_vertex_id, `/wall_runs/${index}/start_vertex_id`);
    const end = requireReference(vertices, entry.end_vertex_id, `/wall_runs/${index}/end_vertex_id`);
    const region = entry.plan_region_ref === null
      ? null
      : requireReference(regions, entry.plan_region_ref, `/wall_runs/${index}/plan_region_ref`);
    if (start.level_id !== entry.level_id || end.level_id !== entry.level_id || (region !== null && region.level_id !== entry.level_id)) {
      fail("XG_REF_UNRESOLVED", `/wall_runs/${index}`);
    }
    [entry.left_space_ref, entry.right_space_ref].forEach((side, nested) => {
      if (side !== "exterior") requireReference(spaces, side, `/wall_runs/${index}/${nested === 0 ? "left_space_ref" : "right_space_ref"}`);
    });
  });
}

function orientation(first: Point, second: Point, third: Point): bigint {
  return (second.x - first.x) * (third.y - first.y) - (second.y - first.y) * (third.x - first.x);
}

function onSegment(first: Point, point: Point, second: Point): boolean {
  return (
    orientation(first, second, point) === BIGINT_ZERO &&
    point.x >= (first.x < second.x ? first.x : second.x) &&
    point.x <= (first.x > second.x ? first.x : second.x) &&
    point.y >= (first.y < second.y ? first.y : second.y) &&
    point.y <= (first.y > second.y ? first.y : second.y)
  );
}

function segmentsIntersect(first: Point, second: Point, third: Point, fourth: Point): boolean {
  const one = orientation(first, second, third);
  const two = orientation(first, second, fourth);
  const three = orientation(third, fourth, first);
  const four = orientation(third, fourth, second);
  const opposite = (left: bigint, right: bigint): boolean =>
    (left < BIGINT_ZERO && right > BIGINT_ZERO) || (left > BIGINT_ZERO && right < BIGINT_ZERO);
  return (
    (opposite(one, two) && opposite(three, four)) ||
    (one === BIGINT_ZERO && onSegment(first, third, second)) ||
    (two === BIGINT_ZERO && onSegment(first, fourth, second)) ||
    (three === BIGINT_ZERO && onSegment(third, first, fourth)) ||
    (four === BIGINT_ZERO && onSegment(third, second, fourth))
  );
}

function properSegmentsIntersect(first: Point, second: Point, third: Point, fourth: Point): boolean {
  const one = orientation(first, second, third);
  const two = orientation(first, second, fourth);
  const three = orientation(third, fourth, first);
  const four = orientation(third, fourth, second);
  return (
    ((one < BIGINT_ZERO && two > BIGINT_ZERO) || (one > BIGINT_ZERO && two < BIGINT_ZERO)) &&
    ((three < BIGINT_ZERO && four > BIGINT_ZERO) || (three > BIGINT_ZERO && four < BIGINT_ZERO))
  );
}

function twiceSignedArea(points: readonly Point[]): bigint {
  let area = BIGINT_ZERO;
  for (let index = 0; index < points.length - 1; index += 1) {
    area += points[index].x * points[index + 1].y - points[index + 1].x * points[index].y;
  }
  return area;
}

function pointInRing(point: Point, ring: Ring, strict = false): boolean {
  let inside = false;
  for (let index = 0, previous = ring.points.length - 2; index < ring.points.length - 1; previous = index, index += 1) {
    const currentPoint = ring.points[index];
    const previousPoint = ring.points[previous];
    if (onSegment(previousPoint, point, currentPoint)) return !strict;
    const crosses = (currentPoint.y > point.y) !== (previousPoint.y > point.y);
    if (crosses) {
      const vertical = previousPoint.y - currentPoint.y;
      const left = (previousPoint.x - currentPoint.x) * (point.y - currentPoint.y);
      const right = (point.x - currentPoint.x) * vertical;
      if ((vertical > BIGINT_ZERO && left > right) || (vertical < BIGINT_ZERO && left < right)) {
        inside = !inside;
      }
    }
  }
  return inside;
}

function ringFromVertexIds(
  ids: readonly string[],
  vertices: ReadonlyMap<string, UnknownRecord>,
  pointer: string,
  declaredArea: number,
): Ring {
  if (ids.length < 4 || ids[0] !== ids.at(-1)) {
    fail("XG_RING_OPEN", pointer);
  }
  const nonClosing = ids.slice(0, -1);
  if (new Set(nonClosing).size < 3) fail("XG_RING_DEGENERATE", pointer);
  const points = ids.map((id, index) => {
    const vertex = requireReference(vertices, id, childPointer(pointer, index));
    return { x: BigInt(vertex.x_q16 as number), y: BigInt(vertex.y_q16 as number) };
  });
  for (let index = 0; index < points.length - 1; index += 1) {
    if (points[index].x === points[index + 1].x && points[index].y === points[index + 1].y) {
      fail("XG_RING_DEGENERATE", childPointer(pointer, index));
    }
  }
  for (let first = 0; first < points.length - 1; first += 1) {
    for (let second = first + 1; second < points.length - 1; second += 1) {
      if (second === first + 1 || (first === 0 && second === points.length - 2)) continue;
      if (segmentsIntersect(points[first], points[first + 1], points[second], points[second + 1])) {
        fail("XG_RING_SELF_INTERSECTION", pointer);
      }
    }
  }
  const area2 = twiceSignedArea(points);
  if (area2 <= BIGINT_ZERO) fail("XG_RING_DEGENERATE", pointer);
  if (area2 !== BigInt(declaredArea)) fail("XG_AREA_ACCOUNTING_MISMATCH", pointer);
  return { points, area2 };
}

function assertPrimitiveRings(profile: ExecutableGeometryProfile): { envelopes: Map<string, Ring>; regions: Map<string, Ring> } {
  const vertices = mapById(profile.plan_vertices as unknown as UnknownRecord[], "vertex_id");
  const envelopes = new Map<string, Ring>();
  const regions = new Map<string, Ring>();
  profile.gross_envelopes.forEach((entry, index) => {
    envelopes.set(entry.envelope_id, ringFromVertexIds(entry.ring_vertex_ids, vertices, `/gross_envelopes/${index}/ring_vertex_ids`, entry.area2_q16sq));
  });
  profile.plan_regions.forEach((entry, index) => {
    regions.set(entry.region_id, ringFromVertexIds(entry.ring_vertex_ids, vertices, `/plan_regions/${index}/ring_vertex_ids`, entry.area2_q16sq));
  });
  return { envelopes, regions };
}

function polygonsInteriorOverlap(left: Ring, right: Ring): boolean {
  if (
    left.points.length === right.points.length &&
    left.points.every((point, index) => point.x === right.points[index].x && point.y === right.points[index].y)
  ) {
    return true;
  }
  for (let first = 0; first < left.points.length - 1; first += 1) {
    for (let second = 0; second < right.points.length - 1; second += 1) {
      if (properSegmentsIntersect(left.points[first], left.points[first + 1], right.points[second], right.points[second + 1])) return true;
    }
  }
  return left.points.slice(0, -1).some((point) => pointInRing(point, right, true)) || right.points.slice(0, -1).some((point) => pointInRing(point, left, true));
}

function assertRegionsAndAreaAccounting(profile: ExecutableGeometryProfile, rings: { envelopes: Map<string, Ring>; regions: Map<string, Ring> }): void {
  const envelopeByLevel = new Map<string, { id: string; ring: Ring }>();
  profile.gross_envelopes.forEach((entry, index) => {
    if (envelopeByLevel.has(entry.level_id)) fail("XG_REF_UNRESOLVED", `/gross_envelopes/${index}/level_id`);
    envelopeByLevel.set(entry.level_id, { id: entry.envelope_id, ring: rings.envelopes.get(entry.envelope_id)! });
  });
  profile.plan_regions.forEach((region, index) => {
    const envelope = envelopeByLevel.get(region.level_id);
    const ring = rings.regions.get(region.region_id)!;
    if (envelope === undefined || !ring.points.slice(0, -1).every((point) => pointInRing(point, envelope.ring))) {
      fail("XG_REGION_OUTSIDE_ENVELOPE", `/plan_regions/${index}/ring_vertex_ids`);
    }
  });
  for (let left = 0; left < profile.plan_regions.length; left += 1) {
    for (let right = left + 1; right < profile.plan_regions.length; right += 1) {
      if (profile.plan_regions[left].level_id !== profile.plan_regions[right].level_id) continue;
      if (polygonsInteriorOverlap(rings.regions.get(profile.plan_regions[left].region_id)!, rings.regions.get(profile.plan_regions[right].region_id)!)) {
        fail("XG_REGION_OVERLAP", `/plan_regions/${right}/ring_vertex_ids`, [profile.plan_regions[left].region_id, profile.plan_regions[right].region_id]);
      }
    }
  }
  let totalGross = BIGINT_ZERO;
  let totalRegions = BIGINT_ZERO;
  let net = BIGINT_ZERO;
  let nonNet = BIGINT_ZERO;
  profile.gross_envelopes.forEach((entry) => { totalGross += BigInt(entry.area2_q16sq); });
  profile.plan_regions.forEach((entry) => {
    totalRegions += BigInt(entry.area2_q16sq);
    if (entry.role === "space") net += BigInt(entry.area2_q16sq);
    else nonNet += BigInt(entry.area2_q16sq);
  });
  const unresolved = getExecutableGeometryResolution(profile).state === "blocked_unresolved_geometry";
  if (
    totalGross !== totalRegions ||
    totalGross !== BigInt(profile.area_accounting.gross_area2_q16sq) ||
    totalRegions !== BigInt(profile.area_accounting.region_area2_q16sq) ||
    (unresolved
      ? net !== totalGross || nonNet !== BIGINT_ZERO
      : net !== BigInt(profile.area_accounting.net_area2_q16sq!) ||
        nonNet !== BigInt(profile.area_accounting.wall_junction_reserved_area2_q16sq!))
  ) {
    fail("XG_AREA_ACCOUNTING_MISMATCH", "/area_accounting");
  }
  const spaceRegions = new Set(profile.spaces.map((space) => space.region_ref));
  if (spaceRegions.size !== profile.spaces.length) fail("XG_AREA_ACCOUNTING_MISMATCH", "/spaces");
  profile.plan_regions.forEach((region, index) => {
    if ((region.role === "space") !== spaceRegions.has(region.region_id)) {
      fail("XG_AREA_ACCOUNTING_MISMATCH", `/plan_regions/${index}/owner_ref`);
    }
  });
}

function wallSegmentKey(start: string, end: string): string {
  return `${start}\u0000${end}`;
}

function assertWallsAndJunctions(profile: ExecutableGeometryProfile): void {
  const unresolved = getExecutableGeometryResolution(profile).state === "blocked_unresolved_geometry";
  const regions = mapById(profile.plan_regions as unknown as UnknownRecord[], "region_id");
  const walls = mapById(profile.wall_runs as unknown as UnknownRecord[], "wall_id");
  const junctions = mapById(profile.wall_junctions as unknown as UnknownRecord[], "junction_id");
  const envelopeEdges = new Map<string, number>();
  profile.gross_envelopes.forEach((envelope) => {
    for (let index = 0; index < envelope.ring_vertex_ids.length - 1; index += 1) {
      envelopeEdges.set(wallSegmentKey(envelope.ring_vertex_ids[index], envelope.ring_vertex_ids[index + 1]), 0);
    }
  });
  const cardinality: Record<string, number> = { miter: 2, butt_continuing: 2, butt_terminating: 2, tee: 3, cross: 4 };
  profile.wall_junctions.forEach((junction, index) => {
    const region = junction.region_ref === null ? undefined : regions.get(junction.region_ref);
    if (unresolved ? junction.region_ref !== null : region === undefined || region.role !== "junction") {
      fail("XG_ENCLOSURE_GAP", `/wall_junctions/${index}/region_ref`);
    }
    if (junction.member_wall_ids.length !== cardinality[junction.rule] || new Set(junction.member_wall_ids).size !== junction.member_wall_ids.length) {
      fail("XG_WALL_JUNCTION_INVALID", `/wall_junctions/${index}/member_wall_ids`);
    }
    junction.member_wall_ids.forEach((wallId, nested) => {
      const wall = walls.get(wallId);
      if (wall === undefined || wall.level_id !== junction.level_id || (wall.start_junction_ref !== junction.junction_id && wall.end_junction_ref !== junction.junction_id)) {
        fail("XG_WALL_JUNCTION_INVALID", `/wall_junctions/${index}/member_wall_ids/${nested}`);
      }
    });
  });
  profile.wall_runs.forEach((wall, index) => {
    const region = wall.plan_region_ref === null ? undefined : regions.get(wall.plan_region_ref);
    if (unresolved
      ? wall.plan_region_ref !== null || wall.thickness_q16 !== null
      : region === undefined ||
        region.role !== (wall.kind === "exterior" ? "exterior_wall" : "partition") ||
        region.owner_ref !== wall.wall_id
    ) {
      fail("XG_WALL_JUNCTION_INVALID", `/wall_runs/${index}/plan_region_ref`);
    }
    if (
      wall.start_vertex_id === wall.end_vertex_id ||
      (!unresolved && wall.thickness_q16! <= 0) ||
      wall.head_z_q16 <= wall.base_z_q16
    ) {
      fail("XG_WALL_JUNCTION_INVALID", `/wall_runs/${index}`);
    }
    const start = junctions.get(wall.start_junction_ref);
    const end = junctions.get(wall.end_junction_ref);
    if (
      start === undefined ||
      end === undefined ||
      !(start.member_wall_ids as string[]).includes(wall.wall_id as string) ||
      !(end.member_wall_ids as string[]).includes(wall.wall_id as string)
    ) {
      fail("XG_WALL_JUNCTION_INVALID", `/wall_runs/${index}/start_junction_ref`);
    }
    const exteriorSides = [wall.left_space_ref, wall.right_space_ref].filter((side) => side === "exterior").length;
    if (wall.kind === "exterior" ? exteriorSides !== 1 : exteriorSides !== 0 || wall.left_space_ref === wall.right_space_ref) {
      fail("XG_WALL_JUNCTION_INVALID", `/wall_runs/${index}/left_space_ref`);
    }
    if (wall.kind === "exterior") {
      const key = wallSegmentKey(wall.start_vertex_id, wall.end_vertex_id);
      if (!envelopeEdges.has(key)) fail("XG_ENCLOSURE_GAP", `/wall_runs/${index}`);
      envelopeEdges.set(key, envelopeEdges.get(key)! + 1);
    }
  });
  for (const [edge, count] of envelopeEdges) {
    if (count === 0) fail("XG_ENCLOSURE_GAP", "/wall_runs", edge.split("\u0000"));
    if (count > 1) fail("XG_ENCLOSURE_OVERLAP", "/wall_runs", edge.split("\u0000"));
  }
}

function wallLengthQ16(wall: UnknownRecord, vertices: ReadonlyMap<string, UnknownRecord>): bigint {
  const start = requireReference(vertices, wall.start_vertex_id, "");
  const end = requireReference(vertices, wall.end_vertex_id, "");
  const dx = BigInt(end.x_q16 as number) - BigInt(start.x_q16 as number);
  const dy = BigInt(end.y_q16 as number) - BigInt(start.y_q16 as number);
  if (dx !== BIGINT_ZERO && dy !== BIGINT_ZERO) return dx < BIGINT_ZERO ? -dx : dx;
  const distance = dx === BIGINT_ZERO ? (dy < BIGINT_ZERO ? -dy : dy) : (dx < BIGINT_ZERO ? -dx : dx);
  return distance;
}

function assertOpenings(profile: ExecutableGeometryProfile): void {
  const walls = mapById(profile.wall_runs as unknown as UnknownRecord[], "wall_id");
  const vertices = mapById(profile.plan_vertices as unknown as UnknownRecord[], "vertex_id");
  const spaces = mapById(profile.spaces as unknown as UnknownRecord[], "space_id");
  const openingCount = new Map<string, number>();
  profile.wall_runs.forEach((wall, index) => {
    (wall.opening_ids as string[]).forEach((id) => openingCount.set(id, (openingCount.get(id) ?? 0) + 1));
    if (new Set(wall.opening_ids as string[]).size !== (wall.opening_ids as string[]).length) {
      fail("XG_OPENING_HOST_MULTIPLE", `/wall_runs/${index}/opening_ids`);
    }
  });
  const openingsByWall = new Map<string, Array<{ opening: ExecutableGeometryProfile["openings"][number]; index: number }>>();
  profile.openings.forEach((opening, index) => {
    const wall = walls.get(opening.host_wall_id);
    if (wall === undefined) fail("XG_OPENING_HOST_MISSING", `/openings/${index}/host_wall_id`);
    if ((openingCount.get(opening.opening_id) ?? 0) === 0) fail("XG_OPENING_HOST_MISSING", `/openings/${index}/opening_id`);
    if ((openingCount.get(opening.opening_id) ?? 0) !== 1) fail("XG_OPENING_HOST_MULTIPLE", `/openings/${index}/opening_id`);
    if (!(wall.opening_ids as string[]).includes(opening.opening_id)) {
      fail("XG_OPENING_HOST_MISSING", `/openings/${index}/host_wall_id`);
    }
    if (opening.datum !== "host_start_to_opening_start" || opening.offset_q16 < 0 || opening.cut_width_q16 <= 0) {
      fail("XG_OPENING_OFFSET_INVALID", `/openings/${index}/offset_q16`);
    }
    const length = wallLengthQ16(wall, vertices);
    if (BigInt(opening.offset_q16 + opening.cut_width_q16) >= length) fail("XG_OPENING_OFFSET_INVALID", `/openings/${index}/offset_q16`);
    if (opening.head_q16 - opening.sill_q16 !== opening.cut_height_q16 || opening.sill_q16 < (wall.base_z_q16 as number) || opening.head_q16 > (wall.head_z_q16 as number)) {
      fail("XG_OPENING_VERTICAL_INVALID", `/openings/${index}/head_q16`);
    }
    const door = opening.kind === "door";
    const cased = opening.kind === "cased_opening";
    const requiresHand = door
      ? opening.operation === "swing_in" || opening.operation === "swing_out"
      : opening.kind === "window" && opening.operation === "casement";
    const allowedOperation = cased
      ? opening.operation === "not_applicable"
      : door
        ? new Set(["swing_in", "swing_out", "sliding", "pocket", "not_evaluated"]).has(opening.operation)
        : new Set(["fixed", "casement", "awning", "slider", "single_hung", "not_evaluated"]).has(opening.operation);
    const allowedHand = requiresHand
      ? ["left", "right", "not_evaluated"].includes(opening.handing)
      : opening.operation === "not_evaluated"
        ? opening.handing === "not_evaluated"
        : opening.handing === "not_applicable";
    if (!allowedOperation || !allowedHand) {
      fail("XG_OPENING_HANDING_INVALID", `/openings/${index}/handing`);
    }
    const expectedRooms = new Set([wall.left_space_ref as string, wall.right_space_ref as string]);
    const actualRooms = new Set(opening.room_served_refs);
    if (expectedRooms.size !== actualRooms.size || [...expectedRooms].some((room) => !actualRooms.has(room))) {
      fail("XG_OPENING_ROOM_MISMATCH", `/openings/${index}/room_served_refs`);
    }
    const interiorRooms = opening.room_served_refs.filter((room) => room !== "exterior");
    if (interiorRooms.length === 2) {
      const first = spaces.get(interiorRooms[0]) as unknown as ExecutableGeometryProfile["spaces"][number] | undefined;
      if (first === undefined || !first.adjacent_space_refs.includes(interiorRooms[1])) {
        fail("XG_ADJACENCY_MISMATCH", `/openings/${index}/room_served_refs`, interiorRooms);
      }
    }
    const clear = opening.net_clear;
    if (clear.state === "verified") {
      if (clear.width_q16 === null || clear.height_q16 === null || clear.area2_q16sq === null || clear.evidence_refs.length === 0) fail("XG_OPENING_VERTICAL_INVALID", `/openings/${index}/net_clear`);
    } else if (clear.width_q16 !== null || clear.height_q16 !== null || clear.area2_q16sq !== null || clear.evidence_refs.length !== 0) {
      fail("XG_OPENING_VERTICAL_INVALID", `/openings/${index}/net_clear`);
    }
    const list = openingsByWall.get(opening.host_wall_id) ?? [];
    list.push({ opening, index });
    openingsByWall.set(opening.host_wall_id, list);
  });
  for (const entries of openingsByWall.values()) {
    for (let left = 0; left < entries.length; left += 1) {
      for (let right = left + 1; right < entries.length; right += 1) {
        const leftStart = entries[left].opening.offset_q16;
        const leftEnd = leftStart + entries[left].opening.cut_width_q16;
        const rightStart = entries[right].opening.offset_q16;
        const rightEnd = rightStart + entries[right].opening.cut_width_q16;
        if (leftStart < rightEnd && rightStart < leftEnd) fail("XG_OPENING_OUT_OF_HOST", `/openings/${entries[right].index}/offset_q16`);
      }
    }
  }
}

function roofPlaneVertices(plane: UnknownRecord, edges: ReadonlyMap<string, UnknownRecord>, vertices: ReadonlyMap<string, UnknownRecord>, pointer: string): UnknownRecord[] {
  const edgeIds = plane.edge_ids as string[];
  const degree = new Map<string, number>();
  edgeIds.forEach((edgeId, index) => {
    const edge = requireReference(edges, edgeId, `${pointer}/edge_ids/${index}`);
    const start = edge.start_vertex_id as string;
    const end = edge.end_vertex_id as string;
    degree.set(start, (degree.get(start) ?? 0) + 1);
    degree.set(end, (degree.get(end) ?? 0) + 1);
  });
  if (edgeIds.length < 3 || [...degree.values()].some((count) => count !== 2)) fail("XG_ROOF_DISCONTINUITY", `${pointer}/edge_ids`);
  const ids = [...degree.keys()];
  const first = requireReference(vertices, ids[0], `${pointer}/edge_ids/0`);
  const remaining = ids.slice(1).map((id) => requireReference(vertices, id, `${pointer}/edge_ids`));
  return [first, ...remaining];
}

function isPlanar(vertices: readonly UnknownRecord[]): boolean {
  if (vertices.length <= 3) return true;
  const asPoint = (entry: UnknownRecord): [bigint, bigint, bigint] => [BigInt(entry.x_q16 as number), BigInt(entry.y_q16 as number), BigInt(entry.z_q16 as number)];
  const [a, b, c] = vertices.slice(0, 3).map(asPoint);
  const normal: [bigint, bigint, bigint] = [
    (b[1] - a[1]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[1] - a[1]),
    (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]),
    (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]),
  ];
  return vertices.slice(3).every((entry) => {
    const point = asPoint(entry);
    return normal[0] * (point[0] - a[0]) + normal[1] * (point[1] - a[1]) + normal[2] * (point[2] - a[2]) === BIGINT_ZERO;
  });
}

function assertRoof(profile: ExecutableGeometryProfile): void {
  const vertices = mapById(profile.roof_vertices as unknown as UnknownRecord[], "roof_vertex_id");
  const edges = mapById(profile.roof_edges as unknown as UnknownRecord[], "roof_edge_id");
  const planes = mapById(profile.roof_planes as unknown as UnknownRecord[], "roof_plane_id");
  const edgeUse = new Map<string, string[]>();
  profile.roof_edges.forEach((edge, index) => {
    requireReference(vertices, edge.start_vertex_id, `/roof_edges/${index}/start_vertex_id`);
    requireReference(vertices, edge.end_vertex_id, `/roof_edges/${index}/end_vertex_id`);
    if (edge.start_vertex_id === edge.end_vertex_id || new Set(edge.adjacent_plane_ids).size !== edge.adjacent_plane_ids.length || edge.adjacent_plane_ids.length < 1 || edge.adjacent_plane_ids.length > 2) {
      fail("XG_ROOF_TOPOLOGY_AMBIGUOUS", `/roof_edges/${index}`);
    }
    edge.adjacent_plane_ids.forEach((id, nested) => requireReference(planes, id, `/roof_edges/${index}/adjacent_plane_ids/${nested}`));
    if ((["ridge", "hip", "valley", "shared"] as string[]).includes(edge.role) !== (edge.adjacent_plane_ids.length === 2)) {
      fail("XG_ROOF_TOPOLOGY_AMBIGUOUS", `/roof_edges/${index}/role`);
    }
    if (edge.role === "eave" && edge.eave_z_q16 === null) fail("XG_ROOF_DISCONTINUITY", `/roof_edges/${index}/eave_z_q16`);
  });
  profile.roof_planes.forEach((plane, index) => {
    const usedVertices = roofPlaneVertices(plane as unknown as UnknownRecord, edges, vertices, `/roof_planes/${index}`);
    if (!isPlanar(usedVertices)) fail("XG_ROOF_DISCONTINUITY", `/roof_planes/${index}/edge_ids`);
    plane.edge_ids.forEach((edgeId) => {
      const list = edgeUse.get(edgeId) ?? [];
      list.push(plane.roof_plane_id);
      edgeUse.set(edgeId, list);
    });
    const values = usedVertices.map((vertex) => ({ x: BigInt(vertex.x_q16 as number), y: BigInt(vertex.y_q16 as number), z: BigInt(vertex.z_q16 as number) }));
    const maxZ = values.reduce((value, point) => point.z > value ? point.z : value, values[0].z);
    const minZ = values.reduce((value, point) => point.z < value ? point.z : value, values[0].z);
    const xs = values.map((point) => point.x);
    const ys = values.map((point) => point.y);
    const spanX = xs.reduce((min, value) => value < min ? value : min, xs[0]);
    const maxX = xs.reduce((max, value) => value > max ? value : max, xs[0]);
    const spanY = ys.reduce((min, value) => value < min ? value : min, ys[0]);
    const maxY = ys.reduce((max, value) => value > max ? value : max, ys[0]);
    const options = [maxX - spanX, maxY - spanY].filter((value) => value > BIGINT_ZERO);
    const run = options.reduce((smallest, value) => value < smallest ? value : smallest);
    const rise = maxZ - minZ;
    const declared = BigInt(plane.pitch.rise) * run === BigInt(plane.pitch.run) * rise;
    if (rise <= BIGINT_ZERO || !declared) fail("XG_ROOF_PITCH_MISMATCH", `/roof_planes/${index}/pitch`);
  });
  profile.roof_edges.forEach((edge, index) => {
    const usedBy = edgeUse.get(edge.roof_edge_id) ?? [];
    if (usedBy.length !== edge.adjacent_plane_ids.length || usedBy.some((id) => !edge.adjacent_plane_ids.includes(id))) {
      fail("XG_ROOF_TOPOLOGY_AMBIGUOUS", `/roof_edges/${index}/adjacent_plane_ids`);
    }
  });
  if (profile.roof_planes.some((plane) => plane.form === "gable") && !profile.roof_edges.some((edge) => edge.role === "ridge")) {
    fail("XG_ROOF_TOPOLOGY_AMBIGUOUS", "/roof_edges");
  }
}

function assertSlots(profile: ExecutableGeometryProfile): void {
  const materials = mapById(profile.material_slots as unknown as UnknownRecord[], "slot_id");
  const assemblies = mapById(profile.assembly_slots as unknown as UnknownRecord[], "slot_id");
  const expectedRoles = new Set(EXECUTABLE_GEOMETRY_SLOT_ROLES);
  const checkSlots = (slots: ExecutableGeometryProfile["material_slots"], pointer: string): void => {
    const roles = new Set(slots.map((slot) => slot.role));
    if (roles.size !== expectedRoles.size || [...expectedRoles].some((role) => !roles.has(role))) fail("XG_MATERIAL_SLOT_UNKNOWN", pointer);
    slots.forEach((slot, index) => {
      if (!expectedRoles.has(slot.role) || !["unresolved_semantic", "concept_generic"].includes(slot.truth_state)) fail("XG_MATERIAL_SLOT_UNKNOWN", `${pointer}/${index}`);
    });
  };
  checkSlots(profile.material_slots, "/material_slots");
  checkSlots(profile.assembly_slots, "/assembly_slots");
  const checkRefs = (refs: readonly string[], source: ReadonlyMap<string, UnknownRecord>, pointer: string): void => {
    refs.forEach((reference, index) => {
      if (!source.has(reference)) fail("XG_MATERIAL_SLOT_UNKNOWN", `${pointer}/${index}`);
    });
  };
  profile.floor_plates.forEach((entry, index) => { checkRefs(entry.material_slot_refs, materials, `/floor_plates/${index}/material_slot_refs`); checkRefs(entry.assembly_slot_refs, assemblies, `/floor_plates/${index}/assembly_slot_refs`); });
  profile.wall_runs.forEach((entry, index) => { checkRefs(entry.material_slot_refs, materials, `/wall_runs/${index}/material_slot_refs`); checkRefs(entry.assembly_slot_refs, assemblies, `/wall_runs/${index}/assembly_slot_refs`); });
  profile.roof_planes.forEach((entry, index) => { checkRefs(entry.material_slot_refs, materials, `/roof_planes/${index}/material_slot_refs`); checkRefs(entry.assembly_slot_refs, assemblies, `/roof_planes/${index}/assembly_slot_refs`); });
  profile.openings.forEach((entry, index) => { checkRefs(entry.material_slot_refs, materials, `/openings/${index}/material_slot_refs`); checkRefs(entry.assembly_slot_refs, assemblies, `/openings/${index}/assembly_slot_refs`); });
}

function isCalendarDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function assertGatesAndMaturity(profile: ExecutableGeometryProfile): void {
  const expected = new Set(EXECUTABLE_GEOMETRY_GATE_IDS);
  const actual = new Set(profile.professional_gates.map((gate) => gate.gate_id));
  if (actual.size !== expected.size || [...expected].some((gate) => !actual.has(gate))) fail("XG_GATE_STATUS_MISSING", "/professional_gates");
  profile.professional_gates.forEach((gate, index) => {
    if (!["not_evaluated", "outside_concept_scope", "reviewed_pass", "revision_required"].includes(gate.status)) fail("XG_GATE_STATUS_MISSING", `/professional_gates/${index}/status`);
    const needsEvidence = gate.status === "reviewed_pass" || gate.status === "revision_required";
    if (needsEvidence ? gate.evidence_refs.length === 0 || typeof gate.reviewer_role !== "string" || !isCalendarDate(gate.checked_at ?? "") : gate.evidence_refs.length !== 0 || gate.reviewer_role !== null || gate.checked_at !== null) {
      fail("XG_GATE_STATUS_MISSING", `/professional_gates/${index}`);
    }
  });
  if (profile.maturity !== "concept_only" && profile.professional_gates.some((gate) => gate.status !== "reviewed_pass")) {
    fail("XG_MATURITY_GATE_UNSATISFIED", "/professional_gates");
  }
}

async function assertDigest(profile: ExecutableGeometryProfile): Promise<void> {
  if (!DIGEST_PATTERN.test(profile.profile_digest)) fail("XG_DIGEST_MISMATCH", "/profile_digest");
  if (profile.profile_digest !== await computeExecutableGeometryDigest(profile)) fail("XG_DIGEST_MISMATCH", "/profile_digest");
}

export async function validateExecutableGeometry(
  value: unknown,
  context: ExecutableGeometryBindingContext,
): Promise<ExecutableGeometryValidationResult> {
  try {
    const profile = assertProfileShape(value);
    assertIdentifiersAndOrder(profile);
    assertUnitsAndPrecision(profile);
    assertGeometryResolution(profile);
    await assertReferencesAndBindings(profile, context);
    const rings = assertPrimitiveRings(profile);
    assertRegionsAndAreaAccounting(profile, rings);
    assertWallsAndJunctions(profile);
    assertOpenings(profile);
    assertRoof(profile);
    assertSlots(profile);
    assertGatesAndMaturity(profile);
    await assertDigest(profile);
    return { ok: true, profile };
  } catch (error) {
    if (error instanceof Refusal) return failureFrom(error);
    return { ok: false, code: "XG_SHAPE_MISSING_FIELD", pointer: "" };
  }
}

export async function validateExecutableGeometryJson(
  rawJson: string,
  context: ExecutableGeometryBindingContext,
): Promise<ExecutableGeometryValidationResult> {
  try {
    return await validateExecutableGeometry(parseExecutableGeometryJson(rawJson), context);
  } catch (error) {
    if (error instanceof DuplicateJsonPropertyNameError) {
      return { ok: false, code: "XG_JSON_DUPLICATE_NAME", pointer: "" };
    }
    return { ok: false, code: "XG_SHAPE_MISSING_FIELD", pointer: "" };
  }
}
