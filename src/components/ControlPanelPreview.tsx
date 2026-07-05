import PortalCard from "@/src/components/PortalCard";
import StatusBadge, { type StatusBadgeVariant } from "@/src/components/StatusBadge";

type ControlPanelItem = {
  label: string;
  value: string;
  detail: string;
  tone?: StatusBadgeVariant;
};

export default function ControlPanelPreview({
  objectId,
  title,
  status,
  notice,
  items,
  compact = false,
}: {
  objectId: string;
  title: string;
  status: string;
  notice?: string;
  items: ReadonlyArray<ControlPanelItem>;
  compact?: boolean;
}) {
  return (
    <PortalCard className={compact ? "p-4 sm:p-5" : "p-4 sm:p-5"}>
      <div className="flex flex-col gap-3 border-b border-black/[.06] pb-5 dark:border-white/[.08] sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">
            {objectId}
          </p>
          <h3 className="mt-2 text-xl font-semibold text-zinc-950 dark:text-zinc-50">
            {title}
          </h3>
        </div>
        <StatusBadge variant="attention">{status}</StatusBadge>
      </div>

      {notice ? (
        <p className="mt-5 rounded-lg border border-amber-500/25 bg-amber-500/10 p-4 text-sm leading-6 text-amber-900 dark:text-amber-200">
          {notice}
        </p>
      ) : null}

      <dl className={`mt-5 grid grid-cols-1 gap-3 ${compact ? "" : "sm:grid-cols-2"}`}>
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-black/[.06] bg-zinc-50 p-4 dark:border-white/[.08] dark:bg-zinc-950"
          >
            <dt className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
              {item.label}
            </dt>
            <dd className="mt-2">
              <StatusBadge variant={item.tone ?? "preview"}>{item.value}</StatusBadge>
              <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                {item.detail}
              </p>
            </dd>
          </div>
        ))}
      </dl>
    </PortalCard>
  );
}
