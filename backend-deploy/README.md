# LumiMatch Backend API

Backend API for LumiMatch dating app with Google Play In-App Purchase integration.

## Features

- 🎮 Real-time chat with Socket.IO
- 💳 Google Play IAP transaction handling
- 👥 Friends system
- 🎁 Gift system
- 👑 Premium membership
- 📊 Supabase database integration

## Quick Deploy

### Deploy to Render.com

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com)

1. Click "New Web Service"
2. Connect your GitHub repo
3. Set environment variables (see below)
4. Deploy!

### Deploy to Railway.app

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app)

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Add environment variables
4. Deploy!

## Environment Variables

Create a `.env` file (see `.env.example`):

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
PORT=3000
CORS_ORIGIN=*
```

## Installation

```bash
npm install
npm start
```

## API Endpoints

### Health Check
```
GET /health
```

### Transactions (IAP)
```
POST /api/transactions
GET /api/transactions/:userId
```

### Friends
```
POST /api/friends/request
POST /api/friends/respond
GET /api/friends/:userId
GET /api/friends/pending/:userId
```

### Gifts
```
POST /api/gifts/send
GET /api/gifts/:userId
POST /api/gifts/convert
```

### Premium
```
POST /api/premium/activate
GET /api/premium/status/:userId
POST /api/premium/buy-with-tokens
POST /api/premium/daily-bonus
```

## Production URL

Your production URL will be:
- **Render**: `https://your-app-name.onrender.com`
- **Railway**: `https://your-app-name.up.railway.app`
- **Glitch**: `https://your-app-name.glitch.me`

Update this URL in your mobile app:
```javascript
// paymentService.js
const BACKEND_URL = 'https://YOUR-DEPLOYED-URL.onrender.com';
```

## License

Private
