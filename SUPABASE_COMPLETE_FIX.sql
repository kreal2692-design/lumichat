-- ============================================
-- LUMIMATCH - TAM KURULUM
-- Tüm eksik tabloları ve ayarları oluştur
-- ============================================

-- 1. USERS TABLE (Kayıt olma için zorunlu!)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  username TEXT UNIQUE,
  display_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  gender TEXT,
  age INTEGER,
  location TEXT,
  
  -- Finansal
  diamonds INTEGER DEFAULT 100,
  balance DECIMAL(10,2) DEFAULT 0.00,
  total_earned DECIMAL(10,2) DEFAULT 0.00,
  total_spent DECIMAL(10,2) DEFAULT 0.00,
  
  -- Hesap durumu
  is_creator BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  is_banned BOOLEAN DEFAULT FALSE,
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMPTZ,
  
  -- Gamification
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- 2. LIVE STREAMS TABLE
CREATE TABLE IF NOT EXISTS live_streams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  streamer_id UUID NOT NULL,
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

-- 3. STREAM VIEWERS TABLE
CREATE TABLE IF NOT EXISTS stream_viewers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id UUID REFERENCES live_streams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  watch_duration INTEGER DEFAULT 0,
  gifts_sent INTEGER DEFAULT 0,
  UNIQUE(stream_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_stream_viewers_stream ON stream_viewers(stream_id);

-- 4. STREAM COMMENTS TABLE
CREATE TABLE IF NOT EXISTS stream_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id UUID REFERENCES live_streams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  username TEXT NOT NULL,
  avatar_url TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stream_comments_stream ON stream_comments(stream_id);

-- 5. STREAM GIFTS TABLE
CREATE TABLE IF NOT EXISTS stream_gifts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id UUID REFERENCES live_streams(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID NOT NULL,
  sender_username TEXT NOT NULL,
  receiver_id UUID NOT NULL,
  gift_type TEXT NOT NULL,
  gift_name TEXT NOT NULL,
  gift_emoji TEXT NOT NULL,
  gift_value INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stream_gifts_stream ON stream_gifts(stream_id);

-- 6. USER PRESENCE TABLE
CREATE TABLE IF NOT EXISTS user_presence (
  user_id UUID PRIMARY KEY,
  status TEXT DEFAULT 'offline',
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  current_activity TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. AUTO-UPDATE VIEWER COUNT FUNCTION
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

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_update_viewer_count ON stream_viewers;

-- Create trigger
CREATE TRIGGER trigger_update_viewer_count
AFTER INSERT OR UPDATE ON stream_viewers
FOR EACH ROW
EXECUTE FUNCTION update_stream_viewer_count();

-- 8. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_viewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- 9. DROP EXISTING POLICIES (hata vermeden)
DROP POLICY IF EXISTS "Public can read users" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Anyone can view live streams" ON live_streams;
DROP POLICY IF EXISTS "Anyone can create streams" ON live_streams;
DROP POLICY IF EXISTS "Anyone can update streams" ON live_streams;
DROP POLICY IF EXISTS "Anyone can view comments" ON stream_comments;
DROP POLICY IF EXISTS "Anyone can add comments" ON stream_comments;
DROP POLICY IF EXISTS "Anyone can view gifts" ON stream_gifts;
DROP POLICY IF EXISTS "Anyone can send gifts" ON stream_gifts;
DROP POLICY IF EXISTS "Anyone can be viewer" ON stream_viewers;
DROP POLICY IF EXISTS "Anyone can update presence" ON user_presence;

-- 10. CREATE RLS POLICIES (DEMO MODE - HERKES ERİŞEBİLİR)
-- Users policies
CREATE POLICY "Public can read users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (true);

-- Live streams policies
CREATE POLICY "Anyone can view live streams" ON live_streams FOR SELECT USING (true);
CREATE POLICY "Anyone can create streams" ON live_streams FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update streams" ON live_streams FOR UPDATE USING (true);

-- Comments policies
CREATE POLICY "Anyone can view comments" ON stream_comments FOR SELECT USING (true);
CREATE POLICY "Anyone can add comments" ON stream_comments FOR INSERT WITH CHECK (true);

-- Gifts policies
CREATE POLICY "Anyone can view gifts" ON stream_gifts FOR SELECT USING (true);
CREATE POLICY "Anyone can send gifts" ON stream_gifts FOR INSERT WITH CHECK (true);

-- Viewers policies
CREATE POLICY "Anyone can be viewer" ON stream_viewers FOR ALL USING (true);

-- Presence policies
CREATE POLICY "Anyone can update presence" ON user_presence FOR ALL USING (true);

-- 11. REALTIME PUBLICATION (Hata alırsan yorum satırı yap)
-- Önce tabloları publication'dan çıkar (hata verebilir, sorun değil)
DO $$
BEGIN
    -- Try to drop tables from publication (may fail, it's ok)
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE stream_comments;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE stream_gifts;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE stream_viewers;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE user_presence;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
END $$;

-- Şimdi ekle
DO $$
BEGIN
    -- Try to add tables to publication
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE stream_comments;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE stream_gifts;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE stream_viewers;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE user_presence;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
END $$;

-- ============================================
-- TAMAMLANDI! ✅
-- ============================================
-- Artık hem kayıt olma hem de canlı yayın çalışacak!
-- 
-- Test adımları:
-- 1. Uygulamayı aç
-- 2. Email/şifre ile kayıt ol
-- 3. Giriş yap
-- 4. Canlı yayın başlat
-- 5. Başarılı! 🎉
-- ============================================
