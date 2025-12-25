import { eq } from 'drizzle-orm'
import { posts } from '~~/server/database/schema'
import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const id = Number(getRouterParam(event, 'id'))
  
  const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1)
  
  if (!result.length) {
    throw createError({ statusCode: 404, message: 'Post not found' })
  }
  
  return result[0]
})
