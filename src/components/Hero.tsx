import { siteConfig } from "@/src/lib/siteConfig";

export default function Hero() {
  const { hero } = siteConfig;

  return (
    <section className="relative w-full overflow-hidden border-b border-[#E7DFD0] bg-[#FAF7F0] dark:border-white/[.08] dark:bg-[#1F211D]">
      <div aria-hidden className="pointer-events-none absolute inset-0 hero-glow" />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.04fr_0.96fr] lg:gap-16">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#C7A45D]/35 bg-white/65 px-3 py-1 text-xs font-semibold text-[#294C3A] shadow-sm shadow-black/[.03] dark:bg-white/[.06] dark:text-[#F6F1E7]">
            <span aria-hidden className="size-1.5 rounded-full bg-[#C7A45D]" />
            {hero.badge}
          </span>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#756F64] dark:text-zinc-400">
            {hero.eyebrow}
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.06] tracking-tight text-[#221F1B] dark:text-zinc-50 sm:text-5xl lg:text-[4rem]">
            {hero.heading}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#625D54] dark:text-zinc-300">
            {hero.subheading}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={hero.ctaHref}
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#294C3A] px-7 text-base font-semibold text-white shadow-sm shadow-[#294C3A]/20 transition-colors hover:bg-[#203D2E]"
            >
              {hero.ctaLabel}
            </a>
            <a
              href={hero.secondaryCtaHref}
              className="inline-flex h-12 items-center justify-center gap-1.5 rounded-full border border-[#DED4C1] bg-white/70 px-5 text-base font-semibold text-[#221F1B] transition-colors hover:border-[#C7A45D] dark:border-white/[.14] dark:bg-white/[.04] dark:text-zinc-50"
            >
              {hero.secondaryCtaLabel}
              <span aria-hidden>&rarr;</span>
            </a>
          </div>

          <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2">
            {hero.highlights.map((point) => (
              <li
                key={point}
                className="flex items-center gap-2 text-sm text-[#625D54] dark:text-zinc-300"
              >
                <span aria-hidden className="size-1.5 rounded-full bg-[#C7A45D]" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="rounded-[1.75rem] border border-[#E1D7C6] bg-white/82 p-4 shadow-2xl shadow-[#6B5A3D]/[.08] backdrop-blur dark:border-white/[.12] dark:bg-zinc-900/78 sm:p-5">
            <div
              aria-hidden
              className="relative aspect-[4/3] overflow-hidden rounded-[1.35rem] bg-[#EDE4D3]"
            >
              <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(250,247,240,0.9),rgba(224,211,188,0.78)_50%,rgba(41,76,58,0.18))]" />
              <div className="absolute left-[9%] top-[16%] h-[62%] w-[82%] rounded-t-[44%] bg-white/45 shadow-inner shadow-white/40" />
              <div className="absolute bottom-[14%] left-[12%] h-[34%] w-[76%] rounded-t-3xl bg-[#F7F0E3] shadow-xl shadow-[#6B5A3D]/10" />
              <div className="absolute bottom-[33%] left-[18%] h-[18%] w-[28%] rounded-t-2xl bg-[#294C3A]/85" />
              <div className="absolute bottom-[33%] right-[18%] h-[18%] w-[28%] rounded-t-2xl bg-white/70" />
              <div className="absolute bottom-[14%] left-[12%] h-2 w-[76%] bg-[#C7A45D]/70" />
            </div>

            <div className="mt-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#221F1B] dark:text-zinc-50">
                  Start with your property
                </p>
                <p className="mt-1 text-xs leading-5 text-[#756F64] dark:text-zinc-400">
                  A simple first step for homeowners exploring an ADU.
                </p>
              </div>
              <span className="rounded-full border border-[#C7A45D]/35 bg-[#C7A45D]/10 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-[#294C3A] dark:text-[#F7F6F2]">
                ADU
              </span>
            </div>

            <ol className="mt-5 space-y-2">
              {[
                "Share your address",
                "Choose the ADU vision",
                "Set budget and timing",
                "Get a thoughtful next step",
              ].map((item, i) => (
                <li
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-[#EEE4D3] bg-[#FBF8F2] px-3 py-3 dark:border-white/[.08] dark:bg-zinc-950/60"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#294C3A] font-mono text-xs font-semibold text-white">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-medium text-[#221F1B] dark:text-zinc-200">
                    {item}
                  </span>
                </li>
              ))}
            </ol>

            <p className="mt-5 rounded-2xl border border-[#E9DDC9] bg-white/72 p-4 text-xs leading-5 text-[#6C665D] dark:border-white/[.10] dark:bg-zinc-900 dark:text-zinc-400">
              Preliminary review only. Final feasibility, pricing, timeline, and permit path
              depend on the site, jurisdiction, utilities, and code requirements.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
