/**
 * LIVING-PROJECT-HERO-0001 · the composed first fold.
 *
 * These assertions are about the composition, not about either precursor: the
 * two heads each carry their own suite. What is proved here is what only exists
 * once they are mounted together — one public progression, the drafting phases
 * held internal, the drawing contained inside the reserved region and derived
 * from nothing but the adopted profile, the public claim intact, and the Record
 * recipe scoped to this subtree.
 *
 * The render is `renderToStaticMarkup`, which is this repository's convention
 * and is also the no-JavaScript render: everything asserted below is what a
 * reader gets before hydration.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  HOME_BLUEPRINT_PHASE_ORDER,
  HOME_BLUEPRINT_PROJECT_DRAWING,
} from "../../lib/homeBlueprintGeometry";

import HeroBlueprintStage, {
  HERO_BLUEPRINT_STAGE_HEADING_ID,
  HERO_BLUEPRINT_STAGE_PUBLIC_CHAPTERS,
  heroChapterForPhase,
} from "./HeroBlueprintStage";
import PremiumWorkbenchHero from "./PremiumWorkbenchHero";
import {
  BLUEPRINT_MOTION_SLOT_ID,
  HERO_CHAPTERS,
  HERO_CHAPTER_LABELS,
  HERO_RAIL_LABEL,
  HERO_STANDING_CHAPTER,
} from "./premiumWorkbenchHero.contract";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SEQUENCE_STYLE = readFileSync(path.join(HERE, "LiveBlueprintSequence.module.css"), "utf8");
const HERO_STYLE = readFileSync(path.join(HERE, "PremiumWorkbenchHero.module.css"), "utf8");
const sequenceSource = readFileSync(path.join(HERE, "LiveBlueprintSequence.tsx"), "utf8");
const stageSource = readFileSync(path.join(HERE, "HeroBlueprintStage.tsx"), "utf8");
const BRIDGE_STYLE = readFileSync(path.join(HERE, "HeroBlueprintStage.module.css"), "utf8");
/** Declarations only, so prose in the file header cannot satisfy an assertion. */
const BRIDGE_RULES = BRIDGE_STYLE.replaceAll(/\/\*[\s\S]*?\*\//g, "");

function decode(markup: string): string {
  return markup
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

const MARKUP = decode(renderToStaticMarkup(<HeroBlueprintStage />));
const TEXT = MARKUP.replaceAll(/<[^>]+>/g, " ").replaceAll(/\s+/g, " ");

const DRAWING = HOME_BLUEPRINT_PROJECT_DRAWING;

function occurrences(haystack: string, needle: string): number {
  return haystack.split(needle).length - 1;
}

const DISCLOSURE_MARKER = 'data-disclosure="public-claim"';

/** Everything between the reserved region's opening tag and the disclosure strip. */
function slotSubtree(markup: string): string {
  const start = markup.indexOf(`id="${BLUEPRINT_MOTION_SLOT_ID}"`);
  const end = markup.indexOf(DISCLOSURE_MARKER);

  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);

  return markup.slice(start, markup.lastIndexOf("<figcaption", end));
}

/** The public disclosure strip, from its own tag to the end of the figure. */
function disclosureStrip(markup: string): string {
  const marker = markup.indexOf(DISCLOSURE_MARKER);

  expect(marker).toBeGreaterThanOrEqual(0);

  return markup.slice(marker, markup.indexOf("</figcaption>", marker));
}

describe("HeroBlueprintStage · public station mapping", () => {
  it("collapses every drafting phase of one bounded piece of work onto one station", () => {
    expect(HOME_BLUEPRINT_PHASE_ORDER.map(heroChapterForPhase)).toEqual([
      "lead",
      "bounded-work",
      "bounded-work",
      "bounded-work",
      "verified-record",
    ]);
  });

  it("maps every motion phase onto a station the public rail actually renders", () => {
    for (const phase of HOME_BLUEPRINT_PHASE_ORDER) {
      expect(HERO_CHAPTERS).toContain(heroChapterForPhase(phase));
    }
    expect(HERO_BLUEPRINT_STAGE_PUBLIC_CHAPTERS).toEqual(HERO_CHAPTERS);
  });

  it("derives business memory from no phase at all, and says so in one place", () => {
    for (const phase of HOME_BLUEPRINT_PHASE_ORDER) {
      expect(heroChapterForPhase(phase)).not.toBe(HERO_STANDING_CHAPTER);
    }
    // The instrument draws one project; the accumulation across projects is not
    // a state one project passes through, and the module states that.
    expect(stageSource).toContain("business-memory");
  });

  it("keeps exactly one station current at every phase the drawing can reach", () => {
    for (const phase of HOME_BLUEPRINT_PHASE_ORDER) {
      const chapter = heroChapterForPhase(phase);
      const markup = decode(
        renderToStaticMarkup(<PremiumWorkbenchHero activeChapter={chapter} motionPhase={phase} />),
      );

      expect(occurrences(markup, 'data-state="active"')).toBe(1);
      expect(markup).toContain(`data-hero-chapter="${chapter}" data-state="active"`);
      expect(markup).toContain(`data-slot-phase="${phase}"`);
      // The drafting phases are published to the slot, never to the rail.
      for (const internal of ["project", "plan", "build", "record"]) {
        expect(markup).not.toContain(`data-hero-chapter="${internal}"`);
      }
    }
  });
});

describe("HeroBlueprintStage · composed first fold", () => {
  it("publishes exactly one public rail, and it reads the four stations in order", () => {
    expect(occurrences(MARKUP, "<ol")).toBe(1);
    expect(occurrences(MARKUP, `aria-label="${HERO_RAIL_LABEL}"`)).toBe(1);
    expect(MARKUP).not.toContain('aria-label="Blueprint drafting phases"');

    const railOrder = [...MARKUP.matchAll(/data-hero-chapter="([a-z-]+)"/g)].map(
      (match) => match[1],
    );

    expect(railOrder).toEqual(["lead", "bounded-work", "verified-record", "business-memory"]);
  });

  it("reads lead, bounded work, verified record, business memory as visible text", () => {
    for (const chapter of HERO_CHAPTERS) {
      expect(TEXT).toContain(HERO_CHAPTER_LABELS[chapter]);
    }
  });

  it("never surfaces a drafting phase as a public station or a public control", () => {
    for (const internal of ["project", "plan", "build", "record"]) {
      expect(MARKUP).not.toContain(`data-hero-chapter="${internal}"`);
    }
    // The five-phase rail's buttons and the transport are gone with the caption.
    expect(MARKUP).not.toContain("<button");
    expect(MARKUP).not.toContain("Pause sequence");
    expect(MARKUP).not.toContain("Auto-advance off");

    for (const phase of DRAWING.phases) {
      if (phase.id === "plan" || phase.id === "build") {
        expect(MARKUP).not.toContain(`data-project-state="${phase.projectState}"`);
      }
    }
  });

  it("mounts the drawing inside the reserved region and marks the slot filled", () => {
    expect(MARKUP).toContain('data-slot-state="filled"');
    expect(MARKUP).toContain('data-slot-phase="lead"');

    const slot = slotSubtree(MARKUP);

    expect(slot).toContain('data-surface="slot"');
    expect(slot).toContain('data-chapter="project"');
    expect(slot).toContain("<svg");
    // Reduced motion and the server render agree: a complete static frame with
    // the whole public progression legible.
    expect(slot).toContain('data-motion="static"');
    expect(slot).not.toContain('data-revealed="false"');
  });

  it("carries no photographic layer anywhere in the composed fold", () => {
    expect(MARKUP).not.toContain("<img");
    expect(MARKUP).not.toContain("<picture");
    expect(MARKUP).not.toContain("srcset");
    expect(MARKUP).not.toMatch(/\.(?:webp|png|jpe?g|avif)\b/i);
    expect(HERO_STYLE).not.toMatch(/url\(/);
    expect(SEQUENCE_STYLE).not.toMatch(/url\(/);
  });

  it("renders no line the geometry module did not generate", () => {
    const generated = new Set([
      ...DRAWING.paths.map((entry) => entry.d),
      ...DRAWING.dimensions.map((entry) => entry.d),
    ]);
    const rendered = [...MARKUP.matchAll(/ d="([^"]+)"/g)].map((match) => match[1]);

    expect(rendered.length).toBeGreaterThan(0);
    for (const line of rendered) {
      expect(generated.has(line), `ungenerated path in the fold: ${line.slice(0, 40)}`).toBe(true);
    }
    // The composition contributes no drawing of its own, in any primitive.
    for (const primitive of ["<rect", "<circle", "<polygon", "<polyline", "<ellipse"]) {
      expect(MARKUP).not.toContain(primitive);
    }
  });

  it("keeps the public disclosure outside the slot and after it in paint order", () => {
    const slot = slotSubtree(MARKUP);

    // The strip is a sibling of the reserved region, not a descendant of it.
    expect(slot).not.toContain(DISCLOSURE_MARKER);
    expect(MARKUP.indexOf(`id="${BLUEPRINT_MOTION_SLOT_ID}"`)).toBeLessThan(
      MARKUP.indexOf(DISCLOSURE_MARKER),
    );

    // Paint order is stated, not inherited: the slot is its own stacking
    // context pinned below the strip, so nothing mounted in it can reach the claim.
    expect(HERO_STYLE).toMatch(/\.motionSlot\s*\{[\s\S]*?z-index:\s*0/);
    expect(HERO_STYLE).toMatch(/\.disclosure\s*\{[\s\S]*?z-index:\s*1/);
  });

  it("carries exactly one claim boundary, and it is the instrument's own", () => {
    const disclosure = disclosureStrip(MARKUP).replaceAll(/\s+/g, " ");

    expect(disclosure).toContain(DRAWING.recordBlock.disclaimer);
    // No imagery claim survives, because there is no imagery to claim.
    expect(disclosure).not.toContain("Conceptual imagery");
    expect(occurrences(MARKUP, DISCLOSURE_MARKER)).toBe(1);
  });

  it("keeps provenance, measured facts, and the disclaimer in the document", () => {
    expect(TEXT).toContain(DRAWING.provenance.modelId);
    expect(TEXT).toContain(`${DRAWING.metrics.grossAreaSquareFeet} sq ft`);
    expect(TEXT).toContain(DRAWING.recordBlock.disclaimer);
    expect(TEXT).toContain(DRAWING.description);
  });

  it("shows only record facts the drawing already carries", () => {
    // The record block states the profile's own state and nothing beyond it.
    for (const line of DRAWING.recordBlock.lines) {
      expect(TEXT).toContain(line.term);
    }
    expect(TEXT).toContain(DRAWING.provenance.adoptionState);
    expect(TEXT).toContain(DRAWING.provenance.maturity);
    // No invented customer, address, approval, price, schedule, or supplier.
    expect(TEXT).not.toMatch(
      /\bcustomer\b|\bclient name\b|\bsupplier\b|\bapproved\b|\bpermitted\b|\$\d|\bweeks?\b|\bmonths?\b/i,
    );
  });

  it("labels the mounted drawing by the fold it belongs to", () => {
    expect(MARKUP).toContain(`id="${HERO_BLUEPRINT_STAGE_HEADING_ID}"`);
    expect(slotSubtree(MARKUP)).toContain(`aria-labelledby="${HERO_BLUEPRINT_STAGE_HEADING_ID} `);
  });

  it("scopes the Record recipe to exactly one subtree", () => {
    expect(occurrences(MARKUP, "data-o2-premium")).toBe(1);
    expect(MARKUP.indexOf("data-o2-premium")).toBeLessThan(
      MARKUP.indexOf(`id="${BLUEPRINT_MOTION_SLOT_ID}"`),
    );
    expect(MARKUP).toContain('data-component="hero-blueprint-stage"');
  });

  it("keeps both calls to action outside the mounted region and before it in focus order", () => {
    const slot = slotSubtree(MARKUP);

    expect(slot).not.toContain("<a ");
    expect(MARKUP).toContain('href="/studio"');
    expect(MARKUP).toContain('href="/process"');
    // Editorial column first, so focus order runs copy, actions, then the instrument.
    expect(MARKUP.indexOf('href="/studio"')).toBeLessThan(
      MARKUP.indexOf(`id="${BLUEPRINT_MOTION_SLOT_ID}"`),
    );
    expect(MARKUP.indexOf('href="/studio"')).toBeLessThan(MARKUP.indexOf('href="/process"'));
  });
});

describe("HeroBlueprintStage · slot containment and recipe bridge", () => {
  it("contains the drawing inside the slot and reserves the disclosure gutter", () => {
    const slotRules = SEQUENCE_STYLE.slice(
      SEQUENCE_STYLE.indexOf('.figure[data-surface="slot"] {'),
      SEQUENCE_STYLE.indexOf(".slotCaption"),
    );

    expect(slotRules).toMatch(/overflow:\s*hidden/);
    expect(slotRules).toMatch(/inset:\s*0/);
    expect(slotRules).toMatch(/grid-template-rows:\s*minmax\(0, 1fr\) min\(28cqb, 5.5rem\)/);
    // Pointer events stay live so the sequence's hover pause still fires; the
    // slot only ever covers the instrument column, never the calls to action.
    expect(slotRules).not.toMatch(/pointer-events:\s*none/);
    expect(sequenceSource).toContain("onPointerEnter");
    // Nothing in the slot variant can raise itself out of the stacking context.
    expect(slotRules).not.toContain("z-index");
  });

  it("keeps the sheet a drafting sheet on a field, never a card floating over one", () => {
    const sheetRules = SEQUENCE_STYLE.slice(
      SEQUENCE_STYLE.indexOf('.figure[data-surface="slot"] .sheet'),
      SEQUENCE_STYLE.indexOf(".slotCaption"),
    );

    expect(sheetRules).toMatch(/border:\s*0/);
    expect(sheetRules).toMatch(/border-radius:\s*0/);
    expect(sheetRules).toMatch(/box-shadow:\s*none/);
    expect(sheetRules).not.toMatch(/box-shadow:\s*inset/);
    expect(sheetRules).toMatch(/max-block-size:\s*100%/);
    // It separates from the hero's field by tone: the lit paper plane on the
    // plane one step below it.
    expect(sheetRules).toMatch(/background-color:\s*var\(--blueprint-paper-light\)/);
    expect(HERO_STYLE).toMatch(
      /\.instrument\s*\{[\s\S]*?background:\s*var\(--pwh-table\)/,
    );
  });

  it("keeps the suppressed caption in the document rather than display:none", () => {
    const captionRules = SEQUENCE_STYLE.slice(
      SEQUENCE_STYLE.indexOf(".slotCaption {"),
      SEQUENCE_STYLE.indexOf("/* ------------------------------------------------------------------ caption */"),
    );

    expect(captionRules).not.toMatch(/display:\s*none/);
    expect(captionRules).not.toMatch(/visibility:\s*hidden/);
    expect(captionRules).toMatch(/clip-path:\s*inset\(50%\)/);
  });

  it("keeps motion subordinate: no autoplay on mobile, and a pause on every signal", () => {
    // The mounted instrument is the only thing in the fold that moves, and the
    // conditions it moves under are the ones it publishes.
    expect(sequenceSource).toContain("COMPACT_VIEWPORT_QUERY");
    expect(sequenceSource).toMatch(/!conditions\.compact/);
    expect(sequenceSource).toMatch(/!conditions\.reducedMotion/);
    expect(sequenceSource).toMatch(/!conditions\.documentHidden/);
    expect(sequenceSource).toMatch(/!conditions\.interacting/);
    // The composition itself schedules nothing.
    for (const scheduler of ["setTimeout", "setInterval", "requestAnimationFrame"]) {
      expect(stageSource).not.toContain(scheduler);
    }
    // No parallax, drift, glow, or scroll hijack anywhere in the fold's paint.
    for (const style of [HERO_STYLE, SEQUENCE_STYLE]) {
      // Keyframed motion is the thing being refused; the only `animation`
      // declaration either file carries is the reduced-motion `none` reset.
      expect(style).not.toMatch(
        /scroll-behavior|perspective:|filter:\s*blur|@keyframes|animation-name/i,
      );
    }
  });

  it("re-points base tokens onto the recipe without redefining or globalising it", () => {
    // Copper discipline: `copper-text` is the only step reachable by type.
    expect(BRIDGE_RULES).toMatch(/--color-gold-deep:\s*var\(--o2-copper-text\)/);
    expect(BRIDGE_RULES).toMatch(/--color-gold:\s*var\(--o2-copper-line\)/);
    expect(BRIDGE_RULES).not.toMatch(/--color-[a-z-]+:\s*var\(--o2-copper-(?:mark|wash)\)/);

    // Duration reconciliation lands on the recipe's own scale.
    expect(BRIDGE_RULES).toMatch(/--duration-standard:\s*var\(--o2-duration-standard\)/);
    expect(BRIDGE_RULES).toMatch(/--easing-standard:\s*var\(--o2-easing-standard\)/);

    // The annotation ink the #235 contrast condition names is re-pointed at the
    // recipe's graphite step rather than left on the shell's subtle ink.
    expect(BRIDGE_RULES).toMatch(/--color-ink-subtle:\s*var\(--o2-graphite-annotation\)/);

    // The disclosure ground stays a surface token, never an ink token.
    expect(BRIDGE_RULES).toMatch(/--color-forest-deep-surface:\s*var\(--o2-surface-inverse\)/);

    // The instrument field and the sheet resolve to two different planes.
    expect(BRIDGE_RULES).toMatch(/--color-surface-muted:\s*var\(--o2-paper-shade\)/);
    expect(BRIDGE_RULES).toMatch(/--color-surface:\s*var\(--o2-surface-raised\)/);

    // No `--o2-*` value is redefined and the bridge writes exactly one selector.
    expect(BRIDGE_RULES).not.toMatch(/^\s*--o2-[a-z-]+:/m);

    // Exactly one selector, and it is the scoped class — no `:root`, no element
    // selector, nothing that could reach outside the stage.
    const selectors = (BRIDGE_RULES.match(/^[^\s@}][^{]*(?=\{)/gm) ?? []).map((selector) =>
      selector.trim(),
    );

    expect(selectors).toEqual([".stage"]);
  });
});
