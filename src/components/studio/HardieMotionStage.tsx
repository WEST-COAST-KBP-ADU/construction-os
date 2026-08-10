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

const MODEL_METADATA: Record<string, { code: string; size: string }> = {
  "studio-450": { code: "A450", size: "450 sq ft" },
  "one-bed-600": { code: "A600", size: "600 sq ft" },
  "two-bed-800": { code: "A800", size: "800 sq ft" },
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
    }, 1150);
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
  const modelMetadata = MODEL_METADATA[modelId] ?? {
    code: modelId.toUpperCase(),
    size: "Size unavailable",
  };

  function replayTransition() {
    if (!previewAvailable) return;
    setRenderState((current) => ({
      current: current.current,
      previous: current.current,
      nonce: current.nonce + 1,
    }));
  }

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
              sizes="(max-width: 960px) 100vw, 69vw"
              className={styles.previousImage}
            />
          ) : null}
          <Image
            key={`${renderState.current}-${renderState.nonce}`}
            src={renderState.current}
            alt={`Conceptual exterior view for ${modelLabel}`}
            fill
            preload
            sizes="(max-width: 960px) 100vw, 69vw"
            className={styles.currentImage}
          />
          <div className={styles.metadataPlate} aria-live="polite">
            <div className={styles.modelMetadata}>
              <strong>{modelMetadata.code}</strong>
              <span aria-hidden="true">·</span>
              <span>{modelLabel}</span>
              <span aria-hidden="true">·</span>
              <span>{modelMetadata.size}</span>
            </div>
            <span className={styles.renderStatus}>
              <span>Concept render</span>
              <span className={styles.statusDot} aria-hidden="true" />
            </span>
          </div>
          <button
            type="button"
            className={styles.replayButton}
            onClick={replayTransition}
          >
            Replay
          </button>
          <div className={styles.truthPlate}>
            <span>{materialLabel}</span>
            <small>
              Concept render · physical sample and local availability verification required
            </small>
          </div>
        </>
      ) : (
        <div className={styles.previewPending}>
          <span className={styles.pendingModel}>
            {modelMetadata.code} · {modelLabel} · {modelMetadata.size}
          </span>
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
