import type { Metadata } from "next";

import ContentHero from "@/src/components/content/ContentHero";
import JourneyExit from "@/src/components/content/JourneyExit";
import { contentPageLabels, faqPage } from "@/src/lib/contentPages";
import { buildFaqPageJsonLd, serializeJsonLd } from "@/src/lib/structuredData";

export const metadata: Metadata = {
  title: faqPage.metaTitle,
  description: faqPage.description,
  alternates: {
    canonical: "/faq",
  },
};

export default function FaqRoute() {
  return (
    <main id="main-content" className="site-main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(buildFaqPageJsonLd(faqPage)),
        }}
      />

      <ContentHero
        eyebrow={faqPage.eyebrow}
        title={faqPage.title}
        lede={faqPage.lede}
        signal={faqPage.heroSignal}
        parentLabel={contentPageLabels.faq}
        parentHref="/faq"
      />

      <section className="content-section" aria-labelledby="faq-index-heading">
        <div className="portal-container content-section__inner">
          <div className="content-section__header content-section__header--wide">
            <p className="content-section__eyebrow">
              {contentPageLabels.faqTemplate.answerIndex}
            </p>
            <h2 id="faq-index-heading" className="content-section__title">
              {faqPage.indexHeading}
            </h2>
          </div>

          <nav aria-label="FAQ topics" className="faq-index">
            {faqPage.groups.map((group, index) => (
              <a key={group.heading} href={`#faq-group-${index + 1}`} className="faq-index__link">
                <span className="faq-index__label">{group.label}</span>
                <span className="faq-index__title">{group.heading}</span>
              </a>
            ))}
          </nav>
        </div>
      </section>

      {faqPage.groups.map((group, index) => (
        <section
          key={group.heading}
          id={`faq-group-${index + 1}`}
          className={
            index % 2 === 0
              ? "content-section content-section--muted"
              : "content-section"
          }
          aria-labelledby={`faq-group-heading-${index + 1}`}
        >
          <div className="portal-container content-section__inner content-section__split">
            <div className="content-section__header">
              <p className="content-section__eyebrow">{group.label}</p>
              <h2 id={`faq-group-heading-${index + 1}`} className="content-section__title">
                {group.heading}
              </h2>
              <p className="content-section__intro">{group.description}</p>
            </div>

            <div className="faq-list">
              {group.items.map((item) => (
                <details key={item.question} className="faq-item">
                  <summary className="faq-item__question">{item.question}</summary>
                  <p className="faq-item__answer">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      ))}

      <JourneyExit route="faq" />
    </main>
  );
}
