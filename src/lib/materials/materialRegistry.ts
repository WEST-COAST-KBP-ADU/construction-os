export const MATERIAL_REGISTRY_SCHEMA = "material-registry/1" as const;
export const OFFICIAL_MATERIAL_SOURCE_HOST = "www.jameshardie.com" as const;
export const MATERIAL_SOURCE_MAX_AGE_DAYS = 365;

export type AvailabilityState = "unverified" | "verified";
export type OfferingState = "not_adopted" | "adopted";
export type TextureRightsState = "absent" | "publication_authorized";

export type MaterialSource = {
  id: string;
  url: string;
  page_title: string;
  verified_on: string;
  facts: string[];
};

export type TextureAsset = {
  asset_id: string;
  provenance: {
    rights_basis: "west_coast_kbp_owned" | "publication_authorized";
    evidence_ref: string;
    verified_on: string;
  };
  binding: {
    manufacturer_id: string;
    product_id: string;
    profile_id: string;
    color_id: string;
  };
};

export type MaterialProfile = {
  id: string;
  display_name: string;
  product_id: string;
  source_id: string;
  local_availability: AvailabilityState;
  west_coast_kbp_offering: OfferingState;
  texture_asset: TextureAsset | null;
  texture_rights: TextureRightsState;
  ui_eligible: boolean;
};

export type MaterialProduct = {
  id: string;
  display_name: string;
  source_id: string;
  profiles: MaterialProfile[];
};

export type MaterialColor = {
  id: string;
  display_name: string;
  finish_technology: string | null;
  source_id: string;
  local_availability: AvailabilityState;
  display_color: string | null;
  texture_asset: TextureAsset | null;
  texture_rights: TextureRightsState;
  ui_eligible: boolean;
};

export type MaterialRegistry = {
  schema: typeof MATERIAL_REGISTRY_SCHEMA;
  registry_id: string;
  manufacturer: {
    id: string;
    display_name: string;
    source_id: string;
  };
  verified_on: string;
  market_context: {
    region: string;
    local_availability: AvailabilityState;
    purpose: "manufacturer_reference_only";
  };
  non_affiliation_notice: string;
  sources: MaterialSource[];
  products: MaterialProduct[];
  colors: MaterialColor[];
};

export type RegistryRefusalCode =
  | "REGISTRY_JSON_INVALID"
  | "REGISTRY_SHAPE_INVALID"
  | "REGISTRY_SCHEMA_UNSUPPORTED"
  | "REGISTRY_IDENTIFIER_INVALID"
  | "REGISTRY_DISPLAY_NAME_INVALID"
  | "REGISTRY_DUPLICATE_ID"
  | "REGISTRY_DUPLICATE_DISPLAY_NAME"
  | "REGISTRY_DATE_INVALID"
  | "SOURCE_DOMAIN_UNSUPPORTED"
  | "SOURCE_VERIFICATION_MISMATCH"
  | "SOURCE_FACTS_INVALID"
  | "UNKNOWN_SOURCE"
  | "PRODUCT_PROFILE_MISMATCH"
  | "AVAILABILITY_STATE_INVALID"
  | "OFFERING_STATE_INVALID"
  | "TEXTURE_RIGHTS_STATE_INVALID"
  | "UI_ELIGIBILITY_STATE_INVALID"
  | "TEXTURE_ASSET_INVALID"
  | "TEXTURE_ASSET_PROVENANCE_MISSING"
  | "TEXTURE_ASSET_UNAUTHORIZED"
  | "NON_AFFILIATION_NOTICE_INVALID";

export type RegistryValidationResult =
  | { ok: true; registry: MaterialRegistry }
  | { ok: false; reason_code: RegistryRefusalCode; path: string };

export type EligibilityRefusalCode =
  | RegistryRefusalCode
  | "ELIGIBILITY_REQUEST_MALFORMED"
  | "MANUFACTURER_UNKNOWN"
  | "PRODUCT_UNKNOWN"
  | "PROFILE_UNKNOWN"
  | "COLOR_UNKNOWN"
  | "SOURCE_VERIFICATION_STALE"
  | "RELATIONSHIP_CLAIM_PRESENT"
  | "LOCAL_AVAILABILITY_UNVERIFIED"
  | "WEST_COAST_KBP_NOT_ADOPTED"
  | "TEXTURE_ASSET_MISSING"
  | "TEXTURE_RIGHTS_ABSENT"
  | "TEXTURE_ASSET_BINDING_MISMATCH"
  | "UI_ELIGIBILITY_FLAG_FALSE";

export type MaterialEligibilityRequest = {
  manufacturer_id: string;
  product_id: string;
  profile_id: string;
  color_id: string;
  as_of: string;
  combination_adoption: {
    status: "adopted";
    evidence_ref: string;
  } | null;
  relationship_claims: Array<"partnership" | "certification" | "endorsement" | "authorized_installer">;
};

export type MaterialEligibilityResult =
  | { eligible: true; reason_code: "ELIGIBLE" }
  | { eligible: false; reason_code: EligibilityRefusalCode };

const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const TOP_LEVEL_KEYS = [
  "schema",
  "registry_id",
  "manufacturer",
  "verified_on",
  "market_context",
  "non_affiliation_notice",
  "sources",
  "products",
  "colors",
] as const;
const MANUFACTURER_KEYS = ["id", "display_name", "source_id"] as const;
const MARKET_CONTEXT_KEYS = ["region", "local_availability", "purpose"] as const;
const SOURCE_KEYS = ["id", "url", "page_title", "verified_on", "facts"] as const;
const PRODUCT_KEYS = ["id", "display_name", "source_id", "profiles"] as const;
const PROFILE_KEYS = [
  "id",
  "display_name",
  "product_id",
  "source_id",
  "local_availability",
  "west_coast_kbp_offering",
  "texture_asset",
  "texture_rights",
  "ui_eligible",
] as const;
const COLOR_KEYS = [
  "id",
  "display_name",
  "finish_technology",
  "source_id",
  "local_availability",
  "display_color",
  "texture_asset",
  "texture_rights",
  "ui_eligible",
] as const;
const ASSET_KEYS = ["asset_id", "provenance", "binding"] as const;
const PROVENANCE_KEYS = ["rights_basis", "evidence_ref", "verified_on"] as const;
const BINDING_KEYS = ["manufacturer_id", "product_id", "profile_id", "color_id"] as const;
const REQUEST_KEYS = [
  "manufacturer_id",
  "product_id",
  "profile_id",
  "color_id",
  "as_of",
  "combination_adoption",
  "relationship_claims",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(value: unknown, keys: readonly string[]): value is Record<string, unknown> {
  if (!isRecord(value)) return false;
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isId(value: unknown): value is string {
  return typeof value === "string" && ID_PATTERN.test(value);
}

function isDate(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function refused(reason_code: RegistryRefusalCode, path: string): RegistryValidationResult {
  return { ok: false, reason_code, path };
}

function duplicate(values: string[]): boolean {
  return new Set(values).size !== values.length;
}

function validateTextureAsset(value: unknown, path: string): RegistryValidationResult | null {
  if (value === null) return null;
  if (!hasExactKeys(value, ASSET_KEYS)) return refused("TEXTURE_ASSET_INVALID", path);
  if (!isId(value.asset_id)) return refused("TEXTURE_ASSET_INVALID", `${path}.asset_id`);
  if (!hasExactKeys(value.provenance, PROVENANCE_KEYS)) {
    return refused("TEXTURE_ASSET_PROVENANCE_MISSING", `${path}.provenance`);
  }
  if (
    value.provenance.rights_basis !== "west_coast_kbp_owned" &&
    value.provenance.rights_basis !== "publication_authorized"
  ) {
    return refused("TEXTURE_ASSET_UNAUTHORIZED", `${path}.provenance.rights_basis`);
  }
  if (!isNonEmptyString(value.provenance.evidence_ref) || !isDate(value.provenance.verified_on)) {
    return refused("TEXTURE_ASSET_PROVENANCE_MISSING", `${path}.provenance`);
  }
  if (!hasExactKeys(value.binding, BINDING_KEYS)) {
    return refused("TEXTURE_ASSET_INVALID", `${path}.binding`);
  }
  if (!Object.values(value.binding).every(isId)) {
    return refused("TEXTURE_ASSET_INVALID", `${path}.binding`);
  }
  return null;
}

function validateEntryState(
  entry: Record<string, unknown>,
  path: string,
  includeOffering: boolean,
): RegistryValidationResult | null {
  if (entry.local_availability !== "unverified" && entry.local_availability !== "verified") {
    return refused("AVAILABILITY_STATE_INVALID", `${path}.local_availability`);
  }
  if (
    includeOffering &&
    entry.west_coast_kbp_offering !== "not_adopted" &&
    entry.west_coast_kbp_offering !== "adopted"
  ) {
    return refused("OFFERING_STATE_INVALID", `${path}.west_coast_kbp_offering`);
  }
  if (entry.texture_rights !== "absent" && entry.texture_rights !== "publication_authorized") {
    return refused("TEXTURE_RIGHTS_STATE_INVALID", `${path}.texture_rights`);
  }
  if (typeof entry.ui_eligible !== "boolean") {
    return refused("UI_ELIGIBILITY_STATE_INVALID", `${path}.ui_eligible`);
  }
  return validateTextureAsset(entry.texture_asset, `${path}.texture_asset`);
}

export function validateMaterialRegistry(input: unknown): RegistryValidationResult {
  if (!hasExactKeys(input, TOP_LEVEL_KEYS)) return refused("REGISTRY_SHAPE_INVALID", "$.");
  if (input.schema !== MATERIAL_REGISTRY_SCHEMA) return refused("REGISTRY_SCHEMA_UNSUPPORTED", "$.schema");
  if (!isId(input.registry_id)) return refused("REGISTRY_IDENTIFIER_INVALID", "$.registry_id");
  if (!isDate(input.verified_on)) return refused("REGISTRY_DATE_INVALID", "$.verified_on");

  if (!hasExactKeys(input.manufacturer, MANUFACTURER_KEYS)) {
    return refused("REGISTRY_SHAPE_INVALID", "$.manufacturer");
  }
  if (!isId(input.manufacturer.id) || !isId(input.manufacturer.source_id)) {
    return refused("REGISTRY_IDENTIFIER_INVALID", "$.manufacturer");
  }
  if (!isNonEmptyString(input.manufacturer.display_name)) {
    return refused("REGISTRY_DISPLAY_NAME_INVALID", "$.manufacturer.display_name");
  }

  if (!hasExactKeys(input.market_context, MARKET_CONTEXT_KEYS)) {
    return refused("REGISTRY_SHAPE_INVALID", "$.market_context");
  }
  if (
    !isNonEmptyString(input.market_context.region) ||
    (input.market_context.local_availability !== "unverified" &&
      input.market_context.local_availability !== "verified") ||
    input.market_context.purpose !== "manufacturer_reference_only"
  ) {
    return refused("AVAILABILITY_STATE_INVALID", "$.market_context");
  }

  if (!isNonEmptyString(input.non_affiliation_notice)) {
    return refused("NON_AFFILIATION_NOTICE_INVALID", "$.non_affiliation_notice");
  }
  const notice = input.non_affiliation_notice.toLowerCase();
  const requiredNoticeTerms = [
    "no affiliation",
    "partnership",
    "certification",
    "endorsement",
    "authorized-installer",
  ];
  if (!requiredNoticeTerms.every((term) => notice.includes(term)) || !notice.includes("not claimed")) {
    return refused("NON_AFFILIATION_NOTICE_INVALID", "$.non_affiliation_notice");
  }

  if (!Array.isArray(input.sources) || input.sources.length === 0) {
    return refused("REGISTRY_SHAPE_INVALID", "$.sources");
  }
  const sourceIds: string[] = [];
  for (const [index, source] of input.sources.entries()) {
    const path = `$.sources[${index}]`;
    if (!hasExactKeys(source, SOURCE_KEYS)) return refused("REGISTRY_SHAPE_INVALID", path);
    if (!isId(source.id)) return refused("REGISTRY_IDENTIFIER_INVALID", `${path}.id`);
    if (!isNonEmptyString(source.page_title)) {
      return refused("REGISTRY_DISPLAY_NAME_INVALID", `${path}.page_title`);
    }
    if (!isDate(source.verified_on)) return refused("REGISTRY_DATE_INVALID", `${path}.verified_on`);
    if (source.verified_on !== input.verified_on) {
      return refused("SOURCE_VERIFICATION_MISMATCH", `${path}.verified_on`);
    }
    if (!isNonEmptyString(source.url)) return refused("SOURCE_DOMAIN_UNSUPPORTED", `${path}.url`);
    try {
      const parsed = new URL(source.url);
      if (
        parsed.protocol !== "https:" ||
        parsed.hostname !== OFFICIAL_MATERIAL_SOURCE_HOST ||
        parsed.username !== "" ||
        parsed.password !== "" ||
        parsed.port !== ""
      ) {
        return refused("SOURCE_DOMAIN_UNSUPPORTED", `${path}.url`);
      }
    } catch {
      return refused("SOURCE_DOMAIN_UNSUPPORTED", `${path}.url`);
    }
    if (
      !Array.isArray(source.facts) ||
      source.facts.length === 0 ||
      source.facts.length > 8 ||
      !source.facts.every(isNonEmptyString)
    ) {
      return refused("SOURCE_FACTS_INVALID", `${path}.facts`);
    }
    sourceIds.push(source.id);
  }
  if (duplicate(sourceIds)) return refused("REGISTRY_DUPLICATE_ID", "$.sources");
  const knownSources = new Set(sourceIds);
  if (!knownSources.has(input.manufacturer.source_id)) {
    return refused("UNKNOWN_SOURCE", "$.manufacturer.source_id");
  }

  if (!Array.isArray(input.products) || input.products.length === 0) {
    return refused("REGISTRY_SHAPE_INVALID", "$.products");
  }
  const productIds: string[] = [];
  const productNames: string[] = [];
  for (const [productIndex, product] of input.products.entries()) {
    const productPath = `$.products[${productIndex}]`;
    if (!hasExactKeys(product, PRODUCT_KEYS)) return refused("REGISTRY_SHAPE_INVALID", productPath);
    if (!isId(product.id) || !isId(product.source_id)) {
      return refused("REGISTRY_IDENTIFIER_INVALID", productPath);
    }
    if (!isNonEmptyString(product.display_name)) {
      return refused("REGISTRY_DISPLAY_NAME_INVALID", `${productPath}.display_name`);
    }
    if (!knownSources.has(product.source_id)) {
      return refused("UNKNOWN_SOURCE", `${productPath}.source_id`);
    }
    if (!Array.isArray(product.profiles) || product.profiles.length === 0) {
      return refused("REGISTRY_SHAPE_INVALID", `${productPath}.profiles`);
    }
    const profileIds: string[] = [];
    const profileNames: string[] = [];
    for (const [profileIndex, profile] of product.profiles.entries()) {
      const profilePath = `${productPath}.profiles[${profileIndex}]`;
      if (!hasExactKeys(profile, PROFILE_KEYS)) return refused("REGISTRY_SHAPE_INVALID", profilePath);
      if (!isId(profile.id) || !isId(profile.product_id) || !isId(profile.source_id)) {
        return refused("REGISTRY_IDENTIFIER_INVALID", profilePath);
      }
      if (!isNonEmptyString(profile.display_name)) {
        return refused("REGISTRY_DISPLAY_NAME_INVALID", `${profilePath}.display_name`);
      }
      if (profile.product_id !== product.id) {
        return refused("PRODUCT_PROFILE_MISMATCH", `${profilePath}.product_id`);
      }
      if (!knownSources.has(profile.source_id)) {
        return refused("UNKNOWN_SOURCE", `${profilePath}.source_id`);
      }
      const stateRefusal = validateEntryState(profile, profilePath, true);
      if (stateRefusal) return stateRefusal;
      profileIds.push(profile.id);
      profileNames.push(profile.display_name);
    }
    if (duplicate(profileIds)) return refused("REGISTRY_DUPLICATE_ID", `${productPath}.profiles`);
    if (duplicate(profileNames)) {
      return refused("REGISTRY_DUPLICATE_DISPLAY_NAME", `${productPath}.profiles`);
    }
    productIds.push(product.id);
    productNames.push(product.display_name);
  }
  if (duplicate(productIds)) return refused("REGISTRY_DUPLICATE_ID", "$.products");
  if (duplicate(productNames)) return refused("REGISTRY_DUPLICATE_DISPLAY_NAME", "$.products");

  if (!Array.isArray(input.colors) || input.colors.length === 0) {
    return refused("REGISTRY_SHAPE_INVALID", "$.colors");
  }
  const colorIds: string[] = [];
  const colorNames: string[] = [];
  for (const [index, color] of input.colors.entries()) {
    const path = `$.colors[${index}]`;
    if (!hasExactKeys(color, COLOR_KEYS)) return refused("REGISTRY_SHAPE_INVALID", path);
    if (!isId(color.id) || !isId(color.source_id)) return refused("REGISTRY_IDENTIFIER_INVALID", path);
    if (!isNonEmptyString(color.display_name)) {
      return refused("REGISTRY_DISPLAY_NAME_INVALID", `${path}.display_name`);
    }
    if (color.finish_technology !== null && !isNonEmptyString(color.finish_technology)) {
      return refused("REGISTRY_DISPLAY_NAME_INVALID", `${path}.finish_technology`);
    }
    if (color.display_color !== null && !isNonEmptyString(color.display_color)) {
      return refused("REGISTRY_DISPLAY_NAME_INVALID", `${path}.display_color`);
    }
    if (!knownSources.has(color.source_id)) return refused("UNKNOWN_SOURCE", `${path}.source_id`);
    const stateRefusal = validateEntryState(color, path, false);
    if (stateRefusal) return stateRefusal;
    colorIds.push(color.id);
    colorNames.push(color.display_name);
  }
  if (duplicate(colorIds)) return refused("REGISTRY_DUPLICATE_ID", "$.colors");
  if (duplicate(colorNames)) return refused("REGISTRY_DUPLICATE_DISPLAY_NAME", "$.colors");

  return { ok: true, registry: input as MaterialRegistry };
}

export function loadMaterialRegistry(input: string | unknown): RegistryValidationResult {
  if (typeof input !== "string") return validateMaterialRegistry(input);
  try {
    return validateMaterialRegistry(JSON.parse(input) as unknown);
  } catch {
    return refused("REGISTRY_JSON_INVALID", "$");
  }
}

function daysOld(verifiedOn: string, asOf: string): number {
  const verified = Date.parse(`${verifiedOn}T00:00:00.000Z`);
  const current = Date.parse(`${asOf}T00:00:00.000Z`);
  return Math.floor((current - verified) / 86_400_000);
}

function eligibilityRefusal(reason_code: EligibilityRefusalCode): MaterialEligibilityResult {
  return { eligible: false, reason_code };
}

function validRequest(value: unknown): value is MaterialEligibilityRequest {
  if (!hasExactKeys(value, REQUEST_KEYS)) return false;
  if (
    !isId(value.manufacturer_id) ||
    !isId(value.product_id) ||
    !isId(value.profile_id) ||
    !isId(value.color_id) ||
    !isDate(value.as_of)
  ) {
    return false;
  }
  if (
    !Array.isArray(value.relationship_claims) ||
    !value.relationship_claims.every((claim) =>
      ["partnership", "certification", "endorsement", "authorized_installer"].includes(String(claim)),
    )
  ) {
    return false;
  }
  if (value.combination_adoption === null) return true;
  return (
    hasExactKeys(value.combination_adoption, ["status", "evidence_ref"]) &&
    value.combination_adoption.status === "adopted" &&
    isNonEmptyString(value.combination_adoption.evidence_ref)
  );
}

function matchingAssets(profile: MaterialProfile, color: MaterialColor): TextureAsset[] {
  const assets = [profile.texture_asset, color.texture_asset].filter(
    (asset): asset is TextureAsset => asset !== null,
  );
  return assets.filter((asset, index) => assets.findIndex((candidate) => candidate.asset_id === asset.asset_id) === index);
}

export function decideMaterialEligibility(
  registryInput: unknown,
  requestInput: unknown,
): MaterialEligibilityResult {
  const validation = validateMaterialRegistry(registryInput);
  if (!validation.ok) return eligibilityRefusal(validation.reason_code);
  if (!validRequest(requestInput)) return eligibilityRefusal("ELIGIBILITY_REQUEST_MALFORMED");

  const registry = validation.registry;
  const request = requestInput;
  if (request.manufacturer_id !== registry.manufacturer.id) {
    return eligibilityRefusal("MANUFACTURER_UNKNOWN");
  }
  const product = registry.products.find((candidate) => candidate.id === request.product_id);
  if (!product) return eligibilityRefusal("PRODUCT_UNKNOWN");
  const profile = product.profiles.find((candidate) => candidate.id === request.profile_id);
  if (!profile) return eligibilityRefusal("PROFILE_UNKNOWN");
  const color = registry.colors.find((candidate) => candidate.id === request.color_id);
  if (!color) return eligibilityRefusal("COLOR_UNKNOWN");

  if (
    daysOld(registry.verified_on, request.as_of) < 0 ||
    daysOld(registry.verified_on, request.as_of) > MATERIAL_SOURCE_MAX_AGE_DAYS ||
    registry.sources.some(
      (source) =>
        daysOld(source.verified_on, request.as_of) < 0 ||
        daysOld(source.verified_on, request.as_of) > MATERIAL_SOURCE_MAX_AGE_DAYS,
    )
  ) {
    return eligibilityRefusal("SOURCE_VERIFICATION_STALE");
  }
  if (request.relationship_claims.length > 0) {
    return eligibilityRefusal("RELATIONSHIP_CLAIM_PRESENT");
  }
  if (
    registry.market_context.local_availability !== "verified" ||
    profile.local_availability !== "verified" ||
    color.local_availability !== "verified"
  ) {
    return eligibilityRefusal("LOCAL_AVAILABILITY_UNVERIFIED");
  }
  if (
    profile.west_coast_kbp_offering !== "adopted" ||
    request.combination_adoption?.status !== "adopted" ||
    !isNonEmptyString(request.combination_adoption.evidence_ref)
  ) {
    return eligibilityRefusal("WEST_COAST_KBP_NOT_ADOPTED");
  }

  const assets = matchingAssets(profile, color);
  if (assets.length === 0) return eligibilityRefusal("TEXTURE_ASSET_MISSING");
  if (
    profile.texture_rights !== "publication_authorized" ||
    color.texture_rights !== "publication_authorized"
  ) {
    return eligibilityRefusal("TEXTURE_RIGHTS_ABSENT");
  }
  if (assets.length !== 1 || profile.texture_asset?.asset_id !== color.texture_asset?.asset_id) {
    return eligibilityRefusal("TEXTURE_ASSET_BINDING_MISMATCH");
  }
  const asset = assets[0];
  if (!asset.provenance || !isNonEmptyString(asset.provenance.evidence_ref)) {
    return eligibilityRefusal("TEXTURE_ASSET_PROVENANCE_MISSING");
  }
  if (
    daysOld(asset.provenance.verified_on, request.as_of) < 0 ||
    daysOld(asset.provenance.verified_on, request.as_of) > MATERIAL_SOURCE_MAX_AGE_DAYS
  ) {
    return eligibilityRefusal("SOURCE_VERIFICATION_STALE");
  }
  if (
    asset.provenance.rights_basis !== "west_coast_kbp_owned" &&
    asset.provenance.rights_basis !== "publication_authorized"
  ) {
    return eligibilityRefusal("TEXTURE_ASSET_UNAUTHORIZED");
  }
  if (
    asset.binding.manufacturer_id !== request.manufacturer_id ||
    asset.binding.product_id !== request.product_id ||
    asset.binding.profile_id !== request.profile_id ||
    asset.binding.color_id !== request.color_id
  ) {
    return eligibilityRefusal("TEXTURE_ASSET_BINDING_MISMATCH");
  }
  if (!profile.ui_eligible || !color.ui_eligible) {
    return eligibilityRefusal("UI_ELIGIBILITY_FLAG_FALSE");
  }
  return { eligible: true, reason_code: "ELIGIBLE" };
}
