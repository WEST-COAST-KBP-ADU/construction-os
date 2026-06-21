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

export type PreviewStep = {
  title: string;
  description: string;
};

export const siteConfig = {
  name: "West Coast KBP",
  tagline: "California ADU & Residential Construction Platform",
  description:
    "Pre-launch platform preview for address-first ADU, garage conversion, property planning, and residential construction conversations in California.",

  // In-page anchors only — no external routes or backend in this shell.
  nav: [
    { label: "Preview", href: "#platform-preview" },
    { label: "Trust", href: "#trust-preview" },
    { label: "Launch status", href: "#launch-status" },
  ] satisfies NavLink[],

  hero: {
    eyebrow: "Pre-launch platform preview",
    heading: "California ADU & Residential Construction Platform",
    subheading:
      "West Coast KBP is preparing an address-first platform preview for ADU, garage conversion, property planning, and construction execution conversations. Early feasibility language is preliminary, human-gated, and requires official jurisdiction verification and licensed professional review before any construction commitment.",
    direction:
      "Future reviews start with property context and project goals, but WEB-002a does not include an address field, contact form, appointment path, or live intake.",
    primaryCtaLabel: "Explore preliminary ADU feasibility",
    primaryCtaHref: "#preliminary-review",
    secondaryCtaLabel: "Preview the platform flow",
    secondaryCtaHref: "#platform-preview",
  },

  platformPreview: [
    {
      title: "Address-first intake concept",
      description:
        "The platform direction begins with property context and owner goals before discussing ADU, garage conversion, or residential construction paths. No address input is active on this page.",
    },
    {
      title: "Preliminary feasibility estimate",
      description:
        "Future reviews may frame early constraints and planning questions as a non-binding preliminary feasibility estimate, not a quote, contract, permit answer, code answer, final design, or construction commitment.",
    },
    {
      title: "Candidate options",
      description:
        "Candidate options are discussion paths that require official jurisdiction verification and licensed professional review before they can guide design, pricing, scheduling, or construction.",
    },
    {
      title: "Human review gate",
      description:
        "A human review must occur before any construction commitment. Software previews, checklists, or mockups do not create authority to proceed.",
    },
  ] satisfies ServicePreviewItem[],

  preliminaryReview: [
    {
      title: "Planning conversation",
      description:
        "A future preliminary feasibility review may discuss project goals, property context, likely constraints, and candidate options.",
    },
    {
      title: "Official verification",
      description:
        "ADU, zoning, SB 9, SB 10, permit, and jurisdiction questions require official jurisdiction verification before they can guide decisions.",
    },
    {
      title: "Licensed review",
      description:
        "Construction, structural, electrical, plumbing, code, and permit matters require licensed professional review before any construction commitment.",
    },
  ] satisfies PreviewStep[],

  trustPreview: [
    {
      title: "CSLB license placeholder",
      description:
        "CSLB License #: [INSERT LICENSE NUMBER]. License display is pending Owner-verified CSLB language.",
    },
    {
      title: "Owner-approved proof only",
      description:
        "Project proof will appear only after Owner verification. No project count, rating, badge, award, ranking, or client detail is published in WEB-002a.",
    },
    {
      title: "Sanitized project photos placeholder",
      description:
        "Sanitized project photo module reserved for Owner-reviewed assets without exact addresses, identifying details, client data, or location metadata.",
    },
    {
      title: "Review and testimonial placeholder",
      description:
        "Review and testimonial block pending Owner-reviewed sources, exact wording, permission, and publication review.",
    },
    {
      title: "Process clarity",
      description:
        "The public structure is planning conversation, preliminary feasibility review, official verification, licensed professional review, then human review before any construction commitment.",
    },
    {
      title: "Human review gate",
      description:
        "Human review before any construction commitment remains the core trust signal for this pre-launch page.",
    },
  ] satisfies PreviewStep[],

  launchStatus: {
    heading: "Contact activation coming after launch approval",
    note: "This is a pre-launch platform preview. Call, contact, address intake, lead capture, appointment booking, and report request features are not active in WEB-002a.",
    ctas: [
      {
        label: "Explore preliminary ADU feasibility",
        href: "#preliminary-review",
      },
      {
        label: "Preview the platform flow",
        href: "#platform-preview",
      },
    ] satisfies NavLink[],
    disabledLabel: "Contact activation coming after launch approval",
    microcopy:
      "No address, phone number, email, project data, appointment request, or file is collected here.",
  },

  footer: {
    cslbLicense: "CSLB License #: [INSERT LICENSE NUMBER]",
    shortCaveat:
      "Pre-launch platform preview only. Preliminary feasibility review and candidate options require official jurisdiction verification, licensed professional review, and human review before any construction commitment.",
    aduDisclaimer:
      "ADU, zoning, SB 9, and SB 10 information on this pre-launch platform preview is general planning context only. Property-specific conclusions require official jurisdiction verification and licensed professional review. Any preliminary feasibility review or preliminary feasibility estimate is non-binding and must be checked by a human before any construction commitment.",
    permitDisclaimer:
      "Permit paths and jurisdiction requirements vary by property, scope, and local review. This page does not make a property-specific ADU conclusion or confirm permit outcome. Any candidate options require official jurisdiction verification before they can guide design, pricing, scheduling, or construction.",
    professionalReviewDisclaimer:
      "License information is a placeholder until the Owner provides verified CSLB display language for publication. Construction, structural, electrical, plumbing, code, and permit matters require licensed professional review before any construction commitment.",
    previewDisclaimer:
      "Any visual, flow, report, checklist, or platform screen shown in WEB-002a is a pre-launch platform preview or mockup. It is not an active generated report, construction drawing, site plan, survey, design document, permit submittal, or official jurisdiction response.",
    leadCaptureDisclaimer:
      "This is a pre-launch platform preview. Call, contact, address intake, lead capture, appointment booking, and report request features are not active in WEB-002a. Placeholder CTAs may preview future flows, but they do not collect PII or submit information.",
    disclaimer:
      "No guarantee is made on pricing, timeline, permit, zoning, ADU, SB 9, SB 10, structural, electrical, plumbing, or code outcome.",
    noGuarantees:
      "Pricing, schedule, design, permit review, and construction path depend on property conditions, scope, official review, material availability, trade coordination, and licensed professional input.",
  },
} as const;

export type SiteConfig = typeof siteConfig;
