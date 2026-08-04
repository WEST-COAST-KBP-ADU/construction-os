import StatusBadge from "@/src/components/StatusBadge";

export default function NextActionBlock({
  label,
  action,
  status,
}: {
  label: string;
  action: string;
  status: string;
}) {
  return (
    <div className="next-action">
      <div className="next-action__copy">
        <p className="definition-label">{label}</p>
        <p className="next-action__text">{action}</p>
      </div>
      <StatusBadge variant="attention">{status}</StatusBadge>
    </div>
  );
}
