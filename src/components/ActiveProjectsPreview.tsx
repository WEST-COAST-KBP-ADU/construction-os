import PortalSection from "@/src/components/PortalSection";
import ProjectObjectCard from "@/src/components/ProjectObjectCard";
import { siteConfig } from "@/src/lib/siteConfig";

export default function ActiveProjectsPreview() {
  const { activeProjects, sections } = siteConfig;
  const copy = sections.activeProjects;

  return (
    <PortalSection id="active-projects" eyebrow={copy.eyebrow} heading={copy.heading} intro={copy.intro}>
      <ul className="project-grid">
        {activeProjects.map((project) => (
          <li key={project.id}>
            <ProjectObjectCard project={project} />
          </li>
        ))}
      </ul>
    </PortalSection>
  );
}
