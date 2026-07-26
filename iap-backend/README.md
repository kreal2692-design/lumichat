# LumiMatch IAP Backend

Minimal backend for handling Google Play In-App Purchases.

## Features

- ✅ Transaction recording
- ✅ Token package processing
- ✅ Premium subscription handling
- ✅ Double-spending prevention
- ✅ Supabase integration

## Quick Deploy to Render.com

1. **Create GitHub Repo:**
   - Go to https://github.com/new
   - Name: `lumimatch-iap-backend`
   - Upload this folder

2. **Deploy to Render:**
   - Go to https://render.com
   - Sign in with GitHub
   - Click "New" → "Web Service"
   - Select your repo
   - Configure:
     - **Name**: `lumimatch-iap`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
   - Add Environment Variables:
     ```
     SUPABASE_URL=https://llibpqwyzexsgczxwjcp.supabase.co
     SUPABASE_SERVICE_KEY=(get from Supabase Dashboard → Settings → API)
     ```
   - Click "Create Web Service"

3. **Get Your URL:**
   - After deploy: `https://lumimatch-iap-xxxx.onrender.com`
   - Test: `https://lumimatch-iap-xxxx.onrender.com/health`

4. **Update Mobile App:**
   - Open: `lumimatch-app/src/services/paymentService.js`
   - Line 403: Update URL to your Render URL

## Local Testing

```bash
npm install
cp .env.example .env
# Edit .env with your credentials
npm start
# Visit http://localhost:3000/health
```

## API Endpoints

### Health Check
```
GET /health
```

### Create Transaction
```
POST /api/transactions
Body: {
  userId: "uuid",
  productId: "com.lumimatch.tokens_100",
  purchaseToken: "google_play_token",
  platform: "android"
}
```

### Get User Transactions
```
GET /api/transactions/:userId
Query: limit=50, offset=0
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Supabase project URL | ✅ |
| `SUPABASE_SERVICE_KEY` | Service role key | ✅ |
| `PORT` | Server port (default: 3000) | ❌ |

## Supported Products

### Token Packages
- `com.lumimatch.tokens_100` - 100 tokens (79.99 TL)
- `com.lumimatch.tokens_300` - 300 tokens (199.99 TL)
- `com.lumimatch.tokens_750` - 750 tokens (419.99 TL)
- `com.lumimatch.tokens_1000` - 1000 tokens (479.99 TL)
- `com.lumimatch.tokens_1500` - 1500 tokens (599.99 TL)

### Premium Subscriptions
- `com.lumimatch.premium_1month` - 1 month (99.99 TL)
- `com.lumimatch.premium_3month` - 3 months (249.99 TL)
- `com.lumimatch.premium_12month` - 12 months (799.99 TL)

## Security Notes

⚠️ **TODO**: Add Google Play receipt verification
- Currently trusts purchase tokens from client
- Should verify with Google Play Developer API
- Requires service account JSON key

## License

Private
