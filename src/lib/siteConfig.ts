/**
 * Central, static configuration for the West Coast KBP public portal surface.
 *
 * It intentionally contains no backend wiring, no form endpoints, no analytics,
 * no provider configuration, no live project data, and no PII.
 *
 * PREVIEW SCOPE: nothing on this site collects, submits, emails, stores,
 * tracks, routes, calls, records, or sends information. All CTAs are in-page
 * anchors until explicit Owner approval.
 */

export type NavLink = {
  label: string;
  href: string;
};

export type SectionCopy = {
  eyebrow: string;
  heading: string;
  intro: string;
};

export type ServiceItem = {
  title: string;
  description: string;
  lane: string;
};

export type HeroPanelRow = {
  label: string;
  value: string;
  detail: string;
};

export type ProcessStep = {
  step: string;
  title: string;
  description: string;
  tone: "preview" | "attention";
};

export type ProjectControlItem = {
  label: string;
  value: string;
  detail: string;
  tone: "neutral" | "attention" | "ready" | "blocked";
};

export type ActiveProjectPreview = {
  id: string;
  title: string;
  service: string;
  status: string;
  scope: string;
  approval: string;
  evidence: string;
  nextAction: string;
};

export type ScreeningOutput = {
  label: string;
  mockOutput: string;
  warning: string;
};

export type VoiceCheckpoint = {
  label: string;
  detail: string;
};

const officialVerificationWarning = "Requires official source verification.";

export const siteConfig = {
  name: "West Coast KBP",
  url: "https://westcoastkbp.com",
  tagline: "ADU & Residential Construction",
  description:
    "A public preview of West Coast KBP services for ADUs, garage conversions, attached residential space, and substantial residential construction in California.",

  accessibility: {
    brandHomeLabel: "West Coast KBP home",
    primaryNavigationLabel: "Primary",
  },

  labels: {
    explore: "Explore",
    scope: "Scope",
    approval: "Approval",
    evidence: "Evidence",
    nextAction: "Next action",
    ownerApprovalRequired: "Owner approval required",
    partnerControl: "Partner control",
    voiceGate: "Voice gate",
    mockOutput: "Mock output",
    previewObject: "Preview object",
    allRightsReserved: "All rights reserved.",
  },

  nav: [
    { label: "ADU Services", href: "/services/detached-adu" },
    { label: "Our Process", href: "/process" },
    { label: "Compare", href: "/compare" },
    { label: "About", href: "/about" },
  ] satisfies NavLink[],

  hero: {
    badge: "Portal surface v0.1",
    eyebrow: "West Coast KBP Construction OS",
    heading: "A controlled portal surface for serious residential construction work",
    subheading:
      "The public homepage now presents the product direction as an operations portal: service lanes, structured review, OwnerReview checkpoints, controlled action, and sanitized sample objects. It is UI-only and not connected to live intake.",
    ctaLabel: "Review project control",
    ctaHref: "#project-control",
    secondaryCtaLabel: "See mock screening",
    secondaryCtaHref: "#property-screening",
    highlights: [
      "No live intake, tracking, or storage",
      "OwnerReview before any controlled action",
      "Fake and sanitized preview objects only",
    ],
    panel: {
      label: "Operations cockpit preview",
      title: "Residential workstream preview",
      status: "OwnerReview pending",
      rows: [
        {
          label: "Scope",
          value: "Draft",
          detail: "Generic ADU / residential lane, no address or client facts",
        },
        {
          label: "Evidence",
          value: "Placeholder",
          detail: "No photos, permits, documents, costs, or schedules attached",
        },
        {
          label: "Next action",
          value: "Review",
          detail: "Human approval required before any future external action",
        },
      ] satisfies HeroPanelRow[],
    },
  },

  sections: {
    services: {
      eyebrow: "Services",
      heading: "Construction lanes organized for operations control",
      intro:
        "The portal surface separates the core work types West Coast KBP expects to manage. Each lane is shown as a future controlled workstream, not as a quote form or instant commitment.",
    },
    howItWorks: {
      eyebrow: "How it works",
      heading: "Intent becomes reviewed structure before action",
      intro:
        "The product model is deliberately gated: a person states intent, the system prepares structured review context, OwnerReview decides what is allowed, and only then can a controlled action happen in a future release.",
    },
    projectControl: {
      eyebrow: "Project control preview",
      heading: "The portal centers each job as a controlled object",
      intro:
        "This is the first visible shape of the operating surface: scope, status, approvals, evidence, and next action are visible together so construction work is managed as state, not loose messages.",
    },
    activeProjects: {
      eyebrow: "Sample project objects",
      heading: "Sanitized sample objects show the intended operating rhythm",
      intro:
        "These cards are fake preview objects. They contain no real project names, client names, addresses, costs, dates, schedules, permits, photos, or documents.",
    },
    propertyScreening: {
      eyebrow: "Property / ADU screening preview",
      heading: "A mock screening surface without GIS, permit, or zoning conclusions",
      intro:
        "The screening preview shows how official-source checks could be organized later. It does not call an API, inspect a parcel, determine eligibility, or make a buildability conclusion.",
    },
    gc: {
      eyebrow: "GC / partner path",
      heading: "Partner coordination stays separate from homeowner intake",
      intro:
        "The portal includes a dedicated lane for general contractor and subcontract coordination. This keeps partner work structured without mixing it with direct-client requests.",
    },
    voice: {
      eyebrow: "Voice front door",
      heading: "Corporate voice direction is shown, but no voice system is live",
      intro:
        "Voice is represented as a future front-door standard for handoff quality. There is no number, agent, recording, routing, provider connection, or live call flow in this UI.",
    },
    cta: {
      eyebrow: "Final CTA",
      heading: "Review the portal surface. Nothing submits from this page.",
      intro:
        "The current page is a visual product slice only. The links below stay inside the page and do not create accounts, requests, records, messages, analytics events, or external actions.",
    },
  } satisfies Record<string, SectionCopy>,

  services: [
    {
      title: "ADU",
      lane: "Primary residential lane",
      description:
        "Accessory dwelling unit work represented as a structured project object with scope assumptions, review needs, approvals, evidence, and next action.",
    },
    {
      title: "Garage Conversion",
      lane: "Conversion lane",
      description:
        "Garage conversion work organized around controlled review rather than instant feasibility claims or automated property conclusions.",
    },
    {
      title: "Residential GC",
      lane: "Direct-client construction lane",
      description:
        "Residential general construction scopes surfaced with status, evidence readiness, approval checkpoints, and clear next-action ownership.",
    },
    {
      title: "GC-Subcontract",
      lane: "Partner coordination lane",
      description:
        "A first-class B2B path for contractor coordination, separated from homeowner intake and framed for scope, evidence, and approval control.",
    },
  ] satisfies ServiceItem[],

  process: {
    steps: [
      {
        step: "01",
        title: "Intent",
        description:
          "A homeowner, owner, or partner expresses what they are trying to do. In this preview there is no form, collection, account, or submission.",
        tone: "preview",
      },
      {
        step: "02",
        title: "Structured review",
        description:
          "A future system would organize the request into service lane, scope assumptions, missing facts, evidence needs, and risk notes.",
        tone: "preview",
      },
      {
        step: "03",
        title: "OwnerReview",
        description:
          "Human review decides whether the object can advance, needs more context, should stay paused, or should be rejected.",
        tone: "attention",
      },
      {
        step: "04",
        title: "Controlled action",
        description:
          "Only approved actions may move forward in a future release. This UI does not send messages, write records, route calls, or trigger workflows.",
        tone: "preview",
      },
    ] satisfies ProcessStep[],
  },

  projectControl: {
    objectId: "OBJ-PREVIEW-006",
    title: "Sample residential project object",
    status: "Preview object",
    notice:
      "Illustrative control surface only. No real project facts, documents, dates, addresses, costs, permits, photos, or schedules are shown.",
    items: [
      {
        label: "Scope",
        value: "Draft scope shell",
        detail: "Service lane, assumptions, and missing facts are separated before review.",
        tone: "neutral",
      },
      {
        label: "Status",
        value: "OwnerReview pending",
        detail: "No project object advances without an explicit human checkpoint.",
        tone: "attention",
      },
      {
        label: "Approvals",
        value: "No live approvals",
        detail: "Approval rows are placeholders and do not authorize work.",
        tone: "blocked",
      },
      {
        label: "Evidence",
        value: "Evidence index empty",
        detail: "No documents, photos, permits, inspections, or client files are attached.",
        tone: "neutral",
      },
      {
        label: "Next action",
        value: "Review sample object",
        detail: "The only available action is visual review of this preview surface.",
        tone: "ready",
      },
    ] satisfies ProjectControlItem[],
  },

  activeProjects: [
    {
      id: "OBJ-ADU-001",
      title: "Sample ADU concept object",
      service: "ADU",
      status: "OwnerReview queued",
      scope: "Detached unit concept shell with no parcel, owner, budget, or schedule data.",
      approval: "Owner checkpoint required before the object could advance.",
      evidence: "No documents attached. Evidence slots are placeholders only.",
      nextAction: "Confirm what official facts would be required for review.",
    },
    {
      id: "OBJ-GAR-002",
      title: "Sample garage conversion object",
      service: "Garage Conversion",
      status: "Context incomplete",
      scope: "Conversion workstream shell with missing site facts and no feasibility conclusion.",
      approval: "Review cannot advance without official-source context.",
      evidence: "No photos, drawings, permit records, or inspection notes attached.",
      nextAction: "List missing official checks without drawing conclusions.",
    },
    {
      id: "OBJ-GC-003",
      title: "Sample partner coordination object",
      service: "GC-Subcontract",
      status: "Partner lane preview",
      scope: "Trade coordination shell with generic scope categories only.",
      approval: "No bid, quote, award, schedule, or commitment exists.",
      evidence: "No real plans, takeoffs, documents, or project files attached.",
      nextAction: "Keep partner path separate from direct-client intake.",
    },
  ] satisfies ActiveProjectPreview[],

  propertyScreening: {
    objectLabel: "Mock property object",
    status: "No API connected",
    warning: officialVerificationWarning,
    note:
      "No address, APN, parcel identifier, owner, jurisdiction, zoning, utility, permit, or buildability fact is used here.",
    outputs: [
      {
        label: "Official source routing",
        mockOutput: "Would identify the official source category to check later.",
        warning: officialVerificationWarning,
      },
      {
        label: "Parcel context",
        mockOutput: "Would list missing parcel facts without reading a real parcel.",
        warning: officialVerificationWarning,
      },
      {
        label: "ADU review questions",
        mockOutput: "Would prepare questions for a professional or authority review.",
        warning: officialVerificationWarning,
      },
      {
        label: "Constraint notes",
        mockOutput: "Would flag unknowns without stating eligibility or buildability.",
        warning: officialVerificationWarning,
      },
    ] satisfies ScreeningOutput[],
  },

  gcPartner: {
    label: "Partner lane preview",
    heading: "Contractor coordination without a public bid form",
    intro:
      "Partner work is treated as its own lane with scope clarity, evidence needs, approval status, and a next-action owner. This page does not accept bids or collect partner information.",
    capability: [
      "Separate lane for GC and subcontract coordination",
      "Scope package status instead of loose message threads",
      "Evidence readiness before handoff or review",
      "OwnerReview before any future partner-facing action",
    ],
    capabilityDescription:
      "Preview-only lane structure. No bid, quote, submission, account, or message is created here.",
    inactiveAction: "Partner path disabled in preview",
  },

  voice: {
    status: "Not live",
    checkpoints: [
      {
        label: "Corporate standard",
        detail:
          "Future voice should sound calm, concise, and professional before any public front door is considered.",
      },
      {
        label: "No production connection",
        detail:
          "This page has no phone routing, call handling, recording, transcript retention, or voice provider connection.",
      },
      {
        label: "Review gate",
        detail:
          "Voice quality, privacy, retention, and action authority require separate approval before release.",
      },
    ] satisfies VoiceCheckpoint[],
  },

  cta: {
    primaryLabel: "Back to services",
    primaryHref: "#services",
    secondaryLabel: "Review voice direction",
    secondaryHref: "#voice-front-door",
    disabledLabel: "Live intake disabled",
  },

  footer: {
    trustProof:
      "Serving the Sacramento-region market direction. Business credentials and project facts remain pending owner input.",
    disclaimer:
      "Information on this website is general platform framing only. This preview is not a determination about ADU, zoning, structural, electrical, plumbing, or code matters. Requires official source verification.",
    noGuarantees:
      "No public cost commitments, dated delivery commitments, rental income, property value, financing outcomes, permit outcomes, or real project facts are asserted in this preview.",
    previewNotice: "Public preview · visual and structural review only · no data is collected.",
  },
} as const;

export type SiteConfig = typeof siteConfig;
