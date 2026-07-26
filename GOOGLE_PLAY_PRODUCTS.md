# 📦 Google Play Console - Ürün Tanımlama Listesi

## 🪙 TOKEN PACKAGES (Consumable Products)

### 1. 100 Jeton Paketi
- **Product ID**: `com.lumimatch.tokens_100`
- **Product Type**: Managed product (consumable)
- **Name**: 100 🪙 Jeton
- **Description**: Başlangıç jeton paketi. LumiMatch uygulamasında mesajlaşma ve özel özellikler için kullanılır.
- **Price**: 79.99 TRY
- **Status**: Active

### 2. 300 Jeton Paketi
- **Product ID**: `com.lumimatch.tokens_300`
- **Product Type**: Managed product (consumable)
- **Name**: 300 🪙 Jeton
- **Description**: Popüler jeton paketi - %17 indirimli! Mesajlaşma ve premium özelliklerde kullanılır.
- **Price**: 199.99 TRY
- **Status**: Active

### 3. 750 Jeton Paketi
- **Product ID**: `com.lumimatch.tokens_750`
- **Product Type**: Managed product (consumable)
- **Name**: 750 🪙 Jeton
- **Description**: Avantajlı jeton paketi - %30 indirimli! Uzun süreli kullanım için idealdir.
- **Price**: 419.99 TRY
- **Status**: Active

### 4. 1000 Jeton Paketi
- **Product ID**: `com.lumimatch.tokens_1000`
- **Product Type**: Managed product (consumable)
- **Name**: 1000 🪙 Jeton
- **Description**: Süper jeton paketi - %40 indirimli! Yoğun kullanıcılar için tasarlandı.
- **Price**: 479.99 TRY
- **Status**: Active

### 5. 1500 Jeton Paketi ⭐ (En Popüler)
- **Product ID**: `com.lumimatch.tokens_1500`
- **Product Type**: Managed product (consumable)
- **Name**: 1500 🪙 Jeton
- **Description**: Premium jeton paketi - %50 indirimli! En avantajlı paket.
- **Price**: 599.99 TRY
- **Status**: Active

---

## 👑 PREMIUM SUBSCRIPTIONS

### 6. 1 Aylık Premium
- **Product ID**: `com.lumimatch.premium_1month`
- **Product Type**: Subscription
- **Name**: Premium Üyelik (1 Ay)
- **Description**: Sınırsız mesajlaşma, reklamsız deneyim, özel rozet, video call önceliği ve gelişmiş filtreler.
- **Billing Period**: 1 month (30 days)
- **Price**: 99.99 TRY/month
- **Free Trial**: 7 days (opsiyonel)
- **Grace Period**: 3 days
- **Status**: Active

### 7. 3 Aylık Premium
- **Product ID**: `com.lumimatch.premium_3month`
- **Product Type**: Subscription
- **Name**: Premium Üyelik (3 Ay)
- **Description**: Tüm premium özellikler + 100 bonus jeton hediye! %17 indirimli.
- **Billing Period**: 3 months (90 days)
- **Price**: 249.99 TRY/3 months
- **Bonus**: +100 tokens upon purchase
- **Status**: Active

### 8. 12 Aylık Premium ⭐ (En Avantajlı)
- **Product ID**: `com.lumimatch.premium_12month`
- **Product Type**: Subscription
- **Name**: Premium Üyelik (1 Yıl)
- **Description**: Tüm premium özellikler + 500 bonus jeton + VIP rozet + özel destek! %33 indirimli.
- **Billing Period**: 1 year (365 days)
- **Price**: 799.99 TRY/year
- **Bonus**: +500 tokens + VIP badge
- **Status**: Active

---

## 📋 GOOGLE PLAY CONSOLE ADIM ADIM

### 1. APK Yükleme
1. Google Play Console → **LumiMatch** uygulaması
2. **Release** → **Testing** → **Internal testing**
3. **Create new release**
4. APK'yı sürükle-bırak veya Upload
5. Release notes yaz:
   ```
   v2.12.0
   - Google Play In-App Billing entegrasyonu
   - 5 token paketi eklendi
   - 3 premium abonelik seçeneği
   - Güvenlik iyileştirmeleri
   ```
6. **Review release** → **Start rollout to Internal testing**

### 2. Token Packages (Consumables) Tanımlama
1. **Monetize** → **Products** → **In-app products**
2. **Create product** (5 kez tekrarla):
   
   **Her ürün için**:
   - Product ID gir (yukarıdaki listeden)
   - Name gir (Türkçe)
   - Description gir
   - **Set price** → Turkey → TRY fiyat gir
   - **Save** ve **Activate**

### 3. Premium Subscriptions Tanımlama
1. **Monetize** → **Products** → **Subscriptions**
2. **Create subscription** (3 kez tekrarla):
   
   **Her abonelik için**:
   - Product ID gir
   - Name gir (Türkçe)
   - Description gir
   - **Base plans** → Add base plan:
     - Billing period: 1 month / 3 months / 1 year
     - Price: Turkey → TRY fiyat gir
     - Renewal type: Auto-renewing
     - Grace period: 3 days (opsiyonel)
   - **Save** ve **Activate**

### 4. Test Kullanıcısı Ekleme
1. **Internal testing** → **Testers** sekmesi
2. **Create email list**
3. Gmail adresinizi ekleyin
4. Test linkini kopyalayın

### 5. Test Lisansı (Önemli!)
1. **Setup** → **License testing**
2. Email adresinizi **License testers** listesine ekleyin
3. Test response: **RESPOND_NORMALLY** seçin (gerçek ödeme yapmadan test)

---

## 🧪 TEST SENARYOSU

### Test Kullanıcısı Olarak:
1. Test linkinden uygulamayı indir
2. Uygulamayı aç → Login ol
3. **Token satın al** (100 jeton)
4. Google Play ödeme ekranı gelecek
5. Test kartı kullan (gerçek ücret kesilmez)
6. Jetonların hesabına eklenmesini kontrol et

### Kontrol Edilecekler:
- ✅ Ödeme ekranı açılıyor mu?
- ✅ Ürün fiyatı doğru görünüyor mu?
- ✅ Satın alım tamamlanıyor mu?
- ✅ Jetonlar hesaba ekleniyor mu?
- ✅ Supabase `transactions` tablosuna kayıt düşüyor mu?

---

## 🔗 ÖNEMLI LİNKLER

- **Google Play Console**: https://play.google.com/console
- **Internal Testing Link**: (Google Play Console'dan alınacak)
- **Test Kartlar**: https://developers.google.com/pay/api/android/reference/test-parameters

---

## ⚠️ ÖNEMLİ NOTLAR

### Fiyatlandırma:
- Tüm fiyatlar **KDV dahil** olmalı
- Google 30% komisyon alır (gelir: fiyat × 0.70)
- Örnek: 79.99₺ → Google: 24₺, Sana kalan: 56₺

### Test Lisansı:
- License tester listesindeki kullanıcılar **gerçek ücret ödemeden** test yapabilir
- Fakat Google Play gerçek ödeme akışını simüle eder
- Production'da bu kullanıcılar normal ödeme yapar

### Subscription Grace Period:
- Ödeme başarısız olursa (kredi kartı sorunu)
- 3 gün içinde kullanıcı premium özelliklerini kullanmaya devam eder
- Google otomatik ödeme tekrar dener

### Yayına Alma:
- Internal testing → Closed testing → Open testing → Production
- Her adımda Google review yapar (~24-48 saat)
- Production'a geçmeden önce minimum 14 gün closed testing önerilir

---

## 📞 YARDIM

Takıldığın bir yer olursa:
1. Google Play Console → Help Center
2. Kiro'ya sor (ben buradayım!)
3. Stack Overflow → google-play-billing tag

**Hazırsan APK build edelim!**
