-- ============================================
-- LUMIMATCH VIDEO STREAMING SYSTEM
-- Supabase SQL Editor'da çalıştır
-- ============================================

-- 1. LIVE STREAMS TABLE (Canlı Yayınlar)
CREATE TABLE IF NOT EXISTS live_streams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  streamer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  is_live BOOLEAN DEFAULT TRUE,
  viewer_count INTEGER DEFAULT 0,
  total_viewers INTEGER DEFAULT 0,
  total_gifts_received INTEGER DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  category TEXT DEFAULT 'general',
  tags TEXT[],
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_live_streams_streamer ON live_streams(streamer_id);
CREATE INDEX IF NOT EXISTS idx_live_streams_is_live ON live_streams(is_live);
CREATE INDEX IF NOT EXISTS idx_live_streams_started ON live_streams(started_at DESC);

-- 2. STREAM VIEWERS TABLE (Yayın İzleyicileri)
CREATE TABLE IF NOT EXISTS stream_viewers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id UUID REFERENCES live_streams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  watch_duration INTEGER DEFAULT 0, -- seconds
  gifts_sent INTEGER DEFAULT 0,
  UNIQUE(stream_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_stream_viewers_stream ON stream_viewers(stream_id);
CREATE INDEX IF NOT EXISTS idx_stream_viewers_user ON stream_viewers(user_id);

-- 3. STREAM COMMENTS TABLE (Yayın Yorumları)
CREATE TABLE IF NOT EXISTS stream_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id UUID REFERENCES live_streams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  username TEXT NOT NULL,
  avatar_url TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stream_comments_stream ON stream_comments(stream_id);
CREATE INDEX IF NOT EXISTS idx_stream_comments_created ON stream_comments(created_at DESC);

-- 4. STREAM GIFTS TABLE (Yayın Hediyeleri)
CREATE TABLE IF NOT EXISTS stream_gifts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id UUID REFERENCES live_streams(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  sender_username TEXT NOT NULL,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  gift_type TEXT NOT NULL,
  gift_name TEXT NOT NULL,
  gift_emoji TEXT NOT NULL,
  gift_value INTEGER NOT NULL, -- diamonds
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stream_gifts_stream ON stream_gifts(stream_id);
CREATE INDEX IF NOT EXISTS idx_stream_gifts_sender ON stream_gifts(sender_id);
CREATE INDEX IF NOT EXISTS idx_stream_gifts_receiver ON stream_gifts(receiver_id);

-- 5. VIDEO CALL SESSIONS TABLE (1-1 Görüntülü Aramalar)
CREATE TABLE IF NOT EXISTS video_call_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  caller_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  callee_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'searching', -- searching, ringing, active, ended
  call_type TEXT DEFAULT 'random', -- random, direct, premium
  started_at TIMESTAMPTZ DEFAULT NOW(),
  connected_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration INTEGER DEFAULT 0, -- seconds
  cost_per_minute INTEGER DEFAULT 50, -- diamonds
  total_cost INTEGER DEFAULT 0,
  caller_rating INTEGER, -- 1-5
  callee_rating INTEGER, -- 1-5
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_video_calls_caller ON video_call_sessions(caller_id);
CREATE INDEX IF NOT EXISTS idx_video_calls_callee ON video_call_sessions(callee_id);
CREATE INDEX IF NOT EXISTS idx_video_calls_status ON video_call_sessions(status);
CREATE INDEX IF NOT EXISTS idx_video_calls_started ON video_call_sessions(started_at DESC);

-- 6. WEBRTC SIGNALING TABLE (WebRTC Signal Exchange)
CREATE TABLE IF NOT EXISTS webrtc_signals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES video_call_sessions(id) ON DELETE CASCADE NOT NULL,
  from_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  to_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  signal_type TEXT NOT NULL, -- offer, answer, ice_candidate
  signal_data JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webrtc_signals_session ON webrtc_signals(session_id);
CREATE INDEX IF NOT EXISTS idx_webrtc_signals_to_user ON webrtc_signals(to_user_id, processed);

-- 7. USER ONLINE STATUS TABLE (Kullanıcı Durumu)
CREATE TABLE IF NOT EXISTS user_presence (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
  status TEXT DEFAULT 'offline', -- online, busy, in_call, in_stream, offline
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  current_activity TEXT, -- stream_id or call_id
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. STREAM SETTINGS TABLE (Yayıncı Ayarları)
CREATE TABLE IF NOT EXISTS stream_settings (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
  enable_comments BOOLEAN DEFAULT TRUE,
  enable_gifts BOOLEAN DEFAULT TRUE,
  enable_viewers_list BOOLEAN DEFAULT TRUE,
  min_gift_amount INTEGER DEFAULT 10,
  blocked_users UUID[] DEFAULT ARRAY[]::UUID[],
  premium_only BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. FUNCTIONS FOR AUTO-UPDATE
CREATE OR REPLACE FUNCTION update_stream_viewer_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE live_streams
  SET viewer_count = (
    SELECT COUNT(*) FROM stream_viewers 
    WHERE stream_id = NEW.stream_id AND left_at IS NULL
  )
  WHERE id = NEW.stream_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_viewer_count
AFTER INSERT OR UPDATE ON stream_viewers
FOR EACH ROW
EXECUTE FUNCTION update_stream_viewer_count();

-- 10. REALTIME PUBLICATION (Supabase Realtime için)
-- Bu tablolar realtime değişiklikleri yayınlayacak
ALTER PUBLICATION supabase_realtime ADD TABLE stream_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE stream_gifts;
ALTER PUBLICATION supabase_realtime ADD TABLE stream_viewers;
ALTER PUBLICATION supabase_realtime ADD TABLE webrtc_signals;
ALTER PUBLICATION supabase_realtime ADD TABLE user_presence;

-- 11. ROW LEVEL SECURITY (Opsiyonel - production için)
-- Şimdilik service key ile bypass ediyoruz
ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_call_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE webrtc_signals ENABLE ROW LEVEL SECURITY;

-- Everyone can read live streams
CREATE POLICY "Public live streams" ON live_streams FOR SELECT USING (is_live = true);

-- Only streamers can insert their own streams
CREATE POLICY "Users can create streams" ON live_streams FOR INSERT WITH CHECK (auth.uid() = streamer_id);

-- Streamers can update their own streams
CREATE POLICY "Streamers can update own streams" ON live_streams FOR UPDATE USING (auth.uid() = streamer_id);

-- Everyone can read comments
CREATE POLICY "Public stream comments" ON stream_comments FOR SELECT USING (true);

-- Authenticated users can insert comments
CREATE POLICY "Users can add comments" ON stream_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 12. CLEAN UP OLD SIGNALS (Eski signalleri temizle)
CREATE OR REPLACE FUNCTION cleanup_old_signals()
RETURNS void AS $$
BEGIN
  DELETE FROM webrtc_signals 
  WHERE created_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Run cleanup every hour (pg_cron extension gerekir)
-- SELECT cron.schedule('cleanup-signals', '0 * * * *', 'SELECT cleanup_old_signals()');

-- ============================================
-- DONE! Artık video streaming veritabanı hazır
-- ============================================
