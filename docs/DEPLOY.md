# DEPLOY.md — Workspace Deployment Guide

Estimated time: ~2 hours from zero to live at `workspace.vickerydigital.com`

---

## Step 1 — Clerk Setup (~20 min)

1. Go to **dashboard.clerk.com** → Create application
2. Name it `workspace`
3. Enable **Google** as the only sign-in method. Disable everything else.
4. Go to **User & Authentication → Restrictions → Allowlist**
   - Enable "Enable email allowlist"
   - Add your email: `jimmy@vickerydigital.com` (or your personal Gmail)
   - Add your wife's Gmail address
   - Anyone not on this list gets blocked at sign-in — no invite system needed
5. Go to **API Keys** and copy:
   - `CLERK_PUBLISHABLE_KEY` (starts with `pk_live_`)
   - `CLERK_SECRET_KEY` (starts with `sk_live_`)

---

## Step 2 — Turso Database (~10 min)

```bash
# Install Turso CLI if you don't have it
curl -sSfL https://get.tur.so/install.sh | bash

# Login
turso auth login

# Create the workspace database
turso db create workspace-db

# Get the URL and token
turso db show workspace-db --url
turso db tokens create workspace-db
```

Save both — you need them for Vercel env vars.

Run the schema migration:
```bash
cd api
npm install
npm run db:generate
npm run db:migrate
```

---

## Step 3 — Deploy API to Vercel (~20 min)

```bash
cd api
npm install -g vercel  # if not installed

# Set environment variables
vercel env add TURSO_URL
# paste: libsql://workspace-db-[your-username].turso.io

vercel env add TURSO_AUTH_TOKEN
# paste your token

vercel env add CLERK_SECRET_KEY
# paste sk_live_...

vercel env add CLERK_PUBLISHABLE_KEY
# paste pk_live_...

# Deploy
vercel deploy --prod
```

Note the deployment URL — it'll look like `workspace-api-[hash].vercel.app`
This is your `API_BASE`. Copy it.

---

## Step 4 — Update Frontend Config (~5 min)

Open `frontend/index.html` and update two values:

```html
<!-- Line ~14: replace the placeholder key -->
data-clerk-publishable-key="pk_live_YOUR_ACTUAL_KEY"
```

```js
// Line ~265: replace with your actual Vercel URL
const API_BASE = 'https://workspace-api-[your-hash].vercel.app'
```

---

## Step 5 — Deploy Frontend to Cloudflare Pages (~15 min)

### Option A: GitHub (recommended — auto-deploys on push)

1. Create a new GitHub repo: `vickery-workspace`
2. Push the `frontend/` folder contents to it (just `index.html` at root)
3. Go to **dash.cloudflare.com** → Pages → Create a project
4. Connect GitHub → select `vickery-workspace`
5. Build settings:
   - Framework preset: None
   - Build command: (leave empty)
   - Output directory: `/` (or leave empty)
6. Deploy

### Option B: Direct upload (faster, no GitHub needed)

```bash
npm install -g wrangler
wrangler pages deploy frontend/ --project-name=vickery-workspace
```

---

## Step 6 — Custom Domain (~10 min)

In Cloudflare Pages → your project → Custom domains:
1. Add `workspace.vickerydigital.com`
2. Cloudflare will auto-add the CNAME since your domain is already on Cloudflare
3. SSL is automatic — you'll be live at `https://workspace.vickerydigital.com` within minutes

---

## Step 7 — Test Everything

1. Open `https://workspace.vickerydigital.com`
2. Sign in with your Google account → should land on the workspace
3. Open an incognito window → sign in with your wife's Google account → her own clean link list
4. Add a custom link → verify it persists after page refresh
5. Open on your phone → confirm it works cross-device

---

## Adding / Removing Users

Clerk Dashboard → your `workspace` app → **User & Authentication → Restrictions → Allowlist**

Add or remove email addresses. No code change, no redeploy.

---

## Updating the App

Frontend changes:
```bash
git add . && git commit -m "update" && git push
# Cloudflare Pages auto-deploys in ~30 seconds
```

API changes:
```bash
cd api && vercel deploy --prod
```

---

## Cost

| Service | Monthly |
|---|---|
| Clerk (already paying) | $0 incremental |
| Turso (workspace-db uses 1 of your unlimited DBs) | $0 incremental |
| Vercel (well within free tier) | $0 |
| Cloudflare Pages (free tier) | $0 |
| **Total additional cost** | **$0** |

This runs entirely inside your existing subscriptions.
