import { Hono } from 'hono'
import {
  createCollectionItem,
  deleteCollectionItem,
  getCollectionItems,
  reorderCollectionItems,
  updateCollectionItem,
} from '../db/queries/collection'
import { authMiddleware } from '../middleware/auth'
import type { CollectionItem, CollectionListKey, Env } from '../types'

const ALLOWED_COLLECTIONS = ['movies', 'books', 'games']

export const collectionRouter = new Hono<{ Bindings: Env }>()

collectionRouter.use('*', authMiddleware)

collectionRouter.get('/:collection', async (c) => {
  const userId = c.get('user').userId
  const collection = c.req.param('collection')
  if (!ALLOWED_COLLECTIONS.includes(collection)) {
    return c.json({ error: 'Invalid collection type', code: 'INVALID_COLLECTION' }, 400)
  }

  const list = c.req.query('list') as CollectionListKey | undefined
  const items = await getCollectionItems(c.env.DB, userId, collection, list)
  return c.json(items)
})

collectionRouter.post('/:collection', async (c) => {
  const userId = c.get('user').userId
  const collection = c.req.param('collection')
  if (!ALLOWED_COLLECTIONS.includes(collection)) {
    return c.json({ error: 'Invalid collection type', code: 'INVALID_COLLECTION' }, 400)
  }

  const body = (await c.req.json().catch(() => ({}))) as { listKey?: CollectionListKey; item?: CollectionItem }
  if (!body.listKey || !body.item || !body.item.title) {
    return c.json({ error: 'listKey and item with title are required', code: 'INVALID_DATA' }, 400)
  }

  const created = await createCollectionItem(c.env.DB, userId, collection, body.listKey, body.item)
  return c.json(created, 201)
})

collectionRouter.put('/:collection/:id', async (c) => {
  const userId = c.get('user').userId
  const collection = c.req.param('collection')
  const id = c.req.param('id')
  if (!ALLOWED_COLLECTIONS.includes(collection)) {
    return c.json({ error: 'Invalid collection type', code: 'INVALID_COLLECTION' }, 400)
  }

  const body = (await c.req.json().catch(() => ({}))) as {
    listKey?: CollectionListKey
    patch?: Partial<CollectionItem>
  }
  const updated = await updateCollectionItem(c.env.DB, userId, collection, id, body.listKey, body.patch)
  if (!updated) {
    return c.json({ error: 'Item not found', code: 'NOT_FOUND' }, 404)
  }

  return c.json({ success: true })
})

collectionRouter.delete('/:collection/:id', async (c) => {
  const userId = c.get('user').userId
  const collection = c.req.param('collection')
  const id = c.req.param('id')
  const list = c.req.query('list') as CollectionListKey | undefined

  if (!ALLOWED_COLLECTIONS.includes(collection)) {
    return c.json({ error: 'Invalid collection type', code: 'INVALID_COLLECTION' }, 400)
  }

  const deleted = await deleteCollectionItem(c.env.DB, userId, collection, id, list)
  if (!deleted) {
    return c.json({ error: 'Item not found', code: 'NOT_FOUND' }, 404)
  }

  return c.json({ success: true })
})

collectionRouter.post('/:collection/reorder', async (c) => {
  const userId = c.get('user').userId
  const collection = c.req.param('collection')
  if (!ALLOWED_COLLECTIONS.includes(collection)) {
    return c.json({ error: 'Invalid collection type', code: 'INVALID_COLLECTION' }, 400)
  }

  const body = (await c.req.json().catch(() => ({}))) as {
    list?: CollectionListKey
    orderedIds?: string[]
  }
  if (!body.list || !Array.isArray(body.orderedIds)) {
    return c.json({ error: 'list and orderedIds array are required', code: 'INVALID_DATA' }, 400)
  }

  await reorderCollectionItems(c.env.DB, userId, collection, body.list, body.orderedIds)
  return c.json({ success: true })
})
