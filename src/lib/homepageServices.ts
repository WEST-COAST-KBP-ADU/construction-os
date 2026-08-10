import { getServicePage, type ServiceSlug } from "./contentPages";

export type HomepageServiceIcon =
  | "detached"
  | "garage"
  | "attached"
  | "jadu"
  | "addition";

export const homepageServiceSlugs = [
  "detached-adu",
  "garage-conversion",
  "attached-adu",
  "jadu",
] as const satisfies readonly ServiceSlug[];

type HomepageServiceSlug = (typeof homepageServiceSlugs)[number];

type LinkedHomepageServiceDefinition = {
  slug: HomepageServiceSlug;
  description: string;
  ctaLabel: string;
  icon: HomepageServiceIcon;
};

export type LinkedHomepageService = {
  kind: "linked";
  slug: HomepageServiceSlug;
  title: string;
  description: string;
  ctaLabel: string;
  href: `/services/${HomepageServiceSlug}`;
  icon: HomepageServiceIcon;
};

export type UnresolvedHomepageService = {
  kind: "unresolved";
  id: "residential-addition";
  title: "Residential Addition";
  description: string;
  icon: "addition";
  href?: never;
};

export type HomepageService = LinkedHomepageService | UnresolvedHomepageService;

const linkedHomepageServiceDefinitions = [
  {
    slug: "detached-adu",
    description:
      "Private, independent living space for family, guests, or multi-generational use.",
    ctaLabel: "Explore detached ADUs",
    icon: "detached",
  },
  {
    slug: "garage-conversion",
    description:
      "Transform underused space into comfortable, code-conscious living space.",
    ctaLabel: "Explore garage conversions",
    icon: "garage",
  },
  {
    slug: "attached-adu",
    description:
      "Connected space planned to work with the home's architecture and everyday flow.",
    ctaLabel: "Explore attached ADUs",
    icon: "attached",
  },
  {
    slug: "jadu",
    description:
      "A compact way to make more useful space within the home you already have.",
    ctaLabel: "Explore JADUs",
    icon: "jadu",
  },
] as const satisfies readonly LinkedHomepageServiceDefinition[];

const linkedHomepageServices = linkedHomepageServiceDefinitions.map((definition) => {
  const page = getServicePage(definition.slug);

  return {
    kind: "linked",
    slug: definition.slug,
    title: page.shortTitle,
    description: definition.description,
    ctaLabel: definition.ctaLabel,
    href: `/services/${definition.slug}`,
    icon: definition.icon,
  } satisfies LinkedHomepageService;
});

const unresolvedHomepageService = {
  kind: "unresolved",
  id: "residential-addition",
  title: "Residential Addition",
  description:
    "More room, light, and function through an addition that belongs with the home. Dedicated service details are not yet published; route selection remains pending owner review.",
  icon: "addition",
} as const satisfies UnresolvedHomepageService;

export const homepageServices = [
  ...linkedHomepageServices,
  unresolvedHomepageService,
] satisfies readonly HomepageService[];
