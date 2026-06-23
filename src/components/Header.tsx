import Link from "next/link";

import { siteConfig } from "@/src/lib/siteConfig";

/**
 * Public site header: brand mark and in-page navigation.
 * Server component — no client-side state or handlers.
 */
export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/[.08] bg-[#F7F6F2]/92 backdrop-blur dark:border-white/[.12] dark:bg-[#1C1B19]/92">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
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

        <nav aria-label="Primary" className="flex items-center gap-3">
          <ul className="hidden items-center gap-5 text-sm font-medium text-zinc-600 dark:text-zinc-300 lg:flex">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-50"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#check-my-lot"
            className="inline-flex h-10 items-center justify-center rounded-full bg-[#1B4332] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#153527]"
          >
            Check My Lot
          </a>
        </nav>
      </div>
    </header>
  );
}
