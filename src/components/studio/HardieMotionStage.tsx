"use client";

import Image from "next/image";
import { AnimatePresence, m, useReducedMotion } from "motion/react";

import styles from "./HardieMotionStage.module.css";

type ConceptFacade = "lap-siding" | "dark-siding";
type ConceptColor = "sage" | "charcoal";

type HardieMotionStageProps = {
  modelId: string;
  modelLabel: string;
  exterior: string;
  palette: string;
};

const PREVIEW_ASSETS = {
  "lap-siding": {
    sage: "/images/adu-600-hardie-plank-evening-blue-concept-v1.webp",
    charcoal: "/images/adu-600-hardie-plank-iron-gray-concept-v1.webp",
  },
  "dark-siding": {
    sage: "/images/adu-600-hardie-panel-evening-blue-concept-v1.webp",
    charcoal: "/images/adu-600-hardie-panel-iron-gray-concept-v1.webp",
  },
} as const satisfies Record<ConceptFacade, Record<ConceptColor, string>>;

const PRELOAD_ASSETS = Object.values(PREVIEW_ASSETS).flatMap((facade) => Object.values(facade));

const FACADE_LABELS: Record<ConceptFacade, string> = {
  "lap-siding": "Horizontal lap",
  "dark-siding": "Vertical panel",
};

const COLOR_LABELS: Record<ConceptColor, string> = {
  sage: "Blue study",
  charcoal: "Charcoal study",
};

function isConceptFacade(value: string): value is ConceptFacade {
  return value === "lap-siding" || value === "dark-siding";
}

function isConceptColor(value: string): value is ConceptColor {
  return value === "sage" || value === "charcoal";
}

export function resolveA600ConceptAsset(modelId: string, exterior: string, palette: string): string | null {
  if (modelId !== "one-bed-600" || !isConceptFacade(exterior) || !isConceptColor(palette)) return null;
  return PREVIEW_ASSETS[exterior][palette];
}

export default function HardieMotionStage({
  modelId,
  modelLabel,
  exterior,
  palette,
}: HardieMotionStageProps) {
  const reduceMotion = useReducedMotion();
  const resolvedAsset = resolveA600ConceptAsset(modelId, exterior, palette);

  if (!resolvedAsset || !isConceptFacade(exterior) || !isConceptColor(palette)) {
    return (
      <div className={styles.previewPending}>
        <strong>Source render unavailable</strong>
        <span>The viewport fails closed when an exact A600 render is not mapped.</span>
      </div>
    );
  }

  const facadeLabel = FACADE_LABELS[exterior];
  const colorLabel = COLOR_LABELS[palette];
  const transition = {
    duration: reduceMotion ? 0 : 0.22,
    ease: [0.22, 1, 0.36, 1] as const,
  };

  return (
    <figure className={styles.stage} aria-label={`${modelLabel} · ${facadeLabel} · ${colorLabel}`}>
      <span className={styles.assetPreloader} aria-hidden="true">
        {PRELOAD_ASSETS.filter((asset) => asset !== resolvedAsset).map((asset) => (
          <Image key={asset} src={asset} alt="" width={1} height={1} loading="eager" unoptimized />
        ))}
      </span>
      <div className={styles.imageSurface}>
        <div className={styles.imageViewport}>
          <AnimatePresence initial={false} mode="sync">
            <m.div
              key={resolvedAsset}
              className={styles.imageLayer}
              initial={reduceMotion ? false : { opacity: 0, clipPath: "inset(0 2% 0 0)" }}
              animate={{ opacity: 1, clipPath: "inset(0 0 0 0)" }}
              exit={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
              transition={transition}
            >
              <Image
                src={resolvedAsset}
                alt={`Conceptual exterior view for ${modelLabel}`}
                fill
                preload
                unoptimized
                draggable={false}
                sizes="(max-width: 836px) 100vw, 836px"
                className={styles.currentImage}
              />
            </m.div>
          </AnimatePresence>
          <div className={styles.cornerIndex} aria-hidden="true">A600 / EXT</div>
        </div>
      </div>

      <figcaption className={styles.renderReadout}>
        <div>
          <span>SOURCE RENDER</span>
          <strong>{facadeLabel} / {colorLabel}</strong>
        </div>
        <dl>
          <div><dt>Native</dt><dd>1672 × 941</dd></div>
          <div><dt>Display ceiling</dt><dd>836 px</dd></div>
          <div><dt>Motion</dt><dd>220 ms</dd></div>
        </dl>
        <p>Concept render · physical sample and local availability verification required. Not a completed West Coast KBP project.</p>
      </figcaption>
    </figure>
  );
}
