# 🚀 Google Play Console - Hızlı Başlangıç

## 📦 1. ADIM: Google Play Console'a Giriş

1. **https://play.google.com/console** adresine git
2. Gmail hesabınla giriş yap
3. **LumiMatch** uygulamasını seç

---

## 💰 2. ADIM: Token Paketlerini Tanımla (5 Adet)

### Sol menüden:
**Monetize** → **Products** → **In-app products** → **Create product**

### ÜRÜN 1: 100 Jeton
```
Product ID: com.lumimatch.tokens_100
Name: 100 🪙 Jeton
Description: Başlangıç jeton paketi. LumiMatch'te mesajlaşma ve özel özellikler için kullanılır.
Status: Active
```
**Set price** → **Add pricing** → Turkey seç → **79.99 TRY** gir → Save

---

### ÜRÜN 2: 300 Jeton
```
Product ID: com.lumimatch.tokens_300
Name: 300 🪙 Jeton
Description: Popüler jeton paketi - %17 indirimli! Mesajlaşma ve premium özelliklerde kullanılır.
Status: Active
```
**Set price** → Turkey → **199.99 TRY** → Save

---

### ÜRÜN 3: 750 Jeton
```
Product ID: com.lumimatch.tokens_750
Name: 750 🪙 Jeton
Description: Avantajlı jeton paketi - %30 indirimli! Uzun süreli kullanım için idealdir.
Status: Active
```
**Set price** → Turkey → **419.99 TRY** → Save

---

### ÜRÜN 4: 1000 Jeton
```
Product ID: com.lumimatch.tokens_1000
Name: 1000 🪙 Jeton
Description: Süper jeton paketi - %40 indirimli! Yoğun kullanıcılar için tasarlandı.
Status: Active
```
**Set price** → Turkey → **479.99 TRY** → Save

---

### ÜRÜN 5: 1500 Jeton (En Popüler)
```
Product ID: com.lumimatch.tokens_1500
Name: 1500 🪙 Jeton
Description: Premium jeton paketi - %50 indirimli! En avantajlı paket.
Status: Active
```
**Set price** → Turkey → **599.99 TRY** → Save

---

## 👑 3. ADIM: Premium Abonelikleri Tanımla (3 Adet)

### Sol menüden:
**Monetize** → **Products** → **Subscriptions** → **Create subscription**

### ABONELİK 1: 1 Aylık Premium
```
Subscription ID: com.lumimatch.premium_1month
Name: Premium Üyelik (1 Ay)
Description: Sınırsız mesajlaşma, reklamsız deneyim, özel rozet, video call önceliği ve gelişmiş filtreler.
```

**Base plans** → **Add base plan**:
- **Billing period**: Every 1 month (30 days)
- **Price**: Turkey → **99.99 TRY/month**
- **Renewal type**: Auto-renewing
- **Grace period**: 3 days (opsiyonel)

**Save** → **Activate**

---

### ABONELİK 2: 3 Aylık Premium
```
Subscription ID: com.lumimatch.premium_3month
Name: Premium Üyelik (3 Ay)
Description: Tüm premium özellikler + 100 bonus jeton hediye! %17 indirimli.
```

**Base plans** → **Add base plan**:
- **Billing period**: Every 3 months (90 days)
- **Price**: Turkey → **249.99 TRY** (3 aylık toplam)
- **Renewal type**: Auto-renewing

**Save** → **Activate**

---

### ABONELİK 3: 12 Aylık Premium (En Avantajlı)
```
Subscription ID: com.lumimatch.premium_12month
Name: Premium Üyelik (1 Yıl)
Description: Tüm premium özellikler + 500 bonus jeton + VIP rozet + özel destek! %33 indirimli.
```

**Base plans** → **Add base plan**:
- **Billing period**: Every 1 year (365 days)
- **Price**: Turkey → **799.99 TRY** (yıllık toplam)
- **Renewal type**: Auto-renewing

**Save** → **Activate**

---

## ✅ 4. ADIM: Tamamlandı!

Tüm ürünler tanımlandığında:
- ✅ 5 Token paketi (consumable)
- ✅ 3 Premium abonelik (subscription)

**Toplam**: 8 ürün aktif

---

## 🎯 SONRAKI ADIMLAR

### Şimdi Yapılabilir:
1. ✅ Ürünler tanımlandı
2. ⏳ APK yükleme (build sorunu çözülünce)
3. ⏳ Test kullanıcısı ekleme
4. ⏳ Internal testing

### APK Hazır Olunca:
1. **Release** → **Testing** → **Internal testing**
2. **Create new release** → APK yükle
3. **Testers** → Gmail ekle
4. Test et

---

## 💡 İPUCU

Product ID'leri **tam olarak** kopyala-yapıştır:
- `com.lumimatch.tokens_100`
- `com.lumimatch.tokens_300`
- `com.lumimatch.tokens_750`
- `com.lumimatch.tokens_1000`
- `com.lumimatch.tokens_1500`
- `com.lumimatch.premium_1month`
- `com.lumimatch.premium_3month`
- `com.lumimatch.premium_12month`

Harf hatası olursa uygulama ürünleri bulamaz!

---

## 📞 YARDIM

Takıldığın bir yer olursa:
- Screenshot al
- Bana göster
- Devam edelim!

**Başarılar! 🎉**
