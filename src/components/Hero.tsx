import { siteConfig } from "@/src/lib/siteConfig";

/**
 * Homepage hero. Headline, supporting copy, an in-page CTA to the preview-only
 * section, a secondary in-page link to the process, and an illustrative
 * "project control" panel that conveys milestone visibility.
 *
 * The panel is decorative/illustrative ONLY: it shows generic process phases
 * with illustrative statuses and is explicitly labelled as not a live project.
 * No real data, dates, figures, addresses, or claims appear anywhere here, and
 * there is no form or submission handling.
 */
const STATUS_TONES: Record<string, string> = {
  done: "border-transparent bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900",
  active: "border-accent/30 bg-accent/10 text-accent",
  upcoming:
    "border-black/[.08] bg-transparent text-zinc-400 dark:border-white/[.12] dark:text-zinc-500",
};

// Illustrative-only status per process step, paired with the step list below.
const PANEL = [
  { label: "Complete", tone: "done" },
  { label: "Complete", tone: "done" },
  { label: "In review", tone: "active" },
  { label: "Upcoming", tone: "upcoming" },
  { label: "Upcoming", tone: "upcoming" },
];
const FALLBACK = { label: "Upcoming", tone: "upcoming" };

export default function Hero() {
  const { hero, process } = siteConfig;

  return (
    <section className="relative w-full overflow-hidden border-b border-black/[.06] dark:border-white/[.08]">
      {/* Decorative backdrop — pure CSS, no image assets. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 hero-grid" />
      <div aria-hidden className="pointer-events-none absolute inset-0 hero-glow" />

      <div className="relative mx-auto grid w-full max-w-5xl items-center gap-12 px-6 py-20 sm:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        {/* Left — message */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
            <span aria-hidden className="size-1.5 rounded-full bg-accent" />
            {hero.badge}
          </span>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
            {hero.eyebrow}
          </p>
          <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-[1.08] tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl lg:text-[3.5rem]">
            {hero.heading}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
            {hero.subheading}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={hero.ctaHref}
              className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-7 text-base font-medium text-zinc-50 shadow-sm transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {hero.ctaLabel}
            </a>
            <a
              href={hero.secondaryCtaHref}
              className="inline-flex h-12 items-center justify-center gap-1.5 rounded-full px-5 text-base font-medium text-zinc-700 transition-colors hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
            >
              {hero.secondaryCtaLabel}
              <span aria-hidden>&rarr;</span>
            </a>
          </div>

          <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2">
            {hero.highlights.map((point) => (
              <li
                key={point}
                className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300"
              >
                <span aria-hidden className="size-1.5 rounded-full bg-accent" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* Right — illustrative milestone panel */}
        <div className="relative">
          <div className="rounded-3xl border border-black/[.08] bg-white/90 p-5 shadow-xl shadow-black/[.04] backdrop-blur dark:border-white/[.12] dark:bg-zinc-900/80 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  Project control
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Milestone visibility, end to end
                </p>
              </div>
              <span className="rounded-full border border-black/[.08] px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-zinc-500 dark:border-white/[.12] dark:text-zinc-400">
                Illustrative
              </span>
            </div>

            <ol className="mt-5 space-y-1.5">
              {process.steps.map((step, i) => {
                const status = PANEL[i] ?? FALLBACK;
                const tone = STATUS_TONES[status.tone] ?? STATUS_TONES.upcoming;
                return (
                  <li
                    key={step.step}
                    className="flex items-center gap-3 rounded-xl border border-black/[.05] bg-zinc-50/80 px-3 py-2.5 dark:border-white/[.06] dark:bg-zinc-950/60"
                  >
                    <span className="font-mono text-xs text-zinc-400 dark:text-zinc-500">
                      {step.step}
                    </span>
                    <span className="flex-1 truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {step.title}
                    </span>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[0.7rem] font-medium ${tone}`}
                    >
                      {status.label}
                    </span>
                  </li>
                );
              })}
            </ol>

            <p className="mt-4 text-[0.7rem] leading-5 text-zinc-400 dark:text-zinc-500">
              Illustrative preview — not a live project. No real data, dates, or
              figures are shown.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
