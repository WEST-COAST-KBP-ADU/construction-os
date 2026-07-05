import StatusBadge from "@/src/components/StatusBadge";

export default function NextActionBlock({
  label = "Next action",
  action,
  status = "Owner approval required",
  tone = "light",
}: {
  label?: string;
  action: string;
  status?: string;
  tone?: "light" | "dark";
}) {
  const isDark = tone === "dark";

  return (
    <div
      className={`rounded-lg border p-4 ${
        isDark
          ? "border-white/[.10] bg-white/[.04]"
          : "border-black/[.06] bg-white dark:border-white/[.08] dark:bg-zinc-950"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p
            className={`text-xs font-semibold uppercase tracking-[0.12em] ${
              isDark ? "text-zinc-500" : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            {label}
          </p>
          <p
            className={`mt-2 text-sm font-medium leading-6 ${
              isDark ? "text-zinc-100" : "text-zinc-800 dark:text-zinc-200"
            }`}
          >
            {action}
          </p>
        </div>
        <StatusBadge variant="attention">{status}</StatusBadge>
      </div>
    </div>
  );
}
