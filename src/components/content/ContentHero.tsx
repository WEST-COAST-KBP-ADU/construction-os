import Link from "next/link";

import { contentPageLabels } from "@/src/lib/contentPages";

export default function ContentHero({
  eyebrow,
  title,
  lede,
  signal,
  parentLabel,
  parentHref,
  sequence,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  signal: string;
  parentLabel: string;
  parentHref: string;
  sequence?: string;
}) {
  return (
    <section className="content-hero" aria-labelledby="content-page-title">
      <div className="portal-container content-hero__inner">
        <nav aria-label="Breadcrumb" className="breadcrumb">
          <Link href="/" className="breadcrumb__link">
            {contentPageLabels.home}
          </Link>
          <span aria-hidden="true" className="breadcrumb__separator">
            /
          </span>
          <Link href={parentHref} className="breadcrumb__link">
            {parentLabel}
          </Link>
        </nav>

        <div className="content-hero__layout">
          <div className="content-hero__copy">
            <p className="content-hero__eyebrow">{eyebrow}</p>
            <h1 id="content-page-title" className="content-hero__title">
              {title}
            </h1>
            <p className="content-hero__lede">{lede}</p>
          </div>

          <aside className="content-hero__signal" aria-label="Review boundary">
            {sequence ? <p className="content-hero__sequence">{sequence}</p> : null}
            <p className="content-hero__signal-label">{contentPageLabels.reviewBoundary}</p>
            <p className="content-hero__signal-copy">{signal}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
