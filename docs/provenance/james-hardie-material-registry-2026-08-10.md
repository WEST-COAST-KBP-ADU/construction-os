# James Hardie material registry provenance — 2026-08-10

## Scope and status

This document accompanies the runtime-offline `material-registry/1` seed. It records manufacturer nomenclature from the four first-party pages below. Manufacturer reference data is not a West Coast KBP offering or a claim of Sacramento-area availability.

No affiliation is claimed; partnership, certification, endorsement, authorized-installer status, local availability, West Coast KBP adoption, and media rights are not claimed. No manufacturer, retailer, stock, or third-party image was downloaded, copied, or mapped. No screen-sampled RGB, hex, or CSS color value was recorded.

## Sources and bounded facts

All sources were checked as official HTTPS pages on `www.jameshardie.com` on 2026-08-10.

| Source ID | Official page | Bounded use in the registry |
| --- | --- | --- |
| `hardie-plank-product` | [Hardie® Plank Lap Siding](https://www.jameshardie.com/product-catalog/exterior-siding-products/hardie-plank-lap-siding/) | Hardie® Plank name; six profile/texture names; Iron Gray as a color-name example with ColorPlus® Technology |
| `hardie-panel-product` | [Hardie® Panel Siding](https://www.jameshardie.com/product-catalog/exterior-siding-products/hardie-panel-siding/select-cedarmill/statement-collection-colors/) | Hardie® Panel name; four profile/texture names |
| `statement-collection-colors` | [Statement Collection® Colors](https://www.jameshardie.com/statement-collection-colors/) | Screen display can vary; samples are shown in Select Cedarmill® texture; local availability requires contractor or dealer confirmation |
| `hardie-artisan-design` | [Design with Hardie® Artisan® Siding](https://www.jameshardie.com/design-with-artisan/) | Hardie® Artisan® name; four profile names |

The sources establish only the listed manufacturer nomenclature. The registry does not infer Statement Collection® membership for Iron Gray, Sacramento-area stock, regional availability, adoption by West Coast KBP, or reuse rights.

## Seed mapping

The seed contains four sources, three products, fourteen product-scoped profiles, and one color-name record.

| Product ID | Official display name | Source | Profiles |
| --- | --- | --- | --- |
| `hardie-plank` | Hardie® Plank | `hardie-plank-product` | Select Cedarmill®; Smooth; Beaded Select Cedarmill®; Beaded Smooth; Custom Colonial Roughsawn; Custom Colonial Smooth |
| `hardie-panel` | Hardie® Panel | `hardie-panel-product` | Select Cedarmill®; Smooth; Stucco; Sierra 8 |
| `hardie-artisan` | Hardie® Artisan® | `hardie-artisan-design` | Hardie® Artisan® Lap; V-Groove; Shiplap; Square Channel |

The only seeded color record is `iron-gray` / Iron Gray, sourced to `hardie-plank-product`. Its sourced finish technology is ColorPlus® Technology. Its `display_color` is `null`.

Every profile and color has `local_availability: "unverified"`, no texture asset, `texture_rights: "absent"`, and `ui_eligible: false`. Every profile also has `west_coast_kbp_offering: "not_adopted"`.

## Eligibility and refusal contract

The loader first validates the complete registry shape, official source domain, verification-date consistency, unique IDs/names, source references, product/profile bindings, state enums, and non-affiliation notice. Invalid or partial registries are refused.

After registry validation, a combination is eligible only with all of the following: exact known manufacturer/product/profile/color IDs; current source verification; no relationship claim; explicitly verified regional, profile, and color availability; explicit profile and exact-combination adoption; one publication-authorized asset present on both profile and color; non-empty asset provenance; an authorized rights basis; exact manufacturer/product/profile/color asset binding; and true UI flags on both entries.

| Missing or invalid gate | Stable refusal |
| --- | --- |
| Unknown source reference | `UNKNOWN_SOURCE` |
| Non-official or non-HTTPS source | `SOURCE_DOMAIN_UNSUPPORTED` |
| Stale or future-dated source evidence | `SOURCE_VERIFICATION_STALE` |
| Any partnership, certification, endorsement, or authorized-installer claim | `RELATIONSHIP_CLAIM_PRESENT` |
| Regional, profile, or color availability not verified | `LOCAL_AVAILABILITY_UNVERIFIED` |
| Profile or exact combination not adopted | `WEST_COAST_KBP_NOT_ADOPTED` |
| No texture asset | `TEXTURE_ASSET_MISSING` |
| Publication rights absent | `TEXTURE_RIGHTS_ABSENT` |
| Provenance absent or partial | `TEXTURE_ASSET_PROVENANCE_MISSING` |
| Rights basis is not owned or publication-authorized | `TEXTURE_ASSET_UNAUTHORIZED` |
| Asset differs between records or binding is not exact | `TEXTURE_ASSET_BINDING_MISMATCH` |
| Stored UI state remains false | `UI_ELIGIBILITY_FLAG_FALSE` |

The current seed stops at `LOCAL_AVAILABILITY_UNVERIFIED` for every otherwise well-formed product/profile/color request. It is not imported by current public application, component, or Studio source, so it intentionally produces no rendered change.
