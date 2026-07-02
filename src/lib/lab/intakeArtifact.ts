/**
 * Sanitized intake artifact — text-mode intake lab (TASK-0003).
 *
 * Implements `create_intake_artifact` (DR-0006, effect class: local_write).
 * The artifact schema is a structural whitelist: a field that is not declared
 * here does not exist, so PII cannot "leak through" — it is dropped by
 * construction, and free-text fields pass through the sanitizer first.
 *
 * LAB STATUS: synthetic data only. Not production-authorized.
 */

import { sanitizeText, type SanitizationResult } from "./guardrails";

export const INQUIRY_TYPES = [
  "adu",
  "garage_conversion",
  "residential_gc",
  "gc_subcontract",
  "other",
] as const;
export type InquiryType = (typeof INQUIRY_TYPES)[number];

export const TIMELINE_CATEGORIES = [
  "exploring",
  "planning_this_year",
  "ready_now",
  "unknown",
] as const;
export type TimelineCategory = (typeof TIMELINE_CATEGORIES)[number];

export const BUDGET_BANDS = [
  "undisclosed",
  "under_100k",
  "100k_250k",
  "over_250k",
] as const;
export type BudgetBand = (typeof BUDGET_BANDS)[number];

export const LEAD_SOURCES = [
  "phone",
  "web_form",
  "referral",
  "gbp",
  "ads",
  "organic",
  "other",
] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const LANGUAGES = ["en", "es"] as const;
export type IntakeLanguage = (typeof LANGUAGES)[number];

/**
 * Jurisdiction is a coarse category, never an address. Values mirror the
 * charter's service area plus generic buckets.
 */
export const JURISDICTION_CATEGORIES = [
  "roseville",
  "rocklin",
  "lincoln",
  "folsom",
  "granite_bay",
  "el_dorado_hills",
  "citrus_heights",
  "sacramento_region_other",
  "outside_service_area",
  "unknown",
] as const;
export type JurisdictionCategory = (typeof JURISDICTION_CATEGORIES)[number];

/** The complete artifact shape. Nothing outside this shape is ever stored. */
export type IntakeArtifact = {
  inquiryType: InquiryType;
  jurisdictionCategory: JurisdictionCategory;
  timelineCategory: TimelineCategory;
  budgetBand: BudgetBand;
  leadSource: LeadSource;
  language: IntakeLanguage;
  /** Sanitized free-text summary; PII redacted before assignment. */
  summarySanitized: string;
  /** Open questions the intake could not answer. */
  missingInfo: string[];
  /** Lab evidence fields (BOUNDARIES.md whitelist). */
  testVariantId: string;
  createdAt: string;
};

export type IntakeArtifactResult = {
  ok: boolean;
  artifact?: IntakeArtifact;
  /** Input keys structurally dropped because they are not in the schema. */
  droppedFields: string[];
  /** PII classes redacted from free text (counts only). */
  redacted: SanitizationResult["redacted"];
  errors: string[];
};

const isOneOf = <T extends readonly string[]>(list: T, v: unknown): v is T[number] =>
  typeof v === "string" && (list as readonly string[]).includes(v);

const KNOWN_KEYS = new Set([
  "inquiryType",
  "jurisdictionCategory",
  "timelineCategory",
  "budgetBand",
  "leadSource",
  "language",
  "summary",
  "missingInfo",
  "testVariantId",
  "createdAt",
]);

/**
 * Build a sanitized intake artifact from raw (untrusted) intake input.
 * Whitelist semantics: unknown keys are dropped and reported; enum fields
 * fall back to their safe default rather than accepting free text; the
 * summary is sanitized before it is stored anywhere.
 */
export function buildIntakeArtifact(input: Record<string, unknown>): IntakeArtifactResult {
  const droppedFields = Object.keys(input).filter((k) => !KNOWN_KEYS.has(k));
  const errors: string[] = [];

  const summaryRaw = typeof input.summary === "string" ? input.summary : "";
  const { sanitized, redacted } = sanitizeText(summaryRaw);

  const testVariantId = typeof input.testVariantId === "string" ? input.testVariantId : "";
  if (!testVariantId) errors.push("testVariantId is required for lab artifacts");
  const createdAt = typeof input.createdAt === "string" ? input.createdAt : "";
  if (!createdAt) errors.push("createdAt is required (caller-supplied, ISO 8601)");

  const missingInfo = Array.isArray(input.missingInfo)
    ? input.missingInfo.filter((x): x is string => typeof x === "string").map((x) => sanitizeText(x).sanitized)
    : [];

  if (errors.length > 0) {
    return { ok: false, droppedFields, redacted, errors };
  }

  const artifact: IntakeArtifact = {
    inquiryType: isOneOf(INQUIRY_TYPES, input.inquiryType) ? input.inquiryType : "other",
    jurisdictionCategory: isOneOf(JURISDICTION_CATEGORIES, input.jurisdictionCategory)
      ? input.jurisdictionCategory
      : "unknown",
    timelineCategory: isOneOf(TIMELINE_CATEGORIES, input.timelineCategory)
      ? input.timelineCategory
      : "unknown",
    budgetBand: isOneOf(BUDGET_BANDS, input.budgetBand) ? input.budgetBand : "undisclosed",
    leadSource: isOneOf(LEAD_SOURCES, input.leadSource) ? input.leadSource : "other",
    language: isOneOf(LANGUAGES, input.language) ? input.language : "en",
    summarySanitized: sanitized,
    missingInfo,
    testVariantId,
    createdAt,
  };

  return { ok: true, artifact, droppedFields, redacted, errors };
}
