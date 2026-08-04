import type { Metadata } from "next";

import ContentHero from "@/src/components/content/ContentHero";
import FaqSection from "@/src/components/content/FaqSection";
import IndexedGrid from "@/src/components/content/IndexedGrid";
import ServiceExplorer from "@/src/components/content/ServiceExplorer";
import { aboutPage, contentPageLabels } from "@/src/lib/contentPages";
import { buildAboutPageJsonLd, serializeJsonLd } from "@/src/lib/structuredData";

export const metadata: Metadata = {
  title: aboutPage.metaTitle,
  description: aboutPage.description,
  alternates: {
    canonical: "/about",
  },
};

export default function AboutRoute() {
  return (
    <main id="main-content" className="site-main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(buildAboutPageJsonLd(aboutPage)),
        }}
      />

      <ContentHero
        eyebrow={aboutPage.eyebrow}
        title={aboutPage.title}
        lede={aboutPage.lede}
        signal={aboutPage.heroSignal}
        parentLabel={contentPageLabels.about}
        parentHref="/about"
      />

      <section className="content-section" aria-labelledby="principles-heading">
        <div className="portal-container content-section__inner">
          <div className="content-section__header content-section__header--wide">
            <p className="content-section__eyebrow">
              {contentPageLabels.aboutTemplate.operatingPrinciples}
            </p>
            <h2 id="principles-heading" className="content-section__title">
              {aboutPage.principlesHeading}
            </h2>
          </div>
          <IndexedGrid items={aboutPage.principles} />
        </div>
      </section>

      <section className="content-section content-section--dark" aria-labelledby="model-heading">
        <div className="portal-container content-section__inner">
          <div className="content-section__header content-section__header--wide">
            <p className="content-section__eyebrow">
              {contentPageLabels.aboutTemplate.constructionOsModel}
            </p>
            <h2 id="model-heading" className="content-section__title">
              {aboutPage.operatingModelHeading}
            </h2>
          </div>
          <IndexedGrid items={aboutPage.operatingModel} className="indexed-grid--dark" />
        </div>
      </section>

      <section className="content-section" aria-labelledby="pending-heading">
        <div className="portal-container content-section__inner review-layout">
          <div className="content-section__header">
            <p className="content-section__eyebrow">
              {contentPageLabels.aboutTemplate.truthBoundary}
            </p>
            <h2 id="pending-heading" className="content-section__title">
              {aboutPage.pendingHeading}
            </h2>
            <p className="content-section__intro">{aboutPage.pendingIntro}</p>
          </div>
          <ul className="review-list">
            {aboutPage.pendingFacts.map((fact, index) => (
              <li key={fact} className="review-list__item">
                <span className="review-list__index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <FaqSection items={aboutPage.faq} />

      <section className="content-section" aria-labelledby="about-services-heading">
        <div className="portal-container content-section__inner">
          <div className="content-section__header content-section__header--wide">
            <p className="content-section__eyebrow">
              {contentPageLabels.aboutTemplate.serviceArchitecture}
            </p>
            <h2 id="about-services-heading" className="content-section__title">
              {aboutPage.servicesHeading}
            </h2>
          </div>
          <ServiceExplorer />
        </div>
      </section>
    </main>
  );
}
