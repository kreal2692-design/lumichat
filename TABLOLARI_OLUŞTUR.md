# 🔧 VERİTABANI TABLOLARINI OLUŞTUR

## ❌ Sorun: Tablolar Oluşmadı

Yanlış SQL dosyasını çalıştırdın. `supabase_migrations.sql` dosyası tabloları güncellemek için, zaten varolan tablolar için tasarlanmış.

## ✅ ÇÖZÜM: Doğru SQL Dosyasını Kullan

### ADIM 1: Supabase SQL Editor'ı Aç

1. Bu linke tıkla: https://supabase.com/dashboard/project/aaszyppzidhazpbmcipv/editor
2. Sol menüden **SQL Editor** seç
3. **New query** butonuna tıkla

### ADIM 2: FULL_DATABASE_SETUP.sql Dosyasını Kullan

1. **`FULL_DATABASE_SETUP.sql`** dosyasını aç (masaüstünde lumichat klasöründe)
2. **CTRL+A** ile tüm içeriği seç
3. **CTRL+C** ile kopyala
4. Supabase SQL Editor'a geri dön
5. **CTRL+V** ile yapıştır
6. **RUN** butonuna bas (veya F5 tuşuna bas)
7. ✅ Başarı mesajını bekle (Success. No rows returned)

### ADIM 3: Realtime'ı Aktifleştir

1. Sol menüden **Database → Replication** seç
2. Sayfada listede bu 5 tabloyu bul
3. Her birinin yanındaki **Enable** butonuna bas:
   - ☑ **stream_comments**
   - ☑ **stream_gifts**  
   - ☑ **stream_viewers**
   - ☑ **webrtc_signals**
   - ☑ **user_presence**

### ADIM 4: Sunucuyu Başlat

Masaüstünde lumichat klasöründe:

1. **`START.bat`** dosyasına çift tıkla

VEYA terminal'de:

```bash
node server.js
```

### ADIM 5: Tarayıcıda Aç

Sunucu başladıktan sonra tarayıcıda aç:

🌐 http://localhost:3000

---

## 📋 Oluşturulacak Tablolar (16 Adet)

✅ **users** - Kullanıcı bilgileri  
✅ **friends** - Arkadaşlık sistemi  
✅ **gifts** - Hediye kayıtları  
✅ **direct_messages** - Direkt mesajlar  
✅ **chat_logs** - Sohbet geçmişi  
✅ **daily_tasks** - Günlük görevler  
✅ **push_subscriptions** - Push bildirimleri  
✅ **reports** - Kullanıcı raporları  
✅ **live_streams** - Canlı yayınlar  
✅ **stream_viewers** - Yayın izleyicileri  
✅ **stream_comments** - Yayın yorumları (Realtime)  
✅ **stream_gifts** - Yayın hediyeleri (Realtime)  
✅ **video_call_sessions** - Video görüşme oturumları  
✅ **webrtc_signals** - WebRTC sinyalleri (Realtime)  
✅ **user_presence** - Online/Offline durumu (Realtime)  
✅ **stream_settings** - Yayın ayarları  

---

## 🎯 Tamamlandı mı Kontrol Et

1. Supabase'de **Table Editor** seç
2. Sol tarafta 16 tablo göreceksin
3. Her tabloya tıklayınca yapısını görebilirsin
4. **Database → Replication** kısmında 5 tablo "Enabled" olmalı

---

## ❓ Hala Sorun mu Var?

### SQL Çalıştırma Hatası Alıyorsan:

1. Supabase'de **SQL Editor** aç
2. Bu kodu çalıştır (önceki tabloları sil):

```sql
DROP TABLE IF EXISTS stream_settings CASCADE;
DROP TABLE IF EXISTS user_presence CASCADE;
DROP TABLE IF EXISTS webrtc_signals CASCADE;
DROP TABLE IF EXISTS video_call_sessions CASCADE;
DROP TABLE IF EXISTS stream_gifts CASCADE;
DROP TABLE IF EXISTS stream_comments CASCADE;
DROP TABLE IF EXISTS stream_viewers CASCADE;
DROP TABLE IF EXISTS live_streams CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS push_subscriptions CASCADE;
DROP TABLE IF EXISTS daily_tasks CASCADE;
DROP TABLE IF EXISTS chat_logs CASCADE;
DROP TABLE IF EXISTS direct_messages CASCADE;
DROP TABLE IF EXISTS gifts CASCADE;
DROP TABLE IF EXISTS friends CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

3. Şimdi tekrar **FULL_DATABASE_SETUP.sql** dosyasını çalıştır

---

## 🚀 Başarıyla Tamamlandı!

Artık tüm tablolar hazır. START.bat'ı çalıştırıp uygulamayı kullanmaya başlayabilirsin!
