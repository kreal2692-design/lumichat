# 🚀 LumiMatch Hızlı Başlangıç Kılavuzu

## ⚡ 3 Adımda Başlat!

### ADIM 1: Supabase Veritabanını Kur (5 dakika)

1. **Supabase'e git:**
   - 🔗 https://supabase.com/dashboard/project/aaszyppzidhazpbmcipv

2. **SQL Editor'ı aç:**
   - Sol menüden **SQL Editor** seç
   - **New query** butonuna tıkla

3. **SQL dosyasını çalıştır:**
   - `supabase_migrations.sql` dosyasını aç
   - Tüm içeriği **kopyala-yapıştır**
   - **RUN** butonuna bas (veya F5)
   - ✅ "Success" mesajını bekle

4. **Realtime'ı aktifleştir:**
   - Sol menüden **Database → Replication**
   - Bu tabloları bul ve **Enable** butonuna bas:
     - `stream_comments`
     - `stream_gifts`
     - `stream_viewers`
     - `webrtc_signals`
     - `user_presence`

✅ **Veritabanı hazır!**

---

### ADIM 2: Sunucuyu Başlat

#### Windows'ta:
Çift tıkla → **`START.bat`**

Veya terminal'de:
```bash
node server.js
```

#### Otomatik olarak:
- ✅ .env dosyası oluşturulacak
- ✅ Eksik paketler kurulacak
- ✅ Sunucu başlayacak

---

### ADIM 3: Tarayıcıda Aç

Sunucu başladıktan sonra:

🌐 **Ana Sayfa:**  
http://localhost:3000

🛡️ **Admin Panel:**  
http://localhost:3000/admin.html

---

## ✅ Başarılı! Artık Kullanabilirsin

### Test Et:
1. İki tarayıcı sekmesi aç
2. Her ikisinde de **Google ile Giriş Yap** butonuna bas
3. Profil bilgilerini doldur
4. **Başla** butonuna bas
5. Eşleşme gerçekleşecek! 🎉

---

## 🔧 Sorun mu Yaşıyorsun?

### Port 3000 Kullanımda Hatası
`.env` dosyasını aç ve portu değiştir:
```
PORT=3001
```

### Node.js Kurulu Değil
Node.js indir ve kur:
🔗 https://nodejs.org

### Paket Hatası
Terminal'de çalıştır:
```bash
npm install
```

### Supabase Bağlantı Hatası
1. `.env` dosyasını kontrol et
2. Supabase key'lerinin doğru olduğundan emin ol
3. Veritabanı tablolarının oluşturulduğunu kontrol et

---

## 📱 Mobil Uygulama (React Native)

### Android APK Build:
```bash
cd lumimatch-app
npm install
npx expo build:android
```

APK indirme linki terminal'de görünecek!

---

## 🎯 Özellikler

- ✅ Rastgele görüntülü sohbet (WebRTC)
- ✅ Cinsiyet filtresi
- ✅ Hediye sistemi (19 çeşit)
- ✅ Jeton ekonomisi
- ✅ Premium üyelik
- ✅ Arkadaşlık sistemi
- ✅ Direkt mesajlaşma
- ✅ Günlük görevler
- ✅ 12 dil desteği
- ✅ Admin paneli

---

## 📚 Daha Fazla Bilgi

- 📖 **README.md** - Kapsamlı dokümantasyon
- 🚀 **DEPLOYMENT.md** - Deployment rehberi
- 📝 **CHANGELOG.md** - Versiyon geçmişi
- 📊 **SYSTEM_REPORT.md** - Sistem raporu

---

## 💡 İpuçları

### Geliştirme Modu:
```bash
npm run dev
```

### Production Modu:
```bash
NODE_ENV=production npm start
```

### Logları İzle:
Terminal'de görünecek - sunucu logları

### Admin Panel Girişi:
1. http://localhost:3000/admin.html
2. Google ile giriş yap
3. Email: kreal2692@gmail.com (admin hesabı)

---

## 🎉 Başarılar!

Artık kendi video chat uygulamana sahipsin!

Sorular için:
- 📧 support@lumimatch.net
- 📱 Instagram: @lumimatch
- 🎵 TikTok: @lumimatchofficial