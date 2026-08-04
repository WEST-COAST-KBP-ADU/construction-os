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
      alignment="center"
    >
      <div className="cta-actions">
        <a href={cta.primaryHref} className="button button--primary">
          {cta.primaryLabel}
        </a>
        <a href={cta.secondaryHref} className="button button--secondary">
          {cta.secondaryLabel}
        </a>
      </div>
      <div className="cta-status">
        <StatusBadge variant="notLive">{cta.disabledLabel}</StatusBadge>
      </div>
    </PortalSection>
  );
}
