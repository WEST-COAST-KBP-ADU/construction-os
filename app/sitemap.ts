import type { MetadataRoute } from "next";

import { getPublishedSitemapEntries } from "@/src/lib/routes";
import { siteConfig } from "@/src/lib/siteConfig";

export default function sitemap(): MetadataRoute.Sitemap {
  return getPublishedSitemapEntries(siteConfig.url);
}
