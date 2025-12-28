import { eq } from 'drizzle-orm'
import { animes } from '~~/server/database/schema'
import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const id = parseInt(getRouterParam(event, 'id') || '')
  const body = await readBody(event)

  if (isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Invalid ID' })
  }

  const updatedAnime = await db.update(animes)
    .set({
      title: body.title,
      coverImage: body.coverImage,
      rating: body.rating,
      review: body.review,
      releaseYear: body.releaseYear,
      releaseQuarter: body.releaseQuarter,
      updatedAt: new Date()
    })
    .where(eq(animes.id, id))
    .returning()
    .get()

  return updatedAnime
})
