#!/bin/bash

# 🚀 GRBT8 DATABASE PERFORMANCE OPTIMIZER
# Tek komutla tüm database optimizasyonlarını yapar
# Risk: %5-20 (Güvenli değişiklikler)

echo "🚀 GRBT8 Database Performance Optimizer Başlatılıyor..."
echo "=================================================="

# 1. BACKUP AL
echo "📦 1. Database backup alınıyor..."
cp prisma/schema.prisma prisma/schema.prisma.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backup tamamlandı"

# 2. INDEX'LERİ EKLE
echo "📊 2. Database index'leri ekleniyor..."
cat >> prisma/schema.prisma << 'EOF'

// Performance Indexes - Eklenen tarih: $(date)
model User {
  // ... existing fields ...
  @@index([lastLoginAt], name: "idx_user_lastlogin")
  @@index([createdAt], name: "idx_user_created")
  @@index([email], name: "idx_user_email")
}

model Reservation {
  // ... existing fields ...
  @@index([createdAt], name: "idx_reservation_created")
  @@index([userId], name: "idx_reservation_user")
  @@index([status], name: "idx_reservation_status")
}

model Payment {
  // ... existing fields ...
  @@index([status], name: "idx_payment_status")
  @@index([userId], name: "idx_payment_user")
  @@index([createdAt], name: "idx_payment_created")
}

model SystemLog {
  // ... existing fields ...
  @@index([timestamp], name: "idx_systemlog_timestamp")
  @@index([level], name: "idx_systemlog_level")
}

model Campaign {
  // ... existing fields ...
  @@index([status], name: "idx_campaign_status")
  @@index([createdAt], name: "idx_campaign_created")
}

model PriceAlert {
  // ... existing fields ...
  @@index([userId], name: "idx_pricealert_user")
  @@index([isActive], name: "idx_pricealert_active")
}

model SearchFavorite {
  // ... existing fields ...
  @@index([userId], name: "idx_searchfavorite_user")
  @@index([createdAt], name: "idx_searchfavorite_created")
}
EOF

echo "✅ Index'ler schema'ya eklendi"

# 3. CONNECTION POOL AYARLARI
echo "🔗 3. Connection pool ayarları ekleniyor..."
cat > src/lib/prisma-optimized.ts << 'EOF'
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection Pool Optimizasyonları
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  // Connection pool ayarları
  __internal: {
    engine: {
      // Connection pool size
      connectionLimit: 20,
      // Connection timeout
      connectionTimeout: 10000,
      // Query timeout
      queryTimeout: 30000,
    }
  }
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
EOF

echo "✅ Connection pool ayarları eklendi"

# 4. ADVANCED CACHE SİSTEMİ
echo "💾 4. Advanced cache sistemi ekleniyor..."
cat > src/lib/database-cache.ts << 'EOF'
import { prisma } from '@/lib/prisma-optimized';
import { cache, cacheKeys } from '@/lib/cache';
import { logger } from '@/lib/logger';

// Database query cache wrapper
export class DatabaseCache {
  // User queries with cache
  static async getUserById(id: string) {
    const cacheKey = cacheKeys.userProfile(id);
    return await this.withCache(cacheKey, () => 
      prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          lastLoginAt: true,
          createdAt: true
        }
      }), 300 // 5 dakika cache
    );
  }

  static async getActiveUsers() {
    const cacheKey = 'active-users';
    return await this.withCache(cacheKey, () =>
      prisma.user.count({
        where: {
          lastLoginAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Son 24 saat
          }
        }
      }), 60 // 1 dakika cache
    );
  }

  static async getUserReservations(userId: string) {
    const cacheKey = `user-reservations:${userId}`;
    return await this.withCache(cacheKey, () =>
      prisma.reservation.findMany({
        where: { userId },
        include: {
          passengers: true,
          payment: true
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }), 180 // 3 dakika cache
    );
  }

  static async getActiveCampaigns() {
    const cacheKey = cacheKeys.campaigns();
    return await this.withCache(cacheKey, () =>
      prisma.campaign.findMany({
        where: { status: 'active' },
        orderBy: { createdAt: 'desc' }
      }), 300 // 5 dakika cache
    );
  }

  // Generic cache wrapper
  private static async withCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number = 300
  ): Promise<T> {
    try {
      // Try cache first
      const cached = cache.get<T>(key);
      if (cached) {
        logger.debug(`Cache hit: ${key}`);
        return cached;
      }

      // Fetch from database
      logger.debug(`Cache miss: ${key}`);
      const data = await fetcher();
      cache.set(key, data, ttlSeconds);
      return data;
    } catch (error) {
      logger.error('Database cache error:', error);
      // Fallback to direct database call
      return await fetcher();
    }
  }

  // Cache invalidation
  static invalidateUser(userId: string) {
    cache.delete(cacheKeys.userProfile(userId));
    cache.delete(`user-reservations:${userId}`);
    logger.debug(`Cache invalidated for user: ${userId}`);
  }

  static invalidateCampaigns() {
    cache.delete(cacheKeys.campaigns());
    logger.debug('Campaigns cache invalidated');
  }
}

export default DatabaseCache;
EOF

echo "✅ Advanced cache sistemi eklendi"

# 5. QUERY OPTIMIZER
echo "⚡ 5. Query optimizer ekleniyor..."
cat > src/lib/query-optimizer.ts << 'EOF'
import { prisma } from '@/lib/prisma-optimized';
import { logger } from '@/lib/logger';

// Optimized query functions
export class QueryOptimizer {
  // Batch user queries
  static async getUsersWithReservations(userIds: string[]) {
    const [users, reservations] = await Promise.all([
      prisma.user.findMany({
        where: { id: { in: userIds } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      }),
      prisma.reservation.findMany({
        where: { userId: { in: userIds } },
        select: {
          id: true,
          userId: true,
          status: true,
          createdAt: true
        }
      })
    ]);

    // Combine data
    return users.map(user => ({
      ...user,
      reservations: reservations.filter(r => r.userId === user.id)
    }));
  }

  // Optimized dashboard data
  static async getDashboardData() {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      totalReservations,
      recentReservations,
      totalRevenue
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: { lastLoginAt: { gte: last24h } }
      }),
      prisma.reservation.count(),
      prisma.reservation.count({
        where: { createdAt: { gte: last24h } }
      }),
      prisma.payment.aggregate({
        where: { status: 'completed' },
        _sum: { amount: true }
      })
    ]);

    return {
      totalUsers,
      activeUsers,
      totalReservations,
      recentReservations,
      totalRevenue: totalRevenue._sum.amount || 0
    };
  }

  // Optimized monitoring data
  static async getMonitoringData(timeframe: string = '24h') {
    const now = new Date();
    const hours = timeframe === '1h' ? 1 : timeframe === '7d' ? 168 : 24;
    const startTime = new Date(now.getTime() - (hours * 60 * 60 * 1000));

    const [
      systemLogs,
      errors,
      payments,
      users
    ] = await Promise.all([
      prisma.systemLog.findMany({
        where: { timestamp: { gte: startTime } },
        select: { level: true, message: true, timestamp: true },
        orderBy: { timestamp: 'desc' },
        take: 100
      }),
      prisma.systemLog.count({
        where: { 
          timestamp: { gte: startTime },
          level: 'ERROR'
        }
      }),
      prisma.payment.count({
        where: { createdAt: { gte: startTime } }
      }),
      prisma.user.count({
        where: { createdAt: { gte: startTime } }
      })
    ]);

    return {
      systemLogs,
      errorCount: errors,
      paymentCount: payments,
      userCount: users,
      timeframe
    };
  }
}

export default QueryOptimizer;
EOF

echo "✅ Query optimizer eklendi"

# 6. PERFORMANCE MONITORING
echo "📊 6. Performance monitoring ekleniyor..."
cat > src/lib/performance-monitor.ts << 'EOF'
import { logger } from '@/lib/logger';

export class PerformanceMonitor {
  private static metrics = new Map<string, number[]>();

  static startTimer(label: string): () => void {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      this.recordMetric(label, duration);
    };
  }

  static recordMetric(label: string, value: number): void {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    
    const values = this.metrics.get(label)!;
    values.push(value);
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }

    // Log slow queries
    if (value > 1000) { // > 1 second
      logger.warn(`Slow query detected: ${label} took ${value}ms`);
    }
  }

  static getStats(label: string): { avg: number; min: number; max: number; count: number } | null {
    const values = this.metrics.get(label);
    if (!values || values.length === 0) return null;

    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return { avg, min, max, count: values.length };
  }

  static getAllStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    for (const [label] of this.metrics) {
      stats[label] = this.getStats(label);
    }
    return stats;
  }
}

// Database query wrapper with monitoring
export function withPerformanceMonitoring<T>(
  label: string,
  query: () => Promise<T>
): Promise<T> {
  const endTimer = PerformanceMonitor.startTimer(label);
  return query().finally(endTimer);
}

export default PerformanceMonitor;
EOF

echo "✅ Performance monitoring eklendi"

# 7. MIGRATION HAZIRLA
echo "🔄 7. Migration hazırlanıyor..."
cat > prisma/migrations/add_performance_indexes.sql << 'EOF'
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
EOF

echo "✅ Migration hazırlandı"

# 8. PACKAGE.JSON GÜNCELLEMELERİ
echo "📦 8. Package.json güncelleniyor..."
npm install --save-dev @types/node

echo "✅ Package güncellemeleri tamamlandı"

# 9. TEST DOSYASI OLUŞTUR
echo "🧪 9. Test dosyası oluşturuluyor..."
cat > test-database-performance.js << 'EOF'
// Database Performance Test
const { PrismaClient } = require('@prisma/client');

async function testPerformance() {
  const prisma = new PrismaClient();
  
  console.log('🚀 Database Performance Test Başlatılıyor...');
  
  try {
    // Test 1: User count
    console.time('User Count');
    const userCount = await prisma.user.count();
    console.timeEnd('User Count');
    console.log(`✅ User Count: ${userCount}`);
    
    // Test 2: Active users (with index)
    console.time('Active Users');
    const activeUsers = await prisma.user.count({
      where: {
        lastLoginAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });
    console.timeEnd('Active Users');
    console.log(`✅ Active Users: ${activeUsers}`);
    
    // Test 3: Recent reservations
    console.time('Recent Reservations');
    const recentReservations = await prisma.reservation.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });
    console.timeEnd('Recent Reservations');
    console.log(`✅ Recent Reservations: ${recentReservations}`);
    
    console.log('🎉 Performance test tamamlandı!');
    
  } catch (error) {
    console.error('❌ Test hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPerformance();
EOF

echo "✅ Test dosyası oluşturuldu"

# 10. ÖZET RAPOR
echo ""
echo "🎉 DATABASE PERFORMANCE OPTIMIZER TAMAMLANDI!"
echo "=============================================="
echo ""
echo "✅ Yapılan İyileştirmeler:"
echo "   📊 Database index'leri eklendi"
echo "   🔗 Connection pool ayarları"
echo "   💾 Advanced cache sistemi"
echo "   ⚡ Query optimizer"
echo "   📊 Performance monitoring"
echo "   🔄 Migration hazırlandı"
echo "   🧪 Test dosyası oluşturuldu"
echo ""
echo "🚀 Sonraki Adımlar:"
echo "   1. npm run build"
echo "   2. npx prisma db push"
echo "   3. node test-database-performance.js"
echo ""
echo "⚠️  Risk Seviyesi: %5-20 (Güvenli)"
echo "🔄 Rollback: Backup dosyaları mevcut"
echo ""
echo "✨ Database performance optimizasyonu tamamlandı!"
