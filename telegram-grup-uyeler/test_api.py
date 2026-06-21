#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Telegram API Test - Basit bağlantı testi
"""

import asyncio
from telethon import TelegramClient
from telethon.errors import ApiIdInvalidError, PhoneNumberInvalidError
import os

# .env dosyasını yükle
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

API_ID = int(os.getenv('TELEGRAM_API_ID', '31532670'))
API_HASH = os.getenv('TELEGRAM_API_HASH', '639863426cc29526d8ca5570d61d10b6')
PHONE = os.getenv('TELEGRAM_PHONE', '+905491227528')

async def test_connection():
    print("="*60)
    print("TELEGRAM API TEST")
    print("="*60)
    print(f"\nAPI ID: {API_ID}")
    print(f"API Hash: {API_HASH[:10]}...")
    print(f"Phone: {PHONE}")
    print("\nBağlantı test ediliyor...\n")
    
    client = TelegramClient('test_session', API_ID, API_HASH)
    
    try:
        await client.connect()
        print("✅ Telegram sunucusuna bağlanıldı!")
        
        # Telefon numarasını kontrol et
        if not await client.is_user_authorized():
            print("\n📱 SMS kodu gönderiliyor...")
            await client.send_code_request(PHONE)
            print("✅ SMS kodu gönderildi!")
            print(f"\n{PHONE} numarasına gelen kodu girin:")
            
            code = input("Kod: ")
            await client.sign_in(PHONE, code)
            print("\n✅ Giriş başarılı!")
        else:
            print("✅ Zaten giriş yapılmış!")
            
        me = await client.get_me()
        print(f"\n👤 Kullanıcı: {me.first_name}")
        print(f"📱 Telefon: {me.phone}")
        
        print("\n" + "="*60)
        print("✅ TEST BAŞARILI - API bilgileri doğru!")
        print("="*60)
        
    except ApiIdInvalidError:
        print("\n❌ API ID veya API Hash HATALI!")
        print("\nhttps://my.telegram.org/apps adresini kontrol edin.")
        
    except PhoneNumberInvalidError:
        print(f"\n❌ Telefon numarası HATALI: {PHONE}")
        print("\n+90 ile başladığından emin olun.")
        
    except Exception as e:
        print(f"\n❌ Hata: {type(e).__name__}")
        print(f"Detay: {str(e)}")
        
    finally:
        await client.disconnect()

if __name__ == '__main__':
    asyncio.run(test_connection())
