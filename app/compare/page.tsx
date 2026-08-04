import type { Metadata } from "next";

import ContentHero from "@/src/components/content/ContentHero";
import FaqSection from "@/src/components/content/FaqSection";
import IndexedGrid from "@/src/components/content/IndexedGrid";
import ServiceExplorer from "@/src/components/content/ServiceExplorer";
import { comparePage, contentPageLabels } from "@/src/lib/contentPages";
import { buildComparePageJsonLd, serializeJsonLd } from "@/src/lib/structuredData";

export const metadata: Metadata = {
  title: comparePage.metaTitle,
  description: comparePage.description,
  alternates: {
    canonical: "/compare",
  },
};

export default function CompareRoute() {
  return (
    <main id="main-content" className="site-main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(buildComparePageJsonLd(comparePage)),
        }}
      />

      <ContentHero
        eyebrow={comparePage.eyebrow}
        title={comparePage.title}
        lede={comparePage.lede}
        signal={comparePage.notice}
        parentLabel={contentPageLabels.compare}
        parentHref="/compare"
      />

      <section className="content-section" aria-labelledby="comparison-heading">
        <div className="portal-container content-section__inner">
          <div className="content-section__header content-section__header--wide">
            <p className="content-section__eyebrow">
              {contentPageLabels.compareTemplate.dimensions}
            </p>
            <h2 id="comparison-heading" className="content-section__title">
              {comparePage.comparisonHeading}
            </h2>
          </div>

          <div className="comparison-table-wrap">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th scope="col">{contentPageLabels.compareTemplate.dimension}</th>
                  <th scope="col">{contentPageLabels.compareTemplate.adHocModel}</th>
                  <th scope="col">{contentPageLabels.compareTemplate.controlledModel}</th>
                </tr>
              </thead>
              <tbody>
                {comparePage.rows.map((row) => (
                  <tr key={row.dimension}>
                    <th scope="row">{row.dimension}</th>
                    <td>{row.adHoc}</td>
                    <td>{row.controlled}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="content-section content-section--dark" aria-labelledby="limits-heading">
        <div className="portal-container content-section__inner">
          <div className="content-section__header content-section__header--wide">
            <p className="content-section__eyebrow">
              {contentPageLabels.compareTemplate.limits}
            </p>
            <h2 id="limits-heading" className="content-section__title">
              {comparePage.principlesHeading}
            </h2>
          </div>
          <IndexedGrid items={comparePage.principles} className="indexed-grid--dark" />
        </div>
      </section>

      <FaqSection items={comparePage.faq} />

      <section className="content-section" aria-labelledby="compare-services-heading">
        <div className="portal-container content-section__inner">
          <div className="content-section__header content-section__header--wide">
            <p className="content-section__eyebrow">
              {contentPageLabels.compareTemplate.serviceContext}
            </p>
            <h2 id="compare-services-heading" className="content-section__title">
              {comparePage.servicesHeading}
            </h2>
          </div>
          <ServiceExplorer />
        </div>
      </section>
    </main>
  );
}
