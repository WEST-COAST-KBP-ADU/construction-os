import type {
  AduGeometrySource,
  AduModel,
  AduModelRelease,
  ModelConfigurationValues,
  ModelConstraint,
  ModelParameter,
} from "./types";
import { MODEL_MATURITY_STATES } from "./types";

export const MODEL_SCHEMA = "adu-model/1";
export const GEOMETRY_SCHEMA = "adu-geometry-source/1";
export const RELEASE_SCHEMA = "adu-model-release/1";
export const VALIDATOR_VERSION = "model-contract/1.0.0";

export const MUTABLE_ALIASES = Object.freeze(["latest", "current", "stable", "head", "next"]);

export const ALLOWED_UNITS = Object.freeze({
  length: "ft",
  area: "sqft",
  angle: "deg",
} as const);

export const REQUIRED_MODEL_KEYS = Object.freeze([
  "schema",
  "model_id",
  "version",
  "maturity",
  "title",
  "program",
  "envelope",
  "parameters",
  "constraints",
  "geometry",
  "derived_artifacts",
  "provenance",
  "validation",
  "released_at",
]);

export const REQUIRED_CONCEPT_ONLY_CHECKS = Object.freeze([
  "schema_and_identifier_validity",
  "parameter_range_and_increment_validity",
  "gross_area_and_footprint_envelope_consistency",
  "constraint_evaluation_for_published_defaults",
  "deterministic_geometry_digest",
  "derived_artifact_binding",
  "provenance_completeness",
  "replay_stability",
]);

/**
 * Exact key sets for every schema-owned record. Anything not listed is an
 * unknown key and is terminal — this is what keeps foreign metadata such as a
 * municipal plan reference out of owned geometry.
 */
type KeySet = { required: readonly string[]; optional?: readonly string[] };

const K = {
  geometrySource: {
    required: [
      "schema", "geometry_id", "model_id", "origin", "units", "coordinate_system",
      "footprint", "massing", "structural_grid", "spaces", "openings",
      "reference_configuration", "notes",
    ],
  },
  release: {
    required: ["schema", "release_version", "effective_from", "models", "release_digest"],
  },
  units: { required: ["length", "area", "angle"] },
  coordinateSystem: { required: ["origin", "x_axis", "y_axis", "z_axis", "handedness"] },
  space: { required: ["space_id", "role", "area_fraction"] },
  footprint: { required: ["shape", "derivation"] },
  massing: {
    required: ["stories", "wall_plate_height_ft", "roof_pitch_rise_per_12", "max_overall_height_ft"],
  },
  structuralGrid: {
    required: ["bay_spacing_ft", "exterior_wall_framing", "slab_edge_offset_ft"],
  },
  openings: { required: ["entry_door", "window_packages"] },
  entryDoor: { required: ["width_ft", "height_ft", "placed_on"] },
  windowPackage: { required: ["head_height_ft", "sill_height_ft", "count_per_facade"] },
  program: { required: ["stories", "bedrooms", "bathrooms", "use", "occupancy_assumption"] },
  envelope: {
    required: [
      "gross_area_sqft", "width_ft", "depth_ft", "height_ft", "increment_grid_ft", "invariants",
    ],
  },
  invariants: {
    required: ["stories", "bedrooms", "bathrooms", "structural_grid_bay_ft", "area_band_sqft"],
  },
  range: { required: ["min", "max"] },
  heightLimit: { required: ["max"] },
  parameter: {
    required: [
      "key", "category", "type", "unit", "default", "affects", "validation_rule_ids", "depends_on",
    ],
    optional: ["range", "increment", "allowed"],
  },
  constraint: { required: ["rule_id", "if", "deny", "reason_code"] },
  geometryBinding: {
    required: ["source_ref", "format", "units", "coordinate_system", "digest"],
  },
  derivedArtifact: {
    required: [
      "contents", "digest", "generator", "kind", "materialization", "ref", "source_binding", "version",
    ],
    optional: ["conceptual", "marked_conceptual_until"],
  },
  provenance: {
    required: [
      "origin", "created_by", "creation_record", "attestation",
      "municipal_source_used", "third_party_geometry_used",
    ],
  },
  validation: { required: ["validator_version", "checks", "evidence_refs", "result"] },
} as const satisfies Record<string, KeySet>;

/**
 * Rejects an unknown or missing key on a schema-owned record. `missingCode`
 * and `unknownCode` are separate so a caller can report a domain-specific
 * reason rather than a generic shape error.
 */
function assertExactKeys(
  value: unknown,
  keys: KeySet,
  missingCode: string,
  unknownCode: string,
): Record<string, unknown> {
  if (!isPlainObject(value)) {
    fail(missingCode);
  }

  const allowed = new Set<string>([...keys.required, ...(keys.optional ?? [])]);

  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      fail(unknownCode);
    }
  }

  for (const key of keys.required) {
    if (!(key in value)) {
      fail(missingCode);
    }
  }

  return value;
}

const RELEASE_VERSION_PATTERN = /^\d{4}\.\d{2}\.\d+$/;
const CALENDAR_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const MODEL_ID_PATTERN = /^adu-[a-z]-\d{3}$/;
const SEMVER_PATTERN = /^\d+\.\d+\.\d+$/;
const DIGEST_PATTERN = /^sha256:[0-9a-f]{64}$/;
const UTC_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;

function fail(code: string): never {
  throw new Error(code);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Deterministic canonical form: recursively key-sorted, with named keys omitted.
 * The digest of a value must never depend on key order or on the digest field
 * that carries it.
 */
export function canonicalizeForDigest(value: unknown, omitKeys: readonly string[] = []): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => canonicalizeForDigest(entry, omitKeys));
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !omitKeys.includes(key))
        .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
        .map(([key, nested]) => [key, canonicalizeForDigest(nested, omitKeys)]),
    );
  }

  return value;
}

export function canonicalDigestInput(value: unknown, omitKeys: readonly string[] = []): string {
  return JSON.stringify(canonicalizeForDigest(value, omitKeys));
}

export async function computeDigest(
  value: unknown,
  omitKeys: readonly string[] = [],
): Promise<string> {
  const bytes = new TextEncoder().encode(canonicalDigestInput(value, omitKeys));
  const hashed = await globalThis.crypto.subtle.digest("SHA-256", bytes);

  return `sha256:${Array.from(new Uint8Array(hashed), (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

function assertNoMutableAlias(value: string, code: string): void {
  if (MUTABLE_ALIASES.includes(value.toLowerCase())) {
    fail(code);
  }
}

function assertUnits(units: unknown): void {
  if (!isPlainObject(units)) {
    fail("invalid_units");
  }

  const keys = Object.keys(units).sort();
  if (keys.join(",") !== "angle,area,length") {
    fail("unknown_unit_key");
  }

  if (
    units.length !== ALLOWED_UNITS.length ||
    units.area !== ALLOWED_UNITS.area ||
    units.angle !== ALLOWED_UNITS.angle
  ) {
    fail("unknown_unit");
  }
}

/** Floating-point safe multiple test on a 0.001 grid. */
function isMultipleOf(value: number, increment: number): boolean {
  const scaled = Math.round(value * 1000);
  const scaledIncrement = Math.round(increment * 1000);

  return scaledIncrement !== 0 && scaled % scaledIncrement === 0;
}

export function assertValidGeometrySource(source: AduGeometrySource): void {
  const record = assertExactKeys(
    source,
    K.geometrySource,
    "missing_geometry_field",
    "unknown_geometry_field",
  );

  if (source.schema !== GEOMETRY_SCHEMA) {
    fail("unknown_geometry_schema");
  }

  if (!MODEL_ID_PATTERN.test(source.model_id)) {
    fail("unknown_model_id");
  }

  if (source.geometry_id !== `${source.model_id}@1`) {
    fail("geometry_identifier_mismatch");
  }

  if (source.origin !== "west_coast_kbp_original") {
    fail("non_owned_geometry_origin");
  }

  assertUnits(source.units);
  assertExactKeys(
    source.coordinate_system,
    K.coordinateSystem,
    "missing_geometry_field",
    "unknown_geometry_field",
  );
  assertExactKeys(record.footprint, K.footprint, "missing_geometry_field", "unknown_geometry_field");
  assertExactKeys(record.massing, K.massing, "missing_geometry_field", "unknown_geometry_field");
  assertExactKeys(
    record.structural_grid,
    K.structuralGrid,
    "missing_geometry_field",
    "unknown_geometry_field",
  );

  const openings = assertExactKeys(
    record.openings,
    K.openings,
    "missing_geometry_field",
    "unknown_geometry_field",
  );
  assertExactKeys(
    openings.entry_door,
    K.entryDoor,
    "missing_geometry_field",
    "unknown_geometry_field",
  );

  if (!isPlainObject(openings.window_packages)) {
    fail("missing_geometry_field");
  }

  for (const windowPackage of Object.values(openings.window_packages)) {
    assertExactKeys(
      windowPackage,
      K.windowPackage,
      "missing_geometry_field",
      "unknown_geometry_field",
    );
  }

  if (!Array.isArray(source.spaces) || source.spaces.length === 0) {
    fail("missing_geometry_spaces");
  }

  const spaceIds = new Set<string>();
  for (const space of source.spaces) {
    assertExactKeys(space, K.space, "missing_geometry_field", "unknown_geometry_field");

    if (spaceIds.has(space.space_id)) {
      fail("duplicate_space_id");
    }
    spaceIds.add(space.space_id);

    if (typeof space.area_fraction !== "number" || space.area_fraction <= 0) {
      fail("invalid_space_area_fraction");
    }
  }

  const fractionTotal = source.spaces.reduce((total, space) => total + space.area_fraction, 0);
  if (Math.round(fractionTotal * 1000) !== 1000) {
    fail("space_area_fractions_do_not_sum_to_one");
  }

  if (!isPlainObject(record.reference_configuration)) {
    fail("missing_geometry_field");
  }
}

function assertValidParameter(parameter: ModelParameter): void {
  if (!parameter.key || typeof parameter.key !== "string") {
    fail("invalid_parameter_key");
  }

  if (!["geometry", "layout", "presentation"].includes(parameter.category)) {
    fail("unknown_parameter_category");
  }

  if (parameter.type === "number") {
    if (!parameter.range || typeof parameter.increment !== "number") {
      fail("missing_numeric_parameter_domain");
    }

    if (parameter.unit === null) {
      fail("missing_parameter_unit");
    }

    if (![ALLOWED_UNITS.length, ALLOWED_UNITS.angle].includes(parameter.unit as "ft" | "deg")) {
      fail("unknown_unit");
    }

    if (typeof parameter.default !== "number") {
      fail("invalid_parameter_default");
    }

    if (parameter.default < parameter.range.min || parameter.default > parameter.range.max) {
      fail("parameter_default_out_of_range");
    }

    if (!isMultipleOf(parameter.default - parameter.range.min, parameter.increment)) {
      fail("parameter_default_off_increment");
    }

    return;
  }

  if (parameter.type === "enum") {
    if (!Array.isArray(parameter.allowed) || parameter.allowed.length === 0) {
      fail("missing_enum_allow_list");
    }

    if (typeof parameter.default !== "string" || !parameter.allowed.includes(parameter.default)) {
      fail("parameter_default_not_allowed");
    }

    return;
  }

  fail("unknown_parameter_type");
}

function matchesConstraint(rule: ModelConstraint, values: ModelConfigurationValues): boolean {
  return Object.entries(rule.if).every(([key, expected]) => values[key] === expected);
}

/**
 * Evaluates every constraint against a complete value map.
 * Returns the first violated rule; a model with no violations returns null.
 */
export function findConstraintViolation(
  model: AduModel,
  values: ModelConfigurationValues,
): ModelConstraint | null {
  for (const rule of model.constraints) {
    if (!matchesConstraint(rule, values)) {
      continue;
    }

    for (const [key, deniedValues] of Object.entries(rule.deny)) {
      const candidate = values[key];
      if (typeof candidate === "string" && deniedValues.includes(candidate)) {
        return rule;
      }
    }
  }

  return null;
}

export function defaultConfiguration(model: AduModel): ModelConfigurationValues {
  return Object.fromEntries(model.parameters.map((parameter) => [parameter.key, parameter.default]));
}

/**
 * Fail-closed configuration check. Unknown keys, missing keys, out-of-domain
 * values, off-increment values, out-of-envelope area, and constraint
 * violations are terminal. Nothing is clamped, defaulted, or inferred.
 */
export function assertConfigurationValid(model: AduModel, values: ModelConfigurationValues): void {
  const known = new Set(model.parameters.map((parameter) => parameter.key));

  for (const key of Object.keys(values)) {
    if (!known.has(key)) {
      fail("unknown_parameter_key");
    }
  }

  for (const parameter of model.parameters) {
    if (!(parameter.key in values)) {
      fail("missing_parameter_value");
    }

    const value = values[parameter.key];

    if (parameter.type === "number") {
      if (typeof value !== "number" || !Number.isFinite(value)) {
        fail("invalid_parameter_value_type");
      }

      const range = parameter.range;
      const increment = parameter.increment;
      if (!range || typeof increment !== "number") {
        fail("missing_numeric_parameter_domain");
      }

      if (value < range.min || value > range.max) {
        fail("parameter_value_out_of_range");
      }

      if (!isMultipleOf(value - range.min, increment)) {
        fail("parameter_value_off_increment");
      }

      continue;
    }

    if (typeof value !== "string" || !parameter.allowed?.includes(value)) {
      fail("parameter_value_not_allowed");
    }
  }

  const width = values.footprint_width_ft as number;
  const depth = values.footprint_depth_ft as number;
  const grossArea = width * depth;

  if (
    grossArea < model.envelope.gross_area_sqft.min ||
    grossArea > model.envelope.gross_area_sqft.max
  ) {
    fail("gross_area_out_of_envelope");
  }

  const violation = findConstraintViolation(model, values);
  if (violation) {
    throw new Error(violation.reason_code);
  }
}

export function assertValidModelStructure(model: AduModel): void {
  const keys = Object.keys(model);

  for (const required of REQUIRED_MODEL_KEYS) {
    if (!keys.includes(required)) {
      fail("missing_model_field");
    }
  }

  for (const key of keys) {
    if (!REQUIRED_MODEL_KEYS.includes(key)) {
      fail("unknown_model_field");
    }
  }

  if (model.schema !== MODEL_SCHEMA) {
    fail("unknown_model_schema");
  }

  if (!MODEL_ID_PATTERN.test(model.model_id)) {
    fail("unknown_model_id");
  }

  assertNoMutableAlias(model.version, "mutable_version_alias");

  if (!SEMVER_PATTERN.test(model.version)) {
    fail("invalid_model_version");
  }

  if (!MODEL_MATURITY_STATES.includes(model.maturity)) {
    fail("invalid_maturity");
  }

  if (model.maturity !== "concept_only") {
    fail("maturity_promotion_requires_separate_evidence");
  }

  if (!UTC_TIMESTAMP_PATTERN.test(model.released_at)) {
    fail("invalid_released_at");
  }

  assertUnits(model.geometry.units);

  if (model.geometry.format !== GEOMETRY_SCHEMA) {
    fail("unknown_geometry_format");
  }

  if (!DIGEST_PATTERN.test(model.geometry.digest)) {
    fail("invalid_digest_format");
  }

  assertNoMutableAlias(model.geometry.source_ref, "mutable_geometry_alias");

  if (model.geometry.source_ref.startsWith("assets/images/")) {
    fail("presentation_asset_cannot_be_geometry_source");
  }

  assertExactKeys(model.program, K.program, "missing_model_field", "unknown_model_field");
  assertExactKeys(model.geometry, K.geometryBinding, "missing_model_field", "unknown_model_field");
  assertExactKeys(model.provenance, K.provenance, "missing_model_field", "unknown_model_field");
  assertExactKeys(model.validation, K.validation, "missing_model_field", "unknown_model_field");
  assertExactKeys(
    model.geometry.coordinate_system,
    K.coordinateSystem,
    "missing_model_field",
    "unknown_model_field",
  );

  const envelope = assertExactKeys(
    model.envelope,
    K.envelope,
    "missing_model_field",
    "unknown_model_field",
  );
  assertExactKeys(envelope.gross_area_sqft, K.range, "missing_model_field", "unknown_model_field");
  assertExactKeys(envelope.width_ft, K.range, "missing_model_field", "unknown_model_field");
  assertExactKeys(envelope.depth_ft, K.range, "missing_model_field", "unknown_model_field");
  assertExactKeys(envelope.height_ft, K.heightLimit, "missing_model_field", "unknown_model_field");

  const invariants = assertExactKeys(
    envelope.invariants,
    K.invariants,
    "missing_model_field",
    "unknown_model_field",
  );
  assertExactKeys(
    invariants.area_band_sqft,
    K.range,
    "missing_model_field",
    "unknown_model_field",
  );

  if (
    invariants.stories !== model.program.stories ||
    invariants.bedrooms !== model.program.bedrooms ||
    invariants.bathrooms !== model.program.bathrooms
  ) {
    fail("invariants_disagree_with_program");
  }

  if (model.parameters.length === 0) {
    fail("missing_parameters");
  }

  const parameterKeys = new Set<string>();
  for (const parameter of model.parameters) {
    if (parameterKeys.has(parameter.key)) {
      fail("duplicate_parameter_key");
    }
    parameterKeys.add(parameter.key);
    assertExactKeys(parameter, K.parameter, "missing_model_field", "unknown_model_field");
    if (parameter.range) {
      assertExactKeys(parameter.range, K.range, "missing_model_field", "unknown_model_field");
    }
    assertValidParameter(parameter);
  }

  const ruleIds = new Set<string>();
  for (const rule of model.constraints) {
    if (ruleIds.has(rule.rule_id)) {
      fail("duplicate_constraint_rule_id");
    }
    ruleIds.add(rule.rule_id);
    assertExactKeys(rule, K.constraint, "missing_model_field", "unknown_model_field");

    for (const key of [...Object.keys(rule.if), ...Object.keys(rule.deny)]) {
      if (!parameterKeys.has(key)) {
        fail("unknown_constraint_parameter");
      }
    }

    if (!rule.reason_code) {
      fail("missing_constraint_reason_code");
    }
  }

  if (model.derived_artifacts.length === 0) {
    fail("missing_derived_artifacts");
  }

  const kinds = new Set(model.derived_artifacts.map((artifact) => artifact.kind));
  for (const requiredKind of ["plan", "elevation", "render"]) {
    if (!kinds.has(requiredKind as "plan" | "elevation" | "render")) {
      fail("missing_derived_artifact_kind");
    }
  }

  for (const artifact of model.derived_artifacts) {
    assertExactKeys(artifact, K.derivedArtifact, "missing_model_field", "unknown_model_field");

    if (!DIGEST_PATTERN.test(artifact.digest)) {
      fail("invalid_digest_format");
    }

    if (artifact.source_binding !== model.geometry.source_ref) {
      fail("derived_artifact_not_bound_to_geometry");
    }

    assertNoMutableAlias(artifact.version, "mutable_artifact_alias");

    if (!SEMVER_PATTERN.test(artifact.version)) {
      fail("invalid_artifact_version");
    }

    if (artifact.kind === "render" && artifact.conceptual !== true) {
      fail("render_artifact_not_marked_conceptual");
    }
  }

  if (model.provenance.origin !== "west_coast_kbp_original") {
    fail("non_owned_provenance");
  }

  if (!model.provenance.creation_record || !model.provenance.attestation) {
    fail("incomplete_provenance");
  }

  if (
    model.provenance.municipal_source_used !== false ||
    model.provenance.third_party_geometry_used !== false
  ) {
    fail("municipal_or_third_party_geometry_declared");
  }

  if (model.validation.validator_version !== VALIDATOR_VERSION) {
    fail("unknown_validator_version");
  }

  for (const check of REQUIRED_CONCEPT_ONLY_CHECKS) {
    if (!model.validation.checks.includes(check)) {
      fail("missing_required_validation_check");
    }
  }

  if (model.validation.result !== "passed") {
    fail("validation_not_passed");
  }

  assertConfigurationValid(model, defaultConfiguration(model));
}

/**
 * The digest-bound geometry source declares one canonical configuration. It
 * must be a valid configuration of the bound model AND must equal the model's
 * published defaults, so the canonical geometry can never drift from what the
 * catalog advertises.
 */
function assertReferenceConfiguration(model: AduModel, source: AduGeometrySource): void {
  const defaults = defaultConfiguration(model);
  const reference = source.reference_configuration;

  assertExactKeys(
    reference,
    { required: Object.keys(defaults) },
    "missing_reference_configuration_key",
    "unknown_reference_configuration_key",
  );

  assertConfigurationValid(model, reference);

  for (const [key, value] of Object.entries(defaults)) {
    if (reference[key] !== value) {
      fail("reference_configuration_does_not_match_default");
    }
  }
}

/**
 * Every value the model offers must have a geometry definition behind it. A
 * roof form or window package with no geometry would render as best-effort,
 * which the contract forbids.
 */
function assertGeometryCoversAllowLists(model: AduModel, source: AduGeometrySource): void {
  const massing = source.massing as { roof_pitch_rise_per_12?: Record<string, unknown> };
  const openings = source.openings as { window_packages?: Record<string, unknown> };

  const roofForms = model.parameters.find((parameter) => parameter.key === "roof_form")?.allowed;
  for (const form of roofForms ?? []) {
    if (!massing.roof_pitch_rise_per_12 || !(form in massing.roof_pitch_rise_per_12)) {
      fail("roof_form_missing_geometry_definition");
    }
  }

  const packages = model.parameters.find(
    (parameter) => parameter.key === "window_package",
  )?.allowed;
  for (const windowPackage of packages ?? []) {
    if (!openings.window_packages || !(windowPackage in openings.window_packages)) {
      fail("window_package_missing_geometry_definition");
    }
  }
}

export async function assertValidModel(
  model: AduModel,
  geometrySource: AduGeometrySource,
): Promise<void> {
  assertValidModelStructure(model);
  assertValidGeometrySource(geometrySource);

  if (geometrySource.model_id !== model.model_id) {
    fail("geometry_model_mismatch");
  }

  if (geometrySource.geometry_id !== `${model.geometry.source_ref.split("/").pop()}`) {
    fail("geometry_reference_mismatch");
  }

  if (canonicalDigestInput(geometrySource.units) !== canonicalDigestInput(model.geometry.units)) {
    fail("geometry_units_mismatch");
  }

  if (
    canonicalDigestInput(geometrySource.coordinate_system) !==
    canonicalDigestInput(model.geometry.coordinate_system)
  ) {
    fail("geometry_coordinate_system_mismatch");
  }

  assertReferenceConfiguration(model, geometrySource);
  assertGeometryCoversAllowLists(model, geometrySource);

  const recomputed = await computeDigest(geometrySource);
  if (recomputed !== model.geometry.digest) {
    fail("geometry_digest_mismatch");
  }

  for (const artifact of model.derived_artifacts) {
    const { digest, ...spec } = artifact;
    const recomputedArtifact = await computeDigest(spec);

    if (recomputedArtifact !== digest) {
      fail("derived_artifact_digest_mismatch");
    }
  }
}

export async function assertValidRelease(
  release: AduModelRelease,
  geometrySources: Record<string, AduGeometrySource>,
): Promise<void> {
  assertExactKeys(release, K.release, "missing_release_field", "unknown_release_field");

  if (release.schema !== RELEASE_SCHEMA) {
    fail("unknown_release_schema");
  }

  assertNoMutableAlias(release.release_version, "mutable_release_alias");

  if (!RELEASE_VERSION_PATTERN.test(release.release_version)) {
    fail("invalid_release_version");
  }

  if (!CALENDAR_DATE_PATTERN.test(release.effective_from)) {
    fail("invalid_effective_from");
  }

  if (Number.isNaN(Date.parse(`${release.effective_from}T00:00:00Z`))) {
    fail("invalid_effective_from");
  }

  if (!DIGEST_PATTERN.test(release.release_digest)) {
    fail("invalid_digest_format");
  }

  if (!Array.isArray(release.models) || release.models.length === 0) {
    fail("empty_release");
  }

  const seen = new Set<string>();
  for (const model of release.models) {
    const key = `${model.model_id}@${model.version}`;
    if (seen.has(key)) {
      fail("duplicate_model_release");
    }
    seen.add(key);

    const source = geometrySources[model.geometry.source_ref];
    if (!source) {
      fail("unknown_geometry_source_ref");
    }

    await assertValidModel(model, source);
  }

  const recomputed = await computeDigest(release, ["release_digest"]);
  if (recomputed !== release.release_digest) {
    fail("release_digest_mismatch");
  }
}

export function findModel(release: AduModelRelease, modelId: string, version: string): AduModel {
  const model = release.models.find(
    (candidate) => candidate.model_id === modelId && candidate.version === version,
  );

  if (!model) {
    fail("unknown_model_release");
  }

  return model;
}
