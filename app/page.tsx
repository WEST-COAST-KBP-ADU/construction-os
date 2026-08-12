import Image from "next/image";
import Link from "next/link";

import ModelCatalog from "@/src/components/content/ModelCatalog";
import HeroBlueprintStage from "@/src/components/home/HeroBlueprintStage";
import {
  DEEDSEAL_CROSS_REFERENCE_LEAD,
  DEEDSEAL_CROSS_REFERENCE_LINK_TEXT,
  DEEDSEAL_CROSS_REFERENCE_TAIL,
  DEEDSEAL_PROOF_RECORD_LABEL,
  DEEDSEAL_PROOF_RECORD_URL,
  DEEDSEAL_PUBLIC_URL,
} from "@/src/lib/deedsealCrossReference";
import { homepageServices } from "@/src/lib/homepageServices";
import { jurisdictionPages } from "@/src/lib/jurisdictionPages";
import { getPublicModelCatalog } from "@/src/lib/publicModelCatalog";
import { buildBusinessJsonLd, serializeJsonLd } from "@/src/lib/structuredData";

export default async function Home() {
  const catalog = await getPublicModelCatalog();

  return (
    <main id="main-content" className="site-main spine-home">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildBusinessJsonLd()) }}
      />

      <HeroBlueprintStage />

      <section className="spine-section" aria-labelledby="product-planes-title">
        <div className="portal-container spine-section__inner">
          <div className="spine-section__header">
            <p className="spine-kicker">How the product stays legible</p>
            <h2 id="product-planes-title">Three planes, each with a different job.</h2>
            <p>
              The surface separates model choice, property context, and human review so a concept
              does not become a conclusion simply because it is visible.
            </p>
          </div>
          <ol className="spine-planes">
            <li>
              <p className="spine-planes__index">01</p>
              <h3>Model choice</h3>
              <p>Compare the owned concept records and their published maturity boundaries.</p>
              <p className="spine-planes__limit">Does not determine a property fit.</p>
            </li>
            <li>
              <p className="spine-planes__index">02</p>
              <h3>Property context</h3>
              <p>Use jurisdiction records and official sources to orient the next question.</p>
              <p className="spine-planes__limit">Does not determine eligibility or buildability.</p>
            </li>
            <li>
              <p className="spine-planes__index">03</p>
              <h3>Human review</h3>
              <p>Keep unknowns and cross-discipline questions visible before a decision advances.</p>
              <p className="spine-planes__limit">Does not automate approval or commitment.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="spine-section spine-section--muted" aria-labelledby="owned-models-title">
        <div className="portal-container spine-section__inner">
          <div className="spine-section__header">
            <p className="spine-kicker">Owned model preview</p>
            <h2 id="owned-models-title">The current release contains exactly three concept families.</h2>
            <p>
              Each card is a projection of the validated owned-model release. The cards do not
              introduce a separate product taxonomy or program facts.
            </p>
          </div>
          <ModelCatalog catalog={catalog} surface="home" />
        </div>
      </section>

      <section className="spine-section" aria-labelledby="concept-studio-title">
        <div className="portal-container spine-section__inner spine-section__split">
          <div className="spine-section__header">
            <p className="spine-kicker">Concept Studio</p>
            <h2 id="concept-studio-title">Explore anonymously, before a property is in view.</h2>
            <p>
              Concept Studio is property-agnostic and collects no address or contact information.
              Model-bound migration from release <code>{catalog.release.version}</code> is in
              development; it is not active today.
            </p>
            <div className="spine-actions">
              <Link href="/studio" className="button button--primary">
                Open Concept Studio
              </Link>
            </div>
          </div>
          <figure className="spine-media">
            <Image
              src="/images/balanced-process-materials-concept-v2.webp"
              alt="Conceptual image of plan and material studies under review"
              fill
              sizes="(max-width: 54rem) 100vw, 46vw"
            />
            <figcaption>Conceptual imagery—not a real parcel, permit, or approved plan.</figcaption>
          </figure>
        </div>
      </section>

      <section
        id="services"
        className="spine-section spine-section--muted"
        aria-labelledby="service-paths-title"
      >
        <div className="portal-container spine-section__inner">
          <div className="spine-section__split">
            <div className="spine-section__header">
              <p className="spine-kicker">Service paths</p>
              <h2 id="service-paths-title">Name the path, then open the right context.</h2>
              <p>
                The four published service paths open their own existing pages. Residential
                Addition remains intentionally unresolved until its dedicated route is published.
              </p>
            </div>
            <figure className="spine-media spine-media--compact">
              <Image
                src="/images/balanced-residential-addition-concept-v2.webp"
                alt="Conceptual image of an addition connected to an established California home"
                fill
                sizes="(max-width: 54rem) 100vw, 46vw"
              />
              <figcaption>Conceptual imagery—not a completed West Coast KBP project.</figcaption>
            </figure>
          </div>
          <ul className="spine-services">
            {homepageServices.map((service, index) => (
              <li
                key={service.kind === "linked" ? service.slug : service.id}
                className="spine-service"
              >
                <p className="spine-service__index">{String(index + 1).padStart(2, "0")}</p>
                <div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </div>
                {service.kind === "linked" ? (
                  <Link href={service.href} className="text-link spine-service__action">
                    {service.ctaLabel} <span aria-hidden="true">→</span>
                  </Link>
                ) : (
                  <p className="spine-service__unresolved">
                    Dedicated service details are not published. Route selection remains unresolved.
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="spine-section spine-section--dark" aria-labelledby="process-title">
        <div className="portal-container spine-section__inner">
          <div className="spine-section__header">
            <p className="spine-kicker">Process</p>
            <h2 id="process-title">Orient, explore, review context, then make a human decision.</h2>
            <p>
              The order keeps early exploration useful without treating a model or a jurisdiction
              context as a promise about a project.
            </p>
          </div>
          <ol className="spine-process">
            {[
              ["01", "Orient", "State the desired direction without treating missing facts as answers."],
              ["02", "Explore", "Inspect a concept family or anonymous Studio scenario."],
              ["03", "Review context", "Use current official sources and appropriate review for the next question."],
              ["04", "Human decision", "Decide whether a bounded next step is appropriate, paused, or declined."],
            ].map(([sequence, title, description]) => (
              <li key={sequence}>
                <p>{sequence}</p>
                <h3>{title}</h3>
                <span>{description}</span>
              </li>
            ))}
          </ol>
          <p className="spine-section__footer-link">
            <Link href="/process" className="text-link text-link--inverse">
              See the ADU process <span aria-hidden="true">→</span>
            </Link>
          </p>
        </div>
      </section>

      <section className="spine-section" aria-labelledby="service-context-title">
        <div className="portal-container spine-section__inner">
          <div className="spine-section__header">
            <p className="spine-kicker">Service-area context</p>
            <h2 id="service-context-title">City and County context stay separate.</h2>
            <p>
              Select an existing official-source guide for the City of Sacramento or unincorporated
              Sacramento County. Neither guide decides a parcel fit.
            </p>
          </div>
          <div className="spine-contexts">
            {jurisdictionPages.map((page) => (
              <article key={page.slug}>
                <p className="spine-contexts__index">{page.sequence}</p>
                <h3>{page.shortTitle}</h3>
                <p>{page.reviewSignal}</p>
                <Link href={"/adu-builder/" + page.slug} className="text-link">
                  Choose {page.shortTitle} context <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
          <p className="spine-section__footer-link">
            <Link href="/service-areas" className="text-link">
              Browse service-area sources <span aria-hidden="true">→</span>
            </Link>
          </p>
        </div>
      </section>

      <section className="spine-section spine-section--muted" aria-labelledby="truth-boundary-title">
        <div className="portal-container spine-section__inner spine-section__split">
          <figure className="spine-media">
            <Image
              src="/images/balanced-interior-concept-v2.webp"
              alt="Conceptual interior with a connection to a California garden"
              fill
              sizes="(max-width: 54rem) 100vw, 46vw"
            />
            <figcaption>Conceptual imagery—not a completed West Coast KBP project.</figcaption>
          </figure>
          <div className="spine-section__header">
            <p className="spine-kicker">Truth boundary</p>
            <h2 id="truth-boundary-title">Keep facts, concepts, and unknowns visibly apart.</h2>
            <p>
              The distinction is deliberate: a visitor can see which statements are owned product
              facts, which media is conceptual, and which questions remain gated.
            </p>
            <ul className="spine-truth">
              <li>
                <h3>Verified product facts</h3>
                <p>Release-bound model IDs, versions, program, envelope, maturity, and provenance.</p>
              </li>
              <li>
                <h3>Conceptual media</h3>
                <p>Every image is labeled beside the image and is not presented as a completed project.</p>
              </li>
              <li>
                <h3>Unknown / professional gates</h3>
                <p>Property, approval, and construction questions remain outside an editorial card.</p>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="spine-section spine-section--dark" aria-labelledby="final-exits-title">
        <div className="portal-container spine-section__inner">
          <div className="spine-section__header">
            <p className="spine-kicker">Continue safely</p>
            <h2 id="final-exits-title">Choose the next context without opening an intake.</h2>
          </div>
          <nav aria-label="Safe next steps" className="spine-exits">
            <Link href="/models">
              <span>01</span>
              <strong>Models</strong>
              <small>Inspect the owned families.</small>
            </Link>
            <Link href="/process">
              <span>02</span>
              <strong>Process</strong>
              <small>See the review sequence.</small>
            </Link>
            <Link href="/faq">
              <span>03</span>
              <strong>FAQ</strong>
              <small>Read bounded answers.</small>
            </Link>
            <Link href="/about">
              <span>04</span>
              <strong>About</strong>
              <small>Understand the operating model.</small>
            </Link>
          </nav>
        </div>
      </section>

      <aside className="spine-crosslink" aria-label="Deedseal reference" data-o2-premium>
        <div className="portal-container spine-crosslink__inner">
          <p className="spine-crosslink__statement">
            {DEEDSEAL_CROSS_REFERENCE_LEAD}
            <a href={DEEDSEAL_PUBLIC_URL} className="text-link" rel="noreferrer">
              {DEEDSEAL_CROSS_REFERENCE_LINK_TEXT}
            </a>
            {DEEDSEAL_CROSS_REFERENCE_TAIL}
          </p>
          <p className="spine-crosslink__record">
            <a href={DEEDSEAL_PROOF_RECORD_URL} className="text-link" rel="noreferrer">
              {DEEDSEAL_PROOF_RECORD_LABEL} <span aria-hidden="true">→</span>
            </a>
          </p>
        </div>
      </aside>
    </main>
  );
}
