ALTER TABLE settings ADD COLUMN allow_friend_tasks INTEGER NOT NULL DEFAULT 1;

ALTER TABLE productivity_items ADD COLUMN sender_id TEXT;
ALTER TABLE productivity_items ADD COLUMN sender_name TEXT;

CREATE TABLE friendships (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(user_id, friend_id)
);

CREATE INDEX idx_friendships_user ON friendships(user_id);
CREATE INDEX idx_friendships_friend ON friendships(friend_id);
CREATE INDEX idx_friendships_status ON friendships(status);
