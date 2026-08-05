import type {
  CompatibilityDecision,
  ConfigurationCandidate,
  ConfigurationCandidateInput,
  StudioCatalog,
  StudioOptionKey,
  StudioSelections,
} from "./types";

function canonicalizeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonicalizeValue);
  }

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([key]) => key !== "config_hash")
        .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
        .map(([key, nestedValue]) => [key, canonicalizeValue(nestedValue)]),
    );
  }

  return value;
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(canonicalizeValue(value));
}

export async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);

  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function buildConfigurationCandidate(
  catalog: StudioCatalog,
  input: ConfigurationCandidateInput,
): Promise<ConfigurationCandidate> {
  assertValidCandidate(catalog, input);

  return {
    ...input,
    config_hash: await sha256Hex(canonicalJson(input)),
  };
}

function matchesRule(
  ruleIf: Record<string, string | undefined>,
  archetype: string,
  selections: StudioSelections,
): boolean {
  return Object.entries(ruleIf).every(([key, value]) => {
    if (key === "archetype") {
      return archetype === value;
    }

    return selections[key as StudioOptionKey] === value;
  });
}

export function evaluateOption(
  catalog: StudioCatalog,
  archetype: string,
  selections: StudioSelections,
  optionKey: StudioOptionKey,
  optionValue: string,
): CompatibilityDecision {
  const proposedSelections = { ...selections, [optionKey]: optionValue };

  for (const rule of catalog.compatibility) {
    if (!matchesRule(rule.if, archetype, proposedSelections)) {
      continue;
    }

    const deniedValues = rule.deny[optionKey] ?? [];
    if (deniedValues.includes(optionValue)) {
      return { allowed: false, reasonCode: rule.reason_code };
    }

    for (const [deniedKey, values] of Object.entries(rule.deny)) {
      if (values?.includes(proposedSelections[deniedKey as StudioOptionKey])) {
        return { allowed: false, reasonCode: rule.reason_code };
      }
    }
  }

  return { allowed: true };
}

export function assertValidCandidate(catalog: StudioCatalog, input: ConfigurationCandidateInput): void {
  const archetype = catalog.archetypes.find((item) => item.id === input.archetype);
  if (!archetype) {
    throw new Error("unknown_archetype");
  }

  if (!archetype.layouts.includes(input.layout)) {
    throw new Error("unsupported_layout");
  }

  for (const [key, value] of Object.entries(input.selections)) {
    const optionKey = key as StudioOptionKey;
    if (!catalog.options[optionKey].includes(value)) {
      throw new Error(`unknown_${optionKey}`);
    }

    const decision = evaluateOption(catalog, input.archetype, input.selections, optionKey, value);
    if (!decision.allowed) {
      throw new Error(decision.reasonCode);
    }
  }
}
