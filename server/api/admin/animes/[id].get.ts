import { eq } from 'drizzle-orm'
import { animes } from '~~/server/database/schema'
import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const id = parseInt(getRouterParam(event, 'id') || '')
  
  if (isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Invalid ID' })
  }

  const item = await db.query.animes.findFirst({
    where: eq(animes.id, id)
  })

  if (!item) {
    throw createError({ statusCode: 404, message: 'Anime not found' })
  }

  return item
})
