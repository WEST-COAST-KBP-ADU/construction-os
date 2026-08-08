import type { Metadata } from "next";

import JourneyExit from "@/src/components/content/JourneyExit";
import StudioWorkbench from "@/src/components/studio/StudioWorkbench";

export const metadata: Metadata = {
  title: "Concept Studio",
  description:
    "Explore deterministic, conceptual ADU configurations on a synthetic sample property. No address or contact information is collected.",
  alternates: {
    canonical: "/studio",
  },
};

export default function StudioPage() {
  return (
    <main id="main-content" className="site-main">
      <StudioWorkbench />
      <JourneyExit route="studio" />
    </main>
  );
}
