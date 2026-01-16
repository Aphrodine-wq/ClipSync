-- Migration: Add Clipboard Spaces/Workspaces
-- Allows users to organize clips into different workspaces

CREATE TABLE IF NOT EXISTS spaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7), -- Hex color code
    icon VARCHAR(50),
    position INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, name)
);

-- Add space_id to clips table
ALTER TABLE clips
ADD COLUMN IF NOT EXISTS space_id UUID REFERENCES spaces(id) ON DELETE SET NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_spaces_user_id ON spaces(user_id);
CREATE INDEX IF NOT EXISTS idx_spaces_is_default ON spaces(is_default) WHERE is_default = TRUE;
CREATE INDEX IF NOT EXISTS idx_clips_space_id ON clips(space_id);

-- Set default space for existing users
INSERT INTO spaces (user_id, name, is_default, color)
SELECT DISTINCT id, 'Default', TRUE, '#6366f1'
FROM users
ON CONFLICT (user_id, name) DO NOTHING;

-- Update existing clips to use default space
UPDATE clips c
SET space_id = (
    SELECT id FROM spaces s
    WHERE s.user_id = c.user_id AND s.is_default = TRUE
    LIMIT 1
)
WHERE c.space_id IS NULL;

-- Add trigger for updated_at
CREATE TRIGGER update_spaces_updated_at BEFORE UPDATE ON spaces
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

