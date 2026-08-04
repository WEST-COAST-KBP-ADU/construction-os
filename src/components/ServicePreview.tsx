import ModulePreviewCard from "@/src/components/ModulePreviewCard";
import PortalSection from "@/src/components/PortalSection";
import { siteConfig } from "@/src/lib/siteConfig";

export default function ServicePreview() {
  const { sections, services } = siteConfig;
  const copy = sections.services;

  return (
    <PortalSection
      id="services"
      eyebrow={copy.eyebrow}
      heading={copy.heading}
      intro={copy.intro}
      tone="muted"
    >
      <ul className="service-grid">
        {services.map((service, index) => (
          <li key={service.title}>
            <ModulePreviewCard
              label={String(index + 1).padStart(2, "0")}
              title={service.title}
              description={service.description}
              status={service.lane}
            />
          </li>
        ))}
      </ul>
    </PortalSection>
  );
}
