import { describe, expect, it } from "vitest";

import releaseData from "../../data/studio/models/releases/2026.09.0.json";
import geometryS450 from "../../data/studio/models/geometry/adu-s-450@1.json";
import geometryA600 from "../../data/studio/models/geometry/adu-a-600@1.json";
import geometryB800 from "../../data/studio/models/geometry/adu-b-800@1.json";

import {
  REQUIRED_CONCEPT_ONLY_CHECKS,
  VALIDATOR_VERSION,
  assertConfigurationValid,
  assertValidModel,
  assertValidRelease,
  canonicalDigestInput,
  computeDigest,
  isCalendarDate,
  isUtcTimestamp,
  defaultConfiguration,
  findConstraintViolation,
  findModel,
} from "./modelContract";
import type { AduGeometrySource, AduModel, AduModelRelease } from "./types";

const release = releaseData as unknown as AduModelRelease;

const GEOMETRY_SOURCES: Record<string, AduGeometrySource> = {
  "models/geometry/adu-s-450@1": geometryS450 as unknown as AduGeometrySource,
  "models/geometry/adu-a-600@1": geometryA600 as unknown as AduGeometrySource,
  "models/geometry/adu-b-800@1": geometryB800 as unknown as AduGeometrySource,
};

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const modelOf = (id: string): AduModel => findModel(release, id, "1.0.0");

const sourceOf = (model: AduModel): AduGeometrySource =>
  GEOMETRY_SOURCES[model.geometry.source_ref];

const MODEL_IDS = ["adu-s-450", "adu-a-600", "adu-b-800"] as const;

/** Validates a mutated model against its unmodified geometry source. */
const expectModelRejected = async (
  model: AduModel,
  code: string,
  sourceFamilyId?: string,
): Promise<void> => {
  const pristine = modelOf(sourceFamilyId ?? model.model_id);

  await expect(assertValidModel(model, sourceOf(pristine))).rejects.toThrow(code);
};

describe("adu-model/1 release — valid state", () => {
  it("accepts the committed 2026.09.0 release in full", async () => {
    await expect(assertValidRelease(release, GEOMETRY_SOURCES)).resolves.toBeUndefined();
  });

  it("contains exactly the three PRODUCT-001 families at concept_only", () => {
    expect(release.models.map((model) => model.model_id).sort()).toEqual([...MODEL_IDS].sort());

    for (const model of release.models) {
      expect(model.schema).toBe("adu-model/1");
      expect(model.maturity).toBe("concept_only");
      expect(model.version).toBe("1.0.0");
      expect(model.validation.validator_version).toBe(VALIDATOR_VERSION);
      expect(model.validation.checks).toEqual(expect.arrayContaining([...REQUIRED_CONCEPT_ONLY_CHECKS]));
    }
  });

  it("keeps every family default configuration inside its published envelope", () => {
    for (const id of MODEL_IDS) {
      const model = modelOf(id);
      const values = defaultConfiguration(model);

      expect(() => assertConfigurationValid(model, values)).not.toThrow();

      const area = (values.footprint_width_ft as number) * (values.footprint_depth_ft as number);
      expect(area).toBeGreaterThanOrEqual(model.envelope.gross_area_sqft.min);
      expect(area).toBeLessThanOrEqual(model.envelope.gross_area_sqft.max);
    }
  });

  it("asserts owned provenance and declares no municipal or third-party geometry", () => {
    for (const model of release.models) {
      expect(model.provenance.origin).toBe("west_coast_kbp_original");
      expect(model.provenance.municipal_source_used).toBe(false);
      expect(model.provenance.third_party_geometry_used).toBe(false);
      expect(model.provenance.creation_record).toContain("PRODUCT-001");
      expect(sourceOf(model).origin).toBe("west_coast_kbp_original");
    }
  });

  it("binds no presentation image as a geometry source", () => {
    const serialized = JSON.stringify(release);

    expect(serialized).not.toContain("assets/images/");
    for (const model of release.models) {
      expect(model.geometry.source_ref.startsWith("models/geometry/")).toBe(true);
    }
  });

  it("makes no jurisdiction or permit claim anywhere in the release", () => {
    const serialized = JSON.stringify(release).toLowerCase();

    for (const term of [
      "sacramento",
      "elk grove",
      "citrus heights",
      "roseville",
      "placer",
      "preapproved",
      "permit ready",
      "permit-ready",
      "code compliant",
      "approved",
    ]) {
      expect(serialized).not.toContain(term);
    }
  });
});

describe("deterministic digests and replay stability", () => {
  it("recomputes every committed geometry digest exactly", async () => {
    for (const model of release.models) {
      await expect(computeDigest(sourceOf(model))).resolves.toBe(model.geometry.digest);
    }
  });

  it("recomputes the committed release digest exactly", async () => {
    await expect(computeDigest(release, ["release_digest"])).resolves.toBe(release.release_digest);
  });

  it("recomputes every derived-artifact digest from its specification", async () => {
    for (const model of release.models) {
      for (const artifact of model.derived_artifacts) {
        const { digest, ...spec } = artifact;
        await expect(computeDigest(spec)).resolves.toBe(digest);
      }
    }
  });

  it("produces a stable digest across repeated runs", async () => {
    const source = sourceOf(modelOf("adu-a-600"));
    const first = await computeDigest(source);
    const second = await computeDigest(source);

    expect(first).toBe(second);
  });

  it("is insensitive to key order but sensitive to value change", async () => {
    const source = sourceOf(modelOf("adu-s-450"));
    const reordered = Object.fromEntries(
      Object.entries(clone(source) as Record<string, unknown>).reverse(),
    );

    await expect(computeDigest(reordered)).resolves.toBe(await computeDigest(source));

    const mutated = clone(source);
    mutated.spaces[0].area_fraction = 0.61;
    expect(await computeDigest(mutated)).not.toBe(await computeDigest(source));
  });

  it("canonicalizes to identical input strings regardless of key order", () => {
    expect(canonicalDigestInput({ b: 1, a: 2 })).toBe(canonicalDigestInput({ a: 2, b: 1 }));
  });
});

describe("fail-closed rejection — structure and identity", () => {
  it("rejects an unknown model schema", async () => {
    const model = clone(modelOf("adu-s-450"));
    (model as { schema: string }).schema = "adu-model/2";

    await expectModelRejected(model, "unknown_model_schema");
  });

  it("rejects an unknown model identifier", async () => {
    const model = clone(modelOf("adu-s-450"));
    model.model_id = "municipal-plan-450";

    await expectModelRejected(model, "unknown_model_id", "adu-s-450");
  });

  it("rejects an unknown top-level field", async () => {
    const model = clone(modelOf("adu-s-450")) as AduModel & { permit_status?: string };
    model.permit_status = "approved";

    await expectModelRejected(model, "unknown_model_field");
  });

  it("rejects a missing required field", async () => {
    const model = clone(modelOf("adu-s-450")) as Partial<AduModel>;
    delete model.provenance;

    await expectModelRejected(model as AduModel, "missing_model_field");
  });

  it("rejects a mutable version alias", async () => {
    const model = clone(modelOf("adu-a-600"));
    model.version = "latest";

    await expectModelRejected(model, "mutable_version_alias");
  });

  it("rejects a non-semver version", async () => {
    const model = clone(modelOf("adu-a-600"));
    model.version = "1.0";

    await expectModelRejected(model, "invalid_model_version");
  });

  it("rejects an invalid maturity value", async () => {
    const model = clone(modelOf("adu-b-800"));
    (model as { maturity: string }).maturity = "permit_approved";

    await expectModelRejected(model, "invalid_maturity");
  });

  it("rejects maturity promotion above concept_only without separate evidence", async () => {
    const model = clone(modelOf("adu-b-800"));
    model.maturity = "engineering_reviewed";

    await expectModelRejected(model, "maturity_promotion_requires_separate_evidence");
  });

  it("rejects a non-UTC released_at", async () => {
    const model = clone(modelOf("adu-s-450"));
    model.released_at = "2026-08-07";

    await expectModelRejected(model, "invalid_released_at");
  });
});

describe("fail-closed rejection — units, parameters, and increments", () => {
  it("rejects an unknown unit", async () => {
    const model = clone(modelOf("adu-s-450"));
    (model.geometry.units as { length: string }).length = "m";

    await expectModelRejected(model, "unknown_unit");
  });

  it("rejects an unknown unit key", async () => {
    const model = clone(modelOf("adu-s-450"));
    (model.geometry.units as unknown as Record<string, string>).volume = "cuft";

    await expectModelRejected(model, "unknown_unit_key");
  });

  it("rejects a duplicate parameter key", async () => {
    const model = clone(modelOf("adu-a-600"));
    model.parameters.push(clone(model.parameters[0]));

    await expectModelRejected(model, "duplicate_parameter_key");
  });

  it("rejects a default that is off the increment grid", async () => {
    const model = clone(modelOf("adu-a-600"));
    const width = model.parameters.find((parameter) => parameter.key === "footprint_width_ft")!;
    width.default = 20.3;

    await expectModelRejected(model, "parameter_default_off_increment");
  });

  it("rejects a default outside the parameter range", async () => {
    const model = clone(modelOf("adu-s-450"));
    const width = model.parameters.find((parameter) => parameter.key === "footprint_width_ft")!;
    width.default = 30;

    await expectModelRejected(model, "parameter_default_out_of_range");
  });

  it("rejects an enum default outside its allow-list", async () => {
    const model = clone(modelOf("adu-s-450"));
    const roof = model.parameters.find((parameter) => parameter.key === "roof_form")!;
    roof.default = "mansard";

    await expectModelRejected(model, "parameter_default_not_allowed");
  });

  it("rejects a constraint referencing an unknown parameter", async () => {
    const model = clone(modelOf("adu-b-800"));
    model.constraints.push({
      rule_id: "MC-B800-999",
      if: { jurisdiction: "sacramento" },
      deny: { roof_form: ["gable"] },
      reason_code: "unknown_parameter_rule",
    });

    await expectModelRejected(model, "unknown_constraint_parameter");
  });

  it("rejects a duplicate constraint rule id", async () => {
    const model = clone(modelOf("adu-s-450"));
    model.constraints.push(clone(model.constraints[0]));

    await expectModelRejected(model, "duplicate_constraint_rule_id");
  });
});

describe("fail-closed rejection — geometry, artifacts, provenance, digests", () => {
  it("rejects a geometry digest mismatch", async () => {
    const model = clone(modelOf("adu-s-450"));
    model.geometry.digest = `sha256:${"0".repeat(64)}`;

    await expectModelRejected(model, "geometry_digest_mismatch");
  });

  it("rejects a malformed digest", async () => {
    const model = clone(modelOf("adu-s-450"));
    model.geometry.digest = "md5:abc";

    await expectModelRejected(model, "invalid_digest_format");
  });

  it("rejects a presentation image as a geometry source", async () => {
    const model = clone(modelOf("adu-a-600"));
    model.geometry.source_ref = "assets/images/adu-courtyard@1";

    await expectModelRejected(model, "presentation_asset_cannot_be_geometry_source");
  });

  it("rejects a mutable geometry alias", async () => {
    const model = clone(modelOf("adu-a-600"));
    model.geometry.source_ref = "latest";

    await expectModelRejected(model, "mutable_geometry_alias");
  });

  it("rejects missing derived artifacts", async () => {
    const model = clone(modelOf("adu-b-800"));
    model.derived_artifacts = [];

    await expectModelRejected(model, "missing_derived_artifacts");
  });

  it("rejects a missing derived-artifact kind", async () => {
    const model = clone(modelOf("adu-b-800"));
    model.derived_artifacts = model.derived_artifacts.filter(
      (artifact) => artifact.kind !== "render",
    );

    await expectModelRejected(model, "missing_derived_artifact_kind");
  });

  it("rejects a derived artifact not bound to the model geometry", async () => {
    const model = clone(modelOf("adu-s-450"));
    model.derived_artifacts[0].source_binding = "models/geometry/adu-b-800@1";

    await expectModelRejected(model, "derived_artifact_not_bound_to_geometry");
  });

  it("rejects a derived-artifact digest mismatch", async () => {
    const model = clone(modelOf("adu-s-450"));
    model.derived_artifacts[0].contents.push("tampered");

    await expectModelRejected(model, "derived_artifact_digest_mismatch");
  });

  it("rejects an unmarked conceptual render", async () => {
    const model = clone(modelOf("adu-s-450"));
    const render = model.derived_artifacts.find((artifact) => artifact.kind === "render")!;
    render.conceptual = false;

    await expectModelRejected(model, "render_artifact_not_marked_conceptual");
  });

  it("rejects non-owned provenance", async () => {
    const model = clone(modelOf("adu-b-800"));
    (model.provenance as { origin: string }).origin = "municipal_program";

    await expectModelRejected(model, "non_owned_provenance");
  });

  it("rejects a declared municipal geometry source", async () => {
    const model = clone(modelOf("adu-b-800"));
    (model.provenance as { municipal_source_used: boolean }).municipal_source_used = true;

    await expectModelRejected(model, "municipal_or_third_party_geometry_declared");
  });

  it("rejects incomplete provenance", async () => {
    const model = clone(modelOf("adu-a-600"));
    model.provenance.attestation = "";

    await expectModelRejected(model, "incomplete_provenance");
  });

  it("rejects a missing required validation check", async () => {
    const model = clone(modelOf("adu-a-600"));
    model.validation.checks = model.validation.checks.filter(
      (check) => check !== "replay_stability",
    );

    await expectModelRejected(model, "missing_required_validation_check");
  });

  it("rejects a geometry source whose space fractions do not sum to one", async () => {
    const model = modelOf("adu-s-450");
    const source = clone(sourceOf(model));
    source.spaces[0].area_fraction = 0.9;

    await expect(assertValidModel(model, source)).rejects.toThrow(
      "space_area_fractions_do_not_sum_to_one",
    );
  });

  it("rejects a geometry source bound to a different model", async () => {
    const model = modelOf("adu-s-450");
    const source = clone(sourceOf(modelOf("adu-b-800")));

    await expect(assertValidModel(model, source)).rejects.toThrow("geometry_model_mismatch");
  });
});

describe("fail-closed rejection — configuration evaluation", () => {
  it("rejects an unknown parameter key with no silent drop", () => {
    const model = modelOf("adu-a-600");
    const values = { ...defaultConfiguration(model), jurisdiction: "sacramento" };

    expect(() => assertConfigurationValid(model, values)).toThrow("unknown_parameter_key");
  });

  it("rejects a missing parameter value with no inferred default", () => {
    const model = modelOf("adu-a-600");
    const values = defaultConfiguration(model);
    delete values.roof_form;

    expect(() => assertConfigurationValid(model, values)).toThrow("missing_parameter_value");
  });

  it("rejects an out-of-range dimension without clamping", () => {
    const model = modelOf("adu-s-450");
    const values = { ...defaultConfiguration(model), footprint_width_ft: 24 };

    expect(() => assertConfigurationValid(model, values)).toThrow("parameter_value_out_of_range");
  });

  it("rejects an off-increment dimension", () => {
    const model = modelOf("adu-s-450");
    const values = { ...defaultConfiguration(model), footprint_width_ft: 18.25 };

    expect(() => assertConfigurationValid(model, values)).toThrow("parameter_value_off_increment");
  });

  it("rejects in-range dimensions whose product leaves the gross-area envelope", () => {
    const model = modelOf("adu-s-450");
    const values = {
      ...defaultConfiguration(model),
      footprint_width_ft: 20,
      footprint_depth_ft: 28,
    };

    // 20 x 28 = 560 sq ft; both dimensions are individually legal, the area is not.
    expect(values.footprint_width_ft * values.footprint_depth_ft).toBe(560);
    expect(() => assertConfigurationValid(model, values)).toThrow("gross_area_out_of_envelope");
  });

  it("rejects the low corner of the dimension ranges as under-area", () => {
    const model = modelOf("adu-s-450");
    const values = {
      ...defaultConfiguration(model),
      footprint_width_ft: 16,
      footprint_depth_ft: 22,
    };

    expect(() => assertConfigurationValid(model, values)).toThrow("gross_area_out_of_envelope");
  });

  it("rejects a value outside an enum allow-list", () => {
    const model = modelOf("adu-b-800");
    const values = { ...defaultConfiguration(model), roof_form: "shed" };

    expect(() => assertConfigurationValid(model, values)).toThrow("parameter_value_not_allowed");
  });

  it("enforces the shed-roof constraint on the compact studio", () => {
    const model = modelOf("adu-s-450");
    const values = {
      ...defaultConfiguration(model),
      roof_form: "shed",
      window_package: "tall",
    };

    expect(findConstraintViolation(model, values)?.rule_id).toBe("MC-S450-001");
    expect(() => assertConfigurationValid(model, values)).toThrow(
      "shed_roof_excludes_tall_window_package",
    );
  });

  it("enforces the hip-roof constraint on the two-bedroom family", () => {
    const model = modelOf("adu-b-800");
    const values = {
      ...defaultConfiguration(model),
      roof_form: "hip",
      window_package: "clerestory",
    };

    expect(() => assertConfigurationValid(model, values)).toThrow(
      "hip_roof_excludes_clerestory_package",
    );
  });

  it("allows a permitted non-default combination", () => {
    const model = modelOf("adu-a-600");
    const values = {
      ...defaultConfiguration(model),
      footprint_width_ft: 22,
      footprint_depth_ft: 27,
      roof_form: "shed",
      window_package: "tall",
    };

    expect(() => assertConfigurationValid(model, values)).not.toThrow();
  });
});

describe("fail-closed rejection — release level", () => {
  it("rejects a release digest mismatch", async () => {
    const tampered = clone(release);
    tampered.models[0].title = "Renamed";

    await expect(assertValidRelease(tampered, GEOMETRY_SOURCES)).rejects.toThrow();
  });

  it("rejects an unknown release schema", async () => {
    const tampered = clone(release);
    (tampered as { schema: string }).schema = "adu-model-release/2";

    await expect(assertValidRelease(tampered, GEOMETRY_SOURCES)).rejects.toThrow(
      "unknown_release_schema",
    );
  });

  it("rejects a mutable release alias", async () => {
    const tampered = clone(release);
    tampered.release_version = "latest";

    await expect(assertValidRelease(tampered, GEOMETRY_SOURCES)).rejects.toThrow(
      "mutable_release_alias",
    );
  });

  it("rejects a duplicate model release", async () => {
    const tampered = clone(release);
    tampered.models.push(clone(tampered.models[0]));

    await expect(assertValidRelease(tampered, GEOMETRY_SOURCES)).rejects.toThrow(
      "duplicate_model_release",
    );
  });

  it("rejects an unresolvable geometry source ref", async () => {
    const tampered = clone(release);
    tampered.models[0].geometry.source_ref = "models/geometry/adu-x-999";

    await expect(assertValidRelease(tampered, GEOMETRY_SOURCES)).rejects.toThrow(
      "unknown_geometry_source_ref",
    );
  });

  it("rejects an unknown model lookup", () => {
    expect(() => findModel(release, "adu-s-450", "9.9.9")).toThrow("unknown_model_release");
    expect(() => findModel(release, "adu-x-999", "1.0.0")).toThrow("unknown_model_release");
  });
});

/**
 * Re-seals a release so every geometry, derived-artifact and release digest is
 * internally consistent again.
 *
 * Every test in the two blocks below mutates a source or model and then
 * re-seals before asserting. That is the point: a rejection proves the schema,
 * cross-binding or envelope rule fired on its own merits, and not merely that
 * a digest stopped matching. Without re-sealing, these tests would pass for
 * the wrong reason.
 */
async function seal(
  models: AduModel[],
  sources: Record<string, AduGeometrySource>,
): Promise<AduModelRelease> {
  for (const model of models) {
    for (const artifact of model.derived_artifacts) {
      artifact.digest = await computeDigest(artifact, ["digest"]);
    }

    const source = sources[model.geometry.source_ref];
    if (source) {
      model.geometry.digest = await computeDigest(source);
    }
  }

  const core = {
    schema: release.schema,
    release_version: release.release_version,
    effective_from: release.effective_from,
    models,
  };

  return { ...core, release_digest: await computeDigest(core) } as AduModelRelease;
}

const freshModels = (): AduModel[] => clone(release.models);
const freshSources = (): Record<string, AduGeometrySource> => clone(GEOMETRY_SOURCES);

/** Mutates the adu-s-450 geometry source, re-seals, and returns the pair. */
async function sealedWithSourceMutation(
  mutate: (source: AduGeometrySource) => void,
): Promise<[AduModelRelease, Record<string, AduGeometrySource>]> {
  const models = freshModels();
  const sources = freshSources();
  mutate(sources["models/geometry/adu-s-450@1"]);

  return [await seal(models, sources), sources];
}

describe("F-1 — unknown-key enforcement across the whole object graph", () => {
  it("re-sealing an unmutated release still validates (control)", async () => {
    const models = freshModels();
    const sources = freshSources();
    const resealed = await seal(models, sources);

    expect(resealed.release_digest).toBe(release.release_digest);
    await expect(assertValidRelease(resealed, sources)).resolves.toBeUndefined();
  });

  it("rejects an unknown key on a geometry source even with digests recomputed", async () => {
    const [tampered, sources] = await sealedWithSourceMutation((source) => {
      (source as unknown as Record<string, unknown>).municipal_plan_id = "SAC-ADU-460-2022";
    });

    // The digest is valid — only the schema rule can reject this.
    await expect(computeDigest(sources["models/geometry/adu-s-450@1"])).resolves.toBe(
      tampered.models.find((model) => model.model_id === "adu-s-450")!.geometry.digest,
    );
    await expect(assertValidRelease(tampered, sources)).rejects.toThrow("unknown_geometry_field");
  });

  it("rejects a municipal source_url smuggled into geometry openings", async () => {
    const [tampered, sources] = await sealedWithSourceMutation((source) => {
      (source.openings as Record<string, unknown>).source_url =
        "https://adu.cityofsacramento.org/Shelf-ready-plans";
    });

    await expect(assertValidRelease(tampered, sources)).rejects.toThrow("unknown_geometry_field");
  });

  it("rejects an unknown key on a nested geometry record", async () => {
    const [tampered, sources] = await sealedWithSourceMutation((source) => {
      (source.massing as Record<string, unknown>).traced_from = "permit_set_sheet_A2";
    });

    await expect(assertValidRelease(tampered, sources)).rejects.toThrow("unknown_geometry_field");
  });

  it("rejects an unknown key on a geometry space entry", async () => {
    const [tampered, sources] = await sealedWithSourceMutation((source) => {
      (source.spaces[0] as unknown as Record<string, unknown>).copied_from = "sheet_A2";
    });

    await expect(assertValidRelease(tampered, sources)).rejects.toThrow("unknown_geometry_field");
  });

  it("rejects a missing geometry field", async () => {
    const [tampered, sources] = await sealedWithSourceMutation((source) => {
      delete (source as Partial<AduGeometrySource>).structural_grid;
    });

    await expect(assertValidRelease(tampered, sources)).rejects.toThrow("missing_geometry_field");
  });

  it("rejects a duplicate space id", async () => {
    const [tampered, sources] = await sealedWithSourceMutation((source) => {
      source.spaces[1].space_id = source.spaces[0].space_id;
      source.spaces[0].area_fraction = 0.37;
      source.spaces[1].area_fraction = 0.37;
    });

    await expect(assertValidRelease(tampered, sources)).rejects.toThrow("duplicate_space_id");
  });

  it("rejects an unknown key on the release object with digests recomputed", async () => {
    const models = freshModels();
    const sources = freshSources();
    const sealed = await seal(models, sources);
    const tampered = {
      ...sealed,
      source_url: "https://drive.google.com/drive/folders/example",
    } as unknown as AduModelRelease;

    await expect(assertValidRelease(tampered, sources)).rejects.toThrow("unknown_release_field");
  });

  it("rejects a missing release field", async () => {
    const models = freshModels();
    const sources = freshSources();
    const sealed = await seal(models, sources) as Partial<AduModelRelease>;
    delete sealed.effective_from;

    await expect(assertValidRelease(sealed as AduModelRelease, sources)).rejects.toThrow(
      "missing_release_field",
    );
  });

  it("rejects an unknown key on the model geometry binding", async () => {
    const models = freshModels();
    const sources = freshSources();
    (models[0].geometry as unknown as Record<string, unknown>).municipal_plan_ref = "SAC-460";
    const tampered = await seal(models, sources);

    await expect(assertValidRelease(tampered, sources)).rejects.toThrow("unknown_model_field");
  });

  it("rejects an unknown key on provenance, a parameter, and a derived artifact", async () => {
    for (const mutate of [
      (model: AduModel) => {
        (model.provenance as unknown as Record<string, unknown>).licensed_from = "A Plus";
      },
      (model: AduModel) => {
        (model.parameters[0] as unknown as Record<string, unknown>).traced_from = "sheet_A2";
      },
      (model: AduModel) => {
        (model.derived_artifacts[0] as unknown as Record<string, unknown>).scanned_from = "pdf";
      },
    ]) {
      const models = freshModels();
      const sources = freshSources();
      mutate(models[0]);

      await expect(assertValidRelease(await seal(models, sources), sources)).rejects.toThrow(
        "unknown_model_field",
      );
    }
  });

  it("rejects an unknown key on the envelope invariants", async () => {
    const models = freshModels();
    const sources = freshSources();
    (models[0].envelope.invariants as Record<string, unknown>).permit_number = "B-2025-1187";

    await expect(assertValidRelease(await seal(models, sources), sources)).rejects.toThrow(
      "unknown_model_field",
    );
  });
});

describe("F-2 — canonical reference configuration and geometry cross-binding", () => {
  it("rejects an out-of-envelope reference configuration with digests recomputed", async () => {
    const [tampered, sources] = await sealedWithSourceMutation((source) => {
      source.reference_configuration.footprint_width_ft = 999;
    });

    await expect(assertValidRelease(tampered, sources)).rejects.toThrow(
      "parameter_value_out_of_range",
    );
  });

  it("rejects an unknown parameter in the reference configuration", async () => {
    const [tampered, sources] = await sealedWithSourceMutation((source) => {
      source.reference_configuration.jurisdiction = "sacramento";
    });

    await expect(assertValidRelease(tampered, sources)).rejects.toThrow(
      "unknown_reference_configuration_key",
    );
  });

  it("rejects a missing parameter in the reference configuration", async () => {
    const [tampered, sources] = await sealedWithSourceMutation((source) => {
      delete source.reference_configuration.roof_form;
    });

    await expect(assertValidRelease(tampered, sources)).rejects.toThrow(
      "missing_reference_configuration_key",
    );
  });

  it("rejects a reference configuration that is valid but is not the published default", async () => {
    const model = modelOf("adu-s-450");
    const width = model.parameters.find((parameter) => parameter.key === "footprint_width_ft")!;
    const alternative = 19;

    // 19 x 25 = 475 sq ft — inside the envelope and on the increment grid,
    // so only the default-binding rule can reject it.
    expect(alternative).not.toBe(width.default);
    expect(alternative * 25).toBeGreaterThanOrEqual(model.envelope.gross_area_sqft.min);
    expect(alternative * 25).toBeLessThanOrEqual(model.envelope.gross_area_sqft.max);

    const [tampered, sources] = await sealedWithSourceMutation((source) => {
      source.reference_configuration.footprint_width_ft = alternative;
    });

    await expect(assertValidRelease(tampered, sources)).rejects.toThrow(
      "reference_configuration_does_not_match_default",
    );
  });

  it("rejects a reference configuration that violates a model constraint", async () => {
    const [tampered, sources] = await sealedWithSourceMutation((source) => {
      source.reference_configuration.layout_variant = "alcove";
      source.reference_configuration.interior_tier = "comfort";
    });

    await expect(assertValidRelease(tampered, sources)).rejects.toThrow();
  });

  it("rejects a geometry coordinate system that disagrees with the model binding", async () => {
    const [tampered, sources] = await sealedWithSourceMutation((source) => {
      source.coordinate_system.origin = "rear_right_exterior_wall_corner";
    });

    await expect(assertValidRelease(tampered, sources)).rejects.toThrow(
      "geometry_coordinate_system_mismatch",
    );
  });

  it("rejects a roof form the geometry source cannot build", async () => {
    const [tampered, sources] = await sealedWithSourceMutation((source) => {
      delete (source.massing as { roof_pitch_rise_per_12: Record<string, unknown> })
        .roof_pitch_rise_per_12.gable;
    });

    await expect(assertValidRelease(tampered, sources)).rejects.toThrow(
      "roof_form_missing_geometry_definition",
    );
  });

  it("rejects a window package the geometry source cannot build", async () => {
    const [tampered, sources] = await sealedWithSourceMutation((source) => {
      delete (source.openings as { window_packages: Record<string, unknown> }).window_packages
        .tall;
    });

    await expect(assertValidRelease(tampered, sources)).rejects.toThrow(
      "window_package_missing_geometry_definition",
    );
  });

  it("rejects envelope invariants that disagree with the declared program", async () => {
    const models = freshModels();
    const sources = freshSources();
    (models[0].envelope.invariants as Record<string, unknown>).bedrooms = 3;

    await expect(assertValidRelease(await seal(models, sources), sources)).rejects.toThrow(
      "invariants_disagree_with_program",
    );
  });
});

/**
 * Re-seals a release while overriding release-level scalars. Changing
 * `effective_from` changes the release digest, so every date test below is
 * sealed with a *correct* digest first. A rejection therefore proves the
 * calendar rule fired, never a digest mismatch.
 */
async function sealedWithReleaseOverride(
  overrides: Partial<Pick<AduModelRelease, "release_version" | "effective_from">>,
): Promise<[AduModelRelease, Record<string, AduGeometrySource>]> {
  const models = freshModels();
  const sources = freshSources();

  for (const model of models) {
    for (const artifact of model.derived_artifacts) {
      artifact.digest = await computeDigest(artifact, ["digest"]);
    }

    const source = sources[model.geometry.source_ref];
    if (source) {
      model.geometry.digest = await computeDigest(source);
    }
  }

  const core = {
    schema: release.schema,
    release_version: overrides.release_version ?? release.release_version,
    effective_from: overrides.effective_from ?? release.effective_from,
    models,
  };

  return [{ ...core, release_digest: await computeDigest(core) } as AduModelRelease, sources];
}

describe("F-3 — strict Gregorian calendar validation", () => {
  it("rejects a February 29 in a non-leap year, with the release digest valid", async () => {
    const [tampered, sources] = await sealedWithReleaseOverride({
      effective_from: "2026-02-29",
    });

    // Prove the digest is correct, so only the calendar rule can reject this.
    await expect(computeDigest(tampered, ["release_digest"])).resolves.toBe(
      tampered.release_digest,
    );
    // Date.parse would have normalised this to 2026-03-01 and accepted it.
    expect(Number.isNaN(Date.parse("2026-02-29T00:00:00Z"))).toBe(false);

    await expect(assertValidRelease(tampered, sources)).rejects.toThrow("invalid_effective_from");
  });

  it("rejects every impossible day that ECMAScript would silently normalise", async () => {
    for (const impossible of [
      "2026-02-30",
      "2026-02-31",
      "2026-04-31",
      "2026-06-31",
      "2026-09-31",
      "2026-11-31",
      "2025-02-29",
      "2100-02-29",
    ]) {
      // Each of these parses cleanly under Date.parse — that is the trap.
      expect(Number.isNaN(Date.parse(`${impossible}T00:00:00Z`))).toBe(false);

      const [tampered, sources] = await sealedWithReleaseOverride({
        effective_from: impossible,
      });

      await expect(assertValidRelease(tampered, sources)).rejects.toThrow(
        "invalid_effective_from",
      );
    }
  });

  it("still rejects a malformed or out-of-range date", async () => {
    for (const malformed of ["September 2026", "2026-13-45", "2026-13-01", "2026-00-10", "2026-1-1", ""]) {
      const [tampered, sources] = await sealedWithReleaseOverride({
        effective_from: malformed,
      });

      await expect(assertValidRelease(tampered, sources)).rejects.toThrow(
        "invalid_effective_from",
      );
    }
  });

  it("accepts real dates including a genuine leap day", async () => {
    for (const valid of ["2026-09-01", "2024-02-29", "2026-02-28", "2000-02-29", "2026-12-31"]) {
      const [resealed, sources] = await sealedWithReleaseOverride({ effective_from: valid });

      await expect(assertValidRelease(resealed, sources)).resolves.toBeUndefined();
    }
  });

  it("applies the same strictness to released_at", async () => {
    for (const impossible of [
      "2026-02-29T00:00:00Z",
      "2026-04-31T00:00:00Z",
      "2026-08-07T24:00:00Z",
      "2026-08-07T00:60:00Z",
      "2026-08-07T00:00:60Z",
    ]) {
      const models = freshModels();
      const sources = freshSources();
      models[0].released_at = impossible;

      await expect(assertValidRelease(await seal(models, sources), sources)).rejects.toThrow(
        "invalid_released_at",
      );
    }
  });

  it("exposes the predicates directly for reuse", () => {
    expect(isCalendarDate("2024-02-29")).toBe(true);
    expect(isCalendarDate("2026-02-29")).toBe(false);
    expect(isCalendarDate("2026-04-31")).toBe(false);
    expect(isCalendarDate(20260901)).toBe(false);

    expect(isUtcTimestamp("2026-08-07T00:00:00Z")).toBe(true);
    expect(isUtcTimestamp("2026-02-31T00:00:00Z")).toBe(false);
    expect(isUtcTimestamp("2026-08-07")).toBe(false);
  });
});

describe("release version validation", () => {
  it("rejects a malformed release version", async () => {
    const [tampered, sources] = await sealedWithReleaseOverride({ release_version: "v2" });

    await expect(assertValidRelease(tampered, sources)).rejects.toThrow("invalid_release_version");
  });

  it("accepts the committed release version and effective date", () => {
    expect(release.release_version).toBe("2026.09.0");
    expect(release.effective_from).toBe("2026-09-01");
    expect(isCalendarDate(release.effective_from)).toBe(true);
  });
});
