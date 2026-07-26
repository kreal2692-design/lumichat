# 🔐 GOOGLE OAUTH KURULUMU - LumiMatch

## 📋 DURUM
- ❌ "Invalid API key" hatası → Supabase Auth yapılandırması eksik
- ✅ GEÇİCİ ÇÖZÜM: Demo mode AÇILDI → Direkt profil kurulumuna gidiyor

## 🎯 GOOGLE OAUTH'U TAM KURMAK İÇİN

### ADIM 1: Google Cloud Console

1. Git: https://console.cloud.google.com
2. Yeni proje oluştur: "LumiMatch"
3. **APIs & Services** → **Credentials**
4. **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Android**
6. Package name: `com.lumimatch.app` (veya app.json'daki)
7. **SHA-1** imzasını ekle:

```bash
# SHA-1 almak için (Windows)
cd C:\Users\kreal\Desktop\lumichat\lumimatch-app\android
.\gradlew signingReport
```

8. **Create** bas
9. **Client ID** ve **Client Secret** kopyala

---

### ADIM 2: Supabase'de Google Auth'u Aktifleştir

1. Git: https://supabase.com/dashboard/project/aaszyppzidhazpbmcipv/auth/providers
2. **Google** provider'ı seç
3. **Enable Google provider** aktif et
4. Google Cloud'dan aldığın:
   - **Client ID** yapıştır
   - **Client Secret** yapıştır
5. **Redirect URLs** kontrol et:
   - `https://aaszyppzidhazpbmcipv.supabase.co/auth/v1/callback`
6. **Save** bas

---

### ADIM 3: Expo Google Sign-In Paketi Kur

```bash
cd C:\Users\kreal\Desktop\lumichat\lumimatch-app
npx expo install @react-native-google-signin/google-signin
```

---

### ADIM 4: AuthScreen'i Güncelle

Kod zaten hazır, sadece `DEMO_MODE = false` yap ve Google Client ID'yi ekle.

`src/screens/AuthScreen.js`:
```javascript
const GOOGLE_CLIENT_ID = 'BURAYA_GOOGLE_CLIENT_ID_YAPISTIR';
```

---

## 🚀 GEÇİCİ ÇÖZÜM (ŞU ANDA KULLANILAN)

**Demo Mode AÇIK** - Google Auth olmadan test edebilirsin:

1. ✅ Uygulamayı aç
2. ✅ "Google ile Devam Et" butonuna bas
3. ✅ **Direkt ProfileSetup'a gider** (OAuth yok)
4. ✅ Profil bilgilerini doldur
5. ✅ Ana sayfaya git
6. ✅ Tüm özellikler çalışır (demo kullanıcı olarak)

---

## ⚠️ ÖNEMLİ NOTLAR

### Demo Modda:
- ✅ Google butonu çalışır (direkt geçiş yapar)
- ✅ Profil oluşturabilirsin
- ✅ Yayın başlatabilirsin
- ❌ Gerçek auth yok (logout/login olmaz)
- ❌ Supabase'e kullanıcı kaydedilmez

### Tam Google OAuth ile:
- ✅ Gerçek Google hesabıyla giriş
- ✅ Supabase auth çalışır
- ✅ Kullanıcı bilgileri kaydedilir
- ✅ Logout/login çalışır

---

## 🎯 SONRAKI ADIMLAR

Şu an için **Demo Mode yeterli** test etmek için.

Google OAuth'u tam kurmak istersen:
1. Yukarıdaki ADIM 1-4'ü takip et
2. Ben kodu güncelleyeyim
3. Yeni APK build et
4. Test et

---

## 📱 ŞİMDİ TEST ET

Yeni APK'yı yükle:
- `LumiMatch-v3.0.0-DemoAuth.apk`
- Google butonuna bas
- Direkt profil kurulumuna gidecek
- Profil oluştur
- Yayın başlat
- **ARTIK ÇALIŞACAK!** 🎉

