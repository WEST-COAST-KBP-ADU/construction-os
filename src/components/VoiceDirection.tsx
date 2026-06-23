import { siteConfig } from "@/src/lib/siteConfig";

export default function VoiceDirection() {
  const { sections, voice } = siteConfig;

  return (
    <section
      id="voice-direction"
      aria-labelledby="voice-direction-heading"
      className="w-full scroll-mt-20 border-b border-black/[.06] bg-zinc-950 text-zinc-50 dark:border-white/[.08]"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-20 sm:py-28 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {sections.voice}
          </p>
          <h2
            id="voice-direction-heading"
            className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            {voice.heading}
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300">
            {voice.note}
          </p>
        </div>

        <div className="rounded-3xl border border-white/[.10] bg-white/[.04] p-6 shadow-xl shadow-black/20">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">Quality gate</p>
            <span className="rounded-full border border-white/[.14] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Not live
            </span>
          </div>
          <ul className="mt-6 space-y-4">
            {voice.checkpoints.map((checkpoint) => (
              <li key={checkpoint} className="flex gap-3 text-sm leading-6 text-zinc-300">
                <span
                  aria-hidden
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-accent"
                />
                <span>{checkpoint}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
