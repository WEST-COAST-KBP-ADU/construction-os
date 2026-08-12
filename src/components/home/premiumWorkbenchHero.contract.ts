/**
 * PREMIUM-HERO-SCENE-001 · Option 2 hero integration contract.
 *
 * This module is the stable surface between the Option 2 hero composition
 * shell (Worker-227) and the later blueprint motion mechanism (Worker-228).
 * It is intentionally free of React, DOM, and CSS so both sides can assert
 * against it without importing each other.
 *
 * Nothing here draws, animates, or schedules anything. The hero owns the
 * static composition and reserves the region; the mounted component owns the
 * drawing.
 */

/**
 * Bumped whenever a consumer-visible guarantee below changes. Worker-228 may
 * pin this exact value in its own tests.
 */
export const PREMIUM_WORKBENCH_HERO_CONTRACT_VERSION = "1.0.0";

/* -------------------------------------------------------------------------
 * Motion phases
 * ---------------------------------------------------------------------- */

/**
 * The stable phase vocabulary of the blueprint mechanism, in narrative order.
 * The hero implements none of these visuals; it publishes the vocabulary so a
 * later component can mount against a fixed contract.
 */
export const BLUEPRINT_MOTION_PHASES = [
  "lead",
  "project",
  "plan",
  "build",
  "record",
] as const;

export type BlueprintMotionPhase = (typeof BLUEPRINT_MOTION_PHASES)[number];

/** The phase this Issue owns. The hero renders its `lead` state and no other. */
export const BLUEPRINT_MOTION_DEFAULT_PHASE: BlueprintMotionPhase = "lead";

export function isBlueprintMotionPhase(value: unknown): value is BlueprintMotionPhase {
  return (
    typeof value === "string" &&
    (BLUEPRINT_MOTION_PHASES as readonly string[]).includes(value)
  );
}

/* -------------------------------------------------------------------------
 * Chapter rail
 * ---------------------------------------------------------------------- */

/**
 * The three chapters the hero rail renders, as labels only. They are a subset
 * of {@link BLUEPRINT_MOTION_PHASES}; `plan` and `build` exist in the motion
 * vocabulary but are not surfaced in the first fold.
 */
export const HERO_CHAPTERS = ["lead", "project", "record"] as const;

export type HeroChapter = (typeof HERO_CHAPTERS)[number];

export const HERO_CHAPTER_LABELS: Readonly<Record<HeroChapter, string>> = Object.freeze({
  lead: "Lead",
  project: "Project",
  record: "Record",
});

export function isHeroChapter(value: unknown): value is HeroChapter {
  return typeof value === "string" && (HERO_CHAPTERS as readonly string[]).includes(value);
}

/** Stable element id for a rail chapter, so a mounted component can bind to it. */
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
  /** Chapters rendered in the rail, each addressable by {@link heroChapterElementId}. */
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
   * - it is absolutely positioned over the full workbench surface (`inset: 0`);
   * - it establishes a size container named `blueprint-motion-slot`;
   * - it sets `pointer-events: none` on itself and `auto` on direct children,
   *   so an empty slot intercepts nothing;
   * - it creates no stacking, border, radius, shadow, or background of its own.
   */
  layout: Object.freeze({
    positioning: "absolute-inset-0",
    containerName: BLUEPRINT_MOTION_SLOT_ID,
    containerType: "size",
    pointerEvents: "none-with-auto-children",
  }),
  /**
   * CSS custom properties the hero sets on the reserved element so a mounted
   * drawing can register itself against the underlying surface without
   * re-deriving the crop.
   */
  customProperties: Object.freeze({
    /** Intrinsic aspect ratio of the workbench source, as a unitless number. */
    sourceAspect: "--blueprint-motion-source-aspect",
    /** `object-fit` applied to the workbench surface. */
    objectFit: "--blueprint-motion-object-fit",
    /** `object-position` applied to the workbench surface. */
    objectPosition: "--blueprint-motion-object-position",
    /** `1` normally, `0` under `prefers-reduced-motion: reduce`. */
    motionEnabled: "--blueprint-motion-enabled",
  }),
} as const);

/* -------------------------------------------------------------------------
 * Approved copy
 * ---------------------------------------------------------------------- */

/**
 * The exact Owner-approved Option 2 first-fold copy. Reproduced verbatim,
 * including the typographic apostrophe and em dash.
 */
export const PREMIUM_WORKBENCH_HERO_COPY = Object.freeze({
  kicker: "KBP OS · ADU + General Construction",
  heading: "From the first lead to a managed construction process.",
  lede:
    "KBP OS is a lead-generation and process-management platform for ADU and " +
    "general construction—residential and commercial. We’re open to GC " +
    "projects beyond ADUs.",
} as const);

export type PremiumWorkbenchHeroActionEmphasis = "primary" | "secondary";

export type PremiumWorkbenchHeroAction = {
  readonly id: string;
  readonly href: string;
  readonly label: string;
  readonly emphasis: PremiumWorkbenchHeroActionEmphasis;
};

/**
 * The calls to action carried forward unchanged from the published homepage at
 * the packet's exact base `main@bd3f336140a320ea81008cf415a05861fb034de2`
 * (`app/page.tsx`). Labels and destinations are reported, never invented.
 */
export const PREMIUM_WORKBENCH_HERO_ACTIONS: readonly PremiumWorkbenchHeroAction[] =
  Object.freeze([
    Object.freeze({
      id: "explore-models",
      href: "/models",
      label: "Explore models",
      emphasis: "primary",
    }),
    Object.freeze({
      id: "open-concept-studio",
      href: "/studio",
      label: "Open Concept Studio",
      emphasis: "secondary",
    }),
  ] as const);

/* -------------------------------------------------------------------------
 * Workbench surface
 * ---------------------------------------------------------------------- */

/**
 * The workbench surface, taken from an asset already present and already
 * published at the exact base. Nothing is added, generated, upscaled, or
 * retouched here.
 *
 * The description and disclosure state only what is visible in the frame. They
 * make no claim about a West Coast KBP project, an approved plan, a permit, a
 * parcel, or a material specification.
 */
export const PREMIUM_WORKBENCH_HERO_MEDIA = Object.freeze({
  src: "/images/balanced-process-materials-concept-v2.webp",
  width: 1500,
  height: 1000,
  objectFit: "cover",
  objectPosition: "50% 50%",
  alt:
    "Plan and material studies on a wood workbench in daylight: an architectural " +
    "floor plan drawing, material sample tiles, a graphite pencil, and a metal ruler.",
  disclosure:
    "Conceptual imagery—plan and material studies under review. Not a West Coast " +
    "KBP project, an approved plan, a permit, a parcel, or a material specification.",
} as const);

/** Convenience: the intrinsic aspect ratio of the workbench source. */
export const PREMIUM_WORKBENCH_HERO_MEDIA_ASPECT =
  PREMIUM_WORKBENCH_HERO_MEDIA.width / PREMIUM_WORKBENCH_HERO_MEDIA.height;
