CREATE TABLE availability_windows (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scope TEXT NOT NULL DEFAULT 'weekly',
  day_of_week INTEGER,
  date TEXT,
  start_min INTEGER NOT NULL,
  end_min INTEGER NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_availability_windows_user ON availability_windows(user_id);
CREATE INDEX idx_availability_windows_user_day ON availability_windows(user_id, day_of_week);
CREATE INDEX idx_availability_windows_user_date ON availability_windows(user_id, date);
