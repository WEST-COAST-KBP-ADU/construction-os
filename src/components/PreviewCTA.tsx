import { siteConfig } from "@/src/lib/siteConfig";

/**
 * Final, preview-only CTA. This is the target of the hero CTA. It is
 * deliberately inert: there is no form, no input, no submission, and no data
 * handling of any kind. The copy states this explicitly so a reviewer can
 * confirm the preview collects nothing until Owner approval.
 */
export default function PreviewCTA() {
  const { cta } = siteConfig;

  return (
    <section
      id="preview-cta"
      aria-labelledby="preview-cta-heading"
      className="w-full scroll-mt-20 border-t border-black/[.06] dark:border-white/[.08]"
    >
      <div className="mx-auto w-full max-w-5xl px-6 py-16 sm:py-20">
        <h2
          id="preview-cta-heading"
          className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl"
        >
          {cta.heading}
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-300">
          {cta.note}
        </p>
        <span
          aria-disabled="true"
          className="mt-8 inline-flex h-12 w-fit cursor-not-allowed items-center justify-center rounded-full border border-black/[.12] px-7 text-base font-medium text-zinc-400 dark:border-white/[.15] dark:text-zinc-500"
        >
          {cta.label}
        </span>
      </div>
    </section>
  );
}
