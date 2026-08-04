import Link from "next/link";

import ModulePreviewCard from "@/src/components/ModulePreviewCard";
import PortalSection from "@/src/components/PortalSection";
import { contentPageLabels, servicePages } from "@/src/lib/contentPages";
import { siteConfig } from "@/src/lib/siteConfig";

export default function ServicePreview() {
  const { sections } = siteConfig;
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
        {servicePages.map((service) => (
          <li key={service.slug}>
            <ModulePreviewCard
              label={service.sequence}
              title={service.shortTitle}
              description={service.description}
              status={contentPageLabels.servicePageStatus}
            >
              <Link href={`/services/${service.slug}`} className="button button--secondary">
                {contentPageLabels.openServicePage}
              </Link>
            </ModulePreviewCard>
          </li>
        ))}
      </ul>
    </PortalSection>
  );
}
