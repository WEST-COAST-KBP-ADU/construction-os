import { siteConfig } from "@/src/lib/siteConfig";

/**
 * CSLB-safe footer.
 *
 * Carries the required compliance copy: a CSLB license placeholder, the
 * general-information disclaimer, and an explicit "no guarantees" note, plus
 * in-page navigation and the service-area list. All strings come from
 * siteConfig so legal review has a single place to look.
 */
export default function Footer() {
  const { footer, name, tagline, nav, serviceAreas } = siteConfig;

  return (
    <footer className="mt-auto w-full border-t border-black/[.08] bg-zinc-50 dark:border-white/[.12] dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-5xl px-6 py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {name}
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {tagline}
            </p>
            <p className="mt-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {footer.cslbLicense}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
              Explore
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
              Service areas
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {serviceAreas.map((area) => (
                <li
                  key={area}
                  className="rounded-full border border-black/[.08] bg-white px-2.5 py-0.5 text-xs text-zinc-600 dark:border-white/[.12] dark:bg-zinc-900 dark:text-zinc-300"
                >
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 space-y-3 border-t border-black/[.06] pt-8 text-xs leading-6 text-zinc-500 dark:border-white/[.08] dark:text-zinc-400">
          <p className="font-medium text-zinc-600 dark:text-zinc-300">
            {footer.previewNotice}
          </p>
          <p>{footer.disclaimer}</p>
          <p>{footer.noGuarantees}</p>
        </div>

        <p className="mt-8 text-xs text-zinc-400 dark:text-zinc-500">
          &copy; {name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
