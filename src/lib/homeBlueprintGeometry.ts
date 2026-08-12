/**
 * Deterministic drawing derivation for the home "Project" blueprint motion.
 *
 * Every line that represents building geometry in this module is generated from
 * the Owner-adopted A600 executable geometry profile that already exists on
 * `main`. Nothing here freehands a building, and nothing here introduces a
 * numeric building coordinate that is not traceable to a profile record.
 *
 * Three classes of mark are produced, and the distinction is load-bearing:
 *
 * - `building`   every coordinate is a profile value moved by a declared sheet
 *                origin. `sourcePoints` carries the untranslated profile-space
 *                points so a test can re-derive the path independently.
 * - `annotation` dimension strings and labels. Their measured values are
 *                profile values; their perpendicular sheet offsets are drafting
 *                composition, declared in `HOME_BLUEPRINT_SHEET_LAYOUT`.
 * - `registration` sheet frame and sequence marks. These carry no building
 *                claim and must never read as permit approval, surveyed
 *                property truth, or construction-document certification.
 *
 * The profile is `concept_only` with every professional gate `not_evaluated`.
 * That state is surfaced verbatim rather than smoothed over.
 */

import { A600_EXECUTABLE_PROFILE, validateA600ExecutableProfile } from "./studio/executableProfiles";
import type {
  ExecutableGeometryOpening,
  ExecutableGeometryPlanVertex,
  ExecutableGeometryProfile,
  ExecutableGeometryRefusalCode,
  ExecutableGeometryWallRun,
} from "./studio/executableGeometryTypes";

/* ------------------------------------------------------------------ units */

/** Authored length quantum: one sixteenth of an inch. */
export const Q16_PER_INCH = 16;
export const INCHES_PER_FOOT = 12;
export const Q16_PER_FOOT = Q16_PER_INCH * INCHES_PER_FOOT;

/**
 * Authored areas are stored doubled (shoelace sum without the halving step),
 * so one square foot is `2 * 16 * 16 * 144` authored area units.
 */
export const AREA2_Q16SQ_PER_SQUARE_FOOT = 2 * Q16_PER_INCH * Q16_PER_INCH * INCHES_PER_FOOT * INCHES_PER_FOOT;

function greatestCommonDivisor(a: number, b: number): number {
  return b === 0 ? a : greatestCommonDivisor(b, a % b);
}

/** Formats an authored q16 length as a drafting dimension string, e.g. `12'-4"`. */
export function formatFeetInches(lengthQ16: number): string {
  const sign = lengthQ16 < 0 ? "-" : "";
  const magnitude = Math.abs(lengthQ16);
  const wholeInches = Math.floor(magnitude / Q16_PER_INCH);
  const sixteenths = magnitude % Q16_PER_INCH;
  const feet = Math.floor(wholeInches / INCHES_PER_FOOT);
  const inches = wholeInches % INCHES_PER_FOOT;

  if (sixteenths === 0) {
    return `${sign}${feet}'-${inches}"`;
  }

  const divisor = greatestCommonDivisor(sixteenths, Q16_PER_INCH);
  return `${sign}${feet}'-${inches} ${sixteenths / divisor}/${Q16_PER_INCH / divisor}"`;
}

/** Converts an authored doubled area to whole-number square feet where exact. */
export function area2ToSquareFeet(area2Q16Sq: number): number {
  return area2Q16Sq / AREA2_Q16SQ_PER_SQUARE_FOOT;
}

/* ----------------------------------------------------------------- phases */

/**
 * The canonical label order. `lead`, `project` and `record` are the integration
 * rail this module must stay compatible with; `plan`, `build` and `record` are
 * the three internal motion states of the Project chapter this packet owns.
 * The union of both, in drafting order, is exactly these five.
 */
export const HOME_BLUEPRINT_PHASE_ORDER = ["lead", "project", "plan", "build", "record"] as const;

export type HomeBlueprintPhase = (typeof HOME_BLUEPRINT_PHASE_ORDER)[number];

/** External integration rail. The Project chapter is the middle station. */
export const HOME_BLUEPRINT_RAIL_PHASES = ["lead", "project", "record"] as const;

/** Internal motion states of the Project chapter: plan, build, record handoff. */
export const HOME_BLUEPRINT_PROJECT_MOTION_STATES = ["plan", "build", "record"] as const;

export type HomeBlueprintPhaseDescriptor = {
  id: HomeBlueprintPhase;
  index: number;
  label: string;
  /** Short readable line. Carries no price, schedule, permit or guarantee claim. */
  caption: string;
  /** The drafting beat this phase performs. */
  beat: "stroke reveal" | "layer registration" | "dimension annotation" | "sheet alignment" | "record seal";
  /** Part of the `Lead / Project / Record` integration rail. */
  rail: boolean;
  /** Part of the Project chapter's internal `Plan -> Build -> record` motion. */
  projectState: boolean;
  /** Auto-progression hold, in milliseconds. */
  holdMs: number;
};

export const HOME_BLUEPRINT_PHASES: readonly HomeBlueprintPhaseDescriptor[] = Object.freeze([
  {
    id: "lead",
    index: 0,
    label: "Lead",
    caption: "A sheet is registered and the drafting datum is set.",
    beat: "stroke reveal",
    rail: true,
    projectState: false,
    holdMs: 2600,
  },
  {
    id: "project",
    index: 1,
    label: "Project",
    caption: "The adopted A600 footprint registers onto the sheet datum.",
    beat: "layer registration",
    rail: true,
    projectState: false,
    holdMs: 3200,
  },
  {
    id: "plan",
    index: 2,
    label: "Plan",
    caption: "Partitions, openings and dimension strings resolve on the plan layer.",
    beat: "dimension annotation",
    rail: false,
    projectState: true,
    holdMs: 4200,
  },
  {
    id: "build",
    index: 3,
    label: "Build",
    caption: "The front elevation aligns to the shared ground datum.",
    beat: "sheet alignment",
    rail: false,
    projectState: true,
    holdMs: 4200,
  },
  {
    id: "record",
    index: 4,
    label: "Record",
    caption: "The profile state that produced these lines is recorded on the sheet.",
    beat: "record seal",
    rail: true,
    projectState: true,
    holdMs: 4800,
  },
] as const satisfies readonly HomeBlueprintPhaseDescriptor[]);

export function homeBlueprintPhaseIndex(phase: HomeBlueprintPhase): number {
  return HOME_BLUEPRINT_PHASE_ORDER.indexOf(phase);
}

export function isHomeBlueprintPhase(value: unknown): value is HomeBlueprintPhase {
  return typeof value === "string" && (HOME_BLUEPRINT_PHASE_ORDER as readonly string[]).includes(value);
}

/* --------------------------------------------------------------- refusals */

export type HomeBlueprintRefusalCode =
  | ExecutableGeometryRefusalCode
  | "HB_PROFILE_NOT_ADOPTED"
  | "HB_PROFILE_SEAL_MISMATCH"
  | "HB_UNITS_UNSUPPORTED"
  | "HB_RECORD_MISSING"
  | "HB_GEOMETRY_DEGENERATE";

/** Thrown by the synchronous derivation. The derivation never falls back. */
export class HomeBlueprintGeometryRefusal extends Error {
  public readonly code: HomeBlueprintRefusalCode;
  public readonly pointer: string;

  public constructor(code: HomeBlueprintRefusalCode, pointer: string) {
    super(`${code} at ${pointer}`);
    this.name = "HomeBlueprintGeometryRefusal";
    this.code = code;
    this.pointer = pointer;
  }
}

/**
 * The synchronously checkable half of the adoption seal. The asynchronous half
 * — full contract validation including the recomputed canonical digest — is
 * `verifyHomeBlueprintProjectGeometry`.
 */
export const HOME_BLUEPRINT_ADOPTION_SEAL = Object.freeze({
  schema: "adu-executable-geometry/1",
  profileId: "adu-a-600-profile-owner-adopted",
  profileVersion: "1.0.0",
  adoptionState: "owner_adopted",
  profileDigest: "sha256:27df292e84fc6e00a2ddc5913c0f6175d94a91a4b0de32bf4dab2c3049eec5b3",
  modelId: "adu-a-600",
  modelVersion: "1.0.0",
});

function assertAdoptionSeal(profile: ExecutableGeometryProfile): void {
  if (profile.schema !== HOME_BLUEPRINT_ADOPTION_SEAL.schema) {
    throw new HomeBlueprintGeometryRefusal("XG_SCHEMA_UNKNOWN", "/schema");
  }
  if (profile.adoption_state !== HOME_BLUEPRINT_ADOPTION_SEAL.adoptionState) {
    throw new HomeBlueprintGeometryRefusal("HB_PROFILE_NOT_ADOPTED", "/adoption_state");
  }
  if (
    profile.profile_id !== HOME_BLUEPRINT_ADOPTION_SEAL.profileId ||
    profile.profile_version !== HOME_BLUEPRINT_ADOPTION_SEAL.profileVersion ||
    profile.profile_digest !== HOME_BLUEPRINT_ADOPTION_SEAL.profileDigest ||
    profile.model_binding.model_id !== HOME_BLUEPRINT_ADOPTION_SEAL.modelId ||
    profile.model_binding.model_version !== HOME_BLUEPRINT_ADOPTION_SEAL.modelVersion
  ) {
    throw new HomeBlueprintGeometryRefusal("HB_PROFILE_SEAL_MISMATCH", "/profile_digest");
  }
  if (profile.units.length !== "q16_in" || profile.units.area !== "q16sq") {
    throw new HomeBlueprintGeometryRefusal("HB_UNITS_UNSUPPORTED", "/units");
  }
  if (profile.precision.length_quantum_q16 !== 1) {
    throw new HomeBlueprintGeometryRefusal("XG_PRECISION_INVALID", "/precision/length_quantum_q16");
  }
  if (profile.coordinate_frame.canonical_orientation !== 0) {
    throw new HomeBlueprintGeometryRefusal("XG_TRANSFORM_FORBIDDEN", "/coordinate_frame");
  }
}

function requireRecord<T>(record: T | undefined, pointer: string): T {
  if (record === undefined) {
    throw new HomeBlueprintGeometryRefusal("HB_RECORD_MISSING", pointer);
  }
  return record;
}

/* ----------------------------------------------------------- sheet layout */

/**
 * Sheet composition, in authored q16 units so building geometry needs no scale
 * factor. Only the plan origin, the elevation origin and the shared ground
 * datum touch building linework, and they do so as pure translations. Every
 * other value here places annotation, never geometry.
 */
export const HOME_BLUEPRINT_SHEET_LAYOUT = Object.freeze({
  planOriginX: 0,
  planOriginY: 0,
  /** Column gutter between the plan and the elevation. */
  gutterQ16: 1728,
  /** Perpendicular offsets for the first and second dimension chains. */
  dimensionChainOneQ16: 448,
  dimensionChainTwoQ16: 960,
  /** Overrun of a dimension witness line past its dimension line. */
  witnessOverrunQ16: 96,
  /** Half-length of a dimension terminator tick. */
  dimensionTickQ16: 72,
  marginLeftQ16: 1600,
  marginRightQ16: 1600,
  marginTopQ16: 640,
  marginBottomQ16: 1472,
  /** Inset of the sheet frame from the drawing edge. */
  frameInsetQ16: 256,
  /** Registration cross arm length on the sheet frame. */
  registrationArmQ16: 192,
  typeTitleQ16: 320,
  typeSubtitleQ16: 200,
  typeRecordQ16: 184,
  typeLabelQ16: 192,
  typeSpaceQ16: 200,
  typeAreaQ16: 168,
});

/* ------------------------------------------------------------ drawing types */

export type HomeBlueprintSpace = "plan" | "elevation" | "sheet";

export type HomeBlueprintMarkClass = "building" | "annotation" | "registration";

export type HomeBlueprintPathKind =
  | "envelope"
  | "wall-exterior"
  | "wall-partition"
  | "opening"
  | "roof"
  | "datum"
  | "origin"
  | "dimension"
  | "frame"
  | "sequence";

export type HomeBlueprintPoint = { x: number; y: number };

export type HomeBlueprintPath = {
  id: string;
  /** First phase in which this mark is drawn. Reveal is cumulative. */
  phase: HomeBlueprintPhase;
  kind: HomeBlueprintPathKind;
  markClass: HomeBlueprintMarkClass;
  space: HomeBlueprintSpace;
  /** Generated `M/L/Z` path data in sheet units. Never handwritten. */
  d: string;
  /** Exact polyline length, for stroke-dash reveal. */
  length: number;
  /** Untranslated profile-space points, so a test can re-derive `d`. */
  sourcePoints: readonly HomeBlueprintPoint[];
  closed: boolean;
  /** Profile record ids this mark was derived from. */
  sourceRefs: readonly string[];
  /** Present on opening marks only. */
  openingKind?: ExecutableGeometryOpening["kind"];
};

export type HomeBlueprintDimension = {
  id: string;
  phase: HomeBlueprintPhase;
  space: HomeBlueprintSpace;
  markClass: "annotation";
  /** Witness lines plus dimension line, generated. */
  d: string;
  label: string;
  valueQ16: number;
  labelX: number;
  labelY: number;
  /** `0` for a horizontal string, `-90` for a vertical one. */
  labelRotation: 0 | -90;
  sourceRefs: readonly string[];
};

export type HomeBlueprintSpaceLabel = {
  id: string;
  phase: HomeBlueprintPhase;
  markClass: "annotation";
  x: number;
  y: number;
  label: string;
  areaLabel: string;
  areaSquareFeet: number;
  /** Fitted to the region's own width so a label never crosses its walls. */
  fontSize: number;
  areaFontSize: number;
  areaOffset: number;
  sourceRefs: readonly string[];
};

export type HomeBlueprintRecordLine = {
  id: string;
  term: string;
  /** Sheet-safe value. Long digests are elided here and kept whole in `provenance`. */
  value: string;
};

export type HomeBlueprintRecordBlock = {
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  subtitle: string;
  lines: readonly HomeBlueprintRecordLine[];
  /** Verbatim truth state. Never softened. */
  disclaimer: string;
};

export type HomeBlueprintProvenance = {
  profileId: string;
  profileVersion: string;
  adoptionState: string;
  maturity: string;
  profileDigest: string;
  modelId: string;
  modelVersion: string;
  releaseVersion: string;
  releaseDigest: string;
  geometrySourceRef: string;
  geometrySourceDigest: string;
  referenceConfigurationDigest: string;
  gatesTotal: number;
  gatesReviewed: number;
};

export type HomeBlueprintMetrics = {
  footprintWidthQ16: number;
  footprintDepthQ16: number;
  wallHeadQ16: number;
  ridgeQ16: number;
  eaveOverhangQ16: number;
  grossAreaSquareFeet: number;
  spaceCount: number;
  openingCount: number;
};

export type HomeBlueprintDrawing = {
  schema: "home-blueprint-drawing/1";
  chapter: "project";
  viewBox: { minX: number; minY: number; width: number; height: number };
  viewBoxAttribute: string;
  phases: readonly HomeBlueprintPhaseDescriptor[];
  paths: readonly HomeBlueprintPath[];
  dimensions: readonly HomeBlueprintDimension[];
  spaceLabels: readonly HomeBlueprintSpaceLabel[];
  recordBlock: HomeBlueprintRecordBlock;
  provenance: HomeBlueprintProvenance;
  metrics: HomeBlueprintMetrics;
  /** Plain-language summary, used verbatim as the SVG accessible description. */
  description: string;
};

/* ------------------------------------------------------------- primitives */

function formatCoordinate(value: number): string {
  if (!Number.isInteger(value)) {
    throw new HomeBlueprintGeometryRefusal("XG_COORDINATE_UNSAFE", "/precision/length_quantum_q16");
  }
  return String(value);
}

function polylinePath(points: readonly HomeBlueprintPoint[], closed: boolean): string {
  if (points.length < 2) {
    throw new HomeBlueprintGeometryRefusal("HB_GEOMETRY_DEGENERATE", "/plan_vertices");
  }

  const [first, ...rest] = points;
  const head = `M ${formatCoordinate(first.x)} ${formatCoordinate(first.y)}`;
  const tail = rest.map((point) => `L ${formatCoordinate(point.x)} ${formatCoordinate(point.y)}`).join(" ");

  return closed ? `${head} ${tail} Z` : `${head} ${tail}`;
}

function polylineLength(points: readonly HomeBlueprintPoint[], closed: boolean): number {
  const ring = closed ? [...points, points[0]] : points;
  let total = 0;

  for (let index = 1; index < ring.length; index += 1) {
    total += Math.hypot(ring[index].x - ring[index - 1].x, ring[index].y - ring[index - 1].y);
  }

  return Math.round(total);
}

/* --------------------------------------------------------------- derivation */

type PlanFrame = {
  widthQ16: number;
  depthQ16: number;
  toSheet: (point: HomeBlueprintPoint) => HomeBlueprintPoint;
};

type ElevationFrame = {
  originX: number;
  groundY: number;
  toSheet: (point: HomeBlueprintPoint) => HomeBlueprintPoint;
};

function buildPlanFrame(vertices: readonly ExecutableGeometryPlanVertex[]): PlanFrame {
  const widthQ16 = Math.max(...vertices.map((vertex) => vertex.x_q16));
  const depthQ16 = Math.max(...vertices.map((vertex) => vertex.y_q16));

  if (widthQ16 <= 0 || depthQ16 <= 0) {
    throw new HomeBlueprintGeometryRefusal("HB_GEOMETRY_DEGENERATE", "/plan_vertices");
  }

  return {
    widthQ16,
    depthQ16,
    // `y` is authored toward the rear; a plan sheet puts the rear at the top.
    toSheet: (point) => ({
      x: HOME_BLUEPRINT_SHEET_LAYOUT.planOriginX + point.x,
      y: HOME_BLUEPRINT_SHEET_LAYOUT.planOriginY + (depthQ16 - point.y),
    }),
  };
}

function buildElevationFrame(plan: PlanFrame): ElevationFrame {
  const originX = HOME_BLUEPRINT_SHEET_LAYOUT.planOriginX + plan.widthQ16 + HOME_BLUEPRINT_SHEET_LAYOUT.gutterQ16;
  // The elevation shares the plan's front line as its ground datum.
  const groundY = HOME_BLUEPRINT_SHEET_LAYOUT.planOriginY + plan.depthQ16;

  return {
    originX,
    groundY,
    toSheet: (point) => ({ x: originX + point.x, y: groundY - point.y }),
  };
}

function vertexMap(profile: ExecutableGeometryProfile): Map<string, ExecutableGeometryPlanVertex> {
  return new Map(profile.plan_vertices.map((vertex) => [vertex.vertex_id, vertex]));
}

function vertexPoint(
  vertices: Map<string, ExecutableGeometryPlanVertex>,
  vertexId: string,
): HomeBlueprintPoint {
  const vertex = requireRecord(vertices.get(vertexId), `/plan_vertices/${vertexId}`);
  return { x: vertex.x_q16, y: vertex.y_q16 };
}

type WallGeometry = {
  start: HomeBlueprintPoint;
  end: HomeBlueprintPoint;
  lengthQ16: number;
  /** Unit direction. Authored walls are axis aligned, so this stays exact. */
  ux: number;
  uy: number;
};

function wallGeometry(
  wall: ExecutableGeometryWallRun,
  vertices: Map<string, ExecutableGeometryPlanVertex>,
): WallGeometry {
  const start = vertexPoint(vertices, wall.start_vertex_id);
  const end = vertexPoint(vertices, wall.end_vertex_id);
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthQ16 = Math.hypot(dx, dy);

  if (lengthQ16 === 0) {
    throw new HomeBlueprintGeometryRefusal("HB_GEOMETRY_DEGENERATE", `/wall_runs/${wall.wall_id}`);
  }

  return { start, end, lengthQ16, ux: dx / lengthQ16, uy: dy / lengthQ16 };
}

function pointAlongWall(geometry: WallGeometry, distanceQ16: number): HomeBlueprintPoint {
  return {
    x: geometry.start.x + geometry.ux * distanceQ16,
    y: geometry.start.y + geometry.uy * distanceQ16,
  };
}

/** Spans of a wall run that survive after its openings are cut out. */
function solidWallSpans(
  wall: ExecutableGeometryWallRun,
  geometry: WallGeometry,
  openings: readonly ExecutableGeometryOpening[],
): Array<[number, number]> {
  const cuts = openings
    .map((opening) => [opening.offset_q16, opening.offset_q16 + opening.cut_width_q16] as [number, number])
    .sort((left, right) => left[0] - right[0]);

  const spans: Array<[number, number]> = [];
  let cursor = 0;

  for (const [cutStart, cutEnd] of cuts) {
    if (cutStart < 0 || cutEnd > geometry.lengthQ16) {
      throw new HomeBlueprintGeometryRefusal("XG_OPENING_OUT_OF_HOST", `/wall_runs/${wall.wall_id}`);
    }
    if (cutStart > cursor) {
      spans.push([cursor, cutStart]);
    }
    cursor = Math.max(cursor, cutEnd);
  }

  if (cursor < geometry.lengthQ16) {
    spans.push([cursor, geometry.lengthQ16]);
  }

  return spans;
}

/** Area-weighted centroid of a closed authored ring. */
function ringCentroid(points: readonly HomeBlueprintPoint[]): HomeBlueprintPoint {
  let twiceArea = 0;
  let cx = 0;
  let cy = 0;

  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    const cross = current.x * next.y - next.x * current.y;
    twiceArea += cross;
    cx += (current.x + next.x) * cross;
    cy += (current.y + next.y) * cross;
  }

  if (twiceArea === 0) {
    throw new HomeBlueprintGeometryRefusal("XG_RING_DEGENERATE", "/plan_regions");
  }

  return { x: Math.round(cx / (3 * twiceArea)), y: Math.round(cy / (3 * twiceArea)) };
}

/** Drops the repeated closing vertex authored rings carry. */
function openRing(ringVertexIds: readonly string[]): readonly string[] {
  const last = ringVertexIds.length - 1;
  return ringVertexIds[0] === ringVertexIds[last] ? ringVertexIds.slice(0, last) : ringVertexIds;
}

const SPACE_LABELS: Record<string, string> = {
  bedroom: "Bedroom",
  entry: "Entry",
  circulation: "Hall",
  kitchen: "Kitchen",
  bathroom: "Bath",
  living_dining: "Living",
  storage_mechanical: "Storage",
};

function spaceLabel(programRole: string): string {
  return SPACE_LABELS[programRole] ?? programRole.replaceAll("_", " ");
}

/** Mean glyph advance as a fraction of type size, for the sans and mono in use. */
const GLYPH_ADVANCE_RATIO = 0.62;
/** Share of a room's width a label is allowed to occupy. */
const LABEL_FIT_RATIO = 0.86;
const LABEL_MINIMUM_Q16 = 96;

/** Largest type size at which `text` still clears the walls of its own room. */
function fitTypeSize(text: string, availableWidthQ16: number, preferredQ16: number): number {
  const fitted = Math.floor((availableWidthQ16 * LABEL_FIT_RATIO) / (text.length * GLYPH_ADVANCE_RATIO));
  return Math.max(LABEL_MINIMUM_Q16, Math.min(preferredQ16, fitted));
}

function ringWidth(points: readonly HomeBlueprintPoint[]): number {
  const xs = points.map((point) => point.x);
  return Math.max(...xs) - Math.min(...xs);
}

function horizontalDimension(
  id: string,
  phase: HomeBlueprintPhase,
  space: HomeBlueprintSpace,
  fromX: number,
  toX: number,
  baselineY: number,
  anchorY: number,
  valueQ16: number,
  sourceRefs: readonly string[],
): HomeBlueprintDimension {
  const { witnessOverrunQ16, dimensionTickQ16 } = HOME_BLUEPRINT_SHEET_LAYOUT;
  const overrun = baselineY > anchorY ? witnessOverrunQ16 : -witnessOverrunQ16;
  const d = [
    `M ${fromX} ${anchorY} L ${fromX} ${baselineY + overrun}`,
    `M ${toX} ${anchorY} L ${toX} ${baselineY + overrun}`,
    `M ${fromX} ${baselineY} L ${toX} ${baselineY}`,
    `M ${fromX} ${baselineY - dimensionTickQ16} L ${fromX} ${baselineY + dimensionTickQ16}`,
    `M ${toX} ${baselineY - dimensionTickQ16} L ${toX} ${baselineY + dimensionTickQ16}`,
  ].join(" ");

  return {
    id,
    phase,
    space,
    markClass: "annotation",
    d,
    label: formatFeetInches(valueQ16),
    valueQ16,
    labelX: Math.round((fromX + toX) / 2),
    labelY: baselineY - dimensionTickQ16 * 2,
    labelRotation: 0,
    sourceRefs,
  };
}

function verticalDimension(
  id: string,
  phase: HomeBlueprintPhase,
  space: HomeBlueprintSpace,
  fromY: number,
  toY: number,
  baselineX: number,
  anchorX: number,
  valueQ16: number,
  sourceRefs: readonly string[],
): HomeBlueprintDimension {
  const { witnessOverrunQ16, dimensionTickQ16 } = HOME_BLUEPRINT_SHEET_LAYOUT;
  const overrun = baselineX > anchorX ? witnessOverrunQ16 : -witnessOverrunQ16;
  const d = [
    `M ${anchorX} ${fromY} L ${baselineX + overrun} ${fromY}`,
    `M ${anchorX} ${toY} L ${baselineX + overrun} ${toY}`,
    `M ${baselineX} ${fromY} L ${baselineX} ${toY}`,
    `M ${baselineX - dimensionTickQ16} ${fromY} L ${baselineX + dimensionTickQ16} ${fromY}`,
    `M ${baselineX - dimensionTickQ16} ${toY} L ${baselineX + dimensionTickQ16} ${toY}`,
  ].join(" ");

  return {
    id,
    phase,
    space,
    markClass: "annotation",
    d,
    label: formatFeetInches(valueQ16),
    valueQ16,
    labelX: baselineX - dimensionTickQ16 * 2,
    labelY: Math.round((fromY + toY) / 2),
    labelRotation: -90,
    sourceRefs,
  };
}

/**
 * Derives the complete Project-chapter sheet from an executable geometry
 * profile. Refuses rather than approximating: a profile that fails the adoption
 * seal, or that is missing a referenced record, produces no drawing at all.
 */
export function deriveHomeBlueprintDrawing(profile: ExecutableGeometryProfile): HomeBlueprintDrawing {
  assertAdoptionSeal(profile);

  const vertices = vertexMap(profile);
  const plan = buildPlanFrame(profile.plan_vertices);
  const elevation = buildElevationFrame(plan);
  const layout = HOME_BLUEPRINT_SHEET_LAYOUT;

  const level = requireRecord(profile.levels[0], "/levels/0");
  const envelope = requireRecord(profile.gross_envelopes[0], "/gross_envelopes/0");
  const openingsById = new Map(profile.openings.map((opening) => [opening.opening_id, opening]));

  const paths: HomeBlueprintPath[] = [];
  const dimensions: HomeBlueprintDimension[] = [];
  const spaceLabels: HomeBlueprintSpaceLabel[] = [];

  const pushPath = (
    path: Omit<HomeBlueprintPath, "d" | "length"> & { sheetPoints: readonly HomeBlueprintPoint[] },
  ): void => {
    const { sheetPoints, ...rest } = path;
    paths.push({
      ...rest,
      d: polylinePath(sheetPoints, path.closed),
      length: polylineLength(sheetPoints, path.closed),
    });
  };

  /* -- sheet extents ------------------------------------------------------ */

  const planLeft = layout.planOriginX;
  const planRight = layout.planOriginX + plan.widthQ16;
  const planTop = layout.planOriginY;
  const planBottom = layout.planOriginY + plan.depthQ16;

  const eaveOverhangQ16 = Math.max(...profile.roof_edges.map((edge) => edge.overhang_q16));
  const ridgeVertex = requireRecord(
    [...profile.roof_vertices].sort((left, right) => right.z_q16 - left.z_q16)[0],
    "/roof_vertices",
  );
  const ridgeQ16 = ridgeVertex.z_q16;
  const wallHeadQ16 = level.ceiling_z_q16;
  const pitch = requireRecord(profile.roof_planes[0], "/roof_planes/0").pitch;
  const rakeDropQ16 = Math.round((eaveOverhangQ16 * pitch.rise) / pitch.run);

  const elevationLeft = elevation.originX - eaveOverhangQ16;
  const elevationRight = elevation.originX + plan.widthQ16 + eaveOverhangQ16;

  const contentLeft = planLeft;
  const contentRight = elevationRight;
  const contentTop = planTop;
  const contentBottom = planBottom;

  const viewBox = {
    minX: contentLeft - layout.marginLeftQ16,
    minY: contentTop - layout.marginTopQ16,
    width: contentRight - contentLeft + layout.marginLeftQ16 + layout.marginRightQ16,
    height: contentBottom - contentTop + layout.marginTopQ16 + layout.marginBottomQ16,
  };

  /* -- lead: sheet frame and registration --------------------------------- */

  const frameInset = layout.frameInsetQ16;
  const frameLeft = viewBox.minX + frameInset;
  const frameRight = viewBox.minX + viewBox.width - frameInset;
  const frameTop = viewBox.minY + frameInset;
  const frameBottom = viewBox.minY + viewBox.height - frameInset;

  pushPath({
    id: "sheet-frame",
    phase: "lead",
    kind: "frame",
    markClass: "registration",
    space: "sheet",
    closed: true,
    sourcePoints: [],
    sourceRefs: [],
    sheetPoints: [
      { x: frameLeft, y: frameTop },
      { x: frameRight, y: frameTop },
      { x: frameRight, y: frameBottom },
      { x: frameLeft, y: frameBottom },
    ],
  });

  const arm = layout.registrationArmQ16;
  const registrationCorners: ReadonlyArray<HomeBlueprintPoint> = [
    { x: frameLeft, y: frameTop },
    { x: frameRight, y: frameTop },
    { x: frameRight, y: frameBottom },
    { x: frameLeft, y: frameBottom },
  ];

  registrationCorners.forEach((corner, index) => {
    pushPath({
      id: `sheet-registration-${index}`,
      phase: "lead",
      kind: "sequence",
      markClass: "registration",
      space: "sheet",
      closed: false,
      sourcePoints: [],
      sourceRefs: [],
      sheetPoints: [
        { x: corner.x - arm, y: corner.y },
        { x: corner.x + arm, y: corner.y },
      ],
    });
    pushPath({
      id: `sheet-registration-${index}-cross`,
      phase: "lead",
      kind: "sequence",
      markClass: "registration",
      space: "sheet",
      closed: false,
      sourcePoints: [],
      sourceRefs: [],
      sheetPoints: [
        { x: corner.x, y: corner.y - arm },
        { x: corner.x, y: corner.y + arm },
      ],
    });
  });

  /*
   * The authored coordinate origin — `front_left_exterior_wall_corner` — marked
   * with drafting arms along `+x` (right) and `+y` (rear). The position is
   * bound to the coordinate frame; the arm length is a drafting mark size, so
   * this stays a registration mark rather than a building line.
   */
  const originSheet = plan.toSheet({ x: 0, y: 0 });
  pushPath({
    id: "sheet-origin-datum",
    phase: "lead",
    kind: "origin",
    markClass: "registration",
    space: "plan",
    closed: false,
    sourcePoints: [{ x: 0, y: 0 }],
    sourceRefs: ["coordinate_frame"],
    sheetPoints: [
      { x: originSheet.x + arm * 2, y: originSheet.y },
      originSheet,
      { x: originSheet.x, y: originSheet.y - arm * 2 },
    ],
  });

  /* -- project: envelope registration and ground datum -------------------- */

  const envelopeVertexIds = openRing(envelope.ring_vertex_ids);
  const envelopeSourcePoints = envelopeVertexIds.map((vertexId) => vertexPoint(vertices, vertexId));

  pushPath({
    id: `envelope-${envelope.envelope_id}`,
    phase: "project",
    kind: "envelope",
    markClass: "building",
    space: "plan",
    closed: true,
    sourcePoints: envelopeSourcePoints,
    sourceRefs: [`gross_envelopes/${envelope.envelope_id}`, ...envelopeVertexIds.map((id) => `plan_vertices/${id}`)],
    sheetPoints: envelopeSourcePoints.map(plan.toSheet),
  });

  pushPath({
    id: "elevation-ground-datum",
    phase: "project",
    kind: "datum",
    markClass: "building",
    space: "elevation",
    closed: false,
    sourcePoints: [
      { x: 0, y: level.floor_z_q16 },
      { x: plan.widthQ16, y: level.floor_z_q16 },
    ],
    sourceRefs: [`levels/${level.level_id}`, `gross_envelopes/${envelope.envelope_id}`],
    sheetPoints: [
      elevation.toSheet({ x: 0, y: level.floor_z_q16 }),
      elevation.toSheet({ x: plan.widthQ16, y: level.floor_z_q16 }),
    ],
  });

  /* -- plan: walls, openings, spaces, dimensions -------------------------- */

  for (const wall of profile.wall_runs) {
    const geometry = wallGeometry(wall, vertices);
    const wallOpenings = wall.opening_ids.map((openingId) =>
      requireRecord(openingsById.get(openingId), `/openings/${openingId}`),
    );
    const spans = solidWallSpans(wall, geometry, wallOpenings);

    spans.forEach(([spanStart, spanEnd], index) => {
      const sourcePoints = [pointAlongWall(geometry, spanStart), pointAlongWall(geometry, spanEnd)];
      pushPath({
        id: `segment-${wall.wall_id}-${index}`,
        phase: "plan",
        kind: wall.kind === "exterior" ? "wall-exterior" : "wall-partition",
        markClass: "building",
        space: "plan",
        closed: false,
        sourcePoints,
        sourceRefs: [`wall_runs/${wall.wall_id}`],
        sheetPoints: sourcePoints.map(plan.toSheet),
      });
    });

    for (const opening of wallOpenings) {
      const sourcePoints = [
        pointAlongWall(geometry, opening.offset_q16),
        pointAlongWall(geometry, opening.offset_q16 + opening.cut_width_q16),
      ];
      pushPath({
        id: `opening-${opening.opening_id}`,
        phase: "plan",
        kind: "opening",
        markClass: "building",
        space: "plan",
        closed: false,
        sourcePoints,
        sourceRefs: [`openings/${opening.opening_id}`, `wall_runs/${wall.wall_id}`],
        openingKind: opening.kind,
        sheetPoints: sourcePoints.map(plan.toSheet),
      });
    }
  }

  const regionsById = new Map(profile.plan_regions.map((region) => [region.region_id, region]));

  for (const space of profile.spaces) {
    const region = requireRecord(regionsById.get(space.region_ref), `/plan_regions/${space.region_ref}`);
    const ringPoints = openRing(region.ring_vertex_ids).map((vertexId) => vertexPoint(vertices, vertexId));
    const centroid = plan.toSheet(ringCentroid(ringPoints));
    const areaSquareFeet = area2ToSquareFeet(space.area2_q16sq);
    const label = spaceLabel(space.program_role);
    const areaLabel = `${areaSquareFeet} sq ft`;
    const available = ringWidth(ringPoints);
    const fontSize = fitTypeSize(label, available, layout.typeSpaceQ16);

    spaceLabels.push({
      id: `space-label-${space.space_id}`,
      phase: "plan",
      markClass: "annotation",
      x: centroid.x,
      y: centroid.y,
      label,
      areaLabel,
      areaSquareFeet,
      fontSize,
      areaFontSize: fitTypeSize(areaLabel, available, layout.typeAreaQ16),
      areaOffset: Math.round(fontSize * 1.2),
      sourceRefs: [`spaces/${space.space_id}`, `plan_regions/${region.region_id}`],
    });
  }

  const planWidthBaseline = planBottom + layout.dimensionChainTwoQ16;
  const planWidthChainOne = planBottom + layout.dimensionChainOneQ16;
  const planDepthBaseline = planLeft - layout.dimensionChainTwoQ16;
  const planDepthChainOne = planLeft - layout.dimensionChainOneQ16;

  dimensions.push(
    horizontalDimension(
      "dim-plan-width-overall",
      "plan",
      "plan",
      planLeft,
      planRight,
      planWidthBaseline,
      planBottom,
      plan.widthQ16,
      [`gross_envelopes/${envelope.envelope_id}`],
    ),
    verticalDimension(
      "dim-plan-depth-overall",
      "plan",
      "plan",
      planTop,
      planBottom,
      planDepthBaseline,
      planLeft,
      plan.depthQ16,
      [`gross_envelopes/${envelope.envelope_id}`],
    ),
  );

  // Interior chains, taken from the authored vertex grid rather than invented.
  const gridX = [...new Set(profile.plan_vertices.map((vertex) => vertex.x_q16))].sort((a, b) => a - b);
  const gridY = [...new Set(profile.plan_vertices.map((vertex) => vertex.y_q16))].sort((a, b) => a - b);

  for (let index = 1; index < gridX.length; index += 1) {
    const fromX = gridX[index - 1];
    const toX = gridX[index];
    dimensions.push(
      horizontalDimension(
        `dim-plan-width-${fromX}-${toX}`,
        "plan",
        "plan",
        planLeft + fromX,
        planLeft + toX,
        planWidthChainOne,
        planBottom,
        toX - fromX,
        [`plan_vertices/x_q16:${fromX}`, `plan_vertices/x_q16:${toX}`],
      ),
    );
  }

  for (let index = 1; index < gridY.length; index += 1) {
    const fromY = gridY[index - 1];
    const toY = gridY[index];
    dimensions.push(
      verticalDimension(
        `dim-plan-depth-${fromY}-${toY}`,
        "plan",
        "plan",
        planBottom - fromY,
        planBottom - toY,
        planDepthChainOne,
        planLeft,
        toY - fromY,
        [`plan_vertices/y_q16:${fromY}`, `plan_vertices/y_q16:${toY}`],
      ),
    );
  }

  /* -- build: front elevation and sheet alignment ------------------------- */

  // The gable ridge runs front to rear, so the front face reads as a gable end.
  const wallSilhouette = [
    { x: 0, y: level.floor_z_q16 },
    { x: 0, y: wallHeadQ16 },
    { x: plan.widthQ16, y: wallHeadQ16 },
    { x: plan.widthQ16, y: level.floor_z_q16 },
  ];

  pushPath({
    id: "elevation-wall-silhouette",
    phase: "build",
    kind: "wall-exterior",
    markClass: "building",
    space: "elevation",
    closed: false,
    sourcePoints: wallSilhouette,
    sourceRefs: [`levels/${level.level_id}`, `gross_envelopes/${envelope.envelope_id}`],
    sheetPoints: wallSilhouette.map(elevation.toSheet),
  });

  const rakeLine = [
    { x: -eaveOverhangQ16, y: wallHeadQ16 - rakeDropQ16 },
    { x: ridgeVertex.x_q16, y: ridgeQ16 },
    { x: plan.widthQ16 + eaveOverhangQ16, y: wallHeadQ16 - rakeDropQ16 },
  ];

  pushPath({
    id: "elevation-roof-rake",
    phase: "build",
    kind: "roof",
    markClass: "building",
    space: "elevation",
    closed: false,
    sourcePoints: rakeLine,
    sourceRefs: [
      `roof_vertices/${ridgeVertex.roof_vertex_id}`,
      ...profile.roof_planes.map((roofPlane) => `roof_planes/${roofPlane.roof_plane_id}`),
      ...profile.roof_edges.filter((edge) => edge.role === "rake").map((edge) => `roof_edges/${edge.roof_edge_id}`),
    ],
    sheetPoints: rakeLine.map(elevation.toSheet),
  });

  // Only openings hosted on walls that lie in the front plane are visible here.
  const frontWalls = profile.wall_runs.filter((wall) => {
    const geometry = wallGeometry(wall, vertices);
    return wall.kind === "exterior" && geometry.start.y === 0 && geometry.end.y === 0;
  });

  for (const wall of frontWalls) {
    const geometry = wallGeometry(wall, vertices);

    for (const openingId of wall.opening_ids) {
      const opening = requireRecord(openingsById.get(openingId), `/openings/${openingId}`);
      const startX = pointAlongWall(geometry, opening.offset_q16).x;
      const endX = pointAlongWall(geometry, opening.offset_q16 + opening.cut_width_q16).x;
      const sourcePoints = [
        { x: startX, y: opening.sill_q16 },
        { x: startX, y: opening.head_q16 },
        { x: endX, y: opening.head_q16 },
        { x: endX, y: opening.sill_q16 },
      ];

      pushPath({
        id: `elevation-opening-${opening.opening_id}`,
        phase: "build",
        kind: "opening",
        markClass: "building",
        space: "elevation",
        closed: opening.sill_q16 !== level.floor_z_q16,
        sourcePoints,
        sourceRefs: [`openings/${opening.opening_id}`, `wall_runs/${wall.wall_id}`],
        openingKind: opening.kind,
        sheetPoints: sourcePoints.map(elevation.toSheet),
      });
    }
  }

  // Sheet alignment: the plan front line and the elevation ground line are one datum.
  pushPath({
    id: "sheet-alignment-datum",
    phase: "build",
    kind: "datum",
    markClass: "registration",
    space: "sheet",
    closed: false,
    sourcePoints: [],
    sourceRefs: [],
    sheetPoints: [
      { x: planRight, y: planBottom },
      { x: elevationLeft, y: elevation.groundY },
    ],
  });

  const elevationDimBaseline = elevationRight + layout.dimensionChainOneQ16;
  const elevationDimBaselineTwo = elevationRight + layout.dimensionChainTwoQ16;

  dimensions.push(
    verticalDimension(
      "dim-elevation-wall-head",
      "build",
      "elevation",
      elevation.groundY,
      elevation.groundY - wallHeadQ16,
      elevationDimBaseline,
      elevationRight,
      wallHeadQ16,
      [`levels/${level.level_id}`],
    ),
    verticalDimension(
      "dim-elevation-ridge",
      "build",
      "elevation",
      elevation.groundY,
      elevation.groundY - ridgeQ16,
      elevationDimBaselineTwo,
      elevationRight,
      ridgeQ16,
      [`roof_vertices/${ridgeVertex.roof_vertex_id}`],
    ),
    horizontalDimension(
      "dim-elevation-overhang",
      "build",
      "elevation",
      elevation.originX + plan.widthQ16,
      elevationRight,
      // Shares the plan's overall-dimension row, clear of the height chains.
      elevation.groundY + layout.dimensionChainTwoQ16,
      elevation.groundY,
      eaveOverhangQ16,
      profile.roof_edges.filter((edge) => edge.overhang_q16 > 0).map((edge) => `roof_edges/${edge.roof_edge_id}`),
    ),
  );

  /* -- record: the profile state that produced these lines ---------------- */

  const gatesTotal = profile.professional_gates.length;
  const gatesReviewed = profile.professional_gates.filter((gate) => gate.status === "reviewed_pass").length;

  const recordBlock: HomeBlueprintRecordBlock = {
    x: elevationLeft,
    y: contentTop,
    width: elevationRight - elevationLeft,
    height: elevation.groundY - ridgeQ16 - layout.gutterQ16 / 2,
    title: `${profile.model_binding.model_id} · ${profile.model_binding.model_version}`,
    subtitle: profile.profile_id,
    lines: [
      { id: "record-version", term: "Profile version", value: profile.profile_version },
      { id: "record-adoption", term: "Adoption", value: profile.adoption_state },
      { id: "record-maturity", term: "Maturity", value: profile.maturity },
      { id: "record-release", term: "Release", value: profile.model_binding.release_version },
      { id: "record-digest", term: "Digest", value: `${profile.profile_digest.slice(0, 18)}…` },
      { id: "record-gates", term: "Gates reviewed", value: `${gatesReviewed} of ${gatesTotal}` },
    ],
    disclaimer: "Concept geometry from an owner-adopted profile. Not a construction document, survey, or approval.",
  };

  pushPath({
    id: "record-block-frame",
    phase: "record",
    kind: "frame",
    markClass: "registration",
    space: "sheet",
    closed: true,
    sourcePoints: [],
    sourceRefs: [],
    sheetPoints: [
      { x: recordBlock.x, y: recordBlock.y },
      { x: recordBlock.x + recordBlock.width, y: recordBlock.y },
      { x: recordBlock.x + recordBlock.width, y: recordBlock.y + recordBlock.height },
      { x: recordBlock.x, y: recordBlock.y + recordBlock.height },
    ],
  });

  pushPath({
    id: "record-block-rule",
    phase: "record",
    kind: "sequence",
    markClass: "registration",
    space: "sheet",
    closed: false,
    sourcePoints: [],
    sourceRefs: [],
    sheetPoints: [
      { x: recordBlock.x, y: recordBlock.y + layout.typeTitleQ16 * 2 },
      { x: recordBlock.x + recordBlock.width, y: recordBlock.y + layout.typeTitleQ16 * 2 },
    ],
  });

  const metrics: HomeBlueprintMetrics = {
    footprintWidthQ16: plan.widthQ16,
    footprintDepthQ16: plan.depthQ16,
    wallHeadQ16,
    ridgeQ16,
    eaveOverhangQ16,
    grossAreaSquareFeet: area2ToSquareFeet(profile.area_accounting.gross_area2_q16sq),
    spaceCount: profile.spaces.length,
    openingCount: profile.openings.length,
  };

  const provenance: HomeBlueprintProvenance = {
    profileId: profile.profile_id,
    profileVersion: profile.profile_version,
    adoptionState: profile.adoption_state,
    maturity: profile.maturity,
    profileDigest: profile.profile_digest,
    modelId: profile.model_binding.model_id,
    modelVersion: profile.model_binding.model_version,
    releaseVersion: profile.model_binding.release_version,
    releaseDigest: profile.model_binding.release_digest,
    geometrySourceRef: profile.model_binding.geometry_source_ref,
    geometrySourceDigest: profile.model_binding.geometry_source_digest,
    referenceConfigurationDigest: profile.model_binding.reference_configuration_digest,
    gatesTotal,
    gatesReviewed,
  };

  const description = [
    `Drafting sequence for the owner-adopted ${provenance.modelId} concept profile.`,
    `A ${formatFeetInches(plan.widthQ16)} by ${formatFeetInches(plan.depthQ16)} footprint of ${metrics.grossAreaSquareFeet} square feet`,
    `is drawn as a floor plan with ${metrics.spaceCount} spaces and ${metrics.openingCount} openings,`,
    `then as a front elevation with a ${formatFeetInches(wallHeadQ16)} wall head and a ${formatFeetInches(ridgeQ16)} ridge.`,
    recordBlock.disclaimer,
  ].join(" ");

  return {
    schema: "home-blueprint-drawing/1",
    chapter: "project",
    viewBox,
    viewBoxAttribute: `${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}`,
    phases: HOME_BLUEPRINT_PHASES,
    paths,
    dimensions,
    spaceLabels,
    recordBlock,
    provenance,
    metrics,
    description,
  };
}

/**
 * The drawing bound to the profile adopted on `main`. Derived at module load so
 * a seal failure is a build-time failure rather than a silent visual fallback.
 */
export const HOME_BLUEPRINT_PROJECT_DRAWING: HomeBlueprintDrawing =
  deriveHomeBlueprintDrawing(A600_EXECUTABLE_PROFILE);

export type HomeBlueprintVerification =
  | { ok: true; drawing: HomeBlueprintDrawing }
  | { ok: false; code: HomeBlueprintRefusalCode; pointer: string };

/**
 * Runs the full executable-geometry contract, including the recomputed
 * canonical digest, and only then hands back a drawing. Fails closed: a
 * validation result that is not `ok` yields no geometry.
 */
export async function verifyHomeBlueprintProjectGeometry(
  candidate: unknown = A600_EXECUTABLE_PROFILE,
): Promise<HomeBlueprintVerification> {
  const validation = await validateA600ExecutableProfile(candidate);

  if (!validation.ok) {
    return { ok: false, code: validation.code, pointer: validation.pointer };
  }

  try {
    return { ok: true, drawing: deriveHomeBlueprintDrawing(validation.profile) };
  } catch (error) {
    if (error instanceof HomeBlueprintGeometryRefusal) {
      return { ok: false, code: error.code, pointer: error.pointer };
    }
    throw error;
  }
}
