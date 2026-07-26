-- ============================================
-- SECURE IAP PURCHASE HANDLER
-- Google Play Verification + Fraud Detection
-- ============================================

CREATE OR REPLACE FUNCTION handle_iap_purchase_secure(
  p_user_id UUID,
  p_product_id TEXT,
  p_purchase_token TEXT,
  p_platform TEXT,
  p_ip_address INET DEFAULT NULL,
  p_device_info JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_transaction_id UUID;
  v_token_amount INT;
  v_premium_days INT;
  v_product_type TEXT;
  v_purchase_count INT;
  v_is_suspicious BOOLEAN := FALSE;
BEGIN
  -- ============================================
  -- 1. VALIDATION: Basic Checks
  -- ============================================
  
  IF p_user_id IS NULL OR p_product_id IS NULL OR p_purchase_token IS NULL THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Missing required parameters'
    );
  END IF;

  IF p_platform != 'android' THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Only Android platform supported'
    );
  END IF;

  -- ============================================
  -- 2. FRAUD DETECTION: Rate Limiting
  -- ============================================
  
  -- Son 1 saatte kaç satın alım yapılmış?
  SELECT COUNT(*)
  INTO v_purchase_count
  FROM transactions
  WHERE user_id = p_user_id
    AND created_at > NOW() - INTERVAL '1 hour';

  -- Eğer 5'ten fazla satın alım varsa şüpheli işaretle
  IF v_purchase_count >= 5 THEN
    v_is_suspicious := TRUE;
    
    -- Admin'e bildirim için log
    INSERT INTO transaction_audit_log (
      action, actor_id, changes, ip_address
    ) VALUES (
      'updated', 
      p_user_id, 
      jsonb_build_object(
        'alert', 'suspicious_activity',
        'purchase_count', v_purchase_count,
        'timeframe', '1_hour'
      ),
      p_ip_address
    );
  END IF;

  -- Rate limit tablosunu güncelle
  INSERT INTO purchase_rate_limits (
    user_id, ip_address, purchase_count, first_purchase_at, last_purchase_at, is_suspicious
  ) VALUES (
    p_user_id, p_ip_address, 1, NOW(), NOW(), v_is_suspicious
  )
  ON CONFLICT (user_id, ip_address) 
  DO UPDATE SET
    purchase_count = purchase_rate_limits.purchase_count + 1,
    last_purchase_at = NOW(),
    is_suspicious = CASE 
      WHEN purchase_rate_limits.purchase_count + 1 >= 5 THEN TRUE 
      ELSE purchase_rate_limits.is_suspicious 
    END;

  -- ============================================
  -- 3. DOUBLE-SPEND CHECK
  -- ============================================
  
  IF EXISTS (
    SELECT 1 FROM transactions 
    WHERE purchase_token = p_purchase_token
  ) THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Purchase token already processed'
    );
  END IF;

  -- ============================================
  -- 4. PRODUCT TYPE & AMOUNT
  -- ============================================
  
  CASE 
    WHEN p_product_id = 'com.lumimatch.tokens_100' THEN
      v_token_amount := 100;
      v_product_type := 'token_package';
    WHEN p_product_id = 'com.lumimatch.tokens_300' THEN
      v_token_amount := 300;
      v_product_type := 'token_package';
    WHEN p_product_id = 'com.lumimatch.tokens_750' THEN
      v_token_amount := 750;
      v_product_type := 'token_package';
    WHEN p_product_id = 'com.lumimatch.tokens_1000' THEN
      v_token_amount := 1000;
      v_product_type := 'token_package';
    WHEN p_product_id = 'com.lumimatch.tokens_1500' THEN
      v_token_amount := 1500;
      v_product_type := 'token_package';
    WHEN p_product_id = 'com.lumimatch.premium_1month' THEN
      v_premium_days := 30;
      v_product_type := 'premium_subscription';
    WHEN p_product_id = 'com.lumimatch.premium_3month' THEN
      v_premium_days := 90;
      v_product_type := 'premium_subscription';
    WHEN p_product_id = 'com.lumimatch.premium_12month' THEN
      v_premium_days := 365;
      v_product_type := 'premium_subscription';
    ELSE
      RETURN jsonb_build_object(
        'success', FALSE,
        'error', 'Invalid product ID'
      );
  END CASE;

  -- ============================================
  -- 5. CREATE TRANSACTION (status: pending_verification)
  -- ============================================
  
  INSERT INTO transactions (
    user_id,
    product_id,
    purchase_token,
    platform,
    amount,
    product_type,
    status,
    ip_address,
    device_info
  ) VALUES (
    p_user_id,
    p_product_id,
    p_purchase_token,
    p_platform,
    v_token_amount,
    v_product_type,
    'pending_verification', -- Google doğrulaması bekliyor
    p_ip_address,
    p_device_info
  ) RETURNING id INTO v_transaction_id;

  -- Audit log
  INSERT INTO transaction_audit_log (
    transaction_id, action, actor_id, changes, ip_address
  ) VALUES (
    v_transaction_id, 
    'created', 
    p_user_id, 
    jsonb_build_object(
      'product_id', p_product_id,
      'amount', COALESCE(v_token_amount, 0),
      'premium_days', COALESCE(v_premium_days, 0),
      'is_suspicious', v_is_suspicious
    ),
    p_ip_address
  );

  -- ============================================
  -- 6. RETURN (Google verification sonrası tamamlanacak)
  -- ============================================
  
  RETURN jsonb_build_object(
    'success', TRUE,
    'transaction_id', v_transaction_id,
    'status', 'pending_verification',
    'message', 'Purchase recorded, awaiting Google verification',
    'is_suspicious', v_is_suspicious,
    'verification_required', TRUE
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', SQLERRM
    );
END;
$$;

-- ============================================
-- VERIFICATION COMPLETION FUNCTION
-- Google'dan doğrulama geldikten sonra çağrılacak
-- ============================================

CREATE OR REPLACE FUNCTION complete_iap_verification(
  p_transaction_id UUID,
  p_is_valid BOOLEAN,
  p_verification_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_token_amount INT;
  v_premium_days INT;
  v_product_type TEXT;
  v_product_id TEXT;
BEGIN
  -- Transaction bilgilerini al
  SELECT user_id, amount, product_type, product_id
  INTO v_user_id, v_token_amount, v_product_type, v_product_id
  FROM transactions
  WHERE id = p_transaction_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Transaction not found');
  END IF;

  -- Doğrulama başarısız
  IF NOT p_is_valid THEN
    UPDATE transactions
    SET status = 'failed',
        verification_data = p_verification_data
    WHERE id = p_transaction_id;

    INSERT INTO transaction_audit_log (
      transaction_id, action, changes
    ) VALUES (
      p_transaction_id, 
      'verified', 
      jsonb_build_object('result', 'failed', 'reason', 'invalid_purchase')
    );

    RETURN jsonb_build_object('success', FALSE, 'error', 'Verification failed');
  END IF;

  -- Doğrulama başarılı: Token veya Premium ekle
  IF v_product_type = 'token_package' THEN
    UPDATE users
    SET tokens = tokens + v_token_amount
    WHERE id = v_user_id;

    UPDATE transactions
    SET status = 'completed',
        verification_data = p_verification_data
    WHERE id = p_transaction_id;

  ELSIF v_product_type = 'premium_subscription' THEN
    -- Premium süresini hesapla
    SELECT 
      CASE 
        WHEN v_product_id = 'com.lumimatch.premium_1month' THEN 30
        WHEN v_product_id = 'com.lumimatch.premium_3month' THEN 90
        WHEN v_product_id = 'com.lumimatch.premium_12month' THEN 365
      END
    INTO v_premium_days;

    UPDATE users
    SET premium_until = CASE
      WHEN premium_until IS NULL OR premium_until < NOW() 
        THEN NOW() + (v_premium_days || ' days')::INTERVAL
      ELSE premium_until + (v_premium_days || ' days')::INTERVAL
    END
    WHERE id = v_user_id;

    UPDATE transactions
    SET status = 'completed',
        verification_data = p_verification_data
    WHERE id = p_transaction_id;
  END IF;

  -- Audit log
  INSERT INTO transaction_audit_log (
    transaction_id, action, actor_id, changes
  ) VALUES (
    p_transaction_id, 
    'verified', 
    v_user_id,
    jsonb_build_object('result', 'success', 'tokens_added', v_token_amount)
  );

  RETURN jsonb_build_object(
    'success', TRUE,
    'message', 'Purchase verified and completed'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', FALSE, 'error', SQLERRM);
END;
$$;

-- ============================================
-- REFUND FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION process_refund(
  p_transaction_id UUID,
  p_refund_reason TEXT,
  p_admin_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_token_amount INT;
  v_product_type TEXT;
BEGIN
  SELECT user_id, amount, product_type
  INTO v_user_id, v_token_amount, v_product_type
  FROM transactions
  WHERE id = p_transaction_id AND status = 'completed';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Transaction not found or not completed');
  END IF;

  -- Token iadesi
  IF v_product_type = 'token_package' THEN
    UPDATE users
    SET tokens = GREATEST(tokens - v_token_amount, 0)
    WHERE id = v_user_id;
  END IF;

  -- Transaction'ı refunded olarak işaretle
  UPDATE transactions
  SET refund_status = 'completed',
      refund_date = NOW(),
      refund_reason = p_refund_reason,
      status = 'refunded'
  WHERE id = p_transaction_id;

  -- Audit log
  INSERT INTO transaction_audit_log (
    transaction_id, action, actor_id, changes
  ) VALUES (
    p_transaction_id,
    'refunded',
    COALESCE(p_admin_id, v_user_id),
    jsonb_build_object('reason', p_refund_reason, 'tokens_removed', v_token_amount)
  );

  RETURN jsonb_build_object('success', TRUE, 'message', 'Refund processed');

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', FALSE, 'error', SQLERRM);
END;
$$;
