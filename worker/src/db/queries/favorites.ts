import type { Favorite } from '../../types'

type FavoriteRow = {
  id: string
  animal_id: string
  name: string
  breed: string
  image: string
  added_at: string
}

export const getFavorites = async (db: D1Database, userId: string): Promise<Favorite[]> => {
  const { results } = await db.prepare('SELECT * FROM favorites WHERE user_id = ? ORDER BY added_at DESC').bind(userId).all<FavoriteRow>()

  return results.map((row) => ({
    id: row.animal_id || row.id,
    name: row.name,
    breed: row.breed,
    image: row.image,
    addedAt: row.added_at,
  }))
}

export const createFavorite = async (db: D1Database, userId: string, fav: Favorite): Promise<Favorite> => {
  const rowId = `${userId}_${fav.id}`
  const addedAt = fav.addedAt || new Date().toISOString()

  await db
    .prepare(
      `INSERT INTO favorites (id, user_id, animal_id, name, breed, image, added_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         breed = excluded.breed,
         image = excluded.image`,
    )
    .bind(rowId, userId, fav.id, fav.name, fav.breed, fav.image, addedAt)
    .run()

  return { ...fav, addedAt }
}

export const deleteFavorite = async (db: D1Database, userId: string, id: string): Promise<boolean> => {
  const res = await db
    .prepare('DELETE FROM favorites WHERE user_id = ? AND (animal_id = ? OR id = ?)')
    .bind(userId, id, `${userId}_${id}`)
    .run()
  return (res.meta.changes ?? 0) > 0
}
