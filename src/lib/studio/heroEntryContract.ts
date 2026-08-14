export const STUDIO_DEFAULT_ARCHETYPE = "one-bed-600" as const;

export const HOUSE_PORTAL_ENTRY = "house-portal" as const;
export const HOUSE_PORTAL_PUBLIC_MODEL = "adu-a-600" as const;

export type StudioEntrySearchParams = Readonly<
  Record<string, string | readonly string[] | undefined>
>;

export type StudioEntryResolution = Readonly<{
  archetype: typeof STUDIO_DEFAULT_ARCHETYPE;
  source: "direct" | "house-portal";
}>;

/**
 * Resolves the closed public Studio-entry vocabulary to the existing internal
 * archetype. Any absent, repeated, malformed, or unknown value preserves the
 * direct Studio default.
 */
export function resolveStudioEntry(
  searchParams: StudioEntrySearchParams,
): StudioEntryResolution {
  if (
    searchParams.entry === HOUSE_PORTAL_ENTRY &&
    searchParams.model === HOUSE_PORTAL_PUBLIC_MODEL
  ) {
    return {
      archetype: STUDIO_DEFAULT_ARCHETYPE,
      source: "house-portal",
    };
  }

  return {
    archetype: STUDIO_DEFAULT_ARCHETYPE,
    source: "direct",
  };
}
