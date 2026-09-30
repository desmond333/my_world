import { parseJson } from '../client'
import type { CollectionItem, CollectionListKey } from '../../types'

type CollectionItemRow = {
  id: string
  user_id: string
  collection: string
  list_key: string
  title: string
  subtitle: string
  description: string
  image_url: string | null
  year: number | null
  tags_json: string
  score: string | null
  added_at: string
  finished_at: string | null
  review: string | null
  enjoyment: number | null
  enjoyment_reaction: string | null
  sort_order: number
}

const mapRowToItem = (row: CollectionItemRow): CollectionItem => ({
  id: row.id,
  title: row.title,
  subtitle: row.subtitle,
  description: row.description,
  imageUrl: row.image_url,
  year: row.year,
  tags: parseJson<string[]>(row.tags_json, []),
  score: row.score,
  addedAt: row.added_at,
  finishedAt: row.finished_at || undefined,
  review: row.review || undefined,
  enjoyment: row.enjoyment !== null ? row.enjoyment : undefined,
  enjoymentReaction: (row.enjoyment_reaction as CollectionItem['enjoymentReaction']) || undefined,
  sortOrder: row.sort_order,
})

export const getCollectionItems = async (
  db: D1Database,
  userId: string,
  collection: string,
  listKey?: CollectionListKey,
): Promise<CollectionItem[]> => {
  let query = 'SELECT * FROM collection_items WHERE user_id = ? AND collection = ?'
  const params: unknown[] = [userId, collection]

  if (listKey) {
    query += ' AND list_key = ?'
    params.push(listKey)
  }

  query += ' ORDER BY sort_order ASC, added_at DESC'

  const { results } = await db
    .prepare(query)
    .bind(...params)
    .all<CollectionItemRow>()
  return results.map(mapRowToItem)
}

export const createCollectionItem = async (
  db: D1Database,
  userId: string,
  collection: string,
  listKey: CollectionListKey,
  item: CollectionItem,
): Promise<CollectionItem> => {
  const id = item.id || crypto.randomUUID()
  const addedAt = item.addedAt || new Date().toISOString()
  const sortOrder = item.sortOrder ?? 0

  await db
    .prepare(
      `INSERT INTO collection_items (
        id, user_id, collection, list_key, title, subtitle, description,
        image_url, year, tags_json, score, added_at, finished_at,
        review, enjoyment, enjoyment_reaction, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      userId,
      collection,
      listKey,
      item.title,
      item.subtitle || '',
      item.description || '',
      item.imageUrl ?? null,
      item.year ?? null,
      JSON.stringify(item.tags || []),
      item.score ?? null,
      addedAt,
      item.finishedAt ?? null,
      item.review ?? null,
      item.enjoyment ?? null,
      item.enjoymentReaction ?? null,
      sortOrder,
    )
    .run()

  return {
    ...item,
    id,
    addedAt,
    sortOrder,
  }
}

export const updateCollectionItem = async (
  db: D1Database,
  userId: string,
  collection: string,
  id: string,
  listKey?: CollectionListKey,
  patch?: Partial<CollectionItem>,
): Promise<boolean> => {
  const existing = await db
    .prepare('SELECT * FROM collection_items WHERE id = ? AND user_id = ? AND collection = ?')
    .bind(id, userId, collection)
    .first<CollectionItemRow>()

  if (!existing) return false

  const nextListKey = listKey ?? existing.list_key
  const title = patch?.title ?? existing.title
  const subtitle = patch?.subtitle !== undefined ? patch.subtitle : existing.subtitle
  const description = patch?.description !== undefined ? patch.description : existing.description
  const imageUrl = patch?.imageUrl !== undefined ? patch.imageUrl : existing.image_url
  const year = patch?.year !== undefined ? patch.year : existing.year
  const tagsJson = patch?.tags !== undefined ? JSON.stringify(patch.tags) : existing.tags_json
  const score = patch?.score !== undefined ? patch.score : existing.score
  const finishedAt = patch?.finishedAt !== undefined ? patch.finishedAt : existing.finished_at
  const review = patch?.review !== undefined ? patch.review : existing.review
  const enjoyment = patch?.enjoyment !== undefined ? patch.enjoyment : existing.enjoyment
  const reaction = patch?.enjoymentReaction !== undefined ? patch.enjoymentReaction : existing.enjoyment_reaction
  const sortOrder = patch?.sortOrder !== undefined ? patch.sortOrder : existing.sort_order

  await db
    .prepare(
      `UPDATE collection_items
       SET list_key = ?, title = ?, subtitle = ?, description = ?, image_url = ?,
           year = ?, tags_json = ?, score = ?, finished_at = ?, review = ?,
           enjoyment = ?, enjoyment_reaction = ?, sort_order = ?
       WHERE id = ? AND user_id = ? AND collection = ?`,
    )
    .bind(
      nextListKey,
      title,
      subtitle,
      description,
      imageUrl,
      year,
      tagsJson,
      score,
      finishedAt,
      review,
      enjoyment,
      reaction,
      sortOrder,
      id,
      userId,
      collection,
    )
    .run()

  return true
}

export const deleteCollectionItem = async (
  db: D1Database,
  userId: string,
  collection: string,
  id: string,
  listKey?: CollectionListKey,
): Promise<boolean> => {
  let query = 'DELETE FROM collection_items WHERE id = ? AND user_id = ? AND collection = ?'
  const params: unknown[] = [id, userId, collection]

  if (listKey) {
    query += ' AND list_key = ?'
    params.push(listKey)
  }

  const res = await db
    .prepare(query)
    .bind(...params)
    .run()
  return (res.meta.changes ?? 0) > 0
}

export const reorderCollectionItems = async (
  db: D1Database,
  userId: string,
  collection: string,
  listKey: CollectionListKey,
  orderedIds: string[],
): Promise<void> => {
  const statements: D1PreparedStatement[] = []
  for (let i = 0; i < orderedIds.length; i++) {
    statements.push(
      db
        .prepare(
          `UPDATE collection_items
           SET sort_order = ?
           WHERE id = ? AND user_id = ? AND collection = ? AND list_key = ?`,
        )
        .bind(i, orderedIds[i], userId, collection, listKey),
    )
  }
  if (statements.length > 0) {
    await db.batch(statements)
  }
}
