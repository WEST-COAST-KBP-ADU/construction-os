import type { Metadata } from "next";

import JourneyExit from "@/src/components/content/JourneyExit";
import StudioWorkbench from "@/src/components/studio/StudioWorkbench";
import { resolveStudioEntry } from "@/src/lib/studio/heroEntryContract";

export const metadata: Metadata = {
  title: "Concept Studio",
  description:
    "Explore deterministic, conceptual ADU configurations on a synthetic sample property. No address or contact information is collected.",
  alternates: {
    canonical: "/studio",
  },
};

export default async function StudioPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const entry = resolveStudioEntry(await searchParams);

  return (
    <main id="main-content" className="site-main">
      <StudioWorkbench initialArchetype={entry.archetype} />
      <JourneyExit route="studio" />
    </main>
  );
}
