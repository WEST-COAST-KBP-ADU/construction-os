import type { ExecutableGeometryProfile } from "./executableGeometryTypes";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export class DuplicateJsonPropertyNameError extends Error {
  public constructor() {
    super("XG_JSON_DUPLICATE_NAME");
    this.name = "DuplicateJsonPropertyNameError";
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function assertJsonNumber(value: number): void {
  if (!Number.isFinite(value)) {
    throw new TypeError("Canonical JSON does not admit non-finite numbers.");
  }
}

/**
 * A narrow RFC 8785-compatible canonical serializer for JSON values admitted by
 * this contract. Authored geometry accepts only safe integer numbers, so native
 * ECMAScript number serialization is both deterministic and lossless here.
 */
export function canonicalizeJson(value: unknown, omitKeys: readonly string[] = []): string {
  if (value === null || typeof value === "string" || typeof value === "boolean") {
    return JSON.stringify(value);
  }

  if (typeof value === "number") {
    assertJsonNumber(value);
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((entry) => canonicalizeJson(entry, omitKeys)).join(",")}]`;
  }

  if (isPlainObject(value)) {
    return `{${Object.keys(value)
      .filter((key) => !omitKeys.includes(key))
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalizeJson(value[key], omitKeys)}`)
      .join(",")}}`;
  }

  throw new TypeError("Canonical JSON admits only JSON values.");
}

export function canonicalizeExecutableGeometry(profile: unknown): string {
  return canonicalizeJson(profile, ["profile_digest"]);
}

export async function digestCanonicalJson(canonicalJson: string): Promise<string> {
  const bytes = new TextEncoder().encode(canonicalJson);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");

  return `sha256:${hex}`;
}

export async function computeExecutableGeometryDigest(profile: unknown): Promise<string> {
  return digestCanonicalJson(canonicalizeExecutableGeometry(profile));
}

export async function computeReferenceConfigurationDigest(configuration: unknown): Promise<string> {
  return digestCanonicalJson(canonicalizeJson(configuration));
}

export async function resealExecutableGeometryProfile<T extends ExecutableGeometryProfile>(
  profile: T,
): Promise<T> {
  return {
    ...profile,
    profile_digest: await computeExecutableGeometryDigest(profile),
  };
}

function skipString(raw: string, start: number): number {
  let index = start + 1;

  while (index < raw.length) {
    const character = raw[index];

    if (character === "\\") {
      index += 2;
      continue;
    }

    if (character === "\"") {
      return index;
    }

    index += 1;
  }

  return raw.length;
}

type ObjectScanFrame = {
  kind: "object";
  expectsKey: boolean;
  names: Set<string>;
};

type ArrayScanFrame = {
  kind: "array";
};

type ScanFrame = ObjectScanFrame | ArrayScanFrame;

/**
 * RFC 8259 permits parsers to disagree on duplicate names. The profile does
 * not: scan raw text before JSON.parse so a lossy native parse cannot hide a
 * duplicate member behind last-write-wins behaviour.
 */
export function assertNoDuplicateJsonPropertyNames(raw: string): void {
  const stack: ScanFrame[] = [];

  for (let index = 0; index < raw.length; index += 1) {
    const character = raw[index];

    if (character === "\"") {
      const end = skipString(raw, index);
      const token = raw.slice(index, Math.min(end + 1, raw.length));
      const current = stack.at(-1);

      if (current?.kind === "object" && current.expectsKey) {
        let key: unknown;

        try {
          key = JSON.parse(token);
        } catch {
          key = undefined;
        }

        if (typeof key === "string") {
          if (current.names.has(key)) {
            throw new DuplicateJsonPropertyNameError();
          }
          current.names.add(key);
          current.expectsKey = false;
        }
      }

      index = end;
      continue;
    }

    if (character === "{") {
      stack.push({ kind: "object", expectsKey: true, names: new Set<string>() });
      continue;
    }

    if (character === "[") {
      stack.push({ kind: "array" });
      continue;
    }

    if (character === "}" || character === "]") {
      stack.pop();
      continue;
    }

    if (character === ",") {
      const current = stack.at(-1);
      if (current?.kind === "object") {
        current.expectsKey = true;
      }
    }
  }
}

export function parseExecutableGeometryJson(raw: string): unknown {
  assertNoDuplicateJsonPropertyNames(raw);
  return JSON.parse(raw) as JsonValue;
}
