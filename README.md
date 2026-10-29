# BloomBrain Media

Video agency portfolio website with AI and video-editing collections, client reviews, a dedicated Meet Dibyendu section, and an admin analytics dashboard.

## Current application

- React / TypeScript, Vinext / Vite
- Cloudflare Workers runtime and Cloudflare D1 database (Drizzle schema and migrations included)
- Sites-managed ChatGPT authentication for admin access
- Hover video previews with sound where browser autoplay policy allows it; click-to-play fallback and expanded playback
- Brand images and client portraits included under `public/`

## Local development

Requires Node.js >=22.13.0.

```sh
npm ci
npm run dev -- --host 127.0.0.1
```

```sh
npm run build
```

The current `npm start` script runs a local Cloudflare Worker preview. It is **not a generic Node.js production server**.

## Hostinger migration status

This repository contains the current working source, not a completed Hostinger port. Do not expect GitHub import alone to deploy the full application on Hostinger.

Before production migration:

1. Confirm the Hostinger plan's runtime and deployment settings.
2. Adapt the Cloudflare Worker entrypoint/build integration to the selected hosting runtime, or retain a separately hosted Worker backend.
3. Replace Sites-managed ChatGPT authentication with a standalone authentication integration and enforce admin permissions on the server. Never trust client-supplied identity headers.
4. Migrate the D1 database or keep a supported remote backend. Schema and migration SQL are included; production analytics records are not exported.
5. Configure secrets through the hosting dashboard, never in Git. The current admin check uses `ADMIN_EMAIL` together with authenticated user identity.
6. Copy portfolio videos and posters before retiring the original Canva-hosted website, then update the media URLs in `lib/portfolio.json`. They currently reference the original site's assets.
7. Validate video playback, sign-in, admin authorization, analytics consent and mobile layout before switching domain DNS.

No production credentials, database contents, dependency folders, or generated builds are included.

## Main files

- `components/portfolio.tsx`: public website and video interactions
- `app/globals.css`: styling
- `lib/portfolio.json`: video sources and metadata
- `lib/collections.ts`: collection grouping and deduplication
- `lib/reviews.json`: client reviews and portrait paths
- `app/admin/`, `app/api/admin/`: protected dashboard
- `db/`, `drizzle/`: database schema and migrations
- `docs/SITES-RUNTIME.md`: current runtime and local setup details

The live Sites deployment remains separate from this GitHub repository. Pushing here does not update the existing Sites deployment.

## GitHub Pages preview

The public portfolio can be previewed at `https://dibyenducse.github.io/bloombrain-media/` once Pages deployment completes. The preview is built from this source using `scripts/build-github-pages.mjs`, then published from the `gh-pages` branch.

The build adapter works in an ignored staging folder; it does not remove the full application's admin, database, authentication, or analytics code. GitHub Pages is static hosting, so the preview sends no analytics and its `/admin/` page explains that sign-in requires the full hosting setup.

To rebuild after `npm ci`, provide the backed-up video/poster folder (filenames from `lib/portfolio.json`):

```sh
PAGES_MEDIA_DIR=/absolute/path/to/media node scripts/build-github-pages.mjs
```

Publish only `.pages-build/out/` to `gh-pages`, with `.nojekyll` included. The base URL defaults to `/bloombrain-media`; override `PAGES_BASE_PATH` for a different repository. The build fails if any video or poster is missing. `preview-build.json` records the source revision and preview limitations. No custom-domain or DNS changes are required for this preview.
