import Hero from "@/src/components/Hero";
import ServicePreview from "@/src/components/ServicePreview";
import { siteConfig } from "@/src/lib/siteConfig";

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />

      <ServicePreview />

      <section
        id="preliminary-review"
        aria-labelledby="preliminary-review-heading"
        className="w-full scroll-mt-20 border-t border-black/[.06] bg-zinc-50 dark:border-white/[.08] dark:bg-zinc-950"
      >
        <div className="mx-auto w-full max-w-5xl px-6 py-16 sm:py-20">
          <h2
            id="preliminary-review-heading"
            className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-3xl"
          >
            Preliminary review direction
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-300">
            Preliminary feasibility review means an early planning conversation.
            It is not a quote, contract, permit answer, code answer, final
            design, or construction commitment.
          </p>
          <ul className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
            {siteConfig.preliminaryReview.map((item) => (
              <li
                key={item.title}
                className="border border-black/[.08] bg-white p-6 dark:border-white/[.12] dark:bg-zinc-900"
              >
                <h3 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                  {item.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="trust-preview"
        aria-labelledby="trust-preview-heading"
        className="w-full scroll-mt-20 border-t border-black/[.06] dark:border-white/[.08]"
      >
        <div className="mx-auto w-full max-w-5xl px-6 py-16 sm:py-20">
          <h2
            id="trust-preview-heading"
            className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-3xl"
          >
            Trust and proof structure
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-300">
            WEB-002a shows where trust modules will live, but it does not
            publish unverified license details, client data, project photos,
            review counts, testimonials, badges, or project outcomes.
          </p>
          <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {siteConfig.trustPreview.map((item) => (
              <li
                key={item.title}
                className="border border-black/[.08] bg-white p-6 dark:border-white/[.12] dark:bg-zinc-950"
              >
                <h3 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                  {item.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="launch-status"
        aria-labelledby="launch-status-heading"
        className="w-full scroll-mt-20 border-t border-black/[.06] bg-zinc-950 text-white dark:border-white/[.08]"
      >
        <div className="mx-auto w-full max-w-5xl px-6 py-16 sm:py-20">
          <h2
            id="launch-status-heading"
            className="text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            {siteConfig.launchStatus.heading}
          </h2>
          <p className="mt-3 max-w-3xl text-base leading-7 text-zinc-300">
            {siteConfig.launchStatus.note}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {siteConfig.launchStatus.ctas.map((cta) => (
              <a
                key={cta.href}
                href={cta.href}
                className="inline-flex min-h-12 items-center justify-center rounded-md bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-zinc-200"
              >
                {cta.label}
              </a>
            ))}
            <span className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/30 px-5 py-3 text-sm font-semibold text-zinc-200">
              {siteConfig.launchStatus.disabledLabel}
            </span>
          </div>
          <p className="mt-5 text-sm leading-6 text-zinc-400">
            {siteConfig.launchStatus.microcopy}
          </p>
        </div>
      </section>

      <section
        aria-labelledby="disclaimer-heading"
        className="w-full border-t border-black/[.06] bg-stone-50 dark:border-white/[.08] dark:bg-zinc-900"
      >
        <div className="mx-auto w-full max-w-5xl px-6 py-12">
          <h2
            id="disclaimer-heading"
            className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50"
          >
            Required disclaimer
          </h2>
          <div className="mt-5 space-y-4 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
            <p className="font-semibold text-zinc-950 dark:text-zinc-50">
              {siteConfig.footer.shortCaveat}
            </p>
            <p>{siteConfig.footer.aduDisclaimer}</p>
            <p>{siteConfig.footer.permitDisclaimer}</p>
            <p>{siteConfig.footer.professionalReviewDisclaimer}</p>
            <p>{siteConfig.footer.previewDisclaimer}</p>
            <p>{siteConfig.footer.leadCaptureDisclaimer}</p>
            <p>{siteConfig.footer.disclaimer}</p>
            <p>{siteConfig.footer.noGuarantees}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
