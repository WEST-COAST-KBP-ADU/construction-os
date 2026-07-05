import PortalSection from "@/src/components/PortalSection";
import StatusBadge from "@/src/components/StatusBadge";
import { siteConfig } from "@/src/lib/siteConfig";

export default function PreviewCTA() {
  const { cta, sections } = siteConfig;
  const copy = sections.cta;

  return (
    <PortalSection
      id="preview-cta"
      eyebrow={copy.eyebrow}
      heading={copy.heading}
      intro={copy.intro}
      tone="muted"
      headerClassName="mx-auto max-w-3xl text-center"
    >
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a href={cta.primaryHref} className="portal-link-button">
          {cta.primaryLabel}
        </a>
        <a href={cta.secondaryHref} className="portal-link-button-secondary">
          {cta.secondaryLabel}
        </a>
      </div>
      <div className="mt-5 flex justify-center">
        <StatusBadge variant="notLive">{cta.disabledLabel}</StatusBadge>
      </div>
    </PortalSection>
  );
}
