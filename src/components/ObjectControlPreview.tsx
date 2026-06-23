import { siteConfig } from "@/src/lib/siteConfig";

export default function ObjectControlPreview() {
  const { objectControl, sections } = siteConfig;

  return (
    <section
      id="object-control"
      aria-labelledby="object-control-heading"
      className="w-full scroll-mt-20 border-b border-black/[.06] dark:border-white/[.08]"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-20 sm:py-28 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {sections.objects}
          </p>
          <h2
            id="object-control-heading"
            className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl"
          >
            A future control surface for active project objects
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-zinc-600 dark:text-zinc-300">
            {objectControl.note}
          </p>
        </div>

        <div className="rounded-3xl border border-black/[.08] bg-white p-4 shadow-xl shadow-black/[.04] dark:border-white/[.12] dark:bg-zinc-900 sm:p-5">
          <div className="rounded-2xl border border-dashed border-black/[.12] bg-zinc-50 p-4 dark:border-white/[.16] dark:bg-zinc-950/70 sm:p-5">
            <div className="flex flex-col gap-3 border-b border-black/[.06] pb-5 dark:border-white/[.08] sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  Object record preview
                </p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Generic structure only
                </p>
              </div>
              <span className="w-fit rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                No live data
              </span>
            </div>

            <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {objectControl.items.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-black/[.06] bg-white p-4 dark:border-white/[.08] dark:bg-zinc-900"
                >
                  <dt className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {item.label}
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                    {item.detail}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
