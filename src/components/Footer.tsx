import Link from "next/link";

import { siteConfig } from "@/src/lib/siteConfig";

export default function Footer() {
  const { footer, labels, name, nav, tagline } = siteConfig;

  return (
    <footer className="site-footer">
      <div className="portal-container site-footer__inner">
        <div className="site-footer__lead">
          <p className="footer__eyebrow">West Coast KBP · California</p>
          <p className="footer__statement">Thoughtful space for the way life changes.</p>
        </div>

        <div className="site-footer__top">
          <div className="site-footer__brand">
            <p className="footer__name">{name}</p>
            <p className="footer__tagline">{tagline}</p>
            <p className="footer__trust">{footer.trustProof}</p>
          </div>

          <div className="site-footer__navigation-groups">
            <nav className="footer__navigation" aria-label={labels.explore}>
              <p className="footer__eyebrow">{labels.explore}</p>
              <ul className="footer__links">
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="footer__link">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav className="footer__navigation" aria-label={footer.coverageLabel}>
              <p className="footer__eyebrow">{footer.coverageLabel}</p>
              <ul className="footer__links">
                {footer.coverage.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="footer__link">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="site-footer__legal">
          <p className="footer__preview">{footer.previewNotice}</p>
          <p className="footer__copy">{footer.disclaimer}</p>
          <p className="footer__copy">{footer.noGuarantees}</p>
        </div>

        <p className="footer__copyright">© {name}. {labels.allRightsReserved}</p>
      </div>
    </footer>
  );
}
