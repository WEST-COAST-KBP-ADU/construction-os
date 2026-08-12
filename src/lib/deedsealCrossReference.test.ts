import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  DEEDSEAL_CROSS_REFERENCE_LEAD,
  DEEDSEAL_CROSS_REFERENCE_LINK_TEXT,
  DEEDSEAL_CROSS_REFERENCE_SENTENCE,
  DEEDSEAL_CROSS_REFERENCE_TAIL,
  DEEDSEAL_PROOF_RECORD_LABEL,
  DEEDSEAL_PROOF_RECORD_SHA,
  DEEDSEAL_PROOF_RECORD_URL,
  DEEDSEAL_PUBLIC_URL,
} from "./deedsealCrossReference";

const page = readFileSync(resolve(process.cwd(), "app/page.tsx"), "utf8");
const stylesheet = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");

const block = page.slice(page.indexOf('<aside className="spine-crosslink"'));
const normalizedBlock = block.replace(/\s+/g, " ");

/**
 * The wording adopted by the Owner in
 * kbp-core-engineering/kbp-dev-office#363 (comment 5267717279). Held here as a
 * literal so a reword anywhere in the module or the page fails this suite.
 */
const ADOPTED_SENTENCE =
  "KBP OS is the first user of Deedseal. The public integration record is not yet available; view Deedseal’s current public proof.";

describe("KBPOS-DEEDSEAL-CROSSLINK-0001 public cross-reference", () => {
  it("reassembles the adopted wording byte-exactly", () => {
    expect(DEEDSEAL_CROSS_REFERENCE_SENTENCE).toBe(ADOPTED_SENTENCE);
    expect(
      DEEDSEAL_CROSS_REFERENCE_LEAD +
        DEEDSEAL_CROSS_REFERENCE_LINK_TEXT +
        DEEDSEAL_CROSS_REFERENCE_TAIL,
    ).toBe(ADOPTED_SENTENCE);
  });

  it("keeps both adopted sentences intact and in order", () => {
    expect(DEEDSEAL_CROSS_REFERENCE_SENTENCE).toContain(
      "KBP OS is the first user of Deedseal.",
    );
    expect(DEEDSEAL_CROSS_REFERENCE_SENTENCE).toContain(
      "The public integration record is not yet available;",
    );
    expect(DEEDSEAL_CROSS_REFERENCE_SENTENCE.indexOf("first user")).toBeLessThan(
      DEEDSEAL_CROSS_REFERENCE_SENTENCE.indexOf("not yet available"),
    );
  });

  it("links exactly the word `proof` to the Deedseal public surface", () => {
    expect(DEEDSEAL_CROSS_REFERENCE_LINK_TEXT).toBe("proof");
    expect(DEEDSEAL_PUBLIC_URL).toBe("https://deedseal.com");
    expect(DEEDSEAL_CROSS_REFERENCE_LEAD.endsWith("current public ")).toBe(true);
    expect(DEEDSEAL_CROSS_REFERENCE_TAIL).toBe(".");
  });

  it("pins the proof record link to an immutable commit, never a branch", () => {
    expect(DEEDSEAL_PROOF_RECORD_SHA).toBe("ae60603a001387fcdbb9f25628b3bfbc015e2311");
    expect(DEEDSEAL_PROOF_RECORD_SHA).toMatch(/^[0-9a-f]{40}$/);
    expect(DEEDSEAL_PROOF_RECORD_URL).toBe(
      "https://github.com/deedseal/deedseal/blob/ae60603a001387fcdbb9f25628b3bfbc015e2311/docs/proof/2026-08-12-neural-memory.md",
    );
    expect(DEEDSEAL_PROOF_RECORD_URL).not.toMatch(/\/blob\/(?:main|master|HEAD)\//);
    expect(DEEDSEAL_PROOF_RECORD_LABEL).toBe("Deedseal public proof record");
  });

  it("renders the block on the homepage before the footer", () => {
    expect(page).toContain('<aside className="spine-crosslink"');
    expect(page.match(/className="spine-crosslink"/g)).toHaveLength(1);
    expect(page.indexOf('className="spine-crosslink"')).toBeGreaterThan(
      page.indexOf('aria-labelledby="final-exits-title"'),
    );
    expect(page.indexOf('className="spine-crosslink"')).toBeLessThan(page.indexOf("</main>"));
    expect(block).toContain('aria-label="Deedseal reference"');
  });

  it("renders the sentence from the module rather than inline copy", () => {
    expect(block).toContain("{DEEDSEAL_CROSS_REFERENCE_LEAD}");
    expect(block).toContain("{DEEDSEAL_CROSS_REFERENCE_LINK_TEXT}");
    expect(block).toContain("{DEEDSEAL_CROSS_REFERENCE_TAIL}");
    expect(page).toContain('from "@/src/lib/deedsealCrossReference"');
  });

  it("carries both required links as external references", () => {
    expect(normalizedBlock).toContain(
      '<a href={DEEDSEAL_PUBLIC_URL} className="text-link" rel="noreferrer"> {DEEDSEAL_CROSS_REFERENCE_LINK_TEXT} </a>',
    );
    expect(normalizedBlock).toContain(
      '<a href={DEEDSEAL_PROOF_RECORD_URL} className="text-link" rel="noreferrer"> {DEEDSEAL_PROOF_RECORD_LABEL}',
    );
    expect(block.match(/<a /g)).toHaveLength(2);
  });

  it("adds no claim beyond the adopted wording", () => {
    expect(normalizedBlock).not.toMatch(/\$\s?\d|\b\d+\s*(?:day|week|month|year)s?\b/i);
    expect(normalizedBlock).not.toMatch(
      /powered by|integrated|integration is|now available|live|deployed|certified|partner/i,
    );
    expect(DEEDSEAL_CROSS_REFERENCE_SENTENCE).not.toMatch(/powered by|deployed|certified/i);
  });

  it("styles the block as a compact strip", () => {
    expect(stylesheet).toContain(".spine-crosslink {");
    expect(stylesheet).toContain(".spine-crosslink__inner {");
    expect(stylesheet).toContain(".spine-crosslink__statement,");
    expect(stylesheet).toContain(".spine-crosslink__record {");
  });
});
