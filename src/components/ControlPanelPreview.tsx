import PortalCard from "@/src/components/PortalCard";
import StatusBadge, { type StatusBadgeVariant } from "@/src/components/StatusBadge";

type ControlPanelItem = {
  label: string;
  value: string;
  detail: string;
  tone?: StatusBadgeVariant;
};

export default function ControlPanelPreview({
  objectId,
  title,
  status,
  notice,
  items,
}: {
  objectId: string;
  title: string;
  status: string;
  notice?: string;
  items: ReadonlyArray<ControlPanelItem>;
}) {
  return (
    <PortalCard className="control-panel">
      <div className="control-panel__header">
        <div>
          <p className="definition-label">{objectId}</p>
          <h3 className="control-panel__title">{title}</h3>
        </div>
        <StatusBadge variant="attention">{status}</StatusBadge>
      </div>

      {notice ? <p className="control-panel__notice">{notice}</p> : null}

      <dl className="control-panel__grid">
        {items.map((item) => (
          <div key={item.label} className="control-panel__item">
            <dt className="control-panel__item-label">{item.label}</dt>
            <dd className="control-panel__item-value">
              <StatusBadge variant={item.tone ?? "preview"}>{item.value}</StatusBadge>
              <p className="control-panel__item-detail">{item.detail}</p>
            </dd>
          </div>
        ))}
      </dl>
    </PortalCard>
  );
}
