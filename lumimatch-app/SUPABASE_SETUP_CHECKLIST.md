# ✅ SUPABASE KURULUM KONTROL LİSTESİ

## 🔗 Bağlantı Bilgileri

**Supabase URL:** `https://aaszyppzidhazpbmcipv.supabase.co`  
**Project ID:** `aaszyppzidhazpbmcipv`  
**Dashboard:** https://supabase.com/dashboard/project/aaszyppzidhazpbmcipv

---

## ADIM 1: SQL MIGRATION (Database Tabloları) 📊

### 1.1 Mevcut Tablolar Kontrolü
```sql
-- Supabase SQL Editor'da çalıştır
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Beklenen Çıktı:**
- users
- gifts
- daily_tasks
- direct_messages
- chat_logs
- push_subscriptions
- (ve daha fazlası...)

### 1.2 Video Streaming Tablolarını Ekle

**Dashboard'da:**
1. Sol menüden **SQL Editor** seç
2. **New Query** butonuna tıkla
3. Bu dosyayı aç: `supabase_video_streaming.sql`
4. Tüm içeriği kopyala-yapıştır
5. **Run** (veya F5) tuşuna bas
6. Yeşil "Success" mesajını bekle

**Kontrol:**
```sql
-- Yeni tabloları kontrol et
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'live_streams',
  'stream_viewers', 
  'stream_comments',
  'stream_gifts',
  'video_call_sessions',
  'webrtc_signals',
  'user_presence',
  'stream_settings'
);
```

✅ **8 tablo görmelisin**

---

## ADIM 2: REALTIME AKTIFLEŞTIRME 🔴

### 2.1 Realtime Publication Kontrolü

```sql
-- Mevcut publication'ı kontrol et
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

### 2.2 Tabloları Realtime'a Ekle

**Manuel Yöntem (Dashboard):**
1. Sol menüden **Database** → **Replication** seç
2. Her tablo için **Enable** butonuna tıkla:
   - ✅ `stream_comments`
   - ✅ `stream_gifts`
   - ✅ `stream_viewers`
   - ✅ `webrtc_signals`
   - ✅ `user_presence`

**Veya SQL İle:**
```sql
-- Eğer manuel eklemek istemiyorsan
ALTER PUBLICATION supabase_realtime ADD TABLE stream_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE stream_gifts;
ALTER PUBLICATION supabase_realtime ADD TABLE stream_viewers;
ALTER PUBLICATION supabase_realtime ADD TABLE webrtc_signals;
ALTER PUBLICATION supabase_realtime ADD TABLE user_presence;
```

**Kontrol:**
```sql
SELECT tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
AND tablename IN (
  'stream_comments',
  'stream_gifts',
  'stream_viewers',
  'webrtc_signals',
  'user_presence'
);
```

✅ **5 tablo görmelisin**

---

## ADIM 3: ROW LEVEL SECURITY (RLS) KONTROL 🔒

### 3.1 RLS Durumunu Kontrol Et

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'live_streams',
  'stream_comments',
  'stream_gifts',
  'video_call_sessions',
  'webrtc_signals'
);
```

**Beklenen:** Hepsi `true`

### 3.2 Politikaları Kontrol Et

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('live_streams', 'stream_comments');
```

**Beklenen Politikalar:**
- `Public live streams` (SELECT)
- `Users can create streams` (INSERT)
- `Streamers can update own streams` (UPDATE)
- `Public stream comments` (SELECT)
- `Users can add comments` (INSERT)

---

## ADIM 4: INDEXLER VE PERFORMANS ⚡

### 4.1 Index Kontrolü

```sql
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN (
  'live_streams',
  'stream_comments',
  'stream_gifts',
  'webrtc_signals'
)
ORDER BY tablename, indexname;
```

**Beklenen Indexler (minimum):**
- `idx_live_streams_streamer`
- `idx_live_streams_is_live`
- `idx_stream_comments_stream`
- `idx_stream_gifts_stream`
- `idx_webrtc_signals_to_user`
- (ve daha fazlası...)

---

## ADIM 5: TRIGGER VE FONKSİYONLAR 🎯

### 5.1 Fonksiyonları Kontrol Et

```sql
SELECT 
  routine_schema,
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'update_stream_viewer_count',
  'cleanup_old_signals'
);
```

✅ **2 fonksiyon görmelisin**

### 5.2 Trigger'ları Kontrol Et

```sql
SELECT 
  trigger_schema,
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name = 'trigger_update_viewer_count';
```

✅ **1 trigger görmelisin**

---

## ADIM 6: API KEYS VE AYARLAR 🔑

### 6.1 API Keys Kontrolü

**Dashboard'da:**
1. **Settings** → **API**
2. Şu key'leri not al:
   - **Project URL:** https://aaszyppzidhazpbmcipv.supabase.co
   - **anon (public) key:** eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   - **service_role key:** (secret - production için)

### 6.2 App.js'de Kontrol

```javascript
// Bu zaten mevcut - kontrol et
const SUPABASE_URL = 'https://aaszyppzidhazpbmcipv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

✅ **Zaten doğru**

---

## ADIM 7: REALTIME LİMİTLERİ 📡

### 7.1 Rate Limits

**Dashboard:** Settings → API → Realtime

**Ücretsiz Plan Limitleri:**
- Max Connections: **200**
- Max Channels Per Connection: **100**
- Max Messages Per Second: **100**

⚠️ **Not:** Eğer 200'den fazla concurrent user olacaksa Pro plan gerekli.

### 7.2 Realtime Inspector

**Test için:**
```javascript
// Test kodu (React Native'de çalıştır)
const testRealtime = async () => {
  const channel = supabase
    .channel('test')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'stream_comments'
    }, payload => {
      console.log('Realtime çalışıyor!', payload);
    })
    .subscribe();
  
  // Test comment ekle
  await supabase
    .from('stream_comments')
    .insert({
      stream_id: 'test-id',
      user_id: 'test-user',
      username: 'Test',
      message: 'Hello Realtime!',
    });
};

testRealtime();
```

✅ **Console'da "Realtime çalışıyor!" görmelisin**

---

## ADIM 8: TEST DATA EKLEME (Opsiyonel) 🧪

### 8.1 Test Kullanıcıları

```sql
-- Test users ekle (eğer users tablosu varsa)
INSERT INTO users (email, username, display_name, diamonds, is_available)
VALUES 
  ('test1@lumimatch.app', 'test_user_1', 'Test User 1', 1000, true),
  ('test2@lumimatch.app', 'test_user_2', 'Test User 2', 500, true)
ON CONFLICT (email) DO NOTHING;
```

### 8.2 Test Stream

```sql
-- Test live stream ekle
INSERT INTO live_streams (
  streamer_id,
  title,
  description,
  is_live,
  viewer_count
)
SELECT 
  id,
  'Test Canlı Yayın 🔴',
  'Bu bir test yayınıdır',
  true,
  0
FROM users
WHERE email = 'test1@lumimatch.app'
LIMIT 1;
```

---

## ADIM 9: PRODUCTION HAZIRLIK 🚀

### 9.1 Environment Variables (.env)

```env
SUPABASE_URL=https://aaszyppzidhazpbmcipv.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_key_here (backend için)
```

### 9.2 Security Checklist

- [ ] RLS aktif
- [ ] Politikalar ayarlandı
- [ ] Service key güvenli saklanıyor
- [ ] Anon key public (app içinde)
- [ ] Rate limiting aktif

### 9.3 Monitoring

**Dashboard'da:**
- **Database** → **Query Performance** (slow queries)
- **Logs** → **Postgres Logs** (hatalar)
- **Reports** → **Database Health**

---

## ADIM 10: FİNAL KONTROL ✅

### Kontrol Listesi:

#### Database:
- [ ] 8 yeni tablo oluşturuldu
- [ ] Tüm indexler mevcut
- [ ] Trigger çalışıyor
- [ ] Fonksiyonlar tanımlı

#### Realtime:
- [ ] 5 tablo Realtime'a eklendi
- [ ] Test subscription çalışıyor
- [ ] Limitler kontrol edildi

#### Security:
- [ ] RLS aktif
- [ ] Politikalar doğru
- [ ] Keys ayarlandı

#### App:
- [ ] Supabase client bağlı
- [ ] Services import edildi
- [ ] Error handling var

---

## 🐛 SORUN GİDERME

### "Could not connect to Supabase"
```javascript
// Bağlantıyı test et
const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('count');
    if (error) throw error;
    console.log('✅ Bağlantı başarılı');
  } catch (error) {
    console.error('❌ Bağlantı hatası:', error);
  }
};
```

### "Realtime not receiving messages"
1. Dashboard → Database → Replication → Tablo enabled mi?
2. RLS politikaları SELECT'e izin veriyor mu?
3. Channel name doğru mu?

### "Permission denied"
```sql
-- RLS'yi geçici olarak kapat (test için)
ALTER TABLE stream_comments DISABLE ROW LEVEL SECURITY;
```

---

## 📞 YARDIM

Supabase Documentation: https://supabase.com/docs  
Realtime Docs: https://supabase.com/docs/guides/realtime  
Discord: https://discord.supabase.com

---

## ✨ TAMAMLANDI!

Tüm checkler ✅ ise hazırsın! Build alabilirsin 🚀
