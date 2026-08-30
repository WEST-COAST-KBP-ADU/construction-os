import {
  A600_EXECUTABLE_PROFILE,
  validateA600ExecutableProfile,
} from "@/src/lib/studio/executableProfiles";
import type {
  ExecutableGeometryOpening,
  ExecutableGeometryProfile,
  ExecutableGeometryWallRun,
} from "@/src/lib/studio/executableGeometryTypes";

import styles from "./A600TruthSheet.module.css";

/**
 * The only model route that carries this sheet. The A600 executable profile is
 * the single Owner-adopted record; no other model may borrow its facts.
 */
export const A600_TRUTH_SHEET_MODEL_ID = "adu-a-600" as const;

/** Authored lengths are exact sixteenths of an inch (`q16_in`). */
const Q16_PER_INCH = 16;
const INCHES_PER_FOOT = 12;
const Q16_PER_FOOT = Q16_PER_INCH * INCHES_PER_FOOT;

/**
 * Ring areas are authored as `area2_q16sq`: twice the shoelace area in squared
 * sixteenth-inch units. One square foot is therefore `2 * 192 * 192` of them.
 */
const AREA2_Q16SQ_PER_SQ_FT = 2 * Q16_PER_FOOT * Q16_PER_FOOT;

export type A600TruthSheetFact = {
  readonly label: string;
  readonly value: string;
  readonly pointer: string;
};

export type A600TruthSheetOpeningRow = {
  readonly openingId: string;
  readonly kind: string;
  readonly face: string;
  readonly nominal: string;
  readonly sill: string;
  readonly head: string;
  readonly operation: string;
};

export type A600TruthSheetUnresolved = {
  readonly title: string;
  readonly detail: string;
  readonly basis: string;
};

export type A600TruthSheetProvenanceEntry = {
  readonly label: string;
  readonly value: string;
};

export type A600TruthSheetModel = {
  readonly identity: readonly A600TruthSheetFact[];
  readonly geometry: readonly A600TruthSheetFact[];
  readonly openings: {
    readonly total: number;
    readonly doors: number;
    readonly windows: number;
    readonly rows: readonly A600TruthSheetOpeningRow[];
  };
  readonly unresolved: readonly A600TruthSheetUnresolved[];
  readonly provenance: readonly A600TruthSheetProvenanceEntry[];
  readonly configurationLabels: readonly A600TruthSheetProvenanceEntry[];
  readonly evidenceRefs: readonly string[];
  readonly attestation: string;
};

export type A600TruthSheetResult =
  | { readonly ok: true; readonly sheet: A600TruthSheetModel }
  | { readonly ok: false; readonly code: string; readonly pointer: string };

function refuse(code: string, pointer: string): A600TruthSheetResult {
  return { ok: false, code, pointer };
}

function greatestCommonDivisor(a: number, b: number): number {
  return b === 0 ? a : greatestCommonDivisor(b, a % b);
}

function formatSixteenths(sixteenths: number): string {
  if (sixteenths === 0) return "";

  const divisor = greatestCommonDivisor(sixteenths, Q16_PER_INCH);

  return ` ${sixteenths / divisor}/${Q16_PER_INCH / divisor}`;
}

/** Exact q16 → inches. No rounding is applied to the authored quantum. */
export function formatInches(q16: number): string {
  const sixteenths = q16 % Q16_PER_INCH;
  const inches = (q16 - sixteenths) / Q16_PER_INCH;

  return `${inches}${formatSixteenths(sixteenths)} in`;
}

/** Exact q16 → feet and inches. */
export function formatFeetInches(q16: number): string {
  const sixteenths = q16 % Q16_PER_INCH;
  const totalInches = (q16 - sixteenths) / Q16_PER_INCH;
  const feet = Math.floor(totalInches / INCHES_PER_FOOT);
  const inches = totalInches - feet * INCHES_PER_FOOT;

  return `${feet} ft ${inches}${formatSixteenths(sixteenths)} in`;
}

/** Exact q16 → whole feet, or `null` when the value is not a whole foot. */
export function q16ToWholeFeet(q16: number): number | null {
  return q16 % Q16_PER_FOOT === 0 ? q16 / Q16_PER_FOOT : null;
}

/** Exact `area2_q16sq` → square feet, or `null` when it is not a whole foot area. */
export function area2Q16sqToWholeSqFt(area2: number): number | null {
  return area2 % AREA2_Q16SQ_PER_SQ_FT === 0
    ? area2 / AREA2_Q16SQ_PER_SQ_FT
    : null;
}

function humanize(token: string): string {
  return token.replaceAll("_", " ");
}

type Bounds = {
  readonly minX: number;
  readonly maxX: number;
  readonly minY: number;
  readonly maxY: number;
};

function planBounds(profile: ExecutableGeometryProfile): Bounds {
  const xs = profile.plan_vertices.map((vertex) => vertex.x_q16);
  const ys = profile.plan_vertices.map((vertex) => vertex.y_q16);

  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

/**
 * Names the elevation a wall sits on from its authored endpoints alone, so the
 * label follows the geometry rather than an identifier spelling.
 */
function wallFace(
  profile: ExecutableGeometryProfile,
  wall: ExecutableGeometryWallRun,
  bounds: Bounds,
): string | null {
  const start = profile.plan_vertices.find(
    (vertex) => vertex.vertex_id === wall.start_vertex_id,
  );
  const end = profile.plan_vertices.find(
    (vertex) => vertex.vertex_id === wall.end_vertex_id,
  );

  if (start === undefined || end === undefined) return null;
  if (start.y_q16 === bounds.minY && end.y_q16 === bounds.minY) return "front";
  if (start.y_q16 === bounds.maxY && end.y_q16 === bounds.maxY) return "rear";
  if (start.x_q16 === bounds.minX && end.x_q16 === bounds.minX) return "left";
  if (start.x_q16 === bounds.maxX && end.x_q16 === bounds.maxX) return "right";

  return null;
}

function describePitch(rise: number, run: number): string {
  const perTwelve = (rise * INCHES_PER_FOOT) % run === 0
    ? ` (${(rise * INCHES_PER_FOOT) / run} in 12)`
    : "";

  return `${rise} : ${run}${perTwelve}`;
}

function countBy<T>(items: readonly T[], predicate: (item: T) => boolean): number {
  return items.filter(predicate).length;
}

function buildUnresolved(
  profile: ExecutableGeometryProfile,
): readonly A600TruthSheetUnresolved[] {
  const wallsWithoutThickness = countBy(
    profile.wall_runs,
    (wall) => wall.thickness_q16 === null,
  );
  const unresolvedAssemblies = profile.assembly_slots.filter(
    (slot) => slot.truth_state === "unresolved_semantic",
  );
  const genericMaterials = profile.material_slots.filter(
    (slot) => slot.truth_state === "concept_generic",
  );
  const openOpenings = countBy(
    profile.openings,
    (opening) => opening.net_clear.state !== "verified",
  );
  const openGates = profile.professional_gates.filter(
    (gate) => gate.status === "not_evaluated",
  );

  return [
    {
      title: "Wall thickness",
      detail:
        "Every wall run is authored as a centreline with no thickness, so no wall face, cavity, or overall building dimension including construction is fixed.",
      basis: `thickness_q16 is null on ${wallsWithoutThickness} of ${profile.wall_runs.length} wall runs`,
    },
    {
      title: "Assemblies",
      detail:
        "Exterior field, exterior trim, roof field, glazing, entry, interior floor, interior wall, and casework assemblies carry a slot only. No layer, build-up, thickness, fastening, or performance value exists.",
      basis: `${unresolvedAssemblies.length} of ${profile.assembly_slots.length} assembly slots are unresolved_semantic`,
    },
    {
      title: "Material identity and rights",
      detail:
        "No manufacturer, product line, colour, finish, warranty, or licensing fact is recorded against any surface. The record holds generic concept slots only.",
      basis: `${genericMaterials.length} of ${profile.material_slots.length} material slots are concept_generic`,
    },
    {
      title: "Trim, roof edge, and drainage",
      detail:
        "The record fixes eave, rake, and ridge lines and an overhang, and nothing else at the edge. There is no fascia, soffit, flashing, gutter, downspout, or point of discharge design.",
      basis: "roof edges carry a drainage_role only; exterior_trim and roof_field assemblies are unresolved_semantic",
    },
    {
      title: "Foundation and grade",
      detail:
        "The floor plate has a bottom datum and no top. No foundation type, slab, stem wall, pier, footing depth, or relationship to finished grade is recorded.",
      basis: "floor_plates[0].top_z_q16 is null; the structural_foundation gate is not_evaluated",
    },
    {
      title: "Entry landing and step",
      detail:
        "The exterior door is a cut in a wall. No landing, step, stair, ramp, threshold, guard, or approach exists in the record.",
      basis: "no landing or stair entity exists in the profile; the universal_accessibility gate is not_evaluated",
    },
    {
      title: "Mechanical, electrical, and plumbing",
      detail:
        "No equipment, penetration, vent, flue, panel, meter, fixture, or service entry is recorded, so no exterior consequence of MEP work is shown.",
      basis: "the mep gate is not_evaluated and the profile carries no MEP entity",
    },
    {
      title: "Site, parcel, and jurisdiction",
      detail:
        "No parcel, setback, orientation to a street, easement, utility connection, or jurisdiction is attached to this geometry. Requires official source verification.",
      basis: "the site_jurisdiction gate is not_evaluated and the profile carries no site entity",
    },
    {
      title: "Landscaping and hardscape",
      detail:
        "No paving, driveway, walkway, planting, fence, wall, or exterior lighting is part of this record.",
      basis: "the profile carries no landscape or hardscape entity",
    },
    {
      title: "Net and usable area",
      detail:
        "Only the gross envelope area is fixed. Usable interior area cannot be stated while wall thickness and junction geometry are unresolved.",
      basis: "area_accounting.net_area2_q16sq and wall_junction_reserved_area2_q16sq are both null",
    },
    {
      title: "Clear opening dimensions and egress",
      detail:
        "Openings are authored as rough cuts. No net clear width, net clear height, or egress conclusion is established for any of them.",
      basis: `${openOpenings} of ${profile.openings.length} openings have no verified net_clear; the egress_openings gate is not_evaluated`,
    },
    {
      title: "Professional review",
      detail: `No professional gate on this record has been evaluated: ${openGates
        .map((gate) => humanize(gate.gate_id))
        .join(", ")}.`,
      basis: `${openGates.length} of ${profile.professional_gates.length} professional gates are not_evaluated`,
    },
  ];
}

/**
 * Projects the customer-readable A600 sheet from the adopted profile. Validation
 * runs first and every published number is either read straight from the record
 * or converted from its exact q16 value, so an unvalidated or drifted profile
 * yields a refusal instead of a partial sheet.
 */
export async function buildA600TruthSheet(
  candidate: unknown = A600_EXECUTABLE_PROFILE,
): Promise<A600TruthSheetResult> {
  const validation = await validateA600ExecutableProfile(candidate);

  if (!validation.ok) {
    return refuse(validation.code, validation.pointer);
  }

  const profile = validation.profile;
  const binding = profile.model_binding;
  const reference = binding.reference_configuration;
  const bounds = planBounds(profile);

  const widthFt = q16ToWholeFeet(bounds.maxX - bounds.minX);
  const depthFt = q16ToWholeFeet(bounds.maxY - bounds.minY);

  if (
    widthFt === null ||
    depthFt === null ||
    widthFt !== reference.footprint_width_ft ||
    depthFt !== reference.footprint_depth_ft
  ) {
    return refuse("A600_TRUTH_SHEET_FOOTPRINT_MISMATCH", "/plan_vertices");
  }

  const envelope = profile.gross_envelopes.at(0);

  if (
    envelope === undefined ||
    profile.gross_envelopes.length !== 1 ||
    envelope.area2_q16sq !== profile.area_accounting.gross_area2_q16sq
  ) {
    return refuse("A600_TRUTH_SHEET_ENVELOPE_MISMATCH", "/gross_envelopes");
  }

  const areaSqFt = area2Q16sqToWholeSqFt(envelope.area2_q16sq);

  if (areaSqFt === null || areaSqFt !== widthFt * depthFt) {
    return refuse(
      "A600_TRUTH_SHEET_AREA_MISMATCH",
      "/gross_envelopes/0/area2_q16sq",
    );
  }

  const level = profile.levels.at(0);

  if (level === undefined || profile.levels.length !== 1) {
    return refuse("A600_TRUTH_SHEET_LEVEL_COUNT_UNEXPECTED", "/levels");
  }

  const plateHeightQ16 = level.ceiling_z_q16 - level.floor_z_q16;
  const ridgeZQ16 = Math.max(
    ...profile.roof_vertices.map((vertex) => vertex.z_q16),
  );
  const eaveEdges = profile.roof_edges.filter((edge) => edge.role === "eave");
  const eaveHeights = new Set(
    eaveEdges.map((edge) => edge.eave_z_q16).filter((z): z is number => z !== null),
  );

  if (eaveHeights.size !== 1) {
    return refuse("A600_TRUTH_SHEET_EAVE_AMBIGUOUS", "/roof_edges");
  }

  const eaveZQ16 = [...eaveHeights][0];
  const roofForms = new Set(profile.roof_planes.map((plane) => plane.form));
  const pitches = new Set(
    profile.roof_planes.map((plane) => `${plane.pitch.rise}:${plane.pitch.run}`),
  );

  if (roofForms.size !== 1 || pitches.size !== 1) {
    return refuse("A600_TRUTH_SHEET_ROOF_AMBIGUOUS", "/roof_planes");
  }

  const roofForm = [...roofForms][0];
  const pitch = profile.roof_planes[0].pitch;

  if (roofForm !== reference.roof_form) {
    return refuse("A600_TRUTH_SHEET_ROOF_FORM_MISMATCH", "/roof_planes/0/form");
  }

  // The declared pitch must equal the pitch the ridge and eave geometry implies.
  const halfSpanQ16 = (bounds.maxX - bounds.minX) / 2;
  const geometricRiseQ16 = ridgeZQ16 - eaveZQ16;

  if (geometricRiseQ16 * pitch.run !== halfSpanQ16 * pitch.rise) {
    return refuse("A600_TRUTH_SHEET_PITCH_MISMATCH", "/roof_planes/0/pitch");
  }

  const overhangs = new Set(
    profile.roof_edges
      .filter((edge) => edge.role !== "ridge")
      .map((edge) => edge.overhang_q16),
  );

  if (overhangs.size !== 1) {
    return refuse("A600_TRUTH_SHEET_OVERHANG_AMBIGUOUS", "/roof_edges");
  }

  const exteriorWallIds = new Set(
    profile.wall_runs
      .filter((wall) => wall.kind === "exterior")
      .map((wall) => wall.wall_id),
  );
  const exteriorOpenings = [...profile.openings]
    .filter((opening) => exteriorWallIds.has(opening.host_wall_id))
    .sort((left, right) => left.authored_order - right.authored_order);

  const rows: A600TruthSheetOpeningRow[] = [];

  for (const opening of exteriorOpenings) {
    const host = profile.wall_runs.find(
      (wall) => wall.wall_id === opening.host_wall_id,
    );

    if (host === undefined) {
      return refuse("A600_TRUTH_SHEET_OPENING_HOST_MISSING", "/openings");
    }

    const face = wallFace(profile, host, bounds);

    if (face === null) {
      return refuse("A600_TRUTH_SHEET_OPENING_FACE_UNRESOLVED", "/openings");
    }

    rows.push({
      openingId: opening.opening_id,
      kind: humanize(opening.kind),
      face,
      nominal: `${formatInches(opening.nominal_width_q16)} × ${formatInches(opening.nominal_height_q16)}`,
      sill: formatInches(opening.sill_q16),
      head: formatInches(opening.head_q16),
      operation: humanize(opening.operation),
    });
  }

  const isDoor = (opening: ExecutableGeometryOpening) => opening.kind === "door";
  const isWindow = (opening: ExecutableGeometryOpening) => opening.kind === "window";

  const configurationLabelKeys = [
    "layout_variant",
    "window_package",
    "exterior_finish",
    "exterior_palette",
    "interior_tier",
  ] as const;

  return {
    ok: true,
    sheet: {
      identity: [
        {
          label: "Model",
          value: `${binding.model_id} · version ${binding.model_version}`,
          pointer: "/model_binding",
        },
        {
          label: "Profile",
          value: `${profile.profile_id} · version ${profile.profile_version}`,
          pointer: "/profile_id",
        },
        {
          label: "Adoption state",
          value: humanize(profile.adoption_state),
          pointer: "/adoption_state",
        },
        {
          label: "Maturity",
          value: humanize(profile.maturity),
          pointer: "/maturity",
        },
        {
          label: "Release",
          value: binding.release_version,
          pointer: "/model_binding/release_version",
        },
        {
          label: "Authored units",
          value: `length ${profile.units.length}, area ${profile.units.area}, quantum ${profile.precision.length_quantum_q16}/16 in`,
          pointer: "/units",
        },
      ],
      geometry: [
        {
          label: "Reference footprint",
          value: `${widthFt} × ${depthFt} ft`,
          pointer: "/plan_vertices",
        },
        {
          label: "Reference floor area",
          value: `${areaSqFt} sq ft gross envelope`,
          pointer: "/gross_envelopes/0/area2_q16sq",
        },
        {
          label: "Levels",
          value: `${profile.levels.length} level (${level.level_id})`,
          pointer: "/levels",
        },
        {
          label: "Plate height",
          value: `${formatFeetInches(plateHeightQ16)} floor to ceiling datum`,
          pointer: "/levels/0",
        },
        {
          label: "Roof form",
          value: `${humanize(roofForm)}, ${profile.roof_planes.length} planes`,
          pointer: "/roof_planes",
        },
        {
          label: "Roof pitch",
          value: describePitch(pitch.rise, pitch.run),
          pointer: "/roof_planes/0/pitch",
        },
        {
          label: "Eave height",
          value: `${formatFeetInches(eaveZQ16)} above the floor datum`,
          pointer: "/roof_edges",
        },
        {
          label: "Ridge height",
          value: `${formatFeetInches(ridgeZQ16)} above the floor datum`,
          pointer: "/roof_vertices",
        },
        {
          label: "Ridge above eave",
          value: formatFeetInches(geometricRiseQ16),
          pointer: "/roof_vertices",
        },
        {
          label: "Roof overhang",
          value: `${formatInches([...overhangs][0])} at eaves and rakes`,
          pointer: "/roof_edges",
        },
        {
          label: "Exterior wall runs",
          value: `${exteriorWallIds.size} exterior runs, ${countBy(profile.wall_runs, (wall) => wall.kind === "partition")} partitions`,
          pointer: "/wall_runs",
        },
        {
          label: "Coordinate origin",
          value: humanize(profile.coordinate_frame.origin),
          pointer: "/coordinate_frame",
        },
        {
          label: "Entry side",
          value: `${reference.entry_side}, orientation ${reference.orientation_deg}°`,
          pointer: "/model_binding/reference_configuration",
        },
      ],
      openings: {
        total: exteriorOpenings.length,
        doors: countBy(exteriorOpenings, isDoor),
        windows: countBy(exteriorOpenings, isWindow),
        rows,
      },
      unresolved: buildUnresolved(profile),
      provenance: [
        { label: "Origin", value: humanize(profile.provenance.origin) },
        { label: "Author", value: profile.provenance.author },
        { label: "Creation record", value: profile.provenance.creation_record },
        { label: "Profile digest", value: profile.profile_digest },
        { label: "Release digest", value: binding.release_digest },
        { label: "Geometry source", value: binding.geometry_source_ref },
        { label: "Geometry source digest", value: binding.geometry_source_digest },
        {
          label: "Reference configuration digest",
          value: binding.reference_configuration_digest,
        },
        {
          label: "Municipal source used",
          value: String(profile.provenance.municipal_source_used),
        },
        {
          label: "Third party geometry used",
          value: String(profile.provenance.third_party_geometry_used),
        },
        {
          label: "Copied plan geometry used",
          value: String(profile.provenance.copied_plan_geometry_used),
        },
      ],
      configurationLabels: configurationLabelKeys.map((key) => ({
        label: humanize(key),
        value: String(reference[key]),
      })),
      evidenceRefs: profile.provenance.design_input_evidence_refs,
      attestation: profile.provenance.attestation,
    },
  };
}

function FactList({
  facts,
  headingId,
}: {
  facts: readonly A600TruthSheetFact[];
  headingId: string;
}) {
  return (
    <dl className={styles.facts} aria-labelledby={headingId}>
      {facts.map((fact) => (
        <div key={fact.label} className={styles.fact}>
          <dt>{fact.label}</dt>
          <dd>
            <span className={styles.factValue}>{fact.value}</span>
            <code className={styles.pointer}>{fact.pointer}</code>
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function A600TruthSheetView({ sheet }: { sheet: A600TruthSheetModel }) {
  return (
    <section
      className={styles.sheet}
      aria-labelledby="a600-truth-sheet-title"
      data-testid="a600-truth-sheet"
    >
      <div className={`portal-container ${styles.inner}`}>
        <header className={styles.header}>
          <p className="spine-kicker">A600 record</p>
          <h2 id="a600-truth-sheet-title">What the A600 record actually fixes</h2>
          <p className={styles.lede}>
            This sheet is read at render time from the Owner-adopted A600 executable
            geometry profile. Every value below is either recorded in that profile or
            converted from its exact sixteenth-inch values. There is no photograph,
            render, or stand-in image here, because no verified image of a built A600
            exists yet.
          </p>
          <p className={styles.boundary}>
            This is an Owner-adopted concept geometry record. It is not a permit set, a
            construction document, a property fit, a material specification, a price, a
            schedule, an availability statement, or a buildability conclusion.
          </p>
        </header>

        <div className={styles.block}>
          <h3 id="a600-identity-title" className={styles.blockTitle}>
            Record identity
          </h3>
          <FactList facts={sheet.identity} headingId="a600-identity-title" />
        </div>

        <div className={styles.block}>
          <h3 id="a600-geometry-title" className={styles.blockTitle}>
            Fixed geometry
          </h3>
          <FactList facts={sheet.geometry} headingId="a600-geometry-title" />
        </div>

        <div className={styles.block}>
          <h3 id="a600-openings-title" className={styles.blockTitle}>
            Exterior openings recorded in the profile
          </h3>
          <p className={styles.blockNote}>
            {sheet.openings.total} exterior openings are recorded: {sheet.openings.doors}{" "}
            door and {sheet.openings.windows} windows. Sizes are the authored rough cut in
            the wall. Frames, glazing products, and clear opening sizes are not recorded.
          </p>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <caption className={styles.tableCaption}>
                Exterior opening schedule, in authored order
              </caption>
              <thead>
                <tr>
                  <th scope="col">Opening</th>
                  <th scope="col">Kind</th>
                  <th scope="col">Face</th>
                  <th scope="col">Nominal width × height</th>
                  <th scope="col">Sill</th>
                  <th scope="col">Head</th>
                  <th scope="col">Operation</th>
                </tr>
              </thead>
              <tbody>
                {sheet.openings.rows.map((row) => (
                  <tr key={row.openingId}>
                    <th scope="row">
                      <code>{row.openingId}</code>
                    </th>
                    <td>{row.kind}</td>
                    <td>{row.face}</td>
                    <td>{row.nominal}</td>
                    <td>{row.sill}</td>
                    <td>{row.head}</td>
                    <td>{row.operation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`${styles.block} ${styles.unresolvedBlock}`}>
          <h3 id="a600-unresolved-title" className={styles.blockTitle}>
            Not resolved by this record
          </h3>
          <p className={styles.blockNote}>
            The A600 stays at <code>concept_only</code> maturity because of the list
            below. These are open questions in the record itself, not omissions from this
            page. No jurisdiction, zoning, or site conclusion is published here.
          </p>
          <ul className={styles.unresolvedList} aria-labelledby="a600-unresolved-title">
            {sheet.unresolved.map((item) => (
              <li key={item.title} className={styles.unresolvedItem}>
                <h4 className={styles.unresolvedTitle}>{item.title}</h4>
                <p className={styles.unresolvedDetail}>{item.detail}</p>
                <p className={styles.unresolvedBasis}>{item.basis}</p>
              </li>
            ))}
          </ul>
        </div>

        <details className={styles.provenance}>
          <summary className={styles.provenanceSummary}>
            Source, profile, and release binding
          </summary>
          <div className={styles.provenanceBody}>
            <p className={styles.blockNote}>{sheet.attestation}</p>
            <dl className={styles.provenanceList}>
              {sheet.provenance.map((entry) => (
                <div key={entry.label} className={styles.provenanceEntry}>
                  <dt>{entry.label}</dt>
                  <dd>
                    <code>{entry.value}</code>
                  </dd>
                </div>
              ))}
            </dl>
            <h4 className={styles.provenanceHeading}>Design input evidence</h4>
            <ul className={styles.provenanceRefs}>
              {sheet.evidenceRefs.map((ref) => (
                <li key={ref}>
                  <code>{ref}</code>
                </li>
              ))}
            </ul>
            <h4 className={styles.provenanceHeading}>Configuration labels in the binding</h4>
            <p className={styles.blockNote}>
              These are the labels the binding records for the reference configuration.
              They are not material, product, manufacturer, or specification facts, and
              every material slot on this record remains generic.
            </p>
            <dl className={styles.provenanceList}>
              {sheet.configurationLabels.map((entry) => (
                <div key={entry.label} className={styles.provenanceEntry}>
                  <dt>{entry.label}</dt>
                  <dd>
                    <code>{entry.value}</code>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </details>
      </div>
    </section>
  );
}

export function A600TruthSheetUnavailable({
  code,
  pointer,
}: {
  code: string;
  pointer: string;
}) {
  return (
    <section
      className={`${styles.sheet} ${styles.unavailable}`}
      aria-labelledby="a600-truth-sheet-unavailable-title"
      data-testid="a600-truth-sheet-unavailable"
    >
      <div className={`portal-container ${styles.inner}`}>
        <p className="spine-kicker">A600 record</p>
        <h2 id="a600-truth-sheet-unavailable-title">
          The A600 record is not being published right now
        </h2>
        <p className={styles.lede}>
          The Owner-adopted A600 executable geometry profile did not validate at render
          time, so no A600 fact is shown. Nothing is substituted from another model, and
          no value is estimated.
        </p>
        <p className={styles.boundary}>
          Refusal <code>{code}</code> at <code>{pointer}</code>.
        </p>
      </div>
    </section>
  );
}

export default async function A600TruthSheet() {
  const result = await buildA600TruthSheet();

  if (!result.ok) {
    return <A600TruthSheetUnavailable code={result.code} pointer={result.pointer} />;
  }

  return <A600TruthSheetView sheet={result.sheet} />;
}
