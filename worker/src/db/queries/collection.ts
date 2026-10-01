import { and, asc, desc, eq } from 'drizzle-orm'
import { getDb, parseJson } from '../client'
import { collectionItems } from '../schema'
import type { CollectionItem, CollectionListKey } from '../../types'

export const getCollectionItems = async (
  d1: D1Database,
  userId: string,
  collection: string,
  listKey?: CollectionListKey,
): Promise<CollectionItem[]> => {
  const db = getDb(d1)
  const conditions = [eq(collectionItems.userId, userId), eq(collectionItems.collection, collection)]
  if (listKey) {
    conditions.push(eq(collectionItems.listKey, listKey))
  }

  const rows = await db
    .select()
    .from(collectionItems)
    .where(and(...conditions))
    .orderBy(asc(collectionItems.sortOrder), desc(collectionItems.addedAt))

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    imageUrl: row.imageUrl,
    year: row.year,
    tags: parseJson<string[]>(row.tagsJson, []),
    score: row.score,
    addedAt: row.addedAt,
    finishedAt: row.finishedAt || undefined,
    review: row.review || undefined,
    enjoyment: row.enjoyment !== null ? row.enjoyment : undefined,
    enjoymentReaction: (row.enjoymentReaction as CollectionItem['enjoymentReaction']) || undefined,
    sortOrder: row.sortOrder,
  }))
}

export const createCollectionItem = async (
  d1: D1Database,
  userId: string,
  collection: string,
  listKey: CollectionListKey,
  item: CollectionItem,
): Promise<CollectionItem> => {
  const db = getDb(d1)
  const id = item.id || crypto.randomUUID()
  const addedAt = item.addedAt || new Date().toISOString()
  const sortOrder = item.sortOrder ?? 0

  await db.insert(collectionItems).values({
    id,
    userId,
    collection,
    listKey,
    title: item.title,
    subtitle: item.subtitle || '',
    description: item.description || '',
    imageUrl: item.imageUrl ?? null,
    year: item.year ?? null,
    tagsJson: JSON.stringify(item.tags || []),
    score: item.score ?? null,
    addedAt,
    finishedAt: item.finishedAt ?? null,
    review: item.review ?? null,
    enjoyment: item.enjoyment ?? null,
    enjoymentReaction: item.enjoymentReaction ?? null,
    sortOrder,
  })

  return {
    ...item,
    id,
    addedAt,
    sortOrder,
  }
}

export const updateCollectionItem = async (
  d1: D1Database,
  userId: string,
  collection: string,
  id: string,
  listKey?: CollectionListKey,
  patch?: Partial<CollectionItem>,
): Promise<boolean> => {
  const db = getDb(d1)
  const existing = await db
    .select()
    .from(collectionItems)
    .where(and(eq(collectionItems.id, id), eq(collectionItems.userId, userId), eq(collectionItems.collection, collection)))
    .get()

  if (!existing) return false

  const nextListKey = listKey ?? existing.listKey
  const title = patch?.title ?? existing.title
  const subtitle = patch?.subtitle !== undefined ? patch.subtitle : existing.subtitle
  const description = patch?.description !== undefined ? patch.description : existing.description
  const imageUrl = patch?.imageUrl !== undefined ? patch.imageUrl : existing.imageUrl
  const year = patch?.year !== undefined ? patch.year : existing.year
  const tagsJson = patch?.tags !== undefined ? JSON.stringify(patch.tags) : existing.tagsJson
  const score = patch?.score !== undefined ? patch.score : existing.score
  const finishedAt = patch?.finishedAt !== undefined ? patch.finishedAt : existing.finishedAt
  const review = patch?.review !== undefined ? patch.review : existing.review
  const enjoyment = patch?.enjoyment !== undefined ? patch.enjoyment : existing.enjoyment
  const reaction = patch?.enjoymentReaction !== undefined ? patch.enjoymentReaction : existing.enjoymentReaction
  const sortOrder = patch?.sortOrder !== undefined ? patch.sortOrder : existing.sortOrder

  await db
    .update(collectionItems)
    .set({
      listKey: nextListKey,
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
      enjoymentReaction: reaction,
      sortOrder,
    })
    .where(and(eq(collectionItems.id, id), eq(collectionItems.userId, userId), eq(collectionItems.collection, collection)))

  return true
}

export const deleteCollectionItem = async (
  d1: D1Database,
  userId: string,
  collection: string,
  id: string,
  listKey?: CollectionListKey,
): Promise<boolean> => {
  const db = getDb(d1)
  const conditions = [eq(collectionItems.id, id), eq(collectionItems.userId, userId), eq(collectionItems.collection, collection)]
  if (listKey) {
    conditions.push(eq(collectionItems.listKey, listKey))
  }
  const res = await db.delete(collectionItems).where(and(...conditions))
  return (res.meta.changes ?? 0) > 0
}

export const reorderCollectionItems = async (
  d1: D1Database,
  userId: string,
  collection: string,
  listKey: CollectionListKey,
  orderedIds: string[],
): Promise<void> => {
  const db = getDb(d1)
  for (let i = 0; i < orderedIds.length; i++) {
    await db
      .update(collectionItems)
      .set({ sortOrder: i })
      .where(
        and(
          eq(collectionItems.id, orderedIds[i]),
          eq(collectionItems.userId, userId),
          eq(collectionItems.collection, collection),
          eq(collectionItems.listKey, listKey),
        ),
      )
  }
}
