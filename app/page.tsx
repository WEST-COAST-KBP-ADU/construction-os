import Image from "next/image";
import Link from "next/link";

import { buildBusinessJsonLd, serializeJsonLd } from "@/src/lib/structuredData";

const servicePaths = [
  {
    title: "Detached ADU",
    description: "Private, independent living space for family, guests, or multi-generational use.",
    href: "/services/detached-adu",
    icon: "detached",
  },
  {
    title: "Garage Conversion",
    description: "Transform underused space into comfortable, code-conscious living space.",
    href: "/services/garage-conversion",
    icon: "garage",
  },
  {
    title: "Attached ADU",
    description: "Connected space planned to work with the home's architecture and everyday flow.",
    href: "/compare",
    icon: "attached",
  },
  {
    title: "JADU",
    description: "A compact way to make more useful space within the home you already have.",
    href: "/faq",
    icon: "jadu",
  },
  {
    title: "Residential Addition",
    description: "More room, light, and function through an addition that belongs with the home.",
    href: "/process",
    icon: "addition",
  },
] as const;

function ServiceIcon({ variant }: { variant: (typeof servicePaths)[number]["icon"] }) {
  return (
    <svg className="balanced-service__icon" viewBox="0 0 64 52" aria-hidden="true">
      <path d="M5 48V18L32 5l27 13v30M5 48h54" />
      {variant === "detached" && <path d="M22 48V31h20v17M26 19h12" />}
      {variant === "garage" && <path d="M15 48V27h34v21M19 33h26M19 39h26" />}
      {variant === "attached" && <path d="M12 48V24h22v24M34 48V14h18v34M19 31h8M40 23h6" />}
      {variant === "jadu" && <path d="M18 48V24l14-11 14 11v24M27 48V34h10v14" />}
      {variant === "addition" && <path d="M8 48V24h24v24M32 48V31h24v17M39 31l8-9 9 9" />}
    </svg>
  );
}

export default function Home() {
  return (
    <main id="main-content" className="site-main balanced-home">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildBusinessJsonLd()) }}
      />

      <section className="balanced-hero" aria-labelledby="home-hero-title">
        <Image
          src="/images/balanced-adu-hero-concept-v2.webp"
          alt="Conceptual image of a thoughtfully designed detached ADU on an established California lot"
          fill
          priority
          sizes="100vw"
          className="balanced-hero__image"
        />
        <div className="balanced-hero__shade" aria-hidden="true" />
        <div className="portal-container balanced-hero__inner">
          <div className="balanced-hero__copy">
            <p className="balanced-kicker balanced-kicker--light">
              ADU &amp; residential construction · California
            </p>
            <h1 id="home-hero-title">Room to live better.</h1>
            <p className="balanced-hero__lede">
              Thoughtful ADUs, conversions, and residential additions—shaped around real California
              homes, real lots, and decisions that deserve careful review.
            </p>
            <div className="balanced-actions">
              <Link href="/services/detached-adu" className="button balanced-button--light">
                Explore ADU options
              </Link>
              <Link href="/process" className="balanced-link balanced-link--light">
                See how the process works <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
          <p className="balanced-caption">Conceptual imagery—not a completed West Coast KBP project.</p>
        </div>
      </section>

      <section className="balanced-solutions" aria-labelledby="solutions-title">
        <div className="portal-container balanced-solutions__intro">
          <div className="balanced-solutions__copy">
            <p className="balanced-kicker">Built for real California homes</p>
            <h2 id="solutions-title">Solutions that fit your home and how you live.</h2>
            <p>
              From independent backyard homes to smart conversions and seamless additions, each path
              starts with the household need and the realities of the existing property.
            </p>
          </div>
          <figure className="balanced-media balanced-media--addition">
            <Image
              src="/images/balanced-residential-addition-concept-v2.webp"
              alt="Conceptual image of a carefully integrated addition to an established California home"
              fill
              sizes="(max-width: 760px) 100vw, 58vw"
            />
            <figcaption>Conceptual imagery—not a completed West Coast KBP project.</figcaption>
          </figure>
        </div>

        <div className="portal-container">
          <ul className="balanced-services">
            {servicePaths.map((service) => (
              <li key={service.title} className="balanced-service">
                <ServiceIcon variant={service.icon} />
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <Link href={service.href} className="balanced-link">
                  Learn more <span aria-hidden="true">↗</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="balanced-process" aria-labelledby="process-title">
        <div className="portal-container balanced-process__grid">
          <div className="balanced-process__copy">
            <p className="balanced-kicker balanced-kicker--light">Our process</p>
            <h2 id="process-title">Clarity before commitment.</h2>
            <p>
              A straightforward, collaborative path helps organize the goal, the trade-offs, the
              unresolved facts, and the decisions ahead before an idea is treated as a commitment.
            </p>
            <p className="balanced-process__note">Property-specific conclusions require official source verification.</p>
            <Link href="/process" className="balanced-link balanced-link--light">
              See how the process works <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <figure className="balanced-media balanced-media--process">
            <Image
              src="/images/balanced-process-materials-concept-v2.webp"
              alt="Conceptual architectural plan and durable residential material samples under review"
              fill
              sizes="(max-width: 760px) 100vw, 58vw"
            />
            <figcaption>Conceptual imagery—not a real parcel, permit, or approved plan.</figcaption>
          </figure>
        </div>
      </section>

      <section className="balanced-quality" aria-labelledby="quality-title">
        <div className="portal-container balanced-quality__grid">
          <figure className="balanced-media balanced-media--interior">
            <Image
              src="/images/balanced-interior-concept-v2.webp"
              alt="Conceptual family room with durable materials and a comfortable connection to a California garden"
              fill
              sizes="(max-width: 760px) 100vw, 55vw"
            />
            <figcaption>Conceptual imagery—not a completed West Coast KBP project.</figcaption>
          </figure>
          <div className="balanced-quality__copy">
            <p className="balanced-kicker">Quality that lasts</p>
            <h2 id="quality-title">Thoughtful design. Durable execution.</h2>
            <p>
              The focus is on useful layouts, natural light, durable materials, and details that can
              be explained and reviewed—not display for its own sake.
            </p>
            <Link href="/about" className="balanced-link">
              About West Coast KBP <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
