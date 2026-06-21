#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Telegram Grup Canlı İzleme Sistemi
Grupları sürekli izler, yeni mesaj atanları otomatik listeler
"""

import asyncio
import json
import os
from datetime import datetime
from telethon import TelegramClient, events
from telethon.tl.functions.channels import JoinChannelRequest
from telethon.errors import FloodWaitError
import signal
import sys

# API bilgileri
API_ID = int(os.getenv('TELEGRAM_API_ID', '0'))
API_HASH = os.getenv('TELEGRAM_API_HASH', '')
PHONE_NUMBER = os.getenv('TELEGRAM_PHONE', '')

class LiveTelegramMonitor:
    def __init__(self, api_id, api_hash, phone):
        self.api_id = api_id
        self.api_hash = api_hash
        self.phone = phone
        self.client = TelegramClient('live_session_' + phone, api_id, api_hash)
        self.all_users = {}
        self.monitored_groups = {}
        self.running = True
        
    async def connect(self):
        """Telegram'a bağlan"""
        await self.client.start(phone=self.phone)
        print(f"✅ Telegram'a bağlanıldı: {self.phone}")
        
    async def join_group_if_needed(self, group_link):
        """Gruba katılmamışsak otomatik katıl"""
        try:
            entity = await self.client.get_entity(group_link)
            
            # Gruba zaten üye miyiz kontrol et
            try:
                participant = await self.client.get_permissions(entity)
                if participant:
                    print(f"   ✅ Zaten üyesiniz: {entity.title}")
                    return entity
            except:
                pass
            
            # Gruba katıl
            print(f"   🔄 Gruba katılıyor: {entity.title}")
            await self.client(JoinChannelRequest(entity))
            await asyncio.sleep(2)
            print(f"   ✅ Gruba katıldı: {entity.title}")
            return entity
            
        except Exception as e:
            print(f"   ❌ Katılma hatası: {str(e)}")
            return None
    
    async def get_initial_users(self, entity, limit=1000):
        """İlk taramada son mesaj atanları al"""
        print(f"\n📊 İlk tarama başlıyor: {entity.title}")
        
        try:
            messages = await self.client.get_messages(entity, limit=limit)
            initial_count = 0
            
            for message in messages:
                if message.from_id:
                    user_id = None
                    
                    if hasattr(message.from_id, 'user_id'):
                        user_id = message.from_id.user_id
                    elif hasattr(message, 'sender_id'):
                        user_id = message.sender_id
                    
                    if user_id and user_id not in self.all_users:
                        try:
                            user = await self.client.get_entity(user_id)
                            self.add_user(user, entity.title)
                            initial_count += 1
                        except:
                            continue
                            
            print(f"   ✅ İlk tarama tamamlandı: {initial_count} kullanıcı bulundu")
            
        except Exception as e:
            print(f"   ❌ İlk tarama hatası: {str(e)}")
    
    def add_user(self, user, group_name):
        """Kullanıcıyı listeye ekle (sadece yeni ise)"""
        user_id = user.id
        
        if user_id not in self.all_users:
            username = user.username if hasattr(user, 'username') else None
            first_name = user.first_name if hasattr(user, 'first_name') else ''
            last_name = user.last_name if hasattr(user, 'last_name') else ''
            
            user_data = {
                'id': user_id,
                'username': username,
                'first_name': first_name,
                'last_name': last_name,
                'full_name': f"{first_name} {last_name}".strip(),
                'groups': [group_name],
                'first_seen': datetime.now().isoformat(),
                'message_count': 1
            }
            
            self.all_users[user_id] = user_data
            
            # Terminal'de göster
            print(f"   🆕 YENİ KULLANICI: @{username or 'Yok'} | {user_data['full_name'] or 'İsimsiz'} | {group_name}")
            
            # Anında dosyaya kaydet
            self.save_to_file()
            
        else:
            # Zaten var ama farklı grupta mesaj attıysa grup ekle
            if group_name not in self.all_users[user_id]['groups']:
                self.all_users[user_id]['groups'].append(group_name)
                self.all_users[user_id]['message_count'] += 1
                print(f"   🔄 GÜNCELLEME: @{self.all_users[user_id]['username'] or 'Yok'} → {group_name}")
                self.save_to_file()
            else:
                self.all_users[user_id]['message_count'] += 1
    
    async def setup_monitoring(self, group_links, initial_scan=True):
        """Grupları izlemeye başla"""
        print("\n" + "="*80)
        print("📡 GRUPLARA KATILIYOR VE İZLEME BAŞLIYOR")
        print("="*80)
        
        for link in group_links:
            try:
                entity = await self.join_group_if_needed(link)
                if entity:
                    self.monitored_groups[entity.id] = entity.title
                    
                    # İlk tarama yap
                    if initial_scan:
                        await self.get_initial_users(entity, limit=1000)
                    
                await asyncio.sleep(2)
                
            except Exception as e:
                print(f"❌ Grup eklenemedi ({link}): {str(e)}")
                continue
        
        print("\n" + "="*80)
        print(f"✅ {len(self.monitored_groups)} GRUP AKTİF İZLENİYOR")
        print("="*80)
        
        # Yeni mesaj handler'ı ekle
        @self.client.on(events.NewMessage(chats=list(self.monitored_groups.keys())))
        async def handle_new_message(event):
            if event.sender_id:
                try:
                    user = await event.get_sender()
                    group_name = self.monitored_groups.get(event.chat_id, 'Bilinmeyen')
                    self.add_user(user, group_name)
                except Exception as e:
                    print(f"⚠️  Mesaj işleme hatası: {str(e)}")
        
        print(f"\n💚 CANLI İZLEME AKTİF - Ctrl+C ile durdurun")
        print(f"📊 Toplam kullanıcı: {len(self.all_users)}")
        print(f"🔄 Yeni mesajlar otomatik izleniyor...\n")
    
    def save_to_file(self):
        """Kullanıcıları 3 formatta kaydet"""
        timestamp = datetime.now().strftime('%Y%m%d')
        
        # TXT
        txt_file = f"live_{timestamp}_users.txt"
        with open(txt_file, 'w', encoding='utf-8') as f:
            f.write("=" * 80 + "\n")
            f.write("TELEGRAM CANLI İZLEME - KULLANICI LİSTESİ\n")
            f.write(f"Son Güncelleme: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
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
                f.write(f"Mesaj Sayısı: {user_data['message_count']}\n")
                f.write(f"İlk Görülme: {user_data['first_seen']}\n")
                f.write("\n")
        
        # JSON
        json_file = f"live_{timestamp}_users.json"
        export_data = {
            'last_update': datetime.now().isoformat(),
            'total_users': len(self.all_users),
            'monitored_groups': list(self.monitored_groups.values()),
            'users': list(self.all_users.values())
        }
        
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, ensure_ascii=False, indent=2)
        
        # CSV
        csv_file = f"live_{timestamp}_users.csv"
        with open(csv_file, 'w', encoding='utf-8-sig') as f:
            f.write("ID,Kullanıcı Adı,Ad,Soyad,Tam Ad,Gruplar,Grup Sayısı,Mesaj Sayısı,İlk Görülme\n")
            
            for user_id, user_data in self.all_users.items():
                username = user_data['username'] or ''
                first_name = (user_data['first_name'] or '').replace(',', ';')
                last_name = (user_data['last_name'] or '').replace(',', ';')
                full_name = (user_data['full_name'] or '').replace(',', ';')
                groups = ' | '.join(user_data['groups'])
                
                f.write(f"{user_id},@{username},{first_name},{last_name},{full_name},{groups},{len(user_data['groups'])},{user_data['message_count']},{user_data['first_seen']}\n")
    
    async def close(self):
        """Bağlantıyı kapat"""
        self.running = False
        print("\n\n" + "="*80)
        print("💾 SON KAYIT YAPILIYOR...")
        print("="*80)
        self.save_to_file()
        await self.client.disconnect()
        print("\n✅ Bağlantı kapatıldı")
        print(f"📊 Toplam {len(self.all_users)} kullanıcı kaydedildi")


async def main():
    """Ana fonksiyon"""
    print("=" * 80)
    print("🔴 TELEGRAM CANLI İZLEME SİSTEMİ")
    print("=" * 80)
    
    # Konfigürasyon kontrolü
    if not API_ID or not API_HASH or not PHONE_NUMBER:
        print("\n❌ HATA: API bilgileri eksik!")
        print("\n.env dosyasını oluşturun ve şu bilgileri ekleyin:")
        print("TELEGRAM_API_ID=your_api_id")
        print("TELEGRAM_API_HASH=your_api_hash")
        print("TELEGRAM_PHONE=+905551234567")
        print("\nDetaylı kurulum: BASLA.md dosyasını okuyun")
        return
    
    # İzlenecek gruplar
    group_links = [
        'https://t.me/ykssohbetV2',
        'https://t.me/ykssohbetc',
        'https://t.me/ykskrallik',
    ]
    
    print(f"\n📋 İzlenecek grup sayısı: {len(group_links)}")
    print(f"📊 İlk tarama: Son 1000 mesaj")
    print(f"🔴 Canlı izleme: AÇIK (Sürekli)")
    print(f"💾 Otomatik kaydet: Her yeni kullanıcıda")
    
    response = input("\n▶️  Başlatmak için ENTER'a basın (q = çık): ")
    if response.lower() == 'q':
        print("❌ İşlem iptal edildi")
        return
    
    # Monitor'u başlat
    monitor = LiveTelegramMonitor(API_ID, API_HASH, PHONE_NUMBER)
    
    # Ctrl+C için handler
    def signal_handler(sig, frame):
        print("\n\n⚠️  Durdurma sinyali alındı...")
        asyncio.create_task(monitor.close())
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    
    try:
        # Bağlan
        await monitor.connect()
        
        # İzlemeyi başlat
        await monitor.setup_monitoring(group_links, initial_scan=True)
        
        # Sürekli çalış
        while monitor.running:
            await asyncio.sleep(60)  # Her dakika kontrol
            
            # Her 5 dakikada bir dosyaları kaydet
            if datetime.now().second == 0:
                print(f"💾 Otomatik kayıt - Toplam: {len(monitor.all_users)} kullanıcı")
                monitor.save_to_file()
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Kapatılıyor...")
        await monitor.close()
    except Exception as e:
        print(f"\n❌ Kritik hata: {str(e)}")
        await monitor.close()


if __name__ == '__main__':
    # .env dosyasını yükle
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except ImportError:
        print("⚠️  python-dotenv yüklü değil")
    
    # Async main'i çalıştır
    asyncio.run(main())
