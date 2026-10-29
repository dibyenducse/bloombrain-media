# BloomBrain Media

Video agency portfolio website with AI and video-editing collections, client reviews, a dedicated Meet Dibyendu section, and an admin analytics dashboard.

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- MySQL via Drizzle ORM (`mysql2`)
- Password-protected admin dashboard (signed, HTTP-only session cookie)
- Hover video previews with sound where browser autoplay policy allows it; click-to-play fallback and expanded playback

## Local development

Requires Node.js 20.9 or newer.

```sh
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

## Environment variables

| Name | Purpose |
| --- | --- |
| `DATABASE_URL` | `mysql://user:password@host:3306/database` |
| `ADMIN_PASSWORD` | Password for `/admin` |
| `SESSION_SECRET` | 32+ random characters used to sign the admin cookie |

The public portfolio works without a database; only analytics and the dashboard need it.

## Deploying on Hostinger (Node.js web app)

1. In hPanel, create a MySQL database and user. Open phpMyAdmin and import `db/setup.sql` to create the tables (or run `npm run db:migrate` with `DATABASE_URL` set).
2. Create a Node.js web app and import this GitHub repository.
3. Settings: Node.js **20 or 22**, build command `npm run build`, start command `npm start`, output directory `.next`.
4. Add the three environment variables above. On Hostinger the database host is usually `localhost`.
5. Deploy, then open `/admin` and sign in with `ADMIN_PASSWORD`.

Visitor country is recorded only when the site sits behind Cloudflare (`CF-IPCountry` header); otherwise it shows "Unavailable".

Portfolio videos and posters in `lib/portfolio.json` still point to the original site's assets. Copy them before retiring that site and update the URLs.

Analytics data from the old Cloudflare D1 database is not included; the new database starts empty.

## Main files

- `components/portfolio.tsx`: public website and video interactions
- `app/globals.css`: styling
- `lib/portfolio.json`: video sources and metadata
- `lib/collections.ts`: collection grouping and deduplication
- `lib/reviews.json`: client reviews and portrait paths
- `app/admin/`, `app/api/admin/`: protected dashboard
- `app/admin/actions.ts`, `lib/admin.ts`: admin sign-in and session checks
- `db/`, `drizzle/`: MySQL schema and migrations (`db/setup.sql` for phpMyAdmin)

