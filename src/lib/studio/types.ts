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
