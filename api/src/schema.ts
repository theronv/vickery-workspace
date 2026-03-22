import { sql } from 'drizzle-orm'
import { text, integer, sqliteTable, primaryKey } from 'drizzle-orm/sqlite-core'

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

export const projects = sqliteTable('projects', {
  id:        text('id').primaryKey(),
  name:      text('name').notNull(),
  bundleId:  text('bundle_id'),
  score:     integer('score'),
  verdict:   text('verdict'),   // 'SHIP IT' | 'WATCH' | 'LATER'
  stage:     integer('stage').notNull().default(1),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
})

export type Project    = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert

export const cardStates = sqliteTable('card_states', {
  projectId:    text('project_id').notNull().references(() => projects.id),
  cardId:       text('card_id').notNull(),
  status:       text('status').notNull().default('todo'),  // 'todo' | 'in-progress' | 'done'
  checkedSteps: text('checked_steps').notNull().default('[]'),
  updatedAt:    text('updated_at').notNull().default(sql`(datetime('now'))`),
}, (table) => ({
  pk: primaryKey({ columns: [table.projectId, table.cardId] }),
}))
