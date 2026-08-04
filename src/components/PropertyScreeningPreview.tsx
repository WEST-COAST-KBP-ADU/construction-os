import ModulePreviewCard from "@/src/components/ModulePreviewCard";
import PortalSection from "@/src/components/PortalSection";
import StatusBadge from "@/src/components/StatusBadge";
import { siteConfig } from "@/src/lib/siteConfig";

export default function PropertyScreeningPreview() {
  const { labels, propertyScreening, sections } = siteConfig;
  const copy = sections.propertyScreening;

  return (
    <PortalSection
      id="property-screening"
      eyebrow={copy.eyebrow}
      heading={copy.heading}
      intro={copy.intro}
      tone="muted"
    >
      <article className="screening-summary">
        <div>
          <p className="screening-summary__title">{propertyScreening.objectLabel}</p>
          <p className="screening-preview__note">{propertyScreening.note}</p>
        </div>
        <div className="screening-summary__badges">
          <StatusBadge variant="notLive">{propertyScreening.status}</StatusBadge>
          <StatusBadge variant="attention">{propertyScreening.warning}</StatusBadge>
        </div>
      </article>

      <ul className="screening-grid">
        {propertyScreening.outputs.map((output) => (
          <li key={output.label}>
            <ModulePreviewCard
              label={labels.mockOutput}
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
