import { describe, expect, it } from "vitest";
import { buildIntakeArtifact } from "./intakeArtifact";

const base = {
  inquiryType: "adu",
  jurisdictionCategory: "roseville",
  timelineCategory: "ready_now",
  budgetBand: "100k_250k",
  leadSource: "phone",
  language: "en",
  summary: "Homeowner asking about a detached ADU in the backyard.",
  missingInfo: ["Lot access not discussed."],
  testVariantId: "T-001",
  createdAt: "2026-07-02T10:00:00Z",
};

describe("buildIntakeArtifact — structural whitelist", () => {
  it("builds a valid artifact from clean input", () => {
    const result = buildIntakeArtifact({ ...base });
    expect(result.ok).toBe(true);
    expect(result.artifact?.inquiryType).toBe("adu");
    expect(result.droppedFields).toHaveLength(0);
  });

  it("drops unknown fields structurally and reports them", () => {
    const result = buildIntakeArtifact({
      ...base,
      customerName: "John Smith",
      phoneNumber: "916-555-0182",
      streetAddress: "4821 Sierra College Blvd",
    });
    expect(result.ok).toBe(true);
    expect(result.droppedFields).toEqual(
      expect.arrayContaining(["customerName", "phoneNumber", "streetAddress"])
    );
    const json = JSON.stringify(result.artifact);
    expect(json).not.toContain("John Smith");
    expect(json).not.toContain("916-555-0182");
    expect(json).not.toContain("Sierra College");
  });

  it("sanitizes PII inside the summary before storing", () => {
    const result = buildIntakeArtifact({
      ...base,
      summary: "Caller at 916-555-0182 wants an ADU at 4821 Sierra College Blvd.",
    });
    expect(result.ok).toBe(true);
    expect(result.artifact?.summarySanitized).toContain("[phone]");
    expect(result.artifact?.summarySanitized).toContain("[street_address]");
    expect(result.redacted.phone).toBe(1);
  });

  it("sanitizes PII inside missingInfo entries", () => {
    const result = buildIntakeArtifact({
      ...base,
      missingInfo: ["Confirm email maria@example.com is right."],
    });
    expect(result.artifact?.missingInfo[0]).toContain("[email]");
  });

  it("falls back to safe defaults for invalid enum values", () => {
    const result = buildIntakeArtifact({
      ...base,
      inquiryType: "swimming pool",
      jurisdictionCategory: "Paris",
      budgetBand: "one million",
    });
    expect(result.ok).toBe(true);
    expect(result.artifact?.inquiryType).toBe("other");
    expect(result.artifact?.jurisdictionCategory).toBe("unknown");
    expect(result.artifact?.budgetBand).toBe("undisclosed");
  });

  it("fails closed without lab evidence fields", () => {
    const rest: Record<string, unknown> = { ...base };
    delete rest.testVariantId;
    delete rest.createdAt;
    const result = buildIntakeArtifact(rest);
    expect(result.ok).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.artifact).toBeUndefined();
  });
});
