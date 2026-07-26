-- ====================================
-- LumiMatch - Subscriber-Only Posts Migration
-- Version: 2.9.0
-- Date: 2026-07-11
-- ====================================

-- 1. Add is_subscriber_only column to posts table
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS is_subscriber_only BOOLEAN DEFAULT false;

-- Add comment to explain the column
COMMENT ON COLUMN posts.is_subscriber_only IS 'True if post is visible only to subscribers of the creator';

-- 2. Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_subscriber_only 
ON posts(is_subscriber_only);

CREATE INDEX IF NOT EXISTS idx_posts_user_subscriber 
ON posts(user_id, is_subscriber_only);

-- 3. Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscriber_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_type VARCHAR(50) DEFAULT 'monthly',
  price DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'paused')),
  started_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure user cannot subscribe to themselves
  CONSTRAINT no_self_subscription CHECK (subscriber_id != creator_id),
  
  -- Unique constraint: one subscription per subscriber-creator pair
  UNIQUE(subscriber_id, creator_id)
);

-- Add comments
COMMENT ON TABLE subscriptions IS 'User subscriptions to creators for exclusive content access';
COMMENT ON COLUMN subscriptions.plan_type IS 'Subscription plan: monthly, yearly, lifetime, etc.';
COMMENT ON COLUMN subscriptions.status IS 'Current status: active, expired, cancelled, paused';
COMMENT ON COLUMN subscriptions.price IS 'Subscription price in TRY';

-- 4. Create indexes for subscriptions
CREATE INDEX IF NOT EXISTS idx_subs_subscriber 
ON subscriptions(subscriber_id);

CREATE INDEX IF NOT EXISTS idx_subs_creator 
ON subscriptions(creator_id);

CREATE INDEX IF NOT EXISTS idx_subs_status 
ON subscriptions(status);

CREATE INDEX IF NOT EXISTS idx_subs_active 
ON subscriptions(status) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_subs_expires 
ON subscriptions(expires_at) WHERE expires_at IS NOT NULL;

-- 5. Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies for subscriptions

-- Policy: Users can view their own subscriptions (as subscriber or creator)
DROP POLICY IF EXISTS "Users view own subscriptions" ON subscriptions;
CREATE POLICY "Users view own subscriptions" 
ON subscriptions
FOR SELECT 
USING (
  subscriber_id = auth.uid() OR 
  creator_id = auth.uid()
);

-- Policy: Users can create subscriptions (as subscriber only)
DROP POLICY IF EXISTS "Users create subscriptions" ON subscriptions;
CREATE POLICY "Users create subscriptions" 
ON subscriptions
FOR INSERT 
WITH CHECK (subscriber_id = auth.uid());

-- Policy: Users can update their own subscriptions (cancel, pause, etc.)
DROP POLICY IF EXISTS "Users update own subscriptions" ON subscriptions;
CREATE POLICY "Users update own subscriptions" 
ON subscriptions
FOR UPDATE 
USING (subscriber_id = auth.uid());

-- Policy: Creators cannot delete subscriptions (only users can cancel)
DROP POLICY IF EXISTS "Users delete own subscriptions" ON subscriptions;
CREATE POLICY "Users delete own subscriptions" 
ON subscriptions
FOR DELETE 
USING (subscriber_id = auth.uid());

-- 7. Create function to check if user can view post
CREATE OR REPLACE FUNCTION can_view_post(
  post_id UUID,
  user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  post_record RECORD;
  is_subscribed BOOLEAN;
BEGIN
  -- Get post details
  SELECT user_id AS creator_id, is_subscriber_only
  INTO post_record
  FROM posts
  WHERE id = post_id;

  -- If post doesn't exist, return false
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- If user is the creator, allow
  IF post_record.creator_id = user_id THEN
    RETURN true;
  END IF;

  -- If post is not subscriber-only, allow
  IF NOT post_record.is_subscriber_only THEN
    RETURN true;
  END IF;

  -- Check if user is subscribed to creator
  SELECT EXISTS(
    SELECT 1
    FROM subscriptions
    WHERE subscriber_id = user_id
      AND creator_id = post_record.creator_id
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > NOW())
  ) INTO is_subscribed;

  RETURN is_subscribed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON FUNCTION can_view_post IS 'Check if a user has permission to view a post (owns it, not subscriber-only, or is subscribed)';

-- 8. Create function to get filtered posts for user
CREATE OR REPLACE FUNCTION get_user_feed(
  user_id UUID,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  content TEXT,
  media JSONB,
  is_subscriber_only BOOLEAN,
  can_view BOOLEAN,
  likes_count INTEGER,
  comments_count INTEGER,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.content,
    p.media,
    p.is_subscriber_only,
    can_view_post(p.id, user_id) AS can_view,
    p.likes_count,
    p.comments_count,
    p.created_at
  FROM posts p
  ORDER BY p.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON FUNCTION get_user_feed IS 'Get posts feed with can_view flag for each post';

-- 9. Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 10. Create function to expire old subscriptions
CREATE OR REPLACE FUNCTION expire_old_subscriptions()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE subscriptions
  SET status = 'expired'
  WHERE status = 'active'
    AND expires_at IS NOT NULL
    AND expires_at < NOW();
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Add comment
COMMENT ON FUNCTION expire_old_subscriptions IS 'Expire subscriptions that have passed their expiry date';

-- 11. Insert sample data (optional, for testing)
-- Uncomment if you want to add sample subscriptions

/*
INSERT INTO subscriptions (subscriber_id, creator_id, price, plan_type, expires_at)
SELECT 
  (SELECT id FROM users WHERE email = 'demo@lumimatch.app' LIMIT 1),
  (SELECT id FROM users WHERE is_creator = true LIMIT 1),
  49.99,
  'monthly',
  NOW() + INTERVAL '30 days'
ON CONFLICT (subscriber_id, creator_id) DO NOTHING;
*/

-- 12. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON subscriptions TO authenticated;
GRANT EXECUTE ON FUNCTION can_view_post TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_feed TO authenticated;
GRANT EXECUTE ON FUNCTION expire_old_subscriptions TO authenticated;

-- 13. Create view for active subscriptions count per creator
CREATE OR REPLACE VIEW creator_subscription_stats AS
SELECT 
  creator_id,
  COUNT(*) AS active_subscribers,
  SUM(price) AS monthly_revenue
FROM subscriptions
WHERE status = 'active'
GROUP BY creator_id;

-- Add comment
COMMENT ON VIEW creator_subscription_stats IS 'Statistics of active subscriptions per creator';

-- Grant view access
GRANT SELECT ON creator_subscription_stats TO authenticated;

-- ====================================
-- Migration Complete
-- ====================================

-- Verify migration
DO $$
BEGIN
  -- Check if posts table has new column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' 
    AND column_name = 'is_subscriber_only'
  ) THEN
    RAISE NOTICE 'SUCCESS: posts.is_subscriber_only column created';
  ELSE
    RAISE EXCEPTION 'FAILED: posts.is_subscriber_only column not found';
  END IF;

  -- Check if subscriptions table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'subscriptions'
  ) THEN
    RAISE NOTICE 'SUCCESS: subscriptions table created';
  ELSE
    RAISE EXCEPTION 'FAILED: subscriptions table not found';
  END IF;

  -- Check if functions exist
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'can_view_post'
  ) THEN
    RAISE NOTICE 'SUCCESS: can_view_post function created';
  ELSE
    RAISE EXCEPTION 'FAILED: can_view_post function not found';
  END IF;

  RAISE NOTICE '✓ Migration completed successfully!';
END $$;
