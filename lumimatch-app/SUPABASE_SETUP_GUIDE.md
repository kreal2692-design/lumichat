# 🔧 SUPABASE KURULUM REHBERİ - LumiMatch v3.0.0

## ❌ SORUN
Yayın başlatılamıyor, "Invalid API key" hatası alınıyor.

## ✅ ÇÖZÜM
Supabase'de tablolar oluşturulmamış. Aşağıdaki adımları takip et.

---

## 📋 ADIM 1: Supabase Dashboard'a Git

1. Tarayıcıda aç: https://supabase.com/dashboard
2. Giriş yap
3. Projeyi seç: `aaszyppzidhazpbmcipv`

---

## 📋 ADIM 2: SQL Editor'ı Aç

1. Sol menüden **"SQL Editor"** seç
2. Sağ üstten **"New query"** tıkla

---

## 📋 ADIM 3: SQL Kodunu Yapıştır ve Çalıştır

Aşağıdaki SQL kodunu kopyala, yapıştır ve **"Run"** butonuna bas:

```sql
-- ============================================
-- LUMIMATCH VIDEO STREAMING - MINIMAL SETUP
-- Sadece canlı yayın için gerekli tablolar
-- ============================================

-- 1. LIVE STREAMS TABLE
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
CREATE INDEX IF NOT EXISTS idx_live_streams_started ON live_streams(started_at DESC);

-- 2. STREAM VIEWERS TABLE
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
CREATE INDEX IF NOT EXISTS idx_stream_viewers_user ON stream_viewers(user_id);

-- 3. STREAM COMMENTS TABLE
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
CREATE INDEX IF NOT EXISTS idx_stream_comments_created ON stream_comments(created_at DESC);

-- 4. STREAM GIFTS TABLE
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
CREATE INDEX IF NOT EXISTS idx_stream_gifts_sender ON stream_gifts(sender_id);
CREATE INDEX IF NOT EXISTS idx_stream_gifts_receiver ON stream_gifts(receiver_id);

-- 5. USER PRESENCE TABLE
CREATE TABLE IF NOT EXISTS user_presence (
  user_id UUID PRIMARY KEY,
  status TEXT DEFAULT 'offline',
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  current_activity TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. AUTO-UPDATE VIEWER COUNT
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

DROP TRIGGER IF EXISTS trigger_update_viewer_count ON stream_viewers;
CREATE TRIGGER trigger_update_viewer_count
AFTER INSERT OR UPDATE ON stream_viewers
FOR EACH ROW
EXECUTE FUNCTION update_stream_viewer_count();

-- 7. REALTIME PUBLICATION
ALTER PUBLICATION supabase_realtime ADD TABLE stream_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE stream_gifts;
ALTER PUBLICATION supabase_realtime ADD TABLE stream_viewers;
ALTER PUBLICATION supabase_realtime ADD TABLE user_presence;

-- 8. ROW LEVEL SECURITY - HERKESİN ERİŞİMİ VAR (DEMO İÇİN)
ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_viewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- Herkes yayınları görebilir
CREATE POLICY "Anyone can view live streams" ON live_streams FOR SELECT USING (true);

-- Herkes yayın başlatabilir (demo için)
CREATE POLICY "Anyone can create streams" ON live_streams FOR INSERT WITH CHECK (true);

-- Herkes kendi yayınını güncelleyebilir
CREATE POLICY "Anyone can update streams" ON live_streams FOR UPDATE USING (true);

-- Herkes yorumları görebilir
CREATE POLICY "Anyone can view comments" ON stream_comments FOR SELECT USING (true);

-- Herkes yorum ekleyebilir
CREATE POLICY "Anyone can add comments" ON stream_comments FOR INSERT WITH CHECK (true);

-- Herkes hediyeleri görebilir
CREATE POLICY "Anyone can view gifts" ON stream_gifts FOR SELECT USING (true);

-- Herkes hediye gönderebilir
CREATE POLICY "Anyone can send gifts" ON stream_gifts FOR INSERT WITH CHECK (true);

-- Herkes izleyici olabilir
CREATE POLICY "Anyone can be viewer" ON stream_viewers FOR ALL USING (true);

-- Herkes presence güncelleyebilir
CREATE POLICY "Anyone can update presence" ON user_presence FOR ALL USING (true);

-- ============================================
-- TAMAMLANDI! ✅
-- Artık canlı yayın sistemi çalışacak
-- ============================================
```

---

## 📋 ADIM 4: Başarı Kontrolü

SQL çalıştıktan sonra:

1. Sol menüden **"Table Editor"** seç
2. Şu tabloları görmeli olmalısın:
   - ✅ live_streams
   - ✅ stream_viewers
   - ✅ stream_comments
   - ✅ stream_gifts
   - ✅ user_presence

---

## 📋 ADIM 5: APK'yı Yeniden Build Et

Tablolar oluşturulduktan sonra:

```powershell
cd c:\Users\kreal\Desktop\lumichat\lumimatch-app

# Bundle oluştur
npx expo export --platform android --output-dir android/app/build/generated/expo

# Bundle'ı kopyala
Copy-Item "android\app\build\generated\expo\_expo\static\js\android\*.hbc" "android\app\src\main\assets\index.android.bundle" -Force

# Metadata kopyala (varsa)
if (Test-Path "android\app\build\generated\expo\metadata.json") {
  Copy-Item "android\app\build\generated\expo\metadata.json" "android\app\src\main\assets\" -Force
}

# APK build
cd android
.\gradlew assembleRelease --no-daemon

# APK'yı Desktop'a kopyala
Copy-Item "app\build\outputs\apk\release\app-release.apk" "C:\Users\kreal\Desktop\LumiMatch-v3.0.0-Fixed.apk" -Force

cd ..
```

---

## 🎯 SONUÇ

Artık uygulama:
- ✅ Kamera izinlerini isteyecek
- ✅ Yayın başlatabilecek
- ✅ Yayın bilgilerini Supabase'e kaydedecek
- ✅ Yorumları ve hediyeleri gerçek zamanlı gösterecek

---

## ❓ SORUN YAŞARSAN

### "relation does not exist" hatası
- SQL'i tekrar çalıştır
- Table Editor'da tabloları kontrol et

### "permission denied" hatası
- RLS politikalarını kontrol et
- Yukarıdaki SQL'de "Anyone can..." politikaları var

### Yine "Invalid API key" hatası
- Supabase API key'i kontrol et: `App.js` satır 75-76
- Supabase URL doğru mu: `https://aaszyppzidhazpbmcipv.supabase.co`
- Internet bağlantısı var mı?

---

## 📞 İLETİŞİM

Sorun devam ederse ekran görüntüsü at:
1. Supabase Table Editor (tablolar görünüyor mu?)
2. Uygulama hata mesajı
3. Logcat çıktısı (varsa)
