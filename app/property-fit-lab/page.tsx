import type { Metadata } from "next";

import PropertyFitLab from "@/src/components/property-fit/PropertyFitLab";

export const metadata: Metadata = {
  title: "Synthetic Property Fit Lab",
  description: "Internal deterministic geometry interaction lab using a fictional parcel and assumed constraints.",
  robots: { index: false, follow: false },
};

export default function PropertyFitLabPage() {
  return (
    <main id="main-content" className="site-main">
      <PropertyFitLab />
    </main>
  );
}
