import { describe, expect, it } from "vitest";

import modelReleaseData from "../../data/studio/models/releases/2026.09.0.json";
import jurisdictionReleaseData from "../../data/studio/jurisdictions/releases/2026.09.0.json";
import syntheticProfileData from "../../data/studio/jurisdictions/fixtures/synthetic-reference-profile.json";

import { computeDigest, defaultConfiguration, findModel } from "./modelContract";
import {
  DISCLAIMER,
  DISCLAIMER_VERSION,
  EVALUATOR_VERSION,
  FORBIDDEN_CLAIM_VOCABULARY,
  TERMINAL_STATUSES,
  assertValidJurisdictionProfile,
  assertValidJurisdictionRelease,
  canonicalEvaluation,
  deriveModelSubjects,
  evaluateJurisdiction,
} from "./jurisdictionContract";
import type {
  EvaluationInput,
  JurisdictionProfile,
  JurisdictionProfileRelease,
  SiteFacts,
  TerminalStatus,
} from "./jurisdictionContract";
import type { AduModel, AduModelRelease } from "./types";

const modelRelease = modelReleaseData as unknown as AduModelRelease;
const jurisdictionRelease = jurisdictionReleaseData as unknown as JurisdictionProfileRelease;
const syntheticProfile = syntheticProfileData as unknown as JurisdictionProfile;

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const model = (id = "adu-a-600"): AduModel => findModel(modelRelease, id, "1.0.0");

const SATISFYING_FACTS: SiteFacts = {
  schema: "jurisdiction-site-facts/1",
  site_facts_version: "1.0.0",
  values: { lot_area_sqft: 6000, rear_setback_ft: 6 },
};

async function inputFor(overrides: Partial<EvaluationInput> = {}): Promise<EvaluationInput> {
  const bound = overrides.model ?? model();
  const configuration = overrides.configuration ?? defaultConfiguration(bound);
  const profile = overrides.profile ?? clone(syntheticProfile);
  const siteFacts =
    overrides.site_facts === undefined ? clone(SATISFYING_FACTS) : overrides.site_facts;

  return {
    model: bound,
    configuration,
    configuration_hash: overrides.configuration_hash ?? (await computeDigest(configuration)),
    profile,
    profile_digest: overrides.profile_digest ?? (await computeDigest(profile)),
    site_facts: siteFacts,
    site_facts_digest:
      overrides.site_facts_digest === undefined
        ? siteFacts === null
          ? null
          : await computeDigest(siteFacts)
        : overrides.site_facts_digest,
    as_of: overrides.as_of ?? "2026-08-07",
  };
}

/** Mutates the profile then re-seals its digest, so rejections prove semantics. */
async function resealedProfileInput(
  mutate: (profile: JurisdictionProfile) => void,
  overrides: Partial<EvaluationInput> = {},
): Promise<EvaluationInput> {
  const profile = clone(syntheticProfile);
  mutate(profile);

  return inputFor({ ...overrides, profile, profile_digest: await computeDigest(profile) });
}

describe("release and fixture posture", () => {
  it("adopts zero jurisdiction profiles", async () => {
    expect(jurisdictionRelease.adopted_profiles).toEqual([]);
    await expect(assertValidJurisdictionRelease(jurisdictionRelease)).resolves.toBeUndefined();
  });

  it("recomputes the committed release digest exactly", async () => {
    await expect(computeDigest(jurisdictionRelease, ["release_digest"])).resolves.toBe(
      jurisdictionRelease.release_digest,
    );
  });

  it("marks the fixture explicitly synthetic, test-only, and never adopted", () => {
    expect(syntheticProfile.adoption.synthetic).toBe(true);
    expect(syntheticProfile.adoption.status).toBe("not_adopted");
    expect(syntheticProfile.adoption.notice).toContain("Synthetic test-only fixture");
    expect(syntheticProfile.adoption.notice).toContain("Requires official source verification.");
    expect(() => assertValidJurisdictionProfile(syntheticProfile)).not.toThrow();
  });

  it("names no real jurisdiction and cites no municipal source", () => {
    const serialized = JSON.stringify([jurisdictionRelease, syntheticProfile]).toLowerCase();

    for (const name of [
      "sacramento", "elk grove", "citrus heights", "roseville", "rocklin", "lincoln",
      "placer", "folsom", "rancho cordova", "california", ".gov", "http://", "https://",
    ]) {
      expect(serialized).not.toContain(name);
    }
  });

  it("keeps forbidden claim vocabulary out of statuses and release data", () => {
    for (const status of TERMINAL_STATUSES) {
      for (const term of FORBIDDEN_CLAIM_VOCABULARY) {
        expect(status.toLowerCase()).not.toContain(term);
      }
    }

    const releaseText = JSON.stringify(jurisdictionRelease).toLowerCase();
    for (const term of FORBIDDEN_CLAIM_VOCABULARY) {
      expect(releaseText).not.toContain(term);
    }
  });

  it("rejects a synthetic profile placed into an adopted release", async () => {
    const tampered = clone(jurisdictionRelease);
    tampered.adopted_profiles = [clone(syntheticProfile)];
    tampered.release_digest = await computeDigest(tampered, ["release_digest"]);

    await expect(assertValidJurisdictionRelease(tampered)).rejects.toThrow(
      "synthetic_profile_in_release",
    );
  });
});

describe("terminal statuses — every one reachable", () => {
  const cases: {
    name: string;
    status: TerminalStatus;
    build: () => Promise<EvaluationInput>;
  }[] = [
    {
      name: "reference_consistent when every applicable predicate is satisfied",
      status: "reference_consistent",
      build: () => inputFor(),
    },
    {
      name: "reference_conflict when a site fact violates a predicate",
      status: "reference_conflict",
      build: () =>
        inputFor({
          site_facts: {
            schema: "jurisdiction-site-facts/1",
            site_facts_version: "1.0.0",
            values: { lot_area_sqft: 1000, rear_setback_ft: 6 },
          },
        }),
    },
    {
      name: "blocked_missing_facts when a required site fact is absent",
      status: "blocked_missing_facts",
      build: () => inputFor({ site_facts: null }),
    },
    {
      name: "blocked_stale_profile when as_of is past the effective window",
      status: "blocked_stale_profile",
      build: () => inputFor({ as_of: "2027-01-01" }),
    },
    {
      name: "not_evaluated when the profile digest does not match",
      status: "not_evaluated",
      build: () => inputFor({ profile_digest: `sha256:${"0".repeat(64)}` }),
    },
  ];

  for (const testCase of cases) {
    it(testCase.name, async () => {
      const evaluation = await evaluateJurisdiction(await testCase.build());

      expect(evaluation.status).toBe(testCase.status);
      expect(TERMINAL_STATUSES).toContain(evaluation.status);
    });
  }

  it("emits only allowed statuses across every case", async () => {
    for (const testCase of cases) {
      const evaluation = await evaluateJurisdiction(await testCase.build());
      expect(TERMINAL_STATUSES).toContain(evaluation.status);
    }
  });
});

describe("fail-closed classes", () => {
  it("blocks a stale review currency state", async () => {
    const input = await resealedProfileInput((profile) => {
      profile.review.currency_state = "stale";
    });

    expect((await evaluateJurisdiction(input)).status).toBe("blocked_stale_profile");
  });

  it("blocks when the profile declares a blocking limitation", async () => {
    const input = await resealedProfileInput((profile) => {
      profile.limitations.blocking = true;
      profile.limitations.inaccessible_evidence = ["synthetic source unavailable"];
    });

    expect((await evaluateJurisdiction(input)).status).toBe("blocked_stale_profile");
  });

  it("blocks when review currency has expired even inside the effective window", async () => {
    const input = await resealedProfileInput((profile) => {
      profile.review.currency_valid_to = "2026-06-30";
    });

    expect((await evaluateJurisdiction(input)).status).toBe("blocked_stale_profile");
  });

  it("does not evaluate an unknown unit, with the digest resealed", async () => {
    const input = await resealedProfileInput((profile) => {
      profile.requirements[0].unit = "meters";
    });

    await expect(computeDigest(input.profile)).resolves.toBe(input.profile_digest);

    const evaluation = await evaluateJurisdiction(input);
    expect(evaluation.status).toBe("not_evaluated");
    expect(evaluation.reason_code).toBe("unknown_unit");
  });

  it("does not evaluate an unknown identifier", async () => {
    const input = await resealedProfileInput((profile) => {
      profile.jurisdiction_id = "Not A Valid Id";
    });

    expect((await evaluateJurisdiction(input)).reason_code).toBe("unknown_jurisdiction_id");
  });

  it("does not evaluate a non-deterministic predicate", async () => {
    const input = await resealedProfileInput((profile) => {
      profile.requirements[0].deterministic = false;
    });

    expect((await evaluateJurisdiction(input)).reason_code).toBe("non_deterministic_predicate");
  });

  it("does not evaluate a requirement needing professional interpretation", async () => {
    const input = await resealedProfileInput((profile) => {
      profile.requirements[0].requires_professional_interpretation = true;
    });

    expect((await evaluateJurisdiction(input)).reason_code).toBe(
      "requires_professional_interpretation",
    );
  });

  it("does not evaluate a mutable profile alias", async () => {
    const input = await resealedProfileInput((profile) => {
      profile.profile_version = "latest";
    });

    expect((await evaluateJurisdiction(input)).reason_code).toBe("mutable_profile_alias");
  });

  it("does not evaluate a mutable site-facts alias", async () => {
    const input = await inputFor({
      site_facts: {
        schema: "jurisdiction-site-facts/1",
        site_facts_version: "latest",
        values: { lot_area_sqft: 6000, rear_setback_ft: 6 },
      },
    });

    expect((await evaluateJurisdiction(input)).reason_code).toBe("mutable_site_facts_alias");
  });

  it("does not evaluate an unknown key anywhere in the profile graph", async () => {
    for (const mutate of [
      (profile: JurisdictionProfile) => {
        (profile as unknown as Record<string, unknown>).municipal_plan_id = "SAC-460";
      },
      (profile: JurisdictionProfile) => {
        (profile.requirements[0] as unknown as Record<string, unknown>).traced_from = "sheet_A2";
      },
      (profile: JurisdictionProfile) => {
        (profile.sources[0] as unknown as Record<string, unknown>).drawing_ref = "A2";
      },
      (profile: JurisdictionProfile) => {
        (profile.limitations as unknown as Record<string, unknown>).plan_geometry = {};
      },
    ]) {
      const input = await resealedProfileInput(mutate);
      const evaluation = await evaluateJurisdiction(input);

      expect(evaluation.status).toBe("not_evaluated");
      expect(evaluation.reason_code).toBe("unknown_profile_field");
    }
  });

  it("does not evaluate an unknown model subject", async () => {
    const input = await resealedProfileInput((profile) => {
      profile.requirements[0].subject = "setback_from_creek_ft";
    });

    expect((await evaluateJurisdiction(input)).reason_code).toBe("unknown_model_subject");
  });

  it("does not evaluate a mutable model version alias", async () => {
    const bound = clone(model());
    bound.version = "latest";

    const evaluation = await evaluateJurisdiction(await inputFor({ model: bound }));

    expect(evaluation.status).toBe("not_evaluated");
    expect(evaluation.reason_code).toBe("mutable_version_alias");
  });

  it("does not evaluate an invalid model configuration even when re-sealed", async () => {
    const configuration = {
      ...defaultConfiguration(model()),
      unrecognized_parameter: "foreign",
    };

    const evaluation = await evaluateJurisdiction(
      await inputFor({
        configuration,
        configuration_hash: await computeDigest(configuration),
      }),
    );

    expect(evaluation.status).toBe("not_evaluated");
    expect(evaluation.reason_code).toBe("unknown_parameter_key");
  });

  it("does not accept an arbitrary configuration hash", async () => {
    const evaluation = await evaluateJurisdiction(
      await inputFor({ configuration_hash: `sha256:${"a".repeat(64)}` }),
    );

    expect(evaluation.status).toBe("not_evaluated");
    expect(evaluation.reason_code).toBe("configuration_hash_mismatch");
  });

  it("does not evaluate site facts whose digest does not match", async () => {
    const evaluation = await evaluateJurisdiction(
      await inputFor({ site_facts_digest: `sha256:${"a".repeat(64)}` }),
    );

    expect(evaluation.status).toBe("not_evaluated");
    expect(evaluation.reason_code).toBe("site_facts_digest_mismatch");
  });

  it("does not ignore an unknown site-fact identifier after re-sealing", async () => {
    const siteFacts = {
      ...clone(SATISFYING_FACTS),
      values: {
        ...(clone(SATISFYING_FACTS)?.values ?? {}),
        unrecognized_site_fact: 1,
      },
    } as SiteFacts;

    const evaluation = await evaluateJurisdiction(
      await inputFor({
        site_facts: siteFacts,
        site_facts_digest: await computeDigest(siteFacts),
      }),
    );

    expect(evaluation.status).toBe("not_evaluated");
    expect(evaluation.reason_code).toBe("unknown_site_fact_identifier");
  });

  it("returns not_evaluated instead of throwing for a malformed site-facts version", async () => {
    const siteFacts = {
      schema: "jurisdiction-site-facts/1",
      site_facts_version: 1,
      values: { lot_area_sqft: 6000, rear_setback_ft: 6 },
    } as unknown as SiteFacts;

    await expect(
      evaluateJurisdiction(
        await inputFor({
          site_facts: siteFacts,
          site_facts_digest: await computeDigest(siteFacts),
        }),
      ),
    ).resolves.toMatchObject({
      status: "not_evaluated",
      reason_code: "invalid_site_facts_version",
    });
  });

  it("blocks inaccessible evidence even when a profile forgot its blocking flag", async () => {
    const input = await resealedProfileInput((profile) => {
      profile.sources[0].accessible = false;
      profile.limitations.blocking = false;
    });

    expect(await evaluateJurisdiction(input)).toMatchObject({
      status: "blocked_stale_profile",
      reason_code: "profile_outside_currency_window",
    });
  });

  it("does not evaluate an impossible calendar date in the profile", async () => {
    const input = await resealedProfileInput((profile) => {
      profile.effective_window.valid_from = "2026-02-29";
    });

    expect((await evaluateJurisdiction(input)).reason_code).toBe("invalid_effective_window_date");
  });

  it("does not evaluate an impossible as_of date", async () => {
    const evaluation = await evaluateJurisdiction(await inputFor({ as_of: "2026-04-31" }));

    expect(evaluation.status).toBe("not_evaluated");
    expect(evaluation.reason_code).toBe("invalid_as_of_date");
  });

  it("does not evaluate an evidence anchor pointing at an unknown source", async () => {
    const input = await resealedProfileInput((profile) => {
      profile.requirements[0].evidence.source_id = "SYN-SRC-MISSING";
    });

    expect((await evaluateJurisdiction(input)).reason_code).toBe("unknown_evidence_source");
  });

  it("never throws, whatever it is handed", async () => {
    const broken = { ...(await inputFor()), profile: {} as JurisdictionProfile };

    await expect(evaluateJurisdiction(broken)).resolves.toMatchObject({
      status: "not_evaluated",
    });
  });
});

describe("binding, purity, and determinism", () => {
  it("binds exact model, configuration, profile, site-fact and evaluator versions and digests", async () => {
    const input = await inputFor();
    const evaluation = await evaluateJurisdiction(input);

    expect(evaluation.binding).toEqual({
      model_id: "adu-a-600",
      model_version: "1.0.0",
      model_geometry_digest: input.model.geometry.digest,
      configuration_hash: input.configuration_hash,
      jurisdiction_id: "synthetic-test-authority",
      profile_version: "1.0.0",
      profile_digest: input.profile_digest,
      site_facts_version: "1.0.0",
      site_facts_digest: input.site_facts_digest,
      as_of: "2026-08-07",
    });
    expect(evaluation.evaluator_version).toBe(EVALUATOR_VERSION);
    expect(evaluation.disclaimer_version).toBe(DISCLAIMER_VERSION);
    expect(evaluation.disclaimer).toBe(DISCLAIMER);
  });

  it("records explicit absence of site facts rather than inventing a version", async () => {
    const evaluation = await evaluateJurisdiction(await inputFor({ site_facts: null }));

    expect(evaluation.binding.site_facts_version).toBeNull();
    expect(evaluation.binding.site_facts_digest).toBeNull();
    expect(evaluation.missing_facts).toEqual(["lot_area_sqft", "rear_setback_ft"]);
  });

  it("leaves every input byte-identical after evaluation", async () => {
    const input = await inputFor();
    const before = {
      model: JSON.stringify(input.model),
      configuration: JSON.stringify(input.configuration),
      profile: JSON.stringify(input.profile),
      siteFacts: JSON.stringify(input.site_facts),
    };

    await evaluateJurisdiction(input);

    expect(JSON.stringify(input.model)).toBe(before.model);
    expect(JSON.stringify(input.configuration)).toBe(before.configuration);
    expect(JSON.stringify(input.profile)).toBe(before.profile);
    expect(JSON.stringify(input.site_facts)).toBe(before.siteFacts);
  });

  it("evaluates successfully against deeply frozen inputs", async () => {
    const deepFreeze = <T>(value: T): T => {
      if (value !== null && typeof value === "object") {
        Object.values(value).forEach(deepFreeze);
        Object.freeze(value);
      }
      return value;
    };

    const input = deepFreeze(await inputFor());
    const evaluation = await evaluateJurisdiction(input);

    expect(evaluation.status).toBe("reference_consistent");
  });

  it("produces byte-identical output for identical canonical inputs", async () => {
    const first = await evaluateJurisdiction(await inputFor());
    const second = await evaluateJurisdiction(await inputFor());

    expect(canonicalEvaluation(first)).toBe(canonicalEvaluation(second));
  });

  it("is insensitive to site-fact key order", async () => {
    const forward = await evaluateJurisdiction(
      await inputFor({
        site_facts: {
          schema: "jurisdiction-site-facts/1",
          site_facts_version: "1.0.0",
          values: { lot_area_sqft: 6000, rear_setback_ft: 6 },
        },
      }),
    );
    const reversed = await evaluateJurisdiction(
      await inputFor({
        site_facts: {
          schema: "jurisdiction-site-facts/1",
          site_facts_version: "1.0.0",
          values: { rear_setback_ft: 6, lot_area_sqft: 6000 },
        },
      }),
    );

    expect(canonicalEvaluation(forward)).toBe(canonicalEvaluation(reversed));
  });

  it("never mutates or derives model geometry", async () => {
    const input = await inputFor();
    const geometryBefore = JSON.stringify(input.model.geometry);

    const evaluation = await evaluateJurisdiction(input);

    expect(JSON.stringify(input.model.geometry)).toBe(geometryBefore);
    expect(JSON.stringify(evaluation)).not.toContain("models/geometry/");
    expect(JSON.stringify(evaluation)).not.toContain("adu-geometry-source/1");
  });
});

describe("model subject projection", () => {
  it("derives area from the bound configuration without touching the model", () => {
    const bound = model();
    const configuration = defaultConfiguration(bound);
    const before = JSON.stringify(bound);

    const subjects = deriveModelSubjects(bound, configuration);

    expect(subjects.gross_floor_area_sqft).toBe(600);
    expect(subjects.footprint_width_ft).toBe(20);
    expect(subjects.footprint_depth_ft).toBe(30);
    expect(subjects.stories).toBe(1);
    expect(subjects.bedrooms).toBe(1);
    expect(JSON.stringify(bound)).toBe(before);
  });

  it("flags a conflict when a larger family exceeds the synthetic area ceiling", async () => {
    const bound = model("adu-b-800");
    const configuration = { ...defaultConfiguration(bound), footprint_width_ft: 28, footprint_depth_ft: 30 };

    const evaluation = await evaluateJurisdiction(
      await inputFor({ model: bound, configuration }),
    );

    expect(deriveModelSubjects(bound, configuration).gross_floor_area_sqft).toBe(840);
    expect(evaluation.status).toBe("reference_conflict");
    expect(
      evaluation.results.find((result) => result.requirement_id === "SYN-REQ-001")?.outcome,
    ).toBe("violated");
  });

  it("marks a requirement not applicable when its gate does not match", async () => {
    const input = await resealedProfileInput((profile) => {
      profile.requirements[1].applies_when = { subject: "stories", operator: "gte", value: 2 };
    });

    const evaluation = await evaluateJurisdiction(input);

    expect(
      evaluation.results.find((result) => result.requirement_id === "SYN-REQ-002")?.outcome,
    ).toBe("not_applicable");
    expect(evaluation.status).toBe("reference_consistent");
  });
});
