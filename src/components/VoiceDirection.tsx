import ModulePreviewCard from "@/src/components/ModulePreviewCard";
import PortalSection from "@/src/components/PortalSection";
import { siteConfig } from "@/src/lib/siteConfig";

export default function VoiceDirection() {
  const { labels, sections, voice } = siteConfig;
  const copy = sections.voice;

  return (
    <PortalSection
      id="voice-front-door"
      eyebrow={copy.eyebrow}
      heading={copy.heading}
      intro={copy.intro}
      tone="dark"
    >
      <ul className="voice-grid">
        {voice.checkpoints.map((checkpoint) => (
          <li key={checkpoint.label}>
            <ModulePreviewCard
              dark
              label={labels.voiceGate}
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
