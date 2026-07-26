-- ============================================
-- LUMIMATCH - REALTIME FIX
-- Sadece eksik realtime ayarlarını düzelt
-- ============================================

-- Önce mevcut realtime publication'dan kaldır (hata vermezse)
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS stream_comments;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS stream_gifts;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS stream_viewers;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS user_presence;

-- Şimdi tekrar ekle
ALTER PUBLICATION supabase_realtime ADD TABLE stream_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE stream_gifts;
ALTER PUBLICATION supabase_realtime ADD TABLE stream_viewers;
ALTER PUBLICATION supabase_realtime ADD TABLE user_presence;

-- RLS politikalarını kontrol et ve düzelt
-- Eğer politikalar yoksa ekle, varsa hata vermez

DO $$
BEGIN
    -- live_streams politikaları
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'live_streams' 
        AND policyname = 'Anyone can view live streams'
    ) THEN
        CREATE POLICY "Anyone can view live streams" ON live_streams FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'live_streams' 
        AND policyname = 'Anyone can create streams'
    ) THEN
        CREATE POLICY "Anyone can create streams" ON live_streams FOR INSERT WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'live_streams' 
        AND policyname = 'Anyone can update streams'
    ) THEN
        CREATE POLICY "Anyone can update streams" ON live_streams FOR UPDATE USING (true);
    END IF;
    
    -- stream_comments politikaları
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'stream_comments' 
        AND policyname = 'Anyone can view comments'
    ) THEN
        CREATE POLICY "Anyone can view comments" ON stream_comments FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'stream_comments' 
        AND policyname = 'Anyone can add comments'
    ) THEN
        CREATE POLICY "Anyone can add comments" ON stream_comments FOR INSERT WITH CHECK (true);
    END IF;
    
    -- stream_gifts politikaları
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'stream_gifts' 
        AND policyname = 'Anyone can view gifts'
    ) THEN
        CREATE POLICY "Anyone can view gifts" ON stream_gifts FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'stream_gifts' 
        AND policyname = 'Anyone can send gifts'
    ) THEN
        CREATE POLICY "Anyone can send gifts" ON stream_gifts FOR INSERT WITH CHECK (true);
    END IF;
    
    -- stream_viewers politikaları
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'stream_viewers' 
        AND policyname = 'Anyone can be viewer'
    ) THEN
        CREATE POLICY "Anyone can be viewer" ON stream_viewers FOR ALL USING (true);
    END IF;
    
    -- user_presence politikaları
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_presence' 
        AND policyname = 'Anyone can update presence'
    ) THEN
        CREATE POLICY "Anyone can update presence" ON user_presence FOR ALL USING (true);
    END IF;
END $$;

-- ============================================
-- TAMAMLANDI! ✅
-- Artık realtime ve RLS düzgün çalışıyor
-- ============================================
