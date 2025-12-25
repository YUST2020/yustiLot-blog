import { desc, eq } from 'drizzle-orm'
import { posts } from '~~/server/database/schema'
import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 10
  const offset = (page - 1) * limit

  const items = await db.select()
    .from(posts)
    .where(eq(posts.isPublished, true))
    .orderBy(desc(posts.publishedAt))
    .limit(limit)
    .offset(offset)
    
  return items
})
