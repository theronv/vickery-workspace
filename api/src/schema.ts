import { sql } from 'drizzle-orm'
import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core'

export const customLinks = sqliteTable('custom_links', {
  id:        text('id').primaryKey(),                              // nanoid
  userId:    text('user_id').notNull(),                           // Clerk user_id
  name:      text('name').notNull(),
  url:       text('url').notNull(),
  icon:      text('icon').notNull().default('🔗'),
  group:     text('group').notNull().default('My Tools'),
  position:  integer('position').notNull().default(0),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
})

export type CustomLink    = typeof customLinks.$inferSelect
export type NewCustomLink = typeof customLinks.$inferInsert
