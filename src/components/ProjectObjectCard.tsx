import EvidenceStrip from "@/src/components/EvidenceStrip";
import NextActionBlock from "@/src/components/NextActionBlock";
import PortalCard from "@/src/components/PortalCard";
import StatusBadge from "@/src/components/StatusBadge";
import { siteConfig, type ActiveProjectPreview } from "@/src/lib/siteConfig";

export default function ProjectObjectCard({
  project,
}: {
  project: ActiveProjectPreview;
}) {
  const { labels } = siteConfig;

  return (
    <PortalCard>
      <article className="project-card">
        <div className="project-card__header">
          <div>
            <p className="definition-label">{project.id}</p>
            <h3 className="project-card__title">{project.title}</h3>
          </div>
          <StatusBadge variant="preview">{project.service}</StatusBadge>
        </div>

        <div className="project-card__status">
          <StatusBadge variant="attention">{project.status}</StatusBadge>
        </div>

        <dl className="project-card__details">
          <div>
            <dt className="project-card__detail-label">{labels.scope}</dt>
            <dd className="project-card__detail">{project.scope}</dd>
          </div>
          <div>
            <dt className="project-card__detail-label">{labels.approval}</dt>
            <dd className="project-card__detail">{project.approval}</dd>
          </div>
        </dl>

        <EvidenceStrip label={labels.evidence} items={[project.evidence]} />
        <NextActionBlock
          label={labels.nextAction}
          action={project.nextAction}
          status={labels.ownerApprovalRequired}
        />
      </article>
    </PortalCard>
  );
}
