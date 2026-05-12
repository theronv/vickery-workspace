# VD Save — Build, Deploy, and Commit

Run all steps to make the current workspace changes live on workspace.vickerydigital.com and saved to GitHub.

## Steps (run in order, stop if any step fails)

### 1. TypeScript check
Run `npx tsc --noEmit`. If there are type errors, show them and stop — do not deploy broken code.

### 2. Build + deploy frontend
Run `npm run deploy`.
- This runs `vite build` (outputs to `dist/`)
- Then copies static HTML tool files into `dist/`
- Then runs `wrangler pages deploy dist/ --project-name=vickery-workspace --branch=production`
Show the Cloudflare Pages deployment URL when done.

### 3. Verify the deploy is live
Run `curl -sI https://workspace.vickerydigital.com | head -5` to confirm the site is responding.

### 4. Git commit and push
- Run `git status` to see what changed
- Stage all changes: `git add -A` (but never stage `.env`, `config.js`, or files with secrets)
- Commit with a short message summarising what changed (derive it from the diff — don't use a generic message)
- Push to origin: `git push`

### 5. API deploy (only if needed)
Check `git diff HEAD -- api/` — if there are changes in the `api/` directory, run `vercel --prod` to deploy the Hono API to Vercel. Otherwise skip this step.

### 6. Done
Report: frontend deploy URL, git commit hash, and whether the API was deployed.
