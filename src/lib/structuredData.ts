/**
 * Structured data for search engines and AI assistants.
 * Derived from approved public copy in siteConfig only.
 */

import { siteConfig } from "./siteConfig";
import {
  servicePages,
  type FaqItem,
  type FaqPage,
  type ProcessPage,
  type ServicePage,
} from "./contentPages";

const SERVICE_AREA = [
  "Roseville, CA",
  "Rocklin, CA",
  "Lincoln, CA",
  "Folsom, CA",
  "Granite Bay, CA",
  "El Dorado Hills, CA",
  "Citrus Heights, CA",
  "Sacramento Region, CA",
];

export function buildBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: siteConfig.name,
    url: siteConfig.url,
    slogan: siteConfig.tagline,
    description: siteConfig.description,
    areaServed: SERVICE_AREA.map((name) => ({ "@type": "City", name })),
    knowsAbout: servicePages.map((service) => service.shortTitle),
  };
}

function buildFaqEntities(faq: readonly FaqItem[]) {
  return faq.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  }));
}

function pageUrl(pathname: string): string {
  return new URL(pathname, siteConfig.url).toString();
}

export function buildServicePageJsonLd(page: ServicePage) {
  const url = pageUrl(`/services/${page.slug}`);
  const serviceId = `${url}#service`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": serviceId,
        name: page.shortTitle,
        description: page.description,
        url,
        provider: {
          "@type": "HomeAndConstructionBusiness",
          name: siteConfig.name,
          url: siteConfig.url,
        },
        areaServed: SERVICE_AREA.map((name) => ({ "@type": "City", name })),
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: page.title,
        description: page.description,
        about: { "@id": serviceId },
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        url: `${url}#frequently-asked-questions`,
        mainEntity: buildFaqEntities(page.faq),
      },
    ],
  };
}

export function buildAboutPageJsonLd({
  title,
  description,
  faq,
}: {
  title: string;
  description: string;
  faq: readonly FaqItem[];
}) {
  const url = pageUrl("/about");

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${url}#webpage`,
        url,
        name: title,
        description,
        about: {
          "@type": "HomeAndConstructionBusiness",
          name: siteConfig.name,
          url: siteConfig.url,
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        url: `${url}#frequently-asked-questions`,
        mainEntity: buildFaqEntities(faq),
      },
    ],
  };
}

export function buildComparePageJsonLd({
  title,
  description,
  faq,
}: {
  title: string;
  description: string;
  faq: readonly FaqItem[];
}) {
  const url = pageUrl("/compare");

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: title,
        description,
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        url: `${url}#frequently-asked-questions`,
        mainEntity: buildFaqEntities(faq),
      },
    ],
  };
}

export function buildProcessPageJsonLd(page: ProcessPage) {
  const url = pageUrl("/process");

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: page.title,
        description: page.description,
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        url: `${url}#frequently-asked-questions`,
        mainEntity: buildFaqEntities(page.faq),
      },
    ],
  };
}

export function buildFaqPageJsonLd(page: FaqPage) {
  const url = pageUrl("/faq");
  const faq = page.groups.flatMap((group) => group.items);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: page.title,
        description: page.description,
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        url,
        mainEntity: buildFaqEntities(faq),
      },
    ],
  };
}

export function serializeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
