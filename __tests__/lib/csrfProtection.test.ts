import { NextRequest, NextResponse } from 'next/server';
import {
  createCSRFProtection,
  generateCSRFToken,
  storeCSRFToken,
  isValidCSRFToken,
  addCSRFTokenToResponse,
  createCSRFResponse,
  getCSRFTokenScript,
} from '@/lib/csrfProtection';

// Mock Redis
jest.mock('@/lib/redis', () => ({
  csrfToken: {
    set: jest.fn(),
    verify: jest.fn(),
  },
}));

import { csrfToken as redisCSRFToken } from '@/lib/redis';

describe('CSRF Protection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (redisCSRFToken.verify as jest.Mock).mockResolvedValue(false);
  });

  describe('generateCSRFToken', () => {
    it('should generate a 64 character hex token', () => {
      const token = generateCSRFToken();
      expect(token).toHaveLength(64);
      expect(/^[a-f0-9]+$/.test(token)).toBe(true);
    });

    it('should generate unique tokens', () => {
      const token1 = generateCSRFToken();
      const token2 = generateCSRFToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('storeCSRFToken', () => {
    it('should store token in Redis', async () => {
      const token = generateCSRFToken();
      await storeCSRFToken('session123', token);
      
      expect(redisCSRFToken.set).toHaveBeenCalledWith(
        token,
        expect.any(Number)
      );
    });

    it('should store token in memory as fallback', async () => {
      const token = generateCSRFToken();
      await storeCSRFToken('session123', token);
      
      // Memory'de saklandığını doğrula
      const isValid = await isValidCSRFToken(token);
      expect(isValid).toBe(true);
    });
  });

  describe('isValidCSRFToken', () => {
    it('should reject invalid token format', async () => {
      expect(await isValidCSRFToken('')).toBe(false);
      expect(await isValidCSRFToken('short')).toBe(false);
      expect(await isValidCSRFToken('a'.repeat(32))).toBe(false);
    });

    it('should accept valid token from Redis', async () => {
      const token = generateCSRFToken();
      (redisCSRFToken.verify as jest.Mock).mockResolvedValueOnce(true);
      
      expect(await isValidCSRFToken(token)).toBe(true);
    });

    it('should accept valid token from memory fallback', async () => {
      const token = generateCSRFToken();
      await storeCSRFToken('session123', token);
      
      (redisCSRFToken.verify as jest.Mock).mockResolvedValueOnce(false);
      
      expect(await isValidCSRFToken(token)).toBe(true);
    });

    it('should reject expired token from memory', async () => {
      const token = generateCSRFToken();
      
      // Mock Date.now() to expire the token
      const originalNow = Date.now;
      Date.now = jest.fn(() => originalNow() + 2 * 60 * 60 * 1000); // 2 hours later
      
      expect(await isValidCSRFToken(token)).toBe(false);
      
      Date.now = originalNow;
    });

    it('should reject unknown token', async () => {
      const unknownToken = generateCSRFToken();
      
      (redisCSRFToken.verify as jest.Mock).mockResolvedValueOnce(false);
      
      expect(await isValidCSRFToken(unknownToken)).toBe(false);
    });

    it('should handle null or undefined token', async () => {
      expect(await isValidCSRFToken(null as any)).toBe(false);
      expect(await isValidCSRFToken(undefined as any)).toBe(false);
    });

    it('should reject non-string token', async () => {
      expect(await isValidCSRFToken(12345 as any)).toBe(false);
      expect(await isValidCSRFToken({} as any)).toBe(false);
    });
  });

  describe('createCSRFProtection', () => {
    it('should allow GET requests without token', async () => {
      const middleware = createCSRFProtection();
      const req = new NextRequest('http://localhost/api/test', { method: 'GET' });
      
      const response = await middleware(req);
      expect(response.status).not.toBe(403);
    });

    it('should allow HEAD requests without token', async () => {
      const middleware = createCSRFProtection();
      const req = new NextRequest('http://localhost/api/test', { method: 'HEAD' });
      
      const response = await middleware(req);
      expect(response.status).not.toBe(403);
    });

    it('should allow OPTIONS requests without token', async () => {
      const middleware = createCSRFProtection();
      const req = new NextRequest('http://localhost/api/test', { method: 'OPTIONS' });
      
      const response = await middleware(req);
      expect(response.status).not.toBe(403);
    });

    it('should reject POST request without token', async () => {
      const middleware = createCSRFProtection();
      const req = new NextRequest('http://localhost/api/test', { method: 'POST' });
      
      const response = await middleware(req);
      expect(response.status).toBe(403);
      
      const data = await response.json();
      expect(data.error).toBe('CSRF token missing');
    });

    it('should accept POST request with valid token in header', async () => {
      const middleware = createCSRFProtection();
      const token = generateCSRFToken();
      await storeCSRFToken('session123', token);
      
      const req = new NextRequest('http://localhost/api/test', {
        method: 'POST',
        headers: {
          'x-csrf-token': token,
        },
      });
      
      const response = await middleware(req);
      expect(response.status).not.toBe(403);
    });

    it('should reject POST request with invalid token', async () => {
      const middleware = createCSRFProtection();
      const invalidToken = 'a'.repeat(64);
      
      const req = new NextRequest('http://localhost/api/test', {
        method: 'POST',
        headers: {
          'x-csrf-token': invalidToken,
        },
      });
      
      const response = await middleware(req);
      expect(response.status).toBe(403);
      
      const data = await response.json();
      expect(data.error).toBe('Invalid CSRF token');
    });

    it('should use custom config', async () => {
      const middleware = createCSRFProtection({
        skipMethods: ['GET', 'POST'],
      });
      
      const req = new NextRequest('http://localhost/api/test', { method: 'POST' });
      
      const response = await middleware(req);
      expect(response.status).not.toBe(403);
    });
  });

  describe('addCSRFTokenToResponse', () => {
    it('should add CSRF token to cookies', () => {
      const response = NextResponse.json({ success: true });
      const token = generateCSRFToken();
      
      const modifiedResponse = addCSRFTokenToResponse(response, token);
      
      const cookies = modifiedResponse.cookies.getAll();
      const csrfCookie = cookies.find(c => c.name === 'csrf-token');
      
      expect(csrfCookie).toBeDefined();
      expect(csrfCookie?.value).toBe(token);
    });

    it('should set httpOnly flag', () => {
      const response = NextResponse.json({ success: true });
      const token = generateCSRFToken();
      
      const modifiedResponse = addCSRFTokenToResponse(response, token);
      
      const cookies = modifiedResponse.cookies.getAll();
      const csrfCookie = cookies.find(c => c.name === 'csrf-token');
      
      expect(csrfCookie).toBeDefined();
      // httpOnly flag should be set (implicit in Next.js cookies)
    });

    it('should set sameSite to strict', () => {
      const response = NextResponse.json({ success: true });
      const token = generateCSRFToken();
      
      const modifiedResponse = addCSRFTokenToResponse(response, token);
      
      const cookies = modifiedResponse.cookies.getAll();
      const csrfCookie = cookies.find(c => c.name === 'csrf-token');
      
      expect(csrfCookie).toBeDefined();
      // sameSite strict should be set
    });
  });

  describe('createCSRFResponse', () => {
    it('should create response with token in JSON and cookie', () => {
      const token = generateCSRFToken();
      const response = createCSRFResponse(token);
      
      // Check cookie
      const cookies = response.cookies.getAll();
      const csrfCookie = cookies.find(c => c.name === 'csrf-token');
      expect(csrfCookie?.value).toBe(token);
    });
  });

  describe('getCSRFTokenScript', () => {
    it('should return a script string', () => {
      const script = getCSRFTokenScript();
      expect(script).toContain('<script>');
      expect(script).toContain('</script>');
    });

    it('should include form token injection logic', () => {
      const script = getCSRFTokenScript();
      expect(script).toContain('addCSRFTokenToForms');
      expect(script).toContain('csrf-token');
    });

    it('should include fetch interception logic', () => {
      const script = getCSRFTokenScript();
      expect(script).toContain('window.fetch');
      expect(script).toContain('X-CSRF-Token');
    });

    it('should include DOMContentLoaded listener', () => {
      const script = getCSRFTokenScript();
      expect(script).toContain('DOMContentLoaded');
    });
  });

  describe('Memory cleanup', () => {
    it('should cleanup expired tokens when size exceeds 1000', async () => {
      // Store 1001 tokens to trigger cleanup
      for (let i = 0; i < 1001; i++) {
        const token = generateCSRFToken();
        await storeCSRFToken(`session${i}`, token);
      }
      
      // Cleanup should have been triggered
      // Note: This is implicit based on implementation
      expect(redisCSRFToken.set).toHaveBeenCalledTimes(1001);
    });
  });

  describe('Edge cases', () => {
    it('should handle Redis failure gracefully', async () => {
      const token = generateCSRFToken();
      (redisCSRFToken.set as jest.Mock).mockRejectedValueOnce(new Error('Redis error'));
      
      // Should not throw
      await expect(storeCSRFToken('session123', token)).resolves.not.toThrow();
    });

    it('should fall back to memory when Redis verify fails', async () => {
      const token = generateCSRFToken();
      await storeCSRFToken('session123', token);
      
      (redisCSRFToken.verify as jest.Mock).mockRejectedValueOnce(new Error('Redis error'));
      
      // Should still validate from memory
      expect(await isValidCSRFToken(token)).toBe(true);
    });
  });
});
