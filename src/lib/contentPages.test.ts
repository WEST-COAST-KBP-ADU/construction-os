import { describe, expect, it } from "vitest";

import {
  aboutPage,
  comparePage,
  faqPage,
  officialVerificationWarning,
  processPage,
  servicePages,
  serviceSlugs,
  type FaqItem,
} from "./contentPages";
import {
  buildAboutPageJsonLd,
  buildComparePageJsonLd,
  buildFaqPageJsonLd,
  buildProcessPageJsonLd,
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
    const publicCopy = flattenCopy({
      servicePages,
      aboutPage,
      comparePage,
      processPage,
      faqPage,
    });

    expect(publicCopy).not.toMatch(/\$\s?\d/);
    expect(publicCopy).not.toMatch(/\b\d+\s*(?:day|week|month|year)s?\b/i);
    expect(publicCopy).not.toMatch(/\b(?:your lot qualifies|will be approved|permit-ready|is buildable)\b/i);
  });

  it("keeps the process bounded and owner-controlled", () => {
    expect(processPage.steps.map((step) => step.sequence)).toEqual([
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
    ]);
    expect(flattenCopy(processPage)).toContain("OwnerReview");
    expect(flattenCopy(processPage)).toContain(officialVerificationWarning);
  });

  it("publishes the approved FAQ themes without weakening verification language", () => {
    const items = faqPage.groups.flatMap<FaqItem>((group) => group.items);

    expect(faqPage.groups).toHaveLength(3);
    expect(items).toHaveLength(9);
    expect(new Set(items.map((item) => item.question)).size).toBe(items.length);
    expect(flattenCopy(faqPage)).toContain(officialVerificationWarning);
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

  it("builds WebPage and FAQPage nodes for process and FAQ", () => {
    const processJsonLd = buildProcessPageJsonLd(processPage);
    const faqJsonLd = buildFaqPageJsonLd(faqPage);
    const processTypes = processJsonLd["@graph"].map((node) => node["@type"]);
    const faqTypes = faqJsonLd["@graph"].map((node) => node["@type"]);

    expect(processTypes).toEqual(["WebPage", "FAQPage"]);
    expect(faqTypes).toEqual(["WebPage", "FAQPage"]);
    expect(processJsonLd["@graph"][1].mainEntity).toHaveLength(processPage.faq.length);
    expect(faqJsonLd["@graph"][1].mainEntity).toHaveLength(9);
  });

  it("escapes markup-significant characters during JSON-LD serialization", () => {
    expect(serializeJsonLd({ text: "<script>" })).toContain("\\u003cscript>");
  });
});
