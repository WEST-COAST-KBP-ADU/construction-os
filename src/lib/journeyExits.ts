export const journeyExitRoutes = ["process", "faq", "studio"] as const;

export type JourneyExitRoute = (typeof journeyExitRoutes)[number];

export const journeyExitDestinations = ["/studio", "/process", "/faq"] as const;

export type JourneyExitDestination = (typeof journeyExitDestinations)[number];

export type JourneyExitAction = {
  readonly label: string;
  readonly href: JourneyExitDestination;
};

export type JourneyExit = {
  readonly eyebrow: string;
  readonly headingId: `journey-exit-${JourneyExitRoute}-heading`;
  readonly heading: string;
  readonly intro: string;
  readonly primary: JourneyExitAction;
  readonly secondary: JourneyExitAction;
  readonly boundary: string;
};

export const journeyExitTruthBoundary =
  "Concept Studio is anonymous and does not evaluate a parcel or create an eligibility, buildability, permit, price, or schedule conclusion.";

export const journeyExits = {
  process: {
    eyebrow: "Continue with a bounded next step",
    headingId: "journey-exit-process-heading",
    heading: "Translate the process into a bounded concept",
    intro:
      "Use the Concept Studio to compare design directions without submitting property or contact information, or review the questions that keep official and property-specific decisions separate.",
    primary: {
      label: "Open Concept Studio",
      href: "/studio",
    },
    secondary: {
      label: "Review common questions",
      href: "/faq",
    },
    boundary: journeyExitTruthBoundary,
  },
  faq: {
    eyebrow: "Continue with a bounded next step",
    headingId: "journey-exit-faq-heading",
    heading: "Move from general answers to a bounded concept",
    intro:
      "Use the Concept Studio to compare design directions without turning general guidance into a property conclusion, or review how evidence and decisions stay connected through the process.",
    primary: {
      label: "Open Concept Studio",
      href: "/studio",
    },
    secondary: {
      label: "See the ADU process",
      href: "/process",
    },
    boundary: journeyExitTruthBoundary,
  },
  studio: {
    eyebrow: "Continue with a bounded next step",
    headingId: "journey-exit-studio-heading",
    heading: "Keep the concept connected to the review path",
    intro:
      "Review how a concept moves into evidence-led decision making, or return to the questions that distinguish orientation from a property-specific conclusion.",
    primary: {
      label: "See the ADU process",
      href: "/process",
    },
    secondary: {
      label: "Review common questions",
      href: "/faq",
    },
    boundary: journeyExitTruthBoundary,
  },
} as const satisfies Record<JourneyExitRoute, JourneyExit>;

export function getJourneyExit(route: JourneyExitRoute): JourneyExit {
  return journeyExits[route];
}
