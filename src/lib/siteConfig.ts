/**
 * Central, static configuration for the West Coast KBP public site shell.
 *
 * This is the single source of truth for public-facing copy. It intentionally
 * contains no backend wiring, no form endpoints, and no PII. Compliance-
 * sensitive strings (CSLB license, disclaimer) live here so they are easy to
 * review and update in one place.
 */

export type NavLink = {
  label: string;
  href: string;
};

export type ServicePreviewItem = {
  title: string;
  description: string;
};

export const siteConfig = {
  name: "West Coast KBP",
  tagline: "California ADU & Residential Construction",
  description:
    "Clear, managed construction projects for ADUs and residential builds across the Sacramento area and Northern California.",

  // In-page anchors only — no external routes or backend in this shell.
  nav: [
    { label: "Services", href: "#services" },
    { label: "Service areas", href: "#service-areas" },
    { label: "Feasibility review", href: "#feasibility-review" },
  ] satisfies NavLink[],

  hero: {
    eyebrow: "California ADU & Residential Construction",
    heading: "Clear, managed construction projects",
    subheading:
      "West Coast KBP helps property owners plan and deliver ADUs, garage conversions, and residential construction with an organized, transparent process from first review to handover.",
    // CTA is an in-page link to the feasibility-review section. No form, no
    // submission handling, and no data is collected in this shell.
    ctaLabel: "Request a feasibility review",
    ctaHref: "#feasibility-review",
  },

  services: [
    {
      title: "ADU planning",
      description:
        "Early planning support for accessory dwelling units, from concept and layout to a documented path toward jurisdiction review.",
    },
    {
      title: "Garage conversions",
      description:
        "Turning existing garage space into livable square footage with a clear, managed scope of work.",
    },
    {
      title: "Residential construction",
      description:
        "Coordinated residential construction projects delivered with structured scheduling and communication.",
    },
    {
      title: "Feasibility review",
      description:
        "A structured first look at what a project may involve before committing to design or construction.",
    },
  ] satisfies ServicePreviewItem[],

  serviceAreas: ["Sacramento area", "Northern California"],

  cta: {
    label: "Request a feasibility review",
    // Placeholder note shown alongside the CTA. There is no form yet, so this
    // sets clear expectations and keeps the shell free of PII collection.
    note: "Online requests are not available yet. This is a placeholder for an upcoming feasibility review intake — no information is collected on this site at this time.",
  },

  footer: {
    // CSLB license is a placeholder until the official number is supplied.
    cslbLicense: "CSLB License #: [INSERT LICENSE NUMBER]",
    disclaimer:
      "Information on this website is general only. ADU, SB 9, zoning, permit, structural, electrical, plumbing, and code conclusions require official jurisdiction review and licensed professional verification before construction.",
    noGuarantees:
      "No guaranteed pricing, permits, or timelines. Project scope, cost, and schedule are confirmed only after official review.",
  },
} as const;

export type SiteConfig = typeof siteConfig;
