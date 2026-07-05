import ControlPanelPreview from "@/src/components/ControlPanelPreview";
import { siteConfig } from "@/src/lib/siteConfig";

export default function Hero() {
  const { hero } = siteConfig;

  return (
    <section className="relative w-full overflow-hidden border-b border-black/[.06] bg-white dark:border-white/[.08] dark:bg-zinc-950">
      <div aria-hidden className="pointer-events-none absolute inset-0 hero-grid" />

      <div className="portal-container relative grid items-center gap-10 py-16 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <div>
          <span className="inline-flex items-center gap-2 rounded-md border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
            <span aria-hidden className="size-1.5 rounded-full bg-accent" />
            {hero.badge}
          </span>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
            {hero.eyebrow}
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-5xl lg:text-[3.4rem]">
            {hero.heading}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
            {hero.subheading}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a href={hero.ctaHref} className="portal-link-button">
              {hero.ctaLabel}
            </a>
            <a href={hero.secondaryCtaHref} className="portal-link-button-secondary gap-2">
              {hero.secondaryCtaLabel}
              <span aria-hidden>&rarr;</span>
            </a>
          </div>

          <ul className="mt-8 grid gap-2 text-sm text-zinc-600 dark:text-zinc-300 sm:grid-cols-3">
            {hero.highlights.map((point) => (
              <li key={point} className="flex items-start gap-2">
                <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <ControlPanelPreview
          compact
          objectId={hero.panel.label}
          title={hero.panel.title}
          status={hero.panel.status}
          items={hero.panel.rows.map((row) => ({ ...row, tone: "preview" as const }))}
        />
      </div>
    </section>
  );
}
