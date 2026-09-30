CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TEXT NOT NULL
);

CREATE TABLE refresh_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE TABLE settings (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  lang TEXT NOT NULL DEFAULT 'ru',
  theme_mode TEXT NOT NULL DEFAULT 'system',
  city_id TEXT NOT NULL DEFAULT 'moscow',
  scope TEXT NOT NULL DEFAULT 'all',
  extra_tab INTEGER NOT NULL DEFAULT 0,
  start_page TEXT NOT NULL DEFAULT '/today',
  blocks_json TEXT NOT NULL DEFAULT '{}'
);

CREATE TABLE training_days (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  sports_json TEXT NOT NULL DEFAULT '[]',
  UNIQUE(user_id, date)
);

CREATE TABLE training_sports (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  color TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  custom INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE finance_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  kind TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE TABLE finance_balance (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  rub REAL NOT NULL DEFAULT 0,
  usd REAL NOT NULL DEFAULT 0,
  gel REAL NOT NULL DEFAULT 0
);

CREATE TABLE finance_rates (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  rub REAL NOT NULL DEFAULT 1,
  usd REAL NOT NULL DEFAULT 90,
  gel REAL NOT NULL DEFAULT 33,
  source TEXT NOT NULL DEFAULT 'default',
  updated_at TEXT
);

CREATE TABLE productivity_items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  date TEXT NOT NULL DEFAULT '',
  repeat TEXT NOT NULL DEFAULT 'none',
  done INTEGER NOT NULL DEFAULT 0,
  done_at TEXT,
  priority TEXT,
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE TABLE productivity_months (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month_key TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  task_count INTEGER NOT NULL DEFAULT 0,
  goal_count INTEGER NOT NULL DEFAULT 0,
  dream_count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(user_id, month_key)
);

CREATE TABLE productivity_mood (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  level INTEGER NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  PRIMARY KEY(user_id, date)
);

CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  currency TEXT NOT NULL,
  period TEXT NOT NULL,
  started_at TEXT NOT NULL,
  until TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT ''
);

CREATE TABLE birthdays (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date TEXT NOT NULL
);

CREATE TABLE own_birthday (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  date TEXT NOT NULL
);

CREATE TABLE collection_items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  collection TEXT NOT NULL,
  list_key TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  year INTEGER,
  tags_json TEXT NOT NULL DEFAULT '[]',
  score TEXT,
  added_at TEXT NOT NULL,
  finished_at TEXT,
  review TEXT,
  enjoyment INTEGER,
  enjoyment_reaction TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE favorites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  animal_id TEXT NOT NULL,
  name TEXT NOT NULL,
  breed TEXT NOT NULL,
  image TEXT NOT NULL,
  added_at TEXT NOT NULL
);

CREATE TABLE lottery_stats (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sector_id TEXT NOT NULL,
  spins INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  earned REAL NOT NULL DEFAULT 0,
  PRIMARY KEY(user_id, sector_id)
);

CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'note',
  title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE shop_state (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  coins INTEGER NOT NULL DEFAULT 1000,
  unlocked_parts_json TEXT NOT NULL DEFAULT '{}',
  active_cat_skin TEXT NOT NULL DEFAULT 'classic',
  active_theme_skin TEXT NOT NULL DEFAULT 'default',
  greeting_sent INTEGER NOT NULL DEFAULT 0,
  greeting_friend_name TEXT NOT NULL DEFAULT '',
  greeting_timestamp INTEGER,
  greeting_reward_claimed INTEGER NOT NULL DEFAULT 0,
  has_pending_greeting_reply INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE view_modes (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  global_mode TEXT NOT NULL DEFAULT 'simple',
  page_modes_json TEXT NOT NULL DEFAULT '{}',
  avatar_mode TEXT NOT NULL DEFAULT 'simple'
);
