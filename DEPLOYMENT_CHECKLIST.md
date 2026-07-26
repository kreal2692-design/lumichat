# 🚀 IN-APP PURCHASE DEPLOYMENT CHECKLIST

## ✅ TAMAMLANAN İŞLER

### 1. Kod İmplementasyonu
- ✅ `paymentService.js` - Google Play IAP entegrasyonu
- ✅ `TokenShopScreen.js` - UI ve satın alma akışı
- ✅ `server.js` - Transaction API endpoints
- ✅ `react-native-iap` paketi kuruldu (v15.6.0)
- ✅ Keystore oluşturuldu (`lumimatch-release-key.keystore`)

### 2. SQL Migration Hazır
- ✅ `migrations/transactions_table.sql` oluşturuldu
- ⏳ **ŞİMDİ YAPILACAK**: Supabase'de çalıştırılacak

---

## 🔥 ŞİMDİ YAPILACAKLAR

### ADIM 1: Database Migration Çalıştır

**Nereye:** Supabase Dashboard → SQL Editor
**Dosya:** `c:\Users\kreal\Desktop\lumichat\migrations\transactions_table.sql`

**Yöntem:**
1. https://supabase.com/dashboard → Proje seç
2. Sol menü → **SQL Editor**
3. "+ New Query" butonuna tıkla
4. SQL dosyasını kopyala-yapıştır
5. **RUN** butonuna tıkla
6. ✅ Success mesajı kontrol et

**Kontrol Komutu:**
```sql
-- Tablonun oluştuğunu doğrula
SELECT * FROM transactions LIMIT 1;
```

---

### ADIM 2: Server.js'i Deploy Et

**Nereye:** Glitch.com → lumichat projesi
**Dosya:** `c:\Users\kreal\Desktop\lumichat\server.js`

**Yöntem 1: Glitch Editor (Önerilen)**
1. https://glitch.com/edit/#!/lumichat → Giriş yap
2. Sol dosya listesinde `server.js` dosyasını aç
3. Transaction API kodunu kopyala-yapıştır (satır 232-337)
4. Glitch otomatik save yapar ve restart eder
5. Logs'dan "Server listening" mesajını bekle

**Yöntem 2: Git Push (Alternatif)**
```bash
cd c:\Users\kreal\Desktop\lumichat
git add server.js
git commit -m "feat: Add Google Play IAP transaction API"
git push origin main
```

**Test URL'leri:**
- Health check: https://lumichat.glitch.me/health
- Transaction endpoint: https://lumichat.glitch.me/api/transactions

---

### ADIM 3: Google Play Console Kurulumu

**Nereye:** Google Play Console → Uygulama → Uygulama İçi Ürünler

#### 3.1 Consumable Products (Jetonlar) Oluştur

5 adet **Yönetilen Ürün** (Managed Product) ekle:

| Ürün ID | İsim | Fiyat | Açıklama |
|---------|------|-------|----------|
| `com.lumimatch.tokens_100` | 100 Jeton Paketi | ₺79.99 | Başlangıç paketi |
| `com.lumimatch.tokens_300` | 300 Jeton Paketi | ₺199.99 | %17 İndirimli |
| `com.lumimatch.tokens_750` | 750 Jeton Paketi | ₺419.99 | %30 İndirimli |
| `com.lumimatch.tokens_1000` | 1000 Jeton Paketi | ₺479.99 | %40 İndirimli |
| `com.lumimatch.tokens_1500` | 1500 Jeton Paketi | ₺599.99 | %50 İndirim 🔥 |

**Her ürün için:**
- Base Plan → Active yap
- Fiyat → TRY olarak ayarla
- Status → Active yap

#### 3.2 Subscription Products (Premium) Oluştur

3 adet **Abonelik** (Subscription) ekle:

| Ürün ID | İsim | Fiyat | Periyot |
|---------|------|-------|---------|
| `com.lumimatch.premium_1month` | Aylık Premium | ₺99.99 | 1 ay |
| `com.lumimatch.premium_3month` | 3 Aylık Premium | ₺249.99 | 3 ay |
| `com.lumimatch.premium_12month` | Yıllık Premium | ₺799.99 | 12 ay |

**Her abonelik için:**
- Base Plan → Active yap
- Billing Period → Ayarla
- Status → Active yap
- Grace Period → 3 gün (önerilen)

---

### ADIM 4: Android Build & Test

#### 4.1 Signed APK/AAB Oluştur

**Seçenek 1: Android Studio (Önerilen)**
```
1. Android Studio'yu aç
2. Open Project → android/ klasörünü seç
3. Build → Generate Signed Bundle/APK
4. Keystore: lumimatch-release-key.keystore
5. Password: LumiMatch2024
6. Alias: lumimatch-key-alias
7. Build Variant: release
8. APK veya AAB seç
```

**Seçenek 2: Gradle (Komut Satırı)**
```bash
cd c:\Users\kreal\Desktop\lumichat\lumimatch-app\android
.\gradlew bundleRelease
# Output: android/app/build/outputs/bundle/release/app-release.aab
```

#### 4.2 Internal Testing Track'e Yükle

1. Play Console → Release → Testing → Internal Testing
2. Create New Release
3. AAB dosyasını yükle
4. Release Notes ekle
5. Review & Release

#### 4.3 Test Kullanıcıları Ekle

1. Internal Testing → Testers
2. Email listesi ekle (Google hesapları)
3. Test linki paylaş (opt-in URL)

---

### ADIM 5: Test Senaryoları

#### Test 1: Jeton Satın Alma
1. Test kullanıcısı olarak giriş yap
2. Token Shop ekranını aç
3. "100 Jeton" paketini seç
4. Google Play ödeme ekranı gelecek
5. Test kartı ile ödeme yap
6. ✅ Jetonlar hesaba eklenmeli
7. Backend'de transaction kaydı olmalı

#### Test 2: Premium Abonelik
1. Premium Üye Ol seç
2. "1 Aylık Premium" seç
3. Abonelik onaylama
4. ✅ Premium aktif olmalı
5. Premium özelliklere erişim kontrolü

#### Test 3: Restore Purchases
1. Uygulamayı sil
2. Yeniden kur & giriş yap
3. "Satın Alımları Geri Yükle" tıkla
4. ✅ Tüm satın almalar geri yüklenmeli

---

## 🔒 GÜVENLİK NOTLARI

### ⚠️ ÖNEMLİ: Receipt Verification Eklenmeli

**Şu an:** Frontend'den gelen purchase token'a güveniliyor
**Risk:** Sahte satın alma istekleri gönderilebilir

**Çözüm:** Google Play Developer API entegrasyonu

```javascript
// server.js'e eklenecek (ileride)
const { google } = require('googleapis');

async function verifyPurchase(packageName, productId, purchaseToken) {
  const androidPublisher = google.androidpublisher('v3');
  
  const result = await androidPublisher.purchases.products.get({
    packageName,
    productId,
    token: purchaseToken,
    auth: oauth2Client
  });
  
  return result.data.purchaseState === 0; // 0 = purchased
}
```

**Gerekli:**
- Google Cloud Console → API'yi aktif et
- Service Account oluştur
- JSON key indir
- Play Console'da bağla

---

## 📊 Monitoring & Logs

### Backend Logs (Glitch)
```bash
# Glitch dashboard → Logs sekmesi
# Transaction kayıtlarını izle:
[IAP] {userId} kullanıcısına {amount} jeton eklendi
```

### App Logs (React Native)
```bash
npx expo run:android
# Console'da IAP loglarını gör:
[IAP] ✅ Connection initialized
[IAP] 💰 Purchasing: com.lumimatch.tokens_100
[IAP] ✅ Transaction saved
```

### Supabase Logs
```sql
-- Son 10 transaction'ı gör
SELECT 
  t.created_at,
  u.username,
  t.product_id,
  t.amount,
  t.price,
  t.status
FROM transactions t
JOIN users u ON t.user_id = u.id
ORDER BY t.created_at DESC
LIMIT 10;
```

---

## 🎯 SON KONTROL LİSTESİ

- [ ] `transactions` tablosu Supabase'de oluşturuldu
- [ ] Server.js Glitch'e deploy edildi
- [ ] Google Play Console'da 8 ürün tanımlandı (5 token + 3 premium)
- [ ] Internal Testing track oluşturuldu
- [ ] Test kullanıcıları eklendi
- [ ] Signed AAB/APK oluşturuldu ve yüklendi
- [ ] Test satın alımı başarılı
- [ ] Jetonlar hesaba eklendi
- [ ] Backend'de transaction kaydı var
- [ ] Receipt verification eklenmesi planlandı

---

## 📞 YARDIM

Sorun yaşarsan:
1. Backend logs kontrol et (Glitch)
2. App logs kontrol et (npx expo run:android)
3. Supabase logs kontrol et
4. Google Play Console → Order Management → Test satın alımları gör

**Kritik Dosyalar:**
- Backend: `c:\Users\kreal\Desktop\lumichat\server.js`
- Payment Service: `c:\Users\kreal\Desktop\lumichat\lumimatch-app\src\services\paymentService.js`
- Migration: `c:\Users\kreal\Desktop\lumichat\migrations\transactions_table.sql`
- Keystore: `c:\Users\kreal\Desktop\lumichat\lumimatch-app\android\app\lumimatch-release-key.keystore`
- Credentials: `c:\Users\kreal\Desktop\lumichat\lumimatch-app\KEYSTORE_INFO.txt`

---

**Not:** Build işlemi yerel CMake sorunları nedeniyle başarısız olabilir. Bu durumda **Android Studio GUI** kullanarak build almak en garanti yöntem.
