import type { MiddlewareHandler } from 'hono'

declare module 'hono' {
  interface ContextVariableMap {
    userId: string
  }
}

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header('Authorization')
  
  // The user will set AUTH_SECRET in Vercel environment variables
  const AUTH_SECRET = process.env.AUTH_SECRET

  if (!AUTH_SECRET) {
    console.error('AUTH_SECRET is not defined in environment variables')
    return c.json({ error: 'Server configuration error' }, 500)
  }

  if (!authHeader?.startsWith('Bearer ') || authHeader.slice(7) !== AUTH_SECRET) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  // We'll use a fixed userId since this is a private personal workspace
  c.set('userId', 'primary_user')
  await next()
}
