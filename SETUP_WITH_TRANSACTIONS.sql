-- ═══════════════════════════════════════════════════════════════
--  LUMİMATCH KAPSAMLI VERİTABANI KURULUMU + TRANSACTIONS
--  Tüm tabloları sıfırdan oluşturur
-- ═══════════════════════════════════════════════════════════════

-- 1. USERS TABLOSU (Ana kullanıcı tablosu)
CREATE TABLE IF NOT EXISTS users (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email                 TEXT UNIQUE,
  username              TEXT UNIQUE NOT NULL,
  display_name          TEXT,
  avatar_url            TEXT,
  gender                TEXT,
  birth_date            DATE,
  age                   INT,
  bio                   TEXT,
  tokens                INT DEFAULT 0,
  gift_balance          INT DEFAULT 0,
  is_banned             BOOLEAN DEFAULT FALSE,
  ban_until             TIMESTAMPTZ,
  ban_reason            TEXT,
  is_premium            BOOLEAN DEFAULT FALSE,
  premium_expires       TIMESTAMPTZ,
  premium_until         TIMESTAMPTZ,
  nick_color            TEXT,
  nick_color_expires    TIMESTAMPTZ,
  ref_code              TEXT UNIQUE,
  ref_count             INT DEFAULT 0,
  referred_by           UUID REFERENCES users(id),
  last_daily_bonus      TIMESTAMPTZ,
  ad_last_watched       TIMESTAMPTZ,
  theme                 TEXT DEFAULT 'dark',
  language              TEXT DEFAULT 'tr',
  last_login            TIMESTAMPTZ DEFAULT NOW(),
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_ref_code ON users(ref_code);

-- 2. FRIENDS TABLOSU (Arkadaşlık sistemi)
CREATE TABLE IF NOT EXISTS friends (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  status        TEXT DEFAULT 'pending',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(requester_id, receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_friends_requester ON friends(requester_id);
CREATE INDEX IF NOT EXISTS idx_friends_receiver ON friends(receiver_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON friends(status);

-- 3. GIFTS TABLOSU (Hediye sistemi)
CREATE TABLE IF NOT EXISTS gifts (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  gift_type     TEXT NOT NULL,
  name          TEXT,
  emoji         TEXT,
  token_cost    INT NOT NULL,
  converted     BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gifts_sender ON gifts(sender_id);
CREATE INDEX IF NOT EXISTS idx_gifts_receiver ON gifts(receiver_id);
CREATE INDEX IF NOT EXISTS idx_gifts_created ON gifts(created_at DESC);

-- 4. DIRECT_MESSAGES TABLOSU (Direkt mesajlaşma)
CREATE TABLE IF NOT EXISTS direct_messages (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dm_sender ON direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_dm_receiver ON direct_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_dm_created ON direct_messages(created_at DESC);

-- 5. CHAT_LOGS TABLOSU (Sohbet geçmişi)
CREATE TABLE IF NOT EXISTS chat_logs (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  partner_id    UUID,
  partner_name  TEXT,
  messages      JSONB,
  message_count INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_logs_user ON chat_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_logs_created ON chat_logs(created_at DESC);

-- 6. DAILY_TASKS TABLOSU (Günlük görevler)
CREATE TABLE IF NOT EXISTS daily_tasks (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  task_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  matches     INT DEFAULT 0,
  messages    INT DEFAULT 0,
  friends     INT DEFAULT 0,
  task1_done  BOOLEAN DEFAULT FALSE,
  task2_done  BOOLEAN DEFAULT FALSE,
  task3_done  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, task_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_tasks_user ON daily_tasks(user_id, task_date);

-- 7. PUSH_SUBSCRIPTIONS TABLOSU (Push notification)
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  subscription JSONB NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_user ON push_subscriptions(user_id);

-- 8. REPORTS TABLOSU (Kullanıcı raporları)
CREATE TABLE IF NOT EXISTS reports (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  reported_socket_id  TEXT,
  reported_user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  reason              TEXT NOT NULL,
  details             TEXT,
  status              TEXT DEFAULT 'pending',
  reviewed_by         UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported ON reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- 9. LIVE_STREAMS TABLOSU
CREATE TABLE IF NOT EXISTS live_streams (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  streamer_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  viewer_count    INT DEFAULT 0,
  started_at      TIMESTAMPTZ DEFAULT NOW(),
  ended_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_streams_streamer ON live_streams(streamer_id);
CREATE INDEX IF NOT EXISTS idx_streams_active ON live_streams(is_active);

-- 10. STREAM_VIEWERS TABLOSU
CREATE TABLE IF NOT EXISTS stream_viewers (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id   UUID REFERENCES live_streams(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at   TIMESTAMPTZ DEFAULT NOW(),
  left_at     TIMESTAMPTZ,
  UNIQUE(stream_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_viewers_stream ON stream_viewers(stream_id);
CREATE INDEX IF NOT EXISTS idx_viewers_user ON stream_viewers(user_id);

-- 11. STREAM_COMMENTS TABLOSU
CREATE TABLE IF NOT EXISTS stream_comments (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id   UUID REFERENCES live_streams(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_stream ON stream_comments(stream_id);
CREATE INDEX IF NOT EXISTS idx_comments_created ON stream_comments(created_at DESC);

-- 12. STREAM_GIFTS TABLOSU
CREATE TABLE IF NOT EXISTS stream_gifts (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id   UUID REFERENCES live_streams(id) ON DELETE CASCADE,
  sender_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  gift_type   TEXT NOT NULL,
  amount      INT DEFAULT 1,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stream_gifts_stream ON stream_gifts(stream_id);

-- 13. VIDEO_CALL_SESSIONS TABLOSU
CREATE TABLE IF NOT EXISTS video_call_sessions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  user2_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  room_name   TEXT UNIQUE NOT NULL,
  status      TEXT DEFAULT 'active',
  started_at  TIMESTAMPTZ DEFAULT NOW(),
  ended_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sessions_users ON video_call_sessions(user1_id, user2_id);

-- 14. WEBRTC_SIGNALS TABLOSU
CREATE TABLE IF NOT EXISTS webrtc_signals (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id  UUID REFERENCES video_call_sessions(id) ON DELETE CASCADE,
  from_user   UUID REFERENCES users(id) ON DELETE CASCADE,
  to_user     UUID REFERENCES users(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL,
  signal_data JSONB NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_signals_session ON webrtc_signals(session_id);

-- 15. USER_PRESENCE TABLOSU (Online/Offline durumu)
CREATE TABLE IF NOT EXISTS user_presence (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  status      TEXT DEFAULT 'online',
  last_seen   TIMESTAMPTZ DEFAULT NOW(),
  socket_id   TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_presence_user ON user_presence(user_id);
CREATE INDEX IF NOT EXISTS idx_presence_status ON user_presence(status);

-- 16. STREAM_SETTINGS TABLOSU
CREATE TABLE IF NOT EXISTS stream_settings (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  quality           TEXT DEFAULT 'hd',
  enable_chat       BOOLEAN DEFAULT TRUE,
  enable_gifts      BOOLEAN DEFAULT TRUE,
  allow_recording   BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stream_settings_user ON stream_settings(user_id);

-- ============================================
-- 17. TRANSACTIONS TABLE FOR IN-APP PURCHASES
-- ============================================

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  
  -- Product info
  product_id TEXT NOT NULL,
  product_type TEXT CHECK (product_type IN ('token', 'subscription')) NOT NULL,
  
  -- Purchase details
  amount INTEGER,
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'TRY',
  
  -- Platform info
  platform TEXT CHECK (platform IN ('android', 'ios')) DEFAULT 'android',
  
  -- Google Play / App Store receipt
  purchase_token TEXT UNIQUE,
  transaction_id TEXT,
  original_transaction_id TEXT,
  
  -- Status
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')) DEFAULT 'pending',
  
  -- Timestamps
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_product_id ON transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_transactions_purchase_token ON transactions(purchase_token);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON transactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create transactions"
  ON transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Update trigger
CREATE OR REPLACE FUNCTION update_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_transactions_updated_at();

GRANT SELECT, INSERT ON transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON transactions TO service_role;

-- ═══════════════════════════════════════════════════════════════
--  ✅ BAŞARILI! 17 tablo oluşturuldu (transactions dahil)
-- ═══════════════════════════════════════════════════════════════
