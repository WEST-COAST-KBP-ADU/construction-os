export const SYNTHETIC_FIXTURE_VERSION = "synthetic-property-fit/1" as const;

export type Rotation = 0 | 90;

export type Rect = {
  x: number;
  y: number;
  width: number;
  depth: number;
};

export type ModelId = "studio-450" | "one-bed-600" | "two-bed-800";

export type ModelDefinition = {
  id: ModelId;
  label: string;
  sizeBand: string;
  footprint: { width: number; depth: number };
};

export type SyntheticFixture = {
  version: typeof SYNTHETIC_FIXTURE_VERSION;
  parcel: Rect;
  assumedBufferFeet: number;
  exclusions: readonly (Rect & { id: string; label: string })[];
};

export type Candidate = Rect & {
  id: string;
  modelId: ModelId;
  rotation: Rotation;
};

export type RejectionReason = "outside-assumed-buffer" | `overlaps-${string}`;

export type EvaluatedCandidate = {
  candidate: Candidate;
  valid: boolean;
  reason: RejectionReason | null;
};

export const MODELS: readonly ModelDefinition[] = [
  {
    id: "studio-450",
    label: "Studio",
    sizeBand: "400–500 sq ft",
    footprint: { width: 18, depth: 25 },
  },
  {
    id: "one-bed-600",
    label: "One bedroom",
    sizeBand: "550–650 sq ft",
    footprint: { width: 20, depth: 30 },
  },
  {
    id: "two-bed-800",
    label: "Two bedroom",
    sizeBand: "750–850 sq ft",
    footprint: { width: 25, depth: 32 },
  },
] as const;

export const SYNTHETIC_PROPERTY: SyntheticFixture = {
  version: SYNTHETIC_FIXTURE_VERSION,
  parcel: { x: 9, y: 7, width: 82, depth: 116 },
  assumedBufferFeet: 6,
  exclusions: [
    { id: "existing-home", label: "Existing home", x: 31, y: 17, width: 38, depth: 38 },
    { id: "assumed-utility", label: "Assumed utility corridor", x: 15, y: 61, width: 17, depth: 8 },
    { id: "assumed-tree", label: "Assumed tree protection", x: 64, y: 78, width: 17, depth: 17 },
  ],
};

const ANCHORS = [
  { id: "north-west", x: 0, y: 0 },
  { id: "north-east", x: 1, y: 0 },
  { id: "mid-west", x: 0, y: 0.5 },
  { id: "center", x: 0.5, y: 0.5 },
  { id: "mid-east", x: 1, y: 0.5 },
  { id: "south-west", x: 0, y: 1 },
  { id: "south-center", x: 0.5, y: 1 },
  { id: "south-east", x: 1, y: 1 },
] as const;

function overlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.depth && a.y + a.depth > b.y;
}

function modelById(modelId: ModelId): ModelDefinition {
  const model = MODELS.find((item) => item.id === modelId);
  if (!model) throw new Error(`unknown-model:${modelId}`);
  return model;
}

export function inwardBuffer(fixture: SyntheticFixture): Rect {
  const amount = fixture.assumedBufferFeet;
  return {
    x: fixture.parcel.x + amount,
    y: fixture.parcel.y + amount,
    width: Math.max(0, fixture.parcel.width - amount * 2),
    depth: Math.max(0, fixture.parcel.depth - amount * 2),
  };
}

export function evaluateCandidate(
  candidate: Candidate,
  fixture: SyntheticFixture = SYNTHETIC_PROPERTY,
): EvaluatedCandidate {
  const buffered = inwardBuffer(fixture);
  const contained =
    candidate.x >= buffered.x &&
    candidate.y >= buffered.y &&
    candidate.x + candidate.width <= buffered.x + buffered.width &&
    candidate.y + candidate.depth <= buffered.y + buffered.depth;

  if (!contained) return { candidate, valid: false, reason: "outside-assumed-buffer" };

  const exclusion = fixture.exclusions.find((zone) => overlap(candidate, zone));
  if (exclusion) return { candidate, valid: false, reason: `overlaps-${exclusion.id}` };

  return { candidate, valid: true, reason: null };
}

export function generateCandidates(
  modelId: ModelId,
  fixture: SyntheticFixture = SYNTHETIC_PROPERTY,
): { valid: Candidate[]; rejected: EvaluatedCandidate[] } {
  const model = modelById(modelId);
  const buffered = inwardBuffer(fixture);
  const evaluated: EvaluatedCandidate[] = [];

  for (const rotation of [0, 90] as const) {
    const width = rotation === 0 ? model.footprint.width : model.footprint.depth;
    const depth = rotation === 0 ? model.footprint.depth : model.footprint.width;
    const travelX = Math.max(0, buffered.width - width);
    const travelY = Math.max(0, buffered.depth - depth);

    for (const anchor of ANCHORS) {
      const candidate: Candidate = {
        id: `${modelId}-r${rotation}-${anchor.id}`,
        modelId,
        rotation,
        x: buffered.x + Math.round(travelX * anchor.x),
        y: buffered.y + Math.round(travelY * anchor.y),
        width,
        depth,
      };
      evaluated.push(evaluateCandidate(candidate, fixture));
    }
  }

  return {
    valid: evaluated.filter((item) => item.valid).map((item) => item.candidate),
    rejected: evaluated.filter((item) => !item.valid),
  };
}

export function candidatesForRotation(
  modelId: ModelId,
  rotation: Rotation,
  fixture: SyntheticFixture = SYNTHETIC_PROPERTY,
): Candidate[] {
  return generateCandidates(modelId, fixture).valid.filter((candidate) => candidate.rotation === rotation);
}
