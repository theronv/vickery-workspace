import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { handle } from 'hono/vercel'
import { authMiddleware } from './auth'
import linksRouter from './routes/links'

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

app.use('/links/*', authMiddleware)
app.use('/links', authMiddleware)
app.route('/links', linksRouter)

export default handle(app)
