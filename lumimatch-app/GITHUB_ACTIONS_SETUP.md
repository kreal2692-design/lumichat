# 🚀 GitHub Actions ile APK Build - Kurulum Rehberi

## 📋 Gereksinimler
- ✅ GitHub hesabı
- ✅ Proje GitHub'da (public veya private repo)
- ✅ Keystore dosyası oluşturuldu

---

## 1️⃣ ADIM: GitHub Repository Oluştur (Henüz yoksa)

1. https://github.com/new adresine git
2. Repository adı: `lumimatch-app` (veya istediğin isim)
3. **Public** veya **Private** seç
4. **Create repository**

---

## 2️⃣ ADIM: GitHub Secrets Ekle

### 2.1. Repository Settings'e Git
1. GitHub repo sayfana git
2. **Settings** sekmesine tıkla
3. Sol menüden **Secrets and variables → Actions**
4. **New repository secret** butonuna tıkla

### 2.2. Secret'ları Ekle

**Secret 1: ANDROID_KEYSTORE_BASE64**
- Name: `ANDROID_KEYSTORE_BASE64`
- Value: `keystore-base64.txt` dosyasının içeriğini kopyala yapıştır
  - Dosya yeri: `c:\Users\kreal\Desktop\lumichat\lumimatch-app\keystore-base64.txt`
  - Not Defteri ile aç, **tüm içeriği** kopyala
- **Add secret**

**Secret 2: KEYSTORE_PASSWORD**
- Name: `KEYSTORE_PASSWORD`
- Value: `Lm@2024!Ks#9xP`
- **Add secret**

**Secret 3: KEY_ALIAS**
- Name: `KEY_ALIAS`
- Value: `lumimatch-key-alias`
- **Add secret**

**Secret 4: KEY_PASSWORD**
- Name: `KEY_PASSWORD`
- Value: `Lm@2024!Ks#9xP` (keystore password ile aynı)
- **Add secret**

✅ Toplam 4 secret eklenmiş olmalı!

---

## 3️⃣ ADIM: Kodu GitHub'a Push Et

### 3.1. Git Kurulu Değilse Kur
https://git-scm.com/download/win

### 3.2. Git İşlemleri

PowerShell'de proje klasöründe:

```powershell
cd c:\Users\kreal\Desktop\lumichat\lumimatch-app

# Git initialize (ilk kez ise)
git init

# Remote ekle (REPO_URL'yi kendi repo adresinle değiştir)
git remote add origin https://github.com/KULLANICI_ADIN/lumimatch-app.git

# Tüm dosyaları ekle
git add .

# Commit
git commit -m "Add GitHub Actions workflow for Android build"

# Push (ilk kez ise)
git push -u origin main
```

**Not:** GitHub kullanıcı adı ve token isteyecek:
- Token oluştur: https://github.com/settings/tokens/new
- Scope: `repo` (tüm checkboxlar)
- Token'ı kopyala ve şifre yerine kullan

---

## 4️⃣ ADIM: Build Başlat

### Otomatik (Push sonrası):
Push yaptığın anda build otomatik başlar!

### Manuel:
1. GitHub repo → **Actions** sekmesi
2. **Android Release Build** workflow'u seç
3. **Run workflow** → **Run workflow**

---

## 5️⃣ ADIM: APK'yı İndir

1. **Actions** sekmesine git
2. Yeşil ✅ işaretli build'e tıkla
3. **Artifacts** bölümünde **lumimatch-release-apk** linkine tıkla
4. ZIP indirilir, içinde APK var!

---

## ⏱️ Build Süresi

- **İlk build:** ~15-20 dakika
- **Sonraki buildler:** ~10-15 dakika (cache sayesinde)

---

## 🔍 Build Takip

GitHub Actions sayfasında canlı log görebilirsin:
- Hangi adımda olduğunu
- Hataları
- APK boyutunu

---

## ❗ Sorun Giderme

### "Secrets not found" hatası:
- Secret adlarını **TAM** doğru yazdığından emin ol (büyük-küçük harf duyarlı)

### Build başlamıyor:
- `.github/workflows/android-build.yml` dosyası var mı kontrol et
- Branch adı `main` veya `master` mi?

### APK imzasız:
- Tüm 4 secret'ı doğru ekledin mi kontrol et

---

## 📦 Sonraki Adımlar

APK hazır olunca:
1. Google Play Console → Internal Testing
2. APK'yı yükle
3. IAP ürünlerini tanımla (Monetization menüsü artık görünür!)

---

## 🎉 Tebrikler!

Artık her kod değişikliğinde otomatik APK build olacak! 🚀
