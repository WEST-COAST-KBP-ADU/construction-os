import EvidenceStrip from "@/src/components/EvidenceStrip";
import NextActionBlock from "@/src/components/NextActionBlock";
import PortalCard from "@/src/components/PortalCard";
import StatusBadge from "@/src/components/StatusBadge";
import type { ActiveProjectPreview } from "@/src/lib/siteConfig";

export default function ProjectObjectCard({
  project,
}: {
  project: ActiveProjectPreview;
}) {
  return (
    <li>
      <PortalCard className="h-full">
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">
                {project.id}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                {project.title}
              </h3>
            </div>
            <StatusBadge variant="preview">{project.service}</StatusBadge>
          </div>

          <div className="mt-4">
            <StatusBadge variant="attention">{project.status}</StatusBadge>
          </div>

          <dl className="mt-5 space-y-4 text-sm leading-6">
            <div>
              <dt className="font-semibold text-zinc-950 dark:text-zinc-50">Scope</dt>
              <dd className="mt-1 text-zinc-600 dark:text-zinc-300">{project.scope}</dd>
            </div>
            <div>
              <dt className="font-semibold text-zinc-950 dark:text-zinc-50">Approval</dt>
              <dd className="mt-1 text-zinc-600 dark:text-zinc-300">
                {project.approval}
              </dd>
            </div>
          </dl>

          <div className="mt-5">
            <EvidenceStrip items={[project.evidence]} />
          </div>

          <div className="mt-3">
            <NextActionBlock action={project.nextAction} />
          </div>
        </div>
      </PortalCard>
    </li>
  );
}
