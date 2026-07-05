import PortalSection from "@/src/components/PortalSection";
import StatusBadge from "@/src/components/StatusBadge";
import { siteConfig } from "@/src/lib/siteConfig";

export default function Process() {
  const { process, sections } = siteConfig;
  const copy = sections.howItWorks;

  return (
    <PortalSection
      id="how-it-works"
      eyebrow={copy.eyebrow}
      heading={copy.heading}
      intro={copy.intro}
    >
      <ol className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-4">
        {process.steps.map((step) => (
          <li
            key={step.step}
            className="rounded-lg border border-black/[.07] bg-zinc-50 p-5 dark:border-white/[.10] dark:bg-zinc-900"
          >
            <StatusBadge variant={step.title === "OwnerReview" ? "attention" : "preview"}>
              {step.step}
            </StatusBadge>
            <h3 className="mt-5 text-lg font-semibold text-zinc-950 dark:text-zinc-50">
              {step.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              {step.description}
            </p>
          </li>
        ))}
      </ol>
    </PortalSection>
  );
}
