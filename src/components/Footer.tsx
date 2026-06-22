import { siteConfig } from "@/src/lib/siteConfig";

/**
 * CSLB-safe footer.
 *
 * Carries the required compliance copy: a CSLB license placeholder, the
 * general-information disclaimer, and an explicit "no guarantees" note. All
 * strings come from siteConfig so legal review has a single place to look.
 */
export default function Footer() {
  const { footer, name } = siteConfig;

  return (
    <footer className="mt-auto w-full border-t border-black/[.08] bg-zinc-50 dark:border-white/[.12] dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-5xl px-6 py-12">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {name}
          </p>
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {footer.cslbLicense}
          </p>
        </div>

        <div className="mt-6 space-y-3 text-xs leading-6 text-zinc-500 dark:text-zinc-400">
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
