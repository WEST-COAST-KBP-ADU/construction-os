import profileData from "../../data/studio/models/executable/adu-a-600@1.0.0.json";
import geometrySourceData from "../../data/studio/models/geometry/adu-a-600@1.json";
import releaseData from "../../data/studio/models/releases/2026.09.0.json";

import {
  assertExecutableGeometryMaterializable,
  validateExecutableGeometry,
  validateExecutableGeometryJson,
} from "./executableGeometryContract";
import type {
  ExecutableGeometryBindingContext,
  ExecutableGeometryProfile,
  ExecutableGeometryValidationResult,
} from "./executableGeometryTypes";

type ReleaseModel = {
  schema: "adu-model/1";
  model_id: string;
  version: string;
  maturity: ExecutableGeometryProfile["maturity"];
  geometry: { source_ref: string; digest: string };
};

type Release = {
  schema: "adu-model-release/1";
  release_version: string;
  release_digest: string;
  models: ReleaseModel[];
};

const release = releaseData as unknown as Release;
const geometrySource = geometrySourceData as unknown as ExecutableGeometryBindingContext["geometry_source"];
const profile = profileData as unknown as ExecutableGeometryProfile;
const model = release.models.find(
  (candidate) => candidate.model_id === profile.model_binding.model_id && candidate.version === profile.model_binding.model_version,
);

if (model === undefined) {
  throw new Error("XG_BINDING_MODEL_MISMATCH");
}

export const A600_EXECUTABLE_PROFILE_CONTEXT: ExecutableGeometryBindingContext = {
  model,
  release: {
    schema: release.schema,
    release_version: release.release_version,
    release_digest: release.release_digest,
  },
  geometry_source: geometrySource,
};

export const A600_EXECUTABLE_PROFILE = profile;

function assertA600AdoptionBinding(
  result: ExecutableGeometryValidationResult,
): ExecutableGeometryValidationResult {
  if (!result.ok) return result;
  const acceptedEvidence = new Set(result.profile.provenance.design_input_evidence_refs);
  if (
    result.profile.profile_id !== "adu-a-600-profile-owner-adopted" ||
    result.profile.profile_version !== "1.0.0" ||
    result.profile.adoption_state !== "owner_adopted" ||
    result.profile.profile_digest !== "sha256:27df292e84fc6e00a2ddc5913c0f6175d94a91a4b0de32bf4dab2c3049eec5b3" ||
    !acceptedEvidence.has("docs/design/a600/A600-CONCEPT-TESTFIT-001.svg@085353bf0f7d3bec86eb7c9a46977bde9f822d9a") ||
    !acceptedEvidence.has("sha256:54cb40a6212916d83ab5638ae05330d113a06dc9c09a03fe5f120875f03da5f4") ||
    !acceptedEvidence.has("https://github.com/WEST-COAST-KBP-ADU/construction-os/issues/115#issuecomment-5234481099")
  ) {
    return { ok: false, code: "XG_ADOPTION_BINDING_MISMATCH", pointer: "/adoption_state" };
  }
  return result;
}

export async function validateA600ExecutableProfile(
  candidate: unknown = A600_EXECUTABLE_PROFILE,
): Promise<ExecutableGeometryValidationResult> {
  return assertA600AdoptionBinding(
    await validateExecutableGeometry(candidate, A600_EXECUTABLE_PROFILE_CONTEXT),
  );
}

export async function validateA600ExecutableProfileJson(
  rawJson: string,
): Promise<ExecutableGeometryValidationResult> {
  return assertA600AdoptionBinding(
    await validateExecutableGeometryJson(rawJson, A600_EXECUTABLE_PROFILE_CONTEXT),
  );
}

export function assertA600MaterializationAllowed(
  output: "step" | "glb" | "render",
): void {
  assertExecutableGeometryMaterializable(A600_EXECUTABLE_PROFILE, output);
}

export const EXECUTABLE_PROFILE_REGISTRY = Object.freeze({
  "adu-a-600@1.0.0": Object.freeze({
    profile: A600_EXECUTABLE_PROFILE,
    context: A600_EXECUTABLE_PROFILE_CONTEXT,
    validate: validateA600ExecutableProfile,
    validateJson: validateA600ExecutableProfileJson,
    assertMaterializationAllowed: assertA600MaterializationAllowed,
  }),
});
