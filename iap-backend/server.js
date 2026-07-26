// ============================================
// LUMIMATCH MINIMAL IAP BACKEND
// Only for Google Play In-App Purchase handling
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// ── Supabase Setup ──────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://llibpqwyzexsgczxwjcp.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_KEY is required!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── Middleware ──────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());

// ── Token Packages ──────────────────────────
const TOKEN_PACKAGES = {
  'com.lumimatch.tokens_100': { amount: 100, type: 'token', price: 79.99 },
  'com.lumimatch.tokens_300': { amount: 300, type: 'token', price: 199.99 },
  'com.lumimatch.tokens_750': { amount: 750, type: 'token', price: 419.99 },
  'com.lumimatch.tokens_1000': { amount: 1000, type: 'token', price: 479.99 },
  'com.lumimatch.tokens_1500': { amount: 1500, type: 'token', price: 599.99 },
};

// ── Premium Packages ────────────────────────
const PREMIUM_PACKAGES = {
  'com.lumimatch.premium_1month': { months: 1, type: 'subscription', price: 99.99 },
  'com.lumimatch.premium_3month': { months: 3, type: 'subscription', price: 249.99 },
  'com.lumimatch.premium_12month': { months: 12, type: 'subscription', price: 799.99 },
};

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'lumimatch-iap-backend',
    timestamp: new Date().toISOString()
  });
});

// Transaction endpoint (POST)
app.post('/api/transactions', async (req, res) => {
  try {
    const { userId, productId, purchaseToken, platform = 'android' } = req.body;
    
    if (!userId || !productId || !purchaseToken) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, productId, purchaseToken' 
      });
    }

    // Get product info
    const product = TOKEN_PACKAGES[productId] || PREMIUM_PACKAGES[productId];
    
    if (!product) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    // Check for duplicate purchase token
    const { data: existing } = await supabase
      .from('transactions')
      .select('id')
      .eq('purchase_token', purchaseToken)
      .single();

    if (existing) {
      return res.status(409).json({ 
        error: 'Purchase already processed',
        transaction_id: existing.id 
      });
    }

    // Create transaction record
    const transaction = {
      user_id: userId,
      product_id: productId,
      product_type: product.type,
      amount: product.amount || product.months,
      price: product.price,
      currency: 'TRY',
      platform: platform,
      purchase_token: purchaseToken,
      status: 'completed',
      purchased_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    };

    const { data: txn, error: txnError } = await supabase
      .from('transactions')
      .insert(transaction)
      .select()
      .single();

    if (txnError) {
      console.error('[IAP ERROR]', txnError);
      return res.status(500).json({ error: 'Failed to save transaction' });
    }

    // Add tokens or premium
    if (product.type === 'token') {
      // Get current tokens
      const { data: user } = await supabase
        .from('users')
        .select('tokens')
        .eq('id', userId)
        .single();

      const newTokens = (user?.tokens || 0) + product.amount;

      const { error: updateError } = await supabase
        .from('users')
        .update({ tokens: newTokens })
        .eq('id', userId);

      if (updateError) {
        console.error('[TOKEN UPDATE ERROR]', updateError);
        return res.status(500).json({ error: 'Failed to add tokens' });
      }

      console.log(`[IAP] ✅ ${userId} +${product.amount} tokens → ${newTokens}`);

      return res.json({
        success: true,
        transaction: txn,
        tokens: newTokens,
        message: `${product.amount} jeton eklendi!`
      });
    }

    // Premium subscription
    if (product.type === 'subscription') {
      const { data: user } = await supabase
        .from('users')
        .select('premium_until')
        .eq('id', userId)
        .single();

      const now = new Date();
      const currentPremiumUntil = user?.premium_until ? new Date(user.premium_until) : now;
      const startDate = currentPremiumUntil > now ? currentPremiumUntil : now;
      
      startDate.setMonth(startDate.getMonth() + product.months);
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          premium_until: startDate.toISOString(),
          is_premium: true 
        })
        .eq('id', userId);

      if (updateError) {
        console.error('[PREMIUM UPDATE ERROR]', updateError);
        return res.status(500).json({ error: 'Failed to add premium' });
      }

      console.log(`[IAP] ✅ ${userId} +${product.months} months premium → ${startDate.toISOString()}`);

      return res.json({
        success: true,
        transaction: txn,
        premium_until: startDate.toISOString(),
        message: `${product.months} ay premium eklendi!`
      });
    }

  } catch (error) {
    console.error('[TRANSACTION API ERROR]', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user transactions (GET)
app.get('/api/transactions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('[GET TRANSACTIONS ERROR]', error);
      return res.status(500).json({ error: 'Failed to fetch transactions' });
    }

    res.json({ transactions: data || [] });
  } catch (error) {
    console.error('[GET TRANSACTIONS API ERROR]', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Start Server ────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 LumiMatch IAP Backend running on port ${PORT}`);
  console.log(`📦 Supabase: ${SUPABASE_URL}`);
  console.log(`💳 Ready to process Google Play purchases`);
});

// Error handlers
process.on('uncaughtException', (err) => console.error('[UNCAUGHT]', err.message));
process.on('unhandledRejection', (err) => console.error('[UNHANDLED]', err));
