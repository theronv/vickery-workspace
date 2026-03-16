import { Hono } from 'hono'
import { eq, and, asc } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '../db'
import { customLinks } from '../schema'

// nanoid-lite — no npm dep needed for this
function nanoId() {
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36)
}

const app = new Hono()

const LinkSchema = z.object({
  name:  z.string().min(1).max(64),
  url:   z.string().url(),
  icon:  z.string().max(8).default('🔗'),
  group: z.string().min(1).max(32).default('My Tools'),
})

const ReorderSchema = z.object({
  items: z.array(z.object({ id: z.string(), position: z.number().int() })),
})

// GET /api/links — all links for this user, ordered by position
app.get('/', async (c) => {
  const db = getDb()
  const userId = c.get('userId')
  const links = await db
    .select()
    .from(customLinks)
    .where(eq(customLinks.userId, userId))
    .orderBy(asc(customLinks.position))
  return c.json(links)
})

// POST /api/links — create
app.post('/', async (c) => {
  const db = getDb()
  const userId = c.get('userId')
  const body = await c.req.json()
  const parsed = LinkSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  // Position = max existing + 1
  const existing = await db
    .select({ position: customLinks.position })
    .from(customLinks)
    .where(eq(customLinks.userId, userId))
    .orderBy(asc(customLinks.position))

  const maxPos = existing.length ? Math.max(...existing.map(r => r.position)) : -1

  const [link] = await db.insert(customLinks).values({
    id:       nanoId(),
    userId,
    position: maxPos + 1,
    ...parsed.data,
  }).returning()

  return c.json(link, 201)
})

// PUT /api/links/reorder — batch reorder
app.put('/reorder', async (c) => {
  const db = getDb()
  const userId = c.get('userId')
  const body = await c.req.json()
  const parsed = ReorderSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  // Update each item's position — verify ownership
  await Promise.all(
    parsed.data.items.map(({ id, position }) =>
      db.update(customLinks)
        .set({ position, updatedAt: new Date().toISOString() })
        .where(and(eq(customLinks.id, id), eq(customLinks.userId, userId)))
    )
  )
  return c.json({ ok: true })
})

// PUT /api/links/:id — update a link
app.put('/:id', async (c) => {
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
app.delete('/:id', async (c) => {
  const db = getDb()
  const userId = c.get('userId')
  const { id } = c.req.param()

  const [deleted] = await db.delete(customLinks)
    .where(and(eq(customLinks.id, id), eq(customLinks.userId, userId)))
    .returning()

  if (!deleted) return c.json({ error: 'Not found' }, 404)
  return c.json({ ok: true })
})

export default app
