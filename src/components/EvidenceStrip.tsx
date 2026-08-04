export default function EvidenceStrip({
  label,
  items,
}: {
  label: string;
  items: ReadonlyArray<string>;
}) {
  return (
    <dl className="evidence-strip">
      {items.map((item, index) => (
        <div key={item} className="evidence-strip__item">
          <dt className="definition-label">
            {label} {index + 1}
          </dt>
          <dd className="evidence-strip__detail">{item}</dd>
        </div>
      ))}
    </dl>
  );
}
