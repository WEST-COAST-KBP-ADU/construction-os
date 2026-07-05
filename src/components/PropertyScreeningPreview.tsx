import ModulePreviewCard from "@/src/components/ModulePreviewCard";
import PortalSection from "@/src/components/PortalSection";
import StatusBadge from "@/src/components/StatusBadge";
import { siteConfig } from "@/src/lib/siteConfig";

export default function PropertyScreeningPreview() {
  const { propertyScreening, sections } = siteConfig;
  const copy = sections.propertyScreening;

  return (
    <PortalSection
      id="property-screening"
      eyebrow={copy.eyebrow}
      heading={copy.heading}
      intro={copy.intro}
      tone="muted"
    >
      <div className="mt-8 flex flex-col gap-3 rounded-lg border border-black/[.07] bg-white p-4 dark:border-white/[.10] dark:bg-zinc-900 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
            {propertyScreening.objectLabel}
          </p>
          <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            {propertyScreening.note}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          <StatusBadge variant="notLive">{propertyScreening.status}</StatusBadge>
          <StatusBadge variant="attention">{propertyScreening.warning}</StatusBadge>
        </div>
      </div>

      <ul className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {propertyScreening.outputs.map((output) => (
          <li key={output.label}>
            <ModulePreviewCard
              label="Mock output"
              title={output.label}
              description={output.mockOutput}
              status={output.warning}
              statusVariant="attention"
            />
          </li>
        ))}
      </ul>
    </PortalSection>
  );
}
