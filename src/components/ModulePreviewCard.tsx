import type { ReactNode } from "react";

import PortalCard from "@/src/components/PortalCard";
import StatusBadge, { type StatusBadgeVariant } from "@/src/components/StatusBadge";

export default function ModulePreviewCard({
  label,
  title,
  description,
  status,
  statusVariant = "preview",
  children,
  dark = false,
}: {
  label?: string;
  title: string;
  description: string;
  status?: string;
  statusVariant?: StatusBadgeVariant;
  children?: ReactNode;
  dark?: boolean;
}) {
  return (
    <PortalCard tone={dark ? "dark" : "default"} className="h-full">
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          {label ? (
            <p
              className={`text-xs font-semibold uppercase tracking-[0.12em] ${
                dark ? "text-zinc-500" : "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              {label}
            </p>
          ) : (
            <span aria-hidden />
          )}
          {status ? <StatusBadge variant={statusVariant}>{status}</StatusBadge> : null}
        </div>
        <h3
          className={`mt-4 text-lg font-semibold ${
            dark ? "text-zinc-50" : "text-zinc-950 dark:text-zinc-50"
          }`}
        >
          {title}
        </h3>
        <p
          className={`mt-3 flex-1 text-sm leading-6 ${
            dark ? "text-zinc-300" : "text-zinc-600 dark:text-zinc-300"
          }`}
        >
          {description}
        </p>
        {children ? <div className="mt-5">{children}</div> : null}
      </div>
    </PortalCard>
  );
}
