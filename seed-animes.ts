import { animes } from './server/database/schema'
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'

async function seed() {
  const client = createClient({ url: 'file:sqlite.db' })
  const db = drizzle(client)

  console.log('Seeding animes...')

  const testAnimes = [
    {
      title: '葬送的芙莉莲',
      coverImage: 'https://pic.imgdb.cn/item/652011b9c458853aef19f071.jpg',
      rating: 10,
      review: '极具情感细腻度的公路片，勇者死后的世界依然闪耀。',
      releaseYear: 2023,
      releaseQuarter: 10,
    },
    {
      title: '咒术回战 第二季',
      coverImage: 'https://pic.imgdb.cn/item/64a6616a1ddac507cc36868a.jpg',
      rating: 9,
      review: '怀玉·玉折篇的演出极其震撼。',
      releaseYear: 2023,
      releaseQuarter: 7,
    },
    {
      title: '孤独摇滚！',
      coverImage: 'https://pic.imgdb.cn/item/634177d916024cc1f543666d.jpg',
      rating: 10,
      review: '波奇酱就是我本人，演出效果太神了。',
      releaseYear: 2022,
      releaseQuarter: 10,
    },
    {
      title: '间谍过家家',
      coverImage: 'https://pic.imgdb.cn/item/624ea8a7239250f7c5a53d6a.jpg',
      rating: 8,
      review: '阿尼亚喜欢花生！',
      releaseYear: 2022,
      releaseQuarter: 4,
    }
  ]

  for (const anime of testAnimes) {
    await db.insert(animes).values({
      ...anime,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  console.log('Seed completed!')
  process.exit(0)
}

seed()
