import { siteConfig } from "@/src/lib/siteConfig";

/**
 * Project preview. Three placeholder cards — deliberately NO real addresses,
 * client names, prices, or project facts. Each card shows the shape of a future
 * case study (area, type, stage, and the visible proof that would back it). A
 * standing note makes clear that real assets require Owner selection.
 */
export default function ProjectPreview() {
  const { projects } = siteConfig;

  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className="w-full scroll-mt-20 border-t border-black/[.06] dark:border-white/[.08]"
    >
      <div className="mx-auto w-full max-w-5xl px-6 py-16 sm:py-20">
        <h2
          id="projects-heading"
          className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl"
        >
          Project preview
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-300">
          {projects.note}
        </p>

        <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {projects.cards.map((card) => (
            <li
              key={`${card.area}-${card.type}`}
              className="flex flex-col rounded-2xl border border-black/[.08] bg-white p-6 dark:border-white/[.12] dark:bg-zinc-950"
            >
              <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-black/[.12] bg-zinc-50 text-xs font-medium text-zinc-400 dark:border-white/[.15] dark:bg-zinc-900 dark:text-zinc-500">
                Photo placeholder
              </div>
              <dl className="mt-4 space-y-2 text-sm">
                <div>
                  <dt className="font-medium text-zinc-500 dark:text-zinc-400">
                    Area
                  </dt>
                  <dd className="text-zinc-800 dark:text-zinc-200">{card.area}</dd>
                </div>
                <div>
                  <dt className="font-medium text-zinc-500 dark:text-zinc-400">
                    Type
                  </dt>
                  <dd className="text-zinc-800 dark:text-zinc-200">{card.type}</dd>
                </div>
                <div>
                  <dt className="font-medium text-zinc-500 dark:text-zinc-400">
                    Stage
                  </dt>
                  <dd className="text-zinc-800 dark:text-zinc-200">{card.stage}</dd>
                </div>
                <div>
                  <dt className="font-medium text-zinc-500 dark:text-zinc-400">
                    Visible proof needed
                  </dt>
                  <dd className="text-zinc-800 dark:text-zinc-200">{card.proof}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
