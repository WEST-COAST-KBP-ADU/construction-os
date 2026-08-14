import { describe, expect, it } from "vitest";

import {
  HOUSE_PORTAL_ENTRY,
  HOUSE_PORTAL_PUBLIC_MODEL,
  STUDIO_DEFAULT_ARCHETYPE,
  resolveStudioEntry,
} from "./heroEntryContract";

describe("Studio house-portal entry contract", () => {
  it("maps the canonical public A600 entry to the existing one-bedroom archetype", () => {
    expect(
      resolveStudioEntry({
        entry: HOUSE_PORTAL_ENTRY,
        model: HOUSE_PORTAL_PUBLIC_MODEL,
      }),
    ).toEqual({
      archetype: "one-bed-600",
      source: "house-portal",
    });
  });

  it("preserves the existing Studio default when entry values are absent", () => {
    expect(resolveStudioEntry({})).toEqual({
      archetype: STUDIO_DEFAULT_ARCHETYPE,
      source: "direct",
    });
  });

  it.each([
    { entry: [HOUSE_PORTAL_ENTRY], model: HOUSE_PORTAL_PUBLIC_MODEL },
    { entry: HOUSE_PORTAL_ENTRY, model: [HOUSE_PORTAL_PUBLIC_MODEL] },
    { entry: " house-portal", model: HOUSE_PORTAL_PUBLIC_MODEL },
    { entry: HOUSE_PORTAL_ENTRY, model: "ADU-A-600" },
  ])("falls back for malformed values: $entry / $model", (searchParams) => {
    expect(resolveStudioEntry(searchParams)).toEqual({
      archetype: STUDIO_DEFAULT_ARCHETYPE,
      source: "direct",
    });
  });

  it.each([
    { entry: "models", model: HOUSE_PORTAL_PUBLIC_MODEL },
    { entry: HOUSE_PORTAL_ENTRY, model: "adu-b-800" },
    { entry: HOUSE_PORTAL_ENTRY, model: undefined },
    { entry: undefined, model: HOUSE_PORTAL_PUBLIC_MODEL },
  ])("falls back for unknown or incomplete values: $entry / $model", (searchParams) => {
    expect(resolveStudioEntry(searchParams)).toEqual({
      archetype: STUDIO_DEFAULT_ARCHETYPE,
      source: "direct",
    });
  });
});
