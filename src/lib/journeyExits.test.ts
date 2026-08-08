import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  journeyExitDestinations,
  journeyExitRoutes,
  journeyExits,
  journeyExitTruthBoundary,
  type JourneyExitRoute,
} from "./journeyExits";

const component = readFileSync(
  resolve(process.cwd(), "src/components/content/JourneyExit.tsx"),
  "utf8",
);

const routeSources: Record<JourneyExitRoute, string> = {
  process: readFileSync(resolve(process.cwd(), "app/process/page.tsx"), "utf8"),
  faq: readFileSync(resolve(process.cwd(), "app/faq/page.tsx"), "utf8"),
  studio: readFileSync(resolve(process.cwd(), "app/studio/page.tsx"), "utf8"),
};

const expectedActions = {
  process: {
    primary: { label: "Open Concept Studio", href: "/studio" },
    secondary: { label: "Review common questions", href: "/faq" },
  },
  faq: {
    primary: { label: "Open Concept Studio", href: "/studio" },
    secondary: { label: "See the ADU process", href: "/process" },
  },
  studio: {
    primary: { label: "See the ADU process", href: "/process" },
    secondary: { label: "Review common questions", href: "/faq" },
  },
} as const;

describe("JOURNEY-EXIT-001 contract", () => {
  it("defines the exact route-specific primary and secondary actions", () => {
    expect(journeyExitRoutes).toEqual(["process", "faq", "studio"]);
    expect(Object.keys(journeyExits)).toEqual(journeyExitRoutes);

    for (const route of journeyExitRoutes) {
      const journeyExit = journeyExits[route];

      expect(journeyExit.primary).toEqual(expectedActions[route].primary);
      expect(journeyExit.secondary).toEqual(expectedActions[route].secondary);
      expect(journeyExit.primary.href).not.toBe(`/${route}`);
      expect(journeyExit.secondary.href).not.toBe(`/${route}`);
      expect(journeyExit.primary.href).not.toBe(journeyExit.secondary.href);
      expect(journeyExit.primary.label).not.toBe("Learn more");
      expect(journeyExit.secondary.label).not.toBe("Learn more");
    }
  });

  it("limits every action to the three existing public destinations", () => {
    expect(journeyExitDestinations).toEqual(["/studio", "/process", "/faq"]);

    const allowed = new Set<string>(journeyExitDestinations);
    const actions = journeyExitRoutes.flatMap((route) => [
      journeyExits[route].primary,
      journeyExits[route].secondary,
    ]);

    expect(actions).toHaveLength(6);
    expect(actions.every((action) => allowed.has(action.href))).toBe(true);
    expect(actions.map((action) => action.href)).not.toContain("/start");
    expect(actions.map((action) => action.href)).not.toContain("/models");
  });

  it("repeats the complete anonymous Studio truth boundary on every route", () => {
    expect(journeyExitTruthBoundary).toContain("anonymous");
    expect(journeyExitTruthBoundary).toContain("does not evaluate a parcel");

    for (const excludedConclusion of [
      "eligibility",
      "buildability",
      "permit",
      "price",
      "schedule",
    ]) {
      expect(journeyExitTruthBoundary).toContain(excludedConclusion);
    }

    for (const route of journeyExitRoutes) {
      expect(journeyExits[route].boundary).toBe(journeyExitTruthBoundary);
    }
  });

  it("renders a server-only semantic block with primary-first keyboard order", () => {
    expect(component).not.toContain('"use client"');
    expect(component).toContain("aria-labelledby={journeyExit.headingId}");
    expect(component).toContain("id={journeyExit.headingId}");
    expect(component).toContain('className="content-section content-section--muted"');
    expect(component).toContain('className="content-section__intro editorial-copy"');
    expect(component).toContain('className="cta-actions"');
    expect(component.match(/className="button button--primary"/g)).toHaveLength(1);
    expect(component.match(/className="button button--secondary"/g)).toHaveLength(1);
    expect(component.indexOf("journeyExit.primary.href")).toBeLessThan(
      component.indexOf("journeyExit.secondary.href"),
    );
    expect(component).not.toMatch(/<(?:form|input|textarea|select)\b/i);
  });

  it("wires exactly one final block to each route with unique ARIA linkage", () => {
    const primaryMarkers: Record<JourneyExitRoute, string> = {
      process: "<FaqSection items={processPage.faq} />",
      faq: "{faqPage.groups.map",
      studio: "<StudioWorkbench />",
    };

    for (const route of journeyExitRoutes) {
      const source = routeSources[route];
      const invocation = `<JourneyExit route="${route}" />`;

      expect(source.match(new RegExp(invocation.replace("/>", "\\s*/>"), "g"))).toHaveLength(1);
      expect(source.indexOf(primaryMarkers[route])).toBeLessThan(source.indexOf(invocation));
      expect(source.indexOf(invocation)).toBeLessThan(source.lastIndexOf("</main>"));
      expect(journeyExits[route].headingId).toBe(`journey-exit-${route}-heading`);
    }

    expect(new Set(journeyExitRoutes.map((route) => journeyExits[route].headingId)).size).toBe(3);
  });
});
