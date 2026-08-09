import { describe, expect, it } from "vitest";

import geometryAData from "../../data/studio/models/geometry/adu-a-600@1.json";
import geometryBData from "../../data/studio/models/geometry/adu-b-800@1.json";
import geometrySData from "../../data/studio/models/geometry/adu-s-450@1.json";
import releaseData from "../../data/studio/models/releases/2026.09.0.json";

import { computeDigest } from "./modelContract";
import {
  buildStudioModelProjection,
  STUDIO_MODEL_PROJECTION_SCHEMA,
  STUDIO_RENDER_STATE,
} from "./modelProjection";
import type {
  AduGeometrySource,
  AduModelRelease,
  ModelDerivedArtifact,
} from "./types";

const release = releaseData as unknown as AduModelRelease;
const geometrySources = {
  "models/geometry/adu-s-450@1": geometrySData as AduGeometrySource,
  "models/geometry/adu-a-600@1": geometryAData as AduGeometrySource,
  "models/geometry/adu-b-800@1": geometryBData as AduGeometrySource,
};

function cloneRelease(): AduModelRelease {
  return structuredClone(release);
}

function cloneSources(): Record<string, AduGeometrySource> {
  return structuredClone(geometrySources);
}

async function resealArtifact(artifact: ModelDerivedArtifact): Promise<void> {
  artifact.digest = await computeDigest(artifact, ["digest"]);
}

async function resealRelease(candidate: AduModelRelease): Promise<void> {
  candidate.release_digest = await computeDigest(candidate, ["release_digest"]);
}

describe("STUDIO-MODEL-PROJECTION-001", () => {
  it("projects the exact owned release without inventing a media binding", async () => {
    const projection = await buildStudioModelProjection(release, geometrySources);

    expect(projection.schema).toBe(STUDIO_MODEL_PROJECTION_SCHEMA);
    expect(projection.source_release).toEqual({
      schema: "adu-model-release/1",
      release_version: "2026.09.0",
      release_digest: release.release_digest,
    });
    expect(
      projection.models.map((model) => model.model_id + "@" + model.model_version),
    ).toEqual([
      "adu-s-450@1.0.0",
      "adu-a-600@1.0.0",
      "adu-b-800@1.0.0",
    ]);

    for (const model of projection.models) {
      expect(model.maturity).toBe("concept_only");
      expect(model.geometry.digest).toMatch(/^sha256:[0-9a-f]{64}$/);
      expect(model.render.state).toBe(STUDIO_RENDER_STATE);
      expect(model.render.conceptual).toBe(true);
      expect(model.render.source_binding).toBe(model.geometry.source_ref);
      expect(model.render).not.toHaveProperty("url");
      expect(model.render).not.toHaveProperty("image");
      expect(model.render).not.toHaveProperty("asset");
    }
  });

  it("preserves complete defaults, domains, constraints, and stable reason codes", async () => {
    const projection = await buildStudioModelProjection(release, geometrySources);
    const compact = projection.models[0];

    expect(Object.keys(compact.configuration_defaults)).toEqual(
      compact.parameters.map((parameter) => parameter.key),
    );
    expect(
      compact.parameters.find((parameter) => parameter.key === "footprint_width_ft"),
    ).toMatchObject({
      type: "number",
      unit: "ft",
      default: 18,
      range: { min: 16, max: 20 },
      increment: 0.5,
      allowed: null,
    });
    expect(
      compact.parameters.find((parameter) => parameter.key === "exterior_finish"),
    ).toMatchObject({
      type: "enum",
      unit: null,
      default: "stucco-smooth",
      range: null,
      increment: null,
      allowed: ["stucco-smooth", "lap-siding", "board-and-batten"],
    });
    expect(compact.constraints.map((constraint) => constraint.reason_code)).toEqual([
      "shed_roof_excludes_tall_window_package",
      "alcove_layout_excludes_comfort_tier",
    ]);
  });

  it("is input-immutable, clock-free, byte-replayable, and deeply frozen", async () => {
    const releaseBefore = JSON.stringify(release);
    const sourcesBefore = JSON.stringify(geometrySources);

    const first = await buildStudioModelProjection(release, geometrySources);
    const replay = await buildStudioModelProjection(
      structuredClone(release),
      structuredClone(geometrySources),
    );

    expect(JSON.stringify(replay)).toBe(JSON.stringify(first));
    expect(JSON.stringify(release)).toBe(releaseBefore);
    expect(JSON.stringify(geometrySources)).toBe(sourcesBefore);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.models)).toBe(true);
    expect(Object.isFrozen(first.models[0].parameters[0])).toBe(true);
    expect(JSON.stringify(first)).not.toMatch(/generated_at|created_at|Date\.now/);
  });

  it("refuses a release digest mutation", async () => {
    const candidate = cloneRelease();
    candidate.release_digest = candidate.release_digest.slice(0, -1) + "0";

    await expect(buildStudioModelProjection(candidate, cloneSources())).rejects.toThrowError(
      "release_digest_mismatch",
    );
  });

  it("refuses a geometry mutation", async () => {
    const sources = cloneSources();
    sources["models/geometry/adu-s-450@1"].notes = "mutated after release";

    await expect(buildStudioModelProjection(cloneRelease(), sources)).rejects.toThrowError(
      "geometry_digest_mismatch",
    );
  });

  it("refuses a digest-consistent second render specification", async () => {
    const candidate = cloneRelease();
    const model = candidate.models[0];
    const render = model.derived_artifacts.find((artifact) => artifact.kind === "render");
    if (!render) throw new Error("fixture_missing_render");

    model.derived_artifacts.push(structuredClone(render));
    await resealRelease(candidate);

    await expect(buildStudioModelProjection(candidate, cloneSources())).rejects.toThrowError(
      "studio_projection_ambiguous_render_spec",
    );
  });

  it("refuses a digest-consistent render that claims materialization", async () => {
    const candidate = cloneRelease();
    const render = candidate.models[0].derived_artifacts.find(
      (artifact) => artifact.kind === "render",
    );
    if (!render) throw new Error("fixture_missing_render");

    (render as unknown as { materialization: string }).materialization = "generated";
    await resealArtifact(render);
    await resealRelease(candidate);

    await expect(buildStudioModelProjection(candidate, cloneSources())).rejects.toThrowError(
      "studio_projection_render_is_not_unmaterialized",
    );
  });

  it("refuses a digest-consistent mutable render reference", async () => {
    const candidate = cloneRelease();
    const render = candidate.models[0].derived_artifacts.find(
      (artifact) => artifact.kind === "render",
    );
    if (!render) throw new Error("fixture_missing_render");

    render.ref = "models/derived/adu-s-450@1/latest";
    await resealArtifact(render);
    await resealRelease(candidate);

    await expect(buildStudioModelProjection(candidate, cloneSources())).rejects.toThrowError(
      "studio_projection_mutable_render_ref",
    );
  });

  it("refuses a digest-consistent render reference for another model", async () => {
    const candidate = cloneRelease();
    const compactRender = candidate.models[0].derived_artifacts.find(
      (artifact) => artifact.kind === "render",
    );
    const premiumRender = candidate.models[2].derived_artifacts.find(
      (artifact) => artifact.kind === "render",
    );
    if (!compactRender || !premiumRender) throw new Error("fixture_missing_render");

    compactRender.ref = premiumRender.ref;
    await resealArtifact(compactRender);
    await resealRelease(candidate);

    await expect(buildStudioModelProjection(candidate, cloneSources())).rejects.toThrowError(
      "studio_projection_render_subject_mismatch",
    );
  });

  it("refuses a digest-consistent legacy image render reference", async () => {
    const candidate = cloneRelease();
    const render = candidate.models[1].derived_artifacts.find(
      (artifact) => artifact.kind === "render",
    );
    if (!render) throw new Error("fixture_missing_render");

    render.ref = "/images/attainable-adu-hero-concept-v1.webp";
    await resealArtifact(render);
    await resealRelease(candidate);

    await expect(buildStudioModelProjection(candidate, cloneSources())).rejects.toThrowError(
      "studio_projection_render_ref_invalid",
    );
  });

  it("refuses a digest-consistent query-suffixed mutable render reference", async () => {
    const candidate = cloneRelease();
    const render = candidate.models[2].derived_artifacts.find(
      (artifact) => artifact.kind === "render",
    );
    if (!render) throw new Error("fixture_missing_render");

    render.ref = "models/derived/adu-b-800@1/latest?cache=1";
    await resealArtifact(render);
    await resealRelease(candidate);

    await expect(buildStudioModelProjection(candidate, cloneSources())).rejects.toThrowError(
      "studio_projection_render_ref_invalid",
    );
  });

  it("refuses a digest-consistent non-advancing conceptual boundary", async () => {
    const candidate = cloneRelease();
    const render = candidate.models[0].derived_artifacts.find(
      (artifact) => artifact.kind === "render",
    );
    if (!render) throw new Error("fixture_missing_render");

    render.marked_conceptual_until = "concept_only";
    await resealArtifact(render);
    await resealRelease(candidate);

    await expect(buildStudioModelProjection(candidate, cloneSources())).rejects.toThrowError(
      "studio_projection_render_truth_boundary_invalid",
    );
  });

  it("refuses a digest-consistent render generation that diverges from immutable geometry", async () => {
    const candidate = cloneRelease();
    const model = candidate.models[1];
    const render = model.derived_artifacts.find((artifact) => artifact.kind === "render");
    if (!render) throw new Error("fixture_missing_render");

    const geometrySubject = /^models\/geometry\/(adu-[a-z]-\d{3})@([1-9]\d*)$/.exec(
      model.geometry.source_ref,
    );
    if (!geometrySubject) throw new Error("fixture_missing_geometry_subject");

    const divergentGeneration = String(Number(geometrySubject[2]) + 1);
    render.ref = `models/derived/${geometrySubject[1]}@${divergentGeneration}/render-concept`;
    await resealArtifact(render);
    await resealRelease(candidate);

    await expect(buildStudioModelProjection(candidate, cloneSources())).rejects.toThrowError(
      "studio_projection_render_subject_mismatch",
    );
  });

  it("refuses a digest-consistent render reference outside the exact models/derived namespace", async () => {
    const candidate = cloneRelease();
    const model = candidate.models[0];
    const render = model.derived_artifacts.find((artifact) => artifact.kind === "render");
    if (!render) throw new Error("fixture_missing_render");

    const geometrySubject = /^models\/geometry\/(adu-[a-z]-\d{3})@([1-9]\d*)$/.exec(
      model.geometry.source_ref,
    );
    if (!geometrySubject) throw new Error("fixture_missing_geometry_subject");

    render.ref = `models/derived-preview/${geometrySubject[1]}@${geometrySubject[2]}/render-concept`;
    await resealArtifact(render);
    await resealRelease(candidate);

    await expect(buildStudioModelProjection(candidate, cloneSources())).rejects.toThrowError(
      "studio_projection_render_ref_invalid",
    );
  });
});
