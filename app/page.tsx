import Hero from "@/src/components/Hero";
import TrustBar from "@/src/components/TrustBar";
import ServicePreview from "@/src/components/ServicePreview";
import Process from "@/src/components/Process";
import ProjectPreview from "@/src/components/ProjectPreview";
import GCPartnerPath from "@/src/components/GCPartnerPath";
import PreviewCTA from "@/src/components/PreviewCTA";
import { siteConfig } from "@/src/lib/siteConfig";

export default function Home() {
  return (
    <main className="flex-1">
      {/* 1. Hero — transparent-builder headline + preview-only CTA */}
      <Hero />

      {/* 2. Trust bar — proof before launch, milestone visibility, no capture */}
      <TrustBar />

      {/* 3. Service ladder — detached ADU → garage → attached/residential → GC */}
      <ServicePreview />

      {/* 4. Process — typical sequence, property-specific review required */}
      <Process />

      {/* 5. Project preview — 3 placeholder cards, no real PII or facts */}
      <ProjectPreview />

      {/* Service areas — geographic focus; coverage confirmed during review */}
      <section
        id="service-areas"
        aria-labelledby="service-areas-heading"
        className="w-full scroll-mt-20 border-t border-black/[.06] dark:border-white/[.08]"
      >
        <div className="mx-auto w-full max-w-5xl px-6 py-16 sm:py-20">
          <h2
            id="service-areas-heading"
            className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl"
          >
            Service areas
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-300">
            We focus on projects in these areas. Coverage for a specific address
            is confirmed during review.
          </p>
          <ul className="mt-8 flex flex-wrap gap-3">
            {siteConfig.serviceAreas.map((area) => (
              <li
                key={area}
                className="rounded-full border border-black/[.08] bg-white px-5 py-2 text-sm font-medium text-zinc-700 dark:border-white/[.12] dark:bg-zinc-950 dark:text-zinc-200"
              >
                {area}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 6. GC partner path — capability placeholder + preview-only bid path */}
      <GCPartnerPath />

      {/* 7. Preview-only CTA — explicit: nothing collected until Owner approval */}
      <PreviewCTA />
    </main>
  );
}
