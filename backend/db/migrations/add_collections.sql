-- Migration: Add Smart Collections
-- AI-powered auto-grouping of clips

CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    clip_ids UUID[] NOT NULL, -- Array of clip IDs
    auto_generated BOOLEAN DEFAULT FALSE,
    metadata JSONB, -- Additional metadata (tags, type, timeRange, etc.)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_auto_generated ON collections(auto_generated) WHERE auto_generated = TRUE;

-- Add trigger for updated_at
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

