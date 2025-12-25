import { posts } from '~~/server/database/schema'
import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const body = await readBody(event)
  
  // Ensure publishedAt is set if published
  const publishedAt = body.isPublished && !body.publishedAt ? new Date() : (body.publishedAt ? new Date(body.publishedAt) : null)

  const newPost = await db.insert(posts).values({
    title: body.title,
    slug: body.slug,
    content: body.content,
    excerpt: body.excerpt,
    coverImage: body.coverImage,
    tags: body.tags,
    isPublished: body.isPublished,
    publishedAt,
    createdAt: new Date(),
    updatedAt: new Date()
  }).returning().get()
  
  return newPost
})
