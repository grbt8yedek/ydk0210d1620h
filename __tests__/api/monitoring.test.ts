import { NextRequest } from 'next/server';
import { POST as performancePost, GET as performanceGet } from '../../src/app/api/monitoring/performance/route';
import { POST as securityPost, GET as securityGet } from '../../src/app/api/monitoring/security/route';
import { POST as paymentPost, GET as paymentGet } from '../../src/app/api/monitoring/payments/route';
import { POST as userPost, GET as userGet } from '../../src/app/api/monitoring/users/route';
import { POST as errorPost, GET as errorGet } from '../../src/app/api/monitoring/errors/route';
import { POST as systemPost, GET as systemGet } from '../../src/app/api/monitoring/system/route';

// Mock NextRequest
const createMockRequest = (body: any, searchParams?: Record<string, string>) => {
  const url = new URL('http://localhost:3000/api/test');
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  
  return {
    json: jest.fn().mockResolvedValue(body),
    url: url.toString(),
  } as unknown as NextRequest;
};

describe('Monitoring APIs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Performance Monitoring', () => {
    it('should accept valid performance metrics', async () => {
      const metrics = {
        timestamp: new Date().toISOString(),
        page: '/flights',
        loadTime: 1500,
        firstContentfulPaint: 800,
        largestContentfulPaint: 1200,
        cumulativeLayoutShift: 0.1,
        firstInputDelay: 50,
        timeToInteractive: 2000,
        userAgent: 'Mozilla/5.0',
        connectionType: '4g',
        deviceType: 'mobile'
      };

      const request = createMockRequest(metrics);
      const response = await performancePost(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should reject invalid performance metrics', async () => {
      const invalidMetrics = {
        timestamp: 'invalid-date',
        page: '/flights',
        loadTime: -100 // Invalid negative value
      };

      const request = createMockRequest(invalidMetrics);
      const response = await performancePost(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should return performance statistics', async () => {
      // First, add some test data
      const metrics = {
        timestamp: new Date().toISOString(),
        page: '/flights',
        loadTime: 1500
      };

      await performancePost(createMockRequest(metrics));

      const request = createMockRequest({}, { timeframe: '24h' });
      const response = await performanceGet(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('stats');
      expect(data.data.stats).toHaveProperty('totalRequests');
    });
  });

  describe('Security Monitoring', () => {
    it('should accept valid security events', async () => {
      const event = {
        timestamp: new Date().toISOString(),
        eventType: 'LOGIN_ATTEMPT',
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        userId: 'user123',
        details: 'Login attempt from new device',
        severity: 'MEDIUM',
        page: '/giris'
      };

      const request = createMockRequest(event);
      const response = await securityPost(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should reject invalid security events', async () => {
      const invalidEvent = {
        timestamp: new Date().toISOString(),
        eventType: 'INVALID_TYPE',
        ip: '192.168.1.1'
      };

      const request = createMockRequest(invalidEvent);
      const response = await securityPost(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should return security statistics', async () => {
      const request = createMockRequest({}, { timeframe: '24h' });
      const response = await securityGet(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('stats');
      expect(data.data.stats).toHaveProperty('totalEvents');
    });
  });

  describe('Payment Monitoring', () => {
    it('should accept valid payment events', async () => {
      const event = {
        timestamp: new Date().toISOString(),
        eventType: 'PAYMENT_SUCCESS',
        amount: 150.00,
        currency: 'EUR',
        paymentMethod: 'credit_card',
        userId: 'user123',
        orderId: 'order456',
        transactionId: 'txn789',
        cardMasked: '****1234',
        processingTime: 2500,
        ip: '192.168.1.1'
      };

      const request = createMockRequest(event);
      const response = await paymentPost(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should reject invalid payment events', async () => {
      const invalidEvent = {
        timestamp: new Date().toISOString(),
        eventType: 'PAYMENT_SUCCESS',
        amount: -50.00, // Invalid negative amount
        currency: 'EUR'
      };

      const request = createMockRequest(invalidEvent);
      const response = await paymentPost(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should return payment statistics', async () => {
      const request = createMockRequest({}, { timeframe: '24h' });
      const response = await paymentGet(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('stats');
      expect(data.data.stats).toHaveProperty('successRate');
    });
  });

  describe('User Activity Monitoring', () => {
    it('should accept valid user activities', async () => {
      const activity = {
        timestamp: new Date().toISOString(),
        eventType: 'USER_LOGIN',
        userId: 'user123',
        email: 'test@example.com',
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        details: 'Successful login',
        metadata: { device: 'mobile' }
      };

      const request = createMockRequest(activity);
      const response = await userPost(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should reject invalid user activities', async () => {
      const invalidActivity = {
        timestamp: new Date().toISOString(),
        eventType: 'USER_LOGIN',
        userId: 'user123',
        email: 'invalid-email' // Invalid email format
      };

      const request = createMockRequest(invalidActivity);
      const response = await userPost(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should return user activity statistics', async () => {
      const request = createMockRequest({}, { timeframe: '24h' });
      const response = await userGet(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('stats');
      expect(data.data.stats).toHaveProperty('uniqueUsers');
    });
  });

  describe('Error Monitoring', () => {
    it('should accept valid error events', async () => {
      const errorEvent = {
        timestamp: new Date().toISOString(),
        errorType: 'ValidationError',
        errorMessage: 'Invalid input data',
        stackTrace: 'Error: Invalid input\n    at validate()...',
        severity: 'MEDIUM',
        page: '/flights',
        userId: 'user123',
        sessionId: 'session456',
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        requestId: 'req789',
        metadata: { field: 'email' }
      };

      const request = createMockRequest(errorEvent);
      const response = await errorPost(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should reject invalid error events', async () => {
      const invalidErrorEvent = {
        timestamp: new Date().toISOString(),
        errorType: 'ValidationError',
        errorMessage: '', // Empty message
        severity: 'INVALID_SEVERITY' // Invalid severity
      };

      const request = createMockRequest(invalidErrorEvent);
      const response = await errorPost(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should return error statistics', async () => {
      const request = createMockRequest({}, { timeframe: '24h' });
      const response = await errorGet(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('stats');
      expect(data.data.stats).toHaveProperty('totalErrors');
    });
  });

  describe('System Monitoring', () => {
    it('should accept valid system metrics', async () => {
      const metrics = {
        timestamp: new Date().toISOString(),
        cpuUsage: 45.5,
        memoryUsage: 62.3,
        diskUsage: 78.1,
        responseTime: 1200,
        activeConnections: 150,
        requestsPerMinute: 45,
        uptime: 86400,
        version: '1.0.0',
        region: 'eu-west-1'
      };

      const request = createMockRequest(metrics);
      const response = await systemPost(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should reject invalid system metrics', async () => {
      const invalidMetrics = {
        timestamp: new Date().toISOString(),
        cpuUsage: 150.0, // Invalid: over 100%
        memoryUsage: -10.0 // Invalid: negative value
      };

      const request = createMockRequest(invalidMetrics);
      const response = await systemPost(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should return system statistics', async () => {
      const request = createMockRequest({}, { timeframe: '24h' });
      const response = await systemGet(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('stats');
      expect(data.data.stats).toHaveProperty('healthStatus');
    });
  });

  describe('Timeframe Filtering', () => {
    it('should handle different timeframe parameters', async () => {
      const timeframes = ['1h', '24h', '7d'];
      
      for (const timeframe of timeframes) {
        const request = createMockRequest({}, { timeframe });
        const response = await performanceGet(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.timeframe).toBe(timeframe);
      }
    });

    it('should default to 24h when no timeframe specified', async () => {
      const request = createMockRequest({});
      const response = await performanceGet(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.timeframe).toBe('24h');
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON', async () => {
      const request = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
        url: 'http://localhost:3000/api/test'
      } as unknown as NextRequest;

      const response = await performancePost(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });

    it('should handle server errors gracefully', async () => {
      // Mock a server error by making json() throw
      const request = {
        json: jest.fn().mockImplementation(() => {
          throw new Error('Database connection failed');
        }),
        url: 'http://localhost:3000/api/test'
      } as unknown as NextRequest;

      const response = await performancePost(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Sunucu hatası');
    });
  });
});
