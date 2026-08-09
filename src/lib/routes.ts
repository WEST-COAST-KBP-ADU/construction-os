import type { MetadataRoute } from "next";

import { servicePages } from "@/src/lib/contentPages";
import { jurisdictionPages } from "@/src/lib/jurisdictionPages";

export const publicRouteJobs = [
  "Acquisition",
  "Trust",
  "Qualification",
  "Handoff",
] as const;

export type PublicRouteJob = (typeof publicRouteJobs)[number];

export const publicRoutePublicationStates = ["published", "gated"] as const;

export type PublicRoutePublicationState =
  (typeof publicRoutePublicationStates)[number];

export type SitemapRouteMetadata = Pick<
  MetadataRoute.Sitemap[number],
  "changeFrequency" | "priority"
>;

export type PublicRoutePath =
  | "/"
  | "/about"
  | "/adu-builder/[jurisdiction]"
  | "/compare"
  | "/faq"
  | "/process"
  | "/services/[slug]"
  | "/studio";

export type DynamicSegment =
  | {
      readonly source: "none";
    }
  | {
      readonly source: "servicePages";
      readonly parameter: "slug";
    }
  | {
      readonly source: "jurisdictionPages";
      readonly parameter: "jurisdiction";
    };

export type PublicRoute = {
  readonly path: PublicRoutePath;
  readonly primaryJob: PublicRouteJob;
  readonly publicationState: PublicRoutePublicationState;
  readonly dynamicSegment: DynamicSegment;
  readonly sitemap: SitemapRouteMetadata;
};

export const publicRouteRegistry = [
  {
    path: "/",
    primaryJob: "Acquisition",
    publicationState: "published",
    dynamicSegment: { source: "none" },
    sitemap: { changeFrequency: "weekly", priority: 1 },
  },
  {
    path: "/studio",
    primaryJob: "Qualification",
    publicationState: "published",
    dynamicSegment: { source: "none" },
    sitemap: { changeFrequency: "monthly", priority: 0.8 },
  },
  {
    path: "/about",
    primaryJob: "Trust",
    publicationState: "published",
    dynamicSegment: { source: "none" },
    sitemap: { changeFrequency: "monthly", priority: 0.7 },
  },
  {
    path: "/compare",
    primaryJob: "Qualification",
    publicationState: "published",
    dynamicSegment: { source: "none" },
    sitemap: { changeFrequency: "monthly", priority: 0.7 },
  },
  {
    path: "/process",
    primaryJob: "Trust",
    publicationState: "published",
    dynamicSegment: { source: "none" },
    sitemap: { changeFrequency: "monthly", priority: 0.8 },
  },
  {
    path: "/faq",
    primaryJob: "Trust",
    publicationState: "published",
    dynamicSegment: { source: "none" },
    sitemap: { changeFrequency: "monthly", priority: 0.8 },
  },
  {
    path: "/services/[slug]",
    primaryJob: "Acquisition",
    publicationState: "published",
    dynamicSegment: { source: "servicePages", parameter: "slug" },
    sitemap: { changeFrequency: "monthly", priority: 0.8 },
  },
  {
    path: "/adu-builder/[jurisdiction]",
    primaryJob: "Qualification",
    publicationState: "published",
    dynamicSegment: {
      source: "jurisdictionPages",
      parameter: "jurisdiction",
    },
    sitemap: { changeFrequency: "monthly", priority: 0.8 },
  },
] as const satisfies readonly PublicRoute[];

type DynamicRouteData = {
  readonly slug: string;
};

const dynamicRouteData = {
  servicePages,
  jurisdictionPages,
} as const satisfies Record<
  Exclude<DynamicSegment["source"], "none">,
  readonly DynamicRouteData[]
>;

export function expandRoutePaths(route: PublicRoute): string[] {
  const { dynamicSegment } = route;

  if (dynamicSegment.source === "none") {
    return [route.path];
  }

  return dynamicRouteData[dynamicSegment.source].map((page) =>
    route.path.replace(`[${dynamicSegment.parameter}]`, page.slug),
  );
}

export function toPublicRouteUrl(path: string, siteUrl: string): string {
  return path === "/" ? siteUrl : new URL(path, siteUrl).toString();
}

export function getPublishedSitemapEntries(
  siteUrl: string,
): MetadataRoute.Sitemap {
  return publicRouteRegistry.flatMap((route) => {
    if (route.publicationState !== "published") {
      return [];
    }

    return expandRoutePaths(route).map((path) => ({
      url: toPublicRouteUrl(path, siteUrl),
      lastModified: new Date(),
      ...route.sitemap,
    }));
  });
}
