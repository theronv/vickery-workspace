import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { handle } from 'hono/vercel'
import { authMiddleware } from './auth'
import linksRouter from './routes/links'
import claudeRouter from './routes/claude'

const app = new Hono().basePath('/api')

app.use('/*', cors({
  origin: (origin) => {
    if (!origin) return 'https://workspace.vickerydigital.com'
    if (origin === 'https://workspace.vickerydigital.com') return origin
    if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return origin
    return null as unknown as string
  },
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))

app.get('/health', (c) => c.json({ ok: true }))

app.use('/links/*', authMiddleware)
app.use('/links', authMiddleware)
app.route('/links', linksRouter)

app.route('/claude', claudeRouter)

export default handle(app)
