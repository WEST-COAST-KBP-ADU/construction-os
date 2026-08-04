import { describe, expect, it } from "vitest";

import {
  aboutPage,
  comparePage,
  officialVerificationWarning,
  servicePages,
  serviceSlugs,
} from "./contentPages";
import {
  buildAboutPageJsonLd,
  buildComparePageJsonLd,
  buildServicePageJsonLd,
  serializeJsonLd,
} from "./structuredData";

const EXPECTED_SERVICE_SLUGS = [
  "detached-adu",
  "garage-conversion",
  "attached-adu",
  "jadu",
  "adu-legalization",
];

function flattenCopy(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(flattenCopy).join(" ");
  if (value && typeof value === "object") {
    return Object.values(value).map(flattenCopy).join(" ");
  }
  return "";
}

describe("TASK-0008 service and trust content", () => {
  it("defines exactly the five approved service routes", () => {
    expect(serviceSlugs).toEqual(EXPECTED_SERVICE_SLUGS);
    expect(new Set(serviceSlugs).size).toBe(EXPECTED_SERVICE_SLUGS.length);
  });

  it("keeps every service route substantively distinct", () => {
    const titles = new Set(servicePages.map((page) => page.title));
    const orientations = new Set(servicePages.map((page) => page.orientation.heading));
    const reviewHeadings = new Set(servicePages.map((page) => page.reviewHeading));

    expect(titles.size).toBe(servicePages.length);
    expect(orientations.size).toBe(servicePages.length);
    expect(reviewHeadings.size).toBe(servicePages.length);
  });

  it("carries the official-source warning on every service surface", () => {
    for (const page of servicePages) {
      expect(flattenCopy(page)).toContain(officialVerificationWarning);
    }
  });

  it("does not publish price points, durations, or approval claims", () => {
    const publicCopy = flattenCopy({ servicePages, aboutPage, comparePage });

    expect(publicCopy).not.toMatch(/\$\s?\d/);
    expect(publicCopy).not.toMatch(/\b\d+\s*(?:day|week|month|year)s?\b/i);
    expect(publicCopy).not.toMatch(/\b(?:your lot qualifies|will be approved|permit-ready|is buildable)\b/i);
  });

  it("labels every unavailable business fact as pending owner input", () => {
    expect(aboutPage.pendingFacts.length).toBeGreaterThan(0);
    for (const fact of aboutPage.pendingFacts) {
      expect(fact).toContain("pending owner input");
    }
  });
});

describe("TASK-0008 structured data", () => {
  it("builds Service, WebPage, and FAQPage nodes for every service route", () => {
    for (const page of servicePages) {
      const jsonLd = buildServicePageJsonLd(page);
      const types = jsonLd["@graph"].map((node) => node["@type"]);

      expect(types).toEqual(["Service", "WebPage", "FAQPage"]);
      expect(jsonLd["@graph"][0].url).toBe(
        `https://westcoastkbp.com/services/${page.slug}`,
      );
      expect(jsonLd["@graph"][2].mainEntity).toHaveLength(page.faq.length);
    }
  });

  it("builds FAQPage coverage for about and compare", () => {
    const aboutTypes = buildAboutPageJsonLd(aboutPage)["@graph"].map(
      (node) => node["@type"],
    );
    const compareTypes = buildComparePageJsonLd(comparePage)["@graph"].map(
      (node) => node["@type"],
    );

    expect(aboutTypes).toEqual(["AboutPage", "FAQPage"]);
    expect(compareTypes).toEqual(["WebPage", "FAQPage"]);
  });

  it("escapes markup-significant characters during JSON-LD serialization", () => {
    expect(serializeJsonLd({ text: "<script>" })).toContain("\\u003cscript>");
  });
});
