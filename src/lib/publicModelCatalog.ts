import releaseData from "@/src/data/studio/models/releases/2026.09.0.json";
import geometryA600Data from "@/src/data/studio/models/geometry/adu-a-600@1.json";
import geometryB800Data from "@/src/data/studio/models/geometry/adu-b-800@1.json";
import geometryS450Data from "@/src/data/studio/models/geometry/adu-s-450@1.json";
import {
  assertValidRelease,
  defaultConfiguration,
} from "@/src/lib/studio/modelContract";
import type {
  AduGeometrySource,
  AduModel,
  AduModelRelease,
  ParameterCategory,
} from "@/src/lib/studio/types";

export const PUBLIC_MODEL_RELEASE_VERSION = "2026.09.0" as const;

export const PUBLIC_MODEL_IDS = [
  "adu-s-450",
  "adu-a-600",
  "adu-b-800",
] as const;

export type PublicModelId = (typeof PUBLIC_MODEL_IDS)[number];

const configurationCategoryOrder = [
  "geometry",
  "layout",
  "presentation",
] as const satisfies readonly ParameterCategory[];

const conceptOnlyUnknowns = [
  "Property compatibility and parcel fit are not concluded.",
  "Design validation, permit readiness, and approval status are not published.",
  "Pricing, schedule, availability, and construction readiness are not published.",
] as const;

export type PublicModelCatalogEntry = {
  readonly modelId: PublicModelId;
  readonly modelVersion: string;
  readonly title: string;
  readonly maturity: "concept_only";
  readonly program: {
    readonly bedrooms: number;
    readonly bathrooms: number;
  };
  readonly areaBandSqft: {
    readonly min: number;
    readonly max: number;
  };
  readonly referenceEnvelope: {
    readonly widthFt: {
      readonly min: number;
      readonly max: number;
    };
    readonly depthFt: {
      readonly min: number;
      readonly max: number;
    };
    readonly maxHeightFt: number;
    readonly incrementGridFt: number;
    readonly defaultFootprint: {
      readonly widthFt: number;
      readonly depthFt: number;
      readonly areaSqft: number;
      readonly shape: string;
    };
  };
  readonly provenanceClass: "west_coast_kbp_original";
  readonly configurableCategories: readonly {
    readonly category: ParameterCategory;
    readonly parameterKeys: readonly string[];
  }[];
  readonly explicitUnknowns: readonly string[];
};

export type PublicModelCatalog = {
  readonly release: {
    readonly version: typeof PUBLIC_MODEL_RELEASE_VERSION;
    readonly effectiveFrom: string;
    readonly digest: string;
  };
  readonly models: readonly PublicModelCatalogEntry[];
};

const canonicalRelease = releaseData as unknown as AduModelRelease;

const canonicalGeometrySources: Record<string, AduGeometrySource> = {
  "models/geometry/adu-s-450@1": geometryS450Data as unknown as AduGeometrySource,
  "models/geometry/adu-a-600@1": geometryA600Data as unknown as AduGeometrySource,
  "models/geometry/adu-b-800@1": geometryB800Data as unknown as AduGeometrySource,
};

function fail(code: string): never {
  throw new Error(code);
}

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);

    for (const nested of Object.values(value as Record<string, unknown>)) {
      deepFreeze(nested);
    }
  }

  return value;
}

function assertPublicReleaseIdentity(release: AduModelRelease): void {
  if (release.release_version !== PUBLIC_MODEL_RELEASE_VERSION) {
    fail("public_model_catalog_release_version_mismatch");
  }

  const releaseModelIds = release.models.map((model) => model.model_id);

  if (
    releaseModelIds.length !== PUBLIC_MODEL_IDS.length ||
    releaseModelIds.some((modelId, index) => modelId !== PUBLIC_MODEL_IDS[index])
  ) {
    fail("public_model_catalog_identity_mismatch");
  }

  for (const model of release.models) {
    if (model.maturity !== "concept_only") {
      fail("public_model_catalog_maturity_mismatch");
    }
  }
}

function getDefaultDimension(model: AduModel, key: string): number {
  const value = defaultConfiguration(model)[key];

  if (typeof value !== "number") {
    fail("public_model_catalog_missing_default_dimension");
  }

  return value;
}

function getFootprintShape(source: AduGeometrySource): string {
  const shape = source.footprint.shape;

  if (typeof shape !== "string") {
    fail("public_model_catalog_invalid_footprint_shape");
  }

  return shape;
}

function projectConfigurableCategories(
  model: AduModel,
): PublicModelCatalogEntry["configurableCategories"] {
  return configurationCategoryOrder.flatMap((category) => {
    const parameterKeys = model.parameters
      .filter((parameter) => parameter.category === category)
      .map((parameter) => parameter.key);

    return parameterKeys.length > 0 ? [{ category, parameterKeys }] : [];
  });
}

function projectModel(
  model: AduModel,
  source: AduGeometrySource,
): PublicModelCatalogEntry {
  const widthFt = getDefaultDimension(model, "footprint_width_ft");
  const depthFt = getDefaultDimension(model, "footprint_depth_ft");

  return {
    modelId: model.model_id as PublicModelId,
    modelVersion: model.version,
    title: model.title,
    maturity: "concept_only",
    program: {
      bedrooms: model.program.bedrooms,
      bathrooms: model.program.bathrooms,
    },
    areaBandSqft: {
      min: model.envelope.gross_area_sqft.min,
      max: model.envelope.gross_area_sqft.max,
    },
    referenceEnvelope: {
      widthFt: {
        min: model.envelope.width_ft.min,
        max: model.envelope.width_ft.max,
      },
      depthFt: {
        min: model.envelope.depth_ft.min,
        max: model.envelope.depth_ft.max,
      },
      maxHeightFt: model.envelope.height_ft.max,
      incrementGridFt: model.envelope.increment_grid_ft,
      defaultFootprint: {
        widthFt,
        depthFt,
        areaSqft: widthFt * depthFt,
        shape: getFootprintShape(source),
      },
    },
    provenanceClass: model.provenance.origin,
    configurableCategories: projectConfigurableCategories(model),
    explicitUnknowns: conceptOnlyUnknowns,
  };
}

/**
 * Creates the only public projection of the owned-model release. Contract
 * validation runs before any fact is returned, so an invalid or digest-drifted
 * release cannot degrade into a partial editorial catalog.
 */
export async function buildPublicModelCatalog(
  release: AduModelRelease,
  geometrySources: Record<string, AduGeometrySource>,
): Promise<PublicModelCatalog> {
  await assertValidRelease(release, geometrySources);
  assertPublicReleaseIdentity(release);

  return deepFreeze({
    release: {
      version: PUBLIC_MODEL_RELEASE_VERSION,
      effectiveFrom: release.effective_from,
      digest: release.release_digest,
    },
    models: release.models.map((model) => {
      const source = geometrySources[model.geometry.source_ref];

      if (!source) {
        fail("public_model_catalog_missing_geometry_source");
      }

      return projectModel(model, source);
    }),
  });
}

let publicModelCatalogPromise: Promise<PublicModelCatalog> | undefined;

export function getPublicModelCatalog(): Promise<PublicModelCatalog> {
  publicModelCatalogPromise ??= buildPublicModelCatalog(
    canonicalRelease,
    canonicalGeometrySources,
  );

  return publicModelCatalogPromise;
}

export function isPublicModelId(value: string): value is PublicModelId {
  return PUBLIC_MODEL_IDS.some((modelId) => modelId === value);
}

export function findPublicModel(
  catalog: PublicModelCatalog,
  modelId: string,
): PublicModelCatalogEntry | undefined {
  return catalog.models.find((model) => model.modelId === modelId);
}
