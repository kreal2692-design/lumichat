const express = require('express');
const app = express();
const path = require('path');
const http = require('http').createServer(app);
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
  for (let i = 0; i < waitingUsers.length; i++) {
    const w = waitingUsers[i];
    if (w.socketId === socket.id) continue;

    const iMatch = genderFilter === "herkesle" ||
      (genderFilter === "kadin" && w.myGender === "kadin") ||
      (genderFilter === "erkek" && w.myGender === "erkek");

    const theyMatch = w.genderFilter === "herkesle" ||
      (w.genderFilter === "kadin" && myGender === "kadin") ||
      (w.genderFilter === "erkek" && myGender === "erkek");

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
    const username     = typeof data.username === 'string' ? data.username.slice(0, 24) : "Kullanıcı";
    const age          = typeof data.age === 'number' && data.age > 0 ? data.age : null;

    const match = findMatch(socket, genderFilter, myGender);

    if (match) {
      const roomName = match.socketId + '#' + socket.id;
      const matchSocket = io.sockets.sockets.get(match.socketId);

      if (!matchSocket) {
        waitingUsers.push({ socketId: socket.id, genderFilter, myGender, username, age });
        socket.emit('waiting');
        return;
      }

      socket.join(roomName);
      matchSocket.join(roomName);

      socket.emit('matched',      { roomName, isInitiator: true,  partnerSocketId: match.socketId, partnerUsername: match.username, partnerAge: match.age });
      matchSocket.emit('matched', { roomName, isInitiator: false, partnerSocketId: socket.id,      partnerUsername: username,       partnerAge: age });

      console.log(`Eşleşti: ${match.socketId} <-> ${socket.id}`);
    } else {
      waitingUsers.push({ socketId: socket.id, genderFilter, myGender, username, age });
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
