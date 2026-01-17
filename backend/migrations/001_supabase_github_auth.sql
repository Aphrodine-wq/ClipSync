-- ===================================
-- Migration: Supabase & GitHub Auth Setup
-- ===================================
-- Adds GitHub OAuth support and pricing tier fields

-- Add GitHub authentication columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS github_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan VARCHAR(50) DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'active';

-- Create pricing_usage table to track monthly clip usage
CREATE TABLE IF NOT EXISTS pricing_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  clips_created INTEGER DEFAULT 0,
  storage_used_mb NUMERIC(10,2) DEFAULT 0,
  devices_active INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, year, month)
);

-- Create subscriptions table for Stripe integration
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  plan VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP,
  ended_at TIMESTAMP,
  trial_start TIMESTAMP,
  trial_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create billing history table for audit trail
CREATE TABLE IF NOT EXISTS billing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  amount_cents INTEGER,
  currency VARCHAR(3),
  status VARCHAR(50),
  stripe_event_id VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create device_limits table for device-based quotas
CREATE TABLE IF NOT EXISTS device_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id VARCHAR(255) NOT NULL,
  device_name VARCHAR(255),
  device_type VARCHAR(50), -- 'web', 'desktop', 'mobile', 'extension'
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMP,
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, device_id)
);

-- Create clip_quota table to track monthly clip creation
CREATE TABLE IF NOT EXISTS clip_quota (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month_start DATE NOT NULL,
  clips_created INTEGER DEFAULT 0,
  clips_limit INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, month_start)
);

-- Create storage_quota table to track storage usage
CREATE TABLE IF NOT EXISTS storage_quota (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  storage_used_bytes BIGINT DEFAULT 0,
  storage_limit_bytes BIGINT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_pricing_usage_user_month ON pricing_usage(user_id, year, month);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_user_id ON billing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_device_limits_user_id ON device_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_clip_quota_user_id ON clip_quota(user_id);
CREATE INDEX IF NOT EXISTS idx_storage_quota_user_id ON storage_quota(user_id);

-- Create function to update modified timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at columns
DROP TRIGGER IF EXISTS update_pricing_usage_modified ON pricing_usage;
CREATE TRIGGER update_pricing_usage_modified
  BEFORE UPDATE ON pricing_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_subscriptions_modified ON subscriptions;
CREATE TRIGGER update_subscriptions_modified
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_clip_quota_modified ON clip_quota;
CREATE TRIGGER update_clip_quota_modified
  BEFORE UPDATE ON clip_quota
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

-- Enable Row Level Security for Supabase
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clips ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_quota ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users (can only view their own data)
CREATE POLICY "users_can_view_own_data" ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "users_can_update_own_data" ON users
  FOR UPDATE USING (id = auth.uid());

-- Create RLS policies for clips
CREATE POLICY "users_can_view_own_clips" ON clips
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "users_can_create_own_clips" ON clips
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_can_update_own_clips" ON clips
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "users_can_delete_own_clips" ON clips
  FOR DELETE USING (user_id = auth.uid());

-- Create RLS policies for subscriptions
CREATE POLICY "users_can_view_own_subscription" ON subscriptions
  FOR SELECT USING (user_id = auth.uid());

-- Create RLS policies for device limits
CREATE POLICY "users_can_view_own_devices" ON device_limits
  FOR SELECT USING (user_id = auth.uid());

-- Create RLS policies for storage quota
CREATE POLICY "users_can_view_own_storage" ON storage_quota
  FOR SELECT USING (user_id = auth.uid());

-- Add comment explaining the migration
COMMENT ON TABLE pricing_usage IS 'Tracks monthly usage metrics for pricing tier enforcement';
COMMENT ON TABLE subscriptions IS 'Stores Stripe subscription data linked to users';
COMMENT ON TABLE billing_history IS 'Audit trail for all billing events';
COMMENT ON TABLE device_limits IS 'Tracks registered devices for device-based quotas';
COMMENT ON TABLE clip_quota IS 'Monthly clip creation limits per user and plan';
COMMENT ON TABLE storage_quota IS 'Storage usage and limits per user';
