# BloomBrain Media

Video agency portfolio website with AI and video-editing collections, client reviews and a dedicated Meet Dibyendu section.

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- No database, login or environment variables needed
- Hover video previews with sound where browser autoplay policy allows it; click-to-play fallback and expanded playback

## Local development

Requires Node.js 20.9 or newer.

```sh
npm install
npm run dev
```

## Deploying on Hostinger (Node.js web app)

1. Create a Node.js web app in hPanel and import this GitHub repository, branch `main`.
2. Settings: Node.js **20 or 22**, build command `npm run build`, start command `npm start`, output directory `.next`.
3. Deploy.


## Main files

- `components/portfolio.tsx`: public website and video interactions
- `app/globals.css`: styling
- `lib/portfolio.json`: video sources and metadata (files live in `public/media/`)
- `lib/collections.ts`: collection grouping and deduplication
- `lib/reviews.json`: client reviews and portrait paths

