import Image from "next/image";
import Link from "next/link";

import { buildBusinessJsonLd, serializeJsonLd } from "@/src/lib/structuredData";

const servicePaths = [
  {
    index: "01",
    title: "Detached ADUs",
    description:
      "A purpose-built home in the yard, organized around the existing property and the people who will use it.",
    href: "/services/detached-adu",
  },
  {
    index: "02",
    title: "Conversions & attached space",
    description:
      "Garage conversions, attached ADUs, and JADUs considered as practical ways to use the footprint you already have.",
    href: "/services/garage-conversion",
  },
  {
    index: "03",
    title: "Substantial residential work",
    description:
      "Additions and coordinated residential scopes approached with the same emphasis on clarity, review, and buildable detail.",
    href: "/process",
  },
] as const;

const processSteps = [
  {
    index: "01",
    title: "Understand the property",
    description:
      "Start with the home, the site, and the household goal. Unknown property or jurisdiction facts stay explicitly unresolved.",
  },
  {
    index: "02",
    title: "Shape a reviewable direction",
    description:
      "Organize the candidate scope, missing information, and decisions before treating an idea like a commitment.",
  },
  {
    index: "03",
    title: "Move only after review",
    description:
      "OwnerReview remains the control point before any future external action, price, schedule, or project commitment.",
  },
] as const;

export default function Home() {
  return (
    <main id="main-content" className="site-main editorial-home">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildBusinessJsonLd()) }}
      />

      <section className="residential-hero" aria-labelledby="home-hero-title">
        <Image
          src="/images/attainable-adu-hero-concept-v1.webp"
          alt="Conceptual image of a modest detached ADU in a typical California backyard"
          fill
          priority
          sizes="100vw"
          className="residential-hero__image"
        />
        <div className="residential-hero__shade" aria-hidden="true" />
        <div className="residential-hero__drawing" aria-hidden="true">
          <span className="residential-hero__axis" />
          <span className="residential-hero__measure">concept / 01</span>
        </div>

        <div className="portal-container residential-hero__inner">
          <div className="residential-hero__copy">
            <p className="residential-hero__eyebrow">ADU & residential construction · California</p>
            <h1 id="home-hero-title" className="residential-hero__title">
              More room for the life you already have.
            </h1>
            <p className="residential-hero__lede">
              Thoughtful ADUs, conversions, and substantial residential work—shaped around real homes,
              real lots, and decisions that deserve careful review.
            </p>
            <div className="residential-hero__actions">
              <Link href="/services/detached-adu" className="button button--light">
                Explore ADU options
              </Link>
              <Link href="/process" className="text-link text-link--inverse">
                See how the process works <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>

          <p className="residential-hero__caption">
            Conceptual imagery—not a completed West Coast KBP project.
          </p>
        </div>
      </section>

      <section className="editorial-section editorial-section--intro" aria-labelledby="intro-title">
        <div className="portal-container editorial-intro">
          <p className="editorial-kicker">Built around the home you already have</p>
          <div className="editorial-intro__copy">
            <h2 id="intro-title">Good residential work should feel considered, not out of reach.</h2>
            <p>
              The design language is architectural, but the work stays grounded: ordinary California
              neighborhoods, practical footprints, durable materials, and a clear path from early intent
              to reviewed scope.
            </p>
          </div>
        </div>
      </section>

      <section className="editorial-section" aria-labelledby="services-title">
        <div className="portal-container">
          <div className="editorial-heading">
            <p className="editorial-kicker">Ways to create space</p>
            <h2 id="services-title">Start with the change your household needs.</h2>
          </div>

          <ol className="residential-services">
            {servicePaths.map((service) => (
              <li key={service.index} className="residential-service">
                <span className="residential-service__index">{service.index}</span>
                <div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </div>
                <Link href={service.href} className="residential-service__link" aria-label={`Learn about ${service.title}`}>
                  <span aria-hidden="true">↗</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="editorial-story" aria-labelledby="story-title">
        <div className="editorial-story__image-wrap">
          <Image
            src="/images/attainable-residential-addition-concept-v1.webp"
            alt="Conceptual image of a practical addition to an existing California home"
            fill
            sizes="(max-width: 760px) 100vw, 58vw"
            className="editorial-story__image"
          />
          <p className="editorial-story__caption">Conceptual imagery · attainable residential scale</p>
        </div>
        <div className="editorial-story__copy">
          <p className="editorial-kicker">A quieter kind of premium</p>
          <h2 id="story-title">Quality lives in the decisions, not in spectacle.</h2>
          <p>
            A useful floor plan. Light where it matters. Materials that suit the home. Details that can be
            explained and reviewed. The goal is not to make every project look expensive—it is to make the
            experience feel deliberate.
          </p>
          <Link href="/about" className="text-link">
            About West Coast KBP <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      <section className="editorial-section editorial-section--process" aria-labelledby="process-title">
        <div className="portal-container process-editorial">
          <div className="editorial-heading editorial-heading--light">
            <p className="editorial-kicker">From idea to reviewed direction</p>
            <h2 id="process-title">Clarity before commitment.</h2>
          </div>
          <ol className="process-editorial__steps">
            {processSteps.map((step) => (
              <li key={step.index}>
                <span>{step.index}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </li>
            ))}
          </ol>
          <Link href="/process" className="button button--outline-light">
            Review the full process
          </Link>
        </div>
      </section>

      <section className="editorial-section editorial-section--verification" aria-labelledby="verification-title">
        <div className="portal-container verification-grid">
          <div>
            <p className="editorial-kicker">Property questions need official answers</p>
            <h2 id="verification-title">Useful guidance without false certainty.</h2>
          </div>
          <div>
            <p>
              Early screening can organize what to check, what is missing, and which official source may
              matter. It is never presented as a permit, zoning, engineering, legal, or buildability
              conclusion.
            </p>
            <p className="verification-note">Requires official source verification.</p>
            <Link href="/faq" className="text-link">
              Read common questions <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="home-cta" aria-labelledby="home-cta-title">
        <div className="portal-container home-cta__inner">
          <p className="editorial-kicker">A practical place to begin</p>
          <h2 id="home-cta-title">Explore the right kind of space for your property.</h2>
          <p>
            Review the available residential paths and the questions that should be resolved before a
            project moves forward. No form, quote, or live intake is connected to this preview.
          </p>
          <div className="home-cta__actions">
            <Link href="/services/detached-adu" className="button button--primary">
              Explore services
            </Link>
            <Link href="/compare" className="text-link">
              Compare ADU paths <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
