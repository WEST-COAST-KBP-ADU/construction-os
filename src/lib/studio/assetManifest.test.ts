import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import catalogData from "../../data/studio/catalog/releases/2026.08.0.json";

import { STUDIO_ASSET_MANIFEST, resolveStudioAsset } from "./assetManifest";
import type { StudioCatalog } from "./types";

const catalog = catalogData as StudioCatalog;
const approvedStudioAssetDigest =
  "0bf4bfa2306311e10a9420c7b0fb9c5b89eb200eadf71e9bc5d875bbc8bb3334";

function readPublicAsset(publicPath: string): Buffer {
  return readFileSync(resolve(process.cwd(), "public", publicPath.slice(1)));
}

describe("studio asset manifest", () => {
  it("maps exactly the licensed catalog refs used by every archetype", () => {
    const manifestRefs = Object.keys(STUDIO_ASSET_MANIFEST).sort();
    const licensedRefs = catalog.assets.map((asset) => asset.ref);
    const archetypeRefs = catalog.archetypes.map((archetype) => archetype.geometry_ref);

    expect(new Set(licensedRefs).size).toBe(licensedRefs.length);
    expect(manifestRefs).toEqual([...licensedRefs].sort());
    expect(manifestRefs).toEqual([...new Set(archetypeRefs)].sort());
  });

  it("resolves every supported ref through the canonical public path", () => {
    for (const [ref, publicPath] of Object.entries(STUDIO_ASSET_MANIFEST)) {
      expect(resolveStudioAsset(ref)).toBe(publicPath);
    }
  });

  it("proves every mapped WebP is repository-controlled and decodable by signature", () => {
    for (const publicPath of Object.values(STUDIO_ASSET_MANIFEST)) {
      expect(publicPath).toMatch(/^\/images\/[a-z0-9-]+\.webp$/);

      const bytes = readPublicAsset(publicPath);
      expect(bytes.length).toBeGreaterThan(12);
      expect(bytes.subarray(0, 4).toString("ascii")).toBe("RIFF");
      expect(bytes.subarray(8, 12).toString("ascii")).toBe("WEBP");
    }
  });

  it("pins the Owner-selected Studio 450 bytes", () => {
    const bytes = readPublicAsset(resolveStudioAsset("assets/images/adu-courtyard@1"));
    const digest = createHash("sha256").update(bytes).digest("hex");

    expect(digest).toBe(approvedStudioAssetDigest);
  });

  it.each(["assets/images/unknown@1", "toString", "__proto__", null, undefined])(
    "fails closed for unsupported or absent geometry ref %s",
    (ref) => {
      expect(() => resolveStudioAsset(ref)).toThrowError("unknown_geometry_ref");
    },
  );
});
