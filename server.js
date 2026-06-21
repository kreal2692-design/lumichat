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

// Her 10 dakikada süresi dolan banları otomatik kaldır
setInterval(async () => {
  try {
    const now = new Date().toISOString();
    const { data: expired } = await supabase
      .from('users')
      .select('id')
      .eq('is_banned', true)
      .not('ban_until', 'is', null)
      .lt('ban_until', now);
    if (expired?.length) {
      await supabase.from('users')
        .update({ is_banned: false, ban_until: null })
        .in('id', expired.map(u => u.id));
      console.log(`[BAN] ${expired.length} geçici ban süresi doldu, kaldırıldı.`);
    }
  } catch(e) { console.error('[BAN] Auto-unban hatası:', e.message); }
}, 10 * 60 * 1000);

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
  const { friendId, userId, action } = req.body;
  if (!friendId || !userId || !action) return res.status(400).json({ error: 'Eksik parametre' });
  if (!['accepted', 'rejected'].includes(action)) return res.status(400).json({ error: 'Geçersiz aksiyon' });

  // Requester'ı bul (kabul edilince her iki tarafa görev sayacı ekle)
  const { data: friendship } = await supabase.from('friends').select('requester_id').eq('id', friendId).single();

  const { error } = await supabase
    .from('friends')
    .update({ status: action })
    .eq('id', friendId)
    .eq('receiver_id', userId);

  if (error) return res.status(500).json({ error: error.message });

  // Arkadaşlık kabul edilince her iki tarafa görev ilerlemesi
  if (action === 'accepted') {
    updateDailyTask(userId, 'friends');
    if (friendship?.requester_id) updateDailyTask(friendship.requester_id, 'friends');
  }

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

// ── Nick rengi satın al (jetonla) ───────────────────────────────────
const NICK_COLORS = {
  blue:    { label: '🔵 Mavi',   color: '#00e5ff', cost: 200,  days: 30 },
  green:   { label: '🟢 Yeşil',  color: '#2ecc71', cost: 200,  days: 30 },
  purple:  { label: '🟣 Mor',    color: '#a855f7', cost: 300,  days: 30 },
  orange:  { label: '🟠 Turuncu',color: '#ff9944', cost: 300,  days: 30 },
  gold:    { label: '🌟 Altın',  color: '#ffe566', cost: 500,  days: 30 },
  red:     { label: '🔴 Kırmızı',color: '#ff4757', cost: 500,  days: 30 },
  rainbow: { label: '🌈 Gökkuşağı', color: 'rainbow', cost: 1000, days: 30 }
};

app.post('/api/nick-color/buy', async (req, res) => {
  const { userId, colorId } = req.body;
  if (!userId || !colorId) return res.status(400).json({ error: 'Eksik parametre' });
  const colorDef = NICK_COLORS[colorId];
  if (!colorDef) return res.status(400).json({ error: 'Geçersiz renk' });

  const { data: user } = await supabase.from('users').select('tokens').eq('id', userId).single();
  if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
  if ((user.tokens || 0) < colorDef.cost) return res.status(400).json({ error: 'Yetersiz jeton' });

  const expiresAt = new Date(Date.now() + colorDef.days * 24 * 60 * 60 * 1000).toISOString();
  const { error } = await supabase.from('users').update({
    tokens: user.tokens - colorDef.cost,
    nick_color: colorDef.color,
    nick_color_expires: expiresAt
  }).eq('id', userId);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true, remaining: user.tokens - colorDef.cost, color: colorDef.color, expires: expiresAt });
});

// ── Jetonla Premium al ───────────────────────────────────────────────
const TOKEN_PREMIUM_PACKAGES = {
  week:    { tokens: 90,   days: 7   },
  month:   { tokens: 330,  days: 30  },
  quarter: { tokens: 870,  days: 90  },
  year:    { tokens: 2810, days: 365 }
};

app.post('/api/premium/buy-with-tokens', async (req, res) => {
  const { userId, packageId } = req.body;
  if (!userId || !packageId) return res.status(400).json({ error: 'Eksik parametre' });
  const pkg = TOKEN_PREMIUM_PACKAGES[packageId];
  if (!pkg) return res.status(400).json({ error: 'Geçersiz paket' });

  const { data: user } = await supabase.from('users').select('tokens, is_premium, premium_expires').eq('id', userId).single();
  if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
  if ((user.tokens || 0) < pkg.tokens) return res.status(400).json({ error: `Yetersiz jeton. Gerekli: ${pkg.tokens} 🪙` });

  // Mevcut premium süresi varsa uzat
  const base = (user.is_premium && user.premium_expires && new Date(user.premium_expires) > new Date())
    ? new Date(user.premium_expires)
    : new Date();
  const expiresAt = new Date(base.getTime() + pkg.days * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase.from('users').update({
    tokens: user.tokens - pkg.tokens,
    is_premium: true,
    premium_expires: expiresAt
  }).eq('id', userId);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true, remaining: user.tokens - pkg.tokens, expires: expiresAt, days: pkg.days });
});

// ── Referans sistemi ─────────────────────────────────────────────────

// Ref kodu oluştur veya getir
app.get('/api/ref/:userId', async (req, res) => {
  const { userId } = req.params;
  const { data: user } = await supabase.from('users').select('ref_code, username').eq('id', userId).single();
  if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });

  let refCode = user.ref_code;
  if (!refCode) {
    // Kullanıcı adından ref kodu oluştur
    refCode = (user.username || userId.slice(0, 8)).toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(Math.random() * 1000);
    await supabase.from('users').update({ ref_code: refCode }).eq('id', userId);
  }
  res.json({ ok: true, ref_code: refCode, link: `https://lumimatch.net/?ref=${refCode}` });
});

// Referans kaydı — yeni kullanıcı kayıt olduğunda
app.post('/api/ref/apply', async (req, res) => {
  const { newUserId, refCode } = req.body;
  if (!newUserId || !refCode) return res.status(400).json({ error: 'Eksik parametre' });

  // Ref kodu sahibini bul
  const { data: refOwner } = await supabase.from('users').select('id, tokens, ref_count, referred_by').eq('ref_code', refCode).single();
  if (!refOwner) return res.json({ ok: false, message: 'Geçersiz ref kodu' });

  // Kendine ref uygulayamasın
  if (refOwner.id === newUserId) return res.json({ ok: false, message: 'Kendi referans kodunu kullanamazsın' });

  // Yeni kullanıcı daha önce ref aldı mı?
  const { data: newUser } = await supabase.from('users').select('referred_by, tokens').eq('id', newUserId).single();
  if (!newUser || newUser.referred_by) return res.json({ ok: false, message: 'Ref kodu zaten kullanılmış' });

  // Yeni kullanıcıya 50 jeton ver + ref_by kaydet
  await supabase.from('users').update({
    tokens: (newUser.tokens || 0) + 50,
    referred_by: refOwner.id
  }).eq('id', newUserId);

  // Ref sahibine 100 jeton ver + sayacı artır
  await supabase.from('users').update({
    tokens: (refOwner.tokens || 0) + 100,
    ref_count: (refOwner.ref_count || 0) + 1
  }).eq('id', refOwner.id);

  res.json({ ok: true, bonus: 50 });
});

// ── Premium günlük jeton bonusu ───────────────────────────────────────
app.post('/api/premium/daily-bonus', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId gerekli' });

  const { data: user } = await supabase.from('users').select('is_premium, tokens, last_daily_bonus').eq('id', userId).single();
  if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
  if (!user.is_premium) return res.status(400).json({ error: 'Premium üyelik gerekli' });

  // Bugün bonus aldı mı?
  const now = new Date();
  const last = user.last_daily_bonus ? new Date(user.last_daily_bonus) : null;
  if (last && last.toDateString() === now.toDateString()) {
    return res.json({ ok: false, message: 'Bugünkü bonusu zaten aldın', already_claimed: true });
  }

  await supabase.from('users').update({
    tokens: (user.tokens || 0) + 50,
    last_daily_bonus: now.toISOString()
  }).eq('id', userId);

  res.json({ ok: true, earned: 50, newBalance: (user.tokens || 0) + 50 });
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

// ── Günlük görev yardımcı fonksiyon ──────────────────────────────────
async function updateDailyTask(userId, field) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const task = [
      { field: 'matches',  target: 3,  done: 'task1_done', reward: 30 },
      { field: 'messages', target: 10, done: 'task2_done', reward: 20 },
      { field: 'friends',  target: 1,  done: 'task3_done', reward: 50 },
    ].find(t => t.field === field);
    if (!task) return;

    let { data } = await supabase.from('daily_tasks').select('*').eq('user_id', userId).eq('task_date', today).single();
    if (!data) {
      const { data: newRow } = await supabase.from('daily_tasks').insert({ user_id: userId, task_date: today }).select().single();
      data = newRow;
    }
    if (!data || data[task.done]) return;

    const newVal = (data[field] || 0) + 1;
    const updateData = { [field]: newVal };

    if (newVal >= task.target) {
      updateData[task.done] = true;
      const { data: user } = await supabase.from('users').select('tokens').eq('id', userId).single();
      if (user) {
        await supabase.from('users').update({ tokens: (user.tokens || 0) + task.reward }).eq('id', userId);
        // Socket'e bildirim gönder
        const sid = onlineUsers.get(userId);
        if (sid) {
          const sock = io.sockets.sockets.get(sid);
          if (sock) sock.emit('taskCompleted', { field, reward: task.reward });
        }
      }
    }

    await supabase.from('daily_tasks').update(updateData).eq('user_id', userId).eq('task_date', today);
  } catch(e) { console.error('[TASK]', e.message); }
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
    const { toUserId, fromName, fromUserId, fromNickColor } = data;
    if (!toUserId || typeof fromName !== 'string') return;
    const targetSocketId = onlineUsers.get(toUserId);
    if (targetSocketId) {
      const targetSocket = io.sockets.sockets.get(targetSocketId);
      if (targetSocket) {
        // Davet eden bilgilerini socket'e kaydet (kabul edilince kullanılacak)
        socket.inviteName      = fromName.slice(0, 30);
        socket.inviteUserId    = fromUserId || null;
        socket.inviteNickColor = typeof fromNickColor === 'string' ? fromNickColor.slice(0, 30) : null;
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
    const { toSocketId, myUserId, myUsername, myAge, myAvatar, myNickColor } = data;
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
      partnerSocketId:  toSocketId,
      partnerUsername:  targetSocket.inviteName    || 'Arkadaş',
      partnerUserId:    targetSocket.inviteUserId  || null,
      partnerAge:       null,
      partnerAvatar:    null,
      partnerNickColor: targetSocket.inviteNickColor || null
    });
    targetSocket.emit('matched', {
      roomName,
      isInitiator: true,
      partnerSocketId:  socket.id,
      partnerUsername:  myUsername  || 'Arkadaş',
      partnerUserId:    myUserId    || null,
      partnerAge:       myAge       || null,
      partnerAvatar:    myAvatar    || null,
      partnerNickColor: myNickColor || null
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
    const userId       = typeof data.userId === 'string' ? data.userId : null;
    const nickColor    = typeof data.nickColor === 'string' ? data.nickColor.slice(0, 30) : null;

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
        waitingUsers.push({ socketId: socket.id, genderFilter, myGender, username, age, avatar, userId, nickColor });
        socket.emit('waiting');
        return;
      }

      socket.join(roomName);
      matchSocket.join(roomName);

      socket.emit('matched',      { roomName, isInitiator: true,  partnerSocketId: match.socketId, partnerUsername: match.username, partnerAge: match.age, partnerAvatar: match.avatar, partnerUserId: match.userId, partnerNickColor: match.nickColor || null });
      matchSocket.emit('matched', { roomName, isInitiator: false, partnerSocketId: socket.id,      partnerUsername: username,       partnerAge: age,       partnerAvatar: avatar,       partnerUserId: userId,       partnerNickColor: nickColor || null });

      console.log(`Eşleşti: ${match.socketId}(${match.username})[userId:${match.userId}] <-> ${socket.id}(${username})[userId:${userId}]`);

      // Günlük görev: eşleşme sayacı
      if (userId)       updateDailyTask(userId,       'matches');
      if (match.userId) updateDailyTask(match.userId, 'matches');
    } else {
      waitingUsers.push({ socketId: socket.id, genderFilter, myGender, username, age, avatar, userId, nickColor });
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
    if (roomName) {
      socket.to(roomName).emit('message', data);
      // Günlük görev: mesaj sayacı
      if (socket.userId) updateDailyTask(socket.userId, 'messages');
    }
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

  // DM socket bildirimi (gerçek zamanlı — DB kaydı API üzerinden yapılıyor)
  socket.on('dmTyping', (data) => {
    const { toUserId, isTyping } = data;
    if (!toUserId) return;
    const targetSocketId = onlineUsers.get(toUserId);
    if (targetSocketId) {
      const sock = io.sockets.sockets.get(targetSocketId);
      if (sock) sock.emit('dmTyping', { fromUserId: socket.userId, isTyping: !!isTyping });
    }
  });
});

// ── Admin API'ları ────────────────────────────────────────────────────
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'lumiadmin2025';

function adminAuth(req, res, next) {
  const token = req.headers['x-admin-token'] || req.query.token;
  if (token !== ADMIN_SECRET) return res.status(401).json({ error: 'Yetkisiz' });
  next();
}

// Admin: kullanıcı listesi
app.get('/api/admin/users', adminAuth, async (req, res) => {
  const page   = parseInt(req.query.page   || '1');
  const limit  = parseInt(req.query.limit  || '20');
  const search = req.query.search || '';
  const filter = req.query.filter || ''; // 'banned' | 'premium'
  const from   = (page - 1) * limit;

  let query = supabase.from('users')
    .select('id, username, email, gender, tokens, gift_balance, is_banned, ban_until, is_premium, premium_expires, nick_color, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1);

  if (search) query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%`);
  if (filter === 'banned')  query = query.eq('is_banned', true);
  if (filter === 'premium') query = query.eq('is_premium', true);

  const { data, error, count } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true, users: data || [], total: count || 0 });
});

// Admin: kullanıcıyı ban/unban
app.post('/api/admin/ban', adminAuth, async (req, res) => {
  let { userId, ban, reason, hours } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId gerekli' });

  // E-posta ile arama desteği
  if (String(userId).includes('@')) {
    const { data: found } = await supabase.from('users').select('id').eq('email', userId).single();
    if (!found) return res.status(404).json({ error: 'E-posta ile kullanıcı bulunamadı' });
    userId = found.id;
  }

  // Geçici ban: hours verilmişse ban_until set et
  const updateData = { is_banned: !!ban };
  if (ban && hours) {
    updateData.ban_until = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
  } else if (!ban) {
    updateData.ban_until = null;
  }

  const { error } = await supabase.from('users').update(updateData).eq('id', userId);
  if (error) return res.status(500).json({ error: error.message });

  // Aktif socket varsa at
  if (ban) {
    const socketId = onlineUsers.get(userId);
    if (socketId) {
      const sock = io.sockets.sockets.get(socketId);
      if (sock) { sock.emit('forceBanned'); sock.disconnect(true); }
      onlineUsers.delete(userId);
    }
  }

  console.log(`[ADMIN] ${ban ? 'Ban' : 'Unban'}: ${userId}${reason ? ' — ' + reason : ''}`);
  res.json({ ok: true });
});

// Admin: kullanıcıya jeton ver
app.post('/api/admin/give-tokens', adminAuth, async (req, res) => {
  let { userId, amount, note } = req.body;
  if (!userId || !amount) return res.status(400).json({ error: 'userId ve amount gerekli' });

  // E-posta ile arama desteği
  if (userId.includes('@')) {
    const { data: found } = await supabase.from('users').select('id').eq('email', userId).single();
    if (!found) return res.status(404).json({ error: 'E-posta ile kullanıcı bulunamadı' });
    userId = found.id;
  }

  const { data: user } = await supabase.from('users').select('tokens').eq('id', userId).single();
  if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });

  const newTokens = (user.tokens || 0) + parseInt(amount);
  const { error } = await supabase.from('users').update({ tokens: newTokens }).eq('id', userId);
  if (error) return res.status(500).json({ error: error.message });

  console.log(`[ADMIN] Jeton verildi: ${userId} +${amount}${note ? ' — ' + note : ''}`);
  res.json({ ok: true, newTokens });
});

// Admin: raporları listele
app.get('/api/admin/reports', adminAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('reports')
    .select(`id, reason, created_at, reporter_id, reported_socket_id,
      reporter:users!reports_reporter_id_fkey(id, username, email)`)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true, reports: data || [] });
});

// Admin: istatistikler
app.get('/api/admin/stats', adminAuth, async (req, res) => {
  const [users, banned, premium, reports] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('is_banned', true),
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('is_premium', true),
    supabase.from('reports').select('id', { count: 'exact', head: true }),
  ]);

  res.json({
    ok: true,
    totalUsers:   users.count   || 0,
    bannedUsers:  banned.count  || 0,
    premiumUsers: premium.count || 0,
    totalReports: reports.count || 0,
    onlineNow:    onlineUsers.size,
    waitingNow:   waitingUsers.length,
    connections:  io.engine.clientsCount,
  });
});

// Admin: premium ver/kaldır
app.post('/api/admin/premium', adminAuth, async (req, res) => {
  let { userId, grant, days } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId gerekli' });

  // E-posta ile arama desteği
  if (userId.includes('@')) {
    const { data: found } = await supabase.from('users').select('id').eq('email', userId).single();
    if (!found) return res.status(404).json({ error: 'E-posta ile kullanıcı bulunamadı' });
    userId = found.id;
  }

  if (grant) {
    const d = parseInt(days || '30');
    const expiresAt = new Date(Date.now() + d * 24 * 60 * 60 * 1000).toISOString();
    const { error } = await supabase.from('users').update({ is_premium: true, premium_expires: expiresAt }).eq('id', userId);
    if (error) return res.status(500).json({ error: error.message });
  } else {
    const { error } = await supabase.from('users').update({ is_premium: false, premium_expires: null }).eq('id', userId);
    if (error) return res.status(500).json({ error: error.message });
  }

  res.json({ ok: true });
});

// Admin: kullanıcı detayı
app.get('/api/admin/user/:userId', adminAuth, async (req, res) => {
  const { userId } = req.params;
  const { data, error } = await supabase
    .from('users')
    .select('id, username, email, gender, tokens, gift_balance, is_banned, is_premium, premium_expires, nick_color, nick_color_expires, ref_code, ref_count, created_at')
    .eq('id', userId)
    .single();

  if (error || !data) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
  res.json({ ok: true, user: data });
});

// ── DM (Direkt Mesaj) API'ları ────────────────────────────────────────

// DM gönder (DB'ye kaydet)
app.post('/api/dm/send', async (req, res) => {
  const { senderId, receiverId, content } = req.body;
  if (!senderId || !receiverId || !content?.trim()) return res.status(400).json({ error: 'Eksik parametre' });
  if (content.length > 500) return res.status(400).json({ error: 'Mesaj çok uzun' });

  // Arkadaş kontrolü
  const { data: friendship } = await supabase
    .from('friends')
    .select('id')
    .or(`and(requester_id.eq.${senderId},receiver_id.eq.${receiverId}),and(requester_id.eq.${receiverId},receiver_id.eq.${senderId})`)
    .eq('status', 'accepted')
    .maybeSingle();

  if (!friendship) return res.status(403).json({ error: 'Sadece arkadaşlarla mesajlaşabilirsin' });

  const { data, error } = await supabase.from('direct_messages').insert({
    sender_id:   senderId,
    receiver_id: receiverId,
    content:     content.trim()
  }).select('id, created_at').single();

  if (error) return res.status(500).json({ error: error.message });

  // Gerçek zamanlı bildirim
  const receiverSocketId = onlineUsers.get(receiverId);
  if (receiverSocketId) {
    const sock = io.sockets.sockets.get(receiverSocketId);
    if (sock) {
      const { data: sender } = await supabase.from('users').select('username').eq('id', senderId).single();
      sock.emit('dmReceived', {
        id:         data.id,
        senderId,
        senderName: sender?.username || 'Biri',
        content:    content.trim(),
        createdAt:  data.created_at
      });
    }
  }

  res.json({ ok: true, id: data.id, createdAt: data.created_at });
});

// DM geçmişi çek
app.get('/api/dm/:userId/:friendId', async (req, res) => {
  const { userId, friendId } = req.params;
  const limit  = parseInt(req.query.limit  || '50');
  const before = req.query.before;

  let query = supabase
    .from('direct_messages')
    .select('id, sender_id, receiver_id, content, created_at, read_at')
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${userId})`)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (before) query = query.lt('created_at', before);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  // Okunmamışları okundu olarak işaretle
  await supabase.from('direct_messages')
    .update({ read_at: new Date().toISOString() })
    .eq('receiver_id', userId)
    .eq('sender_id', friendId)
    .is('read_at', null);

  res.json({ ok: true, messages: (data || []).reverse() });
});

// Okunmamış DM sayısı
app.get('/api/dm/unread/:userId', async (req, res) => {
  const { userId } = req.params;
  const { data, error } = await supabase
    .from('direct_messages')
    .select('sender_id')
    .eq('receiver_id', userId)
    .is('read_at', null);

  if (error) return res.status(500).json({ error: error.message });

  // sender_id'ye göre grupla
  const counts = {};
  (data || []).forEach(m => { counts[m.sender_id] = (counts[m.sender_id] || 0) + 1; });
  res.json({ ok: true, total: (data || []).length, bySender: counts });
});

// Sohbet kaydını DB'ye kaydet
app.post('/api/chat-log/save', async (req, res) => {
  const { userId, partnerId, partnerName, messages } = req.body;
  if (!userId || !messages?.length) return res.status(400).json({ error: 'Eksik parametre' });

  const { error } = await supabase.from('chat_logs').insert({
    user_id:      userId,
    partner_id:   partnerId || null,
    partner_name: partnerName || 'Bilinmiyor',
    messages:     JSON.stringify(messages),
    message_count: messages.length
  });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// Kullanıcının kayıtlı sohbetleri
app.get('/api/chat-log/:userId', async (req, res) => {
  const { userId } = req.params;
  const { data, error } = await supabase
    .from('chat_logs')
    .select('id, partner_name, message_count, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true, logs: data || [] });
});

// Push notification subscription kaydet
app.post('/api/push/subscribe', async (req, res) => {
  const { userId, subscription } = req.body;
  if (!userId || !subscription) return res.status(400).json({ error: 'Eksik parametre' });

  const { error } = await supabase.from('push_subscriptions').upsert({
    user_id:      userId,
    subscription: JSON.stringify(subscription),
    updated_at:   new Date().toISOString()
  }, { onConflict: 'user_id' });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// ── Günlük Görev API'ları ─────────────────────────────────────────────

const DAILY_TASKS = [
  { id: 'task1', label: '3 kişiyle eşleş',    reward: 30,  field: 'matches',  target: 3,  done: 'task1_done' },
  { id: 'task2', label: '10 mesaj gönder',     reward: 20,  field: 'messages', target: 10, done: 'task2_done' },
  { id: 'task3', label: '1 arkadaş ekle',      reward: 50,  field: 'friends',  target: 1,  done: 'task3_done' },
];

// Günlük görevleri getir/oluştur
app.get('/api/tasks/:userId', async (req, res) => {
  const { userId } = req.params;
  const today = new Date().toISOString().slice(0, 10);

  let { data, error } = await supabase
    .from('daily_tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('task_date', today)
    .single();

  if (!data) {
    const { data: newRow, error: insertErr } = await supabase
      .from('daily_tasks')
      .insert({ user_id: userId, task_date: today })
      .select()
      .single();
    if (insertErr) return res.status(500).json({ error: insertErr.message });
    data = newRow;
  }

  res.json({ ok: true, tasks: data, definitions: DAILY_TASKS });
});

// Görev ilerlemesini güncelle
app.post('/api/tasks/progress', async (req, res) => {
  const { userId, field, increment = 1 } = req.body;
  if (!userId || !field) return res.status(400).json({ error: 'Eksik parametre' });

  const today = new Date().toISOString().slice(0, 10);
  const task = DAILY_TASKS.find(t => t.field === field);
  if (!task) return res.status(400).json({ error: 'Geçersiz field' });

  // Mevcut ilerlemeyi çek
  let { data } = await supabase.from('daily_tasks').select('*').eq('user_id', userId).eq('task_date', today).single();

  if (!data) {
    const { data: newRow } = await supabase.from('daily_tasks').insert({ user_id: userId, task_date: today }).select().single();
    data = newRow;
  }

  if (!data) return res.status(500).json({ error: 'Görev oluşturulamadı' });
  if (data[task.done]) return res.json({ ok: true, alreadyDone: true }); // Zaten tamamlandı

  const newVal = (data[field] || 0) + increment;
  const updateData = { [field]: newVal };
  let rewarded = false;

  if (newVal >= task.target && !data[task.done]) {
    updateData[task.done] = true;
    rewarded = true;

    // Jetonu ver
    const { data: user } = await supabase.from('users').select('tokens').eq('id', userId).single();
    if (user) {
      await supabase.from('users').update({ tokens: (user.tokens || 0) + task.reward }).eq('id', userId);
    }
  }

  await supabase.from('daily_tasks').update(updateData).eq('user_id', userId).eq('task_date', today);

  res.json({ ok: true, newVal, rewarded, reward: task.reward, taskLabel: task.label });
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
