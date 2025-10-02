import { rateLimit, csrfToken, cache, redis } from '@/lib/redis';

// Mock @upstash/redis
jest.mock('@upstash/redis', () => {
  const mockRedisInstance = {
    zremrangebyscore: jest.fn().mockResolvedValue(0),
    zcount: jest.fn().mockResolvedValue(0),
    zadd: jest.fn().mockResolvedValue(1),
    expire: jest.fn().mockResolvedValue(1),
    del: jest.fn().mockResolvedValue(1),
    set: jest.fn().mockResolvedValue('OK'),
    get: jest.fn().mockResolvedValue(null),
    exists: jest.fn().mockResolvedValue(0),
    keys: jest.fn().mockResolvedValue([]),
  };

  return {
    Redis: jest.fn(() => mockRedisInstance),
  };
});

describe('Redis - Rate Limiting', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rateLimit.check', () => {
    it('should allow request when under limit', async () => {
      (redis.zcount as jest.Mock).mockResolvedValueOnce(5);
      
      const result = await rateLimit.check('192.168.1.1', 100, 60000);
      
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(94); // 100 - (5 + 1)
    });

    it('should block request when at limit', async () => {
      (redis.zcount as jest.Mock).mockResolvedValueOnce(100);
      
      const result = await rateLimit.check('192.168.1.1', 100, 60000);
      
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should block request when over limit', async () => {
      (redis.zcount as jest.Mock).mockResolvedValueOnce(150);
      
      const result = await rateLimit.check('192.168.1.1', 100, 60000);
      
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should clean up old requests', async () => {
      await rateLimit.check('192.168.1.1', 100, 60000);
      
      expect(redis.zremrangebyscore).toHaveBeenCalledWith(
        'rate_limit:192.168.1.1',
        0,
        expect.any(Number)
      );
    });

    it('should add new request to sorted set', async () => {
      (redis.zcount as jest.Mock).mockResolvedValueOnce(5);
      
      await rateLimit.check('192.168.1.1', 100, 60000);
      
      expect(redis.zadd).toHaveBeenCalledWith(
        'rate_limit:192.168.1.1',
        expect.objectContaining({
          score: expect.any(Number),
          member: expect.any(String),
        })
      );
    });

    it('should set TTL on rate limit key', async () => {
      (redis.zcount as jest.Mock).mockResolvedValueOnce(5);
      
      await rateLimit.check('192.168.1.1', 100, 60000);
      
      expect(redis.expire).toHaveBeenCalledWith(
        'rate_limit:192.168.1.1',
        60 // 60000ms / 1000
      );
    });

    it('should handle Redis errors gracefully', async () => {
      (redis.zcount as jest.Mock).mockRejectedValueOnce(new Error('Redis error'));
      
      const result = await rateLimit.check('192.168.1.1', 100, 60000);
      
      // Should allow traffic on error
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(100);
    });

    it('should use custom maxRequests and windowMs', async () => {
      (redis.zcount as jest.Mock).mockResolvedValueOnce(10);
      
      const result = await rateLimit.check('192.168.1.1', 50, 30000);
      
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(39); // 50 - (10 + 1)
      expect(redis.expire).toHaveBeenCalledWith('rate_limit:192.168.1.1', 30);
    });

    it('should handle different IPs independently', async () => {
      await rateLimit.check('192.168.1.1');
      await rateLimit.check('192.168.1.2');
      
      expect(redis.zadd).toHaveBeenCalledWith('rate_limit:192.168.1.1', expect.any(Object));
      expect(redis.zadd).toHaveBeenCalledWith('rate_limit:192.168.1.2', expect.any(Object));
    });
  });

  describe('rateLimit.reset', () => {
    it('should delete rate limit key', async () => {
      await rateLimit.reset('192.168.1.1');
      
      expect(redis.del).toHaveBeenCalledWith('rate_limit:192.168.1.1');
    });

    it('should handle Redis errors gracefully', async () => {
      (redis.del as jest.Mock).mockRejectedValueOnce(new Error('Redis error'));
      
      await expect(rateLimit.reset('192.168.1.1')).resolves.not.toThrow();
    });
  });
});

describe('Redis - CSRF Token', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('csrfToken.set', () => {
    it('should store CSRF token with default TTL', async () => {
      await csrfToken.set('test-token-123');
      
      expect(redis.set).toHaveBeenCalledWith(
        'csrf_token:test-token-123',
        '1',
        { ex: 3600 }
      );
    });

    it('should store CSRF token with custom TTL', async () => {
      await csrfToken.set('test-token-123', 7200);
      
      expect(redis.set).toHaveBeenCalledWith(
        'csrf_token:test-token-123',
        '1',
        { ex: 7200 }
      );
    });

    it('should handle Redis errors gracefully', async () => {
      (redis.set as jest.Mock).mockRejectedValueOnce(new Error('Redis error'));
      
      await expect(csrfToken.set('test-token-123')).resolves.not.toThrow();
    });
  });

  describe('csrfToken.verify', () => {
    it('should return true for existing token', async () => {
      (redis.exists as jest.Mock).mockResolvedValueOnce(1);
      
      const result = await csrfToken.verify('test-token-123');
      
      expect(result).toBe(true);
      expect(redis.exists).toHaveBeenCalledWith('csrf_token:test-token-123');
    });

    it('should return false for non-existing token', async () => {
      (redis.exists as jest.Mock).mockResolvedValueOnce(0);
      
      const result = await csrfToken.verify('test-token-123');
      
      expect(result).toBe(false);
    });

    it('should return false on Redis error', async () => {
      (redis.exists as jest.Mock).mockRejectedValueOnce(new Error('Redis error'));
      
      const result = await csrfToken.verify('test-token-123');
      
      expect(result).toBe(false);
    });
  });

  describe('csrfToken.delete', () => {
    it('should delete CSRF token', async () => {
      await csrfToken.delete('test-token-123');
      
      expect(redis.del).toHaveBeenCalledWith('csrf_token:test-token-123');
    });

    it('should handle Redis errors gracefully', async () => {
      (redis.del as jest.Mock).mockRejectedValueOnce(new Error('Redis error'));
      
      await expect(csrfToken.delete('test-token-123')).resolves.not.toThrow();
    });
  });
});

describe('Redis - Cache', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('cache.set', () => {
    it('should store data with default TTL', async () => {
      const data = { foo: 'bar', count: 42 };
      
      await cache.set('test-key', data);
      
      expect(redis.set).toHaveBeenCalledWith(
        'cache:test-key',
        JSON.stringify(data),
        { ex: 300 }
      );
    });

    it('should store data with custom TTL', async () => {
      const data = { foo: 'bar' };
      
      await cache.set('test-key', data, 600);
      
      expect(redis.set).toHaveBeenCalledWith(
        'cache:test-key',
        JSON.stringify(data),
        { ex: 600 }
      );
    });

    it('should handle Redis errors gracefully', async () => {
      (redis.set as jest.Mock).mockRejectedValueOnce(new Error('Redis error'));
      
      await expect(cache.set('test-key', { foo: 'bar' })).resolves.not.toThrow();
    });
  });

  describe('cache.get', () => {
    it('should return parsed data for existing key', async () => {
      const data = { foo: 'bar', count: 42 };
      (redis.get as jest.Mock).mockResolvedValueOnce(JSON.stringify(data));
      
      const result = await cache.get('test-key');
      
      expect(result).toEqual(data);
      expect(redis.get).toHaveBeenCalledWith('cache:test-key');
    });

    it('should return null for non-existing key', async () => {
      (redis.get as jest.Mock).mockResolvedValueOnce(null);
      
      const result = await cache.get('test-key');
      
      expect(result).toBeNull();
    });

    it('should return null on Redis error', async () => {
      (redis.get as jest.Mock).mockRejectedValueOnce(new Error('Redis error'));
      
      const result = await cache.get('test-key');
      
      expect(result).toBeNull();
    });

    it('should handle non-string data', async () => {
      const data = { foo: 'bar' };
      (redis.get as jest.Mock).mockResolvedValueOnce(data);
      
      const result = await cache.get('test-key');
      
      expect(result).toEqual(data);
    });
  });

  describe('cache.delete', () => {
    it('should delete cache key', async () => {
      await cache.delete('test-key');
      
      expect(redis.del).toHaveBeenCalledWith('cache:test-key');
    });

    it('should handle Redis errors gracefully', async () => {
      (redis.del as jest.Mock).mockRejectedValueOnce(new Error('Redis error'));
      
      await expect(cache.delete('test-key')).resolves.not.toThrow();
    });
  });

  describe('cache.deletePattern', () => {
    it('should delete keys matching pattern', async () => {
      (redis.keys as jest.Mock).mockResolvedValueOnce([
        'cache:flights:IST',
        'cache:flights:AYT',
        'cache:flights:ADB',
      ]);
      
      await cache.deletePattern('flights:*');
      
      expect(redis.keys).toHaveBeenCalledWith('cache:flights:*');
      expect(redis.del).toHaveBeenCalledWith(
        'cache:flights:IST',
        'cache:flights:AYT',
        'cache:flights:ADB'
      );
    });

    it('should not call del when no keys found', async () => {
      (redis.keys as jest.Mock).mockResolvedValueOnce([]);
      
      await cache.deletePattern('flights:*');
      
      expect(redis.keys).toHaveBeenCalledWith('cache:flights:*');
      expect(redis.del).not.toHaveBeenCalled();
    });

    it('should handle Redis errors gracefully', async () => {
      (redis.keys as jest.Mock).mockRejectedValueOnce(new Error('Redis error'));
      
      await expect(cache.deletePattern('flights:*')).resolves.not.toThrow();
    });
  });
});
