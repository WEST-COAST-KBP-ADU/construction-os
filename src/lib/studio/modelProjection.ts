import {
  assertValidRelease,
  defaultConfiguration,
} from "./modelContract";
import { MODEL_MATURITY_STATES } from "./types";
import type {
  AduGeometrySource,
  AduModel,
  AduModelRelease,
  ModelConfigurationValues,
  ModelConstraint,
  ModelMaturity,
  ParameterCategory,
} from "./types";

export const STUDIO_MODEL_PROJECTION_SCHEMA = "studio-model-projection/1" as const;
export const STUDIO_RENDER_STATE = "specified_not_generated" as const;

const MUTABLE_REFERENCE_SEGMENTS = new Set(["latest", "current", "stable", "head", "next"]);
const GEOMETRY_REFERENCE_PATTERN = /^models\/geometry\/(adu-[a-z]-\d{3})@([1-9]\d*)$/;
const RENDER_REFERENCE_PATTERN =
  /^models\/derived\/(adu-[a-z]-\d{3})@([1-9]\d*)\/render-concept$/;

export type StudioProjectedParameter = {
  key: string;
  category: ParameterCategory;
  type: "number" | "enum";
  unit: string | null;
  default: number | string;
  range: { min: number; max: number } | null;
  increment: number | null;
  allowed: string[] | null;
  affects: string[];
  depends_on: string[];
};

export type StudioProjectedConstraint = {
  rule_id: string;
  if: Record<string, string>;
  deny: Record<string, string[]>;
  reason_code: string;
};

export type StudioProjectedModel = {
  model_id: string;
  model_version: string;
  maturity: ModelMaturity;
  title: string;
  program: {
    stories: number;
    bedrooms: number;
    bathrooms: number;
  };
  area_band_sqft: {
    min: number;
    max: number;
  };
  geometry: {
    source_ref: string;
    digest: string;
  };
  configuration_defaults: ModelConfigurationValues;
  parameters: StudioProjectedParameter[];
  constraints: StudioProjectedConstraint[];
  render: {
    state: typeof STUDIO_RENDER_STATE;
    ref: string;
    version: string;
    digest: string;
    source_binding: string;
    conceptual: true;
    marked_conceptual_until: ModelMaturity;
  };
};

export type StudioModelProjection = {
  schema: typeof STUDIO_MODEL_PROJECTION_SCHEMA;
  source_release: {
    schema: "adu-model-release/1";
    release_version: string;
    release_digest: string;
  };
  models: StudioProjectedModel[];
};

function fail(code: string): never {
  throw new Error(code);
}

function assertImmutableReference(reference: string, code: string): void {
  const segments = reference.toLowerCase().split(/[\/@]/);

  if (segments.some((segment) => MUTABLE_REFERENCE_SEGMENTS.has(segment))) {
    fail(code);
  }
}

function assertCanonicalRenderReference(model: AduModel, reference: string): void {
  const geometrySubject = GEOMETRY_REFERENCE_PATTERN.exec(model.geometry.source_ref);
  const renderSubject = RENDER_REFERENCE_PATTERN.exec(reference);

  if (renderSubject === null) {
    fail("studio_projection_render_ref_invalid");
  }

  if (
    geometrySubject === null ||
    geometrySubject[1] !== model.model_id ||
    renderSubject[1] !== model.model_id ||
    renderSubject[1] !== geometrySubject[1] ||
    renderSubject[2] !== geometrySubject[2]
  ) {
    fail("studio_projection_render_subject_mismatch");
  }
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

function cloneConstraint(constraint: ModelConstraint): StudioProjectedConstraint {
  return {
    rule_id: constraint.rule_id,
    if: { ...constraint.if },
    deny: Object.fromEntries(
      Object.entries(constraint.deny).map(([key, denied]) => [key, [...denied]]),
    ),
    reason_code: constraint.reason_code,
  };
}

function projectRender(model: AduModel): StudioProjectedModel["render"] {
  const renders = model.derived_artifacts.filter((artifact) => artifact.kind === "render");

  if (renders.length === 0) {
    fail("studio_projection_missing_render_spec");
  }

  if (renders.length !== 1) {
    fail("studio_projection_ambiguous_render_spec");
  }

  const render = renders[0];

  if (render.materialization !== STUDIO_RENDER_STATE) {
    fail("studio_projection_render_is_not_unmaterialized");
  }

  if (
    !render.ref ||
    !render.source_binding ||
    render.conceptual !== true ||
    render.marked_conceptual_until === undefined
  ) {
    fail("studio_projection_render_truth_boundary_missing");
  }

  const modelMaturityIndex = MODEL_MATURITY_STATES.indexOf(model.maturity);
  const boundaryIndex = MODEL_MATURITY_STATES.indexOf(render.marked_conceptual_until);

  if (boundaryIndex <= modelMaturityIndex) {
    fail("studio_projection_render_truth_boundary_invalid");
  }

  assertImmutableReference(render.ref, "studio_projection_mutable_render_ref");
  assertImmutableReference(render.source_binding, "studio_projection_mutable_geometry_ref");
  assertCanonicalRenderReference(model, render.ref);

  return {
    state: STUDIO_RENDER_STATE,
    ref: render.ref,
    version: render.version,
    digest: render.digest,
    source_binding: render.source_binding,
    conceptual: true,
    marked_conceptual_until: render.marked_conceptual_until,
  };
}

function projectModel(model: AduModel): StudioProjectedModel {
  assertImmutableReference(model.geometry.source_ref, "studio_projection_mutable_geometry_ref");

  return {
    model_id: model.model_id,
    model_version: model.version,
    maturity: model.maturity,
    title: model.title,
    program: {
      stories: model.program.stories,
      bedrooms: model.program.bedrooms,
      bathrooms: model.program.bathrooms,
    },
    area_band_sqft: { ...model.envelope.gross_area_sqft },
    geometry: {
      source_ref: model.geometry.source_ref,
      digest: model.geometry.digest,
    },
    configuration_defaults: { ...defaultConfiguration(model) },
    parameters: model.parameters.map((parameter) => ({
      key: parameter.key,
      category: parameter.category,
      type: parameter.type,
      unit: parameter.unit,
      default: parameter.default,
      range: parameter.range ? { ...parameter.range } : null,
      increment: parameter.increment ?? null,
      allowed: parameter.allowed ? [...parameter.allowed] : null,
      affects: [...parameter.affects],
      depends_on: [...parameter.depends_on],
    })),
    constraints: model.constraints.map(cloneConstraint),
    render: projectRender(model),
  };
}

/**
 * Validates the complete canonical release before returning a Studio read
 * model. The result contains no presentation URL: a render specification is
 * evidence of an intended artifact, not evidence that media was generated or
 * reviewed.
 */
export async function buildStudioModelProjection(
  release: AduModelRelease,
  geometrySources: Record<string, AduGeometrySource>,
): Promise<StudioModelProjection> {
  await assertValidRelease(release, geometrySources);

  return deepFreeze({
    schema: STUDIO_MODEL_PROJECTION_SCHEMA,
    source_release: {
      schema: release.schema,
      release_version: release.release_version,
      release_digest: release.release_digest,
    },
    models: release.models.map(projectModel),
  });
}
