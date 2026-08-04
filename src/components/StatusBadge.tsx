import type { ReactNode } from "react";

export type StatusBadgeVariant =
  | "neutral"
  | "preview"
  | "attention"
  | "ready"
  | "blocked"
  | "notLive";

export default function StatusBadge({
  children,
  variant = "neutral",
}: {
  children: ReactNode;
  variant?: StatusBadgeVariant;
}) {
  return <span className={["status-badge", "status-badge--" + variant].join(" ")}>{children}</span>;
}
