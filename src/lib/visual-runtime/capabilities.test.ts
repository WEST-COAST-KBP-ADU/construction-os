import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  ClientOnlyCapabilityError,
  visualCapabilityIds,
  visualRuntimeCapabilities,
} from "@/src/lib/visual-runtime/capabilities";

const require = createRequire(import.meta.url);

const packageJson = JSON.parse(
  readFileSync(resolve(process.cwd(), "package.json"), "utf8"),
) as {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
};

const pinnedDependencies = {
  motion: "13.1.0",
  gsap: "3.15.0",
  "@rive-app/react-webgl2": "4.31.0",
  three: "0.185.1",
  "@react-three/fiber": "9.7.0",
  "@react-three/drei": "10.7.8",
} as const;

const pinnedDevDependencies = {
  "@types/three": "0.185.4",
} as const;

describe("pinned visual runtime dependencies", () => {
  it.each(Object.entries(pinnedDependencies))(
    "declares %s at exactly %s",
    (name, version) => {
      expect(packageJson.dependencies[name]).toBe(version);
    },
  );

  it.each(Object.entries(pinnedDevDependencies))(
    "declares dev dependency %s at exactly %s",
    (name, version) => {
      expect(packageJson.devDependencies[name]).toBe(version);
    },
  );

  it("installs the pinned version of every package", () => {
    for (const [name, version] of [
      ...Object.entries(pinnedDependencies),
      ...Object.entries(pinnedDevDependencies),
    ]) {
      // Read the manifest from disk rather than requiring it: `three` does not
      // expose `./package.json` through its `exports` map.
      const installed = JSON.parse(
        readFileSync(
          resolve(process.cwd(), "node_modules", name, "package.json"),
          "utf8",
        ),
      ) as { version: string };

      expect(installed.version, `${name} is not installed at its pin`).toBe(
        version,
      );
    }
  });

  it("coexists with the pinned React and Next.js versions", () => {
    expect(packageJson.dependencies.react).toBe("19.2.4");
    expect(packageJson.dependencies["react-dom"]).toBe("19.2.4");
    expect(packageJson.dependencies.next).toBe("16.2.4");
  });
});

describe("capability registry", () => {
  it("exposes exactly the declared capability ids", () => {
    expect(Object.keys(visualRuntimeCapabilities)).toEqual([
      ...visualCapabilityIds,
    ]);
  });

  it("keys every capability by its own id", () => {
    for (const id of visualCapabilityIds) {
      expect(visualRuntimeCapabilities[id].id).toBe(id);
    }
  });

  it("resolves every declared specifier without importing it", () => {
    for (const id of visualCapabilityIds) {
      for (const specifier of visualRuntimeCapabilities[id].specifiers) {
        expect(() => require.resolve(specifier)).not.toThrow();
      }
    }
  });

  it("marks the heavy capabilities client-only", () => {
    expect(visualRuntimeCapabilities["rive-webgl2"].environment).toBe(
      "client-only",
    );
    expect(visualRuntimeCapabilities["three-r3f-drei"].environment).toBe(
      "client-only",
    );
  });
});

describe("motion", () => {
  it("resolves its React entrypoint", async () => {
    const motion = await visualRuntimeCapabilities.motion.load();

    // `motion` is a callable proxy in Motion 13; element factories hang off it.
    expect(typeof motion.motion).toBe("function");
    expect(motion.motion.div).toBeDefined();
    expect(typeof motion.AnimatePresence).toBe("function");
    expect(typeof motion.useReducedMotion).toBe("function");
  });
});

describe("gsap", () => {
  it("resolves core and ScrollTrigger", async () => {
    const { gsap, ScrollTrigger } = await visualRuntimeCapabilities.gsap.load();

    expect(typeof gsap.timeline).toBe("function");
    expect(typeof gsap.registerPlugin).toBe("function");
    expect(typeof ScrollTrigger).toBe("function");
  });

  it("does not register ScrollTrigger during server evaluation", async () => {
    const { gsap } = await visualRuntimeCapabilities.gsap.load();

    // `core.globals()` is the registration ledger. GSAP ships no type for it,
    // so narrow it here rather than widening the capability module's types.
    const registry = gsap as unknown as {
      core: { globals: () => Record<string, unknown> };
    };

    expect(Object.keys(registry.core.globals())).not.toContain("ScrollTrigger");
  });

  it("creates no browser globals during server evaluation", async () => {
    await visualRuntimeCapabilities.gsap.load();

    expect(typeof globalThis.window).toBe("undefined");
    expect(typeof globalThis.document).toBe("undefined");
  });
});

describe("client-only capabilities", () => {
  it.each(["rive-webgl2", "three-r3f-drei"] as const)(
    "fails closed when %s is loaded outside a browser",
    async (id) => {
      await expect(visualRuntimeCapabilities[id].load()).rejects.toBeInstanceOf(
        ClientOnlyCapabilityError,
      );
    },
  );

  it("names the capability that failed closed", async () => {
    await expect(
      visualRuntimeCapabilities["three-r3f-drei"].load(),
    ).rejects.toMatchObject({
      name: "ClientOnlyCapabilityError",
      capabilityId: "three-r3f-drei",
    });
  });
});
