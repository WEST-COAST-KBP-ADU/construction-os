import type { ReactNode } from "react";

type PortalCardTone = "default" | "muted" | "dark";

const TONE_CLASS: Record<PortalCardTone, string> = {
  default:
    "border-black/[.07] bg-white shadow-[var(--shadow-card)] dark:border-white/[.10] dark:bg-zinc-900",
  muted:
    "border-black/[.07] bg-zinc-50 shadow-[var(--shadow-card)] dark:border-white/[.10] dark:bg-zinc-900",
  dark: "border-white/[.10] bg-zinc-950 text-zinc-50 shadow-[var(--shadow-panel)]",
};

export default function PortalCard({
  children,
  tone = "default",
  className = "",
}: {
  children: ReactNode;
  tone?: PortalCardTone;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border p-5 ${TONE_CLASS[tone]} ${className}`}>
      {children}
    </div>
  );
}
