/**
 * Central, static configuration for the West Coast KBP public site —
 * Public Marketing Site v1 Preview.
 *
 * This is the single source of truth for public-facing copy. It intentionally
 * contains no backend wiring, no form endpoints, no analytics, and no PII.
 * Compliance-sensitive strings (license verification, disclaimers, "no guarantees",
 * preview-only notices) live here so they are easy to review and update in one
 * place.
 *
 * PREVIEW SCOPE: nothing on this site collects, submits, emails, stores,
 * tracks, or uses any information for lead generation. All CTAs are inert
 * placeholders pending Owner approval. No project facts, client names,
 * costs, permits, schedules, or legal/code claims are asserted here.
 */

export type NavLink = {
  label: string;
  href: string;
};

export type ServiceItem = {
  title: string;
  description: string;
};

export type TrustItem = {
  title: string;
  detail: string;
};

export type ProcessStep = {
  step: string;
  title: string;
  description: string;
};

export type ProjectCard = {
  area: string;
  type: string;
  stage: string;
  proof: string;
};

export const siteConfig = {
  name: "West Coast KBP",
  tagline: "Transparent ADU & Residential Construction",
  description:
    "ADU and residential construction with visible project control — milestone-based execution for homeowners and GC partners across the Sacramento area and Northern California. Public preview.",

  // In-page anchors only — no external routes or backend in this preview.
  nav: [
    { label: "Services", href: "#services" },
    { label: "Process", href: "#process" },
    { label: "Projects", href: "#projects" },
    { label: "For GCs", href: "#gc-partners" },
  ] satisfies NavLink[],

  hero: {
    eyebrow: "Transparent ADU & Residential Construction",
    heading: "ADU and residential construction with visible project control",
    subheading:
      "West Coast KBP helps direct clients and GC/subcontract partners move from feasibility to controlled, milestone-based execution — clear scope, visible progress, and no public promises that depend on property-specific review.",
    // CTA is an in-page link to the preview-only CTA section. There is no
    // form, no submission handling, and no data is collected in this preview.
    ctaLabel: "See the preview path — not live yet",
    ctaHref: "#preview-cta",
    // Secondary in-page link to the process section. Navigation only.
    secondaryCtaLabel: "See how a project runs",
    secondaryCtaHref: "#process",
    // Small status pill shown above the headline.
    badge: "Public preview · v1",
    // Inline proof points beneath the hero CTA. No guarantees, no capture.
    highlights: [
      "Sacramento area & Northern California",
      "Direct Client + GC/Subcontract execution",
      "Preview only — no lead capture",
    ],
  },

  // Short uppercase kickers shown above each section heading. Labels only —
  // no claims, costs, schedules, or guarantees.
  sections: {
    services: "Service ladder",
    process: "Transparent process",
    projects: "Illustrative preview",
    areas: "Where we work",
    gc: "Contractor partnerships",
    cta: "Preview status",
  },

  // Trust bar — proof points shown before launch. No guarantees, no capture.
  trustBar: [
    {
      title: "Trust proof pending",
      detail:
        "License, bond, and insurance verification will be published after Owner verification and before live lead capture.",
    },
    {
      title: "Direct Client + GC/Subcontract execution",
      detail: "Each project is tracked against defined milestones you can see.",
    },
    {
      title: "Preview only — no lead capture",
      detail: "No forms, tracking, or data collection anywhere on this preview.",
    },
  ] satisfies TrustItem[],

  // Service ladder — homeowner entry through the GC / subcontract channel.
  services: [
    {
      title: "ADU",
      description:
        "Accessory dwelling unit work planned around defined scope, documented milestones, and property-specific verification before any live commitment.",
    },
    {
      title: "Garage Conversion",
      description:
        "Garage conversion work framed through feasibility, scope review, and jurisdiction review before construction claims are made.",
    },
    {
      title: "Residential General Construction",
      description:
        "Residential construction scopes managed through clear documentation, milestone visibility, and Owner-confirmed project controls.",
    },
    {
      title: "GC / Subcontract Work",
      description:
        "Direct GC and subcontract execution path for contractor partners, with capability details pending Owner confirmation.",
    },
  ] satisfies ServiceItem[],

  // Process — typical sequence only. Outcomes are property-specific.
  process: {
    note: "Typical sequence shown for orientation. Every project is property-specific and confirmed during review — steps, scope, and outcomes can change.",
    steps: [
      {
        step: "01",
        title: "Feasibility review",
        description:
          "A structured first look at what a project may involve before committing to design or construction.",
      },
      {
        step: "02",
        title: "Scope review",
        description:
          "A working scope outline for review. Final scope and any commercial terms require Owner approval and property-specific verification.",
      },
      {
        step: "03",
        title: "Permit & admin coordination",
        description:
          "Coordinating drawings, documentation, and administrative steps. Permit decisions rest with the jurisdiction.",
      },
      {
        step: "04",
        title: "Controlled build",
        description:
          "Construction managed against defined milestones, with progress visible throughout.",
      },
      {
        step: "05",
        title: "Handover & closeout",
        description:
          "Final walkthrough, documentation handover, and project closeout.",
      },
    ] satisfies ProcessStep[],
  },

  // Project preview — placeholders only. No real addresses, clients, or facts.
  projects: {
    note: "Placeholders only — no real addresses, clients, costs, or project facts. Real photos and case studies require Owner-selected assets and client permission before publication.",
    cards: [
      {
        area: "Sacramento area — placeholder",
        type: "ADU",
        stage: "Future case study",
        proof: "Owner-selected assets pending",
      },
      {
        area: "Roseville / Rocklin — placeholder",
        type: "Garage Conversion",
        stage: "Future case study",
        proof: "Owner-selected assets pending",
      },
      {
        area: "Folsom / El Dorado Hills — placeholder",
        type: "Residential General Construction",
        stage: "Future case study",
        proof: "Owner-selected assets pending",
      },
    ] satisfies ProjectCard[],
  },

  // GC partner path — first-class subcontract / general-contract channel.
  gcPartner: {
    heading: "For general contractors and subcontract partners",
    intro:
      "West Coast KBP supports direct GC and subcontract execution. Capability details below remain pending Owner confirmation — no figures here are claims.",
    capability: [
      "Execution path: Direct Client + GC/Subcontract work",
      "Service focus: ADU, garage conversion, and residential general construction",
      "Coverage: Sacramento area & Northern California",
      "Trust proof pending Owner verification",
    ],
    inviteToBid: {
      label: "Invite to bid — preview only",
      note: "Bid invitations are not accepted in this preview. No form, submission, or information is collected until Owner approval.",
    },
  },

  serviceAreas: [
    "Sacramento",
    "Roseville",
    "Rocklin",
    "Lincoln",
    "Folsom",
    "Granite Bay",
    "El Dorado Hills",
    "Northern California",
  ],

  // Final preview-only CTA. Explicitly no data handling of any kind.
  cta: {
    label: "Preview request path — not live yet",
    heading: "This is a preview. Nothing here is live.",
    note: "Preview only. No information is collected, submitted, emailed, stored, tracked, or used for lead generation anywhere on this site until Owner approval.",
  },

  footer: {
    // Trust proof is pending Owner-supplied verification.
    trustProof:
      "License, bond, and insurance verification will be published after Owner verification and before live lead capture.",
    disclaimer:
      "Information on this website is general only. ADU, SB 9, zoning, permit, structural, electrical, plumbing, and code conclusions require official jurisdiction review and licensed professional verification before construction.",
    noGuarantees:
      "No guaranteed costs, permits, schedules, rental income, property value, or financing outcomes. Project scope, cost, and schedule are confirmed only after official review.",
    previewNotice:
      "Public preview — visual and functional review only. Not a live lead-generation site.",
  },
} as const;

export type SiteConfig = typeof siteConfig;
