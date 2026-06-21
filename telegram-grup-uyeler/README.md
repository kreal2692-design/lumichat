# Telegram Grup Üyeleri Analiz Sistemi

Telegram gruplarındaki mesaj atan kullanıcıları tespit eden ve listeleyen Python scraper + Node.js bot sistemi.

## 🚀 İki Farklı Araç

### 1. 🐍 Python Scraper (`scraper.py`)
**Ana araç - Gruplardaki mesaj atanları toplar**

- ✅ Son 1000 (veya daha fazla) mesajı analiz eder
- ✅ Mesaj atan tüm kullanıcıları toplar
- ✅ Kullanıcı adı, isim, ID bilgilerini kaydeder
- ✅ Hangi grupta aktif olduklarını belirtir
- ✅ TXT, JSON, CSV formatında dışa aktarma
- ✅ Birden fazla grup desteği
- ✅ Rate limiting koruması

### 2. 🤖 Node.js Bot (`bot.js`)
**Opsiyonel - Telegram bot ile admin listesi**

- ✅ Grup adminlerini listeler
- ✅ JSON/CSV export
- ✅ Telegram bot komutları

## 📋 Gereksinimler

- Node.js (v14 veya üzeri)
- Telegram Bot Token
- Bot'un admin olduğu Telegram grupları

## 🔧 Hızlı Başlangıç

### Python Scraper (Önerilen - Mesaj Atanları Toplar)

**Detaylı kurulum için:** `KURULUM.md` dosyasına bakın

**Kısa özet:**

1. **Python yükleyin** (3.8+)
2. **Bağımlılıkları yükleyin:**
   ```bash
   cd telegram-grup-uyeler
   pip install -r requirements.txt
   ```
3. **API bilgilerini alın:** [my.telegram.org/apps](https://my.telegram.org/apps)
4. **`.env` dosyası oluşturun:**
   ```bash
   copy .env.example .env
   ```
   Düzenleyin:
   ```env
   TELEGRAM_API_ID=12345678
   TELEGRAM_API_HASH=your_hash_here
   TELEGRAM_PHONE=+905551234567
   ```
5. **`scraper.py`'da grup linklerini ekleyin:**
   ```python
   group_links = [
       'https://t.me/your_group',
       '@groupname',
   ]
   ```
6. **Çalıştırın:**
   ```bash
   python scraper.py
   ```

### Node.js Bot (Opsiyonel - Sadece Adminler)

```bash
npm install
```

### 2. Telegram Bot Oluştur

1. Telegram'da [@BotFather](https://t.me/BotFather)'a git
2. `/newbot` komutunu kullan
3. Bot adı ve kullanıcı adı belirle
4. Verilen **Bot Token**'ı kaydet

### 3. Ortam Değişkenlerini Ayarla

`.env.example` dosyasını `.env` olarak kopyalayın:

```bash
copy .env.example .env
```

`.env` dosyasını düzenleyin:

```env
BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
ALLOWED_CHATS=-1001234567890,-1009876543210
```

**Grup ID'sini öğrenmek için:**
- Botu gruba ekleyin
- `/grupid` komutunu kullanın

### 4. Botu Başlat

```bash
npm start
```

## 📖 Kullanım

### Komutlar

| Komut | Açıklama |
|-------|----------|
| `/start` | Botu başlat ve hoş geldin mesajı |
| `/help` | Yardım menüsünü göster |
| `/grupid` | Grubun ID'sini öğren |
| `/sayac` | Grup üye sayısını göster |
| `/liste` | Grup adminlerini listele |
| `/export` | JSON dosyası olarak indir |
| `/exportcsv` | CSV dosyası olarak indir |

### Adım Adım

1. **Botu Gruba Ekle**
   - Telegram grubuna gidin
   - Bot'u gruba ekleyin (Add Member)

2. **Bot'u Admin Yap**
   - Grup ayarlarına gidin
   - Bot'u admin yapın
   - Gerekli izinleri verin

3. **Komutları Kullan**
   - Grupta `/liste` yazarak admin listesini görün
   - `/export` ile JSON formatında kaydedin
   - `/exportcsv` ile Excel'de açılabilir CSV indirin

## ⚠️ Önemli Notlar

### Telegram Bot API Kısıtlaması

**Telegram Bot API, güvenlik nedeniyle normal botların tüm grup üyelerini listelemesine izin vermez.**

Bu bot sadece **grup adminlerini** listeleyebilir çünkü:
- `getChatAdministrators()` API'si herkese açık
- Tüm üyeleri almak için `getChatMember()` her üye için ayrı ayrı çağrılmalı
- Üye ID listesi Bot API'den alınamaz

### Tüm Üyeleri Listelemek İçin Alternatifler

1. **Telegram Desktop API (Telethon/Pyrogram)**
   - Python kütüphaneleri kullanarak (Telethon, Pyrogram)
   - Kullanıcı hesabıyla giriş yapılmalı
   - Daha fazla yetki gerektirir

2. **Telegram Client API**
   - MTProto protokolünü kullanır
   - Normal kullanıcı yetkilerine ihtiyaç var
   - Daha karmaşık setup

3. **Manuel Export**
   - Telegram Desktop → Grup → Settings → Export Chat History
   - JSON formatında tüm üyeler

## 🔒 Güvenlik

- ✅ Sadece grup adminleri komutları kullanabilir
- ✅ İzin verilen gruplar `.env` ile sınırlanabilir
- ✅ Bot token'ı `.env` dosyasında saklanır
- ✅ `.gitignore` ile hassas dosyalar korunur

## 📦 Dışa Aktarma Formatları

### JSON Örneği
```json
{
  "chat_id": -1001234567890,
  "chat_title": "Örnek Grup",
  "export_date": "2024-01-01T12:00:00.000Z",
  "member_count": 5,
  "members": [
    {
      "id": 123456789,
      "username": "kullanici1",
      "first_name": "Ali",
      "last_name": "Veli",
      "is_bot": false,
      "status": "creator"
    }
  ]
}
```

### CSV Örneği
```csv
ID,Kullanıcı Adı,Ad,Soyad,Bot?,Durum
123456789,kullanici1,Ali,Veli,Hayır,creator
987654321,kullanici2,Ayşe,Yılmaz,Hayır,administrator
```

## 🐛 Sorun Giderme

### "Bot'un admin olduğundan emin olun" Hatası
- Bot'u grup adminleri arasına ekleyin
- Admin izinlerini kontrol edin

### "Bu grupta bot kullanımı yetkilendirilmemiş" Hatası
- `.env` dosyasındaki `ALLOWED_CHATS` değişkenini kontrol edin
- Grup ID'sini `/grupid` komutuyla öğrenin ve ekleyin

### Polling Hataları
- Bot token'ın doğru olduğundan emin olun
- Internet bağlantınızı kontrol edin
- Başka bir bot instance'ı çalışmıyor olmalı

## 📝 Lisans

MIT License - Özgürce kullanabilirsiniz!
