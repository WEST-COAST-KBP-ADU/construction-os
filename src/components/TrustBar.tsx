import { siteConfig } from "@/src/lib/siteConfig";

/**
 * Trust bar. Proof points shown beneath the hero — credentials before launch,
 * milestone visibility, and an explicit preview-only notice. No lead capture,
 * no guarantees. Content-only; all copy comes from siteConfig.
 */
export default function TrustBar() {
  return (
    <section
      aria-label="Why West Coast KBP"
      className="w-full border-b border-black/[.06] bg-zinc-50 dark:border-white/[.08] dark:bg-zinc-950"
    >
      <div className="mx-auto grid w-full max-w-5xl gap-4 px-6 py-8 sm:grid-cols-3">
        {siteConfig.trustBar.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-black/[.08] bg-white p-4 dark:border-white/[.12] dark:bg-zinc-900"
          >
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {item.title}
            </p>
            <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              {item.detail}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
