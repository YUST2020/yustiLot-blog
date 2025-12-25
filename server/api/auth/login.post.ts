import { eq } from 'drizzle-orm'
import { users } from '~~/server/database/schema'
import { db } from '~~/server/utils/db'
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password } = body

  if (!username || !password) {
    throw createError({
      statusCode: 400,
      message: 'Missing credentials'
    })
  }

  const userList = await db.select().from(users).where(eq(users.username, username)).limit(1)
  const user = userList[0]

  if (!user) {
    // Initial Admin Creation Check
    const allUsers = await db.select().from(users).limit(1)
    if (allUsers.length === 0 && username === 'admin') {
       const hashedPassword = await bcrypt.hash(password, 10)
       const newUser = await db.insert(users).values({
         username,
         password: hashedPassword,
         name: 'Admin'
       }).returning().get()
       
       await setUserSession(event, {
         user: {
            id: newUser.id,
            username: newUser.username,
            name: newUser.name
         }
       })
       return { user: { id: newUser.id, username: newUser.username, name: newUser.name } }
    }

    throw createError({
      statusCode: 401,
      message: 'Invalid credentials'
    })
  }

  const validPassword = await bcrypt.compare(password, user.password)
  if (!validPassword) {
    throw createError({
      statusCode: 401,
      message: 'Invalid credentials'
    })
  }

  await setUserSession(event, {
    user: {
      id: user.id,
      username: user.username,
      name: user.name
    }
  })

  return { user: { id: user.id, username: user.username, name: user.name } }
})
