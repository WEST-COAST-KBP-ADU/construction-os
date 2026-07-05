import ModulePreviewCard from "@/src/components/ModulePreviewCard";
import PortalSection from "@/src/components/PortalSection";
import StatusBadge from "@/src/components/StatusBadge";
import { siteConfig } from "@/src/lib/siteConfig";

export default function GCPartnerPath() {
  const { gcPartner, sections } = siteConfig;
  const copy = sections.gc;

  return (
    <PortalSection
      id="gc-partners"
      eyebrow={copy.eyebrow}
      heading={copy.heading}
      intro={copy.intro}
    >
      <div className="mt-10 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <ModulePreviewCard
          dark
          label={gcPartner.label}
          title={gcPartner.heading}
          description={gcPartner.intro}
          status={gcPartner.inactiveAction}
          statusVariant="notLive"
        >
          <StatusBadge variant="attention">Owner approval required</StatusBadge>
        </ModulePreviewCard>

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {gcPartner.capability.map((item) => (
            <li key={item}>
              <ModulePreviewCard
                label="Partner control"
                title={item}
                description="Preview-only lane structure. No bid, quote, submission, account, or message is created here."
                status="Preview"
              />
            </li>
          ))}
        </ul>
      </div>
    </PortalSection>
  );
}
