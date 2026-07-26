-- ============================================
-- SUPABASE EDGE FUNCTION: handle-purchase
-- Google Play IAP için transaction handler
-- ============================================

-- Bu SQL'i Supabase Dashboard → SQL Editor'da çalıştır

CREATE OR REPLACE FUNCTION handle_iap_purchase(
  p_user_id UUID,
  p_product_id TEXT,
  p_purchase_token TEXT,
  p_platform TEXT DEFAULT 'android'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_product RECORD;
  v_existing_txn UUID;
  v_new_txn UUID;
  v_current_tokens INT;
  v_new_tokens INT;
  v_current_premium TIMESTAMPTZ;
  v_new_premium TIMESTAMPTZ;
  v_result JSON;
BEGIN
  -- 1. Product bilgilerini belirle
  CASE p_product_id
    WHEN 'com.lumimatch.tokens_100' THEN
      v_product := ROW(100, 'token', 79.99)::RECORD;
    WHEN 'com.lumimatch.tokens_300' THEN
      v_product := ROW(300, 'token', 199.99)::RECORD;
    WHEN 'com.lumimatch.tokens_750' THEN
      v_product := ROW(750, 'token', 419.99)::RECORD;
    WHEN 'com.lumimatch.tokens_1000' THEN
      v_product := ROW(1000, 'token', 479.99)::RECORD;
    WHEN 'com.lumimatch.tokens_1500' THEN
      v_product := ROW(1500, 'token', 599.99)::RECORD;
    WHEN 'com.lumimatch.premium_1month' THEN
      v_product := ROW(1, 'subscription', 99.99)::RECORD;
    WHEN 'com.lumimatch.premium_3month' THEN
      v_product := ROW(3, 'subscription', 249.99)::RECORD;
    WHEN 'com.lumimatch.premium_12month' THEN
      v_product := ROW(12, 'subscription', 799.99)::RECORD;
    ELSE
      RETURN json_build_object('success', false, 'error', 'Invalid product ID');
  END CASE;

  -- 2. Double spending kontrolü
  SELECT id INTO v_existing_txn
  FROM transactions
  WHERE purchase_token = p_purchase_token
  LIMIT 1;

  IF v_existing_txn IS NOT NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Purchase already processed',
      'transaction_id', v_existing_txn
    );
  END IF;

  -- 3. Transaction kaydı oluştur
  INSERT INTO transactions (
    user_id,
    product_id,
    product_type,
    amount,
    price,
    currency,
    platform,
    purchase_token,
    status,
    purchased_at,
    completed_at
  ) VALUES (
    p_user_id,
    p_product_id,
    (v_product).f2, -- product_type
    (v_product).f1, -- amount
    (v_product).f3, -- price
    'TRY',
    p_platform,
    p_purchase_token,
    'completed',
    NOW(),
    NOW()
  )
  RETURNING id INTO v_new_txn;

  -- 4. Jeton veya Premium ekle
  IF (v_product).f2 = 'token' THEN
    -- Token paketi
    SELECT tokens INTO v_current_tokens FROM users WHERE id = p_user_id;
    v_new_tokens := COALESCE(v_current_tokens, 0) + (v_product).f1;
    
    UPDATE users
    SET tokens = v_new_tokens
    WHERE id = p_user_id;

    v_result := json_build_object(
      'success', true,
      'transaction_id', v_new_txn,
      'type', 'token',
      'tokens', v_new_tokens,
      'added', (v_product).f1,
      'message', (v_product).f1 || ' jeton eklendi!'
    );

  ELSIF (v_product).f2 = 'subscription' THEN
    -- Premium abonelik
    SELECT premium_until INTO v_current_premium FROM users WHERE id = p_user_id;
    
    IF v_current_premium IS NULL OR v_current_premium < NOW() THEN
      v_new_premium := NOW() + ((v_product).f1 || ' months')::INTERVAL;
    ELSE
      v_new_premium := v_current_premium + ((v_product).f1 || ' months')::INTERVAL;
    END IF;

    UPDATE users
    SET 
      is_premium = TRUE,
      premium_until = v_new_premium
    WHERE id = p_user_id;

    v_result := json_build_object(
      'success', true,
      'transaction_id', v_new_txn,
      'type', 'subscription',
      'premium_until', v_new_premium,
      'months', (v_product).f1,
      'message', (v_product).f1 || ' ay premium eklendi!'
    );
  END IF;

  RETURN v_result;
END;
$$;

-- Grant permission
GRANT EXECUTE ON FUNCTION handle_iap_purchase TO authenticated;
GRANT EXECUTE ON FUNCTION handle_iap_purchase TO anon;

-- Test fonksiyon (opsiyonel)
-- SELECT handle_iap_purchase(
--   'user-uuid-buraya',
--   'com.lumimatch.tokens_100',
--   'test-token-' || gen_random_uuid()::text,
--   'android'
-- );
