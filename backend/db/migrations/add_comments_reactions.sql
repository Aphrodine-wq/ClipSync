-- Migration: Add Comments and Reactions
-- Social features for clips

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clip_id UUID REFERENCES clips(id) ON DELETE CASCADE,
    team_clip_id UUID REFERENCES team_clips(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- For threaded comments
    mentions UUID[], -- Array of user IDs mentioned
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CHECK (clip_id IS NOT NULL OR team_clip_id IS NOT NULL)
);

-- Reactions table
CREATE TABLE IF NOT EXISTS reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clip_id UUID REFERENCES clips(id) ON DELETE CASCADE,
    team_clip_id UUID REFERENCES team_clips(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emoji VARCHAR(10) NOT NULL, -- e.g., '👍', '❤️', '🚀'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(clip_id, user_id, emoji) WHERE clip_id IS NOT NULL AND comment_id IS NULL,
    UNIQUE(team_clip_id, user_id, emoji) WHERE team_clip_id IS NOT NULL AND comment_id IS NULL,
    UNIQUE(comment_id, user_id, emoji) WHERE comment_id IS NOT NULL,
    CHECK (
        (clip_id IS NOT NULL AND team_clip_id IS NULL AND comment_id IS NULL) OR
        (team_clip_id IS NOT NULL AND clip_id IS NULL AND comment_id IS NULL) OR
        (comment_id IS NOT NULL AND clip_id IS NULL AND team_clip_id IS NULL)
    )
);

-- Presence table (for live collaboration)
CREATE TABLE IF NOT EXISTS presence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    clip_id UUID REFERENCES clips(id) ON DELETE CASCADE,
    cursor_position JSONB, -- {x, y} or {line, column} for code
    active_clip_id UUID, -- Currently viewing/editing clip
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'away', 'offline'
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB, -- Additional presence data
    UNIQUE(user_id, team_id, clip_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_comments_clip_id ON comments(clip_id);
CREATE INDEX IF NOT EXISTS idx_comments_team_clip_id ON comments(team_clip_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reactions_clip_id ON reactions(clip_id);
CREATE INDEX IF NOT EXISTS idx_reactions_team_clip_id ON reactions(team_clip_id);
CREATE INDEX IF NOT EXISTS idx_reactions_comment_id ON reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON reactions(user_id);

CREATE INDEX IF NOT EXISTS idx_presence_user_id ON presence(user_id);
CREATE INDEX IF NOT EXISTS idx_presence_team_id ON presence(team_id);
CREATE INDEX IF NOT EXISTS idx_presence_clip_id ON presence(clip_id);
CREATE INDEX IF NOT EXISTS idx_presence_last_seen ON presence(last_seen);

-- Add trigger for updated_at
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

