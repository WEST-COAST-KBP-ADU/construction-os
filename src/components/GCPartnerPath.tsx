import ModulePreviewCard from "@/src/components/ModulePreviewCard";
import PortalSection from "@/src/components/PortalSection";
import StatusBadge from "@/src/components/StatusBadge";
import { siteConfig } from "@/src/lib/siteConfig";

export default function GCPartnerPath() {
  const { gcPartner, labels, sections } = siteConfig;
  const copy = sections.gc;

  return (
    <PortalSection id="gc-partners" eyebrow={copy.eyebrow} heading={copy.heading} intro={copy.intro}>
      <div className="partner-grid">
        <div className="partner-grid__primary">
          <ModulePreviewCard
            dark
            label={gcPartner.label}
            title={gcPartner.heading}
            description={gcPartner.intro}
            status={gcPartner.inactiveAction}
            statusVariant="notLive"
          >
            <StatusBadge variant="attention">{labels.ownerApprovalRequired}</StatusBadge>
          </ModulePreviewCard>
        </div>

        <ul className="partner-grid__items">
          {gcPartner.capability.map((item) => (
            <li key={item}>
              <ModulePreviewCard
                label={labels.partnerControl}
                title={item}
                description={gcPartner.capabilityDescription}
                status={gcPartner.inactiveAction}
              />
            </li>
          ))}
        </ul>
      </div>
    </PortalSection>
  );
}
