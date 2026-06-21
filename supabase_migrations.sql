-- LumiMatch yeni özellikler için gerekli tablolar
-- Supabase SQL Editor'da çalıştır

-- 0. ban_until kolonu ekle (geçici ban)
ALTER TABLE users ADD COLUMN IF NOT EXISTS ban_until TIMESTAMPTZ;

-- 1. Direkt Mesajlar tablosu
CREATE TABLE IF NOT EXISTS direct_messages (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_dm_sender   ON direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_dm_receiver ON direct_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_dm_created  ON direct_messages(created_at DESC);

-- 2. Sohbet logları tablosu
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

-- 3. Push subscription tablosu
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  subscription JSONB NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 4. users tablosuna eksik kolonları ekle (zaten varsa hata vermez)
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url     TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ref_code       TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ref_count      INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by    UUID;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_daily_bonus TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_premium     BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS premium_expires TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS nick_color     TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS nick_color_expires TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gift_balance   INT DEFAULT 0;

-- 5. gifts tablosuna converted kolonu ekle
ALTER TABLE gifts ADD COLUMN IF NOT EXISTS converted BOOLEAN DEFAULT FALSE;
ALTER TABLE gifts ADD COLUMN IF NOT EXISTS name      TEXT;
ALTER TABLE gifts ADD COLUMN IF NOT EXISTS emoji     TEXT;

-- 6. RLS (Row Level Security) — isteğe bağlı, servis key ile bypass ediliyor
-- Gerekirse şu komutla kapat:
-- ALTER TABLE direct_messages DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE chat_logs DISABLE ROW LEVEL SECURITY;
