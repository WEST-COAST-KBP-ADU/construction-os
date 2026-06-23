import { siteConfig } from "@/src/lib/siteConfig";

/**
 * Preview-safe footer. All strings come from siteConfig so review has a single
 * place to inspect public-facing statements.
 */
export default function Footer() {
  const { footer, name, tagline, nav } = siteConfig;

  return (
    <footer className="mt-auto w-full border-t border-black/[.08] bg-zinc-50 dark:border-white/[.12] dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-5xl px-6 py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-[1.5fr_0.7fr]">
          <div>
            <p className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {name}
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {tagline}
            </p>
            <p className="mt-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {footer.trustProof}
            </p>
          </div>

          <div className="sm:justify-self-end">
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
