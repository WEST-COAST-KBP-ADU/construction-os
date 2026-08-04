import ControlPanelPreview from "@/src/components/ControlPanelPreview";
import { siteConfig } from "@/src/lib/siteConfig";

export default function Hero() {
  const { hero } = siteConfig;

  return (
    <section className="hero">
      <div className="portal-container hero__layout">
        <div className="hero__copy">
          <span className="hero__badge">
            <span aria-hidden className="hero__badge-dot" />
            {hero.badge}
          </span>

          <p className="hero__eyebrow">{hero.eyebrow}</p>
          <h1 className="hero__title">{hero.heading}</h1>
          <p className="hero__intro">{hero.subheading}</p>

          <div className="hero__actions">
            <a href={hero.ctaHref} className="button button--primary">
              {hero.ctaLabel}
            </a>
            <a href={hero.secondaryCtaHref} className="button button--secondary">
              {hero.secondaryCtaLabel}
              <span aria-hidden>→</span>
            </a>
          </div>

          <ul className="hero__highlights">
            {hero.highlights.map((point) => (
              <li key={point} className="hero__highlight">
                <span aria-hidden className="hero__highlight-dot" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <ControlPanelPreview
          objectId={hero.panel.label}
          title={hero.panel.title}
          status={hero.panel.status}
          items={hero.panel.rows.map((row) => ({ ...row, tone: "preview" as const }))}
        />
      </div>
    </section>
  );
}
