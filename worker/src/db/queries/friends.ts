import { and, desc, eq, inArray, like, ne, or } from 'drizzle-orm'
import { getDb } from '../client'
import { friendships, productivityItems, settings, users } from '../schema'
import type { FriendItem, FriendRequest, FriendsData, ProductivityItem, SentFriendTask, TaskPriority } from '../../types'

export const getFriendsData = async (db: D1Database, userId: string): Promise<FriendsData> => {
  const appDb = getDb(db)

  const [acceptedRows, incomingRows, outgoingRows] = await Promise.all([
    appDb
      .select({
        id: friendships.id,
        userId: friendships.userId,
        friendId: friendships.friendId,
        createdAt: friendships.createdAt,
      })
      .from(friendships)
      .where(and(or(eq(friendships.userId, userId), eq(friendships.friendId, userId)), eq(friendships.status, 'accepted'))),
    appDb
      .select({
        friendshipId: friendships.id,
        senderId: friendships.userId,
        createdAt: friendships.createdAt,
        email: users.email,
      })
      .from(friendships)
      .innerJoin(users, eq(friendships.userId, users.id))
      .where(and(eq(friendships.friendId, userId), eq(friendships.status, 'pending')))
      .orderBy(desc(friendships.createdAt)),
    appDb
      .select({
        friendshipId: friendships.id,
        receiverId: friendships.friendId,
        createdAt: friendships.createdAt,
        email: users.email,
      })
      .from(friendships)
      .innerJoin(users, eq(friendships.friendId, users.id))
      .where(and(eq(friendships.userId, userId), eq(friendships.status, 'pending')))
      .orderBy(desc(friendships.createdAt)),
  ])

  const otherIds = acceptedRows.map((row) => (row.userId === userId ? row.friendId : row.userId))
  let friends: FriendItem[] = []

  if (otherIds.length > 0) {
    const userRows = await appDb
      .select({
        id: users.id,
        email: users.email,
        allowFriendTasks: settings.allowFriendTasks,
      })
      .from(users)
      .leftJoin(settings, eq(users.id, settings.userId))
      .where(inArray(users.id, otherIds))

    const userMap = new Map(userRows.map((u) => [u.id, u]))

    friends = acceptedRows
      .map((row) => {
        const otherId = row.userId === userId ? row.friendId : row.userId
        const u = userMap.get(otherId)
        if (!u) return null
        return {
          id: otherId,
          friendshipId: row.id,
          email: u.email,
          allowFriendTasks: u.allowFriendTasks === null || u.allowFriendTasks === undefined ? true : Boolean(u.allowFriendTasks),
          createdAt: row.createdAt,
        }
      })
      .filter((item): item is FriendItem => item !== null)
      .sort((a, b) => a.email.localeCompare(b.email))
  }

  const incoming: FriendRequest[] = incomingRows.map((row) => ({
    id: row.senderId,
    friendshipId: row.friendshipId,
    email: row.email,
    createdAt: row.createdAt,
  }))

  const outgoing: FriendRequest[] = outgoingRows.map((row) => ({
    id: row.receiverId,
    friendshipId: row.friendshipId,
    email: row.email,
    createdAt: row.createdAt,
  }))

  return { friends, incoming, outgoing }
}

export const searchUsers = async (
  db: D1Database,
  currentUserId: string,
  query: string,
): Promise<Array<{ id: string; email: string; relationship: 'friend' | 'incoming' | 'outgoing' | 'none'; friendshipId?: string }>> => {
  const clean = query.trim().toLowerCase()
  if (!clean || clean.length < 2) return []

  const appDb = getDb(db)
  const matchedUsers = await appDb
    .select({
      id: users.id,
      email: users.email,
    })
    .from(users)
    .where(and(like(users.email, `%${clean}%`), ne(users.id, currentUserId)))
    .limit(15)

  if (!matchedUsers.length) return []

  const userIds = matchedUsers.map((u) => u.id)

  const relatedFriendships = await appDb
    .select({
      id: friendships.id,
      userId: friendships.userId,
      friendId: friendships.friendId,
      status: friendships.status,
    })
    .from(friendships)
    .where(
      or(
        and(eq(friendships.userId, currentUserId), inArray(friendships.friendId, userIds)),
        and(eq(friendships.friendId, currentUserId), inArray(friendships.userId, userIds)),
      ),
    )

  const map = new Map<string, { status: string; id: string; isSender: boolean }>()
  for (const f of relatedFriendships) {
    const otherId = f.userId === currentUserId ? f.friendId : f.userId
    map.set(otherId, { status: f.status, id: f.id, isSender: f.userId === currentUserId })
  }

  return matchedUsers.map((user) => {
    const relation = map.get(user.id)
    if (!relation) {
      return { id: user.id, email: user.email, relationship: 'none' }
    }
    if (relation.status === 'accepted') {
      return { id: user.id, email: user.email, relationship: 'friend', friendshipId: relation.id }
    }
    if (relation.status === 'pending') {
      return {
        id: user.id,
        email: user.email,
        relationship: relation.isSender ? 'outgoing' : 'incoming',
        friendshipId: relation.id,
      }
    }
    return { id: user.id, email: user.email, relationship: 'none' }
  })
}

export const sendFriendRequest = async (
  db: D1Database,
  currentUserId: string,
  targetEmailOrId: string,
): Promise<{ success: boolean; status?: string; error?: string; friendshipId?: string }> => {
  const clean = targetEmailOrId.trim().toLowerCase()
  if (!clean) {
    return { success: false, error: 'Target user is required' }
  }

  const appDb = getDb(db)
  const target = await appDb
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(or(eq(users.id, clean), eq(users.email, clean)))
    .get()

  if (!target) {
    return { success: false, error: 'USER_NOT_FOUND' }
  }

  if (target.id === currentUserId) {
    return { success: false, error: 'CANNOT_FRIEND_SELF' }
  }

  const existing = await appDb
    .select({
      id: friendships.id,
      userId: friendships.userId,
      friendId: friendships.friendId,
      status: friendships.status,
    })
    .from(friendships)
    .where(
      or(
        and(eq(friendships.userId, currentUserId), eq(friendships.friendId, target.id)),
        and(eq(friendships.userId, target.id), eq(friendships.friendId, currentUserId)),
      ),
    )
    .get()

  const now = new Date().toISOString()

  if (existing) {
    if (existing.status === 'accepted') {
      return { success: false, error: 'ALREADY_FRIENDS' }
    }
    if (existing.status === 'pending' && existing.userId === target.id) {
      await appDb.update(friendships).set({ status: 'accepted', updatedAt: now }).where(eq(friendships.id, existing.id))
      return { success: true, status: 'accepted', friendshipId: existing.id }
    }
    if (existing.status === 'pending' && existing.userId === currentUserId) {
      return { success: false, error: 'REQUEST_ALREADY_SENT', friendshipId: existing.id }
    }
  }

  const friendshipId = crypto.randomUUID()
  await appDb.insert(friendships).values({
    id: friendshipId,
    userId: currentUserId,
    friendId: target.id,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  })

  return { success: true, status: 'pending', friendshipId }
}

export const acceptFriendRequest = async (db: D1Database, currentUserId: string, friendshipId: string): Promise<boolean> => {
  const appDb = getDb(db)
  const now = new Date().toISOString()
  const res = await appDb
    .update(friendships)
    .set({ status: 'accepted', updatedAt: now })
    .where(and(eq(friendships.id, friendshipId), eq(friendships.friendId, currentUserId), eq(friendships.status, 'pending')))
    .run()

  return (res.meta.changes ?? 0) > 0
}

export const declineFriendRequest = async (db: D1Database, currentUserId: string, friendshipId: string): Promise<boolean> => {
  const appDb = getDb(db)
  const res = await appDb
    .delete(friendships)
    .where(
      and(
        eq(friendships.id, friendshipId),
        or(eq(friendships.friendId, currentUserId), eq(friendships.userId, currentUserId)),
        eq(friendships.status, 'pending'),
      ),
    )
    .run()

  return (res.meta.changes ?? 0) > 0
}

export const removeFriend = async (db: D1Database, currentUserId: string, friendId: string): Promise<boolean> => {
  const appDb = getDb(db)
  const res = await appDb
    .delete(friendships)
    .where(
      or(
        and(eq(friendships.userId, currentUserId), eq(friendships.friendId, friendId)),
        and(eq(friendships.userId, friendId), eq(friendships.friendId, currentUserId)),
      ),
    )
    .run()

  return (res.meta.changes ?? 0) > 0
}

export const assignTaskToFriend = async (
  db: D1Database,
  currentUserId: string,
  currentUserEmail: string,
  friendId: string,
  task: { title: string; date?: string; priority?: TaskPriority; note?: string },
): Promise<{ success: boolean; task?: ProductivityItem; error?: string }> => {
  const appDb = getDb(db)
  const friendship = await appDb
    .select({ id: friendships.id })
    .from(friendships)
    .where(
      and(
        or(
          and(eq(friendships.userId, currentUserId), eq(friendships.friendId, friendId)),
          and(eq(friendships.userId, friendId), eq(friendships.friendId, currentUserId)),
        ),
        eq(friendships.status, 'accepted'),
      ),
    )
    .get()

  if (!friendship) {
    return { success: false, error: 'NOT_FRIENDS' }
  }

  const friendSettings = await appDb
    .select({ allowFriendTasks: settings.allowFriendTasks })
    .from(settings)
    .where(eq(settings.userId, friendId))
    .get()

  if (friendSettings && friendSettings.allowFriendTasks === 0) {
    return { success: false, error: 'FRIEND_TASKS_DISABLED' }
  }

  const cleanTitle = task.title.trim()
  if (!cleanTitle) {
    return { success: false, error: 'TITLE_REQUIRED' }
  }

  const taskId = crypto.randomUUID()
  const createdAt = new Date().toISOString()
  const priority = task.priority || 'medium'
  const note = task.note || ''
  const date = task.date || ''

  await appDb.insert(productivityItems).values({
    id: taskId,
    userId: friendId,
    kind: 'task',
    title: cleanTitle,
    date,
    repeat: 'none',
    done: 0,
    doneAt: null,
    priority,
    note,
    senderId: currentUserId,
    senderName: currentUserEmail,
    createdAt,
  })

  return {
    success: true,
    task: {
      id: taskId,
      kind: 'task',
      title: cleanTitle,
      date,
      repeat: 'none',
      done: false,
      doneAt: null,
      priority,
      note,
      senderId: currentUserId,
      senderName: currentUserEmail,
      createdAt,
    },
  }
}

export const getSentFriendTasks = async (db: D1Database, currentUserId: string): Promise<SentFriendTask[]> => {
  const appDb = getDb(db)
  const rows = await appDb
    .select({
      id: productivityItems.id,
      recipientId: productivityItems.userId,
      recipientEmail: users.email,
      title: productivityItems.title,
      date: productivityItems.date,
      done: productivityItems.done,
      doneAt: productivityItems.doneAt,
      priority: productivityItems.priority,
      note: productivityItems.note,
      createdAt: productivityItems.createdAt,
    })
    .from(productivityItems)
    .innerJoin(users, eq(productivityItems.userId, users.id))
    .where(and(eq(productivityItems.senderId, currentUserId), ne(productivityItems.userId, currentUserId)))
    .orderBy(desc(productivityItems.createdAt))
    .limit(50)

  return rows.map((row) => ({
    id: row.id,
    recipientId: row.recipientId,
    recipientEmail: row.recipientEmail,
    title: row.title,
    date: row.date,
    done: Boolean(row.done),
    doneAt: row.doneAt,
    priority: (row.priority as TaskPriority) || undefined,
    note: row.note || undefined,
    createdAt: row.createdAt,
  }))
}
