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
