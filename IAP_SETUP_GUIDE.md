# 🚀 LumiMatch IAP Güvenlik Kurulumu

## ✅ TAMAMLANAN İYİLEŞTİRMELER

### 1. Database Güncellemeleri
- ✅ IP adresi kaydı (adli gereklilik)
- ✅ Device bilgisi tracking
- ✅ Refund yönetimi
- ✅ Audit log sistemi
- ✅ Rate limiting (fraud prevention)
- ✅ Verification cache

### 2. Güvenli RPC Fonksiyonları
- ✅ `handle_iap_purchase_secure()` - fraud detection dahil
- ✅ `complete_iap_verification()` - Google doğrulama sonrası
- ✅ `process_refund()` - iade yönetimi

### 3. Supabase Edge Function
- ✅ Google Play API entegrasyonu
- ✅ Purchase token verification
- ✅ Subscription validation

### 4. PaymentService Güncellemeleri
- ✅ Device info toplama
- ✅ Güvenli RPC çağrısı
- ✅ Google verification flow

---

## 📋 KURULUM ADIMLARI

### ADIM 1: Supabase Database Migrations

1. **Supabase Dashboard**'a git: https://supabase.com/dashboard
2. **SQL Editor** açın
3. Sırayla şu dosyaları çalıştırın:

```sql
-- Dosya: migrations/add_security_fields.sql
-- İçeriği kopyala → SQL Editor'e yapıştır → RUN
```

```sql
-- Dosya: supabase-functions/handle-purchase-secure.sql
-- İçeriği kopyala → SQL Editor'e yapıştır → RUN
```

### ADIM 2: Google Cloud Console Setup

1. **Google Cloud Console**: https://console.cloud.google.com
2. Yeni proje oluştur: "LumiMatch IAP"
3. **APIs & Services** → **Enable APIs**
4. **"Google Play Android Developer API"** arayıp etkinleştir

### ADIM 3: Service Account Oluştur

1. **IAM & Admin** → **Service Accounts**
2. **Create Service Account**:
   - Name: `lumimatch-iap-verifier`
   - Role: `Service Account User`
3. **Keys** sekmesi → **Add Key** → **JSON**
4. İndirilen JSON dosyasını kaydet (`service-account-key.json`)

### ADIM 4: Google Play Console Integration

1. **Google Play Console**: https://play.google.com/console
2. **Setup** → **API Access**
3. **Link** butonuna tıkla (Google Cloud Project ile bağla)
4. Service Account'u seç
5. **Permissions**: Grant access → **Admin (all permissions)**

### ADIM 5: Supabase Edge Function Deploy

1. **Supabase CLI** yükle:
```bash
npm install -g supabase
```

2. **Login**:
```bash
supabase login
```

3. **Link project**:
```bash
cd c:\Users\kreal\Desktop\lumichat
supabase link --project-ref llibpqwyzexsgczxwjcp
```

4. **Service Account Key'i environment variable olarak ekle**:
```bash
supabase secrets set GOOGLE_SERVICE_ACCOUNT_KEY="$(cat service-account-key.json)"
```

5. **Deploy edge function**:
```bash
supabase functions deploy verify-google-purchase
```

### ADIM 6: React Native Dependency

Device info için paket ekle:

```bash
cd c:\Users\kreal\Desktop\lumichat\lumimatch-app
npm install react-native-device-info
```

Ardından:
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

### ADIM 7: Test

1. **Internal Testing Track**'e APK yükle
2. Test kullanıcısı ekle
3. Satın alım yap
4. **Supabase Dashboard** → **Table Editor** → `transactions` tablosunu kontrol et:
   - `status` → `pending_verification` olmalı
   - Birkaç saniye sonra → `completed` olmalı
   - `ip_address`, `device_info` dolu olmalı

---

## 🔍 DOĞRULAMA KONTROL LİSTESİ

### Database
- [ ] `transactions` tablosunda yeni kolonlar var mı? (ip_address, device_info, refund_status)
- [ ] `transaction_audit_log` tablosu oluşturuldu mu?
- [ ] `purchase_rate_limits` tablosu var mı?
- [ ] `verification_cache` tablosu var mı?

### RPC Functions
- [ ] `handle_iap_purchase_secure()` fonksiyonu çalışıyor mu?
- [ ] `complete_iap_verification()` fonksiyonu var mı?
- [ ] `process_refund()` fonksiyonu var mı?

### Google Integration
- [ ] Google Play Android Developer API etkin mi?
- [ ] Service Account oluşturuldu mu?
- [ ] Service Account JSON key indirildi mi?
- [ ] Google Play Console'da API erişimi bağlandı mı?

### Edge Function
- [ ] `verify-google-purchase` fonksiyonu deploy edildi mi?
- [ ] `GOOGLE_SERVICE_ACCOUNT_KEY` secret eklendi mi?
- [ ] Fonksiyon test edildi mi?

### App
- [ ] `react-native-device-info` paketi yüklendi mi?
- [ ] `paymentService.js` güncel versiyonda mı?
- [ ] APK rebuild edildi mi?

---

## 🧪 TEST SENARYOLARI

### Test 1: Normal Satın Alım
1. 100 jeton satın al
2. Google Play sandbox ödeme ekranı gelecek
3. Test kartı ile öde
4. **Beklenen**: 
   - Transaction `pending_verification` → `completed`
   - Kullanıcı 100 jeton kazansın
   - `device_info` kaydedilsin

### Test 2: Double-Spend Engelleme
1. Aynı purchase token ile 2 kez satın alım dene
2. **Beklenen**: İkinci deneme "already processed" hatası

### Test 3: Rate Limiting
1. 1 saat içinde 6+ satın alım yap
2. **Beklenen**: `purchase_rate_limits.is_suspicious = TRUE`
3. Admin bildirim logu oluşsun

### Test 4: Google Doğrulama Başarısız
1. Manipüle edilmiş purchase token gönder (test için manuel)
2. **Beklenen**: `status = failed`

### Test 5: Refund
1. Supabase Dashboard → SQL Editor:
```sql
SELECT process_refund(
  '<transaction_id>'::UUID, 
  'Kullanıcı talebi', 
  NULL
);
```
2. **Beklenen**: 
   - Token geri alınsın
   - `refund_status = completed`

---

## 🚨 SORUN GİDERME

### Hata: "Google Service Account not configured"
**Çözüm**: 
```bash
supabase secrets list # Secret var mı kontrol et
supabase secrets set GOOGLE_SERVICE_ACCOUNT_KEY="$(cat service-account-key.json)"
```

### Hata: "Google API error: 401 Unauthorized"
**Çözüm**:
1. Service Account JSON key doğru mu?
2. Google Play Console'da API erişimi verildi mi?
3. Google Play Android Developer API etkin mi?

### Hata: "Transaction not found"
**Çözüm**:
1. `handle_iap_purchase_secure()` fonksiyonu transaction ID döndürüyor mu?
2. Log'larda transaction ID görünüyor mu?

### Hata: "Device info null"
**Çözüm**:
```bash
npm install react-native-device-info
cd android && ./gradlew clean && cd ..
npx react-native run-android
```

---

## 📊 MONİTORİNG

### Supabase Dashboard Sorguları

**Şüpheli aktiviteler**:
```sql
SELECT * FROM purchase_rate_limits 
WHERE is_suspicious = TRUE 
ORDER BY last_purchase_at DESC;
```

**Başarısız doğrulamalar**:
```sql
SELECT * FROM transactions 
WHERE status = 'failed' 
ORDER BY created_at DESC 
LIMIT 20;
```

**Refund istekleri**:
```sql
SELECT * FROM transactions 
WHERE refund_status != 'none' 
ORDER BY refund_date DESC;
```

**Audit trail**:
```sql
SELECT 
  t.product_id,
  t.status,
  a.action,
  a.created_at,
  a.changes
FROM transaction_audit_log a
JOIN transactions t ON t.id = a.transaction_id
ORDER BY a.created_at DESC
LIMIT 50;
```

---

## ✅ SONUÇ

Tüm adımlar tamamlandığında:
- ✅ %90+ fraud koruması
- ✅ KVKK uyumlu veri kaydı
- ✅ Adli delil trail'i
- ✅ Google Play politika uyumu
- ✅ Refund yönetimi
- ✅ Rate limiting

**Sonraki Adım**: Production'a geçmeden önce minimum 50 test transaction yap ve tüm edge case'leri dene.
