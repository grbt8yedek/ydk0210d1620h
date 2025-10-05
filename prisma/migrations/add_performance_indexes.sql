-- Performance Indexes Migration
-- Tarih: $(date)

-- User indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_lastlogin ON "User"("lastLoginAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_created ON "User"("createdAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_email ON "User"("email");

-- Reservation indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reservation_created ON "Reservation"("createdAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reservation_user ON "Reservation"("userId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reservation_status ON "Reservation"("status");

-- Payment indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_status ON "Payment"("status");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_user ON "Payment"("userId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_created ON "Payment"("createdAt");

-- SystemLog indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_systemlog_timestamp ON "SystemLog"("timestamp");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_systemlog_level ON "SystemLog"("level");

-- Campaign indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaign_status ON "Campaign"("status");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaign_created ON "Campaign"("createdAt");

-- PriceAlert indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pricealert_user ON "PriceAlert"("userId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pricealert_active ON "PriceAlert"("isActive");

-- SearchFavorite indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_searchfavorite_user ON "SearchFavorite"("userId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_searchfavorite_created ON "SearchFavorite"("createdAt");
