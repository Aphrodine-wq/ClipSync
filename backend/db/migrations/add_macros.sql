-- Migration: Add Clipboard Macros
-- Record and replay clipboard sequences

CREATE TABLE IF NOT EXISTS macros (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    actions JSONB NOT NULL, -- Array of actions (copy, paste, transform, etc.)
    is_public BOOLEAN DEFAULT FALSE, -- Can be shared with others
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS macro_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    macro_id UUID NOT NULL REFERENCES macros(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shared_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(macro_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_macros_user_id ON macros(user_id);
CREATE INDEX IF NOT EXISTS idx_macros_is_public ON macros(is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_macro_shares_user_id ON macro_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_macro_shares_macro_id ON macro_shares(macro_id);

-- Add trigger for updated_at
CREATE TRIGGER update_macros_updated_at BEFORE UPDATE ON macros
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

