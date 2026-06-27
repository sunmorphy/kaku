-- Create animations table for video batch content
-- Similar to projects but exclusively for videos

CREATE TABLE IF NOT EXISTS animations (
    id SERIAL PRIMARY KEY,
    batch_video_path TEXT[] NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Junction table for animation categories (many-to-many)
CREATE TABLE IF NOT EXISTS animation_categories (
    animation_id INTEGER NOT NULL REFERENCES animations(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (animation_id, category_id)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_animations_created_at ON animations(created_at);
CREATE INDEX IF NOT EXISTS idx_animations_user_id ON animations(user_id);
