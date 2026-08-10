import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import seedData from "../../data/materials/james-hardie/2026-08-10.json";
import studioCatalog from "../../data/studio/catalog/releases/2026.08.0.json";
import {
  decideMaterialEligibility,
  loadMaterialRegistry,
  MATERIAL_REGISTRY_SCHEMA,
  type MaterialEligibilityRequest,
  type MaterialRegistry,
  type TextureAsset,
} from "./materialRegistry";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const SEED_PATH = path.join(ROOT, "src/data/materials/james-hardie/2026-08-10.json");
const seedRaw = readFileSync(SEED_PATH, "utf8");
const seed = seedData as unknown as MaterialRegistry;

function cloneRegistry(source: MaterialRegistry = seed): MaterialRegistry {
  return JSON.parse(JSON.stringify(source)) as MaterialRegistry;
}

function eligibleFixture(): MaterialRegistry {
  const registry = cloneRegistry();
  const profile = registry.products[0].profiles[0];
  const color = registry.colors[0];
  const asset: TextureAsset = {
    asset_id: "tony-owned-hardie-plank-select-cedarmill-iron-gray",
    provenance: {
      rights_basis: "west_coast_kbp_owned",
      evidence_ref: "owner-publication-approval-001",
      verified_on: "2026-08-10",
    },
    binding: {
      manufacturer_id: registry.manufacturer.id,
      product_id: registry.products[0].id,
      profile_id: profile.id,
      color_id: color.id,
    },
  };

  registry.market_context.local_availability = "verified";
  profile.local_availability = "verified";
  profile.west_coast_kbp_offering = "adopted";
  profile.texture_asset = cloneAsset(asset);
  profile.texture_rights = "publication_authorized";
  profile.ui_eligible = true;
  color.local_availability = "verified";
  color.texture_asset = cloneAsset(asset);
  color.texture_rights = "publication_authorized";
  color.ui_eligible = true;
  return registry;
}

function cloneAsset(asset: TextureAsset): TextureAsset {
  return JSON.parse(JSON.stringify(asset)) as TextureAsset;
}

function request(overrides: Partial<MaterialEligibilityRequest> = {}): MaterialEligibilityRequest {
  return {
    manufacturer_id: "james-hardie",
    product_id: "hardie-plank",
    profile_id: "select-cedarmill",
    color_id: "iron-gray",
    as_of: "2026-08-10",
    combination_adoption: {
      status: "adopted",
      evidence_ref: "west-coast-kbp-adoption-001",
    },
    relationship_claims: [],
    ...overrides,
  };
}

function allFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const candidate = path.join(directory, name);
    return statSync(candidate).isDirectory() ? allFiles(candidate) : [candidate];
  });
}

describe("James Hardie material registry seed", () => {
  it("parses and validates under material-registry/1", () => {
    expect(JSON.parse(seedRaw).schema).toBe(MATERIAL_REGISTRY_SCHEMA);
    expect(loadMaterialRegistry(seedRaw)).toMatchObject({ ok: true });
    expect(loadMaterialRegistry(seed)).toMatchObject({ ok: true });
  });

  it("contains unique, non-empty IDs and display names at each required scope", () => {
    const unique = (values: string[]) => new Set(values).size === values.length;
    expect(unique(seed.sources.map(({ id }) => id))).toBe(true);
    expect(unique(seed.products.map(({ id }) => id))).toBe(true);
    expect(unique(seed.products.map(({ display_name }) => display_name))).toBe(true);
    expect(unique(seed.colors.map(({ id }) => id))).toBe(true);
    expect(unique(seed.colors.map(({ display_name }) => display_name))).toBe(true);

    for (const product of seed.products) {
      expect(product.id.trim()).not.toBe("");
      expect(product.display_name.trim()).not.toBe("");
      expect(unique(product.profiles.map(({ id }) => id))).toBe(true);
      expect(unique(product.profiles.map(({ display_name }) => display_name))).toBe(true);
      expect(product.profiles.every(({ id, display_name }) => id.trim() !== "" && display_name.trim() !== "")).toBe(true);
    }
  });

  it("pins every source to the official HTTPS host and verification date", () => {
    expect(seed.verified_on).toBe("2026-08-10");
    expect(seed.sources).toHaveLength(4);
    expect(seed.sources.map(({ url }) => url)).toEqual([
      "https://www.jameshardie.com/product-catalog/exterior-siding-products/hardie-plank-lap-siding/",
      "https://www.jameshardie.com/product-catalog/exterior-siding-products/hardie-panel-siding/select-cedarmill/statement-collection-colors/",
      "https://www.jameshardie.com/statement-collection-colors/",
      "https://www.jameshardie.com/design-with-artisan/",
    ]);
    for (const source of seed.sources) {
      const url = new URL(source.url);
      expect(url.protocol).toBe("https:");
      expect(url.hostname).toBe("www.jameshardie.com");
      expect(source.verified_on).toBe(seed.verified_on);
      expect(source.facts.length).toBeGreaterThan(0);
    }
  });

  it("maps every manufacturer, product, profile, and color name to an existing source", () => {
    const sourceIds = new Set(seed.sources.map(({ id }) => id));
    expect(sourceIds.has(seed.manufacturer.source_id)).toBe(true);
    for (const product of seed.products) {
      expect(sourceIds.has(product.source_id)).toBe(true);
      expect(product.profiles.every(({ source_id }) => sourceIds.has(source_id))).toBe(true);
    }
    expect(seed.colors.every(({ source_id }) => sourceIds.has(source_id))).toBe(true);
  });

  it("seeds the exact bounded manufacturer names and source mapping", () => {
    expect(seed.products.map(({ display_name }) => display_name)).toEqual([
      "Hardie® Plank",
      "Hardie® Panel",
      "Hardie® Artisan®",
    ]);
    expect(seed.products.map(({ profiles }) => profiles.map(({ display_name }) => display_name))).toEqual([
      [
        "Select Cedarmill®",
        "Smooth",
        "Beaded Select Cedarmill®",
        "Beaded Smooth",
        "Custom Colonial Roughsawn",
        "Custom Colonial Smooth",
      ],
      ["Select Cedarmill®", "Smooth", "Stucco", "Sierra 8"],
      ["Hardie® Artisan® Lap", "V-Groove", "Shiplap", "Square Channel"],
    ]);
    expect(seed.colors).toMatchObject([
      {
        display_name: "Iron Gray",
        finish_technology: "ColorPlus® Technology",
        source_id: "hardie-plank-product",
      },
    ]);
  });

  it("keeps every seed availability, offering, texture, rights, and UI state fail-closed", () => {
    expect(seed.market_context.local_availability).toBe("unverified");
    const profiles = seed.products.flatMap(({ profiles }) => profiles);
    expect(profiles).toHaveLength(14);
    for (const profile of profiles) {
      expect(profile.local_availability).toBe("unverified");
      expect(profile.west_coast_kbp_offering).toBe("not_adopted");
      expect(profile.texture_asset).toBeNull();
      expect(profile.texture_rights).toBe("absent");
      expect(profile.ui_eligible).toBe(false);
    }
    for (const color of seed.colors) {
      expect(color.local_availability).toBe("unverified");
      expect(color.display_color).toBeNull();
      expect(color.texture_asset).toBeNull();
      expect(color.texture_rights).toBe("absent");
      expect(color.ui_eligible).toBe(false);
    }
  });

  it("contains no display color, image URL, local public asset, or copied media reference", () => {
    const strings: string[] = [];
    const visit = (value: unknown): void => {
      if (typeof value === "string") strings.push(value);
      else if (Array.isArray(value)) value.forEach(visit);
      else if (value && typeof value === "object") Object.values(value).forEach(visit);
    };
    visit(seed);
    expect(seed.colors.every(({ display_color }) => display_color === null)).toBe(true);
    expect(strings.some((value) => /^(?:#|rgba?\(|hsla?\(|oklch\(|transparent$|currentcolor$)/i.test(value))).toBe(false);
    expect(strings.some((value) => /(?:\.(?:avif|gif|jpe?g|png|svg|webp)(?:\?|$)|\/(?:public|images?)\/)/i.test(value))).toBe(false);
  });

  it("states non-affiliation without making an affirmative relationship claim", () => {
    expect(seed.non_affiliation_notice).toContain("No affiliation");
    expect(seed.non_affiliation_notice).toContain("not claimed");
    expect(seedRaw).not.toMatch(/(?:is|are) (?:an? )?(?:partner|certified|endorsed|authorized installer)/i);
  });

  it("does not promote current Studio placeholders into official manufacturer records", () => {
    const studioValues = Object.values(studioCatalog.options).flat();
    const officialValues = new Set([
      ...seed.products.flatMap((product) => [
        product.id,
        product.display_name,
        ...product.profiles.flatMap((profile) => [profile.id, profile.display_name]),
      ]),
      ...seed.colors.flatMap((color) => [color.id, color.display_name]),
    ]);
    expect(studioValues.filter((value) => officialValues.has(value))).toEqual([]);
  });

  it("is not imported by current application, component, or Studio sources", () => {
    const sourceRoots = [path.join(ROOT, "app"), path.join(ROOT, "src/components"), path.join(ROOT, "src/lib/studio")];
    const importPattern = /(?:materialRegistry|data\/materials\/james-hardie)/;
    const importingFiles = sourceRoots
      .flatMap(allFiles)
      .filter((file) => /\.[cm]?[jt]sx?$/.test(file))
      .filter((file) => importPattern.test(readFileSync(file, "utf8")));
    expect(importingFiles).toEqual([]);
  });
});

describe("fail-closed material eligibility", () => {
  it("allows only a fully sourced, adopted, locally verified, authorized, exact-bound combination", () => {
    expect(decideMaterialEligibility(eligibleFixture(), request())).toEqual({
      eligible: true,
      reason_code: "ELIGIBLE",
    });
  });

  const requestRefusals: Array<[string, Partial<MaterialEligibilityRequest>, string]> = [
    ["unknown manufacturer", { manufacturer_id: "unknown-manufacturer" }, "MANUFACTURER_UNKNOWN"],
    ["unknown product", { product_id: "unknown-product" }, "PRODUCT_UNKNOWN"],
    ["unknown profile", { profile_id: "unknown-profile" }, "PROFILE_UNKNOWN"],
    ["unknown color", { color_id: "unknown-color" }, "COLOR_UNKNOWN"],
    ["stale verification", { as_of: "2027-08-12" }, "SOURCE_VERIFICATION_STALE"],
    ["relationship claim", { relationship_claims: ["partnership"] }, "RELATIONSHIP_CLAIM_PRESENT"],
    ["missing combination adoption", { combination_adoption: null }, "WEST_COAST_KBP_NOT_ADOPTED"],
  ];

  it.each(requestRefusals)("refuses %s by stable reason code", (_label, requestMutation, reasonCode) => {
    expect(decideMaterialEligibility(eligibleFixture(), request(requestMutation))).toEqual({
      eligible: false,
      reason_code: reasonCode,
    });
  });

  it("refuses an unknown source", () => {
    const registry = eligibleFixture();
    registry.products[0].profiles[0].source_id = "unknown-source";
    expect(decideMaterialEligibility(registry, request())).toMatchObject({
      eligible: false,
      reason_code: "UNKNOWN_SOURCE",
    });
  });

  it("refuses an unsupported source domain", () => {
    const registry = eligibleFixture();
    registry.sources[0].url = "https://example.com/not-an-official-source";
    expect(decideMaterialEligibility(registry, request())).toMatchObject({
      eligible: false,
      reason_code: "SOURCE_DOMAIN_UNSUPPORTED",
    });
  });

  it("refuses unverified local availability", () => {
    const registry = eligibleFixture();
    registry.products[0].profiles[0].local_availability = "unverified";
    expect(decideMaterialEligibility(registry, request())).toEqual({
      eligible: false,
      reason_code: "LOCAL_AVAILABILITY_UNVERIFIED",
    });
  });

  it("refuses missing West Coast KBP offering adoption", () => {
    const registry = eligibleFixture();
    registry.products[0].profiles[0].west_coast_kbp_offering = "not_adopted";
    expect(decideMaterialEligibility(registry, request())).toEqual({
      eligible: false,
      reason_code: "WEST_COAST_KBP_NOT_ADOPTED",
    });
  });

  it("refuses absent texture rights", () => {
    const registry = eligibleFixture();
    registry.products[0].profiles[0].texture_rights = "absent";
    expect(decideMaterialEligibility(registry, request())).toEqual({
      eligible: false,
      reason_code: "TEXTURE_RIGHTS_ABSENT",
    });
  });

  it("refuses missing texture provenance", () => {
    const registry = eligibleFixture();
    (registry.products[0].profiles[0].texture_asset as unknown as Record<string, unknown>).provenance = null;
    expect(decideMaterialEligibility(registry, request())).toEqual({
      eligible: false,
      reason_code: "TEXTURE_ASSET_PROVENANCE_MISSING",
    });
  });

  it("refuses an asset bound to a different exact combination", () => {
    const registry = eligibleFixture();
    registry.products[0].profiles[0].texture_asset!.binding.color_id = "different-color";
    registry.colors[0].texture_asset!.binding.color_id = "different-color";
    expect(decideMaterialEligibility(registry, request())).toEqual({
      eligible: false,
      reason_code: "TEXTURE_ASSET_BINDING_MISMATCH",
    });
  });

  it("refuses stale asset provenance even when manufacturer sources are current", () => {
    const registry = eligibleFixture();
    registry.products[0].profiles[0].texture_asset!.provenance.verified_on = "2025-08-09";
    registry.colors[0].texture_asset!.provenance.verified_on = "2025-08-09";
    expect(decideMaterialEligibility(registry, request())).toEqual({
      eligible: false,
      reason_code: "SOURCE_VERIFICATION_STALE",
    });
  });

  it("refuses absent, malformed, and partial evidence instead of throwing", () => {
    expect(decideMaterialEligibility(seed, null)).toEqual({
      eligible: false,
      reason_code: "ELIGIBILITY_REQUEST_MALFORMED",
    });
    expect(decideMaterialEligibility(seed, { product_id: "hardie-plank" })).toEqual({
      eligible: false,
      reason_code: "ELIGIBILITY_REQUEST_MALFORMED",
    });
    expect(loadMaterialRegistry("{not-json")).toEqual({
      ok: false,
      reason_code: "REGISTRY_JSON_INVALID",
      path: "$",
    });
  });

  it("refuses every current seed combination before any UI eligibility", () => {
    for (const product of seed.products) {
      for (const profile of product.profiles) {
        expect(
          decideMaterialEligibility(
            seed,
            request({ product_id: product.id, profile_id: profile.id }),
          ),
        ).toEqual({ eligible: false, reason_code: "LOCAL_AVAILABILITY_UNVERIFIED" });
      }
    }
  });
});
