import PortalSection from "@/src/components/PortalSection";
import StatusBadge from "@/src/components/StatusBadge";
import { siteConfig } from "@/src/lib/siteConfig";

export default function Process() {
  const { process, sections } = siteConfig;
  const copy = sections.howItWorks;

  return (
    <PortalSection id="how-it-works" eyebrow={copy.eyebrow} heading={copy.heading} intro={copy.intro}>
      <ol className="process-grid">
        {process.steps.map((step) => (
          <li key={step.step} className="process-card">
            <StatusBadge variant={step.tone}>{step.step}</StatusBadge>
            <h3 className="process-card__title">{step.title}</h3>
            <p className="process-card__description">{step.description}</p>
          </li>
        ))}
      </ol>
    </PortalSection>
  );
}
