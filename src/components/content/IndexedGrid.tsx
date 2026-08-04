import type { IndexedContentItem } from "@/src/lib/contentPages";

export default function IndexedGrid({
  items,
  className = "",
}: {
  items: readonly IndexedContentItem[];
  className?: string;
}) {
  const classes = ["indexed-grid", className].filter(Boolean).join(" ");

  return (
    <ol className={classes}>
      {items.map((item, index) => (
        <li key={item.title} className="indexed-grid__item">
          <span className="indexed-grid__index" aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="indexed-grid__title">{item.title}</h3>
          <p className="indexed-grid__description">{item.description}</p>
        </li>
      ))}
    </ol>
  );
}
