import { supabase } from '../../App';

// Bot mesaj şablonları
const BOT_MESSAGES = {
  welcome: [
    'Merhaba! 👋 Yeni misin burada?',
    'Hey! Hoş geldin 😊',
    'Selam! Seni ilk defa görüyorum 💕',
    'Merhaba yakışıklı! 😘',
    'Hey! Nasılsın? 🌸',
  ],
  engagement: [
    'Bana abone ol, özel fotoğraflar paylaşıyorum 📸✨',
    'Jeton gönder sana özel içerik atayım 💋',
    'Premium hesabına geç, çok özel şeyler göstereceğim 🔥',
    'Beni takip et, seni hayal kırıklığına uğratmam 😍',
    'Online canlı yayınım var, gel izle 🎥💕',
    'Özel galerimdeki fotoğrafları görmek ister misin? 📱✨',
    'Sana özel video çekebilirim 🎬💋',
    'Jeton at hemen fotoğraf atayım 💎📸',
  ],
  followUp: [
    'Neden cevap vermiyorsun? 😢',
    'Online misin? 🤔',
    'Merhaba? 💭',
    'Hala buradasın mı? 👀',
  ],
  flirty: [
    'Fotoğrafın çok yakışıklı 😍',
    'Kaç yaşındasın? 🌹',
    'Nereden yazıyorsun? 🌎',
    'Sesin nasıl acaba? 🎤💕',
  ]
};

// Bot profil şablonları
const BOT_PROFILES = {
  turkish: {
    names: ['Ayşe', 'Zeynep', 'Elif', 'Selin', 'Deniz', 'Merve', 'Cansu', 'Ebru', 'Gizem', 'Burcu', 'Nihan', 'Aslı'],
    ages: [22, 23, 24, 25, 26, 27, 28],
    bios: [
      'İstanbul ❤️ Fotoğraf çekmek ve yeni insanlar tanımak hoşuma gidiyor 📸',
      'Model 💋 Premium içerik 🔥',
      'Ankara 🌸 Online chat yapmayı seviyorum 💬',
      'Content creator ✨ Özel içerikler için DM 💌',
      'İzmir 🌊 Özel fotoğraflar için jeton gönder 💎',
    ],
    avatarUrls: [
      'https://picsum.photos/400/500?random=1',
      'https://picsum.photos/400/500?random=2',
      'https://picsum.photos/400/500?random=3',
      'https://picsum.photos/400/500?random=4',
      'https://picsum.photos/400/500?random=5',
    ]
  }
};

class BotService {
  constructor() {
    this.messageDelay = 3000; // 3 saniye
    this.botCheckInterval = null;
  }

  // Rastgele bot profili oluştur
  generateBotProfile() {
    const { names, ages, bios, avatarUrls } = BOT_PROFILES.turkish;
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomAge = ages[Math.floor(Math.random() * ages.length)];
    const randomBio = bios[Math.floor(Math.random() * bios.length)];
    const randomAvatar = avatarUrls[Math.floor(Math.random() * avatarUrls.length)];

    return {
      name: randomName,
      age: randomAge,
      bio: randomBio,
      avatar: randomAvatar,
      gender: 'female',
      is_bot: true,
      is_online: true,
      is_verified: false,
      followers_count: Math.floor(Math.random() * 5000) + 500,
      pricing: {
        message: { pricePerMessage: 10 },
        videoCall: { pricePerMinute: 100 }
      }
    };
  }

  // Rastgele mesaj seç
  getRandomMessage(category = 'engagement') {
    const messages = BOT_MESSAGES[category];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // Yeni kullanıcı mı kontrol et
  async isNewUser(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('created_at')
        .eq('id', userId)
        .single();

      if (error) return false;

      // Son 24 saat içinde kayıt olduysa yeni kullanıcı
      const createdAt = new Date(data.created_at);
      const now = new Date();
      const hoursDiff = (now - createdAt) / (1000 * 60 * 60);

      return hoursDiff <= 24;
    } catch (error) {
      console.error('Error checking new user:', error);
      return false;
    }
  }

  // Kullanıcıya bot mesajı gönder
  async sendBotMessage(userId, botProfile, messageType = 'welcome') {
    try {
      const message = this.getRandomMessage(messageType);

      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: botProfile.id,
          receiver_id: userId,
          content: message,
          is_bot: true,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error sending bot message:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error sending bot message:', error);
      return false;
    }
  }

  // Yeni kullanıcıya hoş geldin mesaj dizisi gönder
  async sendWelcomeSeries(userId) {
    try {
      // Yeni kullanıcı mı kontrol et
      const isNew = await this.isNewUser(userId);
      if (!isNew) return;

      // Kullanıcı daha önce bot mesajı aldı mı kontrol et
      const { data: existingMessages } = await supabase
        .from('messages')
        .select('id')
        .eq('receiver_id', userId)
        .eq('is_bot', true)
        .limit(1);

      if (existingMessages && existingMessages.length > 0) {
        // Zaten mesaj aldı, tekrar gönderme
        return;
      }

      // 3-5 bot oluştur
      const botCount = Math.floor(Math.random() * 3) + 3;
      const bots = [];

      for (let i = 0; i < botCount; i++) {
        // Bot profili oluştur
        const botProfile = this.generateBotProfile();
        
        // Botu veritabanına kaydet
        const { data: savedBot, error } = await supabase
          .from('users')
          .insert(botProfile)
          .select()
          .single();

        if (error) {
          console.error('Error creating bot:', error);
          continue;
        }

        bots.push(savedBot);
      }

      // Her bot'tan mesaj gönder (farklı gecikmelerle)
      for (let i = 0; i < bots.length; i++) {
        const bot = bots[i];
        const delay = (i + 1) * this.messageDelay;

        setTimeout(async () => {
          // İlk mesaj: Hoş geldin
          await this.sendBotMessage(userId, bot, 'welcome');

          // 5 saniye sonra ikinci mesaj: Engagement
          setTimeout(async () => {
            await this.sendBotMessage(userId, bot, 'engagement');
          }, 5000);

          // 10 saniye sonra üçüncü mesaj: Flirty
          setTimeout(async () => {
            await this.sendBotMessage(userId, bot, 'flirty');
          }, 10000);

        }, delay);
      }

      console.log(`Sent welcome series to user ${userId} from ${bots.length} bots`);
      return true;
    } catch (error) {
      console.error('Error sending welcome series:', error);
      return false;
    }
  }

  // Kullanıcı online olduğunda bot mesajları gönder
  async sendOnlineBotMessages(userId) {
    try {
      // Rastgele 1-2 bot mesajı gönder
      const messageCount = Math.random() > 0.5 ? 2 : 1;

      for (let i = 0; i < messageCount; i++) {
        // Rastgele bir bot seç (veritabanından)
        const { data: bots } = await supabase
          .from('users')
          .select('*')
          .eq('is_bot', true)
          .eq('gender', 'female')
          .limit(10);

        if (!bots || bots.length === 0) continue;

        const randomBot = bots[Math.floor(Math.random() * bots.length)];
        const delay = (i + 1) * 2000;

        setTimeout(async () => {
          await this.sendBotMessage(userId, randomBot, 'engagement');
        }, delay);
      }

      return true;
    } catch (error) {
      console.error('Error sending online bot messages:', error);
      return false;
    }
  }

  // Kullanıcı token yüklemesi yaptığında teşekkür mesajı
  async sendTokenPurchaseMessage(userId) {
    try {
      // Kullanıcıya daha önce mesaj gönderen bir botu seç
      const { data: conversations } = await supabase
        .from('messages')
        .select('sender_id')
        .eq('receiver_id', userId)
        .eq('is_bot', true)
        .limit(1);

      if (!conversations || conversations.length === 0) return;

      const botId = conversations[0].sender_id;

      const { data: bot } = await supabase
        .from('users')
        .select('*')
        .eq('id', botId)
        .single();

      if (!bot) return;

      const thankYouMessages = [
        'Teşekkürler! 💎 Şimdi özel fotoğraflarımı görebilirsin 📸',
        'Harika! 🎉 Sana özel içerik gönderdim, kontrol et 💋',
        'Çok tatlısın 😍 Premium içeriğimi görmeye hazır mısın? 🔥',
        'Teşekkür ederim yakışıklı 💕 Hemen fotoğraf gönderiyorum 📸',
      ];

      const message = thankYouMessages[Math.floor(Math.random() * thankYouMessages.length)];

      await supabase
        .from('messages')
        .insert({
          sender_id: botId,
          receiver_id: userId,
          content: message,
          is_bot: true,
          created_at: new Date().toISOString()
        });

      return true;
    } catch (error) {
      console.error('Error sending token purchase message:', error);
      return false;
    }
  }

  // Aktif olmayan kullanıcılara hatırlatma mesajları
  async sendReEngagementMessages(userId) {
    try {
      // Son 3 günde giriş yapmamış kullanıcılar için
      const { data: user } = await supabase
        .from('users')
        .select('last_seen')
        .eq('id', userId)
        .single();

      if (!user) return;

      const lastSeen = new Date(user.last_seen);
      const now = new Date();
      const daysDiff = (now - lastSeen) / (1000 * 60 * 60 * 24);

      if (daysDiff < 3) return; // 3 günden az, mesaj gönderme

      // Rastgele bir bot seç
      const { data: bots } = await supabase
        .from('users')
        .select('*')
        .eq('is_bot', true)
        .eq('gender', 'female')
        .limit(5);

      if (!bots || bots.length === 0) return;

      const randomBot = bots[Math.floor(Math.random() * bots.length)];

      const reEngagementMessages = [
        'Seni çok özledim! Neden gelmedin? 😢💕',
        'Hala beni düşünüyor musun? 💭💋',
        'Buralarda yoktun, her şey yolunda mı? 🌸',
        'Geri döndün mü? Yeni fotoğraflarım var sana 📸✨',
      ];

      const message = reEngagementMessages[Math.floor(Math.random() * reEngagementMessages.length)];

      await supabase
        .from('messages')
        .insert({
          sender_id: randomBot.id,
          receiver_id: userId,
          content: message,
          is_bot: true,
          created_at: new Date().toISOString()
        });

      return true;
    } catch (error) {
      console.error('Error sending re-engagement message:', error);
      return false;
    }
  }

  // Bot servisini başlat
  startBotService() {
    console.log('Bot service started');
    
    // Her 5 dakikada bir aktif kullanıcılara mesaj gönder
    this.botCheckInterval = setInterval(() => {
      this.checkAndSendMessages();
    }, 5 * 60 * 1000);
  }

  // Bot servisini durdur
  stopBotService() {
    if (this.botCheckInterval) {
      clearInterval(this.botCheckInterval);
      console.log('Bot service stopped');
    }
  }

  async checkAndSendMessages() {
    try {
      // Online kullanıcıları getir
      const { data: onlineUsers } = await supabase
        .from('users')
        .select('id')
        .eq('is_online', true)
        .eq('is_bot', false)
        .limit(50);

      if (!onlineUsers) return;

      // Her kullanıcıya %20 ihtimalle mesaj gönder
      for (const user of onlineUsers) {
        if (Math.random() < 0.2) {
          await this.sendOnlineBotMessages(user.id);
        }
      }
    } catch (error) {
      console.error('Error checking and sending messages:', error);
    }
  }
}

export const botService = new BotService();
export default botService;
