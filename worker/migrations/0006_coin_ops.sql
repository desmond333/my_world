-- Server-authoritative coin ledger: idempotent earn operations
CREATE TABLE IF NOT EXISTS shop_coin_ops (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  amount INTEGER NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_shop_coin_ops_user_day ON shop_coin_ops(user_id, created_at);
