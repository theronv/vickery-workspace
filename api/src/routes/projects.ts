import { Hono } from 'hono'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '../db'
import { projects, cardStates } from '../schema'

function nanoId() {
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36)
}

const app = new Hono()

const CreateProjectSchema = z.object({
  name: z.string().min(1).max(128),
  bundleId: z.string().max(128).optional(),
  score: z.number().int().min(0).max(12).nullable().optional(),
  verdict: z.enum(['SHIP IT', 'WATCH', 'LATER']).nullable().optional(),
})

const UpdateCardSchema = z.object({
  status: z.enum(['todo', 'in-progress', 'done']).optional(),
  checkedSteps: z.string().optional(), // JSON string of number[]
})

// GET /api/projects — list all projects
app.get('/', async (c) => {
  const db = getDb()
  const rows = await db.select().from(projects).orderBy(projects.createdAt)
  return c.json(rows)
})

// POST /api/projects — create project
app.post('/', async (c) => {
  const db = getDb()
  const body = await c.req.json()
  const parsed = CreateProjectSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  const id = nanoId()
  const [project] = await db.insert(projects).values({
    id,
    name: parsed.data.name,
    bundleId: parsed.data.bundleId ?? null,
    score: parsed.data.score ?? null,
    verdict: parsed.data.verdict ?? null,
  }).returning()

  return c.json(project, 201)
})

// GET /api/projects/:id — get project with card states
app.get('/:id', async (c) => {
  const db = getDb()
  const { id } = c.req.param()

  const [project] = await db.select().from(projects).where(eq(projects.id, id))
  if (!project) return c.json({ error: 'Not found' }, 404)

  const cards = await db.select().from(cardStates).where(eq(cardStates.projectId, id))

  return c.json({ ...project, cardStates: cards })
})

// PATCH /api/projects/:id/cards/:cardId — update card status + checked steps
app.patch('/:id/cards/:cardId', async (c) => {
  const db = getDb()
  const { id, cardId } = c.req.param()
  const body = await c.req.json()
  const parsed = UpdateCardSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  // Upsert: try update first, insert if not exists
  const existing = await db.select().from(cardStates)
    .where(and(eq(cardStates.projectId, id), eq(cardStates.cardId, cardId)))

  const now = new Date().toISOString()

  if (existing.length > 0) {
    const updates: Record<string, unknown> = { updatedAt: now }
    if (parsed.data.status) updates.status = parsed.data.status
    if (parsed.data.checkedSteps !== undefined) updates.checkedSteps = parsed.data.checkedSteps

    await db.update(cardStates)
      .set(updates)
      .where(and(eq(cardStates.projectId, id), eq(cardStates.cardId, cardId)))
  } else {
    await db.insert(cardStates).values({
      projectId: id,
      cardId,
      status: parsed.data.status || 'todo',
      checkedSteps: parsed.data.checkedSteps || '[]',
    })
  }

  return c.json({ ok: true })
})

// DELETE /api/projects/:id — delete project and its card states
app.delete('/:id', async (c) => {
  const db = getDb()
  const { id } = c.req.param()

  await db.delete(cardStates).where(eq(cardStates.projectId, id))
  const [deleted] = await db.delete(projects).where(eq(projects.id, id)).returning()

  if (!deleted) return c.json({ error: 'Not found' }, 404)
  return c.json({ ok: true })
})

export default app
