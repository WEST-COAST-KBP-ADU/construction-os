import { siteConfig } from "@/src/lib/siteConfig";

/**
 * Status bar beneath the hero. It explains preview scope, platform direction,
 * and no-collection status. Copy comes from siteConfig; icons are inline.
 */
const ICONS = ["shield", "eye", "lock", "path"] as const;

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
  if (name === "path") {
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
        <path d="M4 6h6a4 4 0 0 1 0 8H8a4 4 0 0 0 0 8h12" />
        <circle cx="4" cy="6" r="2" />
        <circle cx="20" cy="22" r="2" />
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
      aria-label="West Coast KBP trust and process"
      className="w-full border-b border-black/[.06] bg-white dark:border-white/[.08] dark:bg-zinc-950"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-10 sm:grid-cols-2 sm:px-6 sm:py-12 lg:grid-cols-4">
        {siteConfig.trustBar.map((item, i) => (
          <div
            key={item.title}
            className="rounded-2xl border border-[#D4D1CA] bg-[#F7F6F2] p-5 shadow-sm dark:border-white/[.10] dark:bg-zinc-900"
          >
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[#1B4332]/10 text-[#1B4332] dark:bg-[#C9A84C]/10 dark:text-[#C9A84C]">
              <TrustIcon name={ICONS[i] ?? "shield"} />
            </span>
            <p className="mt-4 text-sm font-semibold text-[#1C1B19] dark:text-zinc-50">
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
