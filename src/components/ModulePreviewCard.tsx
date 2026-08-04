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
    <PortalCard tone={dark ? "dark" : "default"}>
      <div className="module-card">
        <div className="module-card__header">
          {label ? <p className="card__eyebrow">{label}</p> : <span aria-hidden />}
          {status ? <StatusBadge variant={statusVariant}>{status}</StatusBadge> : null}
        </div>
        <h3 className="module-card__title">{title}</h3>
        <p className="module-card__description">{description}</p>
        {children ? <div className="module-card__footer">{children}</div> : null}
      </div>
    </PortalCard>
  );
}
