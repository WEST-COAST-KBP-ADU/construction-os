import { describe, expect, it } from "vitest";

import {
  MODELS,
  SYNTHETIC_FIXTURE_VERSION,
  SYNTHETIC_PROPERTY,
  candidatesForRotation,
  evaluateCandidate,
  generateCandidates,
  type SyntheticFixture,
} from "./syntheticFit";

describe("synthetic property fit geometry", () => {
  it.each(MODELS)("returns stable candidates for $id in both orientations", ({ id }) => {
    const first = generateCandidates(id);
    const second = generateCandidates(id);

    expect(first).toEqual(second);
    expect(first.valid.map((candidate) => candidate.id)).toEqual(
      [...first.valid].map((candidate) => candidate.id),
    );
    expect(candidatesForRotation(id, 0).length).toBeGreaterThan(0);
    expect(candidatesForRotation(id, 90).length).toBeGreaterThan(0);
  });

  it("rejects overlap with an explicit assumed exclusion", () => {
    const evaluated = evaluateCandidate({
      id: "collision-proof",
      modelId: "studio-450",
      rotation: 0,
      x: 34,
      y: 22,
      width: 18,
      depth: 25,
    });

    expect(evaluated).toMatchObject({ valid: false, reason: "overlaps-existing-home" });
  });

  it("returns an explicit empty valid set when no footprint can fit", () => {
    const fixture: SyntheticFixture = {
      version: SYNTHETIC_FIXTURE_VERSION,
      parcel: { x: 0, y: 0, width: 20, depth: 20 },
      assumedBufferFeet: 6,
      exclusions: [],
    };

    const result = generateCandidates("two-bed-800", fixture);
    expect(result.valid).toEqual([]);
    expect(result.rejected).toHaveLength(16);
    expect(result.rejected.every((item) => item.reason === "outside-assumed-buffer")).toBe(true);
  });

  it("keeps the fixture versioned, local, and deterministic", () => {
    expect(SYNTHETIC_PROPERTY.version).toBe("synthetic-property-fit/1");
    expect(JSON.stringify(SYNTHETIC_PROPERTY)).not.toMatch(/address|apn|latitude|longitude/i);
  });
});
