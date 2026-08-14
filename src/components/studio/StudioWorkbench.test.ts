import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const workbench = readFileSync(path.join(ROOT, "src/components/studio/StudioWorkbench.tsx"), "utf8");

describe("Studio lighting integration boundary", () => {
  it("leaves configuration candidate and comparison behavior intact", () => {
    expect(workbench).toContain("buildConfigurationCandidate(catalog, candidateInput)");
    expect(workbench).toContain("candidate.config_hash");
    expect(workbench).toContain("resolveA600ConceptAsset(");
    expect(workbench).toContain("setComparisonOpen((open) => !open)");
  });

  it("introduces no persistence, network, location, or clock binding", () => {
    for (const forbidden of [
      "localStorage",
      "sessionStorage",
      "document.cookie",
      "fetch(",
      "geolocation",
      "URLSearchParams",
      "Date(",
    ]) {
      expect(workbench).not.toContain(forbidden);
    }
  });
});
