-- Premium accounts: flag on users (admin is always premium)
ALTER TABLE users ADD COLUMN is_premium INTEGER NOT NULL DEFAULT 0;
