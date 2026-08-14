"use client";

import { useMemo, useState } from "react";

import {
  MODELS,
  SYNTHETIC_PROPERTY,
  candidatesForRotation,
  generateCandidates,
  inwardBuffer,
  type ModelId,
  type Rotation,
} from "@/src/lib/property-fit/syntheticFit";

import styles from "./PropertyFitLab.module.css";

const INITIAL_MODEL: ModelId = "one-bed-600";
const INITIAL_ROTATION: Rotation = 0;

export default function PropertyFitLab() {
  const [modelId, setModelId] = useState<ModelId>(INITIAL_MODEL);
  const [rotation, setRotation] = useState<Rotation>(INITIAL_ROTATION);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [showBuffer, setShowBuffer] = useState(true);
  const [showExclusions, setShowExclusions] = useState(true);

  const model = MODELS.find((item) => item.id === modelId) ?? MODELS[0];
  const candidates = useMemo(() => candidatesForRotation(modelId, rotation), [modelId, rotation]);
  const allResults = useMemo(() => generateCandidates(modelId), [modelId]);
  const selected = candidates[candidateIndex % Math.max(1, candidates.length)] ?? null;
  const buffered = inwardBuffer(SYNTHETIC_PROPERTY);
  const rectProps = (rect: { x: number; y: number; width: number; depth: number }) => ({
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.depth,
  });

  function selectModel(nextModel: ModelId) {
    setModelId(nextModel);
    setCandidateIndex(0);
  }

  function rotate() {
    setRotation((current) => (current === 0 ? 90 : 0));
    setCandidateIndex(0);
  }

  function moveCandidate(direction: -1 | 1) {
    if (candidates.length === 0) return;
    setCandidateIndex((current) => (current + direction + candidates.length) % candidates.length);
  }

  function reset() {
    setModelId(INITIAL_MODEL);
    setRotation(INITIAL_ROTATION);
    setCandidateIndex(0);
    setShowBuffer(true);
    setShowExclusions(true);
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Synthetic lab · internal interaction proof</p>
          <h1>Property Fit</h1>
        </div>
        <p className={styles.verification}>Requires official source verification.</p>
      </header>

      <section className={styles.boundary} aria-label="Use boundary">
        Conceptual geometry screening only. Not a survey, zoning determination, permit decision, or construction feasibility finding.
      </section>

      <div className={styles.workspace}>
        <section className={styles.canvasPanel} aria-labelledby="parcel-title">
          <div className={styles.canvasHeading}>
            <div>
              <p className={styles.kicker}>Fixture {SYNTHETIC_PROPERTY.version}</p>
              <h2 id="parcel-title">Fictional California-like parcel</h2>
            </div>
            <span className={styles.syntheticBadge}>synthetic</span>
          </div>

          <div className={styles.diagramWrap}>
            <svg className={styles.diagram} viewBox="0 0 100 130" role="img" aria-labelledby="diagram-title diagram-desc">
              <title id="diagram-title">Synthetic parcel candidate diagram</title>
              <desc id="diagram-desc">A fictional parcel boundary with assumed buffer, assumed exclusions, candidate positions, and a selected ADU footprint.</desc>
              <rect className={styles.ground} x="2" y="2" width="96" height="126" rx="2" />
              <rect className={styles.parcel} {...rectProps(SYNTHETIC_PROPERTY.parcel)} />
              {showBuffer && <rect className={styles.buffer} {...rectProps(buffered)} />}
              {showExclusions && SYNTHETIC_PROPERTY.exclusions.map((zone) => (
                <g key={zone.id}>
                  <rect className={styles.exclusion} {...rectProps(zone)} />
                  <text className={styles.zoneLabel} x={zone.x + zone.width / 2} y={zone.y + zone.depth / 2}>
                    {zone.id === "existing-home" ? "Existing home" : zone.id === "assumed-utility" ? "Utility" : "Tree"}
                  </text>
                </g>
              ))}
              {candidates.map((candidate) => (
                <rect key={candidate.id} className={styles.candidate} data-candidate-id={candidate.id} {...rectProps(candidate)} />
              ))}
              {selected && (
                <g>
                  <rect className={styles.selected} data-selected-candidate={selected.id} {...rectProps(selected)} />
                  <text className={styles.selectedLabel} x={selected.x + selected.width / 2} y={selected.y + selected.depth / 2}>Selected ADU</text>
                </g>
              )}
              <path className={styles.street} d="M4 125 H96" />
              <text className={styles.streetLabel} x="50" y="128">Fictional local street</text>
            </svg>
          </div>

          <ul className={styles.legend} aria-label="Semantic legend">
            <li><i className={styles.legendSynthetic} /> <span><strong>synthetic</strong> · owned fixture geometry</span></li>
            <li><i className={styles.legendAssumed} /> <span><strong>assumed</strong> · planning buffer and exclusions</span></li>
            <li><i className={styles.legendUnknown} /> <span><strong>unknown</strong> · real site conditions</span></li>
            <li><i className={styles.legendReview} /> <span><strong>human-review-required</strong> · every real-world conclusion</span></li>
          </ul>
        </section>

        <aside className={styles.rail} aria-labelledby="controls-title">
          <div className={styles.railHeading}>
            <p className={styles.kicker}>Deterministic controls</p>
            <h2 id="controls-title">Test the geometry state</h2>
          </div>

          <fieldset className={styles.controlGroup}>
            <legend>Select model</legend>
            <div className={styles.modelGrid}>
              {MODELS.map((item) => (
                <button key={item.id} type="button" className={item.id === modelId ? styles.selectedButton : styles.button} aria-pressed={item.id === modelId} onClick={() => selectModel(item.id)}>
                  <span>{item.label}</span><small>{item.id} · {item.sizeBand}</small>
                </button>
              ))}
            </div>
          </fieldset>

          <div className={styles.actionGrid}>
            <button type="button" className={styles.button} onClick={rotate}>Rotate footprint 90°</button>
            <button type="button" className={styles.button} onClick={() => moveCandidate(-1)} disabled={!selected}>Previous valid candidate</button>
            <button type="button" className={styles.button} onClick={() => moveCandidate(1)} disabled={!selected}>Next valid candidate</button>
            <button type="button" className={showBuffer ? styles.selectedButton : styles.button} aria-pressed={showBuffer} onClick={() => setShowBuffer((value) => !value)}>Assumed buffer</button>
            <button type="button" className={showExclusions ? styles.selectedButton : styles.button} aria-pressed={showExclusions} onClick={() => setShowExclusions((value) => !value)}>Assumed exclusions</button>
            <button type="button" className={styles.resetButton} onClick={reset}>Reset lab</button>
          </div>

          <section className={styles.status} aria-live="polite" aria-atomic="true">
            <h3>Geometric status</h3>
            <dl>
              <div><dt>Model</dt><dd>{model.id}</dd></div>
              <div><dt>Size band</dt><dd>{model.sizeBand}</dd></div>
              <div><dt>Footprint</dt><dd>{selected ? `${selected.width} × ${selected.depth} ft` : "No fit"}</dd></div>
              <div><dt>Rotation</dt><dd>{rotation}°</dd></div>
              <div><dt>Candidate</dt><dd>{selected ? `${candidateIndex + 1} of ${candidates.length}` : "0 of 0"}</dd></div>
              <div><dt>Collision</dt><dd>{selected ? "None in assumed geometry" : allResults.rejected[0]?.reason ?? "No candidate"}</dd></div>
            </dl>
            <p>Requires official source verification.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
