-- Migration: Add Rich Content Support
-- Adds support for images, files, and rich text content

-- Add new columns to clips table
ALTER TABLE clips
ADD COLUMN IF NOT EXISTS content_type VARCHAR(50) DEFAULT 'text', -- 'text', 'image', 'file', 'rich_text'
ADD COLUMN IF NOT EXISTS file_data JSONB, -- Stores file reference (S3 key, base64, or file path)
ADD COLUMN IF NOT EXISTS file_size BIGINT, -- File size in bytes
ADD COLUMN IF NOT EXISTS file_name VARCHAR(255), -- Original file name
ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100), -- MIME type (e.g., 'image/png', 'application/pdf')
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT, -- URL to thumbnail for images
ADD COLUMN IF NOT EXISTS width INTEGER, -- Image width (for images)
ADD COLUMN IF NOT EXISTS height INTEGER; -- Image height (for images)

-- Add index for content_type
CREATE INDEX IF NOT EXISTS idx_clips_content_type ON clips(content_type);

-- Add index for file_size (for filtering large files)
CREATE INDEX IF NOT EXISTS idx_clips_file_size ON clips(file_size) WHERE file_size IS NOT NULL;

-- Update existing clips to have content_type 'text'
UPDATE clips SET content_type = 'text' WHERE content_type IS NULL;

-- Add similar columns to team_clips
ALTER TABLE team_clips
ADD COLUMN IF NOT EXISTS content_type VARCHAR(50) DEFAULT 'text',
ADD COLUMN IF NOT EXISTS file_data JSONB,
ADD COLUMN IF NOT EXISTS file_size BIGINT,
ADD COLUMN IF NOT EXISTS file_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS width INTEGER,
ADD COLUMN IF NOT EXISTS height INTEGER;

CREATE INDEX IF NOT EXISTS idx_team_clips_content_type ON team_clips(content_type);

-- Create file storage table for tracking uploaded files
CREATE TABLE IF NOT EXISTS file_storage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    clip_id UUID REFERENCES clips(id) ON DELETE CASCADE,
    team_clip_id UUID REFERENCES team_clips(id) ON DELETE CASCADE,
    storage_type VARCHAR(50) NOT NULL, -- 's3', 'local', 'base64'
    storage_key TEXT NOT NULL, -- S3 key, file path, or base64 data
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    checksum VARCHAR(64), -- SHA-256 checksum
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accessed_at TIMESTAMP,
    expires_at TIMESTAMP,
    CHECK (clip_id IS NOT NULL OR team_clip_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_file_storage_user_id ON file_storage(user_id);
CREATE INDEX IF NOT EXISTS idx_file_storage_clip_id ON file_storage(clip_id);
CREATE INDEX IF NOT EXISTS idx_file_storage_team_clip_id ON file_storage(team_clip_id);
CREATE INDEX IF NOT EXISTS idx_file_storage_expires_at ON file_storage(expires_at) WHERE expires_at IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN clips.content_type IS 'Type of content: text, image, file, or rich_text';
COMMENT ON COLUMN clips.file_data IS 'JSON object with file storage information';
COMMENT ON COLUMN clips.file_size IS 'File size in bytes';
COMMENT ON COLUMN clips.file_name IS 'Original file name';
COMMENT ON COLUMN clips.mime_type IS 'MIME type of the file';
COMMENT ON COLUMN clips.thumbnail_url IS 'URL to thumbnail image (for images)';
COMMENT ON COLUMN clips.width IS 'Image width in pixels';
COMMENT ON COLUMN clips.height IS 'Image height in pixels';

