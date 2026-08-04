import type { ReactNode } from "react";

type PortalSectionTone = "default" | "muted" | "dark";
type PortalSectionAlignment = "start" | "center";

export default function PortalSection({
  id,
  eyebrow,
  heading,
  intro,
  children,
  tone = "default",
  alignment = "start",
}: {
  id: string;
  eyebrow: string;
  heading: string;
  intro: string;
  children: ReactNode;
  tone?: PortalSectionTone;
  alignment?: PortalSectionAlignment;
}) {
  const headingId = id + "-heading";
  const headerClasses = ["section-header", "section-header--" + alignment].join(" ");
  const sectionClasses = ["portal-section", "portal-section--" + tone].join(" ");

  return (
    <section id={id} aria-labelledby={headingId} className={sectionClasses}>
      <div className="portal-container portal-section__inner">
        <div className={headerClasses}>
          <p className="section-header__eyebrow">{eyebrow}</p>
          <h2 id={headingId} className="section-header__title">
            {heading}
          </h2>
          <p className="section-header__intro">{intro}</p>
        </div>
        {children}
      </div>
    </section>
  );
}
