/**
 * Central, static configuration for the West Coast KBP public site —
 * Public Platform Site v1 Preview.
 *
 * This is the single source of truth for public-facing copy. It intentionally
 * contains no backend wiring, no form endpoints, no analytics, and no PII.
 * Preview-only notices live here so they are easy to review and update in one
 * place. The public site does not publish regulated credentials, commercial
 * terms, dated delivery statements, live project details, or contact collection.
 *
 * PREVIEW SCOPE: nothing on this site collects, submits, emails, stores,
 * tracks, or uses any information. All CTAs are inert placeholders pending
 * Owner approval. No project facts, client names, costs, schedules, or
 * legal/code conclusions are asserted here.
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

export type CapabilityCard = {
  title: string;
  status: string;
  description: string;
};

export type ObjectControlItem = {
  label: string;
  detail: string;
};

export const siteConfig = {
  name: "West Coast KBP",
  url: "https://westcoastkbp.com",
  tagline: "Transparent ADU & Residential Construction",
  description:
    "A public preview for the West Coast KBP platform direction: ADU, garage conversion, residential general construction, and GC/subcontract work organized through visible project control.",

  // In-page anchors only — no external routes or backend in this preview.
  nav: [
    { label: "Services", href: "#services" },
    { label: "Platform", href: "#platform-preview" },
    { label: "Objects", href: "#object-control" },
    { label: "GC Path", href: "#gc-partners" },
  ] satisfies NavLink[],

  hero: {
    eyebrow: "Transparent ADU & Residential Construction",
    heading: "A construction platform interface for ADU and residential work",
    subheading:
      "West Coast KBP is framing ADU, garage conversion, residential general construction, and GC/subcontract work as controlled project objects: scope, state, approvals, evidence, and next action shown before any live data collection exists.",
    // CTA is an in-page link to the preview-only CTA section. There is no
    // form, no submission handling, and no data is collected in this preview.
    ctaLabel: "View preview status",
    ctaHref: "#preview-cta",
    // Secondary in-page link to the process section. Navigation only.
    secondaryCtaLabel: "Review platform flow",
    secondaryCtaHref: "#control-flow",
    // Small status pill shown above the headline.
    badge: "Public preview · v1",
    // Inline proof points beneath the hero CTA. No promises, no collection.
    highlights: [
      "Platform direction only",
      "Direct Client + GC/Subcontract paths",
      "No data collected in this preview",
    ],
  },

  // Short uppercase kickers shown above each section heading. Labels only.
  sections: {
    services: "Service ladder",
    platform: "Platform capability preview",
    objects: "Existing object control preview",
    voice: "Premium voice direction",
    process: "Control flow",
    gc: "GC / subcontract path",
    cta: "Preview status",
  },

  // Platform status strip. No operational claims, credentials, or capture.
  trustBar: [
    {
      title: "Public preview only",
      detail:
        "The interface is for visual and structural review. It does not collect, submit, email, store, or track information.",
    },
    {
      title: "Platform-first structure",
      detail:
        "The homepage presents future project control concepts, not active services or operational commitments.",
    },
    {
      title: "Owner approval required",
      detail:
        "Live workflows, real objects, project materials, and contact collection require explicit Owner approval later.",
    },
  ] satisfies TrustItem[],

  // Service ladder — homeowner entry through the GC / subcontract channel.
  services: [
    {
      title: "ADU",
      description:
        "A primary platform lane for accessory dwelling unit work, organized around scope, state, approvals, and evidence before any live commitment.",
    },
    {
      title: "Garage Conversion",
      description:
        "A conversion lane for structured review, scope definition, and project-state tracking without publishing property-specific claims.",
    },
    {
      title: "Residential General Construction",
      description:
        "Residential construction scopes represented as controlled objects with visible milestones, documentation status, and review checkpoints.",
    },
    {
      title: "GC / Subcontract Work",
      description:
        "A first-class platform path for general contractor and subcontract coordination, separate from homeowner-facing intake.",
    },
  ] satisfies ServiceItem[],

  capabilities: {
    note: "Platform direction / preview only. These are not active public services, and no interaction here collects information.",
    cards: [
      {
        title: "Premium Voice Operator",
        status: "Future interface",
        description:
          "A high-end voice layer is being considered as a controlled platform interface, gated by quality review before release.",
      },
      {
        title: "Visual Project Scenario / Configurator",
        status: "Preview concept",
        description:
          "A future scenario workspace could help organize options and assumptions before any owner-reviewed project path exists.",
      },
      {
        title: "Object / Project Control",
        status: "Core direction",
        description:
          "The platform direction centers on project objects with scope, milestones, approvals, evidence, and next action visible.",
      },
    ] satisfies CapabilityCard[],
  },

  objectControl: {
    note: "Illustrative structure only. No real addresses, client names, project names, prices, documents, photos, or facts are shown.",
    items: [
      {
        label: "Object registry",
        detail: "A future index for active project objects and their current state.",
      },
      {
        label: "Scope",
        detail: "A controlled scope summary with version and review status.",
      },
      {
        label: "Milestones",
        detail: "A staged view of planned, active, paused, and complete work states.",
      },
      {
        label: "Approvals",
        detail: "Owner-reviewed checkpoints before a project object advances.",
      },
      {
        label: "Photos / docs / evidence",
        detail: "A future evidence layer for reviewed files and visual records.",
      },
      {
        label: "Next action",
        detail: "A single visible action needed to move the object forward.",
      },
    ] satisfies ObjectControlItem[],
  },

  voice: {
    heading: "Premium voice is a future interface layer, not an auto-attendant",
    note: "Voice is not live and is not implemented on this site. The direction is RU / EN / ES support with a high-end voice quality gate before any release.",
    checkpoints: [
      "No voice agent, recording, call flow, or connection exists in this preview.",
      "Voice quality must meet a premium standard before public use.",
      "RU / EN / ES direction is a product target, not an active service claim.",
    ],
  },

  // Control flow — platform state sequence only.
  process: {
    note: "Platform control flow shown for orientation only. It is not a sales funnel and does not create a project, account, or submission.",
    steps: [
      {
        step: "01",
        title: "User intent",
        description:
          "A future user describes intent in a structured way without committing to a live workflow.",
      },
      {
        step: "02",
        title: "Structured draft",
        description:
          "The platform prepares a draft object shape: type, scope assumptions, missing context, and review needs.",
      },
      {
        step: "03",
        title: "Owner review",
        description:
          "An owner review checkpoint controls whether the draft can become a real tracked object later.",
      },
      {
        step: "04",
        title: "Object / project state",
        description:
          "Approved objects can carry state, scope, milestones, approvals, evidence, and next action.",
      },
      {
        step: "05",
        title: "Future Business Hall",
        description:
          "A future partner workspace may organize GC/subcontract coordination. It is not active in this preview.",
      },
    ] satisfies ProcessStep[],
  },

  // GC partner path — first-class subcontract / general-contract channel.
  gcPartner: {
    heading: "GC / subcontract work stays a first-class platform path",
    intro:
      "West Coast KBP keeps contractor coordination separate from homeowner-facing flows. This preview shows the lane structure only; there is no bid form and no data collection.",
    capability: [
      "Execution path: Direct Client + GC/Subcontract work",
      "Service focus: ADU, garage conversion, and residential general construction",
      "Object state: scope, review, evidence, and next action",
      "Partner workspace direction: future Business Hall",
    ],
    inviteToBid: {
      label: "Partner path — preview only",
      note: "Bid invitations are not accepted here. No form, submission, account, message, or information is collected until Owner approval.",
    },
  },

  // Final preview-only CTA. Explicitly no data handling of any kind.
  cta: {
    label: "Preview path disabled",
    heading: "Preview only. No data is collected.",
    note: "Nothing here is live. No form, account, submission, email, storage, tracking, analytics, ads, API route, voice connection, or external service connection exists on this site.",
  },

  footer: {
    trustProof:
      "Public platform preview only. Live workflows, real project objects, and public contact collection require Owner approval.",
    disclaimer:
      "Information on this website is general platform framing only. ADU, zoning, structural, electrical, plumbing, and code conclusions require formal review by the proper professionals and authorities before construction.",
    noGuarantees:
      "No public cost commitments, dated delivery commitments, rental income, property value, financing outcomes, or real project facts are asserted in this preview.",
    previewNotice:
      "Public preview — visual and structural review only. No data is collected.",
  },
} as const;

export type SiteConfig = typeof siteConfig;
