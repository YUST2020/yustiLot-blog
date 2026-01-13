import { desc, asc, like, sql, and } from 'drizzle-orm'
import { animes } from '~~/server/database/schema'
import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const query = getQuery(event)
  const page = Math.max(1, parseInt(query.page as string) || 1)
  const pageSize = Math.max(1, Math.min(100, parseInt(query.pageSize as string) || 10))
  const search = (query.search as string) || ''
  const sortBy = (query.sortBy as string) || 'releaseDate' // 'releaseDate' | 'rating'
  const order = (query.order as string) || 'desc' // 'desc' | 'asc'

  const offset = (page - 1) * pageSize

  // Build where clause
  const whereClause = search ? like(animes.title, `%${search}%`) : undefined

  // Build order by
  let orderBy: any[] = []
  if (sortBy === 'rating') {
    orderBy = [order === 'desc' ? desc(animes.rating) : asc(animes.rating)]
  } else if (sortBy === 'releaseDate') {
    // For release date, we sort by year then quarter
    orderBy = [
      order === 'desc' ? desc(animes.releaseYear) : asc(animes.releaseYear),
      order === 'desc' ? desc(animes.releaseQuarter) : asc(animes.releaseQuarter)
    ]
  } else {
    // Default fallback (though sortBy defaults to releaseDate)
    orderBy = [order === 'desc' ? desc(animes.createdAt) : asc(animes.createdAt)]
  }

  const [items, countResult] = await Promise.all([
    db.select()
      .from(animes)
      .where(whereClause)
      .orderBy(...orderBy)
      .limit(pageSize)
      .offset(offset),
    db.select({ count: sql<number>`count(*)` })
      .from(animes)
      .where(whereClause)
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
