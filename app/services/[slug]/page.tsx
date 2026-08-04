import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ServicePageView from "@/src/components/content/ServicePageView";
import {
  getServicePage,
  isServiceSlug,
  servicePages,
  type ServicePage,
} from "@/src/lib/contentPages";
import { buildServicePageJsonLd, serializeJsonLd } from "@/src/lib/structuredData";

type ServiceRouteProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return servicePages.map((page) => ({ slug: page.slug }));
}

async function resolveServicePage(params: ServiceRouteProps["params"]): Promise<ServicePage> {
  const { slug } = await params;

  if (!isServiceSlug(slug)) {
    notFound();
  }

  return getServicePage(slug);
}

export async function generateMetadata({ params }: ServiceRouteProps): Promise<Metadata> {
  const page = await resolveServicePage(params);

  return {
    title: page.shortTitle,
    description: page.description,
    alternates: {
      canonical: `/services/${page.slug}`,
    },
  };
}

export default async function ServiceRoute({ params }: ServiceRouteProps) {
  const page = await resolveServicePage(params);

  return (
    <main id="main-content" className="site-main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildServicePageJsonLd(page)) }}
      />
      <ServicePageView page={page} />
    </main>
  );
}
