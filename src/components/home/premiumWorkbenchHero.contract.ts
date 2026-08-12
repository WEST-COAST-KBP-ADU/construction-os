/**
 * LIVING-PROJECT-HERO-0001 · the first fold's integration contract.
 *
 * This module is the stable surface between the first-fold composition shell
 * and the mounted A600-derived instrument. It is intentionally free of React,
 * DOM, and CSS so both sides can assert against it without importing each
 * other. Nothing here draws, animates, or schedules anything.
 *
 * Version 2.0.0 removed the workbench bitmap. The first fold no longer carries
 * a photographic layer of any kind: there is no image, no image slot, no
 * fallback frame, and no imagery disclosure, because there is no imagery to
 * disclose. The instrument is the visual surface, and the only claim boundary
 * the fold publishes is the one the instrument itself states.
 */

/**
 * Bumped whenever a consumer-visible guarantee below changes. 2.0.0 is a
 * breaking bump: `PREMIUM_WORKBENCH_HERO_MEDIA`, its aspect constant, and the
 * three media custom properties the slot used to publish are gone, and the
 * public rail is now the four-stage business progression rather than the three
 * drafting chapters.
 */
export const PREMIUM_WORKBENCH_HERO_CONTRACT_VERSION = "2.0.0";

/* -------------------------------------------------------------------------
 * Motion phases
 * ---------------------------------------------------------------------- */

/**
 * The stable phase vocabulary of the mounted instrument, in narrative order.
 * The hero implements none of these visuals; it publishes the vocabulary so the
 * mounted component and the composition agree on a fixed contract.
 *
 * These are internal drafting states. They are deliberately more granular than
 * the public rail below, and they are never rendered as public labels.
 */
export const BLUEPRINT_MOTION_PHASES = [
  "lead",
  "project",
  "plan",
  "build",
  "record",
] as const;

export type BlueprintMotionPhase = (typeof BLUEPRINT_MOTION_PHASES)[number];

/** The phase the composition presents before anything advances it. */
export const BLUEPRINT_MOTION_DEFAULT_PHASE: BlueprintMotionPhase = "lead";

export function isBlueprintMotionPhase(value: unknown): value is BlueprintMotionPhase {
  return (
    typeof value === "string" &&
    (BLUEPRINT_MOTION_PHASES as readonly string[]).includes(value)
  );
}

/* -------------------------------------------------------------------------
 * Public rail
 * ---------------------------------------------------------------------- */

/**
 * The public progression, in order. This is the business journey a visitor
 * reads in the first fold, and it is the only progression the fold publishes.
 *
 * It is not the phase vocabulary and does not share its identifiers. The
 * instrument runs five drafting phases; the visitor reads four business
 * stations. The mapping between them is owned by `HeroBlueprintStage`, is
 * total, and is asserted there.
 */
export const HERO_CHAPTERS = [
  "lead",
  "bounded-work",
  "verified-record",
  "business-memory",
] as const;

export type HeroChapter = (typeof HERO_CHAPTERS)[number];

/** The exact public labels. Reproduced verbatim from the approved copy. */
export const HERO_CHAPTER_LABELS: Readonly<Record<HeroChapter, string>> = Object.freeze({
  lead: "Lead",
  "bounded-work": "Bounded work",
  "verified-record": "Verified record",
  "business-memory": "Business memory",
});

/**
 * The stations a motion phase can put under the visitor's eye.
 *
 * `business-memory` is deliberately absent. It is not a state one project
 * passes through: it is where verified records accumulate once a project has
 * closed. The instrument draws one project, so claiming it animates the
 * accumulation would be a claim the drawing cannot support. The station is
 * published, labelled, and legible; it is never phase-derived.
 */
export const HERO_PHASE_DERIVED_CHAPTERS = [
  "lead",
  "bounded-work",
  "verified-record",
] as const;

export type HeroPhaseDerivedChapter = (typeof HERO_PHASE_DERIVED_CHAPTERS)[number];

/** The standing station: the destination of every verified record. */
export const HERO_STANDING_CHAPTER: HeroChapter = "business-memory";

export function isHeroChapter(value: unknown): value is HeroChapter {
  return typeof value === "string" && (HERO_CHAPTERS as readonly string[]).includes(value);
}

/** Accessible name of the public rail. Construction first, never a product term. */
export const HERO_RAIL_LABEL = "Project progression";

/** Stable element id for a rail station, so a mounted component can bind to it. */
export function heroChapterElementId(chapter: HeroChapter): string {
  return `premium-workbench-hero-chapter-${chapter}`;
}

/* -------------------------------------------------------------------------
 * The reserved slot
 * ---------------------------------------------------------------------- */

export const BLUEPRINT_MOTION_SLOT_ID = "blueprint-motion-slot";

/**
 * Props a component mounted into the slot is expected to accept. The hero does
 * not construct this object — it is published so both sides agree on shape.
 */
export type BlueprintMotionSlotProps = {
  /** The full ordered phase vocabulary. */
  readonly phases: readonly BlueprintMotionPhase[];
  /** The phase the composition is currently presenting. */
  readonly phase: BlueprintMotionPhase;
  /**
   * True when the visitor has asked for reduced motion. The mounted component
   * must render a complete, legible static frame in that state.
   */
  readonly reducedMotion?: boolean;
};

/**
 * The guarantees the hero makes about the reserved region. A mounted component
 * that holds to these does not need to restyle any part of the hero.
 */
export const BLUEPRINT_MOTION_SLOT_CONTRACT = Object.freeze({
  version: PREMIUM_WORKBENCH_HERO_CONTRACT_VERSION,
  /** `id` and `data-slot` value of the reserved element. */
  slotId: BLUEPRINT_MOTION_SLOT_ID,
  phases: BLUEPRINT_MOTION_PHASES,
  defaultPhase: BLUEPRINT_MOTION_DEFAULT_PHASE,
  /** Public stations rendered in the rail, each addressable by {@link heroChapterElementId}. */
  chapters: HERO_CHAPTERS,
  /** Attributes the hero writes onto the reserved element. */
  dataAttributes: Object.freeze({
    slot: "data-slot",
    /** `"reserved"` while empty, `"filled"` once a child is mounted. */
    state: "data-slot-state",
    /** Space-separated phase vocabulary, for non-JS consumers. */
    phases: "data-slot-phases",
    /** The phase the composition is presenting. */
    phase: "data-slot-phase",
    version: "data-slot-version",
  }),
  /**
   * Layout guarantees of the reserved element:
   * - it is absolutely positioned over the full instrument column (`inset: 0`);
   * - it establishes a size container named `blueprint-motion-slot`;
   * - it sets `pointer-events: none` on itself and `auto` on direct children,
   *   so an empty slot intercepts nothing;
   * - it draws no border, radius, shadow, or background of its own — the column
   *   behind it is a flat daylight field, never an image and never a card;
   * - it is a stacking context — `container-type: size` applies layout
   *   containment, and `z-index: 0` states that explicitly — pinned beneath the
   *   disclosure strip, so no `z-index` set inside the mounted subtree can
   *   paint over the public claim.
   */
  layout: Object.freeze({
    positioning: "absolute-inset-0",
    containerName: BLUEPRINT_MOTION_SLOT_ID,
    containerType: "size",
    pointerEvents: "none-with-auto-children",
    /** Stacking context pinned below the disclosure strip. */
    stacking: "isolated-below-disclosure",
  }),
  /**
   * CSS custom properties the hero sets on the reserved element.
   *
   * Version 1.1.0 published three more — source aspect, object fit, and object
   * position — so a mounted drawing could register itself against the crop of
   * the workbench photograph. There is no photograph and no crop, so there is
   * nothing to register against and the three are gone rather than kept at
   * inert values.
   */
  customProperties: Object.freeze({
    /** `1` normally, `0` under `prefers-reduced-motion: reduce`. */
    motionEnabled: "--blueprint-motion-enabled",
  }),
} as const);

/* -------------------------------------------------------------------------
 * Approved copy
 * ---------------------------------------------------------------------- */

/**
 * The exact Owner-approved first-fold copy, reproduced verbatim including the
 * middle dot and the em dash.
 *
 * Construction reads first: the business, then the journey, then who decides.
 * The platform is named once, as the thing that keeps the record; it is never
 * the subject of the fold and its infrastructure is never its vocabulary.
 */
export const PREMIUM_WORKBENCH_HERO_COPY = Object.freeze({
  kicker: "WEST COAST KBP · ADU + GENERAL CONSTRUCTION",
  heading: "A construction project, kept legible from first lead to verified record.",
  lede:
    "KBP OS is designed to keep project facts, decisions, documents, and " +
    "completed work in one living record—organized by the system, controlled " +
    "by people.",
} as const);

export type PremiumWorkbenchHeroActionEmphasis = "primary" | "secondary";

export type PremiumWorkbenchHeroAction = {
  readonly id: string;
  readonly href: string;
  readonly label: string;
  readonly emphasis: PremiumWorkbenchHeroActionEmphasis;
};

/**
 * The two published calls to action. Both destinations are live routes on this
 * site; neither label nor href is invented here.
 */
export const PREMIUM_WORKBENCH_HERO_ACTIONS: readonly PremiumWorkbenchHeroAction[] =
  Object.freeze([
    Object.freeze({
      id: "open-concept-studio",
      href: "/studio",
      label: "Open Concept Studio",
      emphasis: "primary",
    }),
    Object.freeze({
      id: "see-how-a-project-runs",
      href: "/process",
      label: "See how a project runs",
      emphasis: "secondary",
    }),
  ] as const);
