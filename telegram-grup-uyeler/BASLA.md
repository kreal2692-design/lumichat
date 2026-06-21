# 🚀 5 Dakikada Başla

## Adım 1: Python Kurulu mu Kontrol Et

Terminal/CMD açın ve yazın:
```bash
python --version
```

Eğer `Python 3.8` veya üzeri görmüyorsanız → [python.org](https://www.python.org/downloads/) adresinden indirin.

---

## Adım 2: Klasöre Git

```bash
cd C:\Users\kreal\Documents\lumichat\telegram-grup-uyeler
```

---

## Adım 3: Bağımlılıkları Kur

```bash
pip install telethon python-dotenv
```

**Eğer hata alırsanız:**
```bash
python -m pip install telethon python-dotenv
```

---

## Adım 4: Telegram API Bilgilerini Al

### 4.1. Tarayıcıda Aç:
👉 https://my.telegram.org/apps

### 4.2. Telefon Numaranızla Giriş Yapın
- SMS kodu gelecek, girin

### 4.3. Uygulama Oluşturun
- **App title:** `My Scraper` (herhangi bir isim)
- **Short name:** `scraper`
- **Platform:** Diğer seçenekleri boş bırakın

### 4.4. Bilgileri Kopyalayın
- **api_id** → Bir sayı (örn: 12345678)
- **api_hash** → Uzun bir metin (örn: abcdef1234567890)

---

## Adım 5: .env Dosyası Oluştur

### 5.1. Dosyayı Kopyala:
```bash
copy .env.example .env
```

### 5.2. .env Dosyasını Aç
- Notepad veya herhangi bir editör ile açın
- **C:\Users\kreal\Documents\lumichat\telegram-grup-uyeler\.env**

### 5.3. Bilgileri Yapıştır:
```env
TELEGRAM_API_ID=12345678
TELEGRAM_API_HASH=abcdef1234567890abcdef1234567890
TELEGRAM_PHONE=+905551234567
```

⚠️ **DİKKAT:**
- `TELEGRAM_API_ID` → Sadece sayı (tırnak yok)
- `TELEGRAM_API_HASH` → my.telegram.org'dan kopyalayın
- `TELEGRAM_PHONE` → `+90` ile başlayın, boşluk yok

### 5.4. Kaydet ve Kapat

---

## Adım 6: İLK ÇALIŞTIRMA (Test)

```bash
python live_monitor.py
```

**Ne olacak:**

1. **"Başlatmak için ENTER'a basın"** → ENTER'a bas
2. **Telegram'dan SMS gelecek** → Kodu gir
3. **İki faktörlü doğrulama varsa** → Şifreni gir
4. **"Gruplara katılıyor..."** yazısı çıkacak
5. **Canlı izleme başlayacak!** ✅

---

## ✅ Başarılı Çalışma Örneği:

```
================================================================================
🔴 TELEGRAM CANLI İZLEME SİSTEMİ
================================================================================

📋 İzlenecek grup sayısı: 3
📊 İlk tarama: Son 1000 mesaj
🔴 Canlı izleme: AÇIK (Sürekli)
💾 Otomatik kaydet: Her yeni kullanıcıda

▶️  Başlatmak için ENTER'a basın (q = çık): [ENTER'a bastınız]

✅ Telegram'a bağlanıldı: +905551234567

================================================================================
📡 GRUPLARA KATILIYOR VE İZLEME BAŞLIYOR
================================================================================

📥 Grup işleniyor: https://t.me/ykssohbetV2
   ✅ Zaten üyesiniz: YKS Sohbet V2

📊 İlk tarama başlıyor: YKS Sohbet V2
   🆕 YENİ KULLANICI: @ahmet123 | Ahmet Yılmaz | YKS Sohbet V2
   🆕 YENİ KULLANICI: @mehmet | Mehmet | YKS Sohbet V2
   ...
```

Bu çıktıyı görüyorsanız **BAŞARILI!** 🎉

---

## ❌ Hata Alırsanız:

### Hata 1: "API ID veya API Hash geçersiz"
```
❌ HATA: API bilgileri eksik!
```

**Çözüm:**
- `.env` dosyasını kontrol edin
- https://my.telegram.org/apps adresinden bilgileri tekrar kopyalayın
- Tırnak işareti kullanmayın!

### Hata 2: "Phone number is invalid"
```
❌ Invalid phone number
```

**Çözüm:**
- `+90` ile başlayın
- Boşluk, tire kullanmayın
- Örnek: `+905551234567`

### Hata 3: "telethon modülü bulunamadı"
```
ModuleNotFoundError: No module named 'telethon'
```

**Çözüm:**
```bash
pip install telethon python-dotenv
```

Veya:
```bash
python -m pip install telethon python-dotenv
```

### Hata 4: "pip tanınmıyor"
```
'pip' is not recognized...
```

**Çözüm:**
```bash
python -m pip install telethon python-dotenv
```

### Hata 5: Session hatası
```
Session file is corrupted
```

**Çözüm:**
```bash
del live_session_*.session
```
Sonra tekrar çalıştırın.

---

## 📂 Çıktı Dosyaları Nerede?

Script çalıştıktan sonra:

```
C:\Users\kreal\Documents\lumichat\telegram-grup-uyeler\
├── live_20240621_users.txt   ← Kullanıcı listesi
├── live_20240621_users.json  ← JSON format
└── live_20240621_users.csv   ← Excel için
```

---

## 🛑 Durdurmak İçin:

**Ctrl + C** tuşuna basın.

Dosyalar otomatik kaydedilir, veri kaybı olmaz.

---

## 🔄 İkinci Kez Çalıştırma:

```bash
python live_monitor.py
```

İkinci seferde **SMS kodu gerekmez!**
Session dosyası kaydedilmiştir.

---

## 💡 Hızlı İpuçları:

### Daha Fazla Mesaj Taramak
`live_monitor.py` dosyasını açın, **satır 169**:
```python
await self.get_initial_users(entity, limit=2000)  # 2000 mesaj
```

### Grup Eklemek/Çıkarmak
`live_monitor.py` dosyasını açın, **satır 251-255**:
```python
group_links = [
    'https://t.me/yeni_grup',
    'https://t.me/baska_grup',
]
```

---

## 📞 Hala Sorun mu Var?

Terminal'deki **HATA MESAJINI** buraya yapıştırın, yardımcı olayım!

---

## ✅ Sonraki Adımlar:

1. ✅ Script çalışıyor → Arka planda bırakın
2. ✅ Dosyaları kontrol edin → TXT, JSON, CSV
3. ✅ Yeni kullanıcılar eklenecek → Otomatik

Başarılar! 🚀
