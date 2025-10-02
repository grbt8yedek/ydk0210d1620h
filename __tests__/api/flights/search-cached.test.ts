/**
 * Flight Search Cached API Tests
 * 
 * Test Coverage Areas:
 * 1. Input validation (from, to, departureDate)
 * 2. Dynamic TTL calculation based on departure date
 * 3. Cache key generation
 * 4. Cache hit/miss logic
 * 5. DELETE endpoint (clear, stats)
 * 6. Error handling and fallback
 * 7. External API integration mock
 */

import { NextRequest } from 'next/server';
import { POST, DELETE } from '@/app/api/flights/search-cached/route';
import { cache, cacheKeys } from '@/lib/cache';

// Mock fetch for external API
global.fetch = jest.fn();

describe('POST /api/flights/search-cached', () => {
  beforeEach(() => {
    cache.clear();
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ flights: [{ id: 1, price: 100 }] })
    });
  });

  describe('Input Validation', () => {
    it('should reject request without "from" parameter', async () => {
      const request = new NextRequest('http://localhost/api/flights/search-cached', {
        method: 'POST',
        body: JSON.stringify({
          to: 'AMS',
          departureDate: '2025-12-01'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required parameters');
    });

    it('should reject request without "to" parameter', async () => {
      const request = new NextRequest('http://localhost/api/flights/search-cached', {
        method: 'POST',
        body: JSON.stringify({
          from: 'IST',
          departureDate: '2025-12-01'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required parameters');
    });

    it('should reject request without "departureDate" parameter', async () => {
      const request = new NextRequest('http://localhost/api/flights/search-cached', {
        method: 'POST',
        body: JSON.stringify({
          from: 'IST',
          to: 'AMS'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required parameters');
    });

    it('should accept valid search parameters', async () => {
      const request = new NextRequest('http://localhost/api/flights/search-cached', {
        method: 'POST',
        body: JSON.stringify({
          from: 'IST',
          to: 'AMS',
          departureDate: '2025-12-01'
        })
      });

      const response = await POST(request);
      
      expect(response.status).toBe(200);
    });

    it('should accept optional passengers parameter', async () => {
      const request = new NextRequest('http://localhost/api/flights/search-cached', {
        method: 'POST',
        body: JSON.stringify({
          from: 'IST',
          to: 'AMS',
          departureDate: '2025-12-01',
          passengers: 2
        })
      });

      const response = await POST(request);
      
      expect(response.status).toBe(200);
    });
  });

  describe('Dynamic TTL Calculation', () => {
    it('should use 1 minute TTL for same day flights', async () => {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      const request = new NextRequest('http://localhost/api/flights/search-cached', {
        method: 'POST',
        body: JSON.stringify({
          from: 'IST',
          to: 'AMS',
          departureDate: todayStr
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.ttl).toBe(60); // 1 minute
    });

    it('should use 15 minutes TTL for flights within 7 days', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 3);
      const dateStr = tomorrow.toISOString().split('T')[0];

      const request = new NextRequest('http://localhost/api/flights/search-cached', {
        method: 'POST',
        body: JSON.stringify({
          from: 'IST',
          to: 'AMS',
          departureDate: dateStr
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.ttl).toBe(900); // 15 minutes
    });

    it('should use 30 minutes TTL for flights after 30 days', async () => {
      const future = new Date();
      future.setDate(future.getDate() + 45);
      const dateStr = future.toISOString().split('T')[0];

      const request = new NextRequest('http://localhost/api/flights/search-cached', {
        method: 'POST',
        body: JSON.stringify({
          from: 'IST',
          to: 'AMS',
          departureDate: dateStr
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.ttl).toBe(1800); // 30 minutes
    });

    it('should use 5 minutes TTL for flights 7-30 days out', async () => {
      const future = new Date();
      future.setDate(future.getDate() + 15);
      const dateStr = future.toISOString().split('T')[0];

      const request = new NextRequest('http://localhost/api/flights/search-cached', {
        method: 'POST',
        body: JSON.stringify({
          from: 'IST',
          to: 'AMS',
          departureDate: dateStr
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.ttl).toBe(300); // 5 minutes
    });
  });

  describe('Cache Key Generation', () => {
    it('should generate consistent cache key for same params', async () => {
      const params = {
        from: 'IST',
        to: 'AMS',
        departureDate: '2025-12-01'
      };

      const request1 = new NextRequest('http://localhost/api/flights/search-cached', {
        method: 'POST',
        body: JSON.stringify(params)
      });

      const request2 = new NextRequest('http://localhost/api/flights/search-cached', {
        method: 'POST',
        body: JSON.stringify(params)
      });

      const response1 = await POST(request1);
      const data1 = await response1.json();

      const response2 = await POST(request2);
      const data2 = await response2.json();

      expect(data1.cacheKey).toBe(data2.cacheKey);
    });

    it('should generate different cache keys for different params', async () => {
      const request1 = new NextRequest('http://localhost/api/flights/search-cached', {
        method: 'POST',
        body: JSON.stringify({
          from: 'IST',
          to: 'AMS',
          departureDate: '2025-12-01'
        })
      });

      const request2 = new NextRequest('http://localhost/api/flights/search-cached', {
        method: 'POST',
        body: JSON.stringify({
          from: 'IST',
          to: 'BER',
          departureDate: '2025-12-01'
        })
      });

      const response1 = await POST(request1);
      const data1 = await response1.json();

      const response2 = await POST(request2);
      const data2 = await response2.json();

      expect(data1.cacheKey).not.toBe(data2.cacheKey);
    });
  });

  describe('Cache Hit/Miss Logic', () => {
    it('should fetch from API on cache miss', async () => {
      const request = new NextRequest('http://localhost/api/flights/search-cached', {
        method: 'POST',
        body: JSON.stringify({
          from: 'IST',
          to: 'AMS',
          departureDate: '2025-12-01'
        })
      });

      await POST(request);

      expect(global.fetch).toHaveBeenCalled();
    });

    it('should return cached data on cache hit', async () => {
      const params = {
        from: 'IST',
        to: 'AMS',
        departureDate: '2025-12-01'
      };

      // First request
      const request1 = new NextRequest('http://localhost/api/flights/search-cached', {
        method: 'POST',
        body: JSON.stringify(params)
      });
      await POST(request1);

      // Clear fetch mock count
      (global.fetch as jest.Mock).mockClear();

      // Second request (should use cache)
      const request2 = new NextRequest('http://localhost/api/flights/search-cached', {
        method: 'POST',
        body: JSON.stringify(params)
      });
      const response2 = await POST(request2);
      const data2 = await response2.json();

      expect(global.fetch).not.toHaveBeenCalled();
      expect(data2.cached).toBe(true);
    });

    it('should indicate cache status in response', async () => {
      const request = new NextRequest('http://localhost/api/flights/search-cached', {
        method: 'POST',
        body: JSON.stringify({
          from: 'IST',
          to: 'AMS',
          departureDate: '2025-12-01'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data).toHaveProperty('cached');
      expect(data).toHaveProperty('cacheKey');
    });
  });

  describe('External API Integration', () => {
    it('should call BiletDukkani API with correct params', async () => {
      const request = new NextRequest('http://localhost/api/flights/search-cached', {
        method: 'POST',
        body: JSON.stringify({
          from: 'IST',
          to: 'AMS',
          departureDate: '2025-12-01'
        })
      });

      await POST(request);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.biletdukkani.com/search',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('should include authorization token in API call', async () => {
      const request = new NextRequest('http://localhost/api/flights/search-cached', {
        method: 'POST',
        body: JSON.stringify({
          from: 'IST',
          to: 'AMS',
          departureDate: '2025-12-01'
        })
      });

      await POST(request);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      expect(fetchCall[1].headers.Authorization).toContain('Bearer');
    });

    it('should handle API error gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error'
      });

      const request = new NextRequest('http://localhost/api/flights/search-cached', {
        method: 'POST',
        body: JSON.stringify({
          from: 'IST',
          to: 'AMS',
          departureDate: '2025-12-01'
        })
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
    });

    it('should return success response with flight data', async () => {
      const mockFlights = [
        { id: 1, airline: 'Turkish Airlines', price: 150 },
        { id: 2, airline: 'Pegasus', price: 120 }
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ flights: mockFlights })
      });

      const request = new NextRequest('http://localhost/api/flights/search-cached', {
        method: 'POST',
        body: JSON.stringify({
          from: 'IST',
          to: 'AMS',
          departureDate: '2025-12-01'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.flights).toEqual(mockFlights);
    });
  });

  describe('Error Handling', () => {
    it('should return 500 on internal error', async () => {
      const request = new NextRequest('http://localhost/api/flights/search-cached', {
        method: 'POST',
        body: 'invalid json'
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
    });

    it('should log error message', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();

      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const request = new NextRequest('http://localhost/api/flights/search-cached', {
        method: 'POST',
        body: JSON.stringify({
          from: 'IST',
          to: 'AMS',
          departureDate: '2025-12-01'
        })
      });

      await POST(request);

      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });

    it('should return error message in response', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Down'));

      const request = new NextRequest('http://localhost/api/flights/search-cached', {
        method: 'POST',
        body: JSON.stringify({
          from: 'IST',
          to: 'AMS',
          departureDate: '2025-12-01'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.error).toBe('Flight search failed');
    });
  });
});

describe('DELETE /api/flights/search-cached', () => {
  beforeEach(() => {
    cache.clear();
    jest.clearAllMocks();
  });

  describe('Clear All Action', () => {
    it('should clear all cache on clear-all action', async () => {
      // Add some cache items first
      cache.set('test-key-1', { data: 'value1' }, 300);
      cache.set('test-key-2', { data: 'value2' }, 300);

      expect(cache.getStats().size).toBe(2);

      const request = new NextRequest('http://localhost/api/flights/search-cached?action=clear-all', {
        method: 'DELETE'
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('All cache cleared');
      expect(cache.getStats().size).toBe(0);
    });
  });

  describe('Stats Action', () => {
    it('should return cache statistics', async () => {
      cache.set('key1', 'value1', 300);
      cache.set('key2', 'value2', 300);

      const request = new NextRequest('http://localhost/api/flights/search-cached?action=stats', {
        method: 'DELETE'
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.size).toBe(2);
      expect(data.maxSize).toBe(1000);
      expect(data.keys).toContain('key1');
      expect(data.keys).toContain('key2');
    });

    it('should show zero stats for empty cache', async () => {
      const request = new NextRequest('http://localhost/api/flights/search-cached?action=stats', {
        method: 'DELETE'
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(data.size).toBe(0);
      expect(data.keys).toHaveLength(0);
    });
  });

  describe('Invalid Actions', () => {
    it('should reject invalid action', async () => {
      const request = new NextRequest('http://localhost/api/flights/search-cached?action=invalid', {
        method: 'DELETE'
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid action');
    });

    it('should reject request without action', async () => {
      const request = new NextRequest('http://localhost/api/flights/search-cached', {
        method: 'DELETE'
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid action');
    });
  });

  describe('Error Handling', () => {
    it('should handle error gracefully', async () => {
      // Mock cache.clear to throw error
      jest.spyOn(cache, 'clear').mockImplementation(() => {
        throw new Error('Cache error');
      });

      const request = new NextRequest('http://localhost/api/flights/search-cached?action=clear-all', {
        method: 'DELETE'
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Cache operation failed');
    });
  });
});

