export default function EvidenceStrip({
  items,
  tone = "light",
}: {
  items: string[];
  tone?: "light" | "dark";
}) {
  const isDark = tone === "dark";

  return (
    <dl
      className={`grid grid-cols-1 gap-3 rounded-lg border p-3 sm:grid-cols-2 ${
        isDark
          ? "border-white/[.10] bg-white/[.04]"
          : "border-black/[.06] bg-white dark:border-white/[.08] dark:bg-zinc-950"
      }`}
    >
      {items.map((item, index) => (
        <div key={item} className="min-w-0">
          <dt
            className={`text-[0.68rem] font-semibold uppercase tracking-[0.12em] ${
              isDark ? "text-zinc-500" : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            Evidence {index + 1}
          </dt>
          <dd
            className={`mt-1 text-sm leading-6 ${
              isDark ? "text-zinc-300" : "text-zinc-600 dark:text-zinc-300"
            }`}
          >
            {item}
          </dd>
        </div>
      ))}
    </dl>
  );
}
