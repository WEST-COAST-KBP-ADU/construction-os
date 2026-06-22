import { siteConfig } from "@/src/lib/siteConfig";

/**
 * GC partner path. A dedicated, first-class section for general contractors:
 * a placeholder capability statement and an invite-to-bid path that is
 * preview-only. No form, no submission, no contact capture.
 */
export default function GCPartnerPath() {
  const { gcPartner } = siteConfig;

  return (
    <section
      id="gc-partners"
      aria-labelledby="gc-partners-heading"
      className="w-full scroll-mt-20 border-t border-black/[.06] bg-zinc-50 dark:border-white/[.08] dark:bg-zinc-950"
    >
      <div className="mx-auto w-full max-w-5xl px-6 py-16 sm:py-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            <h2
              id="gc-partners-heading"
              className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl"
            >
              {gcPartner.heading}
            </h2>
            <p className="mt-3 max-w-xl text-base leading-7 text-zinc-600 dark:text-zinc-300">
              {gcPartner.intro}
            </p>

            <div className="mt-8 rounded-2xl border border-black/[.08] bg-white p-6 dark:border-white/[.12] dark:bg-zinc-900">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Capability statement (placeholder)
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                {gcPartner.capability.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden className="text-zinc-400 dark:text-zinc-500">
                      &middot;
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col justify-center rounded-2xl border border-dashed border-black/[.15] bg-white p-6 dark:border-white/[.18] dark:bg-zinc-900">
            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {gcPartner.inviteToBid.label}
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              {gcPartner.inviteToBid.note}
            </p>
            <span
              aria-disabled="true"
              className="mt-6 inline-flex h-11 w-fit cursor-not-allowed items-center justify-center rounded-full border border-black/[.12] px-6 text-sm font-medium text-zinc-400 dark:border-white/[.15] dark:text-zinc-500"
            >
              Bid path disabled in preview
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
