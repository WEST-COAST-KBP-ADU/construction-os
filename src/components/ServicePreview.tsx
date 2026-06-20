import { siteConfig } from "@/src/lib/siteConfig";

/**
 * Static preview of the core service areas. Content-only; no links to detail
 * pages yet in this shell.
 */
export default function ServicePreview() {
  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="w-full scroll-mt-20"
    >
      <div className="mx-auto w-full max-w-5xl px-6 py-16 sm:py-20">
        <h2
          id="services-heading"
          className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl"
        >
          What we work on
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-300">
          A managed approach across the project types we focus on.
        </p>

        <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {siteConfig.services.map((service) => (
            <li
              key={service.title}
              className="rounded-2xl border border-black/[.08] bg-white p-6 dark:border-white/[.12] dark:bg-zinc-950"
            >
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
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
