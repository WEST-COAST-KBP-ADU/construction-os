import ModulePreviewCard from "@/src/components/ModulePreviewCard";
import PortalSection from "@/src/components/PortalSection";
import { siteConfig } from "@/src/lib/siteConfig";

export default function ServicePreview() {
  const { services, sections } = siteConfig;
  const copy = sections.services;

  return (
    <PortalSection
      id="services"
      eyebrow={copy.eyebrow}
      heading={copy.heading}
      intro={copy.intro}
      tone="muted"
    >
      <ul className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {services.map((service, i) => (
          <li key={service.title}>
            <ModulePreviewCard
              label={String(i + 1).padStart(2, "0")}
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
