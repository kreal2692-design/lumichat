# ⚡ LumiMatch - Hızlı Başlangıç

## 🎯 5 Dakikada Test Et!

### 1️⃣ Terminali Aç
Windows'ta: `PowerShell` veya `CMD`

### 2️⃣ Proje Klasörüne Git
```bash
cd "C:\Users\kreal\Desktop\lumichat\lumimatch-app"
```

### 3️⃣ Bağımlılıkları Yükle (İlk Kez)
```bash
npm install
```
⏱️ Bu adım 2-5 dakika sürebilir. Kahve molası! ☕

### 4️⃣ Uygulamayı Başlat
```bash
npm start
```

### 5️⃣ QR Kod Çıkacak!
Terminal'de büyük bir QR kod görünecek.

---

## 📱 Telefonunda Aç

### Android:
1. **Google Play Store** → "Expo Go" yükle
2. Expo Go'yu aç
3. "Scan QR Code" butonu
4. Terminal'deki QR'ı tarat
5. ✅ Uygulama telefonunda açılacak!

### iOS (iPhone):
1. **App Store** → "Expo Go" yükle
2. Expo Go'yu aç
3. QR kodu tarat
4. ✅ Uygulama telefonunda açılacak!

---

## 🐛 Sorun mu Var?

### "Command not found" hatası:
Node.js yüklü değil. https://nodejs.org/ indir ve kur.

### "npm install" hatası:
```bash
npm cache clean --force
npm install
```

### "Port already in use" hatası:
Başka bir terminal'de zaten çalışıyor. Onu kapat veya:
```bash
npm start -- --port 19001
```

### QR kod taramıyor:
1. Telefon ve bilgisayar **aynı WiFi**'de mi?
2. Expo Go güncel mi?
3. Terminal'de "Tunnel" modunu dene: `t` tuşuna bas

### Uygulama açılmıyor:
1. Expo Go'da "Clear cache" yap
2. Terminal'i kapat ve tekrar başlat
3. Telefonunu yeniden başlat

---

## 🎨 İlk Kullanım

1. ✅ Uygulama açıldı
2. 🔐 "Google ile Giriş Yap" (şimdilik test için)
3. 📝 Profil oluştur (kullanıcı adı, cinsiyet, doğum tarihi)
4. 🏠 Ana ekran → "Görüntülü Sohbet Başlat"
5. 🎥 Kamera izni ver
6. 🔍 Eşleşme aranıyor...

**NOT:** WebRTC için 2 telefon gerekli (veya emulator + telefon)

---

## 🚀 Geliştirme Modu

### Terminal komutları:
- `r` → Reload (yeniden yükle)
- `d` → Developer menu aç
- `j` → Chrome debugger aç
- `Ctrl+C` → Sunucuyu durdur

### Hot Reload:
Kod değiştirince otomatik yenilenir! 🔥

---

## 📦 APK/IPA Build (Sonra)

### Android APK:
```bash
expo build:android
```

### iOS IPA:
```bash
expo build:ios
```

APK/IPA hazır olunca link gelir (~20-30 dakika).

---

## 💡 İpuçları

✅ **Telefon ve PC aynı WiFi'de olmalı**
✅ **Google OAuth test modunda (production değil)**
✅ **Supabase test database kullanıyor**
✅ **WebRTC için STUN server (Google)**
✅ **Socket.io https://lumimatch.net'e bağlanıyor**

---

## 🎯 Sonraki Adımlar

1. ✅ **Temel yapı çalışıyor** (TAMAMLANDI)
2. 🚧 **WebRTC görüntülü sohbet** (KOD HAZIR)
3. 🚧 **In-App Purchase** (TODO)
4. 🚧 **Push Notifications** (TODO)
5. 🚧 **Production build** (TODO)

---

## 📞 Yardım

Takıldıysan:
1. README.md oku
2. KURULUM.md oku
3. GELISTIRME_YOLHARITASI.md oku
4. Expo docs: https://docs.expo.dev

---

## 🎉 Başarılar!

İlk React Native uygulanı çalıştırdın! 🚀

Şimdi:
- Kodu incele
- Özellik ekle
- Test et
- Build al
- Store'a yükle
- Para kazan! 💰
