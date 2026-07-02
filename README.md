# Construction OS

Construction OS is the West Coast KBP platform for transparent ADU and residential construction: ADU, garage conversions, residential general construction, and GC/subcontract coordination organized as controlled project objects.

The current codebase is the public platform site (v1 preview), built with [Next.js](https://nextjs.org) and deployed on [Vercel](https://vercel.com).

## Governance (SourceTrue)

Platform governance — charter, boundaries, architecture records, decision
records, task packets, and evidence — lives in [`governance/`](governance/README.md).
That directory is the business source of truth and contains no runtime code;
see [`governance/BOUNDARIES.md`](governance/BOUNDARIES.md) for the rules that
bind all AI-assisted work in this repository.

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `app/` — Next.js App Router pages and layout
- `src/components/` — page sections (Hero, TrustBar, ServicePreview, etc.)
- `src/lib/siteConfig.ts` — single source of truth for all public-facing copy
- `public/` — static assets

## Scripts

| Command | Description |
| :------ | :---------- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Deployment

The site deploys automatically on Vercel from the default branch.
