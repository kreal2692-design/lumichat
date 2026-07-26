# 🌟 LumiMatch - Rastgele Görüntülü Sohbet Platformu

Gerçek zamanlı görüntülü sohbet, hediye sistemi, arkadaşlık, premium üyelik ve daha fazlasıyla modern bir sosyal platform.

## 📋 Özellikler

### 🎥 Temel Özellikler
- ✅ Rastgele görüntülü sohbet (WebRTC)
- ✅ Cinsiyet filtresi (Erkek/Kadın/Herkesle)
- ✅ Gerçek zamanlı mesajlaşma
- ✅ Yazıyor göstergesi
- ✅ Emoji desteği

### 👥 Sosyal Özellikler
- ✅ Arkadaşlık sistemi (istek gönder/kabul et/reddet)
- ✅ Direkt mesajlaşma (DM)
- ✅ Profil yönetimi
- ✅ Kullanıcı avatarları
- ✅ Nick renklendirme sistemi

### 🎁 Ekonomi Sistemi
- ✅ Jeton sistemi (sanal para)
- ✅ Hediye gönderme (19 farklı hediye çeşidi)
- ✅ Hediye → Jeton dönüşümü (%70 kullanıcı, %30 sistem)
- ✅ Günlük görevler (jeton kazanma)
- ✅ Referans sistemi (davet bonusu)

### ⭐ Premium Özellikler
- ✅ Premium üyelik paketi
- ✅ Jetonla premium satın alma
- ✅ Günlük premium bonusu
- ✅ Özel nick renkleri (7 farklı renk)

### 🛡️ Güvenlik
- ✅ Rate limiting (IP bazlı istek sınırı)
- ✅ Mesaj flood koruması
- ✅ IP bazlı bağlantı limiti
- ✅ Ban sistemi (geçici/kalıcı)
- ✅ Rapor sistemi
- ✅ Admin paneli

### 🌍 Çok Dil Desteği
- 🇹🇷 Türkçe
- 🇬🇧 İngilizce
- 🇩🇪 Almanca
- 🇫🇷 Fransızca
- 🇪🇸 İspanyolca
- 🇮🇹 İtalyanca
- 🇵🇹 Portekizce
- 🇷🇺 Rusça
- 🇯🇵 Japonca
- 🇨🇳 Çince
- 🇰🇷 Korece
- 🇸🇦 Arapça

## 🚀 Kurulum

### Gereksinimler
- Node.js >= 16.0.0
- npm veya yarn
- Supabase hesabı

### 1. Projeyi Klonla
```bash
git clone https://github.com/yourusername/lumimatch.git
cd lumimatch
```

### 2. Bağımlılıkları Kur
```bash
npm install
```

### 3. Ortam Değişkenlerini Ayarla
`.env.example` dosyasını `.env` olarak kopyalayın ve düzenleyin:

```bash
cp .env.example .env
```

Gerekli değişkenler:
- `SUPABASE_URL`: Supabase proje URL'iniz
- `SUPABASE_SERVICE_KEY`: Supabase service role key
- `ADMIN_SECRET`: Admin paneli şifresi
- `PORT`: Sunucu portu (varsayılan: 3000)

### 4. Supabase Veritabanını Hazırla
```bash
# SQL dosyasını Supabase SQL Editor'de çalıştırın
supabase_migrations.sql
```

### 5. Sunucuyu Başlat
```bash
npm start
```

Sunucu `http://localhost:3000` adresinde çalışacak.

## 🗄️ Veritabanı Şeması

### Tablolar
- `users` - Kullanıcı bilgileri
- `friends` - Arkadaşlık ilişkileri
- `gifts` - Hediye kayıtları
- `direct_messages` - Direkt mesajlar
- `chat_logs` - Sohbet geçmişi
- `daily_tasks` - Günlük görevler
- `push_subscriptions` - Push notification abonelikleri
- `reports` - Kullanıcı raporları

## 🛠️ Geliştirme

### Kod Yapısı
```
lumichat/
├── server.js           # Ana sunucu dosyası
├── index.html          # Ana sayfa
├── admin.html          # Admin paneli
├── i18n.js            # Çok dil desteği
├── service-worker.js  # PWA service worker
├── manifest.json      # PWA manifest
├── icons/             # Uygulama ikonları
└── node_modules/      # Bağımlılıklar
```

### API Endpoints

#### Arkadaşlık
- `POST /api/friends/request` - Arkadaşlık isteği gönder
- `POST /api/friends/respond` - İsteği kabul/reddet
- `GET /api/friends/:userId` - Arkadaş listesi
- `GET /api/friends/pending/:userId` - Bekleyen istekler

#### Hediye
- `POST /api/gifts/send` - Hediye gönder
- `GET /api/gifts/:userId` - Alınan hediyeler
- `POST /api/gifts/convert` - Hediyeyi jetona çevir

#### Premium
- `POST /api/premium/activate` - Premium aktif et
- `GET /api/premium/status/:userId` - Premium durumu
- `POST /api/premium/buy-with-tokens` - Jetonla premium al
- `POST /api/premium/daily-bonus` - Günlük bonus al

#### Görevler
- `GET /api/tasks/:userId` - Günlük görevler
- `POST /api/tasks/progress` - Görev ilerlemesi

#### Admin (ADMIN_SECRET gerekli)
- `GET /api/admin/users` - Kullanıcı listesi
- `POST /api/admin/ban` - Ban/Unban
- `POST /api/admin/give-tokens` - Jeton ver
- `GET /api/admin/stats` - İstatistikler

### Socket.IO Events

#### Client → Server
- `userOnline` - Kullanıcı online oldu
- `startMatching` - Eşleşme başlat
- `signal` - WebRTC sinyal
- `message` - Mesaj gönder
- `typing` - Yazıyor durumu
- `leave` - Sohbetten ayrıl
- `next` - Sonraki kişiye geç

#### Server → Client
- `matched` - Eşleşme bulundu
- `waiting` - Eşleşme bekleniyor
- `strangerLeft` - Karşı taraf ayrıldı
- `message` - Mesaj alındı
- `typing` - Karşı taraf yazıyor
- `taskCompleted` - Görev tamamlandı

## 📊 Admin Paneli

Admin paneline erişim: `http://localhost:3000/admin.html`

Özellikler:
- 📈 Gerçek zamanlı istatistikler
- 👥 Kullanıcı yönetimi
- 🚫 Ban/Unban işlemleri
- 🪙 Jeton verme
- ⭐ Premium yönetimi
- 🚩 Rapor inceleme

## 🔒 Güvenlik

### Rate Limiting
- IP başına dakikada max 100 istek
- Socket başına 10 saniyede max 20 mesaj
- IP başına max 5 eşzamanlı bağlantı

### Ban Sistemi
- Manuel ban (admin tarafından)
- Otomatik ban (spam/flood)
- Geçici ban (süreli)
- Kalıcı ban

### HTTP Güvenlik Başlıkları
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Strict-Transport-Security
- Content-Security-Policy

## 🎨 Tema Sistemi
- 🌙 Koyu tema (varsayılan)
- ☀️ Açık tema
- Kullanıcı tercihi otomatik kayıt

## 📱 PWA Desteği
- Offline çalışma
- Ana ekrana ekle
- Push notifications
- Service worker cache

## 🧪 Test

```bash
# Sunucuyu test et
npm test

# Sağlık kontrolü
curl http://localhost:3000/health
```

## 📦 Production Build

```bash
# Optimizasyon
npm run build

# Production'da çalıştır
NODE_ENV=production npm start
```

## 🐛 Sorun Giderme

### Supabase Bağlantı Hatası
- Supabase URL ve key'lerini kontrol edin
- `supabase_migrations.sql` dosyasını çalıştırdığınızdan emin olun

### WebRTC Bağlantı Hatası
- STUN/TURN sunucu ayarlarını kontrol edin
- Firewall/NAT ayarlarını kontrol edin

### Socket.IO Bağlantı Hatası
- CORS ayarlarını kontrol edin
- Port'un açık olduğundan emin olun

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 👨‍💻 Geliştirici

LumiMatch Team

## 🤝 Katkıda Bulunma

Pull request'ler memnuniyetle karşılanır. Büyük değişiklikler için lütfen önce bir issue açın.

## 📞 İletişim

- Website: https://lumimatch.net
- Email: support@lumimatch.net
- Instagram: [@lumimatch](https://instagram.com/lumimatch)
- TikTok: [@lumimatchofficial](https://tiktok.com/@lumimatchofficial)

## ⭐ Yıldız Verin!

Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!

---

**Not:** Bu proje aktif olarak geliştirilmektedir. Yeni özellikler ve güncellemeler için takipte kalın!