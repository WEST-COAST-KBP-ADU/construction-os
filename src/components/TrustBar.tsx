import { siteConfig } from "@/src/lib/siteConfig";

/**
 * Trust bar. Proof points shown beneath the hero — credentials before launch,
 * milestone visibility, and an explicit preview-only notice. No lead capture,
 * no guarantees. Copy comes from siteConfig; icons are inline (no assets).
 */
const ICONS = ["shield", "eye", "lock"] as const;

function TrustIcon({ name }: { name: string }) {
  if (name === "eye") {
    return (
      <svg
        className="size-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  if (name === "lock") {
    return (
      <svg
        className="size-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <rect x="4.5" y="10.5" width="15" height="9" rx="2" />
        <path d="M8 10.5V8a4 4 0 1 1 8 0v2.5" />
      </svg>
    );
  }
  return (
    <svg
      className="size-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 3l7 3v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6l7-3z" />
      <path d="M9.2 11.7l1.9 1.9 3.7-3.9" />
    </svg>
  );
}

export default function TrustBar() {
  return (
    <section
      aria-label="Why West Coast KBP"
      className="w-full border-b border-black/[.06] bg-zinc-50 dark:border-white/[.08] dark:bg-zinc-950"
    >
      <div className="mx-auto grid w-full max-w-5xl gap-4 px-6 py-10 sm:grid-cols-3 sm:py-12">
        {siteConfig.trustBar.map((item, i) => (
          <div
            key={item.title}
            className="rounded-2xl border border-black/[.07] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-white/[.10] dark:bg-zinc-900"
          >
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <TrustIcon name={ICONS[i] ?? "shield"} />
            </span>
            <p className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
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
