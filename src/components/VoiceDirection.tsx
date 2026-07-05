import ModulePreviewCard from "@/src/components/ModulePreviewCard";
import PortalSection from "@/src/components/PortalSection";
import { siteConfig } from "@/src/lib/siteConfig";

export default function VoiceDirection() {
  const { sections, voice } = siteConfig;
  const copy = sections.voice;

  return (
    <PortalSection
      id="voice-front-door"
      eyebrow={copy.eyebrow}
      heading={copy.heading}
      intro={copy.intro}
      tone="dark"
    >
      <ul className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {voice.checkpoints.map((checkpoint) => (
          <li key={checkpoint.label}>
            <ModulePreviewCard
              dark
              label="Voice gate"
              title={checkpoint.label}
              description={checkpoint.detail}
              status={voice.status}
              statusVariant="notLive"
            />
          </li>
        ))}
      </ul>
    </PortalSection>
  );
}
