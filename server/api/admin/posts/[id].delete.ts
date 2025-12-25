import { eq } from 'drizzle-orm'
import { posts } from '~~/server/database/schema'
import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const id = Number(getRouterParam(event, 'id'))
  
  await db.delete(posts).where(eq(posts.id, id))
  
  return { success: true }
})
