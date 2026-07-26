# 🚀 LumiMatch Mobil App - Kurulum Rehberi

## ⚡ Hızlı Başlangıç

### 1. Node.js Kurulumu (Eğer yoksa)

https://nodejs.org/ adresinden **LTS** sürümünü indir ve kur.

Kontrol et:
```bash
node --version
npm --version
```

### 2. Expo CLI Kurulumu

```bash
npm install -g expo-cli
```

### 3. Proje Bağımlılıklarını Yükle

```bash
cd lumimatch-app
npm install
```

### 4. Uygulamayı Başlat

```bash
npm start
```

Terminal'de QR kod çıkacak!

---

## 📱 Telefonda Test Et

### Android için:
1. **Google Play Store**'dan **Expo Go** uygulamasını indir
2. Uygulamayı aç
3. QR kodu tarat
4. Uygulama telefonunda açılacak!

### iOS için:
1. **App Store**'dan **Expo Go** uygulamasını indir
2. Uygulamayı aç
3. QR kodu tarat
4. Uygulama telefonunda açılacak!

---

## 🔧 Sorun Giderme

### "Module not found" hatası:
```bash
npm install
```

### Cache temizleme:
```bash
npm start -- --clear
```

### Port 19000 kullanımda hatası:
Başka bir terminal'de Expo çalışıyor olabilir. Kapat ve tekrar dene.

---

## 📦 Yapılacaklar (TODO)

### Hemen Yapılabilecekler:
- [ ] `.env` dosyası oluştur (`.env.example`'dan kopyala)
- [ ] Supabase key'lerini güncelle
- [ ] Google OAuth yapılandır (mobil için)

### WebRTC Entegrasyonu (VideoCallScreen):
- [ ] `react-native-webrtc` kurulumu
- [ ] Socket.io bağlantısı
- [ ] Kamera/mikrofon izinleri
- [ ] Peer-to-peer bağlantı
- [ ] Eşleşme algoritması

### In-App Purchase (Jeton Satışı):
- [ ] `expo-in-app-purchases` kurulumu
- [ ] Google Play Console yapılandırması
- [ ] Apple App Store Connect yapılandırması
- [ ] Ödeme doğrulama backend

### Push Notifications:
- [ ] Expo Push Token al
- [ ] Backend'e kaydet
- [ ] Eşleşme bildirimleri
- [ ] Mesaj bildirimleri

### Diğer Özellikler:
- [ ] Profil fotoğrafı yükleme
- [ ] Arkadaş sistemi
- [ ] Hediye gönderme UI
- [ ] Günlük görevler
- [ ] Chat history
- [ ] Ayarlar ekranı
- [ ] Dil değiştirme

---

## 🎨 Tasarım Notları

**Renkler:**
- Primary: `#00e5ff` (Açık mavi)
- Background: `#0b0f17` (Koyu lacivert)
- Card: `rgba(10,20,30,0.92)`
- Border: `rgba(0,229,255,0.25)`
- Success: `#2ecc71`
- Danger: `#ff7675`

**Font:**
- Başlıklar: `fontWeight: '800'`
- Normal: `fontWeight: '400'`

---

## 🚀 Production Build

### Android APK:
```bash
expo build:android
```

### iOS IPA:
```bash
expo build:ios
```

### EAS Build (Önerilen):
```bash
npm install -g eas-cli
eas login
eas build --platform android
eas build --platform ios
```

---

## 💰 Monetizasyon Yapılandırması

### Google Play Console:
1. https://play.google.com/console
2. Uygulama oluştur
3. In-App Products ekle (jeton paketleri)
4. Abonelikler ekle (premium planlar)

### Apple App Store Connect:
1. https://appstoreconnect.apple.com
2. Uygulama oluştur
3. In-App Purchases ekle
4. Auto-renewable subscriptions ekle

### AdMob (Reklam):
```bash
npm install expo-ads-admob
```
1. https://admob.google.com
2. Uygulama kaydı yap
3. Ad Unit ID'lerini al
4. `.env` dosyasına ekle

---

## 📊 Analytics Kurulumu

### Firebase:
```bash
npm install @react-native-firebase/app @react-native-firebase/analytics
```

### Facebook Analytics:
```bash
npm install react-native-fbsdk-next
```

---

## 🔒 Güvenlik

1. **API Key'leri gizle:** `.env` dosyasını git'e ekleme
2. **HTTPS zorunlu:** Backend API'lerde SSL kullan
3. **Rate limiting:** Backend'de istek limiti koy
4. **Input validation:** Kullanıcı girdilerini doğrula
5. **Token expiry:** JWT token'ları belirli süre sonra geçersiz kıl

---

## 📞 Destek

Sorun yaşıyorsan:
1. `npm start -- --clear` dene
2. `node_modules` sil ve tekrar `npm install` yap
3. README.md'deki sorun giderme bölümünü oku

---

## 🎉 Başarılar!

LumiMatch mobil uygulaması hazır! Şimdi:

1. ✅ Temel yapı kuruldu
2. ✅ Splash, Auth, Profile Setup ekranları hazır
3. ✅ Home ekranı çalışıyor
4. ✅ Jeton Shop & Premium ekranları hazır
5. 🚧 WebRTC entegrasyonu bekleniyor

**Sonraki adım:** VideoCallScreen için WebRTC entegrasyonu! 🎥
