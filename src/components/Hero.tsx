import { siteConfig } from "@/src/lib/siteConfig";

/**
 * Homepage hero. Headline, supporting copy, and a placeholder CTA that links
 * to the in-page feasibility-review section. No form handling.
 */
export default function Hero() {
  const { hero } = siteConfig;

  return (
    <section className="w-full border-b border-black/[.06] dark:border-white/[.08]">
      <div className="mx-auto w-full max-w-5xl px-6 py-20 sm:py-28">
        <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {hero.eyebrow}
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
          {hero.heading}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
          {hero.subheading}
        </p>
        <div className="mt-10">
          <a
            href={hero.ctaHref}
            className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-7 text-base font-medium text-zinc-50 transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {hero.ctaLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
