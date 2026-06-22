import { siteConfig } from "@/src/lib/siteConfig";

/**
 * GC partner path. A dedicated, first-class section for general contractors,
 * rendered as a distinct dark "contractor lane" panel to clearly separate the
 * B2B audience from the homeowner sections above. Carries a placeholder
 * capability statement and a preview-only invite-to-bid path. No form, no
 * submission, no lead capture.
 */
export default function GCPartnerPath() {
  const { gcPartner, sections } = siteConfig;

  return (
    <section
      id="gc-partners"
      aria-labelledby="gc-partners-heading"
      className="w-full scroll-mt-20 border-b border-black/[.06] dark:border-white/[.08]"
    >
      <div className="mx-auto w-full max-w-5xl px-6 py-20 sm:py-28">
        <div className="overflow-hidden rounded-3xl border border-white/[.08] bg-zinc-900 shadow-xl shadow-black/10">
          <div className="grid grid-cols-1 gap-10 p-8 sm:p-10 lg:grid-cols-2 lg:gap-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                {sections.gc}
              </p>
              <h2
                id="gc-partners-heading"
                className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl"
              >
                {gcPartner.heading}
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-zinc-300">
                {gcPartner.intro}
              </p>

              <div className="mt-8 rounded-2xl border border-white/[.10] bg-white/[.03] p-6">
                <p className="text-sm font-semibold text-zinc-50">
                  Capability statement (placeholder)
                </p>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-300">
                  {gcPartner.capability.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span
                        aria-hidden
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-accent"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-col justify-center rounded-2xl border border-dashed border-white/[.18] bg-white/[.02] p-6 sm:p-8">
              <span className="inline-flex w-fit rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
                B2B path
              </span>
              <p className="mt-4 text-xl font-semibold text-zinc-50">
                {gcPartner.inviteToBid.label}
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-300">
                {gcPartner.inviteToBid.note}
              </p>
              <span
                aria-disabled="true"
                className="mt-6 inline-flex h-11 w-fit cursor-not-allowed items-center justify-center rounded-full border border-white/[.15] px-6 text-sm font-medium text-zinc-400"
              >
                Bid path disabled in preview
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
