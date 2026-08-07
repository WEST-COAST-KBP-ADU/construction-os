import {
  MUTABLE_ALIASES,
  canonicalDigestInput,
  computeDigest,
  isCalendarDate,
  isUtcTimestamp,
} from "./modelContract";
import type { AduModel, ModelConfigurationValues } from "./types";

export const PROFILE_SCHEMA = "jurisdiction-profile/1";
export const EVALUATION_SCHEMA = "jurisdiction-evaluation/1";
export const PROFILE_RELEASE_SCHEMA = "jurisdiction-profile-release/1";
export const SITE_FACTS_SCHEMA = "jurisdiction-site-facts/1";
export const EVALUATOR_VERSION = "jurisdiction-contract/1.0.0";
export const DISCLAIMER_VERSION = "jd1";

/**
 * The only statuses this layer may ever emit. `reference_consistent` means the
 * supplied facts did not conflict with the encoded reference predicates. It
 * does not mean approved, eligible, buildable, code compliant, preapproved,
 * permit ready, or suitable for a parcel.
 */
export const TERMINAL_STATUSES = Object.freeze([
  "not_evaluated",
  "blocked_missing_facts",
  "blocked_stale_profile",
  "reference_consistent",
  "reference_conflict",
] as const);

export type TerminalStatus = (typeof TERMINAL_STATUSES)[number];

/** Vocabulary that must never appear in a status value or in release data. */
export const FORBIDDEN_CLAIM_VOCABULARY = Object.freeze([
  "approved",
  "approval",
  "eligible",
  "buildable",
  "compliant",
  "compliance",
  "preapproved",
  "pre-approved",
  "permit ready",
  "permit-ready",
  "certified",
  "certification",
  "entitled",
]);

export const DISCLAIMER =
  "Reference evaluation only. This is not approval, eligibility, buildability, code compliance, or permit readiness, and it is not a determination about any parcel. Requires official source verification.";

export const ALLOWED_OPERATORS = Object.freeze([
  "lte",
  "gte",
  "lt",
  "gt",
  "eq",
  "neq",
  "in",
  "not_in",
] as const);

export type RequirementOperator = (typeof ALLOWED_OPERATORS)[number];

export const ALLOWED_PROFILE_UNITS = Object.freeze(["sqft", "ft", "count", "none"]);

export const ALLOWED_SUBJECT_SOURCES = Object.freeze(["model_configuration", "site_fact"]);

/** Model-derived subjects. Read-only projections — never geometry mutation. */
export const MODEL_SUBJECTS = Object.freeze([
  "gross_floor_area_sqft",
  "footprint_width_ft",
  "footprint_depth_ft",
  "max_overall_height_ft",
  "stories",
  "bedrooms",
  "bathrooms",
]);

const SEMVER_PATTERN = /^\d+\.\d+\.\d+$/;
const RELEASE_VERSION_PATTERN = /^\d{4}\.\d{2}\.\d+$/;
const DIGEST_PATTERN = /^sha256:[0-9a-f]{64}$/;
const IDENTIFIER_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ApplicabilityPredicate = {
  subject: string;
  operator: RequirementOperator;
  value: number | string | (number | string)[];
};

export type ReferenceRequirement = {
  requirement_id: string;
  topic: string;
  subject: string;
  subject_source: "model_configuration" | "site_fact";
  operator: RequirementOperator;
  value: number | string | (number | string)[];
  unit: string;
  applies_when: ApplicabilityPredicate | null;
  evidence: { source_id: string; anchor: string };
  effective_date: string;
  interpretation_note: string;
  deterministic: boolean;
  requires_professional_interpretation: boolean;
};

export type JurisdictionProfile = {
  schema: typeof PROFILE_SCHEMA;
  jurisdiction_id: string;
  authority_name: string;
  profile_version: string;
  adoption: { status: "not_adopted" | "adopted"; synthetic: boolean; notice: string };
  code_cycle: {
    cycle_id: string;
    stated_by: string;
    effective_from: string;
    effective_to: string | null;
  };
  effective_window: { valid_from: string; valid_to: string | null; checked_at: string };
  sources: {
    source_id: string;
    title: string;
    locator: string;
    retrieved_at: string;
    digest: string | null;
    accessible: boolean;
  }[];
  requirements: ReferenceRequirement[];
  submission: {
    checklist: string[];
    forms: string[];
    review_path: string;
    site_specific_inputs: string[];
  };
  limitations: {
    missing_facts: string[];
    conflicts: string[];
    inaccessible_evidence: string[];
    interpretation_boundaries: string[];
    blocking: boolean;
  };
  review: {
    reviewer: string;
    reviewed_at: string;
    currency_state: "current" | "stale" | "unknown";
    currency_valid_to: string | null;
  };
  disclaimer_version: string;
};

export type JurisdictionProfileRelease = {
  schema: typeof PROFILE_RELEASE_SCHEMA;
  release_version: string;
  effective_from: string;
  adopted_profiles: JurisdictionProfile[];
  adoption_notice: string;
  release_digest: string;
};

export type SiteFacts = {
  schema: typeof SITE_FACTS_SCHEMA;
  site_facts_version: string;
  values: Record<string, number | string>;
} | null;

export type EvaluationInput = {
  model: AduModel;
  configuration: ModelConfigurationValues;
  configuration_hash: string | null;
  profile: JurisdictionProfile;
  profile_digest: string;
  site_facts: SiteFacts;
  /** Staleness is measured against this supplied date. Never read from a clock. */
  as_of: string;
};

export type RequirementResult = {
  requirement_id: string;
  topic: string;
  subject: string;
  operator: RequirementOperator;
  value: number | string | (number | string)[];
  unit: string;
  observed: number | string | null;
  outcome: "satisfied" | "violated" | "not_applicable" | "missing_fact" | "not_evaluated";
  evidence: { source_id: string; anchor: string };
  reason_code: string | null;
};

export type JurisdictionEvaluation = {
  schema: typeof EVALUATION_SCHEMA;
  evaluator_version: string;
  binding: {
    model_id: string;
    model_version: string;
    configuration_hash: string | null;
    jurisdiction_id: string;
    profile_version: string;
    profile_digest: string;
    site_facts_version: string | null;
    as_of: string;
  };
  results: RequirementResult[];
  missing_facts: string[];
  status: TerminalStatus;
  reason_code: string | null;
  disclaimer_version: string;
  disclaimer: string;
};

// ---------------------------------------------------------------------------
// Shape enforcement
// ---------------------------------------------------------------------------

type KeySet = { required: readonly string[]; optional?: readonly string[] };

const K = {
  profile: {
    required: [
      "schema", "jurisdiction_id", "authority_name", "profile_version", "adoption", "code_cycle",
      "effective_window", "sources", "requirements", "submission", "limitations", "review",
      "disclaimer_version",
    ],
  },
  adoption: { required: ["status", "synthetic", "notice"] },
  codeCycle: { required: ["cycle_id", "stated_by", "effective_from", "effective_to"] },
  effectiveWindow: { required: ["valid_from", "valid_to", "checked_at"] },
  source: {
    required: ["source_id", "title", "locator", "retrieved_at", "digest", "accessible"],
  },
  requirement: {
    required: [
      "requirement_id", "topic", "subject", "subject_source", "operator", "value", "unit",
      "applies_when", "evidence", "effective_date", "interpretation_note", "deterministic",
      "requires_professional_interpretation",
    ],
  },
  evidence: { required: ["source_id", "anchor"] },
  applicability: { required: ["subject", "operator", "value"] },
  submission: { required: ["checklist", "forms", "review_path", "site_specific_inputs"] },
  limitations: {
    required: [
      "missing_facts", "conflicts", "inaccessible_evidence", "interpretation_boundaries", "blocking",
    ],
  },
  review: { required: ["reviewer", "reviewed_at", "currency_state", "currency_valid_to"] },
  release: {
    required: [
      "schema", "release_version", "effective_from", "adopted_profiles", "adoption_notice",
      "release_digest",
    ],
  },
  siteFacts: { required: ["schema", "site_facts_version", "values"] },
} as const satisfies Record<string, KeySet>;

function fail(code: string): never {
  throw new Error(code);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function assertExactKeys(value: unknown, keys: KeySet, missing: string, unknown: string) {
  if (!isPlainObject(value)) {
    fail(missing);
  }

  const allowed = new Set<string>([...keys.required, ...(keys.optional ?? [])]);

  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      fail(unknown);
    }
  }

  for (const key of keys.required) {
    if (!(key in value)) {
      fail(missing);
    }
  }

  return value;
}

function assertNoMutableAlias(value: string, code: string): void {
  if (MUTABLE_ALIASES.includes(value.toLowerCase())) {
    fail(code);
  }
}

function assertStringArray(value: unknown, code: string): void {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) {
    fail(code);
  }
}

// ---------------------------------------------------------------------------
// Profile validation
// ---------------------------------------------------------------------------

export function assertValidJurisdictionProfile(profile: JurisdictionProfile): void {
  assertExactKeys(profile, K.profile, "missing_profile_field", "unknown_profile_field");

  if (profile.schema !== PROFILE_SCHEMA) {
    fail("unknown_profile_schema");
  }

  if (!IDENTIFIER_PATTERN.test(profile.jurisdiction_id)) {
    fail("unknown_jurisdiction_id");
  }

  assertNoMutableAlias(profile.profile_version, "mutable_profile_alias");

  if (!SEMVER_PATTERN.test(profile.profile_version)) {
    fail("invalid_profile_version");
  }

  const adoption = assertExactKeys(
    profile.adoption, K.adoption, "missing_profile_field", "unknown_profile_field",
  );

  if (adoption.status !== "not_adopted" && adoption.status !== "adopted") {
    fail("invalid_adoption_status");
  }

  if (typeof adoption.synthetic !== "boolean") {
    fail("invalid_adoption_synthetic_flag");
  }

  if (adoption.synthetic === true && adoption.status === "adopted") {
    fail("synthetic_profile_cannot_be_adopted");
  }

  if (typeof adoption.notice !== "string" || adoption.notice.length === 0) {
    fail("missing_adoption_notice");
  }

  const codeCycle = assertExactKeys(
    profile.code_cycle, K.codeCycle, "missing_profile_field", "unknown_profile_field",
  );

  if (!isCalendarDate(codeCycle.effective_from)) {
    fail("invalid_code_cycle_date");
  }

  if (codeCycle.effective_to !== null && !isCalendarDate(codeCycle.effective_to)) {
    fail("invalid_code_cycle_date");
  }

  const window = assertExactKeys(
    profile.effective_window, K.effectiveWindow, "missing_profile_field", "unknown_profile_field",
  );

  if (!isCalendarDate(window.valid_from) || !isCalendarDate(window.checked_at)) {
    fail("invalid_effective_window_date");
  }

  if (window.valid_to !== null && !isCalendarDate(window.valid_to)) {
    fail("invalid_effective_window_date");
  }

  if (
    typeof window.valid_to === "string" &&
    typeof window.valid_from === "string" &&
    window.valid_to < window.valid_from
  ) {
    fail("inverted_effective_window");
  }

  if (!Array.isArray(profile.sources) || profile.sources.length === 0) {
    fail("missing_profile_sources");
  }

  const sourceIds = new Set<string>();
  for (const source of profile.sources) {
    assertExactKeys(source, K.source, "missing_profile_field", "unknown_profile_field");

    if (sourceIds.has(source.source_id)) {
      fail("duplicate_source_id");
    }
    sourceIds.add(source.source_id);

    if (!isUtcTimestamp(source.retrieved_at)) {
      fail("invalid_source_retrieved_at");
    }

    if (source.digest !== null && !DIGEST_PATTERN.test(source.digest)) {
      fail("invalid_digest_format");
    }

    if (typeof source.accessible !== "boolean") {
      fail("invalid_source_accessibility");
    }
  }

  if (!Array.isArray(profile.requirements) || profile.requirements.length === 0) {
    fail("missing_profile_requirements");
  }

  const requirementIds = new Set<string>();
  for (const requirement of profile.requirements) {
    assertExactKeys(requirement, K.requirement, "missing_profile_field", "unknown_profile_field");

    if (requirementIds.has(requirement.requirement_id)) {
      fail("duplicate_requirement_id");
    }
    requirementIds.add(requirement.requirement_id);

    if (!ALLOWED_OPERATORS.includes(requirement.operator)) {
      fail("unknown_operator");
    }

    if (!ALLOWED_PROFILE_UNITS.includes(requirement.unit)) {
      fail("unknown_unit");
    }

    if (!ALLOWED_SUBJECT_SOURCES.includes(requirement.subject_source)) {
      fail("unknown_subject_source");
    }

    if (
      requirement.subject_source === "model_configuration" &&
      !MODEL_SUBJECTS.includes(requirement.subject)
    ) {
      fail("unknown_model_subject");
    }

    if (requirement.deterministic !== true) {
      fail("non_deterministic_predicate");
    }

    if (requirement.requires_professional_interpretation !== false) {
      fail("requires_professional_interpretation");
    }

    if (!isCalendarDate(requirement.effective_date)) {
      fail("invalid_requirement_effective_date");
    }

    assertExactKeys(
      requirement.evidence, K.evidence, "missing_profile_field", "unknown_profile_field",
    );

    if (!sourceIds.has(requirement.evidence.source_id)) {
      fail("unknown_evidence_source");
    }

    if (requirement.applies_when !== null) {
      assertExactKeys(
        requirement.applies_when, K.applicability, "missing_profile_field", "unknown_profile_field",
      );

      if (!ALLOWED_OPERATORS.includes(requirement.applies_when.operator)) {
        fail("unknown_operator");
      }
    }

    if ((requirement.operator === "in" || requirement.operator === "not_in") !== Array.isArray(requirement.value)) {
      fail("operator_value_shape_mismatch");
    }
  }

  const submission = assertExactKeys(
    profile.submission, K.submission, "missing_profile_field", "unknown_profile_field",
  );
  assertStringArray(submission.checklist, "invalid_submission_field");
  assertStringArray(submission.forms, "invalid_submission_field");
  assertStringArray(submission.site_specific_inputs, "invalid_submission_field");

  const limitations = assertExactKeys(
    profile.limitations, K.limitations, "missing_profile_field", "unknown_profile_field",
  );
  assertStringArray(limitations.missing_facts, "invalid_limitations_field");
  assertStringArray(limitations.conflicts, "invalid_limitations_field");
  assertStringArray(limitations.inaccessible_evidence, "invalid_limitations_field");
  assertStringArray(limitations.interpretation_boundaries, "invalid_limitations_field");

  if (typeof limitations.blocking !== "boolean") {
    fail("invalid_limitations_field");
  }

  const review = assertExactKeys(
    profile.review, K.review, "missing_profile_field", "unknown_profile_field",
  );

  if (!isCalendarDate(review.reviewed_at)) {
    fail("invalid_review_date");
  }

  if (!["current", "stale", "unknown"].includes(review.currency_state as string)) {
    fail("invalid_currency_state");
  }

  if (review.currency_valid_to !== null && !isCalendarDate(review.currency_valid_to)) {
    fail("invalid_review_date");
  }

  if (profile.disclaimer_version !== DISCLAIMER_VERSION) {
    fail("unknown_disclaimer_version");
  }
}

export async function assertValidJurisdictionRelease(
  release: JurisdictionProfileRelease,
): Promise<void> {
  assertExactKeys(release, K.release, "missing_release_field", "unknown_release_field");

  if (release.schema !== PROFILE_RELEASE_SCHEMA) {
    fail("unknown_release_schema");
  }

  assertNoMutableAlias(release.release_version, "mutable_release_alias");

  if (!RELEASE_VERSION_PATTERN.test(release.release_version)) {
    fail("invalid_release_version");
  }

  if (!isCalendarDate(release.effective_from)) {
    fail("invalid_effective_from");
  }

  if (!DIGEST_PATTERN.test(release.release_digest)) {
    fail("invalid_digest_format");
  }

  if (!Array.isArray(release.adopted_profiles)) {
    fail("missing_release_field");
  }

  if (typeof release.adoption_notice !== "string" || release.adoption_notice.length === 0) {
    fail("missing_adoption_notice");
  }

  for (const profile of release.adopted_profiles) {
    assertValidJurisdictionProfile(profile);

    if (profile.adoption.synthetic === true) {
      fail("synthetic_profile_in_release");
    }

    if (profile.adoption.status !== "adopted") {
      fail("unadopted_profile_in_release");
    }
  }

  const recomputed = await computeDigest(release, ["release_digest"]);
  if (recomputed !== release.release_digest) {
    fail("release_digest_mismatch");
  }
}

// ---------------------------------------------------------------------------
// Evaluation
// ---------------------------------------------------------------------------

/** Read-only projection of the bound model + configuration. Never mutates. */
export function deriveModelSubjects(
  model: AduModel,
  configuration: ModelConfigurationValues,
): Record<string, number> {
  const width = configuration.footprint_width_ft;
  const depth = configuration.footprint_depth_ft;

  if (typeof width !== "number" || typeof depth !== "number") {
    fail("unknown_model_subject");
  }

  return {
    gross_floor_area_sqft: width * depth,
    footprint_width_ft: width,
    footprint_depth_ft: depth,
    max_overall_height_ft: model.envelope.height_ft.max,
    stories: model.program.stories,
    bedrooms: model.program.bedrooms,
    bathrooms: model.program.bathrooms,
  };
}

function compare(
  observed: number | string,
  operator: RequirementOperator,
  value: number | string | (number | string)[],
): boolean | null {
  if (operator === "in" || operator === "not_in") {
    if (!Array.isArray(value)) {
      return null;
    }
    const contained = value.includes(observed);
    return operator === "in" ? contained : !contained;
  }

  if (Array.isArray(value)) {
    return null;
  }

  if (operator === "eq") {
    return observed === value;
  }

  if (operator === "neq") {
    return observed !== value;
  }

  if (typeof observed !== "number" || typeof value !== "number") {
    return null;
  }

  switch (operator) {
    case "lte":
      return observed <= value;
    case "gte":
      return observed >= value;
    case "lt":
      return observed < value;
    case "gt":
      return observed > value;
  }
}

function isStale(profile: JurisdictionProfile, asOf: string): boolean {
  if (profile.review.currency_state !== "current") {
    return true;
  }

  if (asOf < profile.effective_window.valid_from) {
    return true;
  }

  if (profile.effective_window.valid_to !== null && asOf > profile.effective_window.valid_to) {
    return true;
  }

  if (profile.review.currency_valid_to !== null && asOf > profile.review.currency_valid_to) {
    return true;
  }

  return profile.limitations.blocking === true;
}

function blocked(
  input: EvaluationInput,
  status: TerminalStatus,
  reasonCode: string | null,
  results: RequirementResult[] = [],
  missingFacts: string[] = [],
): JurisdictionEvaluation {
  return {
    schema: EVALUATION_SCHEMA,
    evaluator_version: EVALUATOR_VERSION,
    binding: {
      model_id: input.model?.model_id ?? "",
      model_version: input.model?.version ?? "",
      configuration_hash: input.configuration_hash ?? null,
      jurisdiction_id: input.profile?.jurisdiction_id ?? "",
      profile_version: input.profile?.profile_version ?? "",
      profile_digest: input.profile_digest ?? "",
      site_facts_version: input.site_facts?.site_facts_version ?? null,
      as_of: input.as_of,
    },
    results,
    missing_facts: missingFacts,
    status,
    reason_code: reasonCode,
    disclaimer_version: DISCLAIMER_VERSION,
    disclaimer: DISCLAIMER,
  };
}

/**
 * Deterministic, total, and pure. Never throws, never reads a clock, and never
 * mutates any input. Anything it cannot evaluate deterministically becomes a
 * blocked status rather than a guess.
 */
export async function evaluateJurisdiction(
  input: EvaluationInput,
): Promise<JurisdictionEvaluation> {
  if (!isCalendarDate(input.as_of)) {
    return blocked(input, "not_evaluated", "invalid_as_of_date");
  }

  try {
    assertValidJurisdictionProfile(input.profile);
  } catch (error) {
    return blocked(input, "not_evaluated", (error as Error).message);
  }

  if (!DIGEST_PATTERN.test(input.profile_digest)) {
    return blocked(input, "not_evaluated", "invalid_digest_format");
  }

  const recomputed = await computeDigest(input.profile);
  if (recomputed !== input.profile_digest) {
    return blocked(input, "not_evaluated", "profile_digest_mismatch");
  }

  if (input.site_facts !== null) {
    try {
      assertExactKeys(
        input.site_facts, K.siteFacts, "missing_site_facts_field", "unknown_site_facts_field",
      );
    } catch (error) {
      return blocked(input, "not_evaluated", (error as Error).message);
    }

    if (input.site_facts.schema !== SITE_FACTS_SCHEMA) {
      return blocked(input, "not_evaluated", "unknown_site_facts_schema");
    }

    if (MUTABLE_ALIASES.includes(input.site_facts.site_facts_version.toLowerCase())) {
      return blocked(input, "not_evaluated", "mutable_site_facts_alias");
    }

    if (!SEMVER_PATTERN.test(input.site_facts.site_facts_version)) {
      return blocked(input, "not_evaluated", "invalid_site_facts_version");
    }
  }

  let subjects: Record<string, number>;
  try {
    subjects = deriveModelSubjects(input.model, input.configuration);
  } catch (error) {
    return blocked(input, "not_evaluated", (error as Error).message);
  }

  const siteValues = input.site_facts?.values ?? {};
  const results: RequirementResult[] = [];
  const missingFacts: string[] = [];
  let conflict = false;

  for (const requirement of input.profile.requirements) {
    const base: Omit<RequirementResult, "observed" | "outcome" | "reason_code"> = {
      requirement_id: requirement.requirement_id,
      topic: requirement.topic,
      subject: requirement.subject,
      operator: requirement.operator,
      value: requirement.value,
      unit: requirement.unit,
      evidence: requirement.evidence,
    };

    if (requirement.applies_when !== null) {
      const gateObserved = subjects[requirement.applies_when.subject];

      if (gateObserved === undefined) {
        results.push({ ...base, observed: null, outcome: "not_evaluated", reason_code: "unknown_applicability_subject" });
        return blocked(input, "not_evaluated", "unknown_applicability_subject", results, missingFacts);
      }

      const applies = compare(
        gateObserved, requirement.applies_when.operator, requirement.applies_when.value,
      );

      if (applies === null) {
        results.push({ ...base, observed: null, outcome: "not_evaluated", reason_code: "non_deterministic_applicability" });
        return blocked(input, "not_evaluated", "non_deterministic_applicability", results, missingFacts);
      }

      if (!applies) {
        results.push({ ...base, observed: null, outcome: "not_applicable", reason_code: null });
        continue;
      }
    }

    const observed =
      requirement.subject_source === "model_configuration"
        ? subjects[requirement.subject]
        : siteValues[requirement.subject];

    if (observed === undefined) {
      missingFacts.push(requirement.subject);
      results.push({ ...base, observed: null, outcome: "missing_fact", reason_code: "required_site_fact_absent" });
      continue;
    }

    const satisfied = compare(observed, requirement.operator, requirement.value);

    if (satisfied === null) {
      results.push({ ...base, observed, outcome: "not_evaluated", reason_code: "non_deterministic_predicate" });
      return blocked(input, "not_evaluated", "non_deterministic_predicate", results, missingFacts);
    }

    if (!satisfied) {
      conflict = true;
    }

    results.push({
      ...base,
      observed,
      outcome: satisfied ? "satisfied" : "violated",
      reason_code: satisfied ? null : "reference_predicate_violated",
    });
  }

  if (isStale(input.profile, input.as_of)) {
    return blocked(input, "blocked_stale_profile", "profile_outside_currency_window", results, missingFacts);
  }

  if (missingFacts.length > 0) {
    return blocked(input, "blocked_missing_facts", "required_site_facts_absent", results, missingFacts);
  }

  if (conflict) {
    return blocked(input, "reference_conflict", "reference_predicate_violated", results, missingFacts);
  }

  return blocked(input, "reference_consistent", null, results, missingFacts);
}

/** Canonical serialization of an evaluation, for replay and comparison. */
export function canonicalEvaluation(evaluation: JurisdictionEvaluation): string {
  return canonicalDigestInput(evaluation);
}
