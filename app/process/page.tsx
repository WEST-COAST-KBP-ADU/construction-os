import type { Metadata } from "next";

import ContentHero from "@/src/components/content/ContentHero";
import FaqSection from "@/src/components/content/FaqSection";
import IndexedGrid from "@/src/components/content/IndexedGrid";
import JourneyExit from "@/src/components/content/JourneyExit";
import { contentPageLabels, processPage } from "@/src/lib/contentPages";
import { buildProcessPageJsonLd, serializeJsonLd } from "@/src/lib/structuredData";

import styles from "./ProcessJourney.module.css";

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

      <section className="content-section" aria-labelledby="process-stages-heading">
        <div className="portal-container content-section__inner">
          <div className="content-section__header content-section__header--wide">
            <p className="content-section__eyebrow">
              {contentPageLabels.processTemplate.constructionJourney}
            </p>
            <h2 id="process-stages-heading" className="content-section__title">
              {processPage.stagesHeading}
            </h2>
            <p className="content-section__intro">{processPage.stagesIntro}</p>
          </div>

          <ol className={styles.journey}>
            {processPage.stages.map((stage) => (
              <li key={stage.sequence} className={styles.stage}>
                <p className={styles.marker} aria-hidden="true">
                  {stage.sequence}
                </p>
                <div className={styles.body}>
                  <h3 className={styles.title}>{stage.title}</h3>

                  <div className={styles.questionBlock}>
                    <span className={styles.questionLabel}>
                      {contentPageLabels.processTemplate.stageQuestion}
                    </span>
                    <p className={styles.question}>{stage.question}</p>
                  </div>

                  <p className={styles.description}>{stage.description}</p>

                  <dl className={styles.facts}>
                    <div className={styles.fact}>
                      <dt className={styles.factLabel}>
                        {contentPageLabels.processTemplate.stageResponsible}
                      </dt>
                      <dd className={styles.factValue}>{stage.responsibleParty}</dd>
                    </div>
                    <div className={styles.fact}>
                      <dt className={styles.factLabel}>
                        {contentPageLabels.processTemplate.stageOutput}
                      </dt>
                      <dd className={styles.factValue}>{stage.output}</dd>
                    </div>
                    <div className={`${styles.fact} ${styles.factBlocking}`}>
                      <dt className={styles.factLabel}>
                        {contentPageLabels.processTemplate.stageBlocker}
                      </dt>
                      <dd className={styles.factValue}>{stage.blocker}</dd>
                    </div>
                  </dl>
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
      <JourneyExit route="process" />
    </main>
  );
}
