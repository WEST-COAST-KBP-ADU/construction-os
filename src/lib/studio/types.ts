export type StudioOptionKey = "exterior" | "palette" | "roof" | "windows" | "interior";

export type StudioSelections = Record<StudioOptionKey, string>;

export type StudioArchetype = {
  id: string;
  label: string;
  size_band: {
    min_sqft: number;
    max_sqft: number;
  };
  layouts: string[];
  geometry_ref: string;
};

export type CompatibilityRule = {
  if: Partial<StudioSelections> & { archetype?: string };
  deny: Partial<Record<StudioOptionKey, string[]>>;
  reason_code: string;
};

export type CatalogAsset = {
  ref: string;
  license: {
    kind: "owned" | "licensed";
    source: string;
    verified_on: string;
  };
};

export type StudioCatalog = {
  version: string;
  effective_from: string;
  archetypes: StudioArchetype[];
  options: Record<StudioOptionKey, string[]>;
  compatibility: CompatibilityRule[];
  assets: CatalogAsset[];
};

export type ConfigurationCandidateInput = {
  schema: "config/1";
  catalog_version: string;
  archetype: string;
  layout: string;
  selections: StudioSelections;
  disclaimer_version: "d1";
};

export type ConfigurationCandidate = ConfigurationCandidateInput & {
  config_hash: string;
};

export type CompatibilityDecision =
  | { allowed: true }
  | { allowed: false; reasonCode: string };

export const MODEL_MATURITY_STATES = [
  "concept_only",
  "design_validated",
  "engineering_reviewed",
  "permit_package",
] as const;

export type ModelMaturity = (typeof MODEL_MATURITY_STATES)[number];

export type ParameterCategory = "geometry" | "layout" | "presentation";

export type NumericRange = {
  min: number;
  max: number;
};

export type ModelUnits = {
  length: "ft";
  area: "sqft";
  angle: "deg";
};

export type ModelCoordinateSystem = {
  origin: string;
  x_axis: string;
  y_axis: string;
  z_axis: string;
  handedness: "right";
};

export type ModelParameter = {
  key: string;
  category: ParameterCategory;
  type: "number" | "enum";
  unit: string | null;
  range?: NumericRange;
  increment?: number;
  allowed?: string[];
  default: number | string;
  affects: string[];
  validation_rule_ids: string[];
  depends_on: string[];
};

export type ModelConstraint = {
  rule_id: string;
  if: Record<string, string>;
  deny: Record<string, string[]>;
  reason_code: string;
};

export type ModelGeometryBinding = {
  source_ref: string;
  format: "adu-geometry-source/1";
  units: ModelUnits;
  coordinate_system: ModelCoordinateSystem;
  digest: string;
};

export type ModelDerivedArtifact = {
  ref: string;
  kind: "plan" | "elevation" | "render";
  version: string;
  generator: string;
  materialization: "specified_not_generated";
  source_binding: string;
  contents: string[];
  conceptual?: boolean;
  marked_conceptual_until?: ModelMaturity;
  digest: string;
};

export type ModelProvenance = {
  origin: "west_coast_kbp_original";
  created_by: string;
  creation_record: string;
  attestation: string;
  municipal_source_used: false;
  third_party_geometry_used: false;
};

export type ModelValidation = {
  validator_version: string;
  checks: string[];
  evidence_refs: string[];
  result: "passed";
};

export type ModelInvariants = {
  stories: number;
  bedrooms: number;
  bathrooms: number;
  structural_grid_bay_ft: number;
  area_band_sqft: NumericRange;
};

export type AduModel = {
  schema: "adu-model/1";
  model_id: string;
  version: string;
  maturity: ModelMaturity;
  title: string;
  program: {
    stories: number;
    bedrooms: number;
    bathrooms: number;
    use: string;
    occupancy_assumption: string;
  };
  envelope: {
    gross_area_sqft: NumericRange;
    width_ft: NumericRange;
    depth_ft: NumericRange;
    height_ft: { max: number };
    increment_grid_ft: number;
    invariants: ModelInvariants;
  };
  parameters: ModelParameter[];
  constraints: ModelConstraint[];
  geometry: ModelGeometryBinding;
  derived_artifacts: ModelDerivedArtifact[];
  provenance: ModelProvenance;
  validation: ModelValidation;
  released_at: string;
};

export type AduGeometrySource = {
  schema: "adu-geometry-source/1";
  geometry_id: string;
  model_id: string;
  origin: "west_coast_kbp_original";
  units: ModelUnits;
  coordinate_system: ModelCoordinateSystem;
  footprint: Record<string, unknown>;
  massing: Record<string, unknown>;
  structural_grid: Record<string, unknown>;
  spaces: { space_id: string; role: string; area_fraction: number }[];
  openings: Record<string, unknown>;
  reference_configuration: Record<string, number | string>;
  notes: string;
};

export type AduModelRelease = {
  schema: "adu-model-release/1";
  release_version: string;
  effective_from: string;
  models: AduModel[];
  release_digest: string;
};

export type ModelConfigurationValues = Record<string, number | string>;
