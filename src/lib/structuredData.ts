/**
 * Structured data for search engines and AI assistants.
 * Derived from approved public copy in siteConfig only.
 */

import { siteConfig } from "./siteConfig";

const SERVICE_AREA = [
  "Roseville, CA",
  "Rocklin, CA",
  "Lincoln, CA",
  "Folsom, CA",
  "Granite Bay, CA",
  "El Dorado Hills, CA",
  "Citrus Heights, CA",
  "Sacramento Region, CA",
];

export function buildBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: siteConfig.name,
    url: siteConfig.url,
    slogan: siteConfig.tagline,
    description: siteConfig.description,
    areaServed: SERVICE_AREA.map((name) => ({ "@type": "City", name })),
    knowsAbout: siteConfig.services.map((service) => service.title),
  };
}

export function serializeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
