import { and, desc, eq, or } from 'drizzle-orm'
import { getDb } from '../client'
import { favorites } from '../schema'
import type { Favorite } from '../../types'

export const getFavorites = async (d1: D1Database, userId: string): Promise<Favorite[]> => {
  const db = getDb(d1)
  const rows = await db.select().from(favorites).where(eq(favorites.userId, userId)).orderBy(desc(favorites.addedAt))

  return rows.map((row) => ({
    id: row.animalId || row.id,
    name: row.name,
    breed: row.breed,
    image: row.image,
    addedAt: row.addedAt,
  }))
}

export const createFavorite = async (d1: D1Database, userId: string, fav: Favorite): Promise<Favorite> => {
  const db = getDb(d1)
  const rowId = `${userId}_${fav.id}`
  const addedAt = fav.addedAt || new Date().toISOString()

  await db
    .insert(favorites)
    .values({
      id: rowId,
      userId,
      animalId: fav.id,
      name: fav.name,
      breed: fav.breed,
      image: fav.image,
      addedAt,
    })
    .onConflictDoUpdate({
      target: favorites.id,
      set: {
        name: fav.name,
        breed: fav.breed,
        image: fav.image,
      },
    })

  return { ...fav, addedAt }
}

export const deleteFavorite = async (d1: D1Database, userId: string, id: string): Promise<boolean> => {
  const db = getDb(d1)
  const res = await db
    .delete(favorites)
    .where(and(eq(favorites.userId, userId), or(eq(favorites.animalId, id), eq(favorites.id, `${userId}_${id}`))))
  return (res.meta.changes ?? 0) > 0
}
