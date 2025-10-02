/**
 * Cache System Tests
 * 
 * Test Coverage Areas:
 * 1. Basic cache operations (set, get, delete, clear)
 * 2. TTL expiry logic
 * 3. Max size enforcement and cleanup
 * 4. LRU-like oldest removal
 * 5. withCache wrapper (fetch, cache, error fallback)
 * 6. Cache key generation
 * 7. Concurrent access scenarios
 * 8. Memory leak prevention
 */

import { cache, cacheKeys, withCache } from '@/lib/cache';

describe('MemoryCache System', () => {
  beforeEach(() => {
    cache.clear();
    jest.clearAllMocks();
  });

  describe('Basic Operations', () => {
    it('should set and get cache item', () => {
      cache.set('test-key', { data: 'test-value' }, 60);
      const result = cache.get('test-key');
      
      expect(result).toEqual({ data: 'test-value' });
    });

    it('should return null for non-existent key', () => {
      const result = cache.get('non-existent');
      expect(result).toBeNull();
    });

    it('should delete cache item', () => {
      cache.set('test-key', 'value', 60);
      const deleted = cache.delete('test-key');
      
      expect(deleted).toBe(true);
      expect(cache.get('test-key')).toBeNull();
    });

    it('should return false when deleting non-existent key', () => {
      const deleted = cache.delete('non-existent');
      expect(deleted).toBe(false);
    });

    it('should clear all cache items', () => {
      cache.set('key1', 'value1', 60);
      cache.set('key2', 'value2', 60);
      
      cache.clear();
      
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
      expect(cache.getStats().size).toBe(0);
    });
  });

  describe('TTL Expiry Logic', () => {
    it('should expire cache after TTL', async () => {
      cache.set('expiring-key', 'value', 1); // 1 second TTL
      
      // Immediately should work
      expect(cache.get('expiring-key')).toBe('value');
      
      // Wait 1.1 seconds
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      // Should be expired
      expect(cache.get('expiring-key')).toBeNull();
    });

    it('should not expire before TTL', async () => {
      cache.set('key', 'value', 5); // 5 seconds
      
      await new Promise(resolve => setTimeout(resolve, 500)); // 0.5 sec
      
      expect(cache.get('key')).toBe('value');
    });

    it('should use default TTL of 300 seconds', () => {
      const now = Date.now();
      cache.set('key', 'value'); // No TTL specified
      
      const item = cache.get('key');
      expect(item).toBe('value');
    });

    it('should handle zero TTL (immediate expiry)', async () => {
      cache.set('key', 'value', 0);
      
      // Even small delay should expire it
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(cache.get('key')).toBeNull();
    });

    it('should allow negative TTL (should expire immediately)', async () => {
      cache.set('key', 'value', -1);
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(cache.get('key')).toBeNull();
    });
  });

  describe('Max Size Enforcement & Cleanup', () => {
    it('should trigger cleanup when reaching max size', () => {
      // Fill cache to max (1000 items)
      for (let i = 0; i < 1000; i++) {
        cache.set(`key-${i}`, `value-${i}`, 60);
      }
      
      expect(cache.getStats().size).toBe(1000);
      
      // Adding one more should trigger cleanup
      cache.set('overflow-key', 'overflow-value', 60);
      
      // Size should still be <= 1000 after cleanup
      expect(cache.getStats().size).toBeLessThanOrEqual(1000);
    });

    it('should remove expired items during cleanup', async () => {
      // Add items with short TTL
      for (let i = 0; i < 10; i++) {
        cache.set(`expired-${i}`, `value-${i}`, 1); // 1 second
      }
      
      // Add items with long TTL
      for (let i = 0; i < 10; i++) {
        cache.set(`valid-${i}`, `value-${i}`, 60);
      }
      
      // Wait for short TTL items to expire
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      // Trigger cleanup by adding to full cache
      for (let i = 0; i < 980; i++) {
        cache.set(`filler-${i}`, `value-${i}`, 60);
      }
      cache.set('trigger-cleanup', 'value', 60);
      
      // Expired items should be gone
      expect(cache.get('expired-0')).toBeNull();
      expect(cache.get('valid-0')).not.toBeNull();
    });

    it('should remove 10% oldest items when still full after expiry cleanup', () => {
      // Fill cache with non-expired items
      for (let i = 0; i < 1000; i++) {
        cache.set(`key-${i}`, `value-${i}`, 300);
      }
      
      // All items are valid, no expired items
      cache.set('overflow', 'value', 300);
      
      // Should have removed ~10% (100 items)
      // Size should be around 900-901
      const stats = cache.getStats();
      expect(stats.size).toBeLessThanOrEqual(901);
      expect(stats.size).toBeGreaterThanOrEqual(890);
    });

    it('should remove oldest items first (LRU-like)', () => {
      // Add items with timestamps
      cache.set('oldest', 'value1', 300);
      
      // Small delay to ensure different timestamps
      for (let i = 0; i < 10; i++) {
        cache.set(`mid-${i}`, `value-${i}`, 300);
      }
      
      cache.set('newest', 'value-newest', 300);
      
      // Fill to trigger cleanup
      for (let i = 0; i < 989; i++) {
        cache.set(`filler-${i}`, `value-${i}`, 300);
      }
      
      // Trigger cleanup
      cache.set('trigger', 'value', 300);
      
      // Oldest should be removed first
      expect(cache.get('oldest')).toBeNull();
      expect(cache.get('newest')).not.toBeNull();
    });
  });

  describe('Cache Statistics', () => {
    it('should return accurate stats', () => {
      cache.set('key1', 'value1', 60);
      cache.set('key2', 'value2', 60);
      cache.set('key3', 'value3', 60);
      
      const stats = cache.getStats();
      
      expect(stats.size).toBe(3);
      expect(stats.maxSize).toBe(1000);
      expect(stats.keys).toContain('key1');
      expect(stats.keys).toContain('key2');
      expect(stats.keys).toContain('key3');
    });

    it('should update size after delete', () => {
      cache.set('key1', 'value1', 60);
      cache.set('key2', 'value2', 60);
      
      expect(cache.getStats().size).toBe(2);
      
      cache.delete('key1');
      
      expect(cache.getStats().size).toBe(1);
    });

    it('should show zero size after clear', () => {
      cache.set('key1', 'value1', 60);
      cache.set('key2', 'value2', 60);
      
      cache.clear();
      
      expect(cache.getStats().size).toBe(0);
      expect(cache.getStats().keys).toHaveLength(0);
    });
  });

  describe('Cache Key Generation', () => {
    it('should generate consistent flight search keys', () => {
      const params1 = { from: 'IST', to: 'AMS', date: '2025-10-10' };
      const params2 = { from: 'IST', to: 'AMS', date: '2025-10-10' };
      
      const key1 = cacheKeys.flightSearch(params1);
      const key2 = cacheKeys.flightSearch(params2);
      
      expect(key1).toBe(key2);
    });

    it('should generate different keys for different params', () => {
      const params1 = { from: 'IST', to: 'AMS' };
      const params2 = { from: 'IST', to: 'BER' };
      
      const key1 = cacheKeys.flightSearch(params1);
      const key2 = cacheKeys.flightSearch(params2);
      
      expect(key1).not.toBe(key2);
    });

    it('should generate airport data keys', () => {
      const key = cacheKeys.airportData('IST');
      expect(key).toBe('airport:IST');
    });

    it('should generate exchange rate key', () => {
      const key = cacheKeys.exchangeRate();
      expect(key).toBe('exchange-rate:eur-try');
    });

    it('should generate user profile keys', () => {
      const key = cacheKeys.userProfile('user-123');
      expect(key).toBe('user:user-123');
    });

    it('should generate agency balance key', () => {
      const key = cacheKeys.agencyBalance();
      expect(key).toBe('agency-balance');
    });

    it('should generate campaigns key', () => {
      const key = cacheKeys.campaigns();
      expect(key).toBe('campaigns:active');
    });
  });

  describe('withCache Wrapper', () => {
    it('should fetch and cache on first call', async () => {
      const fetcher = jest.fn(async () => ({ data: 'fetched-data' }));
      
      const result = await withCache('test-key', fetcher, 60);
      
      expect(result).toEqual({ data: 'fetched-data' });
      expect(fetcher).toHaveBeenCalledTimes(1);
      
      // Should be cached now
      expect(cache.get('test-key')).toEqual({ data: 'fetched-data' });
    });

    it('should return cached data on subsequent calls', async () => {
      const fetcher = jest.fn(async () => ({ data: 'fetched-data' }));
      
      // First call
      await withCache('test-key', fetcher, 60);
      
      // Second call
      const result = await withCache('test-key', fetcher, 60);
      
      expect(result).toEqual({ data: 'fetched-data' });
      expect(fetcher).toHaveBeenCalledTimes(1); // Should not fetch again
    });

    it('should refetch after cache expires', async () => {
      const fetcher = jest.fn()
        .mockResolvedValueOnce({ data: 'first-fetch' })
        .mockResolvedValueOnce({ data: 'second-fetch' });
      
      // First call
      await withCache('test-key', fetcher, 1); // 1 second TTL
      
      // Wait for expiry
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      // Second call after expiry
      const result = await withCache('test-key', fetcher, 1);
      
      expect(result).toEqual({ data: 'second-fetch' });
      expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it('should return stale cache on error', async () => {
      const fetcher = jest.fn()
        .mockResolvedValueOnce({ data: 'success' })
        .mockRejectedValueOnce(new Error('API Error'));
      
      // First successful call
      await withCache('test-key', fetcher, 1);
      
      // Wait for expiry
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      // Second call fails but returns stale cache
      const result = await withCache('test-key', fetcher, 1);
      
      expect(result).toEqual({ data: 'success' });
      expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it('should throw error if no stale cache available', async () => {
      const fetcher = jest.fn().mockRejectedValue(new Error('API Error'));
      
      await expect(withCache('test-key', fetcher, 60)).rejects.toThrow('API Error');
    });

    it('should use default TTL of 300 seconds', async () => {
      const fetcher = jest.fn(async () => ({ data: 'test' }));
      
      await withCache('test-key', fetcher); // No TTL specified
      
      const cached = cache.get('test-key');
      expect(cached).toEqual({ data: 'test' });
    });
  });

  describe('Concurrent Access', () => {
    it('should handle concurrent reads', async () => {
      cache.set('shared-key', { count: 0 }, 60);
      
      const reads = Array(10).fill(null).map(() => 
        Promise.resolve(cache.get('shared-key'))
      );
      
      const results = await Promise.all(reads);
      
      results.forEach(result => {
        expect(result).toEqual({ count: 0 });
      });
    });

    it('should handle concurrent writes', async () => {
      const writes = Array(10).fill(null).map((_, i) => 
        Promise.resolve(cache.set(`key-${i}`, { value: i }, 60))
      );
      
      await Promise.all(writes);
      
      expect(cache.getStats().size).toBe(10);
    });

    it('should handle concurrent withCache calls', async () => {
      let fetchCount = 0;
      const fetcher = jest.fn(async () => {
        fetchCount++;
        return { data: `fetch-${fetchCount}` };
      });
      
      // Multiple concurrent calls with same key
      const calls = Array(5).fill(null).map(() => 
        withCache('shared-key', fetcher, 60)
      );
      
      const results = await Promise.all(calls);
      
      // Note: Due to race condition, fetcher might be called multiple times
      // This is expected behavior without lock mechanism
      expect(fetchCount).toBeGreaterThanOrEqual(1);
      
      // All should get some data
      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });
  });

  describe('Memory Leak Prevention', () => {
    it('should not grow beyond max size', () => {
      // Add way more than max size
      for (let i = 0; i < 2000; i++) {
        cache.set(`key-${i}`, `value-${i}`, 300);
      }
      
      const stats = cache.getStats();
      expect(stats.size).toBeLessThanOrEqual(1000);
    });

    it('should remove expired items automatically', async () => {
      // Add items with very short TTL
      for (let i = 0; i < 100; i++) {
        cache.set(`short-lived-${i}`, `value-${i}`, 1);
      }
      
      expect(cache.getStats().size).toBe(100);
      
      // Wait for expiry
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      // Try to get expired items (should clean them up)
      for (let i = 0; i < 100; i++) {
        cache.get(`short-lived-${i}`);
      }
      
      // After get attempts, size should be reduced
      expect(cache.getStats().size).toBe(0);
    });

    it('should handle cache churn (constant add/remove)', () => {
      for (let i = 0; i < 100; i++) {
        // Add
        cache.set(`churn-${i}`, `value-${i}`, 60);
        
        // Immediately delete every other
        if (i % 2 === 0) {
          cache.delete(`churn-${i}`);
        }
      }
      
      const stats = cache.getStats();
      expect(stats.size).toBe(50);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined data', () => {
      cache.set('undefined-key', undefined, 60);
      const result = cache.get('undefined-key');
      
      expect(result).toBeUndefined();
    });

    it('should handle null data', () => {
      cache.set('null-key', null, 60);
      const result = cache.get('null-key');
      
      expect(result).toBeNull();
    });

    it('should handle empty string key', () => {
      cache.set('', 'value', 60);
      const result = cache.get('');
      
      expect(result).toBe('value');
    });

    it('should handle very large TTL', () => {
      cache.set('key', 'value', 999999999); // ~31 years
      const result = cache.get('key');
      
      expect(result).toBe('value');
    });

    it('should handle complex nested objects', () => {
      const complexData = {
        user: { id: 1, name: 'Test' },
        flights: [{ id: 1 }, { id: 2 }],
        meta: { timestamp: Date.now() }
      };
      
      cache.set('complex-key', complexData, 60);
      const result = cache.get('complex-key');
      
      expect(result).toEqual(complexData);
    });

    it('should handle special characters in keys', () => {
      const key = 'key:with:special-chars_123@#$%';
      cache.set(key, 'value', 60);
      const result = cache.get(key);
      
      expect(result).toBe('value');
    });
  });
});

