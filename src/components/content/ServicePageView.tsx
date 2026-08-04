import Link from "next/link";

import ContentHero from "./ContentHero";
import FaqSection from "./FaqSection";
import IndexedGrid from "./IndexedGrid";
import ServiceExplorer from "./ServiceExplorer";
import {
  contentPageLabels,
  getServicePage,
  type ServicePage,
} from "@/src/lib/contentPages";

export default function ServicePageView({ page }: { page: ServicePage }) {
  const relatedPages = page.relatedSlugs.map(getServicePage);

  return (
    <>
      <ContentHero
        eyebrow={page.eyebrow}
        title={page.title}
        lede={page.lede}
        signal={page.reviewSignal}
        parentLabel={contentPageLabels.services}
        parentHref="/#services"
        sequence={page.sequence}
      />

      <section className="content-section" aria-labelledby="orientation-heading">
        <div className="portal-container content-section__inner content-section__split">
          <div className="content-section__header">
            <p className="content-section__eyebrow">
              {contentPageLabels.serviceTemplate.orientation}
            </p>
            <h2 id="orientation-heading" className="content-section__title">
              {page.orientation.heading}
            </h2>
          </div>
          <div className="editorial-copy">
            {page.orientation.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="content-section content-section--dark" aria-labelledby="scope-heading">
        <div className="portal-container content-section__inner">
          <div className="content-section__header content-section__header--wide">
            <p className="content-section__eyebrow">
              {contentPageLabels.serviceTemplate.scopeAnatomy}
            </p>
            <h2 id="scope-heading" className="content-section__title">
              {page.scopeHeading}
            </h2>
          </div>
          <IndexedGrid items={page.scopeItems} className="indexed-grid--dark" />
        </div>
      </section>

      <section className="content-section" aria-labelledby="review-inputs-heading">
        <div className="portal-container content-section__inner review-layout">
          <div className="content-section__header">
            <p className="content-section__eyebrow">
              {contentPageLabels.serviceTemplate.evidenceNeeds}
            </p>
            <h2 id="review-inputs-heading" className="content-section__title">
              {page.reviewHeading}
            </h2>
            <p className="content-section__intro">{page.reviewIntro}</p>
          </div>
          <ul className="review-list">
            {page.reviewInputs.map((input, index) => (
              <li key={input} className="review-list__item">
                <span className="review-list__index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{input}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="content-section content-section--muted" aria-labelledby="pathway-heading">
        <div className="portal-container content-section__inner">
          <div className="content-section__header content-section__header--wide">
            <p className="content-section__eyebrow">
              {contentPageLabels.serviceTemplate.decisionPath}
            </p>
            <h2 id="pathway-heading" className="content-section__title">
              {contentPageLabels.serviceTemplate.pathwayHeading}
            </h2>
          </div>
          <IndexedGrid items={page.pathway} />
        </div>
      </section>

      <FaqSection items={page.faq} />

      <section className="content-section" aria-labelledby="related-services-heading">
        <div className="portal-container content-section__inner">
          <div className="content-section__header content-section__header--wide">
            <p className="content-section__eyebrow">
              {contentPageLabels.serviceTemplate.relatedServices}
            </p>
            <h2 id="related-services-heading" className="content-section__title">
              {contentPageLabels.serviceTemplate.relatedHeading}
            </h2>
          </div>
          <div className="related-grid">
            {relatedPages.map((related) => (
              <Link
                key={related.slug}
                href={`/services/${related.slug}`}
                className="related-link"
              >
                <span className="related-link__index">{related.sequence}</span>
                <span className="related-link__title">{related.shortTitle}</span>
                <span className="related-link__description">{related.description}</span>
                <span className="related-link__action">{contentPageLabels.openServicePage}</span>
              </Link>
            ))}
          </div>
          <ServiceExplorer currentSlug={page.slug} />
        </div>
      </section>
    </>
  );
}
