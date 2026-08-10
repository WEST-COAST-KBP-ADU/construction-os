import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";

import { describe, expect, it } from "vitest";

import { servicePages } from "./contentPages";
import { jurisdictionPages } from "./jurisdictionPages";
import { PUBLIC_MODEL_IDS } from "./publicModelCatalog";
import {
  expandRoutePaths,
  getPublishedSitemapEntries,
  publicRouteRegistry,
  toPublicRouteUrl,
} from "./routes";
import { siteConfig } from "./siteConfig";

const appRoot = resolve(process.cwd(), "app");
const sitemapSource = readFileSync(join(appRoot, "sitemap.ts"), "utf8");

const expectedRegistryPaths = [
  "/",
  "/models",
  "/models/[model]",
  "/studio",
  "/service-areas",
  "/about",
  "/compare",
  "/process",
  "/faq",
  "/services/[slug]",
  "/adu-builder/[jurisdiction]",
];

const expectedBaseSitemapUrls = [
  siteConfig.url,
  toPublicRouteUrl("/models", siteConfig.url),
  ...PUBLIC_MODEL_IDS.map((modelId) =>
    toPublicRouteUrl("/models/" + modelId, siteConfig.url),
  ),
  toPublicRouteUrl("/studio", siteConfig.url),
  toPublicRouteUrl("/service-areas", siteConfig.url),
  toPublicRouteUrl("/about", siteConfig.url),
  toPublicRouteUrl("/compare", siteConfig.url),
  toPublicRouteUrl("/process", siteConfig.url),
  toPublicRouteUrl("/faq", siteConfig.url),
  ...servicePages.map((page) =>
    toPublicRouteUrl(`/services/${page.slug}`, siteConfig.url),
  ),
  ...jurisdictionPages.map((page) =>
    toPublicRouteUrl(`/adu-builder/${page.slug}`, siteConfig.url),
  ),
];

function pageFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      return pageFiles(path);
    }

    return entry.name === "page.tsx" ? [path] : [];
  });
}

function routePathForPage(pageFile: string): string {
  const directory = relative(appRoot, dirname(pageFile));

  return directory === "" ? "/" : `/${directory.split(sep).join("/")}`;
}

const filesystemRoutePaths = pageFiles(appRoot)
  .map(routePathForPage)
  .sort();

describe("public route registry", () => {
  it("keeps every published public route pattern in the registry", () => {
    expect(publicRouteRegistry.map((route) => route.path)).toEqual(
      expectedRegistryPaths,
    );
  });

  it("maps every registry entry to an existing app page", () => {
    for (const route of publicRouteRegistry) {
      expect(filesystemRoutePaths).toContain(route.path);
    }
  });

  it("leaves no filesystem page outside the registry", () => {
    expect(filesystemRoutePaths).toEqual([...expectedRegistryPaths].sort());
  });

  it("derives the sitemap URL set from the published registry", () => {
    const sitemapUrls = getPublishedSitemapEntries(siteConfig.url).map(
      (entry) => String(entry.url),
    );
    const registryUrls = publicRouteRegistry
      .filter((route) => route.publicationState === "published")
      .flatMap((route) => expandRoutePaths(route))
      .map((path) => toPublicRouteUrl(path, siteConfig.url));

    expect(sitemapUrls).toEqual(expectedBaseSitemapUrls);
    expect(new Set(sitemapUrls)).toEqual(new Set(registryUrls));
    expect(sitemapSource).toContain(
      'import { getPublishedSitemapEntries } from "@/src/lib/routes";',
    );
    expect(sitemapSource).toContain(
      "return getPublishedSitemapEntries(siteConfig.url);",
    );
  });

  it("keeps gated or unpublished routes out of the sitemap", () => {
    const sitemapUrls = getPublishedSitemapEntries(siteConfig.url).map(
      (entry) => String(entry.url),
    );

    for (const route of publicRouteRegistry.filter(
      (entry) => entry.publicationState !== "published",
    )) {
      for (const path of expandRoutePaths(route)) {
        expect(sitemapUrls).not.toContain(
          toPublicRouteUrl(path, siteConfig.url),
        );
      }
    }
  });

  it("expands dynamic routes only from their declared data source", () => {
    const dynamicRoutes = publicRouteRegistry.filter(
      (route) => route.dynamicSegment.source !== "none",
    );

    expect(
      dynamicRoutes.map((route) => ({
        path: route.path,
        source: route.dynamicSegment.source,
        parameter:
          route.dynamicSegment.source === "none"
            ? undefined
            : route.dynamicSegment.parameter,
      })),
    ).toEqual([
      {
        path: "/models/[model]",
        source: "publicModelCatalog",
        parameter: "model",
      },
      {
        path: "/services/[slug]",
        source: "servicePages",
        parameter: "slug",
      },
      {
        path: "/adu-builder/[jurisdiction]",
        source: "jurisdictionPages",
        parameter: "jurisdiction",
      },
    ]);
    expect(expandRoutePaths(dynamicRoutes[0]!)).toEqual(
      PUBLIC_MODEL_IDS.map((modelId) => "/models/" + modelId),
    );
    expect(expandRoutePaths(dynamicRoutes[1]!)).toEqual(
      servicePages.map((page) => "/services/" + page.slug),
    );
    expect(expandRoutePaths(dynamicRoutes[2]!)).toEqual(
      jurisdictionPages.map((page) => "/adu-builder/" + page.slug),
    );
  });

  it("does not rely on missing route files", () => {
    for (const route of publicRouteRegistry) {
      const pagePath =
        route.path === "/"
          ? join(appRoot, "page.tsx")
          : join(appRoot, route.path.slice(1), "page.tsx");

      expect(existsSync(pagePath)).toBe(true);
    }
  });

  it("keeps the new public route families self-canonical", () => {
    const modelsPage = readFileSync(join(appRoot, "models/page.tsx"), "utf8");
    const modelDetailPage = readFileSync(join(appRoot, "models/[model]/page.tsx"), "utf8");
    const serviceAreasPage = readFileSync(join(appRoot, "service-areas/page.tsx"), "utf8");

    expect(modelsPage).toContain('canonical: "/models"');
    expect(modelDetailPage).toContain("canonical:");
    expect(modelDetailPage).toContain("model.modelId");
    expect(serviceAreasPage).toContain('canonical: "/service-areas"');
  });
});
