# Studio precision swatch provenance v1

These five small WebP files are conceptual UI derivatives of repository-controlled A600 renders. They are not physical samples, manufacturer media, availability claims, or statements of material equivalence. Every crop excludes sky, landscape, windows, doors, and text.

## Reproduction

Run from the repository root with the pinned dependencies installed (`npm ci`):

```bash
node -e 'const sharp=require("sharp"); const jobs=[["adu-600-hardie-plank-evening-blue-concept-v1.webp","studio-swatch-lap-blue-concept-v1.webp",800,610,160,80],["adu-600-hardie-panel-evening-blue-concept-v1.webp","studio-swatch-panel-blue-concept-v1.webp",800,610,160,80],["adu-600-hardie-plank-iron-gray-concept-v1.webp","studio-swatch-lap-charcoal-concept-v1.webp",800,610,160,80],["adu-600-hardie-panel-iron-gray-concept-v1.webp","studio-swatch-panel-charcoal-concept-v1.webp",800,610,160,80],["adu-600-hardie-plank-evening-blue-concept-v1.webp","studio-swatch-white-trim-concept-v1.webp",1190,600,160,24]]; Promise.all(jobs.map(([src,out,left,top,width,height])=>sharp(`public/images/${src}`).extract({left,top,width,height}).resize(160,80,{fit:"fill"}).webp({quality:82,effort:6}).toFile(`public/images/${out}`))).catch(error=>{console.error(error);process.exitCode=1})'
sha256sum public/images/studio-swatch-*.webp
```

The crop box format is `left, top, width, height` in source pixels. Each source is 1672 × 941. Every output is 160 × 80.

| Output | Repository source | Crop box | Bytes | SHA-256 |
| --- | --- | ---: | ---: | --- |
| `studio-swatch-lap-blue-concept-v1.webp` | `public/images/adu-600-hardie-plank-evening-blue-concept-v1.webp` | `800, 610, 160, 80` | 372 | `96b12458c9dffd50e48d7e869acaab46603795aa6de585e5a7707eeb053069dd` |
| `studio-swatch-panel-blue-concept-v1.webp` | `public/images/adu-600-hardie-panel-evening-blue-concept-v1.webp` | `800, 610, 160, 80` | 256 | `59ccdba94ed6254d26025e979071dc44b77c706561ac5a40f4d03890a4d2ea77` |
| `studio-swatch-lap-charcoal-concept-v1.webp` | `public/images/adu-600-hardie-plank-iron-gray-concept-v1.webp` | `800, 610, 160, 80` | 410 | `93860a6dd12e9db7e3e45e7159bd722aebcc24b5d231f1e25ba03d07b9ea1149` |
| `studio-swatch-panel-charcoal-concept-v1.webp` | `public/images/adu-600-hardie-panel-iron-gray-concept-v1.webp` | `800, 610, 160, 80` | 252 | `8f46e2e3a4eca27f74e2b33eaab53cf0a7a2043e2967d90283d49de5a733d5f6` |
| `studio-swatch-white-trim-concept-v1.webp` | `public/images/adu-600-hardie-plank-evening-blue-concept-v1.webp` | `1190, 600, 160, 24` | 334 | `19c67e86ce89e55344041f595e1d0fb5c83eeb9a940dc1a354c76b3ca4f88e09` |

The first four crops are uninterrupted facade regions between openings. The final crop is uninterrupted lower window trim and is resized to the common dock aspect. Source render bytes are unchanged.
