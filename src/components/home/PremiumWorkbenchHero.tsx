import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import styles from "./PremiumWorkbenchHero.module.css";
import {
  BLUEPRINT_MOTION_PHASES,
  BLUEPRINT_MOTION_SLOT_ID,
  HERO_CHAPTERS,
  HERO_CHAPTER_LABELS,
  PREMIUM_WORKBENCH_HERO_ACTIONS,
  PREMIUM_WORKBENCH_HERO_CONTRACT_VERSION,
  PREMIUM_WORKBENCH_HERO_COPY,
  PREMIUM_WORKBENCH_HERO_MEDIA,
  heroChapterElementId,
  type BlueprintMotionPhase,
  type HeroChapter,
} from "./premiumWorkbenchHero.contract";

const TITLE_ID = "premium-workbench-hero-title";

export type PremiumWorkbenchHeroProps = {
  /**
   * The blueprint mechanism owned by a later packet. When omitted the region
   * stays reserved and renders nothing — no skeleton, no placeholder frame.
   */
  blueprintMotionSlot?: ReactNode;
  /**
   * The chapter the composition presents. Static by design: this module is the
   * composition and interaction shell, not the mechanism that advances it.
   */
  activeChapter?: HeroChapter;
  /** The phase published to the reserved region. Defaults to `activeChapter`. */
  motionPhase?: BlueprintMotionPhase;
  /** Optional hook for the integrating surface. Composition is unaffected. */
  className?: string;
};

/**
 * PREMIUM-HERO-SCENE-001 · the Owner-selected Option 2 first fold.
 *
 * Left: a warm paper editorial field carrying the approved kicker, heading,
 * lede, and the published calls to action. Right: a continuous daylight
 * workbench surface running to the edges of the composition — no card, no
 * radius, no floating panel. Below: the chapter rail.
 *
 * This module implements no blueprint drawing and no motion. It reserves the
 * region described by `premiumWorkbenchHero.contract.ts` and stops there.
 *
 * It is deliberately not mounted on any route; integration is a later packet.
 */
export default function PremiumWorkbenchHero({
  blueprintMotionSlot,
  activeChapter = "lead",
  motionPhase,
  className,
}: PremiumWorkbenchHeroProps) {
  const phase: BlueprintMotionPhase = motionPhase ?? activeChapter;
  const slotFilled = blueprintMotionSlot !== undefined && blueprintMotionSlot !== null;

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

        <figure className={styles.surface}>
          <Image
            alt={PREMIUM_WORKBENCH_HERO_MEDIA.alt}
            className={styles.surfaceImage}
            fill
            preload
            sizes="(max-width: 63.99rem) 100vw, 54vw"
            src={PREMIUM_WORKBENCH_HERO_MEDIA.src}
          />
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
          <figcaption className={styles.disclosure}>
            {PREMIUM_WORKBENCH_HERO_MEDIA.disclosure}
          </figcaption>
        </figure>
      </div>

      <ol aria-label="Product chapters" className={styles.rail}>
        {HERO_CHAPTERS.map((chapter, index) => (
          <li
            aria-current={chapter === activeChapter ? "step" : undefined}
            className={styles.chapter}
            data-hero-chapter={chapter}
            data-state={chapter === activeChapter ? "active" : "upcoming"}
            id={heroChapterElementId(chapter)}
            key={chapter}
          >
            <span aria-hidden="true" className={styles.chapterIndex}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className={styles.chapterLabel}>{HERO_CHAPTER_LABELS[chapter]}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
