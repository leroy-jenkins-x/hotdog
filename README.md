# Rodnya / hotdog

A friendly, multilingual small-pet community built with TypeScript, React/Vinext and Cloudflare Workers. D1 stores text records; R2 stores photos and private pedigree files. No queues.

## Features

- Russian, Kazakh and Uzbek UI
- Three-step pet onboarding, optional pedigree and document upload
- Public profiles, ancestry, search, favorites and meeting coordination
- Secure demo sessions and credential-ready VK ID / Telegram adapters
- Server-rendered SEO pages, species hubs, hreflang, sitemaps and read-only agent API

## Develop

Use Node 24 and the package manager version declared in `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
```

For local development, copy the variable names in `.env.example` into an untracked `.dev.vars`, generate a strong `SESSION_SECRET`, and enable `DEMO_MODE=true`. Apply the generated SQL migrations to local D1 using the starter commands documented in `docs/IMPLEMENTATION.md` and the Sites Vinext README. The public demo is deliberately excluded from indexing.

## Cloudflare deployment

Cloudflare and OAuth credentials are not committed. After building, set `D1_DATABASE_ID`, `R2_BUCKET_NAME`, and the real `SITE_ORIGIN`, then run `node scripts/prepare-cloudflare.mjs`. Configure secrets with Wrangler, apply every SQL migration to the production D1 database, and deploy the prepared `dist/server/wrangler.production.json` config. Verify regional access and data-location requirements before choosing Cloudflare for Russian users.

See [implementation, research, limitations and launch plan](docs/IMPLEMENTATION.md).
