"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import catalogData from "@/src/data/studio/catalog/releases/2026.08.0.json";
import {
  assertValidCandidate,
  buildConfigurationCandidate,
  evaluateOption,
} from "@/src/lib/studio/studio";
import type {
  ConfigurationCandidate,
  ConfigurationCandidateInput,
  StudioCatalog,
  StudioOptionKey,
  StudioSelections,
} from "@/src/lib/studio/types";

import HardieMotionStage, { resolveA600ConceptAsset } from "./HardieMotionStage";
import styles from "./StudioWorkbench.module.css";

const catalog = catalogData as StudioCatalog;
const A600_ARCHETYPE_ID = "one-bed-600" as const;
const PUBLIC_LAUNCH_MODEL_REFUSED = "public_launch_model_refused";

const optionLabels: Record<StudioOptionKey, Record<string, string>> = {
  exterior: {
    "stucco-smooth": "Smooth stucco",
    "lap-siding": "Horizontal lap concept",
    "dark-siding": "Vertical panel concept",
  },
  palette: {
    "warm-white": "Warm white",
    "sand-dune": "Sand dune",
    "soft-clay": "Soft clay",
    sage: "Blue concept",
    charcoal: "Charcoal concept",
  },
  roof: { gable: "Gable", shed: "Shed" },
  windows: { standard: "Standard", tall: "Tall" },
  interior: { essential: "Essential", comfort: "Comfort" },
};

const rowLabels: Record<StudioOptionKey, string> = {
  exterior: "Facade system",
  palette: "Facade color",
  roof: "Roof",
  windows: "Windows",
  interior: "Interior",
};

const reasonLabels: Record<string, string> = {
  roof_window_clearance: "Tall windows are unavailable with the compact shed roof.",
  compact_interior_clearance: "The comfort interior is unavailable in the compact studio.",
};

const optionKeys: StudioOptionKey[] = ["exterior", "palette"];

const swatches: Record<"exterior" | "palette", Record<string, string>> = {
  exterior: {
    "lap-siding": "/images/studio-swatch-lap-blue-concept-v1.webp",
    "dark-siding": "/images/studio-swatch-panel-blue-concept-v1.webp",
  },
  palette: {
    sage: "/images/studio-swatch-lap-blue-concept-v1.webp",
    charcoal: "/images/studio-swatch-lap-charcoal-concept-v1.webp",
  },
};

function defaultsFor(archetype: string): StudioSelections {
  if (archetype !== A600_ARCHETYPE_ID) throw new Error(PUBLIC_LAUNCH_MODEL_REFUSED);
  return {
    exterior: "lap-siding",
    palette: "sage",
    roof: "gable",
    windows: "standard",
    interior: "comfort",
  };
}

function inputFor(archetype: string, selections = defaultsFor(archetype)): ConfigurationCandidateInput {
  if (archetype !== A600_ARCHETYPE_ID) throw new Error(PUBLIC_LAUNCH_MODEL_REFUSED);
  const catalogArchetype = catalog.archetypes.find((item) => item.id === archetype);
  if (!catalogArchetype) throw new Error("unknown_archetype");

  return {
    schema: "config/1",
    catalog_version: catalog.version,
    archetype,
    layout: catalogArchetype.layouts[0],
    selections,
    disclaimer_version: "d1",
  };
}

function candidateLabel(candidate: ConfigurationCandidateInput): string {
  return catalog.archetypes.find((item) => item.id === candidate.archetype)?.label ?? candidate.archetype;
}

function sizeLabel(archetypeId: string): string {
  const item = catalog.archetypes.find((archetype) => archetype.id === archetypeId);
  if (!item) return "—";
  return `${Math.round((item.size_band.min_sqft + item.size_band.max_sqft) / 2)} sq ft`;
}

export default function StudioWorkbench() {
  const archetype = A600_ARCHETYPE_ID;
  const [selections, setSelections] = useState<StudioSelections>(() => defaultsFor(A600_ARCHETYPE_ID));
  const [candidate, setCandidate] = useState<ConfigurationCandidate | null>(null);
  const [status, setStatus] = useState("Building deterministic configuration…");
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [comparisonInputs, setComparisonInputs] = useState<ConfigurationCandidateInput[]>(() => {
    const defaults = defaultsFor(A600_ARCHETYPE_ID);
    return [
      inputFor(A600_ARCHETYPE_ID, defaults),
      inputFor(A600_ARCHETYPE_ID, { ...defaults, exterior: "dark-siding", palette: "charcoal" }),
    ];
  });

  const activeArchetype = catalog.archetypes.find((item) => item.id === archetype) ?? catalog.archetypes[0];
  const candidateInput = useMemo(() => inputFor(archetype, selections), [archetype, selections]);

  useEffect(() => {
    let cancelled = false;
    async function createCandidate() {
      try {
        assertValidCandidate(catalog, candidateInput);
        const nextCandidate = await buildConfigurationCandidate(catalog, candidateInput);
        if (!cancelled) {
          setCandidate(nextCandidate);
          setStatus("Configuration ready. Replay hash is stable for this catalog release.");
        }
      } catch (error) {
        if (!cancelled) {
          setCandidate(null);
          setStatus(error instanceof Error ? `Configuration refused: ${error.message}` : "Configuration refused.");
        }
      }
    }
    void createCandidate();
    return () => { cancelled = true; };
  }, [candidateInput]);

  function selectOption(key: StudioOptionKey, value: string) {
    const decision = evaluateOption(catalog, archetype, selections, key, value);
    if (!decision.allowed) {
      setStatus(`Selection refused: ${reasonLabels[decision.reasonCode] ?? decision.reasonCode}`);
      return;
    }
    setSelections((current) => ({ ...current, [key]: value }));
    setComparisonOpen(false);
  }

  function restoreConcept(item: ConfigurationCandidateInput) {
    if (item.archetype !== A600_ARCHETYPE_ID) {
      setStatus("Restore refused: A600 is the only public launch model.");
      return;
    }
    setSelections(item.selections);
    setComparisonOpen(false);
  }

  function addCurrentConcept() {
    setComparisonInputs((current) => {
      const withoutCurrent = current.filter((item) => JSON.stringify(item) !== JSON.stringify(candidateInput));
      return [candidateInput, ...withoutCurrent].slice(0, 3);
    });
    setStatus("Current concept added to the in-memory comparison. Nothing was saved or sent.");
  }

  async function copyConfigurationId() {
    if (!candidate) return;
    try {
      await navigator.clipboard.writeText(candidate.config_hash);
      setStatus("Configuration ID copied. Nothing was saved or sent.");
    } catch {
      setStatus("Copy unavailable in this browser. The configuration remains visible and was not sent.");
    }
  }

  const hashLabel = candidate ? candidate.config_hash.slice(0, 12).toUpperCase() : "PENDING";

  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="studio-title">
        <div className={styles.titleOverlay}>
          <h1 id="studio-title">Concept Studio</h1>
          <p>Precision configurator</p>
        </div>

        <div className={styles.modelStatus}>
          <span>{activeArchetype.label.replace(" ADU", "")}</span>
          <span>{sizeLabel(archetype)}</span>
          <small><i aria-hidden="true" />Concept render</small>
        </div>

        <div className={styles.stageWrap}>
          <HardieMotionStage
            key={archetype}
            modelId={archetype}
            modelLabel={activeArchetype.label}
            exterior={selections.exterior}
            palette={selections.palette}
          />
        </div>

        <section className={styles.dock} aria-label="Exterior concept decisions">
          <section className={styles.dockGroup} aria-label="Launch model">
            <h2>Launch model</h2>
            <p>A600 · One-bedroom ADU · 600 sq ft</p>
          </section>

          {optionKeys.map((key) => {
            const visibleOptions = catalog.options[key].filter((value) =>
              key === "exterior"
                ? value === "lap-siding" || value === "dark-siding"
                : value === "sage" || value === "charcoal",
            );
            return (
              <fieldset className={styles.dockGroup} key={key}>
                <legend>{rowLabels[key]}</legend>
                <div className={styles.materialChoices}>
                  {visibleOptions.map((value) => {
                    const decision = evaluateOption(catalog, archetype, selections, key, value);
                    const disabled = !decision.allowed;
                    const selected = selections[key] === value;
                    const reason = decision.allowed ? undefined : reasonLabels[decision.reasonCode];
                    const swatch = key === "exterior"
                      ? swatches.exterior[value]
                      : value === "sage" && selections.exterior === "dark-siding"
                        ? "/images/studio-swatch-panel-blue-concept-v1.webp"
                        : value === "charcoal" && selections.exterior === "dark-siding"
                          ? "/images/studio-swatch-panel-charcoal-concept-v1.webp"
                          : swatches.palette[value];
                    return (
                      <button
                        key={value}
                        type="button"
                        className={selected ? styles.selected : undefined}
                        aria-label={`${rowLabels[key]}: ${optionLabels[key][value]}${reason ? `. Unavailable: ${reason}` : ""}`}
                        aria-pressed={selected}
                        disabled={disabled}
                        title={reason}
                        onClick={() => selectOption(key, value)}
                      >
                        <Image src={swatch} alt="" width={160} height={80} />
                        <span>{optionLabels[key][value]}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}

          <section className={`${styles.dockGroup} ${styles.trimInfo}`} aria-label="Fixed trim information">
            <h2>Trim</h2>
            <Image src="/images/studio-swatch-white-trim-concept-v1.webp" alt="" width={160} height={80} />
            <p>White trim concept — fixed in this preview</p>
          </section>

          <section className={`${styles.dockGroup} ${styles.compareActions}`} aria-labelledby="compare-title">
            <h2 id="compare-title">Compare</h2>
            <p>{comparisonInputs.length} of 3 in memory</p>
            <button type="button" onClick={addCurrentConcept} disabled={comparisonInputs.length >= 3}>Add current</button>
            <button
              type="button"
              className={styles.compareButton}
              aria-expanded={comparisonOpen}
              aria-controls="studio-comparison-panel"
              onClick={() => setComparisonOpen((open) => !open)}
            >
              {comparisonOpen ? "Close comparison" : "Open comparison"}
            </button>
          </section>
        </section>
      </section>

      <section className={styles.truthBar} aria-label="Current configuration status">
        <div>
          <span>Current configuration</span>
          <p>{activeArchetype.label} · {sizeLabel(archetype)} · {optionLabels.exterior[selections.exterior]} · {optionLabels.palette[selections.palette]}</p>
        </div>
        <div className={styles.hashRow}>
          <span>Configuration ID</span><code>{hashLabel}</code>
          <button type="button" onClick={() => void copyConfigurationId()} disabled={!candidate}>Copy ID</button>
        </div>
        <p className={styles.status} role="status" aria-live="polite"><i aria-hidden="true" />{status}</p>
        <p className={styles.privacyNote}>In-memory only. No address or contact information is collected or sent.</p>
      </section>

      {comparisonOpen ? (
        <section id="studio-comparison-panel" className={styles.comparisonPanel} aria-labelledby="comparison-heading">
          <header className={styles.comparisonHeader}>
            <div><p>In-memory comparison</p><h2 id="comparison-heading">Review exact stored selections.</h2></div>
            <button type="button" onClick={() => setComparisonOpen(false)}>Close</button>
          </header>
          <div className={styles.comparisonGrid}>
            {comparisonInputs.map((item, index) => {
              const preview = resolveA600ConceptAsset(
                item.archetype,
                item.selections.exterior,
                item.selections.palette,
              );
              return (
                <article key={`${item.archetype}-comparison-${index}`}>
                  <div className={styles.comparisonImage}>
                    {preview ? <Image src={preview} alt="" fill sizes="(max-width: 42rem) 100vw, 33vw" /> : <span>Configuration preview unavailable</span>}
                  </div>
                  <p>Concept {String.fromCharCode(65 + index)}</p>
                  <h3>{candidateLabel(item)}</h3>
                  <dl>
                    <div><dt>Size</dt><dd>{sizeLabel(item.archetype)}</dd></div>
                    {optionKeys.map((key) => <div key={key}><dt>{rowLabels[key]}</dt><dd>{optionLabels[key][item.selections[key]]}</dd></div>)}
                  </dl>
                  <button type="button" onClick={() => restoreConcept(item)}>Restore exact selection</button>
                </article>
              );
            })}
          </div>
          <p className={styles.comparisonDisclaimer}>Conceptual only. No property, zoning, permit, buildability, price, or schedule conclusion is made.</p>
        </section>
      ) : null}
    </main>
  );
}
