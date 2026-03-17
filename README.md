# Vickery Digital Workspace

Personal workspace dashboard deployed at `workspace.vickerydigital.com`. A single-page app that serves as a launch pad for apps, dev tools, and embeddable panel tools — with a configurable link manager backed by a database.

## Architecture

```
Browser (index.html)  ──Bearer token──▸  Hono API (Vercel Edge)  ──HTTP──▸  Turso DB
       │                                      │
  Cloudflare Pages                     vercel.app/api/*
```

**Frontend** — One vanilla HTML/CSS/JS file (`frontend/index.html`). No build step, no framework. Deployed to Cloudflare Pages via `wrangler pages deploy`.

**API** — A single Hono app (`api/index.ts`) running on Vercel Edge Runtime. Provides CRUD endpoints for saved links. Talks to Turso using the HTTP Pipeline API directly (no ORM, no libsql client — just `fetch`).

**Database** — Turso (libSQL). One table: `custom_links`. Each row stores a link's name, URL, icon, group, position, and user ID.

**Auth** — Simple shared access key. The user enters it on a login screen; it's stored in `localStorage` and sent as a `Bearer` token on every API request. The API compares it against the `AUTH_SECRET` environment variable.

## Repo Structure

```
├── frontend/
│   └── index.html         ← entire frontend (no build step)
├── api/
│   ├── index.ts           ← Hono app — all routes + DB access in one file
│   ├── package.json       ← deps: hono, zod
│   └── tsconfig.json
├── vercel.json            ← Vercel config (rewrites, install command)
├── .vercelignore          ← prevents Vercel from treating source files as functions
├── CLAUDE.md              ← AI assistant instructions
└── docs/
    └── DEPLOY.md          ← deployment guide
```

The `api/src/` directory (schema, routes, db, auth as separate files) is the original modular structure but is currently unused — everything was consolidated into `api/index.ts` to work around Vercel auto-detection issues.

## How the Frontend Works

The page has three main areas:

1. **Launchpad** (left) — Hardcoded app cards (Chorify, Needledrop, etc.), hardcoded dev console links (Vercel, Turso, GitHub, etc.), and a dynamic "My Tools" grid populated from the database.

2. **Side Panel** (right) — Embeds external apps (Nexus Chat, KanbanFlow, Pastewise) in iframes. Tabs are generated from links with `group: "Panel"`. The panel is resizable via a drag handle.

3. **Link Manager** (admin sidebar via gear icon) — Add, reorder, and delete links. Links are assigned to groups/sections: `My Tools`, `Dev`, `AI`, `Panel`, etc. Panel-group links become side panel tabs; all other groups appear in the My Tools grid on the launchpad.

On first login, if no Panel links exist, the app auto-seeds three default panel apps (stored in the DB, not re-seeded if deleted).

## API Endpoints

All routes require `Authorization: Bearer <access_key>`.

| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | `/api/health` | — | Health check (no auth) |
| GET | `/api/links` | — | List all links for the user |
| POST | `/api/links` | `{name, url, icon, group}` | Create a link |
| PUT | `/api/links/:id` | `{name?, url?, icon?, group?}` | Update a link |
| DELETE | `/api/links/:id` | — | Delete a link |
| PUT | `/api/links/reorder` | `{items: [{id, position}]}` | Batch update positions |

### Database Schema

```sql
CREATE TABLE custom_links (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL,
  name       TEXT NOT NULL,
  url        TEXT NOT NULL,
  icon       TEXT DEFAULT '🔗',
  "group"    TEXT DEFAULT 'My Tools',
  position   INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

Note: The Turso HTTP Pipeline API returns all column values as strings, so the frontend coerces `position` to a number when sorting.

## Environment Variables

### Vercel (API)

| Variable | Description |
|----------|-------------|
| `TURSO_URL` | Turso database HTTP URL (`libsql://...turso.io`) |
| `TURSO_AUTH_TOKEN` | Turso auth token |
| `AUTH_SECRET` | The access key users enter to log in |

### Cloudflare Pages (Frontend)

The API base URL is hardcoded in `index.html` (`API_BASE`). No build-time env vars are used.

## Deployment

**API** — Run from the repo root (not from `api/`):
```sh
vercel deploy --prod
```

**Frontend** — Direct upload to Cloudflare Pages (no git integration):
```sh
wrangler pages deploy frontend/ --project-name vickery-workspace --branch production
```

The `--branch production` flag is required to deploy to the production URL. Without it, Cloudflare deploys to a preview URL.

## Development

```sh
# Start Vercel dev server (API)
cd api && npm run dev

# Frontend — just open frontend/index.html or serve it locally
npx serve frontend
```

The frontend's `API_BASE` is set to `https://workspace-api.vercel.app`. For local dev, change it to `http://localhost:3000` or wherever `vercel dev` is running.

## Managing Access

- **Rotate the key**: Update `AUTH_SECRET` in Vercel env vars and redeploy. All users will need the new key.
- **There is no per-user isolation** — all sessions sharing the same key operate on the same link list under a fixed `primary_user` user ID.
