import type { FriendItem, FriendRequest, FriendsData, ProductivityItem, SentFriendTask, TaskPriority } from '../../types'

type FriendRow = {
  friendship_id: string
  other_id: string
  email: string
  created_at: string
  allow_friend_tasks: number | null
}

type IncomingRow = {
  friendship_id: string
  sender_id: string
  email: string
  created_at: string
}

type OutgoingRow = {
  friendship_id: string
  receiver_id: string
  email: string
  created_at: string
}

type UserSearchRow = {
  id: string
  email: string
}

type FriendshipRow = {
  id: string
  user_id: string
  friend_id: string
  status: string
}

type SentTaskRow = {
  id: string
  recipient_id: string
  recipient_email: string
  title: string
  date: string
  done: number
  done_at: string | null
  priority: string | null
  note: string
  created_at: string
}

export const getFriendsData = async (db: D1Database, userId: string): Promise<FriendsData> => {
  const friendsQuery = `
    SELECT 
      f.id as friendship_id,
      f.created_at,
      CASE WHEN f.user_id = ? THEN f.friend_id ELSE f.user_id END as other_id,
      u.email,
      s.allow_friend_tasks
    FROM friendships f
    JOIN users u ON u.id = (CASE WHEN f.user_id = ? THEN f.friend_id ELSE f.user_id END)
    LEFT JOIN settings s ON s.user_id = u.id
    WHERE (f.user_id = ? OR f.friend_id = ?) AND f.status = 'accepted'
    ORDER BY u.email ASC
  `

  const incomingQuery = `
    SELECT 
      f.id as friendship_id,
      f.user_id as sender_id,
      f.created_at,
      u.email
    FROM friendships f
    JOIN users u ON u.id = f.user_id
    WHERE f.friend_id = ? AND f.status = 'pending'
    ORDER BY f.created_at DESC
  `

  const outgoingQuery = `
    SELECT 
      f.id as friendship_id,
      f.friend_id as receiver_id,
      f.created_at,
      u.email
    FROM friendships f
    JOIN users u ON u.id = f.friend_id
    WHERE f.user_id = ? AND f.status = 'pending'
    ORDER BY f.created_at DESC
  `

  const [friendsRes, incomingRes, outgoingRes] = await Promise.all([
    db.prepare(friendsQuery).bind(userId, userId, userId, userId).all<FriendRow>(),
    db.prepare(incomingQuery).bind(userId).all<IncomingRow>(),
    db.prepare(outgoingQuery).bind(userId).all<OutgoingRow>(),
  ])

  const friends: FriendItem[] = friendsRes.results.map((row) => ({
    id: row.other_id,
    friendshipId: row.friendship_id,
    email: row.email,
    allowFriendTasks: row.allow_friend_tasks === null || row.allow_friend_tasks === undefined ? true : Boolean(row.allow_friend_tasks),
    createdAt: row.created_at,
  }))

  const incoming: FriendRequest[] = incomingRes.results.map((row) => ({
    id: row.sender_id,
    friendshipId: row.friendship_id,
    email: row.email,
    createdAt: row.created_at,
  }))

  const outgoing: FriendRequest[] = outgoingRes.results.map((row) => ({
    id: row.receiver_id,
    friendshipId: row.friendship_id,
    email: row.email,
    createdAt: row.created_at,
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

  const users = await db
    .prepare('SELECT id, email FROM users WHERE email LIKE ? AND id != ? LIMIT 15')
    .bind(`%${clean}%`, currentUserId)
    .all<UserSearchRow>()

  if (!users.results.length) return []

  const userIds = users.results.map((u) => u.id)
  const placeholders = userIds.map(() => '?').join(',')

  const friendships = await db
    .prepare(
      `SELECT id, user_id, friend_id, status FROM friendships
       WHERE (user_id = ? AND friend_id IN (${placeholders}))
          OR (friend_id = ? AND user_id IN (${placeholders}))`,
    )
    .bind(currentUserId, ...userIds, currentUserId, ...userIds)
    .all<FriendshipRow>()

  const map = new Map<string, { status: string; id: string; isSender: boolean }>()
  for (const f of friendships.results) {
    const otherId = f.user_id === currentUserId ? f.friend_id : f.user_id
    map.set(otherId, { status: f.status, id: f.id, isSender: f.user_id === currentUserId })
  }

  return users.results.map((user) => {
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

  const target = await db.prepare('SELECT id, email FROM users WHERE id = ? OR email = ?').bind(clean, clean).first<UserSearchRow>()

  if (!target) {
    return { success: false, error: 'USER_NOT_FOUND' }
  }

  if (target.id === currentUserId) {
    return { success: false, error: 'CANNOT_FRIEND_SELF' }
  }

  const existing = await db
    .prepare(
      'SELECT id, user_id, friend_id, status FROM friendships WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)',
    )
    .bind(currentUserId, target.id, target.id, currentUserId)
    .first<FriendshipRow>()

  const now = new Date().toISOString()

  if (existing) {
    if (existing.status === 'accepted') {
      return { success: false, error: 'ALREADY_FRIENDS' }
    }
    if (existing.status === 'pending' && existing.user_id === target.id) {
      await db.prepare('UPDATE friendships SET status = ?, updated_at = ? WHERE id = ?').bind('accepted', now, existing.id).run()
      return { success: true, status: 'accepted', friendshipId: existing.id }
    }
    if (existing.status === 'pending' && existing.user_id === currentUserId) {
      return { success: false, error: 'REQUEST_ALREADY_SENT', friendshipId: existing.id }
    }
  }

  const friendshipId = crypto.randomUUID()
  await db
    .prepare('INSERT INTO friendships (id, user_id, friend_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(friendshipId, currentUserId, target.id, 'pending', now, now)
    .run()

  return { success: true, status: 'pending', friendshipId }
}

export const acceptFriendRequest = async (db: D1Database, currentUserId: string, friendshipId: string): Promise<boolean> => {
  const now = new Date().toISOString()
  const res = await db
    .prepare('UPDATE friendships SET status = ?, updated_at = ? WHERE id = ? AND friend_id = ? AND status = ?')
    .bind('accepted', now, friendshipId, currentUserId, 'pending')
    .run()

  return (res.meta.changes ?? 0) > 0
}

export const declineFriendRequest = async (db: D1Database, currentUserId: string, friendshipId: string): Promise<boolean> => {
  const res = await db
    .prepare('DELETE FROM friendships WHERE id = ? AND (friend_id = ? OR user_id = ?) AND status = ?')
    .bind(friendshipId, currentUserId, currentUserId, 'pending')
    .run()

  return (res.meta.changes ?? 0) > 0
}

export const removeFriend = async (db: D1Database, currentUserId: string, friendId: string): Promise<boolean> => {
  const res = await db
    .prepare('DELETE FROM friendships WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)')
    .bind(currentUserId, friendId, friendId, currentUserId)
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
  const friendship = await db
    .prepare(
      `SELECT id FROM friendships 
       WHERE ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)) 
         AND status = 'accepted'`,
    )
    .bind(currentUserId, friendId, friendId, currentUserId)
    .first<{ id: string }>()

  if (!friendship) {
    return { success: false, error: 'NOT_FRIENDS' }
  }

  const friendSettings = await db
    .prepare('SELECT allow_friend_tasks FROM settings WHERE user_id = ?')
    .bind(friendId)
    .first<{ allow_friend_tasks: number | null }>()

  if (friendSettings && friendSettings.allow_friend_tasks === 0) {
    return { success: false, error: 'FRIEND_TASKS_DISABLED' }
  }

  const taskId = crypto.randomUUID()
  const createdAt = new Date().toISOString()
  const cleanTitle = task.title.trim()
  if (!cleanTitle) {
    return { success: false, error: 'TITLE_REQUIRED' }
  }

  const priority = task.priority || 'medium'
  const note = task.note || ''
  const date = task.date || ''

  await db
    .prepare(
      `INSERT INTO productivity_items (id, user_id, kind, title, date, repeat, done, done_at, priority, note, sender_id, sender_name, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(taskId, friendId, 'task', cleanTitle, date, 'none', 0, null, priority, note, currentUserId, currentUserEmail, createdAt)
    .run()

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
  const query = `
    SELECT 
      p.id,
      p.user_id as recipient_id,
      u.email as recipient_email,
      p.title,
      p.date,
      p.done,
      p.done_at,
      p.priority,
      p.note,
      p.created_at
    FROM productivity_items p
    JOIN users u ON p.user_id = u.id
    WHERE p.sender_id = ? AND p.user_id != ?
    ORDER BY p.created_at DESC
    LIMIT 50
  `

  const { results } = await db.prepare(query).bind(currentUserId, currentUserId).all<SentTaskRow>()

  return results.map((row) => ({
    id: row.id,
    recipientId: row.recipient_id,
    recipientEmail: row.recipient_email,
    title: row.title,
    date: row.date,
    done: Boolean(row.done),
    doneAt: row.done_at,
    priority: (row.priority as TaskPriority) || undefined,
    note: row.note || undefined,
    createdAt: row.created_at,
  }))
}
