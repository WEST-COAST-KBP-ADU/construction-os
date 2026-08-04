import Link from "next/link";

import {
  contentPageLabels,
  servicePages,
  type ServiceSlug,
} from "@/src/lib/contentPages";

export default function ServiceExplorer({ currentSlug }: { currentSlug?: ServiceSlug }) {
  return (
    <nav aria-label="Service pages" className="service-explorer">
      <p className="service-explorer__label">{contentPageLabels.exploreServiceLanes}</p>
      <ul className="service-explorer__list">
        {servicePages.map((service) => {
          const isCurrent = service.slug === currentSlug;

          return (
            <li key={service.slug}>
              <Link
                href={`/services/${service.slug}`}
                className="service-explorer__link"
                aria-current={isCurrent ? "page" : undefined}
              >
                <span className="service-explorer__index">{service.sequence}</span>
                <span>{service.shortTitle}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
