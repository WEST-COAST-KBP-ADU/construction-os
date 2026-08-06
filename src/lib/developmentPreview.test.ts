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

  it("is mounted in the root layout before the global header", () => {
    const layout = readFileSync(resolve(process.cwd(), "app/layout.tsx"), "utf8");

    const noticeIndex = layout.indexOf("<DevelopmentNotice />");
    const headerIndex = layout.indexOf("<Header />");

    expect(noticeIndex).toBeGreaterThan(-1);
    expect(headerIndex).toBeGreaterThan(-1);
    expect(noticeIndex).toBeLessThan(headerIndex);
  });
});
