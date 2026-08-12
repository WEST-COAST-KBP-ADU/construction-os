import Link from "next/link";
import type { ReactNode } from "react";

import styles from "./PremiumWorkbenchHero.module.css";
import {
  BLUEPRINT_MOTION_PHASES,
  BLUEPRINT_MOTION_SLOT_ID,
  HERO_CHAPTERS,
  HERO_CHAPTER_LABELS,
  HERO_RAIL_LABEL,
  HERO_STANDING_CHAPTER,
  PREMIUM_WORKBENCH_HERO_ACTIONS,
  PREMIUM_WORKBENCH_HERO_CONTRACT_VERSION,
  PREMIUM_WORKBENCH_HERO_COPY,
  heroChapterElementId,
  type BlueprintMotionPhase,
  type HeroChapter,
  type HeroPhaseDerivedChapter,
} from "./premiumWorkbenchHero.contract";

const TITLE_ID = "premium-workbench-hero-title";

export type PremiumWorkbenchHeroProps = {
  /**
   * The instrument mounted into the composition's dominant column. When omitted
   * the region stays reserved and renders nothing — no skeleton, no placeholder
   * frame, and in particular no image and no image substitute.
   */
  blueprintMotionSlot?: ReactNode;
  /**
   * The public station the composition presents. Static by design: this module
   * is the composition and interaction shell, not the mechanism that advances
   * it. `business-memory` is not accepted here — it is the standing station and
   * is never phase-derived.
   */
  activeChapter?: HeroPhaseDerivedChapter;
  /** The phase published to the reserved region. Defaults to `lead`. */
  motionPhase?: BlueprintMotionPhase;
  /**
   * The claim boundary of whatever is mounted into the region, published as the
   * fold's disclosure strip. The composition itself makes no visual claim — it
   * carries no photograph — so it states nothing of its own here. With no
   * mounted instrument there is nothing to disclose and no strip is rendered.
   */
  instrumentDisclosure?: ReactNode;
  /** Optional hook for the integrating surface. Composition is unaffected. */
  className?: string;
};

/** Rail state of one public station, given the station the fold is presenting. */
function chapterState(
  chapter: HeroChapter,
  activeChapter: HeroPhaseDerivedChapter,
): "complete" | "active" | "upcoming" | "standing" {
  if (chapter === HERO_STANDING_CHAPTER) {
    return "standing";
  }
  if (chapter === activeChapter) {
    return "active";
  }

  return HERO_CHAPTERS.indexOf(chapter) < HERO_CHAPTERS.indexOf(activeChapter)
    ? "complete"
    : "upcoming";
}

/**
 * LIVING-PROJECT-HERO-0001 · the first fold as a living project instrument.
 *
 * Left: a paper editorial field carrying the approved kicker, heading, lede,
 * and the two published calls to action. Right, and dominant: the instrument
 * itself, mounted onto a flat daylight field that runs to the edges of the
 * composition — no photograph, no card, no radius, no floating panel. Beneath
 * both: the public progression the visitor reads the project by.
 *
 * This module implements no drawing and no motion. It composes the fold,
 * reserves the region described by `premiumWorkbenchHero.contract.ts`, and
 * stops there.
 */
export default function PremiumWorkbenchHero({
  blueprintMotionSlot,
  activeChapter = "lead",
  motionPhase,
  instrumentDisclosure,
  className,
}: PremiumWorkbenchHeroProps) {
  const phase: BlueprintMotionPhase = motionPhase ?? "lead";
  const slotFilled = blueprintMotionSlot !== undefined && blueprintMotionSlot !== null;
  const discloses = instrumentDisclosure !== undefined && instrumentDisclosure !== null;

  return (
    <section
      className={className ? `${styles.hero} ${className}` : styles.hero}
      data-component="premium-workbench-hero"
      data-contract-version={PREMIUM_WORKBENCH_HERO_CONTRACT_VERSION}
      data-active-chapter={activeChapter}
      aria-labelledby={TITLE_ID}
    >
      <div className={styles.composition}>
        <div className={styles.editorial}>
          <div className={styles.editorialInner}>
            <p className={styles.kicker}>{PREMIUM_WORKBENCH_HERO_COPY.kicker}</p>
            <span aria-hidden="true" className={styles.rule} />
            <h1 className={styles.title} id={TITLE_ID}>
              {PREMIUM_WORKBENCH_HERO_COPY.heading}
            </h1>
            <p className={styles.lede}>{PREMIUM_WORKBENCH_HERO_COPY.lede}</p>
            <div className={styles.actions}>
              {PREMIUM_WORKBENCH_HERO_ACTIONS.map((action) => (
                <Link
                  className={`${styles.action} ${
                    action.emphasis === "primary" ? styles.actionPrimary : styles.actionSecondary
                  }`}
                  data-action={action.id}
                  href={action.href}
                  key={action.id}
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <figure className={styles.instrument}>
          <div
            aria-hidden={slotFilled ? undefined : "true"}
            className={styles.motionSlot}
            data-slot={BLUEPRINT_MOTION_SLOT_ID}
            data-slot-phase={phase}
            data-slot-phases={BLUEPRINT_MOTION_PHASES.join(" ")}
            data-slot-state={slotFilled ? "filled" : "reserved"}
            data-slot-version={PREMIUM_WORKBENCH_HERO_CONTRACT_VERSION}
            id={BLUEPRINT_MOTION_SLOT_ID}
          >
            {blueprintMotionSlot}
          </div>
          {discloses ? (
            <figcaption className={styles.disclosure} data-disclosure="public-claim">
              {instrumentDisclosure}
            </figcaption>
          ) : null}
        </figure>
      </div>

      <ol aria-label={HERO_RAIL_LABEL} className={styles.rail}>
        {HERO_CHAPTERS.map((chapter, index) => {
          const state = chapterState(chapter, activeChapter);

          return (
            <li
              aria-current={state === "active" ? "step" : undefined}
              className={styles.chapter}
              data-hero-chapter={chapter}
              data-state={state}
              id={heroChapterElementId(chapter)}
              key={chapter}
            >
              <span aria-hidden="true" className={styles.chapterIndex}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className={styles.chapterLabel}>{HERO_CHAPTER_LABELS[chapter]}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
