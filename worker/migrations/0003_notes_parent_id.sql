ALTER TABLE notes ADD COLUMN parent_id TEXT;
ALTER TABLE notes ADD COLUMN icon TEXT;

CREATE INDEX idx_notes_parent ON notes(parent_id);
