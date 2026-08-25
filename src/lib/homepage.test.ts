import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import sitemap from "../../app/sitemap";
import ContentHero from "../components/content/ContentHero";
import ServicePageView from "../components/content/ServicePageView";
import { contentPageLabels, servicePages } from "./contentPages";
import { publicRouteRegistry } from "./routes";
import { siteConfig } from "./siteConfig";

/*
 * PRODUCT2-PLATFORM-DEVELOPMENT-FACADE-OPTION2-0001.
 *
 * The root route no longer projects the photographic editorial homepage; it
 * projects the temporary public platform facade the Owner selected as Option 2.
 * The photographic-first assertions this suite used to carry described a
 * surface that is no longer mounted, so they are replaced here by named Option 2
 * assertions rather than deleted — a suite that keeps passing while testing a
 * retired surface is worse than no suite.
 *
 * The safety coverage is not replaced. Every guard the base carried — no form,
 * no data collection, no external runtime, no price, no schedule, no partner
 * claim, no unsupported property claim, no client JavaScript, bounded and
 * reduced-motion-safe motion, one canonical Studio sitemap entry — is carried
 * forward and, where the facade made it checkable at a finer grain, tightened.
 */

const page = readFileSync(resolve(process.cwd(), "app/page.tsx"), "utf8");
const header = readFileSync(resolve(process.cwd(), "src/components/Header.tsx"), "utf8");
const stylesheet = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");
const servicePageView = readFileSync(
  resolve(process.cwd(), "src/components/content/ServicePageView.tsx"),
  "utf8",
);
const contentHero = readFileSync(
  resolve(process.cwd(), "src/components/content/ContentHero.tsx"),
  "utf8",
);
const serviceRoute = readFileSync(
  resolve(process.cwd(), "app/services/[slug]/page.tsx"),
  "utf8",
);

const homeComponentSource = (name: string) =>
  readFileSync(resolve(process.cwd(), `src/components/home/${name}`), "utf8");

const facadeComponent = homeComponentSource("PlatformDevelopmentHome.tsx");
const facadeStyles = homeComponentSource("PlatformDevelopmentHome.module.css");

/**
 * The code of a source, with its commentary removed.
 *
 * Every absence assertion below is a claim about what the surface *does*, not
 * about what its documentation discusses. A doc comment that explains why the
 * facade carries no `"use client"`, no gradient and no logo would otherwise
 * fail the very checks it describes, so the prose is stripped first and the
 * assertions run against the code that ships.
 */
const codeOf = (source: string) => source.replace(/\/\*[\s\S]*?\*\//g, "");

const pageCode = codeOf(page);
const facadeComponentCode = codeOf(facadeComponent);
const facadeStylesCode = codeOf(facadeStyles);
const contentHeroCode = codeOf(contentHero);

const facade = siteConfig.platformFacade;

/** Every string the facade actually publishes to a reader, and nothing else. */
const facadeCopy = [
  facade.identity,
  facade.category,
  facade.statusLabel,
  facade.heading,
  facade.message,
  facade.boundary,
  facade.boundarySupporting,
  facade.action.label,
  facade.action.supporting,
  facade.fieldHeading,
  facade.detailCaption,
  ...facade.modules.flatMap((module) => [module.label, module.description, module.limit]),
].join("\n");

/** The root surfaces this packet is answerable for, as shipped code. */
const rootSurfaces = [pageCode, facadeComponentCode];

/*
 * PRODUCT2-PLATFORM-DEVELOPMENT-FACADE-OPTION2-REPAIR-0001.
 *
 * The external-resource guard reads the facade stylesheet as well as the two
 * TSX sources. A stylesheet cannot write `<img src>`, but `url(...)` and
 * `@import` reach a remote host just as effectively, and the zero-external-
 * request claim is about the page a reader loads, not about the language the
 * request happens to be written in.
 */
const externalResourceSurfaces = [...rootSurfaces, facadeStylesCode];

/**
 * Every spelling of a remote resource these surfaces could carry.
 *
 * The protocol-relative forms are included deliberately: `url(//cdn.example.com/x)`
 * names no scheme and still leaves the origin.
 */
const remoteResourceForms = [
  /https?:\/\//,
  /url\(\s*["']?\s*(?:https?:)?\/\//i,
  /@import\s+(?:url\(\s*)?["']?\s*(?:https?:)?\/\//i,
];

const requestsRemoteResource = (source: string) =>
  remoteResourceForms.some((form) => form.test(source));

/*
 * The superseded photographic assets stay in the repository as reusable route
 * material. The packet forbids deleting them; it forbids projecting them at the
 * root.
 */
const retiredRootImagePaths = [
  "public/images/balanced-residential-addition-concept-v2.webp",
  "public/images/balanced-process-materials-concept-v2.webp",
  "public/images/balanced-interior-concept-v2.webp",
  "public/images/house-portal/property-stage-photo-master.png",
];

describe("PRODUCT2-PLATFORM-DEVELOPMENT-FACADE-OPTION2-0001 root facade", () => {
  it("mounts the Option 2 facade as the only root projection", () => {
    expect(page).toContain(
      'import PlatformDevelopmentHome from "@/src/components/home/PlatformDevelopmentHome"',
    );
    expect(page.match(/<PlatformDevelopmentHome \/>/g)).toHaveLength(1);
    expect(facadeComponent.match(/<h1/g)).toHaveLength(1);
    expect(facadeComponent).toContain('id="platform-facade-title"');
    expect(facadeComponent).toContain('aria-labelledby="platform-facade-title"');
  });

  it("retires the photographic first fold from the root page without deleting its assets", () => {
    // The root page carries no image and no photographic disclosure at all.
    expect(pageCode).not.toContain("<figcaption");
    expect(pageCode).not.toContain("<figure");

    // The facade's single `figcaption` is the line drawing's own caption, not a
    // photographic disclosure — there is exactly one, and it captions the
    // reference elevation.
    expect(facadeComponentCode.match(/<figcaption/g)).toHaveLength(1);
    expect(facadeComponentCode).toContain("platformFacade.detailCaption");

    for (const source of rootSurfaces) {
      expect(source).not.toContain("next/image");
      expect(source).not.toContain("HousePortalHero");
      expect(source).not.toContain("PremiumWorkbenchHero");
      expect(source).not.toContain("ModelCatalog");
      expect(source).not.toContain("spine-hero");
      expect(source).not.toMatch(/\.(?:webp|png|jpe?g|avif)\b/i);
    }

    // The retired assets remain in the repository, non-empty and reusable.
    for (const imagePath of retiredRootImagePaths) {
      const absolutePath = resolve(process.cwd(), imagePath);
      expect(existsSync(absolutePath)).toBe(true);
      expect(statSync(absolutePath).size).toBeGreaterThan(0);
    }

    // The superseded hero modules are preserved, not removed.
    for (const preserved of ["HousePortalHero.tsx", "PremiumWorkbenchHero.tsx"]) {
      expect(existsSync(resolve(process.cwd(), `src/components/home/${preserved}`))).toBe(true);
    }
  });

  it("publishes the required first-screen message in full", () => {
    expect(facade.identity).toBe("West Coast KBP");
    expect(facade.category).toBe("AI-native ADU & residential construction platform");
    expect(facade.statusLabel).toBe("PLATFORM IN DEVELOPMENT");
    expect(facade.boundary).toBe("Live intake, accounts and external actions are not enabled.");

    // The primary message names the one operating surface and all four of the
    // things it is being built to hold.
    expect(facade.heading).toContain("one operating surface");
    for (const subject of [
      "land",
      "feasibility review",
      "project control",
      "durable business memory",
    ]) {
      expect(facade.heading.toLowerCase()).toContain(subject);
    }

    // And the component renders every one of them, rather than declaring copy
    // the surface never shows.
    for (const key of [
      "statusLabel",
      "identity",
      "heading",
      "category",
      "message",
      "boundary",
      "boundarySupporting",
    ]) {
      expect(facadeComponent).toContain(`platformFacade.${key}`);
    }
  });

  it("keeps the four module labels exactly LAND, FEASIBILITY, PROJECT and MEMORY in order", () => {
    expect(facade.modules.map((module) => module.label)).toEqual([
      "LAND",
      "FEASIBILITY",
      "PROJECT",
      "MEMORY",
    ]);
    expect(facade.modules.map((module) => module.index)).toEqual(["01", "02", "03", "04"]);
    expect(facade.modules).toHaveLength(4);
    expect(new Set(facade.modules.map((module) => module.id)).size).toBe(4);
  });

  it("publishes each module's own boundary beside its label", () => {
    const limits = Object.fromEntries(
      facade.modules.map((module) => [module.label, module.limit]),
    );

    // A module label is product direction, never a claim of live capability, so
    // each one states the conclusion it does not reach.
    expect(limits.LAND).toBe("Reaches no parcel conclusion.");
    expect(limits.FEASIBILITY).toBe("Determines no eligibility or buildability.");
    expect(limits.PROJECT).toBe("Claims no live project execution.");
    expect(limits.MEMORY).toBe("Claims no completed public integration.");

    for (const entry of facade.modules) {
      expect(entry.limit.length).toBeGreaterThan(0);
      expect(entry.description.length).toBeGreaterThan(0);
    }
    expect(facadeComponent).toContain("module.limit");
  });

  it("renders the modules as a semantic list that offers no capability affordance", () => {
    expect(facadeComponentCode).toMatch(/<ul className=\{styles\.modules\}>/);
    expect(facadeComponentCode).toMatch(/<li key=\{module\.id\}/);
    expect(facadeComponentCode).toContain("<h3 className={styles.moduleLabel}>");

    // No module is a link, a button, or anything else that would read as an
    // entry point into a capability that is not enabled.
    const moduleBlock = facadeComponentCode.slice(
      facadeComponentCode.indexOf("<ul className={styles.modules}>"),
      facadeComponentCode.indexOf("</ul>"),
    );
    expect(moduleBlock).not.toMatch(/<(?:a|button|Link)\b/);
    expect(moduleBlock).not.toContain("href");
  });

  it("carries the Option 2 canvas, charcoal type and exactly one terracotta accent", () => {
    // Ivory / light mineral canvas and charcoal ink, taken from the site's own
    // tokens rather than forked into a second colour system.
    expect(facadeStylesCode).toMatch(/\.facade\s*\{[\s\S]*?background:\s*var\(--color-canvas\)/);
    expect(facadeStylesCode).toContain("color: var(--color-ink)");

    // Exactly one accent value is declared, once, and every terracotta use
    // reads it back through the custom property.
    const declaredHex = facadeStylesCode.match(/#[0-9a-f]{3,8}\b/gi) ?? [];
    expect(declaredHex).toEqual(["#a8462a"]);
    expect(facadeStylesCode.match(/--facade-accent:\s*#a8462a;/g)).toHaveLength(1);
    expect(facadeStylesCode).toContain("color: var(--facade-accent)");
  });

  it("draws the blueprint grid and the graph-memory layer as line work, never as a gradient", () => {
    // The contract rules gradients out. A blueprint grid is a line drawing, so
    // it is drawn as one.
    expect(facadeStylesCode).not.toMatch(/gradient/i);
    expect(facadeComponent).toContain("<pattern");
    expect(facadeComponent).toContain('patternUnits="userSpaceOnUse"');

    // A square tile: the grid stays square instead of shearing with the box.
    expect(facadeComponent).toMatch(/<pattern[\s\S]*?width="44"[\s\S]*?height="44"/);

    // Every stroke the surface does draw in SVG is held to a hairline.
    expect(facadeComponentCode.match(/vectorEffect="non-scaling-stroke"/g)?.length ?? 0)
      .toBeGreaterThanOrEqual(2);

    /*
     * The graph-memory connectors are CSS, not SVG, and deliberately so: they
     * have to line up with the module grid's own gutters, which means being
     * stretched to the field — and a stretched `viewBox` scales stroke geometry
     * with the box, so an SVG hairline stops being a hairline exactly where the
     * field is widest. A one-pixel border is one pixel at every viewport.
     */
    expect(facadeComponentCode).toContain("GraphMemoryConnectors");
    expect(facadeStylesCode).toMatch(/\.connectors::before,\s*\n\.connectors::after \{/);
    expect(facadeStylesCode).toMatch(
      /\.connectors::before \{[\s\S]*?height:\s*var\(--line-width\)/,
    );
    expect(facadeStylesCode).toMatch(
      /\.connectors::after \{[\s\S]*?width:\s*var\(--line-width\)/,
    );

    // Four nodes on the connectors, and one where all four modules meet.
    for (const node of [
      "connectorNodeTop",
      "connectorNodeRight",
      "connectorNodeBottom",
      "connectorNodeLeft",
      "connectorCore",
    ]) {
      expect(facadeComponentCode).toContain(`styles.${node}`);
      expect(facadeStylesCode).toContain(`.${node}`);
    }
    // The centre node is the field's single terracotta moment.
    expect(facadeStylesCode).toMatch(
      /\.connectorCore \{[\s\S]*?border:\s*var\(--line-width\) solid var\(--facade-accent\)/,
    );
  });

  it("integrates exactly one quiet line-drawn ADU technical detail", () => {
    expect(facadeComponent).toContain("AduElevationDetail");
    expect(facadeComponent.match(/AduElevationDetail/g)).toHaveLength(2);
    expect(facadeComponent).toContain('viewBox="0 0 168 92"');

    // Line work only: stroked paths, no fill, no photograph, no 3D appliance.
    const detailBlock = facadeComponentCode.slice(
      facadeComponentCode.indexOf("function AduElevationDetail"),
      facadeComponentCode.indexOf("export default function"),
    );
    expect(detailBlock).toContain('fill="none"');
    expect(detailBlock).not.toMatch(/<image\b|url\(|filter=/i);

    // And it is captioned as a drawing convention, not as an approved plan.
    expect(facade.detailCaption).toContain("not a specific approved plan");
  });

  it("refuses the visual vocabulary the contract rules out", () => {
    // No glassmorphism, no dashboard chrome, no giant rounded SaaS card.
    expect(facadeStylesCode).not.toMatch(/backdrop-filter|box-shadow|filter:\s*blur/i);

    /*
     * No giant rounded SaaS card. Every radius the facade declares is checked,
     * and only two values are admitted: the 2px seat corner, and the full round
     * of a connector node, which is a dot rather than a card.
     */
    const radii = facadeStylesCode.match(/border-radius:\s*([^;]+);/g) ?? [];
    expect(radii.length).toBeGreaterThan(0);
    for (const radius of radii) {
      expect(radius).toMatch(/border-radius:\s*(?:0\.125rem|50%);/);
    }
    expect(facadeStylesCode).not.toMatch(/var\(--radius-(?:md|lg)\)/);

    // No invented logo, mark, favicon, social image or Deedseal brand asset.
    for (const source of [...rootSurfaces, facadeStylesCode]) {
      expect(source).not.toMatch(/\blogo\b|\bwordmark\b|og-image|favicon/i);
      expect(source).not.toMatch(/deedseal-(?:logo|mark|brand|asset)/i);
    }

    // The frozen cross-reference is rendered from its module, never restated,
    // and never widened into a `Powered by Deedseal` claim.
    expect(page).toContain('from "@/src/lib/deedsealCrossReference"');
    expect(pageCode).not.toMatch(/Powered by Deedseal|Deedseal-integrated/i);
    expect(facadeComponentCode).not.toMatch(/deedseal/i);
  });

  it("keeps the asymmetric editorial hero and the disciplined 2x2 module field", () => {
    // Asymmetric: the two tracks are deliberately unequal, and both are
    // `minmax(0, …)` so no long word can create a horizontal scroll.
    expect(facadeStylesCode).toMatch(
      /\.inner\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1\.12fr\)\s+minmax\(0,\s*1fr\)/,
    );
    expect(facadeStylesCode).toMatch(
      /\.modules\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/,
    );

    // Editorial column first in the source order, so it also leads when the
    // layout stacks.
    expect(facadeComponentCode.indexOf("styles.editorial")).toBeLessThan(
      facadeComponentCode.indexOf("styles.field}"),
    );
  });

  it("collapses to one column at the small viewport without dropping the first screen", () => {
    // 63.99rem: the field stacks under the editorial column; the module grid
    // deliberately stays 2x2 through the 820x1180 tablet target.
    expect(facadeStylesCode).toMatch(
      /@media \(max-width: 63\.99rem\)[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)/,
    );
    // 33rem: the module grid becomes a single column, which the contract allows
    // at 390x844.
    expect(facadeStylesCode).toMatch(
      /@media \(max-width: 33rem\)[\s\S]*?\.modules\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)/,
    );

    // Nothing that carries the first-screen message is hidden at any width.
    for (const kept of [".status", ".heading", ".message", ".boundary", ".action"]) {
      expect(facadeStylesCode).not.toMatch(
        new RegExp(`\\${kept}[^{]*\\{[^}]*display:\\s*none`, "i"),
      );
    }
  });

  it("adds no client JavaScript to the root route", () => {
    for (const source of rootSurfaces) {
      expect(source).not.toContain('"use client"');
      expect(source).not.toMatch(/\buse(?:State|Effect|Ref|Memo|Callback|LayoutEffect)\s*\(/);
      expect(source).not.toMatch(/matchMedia|addEventListener|requestAnimationFrame/);
      expect(source).not.toMatch(/\bon(?:Click|Change|Submit|Input|MouseEnter|Scroll)=/);
    }
  });

  it("opens no intake, data collection or external runtime on the root surface", () => {
    for (const source of rootSurfaces) {
      expect(source).not.toMatch(/<(?:form|input|textarea|select|iframe)\b/i);
      expect(source).not.toMatch(/\bfetch\s*\(|XMLHttpRequest|navigator\.|localStorage|document\./);
      expect(source).not.toMatch(/process\.env/);
      expect(source).not.toMatch(/mailto:|tel:/i);
    }
    expect(facadeCopy).not.toMatch(/sign up|get started|request a quote|contact us|book a/i);
  });

  it("requests no external resource from any root surface, stylesheet included", () => {
    /*
     * PRODUCT2-PLATFORM-DEVELOPMENT-FACADE-OPTION2-REPAIR-0001.
     *
     * This guard previously read the two TSX sources only, so a remote asset
     * declared in `PlatformDevelopmentHome.module.css` passed unseen. The
     * stylesheet is a root surface too, and it is read here.
     */
    expect(externalResourceSurfaces).toHaveLength(3);
    expect(externalResourceSurfaces).toContain(facadeStylesCode);
    expect(facadeStylesCode.length).toBeGreaterThan(0);

    for (const source of externalResourceSurfaces) {
      // The only external destinations on the page come from the frozen
      // cross-reference module, never from a URL literal written here.
      expect(requestsRemoteResource(source)).toBe(false);
    }

    /*
     * A guard is only worth having if it refuses the thing it names, so the
     * matchers are exercised against the hostile forms rather than assumed to
     * work. Nothing is written to disk: the mutation is a string built from the
     * real stylesheet bytes.
     */
    const hostileStylesheetMutations = [
      `${facadeStyles}\n.facade { background-image: url("https://cdn.example.com/hostile.png"); }\n`,
      `@import url("https://cdn.example.com/hostile.css");\n${facadeStyles}`,
      `${facadeStyles}\n.facade { background-image: url(//cdn.example.com/hostile.png); }\n`,
      `@import "//cdn.example.com/hostile.css";\n${facadeStyles}`,
    ];

    for (const mutation of hostileStylesheetMutations) {
      expect(requestsRemoteResource(codeOf(mutation))).toBe(true);
    }
  });

  it("introduces no price, schedule, credential, guarantee or partner claim", () => {
    expect(facadeCopy).not.toMatch(/\$\s?\d|\b\d+\s*(?:day|week|month|year)s?\b/i);
    expect(facadeCopy).not.toMatch(
      /licensed|insured|award-winning|luxury|resort|mansion|guarantee|warrant|testimonial/i,
    );
    expect(facadeCopy).not.toMatch(
      /\bpartners?\b|\bcertified\b|\btrusted by\b|\bclients? served\b|\bcustomers?\b/i,
    );
    // No availability or capacity claim.
    expect(facadeCopy).not.toMatch(/now accepting|available now|book now|openings/i);

    for (const source of rootSurfaces) {
      expect(source).not.toMatch(/\$\s?\d/);
    }
  });

  it("states no property, permit, zoning or buildability conclusion", () => {
    // The only place these words may appear is inside an explicit refusal, so
    // every occurrence is checked against the limit that carries it.
    const conclusionWords = facadeCopy.match(
      /\b(?:eligibility|buildability|permit|zoning|approved|conclusion)\b/gi,
    ) ?? [];
    const refusals = [
      "Reaches no parcel conclusion.",
      "Determines no eligibility or buildability.",
      facade.detailCaption,
      facade.boundarySupporting,
    ].join("\n");

    for (const word of conclusionWords) {
      expect(refusals.toLowerCase()).toContain(word.toLowerCase());
    }

    // And the surface says outright that it reaches no property conclusion.
    expect(facade.boundarySupporting).toContain("reaches a conclusion about a property");
    expect(facade.boundarySupporting).toContain("Nothing on this page collects information");
  });

  it("offers exactly one truthful current action, into an existing public route", () => {
    expect(facade.action.href).toBe("/studio");
    expect(facade.action.label).toBe("Open Concept Studio");

    // One link out of the editorial column, and no second call to action
    // competing with it.
    const editorialBlock = facadeComponentCode.slice(
      facadeComponentCode.indexOf("styles.editorial"),
      facadeComponentCode.indexOf("styles.field}"),
    );
    expect(editorialBlock.match(/<Link\b/g)).toHaveLength(1);

    // The destination is a route that actually exists and is published once.
    expect(existsSync(resolve(process.cwd(), "app/studio/page.tsx"))).toBe(true);
    const studioUrl = new URL("/studio", siteConfig.url).toString();
    const studioEntries = sitemap().filter((entry) => entry.url === studioUrl);

    expect(studioEntries).toHaveLength(1);
    expect(studioEntries[0]).toMatchObject({ changeFrequency: "monthly", priority: 0.8 });
  });

  it("keeps the global chrome coherent with the new root message", () => {
    // The development notice the layout renders and the facade's own visible
    // status and boundary say the same thing, and neither was reworded.
    expect(siteConfig.developmentNotice.label).toBe("Development preview");
    expect(siteConfig.developmentNotice.supporting).toBe(
      "Live intake, submissions, customer accounts, and external actions are not enabled.",
    );
    expect(facade.boundary).toContain("Live intake");
    expect(facade.boundary).toContain("are not enabled");

    // JSON-LD still projects the same business identity as the first screen.
    expect(page).toContain("buildBusinessJsonLd");
    expect(siteConfig.name).toBe(facade.identity);

    // Pre-release global navigation, unchanged and still client-JS free.
    expect(header).toContain('{ label: "Models", href: "/models" }');
    expect(header).toContain('{ label: "Concept Studio", href: "/studio" }');
    expect(header).toContain('<details className="site-nav-mobile">');
    expect(header).not.toContain('"use client"');
  });

  it("keeps Home motion bounded, optional and reduced-motion safe", () => {
    expect(stylesheet).toContain("@media (prefers-reduced-motion: reduce)");
    expect(facadeStyles).toContain("@media (prefers-reduced-motion: reduce)");

    // Motion is CSS-only — the component declares none of it.
    expect(facadeComponentCode).not.toMatch(/animation|transition|matchMedia/i);

    // `backwards` fill keeps the resting state visible, so content that never
    // animates is still on the screen.
    expect(facadeStylesCode).toMatch(
      /animation:\s*facadeSettle\s+\d+ms\s+var\(--easing-standard\)\s+backwards/,
    );

    // And the reduce block actually switches it off rather than shortening it.
    const reduceBlock = facadeStylesCode.slice(
      facadeStylesCode.indexOf("@media (prefers-reduced-motion: reduce)"),
    );
    expect(reduceBlock).toContain("animation: none");
    expect(reduceBlock).toContain("transition: none");
  });

  it("points every service breadcrumb at a destination the root actually publishes", () => {
    /*
     * PRODUCT2-PLATFORM-DEVELOPMENT-FACADE-OPTION2-REPAIR-0001.
     *
     * The retired editorial homepage carried `id="services"`, and
     * `ServicePageView` pointed its breadcrumb at `/#services` under the visible
     * label "Services". The Option 2 facade publishes no services section, so
     * that destination stopped existing — and there is no `/services` index
     * route anywhere on the site to fall back to, so the label stopped being
     * true as well.
     *
     * The repair is the breadcrumb, not the anchor. Re-publishing a bare
     * `id="services"` would be a target manufactured to satisfy a link with no
     * services content to anchor, and the retired section is not restored. The
     * breadcrumb now names the root route it can actually reach, and this test
     * pins that repair where it used to pin the divergence.
     */
    expect(pageCode).not.toContain('id="services"');

    // The breadcrumb resolves to the published root route, under the label a
    // reader sees.
    expect(servicePageView).toContain("parentLabel={contentPageLabels.home}");
    expect(servicePageView).toContain('parentHref="/"');
    expect(contentPageLabels.home).toBe("Home");

    // No service surface points at the retired fragment any more.
    expect(servicePageView).not.toContain("#services");

    // The destination is a real published route, and "Services" is not one.
    const publishedPaths = publicRouteRegistry
      .filter((route) => route.publicationState === "published")
      .map((route) => route.path);
    expect(publishedPaths).toContain("/");
    expect(publicRouteRegistry.map((route) => route.path)).not.toContain("/services");

    // One shared view carries every published service page, so the repaired
    // breadcrumb reaches all five of them.
    expect(serviceRoute).toContain("<ServicePageView page={page} />");
    expect(servicePages).toHaveLength(5);
  });
});

/*
 * PRODUCT2-FACADE-BREADCRUMB-DEDUPLICATION-REPAIR-0001.
 *
 * The assertions below read rendered markup, not source text. A breadcrumb is
 * something a reader sees, and `Home / Home` was invisible to every string
 * assertion the suite already carried — both crumbs were true, the destination
 * was real, and the duplication only existed once the component was composed
 * with its caller. `renderToStaticMarkup` is this repository's convention and
 * is also the no-JavaScript render, so what is inspected here is exactly what a
 * reader receives before hydration.
 */

/** The breadcrumb navigation of a rendered content page, as a reader meets it. */
const breadcrumbOf = (html: string) => {
  const nav = /<nav\b[^>]*aria-label="Breadcrumb"[^>]*>([\s\S]*?)<\/nav>/.exec(html);

  if (!nav) {
    return null;
  }

  const inner = nav[1];

  return {
    markup: nav[0],
    links: [...inner.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map(([, attributes, label]) => ({
      href: /href="([^"]*)"/.exec(attributes)?.[1] ?? null,
      label: label.replace(/<[^>]*>/g, "").trim(),
    })),
    separators: [
      ...inner.matchAll(
        /<span\b[^>]*class="[^"]*breadcrumb__separator[^"]*"[^>]*>([\s\S]*?)<\/span>/g,
      ),
    ].map(([markup, text]) => ({ markup, text: text.trim() })),
    text: inner
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  };
};

/** Exactly one visible crumb — `Home`, pointing at the published root. */
const isSingleHomeCrumb = (html: string) => {
  const crumb = breadcrumbOf(html);

  return (
    crumb !== null &&
    crumb.links.length === 1 &&
    crumb.links[0].href === "/" &&
    crumb.links[0].label === contentPageLabels.home &&
    crumb.separators.length === 0 &&
    crumb.text === contentPageLabels.home
  );
};

/**
 * Every way a breadcrumb can be wrong here, named.
 *
 * The probes below are markup mutations rather than file edits, so the guard
 * is proved to refuse each shape in-process instead of being assumed to.
 */
const breadcrumbDefects = (html: string) => {
  const crumb = breadcrumbOf(html);

  if (!crumb) {
    return ["no breadcrumb navigation"];
  }

  const defects: string[] = [];
  const homeCrumbs = crumb.links.filter((link) => link.label === contentPageLabels.home);

  if (homeCrumbs.length > 1) {
    defects.push("duplicate Home crumb");
  }
  if (crumb.separators.some((separator) => separator.text === "")) {
    defects.push("empty separator");
  }
  if (crumb.separators.length >= crumb.links.length) {
    defects.push("separator without a following crumb");
  }
  if (crumb.links.some((link) => link.href === null || link.href.trim() === "")) {
    defects.push("empty breadcrumb target");
  }
  if (crumb.links.some((link) => link.label === "")) {
    defects.push("empty breadcrumb label");
  }
  if (crumb.markup.includes("#services")) {
    defects.push("retired /#services destination");
  }
  if (crumb.links.some((link) => link.label === contentPageLabels.services)) {
    defects.push("Services label with no services index");
  }

  return defects;
};

const heroFixture = {
  eyebrow: contentPageLabels.servicePageStatus,
  title: "A bounded review lane",
  lede: "Organized for owner review, with no conclusion reached here.",
  signal: "Owner review boundary.",
  sequence: "01",
};

const renderContentHero = (parentLabel: string, parentHref: string) =>
  renderToStaticMarkup(
    createElement(ContentHero, { ...heroFixture, parentLabel, parentHref }),
  );

const renderServicePage = (servicePage: (typeof servicePages)[number]) =>
  renderToStaticMarkup(createElement(ServicePageView, { page: servicePage }));

/** The exact leading crumb the repaired component emits, as shipped bytes. */
const leadingHomeCrumb = '<a class="breadcrumb__link" href="/">Home</a>';

/** The separator markup the component emits when a second crumb follows it. */
const separatorMarkup = '<span aria-hidden="true" class="breadcrumb__separator">/</span>';

/** Every live `ContentHero` caller that names a parent other than the root. */
const nonHomeCallers = [
  { path: "app/about/page.tsx", label: contentPageLabels.about, href: "/about" },
  { path: "app/compare/page.tsx", label: contentPageLabels.compare, href: "/compare" },
  { path: "app/process/page.tsx", label: contentPageLabels.process, href: "/process" },
  { path: "app/faq/page.tsx", label: contentPageLabels.faq, href: "/faq" },
  {
    path: "src/components/content/JurisdictionPageView.tsx",
    label: "ADU Services",
    href: "/services/detached-adu",
  },
];

describe("PRODUCT2-FACADE-BREADCRUMB-DEDUPLICATION-REPAIR-0001 service breadcrumb", () => {
  it("renders exactly one Home crumb and zero separators on all five service pages", () => {
    expect(servicePages).toHaveLength(5);

    for (const servicePage of servicePages) {
      const html = renderServicePage(servicePage);
      const crumb = breadcrumbOf(html);

      expect(crumb, servicePage.slug).not.toBeNull();
      expect(crumb?.links, servicePage.slug).toEqual([
        { href: "/", label: contentPageLabels.home },
      ]);
      expect(crumb?.separators, servicePage.slug).toHaveLength(0);
      expect(crumb?.text, servicePage.slug).toBe(contentPageLabels.home);
      expect(isSingleHomeCrumb(html), servicePage.slug).toBe(true);
      expect(breadcrumbDefects(html), servicePage.slug).toEqual([]);
    }
  });

  it("preserves Home / {parent} for every caller whose parent is not Home", () => {
    /*
     * The five live callers, read from their own sources so a caller that
     * changed its parent could not pass here on a stale fixture — then rendered
     * with exactly the values they pass.
     */
    for (const caller of nonHomeCallers) {
      const source = readFileSync(resolve(process.cwd(), caller.path), "utf8");
      expect(source, caller.path).toContain(`parentHref="${caller.href}"`);

      const crumb = breadcrumbOf(renderContentHero(caller.label, caller.href));

      expect(crumb?.links, caller.path).toEqual([
        { href: "/", label: contentPageLabels.home },
        { href: caller.href, label: caller.label },
      ]);
      expect(crumb?.separators, caller.path).toHaveLength(1);
      expect(crumb?.separators[0].text, caller.path).toBe("/");
      expect(crumb?.separators[0].markup, caller.path).toContain('aria-hidden="true"');
    }
  });

  it("suppresses the second crumb only when both the label and the destination repeat Home", () => {
    /*
     * One attribute at a time. A caller that changes the label alone, or the
     * destination alone, is naming a different parent and keeps its second
     * crumb — the condition is not allowed to collapse to a single operand.
     */
    const divergences = [
      { label: "Overview", href: "/", changed: "label" },
      { label: contentPageLabels.home, href: "/about", changed: "href" },
    ];

    for (const divergence of divergences) {
      const crumb = breadcrumbOf(renderContentHero(divergence.label, divergence.href));

      expect(crumb?.links, divergence.changed).toEqual([
        { href: "/", label: contentPageLabels.home },
        { href: divergence.href, label: divergence.label },
      ]);
      expect(crumb?.separators, divergence.changed).toHaveLength(1);
    }

    // And the identical parent — what `ServicePageView` truthfully passes —
    // deduplicates.
    expect(isSingleHomeCrumb(renderContentHero(contentPageLabels.home, "/"))).toBe(true);
  });

  it("fails if the deduplication condition is removed", () => {
    /*
     * The pre-repair markup, rebuilt from the bytes that ship rather than typed
     * out, so the probe cannot drift away from the component. If the condition
     * were removed, this is exactly what the five service pages would emit —
     * and the guard above refuses it.
     */
    const shipped = renderServicePage(servicePages[0]);
    expect(shipped).toContain(leadingHomeCrumb);

    const withoutDeduplication = shipped.replace(
      leadingHomeCrumb,
      `${leadingHomeCrumb}${separatorMarkup}${leadingHomeCrumb}`,
    );

    expect(isSingleHomeCrumb(withoutDeduplication)).toBe(false);
    expect(breadcrumbDefects(withoutDeduplication)).toContain("duplicate Home crumb");

    // The condition itself is present in the shipped component and compares
    // both operands.
    expect(contentHeroCode).toContain("parentRepeatsHome");
    expect(contentHeroCode).toMatch(
      /parentHref === homeCrumb\.href &&\s*parentLabel === homeCrumb\.label/,
    );
  });

  it("fails if the retired /#services destination is reintroduced", () => {
    for (const servicePage of servicePages) {
      expect(renderServicePage(servicePage), servicePage.slug).not.toContain("#services");
    }
    expect(contentHeroCode).not.toContain("#services");

    const reintroduced = renderServicePage(servicePages[0]).replace(
      leadingHomeCrumb,
      `${leadingHomeCrumb}${separatorMarkup}<a class="breadcrumb__link" href="/#services">Services</a>`,
    );

    expect(breadcrumbDefects(reintroduced)).toContain("retired /#services destination");
    expect(breadcrumbDefects(reintroduced)).toContain("Services label with no services index");
    expect(isSingleHomeCrumb(reintroduced)).toBe(false);
  });

  it("fails if an empty separator, an empty target or a duplicate Home is inserted", () => {
    const shipped = renderServicePage(servicePages[0]);

    const emptySeparator = shipped.replace(
      leadingHomeCrumb,
      `${leadingHomeCrumb}<span aria-hidden="true" class="breadcrumb__separator"></span>`,
    );
    expect(breadcrumbDefects(emptySeparator)).toContain("empty separator");
    expect(breadcrumbDefects(emptySeparator)).toContain("separator without a following crumb");

    const emptyTarget = shipped.replace(
      leadingHomeCrumb,
      `${leadingHomeCrumb}${separatorMarkup}<a class="breadcrumb__link" href="">Home</a>`,
    );
    expect(breadcrumbDefects(emptyTarget)).toContain("empty breadcrumb target");

    const duplicateHome = shipped.replace(
      leadingHomeCrumb,
      `${leadingHomeCrumb}${separatorMarkup}${leadingHomeCrumb}`,
    );
    expect(breadcrumbDefects(duplicateHome)).toContain("duplicate Home crumb");

    // The shipped bytes carry none of them.
    expect(breadcrumbDefects(shipped)).toEqual([]);
  });

  it("keeps breadcrumb semantics, its accessible name and a focusable target", () => {
    for (const servicePage of servicePages) {
      const crumb = breadcrumbOf(renderServicePage(servicePage));

      expect(crumb?.markup, servicePage.slug).toMatch(/^<nav\b/);
      expect(crumb?.markup, servicePage.slug).toContain('aria-label="Breadcrumb"');

      // A real anchor with a real destination keeps its natural tab stop, and
      // the repository's `:focus-visible` rule paints the ring on it.
      expect(crumb?.links[0].href, servicePage.slug).toBe("/");
      expect(crumb?.links[0].label, servicePage.slug).toBe(contentPageLabels.home);
    }

    expect(stylesheet).toContain(":focus-visible");
  });

  it("leaves the root facade and every non-service surface untouched", () => {
    // The repair lives in the breadcrumb slot of one shared hero. It publishes
    // no route, no anchor and no label of its own, and it reaches the root
    // projection not at all.
    expect(contentHeroCode).not.toMatch(/<(?:form|input|textarea|select|iframe)\b/i);
    expect(contentHeroCode).not.toMatch(/https?:\/\//);
    expect(contentHeroCode).not.toContain("services");
    expect(pageCode).not.toContain("ContentHero");
    expect(pageCode).not.toContain('id="services"');

    // `ServicePageView` is untouched by this repair and still names the root
    // truthfully, exactly as PRODUCT2-…-REPAIR-0001 left it.
    expect(servicePageView).toContain("parentLabel={contentPageLabels.home}");
    expect(servicePageView).toContain('parentHref="/"');
  });
});
