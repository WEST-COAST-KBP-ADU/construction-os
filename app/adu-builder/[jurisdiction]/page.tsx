import type { Metadata } from "next";
import { notFound } from "next/navigation";

import JurisdictionPageView from "@/src/components/content/JurisdictionPageView";
import {
  buildJurisdictionPageJsonLd,
  getJurisdictionPage,
  isJurisdictionSlug,
  jurisdictionPages,
  type JurisdictionPage,
} from "@/src/lib/jurisdictionPages";
import { serializeJsonLd } from "@/src/lib/structuredData";
import { siteConfig } from "@/src/lib/siteConfig";

type JurisdictionRouteProps = {
  params: Promise<{ jurisdiction: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return jurisdictionPages.map((page) => ({ jurisdiction: page.slug }));
}

async function resolveJurisdictionPage(
  params: JurisdictionRouteProps["params"],
): Promise<JurisdictionPage> {
  const { jurisdiction } = await params;

  if (!isJurisdictionSlug(jurisdiction)) {
    notFound();
  }

  return getJurisdictionPage(jurisdiction);
}

export async function generateMetadata({ params }: JurisdictionRouteProps): Promise<Metadata> {
  const page = await resolveJurisdictionPage(params);

  return {
    title: page.shortTitle,
    description: page.description,
    alternates: {
      canonical: `/adu-builder/${page.slug}`,
    },
  };
}

export default async function JurisdictionRoute({ params }: JurisdictionRouteProps) {
  const page = await resolveJurisdictionPage(params);

  return (
    <main id="main-content" className="site-main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(buildJurisdictionPageJsonLd(page, siteConfig.url)),
        }}
      />
      <JurisdictionPageView page={page} />
    </main>
  );
}
