import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, expect, it } from "vitest";

import DevelopmentNotice from "../components/DevelopmentNotice";

import { siteConfig } from "./siteConfig";

describe("development-preview release surface (WORK-ORDER-005)", () => {
  it("configures the exact label, primary message, and supporting statement", () => {
    expect(siteConfig.developmentNotice.label).toBe("Development preview");
    expect(siteConfig.developmentNotice.message).toBe(
      "This platform is under active development and is provided for testing and review only.",
    );
    expect(siteConfig.developmentNotice.supporting).toBe(
      "Live intake, submissions, customer accounts, and external actions are not enabled.",
    );
  });

  it("renders all three configured parts from siteConfig, with no contact surface", () => {
    const html = renderToStaticMarkup(createElement(DevelopmentNotice));

    expect(html).toContain(siteConfig.developmentNotice.label);
    expect(html).toContain(siteConfig.developmentNotice.message);
    expect(html).toContain(siteConfig.developmentNotice.supporting);

    expect(html).not.toMatch(/<form|<input|<textarea|<select|<button/i);
    expect(html).not.toMatch(/tel:|mailto:/i);
    expect(html).not.toMatch(/\(\d{3}\)\s?\d{3}[- ]?\d{4}|\b\d{3}[-.]\d{3}[-.]\d{4}\b/);
  });

  it("keeps every configured sentence of the release truth byte-exact", () => {
    // P2-PRESENTATION-CHROME-0001 mutation probe 3: calming the presentation
    // must never cost a configured sentence. Dropping, shortening, truncating,
    // or euphemizing any part of the release status must fail here.
    const html = renderToStaticMarkup(createElement(DevelopmentNotice));
    const text = html.replace(/<[^>]*>/g, "");
    const { label, message, supporting } = siteConfig.developmentNotice;

    for (const sentence of [label, message, supporting]) {
      expect(text).toContain(sentence);
    }

    // The non-enablement statement is the load-bearing half of the truth.
    expect(supporting).toContain("Live intake");
    expect(supporting).toContain("submissions");
    expect(supporting).toContain("customer accounts");
    expect(supporting).toContain("external actions");
    expect(supporting).toContain("are not enabled");

    // Nothing is collapsed behind a toggle, truncated, or hidden from
    // assistive technology.
    expect(html).not.toMatch(/<details|hidden|aria-hidden|…|\.\.\.<\//i);
    expect(html).toMatch(/role="note"/);
  });

  it("renders the release status as one calm line, never a plaque", () => {
    const html = renderToStaticMarkup(createElement(DevelopmentNotice));

    // Mutation probe 4 at the markup layer: the label stays sentence case in
    // configuration and carries no badge, pill, or alert semantics.
    expect(siteConfig.developmentNotice.label).not.toBe(
      siteConfig.developmentNotice.label.toUpperCase(),
    );
    expect(html).not.toMatch(/role="alert"|aria-live|class="[^"]*(?:badge|pill|banner|alert)/i);
    expect(html).toContain("development-notice__inner");
  });

  it("is mounted in the root layout before the global header", () => {
    const layout = readFileSync(resolve(process.cwd(), "app/layout.tsx"), "utf8");

    const noticeIndex = layout.indexOf("<DevelopmentNotice />");
    const headerIndex = layout.indexOf("<Header />");

    expect(noticeIndex).toBeGreaterThan(-1);
    expect(headerIndex).toBeGreaterThan(-1);
    expect(noticeIndex).toBeLessThan(headerIndex);
  });
});
