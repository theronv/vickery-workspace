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
| Auth | Clerk | Google Sign-In only. Two allowlisted emails. |
| Hosting | Cloudflare Pages | `workspace.vickerydigital.com` subdomain |

## Auth Model
- Clerk application: `workspace` (separate instance from app portfolio)
- Sign-in method: Google OAuth only
- Allowlisted emails: configured in Clerk dashboard → Restrictions → Allowlist
- JWT verified in Hono middleware on every API request
- Frontend uses `@clerk/clerk-js` browser SDK (loaded via CDN)

## Database
- Turso DB name: `workspace-db`
- Schema: single `custom_links` table (see schema.ts)
- One row per saved link, scoped by `user_id` (Clerk user ID)
- Links sync across devices — no localStorage dependency for link storage

## Repo Structure
```
workspace-app/
├── CLAUDE.md              ← this file
├── frontend/
│   └── index.html         ← entire frontend (Clerk SDK loaded via CDN)
├── api/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vercel.json
│   └── src/
│       ├── index.ts       ← Hono app entry
│       ├── auth.ts        ← Clerk JWT middleware
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
CLERK_SECRET_KEY=sk_live_...
CLERK_PUBLISHABLE_KEY=pk_live_...
```

### Frontend (Cloudflare Pages)
```
CLERK_PUBLISHABLE_KEY=pk_live_...
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
Clerk Dashboard → your workspace app → Users → Allowlist
Add or remove email addresses. No code change needed.

## Notes
- Panel tools (Nexus Chat, KanbanFlow, Pastewise) are hardcoded in the frontend
- Custom links are stored in Turso and synced per Clerk user_id
- Wife's account gets her own link list — lists are not shared between users
