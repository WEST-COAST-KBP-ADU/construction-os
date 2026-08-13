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
import {
  OPERATING_PRINCIPLE_COPY,
  OPERATING_PRINCIPLE_POINTS,
  OPERATING_PRINCIPLE_RECORD_LABEL,
  OPERATING_PRINCIPLE_RECORD_URL,
  OPERATING_PRINCIPLE_TITLE_ID,
} from "@/src/lib/operatingPrinciple";
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
            <p className="spine-kicker">How we work</p>
            <h2 id="product-planes-title">Three things we keep apart.</h2>
            <p>
              Choosing a design, reading what a property allows, and deciding what to do next are
              three different jobs. We keep them apart so an early idea never hardens into an
              answer just because it is on the screen.
            </p>
          </div>
          <ol className="spine-planes">
            <li>
              <p className="spine-planes__index">01</p>
              <h3>Choosing a design</h3>
              <p>Compare the homes we publish, and see how far each one has been worked out.</p>
              <p className="spine-planes__limit">Does not determine a property fit.</p>
            </li>
            <li>
              <p className="spine-planes__index">02</p>
              <h3>Reading the property</h3>
              <p>Open the official City or County sources that apply, and find the next question.</p>
              <p className="spine-planes__limit">Does not determine eligibility or buildability.</p>
            </li>
            <li>
              <p className="spine-planes__index">03</p>
              <h3>Deciding with a person</h3>
              <p>Keep the open questions in front of a person before anything moves forward.</p>
              <p className="spine-planes__limit">Does not automate approval or commitment.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="spine-section spine-section--muted" aria-labelledby="owned-models-title">
        <div className="portal-container spine-section__inner">
          <div className="spine-section__header">
            <p className="spine-kicker">The homes we build</p>
            <h2 id="owned-models-title">Three homes, worked out in detail.</h2>
            <p>
              Each card says only what has been settled for that home. Nothing here has been
              costed, scheduled, or fitted to a particular lot.
            </p>
          </div>
          <ModelCatalog catalog={catalog} surface="home" />
        </div>
      </section>

      <section className="spine-section" aria-labelledby="concept-studio-title">
        <div className="portal-container spine-section__inner spine-section__split">
          <div className="spine-section__header">
            <p className="spine-kicker">Concept Studio</p>
            <h2 id="concept-studio-title">Try ideas first, before a property is in view.</h2>
            <p>
              The Studio is not tied to an address and asks for no contact details. Tying what you
              draw here to one of the published homes is being built; it is not active today.
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
              <p className="spine-kicker">What we build</p>
              <h2 id="service-paths-title">Say what you are building, and open the detail.</h2>
              <p>
                Four of these have a page of their own today. Residential Addition does not yet,
                and we would rather say so than send you somewhere that is not written.
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
                    A page of its own is not written yet, so there is nothing here to open.
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
            <h2 id="process-title">Say what you want, look, check the sources, then decide.</h2>
            <p>
              The order keeps early looking useful without letting a drawing or a code lookup turn
              into a promise about your project.
            </p>
          </div>
          <ol className="spine-process">
            {[
              ["01", "Say what you want", "Name the direction you have in mind. What is unknown stays unknown."],
              ["02", "Look", "Go through the published homes, or sketch anonymously in the Studio."],
              ["03", "Check the sources", "Read what the current official City and County sources actually say."],
              ["04", "Decide", "A person decides whether the next step goes ahead, waits, or stops."],
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
            <p className="spine-kicker">Where we work</p>
            <h2 id="service-context-title">The City and the County are not the same.</h2>
            <p>
              Open the official-source guide for the City of Sacramento, or for unincorporated
              Sacramento County. Neither guide decides what your lot allows.
            </p>
          </div>
          <div className="spine-contexts">
            {jurisdictionPages.map((page) => (
              <article key={page.slug}>
                <p className="spine-contexts__index">{page.sequence}</p>
                <h3>{page.shortTitle}</h3>
                <p>{page.reviewSignal}</p>
                <Link href={"/adu-builder/" + page.slug} className="text-link">
                  Open the {page.shortTitle} guide <span aria-hidden="true">→</span>
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
            <p className="spine-kicker">What we will and will not say</p>
            <h2 id="truth-boundary-title">Facts, ideas, and open questions stay visibly apart.</h2>
            <p>
              It is deliberate. You can see which statements are settled facts about the homes we
              publish, which pictures are only ideas, and which questions still need a person.
            </p>
            <ul className="spine-truth">
              <li>
                <h3>Settled facts</h3>
                <p>The names, sizes, and layouts of the homes we publish, and how far each is worked out.</p>
              </li>
              <li>
                <h3>Only an idea</h3>
                <p>Every image is labeled beside the image and is not presented as a completed project.</p>
              </li>
              <li>
                <h3>Questions for a person</h3>
                <p>What a property, an approval, or a build allows is not something a web page answers.</p>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section
        className="spine-section spine-principle"
        aria-labelledby={OPERATING_PRINCIPLE_TITLE_ID}
        data-o2-premium
      >
        <div className="portal-container spine-section__inner">
          <div className="spine-section__header">
            <p className="spine-kicker">{OPERATING_PRINCIPLE_COPY.kicker}</p>
            <h2 id={OPERATING_PRINCIPLE_TITLE_ID}>{OPERATING_PRINCIPLE_COPY.heading}</h2>
            <p>{OPERATING_PRINCIPLE_COPY.statement}</p>
          </div>
          <ul className="spine-truth">
            {OPERATING_PRINCIPLE_POINTS.map((point) => (
              <li key={point.id}>
                <h3>{point.title}</h3>
                <p>{point.body}</p>
              </li>
            ))}
          </ul>
          <p className="spine-section__footer-link">
            <a href={OPERATING_PRINCIPLE_RECORD_URL} className="text-link" rel="noreferrer">
              {OPERATING_PRINCIPLE_RECORD_LABEL} <span aria-hidden="true">→</span>
            </a>
          </p>
        </div>
      </section>

      <section className="spine-section spine-section--dark" aria-labelledby="final-exits-title">
        <div className="portal-container spine-section__inner">
          <div className="spine-section__header">
            <p className="spine-kicker">Where to next</p>
            <h2 id="final-exits-title">Keep looking. Nothing here asks for your details.</h2>
          </div>
          <nav aria-label="Safe next steps" className="spine-exits">
            <Link href="/models">
              <span>01</span>
              <strong>Models</strong>
              <small>Look through the homes we publish.</small>
            </Link>
            <Link href="/process">
              <span>02</span>
              <strong>Process</strong>
              <small>See how a job moves, step by step.</small>
            </Link>
            <Link href="/faq">
              <span>03</span>
              <strong>FAQ</strong>
              <small>Straight answers, and the limits of each.</small>
            </Link>
            <Link href="/about">
              <span>04</span>
              <strong>About</strong>
              <small>See how this business is run.</small>
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
