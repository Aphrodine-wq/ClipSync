-- ClipSync Database Schema

-- Enable UUID extension
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -- Users table
-- CREATE TABLE users (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     google_id VARCHAR(255) UNIQUE NOT NULL,
--     email VARCHAR(255) UNIQUE NOT NULL,
--     name VARCHAR(255),
--     picture TEXT,
--     plan VARCHAR(50) DEFAULT 'free', -- 'free', 'pro', 'team', 'enterprise'
--     failed_login_attempts INTEGER DEFAULT 0,
--     account_locked_until TIMESTAMP NULL,
--     two_factor_enabled BOOLEAN DEFAULT FALSE,
--     two_factor_secret VARCHAR(255) NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Login attempts table (for tracking failed logins)
-- CREATE TABLE login_attempts (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     user_id UUID REFERENCES users(id) ON DELETE CASCADE,
--     email VARCHAR(255) NOT NULL,
--     ip_address VARCHAR(45) NOT NULL,
--     user_agent TEXT,
--     success BOOLEAN DEFAULT FALSE,
--     failure_reason VARCHAR(255),
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- User sessions table (for session management)
-- CREATE TABLE user_sessions (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     token_hash VARCHAR(255) NOT NULL,
--     refresh_token_hash VARCHAR(255),
--     device_fingerprint VARCHAR(255),
--     ip_address VARCHAR(45),
--     user_agent TEXT,
--     expires_at TIMESTAMP NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Clips table
-- CREATE TABLE clips (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     content TEXT NOT NULL,
--     type VARCHAR(50) NOT NULL, -- 'text', 'code', 'json', 'url', etc.
--     encrypted BOOLEAN DEFAULT FALSE,
--     pinned BOOLEAN DEFAULT FALSE,
--     folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
--     metadata JSONB, -- Additional metadata (language, tags, etc.)
--     auto_categorized BOOLEAN DEFAULT FALSE,
--     category_confidence DECIMAL(3,2) DEFAULT 0.0,
--     template BOOLEAN DEFAULT FALSE,
--     template_placeholders JSONB,
--     expires_at TIMESTAMP NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     deleted_at TIMESTAMP NULL
-- );

-- -- Tags table
-- CREATE TABLE tags (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     name VARCHAR(100) NOT NULL,
--     color VARCHAR(7), -- Hex color code
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     UNIQUE(user_id, name)
-- );

-- -- Clip tags junction table
-- CREATE TABLE clip_tags (
--     clip_id UUID NOT NULL REFERENCES clips(id) ON DELETE CASCADE,
--     tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     PRIMARY KEY (clip_id, tag_id)
-- );

-- -- Categories table (user-defined categories)
-- CREATE TABLE categories (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     name VARCHAR(255) NOT NULL,
--     color VARCHAR(7), -- Hex color code
--     icon VARCHAR(50),
--     position INTEGER DEFAULT 0,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     UNIQUE(user_id, name)
-- );

-- -- Clip categories junction table
-- CREATE TABLE clip_categories (
--     clip_id UUID NOT NULL REFERENCES clips(id) ON DELETE CASCADE,
--     category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     PRIMARY KEY (clip_id, category_id)
-- );

-- -- Folders table (for organizing pinned clips)
-- CREATE TABLE folders (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     name VARCHAR(255) NOT NULL,
--     color VARCHAR(7), -- Hex color code
--     icon VARCHAR(50),
--     position INTEGER DEFAULT 0,
--     parent_id UUID REFERENCES folders(id) ON DELETE SET NULL, -- For nested folders
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Teams table
-- CREATE TABLE teams (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     name VARCHAR(255) NOT NULL,
--     owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     plan VARCHAR(50) DEFAULT 'team',
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Team members table
-- CREATE TABLE team_members (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
--     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     role VARCHAR(50) DEFAULT 'member', -- 'owner', 'admin', 'editor', 'viewer'
--     joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     UNIQUE(team_id, user_id)
-- );

-- -- Team clips table
-- CREATE TABLE team_clips (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
--     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     content TEXT NOT NULL,
--     type VARCHAR(50) NOT NULL,
--     encrypted BOOLEAN DEFAULT FALSE,
--     metadata JSONB,
--     expires_at TIMESTAMP NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     deleted_at TIMESTAMP NULL
-- );

-- -- Share links table
-- CREATE TABLE share_links (
--     id VARCHAR(12) PRIMARY KEY, -- Short nanoid
--     clip_id UUID REFERENCES clips(id) ON DELETE CASCADE,
--     team_clip_id UUID REFERENCES team_clips(id) ON DELETE CASCADE,
--     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     content TEXT NOT NULL,
--     type VARCHAR(50) NOT NULL,
--     password_hash VARCHAR(255) NULL,
--     expires_at TIMESTAMP NULL,
--     max_views INTEGER NULL,
--     view_count INTEGER DEFAULT 0,
--     one_time BOOLEAN DEFAULT FALSE,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     accessed_at TIMESTAMP NULL,
--     CHECK (clip_id IS NOT NULL OR team_clip_id IS NOT NULL)
-- );

-- -- Devices table (for sync tracking)
-- CREATE TABLE devices (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     device_name VARCHAR(255) NOT NULL,
--     device_type VARCHAR(50), -- 'browser', 'desktop', 'mobile', 'extension'
--     user_agent TEXT,
--     device_fingerprint VARCHAR(255),
--     last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     UNIQUE(user_id, device_name)
-- );

-- -- Activity log table (for teams)
-- CREATE TABLE activity_log (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
--     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'deleted', 'shared'
--     resource_type VARCHAR(50) NOT NULL, -- 'clip', 'member', 'team'
--     resource_id UUID,
--     metadata JSONB,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Audit logs table (for security and compliance)
-- CREATE TABLE audit_logs (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     user_id UUID REFERENCES users(id) ON DELETE SET NULL,
--     team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
--     action VARCHAR(100) NOT NULL, -- 'clip_created', 'login_success', etc.
--     resource_type VARCHAR(50), -- 'clip', 'auth', 'security', 'team', etc.
--     resource_id UUID,
--     metadata JSONB,
--     ip_address VARCHAR(45), -- IPv6 compatible
--     user_agent TEXT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Subscriptions table
-- CREATE TABLE subscriptions (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
--     stripe_customer_id VARCHAR(255) UNIQUE,
--     stripe_subscription_id VARCHAR(255) UNIQUE,
--     plan VARCHAR(50) NOT NULL,
--     status VARCHAR(50) NOT NULL, -- 'active', 'canceled', 'past_due', 'trialing'
--     current_period_start TIMESTAMP,
--     current_period_end TIMESTAMP,
--     cancel_at_period_end BOOLEAN DEFAULT FALSE,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Indexes for performance
-- CREATE INDEX idx_clips_user_id ON clips(user_id);
-- CREATE INDEX idx_clips_created_at ON clips(created_at DESC);
-- CREATE INDEX idx_clips_type ON clips(type);
-- CREATE INDEX idx_clips_pinned ON clips(pinned) WHERE pinned = TRUE;
-- CREATE INDEX idx_clips_deleted_at ON clips(deleted_at) WHERE deleted_at IS NULL;

-- CREATE INDEX idx_team_clips_team_id ON team_clips(team_id);
-- CREATE INDEX idx_team_clips_created_at ON team_clips(created_at DESC);
-- CREATE INDEX idx_team_clips_deleted_at ON team_clips(deleted_at) WHERE deleted_at IS NULL;

-- CREATE INDEX idx_team_members_team_id ON team_members(team_id);
-- CREATE INDEX idx_team_members_user_id ON team_members(user_id);

-- CREATE INDEX idx_share_links_expires_at ON share_links(expires_at);
-- CREATE INDEX idx_share_links_user_id ON share_links(user_id);

-- CREATE INDEX idx_devices_user_id ON devices(user_id);
-- CREATE INDEX idx_devices_last_sync ON devices(last_sync DESC);

-- CREATE INDEX idx_activity_log_team_id ON activity_log(team_id);
-- CREATE INDEX idx_activity_log_created_at ON activity_log(created_at DESC);

-- -- Indexes for audit logs
-- CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
-- CREATE INDEX idx_audit_logs_team_id ON audit_logs(team_id);
-- CREATE INDEX idx_audit_logs_action ON audit_logs(action);
-- CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
-- CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
-- CREATE INDEX idx_audit_logs_ip_address ON audit_logs(ip_address);

-- -- Indexes for login attempts and sessions
-- CREATE INDEX idx_login_attempts_user_id ON login_attempts(user_id);
-- CREATE INDEX idx_login_attempts_email ON login_attempts(email);
-- CREATE INDEX idx_login_attempts_ip_address ON login_attempts(ip_address);
-- CREATE INDEX idx_login_attempts_created_at ON login_attempts(created_at DESC);

-- CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
-- CREATE INDEX idx_user_sessions_token_hash ON user_sessions(token_hash);
-- CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
-- CREATE INDEX idx_user_sessions_device_fingerprint ON user_sessions(device_fingerprint);

-- -- Indexes for tags and categories
-- CREATE INDEX idx_tags_user_id ON tags(user_id);
-- CREATE INDEX idx_tags_name ON tags(name);
-- CREATE INDEX idx_clip_tags_clip_id ON clip_tags(clip_id);
-- CREATE INDEX idx_clip_tags_tag_id ON clip_tags(tag_id);

-- CREATE INDEX idx_categories_user_id ON categories(user_id);
-- CREATE INDEX idx_categories_name ON categories(name);
-- CREATE INDEX idx_clip_categories_clip_id ON clip_categories(clip_id);
-- CREATE INDEX idx_clip_categories_category_id ON clip_categories(category_id);

-- CREATE INDEX idx_folders_user_id ON folders(user_id);
-- CREATE INDEX idx_folders_parent_id ON folders(parent_id);

-- -- Indexes for new clip features
-- CREATE INDEX idx_clips_template ON clips(template) WHERE template = TRUE;
-- CREATE INDEX idx_clips_expires_at ON clips(expires_at) WHERE expires_at IS NOT NULL;

-- -- Analytics table
-- CREATE TABLE IF NOT EXISTS clip_analytics (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     date DATE NOT NULL,
--     clip_count INTEGER DEFAULT 0,
--     total_characters BIGINT DEFAULT 0,
--     peak_hour INTEGER,
--     top_domains JSONB,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     UNIQUE(user_id, date)
-- );

-- CREATE INDEX idx_clip_analytics_user_date ON clip_analytics(user_id, date DESC);

-- -- Triggers for updated_at
-- CREATE OR REPLACE FUNCTION update_updated_at_column()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     NEW.updated_at = CURRENT_TIMESTAMP;
--     RETURN NEW;
-- END;
-- $$ language 'plpgsql';

-- CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
--     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- CREATE TRIGGER update_clips_updated_at BEFORE UPDATE ON clips
--     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON folders
--     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
--     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- CREATE TRIGGER update_team_clips_updated_at BEFORE UPDATE ON team_clips
--     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
--     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
--     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON folders
--     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255), 
    picture TEXT,
    password_hash VARCHAR(255) NOT NULL, -- Hashed password for OAuth 
    plan VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL, -- Soft delete
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL, -- Soft delete
);

CREATE INDEX idx_clips_user_id ON clips(user_id);
CREATE INDEX idx_clips_created_at ON clips(created_at DESC);
CREATE INDEX idx_clips_category_id ON clips(category_id);

CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL, -- Soft delete
    UNIQUE(owner_id, name) -- Unique team name per owner
);

CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, user_id) -- Unique team membership
);

CREATE INDEX idx_team_members_team_id ON team_members(team_id);

CREATE TABLE team_clips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL, -- Soft delete
);

CREATE INDEX idx_team_clips_team_id ON team_clips(team_id);
CREATE INDEX idx_team_clips_created_at ON team_clips(created_at DESC);

CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_name VARCHAR(255) NOT NULL,
    device_type TEXT CHECK (device_type IN ('browser', 'desktop', 'mobile', 'extension')),
    last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL, -- Soft delete
    UNIQUE(user_id, device_name)
);

CREATE INDEX idx_devices_user_id ON devices(user_id);

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7),
    icon VARCHAR(50),
    position INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name)
);

CREATE TABLE pinned_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, category_id)
);