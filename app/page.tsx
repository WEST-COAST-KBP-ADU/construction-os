import PlatformDevelopmentHome from "@/src/components/home/PlatformDevelopmentHome";
import {
  DEEDSEAL_CROSS_REFERENCE_LEAD,
  DEEDSEAL_CROSS_REFERENCE_LINK_TEXT,
  DEEDSEAL_CROSS_REFERENCE_TAIL,
  DEEDSEAL_PROOF_RECORD_LABEL,
  DEEDSEAL_PROOF_RECORD_URL,
  DEEDSEAL_PUBLIC_URL,
} from "@/src/lib/deedsealCrossReference";
import { buildBusinessJsonLd, serializeJsonLd } from "@/src/lib/structuredData";

/**
 * PRODUCT2-PLATFORM-DEVELOPMENT-FACADE-OPTION2-0001 — the root projection.
 *
 * This route now projects the temporary public platform facade the Owner
 * selected as Option 2. It replaces the previous editorial homepage projection
 * and nothing else: every other route keeps its own bytes, and the superseded
 * hero components and their assets stay in the repository as reusable route
 * material rather than being deleted.
 *
 * The page is static and server-rendered. It mounts no client component, so it
 * ships no new client JavaScript, and it carries no form, input, account,
 * analytics, API call, live intake or external effect.
 *
 * The Deedseal strip below is unchanged and stays last inside `<main>`. Its
 * wording is the frozen, Owner-adopted cross-reference, rendered byte-for-byte
 * from `src/lib/deedsealCrossReference.ts` — the first-user relation in the
 * first sentence, the withheld public integration in the second. It is not
 * reworded, shortened or restyled by this packet, and it carries no Deedseal
 * logo or brand asset.
 */
export default function Home() {
  return (
    <main id="main-content" className="site-main spine-home">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildBusinessJsonLd()) }}
      />

      <PlatformDevelopmentHome />

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
