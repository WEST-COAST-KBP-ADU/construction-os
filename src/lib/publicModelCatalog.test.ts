import { describe, expect, it } from "vitest";

import geometryA600Data from "../data/studio/models/geometry/adu-a-600@1.json";
import geometryB800Data from "../data/studio/models/geometry/adu-b-800@1.json";
import geometryS450Data from "../data/studio/models/geometry/adu-s-450@1.json";
import releaseData from "../data/studio/models/releases/2026.09.0.json";

import {
  PUBLIC_MODEL_IDS,
  buildPublicModelCatalog,
  findPublicModel,
  getPublicModelCatalog,
} from "./publicModelCatalog";
import { defaultConfiguration } from "./studio/modelContract";
import type {
  AduGeometrySource,
  AduModelRelease,
} from "./studio/types";

const release = releaseData as unknown as AduModelRelease;

const geometrySources: Record<string, AduGeometrySource> = {
  "models/geometry/adu-s-450@1": geometryS450Data as unknown as AduGeometrySource,
  "models/geometry/adu-a-600@1": geometryA600Data as unknown as AduGeometrySource,
  "models/geometry/adu-b-800@1": geometryB800Data as unknown as AduGeometrySource,
};

function cloneRelease(): AduModelRelease {
  return structuredClone(release);
}

function cloneSources(): Record<string, AduGeometrySource> {
  return structuredClone(geometrySources);
}

describe("PUBLIC-MODEL-CATALOG-001", () => {
  it("projects exactly the owned 2026.09.0 families and their contract facts", async () => {
    const catalog = await getPublicModelCatalog();

    expect(catalog.release).toMatchObject({
      version: "2026.09.0",
      effectiveFrom: release.effective_from,
      digest: release.release_digest,
    });
    expect(catalog.models.map((model) => model.modelId)).toEqual(PUBLIC_MODEL_IDS);

    for (const entry of catalog.models) {
      const sourceModel = release.models.find((model) => model.model_id === entry.modelId);
      const sourceGeometry = geometrySources[sourceModel!.geometry.source_ref]!;
      const defaults = defaultConfiguration(sourceModel!);

      expect(entry).toMatchObject({
        modelId: sourceModel!.model_id,
        modelVersion: sourceModel!.version,
        title: sourceModel!.title,
        maturity: sourceModel!.maturity,
        program: {
          bedrooms: sourceModel!.program.bedrooms,
          bathrooms: sourceModel!.program.bathrooms,
        },
        areaBandSqft: sourceModel!.envelope.gross_area_sqft,
        provenanceClass: sourceModel!.provenance.origin,
      });
      expect(entry.referenceEnvelope.widthFt).toEqual(sourceModel!.envelope.width_ft);
      expect(entry.referenceEnvelope.depthFt).toEqual(sourceModel!.envelope.depth_ft);
      expect(entry.referenceEnvelope.defaultFootprint).toMatchObject({
        widthFt: defaults.footprint_width_ft,
        depthFt: defaults.footprint_depth_ft,
        areaSqft: (defaults.footprint_width_ft as number) * (defaults.footprint_depth_ft as number),
        shape: sourceGeometry.footprint.shape,
      });
      expect(entry.configurableCategories.map((category) => category.category)).toEqual([
        "geometry",
        "layout",
        "presentation",
      ]);
      expect(entry.explicitUnknowns).toHaveLength(3);
    }
  });

  it("resolves only the canonical public model IDs", async () => {
    const catalog = await getPublicModelCatalog();

    expect(findPublicModel(catalog, "adu-a-600")?.title).toBe("One Bedroom");
    expect(findPublicModel(catalog, "not-a-model")).toBeUndefined();
  });

  it.each([
    [
      "identity drift",
      (candidate: AduModelRelease) => {
        candidate.models[0].model_id = "adu-x-450";
      },
      "geometry_model_mismatch",
    ],
    [
      "release digest drift",
      (candidate: AduModelRelease) => {
        candidate.release_digest = "sha256:" + "0".repeat(64);
      },
      "release_digest_mismatch",
    ],
    [
      "maturity drift",
      (candidate: AduModelRelease) => {
        candidate.models[1].maturity = "design_validated";
      },
      "maturity_promotion_requires_separate_evidence",
    ],
    [
      "fact drift",
      (candidate: AduModelRelease) => {
        candidate.models[2].title = "Changed two bedroom";
      },
      "release_digest_mismatch",
    ],
  ])("fails closed for %s", async (_name, mutate, errorCode) => {
    const candidate = cloneRelease();
    mutate(candidate);

    await expect(
      buildPublicModelCatalog(candidate, cloneSources()),
    ).rejects.toThrow(errorCode);
  });
});
