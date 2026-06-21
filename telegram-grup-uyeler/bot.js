require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

// Bot token kontrolü
if (!process.env.BOT_TOKEN) {
  console.error('❌ BOT_TOKEN bulunamadı! Lütfen .env dosyasını oluşturun.');
  process.exit(1);
}

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// İzin verilen grupları parse et
const allowedChats = process.env.ALLOWED_CHATS 
  ? process.env.ALLOWED_CHATS.split(',').map(id => id.trim())
  : [];

console.log('🤖 Telegram Bot başlatıldı!');
console.log(`📋 İzin verilen grup sayısı: ${allowedChats.length || 'Tüm gruplar'}`);

// Yardım menüsü
const helpMessage = `
🤖 *Telegram Grup Üye Listesi Botu*

*Komutlar:*
/start - Botu başlat
/help - Bu yardım menüsünü göster
/liste - Gruptaki tüm üyeleri listele
/sayac - Grup üye sayısını göster
/export - Üyeleri JSON dosyası olarak indir
/exportcsv - Üyeleri CSV dosyası olarak indir
/grupid - Bu grubun ID'sini göster

*Özellikler:*
• Bot, admin olduğu gruplarda üyeleri listeleyebilir
• Kullanıcı adı, isim, ID bilgilerini gösterir
• JSON ve CSV formatında dışa aktarma
• Bot ve kullanıcı ayrımı

*Not:* Bot'un grupta admin olması gerekir!
`;

// Grup kontrolü
function isAllowedChat(chatId) {
  if (allowedChats.length === 0) return true; // Tüm gruplara izin
  return allowedChats.includes(chatId.toString());
}

// Admin kontrolü
async function isUserAdmin(chatId, userId) {
  try {
    const member = await bot.getChatMember(chatId, userId);
    return ['creator', 'administrator'].includes(member.status);
  } catch (error) {
    console.error('Admin kontrolü hatası:', error.message);
    return false;
  }
}

// /start komutu
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const chatType = msg.chat.type;

  if (chatType === 'private') {
    await bot.sendMessage(chatId, 
      '👋 Merhaba! Ben grup üyelerini listeleme botuyum.\n\n' +
      'Beni bir gruba ekleyin ve *admin* yapın, sonra /liste komutunu kullanın.\n\n' +
      'Daha fazla bilgi için: /help',
      { parse_mode: 'Markdown' }
    );
  } else {
    await bot.sendMessage(chatId, 
      '✅ Bot aktif! Komutlar için /help yazın.',
      { parse_mode: 'Markdown' }
    );
  }
});

// /help komutu
bot.onText(/\/help/, async (msg) => {
  await bot.sendMessage(msg.chat.id, helpMessage, { parse_mode: 'Markdown' });
});

// /grupid komutu - Grup ID'sini göster
bot.onText(/\/grupid/, async (msg) => {
  const chatId = msg.chat.id;
  const chatType = msg.chat.type;

  if (chatType === 'private') {
    await bot.sendMessage(chatId, '❌ Bu komut sadece gruplarda çalışır!');
    return;
  }

  await bot.sendMessage(chatId, 
    `📋 *Grup Bilgileri*\n\n` +
    `Grup Adı: ${msg.chat.title}\n` +
    `Grup ID: \`${chatId}\`\n` +
    `Tip: ${chatType}\n\n` +
    `Bu ID'yi .env dosyasına ekleyebilirsiniz.`,
    { parse_mode: 'Markdown' }
  );
});

// /sayac komutu - Üye sayısı
bot.onText(/\/sayac/, async (msg) => {
  const chatId = msg.chat.id;
  const chatType = msg.chat.type;

  if (chatType === 'private') {
    await bot.sendMessage(chatId, '❌ Bu komut sadece gruplarda çalışır!');
    return;
  }

  if (!isAllowedChat(chatId)) {
    await bot.sendMessage(chatId, '❌ Bu grupta bot kullanımı yetkilendirilmemiş!');
    return;
  }

  try {
    const count = await bot.getChatMembersCount(chatId);
    await bot.sendMessage(chatId, 
      `👥 *Grup Üye Sayısı*\n\n` +
      `Toplam: *${count}* üye`,
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    await bot.sendMessage(chatId, 
      `❌ Hata: ${error.message}\n\n` +
      `Bot'un admin olduğundan emin olun!`
    );
  }
});

// /liste komutu - Üyeleri listele
bot.onText(/\/liste/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const chatType = msg.chat.type;

  if (chatType === 'private') {
    await bot.sendMessage(chatId, '❌ Bu komut sadece gruplarda çalışır!');
    return;
  }

  if (!isAllowedChat(chatId)) {
    await bot.sendMessage(chatId, '❌ Bu grupta bot kullanımı yetkilendirilmemiş!');
    return;
  }

  // Komutu kullanan kişi admin mi kontrol et
  const isAdmin = await isUserAdmin(chatId, userId);
  if (!isAdmin) {
    await bot.sendMessage(chatId, '❌ Bu komutu sadece grup adminleri kullanabilir!');
    return;
  }

  const statusMsg = await bot.sendMessage(chatId, '⏳ Üyeler listeleniyor...');

  try {
    const members = [];
    
    // Not: getChatAdministrators sadece adminleri verir
    // Tüm üyeleri almak için Telegram Bot API kısıtlaması var
    // Bu yüzden sadece adminleri listeleyelim
    
    const admins = await bot.getChatAdministrators(chatId);
    
    let message = `👥 *Grup Adminleri* (${admins.length})\n\n`;
    
    admins.forEach((admin, index) => {
      const user = admin.user;
      const name = user.first_name + (user.last_name ? ' ' + user.last_name : '');
      const username = user.username ? `@${user.username}` : 'Yok';
      const status = admin.status === 'creator' ? '👑' : '⭐';
      const isBot = user.is_bot ? '🤖' : '👤';
      
      message += `${index + 1}. ${status} ${isBot} ${name}\n`;
      message += `   ID: \`${user.id}\`\n`;
      message += `   Kullanıcı Adı: ${username}\n\n`;
      
      members.push({
        id: user.id,
        username: user.username || null,
        first_name: user.first_name,
        last_name: user.last_name || null,
        is_bot: user.is_bot,
        status: admin.status
      });
    });

    message += `\n⚠️ *Not:* Telegram Bot API kısıtlaması nedeniyle sadece adminler listelenebilir.\n\n`;
    message += `Tüm üyeleri görmek için README.md dosyasındaki alternatif yöntemlere bakın.`;

    await bot.deleteMessage(chatId, statusMsg.message_id);
    
    // Mesaj çok uzunsa parçalara böl
    if (message.length > 4000) {
      const chunks = message.match(/[\s\S]{1,4000}/g);
      for (const chunk of chunks) {
        await bot.sendMessage(chatId, chunk, { parse_mode: 'Markdown' });
      }
    } else {
      await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    }

    return members;

  } catch (error) {
    await bot.deleteMessage(chatId, statusMsg.message_id);
    await bot.sendMessage(chatId, 
      `❌ *Hata oluştu!*\n\n` +
      `${error.message}\n\n` +
      `Bot'un admin olduğundan ve gerekli yetkilere sahip olduğundan emin olun!`,
      { parse_mode: 'Markdown' }
    );
    console.error('Üye listesi hatası:', error);
  }
});

// /export komutu - JSON olarak dışa aktar
bot.onText(/\/export/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const chatType = msg.chat.type;

  if (chatType === 'private') {
    await bot.sendMessage(chatId, '❌ Bu komut sadece gruplarda çalışır!');
    return;
  }

  if (!isAllowedChat(chatId)) {
    await bot.sendMessage(chatId, '❌ Bu grupta bot kullanımı yetkilendirilmemiş!');
    return;
  }

  const isAdmin = await isUserAdmin(chatId, userId);
  if (!isAdmin) {
    await bot.sendMessage(chatId, '❌ Bu komutu sadece grup adminleri kullanabilir!');
    return;
  }

  const statusMsg = await bot.sendMessage(chatId, '⏳ JSON dosyası hazırlanıyor...');

  try {
    const admins = await bot.getChatAdministrators(chatId);
    const members = admins.map(admin => ({
      id: admin.user.id,
      username: admin.user.username || null,
      first_name: admin.user.first_name,
      last_name: admin.user.last_name || null,
      is_bot: admin.user.is_bot,
      status: admin.status
    }));

    const exportData = {
      chat_id: chatId,
      chat_title: msg.chat.title,
      export_date: new Date().toISOString(),
      member_count: admins.length,
      members: members
    };

    const filename = `members_${chatId}_${Date.now()}.json`;
    const filepath = path.join(__dirname, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2), 'utf8');

    await bot.deleteMessage(chatId, statusMsg.message_id);
    await bot.sendDocument(chatId, filepath, {
      caption: `📥 Grup üyeleri JSON formatında\n\nToplam: ${admins.length} admin`
    });

    // Dosyayı temizle
    setTimeout(() => {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }, 5000);

  } catch (error) {
    await bot.deleteMessage(chatId, statusMsg.message_id);
    await bot.sendMessage(chatId, `❌ Hata: ${error.message}`);
    console.error('Export hatası:', error);
  }
});

// /exportcsv komutu - CSV olarak dışa aktar
bot.onText(/\/exportcsv/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const chatType = msg.chat.type;

  if (chatType === 'private') {
    await bot.sendMessage(chatId, '❌ Bu komut sadece gruplarda çalışır!');
    return;
  }

  if (!isAllowedChat(chatId)) {
    await bot.sendMessage(chatId, '❌ Bu grupta bot kullanımı yetkilendirilmemiş!');
    return;
  }

  const isAdmin = await isUserAdmin(chatId, userId);
  if (!isAdmin) {
    await bot.sendMessage(chatId, '❌ Bu komutu sadece grup adminleri kullanabilir!');
    return;
  }

  const statusMsg = await bot.sendMessage(chatId, '⏳ CSV dosyası hazırlanıyor...');

  try {
    const admins = await bot.getChatAdministrators(chatId);
    
    let csv = 'ID,Kullanıcı Adı,Ad,Soyad,Bot?,Durum\n';
    
    admins.forEach(admin => {
      const user = admin.user;
      csv += `${user.id},`;
      csv += `${user.username || ''},`;
      csv += `"${user.first_name}",`;
      csv += `"${user.last_name || ''}",`;
      csv += `${user.is_bot ? 'Evet' : 'Hayır'},`;
      csv += `${admin.status}\n`;
    });

    const filename = `members_${chatId}_${Date.now()}.csv`;
    const filepath = path.join(__dirname, filename);
    
    // UTF-8 BOM ekle (Excel uyumluluğu için)
    fs.writeFileSync(filepath, '\ufeff' + csv, 'utf8');

    await bot.deleteMessage(chatId, statusMsg.message_id);
    await bot.sendDocument(chatId, filepath, {
      caption: `📥 Grup üyeleri CSV formatında\n\nToplam: ${admins.length} admin`
    });

    // Dosyayı temizle
    setTimeout(() => {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }, 5000);

  } catch (error) {
    await bot.deleteMessage(chatId, statusMsg.message_id);
    await bot.sendMessage(chatId, `❌ Hata: ${error.message}`);
    console.error('CSV export hatası:', error);
  }
});

// Hata yakalama
bot.on('polling_error', (error) => {
  console.error('Polling hatası:', error.message);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Bot kapatılıyor...');
  bot.stopPolling();
  process.exit(0);
});

console.log('✅ Bot hazır! Telegram gruplarınıza ekleyebilirsiniz.');
console.log('💡 Kullanmadan önce .env dosyasını oluşturup BOT_TOKEN ekleyin!');
