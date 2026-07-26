# 🚀 LumiMatch Deployment Rehberi

## 📋 Deployment Seçenekleri

### 1. 🌐 Vercel (Önerilen - Ücretsiz)

#### Avantajlar
- ✅ Ücretsiz SSL sertifikası
- ✅ Otomatik HTTPS
- ✅ Global CDN
- ✅ Kolay deployment
- ✅ Git entegrasyonu

#### Kurulum
```bash
# Vercel CLI kur
npm install -g vercel

# Login
vercel login

# Deploy
vercel
```

#### vercel.json Yapılandırması
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### Ortam Değişkenleri (Vercel Dashboard)
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
ADMIN_SECRET=your_admin_secret
PORT=3000
```

---

### 2. 🐳 Docker Deployment

#### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

#### docker-compose.yml
```yaml
version: '3.8'
services:
  lumimatch:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
      - ADMIN_SECRET=${ADMIN_SECRET}
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs
```

#### Çalıştırma
```bash
# Build
docker-compose build

# Run
docker-compose up -d

# Logs
docker-compose logs -f

# Stop
docker-compose down
```

---

### 3. ☁️ AWS EC2 Deployment

#### Gereksinimler
- Ubuntu 20.04+ LTS
- Node.js 18+
- Nginx
- PM2

#### Kurulum Adımları

```bash
# 1. Sunucuya bağlan
ssh ubuntu@your-server-ip

# 2. Node.js kur
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. PM2 kur
sudo npm install -g pm2

# 4. Nginx kur
sudo apt-get install nginx

# 5. Projeyi klonla
git clone https://github.com/yourusername/lumimatch.git
cd lumimatch

# 6. Bağımlılıkları kur
npm install --production

# 7. .env dosyası oluştur
nano .env

# 8. PM2 ile başlat
pm2 start server.js --name lumimatch

# 9. Otomatik başlatma
pm2 startup
pm2 save

# 10. Nginx yapılandır
sudo nano /etc/nginx/sites-available/lumimatch
```

#### Nginx Yapılandırması
```nginx
server {
    listen 80;
    server_name lumimatch.net www.lumimatch.net;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Nginx'i etkinleştir
sudo ln -s /etc/nginx/sites-available/lumimatch /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# SSL sertifikası (Let's Encrypt)
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d lumimatch.net -d www.lumimatch.net
```

---

### 4. 🔥 Railway Deployment

#### Avantajlar
- ✅ Kolay kullanım
- ✅ Ücretsiz tier
- ✅ Git entegrasyonu
- ✅ Otomatik HTTPS

#### Kurulum
```bash
# Railway CLI kur
npm install -g @railway/cli

# Login
railway login

# Proje oluştur
railway init

# Deploy
railway up
```

---

### 5. 🌊 DigitalOcean App Platform

#### Kurulum
1. DigitalOcean'a giriş yap
2. App Platform → Create App
3. GitHub repository seç
4. Branch: main
5. Ortam değişkenlerini ekle
6. Deploy

#### app.yaml
```yaml
name: lumimatch
region: nyc
services:
  - name: web
    github:
      repo: yourusername/lumimatch
      branch: main
    build_command: npm install
    run_command: npm start
    envs:
      - key: NODE_ENV
        value: production
      - key: SUPABASE_URL
        value: ${SUPABASE_URL}
      - key: SUPABASE_SERVICE_KEY
        value: ${SUPABASE_SERVICE_KEY}
    http_port: 3000
```

---

## 🔐 Güvenlik Kontrol Listesi

### Deployment Öncesi
- [ ] .env dosyasını .gitignore'a ekle
- [ ] Tüm şifreleri değiştir
- [ ] CORS ayarlarını yapılandır
- [ ] Rate limiting'i etkinleştir
- [ ] SSL sertifikası kur
- [ ] Firewall kurallarını ayarla
- [ ] Log sistemi kur
- [ ] Backup sistemi kur

### Deployment Sonrası
- [ ] Health check endpoint test et
- [ ] WebSocket bağlantılarını test et
- [ ] Load testing yap
- [ ] Monitoring kur (PM2, New Relic, etc.)
- [ ] Error tracking kur (Sentry)
- [ ] Analytics kur (Google Analytics, Mixpanel)

---

## 📊 Monitoring

### PM2 Monitoring
```bash
# Durum kontrolü
pm2 status

# Logları görüntüle
pm2 logs lumimatch

# CPU/Memory kullanımı
pm2 monit

# Yeniden başlat
pm2 restart lumimatch

# Durdur
pm2 stop lumimatch
```

### Log Yönetimi
```bash
# Log rotasyonu
pm2 install pm2-logrotate

# Yapılandırma
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

---

## 🔄 Güncelleme

### Sıfır Downtime Deployment
```bash
# 1. Yeni kodu çek
git pull origin main

# 2. Bağımlılıkları güncelle
npm install --production

# 3. Reload (sıfır downtime)
pm2 reload lumimatch
```

### Rollback
```bash
# Önceki commit'e dön
git reset --hard HEAD~1

# Bağımlılıkları geri yükle
npm install --production

# Restart
pm2 restart lumimatch
```

---

## 🧪 Performance Optimization

### Nginx Cache
```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;

location / {
    proxy_cache my_cache;
    proxy_cache_valid 200 60m;
    # ... diğer proxy ayarları
}
```

### Node.js Optimization
```javascript
// Cluster mode için
const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
    const numCPUs = os.cpus().length;
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
} else {
    // Server kodunuz
}
```

---

## 📈 Scaling

### Horizontal Scaling (PM2 Cluster Mode)
```bash
pm2 start server.js -i max --name lumimatch
```

### Load Balancer (Nginx)
```nginx
upstream lumimatch_cluster {
    least_conn;
    server localhost:3000;
    server localhost:3001;
    server localhost:3002;
    server localhost:3003;
}

server {
    location / {
        proxy_pass http://lumimatch_cluster;
        # ...
    }
}
```

---

## 🆘 Troubleshooting

### Bağlantı Hataları
```bash
# Port kontrolü
sudo lsof -i :3000

# Nginx status
sudo systemctl status nginx

# PM2 logs
pm2 logs lumimatch --lines 100
```

### Memory Leak
```bash
# Heap snapshot al
node --inspect server.js

# Memory kullanımını izle
pm2 monit
```

---

## 📞 Destek

Sorun yaşarsanız:
- 📧 Email: devops@lumimatch.net
- 💬 Discord: https://discord.gg/lumimatch
- 📚 Docs: https://docs.lumimatch.net