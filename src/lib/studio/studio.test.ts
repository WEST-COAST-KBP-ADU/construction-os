import { describe, expect, it } from "vitest";

import catalogData from "../../data/studio/catalog/releases/2026.08.0.json";

import {
  assertValidCandidate,
  buildConfigurationCandidate,
  canonicalJson,
  evaluateOption,
  sha256Hex,
} from "./studio";
import type { ConfigurationCandidateInput, StudioCatalog } from "./types";

const catalog = catalogData as StudioCatalog;

const input: ConfigurationCandidateInput = {
  schema: "config/1",
  catalog_version: catalog.version,
  archetype: "one-bed-600",
  layout: "open",
  selections: {
    exterior: "stucco-smooth",
    palette: "sand-dune",
    roof: "gable",
    windows: "standard",
    interior: "comfort",
  },
  disclaimer_version: "d1",
};

describe("studio configuration contract", () => {
  it("sorts keys recursively and excludes config_hash", () => {
    expect(canonicalJson({ z: 1, nested: { b: 2, a: 1 }, config_hash: "ignored" })).toBe(
      '{"nested":{"a":1,"b":2},"z":1}',
    );
  });

  it("matches the SHA-256 known vector", async () => {
    expect(await sha256Hex("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });

  it("replays to a byte-identical candidate", async () => {
    const first = await buildConfigurationCandidate(catalog, input);
    const replay = await buildConfigurationCandidate(catalog, JSON.parse(JSON.stringify(input)));

    expect(JSON.stringify(replay)).toBe(JSON.stringify(first));
    expect(replay.config_hash).toBe(first.config_hash);
  });

  it("denies the data-defined shed/tall-window combination", () => {
    const selections = { ...input.selections, roof: "shed" };
    expect(evaluateOption(catalog, "studio-450", selections, "windows", "tall")).toEqual({
      allowed: false,
      reasonCode: "roof_window_clearance",
    });
  });

  it("refuses construction of an invalid candidate", () => {
    expect(() =>
      assertValidCandidate(catalog, {
        ...input,
        archetype: "studio-450",
        selections: { ...input.selections, roof: "shed", windows: "tall" },
      }),
    ).toThrowError("roof_window_clearance");
  });

  it("fails closed when the canonical builder receives an invalid candidate", async () => {
    await expect(
      buildConfigurationCandidate(catalog, {
        ...input,
        archetype: "studio-450",
        selections: { ...input.selections, roof: "shed", windows: "tall" },
      }),
    ).rejects.toThrowError("roof_window_clearance");
  });
});
