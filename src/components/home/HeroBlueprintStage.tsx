"use client";

/**
 * LIVING-PROJECT-HERO-0001 · the composed first fold.
 *
 * Two accepted heads meet here and nowhere else:
 *
 * - `PremiumWorkbenchHero` owns the composition, the approved copy, the calls
 *   to action, the public progression, and the reserved region;
 * - `LiveBlueprintSequence` owns the drawing — every line of it derived from the
 *   adopted A600 profile — mounted into that region as the fold's visual;
 *
 * and the Option 2 recipe owns the light, colour, and type, applied to this
 * subtree through `HeroBlueprintStage.module.css` and `data-o2-premium`.
 *
 * This module adds no geometry, no drawing, and no motion of its own. It holds
 * one piece of state: the phase the sequence is on, mirrored onto the hero so
 * the public progression and the slot's published `data-slot-phase` tell the
 * truth about what the visitor is looking at.
 *
 * The public progression reads `Lead / Bounded work / Verified record /
 * Business memory`. The drawing's five drafting phases are internal and are
 * never surfaced as public labels — see {@link heroChapterForPhase}.
 */

import { useCallback, useState } from "react";

import { HOME_BLUEPRINT_PROJECT_DRAWING } from "../../lib/homeBlueprintGeometry";
import type { HomeBlueprintPhase } from "../../lib/homeBlueprintGeometry";

import LiveBlueprintSequence from "./LiveBlueprintSequence";
import PremiumWorkbenchHero from "./PremiumWorkbenchHero";
import styles from "./HeroBlueprintStage.module.css";
import {
  HERO_CHAPTERS,
  type HeroPhaseDerivedChapter,
} from "./premiumWorkbenchHero.contract";

/** The hero title, so the mounted drawing is labelled by the fold it belongs to. */
export const HERO_BLUEPRINT_STAGE_HEADING_ID = "premium-workbench-hero-title";

/**
 * The public station a drafting phase puts the project at.
 *
 * The registration of the footprint, the resolution of the plan, and the
 * alignment of the elevation are three ways one bounded piece of work draws
 * itself; they are not three things a client tracks. Collapsing them onto
 * `bounded-work` is what keeps the public progression at four stations while
 * the drawing runs through five phases.
 *
 * `business-memory` is not returned by any phase, and that is deliberate: the
 * instrument draws one project, and the accumulation of verified records across
 * projects is not a state one project passes through.
 */
export function heroChapterForPhase(phase: HomeBlueprintPhase): HeroPhaseDerivedChapter {
  if (phase === "lead") {
    return "lead";
  }

  if (phase === "record") {
    return "verified-record";
  }

  return "bounded-work";
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
        instrumentDisclosure={HOME_BLUEPRINT_PROJECT_DRAWING.recordBlock.disclaimer}
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

/** Published for tests: the public progression this stage composes, in order. */
export const HERO_BLUEPRINT_STAGE_PUBLIC_CHAPTERS = HERO_CHAPTERS;
