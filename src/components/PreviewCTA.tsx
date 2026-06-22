import { siteConfig } from "@/src/lib/siteConfig";

/**
 * Final, preview-only CTA. This is the target of the hero CTA. It is
 * deliberately inert: there is no form, no input, no submission, and no data
 * handling of any kind. The copy states this explicitly so a reviewer can
 * confirm the preview collects nothing until Owner approval.
 */
export default function PreviewCTA() {
  const { cta, sections } = siteConfig;

  return (
    <section
      id="preview-cta"
      aria-labelledby="preview-cta-heading"
      className="w-full scroll-mt-20 bg-zinc-50 dark:bg-zinc-950"
    >
      <div className="mx-auto w-full max-w-5xl px-6 py-20 sm:py-28">
        <div className="relative overflow-hidden rounded-3xl border border-accent/20 bg-white p-8 text-center shadow-sm dark:border-accent/25 dark:bg-zinc-900 sm:p-14">
          <div aria-hidden className="pointer-events-none absolute inset-0 hero-glow" />
          <div className="relative mx-auto max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
              {sections.cta}
            </span>
            <h2
              id="preview-cta-heading"
              className="mt-5 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl"
            >
              {cta.heading}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-zinc-600 dark:text-zinc-300">
              {cta.note}
            </p>
            <span
              aria-disabled="true"
              className="mt-8 inline-flex h-12 w-fit cursor-not-allowed items-center justify-center rounded-full border border-black/[.12] px-7 text-base font-medium text-zinc-400 dark:border-white/[.15] dark:text-zinc-500"
            >
              {cta.label}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
