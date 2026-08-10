import type { Metadata } from "next";
import Link from "next/link";

import {
  jurisdictionPages,
  officialVerificationWarning,
  type JurisdictionPage,
  type OfficialSource,
} from "@/src/lib/jurisdictionPages";

export const metadata: Metadata = {
  title: "Service areas",
  description:
    "Choose between the existing City of Sacramento and unincorporated Sacramento County context guides without treating either route as an eligibility result.",
  alternates: {
    canonical: "/service-areas",
  },
};

function sourcesFor(page: JurisdictionPage): OfficialSource[] {
  const sources = new Map<string, OfficialSource>();

  for (const item of [
    ...page.authorityItems,
    ...page.processItems,
    ...page.recordItems,
    ...page.contextItems,
  ]) {
    for (const source of item.sources) {
      sources.set(source.url, source);
    }
  }

  return [...sources.values()];
}

export default function ServiceAreasPage() {
  return (
    <main id="main-content" className="site-main spine-home">
      <section className="model-page-hero" aria-labelledby="service-areas-title">
        <div className="portal-container model-page-hero__inner">
          <p className="spine-kicker">Jurisdiction context</p>
          <h1 id="service-areas-title">Choose a context guide before treating a place as an answer.</h1>
          <p>
            City of Sacramento and unincorporated Sacramento County are separate official-source
            contexts. Selecting one opens orientation material; it does not establish jurisdiction,
            eligibility, parcel fit, permit status, or buildability.
          </p>
        </div>
      </section>

      <section
        id="jurisdiction-selector"
        className="spine-section"
        aria-labelledby="jurisdiction-selector-title"
      >
        <div className="portal-container spine-section__inner">
          <div className="spine-section__header">
            <p className="spine-kicker">Service-area selector</p>
            <h2 id="jurisdiction-selector-title">Two separate records, each with its own sources</h2>
            <p>
              Official-source links from the existing records are retained below. A source date or
              update cadence is not inferred when the existing record does not publish one.
            </p>
          </div>
          <ol className="service-area-selector">
            {jurisdictionPages.map((page) => {
              const sources = sourcesFor(page);

              return (
                <li key={page.slug} className="service-area-card">
                  <p className="service-area-card__index">{page.sequence}</p>
                  <h3>{page.shortTitle}</h3>
                  <p>{page.lede}</p>
                  <p className="service-area-card__boundary">{page.reviewSignal}</p>
                  <div>
                    <h4>Official sources in this record</h4>
                    <ul>
                      {sources.map((source) => (
                        <li key={source.url}>
                          <a href={source.url} rel="noreferrer">
                            {source.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link href={`/adu-builder/${page.slug}`} className="text-link">
                    Open {page.shortTitle} context <span aria-hidden="true">→</span>
                  </Link>
                </li>
              );
            })}
          </ol>
          <p className="service-area-selector__notice">{officialVerificationWarning}</p>
        </div>
      </section>
    </main>
  );
}
