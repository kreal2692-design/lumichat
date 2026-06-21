# 🚀 Telegram Grup Scraper - Kurulum Kılavuzu

## 📋 Gereksinimler

- Python 3.8 veya üzeri
- Telegram hesabı
- Telegram API bilgileri (API ID ve API Hash)

## 🔧 Adım Adım Kurulum

### 1. Python Kurulumu

Python yüklü mü kontrol edin:
```bash
python --version
```

Eğer yüklü değilse [python.org](https://www.python.org/downloads/) adresinden indirin.

### 2. Telegram API Bilgilerini Alın

1. [https://my.telegram.org/apps](https://my.telegram.org/apps) adresine gidin
2. Telefon numaranızla giriş yapın
3. **API development tools** bölümünden bir uygulama oluşturun
4. **API ID** ve **API Hash** bilgilerini kopyalayın

### 3. Bağımlılıkları Yükleyin

```bash
cd telegram-grup-uyeler
pip install -r requirements.txt
```

### 4. .env Dosyasını Oluşturun

`.env.example` dosyasını `.env` olarak kopyalayın:
```bash
copy .env.example .env
```

`.env` dosyasını düzenleyin:
```env
TELEGRAM_API_ID=12345678
TELEGRAM_API_HASH=abcdef1234567890abcdef1234567890
TELEGRAM_PHONE=+905551234567
```

⚠️ **Önemli:** Telefon numarasını uluslararası formatta yazın (+90...)

### 5. Grup Linklerini Ekleyin

`scraper.py` dosyasını açın ve `group_links` listesine grupları ekleyin:

```python
group_links = [
    'https://t.me/grupadi1',
    'https://t.me/grupadi2',
    '@grupadi3',
    'grupadi4',
]
```

**Desteklenen formatlar:**
- `https://t.me/grupadi`
- `@grupadi`
- `grupadi` (direkt isim)

### 6. Scraper'ı Çalıştırın

```bash
python scraper.py
```

**İlk çalıştırmada:**
1. Telegram'dan bir doğrulama kodu gelecek
2. Kodu terminale girin
3. İki faktörlü doğrulama varsa şifrenizi girin
4. Oturum kaydedilecek ve bir sonraki çalıştırmada doğrulama gerekmeyecek

## 📊 Çıktı Dosyaları

Script çalıştırıldığında 3 dosya oluşturur:

### 1. TXT Dosyası (Okunabilir format)
```
20240621_120000_telegram_users.txt
```

**İçerik örneği:**
```
1. KULLANICI
------------------------------------------------------------
ID: 123456789
Kullanıcı Adı: @ahmet_yilmaz
Ad Soyad: Ahmet Yılmaz
Gruplar: Grup 1, Grup 2
Grup Sayısı: 2

2. KULLANICI
...
```

### 2. JSON Dosyası (Programatik işlemler için)
```json
{
  "export_date": "2024-06-21T12:00:00",
  "total_users": 150,
  "users": [
    {
      "id": 123456789,
      "username": "ahmet_yilmaz",
      "first_name": "Ahmet",
      "last_name": "Yılmaz",
      "full_name": "Ahmet Yılmaz",
      "groups": ["Grup 1", "Grup 2"]
    }
  ]
}
```

### 3. CSV Dosyası (Excel için)
```csv
ID,Kullanıcı Adı,Ad,Soyad,Tam Ad,Gruplar,Grup Sayısı
123456789,@ahmet_yilmaz,Ahmet,Yılmaz,Ahmet Yılmaz,Grup 1 | Grup 2,2
```

Excel'de doğrudan açılabilir.

## ⚙️ Özelleştirme

### Mesaj Limitini Değiştirme

`scraper.py` içinde `message_limit` parametresini değiştirin:

```python
await scraper.scrape_groups(group_links, message_limit=2000)  # 2000 mesaj
```

### Bekleme Sürelerini Ayarlama

Rate limiting için bekleme süreleri:

```python
await asyncio.sleep(1)   # Mesajlar arası (satır 109)
await asyncio.sleep(2)   # Gruplar arası (satır 132)
```

## ⚠️ Önemli Notlar

### 1. Yasal Uyarı
- Sadece **üyesi olduğunuz** gruplarda kullanın
- Kişisel verileri koruyun, paylaşmayın
- Spam veya taciz için kullanmayın
- Telegram Hizmet Şartlarına uyun

### 2. Rate Limiting
- Telegram, çok hızlı istek atarsanız geçici ban verebilir
- FloodWaitError alırsanız script otomatik bekler
- Çok fazla grup taramayın (günde max 10-20 grup önerilir)

### 3. Gizli/Özel Gruplar
- **Davetiyeli gruplara** scraper erişemez
- Gruba üye olmanız gerekir
- Admin izni gerektiren gruplarda hata alırsınız

### 4. Güvenlik
- `.env` dosyasını asla paylaşmayın
- `session_*.session` dosyalarını gizli tutun (hesabınıza erişim sağlar)
- `.gitignore` dosyası bu dosyaları otomatik hariç tutar

## 🐛 Sorun Giderme

### "API ID veya API Hash geçersiz"
- https://my.telegram.org/apps adresinden bilgileri kontrol edin
- `.env` dosyasında tırnak işareti kullanmayın

### "Phone number is invalid"
- Telefon numarasını uluslararası formatta yazın: `+905551234567`
- Boşluk, tire vb. kullanmayın

### "FloodWaitError"
- Telegram rate limit uyguladı
- Script otomatik bekleyecek
- Sakinleşin, daha az grup tarayın

### "Session file is corrupted"
- `session_*.session` dosyalarını silin
- Tekrar çalıştırın, yeniden giriş yapın

### "ChatAdminRequiredError"
- Bu gruba erişim yok
- Gruba üye olduğunuzdan emin olun

## 📈 Performans İpuçları

1. **Küçük başlayın:** İlk denemede 1-2 grup, 100-200 mesaj ile test edin
2. **Gece çalıştırın:** Büyük gruplar için script saatler sürebilir
3. **Log tutun:** Terminal çıktısını kaydedin: `python scraper.py > log.txt 2>&1`

## 🔄 Güncelleme

Kütüphaneleri güncellemek için:
```bash
pip install --upgrade telethon python-dotenv
```

## 📞 Destek

Script ile ilgili sorularınız için issue açın veya README.md'ye bakın.

## ⚖️ Lisans

MIT License - Sorumlu kullanın!
