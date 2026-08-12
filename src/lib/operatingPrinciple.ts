/**
 * KBPOS-PUBLIC-FACADE-0001 · the public "under the hood" statement.
 *
 * One restrained band on the homepage says what this construction business is
 * being built to run on: one connected graph of leads, properties, designs,
 * and decisions, where similarity may propose and only a person decides.
 *
 * Three rules govern every string in this file.
 *
 *   1. **Product 2's own architecture only.** Nothing here describes, names,
 *      or implies Deedseal, Product 1, or any integration between them. The
 *      adopted Deedseal sentence lives in `deedsealCrossReference.ts` and is
 *      the only place on this site that speaks about that relationship.
 *   2. **Design-language grammar.** Every claim is written as `is being built
 *      to`, never as `does` or `runs on`. The graph memory plane described by
 *      the record below is a committed contract, not a shipped system, and the
 *      public surface must not read as if it were one.
 *   3. **Anchored, not asserted.** Every sentence is grounded in
 *      {@link OPERATING_PRINCIPLE_RECORD_PATH}, committed in this repository.
 *      The single external link is pinned to an exact commit so the record a
 *      visitor opens is the record these sentences were written against.
 */

/** The committed record this band states nothing beyond. */
export const OPERATING_PRINCIPLE_RECORD_PATH =
  "docs/shared-briefs/RECEPTION-MEMORY-001/GRAPH-MEMORY-CONTRACT.md";

/**
 * Pinned to the packet's exact base commit on `main`, never to a branch, so
 * the destination cannot drift away from the wording it supports.
 */
export const OPERATING_PRINCIPLE_RECORD_SHA =
  "cf099534cb0256a1748641972abbdad49fcf8645";

/** The one external link this band is allowed to carry. */
export const OPERATING_PRINCIPLE_RECORD_URL =
  "https://github.com/WEST-COAST-KBP-ADU/construction-os/blob/" +
  OPERATING_PRINCIPLE_RECORD_SHA +
  "/" +
  OPERATING_PRINCIPLE_RECORD_PATH;

export const OPERATING_PRINCIPLE_RECORD_LABEL =
  "Read the committed graph memory contract";

/** Stable id for the band's heading, so the section can be labelled by it. */
export const OPERATING_PRINCIPLE_TITLE_ID = "operating-principle-title";

/**
 * The band's own copy. Written for a homeowner, not for an engineer: the
 * words are `memory`, `record`, `person`, and `source`, and the only technical
 * noun kept is the one the record itself is named for.
 */
export const OPERATING_PRINCIPLE_COPY = Object.freeze({
  kicker: "Under the hood",
  heading: "This business is being built to run on one connected memory.",
  statement:
    "Most builders keep a job in scattered notes, threads, and folders. We are " +
    "building this one on a graph instead — a neural-style memory where a " +
    "lead, a property, a design, and a decision are linked to each other, and " +
    "every fact keeps the source it came from. It is being built alongside the " +
    "business, in the open, and the record below says plainly which parts are " +
    "contract and which are not built yet.",
} as const);

export type OperatingPrinciplePoint = {
  readonly id: string;
  readonly title: string;
  readonly body: string;
};

/**
 * Three points, each a plain-language restatement of a rule the committed
 * record already fixes — respectively its read protocol, its fact provenance,
 * and its summary discipline. Nothing is added here that the record does not
 * already bind.
 */
export const OPERATING_PRINCIPLE_POINTS: readonly OperatingPrinciplePoint[] =
  Object.freeze([
    Object.freeze({
      id: "person-decides",
      title: "A person decides",
      body:
        "The memory is being built so that a resemblance between two records " +
        "can suggest a connection and never authorize one. Anything that " +
        "leaves this business is accepted by a person first.",
    }),
    Object.freeze({
      id: "facts-keep-their-source",
      title: "Facts keep their source",
      body:
        "Each fact is being built to carry where it came from, when it was " +
        "seen, and whether anyone has verified it — so an assumption cannot " +
        "quietly age into a certainty.",
    }),
    Object.freeze({
      id: "summary-is-never-a-source",
      title: "A summary is never a source",
      body:
        "Summaries are being built to point back at what they were made from, " +
        "so a shortened version of your project can always be checked against " +
        "the original.",
    }),
  ] as const);
