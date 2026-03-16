import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { handle } from 'hono/vercel'
import { clerkAuth } from '../src/auth'
import linksRouter from '../src/routes/links'

export const config = {
  runtime: 'edge'
}

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

app.use('/links/*', clerkAuth)
app.use('/links', clerkAuth)
app.route('/links', linksRouter)

export default handle(app)
