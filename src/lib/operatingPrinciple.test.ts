import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  OPERATING_PRINCIPLE_COPY,
  OPERATING_PRINCIPLE_POINTS,
  OPERATING_PRINCIPLE_RECORD_LABEL,
  OPERATING_PRINCIPLE_RECORD_PATH,
  OPERATING_PRINCIPLE_RECORD_SHA,
  OPERATING_PRINCIPLE_RECORD_URL,
  OPERATING_PRINCIPLE_TITLE_ID,
} from "./operatingPrinciple";

/**
 * KBPOS-PUBLIC-FACADE-0001 — the "under the hood" band states an architecture
 * that is being built, about this product only, against a committed record.
 *
 * These are claims assertions, not copy assertions. They fail when a later
 * edit turns a design intention into a shipped fact, reaches across the
 * Product 1 boundary, or drifts the anchor off an exact commit — which is why
 * they test the module rather than the rendered words.
 */

/** Every public string this module publishes, as one haystack. */
const copy = [
  ...Object.values(OPERATING_PRINCIPLE_COPY),
  ...OPERATING_PRINCIPLE_POINTS.flatMap((point) => [point.title, point.body]),
  OPERATING_PRINCIPLE_RECORD_LABEL,
].join(" ");

describe("KBPOS-PUBLIC-FACADE-0001 operating-principle band", () => {
  it("speaks in design-language grammar, never as a shipped system", () => {
    // The record is a contract. `is being built to` is the only tense that
    // states this truthfully on a public surface.
    expect(OPERATING_PRINCIPLE_COPY.heading).toContain("is being built to");

    for (const point of OPERATING_PRINCIPLE_POINTS) {
      expect(point.body).toMatch(/is being built|are being built/);
    }

    expect(copy).not.toMatch(
      /\bruns on\b|\bpowered by\b|\bis built on\b|\balready (?:runs|uses|does)\b|\bproduction[- ]ready\b|\blive today\b/i,
    );
  });

  it("stays inside Product 2's own architecture", () => {
    // The adopted Deedseal sentence is the only place this site speaks about
    // that relationship. This band must not add a second, unadopted one.
    expect(copy).not.toMatch(/deedseal|product 1|kbp core|integrat/i);
  });

  it("makes no commercial, regulatory, or credential claim", () => {
    expect(copy).not.toMatch(
      /licensed|insured|certifi|accredit|partner|guarantee|warrant|permit|zoning|buildabilit/i,
    );
    expect(copy).not.toMatch(/\$\s?\d|\b\d+\s*(?:day|week|month|year)s?\b/i);
  });

  it("anchors to a record committed in this repository, at an exact commit", () => {
    expect(OPERATING_PRINCIPLE_RECORD_SHA).toMatch(/^[0-9a-f]{40}$/);
    expect(existsSync(resolve(process.cwd(), OPERATING_PRINCIPLE_RECORD_PATH))).toBe(true);

    expect(OPERATING_PRINCIPLE_RECORD_URL).toBe(
      "https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/" +
        OPERATING_PRINCIPLE_RECORD_SHA +
        "/" +
        OPERATING_PRINCIPLE_RECORD_PATH,
    );
    // A branch reference would let the destination drift away from the wording
    // it supports; only a commit is immutable.
    expect(OPERATING_PRINCIPLE_RECORD_URL).not.toMatch(/\/blob\/(?:main|master|refs\/heads\/)/);
  });

  it("publishes exactly three points and one stable heading id", () => {
    expect(OPERATING_PRINCIPLE_POINTS).toHaveLength(3);
    expect(OPERATING_PRINCIPLE_POINTS.map((point) => point.id)).toEqual([
      "person-decides",
      "facts-keep-their-source",
      "summary-is-never-a-source",
    ]);
    expect(OPERATING_PRINCIPLE_TITLE_ID).toBe("operating-principle-title");
  });

  it("keeps the public wording free of internal engineering vocabulary", () => {
    expect(copy).not.toMatch(
      /\bnode\b|\bedge\b|\bschema\b|\btenant\b|\btraversal\b|\bdata plane\b|\bAPI\b|\bpipeline\b|\bplatform\b/i,
    );
  });
});
