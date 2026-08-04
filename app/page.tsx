import Hero from "@/src/components/Hero";
import ServicePreview from "@/src/components/ServicePreview";
import Process from "@/src/components/Process";
import ProjectControlPreview from "@/src/components/ProjectControlPreview";
import ActiveProjectsPreview from "@/src/components/ActiveProjectsPreview";
import PropertyScreeningPreview from "@/src/components/PropertyScreeningPreview";
import GCPartnerPath from "@/src/components/GCPartnerPath";
import VoiceDirection from "@/src/components/VoiceDirection";
import PreviewCTA from "@/src/components/PreviewCTA";
import { buildBusinessJsonLd, serializeJsonLd } from "@/src/lib/structuredData";

export default function Home() {
  return (
    <main id="main-content" className="site-main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildBusinessJsonLd()) }}
      />

      <Hero />
      <ServicePreview />
      <Process />
      <ProjectControlPreview />
      <ActiveProjectsPreview />
      <PropertyScreeningPreview />
      <GCPartnerPath />
      <VoiceDirection />
      <PreviewCTA />
    </main>
  );
}
