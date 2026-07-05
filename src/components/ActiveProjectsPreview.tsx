import PortalSection from "@/src/components/PortalSection";
import ProjectObjectCard from "@/src/components/ProjectObjectCard";
import { siteConfig } from "@/src/lib/siteConfig";

export default function ActiveProjectsPreview() {
  const { activeProjects, sections } = siteConfig;
  const copy = sections.activeProjects;

  return (
    <PortalSection
      id="active-projects"
      eyebrow={copy.eyebrow}
      heading={copy.heading}
      intro={copy.intro}
    >
      <ul className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {activeProjects.map((project) => (
          <ProjectObjectCard key={project.id} project={project} />
        ))}
      </ul>
    </PortalSection>
  );
}
