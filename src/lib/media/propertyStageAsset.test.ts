import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import manifest from "../../data/media/property-stage-photo-master.json";

describe("property stage Adobe master", () => {
  it("binds the exact untransformed bytes and PNG dimensions", () => {
    const bytes = readFileSync(resolve(process.cwd(), manifest.asset.path));
    expect(bytes.byteLength).toBe(2_100_199);
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(manifest.asset.sha256);
    expect(bytes.readUInt32BE(16)).toBe(1486);
    expect(bytes.readUInt32BE(20)).toBe(672);
    expect(manifest.asset.transformed).toBe(false);
  });
});
