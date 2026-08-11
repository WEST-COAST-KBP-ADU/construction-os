"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import styles from "./HardieMotionStage.module.css";

type ConceptFacade = "lap-siding" | "dark-siding";
type ConceptColor = "sage" | "charcoal";

type RenderState = {
  current: string | null;
  previous: string | null;
  nonce: number;
};

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

const FACADE_LABELS: Record<ConceptFacade, string> = {
  "lap-siding": "Horizontal lap concept",
  "dark-siding": "Vertical panel concept",
};

const COLOR_LABELS: Record<ConceptColor, string> = {
  sage: "Blue concept",
  charcoal: "Charcoal concept",
};

function isConceptFacade(value: string): value is ConceptFacade {
  return value === "lap-siding" || value === "dark-siding";
}

function isConceptColor(value: string): value is ConceptColor {
  return value === "sage" || value === "charcoal";
}

export function resolveA600ConceptAsset(
  modelId: string,
  exterior: string,
  palette: string,
): string | null {
  if (
    modelId !== "one-bed-600" ||
    !isConceptFacade(exterior) ||
    !isConceptColor(palette)
  ) {
    return null;
  }

  return PREVIEW_ASSETS[exterior][palette];
}

export default function HardieMotionStage({
  modelId,
  modelLabel,
  exterior,
  palette,
}: HardieMotionStageProps) {
  const resolvedAsset = resolveA600ConceptAsset(modelId, exterior, palette);
  const previewAvailable = resolvedAsset !== null;

  const [renderState, setRenderState] = useState<RenderState>({
    current: resolvedAsset,
    previous: null,
    nonce: 0,
  });

  if (renderState.current !== resolvedAsset) {
    setRenderState((current) => {
      return {
        current: resolvedAsset,
        previous: resolvedAsset ? current.current : null,
        nonce: current.nonce + 1,
      };
    });
  }

  useEffect(() => {
    if (!renderState.previous) return;
    const timer = window.setTimeout(() => {
      setRenderState((current) => ({ ...current, previous: null }));
    }, 320);
    return () => window.clearTimeout(timer);
  }, [renderState.nonce, renderState.previous]);

  const facadeLabel = previewAvailable
    ? FACADE_LABELS[exterior as ConceptFacade]
    : "Concept exterior";
  const colorLabel = previewAvailable
    ? COLOR_LABELS[palette as ConceptColor]
    : "Preview pending";
  const materialLabel =
    exterior === "dark-siding"
      ? "Vertical panel concept"
      : "Horizontal lap concept";
  const selectionLabel = previewAvailable
    ? `${modelLabel} · ${facadeLabel} · ${colorLabel} · White trim concept`
    : `${modelLabel} · matched new-construction concept preview pending`;

  return (
    <figure
      className={[
        styles.stage,
        renderState.previous ? styles.stageTransitioning : "",
      ].join(" ")}
      aria-label={selectionLabel}
    >
      {previewAvailable && renderState.current ? (
        <>
          {renderState.previous ? (
            <Image
              src={renderState.previous}
              alt=""
              fill
              sizes="100vw"
              unoptimized
              className={styles.previousImage}
            />
          ) : null}
          <Image
            key={`${renderState.current}-${renderState.nonce}`}
            src={renderState.current}
            alt={`Conceptual exterior view for ${modelLabel}`}
            fill
            preload
            sizes="100vw"
            unoptimized
            className={styles.currentImage}
          />
          <div className={styles.selection} aria-live="polite">
            <span>{selectionLabel}</span>
            <small>
              Concept render · physical sample and local availability verification required
            </small>
          </div>
          <div className={styles.materialCaption}>
            <span>{materialLabel}</span>
            <small>Exact matched concept render</small>
          </div>
        </>
      ) : (
        <div className={styles.previewPending}>
          <strong>Matched exterior concept preview pending</strong>
          <span>
            This model stays image-free until a matched new-construction render exists.
          </span>
        </div>
      )}

      <figcaption>Conceptual — not a completed West Coast KBP project.</figcaption>
    </figure>
  );
}
