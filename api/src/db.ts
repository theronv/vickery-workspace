import { createClient } from '@libsql/client/web'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'

// Called per-request in Edge runtime — client is cheap to instantiate
export function getDb() {
  const client = createClient({
    url:       process.env.TURSO_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  })
  return drizzle(client, { schema })
}
