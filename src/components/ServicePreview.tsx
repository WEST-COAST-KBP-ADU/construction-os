import { siteConfig } from "@/src/lib/siteConfig";

/**
 * Static platform flow preview. No inputs, forms, or live review handling.
 */
export default function ServicePreview() {
  return (
    <section
      id="platform-preview"
      aria-labelledby="platform-preview-heading"
      className="w-full scroll-mt-20"
    >
      <div className="mx-auto w-full max-w-5xl px-6 py-16 sm:py-20">
        <h2
          id="platform-preview-heading"
          className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-3xl"
        >
          Platform preview
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-300">
          The first public slice explains the planned address-first flow without
          activating address intake, report generation, appointment booking, or
          lead capture.
        </p>

        <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {siteConfig.platformPreview.map((service) => (
            <li
              key={service.title}
              className="border border-black/[.08] bg-white p-6 dark:border-white/[.12] dark:bg-zinc-950"
            >
              <h3 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                {service.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                {service.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
