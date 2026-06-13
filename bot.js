/**
 * LumiChat Bot Sistemi
 * Kullanım: node bot.js
 * Bot sayısını ve sunucu adresini aşağıdan ayarla.
 */

const { io } = require("socket.io-client");

const SERVER_URL = "https://lumichat-canli.onrender.com";
const BOT_COUNT  = 3; // Kaç bot çalışsın

// ── Bot mesaj havuzu ────────────────────────────────────────────────────────
const messages = {
  greet:  ["Merhaba! 👋", "Selam!", "Hey, nasılsın?", "Hi there! 😊", "Merhaba, nasıl gidiyor?"],
  reply:  [
    "Güzel, teşekkürler 😄",
    "İyiyim, sen?",
    "Harika bir gün geçiriyorum!",
    "Biraz yorgunum ama iyi sayılırım 😅",
    "Fena değil, sağ ol!",
    "Çok iyiyim, görüşmek güzel 😊",
    "Burada yeni biriyim, merhaba!",
  ],
  chat: [
    "Nereden bağlanıyorsun?",
    "Bu uygulama çok güzel!",
    "Hava bugün nasıl orada?",
    "Ne iş yapıyorsun?",
    "Müzik dinliyor musun?",
    "LumiChat'i çok sevdim 🔥",
    "Sohbet etmek çok güzel 😄",
    "Bugün nasıl geçiyor?",
    "Nelerle ilgileniyorsun?",
    "Burada çok insan var mı genelde?",
  ],
  bye: ["Görüşürüz! 👋", "Hoşçakal!", "Bye bye 😊", "İyi günler!", "Görüşmek üzere!"],
};

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ── Bot sınıfı ──────────────────────────────────────────────────────────────
class Bot {
  constructor(id) {
    this.id       = id;
    this.name     = `Bot#${id}`;
    this.socket   = null;
    this.matched  = false;
    this.chatTimer = null;

    const genders = ["erkek", "kadin", "belirtmek-istemiyorum"];
    this.gender = genders[id % genders.length];
  }

  connect() {
    this.socket = io(SERVER_URL, { transports: ["websocket"] });

    this.socket.on("connect", () => {
      console.log(`[${this.name}] Bağlandı — ${this.socket.id}`);
      this.joinQueue();
    });

    this.socket.on("waiting", () => {
      console.log(`[${this.name}] Eşleşme bekleniyor...`);
    });

    this.socket.on("matched", async (data) => {
      this.matched = true;
      console.log(`[${this.name}] Eşleşti! isInitiator: ${data.isInitiator}`);
      await sleep(1500);
      this.socket.emit("message", rand(messages.greet));
      this.startChatLoop();
    });

    this.socket.on("message", async (text) => {
      console.log(`[${this.name}] Mesaj aldı: "${text}"`);
      await sleep(1000 + Math.random() * 2000);
      if (this.matched) {
        this.socket.emit("message", rand(messages.reply));
      }
    });

    this.socket.on("strangerLeft", async () => {
      console.log(`[${this.name}] Karşı taraf ayrıldı, yeniden kuyruğa giriyor...`);
      this.matched = false;
      clearInterval(this.chatTimer);
      await sleep(2000 + Math.random() * 3000);
      this.joinQueue();
    });

    this.socket.on("disconnect", () => {
      console.log(`[${this.name}] Bağlantı kesildi, yeniden bağlanıyor...`);
      this.matched = false;
      clearInterval(this.chatTimer);
      setTimeout(() => this.connect(), 5000);
    });
  }

  joinQueue() {
    console.log(`[${this.name}] Kuyruğa girdi (cinsiyet: ${this.gender})`);
    this.socket.emit("join", {
      genderFilter: "herkesle",
      myGender:     this.gender
    });
  }

  startChatLoop() {
    // Her 5-15 saniyede bir rastgele mesaj at
    this.chatTimer = setInterval(async () => {
      if (!this.matched) { clearInterval(this.chatTimer); return; }

      const roll = Math.random();

      if (roll < 0.15) {
        // %15 ihtimalle ayrıl ve yeniden eşleş
        console.log(`[${this.name}] Sohbetten ayrılıyor...`);
        this.socket.emit("message", rand(messages.bye));
        await sleep(800);
        this.matched = false;
        clearInterval(this.chatTimer);
        this.socket.emit("next");
        await sleep(2000 + Math.random() * 2000);
        this.joinQueue();
      } else {
        // Mesaj at
        const msg = rand(messages.chat);
        console.log(`[${this.name}] Mesaj gönderiyor: "${msg}"`);
        this.socket.emit("message", msg);
      }
    }, 5000 + Math.random() * 10000);
  }
}

// ── Botları başlat ──────────────────────────────────────────────────────────
console.log(`\n🤖 LumiChat Bot Sistemi başlatılıyor — ${BOT_COUNT} bot`);
console.log(`📡 Sunucu: ${SERVER_URL}\n`);

const bots = [];
for (let i = 1; i <= BOT_COUNT; i++) {
  setTimeout(() => {
    const bot = new Bot(i);
    bot.connect();
    bots.push(bot);
  }, i * 1500); // Her botu 1.5sn arayla başlat
}

// Temiz kapatma
process.on("SIGINT", () => {
  console.log("\n⛔ Botlar kapatılıyor...");
  bots.forEach(b => b.socket?.disconnect());
  process.exit(0);
});
