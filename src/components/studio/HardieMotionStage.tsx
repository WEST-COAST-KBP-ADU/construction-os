"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import styles from "./HardieMotionStage.module.css";

type HardieFacade = "lap-siding" | "dark-siding";
type HardieColor = "sage" | "charcoal";

type RenderState = {
  current: string;
  previous: string | null;
  nonce: number;
};

type HardieMotionStageProps = {
  fallbackImage: string;
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
} as const satisfies Record<HardieFacade, Record<HardieColor, string>>;

const FACADE_LABELS: Record<HardieFacade, string> = {
  "lap-siding": "Hardie Plank",
  "dark-siding": "Hardie Panel",
};

const COLOR_LABELS: Record<HardieColor, string> = {
  sage: "Evening Blue",
  charcoal: "Iron Gray",
};

function isHardieFacade(value: string): value is HardieFacade {
  return value === "lap-siding" || value === "dark-siding";
}

function isHardieColor(value: string): value is HardieColor {
  return value === "sage" || value === "charcoal";
}

export default function HardieMotionStage({
  fallbackImage,
  modelId,
  modelLabel,
  exterior,
  palette,
}: HardieMotionStageProps) {
  const previewAvailable =
    modelId === "one-bed-600" && isHardieFacade(exterior) && isHardieColor(palette);

  const resolvedAsset = useMemo(
    () =>
      previewAvailable
        ? PREVIEW_ASSETS[exterior as HardieFacade][palette as HardieColor]
        : fallbackImage,
    [exterior, fallbackImage, palette, previewAvailable],
  );

  const [renderState, setRenderState] = useState<RenderState>({
    current: resolvedAsset,
    previous: null,
    nonce: 0,
  });

  if (renderState.current !== resolvedAsset) {
    setRenderState((current) => ({
      current: resolvedAsset,
      previous: current.current,
      nonce: current.nonce + 1,
    }));
  }

  useEffect(() => {
    if (!renderState.previous) return;
    const timer = window.setTimeout(() => {
      setRenderState((current) => ({ ...current, previous: null }));
    }, 1150);
    return () => window.clearTimeout(timer);
  }, [renderState.nonce, renderState.previous]);

  const facadeLabel = previewAvailable ? FACADE_LABELS[exterior as HardieFacade] : "Concept exterior";
  const colorLabel = previewAvailable ? COLOR_LABELS[palette as HardieColor] : "Preview pending";
  const materialLabel = exterior === "dark-siding" ? "Vertical smooth panel" : "Horizontal lap siding";
  const selectionLabel = previewAvailable
    ? `${modelLabel} · ${facadeLabel} · ${colorLabel} · Arctic White trim`
    : `${modelLabel} · matched Hardie render pending`;

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
      {renderState.previous ? (
        <Image
          src={renderState.previous}
          alt=""
          fill
          priority
          sizes="(max-width: 960px) 100vw, 69vw"
          className={styles.previousImage}
        />
      ) : null}
      <Image
        key={`${renderState.current}-${renderState.nonce}`}
        src={renderState.current}
        alt={`Conceptual exterior view for ${modelLabel}`}
        fill
        priority
        sizes="(max-width: 960px) 100vw, 69vw"
        className={styles.currentImage}
      />

      {previewAvailable ? (
        <>
          <div className={styles.materialSweep} aria-hidden="true" />
          <div className={styles.materialLens} aria-hidden="true">
            <Image
              src={renderState.current}
              alt=""
              fill
              sizes="10rem"
              className={styles.lensImage}
            />
          </div>
          <div className={styles.selection} aria-live="polite">
            <span>{selectionLabel}</span>
            <small>Concept render · physical sample required</small>
          </div>
          <button
            type="button"
            className={styles.replayButton}
            onClick={replayTransition}
          >
            Replay transition
          </button>
          <div className={styles.materialCaption}>
            <span>{materialLabel}</span>
            <small>1.1 s material resolve</small>
          </div>
        </>
      ) : (
        <div className={styles.previewPending}>
          Matched Hardie visualization is live for the 600 model first.
        </div>
      )}

      <figcaption>Conceptual — not a completed West Coast KBP project.</figcaption>
    </figure>
  );
}
