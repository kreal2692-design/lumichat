-- ============================================
-- LUMIMATCH DATABASE SCHEMA
-- ============================================
-- Bu dosya Supabase'de çalıştırılacak
-- Tüm tabloları ve ilişkileri oluşturur

-- ============================================
-- 1. USERS TABLE (Ana kullanıcı tablosu)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  bio TEXT,
  gender TEXT CHECK (gender IN ('erkek', 'kız', 'diğer')),
  age INTEGER CHECK (age >= 18),
  location TEXT,
  country TEXT DEFAULT 'TR',
  
  -- Finansal
  tokens INTEGER DEFAULT 0,
  balance DECIMAL(10,2) DEFAULT 0.00, -- Gerçek para bakiyesi (TL)
  total_earned DECIMAL(10,2) DEFAULT 0.00,
  total_spent DECIMAL(10,2) DEFAULT 0.00,
  
  -- Hesap durumu
  is_creator BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  is_banned BOOLEAN DEFAULT FALSE,
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMP WITH TIME ZONE,
  
  -- Gamification
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  vip_level TEXT DEFAULT 'None', -- None, Bronze, Silver, Gold, Diamond
  vip_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Stats
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  friends_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  
  -- Settings
  language TEXT DEFAULT 'tr',
  push_enabled BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  show_online_status BOOLEAN DEFAULT TRUE,
  safe_mode BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. CREATOR PROFILES (İçerik üreticisi profilleri)
-- ============================================
CREATE TABLE IF NOT EXISTS creator_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Pricing (Creator'ın belirlediği fiyatlar)
  video_call_enabled BOOLEAN DEFAULT TRUE,
  video_call_free_seconds INTEGER DEFAULT 10,
  video_call_price_per_minute INTEGER DEFAULT 50,
  
  message_enabled BOOLEAN DEFAULT TRUE,
  message_free_count INTEGER DEFAULT 3,
  message_price INTEGER DEFAULT 10,
  
  subscription_enabled BOOLEAN DEFAULT TRUE,
  subscription_monthly_price DECIMAL(10,2) DEFAULT 49.99,
  subscription_benefits JSONB DEFAULT '[]'::jsonb,
  
  tip_amounts JSONB DEFAULT '[50, 100, 500, 1000]'::jsonb,
  
  -- Stats
  subscribers_count INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0.00,
  content_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.00,
  rating_count INTEGER DEFAULT 0,
  
  -- Settings
  tags JSONB DEFAULT '[]'::jsonb,
  categories JSONB DEFAULT '[]'::jsonb,
  min_age_requirement INTEGER DEFAULT 18,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- ============================================
-- 3. POSTS (Instagram tarzı paylaşımlar)
-- ============================================
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  content TEXT,
  media_urls JSONB DEFAULT '[]'::jsonb, -- [{ type: 'image'|'video', url: '...' }]
  media_type TEXT CHECK (media_type IN ('image', 'video', 'carousel')),
  
  -- Monetization
  is_premium BOOLEAN DEFAULT FALSE, -- Sadece abone olanlar görsün
  is_ppv BOOLEAN DEFAULT FALSE, -- Pay-per-view
  ppv_price INTEGER DEFAULT 0,
  
  -- Engagement
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  
  -- Settings
  hashtags JSONB DEFAULT '[]'::jsonb,
  mentions JSONB DEFAULT '[]'::jsonb,
  location TEXT,
  is_pinned BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. POST LIKES
-- ============================================
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(post_id, user_id)
);

-- ============================================
-- 5. POST COMMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. STORIES
-- ============================================
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  media_url TEXT NOT NULL,
  media_type TEXT CHECK (media_type IN ('image', 'video')),
  duration INTEGER DEFAULT 5, -- saniye
  
  -- Interactive
  text_overlay TEXT,
  background_color TEXT,
  music_url TEXT,
  poll_question TEXT,
  poll_options JSONB DEFAULT '[]'::jsonb,
  
  -- Stats
  views_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '24 hours',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 7. STORY VIEWS
-- ============================================
CREATE TABLE IF NOT EXISTS story_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(story_id, viewer_id)
);

-- ============================================
-- 8. MESSAGES (Özel mesajlar)
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  content TEXT,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'voice', 'gift', 'tip')),
  media_url TEXT,
  
  -- Monetization
  is_paid BOOLEAN DEFAULT FALSE,
  price INTEGER DEFAULT 0,
  is_unlocked BOOLEAN DEFAULT FALSE,
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 9. SUBSCRIPTIONS (Creator abonelikleri)
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscriber_id UUID REFERENCES users(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Subscription details
  plan_type TEXT DEFAULT 'monthly', -- monthly, yearly
  price DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  
  -- Dates
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  
  -- Auto-renewal
  auto_renew BOOLEAN DEFAULT TRUE,
  
  UNIQUE(subscriber_id, creator_id)
);

-- ============================================
-- 10. TRANSACTIONS (Tüm finansal işlemler)
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  type TEXT CHECK (type IN (
    'token_purchase', 'token_spent', 'token_earned',
    'subscription_purchase', 'tip_sent', 'tip_received',
    'ppv_purchase', 'call_charge', 'message_charge',
    'withdrawal', 'refund', 'commission'
  )),
  
  amount DECIMAL(10,2) NOT NULL, -- TL veya Token miktarı
  currency TEXT DEFAULT 'TRY' CHECK (currency IN ('TRY', 'TOKEN')),
  
  -- Related entities
  related_user_id UUID REFERENCES users(id),
  related_content_id UUID,
  
  -- Payment details
  payment_method TEXT, -- credit_card, bank_transfer, papara, etc.
  payment_provider TEXT, -- iyzico, stripe, paypal, etc.
  payment_provider_transaction_id TEXT,
  
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  description TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 11. WITHDRAWALS (Para çekme talepleri)
-- ============================================
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  amount DECIMAL(10,2) NOT NULL,
  method TEXT CHECK (method IN ('bank_transfer', 'papara', 'paypal')),
  
  -- Bank details (encrypted in production)
  account_holder_name TEXT,
  iban TEXT,
  papara_account TEXT,
  paypal_email TEXT,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  admin_note TEXT,
  
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- 12. LIVE STREAMS (Canlı yayınlar)
-- ============================================
CREATE TABLE IF NOT EXISTS live_streams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  broadcaster_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  
  -- Stream details
  stream_key TEXT UNIQUE NOT NULL,
  rtmp_url TEXT,
  playback_url TEXT,
  
  -- Settings
  is_private BOOLEAN DEFAULT FALSE,
  min_age INTEGER DEFAULT 18,
  categories JSONB DEFAULT '[]'::jsonb,
  
  -- Stats
  current_viewers INTEGER DEFAULT 0,
  peak_viewers INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  gifts_received INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0.00,
  
  status TEXT DEFAULT 'live' CHECK (status IN ('scheduled', 'live', 'ended')),
  
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  scheduled_for TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- 13. LIVE STREAM GIFTS (Yayın hediyesi)
-- ============================================
CREATE TABLE IF NOT EXISTS live_stream_gifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stream_id UUID REFERENCES live_streams(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  gift_id TEXT NOT NULL, -- 'rose', 'heart', 'diamond', etc.
  gift_name TEXT NOT NULL,
  gift_value INTEGER NOT NULL, -- Token değeri
  quantity INTEGER DEFAULT 1,
  
  -- Animation
  show_animation BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 14. VIDEO CALLS (Görüntülü aramalar)
-- ============================================
CREATE TABLE IF NOT EXISTS video_calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Call details
  call_type TEXT DEFAULT 'private' CHECK (call_type IN ('private', 'random')),
  duration_seconds INTEGER DEFAULT 0,
  
  -- Monetization
  is_paid BOOLEAN DEFAULT FALSE,
  price_per_minute INTEGER DEFAULT 0,
  free_seconds INTEGER DEFAULT 0,
  total_cost INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'calling' CHECK (status IN ('calling', 'active', 'ended', 'missed', 'rejected')),
  
  -- WebRTC
  room_id TEXT UNIQUE,
  agora_channel_name TEXT,
  
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  answered_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- 15. FOLLOWS (Takip sistemi)
-- ============================================
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(follower_id, following_id)
);

-- ============================================
-- 16. BLOCKS (Engelleme)
-- ============================================
CREATE TABLE IF NOT EXISTS blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id UUID REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(blocker_id, blocked_id)
);

-- ============================================
-- 17. REPORTS (Şikayet sistemi)
-- ============================================
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Reported entity
  reported_user_id UUID REFERENCES users(id),
  reported_post_id UUID REFERENCES posts(id),
  reported_message_id UUID REFERENCES messages(id),
  
  reason TEXT CHECK (reason IN (
    'spam', 'harassment', 'inappropriate_content', 
    'violence', 'hate_speech', 'underage', 'scam', 'other'
  )),
  description TEXT,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  admin_note TEXT,
  action_taken TEXT, -- warning, ban, content_removed, etc.
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- 18. NOTIFICATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  type TEXT CHECK (type IN (
    'like', 'comment', 'follow', 'mention', 'message',
    'subscription', 'gift', 'tip', 'call', 'live_started',
    'post_approved', 'withdrawal_completed', 'achievement'
  )),
  
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  icon TEXT,
  image_url TEXT,
  
  -- Related entities
  related_user_id UUID REFERENCES users(id),
  related_post_id UUID REFERENCES posts(id),
  related_content_id UUID,
  
  -- Action
  action_url TEXT,
  action_params JSONB DEFAULT '{}'::jsonb,
  
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 19. ACHIEVEMENTS (Başarım sistemi)
-- ============================================
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  
  -- Requirements
  requirement_type TEXT, -- followers, posts, revenue, etc.
  requirement_value INTEGER,
  
  -- Rewards
  reward_tokens INTEGER DEFAULT 0,
  reward_xp INTEGER DEFAULT 0,
  badge_url TEXT,
  
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 20. USER ACHIEVEMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  
  progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(user_id, achievement_id)
);

-- ============================================
-- 21. GROUPS (Aile/Klan sistemi)
-- ============================================
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Settings
  is_private BOOLEAN DEFAULT FALSE,
  join_approval_required BOOLEAN DEFAULT TRUE,
  max_members INTEGER DEFAULT 50,
  
  -- Stats
  members_count INTEGER DEFAULT 1,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  total_gifts_sent INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 22. GROUP MEMBERS
-- ============================================
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(group_id, user_id)
);

-- ============================================
-- INDEXES (Performans için)
-- ============================================
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
CREATE INDEX idx_live_streams_status ON live_streams(status);

-- ============================================
-- TRIGGERS (Auto-update)
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creator_profiles_updated_at BEFORE UPDATE ON creator_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS (Row Level Security) - Supabase için
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- User can read their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- User can update their own data
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Public posts viewable by all
CREATE POLICY "Public posts are viewable" ON posts
  FOR SELECT USING (NOT is_premium OR is_ppv OR user_id = auth.uid());

-- Messages viewable by sender/receiver
CREATE POLICY "Messages viewable by participants" ON messages
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

-- Notifications viewable by owner
CREATE POLICY "Notifications viewable by owner" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- SEED DATA (Örnek veriler - opsiyonel)
-- ============================================
-- Başlangıç achievement'ları
INSERT INTO achievements (key, title, description, icon, requirement_type, requirement_value, reward_tokens, reward_xp, rarity)
VALUES
  ('first_post', 'İlk Paylaşım', 'İlk gönderini paylaştın!', '🎉', 'posts', 1, 10, 50, 'common'),
  ('100_followers', '100 Takipçi', '100 takipçiye ulaştın!', '🌟', 'followers', 100, 50, 200, 'rare'),
  ('first_stream', 'İlk Yayın', 'İlk canlı yayınını yaptın!', '📹', 'streams', 1, 20, 100, 'common'),
  ('premium_subscriber', 'Premium Üye', 'Premium üyeliğe abone oldun!', '👑', 'premium', 1, 100, 500, 'epic');

-- Başlangıç hediye tanımları (demoData.js'e de eklenecek)
-- ...

COMMIT;
