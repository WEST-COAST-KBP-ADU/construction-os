# Homepage gabled ADU concept media provenance

## Public-use status

`public/images/homepage-gabled-adu-concept-v1.webp` is an owner-requested generated concept visualization for the homepage hero. It is conceptual media only. It is not a completed West Coast KBP project, a customer property, a catalog-model-matched rendering, an approved plan, or evidence of a manufacturer product, affiliation, eligibility, or local availability.

## Pinned inputs

| Role | URL | Format | Dimensions | SHA-256 | Verification |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Full-resolution conversion source | `https://at.adobe.com/DdIsghj3066AKYMu` | PNG, 8-bit RGB | 1672 × 941 | `ffcf3072d9374042aedd746f791c3b7558af9d9061976e9f463a21771df12f49` | Downloaded with redirects and verified byte-for-byte on 2026-08-10 |
| Review derivative; not used for conversion | `https://photoshop-api.adobe.io/v2/short-url/urn:aaid:ps:US:f9d3f272-b78d-4bb1-9a60-e8aab2a2818c` | JPEG | 1000 × 580 | `937cb0e31e7ef824df6c0dd0a2766f47f1b45f4b170faefae52c66a9f99c1a0c` | Downloaded with redirects and verified byte-for-byte on 2026-08-10 |

## Published derivative

| Path | Format | Dimensions | Bytes | SHA-256 |
| :--- | :--- | :--- | ---: | :--- |
| `public/images/homepage-gabled-adu-concept-v1.webp` | WebP, lossy VP8, 8-bit RGB | 1672 × 941 | 156768 | `b8f2fec8a7a323ebc75be2bdcff04de277820776976d2160a950e092bbccba67` |

The committed WebP preserves the source aspect ratio and pixel dimensions. It was not cropped, resized, extended, repainted, or generatively edited.

## Reproducible conversion

The repository-installed `sharp@0.34.5` dependency was used from the pinned PNG with this exact command, run from the repository root:

```sh
node -e "const sharp=require('sharp'); sharp('/tmp/tmp.Csg7EIwDHr/homepage-gabled-source').webp({quality:86,smartSubsample:true}).toFile('public/images/homepage-gabled-adu-concept-v1.webp').then(info=>console.log(JSON.stringify(info)))"
```

The temporary input pathname is execution-local; its bytes are bound by the full-resolution SHA-256 above. The output was independently checked with `sha256sum`, `file`, and Sharp metadata inspection.

## Use boundary

The derivative is approved only as visibly captioned conceptual homepage media. Do not use it as a model rendering, plan, property record, completed-project example, manufacturer/material claim, or evidence supporting pricing, schedule, approval, eligibility, or buildability.
