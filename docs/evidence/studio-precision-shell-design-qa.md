# A600 Studio owner-rejection remediation

## Disposition

The prior `READY FOR OWNER REVIEW` disposition is superseded. The owner rejected the
screen as incomplete, non-responsive, soft, and unable to show a readable material
surface. The rejected screenshot and five low-resolution swatch derivatives are not
acceptance evidence.

## Exact source audit

The four repository-controlled A600 concept renders are lossy VP8 WebP files at
1672 × 941 pixels. Their byte sizes range from 146,928 to 161,686 bytes. Their existing
concept-only provenance remains authoritative.

The five retired swatch derivatives were lossy VP8 WebP files at 160 × 80 pixels and
only 252 to 410 bytes. They were too small and too compressed to support a readable
surface-detail presentation. They are removed from the UI and from this branch.

No verified standalone trim close-up or physical-material texture exists in the
repository. Trim therefore remains informational and fails closed with an explicit
`No verified close-up` state.

The authoritative James Hardie reference registry cannot supply a texture: all
fourteen profile records and the one color record have `texture_asset: null`,
`texture_rights: "absent"`, and `ui_eligible: false`; regional availability is also
unverified. The Studio therefore does not import or bypass that registry and does not
display manufacturer names or manufacturer texture claims.

## Root causes and remediation

- The full-width stage retained the former two-column `69vw` responsive-image size.
  Next.js could select an undersized derivative and then stretch it across the new
  full-width stage. The stage now serves the exact repository WebP bytes with
  `sizes="100vw"` and `unoptimized`.
- The 1.1-second filtered/swept resolve delayed visible feedback and softened the
  image during interaction. The matched render now changes through a sharp 280 ms
  clip transition with no filter, scale, or wash layer.
- Facade controls always displayed blue low-resolution swatches, even when the
  prospective selection was charcoal. Each facade and color option now resolves the
  exact full-resolution A600 render that clicking it will activate and shows a zoomed
  render detail.
- An unsupported render detail disables its control and exposes an unavailable reason.
  No fallback image is substituted.
- `Add current` previously remained actionable when the exact current state was already
  stored, producing no visible list change. It now reports `Current added` and is
  disabled until the current selection is distinct.
- The replay control could replay an identical frame and appear inert. It is removed;
  every remaining Studio action has an observable state effect or an explicit
  unavailable state.

## Verification contract

- Four resolver mappings must remain exact and all unsupported mappings must return
  `null`.
- Every source render must remain lossy VP8 WebP at 1672 × 941 and larger than 100 KB.
- Main-stage images must use exact-source delivery at `100vw`.
- The public UI must not display the retired `studio-swatch-*` files.
- Trim must not claim a texture or physical sample.
- Focused Vitest, ESLint, TypeScript, production build, and exact-head Preview
  interaction checks are required before owner review.

Pre-publish focused verification passed with 23/23 tests, targeted ESLint exit 0,
and TypeScript `tsc --noEmit` exit 0. The repository-wide suite, production build,
and exact-head Preview remain authoritative post-publish gates.
