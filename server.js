const ws = require('ws');
const express = require('express');
const app = express();
const path = require('path');
const http = require('http').createServer(app);
const { createClient } = require('@supabase/supabase-js');

// ── Supabase (server-side service role) ────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://aaszyppzidhazpbmcipv.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhc3p5cHB6aWRoYXpwYm1jaXB2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTI1NTkzMiwiZXhwIjoyMDk2ODMxOTMyfQ.RWD3_nFdx6JUSn-rNSXpzEgYGxmyFV7BSlh3BiC2byU';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  realtime: { transport: ws }
});

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

// ── Online kullanıcı takibi ──────────────────────────────────────────
const onlineUsers = new Map(); // userId → socketId

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

// ── PWA İkonları ────────────────────────────────────────────────────
app.get('/icons/:size', (req, res) => {
  const size = req.params.size === 'icon-512.png' ? 512 : 192;
  const r = Math.round(size * 0.18); // border-radius
  const boxSize = Math.round(size * 0.55);
  const boxX = Math.round((size - boxSize) / 2);
  const boxY = Math.round((size - boxSize) / 2) - Math.round(size * 0.05);
  const fontSize = Math.round(boxSize * 0.58);
  const textY = Math.round(boxY + boxSize * 0.62);
  const labelY = Math.round(size * 0.88);
  const labelSize = Math.round(size * 0.09);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#07131a"/>
        <stop offset="100%" style="stop-color:#0b0f17"/>
      </linearGradient>
      <linearGradient id="box" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:rgba(0,229,255,0.3)"/>
        <stop offset="100%" style="stop-color:rgba(0,80,180,0.4)"/>
      </linearGradient>
    </defs>
    <!-- Arka plan -->
    <rect width="${size}" height="${size}" rx="${r}" fill="url(#bg)"/>
    <!-- Mavi kutu -->
    <rect x="${boxX}" y="${boxY}" width="${boxSize}" height="${boxSize}" rx="${Math.round(boxSize*0.22)}" fill="url(#box)" stroke="rgba(0,229,255,0.4)" stroke-width="${Math.round(size*0.015)}"/>
    <!-- Emoji -->
    <text x="${size/2}" y="${textY}" font-size="${fontSize}" text-anchor="middle">💬</text>
    <!-- LumiMatch yazısı -->
    <text x="${size/2}" y="${labelY}" font-size="${labelSize}" text-anchor="middle" fill="#00e5ff" font-family="Arial" font-weight="800" letter-spacing="1">LumiMatch</text>
  </svg>`;
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(svg);
});

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

const GIFT_COSTS = {
  cherry:    1,
  rose:      5,
  balloon:   10,
  heart:     25,
  cake:      50,
  star:      75,
  fire:      100,
  crown:     150,
  snowflake: 200,
  ghost:     250,
  teddy:     300,
  diamond:   400,
  rocket:    500,
  ring:      600,
  angel:     750,
  unicorn:   1000,
  trophy:    1200,
  dragon:    1500,
  galaxy:    1500
};

app.post('/api/gifts/send', async (req, res) => {
  const { senderId, receiverId, giftType } = req.body;
  if (!senderId || !receiverId || !giftType) return res.status(400).json({ error: 'Eksik parametre' });
  if (!GIFT_COSTS[giftType]) return res.status(400).json({ error: 'Geçersiz hediye tipi' });

  const cost = GIFT_COSTS[giftType];

  // Gönderici jeton bakiyesini çek
  const { data: sender, error: senderErr } = await supabase
    .from('users')
    .select('tokens')
    .eq('id', senderId)
    .single();

  if (senderErr || !sender) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
  if ((sender.tokens || 0) < cost) return res.status(400).json({ error: 'Yetersiz jeton' });

  // Jetonu düş
  const { error: updateErr } = await supabase
    .from('users')
    .update({ tokens: sender.tokens - cost })
    .eq('id', senderId);

  if (updateErr) return res.status(500).json({ error: updateErr.message });

  // Hediyeyi kaydet
  const { error: giftErr } = await supabase
    .from('gifts')
    .insert({
      sender_id:  senderId,
      receiver_id: receiverId,
      gift_type:  giftType,
      name:       giftType,
      emoji:      '',
      token_cost: cost
    });

  if (giftErr) return res.status(500).json({ error: giftErr.message });

  res.json({ ok: true, remaining: sender.tokens - cost });
});

// Kullanıcının aldığı hediyeler
app.get('/api/gifts/:userId', async (req, res) => {
  const { userId } = req.params;
  const { data, error } = await supabase
    .from('gifts')
    .select(`id, gift_type, token_cost, created_at, converted,
      sender:users!gifts_sender_id_fkey(id, username, display_name)`)
    .eq('receiver_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true, gifts: data || [] });
});

// Hediyeyi jetona çevir (%70 kullanıcıya, %30 sisteme)
const SYSTEM_USER_ID = process.env.SYSTEM_USER_ID || null; // .env'den al

app.post('/api/gifts/convert', async (req, res) => {
  const { giftId, userId } = req.body;
  if (!giftId || !userId) return res.status(400).json({ error: 'Eksik parametre' });

  // Hediyeyi çek
  const { data: gift, error: giftErr } = await supabase
    .from('gifts')
    .select('id, token_cost, receiver_id, converted')
    .eq('id', giftId)
    .eq('receiver_id', userId)
    .single();

  if (giftErr || !gift) return res.status(404).json({ error: 'Hediye bulunamadı' });
  if (gift.converted) return res.status(400).json({ error: 'Bu hediye zaten çevrildi' });

  const userShare   = Math.floor(gift.token_cost * 0.7);
  const systemShare = gift.token_cost - userShare; // %30

  // Kullanıcının jetonunu artır
  const { data: user, error: userErr } = await supabase
    .from('users').select('tokens').eq('id', userId).single();
  if (userErr || !user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });

  const { error: updateErr } = await supabase
    .from('users')
    .update({ tokens: (user.tokens || 0) + userShare })
    .eq('id', userId);
  if (updateErr) return res.status(500).json({ error: updateErr.message });

  // Sistem hesabına %30 ekle
  if (SYSTEM_USER_ID) {
    const { data: sys } = await supabase.from('users').select('tokens').eq('id', SYSTEM_USER_ID).single();
    if (sys) {
      await supabase.from('users').update({ tokens: (sys.tokens || 0) + systemShare }).eq('id', SYSTEM_USER_ID);
    }
  }

  // Hediyeyi çevrildi olarak işaretle
  await supabase.from('gifts').update({ converted: true }).eq('id', giftId);

  res.json({ ok: true, earned: userShare, systemShare, newBalance: (user.tokens || 0) + userShare });
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

// ── Online kullanıcıları sorgula ─────────────────────────────────────
app.post('/api/online-check', (req, res) => {
  const { userIds } = req.body;
  if (!Array.isArray(userIds)) return res.status(400).json({ error: 'userIds array gerekli' });
  const online = userIds.filter(id => onlineUsers.has(id));
  res.json({ ok: true, online });
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

  // Kullanıcı kimliğini kaydet (auth event)
  socket.on('userOnline', (userId) => {
    if (typeof userId === 'string' && userId) {
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;
    }
  });

  // Eşleşme daveti gönder
  socket.on('matchInvite', (data) => {
    const { toUserId, fromName, fromUserId } = data;
    if (!toUserId || typeof fromName !== 'string') return;
    const targetSocketId = onlineUsers.get(toUserId);
    if (targetSocketId) {
      const targetSocket = io.sockets.sockets.get(targetSocketId);
      if (targetSocket) {
        // Davet eden bilgilerini socket'e kaydet (kabul edilince kullanılacak)
        socket.inviteName   = fromName.slice(0, 30);
        socket.inviteUserId = fromUserId || null;
        targetSocket.emit('matchInvite', {
          fromName:     fromName.slice(0, 30),
          fromUserId:   fromUserId || null,
          fromSocketId: socket.id
        });
      }
    }
  });

  // Eşleşme davetini kabul et — iki kişiyi direkt eşleştir
  socket.on('matchInviteAccept', (data) => {
    const { toSocketId, myUserId, myUsername, myAge, myAvatar } = data;
    if (!toSocketId) return;
    const targetSocket = io.sockets.sockets.get(toSocketId);
    if (!targetSocket) return;

    const roomName = toSocketId + '#' + socket.id;
    socket.join(roomName);
    targetSocket.join(roomName);

    // Her ikisine de matched event gönder
    socket.emit('matched', {
      roomName,
      isInitiator: false,
      partnerSocketId: toSocketId,
      partnerUsername: targetSocket.inviteName   || 'Arkadaş',
      partnerUserId:   targetSocket.inviteUserId || null,
      partnerAge:      null,
      partnerAvatar:   null
    });
    targetSocket.emit('matched', {
      roomName,
      isInitiator: true,
      partnerSocketId: socket.id,
      partnerUsername: myUsername || 'Arkadaş',
      partnerUserId:   myUserId   || null,
      partnerAge:      myAge      || null,
      partnerAvatar:   myAvatar   || null
    });
  });

  // Bağlantı kesilince IP sayacını azalt
  socket.on('disconnect', () => {
    const count = socketConnections.get(ip) || 1;
    if (count <= 1) socketConnections.delete(ip);
    else socketConnections.set(ip, count - 1);

    messageCounts.delete(socket.id);
    // Online listesinden çıkar
    if (socket.userId) onlineUsers.delete(socket.userId);
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
    const userId       = typeof data.userId === 'string' ? data.userId : null; // DB id

    // Online listesine ekle
    if (userId) {
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;
    }

    const match = findMatch(socket, genderFilter, myGender);

    if (match) {
      const roomName = match.socketId + '#' + socket.id;
      const matchSocket = io.sockets.sockets.get(match.socketId);

      if (!matchSocket) {
        waitingUsers.push({ socketId: socket.id, genderFilter, myGender, username, age, avatar, userId });
        socket.emit('waiting');
        return;
      }

      socket.join(roomName);
      matchSocket.join(roomName);

      socket.emit('matched',      { roomName, isInitiator: true,  partnerSocketId: match.socketId, partnerUsername: match.username, partnerAge: match.age, partnerAvatar: match.avatar, partnerUserId: match.userId });
      matchSocket.emit('matched', { roomName, isInitiator: false, partnerSocketId: socket.id,      partnerUsername: username,       partnerAge: age,       partnerAvatar: avatar,       partnerUserId: userId });

      console.log(`Eşleşti: ${match.socketId}(${match.username})[userId:${match.userId}] <-> ${socket.id}(${username})[userId:${userId}]`);
    } else {
      waitingUsers.push({ socketId: socket.id, genderFilter, myGender, username, age, avatar, userId });
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

  // Arkadaş isteği bildirimi — isteği alan socket'e ilet
  socket.on('friendRequest', (data) => {
    const { toSocketId, fromName, fromUserId } = data;
    if (!toSocketId || typeof fromName !== 'string') return;
    const targetSocket = io.sockets.sockets.get(toSocketId);
    if (targetSocket) {
      targetSocket.emit('friendRequest', {
        fromName:   fromName.slice(0, 30),
        fromUserId: typeof fromUserId === 'string' ? fromUserId : null
      });
    }
  });

  // Hediye bildirimi — hediyeyi alan socket'e ilet
  socket.on('giftSent', (data) => {
    const { toSocketId, giftEmoji, giftType, fromName } = data;
    if (!toSocketId || typeof fromName !== 'string') return;
    const targetSocket = io.sockets.sockets.get(toSocketId);
    if (targetSocket) {
      targetSocket.emit('giftReceived', {
        giftEmoji: typeof giftEmoji === 'string' ? giftEmoji.slice(0, 10) : '🎁',
        giftType:  typeof giftType  === 'string' ? giftType.slice(0, 20)  : '',
        fromName:  fromName.slice(0, 30)
      });
    }
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
