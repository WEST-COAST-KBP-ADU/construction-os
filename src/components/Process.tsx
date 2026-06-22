import { siteConfig } from "@/src/lib/siteConfig";

/**
 * Process section. A typical, ordered sequence from feasibility to closeout.
 * Uses "typical / property-specific review required" language throughout so no
 * step reads as a guaranteed outcome (permits, cost, or timeline).
 */
export default function Process() {
  const { process } = siteConfig;

  return (
    <section
      id="process"
      aria-labelledby="process-heading"
      className="w-full scroll-mt-20 border-t border-black/[.06] bg-zinc-50 dark:border-white/[.08] dark:bg-zinc-950"
    >
      <div className="mx-auto w-full max-w-5xl px-6 py-16 sm:py-20">
        <h2
          id="process-heading"
          className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl"
        >
          How a project runs
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-300">
          {process.note}
        </p>

        <ol className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {process.steps.map((step) => (
            <li
              key={step.step}
              className="rounded-2xl border border-black/[.08] bg-white p-6 dark:border-white/[.12] dark:bg-zinc-900"
            >
              <span className="text-sm font-semibold text-zinc-400 dark:text-zinc-500">
                {step.step}
              </span>
              <h3 className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
