import { Hono } from 'hono'

const app = new Hono()

// POST /api/claude — proxy to Anthropic Messages API
app.post('/', async (c) => {
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

  // Stream the response back with matching headers
  const responseHeaders = new Headers()
  responseHeaders.set('content-type', resp.headers.get('content-type') || 'application/json')
  if (resp.headers.get('transfer-encoding')) {
    responseHeaders.set('transfer-encoding', resp.headers.get('transfer-encoding')!)
  }

  return new Response(resp.body, {
    status: resp.status,
    headers: responseHeaders,
  })
})

export default app
