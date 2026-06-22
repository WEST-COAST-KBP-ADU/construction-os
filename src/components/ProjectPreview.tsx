import { siteConfig } from "@/src/lib/siteConfig";

/**
 * Project preview. Three placeholder cards — deliberately NO real addresses,
 * client names, costs, or project facts. Each card shows the shape of a future
 * case study (area, type, stage, and the visible proof that would back it). The
 * image area is a designed placeholder (no photo asset) and is clearly badged,
 * and a standing note makes clear that real assets require Owner selection.
 */
export default function ProjectPreview() {
  const { projects, sections } = siteConfig;

  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className="w-full scroll-mt-20 border-b border-black/[.06] dark:border-white/[.08]"
    >
      <div className="mx-auto w-full max-w-5xl px-6 py-20 sm:py-28">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          {sections.projects}
        </p>
        <h2
          id="projects-heading"
          className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl"
        >
          Project preview
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-300">
          {projects.note}
        </p>

        <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.cards.map((card) => (
            <li
              key={`${card.area}-${card.type}`}
              className="flex flex-col overflow-hidden rounded-2xl border border-black/[.07] bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-white/[.10] dark:bg-zinc-900"
            >
              {/* Designed placeholder — no real photo asset in this preview. */}
              <div className="relative flex h-40 items-center justify-center overflow-hidden border-b border-black/[.06] bg-gradient-to-br from-zinc-100 to-zinc-50 dark:border-white/[.08] dark:from-zinc-800 dark:to-zinc-900">
                <div aria-hidden className="absolute inset-0 hero-grid opacity-60" />
                <svg
                  className="relative size-9 text-zinc-300 dark:text-zinc-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <path d="M3 16l5-5 4 4 3-3 6 6" />
                  <circle cx="9" cy="9" r="1.4" />
                </svg>
                <span className="absolute left-3 top-3 rounded-full border border-black/[.08] bg-white/80 px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-zinc-500 backdrop-blur dark:border-white/[.12] dark:bg-zinc-900/70 dark:text-zinc-400">
                  Placeholder
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <span className="inline-flex w-fit rounded-full bg-accent/10 px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide text-accent">
                  {card.stage}
                </span>
                <h3 className="mt-3 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                  {card.type}
                </h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {card.area}
                </p>
                <dl className="mt-4 border-t border-black/[.06] pt-3 text-sm dark:border-white/[.08]">
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-zinc-500 dark:text-zinc-400">
                      Visible proof
                    </dt>
                    <dd className="text-right font-medium text-zinc-700 dark:text-zinc-300">
                      {card.proof}
                    </dd>
                  </div>
                </dl>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
