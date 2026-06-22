/**
 * Central, static configuration for the West Coast KBP public site —
 * Public Marketing Site v1 Preview.
 *
 * This is the single source of truth for public-facing copy. It intentionally
 * contains no backend wiring, no form endpoints, no analytics, and no PII.
 * Compliance-sensitive strings (CSLB license, disclaimers, "no guarantees",
 * preview-only notices) live here so they are easy to review and update in one
 * place.
 *
 * PREVIEW SCOPE: nothing on this site collects, submits, emails, stores,
 * tracks, or uses any information for lead generation. All CTAs are inert
 * placeholders pending Owner approval. No project facts, client names,
 * prices, permits, timelines, or legal/code claims are asserted here.
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
      "West Coast KBP helps homeowners and GC partners move from feasibility to controlled, milestone-based execution — clear scope, visible progress, and no public promises that depend on property-specific review.",
    // CTA is an in-page link to the preview-only contact section. There is no
    // form, no submission handling, and no data is collected in this preview.
    ctaLabel: "See the preview path — not live yet",
    ctaHref: "#preview-cta",
  },

  // Trust bar — proof points shown before launch. No guarantees, no capture.
  trustBar: [
    {
      title: "CSLB · bond · insurance",
      detail: "License, bond, and insurance proof shown here before public launch.",
    },
    {
      title: "Milestone-based visibility",
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
      title: "Detached ADU",
      description:
        "A standalone accessory dwelling unit built as a separate structure, planned and delivered with a defined scope and visible milestones.",
    },
    {
      title: "Garage conversion",
      description:
        "Converting existing garage space into additional living area, with scope confirmed by property-specific review.",
    },
    {
      title: "Attached ADU / residential construction",
      description:
        "Attached units and broader residential construction tied into the existing home, managed against clear milestones.",
    },
    {
      title: "GC / subcontract work",
      description:
        "Dependable general-contract and subcontract partnership with other builders on larger projects. See the GC partner path below.",
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
        title: "Scope & budget range",
        description:
          "A typical scope and an indicative budget range. Final scope and numbers require property-specific review.",
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
    note: "Placeholders only — no real addresses, clients, prices, or project facts. Real photos and case studies require Owner-selected assets and client permission before publication.",
    cards: [
      {
        area: "Sacramento area — placeholder",
        type: "Detached ADU",
        stage: "Concept / feasibility",
        proof: "Site photos + milestone log",
      },
      {
        area: "Roseville / Rocklin — placeholder",
        type: "Garage conversion",
        stage: "Planning / coordination",
        proof: "Drawing set + progress photos",
      },
      {
        area: "Folsom / El Dorado Hills — placeholder",
        type: "Attached ADU / residential",
        stage: "In build",
        proof: "Milestone photos + closeout docs",
      },
    ] satisfies ProjectCard[],
  },

  // GC partner path — first-class subcontract / general-contract channel.
  gcPartner: {
    heading: "For general contractors",
    intro:
      "West Coast KBP works as a reliable subcontract and general-contract partner. The capability details below are placeholders pending Owner confirmation — no figures here are claims.",
    capability: [
      "Trade scope: [placeholder — to be confirmed by Owner]",
      "Crew capacity: [placeholder — to be confirmed by Owner]",
      "Coverage: Sacramento area & Northern California",
      "License, bond & insurance: shown before public launch",
    ],
    inviteToBid: {
      label: "Invite to bid — preview only",
      note: "Bid invitations are not accepted in this preview. No form, submission, or contact is collected until Owner approval.",
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
    // CSLB license is a placeholder until the official number is supplied.
    cslbLicense: "CSLB License #: [INSERT LICENSE NUMBER]",
    disclaimer:
      "Information on this website is general only. ADU, SB 9, zoning, permit, structural, electrical, plumbing, and code conclusions require official jurisdiction review and licensed professional verification before construction.",
    noGuarantees:
      "No guaranteed pricing, permits, timelines, rental income, property value, or financing outcomes. Project scope, cost, and schedule are confirmed only after official review.",
    previewNotice:
      "Public preview — visual and functional review only. Not a live lead-generation site.",
  },
} as const;

export type SiteConfig = typeof siteConfig;
