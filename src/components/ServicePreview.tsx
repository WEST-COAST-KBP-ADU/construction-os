import { siteConfig } from "@/src/lib/siteConfig";

/**
 * Service ladder. Ordered to match the canonical public profile. The final
 * GC / subcontract item is visually differentiated and links to the dedicated
 * GC section. Content-only; no detail pages or backend.
 */
export default function ServicePreview() {
  const { services, sections } = siteConfig;
  const lastIndex = services.length - 1;

  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="w-full scroll-mt-20 border-b border-black/[.06] dark:border-white/[.08]"
    >
      <div className="mx-auto w-full max-w-5xl px-6 py-20 sm:py-28">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          {sections.services}
        </p>
        <h2
          id="services-heading"
          className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl"
        >
          What we build
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-300">
          A managed approach across the project types we focus on — from a
          homeowner&rsquo;s first ADU to subcontract work for general contractors.
        </p>

        <ul className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {services.map((service, i) => {
            const isGc = i === lastIndex;
            return (
              <li
                key={service.title}
                className={`flex flex-col rounded-2xl border p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                  isGc
                    ? "border-accent/30 bg-accent/[0.04] dark:border-accent/30 dark:bg-accent/[0.06]"
                    : "border-black/[.07] bg-white dark:border-white/[.10] dark:bg-zinc-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex size-9 items-center justify-center rounded-lg font-mono text-sm font-semibold ${
                      isGc
                        ? "bg-accent/15 text-accent"
                        : "bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {isGc && (
                    <span className="rounded-full border border-accent/30 px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide text-accent">
                      For contractors
                    </span>
                  )}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  {service.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                  {service.description}
                </p>
                {isGc && (
                  <a
                    href="#gc-partners"
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-accent/80"
                  >
                    See the GC partner path
                    <span aria-hidden>&rarr;</span>
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
