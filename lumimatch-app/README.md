# 📱 LumiMatch - Native Mobile App

Rastgele görüntülü sohbet uygulaması - React Native ile geliştirildi.

## 🚀 Özellikler

- ✅ **Görüntülü Sohbet** (WebRTC)
- ✅ **Rastgele Eşleşme** + Cinsiyet Filtresi
- ✅ **Jeton Sistemi** (In-App Purchase)
- ✅ **Premium Üyelik**
- ✅ **Hediye Gönderme**
- ✅ **Arkadaş Sistemi**
- ✅ **Push Notifications**
- ✅ **Günlük Görevler**
- ✅ **12 Dil Desteği**

## 📦 Kurulum

### 1. Gereksinimler

- Node.js 18+ yüklü olmalı
- Expo CLI yüklü olmalı: `npm install -g expo-cli`
- Android Studio (Android için) veya Xcode (iOS için)

### 2. Bağımlılıkları Yükle

```bash
cd lumimatch-app
npm install
```

### 3. Uygulamayı Başlat

```bash
# Development server başlat
npm start

# Android emulator
npm run android

# iOS simulator (Mac gerekli)
npm run ios

# Web tarayıcıda test
npm run web
```

### 4. Expo Go ile Test

1. Telefonuna **Expo Go** uygulamasını yükle (App Store / Google Play)
2. Terminalda çıkan QR kodu tarat
3. Uygulama telefonunda açılacak

## 🏗️ Proje Yapısı

```
lumimatch-app/
├── App.js                 # Ana uygulama
├── app.json              # Expo config
├── package.json          # Dependencies
├── src/
│   ├── screens/          # Ekranlar
│   │   ├── SplashScreen.js
│   │   ├── AuthScreen.js
│   │   ├── ProfileSetupScreen.js
│   │   ├── HomeScreen.js
│   │   ├── VideoCallScreen.js
│   │   ├── TokenShopScreen.js
│   │   └── PremiumScreen.js
│   ├── components/       # Yeniden kullanılabilir bileşenler
│   ├── services/         # API & Socket.io
│   ├── utils/           # Yardımcı fonksiyonlar
│   └── theme/           # Renkler, stiller
└── assets/              # İkonlar, görseller
```

## 🔧 Yapılandırma

### Supabase

`App.js` dosyasında Supabase bilgilerini güncelle:

```javascript
const SUPABASE_URL = 'your-project-url';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

### Socket.io Server

`src/services/socket.js` dosyasında server URL'ini güncelle:

```javascript
const SOCKET_URL = 'https://lumimatch.net';
```

## 📱 App Store & Google Play Yayınlama

### 1. Build Al

```bash
# Android APK
expo build:android

# iOS IPA
expo build:ios
```

### 2. EAS Build (Önerilen)

```bash
# EAS kurulum
npm install -g eas-cli
eas login

# Android build
eas build -p android

# iOS build
eas build -p ios
```

### 3. Store'lara Yükle

- **Google Play Console**: https://play.google.com/console
- **Apple App Store Connect**: https://appstoreconnect.apple.com

## 💰 Monetizasyon

### In-App Purchase Entegrasyonu

```bash
npm install expo-in-app-purchases
```

### AdMob Reklamlar

```bash
npm install expo-ads-admob
```

## 🔐 Güvenlik

- API anahtarlarını `.env` dosyasında sakla
- Backend API'lerde rate limiting kullan
- Kullanıcı verilerini şifrele
- HTTPS zorunlu

## 📊 Analytics

```bash
# Google Analytics
npm install @react-native-firebase/analytics

# Facebook Analytics
npm install react-native-fbsdk-next
```

## 🐛 Sorun Giderme

### Metro bundler hatası
```bash
npx expo start -c
```

### Cache temizleme
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

### Android build hatası
```bash
cd android
./gradlew clean
cd ..
```

## 📝 TODO

- [ ] ProfileSetupScreen implementasyonu
- [ ] HomeScreen implementasyonu
- [ ] VideoCallScreen (WebRTC)
- [ ] TokenShopScreen (In-App Purchase)
- [ ] PremiumScreen
- [ ] Push Notifications
- [ ] Offline mode
- [ ] Dark/Light theme toggle
- [ ] Chat history
- [ ] Friend system
- [ ] Gift system
- [ ] Daily tasks
- [ ] Leaderboard

## 📄 Lisans

© 2025 LumiMatch. Tüm hakları saklıdır.

## 📞 İletişim

- Instagram: [@LumiMatch](https://instagram.com/LumiMatch)
- TikTok: [@lumimatchoffical](https://tiktok.com/@lumimatchoffical)
- Website: [lumimatch.net](https://lumimatch.net)
