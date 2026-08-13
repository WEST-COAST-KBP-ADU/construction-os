import Link from "next/link";

import { siteConfig } from "@/src/lib/siteConfig";

const primaryNavigation = [
  { label: "Models", href: "/models" },
  { label: "Concept Studio", href: "/studio" },
  { label: "ADU Process", href: "/process" },
  { label: "Service Areas", href: "/service-areas" },
  { label: "About", href: "/about" },
  { label: "Explore models", href: "/models", cta: true },
] as const;

function NavigationLinks({ mobile = false }: { mobile?: boolean }) {
  return (
    <ul className={mobile ? "site-nav-mobile__list" : "site-nav__list"}>
      {primaryNavigation.map((item) => {
        const isCta = "cta" in item && item.cta;

        return (
          <li key={item.label}>
            <Link
              href={item.href}
              className={[
                mobile ? "site-nav-mobile__link" : "site-nav__link",
                isCta
                  ? mobile
                    ? "site-nav-mobile__link--cta"
                    : "site-nav__link--cta"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default function Header() {
  const { accessibility, name, tagline } = siteConfig;

  return (
    <header className="site-header">
      <div className="portal-container site-header__inner">
        {/* P2-PRESENTATION-CHROME-0001: Product 2's identity is typographic
            only. The former brand-seal was Product 1's signal device and is
            not substituted by another icon, dot, monogram, or badge here. */}
        <Link href="/" className="brand" aria-label={accessibility.brandHomeLabel}>
          <span className="brand__wordmark">
            <span className="brand__name">{name}</span>
            <span className="brand__tagline">{tagline}</span>
          </span>
        </Link>

        <nav aria-label={accessibility.primaryNavigationLabel} className="site-nav">
          <NavigationLinks />
        </nav>

        <details className="site-nav-mobile">
          <summary aria-label="Open navigation">
            <span>Menu</span>
            <span className="site-nav-mobile__icon" aria-hidden="true" />
          </summary>
          <nav aria-label="Mobile navigation" className="site-nav-mobile__panel">
            <NavigationLinks mobile />
          </nav>
        </details>
      </div>
    </header>
  );
}
