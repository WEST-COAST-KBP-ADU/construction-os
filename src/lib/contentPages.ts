export type FaqItem = {
  question: string;
  answer: string;
};

export type IndexedContentItem = {
  title: string;
  description: string;
};

export type ServiceSlug =
  | "detached-adu"
  | "garage-conversion"
  | "attached-adu"
  | "jadu"
  | "adu-legalization";

export type ServicePage = {
  slug: ServiceSlug;
  sequence: string;
  shortTitle: string;
  title: string;
  eyebrow: string;
  description: string;
  lede: string;
  reviewSignal: string;
  orientation: {
    heading: string;
    body: string[];
  };
  scopeHeading: string;
  scopeItems: IndexedContentItem[];
  reviewHeading: string;
  reviewIntro: string;
  reviewInputs: string[];
  pathway: IndexedContentItem[];
  faq: FaqItem[];
  relatedSlugs: ServiceSlug[];
};

export type AboutPage = {
  metaTitle: string;
  title: string;
  eyebrow: string;
  description: string;
  lede: string;
  heroSignal: string;
  principlesHeading: string;
  operatingModelHeading: string;
  pendingHeading: string;
  pendingIntro: string;
  servicesHeading: string;
  principles: IndexedContentItem[];
  operatingModel: IndexedContentItem[];
  pendingFacts: string[];
  faq: FaqItem[];
};

export type ComparisonRow = {
  dimension: string;
  adHoc: string;
  controlled: string;
};

export type ComparePage = {
  metaTitle: string;
  title: string;
  eyebrow: string;
  description: string;
  lede: string;
  notice: string;
  comparisonHeading: string;
  principlesHeading: string;
  servicesHeading: string;
  rows: ComparisonRow[];
  principles: IndexedContentItem[];
  faq: FaqItem[];
};

export type ProcessStep = IndexedContentItem & {
  sequence: string;
  output: string;
};

export type ProcessPage = {
  metaTitle: string;
  title: string;
  eyebrow: string;
  description: string;
  lede: string;
  heroSignal: string;
  stepsHeading: string;
  boundaryHeading: string;
  boundaryIntro: string;
  steps: ProcessStep[];
  boundaries: IndexedContentItem[];
  faq: FaqItem[];
};

export type FaqGroup = {
  label: string;
  heading: string;
  description: string;
  items: FaqItem[];
};

export type FaqPage = {
  metaTitle: string;
  title: string;
  eyebrow: string;
  description: string;
  lede: string;
  heroSignal: string;
  indexHeading: string;
  groups: FaqGroup[];
};

export const officialVerificationWarning = "Requires official source verification.";

export const contentPageLabels = {
  home: "Home",
  services: "Services",
  about: "About",
  compare: "Compare",
  process: "Process",
  faq: "FAQ",
  reviewBoundary: "Review boundary",
  openServicePage: "Open service page",
  servicePageStatus: "Service page",
  exploreServiceLanes: "Explore service lanes",
  frequentlyAskedQuestions: "Frequently asked questions",
  faqHeading: "Clear answers without instant conclusions",
  serviceTemplate: {
    orientation: "Orientation",
    scopeAnatomy: "Scope anatomy",
    evidenceNeeds: "Evidence needs",
    decisionPath: "Decision path",
    pathwayHeading: "A bounded path from intent to owner-reviewed action",
    relatedServices: "Related service lanes",
    relatedHeading: "Continue with the workstream that matches the review context",
  },
  aboutTemplate: {
    operatingPrinciples: "Operating principles",
    constructionOsModel: "Construction OS model",
    truthBoundary: "Truth boundary",
    serviceArchitecture: "Service architecture",
  },
  compareTemplate: {
    dimensions: "Six workflow dimensions",
    dimension: "Dimension",
    adHocModel: "Ad hoc coordination model",
    controlledModel: "Controlled review model",
    limits: "What control does not mean",
    serviceContext: "See the model in context",
  },
  processTemplate: {
    controlSequence: "Control sequence",
    stageOutput: "Review output",
    operatingBoundaries: "Operating boundaries",
    relatedQuestions: "Related questions",
  },
  faqTemplate: {
    answerIndex: "Answer index",
    questions: "Questions and answers",
  },
} as const;

export const servicePages = [
  {
    slug: "detached-adu",
    sequence: "01",
    shortTitle: "Detached ADU",
    title: "Detached ADU planning with the unknowns kept visible",
    eyebrow: "ADU service lane",
    description:
      "How West Coast KBP organizes detached ADU planning as a reviewed construction workstream without making property, permit, or buildability conclusions.",
    lede:
      "A detached ADU request brings together property context, design coordination, construction disciplines, and official review. This page explains how those questions can be organized before anyone treats an assumption as a decision.",
    reviewSignal:
      "No property is evaluated on this page. Eligibility, zoning, permitting, and buildability require current official-source and professional review.",
    orientation: {
      heading: "A separate structure creates a connected set of decisions",
      body: [
        "The workstream starts by distinguishing the desired living space from the facts that have not yet been established. Site context, access, utilities, existing improvements, and the intended use belong in one review picture rather than separate message threads.",
        "West Coast KBP frames that picture as a controlled project object: scope assumptions are labeled, missing evidence stays visible, and the next action has an owner before any future external commitment.",
      ],
    },
    scopeHeading: "What the review lane organizes",
    scopeItems: [
      {
        title: "Property context",
        description:
          "Official records and current site observations are separated from homeowner assumptions and design preferences.",
      },
      {
        title: "Design coordination",
        description:
          "Space planning, access, privacy, building relationships, and system needs are treated as connected questions.",
      },
      {
        title: "Construction disciplines",
        description:
          "Structural, utility, envelope, life-safety, and finish questions are routed to the appropriate review path.",
      },
      {
        title: "Decision evidence",
        description:
          "Known facts, unresolved issues, review notes, and approvals remain distinguishable throughout the workstream.",
      },
    ],
    reviewHeading: "Facts needed before a project position can be formed",
    reviewIntro:
      "The public portal does not collect these facts. A future owner-approved workflow would identify what is needed and place it into review without converting unknowns into answers.",
    reviewInputs: [
      "Current official property and jurisdiction records",
      "Existing-condition documentation appropriate to the site",
      "Owner objectives stated as preferences, not approved scope",
      "Professional review notes for applicable construction disciplines",
      "Explicit OwnerReview status and a bounded next action",
    ],
    pathway: [
      {
        title: "Frame intent",
        description: "Describe the desired result while labeling every unverified property assumption.",
      },
      {
        title: "Assemble review context",
        description: "Bring official sources, site evidence, and discipline questions into one controlled record.",
      },
      {
        title: "OwnerReview",
        description: "Decide whether the workstream advances, pauses for evidence, changes direction, or stops.",
      },
    ],
    faq: [
      {
        question: "Does this page confirm that a detached ADU can be built on a property?",
        answer: `No. It does not inspect a parcel or make an eligibility, zoning, permit, or buildability conclusion. ${officialVerificationWarning}`,
      },
      {
        question: "What does an early detached ADU review organize?",
        answer:
          "It separates known facts, owner preferences, missing evidence, design questions, construction-discipline questions, and decisions that require human review.",
      },
      {
        question: "Can this page start a project or send information?",
        answer:
          "No. This page has no form, account, submission, tracking, message, or external action. Its links only navigate within the public site.",
      },
    ],
    relatedSlugs: ["attached-adu", "garage-conversion", "jadu"],
  },
  {
    slug: "garage-conversion",
    sequence: "02",
    shortTitle: "Garage Conversion",
    title: "Garage conversion review that starts with existing conditions",
    eyebrow: "Conversion service lane",
    description:
      "A controlled overview of garage conversion review: existing conditions, documentation, discipline questions, and human decision gates.",
    lede:
      "A garage conversion begins with an existing space, but the visible enclosure is only part of the review. Documentation, structural conditions, building systems, access, and intended use have to be considered together before a responsible project position exists.",
    reviewSignal:
      "An existing garage is not treated as automatically convertible. Official records, current conditions, and professional review remain required.",
    orientation: {
      heading: "Existing space does not remove the need for structured review",
      body: [
        "The first task is to separate what can be observed from what must be documented or verified. Previous work, concealed conditions, existing systems, and the relationship to the primary residence can create different review paths.",
        "The portal model keeps those paths explicit. It records what is known, what evidence is missing, which discipline owns a question, and whether OwnerReview allows the workstream to advance.",
      ],
    },
    scopeHeading: "What the conversion lane organizes",
    scopeItems: [
      {
        title: "Existing-condition record",
        description:
          "Visible conditions, available documents, and unknown concealed conditions are kept in separate evidence categories.",
      },
      {
        title: "Space and access questions",
        description:
          "Proposed use, circulation, openings, privacy, and the relationship to the primary residence are reviewed together.",
      },
      {
        title: "Building-system review",
        description:
          "Structural, electrical, plumbing, mechanical, envelope, and life-safety questions are assigned rather than guessed.",
      },
      {
        title: "Documentation path",
        description:
          "Official records and required professional documents stay linked to the decisions they support.",
      },
    ],
    reviewHeading: "Inputs that prevent an existing space from being misread",
    reviewIntro:
      "This page does not request or store property information. It shows the categories a future approved review packet would need to distinguish.",
    reviewInputs: [
      "Available official records for the existing structure",
      "Current-condition observations and appropriately prepared documentation",
      "Known prior alterations, labeled with their evidence status",
      "Discipline-specific questions and professional review notes",
      "OwnerReview decision and the exact next evidence request",
    ],
    pathway: [
      {
        title: "Document what exists",
        description: "Record observable conditions without treating visibility as proof of compliance or suitability.",
      },
      {
        title: "Route open questions",
        description: "Assign structural, system, access, and documentation issues to their proper review path.",
      },
      {
        title: "Review before action",
        description: "Require a human decision before any future commitment or external coordination.",
      },
    ],
    faq: [
      {
        question: "Does an existing garage automatically make conversion straightforward?",
        answer: `No. Existing conditions, records, systems, access, and applicable requirements still need review. ${officialVerificationWarning}`,
      },
      {
        question: "Why separate observed conditions from official records?",
        answer:
          "Because a visible condition and a documented condition are different kinds of evidence. The workflow keeps that distinction explicit.",
      },
      {
        question: "Does this page accept photos, plans, or an address?",
        answer:
          "No. The public page contains no upload, address field, form, persistence, or submission path.",
      },
    ],
    relatedSlugs: ["adu-legalization", "attached-adu", "detached-adu"],
  },
  {
    slug: "attached-adu",
    sequence: "03",
    shortTitle: "Attached ADU",
    title: "Attached ADU planning at the boundary of old and new work",
    eyebrow: "ADU service lane",
    description:
      "How an attached ADU workstream organizes existing-building context, proposed connections, evidence, and review gates.",
    lede:
      "An attached ADU proposal connects new residential space to an existing home. That connection makes the condition of the current building, the proposed interface, and the building systems part of the same review context.",
    reviewSignal:
      "Attachment does not imply approval, structural suitability, or a particular review path. Current official and professional verification is required.",
    orientation: {
      heading: "The interface with the existing home is the central review object",
      body: [
        "A responsible scope distinguishes the desired addition from the evidence available about the existing structure. Connections, openings, circulation, utilities, envelope continuity, and occupancy questions cannot be resolved from a generic page.",
        "The controlled workflow makes each dependency visible, assigns its review owner, and prevents an attractive concept from being mistaken for an approved or construction-ready scope.",
      ],
    },
    scopeHeading: "What the attached lane organizes",
    scopeItems: [
      {
        title: "Existing-building context",
        description:
          "Available records and current-condition evidence are associated with the part of the building they describe.",
      },
      {
        title: "Connection strategy",
        description:
          "Proposed structural, circulation, envelope, and system connections remain explicit review questions.",
      },
      {
        title: "Use separation",
        description:
          "Privacy, access, shared conditions, and operational preferences are framed without asserting a code outcome.",
      },
      {
        title: "Approval dependencies",
        description:
          "Each decision shows the official or professional evidence it depends on before OwnerReview.",
      },
    ],
    reviewHeading: "Evidence categories for an attached workstream",
    reviewIntro:
      "Nothing is collected here. These categories show how a future authorized review would prevent gaps at the existing-to-new interface.",
    reviewInputs: [
      "Official records available for the existing residence",
      "Current-condition documentation for affected building areas",
      "Proposed relationship between existing and new spaces",
      "Discipline review for connections and building systems",
      "OwnerReview decision with unresolved dependencies preserved",
    ],
    pathway: [
      {
        title: "Define the interface",
        description: "Describe where proposed work meets the existing home and list the evidence needed there.",
      },
      {
        title: "Coordinate disciplines",
        description: "Keep structural, envelope, system, and use questions connected to one review record.",
      },
      {
        title: "Gate the next action",
        description: "Allow only the next bounded, owner-reviewed step to move forward in a future workflow.",
      },
    ],
    faq: [
      {
        question: "Does an attached ADU follow the same path as a detached ADU?",
        answer: `Not necessarily. Existing-building conditions and the proposed connection can change the review questions. ${officialVerificationWarning}`,
      },
      {
        question: "What is the main early coordination issue?",
        answer:
          "The interface between existing and proposed work: structure, circulation, envelope, systems, evidence, and approval dependencies need to stay connected.",
      },
      {
        question: "Does this page determine whether an addition is allowed?",
        answer: `No. It provides general workflow education only. ${officialVerificationWarning}`,
      },
    ],
    relatedSlugs: ["detached-adu", "jadu", "garage-conversion"],
  },
  {
    slug: "jadu",
    sequence: "04",
    shortTitle: "JADU",
    title: "JADU requests kept distinct from other ADU workstreams",
    eyebrow: "JADU service lane",
    description:
      "A review-first explanation of JADU requests, with official definitions and property-specific conclusions left to current source verification.",
    lede:
      "JADU requests are managed as their own lane because terminology, existing-space relationships, owner objectives, and official requirements must be confirmed rather than borrowed from a different ADU type.",
    reviewSignal:
      "This page does not define legal eligibility or determine whether a proposed space meets current JADU requirements.",
    orientation: {
      heading: "A familiar acronym still requires a precise review record",
      body: [
        "The workflow begins by recording how the owner is using the term and what physical area they have in mind. It then separates that intent from the current official definition and the facts of the property.",
        "That separation matters: the portal can organize questions and evidence without turning a label into a permit, zoning, or buildability conclusion.",
      ],
    },
    scopeHeading: "What the JADU lane organizes",
    scopeItems: [
      {
        title: "Terminology check",
        description:
          "Owner language and current official terminology are recorded separately until verified.",
      },
      {
        title: "Existing-space context",
        description:
          "The relationship to the existing residence is documented without assuming the space fits a defined category.",
      },
      {
        title: "Shared-condition questions",
        description:
          "Access, facilities, systems, privacy, and operational preferences are routed for appropriate review.",
      },
      {
        title: "Decision trace",
        description:
          "The official source, evidence, reviewer, and OwnerReview status remain attached to each conclusion.",
      },
    ],
    reviewHeading: "What must remain explicit in a JADU review",
    reviewIntro:
      "The page contains no screening tool. A future approved workflow would keep these inputs distinct and dated.",
    reviewInputs: [
      "The owner’s intended use, recorded as intent only",
      "Current official terminology and source date",
      "Existing-space records and appropriate condition evidence",
      "Open discipline and operational questions",
      "OwnerReview decision with the required verification wording",
    ],
    pathway: [
      {
        title: "Clarify the request",
        description: "Capture the intended use and space concept without classifying it as eligible.",
      },
      {
        title: "Verify the category",
        description: "Use current official sources and relevant professional input to test terminology and facts.",
      },
      {
        title: "Preserve the decision basis",
        description: "Record what source and evidence support each owner-reviewed next step.",
      },
    ],
    faq: [
      {
        question: "Does this page provide the current legal definition of a JADU?",
        answer: `No. Official definitions and requirements can change and must be checked at the time of review. ${officialVerificationWarning}`,
      },
      {
        question: "Why is JADU a separate service lane?",
        answer:
          "It prevents terminology and assumptions from another ADU type from silently carrying into a different review context.",
      },
      {
        question: "Can the portal classify an existing room as a JADU?",
        answer: `No. This public page performs no property lookup or classification. ${officialVerificationWarning}`,
      },
    ],
    relatedSlugs: ["attached-adu", "garage-conversion", "detached-adu"],
  },
  {
    slug: "adu-legalization",
    sequence: "05",
    shortTitle: "ADU Legalization",
    title: "ADU legalization review grounded in records and current conditions",
    eyebrow: "Existing-unit service lane",
    description:
      "How West Coast KBP frames ADU legalization as an evidence and review problem without promising an approval outcome.",
    lede:
      "A legalization request starts with a gap between an existing condition and the documentation available for it. The first responsible step is to establish what exists, what records say, what remains unknown, and which questions require official or professional review.",
    reviewSignal:
      "Legalization is not guaranteed. This page does not determine compliance, approval, corrective scope, or permit outcome.",
    orientation: {
      heading: "The record and the physical condition must be reviewed together",
      body: [
        "An existing unit may involve prior work, incomplete records, changed conditions, or assumptions passed between owners. The workflow does not fill those gaps with a confident narrative.",
        "Instead, it builds an evidence index, identifies conflicts, routes discipline questions, and gives OwnerReview a clear basis to authorize only the next bounded step.",
      ],
    },
    scopeHeading: "What the legalization lane organizes",
    scopeItems: [
      {
        title: "Record inventory",
        description:
          "Available official documents and their dates are indexed without treating absence as proof of any conclusion.",
      },
      {
        title: "Current-condition evidence",
        description:
          "Appropriate observations and documentation are separated from historical assumptions.",
      },
      {
        title: "Mismatch register",
        description:
          "Differences between records, observed conditions, and owner understanding are made visible for review.",
      },
      {
        title: "Review path",
        description:
          "Official questions and professional-discipline questions are assigned before any proposed response is treated as scope.",
      },
    ],
    reviewHeading: "Inputs for a defensible legalization review",
    reviewIntro:
      "This public surface does not accept an address, documents, or project facts. It explains the evidence categories an authorized workflow would organize.",
    reviewInputs: [
      "Available official records and their source dates",
      "Appropriate current-condition documentation",
      "Known history labeled by source and confidence",
      "A mismatch register with unresolved questions",
      "OwnerReview decision on the next bounded review action",
    ],
    pathway: [
      {
        title: "Inventory evidence",
        description: "List records and current-condition material without resolving gaps by assumption.",
      },
      {
        title: "Reconcile mismatches",
        description: "Route conflicts to official or professional review and preserve unresolved status.",
      },
      {
        title: "Authorize one next step",
        description: "Use OwnerReview to bound the next investigation or coordination action.",
      },
    ],
    faq: [
      {
        question: "Can West Coast KBP guarantee that an existing unit can be legalized?",
        answer: `No. No approval or permit outcome is promised or implied. ${officialVerificationWarning}`,
      },
      {
        question: "What is the first review priority?",
        answer:
          "Establish the available official record, the current physical condition, and every mismatch between them without guessing across missing evidence.",
      },
      {
        question: "Can documents or property information be submitted here?",
        answer:
          "No. This page has no upload, form, account, collection, storage, or message path.",
      },
    ],
    relatedSlugs: ["garage-conversion", "attached-adu", "detached-adu"],
  },
] as const satisfies readonly ServicePage[];

export const serviceSlugs = servicePages.map((page) => page.slug);

export function isServiceSlug(value: string): value is ServiceSlug {
  return serviceSlugs.some((slug) => slug === value);
}

export function getServicePage(slug: ServiceSlug): ServicePage {
  const page = servicePages.find((candidate) => candidate.slug === slug);

  if (!page) {
    throw new Error(`Missing service page configuration for ${slug}`);
  }

  return page;
}

export const aboutPage = {
  metaTitle: "About",
  title: "Construction operations built around reviewable decisions",
  eyebrow: "About West Coast KBP",
  description:
    "The operating principles behind West Coast KBP: visible scope, explicit review, evidence-aware coordination, and owner-controlled action.",
  lede:
    "West Coast KBP is shaping a construction operating model for ADU and residential work in the Sacramento region. The public portal shows the control structure now; business credentials, team biographies, and real project proof remain unpublished until the owner supplies verified facts.",
  heroSignal:
    "Verified business facts stay unpublished until the owner supplies and approves them.",
  principlesHeading: "The portal is designed to make control visible",
  operatingModelHeading: "From messy intent to one reviewable next action",
  pendingHeading: "Business facts still pending owner input",
  pendingIntro:
    "These sections remain visibly incomplete rather than being filled with plausible-looking placeholders.",
  servicesHeading: "Explore the public service lanes",
  principles: [
    {
      title: "Evidence before claims",
      description:
        "Known facts, assumptions, missing information, and professional judgments are kept distinct so a polished interface cannot hide uncertainty.",
    },
    {
      title: "Review before action",
      description:
        "AI and software may prepare context, but the owner remains the final approval authority for business action and public commitments.",
    },
    {
      title: "One visible next step",
      description:
        "Each workstream should show its present state, unresolved dependencies, decision owner, and next bounded action.",
    },
  ],
  operatingModel: [
    {
      title: "Input becomes a candidate artifact",
      description:
        "Messy intent is organized into a reviewable structure without treating the first description as verified scope.",
    },
    {
      title: "Validation exposes uncertainty",
      description:
        "Missing sources, conflicting evidence, and unresolved discipline questions remain visible rather than being smoothed into an answer.",
    },
    {
      title: "OwnerReview controls progression",
      description:
        "Only an explicit owner decision may authorize a future controlled business action.",
    },
    {
      title: "Evidence records what happened",
      description:
        "The operating model preserves a bounded, sanitized trace of accepted or rejected steps without storing production PII in governance.",
    },
  ],
  pendingFacts: [
    "Team biographies — pending owner input",
    "CSLB and insurance information — pending owner input",
    "Warranty terms — pending owner input",
    "Verified project photography and case studies — pending owner input",
  ],
  faq: [
    {
      question: "Is this a published team and credentials page?",
      answer:
        "Not yet. Team biographies, licensing details, insurance information, warranty terms, and real project evidence remain pending owner input.",
    },
    {
      question: "Can the portal approve or start construction work?",
      answer:
        "No. The public portal has no submission or action path. In the operating model, the owner remains the final approval authority.",
    },
    {
      question: "Does West Coast KBP make property conclusions on this site?",
      answer: `No. Property, permit, zoning, and buildability questions require appropriate official and professional review. ${officialVerificationWarning}`,
    },
  ],
} as const satisfies AboutPage;

export const comparePage = {
  metaTitle: "Compare workflows",
  title: "Compare two ways of organizing construction decisions",
  eyebrow: "Workflow comparison",
  description:
    "A neutral comparison between ad hoc coordination and a controlled review model for residential construction work.",
  lede:
    "This comparison is about workflow structure, not contractors or vendors. It shows how the same project question can be handled when scope, evidence, decisions, and next actions are either dispersed or deliberately connected.",
  notice:
    "The table describes two conceptual operating models. It does not claim that every contractor follows either model or that a controlled workflow guarantees a project outcome.",
  comparisonHeading: "The difference is how decisions stay connected",
  principlesHeading: "Better visibility does not remove external uncertainty",
  servicesHeading: "Review the service lanes",
  rows: [
    {
      dimension: "Initial request",
      adHoc: "A message begins the conversation and may mix intent with assumptions.",
      controlled: "Intent becomes a candidate artifact; assumptions remain labeled.",
    },
    {
      dimension: "Scope",
      adHoc: "Scope details can remain distributed across conversations and documents.",
      controlled: "One review object shows scope, exclusions, dependencies, and status.",
    },
    {
      dimension: "Unknowns",
      adHoc: "Missing facts may be discovered only when a downstream question depends on them.",
      controlled: "Unknowns are registered early and attached to the decisions they block.",
    },
    {
      dimension: "Evidence",
      adHoc: "Documents and observations may not show which decision they support.",
      controlled: "Evidence is indexed by source, date, subject, and decision use.",
    },
    {
      dimension: "Approval",
      adHoc: "Agreement may be implied across messages or meeting notes.",
      controlled: "OwnerReview records the decision, boundary, and authorized next step.",
    },
    {
      dimension: "Next action",
      adHoc: "Several participants may hold different views of what happens next.",
      controlled: "One bounded next action has an owner and explicit prerequisites.",
    },
  ],
  principles: [
    {
      title: "Control is not certainty",
      description:
        "A controlled process cannot eliminate site conditions or official review. It makes uncertainty and responsibility easier to see.",
    },
    {
      title: "Structure is not permission",
      description:
        "A well-organized workstream still requires the appropriate owner, official, and professional decisions.",
    },
    {
      title: "Visibility supports accountability",
      description:
        "Linking evidence, decisions, and next actions creates a clearer basis for review without promising an outcome.",
    },
  ],
  faq: [
    {
      question: "Is this a comparison against a specific contractor or company?",
      answer:
        "No. It compares two conceptual workflow patterns and makes no claim about a particular provider.",
    },
    {
      question: "Does a controlled workflow guarantee approval or a construction result?",
      answer: `No. It improves the visibility of facts, unknowns, decisions, and responsibility; it does not guarantee an external outcome. ${officialVerificationWarning}`,
    },
    {
      question: "Can a visitor begin either workflow from this page?",
      answer:
        "No. The page is educational and has no form, submission, tracking, account, or external action.",
    },
  ],
} as const satisfies ComparePage;

export const processPage = {
  metaTitle: "Process",
  title: "A construction process that keeps evidence, decisions, and action connected",
  eyebrow: "Controlled project pathway",
  description:
    "How West Coast KBP structures residential construction work from initial intent through evidence, OwnerReview, controlled action, and a reviewable record.",
  lede:
    "Construction questions rarely arrive in a clean sequence. The process creates that sequence deliberately: organize the request, expose what is unknown, prepare a bounded decision, and authorize only the next appropriate action.",
  heroSignal:
    "The process organizes work; it does not guarantee property eligibility, permit approval, cost, schedule, or a construction outcome.",
  stepsHeading: "Every stage produces something the next reviewer can inspect",
  boundaryHeading: "Control improves visibility without replacing official or professional judgment",
  boundaryIntro:
    "The public portal explains the operating model only. It does not collect project information or initiate a business action.",
  steps: [
    {
      sequence: "01",
      title: "Frame the request",
      description:
        "Separate the desired result from property assumptions, implied scope, and unanswered questions.",
      output: "A candidate request with assumptions and exclusions labeled.",
    },
    {
      sequence: "02",
      title: "Assemble evidence",
      description:
        "Identify the official records, existing-condition material, and discipline inputs needed for review.",
      output: "An evidence index with source, date, subject, and missing items visible.",
    },
    {
      sequence: "03",
      title: "Classify uncertainty",
      description:
        "Keep facts, owner preferences, professional questions, conflicts, and unknowns in distinct categories.",
      output: "A review packet that does not smooth gaps into conclusions.",
    },
    {
      sequence: "04",
      title: "OwnerReview",
      description:
        "The owner reviews scope, dependencies, evidence, risks, and the proposed boundary of the next step.",
      output: "An explicit accept, reject, revise, pause, or request-evidence decision.",
    },
    {
      sequence: "05",
      title: "Authorize one bounded action",
      description:
        "Only an approved next step may progress; wider commitments remain outside the authorization.",
      output: "A named action, owner, prerequisites, and stop conditions.",
    },
    {
      sequence: "06",
      title: "Record the result",
      description:
        "Capture a sanitized account of what was accepted or rejected and what remains unresolved.",
      output: "A reviewable record that supports the next decision without storing public-site PII.",
    },
  ],
  boundaries: [
    {
      title: "Official decisions remain official",
      description: `Permit, zoning, code, and property-specific questions stay with the appropriate authority. ${officialVerificationWarning}`,
    },
    {
      title: "Professional questions stay assigned",
      description:
        "Design and construction-discipline judgments are routed to qualified review rather than inferred by the portal.",
    },
    {
      title: "Owner approval remains explicit",
      description:
        "Software may prepare a candidate artifact, but it cannot approve work or make an external commitment.",
    },
    {
      title: "Unknowns remain visible",
      description:
        "Missing information is a recorded state and a stop condition, not an invitation to guess.",
    },
  ],
  faq: [
    {
      question: "Does this process guarantee a permit or construction result?",
      answer: `No. It creates clearer review and control; it does not determine an external outcome. ${officialVerificationWarning}`,
    },
    {
      question: "Can a visitor submit a project through this page?",
      answer:
        "No. The public portal has no form, account, upload, storage, tracking, booking, or message path.",
    },
    {
      question: "Who approves the next action?",
      answer:
        "The owner is the final approval authority. AI and software may organize evidence and prepare a candidate review packet, but they do not approve or trigger business action.",
    },
  ],
} as const satisfies ProcessPage;

export const faqPage = {
  metaTitle: "ADU FAQ",
  title: "Clear ADU answers with the limits stated just as clearly",
  eyebrow: "Sacramento-region ADU FAQ",
  description:
    "Answer-first guidance about ADU types, review boundaries, service area, pricing and schedule policy, and the West Coast KBP operating model.",
  lede:
    "These answers provide orientation, not a property determination. Property-specific, permit, zoning, code, and buildability questions require current official-source and appropriate professional review.",
  heroSignal: `No answer on this page evaluates a parcel or promises an approval, price, schedule, or project outcome. ${officialVerificationWarning}`,
  indexHeading: "Start with the question behind your next decision",
  groups: [
    {
      label: "01 · ADU fundamentals",
      heading: "Understand the terms before applying them to a property",
      description:
        "General orientation for common ADU and garage-conversion questions. Property application remains a separate review step.",
      items: [
        {
          question: "What is an ADU (accessory dwelling unit)?",
          answer:
            "An ADU is generally understood as a secondary dwelling associated with a primary residential property. Common forms include detached, attached, conversion, and junior accessory dwelling units; the definition applicable to a specific property requires current official-source review.",
        },
        {
          question: "What is a garage conversion, and is it different from an ADU?",
          answer: `A garage conversion adapts existing garage space for a different use. Whether a proposed conversion is treated as an ADU, and which requirements apply, depends on current official rules and the property context. ${officialVerificationWarning}`,
        },
        {
          question: "Can an ADU fit on my lot?",
          answer: `This page cannot determine that. Property records, zoning, lot conditions, existing improvements, access, utilities, and applicable official requirements must be reviewed for the specific parcel. ${officialVerificationWarning}`,
        },
      ],
    },
    {
      label: "02 · Planning boundaries",
      heading: "Know which answers require an individual review",
      description:
        "Permit, price, and schedule questions are not converted into website promises. They stay attached to evidence and owner review.",
      items: [
        {
          question: "Do I need a permit to build an ADU in the Sacramento region?",
          answer: `ADU work commonly involves city or county review, but the process and requirements vary by jurisdiction and project. The applicable path must be confirmed with the appropriate local authority. ${officialVerificationWarning}`,
        },
        {
          question: "How much does an ADU cost?",
          answer:
            "The website does not publish or promise prices. Site conditions, scope, selections, professional inputs, and jurisdiction-related items can materially change an estimate; any future estimate must be prepared from project evidence and approved by the owner before a commitment is made.",
        },
        {
          question: "How long does an ADU project take?",
          answer:
            "The website does not publish or promise schedules. Design, review, procurement, site conditions, and construction scope can affect sequencing; any future project plan must be evidence-based and owner-reviewed.",
        },
      ],
    },
    {
      label: "03 · Working model",
      heading: "See how West Coast KBP organizes responsibility",
      description:
        "The differentiator is a visible control structure: candidate artifacts, evidence, OwnerReview, bounded action, and a reviewable record.",
      items: [
        {
          question: "What areas does West Coast KBP serve?",
          answer:
            "The public service area is the Sacramento region, including Roseville, Rocklin, Lincoln, Folsom, Granite Bay, El Dorado Hills, Citrus Heights, and nearby areas.",
        },
        {
          question: "How is West Coast KBP different from a typical contractor?",
          answer:
            "West Coast KBP is building a controlled operating model around visible scope, state, approvals, evidence, and one bounded next action. This describes the workflow design; it is not a guarantee of an external result.",
        },
        {
          question: "Do you work with general contractors and subcontractors?",
          answer:
            "GC and subcontractor coordination is represented as a distinct operating lane, separate from homeowner-facing intake. Specific participation, scope, and commitments require owner review.",
        },
      ],
    },
  ],
} as const satisfies FaqPage;
