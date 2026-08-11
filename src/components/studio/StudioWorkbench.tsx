"use client";

import Image from "next/image";
import {
  AnimatePresence,
  LayoutGroup,
  LazyMotion,
  MotionConfig,
  domAnimation,
  m,
  useReducedMotion,
} from "motion/react";
import { useEffect, useMemo, useState } from "react";

import catalogData from "@/src/data/studio/catalog/releases/2026.08.0.json";
import executableProfile from "@/src/data/studio/models/executable/adu-a-600@1.0.0.json";
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

import ArchitecturalPlanViewport from "./ArchitecturalPlanViewport";
import HardieMotionStage, { resolveA600ConceptAsset } from "./HardieMotionStage";
import styles from "./StudioWorkbench.module.css";

const catalog = catalogData as StudioCatalog;
const A600_ARCHETYPE = "one-bed-600";

type InstrumentMode = "exterior" | "plan" | "site";
type ExteriorOptionKey = Extract<StudioOptionKey, "exterior" | "palette">;

const modes: Array<{ id: InstrumentMode; label: string; meta: string }> = [
  { id: "exterior", label: "Exterior", meta: "Source render" },
  { id: "plan", label: "Plan", meta: "Exact vector" },
  { id: "site", label: "Site gate", meta: "No parcel" },
];

const optionLabels: Record<ExteriorOptionKey, Record<string, string>> = {
  exterior: {
    "lap-siding": "Horizontal lap",
    "dark-siding": "Vertical panel",
  },
  palette: {
    sage: "Blue study",
    charcoal: "Charcoal study",
  },
};

const optionCodes: Record<ExteriorOptionKey, Record<string, string>> = {
  exterior: {
    "lap-siding": "F-01",
    "dark-siding": "F-02",
  },
  palette: {
    sage: "C-01",
    charcoal: "C-02",
  },
};

const optionKeys: ExteriorOptionKey[] = ["exterior", "palette"];

function defaultSelections(): StudioSelections {
  return {
    exterior: "lap-siding",
    palette: "sage",
    roof: "gable",
    windows: "standard",
    interior: "comfort",
  };
}

function alternateSelections(): StudioSelections {
  return {
    ...defaultSelections(),
    exterior: "dark-siding",
    palette: "charcoal",
  };
}

function inputFor(selections = defaultSelections()): ConfigurationCandidateInput {
  const archetype = catalog.archetypes.find((item) => item.id === A600_ARCHETYPE);
  if (!archetype) throw new Error("a600_archetype_missing");

  return {
    schema: "config/1",
    catalog_version: catalog.version,
    archetype: A600_ARCHETYPE,
    layout: archetype.layouts[0],
    selections,
    disclaimer_version: "d1",
  };
}

function conceptName(input: ConfigurationCandidateInput): string {
  return `${optionLabels.exterior[input.selections.exterior]} / ${optionLabels.palette[input.selections.palette]}`;
}

export default function StudioWorkbench() {
  const reduceMotion = useReducedMotion();
  const [mode, setMode] = useState<InstrumentMode>("exterior");
  const [selections, setSelections] = useState<StudioSelections>(defaultSelections);
  const [candidate, setCandidate] = useState<ConfigurationCandidate | null>(null);
  const [status, setStatus] = useState("Compiling deterministic A600 configuration…");
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [comparisonInputs, setComparisonInputs] = useState<ConfigurationCandidateInput[]>(() => [
    inputFor(defaultSelections()),
    inputFor(alternateSelections()),
  ]);

  const candidateInput = useMemo(() => inputFor(selections), [selections]);

  useEffect(() => {
    let cancelled = false;

    async function createCandidate() {
      try {
        assertValidCandidate(catalog, candidateInput);
        const nextCandidate = await buildConfigurationCandidate(catalog, candidateInput);
        if (!cancelled) {
          setCandidate(nextCandidate);
          setStatus("A600 configuration ready · deterministic replay ID active");
        }
      } catch (error) {
        if (!cancelled) {
          setCandidate(null);
          setStatus(error instanceof Error ? `Configuration refused · ${error.message}` : "Configuration refused");
        }
      }
    }

    void createCandidate();
    return () => {
      cancelled = true;
    };
  }, [candidateInput]);

  function selectOption(key: ExteriorOptionKey, value: string) {
    const decision = evaluateOption(catalog, A600_ARCHETYPE, selections, key, value);
    if (!decision.allowed) {
      setStatus(`Selection refused · ${decision.reasonCode}`);
      return;
    }

    setSelections((current) => ({ ...current, [key]: value }));
    setStatus(`${optionLabels[key][value]} selected · source render resolving`);
  }

  function addCurrentConcept() {
    const serialized = JSON.stringify(candidateInput);
    if (comparisonInputs.some((item) => JSON.stringify(item) === serialized)) {
      setStatus("Current A600 study is already in the comparison set");
      return;
    }

    setComparisonInputs((current) => [candidateInput, ...current].slice(0, 3));
    setStatus("Current A600 study added in memory · nothing saved or sent");
  }

  function restoreConcept(input: ConfigurationCandidateInput) {
    setSelections(input.selections);
    setMode("exterior");
    setComparisonOpen(false);
    setStatus(`${conceptName(input)} restored`);
  }

  async function copyConfigurationId() {
    if (!candidate) return;

    try {
      await navigator.clipboard.writeText(candidate.config_hash);
      setStatus("Configuration ID copied · nothing saved or sent");
    } catch {
      setStatus("Copy unavailable in this browser · configuration was not sent");
    }
  }

  const hashLabel = candidate ? candidate.config_hash.slice(0, 12).toUpperCase() : "PENDING";
  const activeMode = modes.find((item) => item.id === mode) ?? modes[0];
  const panelTransition = {
    duration: reduceMotion ? 0 : 0.18,
    ease: [0.22, 1, 0.36, 1] as const,
  };

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <LayoutGroup id="a600-architectural-instrument">
          <main className={styles.page} aria-labelledby="studio-title">
            <header className={styles.instrumentHeader}>
              <div className={styles.identity}>
                <p>A600 / ARCHITECTURAL INSTRUMENT</p>
                <h1 id="studio-title">One source. Three working views.</h1>
              </div>
              <dl className={styles.headerFacts}>
                <div><dt>Envelope</dt><dd>20 × 30 ft</dd></div>
                <div><dt>Gross area</dt><dd>600 sq ft</dd></div>
                <div><dt>Profile</dt><dd>v{executableProfile.profile_version}</dd></div>
              </dl>
              <div className={styles.sourceStatus}>
                <span aria-hidden="true" />
                <div><strong>Source locked</strong><small>Concept-only geometry</small></div>
              </div>
            </header>

            <div className={styles.instrumentBody}>
              <section className={styles.viewportColumn} aria-label="A600 working viewport">
                <div className={styles.modeBar}>
                  <div className={styles.modeTabs} role="tablist" aria-label="Working view">
                    {modes.map((item) => {
                      const selected = item.id === mode;
                      return (
                        <button
                          key={item.id}
                          id={`studio-mode-${item.id}`}
                          type="button"
                          role="tab"
                          aria-selected={selected}
                          aria-controls="studio-mode-panel"
                          className={selected ? styles.modeTabActive : styles.modeTab}
                          onClick={() => setMode(item.id)}
                        >
                          <span>{item.label}</span>
                          <small>{item.meta}</small>
                          {selected ? (
                            <m.span
                              className={styles.modeIndicator}
                              layoutId="studio-mode-indicator"
                              transition={panelTransition}
                              aria-hidden="true"
                            />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                  <p><span>{activeMode.label}</span> / A600 / {executableProfile.adoption_state.replace("_", " ")}</p>
                </div>

                <div className={styles.modeViewport}>
                  <AnimatePresence initial={false} mode="wait">
                    <m.div
                      key={mode}
                      id="studio-mode-panel"
                      role="tabpanel"
                      aria-labelledby={`studio-mode-${mode}`}
                      className={styles.modePanel}
                      initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -3 }}
                      transition={panelTransition}
                    >
                      {mode === "exterior" ? (
                        <div className={styles.exteriorMode}>
                          <HardieMotionStage
                            modelId={A600_ARCHETYPE}
                            modelLabel="A600 one-bedroom ADU"
                            exterior={selections.exterior}
                            palette={selections.palette}
                          />
                          <button type="button" className={styles.planProbe} onClick={() => setMode("plan")}>
                            <ArchitecturalPlanViewport variant="rail" />
                            <span className={styles.planProbeCopy}>
                              <small>Exact source link</small>
                              <strong>Open dimensioned plan</strong>
                              <span>7 zones · 12 openings · true top view</span>
                            </span>
                            <span className={styles.planProbeArrow} aria-hidden="true">↗</span>
                          </button>
                        </div>
                      ) : null}

                      {mode === "plan" ? (
                        <div className={styles.planMode}>
                          <ArchitecturalPlanViewport variant="primary" />
                          <div className={styles.planReadout}>
                            <p>OWNER-ADOPTED PROFILE</p>
                            <h2>Exact A600 geometry, shown as a source crop.</h2>
                            <dl>
                              <div><dt>Zones</dt><dd>{executableProfile.plan_regions.length}</dd></div>
                              <div><dt>Openings</dt><dd>{executableProfile.openings.length}</dd></div>
                              <div><dt>Roof</dt><dd>Gable · 4:12</dd></div>
                              <div><dt>Coordinate unit</dt><dd>1/16 in</dd></div>
                            </dl>
                            <p className={styles.truthNote}>The source SVG is displayed byte-for-byte; the executable profile records the later owner adoption. Wall assemblies, code, permit and site conclusions remain outside this view.</p>
                          </div>
                        </div>
                      ) : null}

                      {mode === "site" ? (
                        <div className={styles.siteGate}>
                          <div className={styles.siteGateSignal} aria-hidden="true"><span>!</span></div>
                          <p>SITE-GATE / FAIL-CLOSED</p>
                          <h2>No parcel is loaded.</h2>
                          <p className={styles.siteGateLead}>The A600 footprint is not placed, rotated or represented against a property. No buildability conclusion is made.</p>
                          <dl>
                            <div><dt>Parcel geometry</dt><dd>Required</dd></div>
                            <div><dt>Setbacks + easements</dt><dd>Required</dd></div>
                            <div><dt>Utilities + access</dt><dd>Required</dd></div>
                            <div><dt>Jurisdiction review</dt><dd>Required</dd></div>
                          </dl>
                          <small>No address or contact information is collected in Studio.</small>
                        </div>
                      ) : null}
                    </m.div>
                  </AnimatePresence>
                </div>
              </section>

              <aside className={styles.controls} aria-labelledby="controls-title">
                <div className={styles.controlsHeader}>
                  <p>MODEL / A600</p>
                  <h2 id="controls-title">Exterior study</h2>
                  <span>Two facade diagrams × two color studies. Render source remains unchanged.</span>
                </div>

                {optionKeys.map((key) => (
                  <fieldset className={styles.controlGroup} key={key}>
                    <legend>{key === "exterior" ? "Facade diagram" : "Color study"}</legend>
                    <div className={styles.segmentedControl}>
                      {Object.keys(optionLabels[key]).map((value) => {
                        const selected = selections[key] === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            className={selected ? styles.segmentActive : styles.segment}
                            aria-pressed={selected}
                            onClick={() => selectOption(key, value)}
                          >
                            <small>{optionCodes[key][value]}</small>
                            <span>{optionLabels[key][value]}</span>
                            {selected ? <m.i layoutId={`active-${key}`} transition={panelTransition} aria-hidden="true" /> : null}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                ))}

                <section className={styles.profilePanel} aria-labelledby="profile-title">
                  <div className={styles.profileHeading}>
                    <div><p>GEOMETRY PROFILE</p><h3 id="profile-title">A600 / 1.0.0</h3></div>
                    <span>OWNER ADOPTED</span>
                  </div>
                  <dl>
                    <div><dt>Footprint</dt><dd>20 × 30 ft</dd></div>
                    <div><dt>Area</dt><dd>600 sq ft</dd></div>
                    <div><dt>Roof form</dt><dd>Gable</dd></div>
                    <div><dt>Truth state</dt><dd>Concept only</dd></div>
                  </dl>
                </section>

                <div className={styles.configId}>
                  <span>CONFIGURATION ID</span>
                  <code>{hashLabel}</code>
                  <button type="button" onClick={() => void copyConfigurationId()} disabled={!candidate}>Copy ID</button>
                </div>
              </aside>
            </div>

            <section className={styles.compareRail} aria-labelledby="compare-title">
              <div>
                <p>IN-MEMORY SET</p>
                <h2 id="compare-title">Compare A600 exterior studies</h2>
              </div>
              <button type="button" className={styles.addCurrent} onClick={addCurrentConcept}>+ Add current</button>
              <button
                type="button"
                className={styles.compareButton}
                aria-expanded={comparisonOpen}
                aria-controls="studio-comparison-panel"
                onClick={() => setComparisonOpen((open) => !open)}
              >
                {comparisonOpen ? "Close set" : `Open set · ${comparisonInputs.length}`}
              </button>
            </section>

            <AnimatePresence initial={false}>
              {comparisonOpen ? (
                <m.section
                  id="studio-comparison-panel"
                  className={styles.comparisonPanel}
                  aria-labelledby="comparison-heading"
                  initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={reduceMotion ? { opacity: 1, height: 0 } : { opacity: 0, height: 0 }}
                  transition={panelTransition}
                >
                  <div className={styles.comparisonInner}>
                    <header>
                      <p>A600 ONLY / NO LEAD CREATED</p>
                      <h2 id="comparison-heading">Restore any source-backed exterior state.</h2>
                    </header>
                    <div className={styles.comparisonGrid}>
                      {comparisonInputs.map((item, index) => {
                        const image = resolveA600ConceptAsset(
                          item.archetype,
                          item.selections.exterior,
                          item.selections.palette,
                        );
                        return (
                          <article key={`${conceptName(item)}-${index}`}>
                            <div className={styles.comparisonImage}>
                              {image ? <Image src={image} alt="" fill unoptimized sizes="18rem" /> : null}
                            </div>
                            <p>STUDY {String.fromCharCode(65 + index)}</p>
                            <h3>{conceptName(item)}</h3>
                            <button type="button" onClick={() => restoreConcept(item)}>Restore study</button>
                          </article>
                        );
                      })}
                    </div>
                    <p className={styles.comparisonDisclaimer}>Conceptual only. No property, zoning, permit, buildability, price or schedule conclusion is made.</p>
                  </div>
                </m.section>
              ) : null}
            </AnimatePresence>

            <p className={styles.status} role="status" aria-live="polite">{status}</p>
          </main>
        </LayoutGroup>
      </MotionConfig>
    </LazyMotion>
  );
}
