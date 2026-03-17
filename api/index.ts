import { Hono } from 'hono'
import type { MiddlewareHandler } from 'hono'
import { cors } from 'hono/cors'
import { handle } from 'hono/vercel'

declare module 'hono' {
  interface ContextVariableMap {
    userId: string
  }
}
import { createClient } from '@libsql/client/web'
import { drizzle } from 'drizzle-orm/libsql'
import { eq, and, asc } from 'drizzle-orm'
import { sql } from 'drizzle-orm'
import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core'
import { z } from 'zod'

export const config = { runtime: 'edge' }

// ── Schema ──
const customLinks = sqliteTable('custom_links', {
  id:        text('id').primaryKey(),
  userId:    text('user_id').notNull(),
  name:      text('name').notNull(),
  url:       text('url').notNull(),
  icon:      text('icon').notNull().default('🔗'),
  group:     text('group').notNull().default('My Tools'),
  position:  integer('position').notNull().default(0),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
})

// ── DB ──
function getDb() {
  const client = createClient({
    url: process.env.TURSO_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  })
  return drizzle(client, { schema: { customLinks } })
}

// ── Auth ──
function nanoId() {
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36)
}

// ── App ──
const app = new Hono().basePath('/api')

app.use('/*', cors({
  origin: [
    'https://workspace.vickerydigital.com',
    'http://localhost:3000',
  ],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))

app.get('/health', (c) => c.json({ ok: true }))

// Auth middleware for /links routes
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
  const db = getDb()
  const userId = c.get('userId')
  const links = await db
    .select()
    .from(customLinks)
    .where(eq(customLinks.userId, userId))
    .orderBy(asc(customLinks.position))
  return c.json(links)
})

// POST /api/links
app.post('/links', async (c) => {
  const db = getDb()
  const userId = c.get('userId')
  const body = await c.req.json()
  const parsed = LinkSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  const existing = await db
    .select({ position: customLinks.position })
    .from(customLinks)
    .where(eq(customLinks.userId, userId))
    .orderBy(asc(customLinks.position))

  const maxPos = existing.length ? Math.max(...existing.map(r => r.position)) : -1

  const [link] = await db.insert(customLinks).values({
    id: nanoId(),
    userId,
    position: maxPos + 1,
    ...parsed.data,
  }).returning()

  return c.json(link, 201)
})

// PUT /api/links/reorder
app.put('/links/reorder', async (c) => {
  const db = getDb()
  const userId = c.get('userId')
  const body = await c.req.json()
  const parsed = ReorderSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  await Promise.all(
    parsed.data.items.map(({ id, position }) =>
      db.update(customLinks)
        .set({ position, updatedAt: new Date().toISOString() })
        .where(and(eq(customLinks.id, id), eq(customLinks.userId, userId)))
    )
  )
  return c.json({ ok: true })
})

// PUT /api/links/:id
app.put('/links/:id', async (c) => {
  const db = getDb()
  const userId = c.get('userId')
  const { id } = c.req.param()
  const body = await c.req.json()
  const parsed = LinkSchema.partial().safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  const [updated] = await db.update(customLinks)
    .set({ ...parsed.data, updatedAt: new Date().toISOString() })
    .where(and(eq(customLinks.id, id), eq(customLinks.userId, userId)))
    .returning()

  if (!updated) return c.json({ error: 'Not found' }, 404)
  return c.json(updated)
})

// DELETE /api/links/:id
app.delete('/links/:id', async (c) => {
  const db = getDb()
  const userId = c.get('userId')
  const { id } = c.req.param()

  const [deleted] = await db.delete(customLinks)
    .where(and(eq(customLinks.id, id), eq(customLinks.userId, userId)))
    .returning()

  if (!deleted) return c.json({ error: 'Not found' }, 404)
  return c.json({ ok: true })
})

export default handle(app)
