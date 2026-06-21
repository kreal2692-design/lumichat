#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Telegram Grup Üyeleri Scraper
Belirtilen gruplardaki son mesaj atan kullanıcıları toplar
"""

import asyncio
import json
import os
from datetime import datetime
from telethon import TelegramClient
from telethon.tl.functions.messages import GetHistoryRequest
from telethon.errors import FloodWaitError, ChatAdminRequiredError
import time

# API bilgileri - https://my.telegram.org/apps adresinden alın
API_ID = int(os.getenv('TELEGRAM_API_ID', '0'))
API_HASH = os.getenv('TELEGRAM_API_HASH', '')
PHONE_NUMBER = os.getenv('TELEGRAM_PHONE', '')

class TelegramScraper:
    def __init__(self, api_id, api_hash, phone):
        self.api_id = api_id
        self.api_hash = api_hash
        self.phone = phone
        self.client = TelegramClient('session_' + phone, api_id, api_hash)
        self.all_users = {}
        
    async def connect(self):
        """Telegram'a bağlan"""
        await self.client.start(phone=self.phone)
        print(f"✅ Telegram'a bağlanıldı: {self.phone}")
        
    async def get_group_messages(self, group_link, limit=1000):
        """Gruptan son mesajları çek"""
        print(f"\n📥 Grup işleniyor: {group_link}")
        
        try:
            # Grup linkinden entity al
            entity = await self.client.get_entity(group_link)
            group_name = entity.title if hasattr(entity, 'title') else str(entity.id)
            group_id = entity.id
            
            print(f"📋 Grup: {group_name} (ID: {group_id})")
            print(f"⏳ Son {limit} mesaj çekiliyor...")
            
            users_in_group = {}
            offset_id = 0
            total_messages = 0
            
            while total_messages < limit:
                try:
                    # Mesajları çek
                    history = await self.client(GetHistoryRequest(
                        peer=entity,
                        offset_id=offset_id,
                        offset_date=None,
                        add_offset=0,
                        limit=100,  # Her seferde 100 mesaj
                        max_id=0,
                        min_id=0,
                        hash=0
                    ))
                    
                    if not history.messages:
                        break
                    
                    for message in history.messages:
                        if message.from_id:
                            user_id = None
                            
                            # User ID'yi al
                            if hasattr(message.from_id, 'user_id'):
                                user_id = message.from_id.user_id
                            elif hasattr(message, 'sender_id'):
                                user_id = message.sender_id
                            
                            if user_id and user_id not in users_in_group:
                                try:
                                    # Kullanıcı bilgilerini al
                                    user = await self.client.get_entity(user_id)
                                    
                                    username = user.username if hasattr(user, 'username') else None
                                    first_name = user.first_name if hasattr(user, 'first_name') else ''
                                    last_name = user.last_name if hasattr(user, 'last_name') else ''
                                    
                                    user_data = {
                                        'id': user_id,
                                        'username': username,
                                        'first_name': first_name,
                                        'last_name': last_name,
                                        'full_name': f"{first_name} {last_name}".strip(),
                                        'groups': [group_name]
                                    }
                                    
                                    users_in_group[user_id] = user_data
                                    
                                    # Global listeye ekle
                                    if user_id in self.all_users:
                                        if group_name not in self.all_users[user_id]['groups']:
                                            self.all_users[user_id]['groups'].append(group_name)
                                    else:
                                        self.all_users[user_id] = user_data.copy()
                                    
                                except Exception as e:
                                    print(f"⚠️  User {user_id} alınamadı: {str(e)}")
                                    continue
                    
                    total_messages += len(history.messages)
                    offset_id = history.messages[-1].id
                    
                    print(f"   📊 İşlenen mesaj: {total_messages}/{limit} - Bulunan kullanıcı: {len(users_in_group)}")
                    
                    # Rate limiting
                    await asyncio.sleep(1)
                    
                except FloodWaitError as e:
                    print(f"⏰ Flood wait: {e.seconds} saniye bekleniyor...")
                    await asyncio.sleep(e.seconds)
                    continue
                    
            print(f"✅ {group_name}: {len(users_in_group)} kullanıcı bulundu")
            return users_in_group
            
        except ChatAdminRequiredError:
            print(f"❌ Hata: Bu gruba erişim yok (admin gerekli)")
            return {}
        except Exception as e:
            print(f"❌ Hata: {str(e)}")
            return {}
    
    async def scrape_groups(self, group_links, message_limit=1000):
        """Birden fazla grubu tara"""
        for link in group_links:
            try:
                await self.get_group_messages(link, message_limit)
                await asyncio.sleep(2)  # Gruplar arası bekleme
            except Exception as e:
                print(f"❌ Grup işlenemedi ({link}): {str(e)}")
                continue
    
    def save_to_txt(self, filename='telegram_users.txt'):
        """Kullanıcıları TXT dosyasına kaydet"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{timestamp}_{filename}"
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write("=" * 80 + "\n")
            f.write("TELEGRAM GRUP ÜYELERİ LİSTESİ\n")
            f.write(f"Tarih: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Toplam Kullanıcı: {len(self.all_users)}\n")
            f.write("=" * 80 + "\n\n")
            
            for idx, (user_id, user_data) in enumerate(self.all_users.items(), 1):
                f.write(f"{idx}. KULLANICI\n")
                f.write("-" * 60 + "\n")
                f.write(f"ID: {user_id}\n")
                f.write(f"Kullanıcı Adı: @{user_data['username'] or 'Yok'}\n")
                f.write(f"Ad Soyad: {user_data['full_name'] or 'Bilinmiyor'}\n")
                f.write(f"Gruplar: {', '.join(user_data['groups'])}\n")
                f.write(f"Grup Sayısı: {len(user_data['groups'])}\n")
                f.write("\n")
        
        print(f"\n✅ TXT dosyası kaydedildi: {filename}")
        return filename
    
    def save_to_json(self, filename='telegram_users.json'):
        """JSON formatında kaydet"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{timestamp}_{filename}"
        
        export_data = {
            'export_date': datetime.now().isoformat(),
            'total_users': len(self.all_users),
            'users': list(self.all_users.values())
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, ensure_ascii=False, indent=2)
        
        print(f"✅ JSON dosyası kaydedildi: {filename}")
        return filename
    
    def save_to_csv(self, filename='telegram_users.csv'):
        """CSV formatında kaydet"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{timestamp}_{filename}"
        
        with open(filename, 'w', encoding='utf-8-sig') as f:
            f.write("ID,Kullanıcı Adı,Ad,Soyad,Tam Ad,Gruplar,Grup Sayısı\n")
            
            for user_id, user_data in self.all_users.items():
                username = user_data['username'] or ''
                first_name = (user_data['first_name'] or '').replace(',', ';')
                last_name = (user_data['last_name'] or '').replace(',', ';')
                full_name = (user_data['full_name'] or '').replace(',', ';')
                groups = ' | '.join(user_data['groups'])
                
                f.write(f"{user_id},@{username},{first_name},{last_name},{full_name},{groups},{len(user_data['groups'])}\n")
        
        print(f"✅ CSV dosyası kaydedildi: {filename}")
        return filename
    
    async def close(self):
        """Bağlantıyı kapat"""
        await self.client.disconnect()
        print("\n👋 Bağlantı kapatıldı")


async def main():
    """Ana fonksiyon"""
    print("=" * 80)
    print("🤖 TELEGRAM GRUP ÜYELERİ SCRAPER")
    print("=" * 80)
    
    # Konfigürasyon kontrolü
    if not API_ID or not API_HASH or not PHONE_NUMBER:
        print("\n❌ HATA: API bilgileri eksik!")
        print("\n.env dosyasını oluşturun ve şu bilgileri ekleyin:")
        print("TELEGRAM_API_ID=your_api_id")
        print("TELEGRAM_API_HASH=your_api_hash")
        print("TELEGRAM_PHONE=+905551234567")
        print("\nAPI bilgilerini https://my.telegram.org/apps adresinden alabilirsiniz.")
        return
    
    # Grup linklerini buraya ekleyin
    group_links = [
        'https://t.me/grupadi1',
        'https://t.me/grupadi2',
        # '@grupadi3',  # @ ile de ekleyebilirsiniz
        # 'grupadi4',   # Direkt isim de olur
    ]
    
    print(f"\n📋 İşlenecek grup sayısı: {len(group_links)}")
    print(f"📊 Her gruptan alınacak mesaj: 1000")
    
    # Kullanıcıdan onay al
    response = input("\n▶️  Başlatmak için ENTER'a basın (q = çık): ")
    if response.lower() == 'q':
        print("❌ İşlem iptal edildi")
        return
    
    # Scraper'ı başlat
    scraper = TelegramScraper(API_ID, API_HASH, PHONE_NUMBER)
    
    try:
        # Bağlan
        await scraper.connect()
        
        # Grupları tara
        await scraper.scrape_groups(group_links, message_limit=1000)
        
        # Sonuçları kaydet
        print("\n" + "=" * 80)
        print("💾 SONUÇLAR KAYDEDİLİYOR")
        print("=" * 80)
        
        scraper.save_to_txt()
        scraper.save_to_json()
        scraper.save_to_csv()
        
        # Özet
        print("\n" + "=" * 80)
        print("📊 ÖZET")
        print("=" * 80)
        print(f"Toplam bulunan kullanıcı: {len(scraper.all_users)}")
        print(f"İşlenen grup sayısı: {len(group_links)}")
        
    except Exception as e:
        print(f"\n❌ Kritik hata: {str(e)}")
    finally:
        await scraper.close()


if __name__ == '__main__':
    # .env dosyasını yükle
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except ImportError:
        print("⚠️  python-dotenv yüklü değil, ortam değişkenlerini manuel kontrol edin")
    
    # Async main'i çalıştır
    asyncio.run(main())
