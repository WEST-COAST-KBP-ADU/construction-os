import Link from "next/link";

import { contentPageLabels } from "@/src/lib/contentPages";

/**
 * The canonical leading crumb every content page publishes.
 *
 * It is declared once so the deduplication below compares the parent against
 * the destination this component actually renders, rather than against a
 * second copy of the same literal that could drift away from it.
 */
const homeCrumb = { label: contentPageLabels.home, href: "/" } as const;

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
  /*
   * PRODUCT2-FACADE-BREADCRUMB-DEDUPLICATION-REPAIR-0001.
   *
   * This component renders the canonical `Home` crumb and then the caller's
   * parent crumb. Since the Option 2 facade retired the services section,
   * `ServicePageView` truthfully names the root as its parent — there is no
   * services index to name instead — and the five service pages were rendering
   * `Home / Home`: two adjacent crumbs with one destination between them.
   *
   * The parent slot is suppressed, together with the separator that would
   * otherwise dangle in front of it, exactly when the parent repeats this
   * component's own leading crumb. Both the label and the destination must
   * match: a caller that changes either one is naming a different parent and
   * keeps its second crumb. Nothing here invents a services index, an empty
   * anchor, a self-link, a new route or an alternative label.
   */
  const parentRepeatsHome =
    parentHref === homeCrumb.href && parentLabel === homeCrumb.label;

  return (
    <section className="content-hero" aria-labelledby="content-page-title">
      <div className="portal-container content-hero__inner">
        <nav aria-label="Breadcrumb" className="breadcrumb">
          <Link href={homeCrumb.href} className="breadcrumb__link">
            {homeCrumb.label}
          </Link>
          {parentRepeatsHome ? null : (
            <>
              <span aria-hidden="true" className="breadcrumb__separator">
                /
              </span>
              <Link href={parentHref} className="breadcrumb__link">
                {parentLabel}
              </Link>
            </>
          )}
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
