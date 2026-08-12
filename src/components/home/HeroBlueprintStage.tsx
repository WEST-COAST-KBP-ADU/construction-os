"use client";

/**
 * OPTION2-HERO-INTEGRATION-001 · the composed Option 2 first fold.
 *
 * Three accepted heads meet here and nowhere else:
 *
 * - Worker-227's `PremiumWorkbenchHero` owns the composition, the approved copy,
 *   the calls to action, the public chapter rail, and the reserved region;
 * - Worker-228's `LiveBlueprintSequence` owns the drawing — every line of it
 *   derived from the adopted A600 profile — mounted into that region as a sheet;
 * - Worker-229's recipe owns the light, color, and type, applied to this subtree
 *   through `HeroBlueprintStage.module.css` and `data-o2-premium`.
 *
 * This module adds no geometry, no drawing, and no motion of its own. It holds
 * one piece of state: the phase the sequence is on, mirrored onto the hero so
 * the public rail and the slot's published `data-slot-phase` tell the truth
 * about what the visitor is looking at.
 *
 * The public first fold reads `Lead / Project / Record`. `plan` and `build` are
 * internal states of the Project chapter and are never surfaced as public
 * chapters — see {@link heroChapterForPhase}.
 */

import { useCallback, useState } from "react";

import { HOME_BLUEPRINT_PROJECT_DRAWING } from "../../lib/homeBlueprintGeometry";
import type { HomeBlueprintPhase } from "../../lib/homeBlueprintGeometry";

import LiveBlueprintSequence from "./LiveBlueprintSequence";
import PremiumWorkbenchHero from "./PremiumWorkbenchHero";
import styles from "./HeroBlueprintStage.module.css";
import { HERO_CHAPTERS, type HeroChapter } from "./premiumWorkbenchHero.contract";

/** The hero title, so the mounted drawing is labelled by the fold it belongs to. */
export const HERO_BLUEPRINT_STAGE_HEADING_ID = "premium-workbench-hero-title";

/**
 * The public chapter a motion phase belongs to.
 *
 * `plan` and `build` are how the Project chapter draws itself; they are not
 * chapters. Collapsing them onto `project` is what keeps the first fold at
 * exactly three public chapters while the drawing runs through five states.
 */
export function heroChapterForPhase(phase: HomeBlueprintPhase): HeroChapter {
  if (phase === "lead" || phase === "record") {
    return phase;
  }

  return "project";
}

export default function HeroBlueprintStage() {
  const [phase, setPhase] = useState<HomeBlueprintPhase>("lead");

  // Stable identity so the sequence's report effect does not re-run per render.
  const handlePhaseChange = useCallback((next: HomeBlueprintPhase) => {
    setPhase(next);
  }, []);

  return (
    <div className={styles.stage} data-component="hero-blueprint-stage" data-o2-premium>
      <PremiumWorkbenchHero
        activeChapter={heroChapterForPhase(phase)}
        motionPhase={phase}
        supplementalDisclosure={HOME_BLUEPRINT_PROJECT_DRAWING.recordBlock.disclaimer}
        blueprintMotionSlot={
          <LiveBlueprintSequence
            headingId={HERO_BLUEPRINT_STAGE_HEADING_ID}
            onPhaseChange={handlePhaseChange}
            surface="slot"
          />
        }
      />
    </div>
  );
}

/** Published for tests: the public rail this stage composes, in order. */
export const HERO_BLUEPRINT_STAGE_PUBLIC_CHAPTERS = HERO_CHAPTERS;
