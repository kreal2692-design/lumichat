// ============================================
// SUPABASE EDGE FUNCTION: Google Play Purchase Verification
// ============================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Google Play Developer API endpoint
const GOOGLE_PLAY_API = 'https://androidpublisher.googleapis.com/androidpublisher/v3';
const PACKAGE_NAME = 'com.lumimatch.app';

serve(async (req) => {
  try {
    // CORS headers
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        },
      });
    }

    // Parse request
    const { transaction_id, product_id, purchase_token } = await req.json();

    if (!transaction_id || !product_id || !purchase_token) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing parameters' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ============================================
    // 1. GET GOOGLE ACCESS TOKEN (Service Account)
    // ============================================
    
    const serviceAccountKey = JSON.parse(Deno.env.get('GOOGLE_SERVICE_ACCOUNT_KEY') || '{}');
    
    if (!serviceAccountKey.client_email) {
      throw new Error('Google service account not configured');
    }

    // JWT oluştur (Google kimlik doğrulama)
    const accessToken = await getGoogleAccessToken(serviceAccountKey);

    // ============================================
    // 2. VERIFY PURCHASE WITH GOOGLE PLAY API
    // ============================================
    
    const productType = product_id.includes('premium') ? 'subscriptions' : 'products';
    const verifyUrl = `${GOOGLE_PLAY_API}/applications/${PACKAGE_NAME}/purchases/${productType}/${product_id}/tokens/${purchase_token}`;

    const verifyResponse = await fetch(verifyUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!verifyResponse.ok) {
      const errorData = await verifyResponse.text();
      console.error('Google Play API error:', errorData);
      
      // Supabase'e başarısız doğrulamayı kaydet
      await completeVerification(transaction_id, false, {
        error: 'Google API error',
        details: errorData,
      });

      return new Response(
        JSON.stringify({ success: false, error: 'Google verification failed' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const verificationData = await verifyResponse.json();

    // ============================================
    // 3. CHECK PURCHASE STATE
    // ============================================
    
    let isValid = false;

    if (productType === 'products') {
      // Consumable product (tokens)
      // purchaseState: 0 = Purchased, 1 = Cancelled, 2 = Pending
      isValid = verificationData.purchaseState === 0;
    } else {
      // Subscription (premium)
      // paymentState: 0 = Payment pending, 1 = Payment received
      isValid = verificationData.paymentState === 1;
    }

    // ============================================
    // 4. COMPLETE VERIFICATION IN SUPABASE
    // ============================================
    
    await completeVerification(transaction_id, isValid, verificationData);

    // ============================================
    // 5. CACHE VERIFICATION RESULT
    // ============================================
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase.from('verification_cache').insert({
      purchase_token,
      product_id,
      verification_response: verificationData,
      is_valid: isValid,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 saat
    });

    return new Response(
      JSON.stringify({
        success: true,
        is_valid: isValid,
        verification_data: verificationData,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

// ============================================
// HELPER: Get Google Access Token
// ============================================

async function getGoogleAccessToken(serviceAccountKey: any): Promise<string> {
  const jwtHeader = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const jwtPayload = {
    iss: serviceAccountKey.client_email,
    scope: 'https://www.googleapis.com/auth/androidpublisher',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  // JWT oluştur (Deno native crypto kullanarak)
  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(jwtHeader));
  const payloadB64 = btoa(JSON.stringify(jwtPayload));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Private key ile imzala
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(serviceAccountKey.private_key),
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    encoder.encode(unsignedToken)
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
  const jwt = `${unsignedToken}.${signatureB64}`;

  // Token al
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

// ============================================
// HELPER: PEM to ArrayBuffer
// ============================================

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');
  
  const binaryString = atob(b64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// ============================================
// HELPER: Complete Verification in Supabase
// ============================================

async function completeVerification(
  transactionId: string,
  isValid: boolean,
  verificationData: any
): Promise<void> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  await supabase.rpc('complete_iap_verification', {
    p_transaction_id: transactionId,
    p_is_valid: isValid,
    p_verification_data: verificationData,
  });
}
