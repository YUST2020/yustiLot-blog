import { desc, asc, sql } from 'drizzle-orm'
import { animes } from '~~/server/database/schema'
import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = Math.max(1, parseInt(query.page as string) || 1)
  const pageSize = Math.max(1, Math.min(100, parseInt(query.pageSize as string) || 12))
  const sortBy = (query.sortBy as string) || 'releaseDate'
  const order = (query.order as string) || 'desc'

  const offset = (page - 1) * pageSize

  let orderBy: any[] = []

  if (sortBy === 'rating') {
    orderBy = [order === 'desc' ? desc(animes.rating) : asc(animes.rating)]
  } else if (sortBy === 'releaseDate') {
    orderBy = [
      order === 'desc' ? desc(animes.releaseYear) : asc(animes.releaseYear),
      order === 'desc' ? desc(animes.releaseQuarter) : asc(animes.releaseQuarter)
    ]
  } else {
    orderBy = [order === 'desc' ? desc(animes.createdAt) : asc(animes.createdAt)]
  }

  const [items, countResult] = await Promise.all([
    db.select()
      .from(animes)
      .orderBy(...orderBy)
      .limit(pageSize)
      .offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(animes)
  ])

  const total = countResult[0]?.count || 0

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  }
})
