import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import ProjectJourneyHero, {
  nextBeatIndex,
  projectJourneyBeats,
  projectJourneyDecisionBeatIndex,
  projectJourneyHeroCopy,
  projectJourneyHeroCtas,
} from "./ProjectJourneyHero";

/*
 * The repository test stack runs on Node without a DOM, so the component is
 * exercised through `react-dom/server`. That is the state that matters most
 * here: the markup a browser receives before any script runs must already be
 * the fully readable static hero.
 */
const staticMarkup = renderToStaticMarkup(<ProjectJourneyHero />);

const source = readFileSync(
  resolve(process.cwd(), "src/components/home/ProjectJourneyHero.tsx"),
  "utf8",
);
const stylesheet = readFileSync(
  resolve(process.cwd(), "src/components/home/ProjectJourneyHero.module.css"),
  "utf8",
);
const declarations = stylesheet.replace(/\/\*[\s\S]*?\*\//g, "");

function decodeEntities(markup: string): string {
  return markup
    .replaceAll("&#x27;", "'")
    .replaceAll("&quot;", '"')
    .replaceAll("&amp;", "&");
}

function textOf(markup: string): string {
  return decodeEntities(markup.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

const staticText = textOf(staticMarkup);

describe("HERO-SCENARIO-IMPLEMENTATION-001 first fold", () => {
  it("opens on the pre-release kicker, one H1, and the grounded lede", () => {
    expect(projectJourneyHeroCopy.kicker).toBe(
      "Construction OS — pre-release product preview",
    );
    expect(staticText).toContain(projectJourneyHeroCopy.kicker);

    const headings = staticMarkup.match(/<h1\b/g) ?? [];

    expect(headings).toHaveLength(1);
    expect(staticMarkup).toContain('<h1 id="home-hero-title"');
    expect(staticText).toContain(projectJourneyHeroCopy.headline);
    expect(staticText).toContain(projectJourneyHeroCopy.lede);

    // Two lines at 1440 and three at 390 are a layout budget, so the copy that
    // has to fit inside it is bounded here rather than left to reflow.
    expect(projectJourneyHeroCopy.headline.length).toBeLessThanOrEqual(64);
    expect(projectJourneyHeroCopy.lede).toMatch(/decide|decision/);
    expect(projectJourneyHeroCopy.lede.length).toBeLessThanOrEqual(200);
  });

  it("carries exactly two CTAs pointing at existing routes", () => {
    const anchors = staticMarkup.match(/<a\b[^>]*>/g) ?? [];

    expect(anchors).toHaveLength(2);
    expect(projectJourneyHeroCtas.map((cta) => cta.href)).toEqual(["/studio", "/process"]);
    expect(projectJourneyHeroCtas.map((cta) => cta.label)).toEqual([
      "Open Concept Studio",
      "See how a project runs",
    ]);

    for (const cta of projectJourneyHeroCtas) {
      expect(staticMarkup).toContain(`href="${cta.href}"`);
      expect(staticText).toContain(cta.label);
    }

    // Navigation only: no query payload, no form, no intake of any kind.
    expect(staticMarkup).not.toMatch(/href="[^"]*[?#]/);
    expect(staticMarkup).not.toMatch(/<(?:form|input|textarea|select|label)\b/i);
  });

  it("renders all five beat sentences in DOM order", () => {
    expect(projectJourneyBeats).toHaveLength(5);

    const positions = projectJourneyBeats.map((beat) =>
      decodeEntities(staticMarkup).indexOf(beat.sentence),
    );

    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((left, right) => left - right));
    expect(projectJourneyBeats.map((beat) => beat.id)).toEqual([
      "B1_INTENT",
      "B2_FACTS",
      "B3_ORGANIZED",
      "B4_DECISION",
      "B5_RECORD",
    ]);
  });

  it("makes the human decision the only marked beat", () => {
    const decisionBeat = projectJourneyBeats[projectJourneyDecisionBeatIndex];
    const markers = staticMarkup.match(/decisionMarker/g) ?? [];

    expect(projectJourneyDecisionBeatIndex).toBe(3);
    expect(markers).toHaveLength(1);
    expect(decisionBeat.id).toBe("B4_DECISION");
    expect(decisionBeat.sentence).toContain("nothing moves until you make it");

    const markerPosition = staticMarkup.indexOf("decisionMarker");
    const decisionPosition = decodeEntities(staticMarkup).indexOf(decisionBeat.sentence);
    const organizedPosition = decodeEntities(staticMarkup).indexOf(
      projectJourneyBeats[2].sentence,
    );

    expect(markerPosition).toBeGreaterThan(organizedPosition);
    expect(markerPosition).toBeLessThan(decisionPosition);
  });

  it("ships a no-script-safe static state with the first beat marked current", () => {
    expect(staticMarkup).toContain('data-enhanced="false"');
    expect(staticMarkup.match(/aria-current="step"/g) ?? []).toHaveLength(1);

    const currentPosition = staticMarkup.indexOf('aria-current="step"');
    const secondBeatPosition = decodeEntities(staticMarkup).indexOf(
      projectJourneyBeats[1].sentence,
    );

    expect(currentPosition).toBeGreaterThan(0);
    expect(currentPosition).toBeLessThan(secondBeatPosition);

    // Controls and the live region are additive: they only exist once the
    // component has hydrated, so the unscripted fold has nothing inert in it.
    expect(staticMarkup).not.toContain("<button");
    expect(staticMarkup).not.toContain("aria-live");
  });

  it("renders no house image, placeholder, or surrogate", () => {
    expect(staticMarkup).not.toMatch(/<(?:img|picture|svg|figure|canvas|video)\b/i);
    expect(staticMarkup).not.toMatch(/\.webp|\.png|\.jpg|\.jpeg|background-image/i);
    expect(source).not.toContain("next/image");
    expect(staticText).not.toMatch(/a600|a-600|placeholder|image coming/i);
  });

  it("states no price, schedule, approval, autonomy, or Product 1 claim", () => {
    expect(staticText).not.toMatch(/\$\s?\d|\b\d+\s*(?:day|week|month|year)s?\b/i);
    expect(staticText).not.toMatch(
      /permit|zoning|setback|buildabl|eligib|approv|financ|quote|estimate/i,
    );
    expect(staticText).not.toMatch(
      /\bAI\b|automatic|autonomous|agent|graph|node|edge|ontolog|pipeline|dashboard/i,
    );
    expect(staticText).not.toMatch(/deedseal|licensed|insured|guarantee|luxury/i);
    expect(staticText).not.toMatch(/James Hardie|\bHardie\b/i);
  });

  it("wraps the beat index in both directions", () => {
    expect(nextBeatIndex(0, 1)).toBe(1);
    expect(nextBeatIndex(4, 1)).toBe(0);
    expect(nextBeatIndex(0, -1)).toBe(4);
    expect(nextBeatIndex(2, -1)).toBe(1);
  });

  it("wires the interaction contract the scenario requires", () => {
    // Auto-advance is optional, pauses on hover and focus, and never runs on a
    // small screen or under a reduced-motion preference.
    expect(source).toContain("onMouseEnter");
    expect(source).toContain("onFocusCapture");
    expect(source).toContain("onBlurCapture");
    expect(source).toContain(
      "const autoAdvances = isEnhanced && !isCompact && !prefersReducedMotion && !isPaused;",
    );
    expect(source).toContain('const COMPACT_QUERY = "(max-width: 47.99rem)";');
    expect(source).toContain(
      'const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";',
    );

    // Keyboard: roving tabindex over the five steps, arrows in both directions.
    expect(source).toContain('tabIndex={index === activeIndex ? 0 : -1}');
    expect(source).toContain('event.key === "ArrowRight"');
    expect(source).toContain('event.key === "ArrowLeft"');
    expect(source).toContain('aria-live="polite"');
  });

  it("keeps motion to weight, marker, and a single 200ms opacity change", () => {
    const transitions = declarations.match(/transition:[^;]+;/g) ?? [];

    expect(transitions.length).toBeGreaterThan(0);

    for (const transition of transitions) {
      expect(transition).toMatch(/none|200ms/);
    }

    expect(declarations).not.toMatch(
      /@keyframes|animation|(?<!text-)transform:|translate:|scale:|perspective:/i,
    );
    expect(stylesheet).toContain("@media (prefers-reduced-motion: reduce)");
    expect(stylesheet).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*?opacity:\s*1/,
    );

    // Mobile pager and step targets meet the 44px minimum.
    expect(declarations.match(/min-height:\s*2\.75rem/g) ?? []).toHaveLength(2);
    expect(declarations.match(/min-width:\s*2\.75rem/g) ?? []).toHaveLength(2);

    // Nothing in the hero may push the page sideways.
    expect(declarations).not.toMatch(/width:\s*\d+(?:\.\d+)?(?:px|vw)|overflow-x/i);
  });
});
