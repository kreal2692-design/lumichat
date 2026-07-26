# Supabase "Invalid API Key" Hatası - Debug Rehberi

## Yapılan Değişiklikler

### 1. Network Security Config Eklendi
**Dosya:** `android/app/src/main/res/xml/network_security_config.xml`

Android uygulamasının Supabase sunucusuna HTTPS bağlantısı kurabilmesi için network security config eklendi. Bu, bazı Android cihazlarında SSL/TLS sertifika sorunlarını çözer.

### 2. AndroidManifest.xml Güncellendi
**Değişiklik:** Network security config referansı eklendi

```xml
android:networkSecurityConfig="@xml/network_security_config"
android:usesCleartextTraffic="false"
```

### 3. AuthScreen.js'e Debug Özellikleri Eklendi

#### a) Detaylı Error Logging
- Her auth işleminde kapsamlı console.log
- Error code, status ve message yakalama
- Stack trace loglama

#### b) Connection Health Check
`testSupabaseConnection()` fonksiyonu eklendi:
- **Test 1:** HTTP bağlantısı (fetch ile)
- **Test 2:** Supabase client (database query)
- **Test 3:** Auth endpoint kontrolü

#### c) Debug Info Display
- Gerçek zamanlı işlem durumu gösterimi
- Kullanıcıya görsel feedback
- Hata detayları UI'da görüntülenir

#### d) Test Butonu
"🧪 Supabase Bağlantısını Test Et" butonu eklendi - Bu buton tıklandığında:
1. HTTP bağlantısını test eder
2. Supabase client'ı test eder
3. Auth endpoint'i test eder
4. Sonuçları alert ve debug banner'da gösterir

## Kullanım

### APK Build
```powershell
# Expo export
cd c:\Users\kreal\Desktop\lumichat\lumimatch-app
npx expo export --platform android --output-dir android/app/build/generated/expo

# Bundle kopyala (PowerShell)
Get-Content "android/app/build/generated/expo/index.hbc" -Raw | Set-Content "android/app/src/main/assets/index.android.bundle" -NoNewline

# Gradle build
cd android
.\gradlew assembleRelease --no-daemon

# APK kopyala
Copy-Item "app/build/outputs/apk/release/app-release.apk" "C:\Users\kreal\Desktop\LumiMatch-v3.0.2-DEBUG.apk"
```

### Test Süreci

1. **APK'yı yükle**
2. **Uygulamayı aç**
3. **"🧪 Supabase Bağlantısını Test Et" butonuna tıkla**
4. **Sonuçları gözlemle:**
   - ✅ Tüm testler başarılı → Supabase çalışıyor, email/şifre kullanılabilir
   - ❌ Test 1 başarısız → İnternet bağlantısı veya firewall sorunu
   - ❌ Test 2 başarısız → Supabase API key veya database sorunu
   - ❌ Test 3 başarısız → Auth endpoint sorunu

## Olası Hatalar ve Çözümleri

### Hata: "Network request failed"
**Sebep:** Android cihazda internet yok veya firewall
**Çözüm:** 
- Wifi/mobil veri kontrol et
- VPN kullanıyorsan kapat
- Başka bir ağda dene

### Hata: "Invalid API key"
**Sebep 1:** API key yanlış kopyalanmış
**Çözüm:** App.js'deki SUPABASE_ANON_KEY'i kontrol et

**Sebep 2:** Supabase projesinde sorun
**Çözüm:** Supabase Dashboard → Settings → API → Anon key'i yeniden kopyala

**Sebep 3:** Supabase projesi paused/inactive
**Çözüm:** Supabase Dashboard'da projeyi active et

### Hata: "Failed to establish connection"
**Sebep:** Android network security config sorunu
**Çözüm:** `network_security_config.xml` doğru mu kontrol et

### Hata: "JWT malformed"
**Sebep:** API key'in başında/sonunda boşluk karakteri
**Çözüm:** API key'i temiz kopyala (trim et)

## Debug Özellikleri

### Console Logs
Logcat'te şunları arayın:
```
🧪 === SUPABASE BAĞLANTI TESTİ BAŞLADI ===
✅ HTTP Response: 200
✅ Supabase query OK
✅ Auth endpoint OK
```

### UI Debug Banner
AuthScreen'de sarı bir banner görünecek:
- 🔄 → İşlem devam ediyor
- ✅ → Başarılı
- ❌ → Hata oluştu

## Sonraki Adımlar

### Eğer Test Başarılı ise (✅):
1. `DEMO_MODE = false` yap
2. Email/şifre ile kayıt ol
3. Google OAuth'u test et

### Eğer Test Başarısız ise (❌):
1. Console logları incele
2. Debug banner'daki mesajı oku
3. İnternet bağlantısını kontrol et
4. Supabase Dashboard'dan project status'u kontrol et
5. Farklı bir cihaz/emulator'da test et

### Alternatif Çözüm: Supabase Değiştir
Eğer sorun devam ederse, alternatif backend'ler:
- **Firebase Authentication** (ücretsiz quota daha düşük)
- **AWS Cognito** (daha karmaşık)
- **Auth0** (ücretli)
- **Kendi Node.js backend'in** (tam kontrol)

## Supabase Projesi Bilgileri

**Proje:** llibpqwyzexsgczxwjcp
**URL:** https://llibpqwyzexsgczxwjcp.supabase.co
**Region:** (Dashboard'dan kontrol et)
**Status:** Active olmalı

### Kontrol Listesi
- [ ] Supabase projesi "Active" durumda
- [ ] Google OAuth provider enabled
- [ ] Email provider enabled
- [ ] "Confirm email" disabled
- [ ] Redirect URLs doğru: `lumimatch://auth/callback`
- [ ] API keys doğru kopyalanmış
- [ ] Internet bağlantısı var
- [ ] Android permissions doğru (INTERNET permission var)

## İletişim

Test sonuçlarını paylaş:
- ✅/❌ Test 1 (HTTP)
- ✅/❌ Test 2 (Supabase Client)
- ✅/❌ Test 3 (Auth Endpoint)
- Console log çıktıları
- Hangi cihaz/Android versiyonu

Bu bilgilerle daha spesifik çözüm bulabiliriz.
