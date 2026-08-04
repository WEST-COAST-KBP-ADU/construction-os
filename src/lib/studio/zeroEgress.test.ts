import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const studioFiles = [
  "app/studio/page.tsx",
  "src/components/studio/StudioWorkbench.tsx",
  "src/lib/studio/studio.ts",
];

describe("studio zero-egress boundary", () => {
  it("contains no visitor-path network or capture primitives", () => {
    const source = studioFiles
      .map((path) => readFileSync(resolve(process.cwd(), path), "utf8"))
      .join("\n");

    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).not.toMatch(/XMLHttpRequest|WebSocket|EventSource|sendBeacon/);
    expect(source).not.toMatch(/localStorage|sessionStorage|document\.cookie/);
    expect(source).not.toMatch(/<form\b|type=["']email["']|type=["']tel["']/);
    expect(source).not.toMatch(/https?:\/\//);
  });
});
