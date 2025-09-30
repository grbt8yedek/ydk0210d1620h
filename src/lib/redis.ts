/**
 * Redis Client Configuration
 * Upstash Redis kullanarak token ve rate limiting yönetimi
 * NOT: Bu sadece GEÇİCİ veriler için kullanılır (CSRF tokens, rate limits)
 * KALICI veriler (kullanıcılar, ödemeler) PostgreSQL'de saklanır
 */

import { Redis } from '@upstash/redis';

// Redis client oluştur
export const redis = new Redis({
  url: process.env.KV_REST_API_URL || '',
  token: process.env.KV_REST_API_TOKEN || '',
});

/**
 * Rate Limiting için Redis fonksiyonları
 */
export const rateLimit = {
  /**
   * IP için rate limit kontrolü yap
   * @param ip - Kullanıcı IP adresi
   * @param maxRequests - Maksimum istek sayısı
   * @param windowMs - Zaman penceresi (milisaniye)
   * @returns {Promise<{allowed: boolean, remaining: number}>}
   */
  async check(ip: string, maxRequests: number = 100, windowMs: number = 60000): Promise<{ allowed: boolean; remaining: number }> {
    try {
      const key = `rate_limit:${ip}`;
      const now = Date.now();
      const windowStart = now - windowMs;

      // Redis'te sorted set kullanarak rate limit yönetimi
      // Eski kayıtları temizle
      await redis.zremrangebyscore(key, 0, windowStart);

      // Mevcut istek sayısını al
      const requestCount = await redis.zcount(key, windowStart, now);

      if (requestCount >= maxRequests) {
        return { allowed: false, remaining: 0 };
      }

      // Yeni isteği ekle
      await redis.zadd(key, { score: now, member: `${now}:${Math.random()}` });

      // Key'e TTL ekle (otomatik temizlik için)
      await redis.expire(key, Math.ceil(windowMs / 1000));

      return { 
        allowed: true, 
        remaining: maxRequests - (requestCount + 1) 
      };
    } catch (error) {
      console.error('Redis rate limit error:', error);
      // Redis hatası durumunda trafiği engelleme
      return { allowed: true, remaining: maxRequests };
    }
  },

  /**
   * IP için rate limit'i sıfırla
   * @param ip - Kullanıcı IP adresi
   */
  async reset(ip: string): Promise<void> {
    try {
      const key = `rate_limit:${ip}`;
      await redis.del(key);
    } catch (error) {
      console.error('Redis rate limit reset error:', error);
    }
  }
};

/**
 * CSRF Token yönetimi için Redis fonksiyonları
 */
export const csrfToken = {
  /**
   * Yeni CSRF token oluştur ve Redis'e kaydet
   * @param token - CSRF token
   * @param ttlSeconds - Token geçerlilik süresi (saniye)
   */
  async set(token: string, ttlSeconds: number = 3600): Promise<void> {
    try {
      const key = `csrf_token:${token}`;
      await redis.set(key, '1', { ex: ttlSeconds });
    } catch (error) {
      console.error('Redis CSRF token set error:', error);
    }
  },

  /**
   * CSRF token geçerliliğini kontrol et
   * @param token - CSRF token
   * @returns {Promise<boolean>}
   */
  async verify(token: string): Promise<boolean> {
    try {
      const key = `csrf_token:${token}`;
      const exists = await redis.exists(key);
      return exists === 1;
    } catch (error) {
      console.error('Redis CSRF token verify error:', error);
      // Redis hatası durumunda güvenli tarafta kal
      return false;
    }
  },

  /**
   * CSRF token'ı sil (tek kullanımlık için)
   * @param token - CSRF token
   */
  async delete(token: string): Promise<void> {
    try {
      const key = `csrf_token:${token}`;
      await redis.del(key);
    } catch (error) {
      console.error('Redis CSRF token delete error:', error);
    }
  }
};

/**
 * Cache yönetimi için Redis fonksiyonları
 * (Gelecekte kullanılmak üzere)
 */
export const cache = {
  /**
   * Cache'e veri kaydet
   * @param key - Cache key
   * @param value - Kaydedilecek değer (JSON olarak saklanır)
   * @param ttlSeconds - Cache geçerlilik süresi (saniye)
   */
  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    try {
      await redis.set(`cache:${key}`, JSON.stringify(value), { ex: ttlSeconds });
    } catch (error) {
      console.error('Redis cache set error:', error);
    }
  },

  /**
   * Cache'den veri al
   * @param key - Cache key
   * @returns {Promise<any | null>}
   */
  async get(key: string): Promise<any | null> {
    try {
      const data = await redis.get(`cache:${key}`);
      if (!data) return null;
      return typeof data === 'string' ? JSON.parse(data) : data;
    } catch (error) {
      console.error('Redis cache get error:', error);
      return null;
    }
  },

  /**
   * Cache'den veri sil
   * @param key - Cache key
   */
  async delete(key: string): Promise<void> {
    try {
      await redis.del(`cache:${key}`);
    } catch (error) {
      console.error('Redis cache delete error:', error);
    }
  },

  /**
   * Pattern ile eşleşen tüm cache'leri sil
   * @param pattern - Cache key pattern (örn: "flights:*")
   */
  async deletePattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(`cache:${pattern}`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Redis cache delete pattern error:', error);
    }
  }
};

export default redis;

