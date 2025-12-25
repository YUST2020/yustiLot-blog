import { eq, and } from 'drizzle-orm'
import { posts } from '~~/server/database/schema'
import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  
  if (!slug) {
     throw createError({ statusCode: 400, message: 'Slug is required' })
  }

  const result = await db.select()
    .from(posts)
    .where(and(eq(posts.slug, slug), eq(posts.isPublished, true)))
    .limit(1)
    
  if (!result.length) {
    throw createError({
      statusCode: 404,
      message: 'Post not found'
    })
  }
  
  return result[0]
})
