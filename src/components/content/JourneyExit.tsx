import Link from "next/link";

import { getJourneyExit, type JourneyExitRoute } from "@/src/lib/journeyExits";

export default function JourneyExit({ route }: { route: JourneyExitRoute }) {
  const journeyExit = getJourneyExit(route);

  return (
    <section
      className="content-section content-section--muted"
      aria-labelledby={journeyExit.headingId}
    >
      <div className="portal-container content-section__inner">
        <div className="content-section__header content-section__header--wide">
          <p className="content-section__eyebrow">{journeyExit.eyebrow}</p>
          <h2 id={journeyExit.headingId} className="content-section__title">
            {journeyExit.heading}
          </h2>
          <div className="content-section__intro editorial-copy">
            <p>{journeyExit.intro}</p>
            <p>{journeyExit.boundary}</p>
          </div>
          <div className="cta-actions">
            <Link href={journeyExit.primary.href} className="button button--primary">
              {journeyExit.primary.label}
            </Link>
            <Link href={journeyExit.secondary.href} className="button button--secondary">
              {journeyExit.secondary.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
