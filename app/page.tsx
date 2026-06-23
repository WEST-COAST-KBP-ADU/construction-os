import Hero from "@/src/components/Hero";
import TrustBar from "@/src/components/TrustBar";
import ServicePreview from "@/src/components/ServicePreview";
import PlatformCapabilityPreview from "@/src/components/PlatformCapabilityPreview";
import ObjectControlPreview from "@/src/components/ObjectControlPreview";
import VoiceDirection from "@/src/components/VoiceDirection";
import Process from "@/src/components/Process";
import GCPartnerPath from "@/src/components/GCPartnerPath";
import PreviewCTA from "@/src/components/PreviewCTA";

export default function Home() {
  return (
    <main className="flex-1">
      {/* 1. Hero — platform framing + illustrative control panel */}
      <Hero />

      {/* 2. Status bar — preview scope, platform direction, no collection */}
      <TrustBar />

      {/* 3. Service ladder — ADU, conversion, residential, GC/subcontract */}
      <ServicePreview />

      {/* 4. Platform capability preview — direction only, not active services */}
      <PlatformCapabilityPreview />

      {/* 5. Existing object control preview — no real object data */}
      <ObjectControlPreview />

      {/* 6. Premium voice direction — not implemented or live */}
      <VoiceDirection />

      {/* 7. Control flow — intent to future Business Hall */}
      <Process />

      {/* 8. GC partner path — first-class lane, no submission path */}
      <GCPartnerPath />

      {/* 9. Preview-only CTA — explicit: nothing collected */}
      <PreviewCTA />
    </main>
  );
}
