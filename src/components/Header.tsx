import Link from "next/link";

import { siteConfig } from "@/src/lib/siteConfig";

/**
 * Public site header: brand mark and in-page navigation.
 * Server component — no client-side state or handlers.
 */
export default function Header() {
  return (
    <header className="w-full border-b border-black/[.08] bg-white/90 backdrop-blur dark:border-white/[.12] dark:bg-black/70">
      <div className="portal-container flex items-center justify-between gap-4 py-4">
        <Link
          href="/"
          className="flex flex-col leading-tight no-underline"
          aria-label={`${siteConfig.name} home`}
        >
          <span className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {siteConfig.name}
          </span>
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {siteConfig.tagline}
          </span>
        </Link>

        <nav aria-label="Primary">
          <ul className="flex items-center gap-4 text-sm font-medium text-zinc-600 dark:text-zinc-300 lg:gap-5">
            {siteConfig.nav.map((item) => (
              <li key={item.href} className="hidden md:block">
                <a
                  href={item.href}
                  className="rounded-sm transition-colors hover:text-zinc-900 dark:hover:text-zinc-50"
                >
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
