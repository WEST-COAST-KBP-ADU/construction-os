import { siteConfig } from "@/src/lib/siteConfig";

/**
 * Homepage hero. Static pre-launch copy and safe anchor CTAs only.
 */
export default function Hero() {
  const { hero } = siteConfig;

  return (
    <section className="w-full border-b border-black/[.06] bg-stone-50 dark:border-white/[.08] dark:bg-zinc-950">
      <div className="mx-auto grid w-full max-w-5xl gap-10 px-6 py-16 sm:py-20 lg:grid-cols-[1fr_320px] lg:items-center">
        <div>
          <p className="inline-flex rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-900 dark:border-amber-500/50 dark:bg-amber-400/10 dark:text-amber-200">
            {hero.eyebrow}
          </p>
          <p className="mt-5 text-base font-semibold text-zinc-700 dark:text-zinc-200">
            {siteConfig.name}
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-5xl">
            {hero.heading}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-700 dark:text-zinc-300">
            {hero.subheading}
          </p>
          <p className="mt-5 max-w-3xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
            {hero.direction}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href={hero.primaryCtaHref}
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              {hero.primaryCtaLabel}
            </a>
            <a
              href={hero.secondaryCtaHref}
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:border-zinc-500"
            >
              {hero.secondaryCtaLabel}
            </a>
          </div>
        </div>

        <aside className="border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Launch status
          </p>
          <p className="mt-4 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Public preview only
          </p>
          <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            Contact activation, live intake, appointment booking, and lead
            capture come only after Owner launch approval.
          </p>
          <p className="mt-5 border-t border-zinc-200 pt-5 text-sm font-medium text-zinc-700 dark:border-zinc-800 dark:text-zinc-200">
            No address field. No phone number. No email capture. No form
            submit.
          </p>
        </aside>
      </div>
    </section>
  );
}
