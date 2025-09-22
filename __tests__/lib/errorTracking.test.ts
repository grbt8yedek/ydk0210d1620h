import { errorTracker, setupErrorTracking } from '../../src/lib/errorTracking';

// Mock fetch
global.fetch = jest.fn();

describe('ErrorTracking', () => {
  beforeEach(() => {
    errorTracker.clear();
    jest.clearAllMocks();
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });
  });

  describe('Error Tracking', () => {
    it('should track errors correctly', () => {
      const error = new Error('Test error');
      const context = {
        userId: 'user123',
        severity: 'medium' as const,
        metadata: { page: '/test' }
      };

      errorTracker.track(error, context);

      const errors = errorTracker.getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('Test error');
      expect(errors[0].userId).toBe('user123');
      expect(errors[0].severity).toBe('medium');
      expect(errors[0].metadata).toEqual({ page: '/test' });
    });

    it('should generate unique IDs for errors', () => {
      const error1 = new Error('Error 1');
      const error2 = new Error('Error 2');

      errorTracker.track(error1);
      errorTracker.track(error2);

      const errors = errorTracker.getErrors();
      expect(errors[0].id).not.toBe(errors[1].id);
    });

    it('should include timestamp in errors', () => {
      const error = new Error('Test error');
      errorTracker.track(error);

      const errors = errorTracker.getErrors();
      expect(errors[0].timestamp).toBeDefined();
      expect(new Date(errors[0].timestamp)).toBeInstanceOf(Date);
    });

    it('should limit stored errors to maxErrors', () => {
      // Override maxErrors for testing
      const originalMaxErrors = 1000;
      
      for (let i = 0; i < originalMaxErrors + 10; i++) {
        errorTracker.track(new Error(`Error ${i}`));
      }

      const errors = errorTracker.getErrors();
      expect(errors.length).toBeLessThanOrEqual(originalMaxErrors);
    });
  });

  describe('Error Statistics', () => {
    it('should provide correct statistics', () => {
      const errors = [
        { severity: 'low', userId: 'user1' },
        { severity: 'medium', userId: 'user2' },
        { severity: 'high', userId: 'user1' },
        { severity: 'critical', userId: 'user3' }
      ];

      errors.forEach(({ severity, userId }) => {
        const error = new Error(`${severity} error`);
        errorTracker.track(error, { severity, userId });
      });

      const stats = errorTracker.getStats();
      expect(stats.total).toBe(4);
      expect(stats.bySeverity.low).toBe(1);
      expect(stats.bySeverity.medium).toBe(1);
      expect(stats.bySeverity.high).toBe(1);
      expect(stats.bySeverity.critical).toBe(1);
      expect(stats.uniqueUsers).toBe(3);
    });

    it('should filter statistics by timeframe', () => {
      // Add an old error (simulate by manipulating timestamp)
      const oldError = new Error('Old error');
      errorTracker.track(oldError);
      
      // Get the error and modify its timestamp to be old
      const errors = errorTracker.getErrors();
      errors[0].timestamp = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(); // 25 hours ago

      // Add a recent error
      const recentError = new Error('Recent error');
      errorTracker.track(recentError);

      const stats = errorTracker.getStats();
      expect(stats.last24h).toBe(1); // Only the recent error
    });

    it('should identify top errors', () => {
      const errorMessages = ['Error A', 'Error B', 'Error A', 'Error A', 'Error C'];
      
      errorMessages.forEach(message => {
        errorTracker.track(new Error(message));
      });

      const stats = errorTracker.getStats();
      expect(stats.topErrors).toHaveLength(3);
      expect(stats.topErrors[0].message).toBe('Error A');
      expect(stats.topErrors[0].count).toBe(3);
    });
  });

  describe('Critical Errors', () => {
    it('should filter critical errors correctly', () => {
      const errors = [
        { severity: 'low' },
        { severity: 'critical' },
        { severity: 'high' },
        { severity: 'critical' }
      ];

      errors.forEach(({ severity }) => {
        const error = new Error(`${severity} error`);
        errorTracker.track(error, { severity });
      });

      const criticalErrors = errorTracker.getCriticalErrors();
      expect(criticalErrors).toHaveLength(2);
      criticalErrors.forEach(error => {
        expect(error.severity).toBe('critical');
      });
    });
  });

  describe('Error Limits', () => {
    it('should limit errors to specified number', () => {
      const limit = 5;
      
      for (let i = 0; i < 10; i++) {
        errorTracker.track(new Error(`Error ${i}`));
      }

      const limitedErrors = errorTracker.getErrors(limit);
      expect(limitedErrors).toHaveLength(limit);
    });

    it('should return all errors when no limit specified', () => {
      const errorCount = 10;
      
      for (let i = 0; i < errorCount; i++) {
        errorTracker.track(new Error(`Error ${i}`));
      }

      const allErrors = errorTracker.getErrors();
      expect(allErrors).toHaveLength(errorCount);
    });
  });

  describe('Monitoring API Integration', () => {
    it('should send errors to monitoring API', async () => {
      const error = new Error('Test error');
      const context = {
        userId: 'user123',
        severity: 'high' as const
      };

      errorTracker.track(error, context);

      // Wait for async API call
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(fetch).toHaveBeenCalledWith('/api/monitoring/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('Test error')
      });
    });

    it('should handle API failures gracefully', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const error = new Error('Test error');
      errorTracker.track(error);

      // Wait for async API call
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to send error to monitoring API:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Browser Environment', () => {
    beforeEach(() => {
      // Mock browser environment
      Object.defineProperty(window, 'location', {
        value: { href: 'https://example.com/test' },
        writable: true
      });
      Object.defineProperty(window, 'navigator', {
        value: { userAgent: 'Mozilla/5.0 Test Browser' },
        writable: true
      });
    });

    it('should include browser information in errors', () => {
      const error = new Error('Browser error');
      errorTracker.track(error);

      const errors = errorTracker.getErrors();
      expect(errors[0].url).toBe('https://example.com/test');
      expect(errors[0].userAgent).toBe('Mozilla/5.0 Test Browser');
    });

    it('should handle server-side errors', () => {
      // Mock server environment
      delete (global as any).window;

      const error = new Error('Server error');
      errorTracker.track(error);

      const errors = errorTracker.getErrors();
      expect(errors[0].url).toBe('server');
      expect(errors[0].userAgent).toBe('server');
    });
  });

  describe('Error Clearing', () => {
    it('should clear all errors', () => {
      errorTracker.track(new Error('Error 1'));
      errorTracker.track(new Error('Error 2'));

      expect(errorTracker.getErrors()).toHaveLength(2);

      errorTracker.clear();

      expect(errorTracker.getErrors()).toHaveLength(0);
    });
  });

  describe('Setup Error Tracking', () => {
    it('should setup error tracking without errors', () => {
      expect(() => setupErrorTracking()).not.toThrow();
    });

    it('should setup event listeners in browser environment', () => {
      const mockAddEventListener = jest.fn();
      Object.defineProperty(window, 'addEventListener', {
        value: mockAddEventListener,
        writable: true
      });

      setupErrorTracking();

      expect(mockAddEventListener).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
      expect(mockAddEventListener).toHaveBeenCalledWith('error', expect.any(Function));
    });
  });

  describe('Edge Cases', () => {
    it('should handle errors without context', () => {
      const error = new Error('No context error');
      
      expect(() => errorTracker.track(error)).not.toThrow();
      
      const errors = errorTracker.getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('No context error');
    });

    it('should handle errors with partial context', () => {
      const error = new Error('Partial context error');
      const context = { userId: 'user123' }; // Missing severity and metadata
      
      expect(() => errorTracker.track(error, context)).not.toThrow();
      
      const errors = errorTracker.getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].userId).toBe('user123');
      expect(errors[0].severity).toBe('medium'); // Default severity
    });

    it('should handle null and undefined errors', () => {
      expect(() => errorTracker.track(null as any)).not.toThrow();
      expect(() => errorTracker.track(undefined as any)).not.toThrow();
    });
  });
});
