import { siteConfig } from "@/src/lib/siteConfig";

export default function Hero() {
  const { hero } = siteConfig;

  return (
    <section className="relative w-full overflow-hidden border-b border-black/[.06] bg-[#F7F6F2] dark:border-white/[.08] dark:bg-[#1C1B19]">
      <div aria-hidden className="pointer-events-none absolute inset-0 hero-grid" />
      <div aria-hidden className="pointer-events-none absolute inset-0 hero-glow" />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.04fr_0.96fr] lg:gap-16">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#C9A84C]/40 bg-[#C9A84C]/10 px-3 py-1 text-xs font-semibold text-[#1B4332] dark:text-[#F7F6F2]">
            <span aria-hidden className="size-1.5 rounded-full bg-[#C9A84C]" />
            {hero.badge}
          </span>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#7A7974] dark:text-zinc-400">
            {hero.eyebrow}
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.06] tracking-tight text-[#1C1B19] dark:text-zinc-50 sm:text-5xl lg:text-[4rem]">
            {hero.heading}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-700 dark:text-zinc-300">
            {hero.subheading}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={hero.ctaHref}
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#1B4332] px-7 text-base font-semibold text-white shadow-sm transition-colors hover:bg-[#153527]"
            >
              {hero.ctaLabel}
            </a>
            <a
              href={hero.secondaryCtaHref}
              className="inline-flex h-12 items-center justify-center gap-1.5 rounded-full border border-[#D4D1CA] bg-white/70 px-5 text-base font-semibold text-[#1C1B19] transition-colors hover:border-[#C9A84C] dark:border-white/[.14] dark:bg-white/[.04] dark:text-zinc-50"
            >
              {hero.secondaryCtaLabel}
              <span aria-hidden>&rarr;</span>
            </a>
          </div>

          <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2">
            {hero.highlights.map((point) => (
              <li
                key={point}
                className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300"
              >
                <span aria-hidden className="size-1.5 rounded-full bg-[#C9A84C]" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="rounded-3xl border border-[#D4D1CA] bg-white/92 p-5 shadow-xl shadow-black/[.05] backdrop-blur dark:border-white/[.12] dark:bg-zinc-900/80 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#1C1B19] dark:text-zinc-50">
                  Check My Lot intake path
                </p>
                <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                  Frontend-only v0.1. Manual review before any commitment.
                </p>
              </div>
              <span className="rounded-full border border-[#C9A84C]/40 bg-[#C9A84C]/10 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-[#1B4332] dark:text-[#F7F6F2]">
                v0.1
              </span>
            </div>

            <ol className="mt-5 space-y-2">
              {[
                "Property address",
                "ADU type and project goal",
                "Budget and timing range",
                "Owner/admin review",
              ].map((item, i) => (
                <li
                  key={item}
                  className="flex items-center gap-3 rounded-xl border border-black/[.06] bg-[#F7F6F2] px-3 py-3 dark:border-white/[.08] dark:bg-zinc-950/60"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#1B4332] font-mono text-xs font-semibold text-white">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-medium text-[#1C1B19] dark:text-zinc-200">
                    {item}
                  </span>
                </li>
              ))}
            </ol>

            <p className="mt-5 rounded-2xl border border-[#D4D1CA] bg-white p-4 text-xs leading-5 text-zinc-600 dark:border-white/[.10] dark:bg-zinc-900 dark:text-zinc-400">
              Preliminary review only. Final feasibility, pricing, timeline, and
              permit path require site, jurisdiction, utility, and code verification.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
