import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const readCanon = (version: "v1.0" | "v1.1") =>
  readFileSync(
    resolve(process.cwd(), `governance/product/PRODUCT-BOUNDARIES-${version}.md`),
    "utf8",
  );

const v1 = readCanon("v1.0");
const v11 = readCanon("v1.1");

const PRODUCT_1_CROSS_REFERENCE =
  "KBP OS is the first user of Deedseal. The public integration record is not yet available; view Deedseal’s current public proof.";

describe("Product Boundaries v1.1 canon", () => {
  it("keeps the frozen v1.0 bytes exact", () => {
    expect(createHash("sha256").update(v1).digest("hex")).toBe(
      "c1df149da6839518ddaaea5b834b83308a536d118d122c53091f8387d636f6f9",
    );
  });

  it("explicitly supersedes v1.0 under Owner decision #298", () => {
    expect(v11).toContain("# PRODUCT-BOUNDARIES v1.1");
    expect(v11).toContain("Supersedes: [`PRODUCT-BOUNDARIES-v1.0.md`");
    expect(v11).toContain("/construction-os/issues/298");
  });

  it("preserves the Product 1 cross-reference byte-for-byte", () => {
    expect(v11.match(new RegExp(PRODUCT_1_CROSS_REFERENCE, "g"))).toHaveLength(1);
  });

  it("keeps real address and GIS direction not opened", () => {
    expect(v11).toContain("real-address/GIS remains `DIRECTION · NOT OPENED`");
    expect(v11).toContain("Реальный адрес, parcel/GIS и geometric-fit screening остаются\n**DIRECTION · NOT OPENED**");
    expect(v11).not.toMatch(/(?:address|parcel\/GIS|geometric-fit)[^\n|]*\*\*TODAY\*\*/i);
  });

  it("retains the exact uncertain-screening wording and claim ceiling", () => {
    expect(v11).toContain("`Requires official source verification.`");
    for (const prohibitedConclusion of [
      "survey boundary",
      "zoning",
      "code",
      "permit",
      "eligibility",
      "feasibility",
      "buildability",
      "construction readiness",
      "price",
      "schedule",
      "utility",
      "title/easement",
      "grading",
      "fire-access",
    ]) {
      expect(v11).toContain(prohibitedConclusion);
    }
  });

  it("keeps superseded visual inputs historical and non-mergeable", () => {
    expect(v11).toMatch(
      /kbp-dev-office#383[\s\S]*kbp-dev-office#461[\s\S]*SUPERSEDED — HISTORICAL EVIDENCE ONLY[\s\S]*not selected or mergeable authority/,
    );
    expect(v11).toMatch(
      /construction-os#256[\s\S]*SUPERSEDED — HISTORICAL EVIDENCE ONLY[\s\S]*not an implementation input or mergeable authority/,
    );
  });
});
