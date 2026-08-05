import { describe, expect, it } from "vitest";

import {
  buildJurisdictionPageJsonLd,
  jurisdictionPages,
  jurisdictionSlugs,
  officialVerificationWarning,
} from "./jurisdictionPages";

const OFFICIAL_HOSTS = new Set([
  "www.cityofsacramento.gov",
  "planning.saccounty.gov",
  "development.saccounty.gov",
  "mapservices.gis.saccounty.gov",
]);

function allItems(page: (typeof jurisdictionPages)[number]) {
  return [
    ...page.authorityItems,
    ...page.processItems,
    ...page.recordItems,
    ...page.contextItems,
  ];
}

function flattenCopy(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(flattenCopy).join(" ");
  if (value && typeof value === "object") {
    return Object.values(value).map(flattenCopy).join(" ");
  }
  return "";
}

describe("WORK-ORDER-002 jurisdiction content", () => {
  it("defines only the two researched jurisdiction routes", () => {
    expect(jurisdictionSlugs).toEqual(["sacramento", "sacramento-county"]);
    expect(new Set(jurisdictionSlugs).size).toBe(2);
  });

  it("keeps the two jurisdiction pages substantively distinct", () => {
    expect(new Set(jurisdictionPages.map((page) => page.title)).size).toBe(2);
    expect(new Set(jurisdictionPages.map((page) => page.authorityHeading)).size).toBe(2);
    expect(new Set(jurisdictionPages.map((page) => page.processHeading)).size).toBe(2);
    expect(new Set(jurisdictionPages.map((page) => page.recordHeading)).size).toBe(2);
    expect(jurisdictionPages.map((page) => page.peerHref)).toEqual([
      "/adu-builder/sacramento-county",
      "/adu-builder/sacramento",
    ]);
  });

  it("attaches the required warning and an official source to every regulatory item", () => {
    for (const page of jurisdictionPages) {
      for (const item of allItems(page)) {
        expect(item.sources.length).toBeGreaterThan(0);

        if (item.regulatory) {
          expect(item.body).toContain(officialVerificationWarning);
        }

        for (const source of item.sources) {
          expect(source.url).toMatch(/^https:\/\//);
          expect(OFFICIAL_HOSTS.has(new URL(source.url).hostname)).toBe(true);
        }
      }
    }
  });

  it("keeps the public copy outside prohibited claim and contact surfaces", () => {
    const copy = flattenCopy(jurisdictionPages);

    expect(copy).not.toMatch(/\$\s?\d/);
    expect(copy).not.toMatch(/\b\d+\s*(?:day|week|month|year)s?\b/i);
    expect(copy).not.toMatch(/\b(?:your lot qualifies|will be approved|is buildable)\b/i);
    expect(copy).not.toMatch(/mailto:|tel:|book(?:ing)?|schedule a call|contact us/i);
    expect(jurisdictionPages.every((page) => page.nextStepHref === "/studio")).toBe(true);
  });
});

describe("WORK-ORDER-002 structured data", () => {
  it("builds parseable WebPage and BreadcrumbList JSON-LD for both routes", () => {
    for (const page of jurisdictionPages) {
      const jsonLd = buildJurisdictionPageJsonLd(page, "https://westcoastkbp.com");
      const serialized = JSON.stringify(jsonLd);
      const parsed = JSON.parse(serialized);

      expect(parsed["@context"]).toBe("https://schema.org");
      expect(parsed["@graph"].map((node: { "@type": string }) => node["@type"])).toEqual([
        "WebPage",
        "BreadcrumbList",
      ]);
      expect(parsed["@graph"][0].url).toBe(
        `https://westcoastkbp.com/adu-builder/${page.slug}`,
      );
      expect(parsed["@graph"][0].citation.length).toBeGreaterThan(0);
    }
  });
});
