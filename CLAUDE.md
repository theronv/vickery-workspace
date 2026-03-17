# CLAUDE.md — Vickery Digital Workspace

## What This Is
Personal workspace dashboard for Jimmy Vickery (Vickery Digital LLC).
Deployed at `workspace.vickerydigital.com`. Private — two authorized users only.
This is internal tooling, not a product. No RevenueCat. No acquisition docs needed.

## Stack
| Layer | Service | Notes |
|---|---|---|
| Frontend | Vanilla HTML/CSS/JS | Single file, deployed to Cloudflare Pages |
| API | Hono 4.7 on Vercel Edge | `/api` routes for custom link CRUD |
| Database | Turso/libSQL + Drizzle ORM | One DB: `workspace-db` |
| Auth | Simple access key | Shared secret via `AUTH_SECRET` env var |
| Hosting | Cloudflare Pages | `workspace.vickerydigital.com` subdomain |

## Auth Model
- Simple access key authentication (no third-party auth provider)
- User enters access key on login screen, stored in `localStorage`
- Key sent as `Bearer` token on every API request
- API middleware (`auth.ts`) compares token against `AUTH_SECRET` env var
- All authenticated requests use a fixed `userId` of `'primary_user'`

## Database
- Turso DB name: `workspace-db`
- Schema: single `custom_links` table (see schema.ts)
- One row per saved link, scoped by `user_id` (fixed to `'primary_user'`)
- Links sync across devices — no localStorage dependency for link storage

## Repo Structure
```
workspace-app/
├── CLAUDE.md              ← this file
├── frontend/
│   └── index.html         ← entire frontend (vanilla JS, no SDK)
├── api/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vercel.json
│   └── src/
│       ├── index.ts       ← Hono app entry
│       ├── auth.ts        ← access key auth middleware
│       ├── db.ts          ← Turso client + Drizzle instance
│       ├── schema.ts      ← Drizzle schema
│       └── routes/
│           └── links.ts   ← CRUD routes for custom_links
├── docs/
│   └── DEPLOY.md          ← step-by-step deployment guide
```

## Environment Variables

### API (Vercel)
```
TURSO_URL=libsql://workspace-db-jimmyvickery.turso.io
TURSO_AUTH_TOKEN=...
AUTH_SECRET=...          # the access key users enter to log in
```

### Frontend (Cloudflare Pages)
```
API_BASE_URL=https://workspace-api.vercel.app
```

## API Routes
| Method | Path | Description |
|---|---|---|
| GET | `/api/links` | Get all links for authed user |
| POST | `/api/links` | Create a new link |
| PUT | `/api/links/:id` | Update a link (name, icon, group, url) |
| DELETE | `/api/links/:id` | Delete a link |
| PUT | `/api/links/reorder` | Batch reorder (array of {id, position}) |

## Deployment
- API: `vercel deploy` from `/api`
- Frontend: push to GitHub → Cloudflare Pages auto-deploys
- Custom domain: `workspace.vickerydigital.com` CNAME → Cloudflare Pages

## Adding/Removing Users
Share the access key with authorized users. Change `AUTH_SECRET` in Vercel to rotate.

## Notes
- Panel tools (Nexus Chat, KanbanFlow, Pastewise) are auto-seeded on first use
- Custom links are stored in Turso under a fixed `primary_user` user_id
- All users sharing the access key see the same link list
