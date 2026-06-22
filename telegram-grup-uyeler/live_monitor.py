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
from telethon.sync import TelegramClient, events
from telethon.tl.functions.channels import JoinChannelRequest
from telethon.errors import FloodWaitError, SessionPasswordNeededError
import signal
import sys

# .env dosyasını yükle
try:
    from dotenv import load_dotenv
    load_dotenv()
    print("✅ .env dosyası yüklendi")
except Exception as e:
    print(f"⚠️ .env yüklenemedi: {e}")

# API bilgileri
API_ID = int(os.getenv('TELEGRAM_API_ID', '31532670'))
API_HASH = os.getenv('TELEGRAM_API_HASH', '639863426cc29526d8ca5570d61d10b6')
PHONE_NUMBER = os.getenv('TELEGRAM_PHONE', '+905491227528')

print(f"📋 API ID: {API_ID}")
print(f"📋 API Hash: {API_HASH[:10]}...")
print(f"📋 Phone: {PHONE_NUMBER}")

class LiveTelegramMonitor:
    def __init__(self, api_id, api_hash, phone):
        self.api_id = api_id
        self.api_hash = api_hash
        self.phone = phone
        self.client = TelegramClient('live_session_' + phone, api_id, api_hash)
        self.all_users = self.load_existing_users()  # Mevcut üyeleri yükle
        self.monitored_groups = {}
        self.running = True
    
    def load_existing_users(self):
        """Mevcut üyeler.json dosyasından kullanıcıları yükle"""
        try:
            if os.path.exists('üyeler.json'):
                with open('üyeler.json', 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    users = {}
                    for user in data.get('users', []):
                        users[user['id']] = user
                    print(f"✅ {len(users)} mevcut kullanıcı yüklendi")
                    return users
        except Exception as e:
            print(f"⚠️  Mevcut kullanıcılar yüklenemedi: {e}")
        return {}
        
    async def connect(self):
        """Telegram'a bağlan"""
        print("\n🔄 Telegram'a bağlanılıyor...")
        
        try:
            await self.client.start(
                phone=lambda: self.phone,
                password=lambda: input('İki faktörlü doğrulama şifresi (varsa): ') or None
            )
            print(f"✅ Telegram'a bağlanıldı: {self.phone}")
            
            # Kullanıcı bilgilerini göster
            me = await self.client.get_me()
            print(f"👤 Giriş yapılan hesap: {me.first_name} (@{me.username or 'username yok'})")
            
        except SessionPasswordNeededError:
            print("🔐 İki faktörlü doğrulama gerekli")
            password = input("Şifrenizi girin: ")
            await self.client.start(phone=self.phone, password=password)
            print(f"✅ Telegram'a bağlanıldı: {self.phone}")
            
        except Exception as e:
            print(f"❌ Bağlantı hatası: {type(e).__name__}")
            print(f"   Detay: {str(e)}")
            raise
        
    async def join_group_if_needed(self, group_link):
        """Gruba katılmamışsak otomatik katıl"""
        try:
            entity = await self.client.get_entity(group_link)
            
            # Link'ten grup ismini çıkar (t.me/ykssohbetz -> ykssohbetz)
            custom_name = group_link.split('/')[-1]
            
            # Gruba zaten üye miyiz kontrol et
            try:
                participant = await self.client.get_permissions(entity)
                if participant:
                    print(f"   ✅ Zaten üyesiniz: {custom_name}")
                    return entity, custom_name
            except:
                pass
            
            # Gruba katıl
            print(f"   🔄 Gruba katılıyor: {custom_name}")
            await self.client(JoinChannelRequest(entity))
            await asyncio.sleep(2)
            print(f"   ✅ Gruba katıldı: {custom_name}")
            return entity, custom_name
            
        except Exception as e:
            print(f"   ❌ Katılma hatası: {str(e)}")
            return None, None
    

    def add_user(self, user, group_name, silent=False):
        """Kullanıcıyı listeye ekle - SADECE YENİ KULLANICILAR BİLDİRİLİR"""
        # Kullanıcı kontrolü
        if not user:
            return
            
        user_id = user.id
        username = user.username if hasattr(user, 'username') else None
        is_bot = user.bot if hasattr(user, 'bot') else False
        
        # Kullanıcı adı yoksa veya bot ise kaydetme
        if not username or is_bot:
            return
        
        if user_id not in self.all_users:
            # YENİ KULLANICI - Ekle, bildir, kaydet
            user_data = {
                'id': user_id,
                'username': username,
                'groups': [group_name],
                'first_seen': datetime.now().isoformat(),
                'message_count': 1
            }
            
            self.all_users[user_id] = user_data
            
            # Terminal'de göster
            print(f"   🆕 YENİ KULLANICI: @{username} | {group_name}")
            
            # Anında dosyaya kaydet
            self.save_to_file()
            
        else:
            # MEVCUT KULLANICI - Sadece grup ekle, BİLDİRME
            if group_name not in self.all_users[user_id]['groups']:
                self.all_users[user_id]['groups'].append(group_name)
                self.all_users[user_id]['message_count'] += 1
                # Sessizce güncelle, bildirim yok
                self.save_to_file()
            else:
                self.all_users[user_id]['message_count'] += 1
    
    async def get_initial_users(self, entity, group_name, limit=10000):
        """Grubun son N mesajını tara ve kullanıcıları topla"""
        print(f"\n📊 İlk tarama başlıyor: {group_name}")
        print(f"   🔍 Son {limit} mesaj taranıyor...")
        
        try:
            message_count = 0
            new_users = 0
            
            async for message in self.client.iter_messages(entity, limit=limit):
                message_count += 1
                
                if message.sender_id:
                    try:
                        user = await message.get_sender()
                        
                        # Kullanıcı adı yoksa veya bot ise atla
                        if not user or not hasattr(user, 'username') or not user.username:
                            continue
                        if hasattr(user, 'bot') and user.bot:
                            continue
                        
                        user_id = user.id
                        
                        # Sadece yeni kullanıcıları say
                        if user_id not in self.all_users:
                            new_users += 1
                            self.add_user(user, group_name, silent=True)
                        
                    except Exception as e:
                        pass
                
                # Her 1000 mesajda bir ilerleme göster
                if message_count % 1000 == 0:
                    print(f"   ⏳ {message_count}/{limit} mesaj tarandı - Yeni kullanıcı: {new_users}")
            
            print(f"   ✅ Tarama tamamlandı: {message_count} mesaj - {new_users} yeni kullanıcı bulundu")
            self.save_to_file()
            
        except Exception as e:
            print(f"   ⚠️  Tarama hatası: {str(e)}")
    
    async def setup_monitoring(self, group_links):
        """Grupları izlemeye başla - İLK TARAMA + CANLI İZLEME"""
        print("\n" + "="*80)
        print("📡 GRUPLARA KATILIYOR VE İLK TARAMA BAŞLIYOR")
        print("="*80)
        
        for link in group_links:
            try:
                entity, custom_name = await self.join_group_if_needed(link)
                if entity and custom_name:
                    self.monitored_groups[entity.id] = custom_name
                    print(f"   ✅ İzleniyor: {custom_name}")
                    
                    # İlk tarama yap
                    await self.get_initial_users(entity, custom_name, limit=10000)
                    
                await asyncio.sleep(2)
                
            except Exception as e:
                print(f"❌ Grup eklenemedi ({link}): {str(e)}")
                continue
        
        print("\n" + "="*80)
        print(f"✅ {len(self.monitored_groups)} GRUP CANLI İZLENİYOR")
        print("="*80)
        print(f"📊 Toplam kullanıcı sayısı: {len(self.all_users)}")
        print("🔴 CANLI İZLEME BAŞLIYOR - Yeni mesajlar takip ediliyor\n")
        
        # Yeni mesaj handler'ı ekle
        @self.client.on(events.NewMessage(chats=list(self.monitored_groups.keys())))
        async def handle_new_message(event):
            if event.sender_id:
                try:
                    user = await event.get_sender()
                    # Grup adını monitored_groups'tan al
                    group_name = self.monitored_groups.get(event.chat_id, 'Bilinmeyen')
                    self.add_user(user, group_name)
                except Exception as e:
                    print(f"⚠️  Mesaj işleme hatası: {str(e)}")
        
        # Yeni mesaj handler'ı ekle
        @self.client.on(events.NewMessage(chats=list(self.monitored_groups.keys())))
        async def handle_new_message(event):
            if event.sender_id:
                try:
                    user = await event.get_sender()
                    # Grup adını al
                    group_name = self.monitored_groups.get(event.chat_id)
                    if not group_name:
                        # Eğer grup adı bulunamazsa, chat'i al
                        try:
                            chat = await self.client.get_entity(event.chat_id)
                            group_name = chat.title if hasattr(chat, 'title') else 'Bilinmeyen'
                        except:
                            group_name = 'Bilinmeyen'
                    
                    self.add_user(user, group_name)
                except Exception as e:
                    print(f"⚠️  Mesaj işleme hatası: {str(e)}")
        
        # Yeni mesaj handler'ı ekle
        @self.client.on(events.NewMessage(chats=list(self.monitored_groups.keys())))
        async def handle_new_message(event):
            if event.sender_id:
                try:
                    user = await event.get_sender()
                    # Grup adını monitored_groups'tan al
                    group_name = self.monitored_groups.get(event.chat_id, 'Bilinmeyen')
                    self.add_user(user, group_name)
                except Exception as e:
                    print(f"⚠️  Mesaj işleme hatası: {str(e)}")
        
        print(f"\n💚 CANLI İZLEME AKTİF - Ctrl+C ile durdurun")
        print(f"📊 Toplam kullanıcı: {len(self.all_users)}")
        print(f"🔄 Yeni mesajlar otomatik izleniyor...\n")
    
    def save_to_file(self):
        """Kullanıcıları basit formatta kaydet - sadece username"""
        
        # Basit TXT formatı - üyeler.txt
        with open('üyeler.txt', 'w', encoding='utf-8') as f:
            for idx, (user_id, user_data) in enumerate(self.all_users.items(), 1):
                username = f"@{user_data['username']}" if user_data['username'] else "Kullanıcı adı yok"
                groups = ', '.join(user_data['groups'])
                
                f.write(f"{idx}- {username} | Gruplar: {groups}\n")
        
        # JSON (yedek olarak)
        json_file = "üyeler.json"
        export_data = {
            'last_update': datetime.now().isoformat(),
            'total_users': len(self.all_users),
            'monitored_groups': list(self.monitored_groups.values()),
            'users': list(self.all_users.values())
        }
        
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, ensure_ascii=False, indent=2)
        
        # CSV (Excel için)
        csv_file = "üyeler.csv"
        with open(csv_file, 'w', encoding='utf-8-sig') as f:
            f.write("Sıra,Kullanıcı Adı,Gruplar\n")
            
            for idx, (user_id, user_data) in enumerate(self.all_users.items(), 1):
                username = user_data['username'] or ''
                groups = ' | '.join(user_data['groups'])
                
                f.write(f"{idx},@{username},{groups}\n")
    
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
    if not API_ID or API_ID == 0:
        print("\n❌ HATA: API_ID eksik veya geçersiz!")
        print(f"Mevcut değer: {API_ID}")
        return
        
    if not API_HASH or len(API_HASH) < 10:
        print("\n❌ HATA: API_HASH eksik veya geçersiz!")
        print(f"Mevcut değer: {API_HASH[:10] if API_HASH else 'Yok'}...")
        return
        
    if not PHONE_NUMBER or not PHONE_NUMBER.startswith('+'):
        print("\n❌ HATA: Telefon numarası eksik veya hatalı!")
        print(f"Mevcut değer: {PHONE_NUMBER}")
        print("Doğru format: +905551234567")
        return
    
    print("\n✅ Konfigürasyon doğru!")
    
    # İzlenecek gruplar
    group_links = [
        'https://t.me/ykssohbetV2',
        'https://t.me/ykssohbetc',
        'https://t.me/ykskrallik',
        'https://t.me/ykssohbetz',
        'https://t.me/ykssohbetiniz',
    ]
    
    print(f"\n📋 İzlenecek grup sayısı: {len(group_links)}")
    print(f"🔍 İlk tarama: Son 10000 mesaj (her gruptan)")
    print(f"🔴 Canlı izleme: AÇIK (sürekli)")
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
        await monitor.setup_monitoring(group_links)
        
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
