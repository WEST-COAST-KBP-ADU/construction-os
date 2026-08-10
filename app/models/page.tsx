import type { Metadata } from "next";
import Link from "next/link";

import ModelCatalog from "@/src/components/content/ModelCatalog";
import { getPublicModelCatalog } from "@/src/lib/publicModelCatalog";

export const metadata: Metadata = {
  title: "Owned ADU models",
  description:
    "Compare the current West Coast KBP owned ADU concept families with their published fact and maturity boundaries.",
  alternates: {
    canonical: "/models",
  },
};

export default async function ModelsPage() {
  const catalog = await getPublicModelCatalog();

  return (
    <main id="main-content" className="site-main spine-home">
      <section className="model-page-hero" aria-labelledby="models-page-title">
        <div className="portal-container model-page-hero__inner">
          <p className="spine-kicker">Owned model family</p>
          <h1 id="models-page-title">Start with a model record, not a property conclusion.</h1>
          <p>
            These three owned ADU families are published from one validated release. They are
            concept-only records with visible facts, option categories, and unresolved boundaries.
          </p>
          <p className="model-page-hero__signal">
            Release <code>{catalog.release.version}</code> · effective{" "}
            <time dateTime={catalog.release.effectiveFrom}>{catalog.release.effectiveFrom}</time>
          </p>
        </div>
      </section>

      <section id="catalog" className="spine-section" aria-labelledby="model-catalog-title">
        <div className="portal-container spine-section__inner">
          <div className="spine-section__header">
            <p className="spine-kicker">Catalog</p>
            <h2 id="model-catalog-title">Three concept families, projected from the release</h2>
            <p>
              The catalog names only the owned records currently released. It does not rank,
              recommend, or determine a fit for any property.
            </p>
          </div>
          <ModelCatalog catalog={catalog} />
        </div>
      </section>

      <section id="maturity" className="spine-section spine-section--muted" aria-labelledby="maturity-title">
        <div className="portal-container spine-section__inner spine-section__split">
          <div className="spine-section__header">
            <p className="spine-kicker">Maturity boundary</p>
            <h2 id="maturity-title">Every published family is visibly concept-only.</h2>
          </div>
          <div className="spine-copy">
            <p>
              A concept-only model can support an early product conversation. It is not presented
              as design-validated, property-compatible, permit-ready, priced, available, or
              construction-ready.
            </p>
            <p>
              <Link href="/studio" className="text-link">
                Open Concept Studio <span aria-hidden="true">→</span>
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
