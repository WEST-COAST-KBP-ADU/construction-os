import Link from "next/link";

import { siteConfig } from "@/src/lib/siteConfig";

export default function Header() {
  const { accessibility, name } = siteConfig;

  return (
    <header className="site-header">
      <div className="portal-container site-header__inner">
        {/* Issue #360: one typographic identity and no launcher into visually
            unaccepted legacy routes. No icon, mark, badge, menu, or decorative
            logo substitutes for the removed navigation. */}
        <Link href="/" className="brand" aria-label={accessibility.brandHomeLabel}>
          <span className="brand__name">{name}</span>
        </Link>
      </div>
    </header>
  );
}
