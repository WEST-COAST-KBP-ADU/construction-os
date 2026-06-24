/**
 * Central static configuration for the West Coast KBP public site.
 *
 * The current homepage is Check My Lot v0.1: frontend-only controlled intake
 * groundwork. There are no backend endpoints, external API calls, analytics
 * integrations, email/SMS sends, scheduling actions, or automatic decisions.
 */

export type NavLink = {
  label: string;
  href: string;
};

export type TrustItem = {
  title: string;
  detail: string;
};

export type AduTypeCard = {
  title: string;
  description: string;
};

export type OptionItem = {
  label: string;
  value: string;
};

export const siteConfig = {
  name: "West Coast KBP",
  tagline: "Sacramento ADU Builder",
  description:
    "Sacramento ADU planning and construction entry point for property owners who want a clear path from preliminary review to build planning.",

  nav: [
    { label: "Services", href: "#adu-types" },
    { label: "Process", href: "#process" },
    { label: "Projects", href: "#projects" },
    { label: "Pricing", href: "#check-my-lot" },
    { label: "Resources", href: "#resources" },
  ] satisfies NavLink[],

  hero: {
    eyebrow: "West Coast KBP ADU Portal",
    heading: "Sacramento ADU Builder. From Permit to Keys.",
    subheading:
      "Plan your ADU with clear scope, local execution, and a transparent project path.",
    ctaLabel: "Check My Lot",
    ctaHref: "#check-my-lot",
    secondaryCtaLabel: "See Our Work",
    secondaryCtaHref: "#projects",
    badge: "Homeowner ADU planning",
    highlights: [
      "Start with your property address",
      "Clear guidance before commitments",
      "Thoughtful review for real residential projects",
    ],
  },

  trustBar: [
    {
      title: "Local California ADU execution",
      detail:
        "Built around California residential construction workflows and local project coordination.",
    },
    {
      title: "Preliminary feasibility review",
      detail:
        "Initial review starts with the property address and project goals before any commitment.",
    },
    {
      title: "Manual owner/admin review",
      detail:
        "Human review is required before scope, price, schedule, or feasibility statements.",
    },
    {
      title: "Transparent process",
      detail:
        "The path is organized from planning through build with visible next steps.",
    },
  ] satisfies TrustItem[],

  aduTypes: [
    {
      title: "Detached ADU",
      description:
        "A separate backyard dwelling path for added living space or rental planning.",
    },
    {
      title: "Garage Conversion",
      description:
        "A conversion path that starts with structure, access, utility, and jurisdiction review.",
    },
    {
      title: "Attached ADU",
      description:
        "An ADU connected to the existing home, reviewed around layout, access, and site limits.",
    },
    {
      title: "JADU",
      description:
        "A compact dwelling option that begins with owner/admin review and property-specific checks.",
    },
  ] satisfies AduTypeCard[],

  goals: [
    { label: "Rental income", value: "Rental income" },
    { label: "Family housing", value: "Family housing" },
    { label: "Guest house", value: "Guest house" },
    { label: "Home office", value: "Home office" },
    { label: "Not sure", value: "Not sure" },
  ] satisfies OptionItem[],

  budgetRanges: [
    { label: "Not sure yet", value: "Not sure yet" },
    { label: "$150k - $250k", value: "$150k - $250k" },
    { label: "$250k - $400k", value: "$250k - $400k" },
    { label: "$400k+", value: "$400k+" },
  ] satisfies OptionItem[],

  timelines: [
    { label: "Exploring", value: "Exploring" },
    { label: "0 - 3 months", value: "0 - 3 months" },
    { label: "3 - 6 months", value: "3 - 6 months" },
    { label: "6+ months", value: "6+ months" },
  ] satisfies OptionItem[],

  intake: {
    heading: "Finish your Check My Lot details",
    subheading:
      "After the quick property check, add contact and project details so the local draft has enough context for manual review. Backend persistence is not connected yet.",
    disclaimer:
      "Preliminary review only. Final feasibility, pricing, timeline, and permit path require site, jurisdiction, utility, and code verification.",
    successHeading: "Local draft created",
    successText:
      "No external service was called. A manual owner/admin review workflow still needs backend persistence before production use.",
  },

  footer: {
    trustProof:
      "Check My Lot v0.1 is controlled intake groundwork. Backend persistence and operational routing are not connected yet.",
    disclaimer:
      "Information on this website is preliminary and general. Site, jurisdiction, utility, and code verification are required before project commitments.",
    noGuarantees:
      "No instant eligibility, final pricing, permit path, schedule, rental income, property value, or financing outcome is promised.",
    previewNotice:
      "Frontend-only v0.1. No emails, SMS, CRM writes, scheduling, analytics, or external API calls are performed.",
  },
} as const;

export type SiteConfig = typeof siteConfig;
