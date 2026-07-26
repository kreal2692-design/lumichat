# 🔐 SUPABASE GOOGLE AUTH KURULUMU

## ⚠️ ÖNEMLİ: Bu adımı atlamadan önce mutlaka yap!

---

## 📋 ADIM 1: Supabase Dashboard'a Git

1. Aç: https://supabase.com/dashboard/project/aaszyppzidhazpbmcipv/auth/providers
2. Sol menüden **"Authentication"** → **"Providers"**

---

## 📋 ADIM 2: Google Provider'ı Aktifleştir

1. **"Google"** provider'ına tıkla
2. **"Enable Google provider"** toggle'ını AÇIK yap ✅

---

## 📋 ADIM 3: Google Client ID ve Secret Ekle

### Google Client ID:
```
580861992341-a8n147ppgmdtf4vp1mhbar4dam1m0o9p.apps.googleusercontent.com
```

### Google Client Secret:
**ÖNEMLI:** Google Cloud Console'dan alman gerekiyor!

1. Git: https://console.cloud.google.com/apis/credentials
2. Oluşturduğun OAuth 2.0 Client ID'ye tıkla
3. **"Client secret"** değerini kopyala
4. Supabase'e yapıştır

---

## 📋 ADIM 4: Authorized Redirect URIs

Supabase'de otomatik olarak gösterilen URL'yi Google Cloud Console'a ekle:

1. Git: https://console.cloud.google.com/apis/credentials
2. OAuth 2.0 Client ID'ye tıkla
3. **"Authorized redirect URIs"** bölümüne ekle:
   ```
   https://aaszyppzidhazpbmcipv.supabase.co/auth/v1/callback
   ```
4. **SAVE** bas

---

## 📋 ADIM 5: Supabase'de Kaydet

1. Supabase'de **"Save"** butonuna bas
2. **"Google provider enabled"** mesajını gör ✅

---

## ✅ TAMAMLANDI!

Artık Google Sign-In çalışacak:
- ✅ Kullanıcılar Google hesabıyla giriş yapabilir
- ✅ Profil bilgileri otomatik doldurulur
- ✅ Avatar fotoğrafı Google'dan gelir
- ✅ Supabase auth çalışır

---

## 🎯 SONRAKI ADIM: APK'yı Test Et

Yeni APK build edildi: **LumiMatch-v3.0.0-GoogleAuth.apk**

Test et:
1. APK'yı telefonuna yükle
2. "Google ile Devam Et" butonuna bas
3. Google hesabını seç
4. İzinleri ver
5. Profil kurulumuna git (ilk giriş)
6. Ana sayfaya git
7. Tüm özellikler çalışır! 🎉

---

## ⚠️ SORUN YAŞARSAN:

### "Sign in failed" hatası:
- Client Secret'i doğru yazdın mı kontrol et
- Redirect URI'yi Google Cloud'a ekledin mi?

### "Invalid token" hatası:
- Supabase'de Google provider açık mı?
- Client ID doğru mu?

### "Play Services not available":
- Google Play Services güncel mi kontrol et
