import { animes } from '~~/server/database/schema'
import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const body = await readBody(event)
  
  const newAnime = await db.insert(animes).values({
    title: body.title,
    coverImage: body.coverImage,
    rating: body.rating,
    review: body.review,
    releaseYear: body.releaseYear,
    releaseQuarter: body.releaseQuarter,
    createdAt: new Date(),
    updatedAt: new Date()
  }).returning().get()
  
  return newAnime
})
