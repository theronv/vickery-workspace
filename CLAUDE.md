# CLAUDE.md — Vickery Digital Workspace

## What This Is
Personal workspace dashboard for Theron Vickery (Vickery Digital LLC).
Deployed at `workspace.vickerydigital.com`. Private — two authorized users only.
This is internal tooling, not a product. No RevenueCat. No acquisition docs needed.

## Stack
| Layer | Service | Notes |
|---|---|---|
| Frontend | React + Vite + TypeScript + Tailwind | Three-panel pipeline SPA |
| API | Hono 4.7 on Vercel Edge | `/api` routes for links, projects, card states |
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
- Tables:
  - `custom_links` — saved link manager (original)
  - `projects` — pipeline project tracking (name, score, verdict, stage)
  - `card_states` — kanban card status + checked substeps per project
- See `api/src/schema.ts` for full Drizzle schema

## Repo Structure
```
├── CLAUDE.md              ← this file
├── index.html             ← Vite entry HTML
├── package.json           ← React frontend deps
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── postcss.config.js
├── src/
│   ├── main.tsx           ← React entry point
│   ├── App.tsx            ← Auth gate + dashboard layout
│   ├── index.css          ← Tailwind directives + scrollbar styles
│   ├── vite-env.d.ts
│   ├── context/
│   │   ├── AuthContext.tsx    ← Access key auth state
│   │   └── PipelineContext.tsx ← Active panel + project state
│   ├── panels/
│   │   ├── VetPanel.tsx       ← Panel 1: Idea Analyzer iframe
│   │   ├── BuildPanel.tsx     ← Panel 2: PromptCraft iframe
│   │   └── ExecutePanel.tsx   ← Panel 3: Kanban board
│   ├── components/
│   │   ├── TopNav.tsx         ← Three-tab navigation
│   │   ├── LoginScreen.tsx    ← Access key login form
│   │   ├── InstructionBanner.tsx ← Collapsible step banner
│   │   ├── ProcessSidebar.tsx ← 16-step pipeline reference
│   │   ├── Toast.tsx          ← Notification toast
│   │   ├── KanbanBoard.tsx    ← Kanban container + card data
│   │   ├── KanbanColumn.tsx   ← Single kanban column
│   │   └── KanbanCard.tsx     ← Card with checklist + command snippet
│   ├── hooks/
│   │   ├── useProjects.ts     ← CRUD for /api/projects
│   │   └── useCardStates.ts   ← CRUD for card state updates
│   └── tools/
│       ├── idea-analyzer.html      ← Idea Feasibility Analyzer (embedded via srcDoc)
│       └── lovable-improver.html   ← PromptCraft tool (embedded via srcDoc)
├── frontend/
│   ├── index.html         ← original vanilla frontend (legacy)
│   └── lovable-improver.html ← original PromptCraft tool
├── api/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts       ← Hono app entry
│       ├── auth.ts        ← access key auth middleware
│       ├── db.ts          ← Turso client + Drizzle instance
│       ├── schema.ts      ← Drizzle schema (custom_links, projects, card_states)
│       └── routes/
│           ├── links.ts     ← CRUD routes for custom_links
│           ├── claude.ts    ← Anthropic API proxy
│           └── projects.ts  ← CRUD routes for projects + card states
├── docs/
│   └── DEPLOY.md
```

## Environment Variables

### API (Vercel)
```
TURSO_URL=libsql://workspace-db-jimmyvickery.turso.io
TURSO_AUTH_TOKEN=...
AUTH_SECRET=...          # the access key users enter to log in
ANTHROPIC_API_KEY=...    # for Claude proxy route
```

### Frontend (Vite / Cloudflare Pages)
```
VITE_API_URL=https://workspace-api.vercel.app
```

## API Routes
| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check (no auth) |
| GET | `/api/links` | Get all links for authed user |
| POST | `/api/links` | Create a new link |
| PUT | `/api/links/:id` | Update a link (name, icon, group, url) |
| DELETE | `/api/links/:id` | Delete a link |
| PUT | `/api/links/reorder` | Batch reorder (array of {id, position}) |
| POST | `/api/claude` | Proxy to Anthropic Messages API |
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Create project { name, bundleId, score, verdict } |
| GET | `/api/projects/:id` | Get project + card states |
| PATCH | `/api/projects/:id/cards/:cardId` | Update card status + checked steps |
| DELETE | `/api/projects/:id` | Delete project and card states |

## Three-Panel Pipeline
The workspace is organized as a three-step pipeline:

1. **VET** — Score a raw app idea using the Idea Analyzer (iframe). SHIP IT verdicts (≥10/12) auto-advance to BUILD.
2. **BUILD** — Generate prompt chains using PromptCraft (iframe). "Start Build" creates a project and advances to EXECUTE.
3. **EXECUTE** — Kanban board with 16 cards across 4 stages (Scaffold → Audit & Migrate → Build & Test → Launch & Learn). Card statuses and substep checkboxes persist to Turso.

### Panel Handoff
- **Vet → Build**: Idea Analyzer iframe posts `vd:verdict` message. SHIP IT triggers auto-advance after 1.5s.
- **Build → Execute**: "Start Build" button creates a project via POST /api/projects and navigates to Execute.

## Deployment
- API: `vercel deploy --prod` from repo root
- Frontend: `npm run build` then deploy `dist/` to Cloudflare Pages
- Custom domain: `workspace.vickerydigital.com` CNAME → Cloudflare Pages

## Adding/Removing Users
Share the access key with authorized users. Change `AUTH_SECRET` in Vercel to rotate.

## Dependencies Added
- `react`, `react-dom` — UI framework
- `@vitejs/plugin-react` — Vite React plugin
- `tailwindcss`, `postcss`, `autoprefixer` — CSS framework
- `typescript`, `@types/react`, `@types/react-dom` — TypeScript support
- `vite` — Build tool

## Known Limitations
- `idea-feasibility-analyzer.html` is a placeholder (not ported from external project)
- `lovable-improver.html` pre-fill via postMessage requires the iframe to listen for `vd:prefill` events (not yet implemented in the tool HTML)
- Database tables `projects` and `card_states` need to be created via migration before first use
- Kanban cards cannot be dragged between columns (by design)
