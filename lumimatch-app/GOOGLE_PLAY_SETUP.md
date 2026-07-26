# 🎮 Google Play In-App Billing Setup Guide

## ✅ Neler Yapıldı?

### 1. Paket Kurulumu
```bash
npm install react-native-iap --save
```

### 2. Payment Service Oluşturuldu
- `src/services/paymentService.js` - Google Play IAP entegrasyonu
- Token paketleri tanımlandı (100, 300, 750, 1000, 1500 jeton)
- Premium abonelikler tanımlandı (1, 3, 12 ay)

### 3. TokenShopScreen Güncellendi
- Google Play ödeme sistemi entegre edildi
- Gerçek zamanlı ürün fiyatları Google Play'den çekiliy or
- "Geri Yükle" özelliği eklendi
- Ödeme yöntemleri gösteriliyor

---

## 🎯 Google Play Console Kurulumu

### ADIM 1: Google Play Console'a Git
https://play.google.com/console

### ADIM 2: Uygulama Oluştur
1. **Create app** butonuna tıkla
2. Uygulama adı: **LumiMatch**
3. Dil: Türkçe
4. Kategori: Social
5. Ücretli/Ücretsiz: **Ücretsiz** (içerikler ücretli)

### ADIM 3: In-App Products Oluştur
**Monetization → Products → In-app products**

#### Token Paketleri (Consumable)
| Product ID | İsim | Fiyat | Açıklama |
|-----------|------|-------|----------|
| `com.lumimatch.tokens_100` | 100 Jeton | 79.99 TL | Başlangıç Paketi |
| `com.lumimatch.tokens_300` | 300 Jeton | 199.99 TL | Popüler Paket (%17 indirim) |
| `com.lumimatch.tokens_750` | 750 Jeton | 419.99 TL | Avantajlı Paket (%30 indirim) |
| `com.lumimatch.tokens_1000` | 1000 Jeton | 479.99 TL | Süper Paket (%40 indirim) |
| `com.lumimatch.tokens_1500` | 1500 Jeton | 599.99 TL | Premium Paket (%50 indirim) |

Her biri için:
- **Product type:** One-time product (Consumable)
- **Status:** Active
- **Price:** Yukarıdaki fiyat
- **Description:** Yukarıdaki açıklama

#### Premium Abonelikler (Subscriptions)
**Monetization → Products → Subscriptions**

| Product ID | İsim | Fiyat | Süre | Açıklama |
|-----------|------|-------|------|----------|
| `com.lumimatch.premium_1month` | Premium 1 Ay | 99.99 TL/ay | 1 ay | Aylık Premium Üyelik |
| `com.lumimatch.premium_3month` | Premium 3 Ay | 249.99 TL | 3 ay | 3 Aylık Premium (%17 indirim) |
| `com.lumimatch.premium_12month` | Premium 1 Yıl | 799.99 TL/yıl | 12 ay | Yıllık Premium (%33 indirim) |

Her biri için:
- **Base plans:** Aylık/3 Aylık/Yıllık
- **Benefits:** Sınırsız mesajlaşma, Özel rozet, Reklamsız deneyim
- **Grace period:** 3 gün
- **Free trial:** İsteğe bağlı (7 gün)

---

## 📱 Test Etme

### Test Lisansları
**Settings → License Testing**

Test email adresleri ekle:
- kreal2692@gmail.com
- (diğer test emailler)

Test modunda:
- ✅ Gerçek ödeme yapılmaz
- ✅ Ürünler test edilebilir
- ✅ Satın alım akışı test edilir

### Closed Testing (Internal Testing)
1. **Testing → Closed testing → Create track**
2. Test kullanıcıları ekle
3. APK/AAB yükle
4. Test cihazlarında dene

---

## 🔧 Android Build Ayarları

### android/app/build.gradle
```gradle
android {
    ...
    defaultConfig {
        ...
        // Billing library dependency zaten var (react-native-iap tarafından)
    }
}

dependencies {
    ...
    // react-native-iap otomatik ekliyor:
    // implementation 'com.android.billingclient:billing:5.0.0'
}
```

### AndroidManifest.xml
```xml
<manifest>
    <uses-permission android:name="com.android.vending.BILLING" />
    ...
</manifest>
```

---

## 💰 Komisyon Oranları

### Google Play
- **İlk $1M gelir:** %15 komisyon
- **$1M üzeri:** %30 komisyon

### Örnek Hesaplama
- 100 jeton = 79.99 TL
- Google komisyonu (%15): 12 TL
- Net kazanç: 67.99 TL

---

## 🎮 Kullanım Senaryoları

### 1. Kullanıcı Token Satın Alır
```
1. TokenShopScreen'i açar
2. 300 Jeton paketini seçer
3. "Satın Al" butonuna basar
4. Google Play ödeme ekranı açılır
5. Kredi kartı/Operatör faturası/Play bakiyesi ile öder
6. Ödeme onaylanır
7. 300 jeton otomatik eklenir
8. Transaction kaydı oluşturulur
```

### 2. Kullanıcı Premium Üye Olur
```
1. PremiumScreen'i açar
2. 3 Aylık Premium paketini seçer
3. "Abone Ol" butonuna basar
4. Google Play abonelik ekranı açılır
5. Abonelik onaylanır
6. Premium özellikleri aktif olur
7. 90 gün sonra otomatik yenilenir
```

### 3. Satın Alımları Geri Yükleme
```
1. Kullanıcı yeni cihazda giriş yapar
2. TokenShopScreen'de "🔄 Geri Yükle" butonuna basar
3. Google Play'den önceki satın alımları çeker
4. Jetonlar/Premium geri yüklenir
```

---

## 🔒 Güvenlik

### Backend Verification (Opsiyonel - Önerilen)
Supabase Edge Function oluştur:
```typescript
// supabase/functions/verify-purchase/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { productId, purchaseToken, platform } = await req.json()
  
  // Google Play Developer API ile doğrula
  const response = await fetch(
    `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/products/${productId}/tokens/${purchaseToken}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  )
  
  const data = await response.json()
  
  return new Response(
    JSON.stringify({ valid: data.purchaseState === 0 }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

---

## 📊 Analytics & Tracking

### Önemli Metrikler
- **Conversion Rate:** Kaç kullanıcı ödeme yapıyor?
- **ARPU:** Kullanıcı başına ortalama gelir
- **Churn Rate:** Abonelik iptal oranı
- **LTV:** Kullanıcı yaşam boyu değeri

### Google Play Console'da
**Monetization → Earnings**
- Günlük/Aylık gelir
- Ürün bazında satışlar
- Coğrafi dağılım

---

## 🚀 Production Checklist

### Yayına Almadan Önce
- [ ] Tüm ürünler Google Play Console'da tanımlı
- [ ] Fiyatlar doğru ayarlanmış
- [ ] Test lisansları ile test edildi
- [ ] Closed testing tamamlandı
- [ ] Ödeme akışı sorunsuz çalışıyor
- [ ] Geri yükleme özelliği test edildi
- [ ] Backend verification aktif (önerilen)
- [ ] Kullanım koşulları ve gizlilik politikası hazır
- [ ] İade politikası belirtilmiş

### İlk Yayın
1. **Production track** oluştur
2. AAB dosyasını yükle
3. Store listing bilgilerini doldur
4. Content rating al
5. Target audience belirle
6. Review için gönder
7. Onay bekle (1-3 gün)

---

## 📞 Destek & Yardım

### Dokümantasyon
- React Native IAP: https://github.com/dooboolab/react-native-iap
- Google Play Billing: https://developer.android.com/google/play/billing

### Sorun Giderme
**Ürünler yüklenmiyor:**
- Google Play Console'da ürünler "Active" mi?
- APK signed olarak yüklenmiş mi?
- Test lisansı eklenmiş mi?

**Ödeme tamamlanmıyor:**
- `handlePurchaseUpdate` çağrılıyor mu?
- Console logları kontrol et
- Transaction tamamlanmış mı?

**Geri yükleme çalışmıyor:**
- `getAvailablePurchases()` boş döndürüyorsa Google Play'de sorun var
- Kullanıcı aynı Google hesabı ile mi giriş yapmış?

---

## 🎉 Tamamlandı!

Google Play In-App Billing entegrasyonu tamamlandı. Artık:

✅ Kullanıcılar jeton satın alabilir
✅ Premium üyelik abonelikleri alabilir  
✅ Operatör faturası ile ödeme yapabilir
✅ Google Play bakiyesi kullanabilir
✅ Satın alımları geri yükleyebilir

**Sıradaki Adım:** Google Play Console'da ürünleri oluştur ve test et!
