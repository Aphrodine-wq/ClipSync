-- Migration: Add Clipboard Shortcuts
-- Hotkey assignment to favorite clips

CREATE TABLE IF NOT EXISTS clipboard_shortcuts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    clip_id UUID NOT NULL REFERENCES clips(id) ON DELETE CASCADE,
    shortcut VARCHAR(50) NOT NULL, -- e.g., "Ctrl+Shift+1"
    device_type VARCHAR(50), -- 'desktop', 'browser', 'mobile'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, shortcut, device_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clipboard_shortcuts_user_id ON clipboard_shortcuts(user_id);
CREATE INDEX IF NOT EXISTS idx_clipboard_shortcuts_clip_id ON clipboard_shortcuts(clip_id);
CREATE INDEX IF NOT EXISTS idx_clipboard_shortcuts_shortcut ON clipboard_shortcuts(shortcut);
CREATE INDEX IF NOT EXISTS idx_clipboard_shortcuts_is_active ON clipboard_shortcuts(is_active) WHERE is_active = TRUE;

-- Add trigger for updated_at
CREATE TRIGGER update_clipboard_shortcuts_updated_at BEFORE UPDATE ON clipboard_shortcuts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

