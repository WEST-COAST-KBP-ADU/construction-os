import { describe, expect, it } from "vitest";
import { buildIntakeArtifact, type IntakeArtifact } from "./intakeArtifact";
import { buildOwnerReviewPacket } from "./ownerReviewPacket";

function makeArtifact(overrides: Partial<Record<string, unknown>> = {}): IntakeArtifact {
  const result = buildIntakeArtifact({
    inquiryType: "adu",
    jurisdictionCategory: "roseville",
    timelineCategory: "ready_now",
    budgetBand: "100k_250k",
    leadSource: "phone",
    language: "en",
    summary: "Homeowner exploring a detached ADU with alley access.",
    missingInfo: [],
    testVariantId: "T-100",
    createdAt: "2026-07-02T10:00:00Z",
    ...overrides,
  });
  if (!result.ok || !result.artifact) throw new Error("fixture artifact invalid");
  return result.artifact;
}

describe("buildOwnerReviewPacket", () => {
  it("is always a candidate and never executes anything", () => {
    const packet = buildOwnerReviewPacket(makeArtifact());
    expect(packet.status).toBe("candidate");
    expect(packet.packetId).toBe("ORP-text_lab-T-100");
    expect(packet.proposedNextAction).toMatch(/^Owner decision:/);
  });

  it("classifies an in-area, ready-now core inquiry as high priority", () => {
    const packet = buildOwnerReviewPacket(makeArtifact());
    expect(packet.classification.priority).toBe("high");
    expect(packet.classification.reasoning.join(" ")).toContain("inside service area");
  });

  it("classifies an out-of-area exploratory inquiry as low priority with decline path", () => {
    const packet = buildOwnerReviewPacket(
      makeArtifact({
        jurisdictionCategory: "outside_service_area",
        timelineCategory: "exploring",
        budgetBand: "undisclosed",
        inquiryType: "other",
      })
    );
    expect(packet.classification.priority).toBe("low");
    expect(packet.proposedNextAction).toContain("outside service area");
  });

  it("marks unknown jurisdiction with official-verification wording", () => {
    const packet = buildOwnerReviewPacket(makeArtifact({ jurisdictionCategory: "unknown" }));
    expect(packet.missingInformation.join(" ")).toContain("Requires official source verification");
  });

  it("flags restricted claims that reached the summary", () => {
    const packet = buildOwnerReviewPacket(
      makeArtifact({ summary: "Told the caller it will be finished by summer." })
    );
    expect(packet.restrictedClaimCheck.passed).toBe(false);
    expect(packet.restrictedClaimCheck.findings.length).toBeGreaterThan(0);
  });

  it("passes the restricted-claim check on a clean summary", () => {
    const packet = buildOwnerReviewPacket(makeArtifact());
    expect(packet.restrictedClaimCheck.passed).toBe(true);
    expect(packet.restrictedClaimCheck.findings).toHaveLength(0);
  });

  it("is deterministic: identical input yields identical output", () => {
    const a = buildOwnerReviewPacket(makeArtifact());
    const b = buildOwnerReviewPacket(makeArtifact());
    expect(a).toEqual(b);
  });
});
