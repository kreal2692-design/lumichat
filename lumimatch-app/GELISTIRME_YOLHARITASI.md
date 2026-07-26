# 🗺️ LumiMatch App - Geliştirme Yol Haritası

## ✅ TAMAMLANANLAR (Faz 1)

### Temel Yapı
- [x] React Native + Expo kurulumu
- [x] Navigation sistemi
- [x] Supabase entegrasyonu
- [x] Temel tema (renkler, stiller)

### Ekranlar
- [x] SplashScreen (açılış animasyonu)
- [x] AuthScreen (Google OAuth)
- [x] ProfileSetupScreen (kullanıcı adı, cinsiyet, doğum tarihi)
- [x] HomeScreen (ana dashboard)
- [x] TokenShopScreen (jeton paketleri)
- [x] PremiumScreen (premium planlar)
- [x] VideoCallScreen (placeholder)

---

## 🚧 YAPILACAKLAR

### Faz 2: WebRTC Görüntülü Sohbet (1 Hafta)

**Öncelik: YÜKSEK** 🔴

1. **Socket.io Client**
   - [ ] `socket.io-client` kurulumu
   - [ ] Server bağlantısı (`https://lumimatch.net`)
   - [ ] Eşleşme eventi dinleme
   - [ ] Bağlantı kopma yönetimi

2. **WebRTC Kurulumu**
   - [ ] `react-native-webrtc` kurulumu
   - [ ] Kamera izni (iOS & Android)
   - [ ] Mikrofon izni
   - [ ] Local stream başlatma
   - [ ] Remote stream alma

3. **Peer Connection**
   - [ ] RTCPeerConnection oluşturma
   - [ ] Offer/Answer (SDP) exchange
   - [ ] ICE candidates exchange
   - [ ] Connection state monitoring

4. **UI/UX**
   - [ ] Video preview (local)
   - [ ] Partner video (remote)
   - [ ] Ses/video kapatma butonları
   - [ ] "Next" butonu (yeni eşleşme)
   - [ ] "Report" butonu (şikayet)
   - [ ] Chat mesajları (text)

5. **Eşleşme Mantığı**
   - [ ] Cinsiyet filtresi uygulama
   - [ ] Waiting queue yönetimi
   - [ ] Jeton düşürme
   - [ ] Eşleşme başarılı/başarısız durumları

---

### Faz 3: Monetizasyon (3-4 Gün)

**Öncelik: YÜKSEK** 🔴

1. **In-App Purchase (Jeton Satışı)**
   - [ ] `expo-in-app-purchases` kurulumu
   - [ ] Google Play Console yapılandırma
     - [ ] Managed products (jeton paketleri)
     - [ ] Test hesapları
   - [ ] Apple App Store Connect yapılandırma
     - [ ] Consumables (jeton paketleri)
     - [ ] Sandbox test
   - [ ] Satın alma flow UI
   - [ ] Ödeme doğrulama (backend)
   - [ ] Jeton bakiyesi güncelleme

2. **Abonelik Sistemi (Premium)**
   - [ ] Auto-renewable subscriptions
   - [ ] Premium planları tanımlama
   - [ ] Abonelik durumu kontrolü
   - [ ] Abonelik yenileme mantığı
   - [ ] İptal / geri ödeme yönetimi

3. **AdMob Reklamlar (Ücretsiz Kullanıcılar)**
   - [ ] `expo-ads-admob` kurulumu
   - [ ] Banner reklamlar (HomeScreen altında)
   - [ ] Interstitial reklamlar (eşleşme arası)
   - [ ] Rewarded video reklamlar (jeton kazanma)

---

### Faz 4: Sosyal Özellikler (1 Hafta)

**Öncelik: ORTA** 🟡

1. **Profil Sistemi**
   - [ ] Profil fotoğrafı yükleme
   - [ ] Bio ekleme
   - [ ] Profil görüntüleme
   - [ ] Profil düzenleme

2. **Arkadaş Sistemi**
   - [ ] Arkadaş ekleme
   - [ ] Arkadaş listesi
   - [ ] Arkadaşlık istekleri
   - [ ] Online/offline durumu

3. **Hediye Sistemi**
   - [ ] Hediye gönderme UI
   - [ ] Hediye animasyonları
   - [ ] Hediyeyi jetona çevirme

4. **Chat History**
   - [ ] Mesaj geçmişi saklama
   - [ ] Chat listesi ekranı
   - [ ] Mesaj silme

---

### Faz 5: Bildirimler & Engagement (3-4 Gün)

**Öncelik: ORTA** 🟡

1. **Push Notifications**
   - [ ] Expo Push Token alma
   - [ ] Backend'e kaydetme
   - [ ] Eşleşme bildirimleri
   - [ ] Mesaj bildirimleri
   - [ ] Arkadaşlık isteği bildirimleri
   - [ ] Bildirim ayarları

2. **Günlük Görevler**
   - [ ] Görev listesi ekranı
   - [ ] Görev ilerleme tracking
   - [ ] Ödül (jeton) verme
   - [ ] Günlük sıfırlama

3. **Referans Sistemi**
   - [ ] Referans kodu oluşturma
   - [ ] Link paylaşma
   - [ ] Referans bonusu verme

---

### Faz 6: Analytics & Optimizasyon (2-3 Gün)

**Öncelik: DÜŞÜK** 🟢

1. **Analytics**
   - [ ] Firebase Analytics kurulumu
   - [ ] Event tracking (eşleşme, satın alma, vb.)
   - [ ] User properties
   - [ ] Crash reporting

2. **Performance**
   - [ ] Image optimization
   - [ ] Bundle size azaltma
   - [ ] Memory leak kontrolü
   - [ ] FPS monitoring

3. **A/B Testing**
   - [ ] Firebase Remote Config
   - [ ] Farklı UI varyantları test etme

---

### Faz 7: Ek Özellikler (İsteğe Bağlı)

**Öncelik: DÜŞÜK** 🟢

1. **Gelişmiş Filtreler**
   - [ ] Konum filtresi (premium)
   - [ ] Yaş aralığı filtresi (premium)
   - [ ] Dil filtresi

2. **Tema Sistemi**
   - [ ] Dark/Light mode toggle
   - [ ] Renk temaları (premium)

3. **Güvenlik**
   - [ ] 2FA (iki faktörlü doğrulama)
   - [ ] Hesap silme
   - [ ] Veri indirme (GDPR)

4. **Offline Mode**
   - [ ] Mesaj kuyruğu (offline gönderme)
   - [ ] Profil cache

---

## 📊 Tahmini Süre

| Faz | Özellik | Süre | Öncelik |
|-----|---------|------|---------|
| ✅ 1 | Temel Yapı | TAMAMLANDI | - |
| 🚧 2 | WebRTC | 5-7 gün | YÜKSEK |
| 💰 3 | Monetizasyon | 3-4 gün | YÜKSEK |
| 👥 4 | Sosyal | 5-7 gün | ORTA |
| 🔔 5 | Bildirimler | 3-4 gün | ORTA |
| 📈 6 | Analytics | 2-3 gün | DÜŞÜK |
| ⭐ 7 | Ek Özellikler | 3-5 gün | DÜŞÜK |

**Toplam MVP (Minimum Viable Product):** ~2-3 hafta
**Tam özellikli:** ~4-6 hafta

---

## 🎯 Hemen Yapılacaklar (Bu Hafta)

1. ✅ Temel yapı kurulumu (TAMAMLANDI)
2. 🚧 WebRTC VideoCallScreen implementasyonu
3. 🚧 Socket.io bağlantısı
4. 🚧 Eşleşme algoritması test

---

## 💡 Geliştirme Notları

### WebRTC için Gerekli Adımlar:

```bash
# 1. WebRTC kurulumu
npm install react-native-webrtc

# 2. Socket.io client
npm install socket.io-client

# 3. Kamera izinleri (app.json'da zaten var)
```

### Test Etme:

- İki telefon gerekli (veya emulator + telefon)
- Aynı WiFi ağında test et
- STUN/TURN server gerekebilir (production için)

### Backend Değişiklikleri:

Mevcut `server.js` WebRTC için hazır, ama:
- [ ] Mobile client için signaling endpoint'leri test et
- [ ] STUN/TURN server ekle (production)
- [ ] Room management iyileştir

---

## 📱 Store Yayınlama (Final)

### Google Play:
1. Keystore oluştur
2. APK/AAB build
3. Store listing hazırla
4. In-App Purchase test et
5. Yayınla

### Apple App Store:
1. Developer account ($99/yıl)
2. App Store Connect'te uygulama oluştur
3. Screenshots hazırla
4. Review için gönder
5. Onay bekle (~2-7 gün)

---

## 🎉 Başarı Metrikleri

**MVP başarılı sayılır eğer:**
- [x] Temel yapı çalışıyor
- [ ] Görüntülü sohbet çalışıyor
- [ ] Jeton satışı çalışıyor
- [ ] Premium üyelik çalışıyor
- [ ] 100+ indirme
- [ ] $100+ gelir

**Tam başarı:**
- [ ] 1000+ aktif kullanıcı
- [ ] $1000+/ay gelir
- [ ] 4.5+ yıldız rating
- [ ] %20+ retention rate

---

Şimdi **Faz 2: WebRTC**'ye başlayabilirsin! 🚀
