/**
 * Structured data (JSON-LD) for search engines and AI assistants.
 *
 * Derived STRICTLY from approved public copy in siteConfig plus the
 * owner-confirmed service area (governance charter). No pricing, no schedule,
 * no permit/feasibility claims, no contact collection — mirrors the site's
 * preview boundaries.
 */

import { siteConfig } from "./siteConfig";

/** Owner-confirmed target markets (governance/charter.md). Labels only. */
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
    knowsAbout: siteConfig.services.map((s) => s.title),
  };
}

/**
 * Serialize JSON-LD for a <script> tag. Escapes `<` to prevent the payload
 * from ever closing the script context (XSS hardening per Next.js guidance).
 */
export function serializeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
