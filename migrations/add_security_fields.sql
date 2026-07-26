-- ============================================
-- IAP Security & Legal Compliance Updates
-- ============================================

-- 1. IP Adresi Kaydı (Adli gereklilik)
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS ip_address INET;

-- 2. Device Bilgisi (Fraud detection için)
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS device_info JSONB;

-- 3. Refund Tracking
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS refund_status TEXT DEFAULT 'none' CHECK (refund_status IN ('none', 'pending', 'completed', 'rejected'));

ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS refund_date TIMESTAMP;

ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS refund_reason TEXT;

-- 4. Audit Log Tablosu
CREATE TABLE IF NOT EXISTS transaction_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created', 'verified', 'refunded', 'cancelled', 'updated')),
  actor_id UUID REFERENCES users(id),
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Fraud Detection: Rate Limiting Tablosu
CREATE TABLE IF NOT EXISTS purchase_rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ip_address INET,
  purchase_count INT DEFAULT 1,
  first_purchase_at TIMESTAMP DEFAULT NOW(),
  last_purchase_at TIMESTAMP DEFAULT NOW(),
  is_suspicious BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, ip_address)
);

-- 6. Google Play Verification Cache (API çağrısı azaltmak için)
CREATE TABLE IF NOT EXISTS verification_cache (
  purchase_token TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  verification_response JSONB NOT NULL,
  is_valid BOOLEAN NOT NULL,
  verified_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);

-- Index'ler (performans için)
CREATE INDEX IF NOT EXISTS idx_transactions_ip ON transactions(ip_address);
CREATE INDEX IF NOT EXISTS idx_transactions_refund ON transactions(refund_status) WHERE refund_status != 'none';
CREATE INDEX IF NOT EXISTS idx_audit_log_transaction ON transaction_audit_log(transaction_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON transaction_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rate_limits_user ON purchase_rate_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_cache_expires ON verification_cache(expires_at);

-- RLS Policies
ALTER TABLE transaction_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_cache ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar sadece kendi transaction audit log'larını görebilir
DROP POLICY IF EXISTS "Users can view their own audit logs" ON transaction_audit_log;
CREATE POLICY "Users can view their own audit logs"
  ON transaction_audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM transactions 
      WHERE transactions.id = transaction_audit_log.transaction_id 
      AND transactions.user_id = auth.uid()
    )
  );

-- Kullanıcılar kendi rate limit bilgilerini göremez (admin only)
DROP POLICY IF EXISTS "Only admins can view rate limits" ON purchase_rate_limits;
CREATE POLICY "Only admins can view rate limits"
  ON purchase_rate_limits FOR SELECT
  USING (FALSE);

-- Verification cache tamamen backend için (kullanıcılar görmez)
DROP POLICY IF EXISTS "No public access to verification cache" ON verification_cache;
CREATE POLICY "No public access to verification cache"
  ON verification_cache FOR SELECT
  USING (FALSE);

-- ============================================
-- COMMENTS (Dokümantasyon)
-- ============================================

COMMENT ON COLUMN transactions.ip_address IS 'User IP address for legal compliance (6563 sayılı kanun)';
COMMENT ON COLUMN transactions.device_info IS 'Device details: {android_id, brand, model, os_version}';
COMMENT ON COLUMN transactions.refund_status IS 'Refund processing status';
COMMENT ON TABLE transaction_audit_log IS 'Audit trail for all transaction changes';
COMMENT ON TABLE purchase_rate_limits IS 'Anti-fraud: tracks purchase frequency per user/IP';
COMMENT ON TABLE verification_cache IS 'Google Play API verification cache to reduce API calls';

-- ============================================
-- Cleanup: Eski verification cache'i sil (24 saat sonra)
-- ============================================

CREATE OR REPLACE FUNCTION cleanup_verification_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM verification_cache 
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Her gün otomatik temizlik (Supabase cron ile kullanılabilir)
-- Not: Supabase Dashboard'dan cron job eklemen gerekecek:
-- SELECT cron.schedule('cleanup-verification-cache', '0 2 * * *', 'SELECT cleanup_verification_cache()');
