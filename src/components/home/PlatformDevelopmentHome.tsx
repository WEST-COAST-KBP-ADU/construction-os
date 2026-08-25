import Link from "next/link";

import { siteConfig } from "@/src/lib/siteConfig";

import styles from "./PlatformDevelopmentHome.module.css";

/**
 * PRODUCT2-PLATFORM-DEVELOPMENT-FACADE-OPTION2-0001 — the temporary public
 * platform facade, implementing the visual direction the Owner selected as
 * Option 2 on 2026-08-24.
 *
 * The surface has one job: make two things true and understandable in a single
 * screen. West Coast KBP is a real Greater Sacramento ADU and residential
 * construction business building an AI-native operating platform for its own
 * work, and that platform is under development — live intake, accounts,
 * property conclusions and external actions are not enabled.
 *
 * It is a server component by construction. There is no `"use client"`, no
 * hook, no event handler and no effect, so the root route stays static and
 * ships no new client JavaScript. Every visual affordance below — the blueprint
 * grid, the graph-memory connectors, the elevation detail, the entrance motion
 * — is CSS or inline SVG that renders identically with scripting switched off.
 *
 * The four module labels are product-direction labels. They are rendered as a
 * semantic list and deliberately carry no link, because a link would read as a
 * live capability the platform does not have. Each one publishes its own limit
 * next to its description.
 */

const { platformFacade } = siteConfig;

/**
 * The subtle square blueprint grid the whole surface is set on.
 *
 * It is drawn as an SVG `<pattern>` of hairlines rather than as a CSS gradient,
 * because the visual contract rules gradients out and a blueprint grid is a
 * line drawing in the first place. The tile is square by construction, so the
 * grid stays square at every viewport instead of shearing with the box.
 */
function BlueprintGrid() {
  return (
    <svg className={styles.blueprint} aria-hidden="true" focusable="false">
      <defs>
        <pattern
          id="platform-facade-blueprint"
          width="44"
          height="44"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M44 0 V44 M0 44 H44"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            shapeRendering="crispEdges"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#platform-facade-blueprint)" />
    </svg>
  );
}

/**
 * The thin graph-memory layer that runs through the module field: two hairline
 * connectors along the gutters between the four seats, a node where each
 * connector passes a seat, and one node in the centre where all four meet.
 *
 * It is drawn in CSS rather than as a stretched SVG on purpose. The layer has
 * to line up with the grid's own gutters, which means stretching it to the
 * field — and a stretched `viewBox` scales stroke geometry with the box, so an
 * SVG hairline stops being a hairline exactly where the field is widest. A
 * one-pixel border is one pixel at every viewport, which is what "thin" has to
 * mean here.
 *
 * Purely decorative: it is hidden from assistive technology, carries no text,
 * and takes no space in the layout or the focus order.
 */
function GraphMemoryConnectors() {
  return (
    <span className={styles.connectors} aria-hidden="true">
      <span className={styles.connectorNodeTop} />
      <span className={styles.connectorNodeRight} />
      <span className={styles.connectorNodeBottom} />
      <span className={styles.connectorNodeLeft} />
      <span className={styles.connectorCore} />
    </span>
  );
}

/**
 * The one quiet, line-drawn ADU technical detail the visual contract asks for:
 * a reference elevation drawn in the same hairline vocabulary as the blueprint
 * grid it sits on — ground line, envelope, gable, opening and a dimension tick,
 * with no rendering, material, photograph or property claim.
 *
 * It is captioned in the markup as a drawing convention rather than an approved
 * plan, so the drawing cannot be read as a specific project.
 */
function AduElevationDetail() {
  return (
    <svg
      className={styles.detailDrawing}
      viewBox="0 0 168 92"
      aria-hidden="true"
      focusable="false"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="square"
        vectorEffect="non-scaling-stroke"
      >
        {/* Ground line, extended past the envelope the way a section is drawn. */}
        <path d="M6 78 H162" />
        {/* Envelope and gable. */}
        <path d="M34 78 V40 L84 18 L134 40 V78" />
        {/* Eave line. */}
        <path d="M28 42 H140" opacity="0.55" />
        {/* Door and two openings, kept to the drawing's own module. */}
        <path d="M74 78 V56 H94 V78" />
        <path d="M46 52 H62 V68 H46 Z" opacity="0.75" />
        <path d="M106 52 H122 V68 H106 Z" opacity="0.75" />
        {/* Dimension line with end ticks. */}
        <path d="M34 86 H134" opacity="0.5" />
        <path d="M34 83 V89" opacity="0.5" />
        <path d="M134 83 V89" opacity="0.5" />
        {/* Ridge centreline, the one accent the drawing carries. */}
        <path
          className={styles.detailRidge}
          d="M84 12 V24"
          strokeDasharray="3 3"
          opacity="0.9"
        />
      </g>
    </svg>
  );
}

export default function PlatformDevelopmentHome() {
  return (
    <section className={styles.facade} aria-labelledby="platform-facade-title">
      <BlueprintGrid />

      <div className={`portal-container ${styles.inner}`}>
        <div className={styles.editorial}>
          <p className={styles.status}>
            <span className={styles.statusMark} aria-hidden="true" />
            {platformFacade.statusLabel}
          </p>

          <p className={styles.identity}>{platformFacade.identity}</p>

          <h1 id="platform-facade-title" className={styles.heading}>
            {platformFacade.heading}
          </h1>

          <p className={styles.category}>{platformFacade.category}</p>

          <p className={styles.message}>{platformFacade.message}</p>

          <p className={styles.boundary}>{platformFacade.boundary}</p>

          {/*
            The action follows the boundary directly. A reader who has taken in
            the status, the identity, the message and the boundary is at the
            point of asking "what can I actually look at?", and the answer
            should be there — not after two more paragraphs of qualification.
            It also keeps the whole required first-screen message inside the
            first screen at 1440x900, 820x1180 and 390x844 alike; the two
            supporting paragraphs below elaborate what has already been said.
          */}
          <div className={styles.actions}>
            <Link href={platformFacade.action.href} className={styles.action}>
              {platformFacade.action.label}
              <span aria-hidden="true">→</span>
            </Link>
            <p className={styles.actionSupporting}>{platformFacade.action.supporting}</p>
          </div>

          <p className={styles.boundarySupporting}>{platformFacade.boundarySupporting}</p>
        </div>

        <div className={styles.field}>
          <h2 className={styles.fieldHeading}>{platformFacade.fieldHeading}</h2>

          <div className={styles.moduleField}>
            <GraphMemoryConnectors />

            <ul className={styles.modules}>
              {platformFacade.modules.map((module) => (
                <li key={module.id} className={styles.module}>
                  <p className={styles.moduleIndex}>{module.index}</p>
                  <h3 className={styles.moduleLabel}>{module.label}</h3>
                  <p className={styles.moduleDescription}>{module.description}</p>
                  <p className={styles.moduleLimit}>{module.limit}</p>
                </li>
              ))}
            </ul>
          </div>

          <figure className={styles.detail}>
            <AduElevationDetail />
            <figcaption className={styles.detailCaption}>
              {platformFacade.detailCaption}
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
