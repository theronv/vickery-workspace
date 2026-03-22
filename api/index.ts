import { Hono } from 'hono'
import type { MiddlewareHandler } from 'hono'
import { cors } from 'hono/cors'
import { handle } from 'hono/vercel'
import { z } from 'zod'

declare module 'hono' {
  interface ContextVariableMap {
    userId: string
  }
}

export const config = { runtime: 'edge' }

// ── Turso HTTP API ──
type Row = Record<string, string | number | null>

async function dbExec(sql: string, args: (string | number)[] = []): Promise<Row[]> {
  const url = process.env.TURSO_URL!
  const token = process.env.TURSO_AUTH_TOKEN!

  const res = await fetch(`${url}/v2/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [
        { type: 'execute', stmt: { sql, args: args.map(a => ({ type: typeof a === 'number' ? 'integer' : 'text', value: String(a) })) } },
        { type: 'close' },
      ],
    }),
  })

  if (!res.ok) throw new Error(`Turso HTTP ${res.status}: ${await res.text()}`)
  const data = await res.json() as any
  const result = data.results?.[0]?.response?.result
  if (!result) return []

  const cols: string[] = result.cols.map((c: any) => c.name)
  return result.rows.map((row: any[]) => {
    const obj: Row = {}
    row.forEach((cell: any, i: number) => { obj[cols[i]] = cell.value })
    return obj
  })
}

function nanoId() {
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36)
}

// ── App ──
const app = new Hono().basePath('/api')

app.onError((err, c) => {
  console.error(err)
  return c.json({ error: 'Internal server error' }, 500)
})

app.use('/*', cors({
  origin: (origin) => {
    if (!origin) return 'https://workspace.vickerydigital.com'
    if (origin === 'https://workspace.vickerydigital.com') return origin
    if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return origin
    return null as unknown as string
  },
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}))

app.get('/health', (c) => c.json({ ok: true }))

// Auth middleware
const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header('Authorization')
  const AUTH_SECRET = process.env.AUTH_SECRET

  if (!AUTH_SECRET) {
    return c.json({ error: 'Server configuration error' }, 500)
  }
  if (!authHeader?.startsWith('Bearer ') || authHeader.slice(7) !== AUTH_SECRET) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  c.set('userId', 'primary_user')
  await next()
}

// POST /api/claude — proxy to Anthropic Messages API
app.post('/claude', async (c) => {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return c.json({ error: 'API key not configured' }, 500)
  }

  const body = await c.req.text()

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body,
  })

  const responseHeaders = new Headers()
  responseHeaders.set('content-type', resp.headers.get('content-type') || 'application/json')

  return new Response(resp.body, {
    status: resp.status,
    headers: responseHeaders,
  })
})

app.use('/links/*', authMiddleware)
app.use('/links', authMiddleware)

// ── Validation ──
const LinkSchema = z.object({
  name:  z.string().min(1).max(64),
  url:   z.string().url(),
  icon:  z.string().max(8).default('🔗'),
  group: z.string().min(1).max(32).default('My Tools'),
})

const ReorderSchema = z.object({
  items: z.array(z.object({ id: z.string(), position: z.number().int() })),
})

// ── Routes ──

// GET /api/links
app.get('/links', async (c) => {
  const userId = c.get('userId')
  const rows = await dbExec(
    'SELECT id, user_id, name, url, icon, "group", position, created_at, updated_at FROM custom_links WHERE user_id = ? ORDER BY position ASC',
    [userId]
  )
  return c.json(rows)
})

// POST /api/links
app.post('/links', async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json()
  const parsed = LinkSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  const maxRows = await dbExec('SELECT MAX(position) as max_pos FROM custom_links WHERE user_id = ?', [userId])
  const maxPos = maxRows[0]?.max_pos != null ? Number(maxRows[0].max_pos) : -1

  const id = nanoId()
  const now = new Date().toISOString()
  await dbExec(
    'INSERT INTO custom_links (id, user_id, name, url, icon, "group", position, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, userId, parsed.data.name, parsed.data.url, parsed.data.icon, parsed.data.group, maxPos + 1, now, now]
  )

  const [link] = await dbExec('SELECT id, user_id, name, url, icon, "group", position, created_at, updated_at FROM custom_links WHERE id = ?', [id])
  return c.json(link, 201)
})

// PUT /api/links/reorder
app.put('/links/reorder', async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json()
  const parsed = ReorderSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  const now = new Date().toISOString()
  await Promise.all(
    parsed.data.items.map(({ id, position }) =>
      dbExec('UPDATE custom_links SET position = ?, updated_at = ? WHERE id = ? AND user_id = ?', [position, now, id, userId])
    )
  )
  return c.json({ ok: true })
})

// PUT /api/links/:id
app.put('/links/:id', async (c) => {
  const userId = c.get('userId')
  const { id } = c.req.param()
  const body = await c.req.json()
  const parsed = LinkSchema.partial().safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  const sets: string[] = []
  const args: (string | number)[] = []
  if (parsed.data.name !== undefined) { sets.push('name = ?'); args.push(parsed.data.name) }
  if (parsed.data.url !== undefined) { sets.push('url = ?'); args.push(parsed.data.url) }
  if (parsed.data.icon !== undefined) { sets.push('icon = ?'); args.push(parsed.data.icon) }
  if (parsed.data.group !== undefined) { sets.push('"group" = ?'); args.push(parsed.data.group) }
  sets.push('updated_at = ?'); args.push(new Date().toISOString())
  args.push(id, userId)

  await dbExec(`UPDATE custom_links SET ${sets.join(', ')} WHERE id = ? AND user_id = ?`, args)
  const [updated] = await dbExec('SELECT id, user_id, name, url, icon, "group", position, created_at, updated_at FROM custom_links WHERE id = ? AND user_id = ?', [id, userId])
  if (!updated) return c.json({ error: 'Not found' }, 404)
  return c.json(updated)
})

// DELETE /api/links/:id
app.delete('/links/:id', async (c) => {
  const userId = c.get('userId')
  const { id } = c.req.param()

  const [existing] = await dbExec('SELECT id FROM custom_links WHERE id = ? AND user_id = ?', [id, userId])
  if (!existing) return c.json({ error: 'Not found' }, 404)

  await dbExec('DELETE FROM custom_links WHERE id = ? AND user_id = ?', [id, userId])
  return c.json({ ok: true })
})

// ── Projects ──

app.use('/projects/*', authMiddleware)
app.use('/projects', authMiddleware)

const CreateProjectSchema = z.object({
  name: z.string().min(1).max(128),
  bundleId: z.string().max(128).optional(),
  score: z.number().int().min(0).max(12).nullable().optional(),
  verdict: z.enum(['SHIP IT', 'WATCH', 'LATER']).nullable().optional(),
})

const UpdateCardSchema = z.object({
  status: z.enum(['todo', 'in-progress', 'done']).optional(),
  checkedSteps: z.string().optional(),
})

function mapProject(row: Row) {
  return { id: row.id, name: row.name, bundleId: row.bundle_id, score: row.score, verdict: row.verdict, stage: row.stage, createdAt: row.created_at, updatedAt: row.updated_at }
}

// GET /api/projects
app.get('/projects', async (c) => {
  const rows = await dbExec('SELECT id, name, bundle_id, score, verdict, stage, created_at, updated_at FROM projects ORDER BY created_at ASC')
  return c.json(rows.map(mapProject))
})

// POST /api/projects
app.post('/projects', async (c) => {
  const body = await c.req.json()
  const parsed = CreateProjectSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  const id = nanoId()
  const now = new Date().toISOString()
  await dbExec(
    'INSERT INTO projects (id, name, bundle_id, score, verdict, stage, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, parsed.data.name, parsed.data.bundleId || '', parsed.data.score ?? 0, parsed.data.verdict || '', 1, now, now]
  )

  const [project] = await dbExec('SELECT id, name, bundle_id, score, verdict, stage, created_at, updated_at FROM projects WHERE id = ?', [id])
  return c.json(mapProject(project), 201)
})

// GET /api/projects/:id
app.get('/projects/:id', async (c) => {
  const { id } = c.req.param()
  const [project] = await dbExec('SELECT id, name, bundle_id, score, verdict, stage, created_at, updated_at FROM projects WHERE id = ?', [id])
  if (!project) return c.json({ error: 'Not found' }, 404)

  const cardStates = await dbExec('SELECT project_id, card_id, status, checked_steps, updated_at FROM card_states WHERE project_id = ?', [id])
  return c.json({ ...mapProject(project), cardStates: cardStates.map(cs => ({ projectId: cs.project_id, cardId: cs.card_id, status: cs.status, checkedSteps: cs.checked_steps, updatedAt: cs.updated_at })) })
})

// PATCH /api/projects/:id/cards/:cardId
app.patch('/projects/:id/cards/:cardId', async (c) => {
  const { id, cardId } = c.req.param()
  const body = await c.req.json()
  const parsed = UpdateCardSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  const now = new Date().toISOString()
  const existing = await dbExec('SELECT project_id FROM card_states WHERE project_id = ? AND card_id = ?', [id, cardId])

  if (existing.length > 0) {
    const sets: string[] = ['updated_at = ?']
    const args: (string | number)[] = [now]
    if (parsed.data.status) { sets.push('status = ?'); args.push(parsed.data.status) }
    if (parsed.data.checkedSteps !== undefined) { sets.push('checked_steps = ?'); args.push(parsed.data.checkedSteps) }
    args.push(id, cardId)
    await dbExec(`UPDATE card_states SET ${sets.join(', ')} WHERE project_id = ? AND card_id = ?`, args)
  } else {
    await dbExec(
      'INSERT INTO card_states (project_id, card_id, status, checked_steps, updated_at) VALUES (?, ?, ?, ?, ?)',
      [id, cardId, parsed.data.status || 'todo', parsed.data.checkedSteps || '[]', now]
    )
  }

  return c.json({ ok: true })
})

// DELETE /api/projects/:id
app.delete('/projects/:id', async (c) => {
  const { id } = c.req.param()
  await dbExec('DELETE FROM card_states WHERE project_id = ?', [id])
  const existing = await dbExec('SELECT id FROM projects WHERE id = ?', [id])
  if (existing.length === 0) return c.json({ error: 'Not found' }, 404)
  await dbExec('DELETE FROM projects WHERE id = ?', [id])
  return c.json({ ok: true })
})

export default handle(app)
