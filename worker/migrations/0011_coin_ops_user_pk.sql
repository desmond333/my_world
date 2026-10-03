PRAGMA foreign_keys=OFF;

CREATE TABLE IF NOT EXISTS shop_coin_ops_new (
  id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  amount INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (user_id, id)
);

INSERT OR IGNORE INTO shop_coin_ops_new (id, user_id, reason, amount, created_at)
  SELECT id, user_id, reason, amount, created_at FROM shop_coin_ops;

DROP TABLE shop_coin_ops;

ALTER TABLE shop_coin_ops_new RENAME TO shop_coin_ops;

CREATE INDEX IF NOT EXISTS idx_shop_coin_ops_user_day ON shop_coin_ops(user_id, created_at);

PRAGMA foreign_keys=ON;
