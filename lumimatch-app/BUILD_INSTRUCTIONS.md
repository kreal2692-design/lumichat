# 🏗️ LumiMatch Build Instructions

## 🚫 LOCAL BUILD SORUNU

Local build yaparken şu sorunlarla karşılaşıyoruz:
1. **React Native Reanimated** → New Architecture gerekiyor
2. **React Native Worklets** → New Architecture gerekiyor  
3. **CMake/NDK** → C++ compiler bulunamıyor
4. **Java Heap Space** → Build sırasında bellek tükeniyor

## ✅ ÇÖZ ÜM: EXPO EAS BUILD (Önerilen)

Expo EAS Build, bulutta build alır ve tüm bu sorunları çözer.

### Adım 1: EAS CLI Kur
```bash
npm install -g eas-cli
```

### Adım 2: Expo Hesabına Giriş Yap
```bash
eas login
```

### Adım 3: Projeyi Yapılandır
```bash
eas build:configure
```

### Adım 4: Production Build Al
```bash
# AAB (Google Play için)
eas build --platform android --profile production

# APK (Test için)
eas build --platform android --profile preview
```

---

## 📋 EAS BUILD PROFILES

`eas.json` dosyası oluştur:

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle",
        "gradleCommand": ":app:bundleRelease"
      }
    }
  }
}
```

---

## 🔑 KEYSTORE YÜKLEME

EAS Build'e keystore'u yükle:

```bash
eas credentials
```

Menüden:
1. **Android** seç
2. **Production** seç
3. **Keystore** → **Upload existing**
4. Dosya yolunu gir: `android/app/lumimatch-release-key.keystore`
5. Şifre: `LumiMatch2024`
6. Alias: `lumimatch-key-alias`

---

## 🚀 BUILD BAŞLATMA

### Production AAB (Google Play)
```bash
eas build --platform android --profile production
```

Build tamamlandığında:
- AAB dosyası indirilecek
- Direkt Google Play Console'a yüklenebilir

### Test APK
```bash
eas build --platform android --profile preview
```

APK indirilir ve test cihazlara yüklenebilir.

---

## 🔧 ALTERNAT İF: LOKAL BUILD (Gelişmiş)

Eğer mutlaka local build yapmak istiyorsan:

### Gereksinimler
1. **Android Studio** yüklü olmalı
2. **Android SDK** ve **NDK** kurulu olmalı
3. **CMake** kurulu olmalı
4. En az **8GB RAM** olmalı

### Android Studio'dan Build
1. Android Studio'yu aç
2. `android` klasörünü aç
3. **Build** → **Generate Signed Bundle / APK**
4. Keystore'u seç: `android/app/lumimatch-release-key.keystore`
5. Şifre: `LumiMatch2024`
6. **Release** seç
7. Build başlat

---

## 📊 BUILD DURUM TAKIBI

### EAS Build Status
```bash
eas build:list
```

### Build Logları
```bash
eas build:view <build-id>
```

---

## ✅ BUILD BAŞARILI OLUNCA

### AAB Dosyası
```
Konum: İndirilen dosya
Boyut: ~30-50MB
Format: .aab
```

### Google Play Console'a Yükle
1. https://play.google.com/console
2. **Release** → **Production** → **Create release**
3. AAB dosyasını yükle
4. Release notes yaz
5. **Review** butonuna bas

---

## 🎯 ÖNERİ

**Expo EAS Build kullan!** 

Avantajları:
- ✅ Tüm build sorunları otomatik çözülür
- ✅ Her zaman başarılı build
- ✅ CI/CD entegrasyonu kolay
- ✅ Keystore güvenli şekilde saklanır
- ✅ Otomatik sign edilir

Dezavantajları:
- ❌ Expo hesabı gerekiyor (ücretsiz)
- ❌ Build süresi biraz daha uzun (10-15 dk)
- ❌ İnternet bağlantısı gerekiyor

---

*Bu proje için EAS Build kullanılması önerilir.*
