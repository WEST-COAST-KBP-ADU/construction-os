import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

/*
 * PRODUCT2-WESTCOASTKBP-LIGHT-SURFACE-FINAL-REPAIR-0001
 *
 * This is the repository's automated contrast census for the Concept Studio's
 * primary action. Two things were wrong with it, and both are repaired here.
 *
 * 1. It resolved `--studio-accent-dark` and `--studio-ink` by regex-matching a
 *    six-digit hex inside the `.page` block. The executable declarations are
 *    `var(--color-shell)` and `var(--color-ink)`, which that regex cannot
 *    match, so the only hexes it found were two commented-out inert fixtures.
 *    The census was asserting AA against colours the product never painted,
 *    and it stayed green while the shipped control measured 1.00:1.
 *
 * 2. It measured resting and hover only, and it measured the label against its
 *    own fill only — never the fill against the surface the control sits on.
 *    A control can be perfectly legible internally and still be invisible.
 *
 * The census now resolves the effective chain — `--studio-*` in the Studio
 * module, through `--color-*`, to the canonical `:root` light lock in
 * `app/globals.css` — and measures all four interaction states across three
 * relationships: label on fill, fill against its surround, and the focus
 * indicator against both.
 */

const ROOT = process.cwd();
const stylesheet = readFileSync(
  resolve(ROOT, "src/components/studio/StudioWorkbench.module.css"),
  "utf8",
);
const globals = readFileSync(resolve(ROOT, "app/globals.css"), "utf8");
const workbench = readFileSync(
  resolve(ROOT, "src/components/studio/StudioWorkbench.tsx"),
  "utf8",
);

/** WCAG 2.x thresholds. */
const AA_TEXT = 4.5;
const AA_NON_TEXT = 3;

function hexToLuminance(hex: string): number {
  const channels = hex
    .replace("#", "")
    .match(/.{2}/g)
    ?.map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4,
    );

  if (!channels || channels.length !== 3) {
    throw new Error(`Expected a six-digit hex color, received ${hex}`);
  }

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(foreground: string, background: string): number {
  const foregroundLuminance = hexToLuminance(foreground);
  const backgroundLuminance = hexToLuminance(background);

  return (
    (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
    (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
  );
}

/**
 * The canonical light lock: the first `:root` block after the coherence-repair
 * marker comment. It is declared after the `prefers-color-scheme: dark` remap
 * at equal specificity, so it is what every public route actually resolves to
 * under either OS preference.
 */
function lightLockTokens(): Map<string, string> {
  const marker = globals.indexOf(
    "PRODUCT2-WESTCOASTKBP-LIGHT-SHELL-COHERENCE-REPAIR-0001",
  );

  if (marker < 0) {
    throw new Error("Could not locate the canonical light-lock marker");
  }

  const block = /:root\s*\{([\s\S]*?)\n\}/.exec(globals.slice(marker))?.[1];

  if (!block) throw new Error("Could not locate the canonical light lock");

  const tokens = new Map<string, string>();

  for (const [, name, value] of block.matchAll(
    /(--[a-z0-9-]+):\s*(#[0-9a-fA-F]{6});/g,
  )) {
    tokens.set(name, value.toLowerCase());
  }

  if (!tokens.has("--color-canvas")) {
    throw new Error("The light lock does not pin --color-canvas");
  }

  return tokens;
}

/** The `--studio-*` role declarations, as written in the `.page` block. */
function studioRoles(): Map<string, string> {
  const block = stylesheet.match(/\.page\s*\{([\s\S]*?)\n\}/)?.[1];

  if (!block) throw new Error("Could not locate the Studio `.page` block");

  const roles = new Map<string, string>();

  // Comments are stripped first: a commented-out declaration is a record, not
  // a value the browser resolves. This is the exact hole that let the old
  // census read two fixtures instead of the shipped colours.
  for (const [, name, value] of block
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .matchAll(/(--studio-[a-z0-9-]+):\s*([^;]+);/g)) {
    roles.set(name, value.trim());
  }

  return roles;
}

const LOCK = lightLockTokens();
const ROLES = studioRoles();

/** Resolve a `--studio-*` role to the hex the light system actually paints. */
function resolveStudioRole(role: string): string {
  const declaration = ROLES.get(role);

  if (!declaration) throw new Error(`Studio role ${role} is not declared`);

  const alias = declaration.match(/^var\((--[a-z0-9-]+)\)$/)?.[1];

  if (!alias) {
    if (/^#[0-9a-fA-F]{6}$/.test(declaration)) return declaration.toLowerCase();
    throw new Error(
      `Studio role ${role} must alias a global token, found "${declaration}"`,
    );
  }

  const value = LOCK.get(alias);

  if (!value) {
    throw new Error(
      `Studio role ${role} aliases ${alias}, which the light lock does not pin`,
    );
  }

  return value;
}

function rule(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = stylesheet.match(
    new RegExp(`\\n${escaped}\\s*\\{([\\s\\S]*?)\\n\\}`),
  )?.[1];

  if (!match) throw new Error(`Missing rule for ${selector}`);
  return match;
}

/**
 * The `--studio-*` role one property of a rule resolves to. Shorthands are
 * handled: `border: 1px solid var(--studio-accent-dark)` answers for `border`.
 */
function roleOf(ruleBody: string, property: string): string {
  const declaration = ruleBody.match(
    new RegExp(`(?:^|[\\s;])${property}:\\s*([^;]+);`),
  )?.[1];

  if (!declaration) {
    throw new Error(`This rule declares no ${property}`);
  }

  const role = declaration.match(/var\((--studio-[a-z0-9-]+)\)/)?.[1];

  if (!role) {
    throw new Error(
      `${property} must resolve a --studio-* role, found "${declaration.trim()}"`,
    );
  }

  return role;
}

describe("Studio comparison accessibility", () => {
  it("pins the primary action to a role the light lock actually resolves", () => {
    // The regression this census missed was a role collapse, not a literal.
    // `--studio-accent-dark` must not alias a shell ground again: on the light
    // system `--color-shell` is the same value as the rail the button sits on.
    expect(ROLES.get("--studio-accent-dark")).toBe("var(--color-ink)");
    expect(ROLES.get("--studio-accent-dark")).not.toBe("var(--color-shell)");

    for (const role of [
      "--studio-accent-dark",
      "--studio-action-ink",
      "--studio-action-hover",
      "--studio-action-active",
      "--studio-action-ring",
    ]) {
      expect(() => resolveStudioRole(role)).not.toThrow();
    }

    // The inert fixtures that made this file pass on fiction are gone. Checked
    // against the comment-stripped stylesheet: the comment above the roles
    // names both fixtures as a record of their removal, which is not a
    // restoration of them.
    const executable = stylesheet.replace(/\/\*[\s\S]*?\*\//g, "");

    expect(executable).not.toMatch(/--studio-accent-dark:\s*#/);
    expect(executable).not.toMatch(/--studio-ink:\s*#/);
  });

  it("keeps the comparison action visible and AA in all four interaction states", () => {
    // The surface the control sits on: `.compareRail` paints `--studio-canvas`.
    const surround = resolveStudioRole(roleOf(rule(".compareRail"), "background"));

    const restRule = rule(".compareButton");
    const hoverRule = rule(".compareButton:hover");
    const focusRule = rule(".compareButton:focus-visible");
    const activeRule = rule(".compareButton:active");

    const states = [
      { name: "rest", body: restRule },
      { name: "hover", body: hoverRule },
      { name: "active", body: activeRule },
    ] as const;

    for (const { name, body } of states) {
      const fill = resolveStudioRole(roleOf(body, "background"));
      const label = resolveStudioRole(roleOf(body, "color"));
      const border = resolveStudioRole(
        roleOf(body, name === "rest" ? "border" : "border-color"),
      );

      // 1.4.3 — the label must stay readable on its own fill.
      expect(
        contrastRatio(label, fill),
        `${name}: label on fill`,
      ).toBeGreaterThanOrEqual(AA_TEXT);

      // 1.4.11 — the control must be distinguishable from what surrounds it.
      // A filled control whose fill equals its surround is bare text, which is
      // exactly what shipped at 43e95bd.
      expect(
        Math.max(
          contrastRatio(fill, surround),
          contrastRatio(border, surround),
        ),
        `${name}: control against its surround`,
      ).toBeGreaterThanOrEqual(AA_NON_TEXT);
    }

    // Every state must be visibly different from the resting state, or the
    // state exists in the stylesheet without existing for the user.
    const restFill = resolveStudioRole(roleOf(restRule, "background"));

    for (const { name, body } of states.filter((state) => state.name !== "rest")) {
      expect(
        resolveStudioRole(roleOf(body, "background")),
        `${name}: fill must differ from rest`,
      ).not.toBe(restFill);
    }

    // 2.4.11 / 1.4.11 — the focus indicator must be visible against both the
    // control it outlines and the ground the outline offset exposes.
    const ringRole = focusRule.match(
      /outline:[^;]*var\((--studio-[a-z0-9-]+)\)/,
    )?.[1];

    expect(ringRole, "focus-visible must declare an outline colour role").toBeDefined();

    const ring = resolveStudioRole(ringRole!);

    expect(focusRule).toMatch(/outline-offset:/);
    expect(
      contrastRatio(ring, surround),
      "focus ring against the rail",
    ).toBeGreaterThanOrEqual(AA_NON_TEXT);
    expect(
      contrastRatio(ring, restFill),
      "focus ring against the resting fill",
    ).toBeGreaterThanOrEqual(AA_NON_TEXT);
  });

  it("holds the motion contract for the comparison action", () => {
    const reduced = stylesheet.match(
      /@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n\}/,
    )?.[1];

    expect(reduced).toContain(".compareButton");
  });

  it("connects the disclosure button to its conditional comparison panel", () => {
    expect(workbench).toMatch(
      /className=\{styles\.compareButton\}[\s\S]*?aria-expanded=\{comparisonOpen\}[\s\S]*?aria-controls="studio-comparison-panel"/,
    );
    expect(workbench).toMatch(
      /comparisonOpen\s*\?\s*\([\s\S]*?<section[\s\S]*?id="studio-comparison-panel"[\s\S]*?aria-labelledby="comparison-heading"/,
    );
    expect(workbench).toContain(
      "onClick={() => setComparisonOpen((open) => !open)}",
    );
    expect(workbench).toContain("onClick={() => setComparisonOpen(false)}");
    expect(workbench.match(/aria-controls="studio-comparison-panel"/g)).toHaveLength(1);
    expect(workbench.match(/id="studio-comparison-panel"/g)).toHaveLength(1);
  });
});
