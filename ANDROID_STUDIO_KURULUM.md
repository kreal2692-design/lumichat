# 🤖 Android Studio Kurulum ve APK Build Rehberi

## 📥 ADIM 1: Android Studio İndir

1. **İndirme Linki**: https://developer.android.com/studio
2. **İndirilecek**: Android Studio Ladybug (veya en son sürüm)
3. **Dosya boyutu**: ~1.1 GB
4. **Sistem gereksinimi**: 
   - 8 GB RAM (16 GB önerilen)
   - 20 GB disk alanı (önerilen)
   - Windows 10 64-bit

---

## ⚙️ ADIM 2: Android Studio Kurulumu

1. **İndirilen .exe dosyasını çalıştır**
   - `android-studio-xxxx.x.x.x-windows.exe`

2. **Setup Wizard'da:**
   - ✅ Android Studio IDE
   - ✅ Android SDK
   - ✅ Android SDK Platform
   - ✅ Android Virtual Device (İSTEĞE BAĞLI - gerçek cihaz varsa gerekmiyor)

3. **Install Type:** Standard (Önerilen)

4. **UI Theme:** Istersen Light, istersen Darcula (karanlık mod)

5. **SDK Components:**
   - ✅ Android SDK
   - ✅ Android SDK Platform (API 34 veya 35)
   - ✅ Android SDK Build-Tools
   - ✅ Android SDK Command-line Tools
   - ✅ Android Emulator (İSTEĞE BAĞLI)
   - ✅ **Android SDK Platform-Tools** (ÖNEMLİ!)

6. **Kurulum başlasın** (5-15 dakika sürer)

---

## 🔧 ADIM 3: SDK ve NDK Kurulumu

Android Studio açıldıktan sonra:

### 3.1. SDK Manager'ı Aç
- Üst menüden: **Tools → SDK Manager**
- Veya hoşgeldin ekranından: **More Actions → SDK Manager**

### 3.2. SDK Platforms Sekmesi
✅ Şunları kur (tik yap):
- **Android 14.0 (API 34)** - UpsideDownCake (Recommended)
- **Android 13.0 (API 33)** - Tiramisu
- Show Package Details tık → Her birinde:
  - ✅ Android SDK Platform
  - ✅ Google APIs ARM 64 v8a System Image (emulator için)

### 3.3. SDK Tools Sekmesi
✅ Şunları kur (tik yap):
- **Android SDK Build-Tools** (en son sürüm)
- **Android SDK Command-line Tools**
- **Android SDK Platform-Tools**
- **Android Emulator** (opsiyonel)
- **CMake** (ÖNEMLİ! - Native kod için)
- **NDK (Side by side)** (ÖNEMLİ! - React Native için)
  - Version: 26.x.x veya 27.x.x (en son)

### 3.4. Apply ve OK
- **Apply** tıkla
- Lisansları kabul et (Accept)
- İndirme ve kurulum başlar (2-10 GB - 10-30 dakika)

---

## 🌍 ADIM 4: Ortam Değişkenleri (Environment Variables)

### 4.1. ANDROID_HOME Ayarla

1. **Bilgisayarım → Özellikler → Gelişmiş Sistem Ayarları**
2. **Ortam Değişkenleri (Environment Variables)**
3. **Kullanıcı Değişkenleri** bölümünde **Yeni**:
   - **Değişken adı**: `ANDROID_HOME`
   - **Değişken değeri**: `C:\Users\kreal\AppData\Local\Android\Sdk`
     (SDK Manager'da gösterilen yolu kullan)

### 4.2. Path'e Ekle

Aynı **Ortam Değişkenleri** penceresinde:
1. **Path** değişkenini seç → **Düzenle**
2. **Yeni** butonuna tıklayarak ekle:
   - `%ANDROID_HOME%\platform-tools`
   - `%ANDROID_HOME%\tools`
   - `%ANDROID_HOME%\tools\bin`

3. **Tamam** ile kaydet
4. **Tüm pencereleri kapat ve bilgisayarı yeniden başlat**

---

## ✅ ADIM 5: Kurulumu Doğrula

Yeniden başlattıktan sonra **yeni bir PowerShell** aç:

```powershell
# ADB kontrol
adb --version

# Android SDK yolu kontrol
echo $env:ANDROID_HOME

# SDK içeriği kontrol
dir $env:ANDROID_HOME
```

Hepsi çalışıyorsa kurulum tamam! ✅

---

## 🏗️ ADIM 6: Projeyi Android Studio'da Aç

1. **Android Studio'yu aç**
2. **Open an Existing Project**
3. Şu klasörü seç: 
   ```
   C:\Users\kreal\Desktop\lumichat\lumimatch-app\android
   ```
4. **OK** tıkla

### İlk Açılışta:
- Gradle sync başlayacak (5-10 dakika)
- "Install Build Tools" derse → **OK**
- "Install NDK" derse → **OK**
- "Accept Licenses" derse → **Accept**

Her şey bittikten sonra yeşil ✅ işareti göreceksin.

---

## 📦 ADIM 7: Release APK Build

### 7.1. Build Variant Seç
- Sol altta: **Build Variants** tab
- **app** modülü için: **release** seç

### 7.2. Build APK
- Üst menü: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
- Build başlar (3-10 dakika)
- Tamamlanınca sağ altta bildirim çıkar: **locate**

### 7.3. APK Konumu
```
C:\Users\kreal\Desktop\lumichat\lumimatch-app\android\app\build\outputs\apk\release\app-release.apk
```

---

## 🔒 ADIM 8: İmzalı (Signed) APK Build

Google Play'e yüklemek için imzalı APK gerekli:

### 8.1. Build → Generate Signed Bundle/APK
- **APK** seç → **Next**

### 8.2. Keystore Bilgileri
- **Choose existing**: `C:\Users\kreal\Desktop\lumichat\lumimatch-app\android\app\lumimatch-release-key.keystore`
- **Key store password**: `LumiMatch2024`
- **Key alias**: `lumimatch-key-alias`
- **Key password**: `LumiMatch2024`
- **Next**

### 8.3. Build Options
- **Destination folder**: `android/app/release`
- **Build Variants**: ✅ **release**
- **Signature Versions**: ✅ **V1** ve ✅ **V2**
- **Finish**

### 8.4. Çıktı
```
C:\Users\kreal\Desktop\lumichat\lumimatch-app\android\app\release\app-release.apk
```

---

## 🚀 Sonraki Adımlar

APK hazır olunca:

1. **Test Et** - Telefona yükleyip test et
2. **Google Play'e Yükle** - Internal Testing track
3. **IAP Ürünlerini Tanımla** - Monetization menüsü artık görünür olacak
4. **IAP Test Et** - Test kullanıcıları ekle

---

## 🆘 Sorun Giderme

### "CMake not found"
- SDK Manager → SDK Tools → CMake kur

### "NDK not found"  
- SDK Manager → SDK Tools → NDK (Side by side) kur

### "Licenses not accepted"
```powershell
cd $env:ANDROID_HOME\cmdline-tools\latest\bin
.\sdkmanager.bat --licenses
# Her lisans için "y" bas
```

### "Gradle sync failed"
- File → Invalidate Caches → Invalidate and Restart

### "BUILD FAILED"
- Build → Clean Project
- Build → Rebuild Project

---

## 📝 Notlar

- **İlk build uzun sürer** (10-20 dakika) - sabır!
- **Gradle cache** dolunca disk alanı tükenebilir
- **NDK/CMake** olmadan React Native build olmaz
- **Her build yeni APK üretir** - version code otomatik artmıyor
