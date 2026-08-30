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

/** The twelve ordered stages ADU-PROCESS-IMPLEMENTATION-001 requires on /process. */
const EXPECTED_STAGE_TITLES = [
  "Intent and constraints",
  "Property facts of record",
  "Jurisdiction path and constraint research",
  "Concept selection and configuration",
  "Scope, budget basis, and written agreement",
  "Design documentation",
  "Engineering, energy, and consultant packages",
  "Permit submittal and review cycles",
  "Procurement and supplier commitments",
  "Site work and construction",
  "Inspections and corrections",
  "Closeout and handover",
];

const EXPECTED_STAGE_SEQUENCES = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
];

/**
 * Stages whose copy restates something an authority publishes or requires.
 * Each must carry the official-source warning per governance/BOUNDARIES.md.
 */
const JURISDICTION_DERIVED_STAGES = ["03", "05", "06", "07", "08", "11"];

/** A responsible party is always a human, a professional, a supplier, or an authority. */
const RESPONSIBLE_PARTY_VOCABULARY =
  /\b(?:you|owner|client|licensed|professional|contractor|surveyor|supplier|inspector|agency|authority|superintendent|applicant|person)\b/i;

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
    expect(flattenCopy(processPage)).toContain(officialVerificationWarning);
    expect(flattenCopy(processPage)).toContain("no form");
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

describe("ADU-PROCESS-IMPLEMENTATION-001 twelve-stage construction journey", () => {
  it("publishes exactly the twelve required stages in the required order", () => {
    expect(processPage.stages).toHaveLength(EXPECTED_STAGE_TITLES.length);
    expect(processPage.stages.map((stage) => stage.title)).toEqual(EXPECTED_STAGE_TITLES);
    expect(processPage.stages.map((stage) => stage.sequence)).toEqual(EXPECTED_STAGE_SEQUENCES);
  });

  it("gives every stage a homeowner question, a responsible party, an output, and a blocker", () => {
    for (const stage of processPage.stages) {
      expect(stage.question.endsWith("?"), stage.title).toBe(true);
      expect(stage.description.length, stage.title).toBeGreaterThan(0);
      expect(stage.output.length, stage.title).toBeGreaterThan(0);
      expect(stage.blocker.length, stage.title).toBeGreaterThan(0);
      expect(stage.responsibleParty, stage.title).toMatch(RESPONSIBLE_PARTY_VOCABULARY);
    }

    const questions = processPage.stages.map((stage) => stage.question);
    const blockers = processPage.stages.map((stage) => stage.blocker);

    expect(new Set(questions).size).toBe(questions.length);
    expect(new Set(blockers).size).toBe(blockers.length);
  });

  it("carries the official-source warning on every jurisdiction-derived stage", () => {
    for (const sequence of JURISDICTION_DERIVED_STAGES) {
      const stage = processPage.stages.find((item) => item.sequence === sequence);

      expect(stage, sequence).toBeDefined();
      expect(flattenCopy(stage), sequence).toContain(officialVerificationWarning);
    }
  });

  it("keeps internal vocabulary out of the customer-facing journey", () => {
    expect(flattenCopy(processPage)).not.toMatch(
      /\b(?:graph|graphs|node|nodes|edge|edges|packet|packets|lane|lanes|gate|gates|schema|hash|truth class)\b/i,
    );
  });

  it("never lets software hold an approval, a purchase, a filing, or a certification", () => {
    const sentences = flattenCopy(processPage)
      .split(/(?<=\.)\s+/)
      .filter((sentence) => /\b(?:software|ai|portal|platform)\b/i.test(sentence));

    expect(sentences.length).toBeGreaterThan(0);

    for (const sentence of sentences) {
      expect(sentence).toMatch(/\b(?:no|not|never|nothing|cannot)\b/i);
    }
  });

  it("publishes no calendar year, projected permit date, or promised completion", () => {
    const journeyCopy = flattenCopy(processPage);

    expect(journeyCopy).not.toMatch(/\bprojected (?:permit|approval|completion) date\b/i);
    expect(journeyCopy).not.toMatch(/\b(?:19|20)\d{2}\b/);
    expect(journeyCopy).toContain("never a projected decision date");

    // Every guarantee or promise on the page is negated, or is the question a
    // homeowner asks before the answer negates it.
    const claims = journeyCopy
      .split(/(?<=[.?])\s+/)
      .filter((sentence) => /\b(?:guarantee|guarantees|promise|promises|promised)\b/i.test(sentence));

    expect(claims.length).toBeGreaterThan(0);

    for (const claim of claims) {
      expect(claim, claim).toMatch(/\b(?:no|not|never|nothing)\b|\?$/i);
    }
  });

  it("collects nothing and keeps the public no-form boundary intact", () => {
    const journeyCopy = flattenCopy(processPage);

    expect(journeyCopy).toContain(
      "no form, account, upload, storage, tracking, booking, or message path",
    );
    expect(journeyCopy).not.toMatch(/\b(?:email address|phone number|street address|upload your)\b/i);
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
