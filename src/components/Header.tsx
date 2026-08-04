import Link from "next/link";

import { siteConfig } from "@/src/lib/siteConfig";

export default function Header() {
  const { accessibility, name, nav, tagline } = siteConfig;

  return (
    <header className="site-header">
      <div className="portal-container site-header__inner">
        <Link href="/" className="brand" aria-label={accessibility.brandHomeLabel}>
          <span className="brand__name">{name}</span>
          <span className="brand__tagline">{tagline}</span>
        </Link>

        <nav aria-label={accessibility.primaryNavigationLabel} className="site-nav">
          <ul className="site-nav__list">
            {nav.map((item) => (
              <li key={item.href} className="site-nav__item">
                <a href={item.href} className="site-nav__link">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
