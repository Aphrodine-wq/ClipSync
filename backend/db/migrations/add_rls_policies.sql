-- Row-Level Security (RLS) Policies for ClipSync
-- Ensures users can only access their own data

-- Enable RLS on all user data tables
ALTER TABLE clips ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Clips: Users can only see their own clips
CREATE POLICY clips_user_isolation ON clips
  FOR ALL
  USING (user_id = current_setting('app.current_user_id', true)::uuid)
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

-- Folders: Users can only see their own folders
CREATE POLICY folders_user_isolation ON folders
  FOR ALL
  USING (user_id = current_setting('app.current_user_id', true)::uuid)
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

-- Tags: Users can only see their own tags
CREATE POLICY tags_user_isolation ON tags
  FOR ALL
  USING (user_id = current_setting('app.current_user_id', true)::uuid)
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

-- Shares: Users can only see shares they created
CREATE POLICY shares_user_isolation ON shares
  FOR ALL
  USING (user_id = current_setting('app.current_user_id', true)::uuid)
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

-- User Sessions: Users can only see their own sessions
CREATE POLICY sessions_user_isolation ON user_sessions
  FOR ALL
  USING (user_id = current_setting('app.current_user_id', true)::uuid)
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

-- Team Clips: Users can only see team clips from teams they're members of
CREATE POLICY team_clips_member_access ON team_clips
  FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = current_setting('app.current_user_id', true)::uuid
    )
  );

-- Team Clips: Users can only create clips in teams they're members of
CREATE POLICY team_clips_member_create ON team_clips
  FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = current_setting('app.current_user_id', true)::uuid
    )
  );

-- Team Clips: Users can only update/delete clips in teams where they're editors/admins
CREATE POLICY team_clips_member_modify ON team_clips
  FOR UPDATE
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = current_setting('app.current_user_id', true)::uuid
      AND tm.role IN ('owner', 'admin', 'editor')
    )
  );

CREATE POLICY team_clips_member_delete ON team_clips
  FOR DELETE
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = current_setting('app.current_user_id', true)::uuid
      AND tm.role IN ('owner', 'admin', 'editor')
    )
  );

-- Teams: Users can only see teams they're members of
CREATE POLICY teams_member_access ON teams
  FOR SELECT
  USING (
    id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = current_setting('app.current_user_id', true)::uuid
    )
    OR owner_id = current_setting('app.current_user_id', true)::uuid
  );

-- Team Members: Users can only see members of teams they belong to
CREATE POLICY team_members_access ON team_members
  FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = current_setting('app.current_user_id', true)::uuid
    )
  );

-- Note: The application must set 'app.current_user_id' before executing queries
-- This is done in the database connection middleware

