import type { ReactNode } from "react";

type PortalCardTone = "default" | "muted" | "dark";

export default function PortalCard({
  children,
  tone = "default",
  className = "",
}: {
  children: ReactNode;
  tone?: PortalCardTone;
  className?: string;
}) {
  const classes = ["portal-card", "portal-card--" + tone, className]
    .filter(Boolean)
    .join(" ");

  return <div className={classes}>{children}</div>;
}
