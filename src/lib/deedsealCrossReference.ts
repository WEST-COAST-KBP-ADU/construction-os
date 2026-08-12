/**
 * Public cross-reference to Deedseal.
 *
 * The sentence below is the exact wording jointly aligned in
 * kbp-core-engineering/kbp-dev-office#363 and adopted by the Owner in comment
 * 5267717279. It is committed as a decision record by kbp-dev-office#366
 * (`docs/coordination/decisions/decision-unified-concept.md`).
 *
 * The wording is fixed. It carries the adopted first-user relationship in its
 * first sentence and, in its second, explicitly withholds any publicly proven
 * integration — the distinction required by
 * `docs/shared-briefs/RECEPTION-MEMORY-001/DEEDSEAL-INTEGRATION-BOUNDARY.md`,
 * whose fail-closed rule keeps Product 2 `Deedseal-targeted`, not
 * `Deedseal-integrated`. Do not widen, shorten, or reword either sentence
 * without a new Owner-adopted decision.
 */

/** Sentence text preceding the linked word. */
export const DEEDSEAL_CROSS_REFERENCE_LEAD =
  "KBP OS is the first user of Deedseal. The public integration record is not yet available; view Deedseal’s current public ";

/** The single word rendered as the link to the Deedseal public surface. */
export const DEEDSEAL_CROSS_REFERENCE_LINK_TEXT = "proof";

/** Sentence text following the linked word. */
export const DEEDSEAL_CROSS_REFERENCE_TAIL = ".";

/** The adopted wording, reassembled exactly as it renders to a reader. */
export const DEEDSEAL_CROSS_REFERENCE_SENTENCE =
  DEEDSEAL_CROSS_REFERENCE_LEAD +
  DEEDSEAL_CROSS_REFERENCE_LINK_TEXT +
  DEEDSEAL_CROSS_REFERENCE_TAIL;

/** Destination of the linked word `proof`. */
export const DEEDSEAL_PUBLIC_URL = "https://deedseal.com";

/**
 * Commit-pinned public proof record. The adoption fixed the destination to an
 * immutable target, so this URL is pinned to an exact SHA and never to a branch.
 */
export const DEEDSEAL_PROOF_RECORD_SHA = "ae60603a001387fcdbb9f25628b3bfbc015e2311";

export const DEEDSEAL_PROOF_RECORD_URL =
  "https://github.com/deedseal/deedseal/blob/" +
  DEEDSEAL_PROOF_RECORD_SHA +
  "/docs/proof/2026-08-12-neural-memory.md";

export const DEEDSEAL_PROOF_RECORD_LABEL = "Deedseal public proof record";
