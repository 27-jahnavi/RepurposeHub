PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    location      TEXT NOT NULL,
    created_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS items (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    category      TEXT NOT NULL,
    condition     TEXT NOT NULL,
    action        TEXT NOT NULL,
    location      TEXT NOT NULL,
    description   TEXT NOT NULL,
    owner_id      TEXT REFERENCES users(id) ON DELETE SET NULL,
    owner_name    TEXT NOT NULL,
    owner_contact TEXT,
    image         TEXT,
    art           INTEGER NOT NULL DEFAULT 1,
    status        TEXT NOT NULL DEFAULT 'active',
    created_at    TEXT NOT NULL,
    demo          INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS requests (
    id           TEXT PRIMARY KEY,
    item_id      TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    from_user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    from_name    TEXT NOT NULL,
    from_email   TEXT NOT NULL,
    message      TEXT NOT NULL,
    status       TEXT NOT NULL DEFAULT 'pending',
    created_at   TEXT NOT NULL,
    UNIQUE (item_id, from_user_id)
);

CREATE INDEX IF NOT EXISTS idx_items_owner    ON items(owner_id);
CREATE INDEX IF NOT EXISTS idx_requests_item  ON requests(item_id);
CREATE INDEX IF NOT EXISTS idx_requests_from  ON requests(from_user_id);

CREATE TABLE IF NOT EXISTS ratings (
    id            TEXT PRIMARY KEY,
    item_id       TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    from_user_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_user_id    TEXT REFERENCES users(id) ON DELETE SET NULL,
    stars         INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),
    feedback      TEXT,
    created_at    TEXT NOT NULL,
    UNIQUE (item_id, from_user_id)
);

CREATE INDEX IF NOT EXISTS idx_ratings_to ON ratings(to_user_id);
