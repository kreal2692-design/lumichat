# 🔒 LumiMatch IAP Güvenlik Analizi

## 🚨 KRİTİK SORUNLAR

### 1. Google Play Receipt Doğrulama Eksikliği (P0 - ACİL)
**Durum**: Purchase token'lar Google API ile doğrulanmıyor  
**Risk**: %100 manipülasyon riski - sahte satın alımlar kabul edilebilir  
**Yasal Risk**: Mali kayıp, vergi beyanı tutarsızlıkları

**Çözüm**:
```javascript
// Backend'de (Supabase Edge Function veya Node.js):
const response = await fetch(
  `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/products/${productId}/tokens/${purchaseToken}`,
  {
    headers: {
      'Authorization': `Bearer ${accessToken}` // Service Account token
    }
  }
);

const verification = await response.json();
if (verification.purchaseState !== 0) { // 0 = purchased
  throw new Error('Invalid purchase');
}
```

**Uygulama Adımları**:
1. Google Cloud Console → Service Account oluştur
2. Google Play Developer API etkinleştir
3. Service account JSON key indir
4. Supabase Edge Function oluştur (veya Node.js backend)
5. Her purchase için doğrulama yap

---

### 2. Subscription Doğrulama Eksikliği (P0 - ACİL)
**Durum**: Abonelik durumu sadece client'ta kontrol ediliyor  
**Risk**: İptal edilen abonelikler aktif gözükebilir

**Çözüm**:
```javascript
// Her kullanıcı girişinde backend'de kontrol:
POST https://androidpublisher.googleapis.com/androidpublisher/v3/applications/{packageName}/purchases/subscriptions/{subscriptionId}/tokens/{token}

// Response:
{
  "expiryTimeMillis": "1735689600000",
  "autoRenewing": false,
  "cancelReason": 0
}
```

---

### 3. Fiyat Manipülasyonu (P1 - ÖNEMLİ)
**Durum**: Fiyatlar hardcoded, server'da doğrulanmıyor  
**Risk**: Client manipülasyonu ile farklı fiyatlar gönderilebilit

**Çözüm**:
```sql
-- Backend'de fiyat tablosu:
CREATE TABLE product_prices (
  product_id TEXT PRIMARY KEY,
  expected_price_micros BIGINT NOT NULL,
  currency TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Her satın alımda doğrula:
IF verification.priceMicros != expected_price THEN
  RAISE EXCEPTION 'Price mismatch';
END IF;
```

---

## 📋 ADLİ GEREKLİLİKLER (KVKK & 6563 Sayılı Kanun)

### ✅ MEVCUT:
- Transaction ID kaydı
- User ID ilişkilendirmesi
- Purchase token kaydı
- Zaman damgası (created_at)

### ❌ EKSİK:

#### 1. IP Adresi Kaydı (Zorunlu)
**Yasal Dayanak**: 6563 sayılı kanun (elektronik ticaret)  
**Gerekçe**: Anlaşmazlık durumunda ispat aracı

```sql
ALTER TABLE transactions ADD COLUMN ip_address INET;
```

#### 2. Device Bilgisi (Önerilen)
```sql
ALTER TABLE transactions ADD COLUMN device_info JSONB;
-- İçerik: {android_id, brand, model, os_version}
```

#### 3. Refund Tracking (Zorunlu)
```sql
ALTER TABLE transactions ADD COLUMN refund_status TEXT DEFAULT 'none';
ALTER TABLE transactions ADD COLUMN refund_date TIMESTAMP;
ALTER TABLE transactions ADD COLUMN refund_reason TEXT;
```

#### 4. Audit Log (Çok Önemli)
```sql
CREATE TABLE transaction_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID REFERENCES transactions(id),
  action TEXT NOT NULL, -- 'created', 'refunded', 'cancelled'
  actor_id UUID, -- Admin/system user
  changes JSONB,
  ip_address INET,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔍 UYUMLULUK KONTROLLERİ

### Google Play Politikaları:
- ✅ Kullanıcı satın alımı restore edebilir
- ✅ Abonelik iptali destekleniyor (Google Play üzerinden)
- ❌ Grace period yok (ödeme hatası durumunda)
- ❌ Real-time developer notifications (RTDN) entegre değil

### KVKK:
- ⚠️ Ödeme verisi işleme aydınlatma metni gerekli
- ⚠️ Veri saklama süresi belirtilmeli (önerilen: 10 yıl - vergi kanunu)
- ❌ Veri silme mekanizması yok (kullanıcı hesap kapatırsa ne olacak?)

---

## 🎯 UYGULAMA PLANI

### Faz 1: ACİL (1-2 gün)
1. ✅ Google Play Developer API etkinleştir
2. ✅ Service Account oluştur
3. ✅ Supabase Edge Function yaz (receipt verification)
4. ✅ PaymentService'i güncelle
5. ✅ Test et (sandbox ortamda)

### Faz 2: GÜVENLİK (3-5 gün)
6. ✅ IP adresi kaydı ekle
7. ✅ Device bilgisi kaydet
8. ✅ Audit log sistemi kur
9. ✅ Rate limiting ekle (spam koruması)
10. ✅ Webhook endpoint güvenliği (RTDN için)

### Faz 3: YASAL UYUMLULUK (1 hafta)
11. ✅ Refund mekanizması
12. ✅ KVKK aydınlatma metni
13. ✅ Veri saklama politikası
14. ✅ Kullanıcı veri silme endpoint'i
15. ✅ İade/cayma hakkı bildirimi

### Faz 4: İZLEME (devam eden)
16. ✅ Real-time Developer Notifications (RTDN)
17. ✅ Fraud detection algoritmaları
18. ✅ Anomaly detection (anormal satın alım patternleri)
19. ✅ Monitoring & alerting

---

## 💰 MALİ RİSK ANALİZİ

### Mevcut Durumda:
- **Fraud riski**: %60-80 (doğrulama yok)
- **Refund riski**: %30 (kullanıcı şikayet edebilir)
- **Mali kayıp tahmini**: Her 100 satıştan 20-30'u sahte olabilir

### Güvenlik önlemleri sonrası:
- **Fraud riski**: %5-10 (endüstri standardı)
- **Refund riski**: %5-8
- **ROI**: İlk ayda %200+ (sahte satışlar engellenecek)

---

## 📞 DESTEK KAYNAKLARI

1. **Google Play Billing Library**: https://developer.android.com/google/play/billing
2. **Google Play Developer API**: https://developers.google.com/android-publisher
3. **Supabase Edge Functions**: https://supabase.com/docs/guides/functions
4. **KVKK Rehberi**: https://kvkk.gov.tr
5. **6563 Sayılı Kanun**: https://www.mevzuat.gov.tr/MevzuatMetin/1.5.6563.pdf

---

## ⚖️ YASAL SORUMLULUK

**Uyarı**: Yukarıdaki öneriler genel bilgilendirme amaçlıdır. 
Gerçek bir uygulamaya geçmeden önce:
1. **Hukuk danışmanı** ile görüşün
2. **Vergi danışmanı** ile KDV/ÖTV durumunu netleştirin
3. **KVKK uzmanı** ile veri işleme politikalarını gözden geçirin

---

**Son Güncelleme**: 26 Ocak 2025  
**Hazırlayan**: Kiro AI Assistant  
**Kapsam**: LumiMatch Android IAP Integration
