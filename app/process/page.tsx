import type { Metadata } from "next";

import ContentHero from "@/src/components/content/ContentHero";
import FaqSection from "@/src/components/content/FaqSection";
import IndexedGrid from "@/src/components/content/IndexedGrid";
import { contentPageLabels, processPage } from "@/src/lib/contentPages";
import { buildProcessPageJsonLd, serializeJsonLd } from "@/src/lib/structuredData";

export const metadata: Metadata = {
  title: processPage.metaTitle,
  description: processPage.description,
  alternates: {
    canonical: "/process",
  },
};

export default function ProcessRoute() {
  return (
    <main id="main-content" className="site-main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(buildProcessPageJsonLd(processPage)),
        }}
      />

      <ContentHero
        eyebrow={processPage.eyebrow}
        title={processPage.title}
        lede={processPage.lede}
        signal={processPage.heroSignal}
        parentLabel={contentPageLabels.process}
        parentHref="/process"
      />

      <section className="content-section" aria-labelledby="process-steps-heading">
        <div className="portal-container content-section__inner">
          <div className="content-section__header content-section__header--wide">
            <p className="content-section__eyebrow">
              {contentPageLabels.processTemplate.controlSequence}
            </p>
            <h2 id="process-steps-heading" className="content-section__title">
              {processPage.stepsHeading}
            </h2>
          </div>

          <ol className="process-sequence">
            {processPage.steps.map((step) => (
              <li key={step.sequence} className="process-sequence__item">
                <div className="process-sequence__marker" aria-hidden="true">
                  {step.sequence}
                </div>
                <div className="process-sequence__body">
                  <h3 className="process-sequence__title">{step.title}</h3>
                  <p className="process-sequence__description">{step.description}</p>
                  <div className="process-sequence__output">
                    <span className="process-sequence__output-label">
                      {contentPageLabels.processTemplate.stageOutput}
                    </span>
                    <span>{step.output}</span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="content-section content-section--dark" aria-labelledby="boundaries-heading">
        <div className="portal-container content-section__inner">
          <div className="content-section__header content-section__header--wide">
            <p className="content-section__eyebrow">
              {contentPageLabels.processTemplate.operatingBoundaries}
            </p>
            <h2 id="boundaries-heading" className="content-section__title">
              {processPage.boundaryHeading}
            </h2>
            <p className="content-section__intro">{processPage.boundaryIntro}</p>
          </div>
          <IndexedGrid items={processPage.boundaries} className="indexed-grid--dark" />
        </div>
      </section>

      <FaqSection items={processPage.faq} />
    </main>
  );
}
