import { siteConfig } from "@/src/lib/siteConfig";

/**
 * Platform control flow. Shows how intent could become a reviewed object state
 * in a future platform layer. It is orientation-only and has no data handling.
 */
export default function Process() {
  const { process, sections } = siteConfig;
  const last = process.steps.length - 1;

  return (
    <section
      id="control-flow"
      aria-labelledby="process-heading"
      className="w-full scroll-mt-20 border-b border-black/[.06] bg-zinc-50 dark:border-white/[.08] dark:bg-zinc-950"
    >
      <div className="mx-auto w-full max-w-5xl px-6 py-20 sm:py-28">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          {sections.process}
        </p>
        <h2
          id="process-heading"
          className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl"
        >
          From intent to controlled object state
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-300">
          {process.note}
        </p>

        <ol className="relative mt-12 max-w-3xl">
          {process.steps.map((step, i) => (
            <li key={step.step} className="relative flex gap-5 pb-9 last:pb-0">
              {i !== last && (
                <span
                  aria-hidden
                  className="absolute bottom-1 left-[21px] top-12 w-px bg-gradient-to-b from-black/[.14] to-black/0 dark:from-white/[.16] dark:to-white/0"
                />
              )}
              <span className="relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full border border-black/[.08] bg-white font-mono text-sm font-semibold text-accent shadow-sm dark:border-white/[.12] dark:bg-zinc-900">
                {step.step}
              </span>
              <div className="pt-1.5">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  {step.title}
                </h3>
                <p className="mt-1.5 max-w-xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
