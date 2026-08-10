import Link from "next/link";

import type {
  PublicModelCatalog,
  PublicModelCatalogEntry,
} from "@/src/lib/publicModelCatalog";

function formatRange(range: { min: number; max: number }, unit: string): string {
  return `${range.min}–${range.max} ${unit}`;
}

function formatProgram(model: PublicModelCatalogEntry): string {
  const bedrooms = `${model.program.bedrooms} bedroom${model.program.bedrooms === 1 ? "" : "s"}`;
  const bathrooms = `${model.program.bathrooms} bath${model.program.bathrooms === 1 ? "" : "s"}`;

  return `${bedrooms} · ${bathrooms}`;
}

function formatParameterKey(key: string): string {
  return key.replaceAll("_", " ");
}

function ModelCard({
  model,
  surface,
}: {
  model: PublicModelCatalogEntry;
  surface: "home" | "catalog";
}) {
  return (
    <li className={`model-card model-card--${surface}`}>
      <p className="model-card__identity">
        <code>{model.modelId}</code> · v{model.modelVersion}
      </p>
      <h3 className="model-card__title">{model.title}</h3>
      <p className="model-card__maturity">
        Maturity: <code>{model.maturity}</code>
      </p>
      <dl className="model-card__facts">
        <div>
          <dt>Program</dt>
          <dd>{formatProgram(model)}</dd>
        </div>
        <div>
          <dt>Area band</dt>
          <dd>{formatRange(model.areaBandSqft, "sq ft")}</dd>
        </div>
        <div>
          <dt>Reference footprint</dt>
          <dd>
            {model.referenceEnvelope.defaultFootprint.widthFt} ×{" "}
            {model.referenceEnvelope.defaultFootprint.depthFt} ft
          </dd>
        </div>
      </dl>
      <Link href={`/models/${model.modelId}`} className="text-link model-card__action">
        View {model.title} model <span aria-hidden="true">→</span>
      </Link>
    </li>
  );
}

export default function ModelCatalog({
  catalog,
  surface = "catalog",
}: {
  catalog: PublicModelCatalog;
  surface?: "home" | "catalog";
}) {
  return (
    <div className={`model-catalog model-catalog--${surface}`}>
      <p className="model-catalog__release">
        Owned model release <code>{catalog.release.version}</code>
      </p>
      <ul className="model-catalog__grid">
        {catalog.models.map((model) => (
          <ModelCard key={model.modelId} model={model} surface={surface} />
        ))}
      </ul>
    </div>
  );
}

export function ModelDetail({
  catalog,
  model,
}: {
  catalog: PublicModelCatalog;
  model: PublicModelCatalogEntry;
}) {
  return (
    <article className="model-detail">
      <header className="model-detail__hero">
        <div className="portal-container model-detail__hero-inner">
          <nav aria-label="Breadcrumb" className="breadcrumb">
            <Link href="/" className="breadcrumb__link">
              Home
            </Link>
            <span aria-hidden="true" className="breadcrumb__separator">
              /
            </span>
            <Link href="/models" className="breadcrumb__link">
              Models
            </Link>
          </nav>
          <p className="model-detail__eyebrow">
            Owned model record · release <code>{catalog.release.version}</code>
          </p>
          <h1 className="model-detail__title">{model.title}</h1>
          <p className="model-detail__lede">
            <code>{model.modelId}</code> · version {model.modelVersion} · maturity{" "}
            <code>{model.maturity}</code>
          </p>
          <p className="model-detail__boundary">
            This is a fact-led, concept-only model record. It does not establish property
            compatibility, permit status, availability, price, schedule, or construction readiness.
          </p>
        </div>
      </header>

      <section className="spine-section" aria-labelledby="model-facts-title">
        <div className="portal-container spine-section__inner">
          <div className="spine-section__header">
            <p className="spine-kicker">Verified product facts</p>
            <h2 id="model-facts-title">Reference envelope and product record</h2>
          </div>
          <dl className="model-detail__facts">
            <div>
              <dt>Model ID / version</dt>
              <dd>
                <code>{model.modelId}</code> · {model.modelVersion}
              </dd>
            </div>
            <div>
              <dt>Program</dt>
              <dd>{formatProgram(model)}</dd>
            </div>
            <div>
              <dt>Area band</dt>
              <dd>{formatRange(model.areaBandSqft, "sq ft")}</dd>
            </div>
            <div>
              <dt>Reference envelope</dt>
              <dd>
                {formatRange(model.referenceEnvelope.widthFt, "ft")} wide ·{" "}
                {formatRange(model.referenceEnvelope.depthFt, "ft")} deep · up to{" "}
                {model.referenceEnvelope.maxHeightFt} ft high
              </dd>
            </div>
            <div>
              <dt>Default footprint</dt>
              <dd>
                {model.referenceEnvelope.defaultFootprint.widthFt} ×{" "}
                {model.referenceEnvelope.defaultFootprint.depthFt} ft{" "}
                {model.referenceEnvelope.defaultFootprint.shape} ·{" "}
                {model.referenceEnvelope.defaultFootprint.areaSqft} sq ft
              </dd>
            </div>
            <div>
              <dt>Maturity</dt>
              <dd>
                <code>{model.maturity}</code>
              </dd>
            </div>
            <div>
              <dt>Provenance class</dt>
              <dd>
                <code>{model.provenanceClass}</code>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="spine-section spine-section--muted" aria-labelledby="model-config-title">
        <div className="portal-container spine-section__inner">
          <div className="spine-section__header">
            <p className="spine-kicker">Configurable categories</p>
            <h2 id="model-config-title">Published options remain categories, not a live build scope</h2>
          </div>
          <ul className="model-detail__categories">
            {model.configurableCategories.map((category) => (
              <li key={category.category}>
                <h3>{category.category}</h3>
                <p>{category.parameterKeys.map(formatParameterKey).join(" · ")}</p>
              </li>
            ))}
          </ul>
          <p className="model-detail__note">
            The published increment grid is {model.referenceEnvelope.incrementGridFt} ft. The
            current Concept Studio remains anonymous and property-agnostic; it does not yet consume
            this model profile.
          </p>
        </div>
      </section>

      <section className="spine-section spine-section--dark" aria-labelledby="model-unknowns-title">
        <div className="portal-container spine-section__inner">
          <div className="spine-section__header">
            <p className="spine-kicker">Explicit unknowns</p>
            <h2 id="model-unknowns-title">What this record does not conclude</h2>
          </div>
          <ul className="spine-list spine-list--inverse">
            {model.explicitUnknowns.map((unknown) => (
              <li key={unknown}>{unknown}</li>
            ))}
          </ul>
          <div className="spine-actions">
            <Link href="/models" className="button button--light">
              Back to models
            </Link>
            <Link href="/studio" className="button button--outline-light">
              Open Concept Studio
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
