import ControlPanelPreview from "@/src/components/ControlPanelPreview";
import PortalSection from "@/src/components/PortalSection";
import { siteConfig } from "@/src/lib/siteConfig";

export default function ProjectControlPreview() {
  const { projectControl, sections } = siteConfig;
  const copy = sections.projectControl;

  return (
    <PortalSection
      id="project-control"
      eyebrow={copy.eyebrow}
      heading={copy.heading}
      intro={copy.intro}
      tone="muted"
    >
      <div className="project-control-preview">
        <ControlPanelPreview
          objectId={projectControl.objectId}
          title={projectControl.title}
          status={projectControl.status}
          notice={projectControl.notice}
          items={projectControl.items}
        />
      </div>
    </PortalSection>
  );
}
