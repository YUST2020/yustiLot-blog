import { desc } from 'drizzle-orm'
import { animes } from '~~/server/database/schema'
import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  const items = await db.select()
    .from(animes)
    .orderBy(desc(animes.createdAt))
    
  return items
})
