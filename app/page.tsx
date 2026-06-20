import Hero from "@/src/components/Hero";
import ServicePreview from "@/src/components/ServicePreview";
import { siteConfig } from "@/src/lib/siteConfig";

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />

      <ServicePreview />

      {/* Service areas */}
      <section
        id="service-areas"
        aria-labelledby="service-areas-heading"
        className="w-full scroll-mt-20 border-t border-black/[.06] dark:border-white/[.08]"
      >
        <div className="mx-auto w-full max-w-5xl px-6 py-16 sm:py-20">
          <h2
            id="service-areas-heading"
            className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl"
          >
            Service areas
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-300">
            We focus on projects in these areas. Coverage for a specific address
            is confirmed during review.
          </p>
          <ul className="mt-8 flex flex-wrap gap-3">
            {siteConfig.serviceAreas.map((area) => (
              <li
                key={area}
                className="rounded-full border border-black/[.08] bg-white px-5 py-2 text-sm font-medium text-zinc-700 dark:border-white/[.12] dark:bg-zinc-950 dark:text-zinc-200"
              >
                {area}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Feasibility review — placeholder CTA target. No form, no PII. */}
      <section
        id="feasibility-review"
        aria-labelledby="feasibility-review-heading"
        className="w-full scroll-mt-20 border-t border-black/[.06] bg-zinc-50 dark:border-white/[.08] dark:bg-zinc-950"
      >
        <div className="mx-auto w-full max-w-5xl px-6 py-16 sm:py-20">
          <h2
            id="feasibility-review-heading"
            className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl"
          >
            {siteConfig.cta.label}
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-300">
            {siteConfig.cta.note}
          </p>
        </div>
      </section>
    </main>
  );
}
