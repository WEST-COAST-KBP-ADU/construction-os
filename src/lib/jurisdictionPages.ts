export const officialVerificationWarning = "Requires official source verification.";

export type JurisdictionSlug = "sacramento" | "sacramento-county";

export type OfficialSource = {
  label: string;
  url: string;
};

export type SourcedContentItem = {
  title: string;
  body: string;
  regulatory: boolean;
  sources: readonly OfficialSource[];
};

export type JurisdictionPage = {
  slug: JurisdictionSlug;
  sequence: string;
  shortTitle: string;
  title: string;
  eyebrow: string;
  description: string;
  lede: string;
  reviewSignal: string;
  authorityHeading: string;
  authorityItems: readonly SourcedContentItem[];
  processHeading: string;
  processItems: readonly SourcedContentItem[];
  recordHeading: string;
  recordItems: readonly SourcedContentItem[];
  contextHeading: string;
  contextItems: readonly SourcedContentItem[];
  omissions: readonly string[];
  peerLabel: string;
  peerHref: `/adu-builder/${JurisdictionSlug}`;
  nextStepLabel: string;
  nextStepHref: "/studio";
};

const citySources = {
  adu: {
    label: "City of Sacramento — Accessory Dwelling Units",
    url: "https://www.cityofsacramento.gov/community-development/planning/housing/accessory-dwelling-units",
  },
  application: {
    label: "City of Sacramento — Application for Permit Instructions (CDD-0200)",
    url: "https://www.cityofsacramento.gov/content/dam/portal/cdd/Building/Forms/CDD-0200_Application-for-Building-Permit_Part-I.pdf",
  },
  preapproved: {
    label: "City of Sacramento — Preapproved ADU Program",
    url: "https://www.cityofsacramento.gov/community-development/building/building-programs/preapproved-adu-program-ab1332",
  },
  zoning: {
    label: "Sacramento County GIS — City of Sacramento Zoning layer",
    url: "https://mapservices.gis.saccounty.gov/arcgis/rest/services/CITY_of_SACRAMENTO/MapServer/3",
  },
  boundary: {
    label: "Sacramento County GIS — City Boundaries with Unincorporated layer",
    url: "https://mapservices.gis.saccounty.gov/arcgis/rest/services/POLITICAL/MapServer/3",
  },
  generalPlan: {
    label: "City of Sacramento — 2040 General Plan, Land Use and Placemaking",
    url: "https://www.cityofsacramento.gov/content/dam/portal/cdd/Planning/adopted-2040-general-plan/2040%20GP_2-03_Land%20Use%20and%20Placemaking_Adopted.pdf",
  },
} as const satisfies Record<string, OfficialSource>;

const countySources = {
  guide: {
    label: "Sacramento County — ADU and JADU Zoning Standards guide",
    url: "https://planning.saccounty.gov/content/dam/cd/planning/transition-docs/resources/adu-guide.pdf",
  },
  permits: {
    label: "Sacramento County — Building Permits & Inspection",
    url: "https://development.saccounty.gov/us/en/building-permits-inspection.html",
  },
  shelfReady: {
    label: "Sacramento County — Shelf Ready ADU Plans",
    url: "https://development.saccounty.gov/us/en/building-permits-inspection/news/shelf-ready-adu-plans-now-available.html",
  },
  parcel: {
    label: "Sacramento County GIS — Active GIS Parcel Base",
    url: "https://mapservices.gis.saccounty.gov/arcgis/rest/services/PARCELS/MapServer/8",
  },
  zoning: {
    label: "Sacramento County GIS — County Zoning layer",
    url: "https://mapservices.gis.saccounty.gov/arcgis/rest/services/PLANNING/MapServer/16",
  },
  planningService: {
    label: "Sacramento County GIS — Planning service directory",
    url: "https://mapservices.gis.saccounty.gov/arcgis/rest/services/PLANNING/MapServer",
  },
  boundary: citySources.boundary,
  planning: {
    label: "Sacramento County — Planning & Environmental Review",
    url: "https://planning.saccounty.gov/",
  },
} as const satisfies Record<string, OfficialSource>;

export const jurisdictionPages = [
  {
    slug: "sacramento",
    sequence: "01",
    shortTitle: "City of Sacramento",
    title: "City of Sacramento ADU review starts with the city boundary",
    eyebrow: "Sacramento jurisdiction guide",
    description:
      "Official-source orientation for City of Sacramento ADU authority, permit routing, public GIS records, and unresolved verification limits.",
    lede:
      "A Sacramento mailing address does not establish City jurisdiction. Requires official source verification. This page separates the City permit path from unincorporated Sacramento County and keeps parcel-level conclusions outside the public site.",
    reviewSignal:
      "This page does not determine jurisdiction, zoning, permit status, feasibility, or buildability for a property. Requires official source verification.",
    authorityHeading: "City authority begins only after the incorporated boundary is verified",
    authorityItems: [
      {
        title: "City, not county, land-use authority",
        body: `The City of Sacramento is the relevant local land-use authority only after current official sources place a parcel inside the incorporated City boundary. ${officialVerificationWarning}`,
        regulatory: true,
        sources: [citySources.boundary],
      },
      {
        title: "A boundary result can refuse",
        body: `The official boundary layer publishes City and unincorporated polygons, while zero hits, multiple hits, edge-touching points, discrepancy flags, or disagreement with parcel records remain ambiguous. ${officialVerificationWarning}`,
        regulatory: true,
        sources: [citySources.boundary],
      },
    ],
    processHeading: "The City publishes a building-permit route and City-specific plan resources",
    processItems: [
      {
        title: "Start with the City ADU resource",
        body: `The City ADU page directs readers to its ADU Resource Center and identifies City permit-ready plan resources. ${officialVerificationWarning}`,
        regulatory: true,
        sources: [citySources.adu],
      },
      {
        title: "Submit through the Building Division route",
        body: `The City's permit instructions state that building permit applications are submitted electronically to the City of Sacramento Building Division. ${officialVerificationWarning}`,
        regulatory: true,
        sources: [citySources.application],
      },
      {
        title: "Preapproved does not mean site-approved",
        body: `The City states that a preapproved ADU plan still requires site-specific design and permitting approval, including planning and zoning approval, before permit issuance. ${officialVerificationWarning}`,
        regulatory: true,
        sources: [citySources.preapproved],
      },
    ],
    recordHeading: "The City record is visible, but its provenance and freshness have limits",
    recordItems: [
      {
        title: "City zoning on County infrastructure",
        body: `The City zoning feature layer publishes ZONE, BASE_ZONE, OVERLAY, PUDNAME, SPDNAME, ordinance, and change-date fields from a Sacramento County GIS host. ${officialVerificationWarning}`,
        regulatory: true,
        sources: [citySources.zoning],
      },
      {
        title: "Hosting is not accountability",
        body: `The opened City zoning service metadata does not identify its accountable publisher, and the applicability of City terms to this County-hosted layer remains unresolved. ${officialVerificationWarning}`,
        regulatory: true,
        sources: [citySources.zoning],
      },
      {
        title: "Freshness and completeness are open",
        body: `A publication cadence, exact clipping to current City limits, and complete fire, flood, historic, and specific-plan overlay coverage were not established in the reviewed metadata. ${officialVerificationWarning}`,
        regulatory: true,
        sources: [citySources.zoning, citySources.boundary],
      },
    ],
    contextHeading: "City neighborhoods are not one interchangeable lot pattern",
    contextItems: [
      {
        title: "Neighborhood-specific context",
        body: "The City's 2040 General Plan describes each neighborhood as having a distinct sense of place shaped by buildings, streets, public places, history, and people.",
        regulatory: false,
        sources: [citySources.generalPlan],
      },
      {
        title: "No generic lot assumption",
        body: "The reviewed City sources do not publish a single jurisdiction-wide typical lot size, so this page does not substitute one for neighborhood and parcel evidence.",
        regulatory: false,
        sources: [citySources.generalPlan, citySources.zoning],
      },
    ],
    omissions: [
      "No City review timeline is stated because the reviewed City pages did not publish one for the general ADU path.",
      "No typical lot dimensions are stated because a jurisdiction-wide City value was not published in the reviewed sources.",
      "No parcel, zoning, overlay, permit, or buildability result is produced from this page.",
    ],
    peerLabel: "Read the unincorporated Sacramento County guide",
    peerHref: "/adu-builder/sacramento-county",
    nextStepLabel: "Open the 2D studio",
    nextStepHref: "/studio",
  },
  {
    slug: "sacramento-county",
    sequence: "02",
    shortTitle: "Unincorporated Sacramento County",
    title: "Unincorporated Sacramento County has its own ADU review path",
    eyebrow: "Sacramento County jurisdiction guide",
    description:
      "Official-source orientation for unincorporated Sacramento County ADU authority, County permit routing, public GIS records, and unresolved verification limits.",
    lede:
      "The County path applies to unincorporated territory, not every Sacramento postal address and not parcels inside the City of Sacramento or another incorporated city. Requires official source verification. The first question is therefore jurisdiction, not design.",
    reviewSignal:
      "This page does not determine jurisdiction, zoning, permit status, feasibility, or buildability for a property. Requires official source verification.",
    authorityHeading: "County authority depends on verified unincorporated status",
    authorityItems: [
      {
        title: "Unincorporated territory only",
        body: `Sacramento County's ADU zoning guide instructs readers to confirm that a property is in the unincorporated area before using the County standards. ${officialVerificationWarning}`,
        regulatory: true,
        sources: [countySources.guide],
      },
      {
        title: "Boundary ambiguity remains a refusal",
        body: `The official boundary layer is the primary jurisdiction gate, while edge-touching results, recent annexations, discrepancy flags, and source disagreement remain unresolved rather than assigned to the County. ${officialVerificationWarning}`,
        regulatory: true,
        sources: [countySources.boundary],
      },
    ],
    processHeading: "The County separates zoning guidance from building-permit submission",
    processItems: [
      {
        title: "Read the County zoning guide",
        body: `Sacramento County Planning and Environmental Review publishes a County-specific ADU and JADU guide for unincorporated property. ${officialVerificationWarning}`,
        regulatory: true,
        sources: [countySources.guide, countySources.planning],
      },
      {
        title: "Use the County building-permit route",
        body: `Sacramento County Building Permits & Inspection publishes the County online-permit and building-forms entry points. ${officialVerificationWarning}`,
        regulatory: true,
        sources: [countySources.permits],
      },
      {
        title: "County shelf-ready plans are bounded",
        body: `The County publishes shelf-ready detached ADU plans for residents of unincorporated Sacramento County and states that plan modifications are limited. ${officialVerificationWarning}`,
        regulatory: true,
        sources: [countySources.shelfReady],
      },
    ],
    recordHeading: "County parcel and zoning layers publish different fields and different unknowns",
    recordItems: [
      {
        title: "Countywide parcel base",
        body: `The County parcel layer publishes parcel, lot-size, situs, status, and multiple jurisdiction fields across a countywide extent, including fields outside this page's allowed use. ${officialVerificationWarning}`,
        regulatory: true,
        sources: [countySources.parcel],
      },
      {
        title: "County zoning and planning overlays",
        body: `The County zoning layer publishes base-zone, combined-zone, jurisdiction, and overlay fields, while the planning service also exposes SPA, NPA, flood, fire-hazard, and specific-plan candidate layers. ${officialVerificationWarning}`,
        regulatory: true,
        sources: [countySources.zoning, countySources.planningService],
      },
      {
        title: "Clipping and cadence are unresolved",
        body: `The reviewed metadata does not establish that the County zoning layer is clipped exactly to unincorporated territory, does not publish an update cadence, and does not establish complete overlay coverage. ${officialVerificationWarning}`,
        regulatory: true,
        sources: [countySources.zoning, countySources.boundary],
      },
    ],
    contextHeading: "Unincorporated communities require community-specific context",
    contextItems: [
      {
        title: "One County, varied local patterns",
        body: `Sacramento County planning materials distinguish Special Planning Areas and Neighborhood Preservation Areas, so neighborhood context cannot responsibly be reduced to one County-wide pattern. ${officialVerificationWarning}`,
        regulatory: true,
        sources: [countySources.planning, countySources.planningService],
      },
      {
        title: "No generic lot assumption",
        body: "The reviewed County sources do not publish a single typical lot size for all unincorporated communities, so this page leaves lot character to current official and site-specific evidence.",
        regulatory: false,
        sources: [countySources.guide, countySources.parcel],
      },
    ],
    omissions: [
      "No County review timeline is stated because the reviewed County pages did not publish one for the general ADU path.",
      "No County-wide typical lot dimensions are stated because one value would erase differences among unincorporated communities.",
      "No parcel, zoning, overlay, permit, or buildability result is produced from this page.",
    ],
    peerLabel: "Read the City of Sacramento guide",
    peerHref: "/adu-builder/sacramento",
    nextStepLabel: "Open the 2D studio",
    nextStepHref: "/studio",
  },
] as const satisfies readonly JurisdictionPage[];

export const jurisdictionSlugs = jurisdictionPages.map((page) => page.slug);

export function isJurisdictionSlug(value: string): value is JurisdictionSlug {
  return jurisdictionSlugs.some((slug) => slug === value);
}

export function getJurisdictionPage(slug: JurisdictionSlug): JurisdictionPage {
  const page = jurisdictionPages.find((candidate) => candidate.slug === slug);

  if (!page) {
    throw new Error(`Unknown jurisdiction page: ${slug}`);
  }

  return page;
}

export function buildJurisdictionPageJsonLd(page: JurisdictionPage, siteUrl: string) {
  const url = new URL(`/adu-builder/${page.slug}`, siteUrl).toString();
  const citations = Array.from(
    new Set(
      [
        ...page.authorityItems,
        ...page.processItems,
        ...page.recordItems,
        ...page.contextItems,
      ].flatMap((item) => item.sources.map((source) => source.url)),
    ),
  );

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: page.title,
        description: page.description,
        about: {
          "@type": "AdministrativeArea",
          name: page.shortTitle,
        },
        citation: citations,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: page.shortTitle,
            item: url,
          },
        ],
      },
    ],
  };
}
