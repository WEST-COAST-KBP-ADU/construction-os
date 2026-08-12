"use client";

import Link from "next/link";
import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import styles from "./ProjectJourneyHero.module.css";

/*
 * HERO-SCENARIO-IMPLEMENTATION-001 · the construction-first first fold.
 *
 * The scenario adopted on Issue #212 ships in its `ASSET_FALLBACK` state: no
 * house image, no placeholder, and no surrogate. Issue #215 established that no
 * qualifying A600 still exists at the truth target, so the hero carries the
 * proposition typographically and the image remains an upgrade, not a
 * precondition.
 *
 * The five beats are always present in DOM order. Scripting only adds emphasis
 * and controls on top of a first fold that already reads without it.
 */

export type ProjectJourneyBeat = {
  readonly id: string;
  readonly label: string;
  readonly sentence: string;
};

export const projectJourneyBeats = [
  {
    id: "B1_INTENT",
    label: "Your goal",
    sentence: "You start with one goal: the ADU you want to build.",
  },
  {
    id: "B2_FACTS",
    label: "Checked facts",
    sentence:
      "Your property's real facts and the rules that apply get gathered and checked.",
  },
  {
    id: "B3_ORGANIZED",
    label: "Organized work",
    sentence:
      "Design, documents, suppliers, and site work are organized into one sequence.",
  },
  {
    id: "B4_DECISION",
    label: "Your decision",
    sentence:
      "You see what needs your decision — and nothing moves until you make it.",
  },
  {
    id: "B5_RECORD",
    label: "Recorded result",
    sentence: "Every stage closes with the document or proof that shows it was done.",
  },
] as const satisfies readonly ProjectJourneyBeat[];

export const projectJourneyDecisionBeatIndex = 3;

export const projectJourneyHeroCopy = {
  kicker: "Construction OS — pre-release product preview",
  headline: "We build your ADU and keep the project in one place.",
  lede:
    "Usually the truth about a build lives in email threads and one person's memory. Here it lives in your project: organized as the work happens, decided by you.",
  journeyLabel: "How a project runs",
} as const;

export const projectJourneyHeroCtas = [
  { label: "Open Concept Studio", href: "/studio", tone: "primary" },
  { label: "See how a project runs", href: "/process", tone: "secondary" },
] as const;

const AUTO_ADVANCE_START_MS = 800;
const AUTO_ADVANCE_INTERVAL_MS = 5000;
const COMPACT_QUERY = "(max-width: 47.99rem)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function nextBeatIndex(current: number, step: number): number {
  const count = projectJourneyBeats.length;

  return (current + step + count) % count;
}

const subscribeToNothing = () => () => {};

/*
 * The server and the first client render both report the unenhanced state, so
 * the markup the browser receives is always the fully readable static one. The
 * hydrated render is what layers controls, emphasis, and optional advance on
 * top of it.
 */
function useIsEnhanced(): boolean {
  return useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
}

function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mediaQuery = window.matchMedia(query);

      mediaQuery.addEventListener("change", onStoreChange);

      return () => mediaQuery.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export default function ProjectJourneyHero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const stepRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const isEnhanced = useIsEnhanced();
  const isCompact = useMediaQuery(COMPACT_QUERY);
  const prefersReducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);

  const autoAdvances = isEnhanced && !isCompact && !prefersReducedMotion && !isPaused;

  useEffect(() => {
    if (!autoAdvances) {
      return;
    }

    let interval: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      interval = setInterval(() => {
        setActiveIndex((current) => nextBeatIndex(current, 1));
      }, AUTO_ADVANCE_INTERVAL_MS);
    }, AUTO_ADVANCE_START_MS);

    return () => {
      clearTimeout(start);

      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoAdvances]);

  const focusStep = useCallback((index: number) => {
    setActiveIndex(index);
    stepRefs.current[index]?.focus();
  }, []);

  const handleStepKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        focusStep(nextBeatIndex(activeIndex, 1));
        return;
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        focusStep(nextBeatIndex(activeIndex, -1));
        return;
      }

      if (event.key === "Home") {
        event.preventDefault();
        focusStep(0);
        return;
      }

      if (event.key === "End") {
        event.preventDefault();
        focusStep(projectJourneyBeats.length - 1);
      }
    },
    [activeIndex, focusStep],
  );

  return (
    <section
      className={styles.hero}
      data-enhanced={isEnhanced ? "true" : "false"}
      aria-labelledby="home-hero-title"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className="spine-kicker">{projectJourneyHeroCopy.kicker}</p>
          <h1 id="home-hero-title" className={styles.headline}>
            {projectJourneyHeroCopy.headline}
          </h1>
          <p className={styles.lede}>{projectJourneyHeroCopy.lede}</p>
          <div className={styles.actions}>
            {projectJourneyHeroCtas.map((cta) => (
              <Link
                key={cta.href}
                href={cta.href}
                className={"button button--" + cta.tone}
              >
                {cta.label}
              </Link>
            ))}
          </div>
        </div>

        <div className={styles.journey}>
          <p id="home-journey-title" className={styles.journeyTitle}>
            {projectJourneyHeroCopy.journeyLabel}
          </p>

          <ol className={styles.beats} aria-labelledby="home-journey-title">
            {projectJourneyBeats.map((beat, index) => (
              <li
                key={beat.id}
                className={styles.beat}
                data-state={index === activeIndex ? "current" : "rest"}
                aria-current={index === activeIndex ? "step" : undefined}
              >
                <span className={styles.beatIndex} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className={styles.beatBody}>
                  <span className={styles.beatLabel}>
                    {index === projectJourneyDecisionBeatIndex ? (
                      <span className={styles.decisionMarker} aria-hidden="true" />
                    ) : null}
                    {beat.label}
                  </span>
                  <span className={styles.beatSentence}>{beat.sentence}</span>
                </span>
              </li>
            ))}
          </ol>

          {isEnhanced ? (
            <div className={styles.controls}>
              <div
                className={styles.steps}
                role="group"
                aria-label="Choose a step of the project journey"
              >
                {projectJourneyBeats.map((beat, index) => (
                  <button
                    key={beat.id}
                    ref={(node) => {
                      stepRefs.current[index] = node;
                    }}
                    type="button"
                    className={styles.step}
                    data-state={index === activeIndex ? "current" : "rest"}
                    aria-pressed={index === activeIndex}
                    tabIndex={index === activeIndex ? 0 : -1}
                    onClick={() => setActiveIndex(index)}
                    onKeyDown={handleStepKeyDown}
                  >
                    <span className={styles.stepDot} aria-hidden="true" />
                    <span className={styles.stepLabel}>
                      Step {index + 1}: {beat.label}
                    </span>
                  </button>
                ))}
              </div>

              <div className={styles.pager}>
                <button
                  type="button"
                  className={styles.pagerButton}
                  onClick={() => setActiveIndex(nextBeatIndex(activeIndex, -1))}
                >
                  <span aria-hidden="true">←</span>
                  <span className={styles.stepLabel}>Previous step</span>
                </button>
                <p className={styles.counter}>
                  {activeIndex + 1} of {projectJourneyBeats.length}
                </p>
                <button
                  type="button"
                  className={styles.pagerButton}
                  onClick={() => setActiveIndex(nextBeatIndex(activeIndex, 1))}
                >
                  <span aria-hidden="true">→</span>
                  <span className={styles.stepLabel}>Next step</span>
                </button>
              </div>

              <p className={styles.liveRegion} aria-live="polite">
                {projectJourneyBeats[activeIndex].sentence}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
