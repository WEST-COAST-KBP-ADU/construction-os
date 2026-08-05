import Link from "next/link";

import ContentHero from "./ContentHero";
import type {
  JurisdictionPage,
  SourcedContentItem,
} from "@/src/lib/jurisdictionPages";

function SourcedGrid({
  items,
  className = "",
}: {
  items: readonly SourcedContentItem[];
  className?: string;
}) {
  const classes = ["indexed-grid", className].filter(Boolean).join(" ");

  return (
    <ol className={classes}>
      {items.map((item, index) => (
        <li key={item.title} className="indexed-grid__item">
          <span className="indexed-grid__index" aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="indexed-grid__title">{item.title}</h3>
          <p className="indexed-grid__description">{item.body}</p>
          <p className="indexed-grid__description">
            {item.sources.map((source, sourceIndex) => (
              <span key={source.url}>
                {sourceIndex > 0 ? " · " : null}
                <a href={source.url} rel="noreferrer">
                  {source.label}
                </a>
              </span>
            ))}
          </p>
        </li>
      ))}
    </ol>
  );
}

export default function JurisdictionPageView({ page }: { page: JurisdictionPage }) {
  return (
    <>
      <ContentHero
        eyebrow={page.eyebrow}
        title={page.title}
        lede={page.lede}
        signal={page.reviewSignal}
        parentLabel="ADU Services"
        parentHref="/services/detached-adu"
        sequence={page.sequence}
      />

      <section className="content-section" aria-labelledby="authority-heading">
        <div className="portal-container content-section__inner">
          <div className="content-section__header content-section__header--wide">
            <p className="content-section__eyebrow">Authority boundary</p>
            <h2 id="authority-heading" className="content-section__title">
              {page.authorityHeading}
            </h2>
          </div>
          <SourcedGrid items={page.authorityItems} />
          <p className="content-section__intro">
            <Link href={page.peerHref}>{page.peerLabel}</Link>
          </p>
        </div>
      </section>

      <section className="content-section content-section--muted" aria-labelledby="process-heading">
        <div className="portal-container content-section__inner">
          <div className="content-section__header content-section__header--wide">
            <p className="content-section__eyebrow">Published process</p>
            <h2 id="process-heading" className="content-section__title">
              {page.processHeading}
            </h2>
          </div>
          <SourcedGrid items={page.processItems} />
        </div>
      </section>

      <section className="content-section content-section--dark" aria-labelledby="record-heading">
        <div className="portal-container content-section__inner">
          <div className="content-section__header content-section__header--wide">
            <p className="content-section__eyebrow">Public record boundary</p>
            <h2 id="record-heading" className="content-section__title">
              {page.recordHeading}
            </h2>
          </div>
          <SourcedGrid items={page.recordItems} className="indexed-grid--dark" />
        </div>
      </section>

      <section className="content-section" aria-labelledby="context-heading">
        <div className="portal-container content-section__inner">
          <div className="content-section__header content-section__header--wide">
            <p className="content-section__eyebrow">Local context</p>
            <h2 id="context-heading" className="content-section__title">
              {page.contextHeading}
            </h2>
          </div>
          <SourcedGrid items={page.contextItems} />
        </div>
      </section>

      <section className="content-section content-section--muted" aria-labelledby="omissions-heading">
        <div className="portal-container content-section__inner review-layout">
          <div className="content-section__header">
            <p className="content-section__eyebrow">Deliberate omissions</p>
            <h2 id="omissions-heading" className="content-section__title">
              What this guide does not fill in
            </h2>
          </div>
          <ul className="review-list">
            {page.omissions.map((omission, index) => (
              <li key={omission} className="review-list__item">
                <span className="review-list__index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{omission}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="content-section" aria-labelledby="studio-heading">
        <div className="portal-container content-section__inner content-section__split">
          <div className="content-section__header">
            <p className="content-section__eyebrow">Next step</p>
            <h2 id="studio-heading" className="content-section__title">
              Explore a design direction without a property conclusion
            </h2>
          </div>
          <div className="editorial-copy">
            <p>
              The studio is a deterministic 2D concept tool. It does not inspect a parcel,
              submit a request, or create a permit, zoning, feasibility, or buildability result.
            </p>
            <p>
              <Link href={page.nextStepHref} className="button button--primary">
                {page.nextStepLabel}
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
