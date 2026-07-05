import type { ReactNode } from "react";

export type StatusBadgeVariant =
  | "neutral"
  | "preview"
  | "attention"
  | "ready"
  | "blocked"
  | "notLive";

const VARIANT_CLASS: Record<StatusBadgeVariant, string> = {
  neutral:
    "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-white/[.10] dark:bg-zinc-900 dark:text-zinc-300",
  preview:
    "border-black/[.10] bg-white text-zinc-600 dark:border-white/[.12] dark:bg-zinc-950 dark:text-zinc-300",
  attention:
    "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200",
  ready:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200",
  blocked:
    "border-rose-500/25 bg-rose-500/10 text-rose-800 dark:text-rose-300",
  notLive:
    "border-rose-400/25 bg-rose-400/10 text-rose-800 dark:text-rose-200",
};

export default function StatusBadge({
  children,
  variant = "neutral",
  className = "",
}: {
  children: ReactNode;
  variant?: StatusBadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex max-w-full items-center rounded-md border px-2.5 py-1 text-left text-xs font-semibold leading-tight ${VARIANT_CLASS[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
