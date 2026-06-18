const express = require('express');
const app = express();
const path = require('path');
const http = require('http').createServer(app);
const { createClient } = require('@supabase/supabase-js');

// ── Supabase (server-side service role) ────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://aaszyppzidhazpbmcipv.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ''; // .env veya ortam değişkeninden al
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const io = require('socket.io')(http, {
  cors: { origin: "*" },
  // Socket.IO güvenlik ayarları
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 1e6 // 1MB max mesaj boyutu
});

// ── Güvenlik başlıkları ──────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=self, microphone=self');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // TÜM dosyalar için cache'i tamamen kapat (boş sayfa sorununu çözmek için)
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  next();
});

// ── Rate Limiting (IP başına istek limiti) ───────────────────────────
const requestCounts = new Map(); // IP → { count, resetTime }
const RATE_LIMIT    = 100;       // 1 dakikada max 100 istek
const RATE_WINDOW   = 60 * 1000; // 1 dakika

function rateLimiter(req, res, next) {
  const ip  = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
  const now = Date.now();
  const rec = requestCounts.get(ip);

  if (!rec || now > rec.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return next();
  }

  rec.count++;
  if (rec.count > RATE_LIMIT) {
    return res.status(429).json({ error: 'Çok fazla istek. Lütfen bekle.' });
  }
  next();
}

// Her 5 dakikada eski IP kayıtlarını temizle
setInterval(() => {
  const now = Date.now();
  for (const [ip, rec] of requestCounts.entries()) {
    if (now > rec.resetTime) requestCounts.delete(ip);
  }
}, 5 * 60 * 1000);

app.use(rateLimiter);

// ── Socket.IO bağlantı limiti (IP başına) ───────────────────────────
const socketConnections = new Map(); // IP → count
const MAX_CONNECTIONS_PER_IP = 5;

// ── Banlı IP listesi (dinamik) ───────────────────────────────────────
const bannedIPs = new Set();

function banIP(ip, durationMs = 30 * 60 * 1000) {
  bannedIPs.add(ip);
  console.log(`[BAN] IP banlandi: ${ip}`);
  setTimeout(() => {
    bannedIPs.delete(ip);
    console.log(`[BAN] IP bani kaldirildi: ${ip}`);
  }, durationMs);
}

// ── Statik dosyalar ──────────────────────────────────────────────────
app.use(express.json());
app.use(express.static(__dirname));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// ── IP kaydet endpoint ────────────────────────────────────────────────
app.post('/api/log-ip', (req, res) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
  res.json({ ip: ip || 'unknown' });
});

// GET de destekle (frontend GET kullanıyor)
app.get('/api/log-ip', (req, res) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
  res.json({ ip: ip || 'unknown' });
});

// ── Arkadaş sistemi API'ları ─────────────────────────────────────────

// Arkadaşlık isteği gönder
app.post('/api/friends/request', async (req, res) => {
  const { requesterId, receiverId } = req.body;
  if (!requesterId || !receiverId) return res.status(400).json({ error: 'requesterId ve receiverId gerekli' });
  if (requesterId === receiverId) return res.status(400).json({ error: 'Kendinize istek gönderemezsiniz' });

  // Mevcut kayıt var mı kontrol et
  const { data: existing } = await supabase
    .from('friends')
    .select('id, status')
    .or(`and(requester_id.eq.${requesterId},receiver_id.eq.${receiverId}),and(requester_id.eq.${receiverId},receiver_id.eq.${requesterId})`)
    .maybeSingle();

  if (existing) {
    if (existing.status === 'accepted') return res.json({ ok: false, message: 'Zaten arkadaşsınız' });
    if (existing.status === 'pending')  return res.json({ ok: false, message: 'İstek zaten gönderilmiş' });
  }

  const { error } = await supabase.from('friends').insert({ requester_id: requesterId, receiver_id: receiverId });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true, message: 'Arkadaşlık isteği gönderildi' });
});

// İsteği kabul / reddet
app.post('/api/friends/respond', async (req, res) => {
  const { friendId, userId, action } = req.body; // action: 'accepted' | 'rejected'
  if (!friendId || !userId || !action) return res.status(400).json({ error: 'Eksik parametre' });
  if (!['accepted', 'rejected'].includes(action)) return res.status(400).json({ error: 'Geçersiz aksiyon' });

  const { error } = await supabase
    .from('friends')
    .update({ status: action })
    .eq('id', friendId)
    .eq('receiver_id', userId);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// Arkadaş listesi
app.get('/api/friends/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ error: 'userId gerekli' });

  const { data, error } = await supabase
    .from('friends')
    .select(`id, status, requester_id, receiver_id,
      requester:users!friends_requester_id_fkey(id, username, display_name),
      receiver:users!friends_receiver_id_fkey(id, username, display_name)`)
    .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
    .eq('status', 'accepted');

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true, friends: data || [] });
});

// Bekleyen istekler
app.get('/api/friends/pending/:userId', async (req, res) => {
  const { userId } = req.params;
  const { data, error } = await supabase
    .from('friends')
    .select(`id, status, created_at,
      requester:users!friends_requester_id_fkey(id, username, display_name)`)
    .eq('receiver_id', userId)
    .eq('status', 'pending');

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true, requests: data || [] });
});

// ── Hediye sistemi API'ları ──────────────────────────────────────────

const GIFT_COSTS = { rose: 1, heart: 2, star: 3, crown: 5, diamond: 10 };

app.post('/api/gifts/send', async (req, res) => {
  const { senderId, receiverId, giftType } = req.body;
  if (!senderId || !receiverId || !giftType) return res.status(400).json({ error: 'Eksik parametre' });
  if (!GIFT_COSTS[giftType]) return res.status(400).json({ error: 'Geçersiz hediye tipi' });

  const cost = GIFT_COSTS[giftType];

  // Gönderici bakiyesini çek
  const { data: sender, error: senderErr } = await supabase
    .from('users')
    .select('gift_balance')
    .eq('id', senderId)
    .single();

  if (senderErr || !sender) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
  if ((sender.gift_balance || 0) < cost) return res.status(400).json({ error: 'Yetersiz bakiye' });

  // Bakiyeyi düş
  const { error: updateErr } = await supabase
    .from('users')
    .update({ gift_balance: sender.gift_balance - cost })
    .eq('id', senderId);

  if (updateErr) return res.status(500).json({ error: updateErr.message });

  // Hediyeyi kaydet
  const { error: giftErr } = await supabase
    .from('gifts')
    .insert({ sender_id: senderId, receiver_id: receiverId, gift_type: giftType, token_cost: cost });

  if (giftErr) return res.status(500).json({ error: giftErr.message });

  res.json({ ok: true, remaining: sender.gift_balance - cost });
});

// Kullanıcının aldığı hediyeler
app.get('/api/gifts/:userId', async (req, res) => {
  const { userId } = req.params;
  const { data, error } = await supabase
    .from('gifts')
    .select(`id, gift_type, token_cost, created_at,
      sender:users!gifts_sender_id_fkey(id, username, display_name)`)
    .eq('receiver_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true, gifts: data || [] });
});

// ── Premium üyelik API'ları ──────────────────────────────────────────

const PREMIUM_PACKAGES = {
  week:  { days: 7,  price: 4.99 },
  month: { days: 30, price: 9.99 },
  year:  { days: 365, price: 49.99 }
};

// Premium aktif et (ödeme entegrasyonu yapılana kadar manuel / test)
app.post('/api/premium/activate', async (req, res) => {
  const { userId, packageId } = req.body;
  if (!userId || !packageId) return res.status(400).json({ error: 'Eksik parametre' });
  if (!PREMIUM_PACKAGES[packageId]) return res.status(400).json({ error: 'Geçersiz paket' });

  const { days } = PREMIUM_PACKAGES[packageId];
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase
    .from('users')
    .update({ is_premium: true, premium_expires: expiresAt })
    .eq('id', userId);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true, expires_at: expiresAt, days });
});

// Premium durumu sorgula
app.get('/api/premium/status/:userId', async (req, res) => {
  const { userId } = req.params;
  const { data, error } = await supabase
    .from('users')
    .select('is_premium, premium_expires')
    .eq('id', userId)
    .single();

  if (error || !data) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });

  // Süresi dolmuşsa otomatik kapat
  if (data.is_premium && data.premium_expires && new Date(data.premium_expires) < new Date()) {
    await supabase.from('users').update({ is_premium: false, premium_expires: null }).eq('id', userId);
    return res.json({ ok: true, is_premium: false, expired: true });
  }

  res.json({ ok: true, is_premium: data.is_premium || false, premium_expires: data.premium_expires });
});

// ── Sağlık kontrolü ──────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    connections: io.engine.clientsCount,
    waiting: waitingUsers.length
  });
});

// ── Bekleyen kullanıcı havuzu ────────────────────────────────────────
let waitingUsers = [];

function findMatch(socket, genderFilter, myGender) {
  // Bilinmeyen / belirtilmemiş cinsiyetler "herkesle" gibi davransın
  const normalizeGender = (g) => (g === "kadin" || g === "erkek") ? g : "herkesle";
  const myGenderNorm = normalizeGender(myGender);

  for (let i = 0; i < waitingUsers.length; i++) {
    const w = waitingUsers[i];
    if (w.socketId === socket.id) continue;

    const wGenderNorm = normalizeGender(w.myGender);

    // Ben onun cinsiyetini istiyorum mu?
    const iMatch = genderFilter === "herkesle" ||
      (genderFilter === "kadin" && wGenderNorm === "kadin") ||
      (genderFilter === "erkek" && wGenderNorm === "erkek");

    // O benim cinsiyetimi istiyor mu?
    const theyMatch = w.genderFilter === "herkesle" ||
      (w.genderFilter === "kadin" && myGenderNorm === "kadin") ||
      (w.genderFilter === "erkek" && myGenderNorm === "erkek");

    if (iMatch && theyMatch) {
      waitingUsers.splice(i, 1);
      return w;
    }
  }
  return null;
}

// ── Socket.IO bağlantı yönetimi ──────────────────────────────────────
io.use((socket, next) => {
  const ip = socket.handshake.headers['x-forwarded-for']?.split(',')[0]
    || socket.handshake.address;

  // Banlı IP kontrolü
  if (bannedIPs.has(ip)) {
    return next(new Error('Bağlantı reddedildi.'));
  }

  // IP başına bağlantı limiti
  const count = socketConnections.get(ip) || 0;
  if (count >= MAX_CONNECTIONS_PER_IP) {
    console.warn(`[LIMIT] IP baglanti limiti asildi: ${ip}`);
    // 5+ bağlantı aynı IP'den → ban
    if (count >= MAX_CONNECTIONS_PER_IP * 3) {
      banIP(ip);
    }
    return next(new Error('Çok fazla bağlantı.'));
  }

  socketConnections.set(ip, count + 1);
  socket.clientIP = ip;
  next();
});

// Mesaj flood koruması: Socket başına
const messageCounts = new Map(); // socketId → { count, resetTime }
const MSG_LIMIT  = 20;           // 10 saniyede max 20 mesaj
const MSG_WINDOW = 10 * 1000;

function checkMsgFlood(socketId) {
  const now = Date.now();
  const rec = messageCounts.get(socketId);

  if (!rec || now > rec.resetTime) {
    messageCounts.set(socketId, { count: 1, resetTime: now + MSG_WINDOW });
    return false; // flood yok
  }

  rec.count++;
  return rec.count > MSG_LIMIT; // flood var mı?
}

io.on('connection', (socket) => {
  const ip = socket.clientIP || socket.handshake.address;
  console.log(`Yeni bağlantı: ${socket.id} (${ip})`);

  // Bağlantı kesilince IP sayacını azalt
  socket.on('disconnect', () => {
    const count = socketConnections.get(ip) || 1;
    if (count <= 1) socketConnections.delete(ip);
    else socketConnections.set(ip, count - 1);

    messageCounts.delete(socket.id);
    waitingUsers = waitingUsers.filter(w => w.socketId !== socket.id);

    const rooms = Array.from(socket.rooms);
    const roomName = rooms.find(r => r.includes('#'));
    if (roomName) socket.to(roomName).emit('strangerLeft');

    console.log(`Ayrıldı: ${socket.id}`);
  });

  socket.on('join', (data = {}) => {
    const genderFilter = data.genderFilter || "herkesle";
    const myGender     = data.myGender     || "herkesle";
    const username     = typeof data.username === 'string' && data.username.trim() ? data.username.trim().slice(0, 24) : "Anonim";
    const age          = typeof data.age === 'number' && data.age > 0 ? data.age : null;
    const avatar       = typeof data.avatar === 'string' ? data.avatar.slice(0, 500) : null;

    const match = findMatch(socket, genderFilter, myGender);

    if (match) {
      const roomName = match.socketId + '#' + socket.id;
      const matchSocket = io.sockets.sockets.get(match.socketId);

      if (!matchSocket) {
        waitingUsers.push({ socketId: socket.id, genderFilter, myGender, username, age, avatar });
        socket.emit('waiting');
        return;
      }

      socket.join(roomName);
      matchSocket.join(roomName);

      socket.emit('matched',      { roomName, isInitiator: true,  partnerSocketId: match.socketId, partnerUsername: match.username, partnerAge: match.age, partnerAvatar: match.avatar });
      matchSocket.emit('matched', { roomName, isInitiator: false, partnerSocketId: socket.id,      partnerUsername: username,       partnerAge: age,       partnerAvatar: avatar });

      console.log(`Eşleşti: ${match.socketId}(${match.username}) <-> ${socket.id}(${username})`);
    } else {
      waitingUsers.push({ socketId: socket.id, genderFilter, myGender, username, age, avatar });
      socket.emit('waiting');
    }
  });

  socket.on('signal', (data) => {
    // Signal boyutu kontrolü (1MB'dan büyük olmasın)
    const size = JSON.stringify(data).length;
    if (size > 1024 * 1024) {
      console.warn(`[SIGNAL] Cok buyuk signal: ${socket.id} (${size} bytes)`);
      return;
    }

    const rooms = Array.from(socket.rooms);
    const roomName = rooms.find(r => r.includes('#'));
    if (roomName) socket.to(roomName).emit('signal', data);
  });

  socket.on('typing', (isTyping) => {
    const rooms = Array.from(socket.rooms);
    const roomName = rooms.find(r => r.includes('#'));
    if (roomName) socket.to(roomName).emit('typing', !!isTyping);
  });

  socket.on('message', (data) => {    // Flood kontrolü
    if (checkMsgFlood(socket.id)) {
      socket.emit('error', 'Çok hızlı mesaj gönderiyorsun.');
      return;
    }

    // Mesaj boyutu kontrolü
    if (typeof data !== 'string' || data.length > 500) {
      return;
    }

    const rooms = Array.from(socket.rooms);
    const roomName = rooms.find(r => r.includes('#'));
    if (roomName) socket.to(roomName).emit('message', data);
  });

  socket.on('leave', () => {
    const rooms = Array.from(socket.rooms);
    const roomName = rooms.find(r => r.includes('#'));
    if (roomName) {
      socket.to(roomName).emit('strangerLeft');
      socket.leave(roomName);
    }
    waitingUsers = waitingUsers.filter(w => w.socketId !== socket.id);
  });

  socket.on('next', () => {
    const rooms = Array.from(socket.rooms);
    const roomName = rooms.find(r => r.includes('#'));
    if (roomName) {
      socket.to(roomName).emit('strangerLeft');
      socket.leave(roomName);
    }
    waitingUsers = waitingUsers.filter(w => w.socketId !== socket.id);
  });

  // Hata yönetimi
  socket.on('error', (err) => {
    console.error(`[SOCKET ERROR] ${socket.id}: ${err.message}`);
  });
});

// ── Sunucu başlat ────────────────────────────────────────────────────
const port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log(`LumiChat ${port} portunda aktif`);
  console.log(`Güvenlik: Rate limit ${RATE_LIMIT} req/dk, Max ${MAX_CONNECTIONS_PER_IP} conn/IP, Msg flood ${MSG_LIMIT} msg/10s`);
});

// Beklenmedik hataları yakala — sunucuyu çökertme
process.on('uncaughtException',  (err) => console.error('[UNCAUGHT]', err.message));
process.on('unhandledRejection', (err) => console.error('[UNHANDLED]', err));
