type StudioPublicAssetPath = `/images/${string}.webp`;

export const STUDIO_ASSET_MANIFEST = Object.freeze({
  "assets/images/attainable-adu@1": "/images/attainable-adu-hero-concept-v1.webp",
  "assets/images/adu-courtyard@1": "/images/adu-courtyard-concept-v1.webp",
  "assets/images/residential-addition@1":
    "/images/attainable-residential-addition-concept-v1.webp",
} as const satisfies Record<string, StudioPublicAssetPath>);

export type StudioGeometryRef = keyof typeof STUDIO_ASSET_MANIFEST;
export type StudioAssetPath = (typeof STUDIO_ASSET_MANIFEST)[StudioGeometryRef];

export function resolveStudioAsset(ref: string | null | undefined): StudioAssetPath {
  if (
    typeof ref !== "string" ||
    !Object.prototype.hasOwnProperty.call(STUDIO_ASSET_MANIFEST, ref)
  ) {
    throw new Error("unknown_geometry_ref");
  }

  return STUDIO_ASSET_MANIFEST[ref as StudioGeometryRef];
}
