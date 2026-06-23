import { siteConfig } from "@/src/lib/siteConfig";

const CARD_TONES = [
  "border-sky-500/20 bg-sky-500/[0.04] dark:border-sky-300/20 dark:bg-sky-300/[0.05]",
  "border-emerald-500/20 bg-emerald-500/[0.04] dark:border-emerald-300/20 dark:bg-emerald-300/[0.05]",
  "border-accent/25 bg-accent/[0.05] dark:border-accent/30 dark:bg-accent/[0.06]",
];

export default function PlatformCapabilityPreview() {
  const { capabilities, sections } = siteConfig;

  return (
    <section
      id="platform-preview"
      aria-labelledby="platform-preview-heading"
      className="w-full scroll-mt-20 border-b border-black/[.06] bg-zinc-50 dark:border-white/[.08] dark:bg-zinc-950"
    >
      <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-28">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {sections.platform}
            </p>
            <h2
              id="platform-preview-heading"
              className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl"
            >
              Platform modules before public activation
            </h2>
          </div>
          <p className="text-base leading-7 text-zinc-600 dark:text-zinc-300">
            {capabilities.note}
          </p>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {capabilities.cards.map((card, i) => (
            <li
              key={card.title}
              className={`rounded-2xl border p-6 shadow-sm ${CARD_TONES[i] ?? CARD_TONES[0]}`}
            >
              <div className="flex items-start justify-between gap-4">
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-zinc-900 font-mono text-sm font-semibold text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="rounded-full border border-black/[.08] bg-white/70 px-2.5 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wide text-zinc-500 dark:border-white/[.12] dark:bg-zinc-900/70 dark:text-zinc-400">
                  {card.status}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {card.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                {card.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
