import type { ReactNode } from "react";

type PortalSectionTone = "default" | "muted" | "dark";

const TONE_CLASS: Record<PortalSectionTone, string> = {
  default: "border-black/[.06] bg-white dark:border-white/[.08] dark:bg-zinc-950",
  muted: "border-black/[.06] bg-zinc-50 dark:border-white/[.08] dark:bg-zinc-950",
  dark: "border-black/[.06] bg-zinc-950 text-zinc-50 dark:border-white/[.08]",
};

export default function PortalSection({
  id,
  eyebrow,
  heading,
  intro,
  children,
  tone = "default",
  headerClassName = "max-w-3xl",
}: {
  id: string;
  eyebrow: string;
  heading: string;
  intro: string;
  children: ReactNode;
  tone?: PortalSectionTone;
  headerClassName?: string;
}) {
  const headingId = `${id}-heading`;
  const isDark = tone === "dark";

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={`w-full scroll-mt-20 border-b ${TONE_CLASS[tone]}`}
    >
      <div className="portal-container py-16 sm:py-24">
        <div className={headerClassName}>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            {eyebrow}
          </p>
          <h2
            id={headingId}
            className={`mt-3 text-3xl font-semibold tracking-tight sm:text-4xl ${
              isDark ? "text-zinc-50" : "text-zinc-950 dark:text-zinc-50"
            }`}
          >
            {heading}
          </h2>
          <p
            className={`mt-4 text-base leading-7 ${
              isDark ? "text-zinc-300" : "text-zinc-600 dark:text-zinc-300"
            }`}
          >
            {intro}
          </p>
        </div>

        {children}
      </div>
    </section>
  );
}
