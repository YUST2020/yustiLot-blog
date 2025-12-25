import { eq } from 'drizzle-orm'
import { posts } from '~~/server/database/schema'
import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  
  const publishedAt = body.isPublished && !body.publishedAt ? new Date() : (body.publishedAt ? new Date(body.publishedAt) : null)

  const updatedPost = await db.update(posts)
    .set({
      title: body.title,
      slug: body.slug,
      content: body.content,
      excerpt: body.excerpt,
      coverImage: body.coverImage,
      tags: body.tags,
      isPublished: body.isPublished,
      publishedAt,
      updatedAt: new Date()
    })
    .where(eq(posts.id, id))
    .returning()
    .get()
    
  return updatedPost
})
