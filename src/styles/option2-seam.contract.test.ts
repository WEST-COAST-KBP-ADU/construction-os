import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  OPTION2_PREMIUM_SCOPE,
  TOKEN_PREFIX,
  WCAG_AA_NORMAL,
  WCAG_NON_TEXT,
  buildPalette,
  contrastRatio,
  parseTokenFile,
} from "./option2-premium.contract";

/**
 * KBPOS-DEEDSEAL-CROSSLINK-O2-0001 — the seam belongs to the Option 2 system.
 *
 * The cross-reference strip is the crossing from Product 2 to Product 1. Issue
 * #367 requires that crossing to be visually part of the premium system rather
 * than a shell-token row above the footer, and requires it without a redesign.
 *
 * This suite holds the *bridge*, not a second copy of the recipe. It never
 * restates a color: every ratio below is computed from the values
 * `option2-premium.tokens.css` actually declares, so a token edit that would
 * push a word on this band under its floor fails here as well as in the recipe's
 * own contract.
 */

const stylesheet = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");
const page = readFileSync(resolve(process.cwd(), "app/page.tsx"), "utf8");
const tokens = readFileSync(
  resolve(process.cwd(), "src/styles/option2-premium.tokens.css"),
  "utf8",
);

const palette = buildPalette(parseTokenFile(tokens));

/** The `.spine-crosslink` rule body, brace-matched so a later rule cannot leak in. */
function ruleBody(selector: string): string {
  const start = stylesheet.indexOf(`${selector} {`);
  expect(start, `${selector} is not declared in app/globals.css`).toBeGreaterThan(-1);
  const open = stylesheet.indexOf("{", start);
  let depth = 0;
  let cursor = open;
  while (cursor < stylesheet.length) {
    if (stylesheet[cursor] === "{") depth += 1;
    if (stylesheet[cursor] === "}") {
      depth -= 1;
      if (depth === 0) break;
    }
    cursor += 1;
  }
  return stylesheet.slice(open + 1, cursor);
}

const seam = ruleBody(".spine-crosslink");

/** Resolves a declared `var(--o2-x)` reference to the hex the recipe gives it. */
function bridged(baseToken: string): string {
  const match = seam.match(
    new RegExp(`${baseToken.replace(/[-]/g, "\\-")}:\\s*var\\((--o2-[a-z0-9-]+)\\)`),
  );
  expect(match, `${baseToken} is not bridged to an --o2-* step`).not.toBeNull();
  const value = palette.get(match![1].slice(TOKEN_PREFIX.length));
  expect(value, `${match![1]} is not a registered Option 2 color`).toBeDefined();
  return value!;
}

describe("KBPOS-DEEDSEAL-CROSSLINK-O2-0001 the seam is inside the recipe", () => {
  it("opts the strip into the recipe scope on the element itself", () => {
    const aside = page.slice(
      page.indexOf('<aside className="spine-crosslink"'),
      page.indexOf("</aside>"),
    );
    expect(aside).toContain("data-o2-premium");
    // The scope the recipe declares is the attribute the page sets.
    expect(OPTION2_PREMIUM_SCOPE).toBe("[data-o2-premium]");
  });

  it("bridges the base tokens its children read, rather than restyling them", () => {
    for (const token of [
      "--color-canvas",
      "--color-line",
      "--color-line-strong",
      "--color-ink-muted",
      "--color-forest-deep",
      "--color-focus",
    ]) {
      expect(seam).toMatch(new RegExp(`${token}:\\s*var\\(--o2-`));
    }
    // `.text-link` keeps its own rule; the seam must not fork a copy of it.
    expect(stylesheet).not.toContain(".spine-crosslink .text-link");
    expect(stylesheet).not.toContain(".spine-crosslink__statement .text-link");
  });

  it("redefines no --o2-* token and writes nothing at :root", () => {
    // A bridge reads the recipe. Assigning an `--o2-*` name here would be this
    // band quietly authoring its own recipe under the recipe's prefix.
    expect(seam).not.toMatch(/--o2-[a-z0-9-]+\s*:/);
  });

  it("grounds the band on the recipe's own daylight sheet", () => {
    expect(seam).toMatch(/background:\s*var\(--o2-wash-daylight\)/);
    // Copper is cleared for marks and hairlines only, never for type.
    expect(seam).toMatch(/border-top:[^;]*var\(--o2-copper-line\)/);
    expect(seam).not.toMatch(/color:\s*var\(--o2-copper/);
  });

  it("clears every contrast floor at the wash's darkest step", () => {
    // The ground is a 135deg gradient across three exposure steps, so any word
    // on this band can sit over the darkest of them. That is the case tested.
    const worstGround = palette.get("paper-shade");
    expect(worstGround).toBeDefined();

    const statement = bridged("--color-ink-muted");
    const linkText = bridged("--color-forest-deep");
    const linkUnderline = bridged("--color-line-strong");
    const hairline = palette.get("copper-line")!;

    expect(contrastRatio(statement, worstGround!)).toBeGreaterThanOrEqual(
      WCAG_AA_NORMAL,
    );
    expect(contrastRatio(linkText, worstGround!)).toBeGreaterThanOrEqual(
      WCAG_AA_NORMAL,
    );
    expect(contrastRatio(linkUnderline, worstGround!)).toBeGreaterThanOrEqual(
      WCAG_NON_TEXT,
    );
    expect(contrastRatio(hairline, worstGround!)).toBeGreaterThanOrEqual(
      WCAG_NON_TEXT,
    );
  });

  it("keeps the adopted wording untouched by this packet", () => {
    // The bridge is a styling change. If it ever starts editing the sentence,
    // that is a claims change wearing a stylesheet's clothes.
    expect(page).toContain("{DEEDSEAL_CROSS_REFERENCE_LEAD}");
    expect(page).toContain("{DEEDSEAL_CROSS_REFERENCE_LINK_TEXT}");
    expect(page).toContain("{DEEDSEAL_CROSS_REFERENCE_TAIL}");
  });
});
