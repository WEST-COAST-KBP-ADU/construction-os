import { describe, expect, it } from "vitest";

import {
  canonicalizeExecutableGeometry,
  resealExecutableGeometryProfile,
} from "./executableGeometryCanonical";
import {
  cloneTestOnlyExecutableGeometryProfile,
  createTestOnlyExecutableGeometryFixture,
} from "./__fixtures__/executableGeometry";
import {
  validateExecutableGeometry,
  validateExecutableGeometryJson,
} from "./executableGeometryContract";
import type {
  ExecutableGeometryProfile,
  ExecutableGeometryRefusalCode,
} from "./executableGeometryTypes";

const GOLDEN_TEST_ONLY_DIGEST = "sha256:a83979f41d3d42677c3c4431491e5ba7dcfd1b51b61f4241bd5a2b6edc82d7f9";

async function expectRefusal(
  expectedCode: ExecutableGeometryRefusalCode,
  expectedPointer: string,
  mutate: (profile: ExecutableGeometryProfile) => void,
  reseal = true,
): Promise<void> {
  const { profile: original, context } = await createTestOnlyExecutableGeometryFixture();
  let profile = cloneTestOnlyExecutableGeometryProfile(original);
  mutate(profile);
  if (reseal) profile = await resealExecutableGeometryProfile(profile);
  const result = await validateExecutableGeometry(profile, context);

  expect(result.ok).toBe(false);
  if (result.ok) throw new Error("Expected a terminal refusal.");
  expect(result.code).toBe(expectedCode);
  expect(result.pointer).toBe(expectedPointer);
}

describe("adu-executable-geometry/1", () => {
  it("accepts the explicit TEST-ONLY / NON-PRODUCT fixture and replays its golden JCS digest", async () => {
    const { profile, context } = await createTestOnlyExecutableGeometryFixture();
    const result = await validateExecutableGeometry(profile, context);

    expect(result).toMatchObject({ ok: true });
    expect(profile.profile_digest).toBe(GOLDEN_TEST_ONLY_DIGEST);
    const canonical = canonicalizeExecutableGeometry(profile);
    expect(canonical).toContain("TEST-ONLY / NON-PRODUCT");
  });

  it("is byte-identical across repeated canonicalization, key reordering, and JSON round trips", async () => {
    const { profile, context } = await createTestOnlyExecutableGeometryFixture();
    const first = canonicalizeExecutableGeometry(profile);
    const second = canonicalizeExecutableGeometry(profile);
    const third = canonicalizeExecutableGeometry(profile);
    const reordered = Object.fromEntries(Object.entries(profile).reverse());
    const parsed = JSON.parse(JSON.stringify(reordered));

    expect(first).toBe(second);
    expect(second).toBe(third);
    expect(await validateExecutableGeometry(reordered, context)).toMatchObject({ ok: true });
    expect(await validateExecutableGeometryJson(JSON.stringify(parsed), context)).toMatchObject({ ok: true });
  });

  it("rejects a raw duplicate object name before native JSON parsing", async () => {
    const { context } = await createTestOnlyExecutableGeometryFixture();
    const raw = '{"schema":"adu-executable-geometry/1","schema":"adu-executable-geometry/1"}';
    const result = await validateExecutableGeometryJson(raw, context);

    expect(result).toEqual({ ok: false, code: "XG_JSON_DUPLICATE_NAME", pointer: "" });
  });

  it("rejects all 24 resealed adversarial mutations with an exact code and JSON Pointer", async () => {
    await expectRefusal("XG_RING_OPEN", "/plan_regions/20/ring_vertex_ids", (profile) => {
      profile.plan_regions[20].ring_vertex_ids.pop();
    });
    await expectRefusal("XG_RING_SELF_INTERSECTION", "/plan_regions/20/ring_vertex_ids", (profile) => {
      profile.plan_regions[20].ring_vertex_ids = ["p-20-front", "p-21-rear", "p-21-front", "p-20-rear", "p-20-front"];
    });
    await expectRefusal("XG_REGION_OVERLAP", "/plan_regions/21/ring_vertex_ids", (profile) => {
      profile.plan_regions[21].ring_vertex_ids = [...profile.plan_regions[20].ring_vertex_ids];
    });
    await expectRefusal("XG_REGION_OUTSIDE_ENVELOPE", "/plan_regions/23/ring_vertex_ids", (profile) => {
      profile.plan_regions[23].ring_vertex_ids = ["p-23-front", "p-outside", "p-24-rear", "p-23-rear", "p-23-front"];
      profile.plan_regions[23].area2_q16sq = 8_448;
    });
    await expectRefusal("XG_AREA_ACCOUNTING_MISMATCH", "/area_accounting", (profile) => {
      profile.plan_regions[20].ring_vertex_ids = ["p-20-front", "p-gap-front", "p-gap-rear", "p-20-rear", "p-20-front"];
      profile.plan_regions[20].area2_q16sq = 4_096;
      profile.spaces[0].area2_q16sq = 4_096;
    });
    await expectRefusal("XG_ENCLOSURE_GAP", "/wall_junctions/0/region_ref", (profile) => {
      profile.wall_junctions[0].region_ref = "region-missing";
    });
    await expectRefusal("XG_ENCLOSURE_OVERLAP", "/wall_runs", (profile) => {
      profile.wall_runs[1].start_vertex_id = "p-0-front";
      profile.wall_runs[1].end_vertex_id = "p-12-front";
    });
    await expectRefusal("XG_OPENING_HOST_MISSING", "/openings/0/host_wall_id", (profile) => {
      profile.openings[0].host_wall_id = "wall-missing";
    });
    await expectRefusal("XG_OPENING_HOST_MULTIPLE", "/openings/0/opening_id", (profile) => {
      profile.wall_runs[1].opening_ids.push("opening-entry");
    });
    await expectRefusal("XG_OPENING_OFFSET_INVALID", "/openings/0/offset_q16", (profile) => {
      profile.openings[0].offset_q16 = -1;
    });
    await expectRefusal("XG_OPENING_VERTICAL_INVALID", "/openings/0/head_q16", (profile) => {
      profile.openings[0].head_q16 = 111;
    });
    await expectRefusal("XG_OPENING_HANDING_INVALID", "/openings/1/handing", (profile) => {
      profile.openings[1].operation = "fixed";
      profile.openings[1].handing = "left";
    });
    await expectRefusal("XG_OPENING_ROOM_MISMATCH", "/openings/0/room_served_refs", (profile) => {
      profile.openings[0].room_served_refs = ["space-secondary", "exterior"];
    });
    await expectRefusal("XG_ROOF_DISCONTINUITY", "/roof_planes/1/edge_ids", (profile) => {
      profile.roof_edges[6].end_vertex_id = "roof-left-front";
    });
    await expectRefusal("XG_ROOF_TOPOLOGY_AMBIGUOUS", "/roof_edges/2", (profile) => {
      profile.roof_edges[2].adjacent_plane_ids = ["roof-left", "roof-right", "roof-left"];
    });
    await expectRefusal("XG_ROOF_PITCH_MISMATCH", "/roof_planes/0/pitch", (profile) => {
      profile.roof_planes[0].pitch = { rise: 1, run: 4 };
    });
    await expectRefusal("XG_ID_DUPLICATE", "/wall_runs/1/wall_id", (profile) => {
      profile.wall_runs[1].wall_id = "wall-0";
    });
    await expectRefusal("XG_ORDER_INVALID", "/plan_vertices/1/authored_order", (profile) => {
      profile.plan_vertices[1].authored_order = 0;
    });
    await expectRefusal("XG_PRECISION_INVALID", `/plan_vertices/${profileVertexIndex()}/x_q16`, (profile) => {
      profile.plan_vertices[profileVertexIndex()].x_q16 = 120.5;
    });
    await expectRefusal("XG_SHAPE_UNKNOWN_FIELD", "/scale_x", (profile) => {
      (profile as unknown as Record<string, unknown>).scale_x = -1;
    });
    await expectRefusal("XG_MATERIAL_SLOT_UNKNOWN", "/wall_runs/0/material_slot_refs/0", (profile) => {
      profile.wall_runs[0].material_slot_refs = ["material-missing"];
    });
    await expectRefusal("XG_GATE_STATUS_MISSING", "/professional_gates", (profile) => {
      profile.professional_gates[6].gate_id = "not-fire-wui" as never;
    });
    await expectRefusal("XG_BINDING_MODEL_MISMATCH", "/model_binding/model_id", (profile) => {
      profile.model_binding.model_id = "adu-y-998";
    });
    await expectRefusal("XG_DIGEST_MISMATCH", "/profile_digest", (profile) => {
      profile.provenance.attestation = "a stale digest must never pass";
    }, false);
  });
});

function profileVertexIndex(): number {
  return 54;
}
