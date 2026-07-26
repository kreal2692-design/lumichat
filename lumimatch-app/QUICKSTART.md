# 🚀 LumiMatch v2.2.0 - Quick Start Guide

## 📱 APK Kurulumu (1 Dakika)

1. **APK'yı İndir**
   - Dosya: `LumiMatch-v2.2.0-COMPLETE.apk`
   - Konum: Desktop'ta
   - Boyut: 147.78 MB

2. **Android'e Aktar**
   - USB ile cihazına bağla
   - APK'yı kopyala

3. **Kur**
   - "Bilinmeyen kaynaklar" izni ver
   - APK'yı aç ve kur
   - İzinleri kabul et (Kamera, Mikrofon)

4. **Başlat**
   - Uygulamayı aç
   - Demo Mode aktif - Backend gerektirmez
   - Tüm özellikler kullanılabilir

---

## 🎮 İlk Giriş

### Demo Login
- Email: `demo@lumimatch.app`
- Şifre: Herhangi bir şey (demo mode)
- veya "Demo Mode" ile devam et

### Ana Ekran
- **Random Match:** Rastgele eşleşme
- **Feed:** Instagram tarzı içerik akışı
- **Live:** Canlı yayınlar
- **Messages:** Mesajlaşma
- **Profile:** Profilin

---

## ✨ Öne Çıkan Özellikler

### 🎥 Canlı Yayınlar
- **Ücretsiz Yayınlar:** Herkese açık
- **Premium Yayınlar:** Abonelere özel
- 3 farklı model:
  1. Ücretsiz + Premium (Ayşe, Elif, Selin)
  2. Sadece Premium (Zeynep)
  3. Sadece Ücretsiz (Cansu)

### 💰 Creator Dashboard
- Günlük kazanç takibi
- Abone istatistikleri
- Bahşiş yönetimi
- İçerik performansı

### 📸 Feed System
- Gönderi paylaşma
- Fotoğraf/video yükleme
- Beğeni/yorum
- Premium içerik (PPV)

### 💬 Mesajlaşma
- Metin mesajları
- Fotoğraf gönderme
- Sesli mesaj
- Özel sohbetler

### ⚙️ Gelişmiş Ayarlar
- 50+ ayar seçeneği
- Gizlilik kontrolleri
- Bildirim yönetimi
- İçerik filtreleme
- 2FA güvenlik

---

## 🎯 Test Senaryoları

### Senaryo 1: Random Match
1. Ana ekrandaki "Start Match" butonuna tıkla
2. Rastgele creator'la eşleş
3. Video call başlat
4. Token ile konuş (ilk 10 saniye ücretsiz)

### Senaryo 2: Creator Profili
1. Home'da bir creator'a tıkla
2. Profilini incele
3. "Subscribe" ile abone ol (49.99₺)
4. Premium içeriklere eriş

### Senaryo 3: Canlı Yayın
1. "Live" sekmesine git
2. Aktif yayınları gör
3. Premium yayına tıkla
4. Abonelik kontrolü çalışır

### Senaryo 4: Feed Paylaşımı
1. Feed'e git
2. "+" butonuna tıkla
3. Fotoğraf seç
4. Açıklama yaz
5. Paylaş

### Senaryo 5: Ayarlar
1. Profile → Ayarlar (⚙️)
2. "Enhanced Settings" aç
3. Gizlilik ayarlarını değiştir
4. Bildirim tercihlerini ayarla
5. Kaydet

---

## 🛠️ Build (Developers)

### Prerequisites
```bash
node --version  # v18+
npm --version   # v9+
java --version  # JDK 17+
```

### Build Commands
```bash
# 1. Dependencies
cd lumimatch-app
npm install

# 2. Clean (optional)
cd android
.\gradlew clean

# 3. Generate codegen
.\gradlew generateCodegenArtifactsFromSchema

# 4. Build Release
.\gradlew assembleRelease

# APK location:
# android/app/build/outputs/apk/release/app-release.apk
```

### Build Time
- First build: ~24 min
- Incremental: ~8 min

---

## 📊 Demo Data

### 8 Creator Profiles
1. **Ayşe Dreams** - Model (49.99₺)
2. **Elif VIP** - Premium (99.99₺)
3. **Zeynep Hot** - 18+ (149.99₺)
4. **Selin Goddess** - Custom (79.99₺)
5. **Cansu Fit** - Fitness (39.99₺)
6. **Defne** - Artist (59.99₺)
7. **Merve** - Lifestyle (69.99₺)
8. **Büşra** - Gaming (49.99₺)

### Özellikler
- 15 Feed gönderisi
- 4 Grup/Clan
- 10 Başarım
- Live stream aktif
- Message history
- Transaction history

---

## 🔧 Configuration

### Demo Mode
**File:** `src/data/demoData.js`
```javascript
export const DEMO_MODE = true;  // false = Production
```

### Supabase (Production)
**File:** `App.js`
```javascript
const SUPABASE_URL = 'https://aaszyppzidhazpbmcipv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGc...';
```

---

## 📱 Supported Platforms

### Android
- ✅ Android 7.0+ (API 24+)
- ✅ arm64-v8a
- ✅ armeabi-v7a
- ✅ x86, x86_64

### iOS
- 🚧 Coming soon

---

## 🐛 Troubleshooting

### Problem: APK kurulamıyor
**Çözüm:**
- Bilinmeyen kaynaklar iznini ver
- Eski versiyonu kaldır
- Depolama alanını kontrol et (150 MB gerekli)

### Problem: Kamera açılmıyor
**Çözüm:**
- Ayarlar → Uygulamalar → LumiMatch → İzinler
- Kamera ve Mikrofon izinlerini ver

### Problem: Video call bağlanamıyor
**Çözüm:**
- Demo Mode'da backend bağlantısı simüledir
- Gerçek call için Production mode gerekli

---

## 📚 Documentation

### Full Docs
- `RELEASE_v2.2.0.md` - Tam dokümantasyon
- `supabase_schema.sql` - Database şeması
- Code comments - Inline açıklamalar

### API Reference
- `src/services/supabaseService.js` - Backend servisleri
- `src/data/demoData.js` - Demo verileri

---

## 🎉 Features Summary

| Feature | Status | Version |
|---------|--------|---------|
| Video Call | ✅ | v1.0.0 |
| Random Match | ✅ | v1.0.0 |
| Token Shop | ✅ | v1.0.0 |
| Premium | ✅ | v1.0.0 |
| Chat | ✅ | v1.0.0 |
| Live Stream | ✅ | v1.0.0 |
| Feed | ✅ | v2.0.0 |
| Groups | ✅ | v2.0.0 |
| Post Create | ✅ | v2.1.0 |
| Photo Send | ✅ | v2.1.0 |
| Creator Dashboard | ✅ | v2.1.0 |
| Enhanced Settings | ✅ | v2.2.0 |
| Supabase Service | ✅ | v2.2.0 |
| Premium Streams | ✅ | v2.2.0 |

**Total Screens:** 46+  
**Total Features:** 50+  
**Code Lines:** 25,000+

---

## 🚀 Next Steps

1. **Test APK'yı yükle**
2. **Tüm özellikleri dene**
3. **Feedback ver**
4. **Production'a hazırlan**

---

## 📞 Support

- **Issues:** GitHub Issues
- **Email:** support@lumimatch.app
- **Docs:** RELEASE_v2.2.0.md

---

**Ready to Match! 💕✨**

Version: 2.2.0 (Build 22)  
Date: 9 Temmuz 2026  
Status: ✅ Production Ready
