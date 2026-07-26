# 🚀 LumiMatch Production Build Guide

## ✅ TAMAMLANAN ADIMLAR

### 1. Keystore Oluşturuldu ✅
```
Dosya: lumimatch-release-key.keystore
Konum: android/app/
Şifre: LumiMatch2024
Alias: lumimatch-key-alias
Geçerlilik: 27 yıl
```

### 2. Gradle Ayarları Yapıldı ✅
- `gradle.properties` - İmzalama bilgileri
- `build.gradle` - Release signing config
- `.gitignore` - Güvenlik (keystore Git'e gitmiyor)

---

## 📦 PRODUCTION APK/AAB OLUŞTURMA

### Adım 1: Temizlik
```bash
cd android
.\gradlew clean
cd ..
```

### Adım 2: AAB (App Bundle) Oluştur - Önerilen
```bash
cd android
.\gradlew bundleRelease
```

**Çıktı:**
```
android/app/build/outputs/bundle/release/app-release.aab
```

### Adım 3: APK Oluştur - Alternatif
```bash
cd android
.\gradlew assembleRelease
```

**Çıktı:**
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## 🎯 AAB vs APK - Hangisini Kullanmalı?

### AAB (Android App Bundle) - ÖNERİLEN ✅
- Google Play Store **ZORUNLU** formatı
- Daha küçük indirme boyutu
- Cihaza özel optimize edilmiş
- **Google Play'de yayınlamak için bunu kullan!**

### APK (Android Package)
- Test için kullanışlı
- Direkt cihaza yüklenebilir
- Daha büyük dosya boyutu
- Geliştirme/test amaçlı

---

## 📱 APK/AAB Testi

### APK'yı Cihazda Test Et
```bash
# USB ile bağlı cihaza yükle
cd android
.\gradlew installRelease

# Veya manuel yükle
adb install app/build/outputs/apk/release/app-release.apk
```

### AAB'yi Test Et
AAB dosyaları direkt yüklenemez. Test için:
1. **Internal Testing** kullan (Google Play Console)
2. Veya `bundletool` ile APK'ya çevir:
```bash
bundletool build-apks --bundle=app-release.aab --output=app.apks --mode=universal
```

---

## 🔐 GÜVENLİK KONTROL LİSTESİ

### ✅ Yapılması Gerekenler
- [x] Keystore oluşturuldu
- [x] Gradle signing config ayarlandı
- [x] `.gitignore` güncellendi
- [ ] Keystore dosyası **GÜVENLİ BİR YERE YEDEKLEND İ**
- [ ] Şifre güvenli bir yere kaydedildi (password manager)
- [ ] `.env` dosyası production değerleri ile güncellendi

### ⚠️ ÖNEMLİ UYARILAR
- **Keystore'u KESİNLİKLE KAYBET ME!**
- Kaybolursa, uygulama güncelleneme z
- Keystore'u Git'e **ASLA** yükleme
- Şifreyi başkalarıyla **PAYLAŞMA**

---

## 🏪 GOOGLE PLAY CONSOLE YÜKLEME

### Adım 1: Google Play Console'a Git
https://play.google.com/console

### Adım 2: Yeni Uygulama Oluştur
1. **Create app**
2. Uygulama adı: **LumiMatch**
3. Dil: Türkçe
4. Kategori: Dating
5. Ücretli/Ücretsiz: Ücretsiz (içerikler ücretli)

### Adım 3: Store Listing Doldur
**Store presence → Main store listing**

#### Uygulama Detayları
```
Kısa Açıklama (80 karakter):
Türkiye'nin en popüler flört ve arkadaşlık uygulaması 💖

Uzun Açıklama (4000 karakter):
LumiMatch ile yeni insanlarla tanış, sohbet et ve aşkı bul! 💕

🌟 Özellikler:
✨ Akıllı eşleştirme algoritması
💬 Anlık mesajlaşma
🎁 Hediye gönderme sistemi
🎮 Eğlenceli mini oyunlar
🌍 Konum bazlı eşleşme
🔒 Güvenli ve özel

... (devamı ekle)
```

#### Görseller
- **App icon:** 512x512 PNG
- **Feature graphic:** 1024x500 PNG
- **Phone screenshots:** En az 2, maksimum 8 (16:9 veya 9:16)
- **Tablet screenshots:** En az 1 (opsiyonel)

### Adım 4: AAB Yükle
**Release → Production → Create release**
1. AAB dosyasını yükle
2. Release notes yaz
3. Review'a gönder

---

## 📊 VERSION CODE ve VERSION NAME

### Şu Anki Versiyon
```gradle
versionCode 285
versionName "2.12.0"
```

### Yeni Versiyon Yüklerken
Her güncelleme için:
- `versionCode` her zaman **ARTMALI** (286, 287, 288...)
- `versionName` anlamlı olmalı ("2.13.0", "3.0.0")

**Örnek:**
```gradle
// android/app/build.gradle
defaultConfig {
    applicationId 'com.lumimatch.app'
    versionCode 286  // +1 arttır
    versionName "2.13.0"  // Anlamlı güncelle
}
```

---

## 🐛 SORUN GİDERME

### Build Hatası: "Keystore not found"
```bash
# Keystore'un doğru yerde olduğundan emin ol
cd android/app
dir lumimatch-release-key.keystore
```

### Build Hatası: "Wrong password"
```bash
# gradle.properties'de şifre doğru mu kontrol et
notepad android\gradle.properties
```

### APK İmzalanmadı
```bash
# İmzalı APK oluşturmak için:
cd android
.\gradlew assembleRelease
# assembleDebug DEĞİL!
```

### AAB Oluşturulamadı
```bash
# Gradle clean sonra tekrar dene
cd android
.\gradlew clean
.\gradlew bundleRelease
```

---

## 🎉 BAŞARILI BUILD KONTROL

### APK/AAB Oluştu mu?
```bash
# AAB kontrol
dir android\app\build\outputs\bundle\release\app-release.aab

# APK kontrol
dir android\app\build\outputs\apk\release\app-release.apk
```

### İmzalı mı?
```bash
# APK imza kontrol
jarsigner -verify -verbose -certs android\app\build\outputs\apk\release\app-release.apk
```

Çıktıda görmeli sin:
```
jar verified.
```

---

## 📞 SONRAKI ADIMLAR

### 1. In-App Products Oluştur
`GOOGLE_PLAY_SETUP.md` dosyasını takip et:
- Token paketleri ekle
- Premium abonelikler oluştur
- Fiyatları ayarla

### 2. Internal Testing
- Test kullanıcıları ekle
- AAB yükle
- Test cihazlarında dene

### 3. Production Release
- Store listing tamamla
- Content rating al
- Privacy policy ekle
- Review'a gönder

---

## ✅ CHECKLIST

Production'a göndermeden önce:

### Teknik
- [ ] Production APK/AAB oluşturuldu
- [ ] İmza doğrulandı
- [ ] Test cihazlarda denendi
- [ ] Crash yok
- [ ] In-app billing test edildi

### Store Listing
- [ ] App icon hazır
- [ ] Screenshots hazır
- [ ] Feature graphic hazır
- [ ] Açıklama yazıldı
- [ ] Kategori seçildi

### Legal
- [ ] Privacy policy hazır
- [ ] Terms of service hazır
- [ ] Content rating alındı
- [ ] Target audience belirlendi

### Backend
- [ ] Supabase production ayarları
- [ ] API keys güvenli
- [ ] Database backup var
- [ ] Monitoring aktif

---

## 🚀 HADI YAYINLAYALIM!

Artık her şey hazır! Production build alıp Google Play'e yüklemeye başlayabilirsin! 🎊

**İlk adım:** AAB oluştur
```bash
cd android
.\gradlew bundleRelease
```

**İkinci adım:** Google Play Console'da internal testing başlat

**Üçüncü adım:** Her şey tamamsa production'a gönder!

---

*Son Güncelleme: 2026-07-25*
*Versiyon: 2.12.0*
