-- ============================================
-- TRANSACTIONS TABLE FOR IN-APP PURCHASES
-- ============================================

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  
  -- Product info
  product_id TEXT NOT NULL,
  product_type TEXT CHECK (product_type IN ('token', 'subscription')) NOT NULL,
  
  -- Purchase details
  amount INTEGER, -- token miktarı veya subscription ay sayısı
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'TRY',
  
  -- Platform info
  platform TEXT CHECK (platform IN ('android', 'ios')) DEFAULT 'android',
  
  -- Google Play / App Store receipt
  purchase_token TEXT UNIQUE, -- Google Play receipt token
  transaction_id TEXT, -- Google/Apple transaction ID
  original_transaction_id TEXT, -- For subscriptions
  
  -- Status
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')) DEFAULT 'pending',
  
  -- Timestamps
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_product_id ON transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_transactions_purchase_token ON transactions(purchase_token);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own transactions
CREATE POLICY "Users can view own transactions"
  ON transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only authenticated users can insert transactions
CREATE POLICY "Authenticated users can create transactions"
  ON transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_transactions_updated_at();

-- Grant permissions
GRANT SELECT, INSERT ON transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON transactions TO service_role;

COMMENT ON TABLE transactions IS 'Stores in-app purchase transactions from Google Play and App Store';
