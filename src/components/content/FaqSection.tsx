import { contentPageLabels, type FaqItem } from "@/src/lib/contentPages";

export default function FaqSection({ items }: { items: readonly FaqItem[] }) {
  return (
    <section
      id="frequently-asked-questions"
      className="content-section content-section--muted"
      aria-labelledby="faq-heading"
    >
      <div className="portal-container content-section__inner content-section__split">
        <div className="content-section__header">
          <p className="content-section__eyebrow">
            {contentPageLabels.frequentlyAskedQuestions}
          </p>
          <h2 id="faq-heading" className="content-section__title">
            {contentPageLabels.faqHeading}
          </h2>
        </div>

        <div className="faq-list">
          {items.map((item) => (
            <details key={item.question} className="faq-item">
              <summary className="faq-item__question">{item.question}</summary>
              <p className="faq-item__answer">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
