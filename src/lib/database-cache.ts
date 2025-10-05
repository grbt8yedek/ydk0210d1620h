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
