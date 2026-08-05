"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";

import catalogData from "@/src/data/studio/catalog/releases/2026.08.0.json";
import { resolveStudioAsset } from "@/src/lib/studio/assetManifest";
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

import styles from "./StudioWorkbench.module.css";

const catalog = catalogData as StudioCatalog;

const optionLabels: Record<StudioOptionKey, Record<string, string>> = {
  exterior: {
    "stucco-smooth": "Smooth stucco",
    "lap-siding": "Lap siding",
    "dark-siding": "Dark siding",
  },
  palette: {
    "warm-white": "Warm white",
    "sand-dune": "Sand dune",
    "soft-clay": "Soft clay",
    sage: "Sage",
    charcoal: "Charcoal",
  },
  roof: {
    gable: "Gable",
    shed: "Shed",
  },
  windows: {
    standard: "Standard",
    tall: "Tall",
  },
  interior: {
    essential: "Essential",
    comfort: "Comfort",
  },
};

const rowLabels: Record<StudioOptionKey, string> = {
  exterior: "Exterior",
  palette: "Palette",
  roof: "Roof",
  windows: "Windows",
  interior: "Interior",
};

const reasonLabels: Record<string, string> = {
  roof_window_clearance: "Tall windows are unavailable with the compact shed roof.",
  compact_interior_clearance: "The comfort interior is unavailable in the compact studio.",
};

const optionKeys = Object.keys(rowLabels) as StudioOptionKey[];

function defaultsFor(archetype: string): StudioSelections {
  return {
    exterior: "stucco-smooth",
    palette: archetype === "studio-450" ? "warm-white" : "sand-dune",
    roof: "gable",
    windows: "standard",
    interior: archetype === "studio-450" ? "essential" : "comfort",
  };
}

function inputFor(archetype: string, selections = defaultsFor(archetype)): ConfigurationCandidateInput {
  const catalogArchetype = catalog.archetypes.find((item) => item.id === archetype);
  if (!catalogArchetype) {
    throw new Error("unknown_archetype");
  }

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
  const archetype = catalog.archetypes.find((item) => item.id === archetypeId);
  if (!archetype) return "—";

  return `${Math.round((archetype.size_band.min_sqft + archetype.size_band.max_sqft) / 2)} sq ft`;
}

export default function StudioWorkbench() {
  const [archetype, setArchetype] = useState("one-bed-600");
  const [selections, setSelections] = useState<StudioSelections>(() => defaultsFor("one-bed-600"));
  const [candidate, setCandidate] = useState<ConfigurationCandidate | null>(null);
  const [status, setStatus] = useState("Building deterministic configuration…");
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [comparisonInputs, setComparisonInputs] = useState<ConfigurationCandidateInput[]>(() => [
    inputFor("one-bed-600"),
    inputFor("studio-450"),
  ]);

  const activeArchetype = useMemo(
    () => catalog.archetypes.find((item) => item.id === archetype) ?? catalog.archetypes[0],
    [archetype],
  );

  const candidateInput = useMemo(
    () => inputFor(archetype, selections),
    [archetype, selections],
  );

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
    return () => {
      cancelled = true;
    };
  }, [candidateInput]);

  function selectArchetype(nextArchetype: string) {
    setArchetype(nextArchetype);
    setSelections(defaultsFor(nextArchetype));
    setComparisonOpen(false);
  }

  function selectOption(key: StudioOptionKey, value: string) {
    const decision = evaluateOption(catalog, archetype, selections, key, value);
    if (!decision.allowed) {
      setStatus(`Selection refused: ${reasonLabels[decision.reasonCode] ?? decision.reasonCode}`);
      return;
    }

    setSelections((current) => ({ ...current, [key]: value }));
    setComparisonOpen(false);
  }

  function addCurrentConcept() {
    setComparisonInputs((current) => {
      const withoutCurrent = current.filter(
        (item) => JSON.stringify(item) !== JSON.stringify(candidateInput),
      );
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

  const mainImage = resolveStudioAsset(activeArchetype.geometry_ref);
  const hashLabel = candidate ? candidate.config_hash.slice(0, 12).toUpperCase() : "PENDING";

  return (
    <div className={styles.page}>
      <section className={styles.titleBar} aria-labelledby="studio-title">
        <div>
          <h1 id="studio-title">Concept Studio</h1>
          <p className={styles.sampleLabel}>Synthetic sample property</p>
        </div>
        <p className={styles.privacyNote}>No address or contact information is collected.</p>
      </section>

      <div className={styles.workbench}>
        <figure className={styles.stage}>
          <Image
            key={mainImage}
            src={mainImage}
            alt={`Conceptual exterior view for ${activeArchetype.label}`}
            fill
            priority
            sizes="(max-width: 960px) 100vw, 69vw"
            className={styles.stageImage}
          />
          <figcaption>Conceptual — not a completed West Coast KBP project.</figcaption>
        </figure>

        <aside className={styles.configurator} aria-labelledby="configure-title">
          <header className={styles.configuratorHeader}>
            <h2 id="configure-title">Configure your concept</h2>
            <p>Explore combinations and compare side by side.</p>
          </header>

          <fieldset className={styles.optionRow}>
            <legend>Archetype</legend>
            <div className={styles.optionGrid}>
              {catalog.archetypes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={archetype === item.id ? styles.optionSelected : styles.optionButton}
                  aria-pressed={archetype === item.id}
                  onClick={() => selectArchetype(item.id)}
                >
                  <span>{Math.round((item.size_band.min_sqft + item.size_band.max_sqft) / 2)}</span>
                  <small>{item.label.replace(" ADU", "")}</small>
                </button>
              ))}
            </div>
          </fieldset>

          {optionKeys.map((key) => {
            const disabledOptions = catalog.options[key].filter(
              (value) => !evaluateOption(catalog, archetype, selections, key, value).allowed,
            );

            return (
              <fieldset className={styles.optionRow} key={key}>
                <legend>{rowLabels[key]}</legend>
                <div className={key === "palette" ? styles.swatchGrid : styles.optionGrid}>
                  {catalog.options[key].map((value) => {
                    const decision = evaluateOption(catalog, archetype, selections, key, value);
                    const isSelected = selections[key] === value;
                    const reason = decision.allowed ? undefined : reasonLabels[decision.reasonCode];

                    return (
                      <button
                        key={value}
                        type="button"
                        className={[
                          key === "palette" ? styles.swatch : styles.optionButton,
                          isSelected ? styles.optionSelected : "",
                        ].join(" ")}
                        style={key === "palette" ? { "--swatch-color": `var(--studio-${value})` } as CSSProperties : undefined}
                        aria-label={`${rowLabels[key]}: ${optionLabels[key][value]}${reason ? `. Unavailable: ${reason}` : ""}`}
                        aria-pressed={isSelected}
                        disabled={!decision.allowed}
                        title={reason}
                        onClick={() => selectOption(key, value)}
                      >
                        {key === "palette" ? <span className={styles.visuallyHidden}>{optionLabels[key][value]}</span> : optionLabels[key][value]}
                      </button>
                    );
                  })}
                </div>
                {disabledOptions.length > 0 ? (
                  <p className={styles.compatibilityNote}>Some choices are unavailable for this configuration.</p>
                ) : null}
              </fieldset>
            );
          })}
        </aside>
      </div>

      <section className={styles.compareRail} aria-labelledby="compare-title">
        <div className={styles.compareIntro}>
          <h2 id="compare-title">Compare up to 3 concepts</h2>
          <p>Keep candidate configurations in memory and review them side by side.</p>
        </div>

        <div className={styles.conceptList}>
          {comparisonInputs.map((item, index) => {
            const itemArchetype = catalog.archetypes.find((entry) => entry.id === item.archetype);
            const image = resolveStudioAsset(itemArchetype?.geometry_ref);
            return (
              <button
                key={`${item.archetype}-${index}`}
                type="button"
                className={styles.conceptCard}
                onClick={() => {
                  setArchetype(item.archetype);
                  setSelections(item.selections);
                  setComparisonOpen(false);
                }}
              >
                <span>Concept {String.fromCharCode(65 + index)}</span>
                <span className={styles.conceptImage}>
                  <Image src={image} alt="" fill sizes="10rem" />
                </span>
              </button>
            );
          })}
          {comparisonInputs.length < 3 ? (
            <button type="button" className={styles.addConcept} onClick={addCurrentConcept}>
              <span aria-hidden="true">+</span>
              Add current
            </button>
          ) : null}
        </div>

        <button
          type="button"
          className={styles.compareButton}
          onClick={() => setComparisonOpen((open) => !open)}
        >
          {comparisonOpen ? "Close comparison" : "Compare concepts"}
        </button>

        <div className={styles.currentConfig}>
          <h2>Current configuration</h2>
          <p>
            {activeArchetype.label} · {sizeLabel(archetype)} · {optionLabels.exterior[selections.exterior]} ·{" "}
            {optionLabels.palette[selections.palette]}
          </p>
          <div className={styles.hashRow}>
            <span>Configuration ID</span>
            <code>{hashLabel}</code>
            <button type="button" onClick={() => void copyConfigurationId()} disabled={!candidate}>
              Copy ID
            </button>
          </div>
        </div>
      </section>

      <p className={styles.status} role="status" aria-live="polite">{status}</p>

      {comparisonOpen ? (
        <section className={styles.comparisonPanel} aria-labelledby="comparison-heading">
          <div className={styles.comparisonHeader}>
            <div>
              <p>In-memory comparison</p>
              <h2 id="comparison-heading">Review the trade-offs, without creating a lead.</h2>
            </div>
            <button type="button" onClick={() => setComparisonOpen(false)}>Close</button>
          </div>
          <div className={styles.comparisonGrid}>
            {comparisonInputs.map((item, index) => (
              <article key={`${item.archetype}-comparison-${index}`}>
                <p>Concept {String.fromCharCode(65 + index)}</p>
                <h3>{candidateLabel(item)}</h3>
                <dl>
                  <div><dt>Size</dt><dd>{sizeLabel(item.archetype)}</dd></div>
                  {optionKeys.map((key) => (
                    <div key={key}><dt>{rowLabels[key]}</dt><dd>{optionLabels[key][item.selections[key]]}</dd></div>
                  ))}
                </dl>
              </article>
            ))}
          </div>
          <p className={styles.comparisonDisclaimer}>
            Conceptual only. No property, zoning, permit, buildability, price, or schedule conclusion is made.
          </p>
        </section>
      ) : null}
    </div>
  );
}
